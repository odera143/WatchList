import { Handler } from '@netlify/functions';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './dbConnect';
import { User } from './models/User';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export const handler: Handler = async (event) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing code' }) };
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens as any);

    const oauth2 = google.oauth2('v2');
    const resp = await oauth2.userinfo.get({ auth: oauth2Client as any });
    const data = resp.data as any;

    await connectToDatabase();

    let user = await User.findOne({ googleId: data?.id });
    if (!user) {
      user = await User.create({
        googleId: data?.id,
        email: data?.email,
        name: data?.name,
        picture: data?.picture,
        watchlist: [],
        watched: [],
      } as any);
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

    // Redirect with JWT in URL fragment (only readable by browser, not sent to server)
    const redirectTo = `${process.env.FE_BASE_URL}/auth#token=${token}`;

    return {
      statusCode: 302,
      headers: { Location: redirectTo },
      body: '',
    };
  } catch (err: any) {
    console.error('Auth callback error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed' }),
    };
  }
};
