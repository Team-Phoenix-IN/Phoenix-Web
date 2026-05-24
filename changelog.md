# Phoenix Web - Full Development & Session Changelog

This document logs the evolution of the Phoenix Web project in chronological order, starting from the oldest foundational branches up to the latest deployment steps and configuration updates.

---

## 1. Foundational Architecture

### `origin/main`
The original, most basic version of the website. This branch served as the earliest foundation before the introduction of complex styling and backend integrations.

---

## 2. Early Iterations (Legacy Branches)

### `origin/v2` (PR #2: V2 update)
An early iteration building heavily on `main`. Based on the pull request log, this version introduced:
- 🔐 **Firebase Auth** (email + Google sign-in)
- 👤 Profile sidebar with push-scale effect
- ⚙️ Account Settings page (profile picture, display name, linked Riot ID)
- ☁️ Cloud-synced tracker history
- 🏠 Home page (wings, embers, intro animation)
- 🎨 Color scheme (red→orange→yellow gradients)
- New Navigation Bar and YT API supported Creator Menu.

### `origin/v3-pro` (PR #4: V3)
An intermediate staging branch transitioning away from Firebase. According to the pull request, this update:
- Added a custom DB backend to the login system.
- Added native Google OAuth login.
- Added support for Riot account connection (pending Riot API approval).

*(Note: There was also an abandoned PR #3 containing initial attempts at the DB login and Google Auth which was closed).*

---

## 3. The Architectural Overhaul

### `origin/v4` (PR #5: V4)
The pivotal branch where the massive architectural overhaul occurred. The pull request describes this simply as: **"Upgraded to React.js. Added Backend and frontend. New animations. Revamped pages."**

Under the hood, this branch completely deleted the legacy `index.html`, `app.js`, and `styles.css` from the root directory, wiping out hundreds of thousands of lines of old dependencies (`node_modules`), paving the way for the streamlined `server.js` + `client/` React folder structure used today.

During this migration:
- **Stack Migration:** Transitioned from a pure Vanilla HTML/CSS/JS frontend to a modern **Node.js + Express** backend serving a compiled **React** SPA (Single Page Application).
- **Backend & Auth:** Implemented a robust Express backend connected to a MySQL database (`mysql2`), featuring JWT-based authentication, Google OAuth integration, and avatar uploads (`multer`).
- **Discord Integration Phase 1 & 2:**
  - Designed and implemented a **Live Discord Server Widget** for the Home Page using the public Discord Widget API.
  - Developed a **Custom Discord Bot** directly inside `server.js` to fetch live Rich Presence (online/idle/dnd statuses) for roster members and display them natively on the Rosters page.

---

## 4. Today's Session: Code & Configuration Updates

- **Discord Integration Configuration:** Checked the newly added Discord IDs in `app.js` (`DISCORD_CONFIG.playerDiscordIds`). Verified that they are syntactically correct (formatted as strings) and are valid Discord Snowflakes.
- **Discord Integration Comments:** Updated the explanatory comments in `app.js` to reflect that presence tracking no longer relies on Lanyard, but is instead handled by the custom Discord bot integrated directly into `server.js`.
- **JWT Authentication:** Clarified that the `TOKEN_KEY` (`'phoenix_auth_token'`) in `app.js` is merely a local storage identifier and does not need to be changed for security or functionality.
- **Footer Link Removal:** Edited `client/src/components/Footer.jsx` to remove the hardcoded `riot.txt` link from the site's footer.
- **Frontend Build:** The React client was successfully rebuilt (`npm run build`) via Vite to compile the latest `Footer.jsx` changes into the `dist` folder.

---

## 5. Today's Session: Deployment & Troubleshooting

### Deployment Guide (DirectAdmin)
- Outlined the correct procedure for deploying a Node.js + React app on DirectAdmin using the **Setup Node.js App** (CloudLinux) module.
- Confirmed that the entire project folder (including `client` source code and `server.js`) should be placed **outside** of the `public_html` folder for security.
- Explained that DirectAdmin acts as a reverse proxy, routing traffic directly to the Node.js application, which in turn serves the compiled React static files.

### Troubleshooting (503 Error)
- Investigated a **503 Service Unavailable** error on the DirectAdmin host. 
- Identified the most likely cause as a MySQL connection failure causing `server.js` to intentionally crash (`process.exit(1)`). Emphasized the importance of setting up correct `.env` variables via the DirectAdmin interface.
- Pointed out other potential causes, such as incorrectly setting `app.js` instead of `server.js` as the Application Startup File, or forgetting to run `npm install` on the host.

---

## 6. Discord Presence & UI Refinements

### Live Roster Status (Custom Discord Bot)
- **Backend Bot Integration**: Implemented a native Discord bot directly within `server.js` using `discord.js`. The bot connects to the server and tracks the presence (online, idle, dnd) of roster members without relying on third-party services like Lanyard.
- **Presence API**: Added a new `/api/discord/presence` endpoint to expose these live statuses to the frontend.
- **Roster Cards**: Updated `RostersPage` to poll the presence endpoint and pass real-time status data to `RosterCard`, dynamically rendering presence indicators.

### Discord Server Widget
- Designed and built a new `DiscordWidget` component to display the Phoenix server's live member count and status directly on the website, utilizing the public Discord Widget API.

### UI & Styling Enhancements
- Expanded styling rules in both the legacy `style.css` and the React `client/src/style.css`.
- Polished components including `ProfileCard`, `Navbar`, and `BorderGlow` with advanced CSS effects and layout refinements.
