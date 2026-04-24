require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'phoenix_super_secret_key_change_this_in_production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// Setup static folder for profile pictures
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Multer setup for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        // Check if user exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already in use' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await db.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        // Generate token
        const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, user: { id: result.insertId, email, displayName: null, avatarUrl: null, riotId: null } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                displayName: user.display_name, 
                avatarUrl: user.avatar_url,
                riotId: user.riot_id
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Google Login
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ error: 'No credential provided' });

        // Verify the ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        const email = payload.email;
        const name = payload.name || '';
        const picture = payload.picture || '';

        // Check if user exists
        let [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            // Create new user for Google login (random password since they login via Google)
            const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
            const [result] = await db.execute(
                'INSERT INTO users (email, password, display_name, avatar_url) VALUES (?, ?, ?, ?)',
                [email, randomPassword, name, picture]
            );
            user = { id: result.insertId, email, display_name: name, avatar_url: picture, riot_id: null };
        } else {
            user = users[0];
            // Optional: update their avatar/name if you want Google to overwrite
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                displayName: user.display_name, 
                avatarUrl: user.avatar_url,
                riotId: user.riot_id
            } 
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ error: 'Server error validating Google login' });
    }
});

// Get Current User (used on page load)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, email, display_name, riot_id, avatar_url FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.sendStatus(404);
        
        const user = users[0];
        res.json({ 
            user: { 
                id: user.id, 
                email: user.email, 
                displayName: user.display_name, 
                avatarUrl: user.avatar_url,
                riotId: user.riot_id
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- USER SETTINGS ---

// Update Profile
app.put('/api/user/settings', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        const { displayName, riotId } = req.body;
        let query = 'UPDATE users SET display_name = ?, riot_id = ?';
        let params = [displayName || null, riotId || null];

        let avatarUrl = null;
        if (req.file) {
            // Include server host when deployed, or just relative path for now
            avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            query += ', avatar_url = ?';
            params.push(avatarUrl);
        }

        query += ' WHERE id = ?';
        params.push(req.user.id);

        await db.execute(query, params);

        res.json({ 
            success: true, 
            avatarUrl 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- TRACKER HISTORY ---

// Get History
app.get('/api/tracker/history', authenticateToken, async (req, res) => {
    try {
        const [history] = await db.execute(
            'SELECT name, tag, region, avatar, timestamp FROM tracker_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 5',
            [req.user.id]
        );
        res.json({ history });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add to History
app.post('/api/tracker/history', authenticateToken, async (req, res) => {
    try {
        const { name, tag, region, avatar, timestamp } = req.body;
        
        // Use REPLACE INTO or INSERT ... ON DUPLICATE KEY UPDATE to handle existing searches
        await db.execute(
            `INSERT INTO tracker_history (user_id, name, tag, region, avatar, timestamp) 
             VALUES (?, ?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE timestamp = ?, region = ?, avatar = ?`,
            [req.user.id, name, tag, region || 'AP', avatar || null, timestamp, timestamp, region || 'AP', avatar || null]
        );
        
        // Keep only top 5, delete older ones
        await db.execute(
            `DELETE FROM tracker_history 
             WHERE user_id = ? AND id NOT IN (
                 SELECT id FROM (
                     SELECT id FROM tracker_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 5
                 ) foo
             )`,
            [req.user.id, req.user.id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove from History
app.delete('/api/tracker/history', authenticateToken, async (req, res) => {
    try {
        const { name, tag } = req.body;
        await db.execute(
            'DELETE FROM tracker_history WHERE user_id = ? AND name = ? AND tag = ?',
            [req.user.id, name, tag]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Clear History
app.delete('/api/tracker/history/all', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM tracker_history WHERE user_id = ?', [req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
