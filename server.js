require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'phoenix_fallback_secret';
const JWT_EXPIRY = '7d';

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React build if it exists (production), otherwise serve legacy HTML
const reactBuildPath = path.join(__dirname, 'client', 'dist');
const hasReactBuild = fs.existsSync(reactBuildPath);

if (hasReactBuild) {
    app.use(express.static(reactBuildPath));
} else {
    app.use(express.static(path.join(__dirname), {
        index: 'index.html',
        extensions: ['html']
    }));
}

// ─── Avatar Upload Config ───
const avatarDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `${req.userId}${ext}`);
    }
});

const upload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        cb(null, ext && mime);
    }
});

// Serve uploaded avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── MySQL Connection Pool ───
let pool;

async function initDB() {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'phoenix_web',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Verify connection
    try {
        const conn = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        conn.release();
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
        console.error('   Make sure your .env credentials are correct and MySQL is running.');
        process.exit(1);
    }

    // Auto-create tables if they don't exist
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) DEFAULT NULL,
            display_name VARCHAR(100) DEFAULT NULL,
            photo_url TEXT DEFAULT NULL,
            google_id VARCHAR(255) DEFAULT NULL,
            riot_id VARCHAR(100) DEFAULT NULL,
            tracker_history JSON DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email)
        )
    `);
    console.log('✅ Database tables ready');
}

// ─── Auth Middleware ───
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Generate JWT for a user row
function generateToken(user) {
    return jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

// Format user row for client response (strip sensitive fields)
function formatUser(user) {
    return {
        uid: user.id,
        email: user.email,
        displayName: user.display_name || null,
        photoURL: user.photo_url || null,
        riotId: user.riot_id || null
    };
}

// ─── AUTH ROUTES ───

// Register with email/password
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if email exists
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        const hash = await bcrypt.hash(password, 12);
        const displayName = email.split('@')[0];
        const [result] = await pool.execute(
            'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
            [email.toLowerCase(), hash, displayName]
        );

        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        const user = rows[0];
        const token = generateToken(user);

        res.json({ token, user: formatUser(user) });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed. Try again.' });
    }
});

// Login with email/password
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];
        if (!user.password_hash) {
            return res.status(401).json({ error: 'This account uses Google login. Please sign in with Google.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user);
        res.json({ token, user: formatUser(user) });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Try again.' });
    }
});

// Google OAuth — accept user info from OAuth2 access token flow
app.post('/api/auth/google', async (req, res) => {
    try {
        const { googleUser } = req.body;
        if (!googleUser || !googleUser.email || !googleUser.sub) {
            return res.status(400).json({ error: 'Google user data is required' });
        }

        const googleId = googleUser.sub;
        const email = googleUser.email;
        const name = googleUser.name || email.split('@')[0];
        const picture = googleUser.picture || null;

        // Check if user exists by google_id
        let [rows] = await pool.execute('SELECT * FROM users WHERE google_id = ?', [googleId]);

        if (rows.length === 0) {
            // Check if email already exists (link accounts)
            [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
            if (rows.length > 0) {
                // Link Google to existing account
                await pool.execute('UPDATE users SET google_id = ?, photo_url = COALESCE(photo_url, ?) WHERE id = ?', [googleId, picture, rows[0].id]);
                [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [rows[0].id]);
            } else {
                // Create new user
                const [result] = await pool.execute(
                    'INSERT INTO users (email, display_name, photo_url, google_id) VALUES (?, ?, ?, ?)',
                    [email.toLowerCase(), name, picture, googleId]
                );
                [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
            }
        }

        const user = rows[0];
        const token = generateToken(user);
        res.json({ token, user: formatUser(user) });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(401).json({ error: 'Google authentication failed.' });
    }
});

// Get current user (verify token)
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: formatUser(rows[0]) });
    } catch (err) {
        console.error('Auth me error:', err);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// ─── USER PROFILE ROUTES ───

// Update profile (display name, riot id)
app.put('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const { displayName, riotId } = req.body;
        const updates = [];
        const values = [];

        if (displayName !== undefined) {
            updates.push('display_name = ?');
            values.push(displayName);
        }
        if (riotId !== undefined) {
            updates.push('riot_id = ?');
            values.push(riotId);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        values.push(req.userId);
        await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
        res.json({ user: formatUser(rows[0]) });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Upload avatar
app.post('/api/user/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const photoUrl = `/uploads/avatars/${req.file.filename}`;
        await pool.execute('UPDATE users SET photo_url = ? WHERE id = ?', [photoUrl, req.userId]);

        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
        res.json({ user: formatUser(rows[0]) });
    } catch (err) {
        console.error('Avatar upload error:', err);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// ─── TRACKER HISTORY ROUTES ───

// Save tracker history
app.put('/api/user/tracker-history', authMiddleware, async (req, res) => {
    try {
        const { trackerHistory } = req.body;
        await pool.execute('UPDATE users SET tracker_history = ? WHERE id = ?', [JSON.stringify(trackerHistory), req.userId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Tracker history save error:', err);
        res.status(500).json({ error: 'Failed to save tracker history' });
    }
});

// Get tracker history
app.get('/api/user/tracker-history', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT tracker_history FROM users WHERE id = ?', [req.userId]);
        if (rows.length === 0) {
            return res.json({ trackerHistory: [] });
        }
        let history = rows[0].tracker_history;
        if (typeof history === 'string') {
            try { history = JSON.parse(history); } catch (e) { history = []; }
        }
        res.json({ trackerHistory: history || [] });
    } catch (err) {
        console.error('Tracker history fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch tracker history' });
    }
});

// ─── Catch-all: serve SPA or 404 for unknown routes ───
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    // Serve React SPA for hash-based routes
    if (hasReactBuild) {
        const indexPath = path.join(reactBuildPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    }
    // Fallback: serve legacy HTML or 404
    const knownPaths = ['/', '/index.html', '/401.shtml', '/403.shtml', '/404.shtml', '/500.shtml'];
    if (knownPaths.includes(req.path) || req.path.startsWith('/assets/') || req.path.startsWith('/uploads/')) {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    res.status(404).sendFile(path.join(__dirname, '404.shtml'));
});

// ─── Global Error Handler (500) ───
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (req.path.startsWith('/api/')) {
        return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(500).sendFile(path.join(__dirname, '500.shtml'));
});

// ─── Start Server ───
async function start() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`\n🔥 Phoenix Web server running at http://localhost:${PORT}\n`);
    });
}

start();
