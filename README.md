# React + TypeScript + Vite
Required Connections
-
- TMDB
- Google Client
- MongoDB


```
# server/.env
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
JWT_SECRET=<come up with one>
SESSION_SECRET=<come up with one>
BE_BASE_URL=http://localhost:3000 (default)
FE_BASE_URL=http://localhost:5173 (default)
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback (default)
MONGODB_URI
```

```
# watchlist/.env
VITE_API_ACCESS_TOKEN
VITE_BE_BASE_URL=http://localhost:3000 (default)
```
Current Features
-
- Google login support
- Search for movies
- Add movie to watchlist
- Remove from watchlist

Currently Working On
-
- Add movie to watched list
- Track rewatches

Known Issues
-
- User is logged in indefinitely until they explicitly log out.

Screenshots
-
<img width="1918" height="928" alt="image" src="https://github.com/user-attachments/assets/d92829aa-1c98-4062-afc9-faddbef730c5" />



