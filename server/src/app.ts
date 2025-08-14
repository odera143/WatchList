import express from 'express';
import session from 'express-session';
import { OAuth2Client } from 'googleapis-common';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for session management
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the Google Auth App');
});

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.get('/auth/google', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  res.redirect(authUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Fixed oauth2 initialization
    const oauth2 = google.oauth2('v2');
    oauth2.userinfo.get(
      {
        auth: oAuth2Client,
      },
      async (err, response) => {
        if (err) {
          console.error('Error:', err);
          return res.status(500).send('Authentication failed');
        }

        const data = response?.data;
        console.log('User data:', data);
        // req.session.user = {
        //   id: data?.id,
        //   email: data?.email,
        //   name: data?.name,
        //   picture: data?.picture,
        // };

        res.redirect(process.env.FE_BASE_URL || 'http://localhost:5173');
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
