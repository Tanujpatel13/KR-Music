<<<<<<< HEAD
# KR Music — Spotify-Inspired Music Streaming Platform

KR Music is a premium, high-fidelity music streaming application redesigned with a dark-first Spotify visual language, persistent queue playback, synchronized lyrics overlays, custom libraries, and dynamic music sourcing.

---

## 🎵 Features
- **Sleek UI/UX:** Responsive cards, horizontal carousels, verified artist pages, customizable user profiles, and skeleton loading screens.
- **Dynamic Catalog:** Streams thousands of open-source tracks dynamically using the **Jamendo API** (with failover fallback to the decentralized **Audius API**).
- **Relational Cache:** Fetched external songs are cached directly inside the local SQLite database to prevent duplicates and enable native playlist management/likes.
- **Tabs Filter (Local & International):** Categorized feeds for *Local Music* (Indian/Regional), *International Music*, and *Movie Soundtracks*.
- **Debounced Search & Pagination:** Real-time search with input debouncing and offset-based pagination ("Load More") for smooth browsing.

---

## 🔑 Obtaining API Credentials

To get the most out of KR Music's dynamic library, configure these credentials:

### 1. YouTube Data API v3 Key (Primary)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for **YouTube Data API v3** in the API Library and click **Enable**.
4. Navigate to the **Credentials** tab, click **+ Create Credentials**, and select **API key**.
5. Copy the generated key and add it to your environment config.
*Note: If no API key is supplied or if quota is exceeded, the server automatically queries decentralized Invidious/Piped nodes as a zero-config fallback.*

### 2. Jamendo Client ID (Fallback Catalogue)
1. Visit the [Jamendo Developer Portal](https://developer.jamendo.com/v3.0).
2. Register a free developer account and create a new Application profile.
3. Copy your **Client ID** (e.g. `56d30c55` is provided as a sandbox fallback).

---

## ⚙️ Configuration Setup

Create or update the `.env` configuration file in the `backend` folder:

```bash
# Path: backend/.env

# SERVER CONFIGURATION
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# DATABASE
DATABASE_URL="file:./dev.db"

# AUTH
JWT_SECRET="kr_music_super_secret_key"
REFRESH_SECRET="kr_music_refresh_secret_key"

# MUSIC APIS
YOUTUBE_API_KEY="YOUR_YOUTUBE_API_KEY_HERE"
JAMENDO_CLIENT_ID="YOUR_JAMENDO_CLIENT_ID_HERE"
```

---

## 🚀 Running the Project

### 1. Launch Backend Server
Navigate to the `backend` directory, install packages, compile the database, and start the development environment:
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 2. Launch Frontend Server
In a new terminal window, navigate to the `web` directory, install packages, and start Next.js:
```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📦 Static Deployment

To compile the app into clean static assets and deploy it to hosting providers:
* **Netlify:** Double-click **`deploy.bat`** at the project root.
* **Firebase:** Double-click **`deploy-firebase.bat`** at the project root.
=======
# kr-music
🎵 KR-Music – A lightweight music streaming and playback application featuring song browsing, audio controls, playlists, and a smooth listening experience.
>>>>>>> ab280ada0839c474742db27ddeaedbebcf4053e2
