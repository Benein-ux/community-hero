# CommunityHero

**AI-powered hyperlocal civic issue reporting platform — report problems, let the community verify them, and track them to resolution.**

---

## The Problem

Citizens encounter civic issues daily — potholes, broken streetlights, water leaks, overflowing waste — but reporting them is fragmented across phone calls, emails, and social media with no visibility into resolution. Communities lack a unified, transparent system to surface problems, prioritize by severity, and hold authorities accountable.

## The Solution

CommunityHero provides a single platform where citizens snap a photo, AI automatically categorizes and assesses severity, the community upvotes to verify, and admins track issues through reported → in progress → resolved — with predictive insights to prevent future problems.

---

## Key Features

- **Image-Based Issue Reporting** — Upload a photo with location; AI analyzes the image and description to auto-assign category, severity, tags, and summary
- **AI-Powered Categorization** — Google Gemini 1.5 Flash analyzes images and text to categorize issues into 10+ categories (Pothole, Streetlight, Water Leak, etc.) with severity ratings
- **Interactive Map** — Leaflet dark-themed map with color-coded pins, map-click location picker, GPS auto-detect, and address search via Nominatim
- **Community Verification** — Upvote-based verification system; 3+ upvotes marks an issue as community-verified with a green checkmark
- **Real-Time Status Tracking** — Admins update issue status (reported → in progress → resolved); 10-second polling keeps the map and lists current
- **Impact Dashboard** — Recharts-powered charts showing total issues, breakdown by category and status, recent issues list, and AI-generated insights
- **Predictive Insights** — Gemini analyzes aggregated issue data to identify patterns, predict problem areas, and recommend preventive actions
- **Gamification** — Points for reporting (+10) and upvoting (+5), 5 badge tiers (First Step → Trusted Voice), ranked leaderboard with avatar display
- **Admin Controls** — Admin access via secret code; status management directly from issue detail pages
- **Responsive Design** — Full mobile bottom navigation, desktop top bar, dark-first aesthetic following the "Linear/Modern" design system

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 + React Router 7 |
| **Maps** | Leaflet + React-Leaflet 5 (CartoDB dark tiles) |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express 5 |
| **Database** | Firebase Firestore (issues, users, votes collections) |
| **Authentication** | Firebase Auth (Google Sign-In) |
| **AI** | Google Gemini 1.5 Flash (direct REST API, not SDK) |
| **Image Storage** | Cloudinary (free tier, auto-optimized) |
| **Hosting** | Firebase Hosting (frontend) + Render (backend) |

---

## Screenshots

> Screenshots will be added here.

<!-- 
Replace this section with actual screenshots:
- Home map view with issue pins
- Report form with embedded map picker
- Dashboard with charts and AI insights
- Leaderboard with badges
- Mobile view with bottom navigation
-->

---

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- A Firebase project with Authentication (Google provider) and Firestore enabled
- A Cloudinary account (free tier)
- A Google AI Studio API key (Gemini)

### 1. Clone the repository

```bash
git clone https://github.com/Benein-ux/community-hero.git
cd community-hero
```

### 2. Install dependencies

```bash
# Client
cd client
npm install

# Server
cd ../server
npm install
```

### 3. Set up environment variables

**Server** — create `server/.env`:

```
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FIREBASE_PROJECT_ID=
PORT=8080
CLIENT_URL=http://localhost:5173
```

**Client** — create `client/.env`:

```
VITE_API_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 4. Add Firebase service account

Download your `serviceAccountKey.json` from the Firebase Console (Project Settings → Service Accounts → Generate New Private Key) and place it in the `server/` directory.

### 5. Run the dev servers

```bash
# Terminal 1 — Backend (port 8080)
cd server
npm start

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | [community-hero-ish-acdd9.web.app](https://community-hero-ish-acdd9.web.app) |
| **Backend API** | [Deploy to Render](https://render.com) |

---

## Project Structure

```
community-hero/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Layout, AmbientBackground, BadgeDisplay
│   │   ├── pages/              # Home, Report, Dashboard, Leaderboard, IssueDetail, Login, AdminAccess
│   │   ├── lib/                # firebase.js, api.js, theme.js, colors.js, useAdmin.js
│   │   ├── index.css           # Tailwind v4 config, CSS variables, animations
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                     # Express backend
│   ├── routes/                 # issues.js, users.js, insights.js, health.js
│   ├── services/               # gemini.js, cloudinary.js, firestore.js
│   ├── index.js
│   ├── Dockerfile
│   └── package.json
├── firebase.json               # Firebase Hosting config with cache headers
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes
├── CLAUDE.md                   # Development instructions
├── DESIGN.md                   # Design system tokens and guidelines
└── README.md
```

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key for Gemini |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `PORT` | Server port (default: 8080) |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:5173`) |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:8080`) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## License

MIT
