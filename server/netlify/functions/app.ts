import express, { Request } from 'express';
import session from 'express-session';
import { OAuth2Client } from 'googleapis-common';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import cors from 'cors';
import { corsHeaders } from './cors';
import { authenticateToken } from '../../src/middleware/auth';
import { User } from '../../src/models/User';
import serverless from 'serverless-http';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string; picture: string };
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or from FE_BASE_URL
      if (!origin || origin === process.env.FE_BASE_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Ensure all responses include the same CORS headers and respond to preflight
app.use((req, res, next) => {
  const headers = corsHeaders(req.headers.origin as string);
  // Set headers on the response
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Connect to MongoDB
const clientOptions = {
  serverApi: { version: '1' as '1', strict: true, deprecationErrors: true },
};
mongoose
  .connect(process.env.MONGODB_URI as string, clientOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware for session management
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(express.json());

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the Google Auth App');
});

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
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

        // Check if user exists, if not create new user
        try {
          let user = await User.findOne({ googleId: data?.id });

          if (!user) {
            user = await User.create({
              googleId: data?.id,
              email: data?.email,
              name: data?.name,
              picture: data?.picture,
              watchlist: [],
              watched: [],
            });
            console.log('New user created:', user.email);
          }

          const token = jwt.sign(
            {
              id: data?.id,
              email: data?.email,
              name: data?.name,
              picture: data?.picture,
            },
            process.env.JWT_SECRET || '',
            { expiresIn: '1h' },
          );

          const tempCode = Math.random().toString(36).substring(2);
          tempTokens.set(tempCode, token);

          res.redirect(`${process.env.FE_BASE_URL}/auth?code=${tempCode}`);
        } catch (error) {
          console.error('Database error:', error);
          res.status(500).send('Failed to create/update user');
        }
      },
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

// Get user's watchlist
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user?.id });
    res.json(user?.watchlist || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add movie to watchlist
app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { googleId: req.user?.id },
      { $addToSet: { watchlist: req.body } },
      { new: true },
    );
    res.json(user?.watchlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Delete movie from watchlist
app.delete('/api/watchlist/:movieId', authenticateToken, async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);
    const user = await User.findOneAndUpdate(
      { googleId: req.user?.id },
      { $pull: { watchlist: { movieId: movieId } } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.watchlist);
  } catch (error) {
    console.error('Error removing movie from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Get user's watched list
app.get('/api/watched', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user?.id });
    res.json(user?.watched || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watched list' });
  }
});

// Add movie to watched list
app.post('/api/watched', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { googleId: req.user?.id },
      {
        $addToSet: { watched: req.body },
        $pull: { watchlist: { movieId: req.body.movieId } },
      },
      { new: true },
    );
    res.json(user?.watched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to watched list' });
  }
});

app.put('/api/watched/:movieId', authenticateToken, async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);
    const user = await User.findOneAndUpdate(
      { googleId: req.user?.id },
      {
        $set: { 'watched.$[elem]': req.body },
        $pull: { watchlist: { movieId: req.body.movieId } },
      },
      {
        arrayFilters: [{ 'elem.movieId': movieId }],
        new: true,
      },
    );
    res.json(user?.watched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update watched list' });
  }
});

export const handler = serverless(app);

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
