# Community Hero — Claude Code Instructions

## Project Overview
A hyperlocal civic issue reporting platform. Citizens report problems (potholes,
broken streetlights, water leaks), AI categorizes them, community upvotes/verifies,
and issues get tracked to resolution.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + React Router + Leaflet maps
- Backend: Node.js + Express
- Database: Firebase Firestore
- Auth: Firebase Auth (Google Sign-in)
- Image Storage: Cloudinary (free tier)
- AI: Google Gemini 1.5 Flash (image analysis + categorization)
- Deployment: Cloud Run (backend), Firebase Hosting (frontend)

## Project Structure
community-hero/
├── client/src/
│   ├── pages/         # Route-level components
│   ├── components/    # Reusable UI components
│   ├── lib/           # firebase.js, api.js
│   └── main.jsx
├── server/
│   ├── routes/        # Express route handlers
│   ├── services/      # gemini.js, cloudinary.js, firestore.js
│   └── index.js
├── CLAUDE.md
├── DESIGN.md
└── firebase.json

## Code Style Rules
- No comments in code unless logic is genuinely non-obvious
- Async/await everywhere, no .then() chains
- Named exports preferred over default exports (except pages)
- Tailwind for all styling — no separate CSS files
- Error handling: always return { success, data, error } shape from API routes
- Environment variables via process.env, never hardcoded

## Key Files to Know
- client/src/lib/firebase.js — Firebase init and exports
- client/src/lib/api.js — All fetch calls to backend
- server/services/gemini.js — Gemini API calls
- server/services/cloudinary.js — Image upload handling
- server/services/firestore.js — All Firestore reads/writes
- server/.env — secrets (never commit)

## Gemini Usage
Model: gemini-1.5-flash
Use cases:
1. Categorize issue from image + description → returns JSON
2. Generate predictive insights from aggregated issue data
Always prompt for JSON output and parse response safely.

## Firestore Collections
- issues: { title, description, imageUrl, location{lat,lng,address},
            category, severity, status, upvotes, reportedBy, createdAt }
- users: { name, points, issuesReported, issuesVerified, badges[] }
- votes: { issueId, userId } — to prevent double-voting

## Build Order
1. Firebase auth + basic layout shell
2. Issue report form with image upload to Cloudinary + Gemini categorization
3. Map view (Leaflet) showing all issues
4. Issue detail page with upvoting
5. Impact dashboard with charts (recharts)
6. Predictive insights via Gemini
7. Gamification (points, leaderboard)
8. Deploy to Cloud Run + Firebase Hosting

## Do Not
- Use class components
- Use Redux (useState + Context is enough)
- Install chart libraries other than recharts
- Use CSS modules or styled-components