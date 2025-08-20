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
- Add movie to watched list

Currently Working On
-
- Track rewatches
- Local storage alternative for guest sessions
- Timestamps
- toast messages (success/error/info)

Known Issues
-
- User is logged in indefinitely until they explicitly log out.

Screenshots
-
<img width="1905" height="929" alt="image" src="https://github.com/user-attachments/assets/387be216-f3da-4d3a-9be3-d46bbb4c0c25" />
<img width="1904" height="928" alt="image" src="https://github.com/user-attachments/assets/d6b87eda-1380-49f6-a4a5-208fb17258d5" />




