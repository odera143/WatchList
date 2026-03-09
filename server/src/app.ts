import express from 'express';
import { OAuth2Client } from 'googleapis-common';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { randomBytes } from 'crypto';
import { authenticateToken } from './middleware/auth';
import { User } from './models/User';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

const app = express();
const PORT = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;
const tempTokenTtlMs = 2 * 60 * 1000;
const authCookieTtlMs = 10 * 365 * 24 * 60 * 60 * 1000;
const normalizeOrigin = (value: string) => value.replace(/\/+$/, '');
const allowedOrigin = normalizeOrigin(process.env.FE_BASE_URL || '');
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  maxAge: authCookieTtlMs,
  path: '/',
};
const cookieClearOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const tmdbLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors((req, callback) => {
    const origin = req.header('Origin');
    const allowNoOrigin =
      req.path === '/auth/google' || req.path === '/api/auth/google/callback';

    if (!origin) {
      if (
        allowNoOrigin ||
        req.header('host') === allowedOrigin.replace('https://', '')
      ) {
        callback(null, { origin: true, credentials: true });
      } else {
        callback(new Error('Not allowed by CORS'));
      }
      return;
    }

    if (normalizeOrigin(origin) === allowedOrigin) {
      callback(null, { origin: true, credentials: true });
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }),
);

// Connect to MongoDB
const clientOptions = {
  serverApi: { version: '1' as '1', strict: true, deprecationErrors: true },
};
mongoose
  .connect(process.env.MONGODB_URI as string, clientOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Google Auth App');
});

app.get(
  '/api/tmdb/search',
  authenticateToken,
  tmdbLimiter,
  async (req, res) => {
    const query = String(req.query.query ?? '').trim();
    const pageValue = Number(req.query.page ?? 1);
    const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
    const tmdbToken = process.env.TMDB_API_ACCESS_TOKEN;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!tmdbToken) {
      return res.status(500).json({ error: 'TMDB token is not configured' });
    }

    const tmdbUrl = new URL('https://api.themoviedb.org/3/search/movie');
    tmdbUrl.searchParams.set('query', query);
    tmdbUrl.searchParams.set('page', String(page));

    try {
      const tmdbResponse = await (globalThis as any).fetch(tmdbUrl.toString(), {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${tmdbToken}`,
        },
      });

      if (!tmdbResponse.ok) {
        const details = await tmdbResponse.text();
        console.error('TMDB error:', tmdbResponse.status, details);
        return res
          .status(tmdbResponse.status)
          .json({ error: 'TMDB request failed' });
      }

      const payload = await tmdbResponse.json();
      res.json(payload);
    } catch (error) {
      console.error('TMDB request error:', error);
      res.status(500).json({ error: 'Failed to fetch TMDB data' });
    }
  },
);

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

app.get('/auth/google', authLimiter, (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  res.redirect(authUrl);
});

type TempToken = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
  expiresAt: number;
};

const tempTokens = new Map<string, TempToken>();

const buildUserPayload = (data: {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
}) => ({
  id: data.id || '',
  email: data.email || '',
  name: data.name || '',
  picture: data.picture || '',
});

const signAuthToken = (user: {
  id: string;
  email: string;
  name: string;
  picture?: string;
}) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    jwtSecret,
  );

const cleanupExpiredTempTokens = () => {
  const now = Date.now();
  for (const [code, tempToken] of tempTokens.entries()) {
    if (tempToken.expiresAt <= now) {
      tempTokens.delete(code);
    }
  }
};

setInterval(cleanupExpiredTempTokens, 60 * 1000).unref();

app.get('/api/auth/google/callback', authLimiter, async (req, res) => {
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

          const userPayload = buildUserPayload({
            id: data?.id,
            email: data?.email,
            name: data?.name,
            picture: data?.picture,
          });
          const token = signAuthToken(userPayload);

          const tempCode = randomBytes(32).toString('hex');
          tempTokens.set(tempCode, {
            token,
            user: userPayload,
            expiresAt: Date.now() + tempTokenTtlMs,
          });

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

// exchange temporary code for token
app.post('/api/auth/token', authLimiter, (req, res) => {
  const { code } = req.body;
  if (typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid code' });
  }
  const tempToken = tempTokens.get(code);

  if (!tempToken) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  if (tempToken.expiresAt <= Date.now()) {
    tempTokens.delete(code);
    return res.status(400).json({ error: 'Invalid code' });
  }

  // Delete the temporary code
  tempTokens.delete(code);

  res.cookie('auth_token', tempToken.token, cookieOptions);
  res.json({ user: tempToken.user });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authLimiter, (req, res) => {
  res.clearCookie('auth_token', cookieClearOptions);
  res.status(204).send();
});

app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user.id });
    res.json(user?.watchlist || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { googleId: req.user.id },
      { $addToSet: { watchlist: req.body } },
      { new: true },
    );
    res.json(user?.watchlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

app.delete('/api/watchlist/:movieId', authenticateToken, async (req, res) => {
  try {
    const movieId = Number(req.params.movieId);
    const user = await User.findOneAndUpdate(
      { googleId: req.user.id },
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

app.get('/api/watched', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.user.id });
    res.json(user?.watched || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watched list' });
  }
});

app.post('/api/watched', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { googleId: req.user.id },
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
      { googleId: req.user.id },
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
