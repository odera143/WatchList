# WatchList

WatchList is a React + Node.js app with Google OAuth login, TMDB search, and MongoDB-backed watchlist/watched tracking.

## Requirements

- Node.js 20+
- Docker and Docker Compose
- Google OAuth client
- TMDB API read access token
- MongoDB (Atlas or local)

## Environment Files

Copy these templates and fill your own values:

- `cp server/.env.example server/.env`
- `cp watchlist/.env.example watchlist/.env`

## Local Development

### Option 1: Run apps directly

1. Start backend:
   - `cd server`
   - `npm install`
   - `npm run dev`
2. Start frontend:
   - `cd watchlist`
   - `npm install`
   - `npm run dev`

### Option 2: Docker local build/run

From repo root:

- `docker compose up --build`

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Google OAuth Notes

Configure entries in Google Cloud Console:

- Authorized JavaScript origins:
  - `http://localhost:5173`
  - your production frontend origin
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/google/callback`
  - your production callback URL

These must match `FE_BASE_URL` and `GOOGLE_REDIRECT_URI` used by the running backend.

## Currently Working On

- Tracking rewatches
- Local storage alternative for guest sessions
- Timestamps

## Screenshots

<img width="1889" height="938" alt="image" src="https://github.com/user-attachments/assets/75124f9f-c7b2-4c7a-abd1-9a7455dca102" />
<img width="1900" height="938" alt="image" src="https://github.com/user-attachments/assets/cf4514cc-182e-450f-8b78-ad8502b2da42" />

