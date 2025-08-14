import express from 'express';
import session from 'express-session';
import { OAuth2Client } from 'googleapis-common';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());

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

const tempTokens = new Map<string, string>();

app.get('/api/auth/google/callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

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
        const token = jwt.sign(
          {
            id: data?.id,
            email: data?.email,
            name: data?.name,
            picture: data?.picture,
          },
          process.env.JWT_SECRET || '',
          { expiresIn: '1h' }
        );

        // Generate a temporary code
        const tempCode = Math.random().toString(36).substring(2);
        // Store in memory (or better, use Redis)
        tempTokens.set(tempCode, token);

        // Redirect with temporary code instead of token
        res.redirect(`${process.env.FE_BASE_URL}/auth?code=${tempCode}`);
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Authentication failed');
  }
});

// New endpoint to exchange temporary code for token
app.post('/api/auth/token', (req, res) => {
  const { code } = req.body;
  const token = tempTokens.get(code);

  if (!token) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  // Delete the temporary code
  tempTokens.delete(code);

  // Send token in response body
  res.json({ token });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
