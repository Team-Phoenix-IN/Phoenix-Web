# Team Phoenix Web

![Team Phoenix Banner](./client/public/vite.svg) <!-- Replace with actual banner image path if available -->

Welcome to the **Team Phoenix Web** repository! This is a modern, full-stack esports and gaming team website featuring live integrations, robust user profiles, and premium visual aesthetics.

## 🚀 Key Features

### Authentication & Accounts
* **Registration & Login**: Secure email/password authentication using `bcryptjs`.
* **Google OAuth**: One-click sign-in via Google integration.
* **JWT Security**: Token-based secure access for all user endpoints.
* **Profile Management**: Update display names, link Riot IDs, and track game history.
* **Avatars**: Custom avatar upload system with `multer`.

### Live Discord Integration
* **Custom Bot Backend**: Built-in `discord.js` client fetching live presence for team members.
* **Real-time Widget**: Displays members' current statuses (Online, Idle, DND) and gaming activities directly on the frontend.

### Dynamic UI/UX
* **Premium Aesthetics**: High-quality visual components including Aurora backgrounds, EmberParticles, and ChromaGrid grid systems.
* **Interactive Elements**: Custom hover states with `ReflectiveCard`, `PixelCard`, `ProfileCard`, and `RosterCard`.
* **Immersive Navigation**: Custom gaming cursor (`TargetCursor`), seamless Light/Dark mode toggling, and responsive sidebars/navbars.

### Core Pages
* **Home**: An engaging landing page showcasing the team.
* **Rosters**: Displays active team members and their roles.
* **Creators**: Dedicated showcase for Team Phoenix content creators.
* **Tracker**: Integrated player game stat tracking (Valorant/Riot Games) with detailed match history modals.
* **Shop**: Team merchandise storefront.

## 🛠️ Technology Stack

**Frontend:**
* [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
* Custom CSS & Animations (GSAP, OGL)
* React Router DOM for routing

**Backend:**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* [MySQL2](https://www.npmjs.com/package/mysql2) with Connection Pooling
* Custom Discord Bot integration via [Discord.js](https://discord.js.org/)

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* MySQL Server (running locally or remotely)
* A Discord Bot Token (optional, for live presence features)

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Variables

Create a `.env` file in the root directory. Use the following template:

```env
# Server
PORT=3000

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=phoenix_web

# Discord Integration (Optional but recommended)
DISCORD_BOT_TOKEN=your_discord_bot_token
```

### 3. Running the App

#### Development Mode
You can run the frontend and backend separately for easier development.

**Terminal 1 (Frontend):**
```bash
cd client
npm run dev
```

**Terminal 2 (Backend):**
```bash
npm run dev
```

#### Production Mode
To run the fully built project on the server:

```bash
# Build the frontend
cd client
npm run build
cd ..

# Start the server (will serve the built React app from client/dist)
npm start
```

## 🗄️ Database Initialization
The backend is configured to automatically create the necessary `users` table upon its first successful connection to the database. Ensure your database `phoenix_web` (or whatever you named it in the `.env`) exists before starting the server.

---

*Made for Team Phoenix* 🎮🔥
