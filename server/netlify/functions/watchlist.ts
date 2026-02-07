import { Handler } from '@netlify/functions';
import { verifyTokenFromHeader } from './auth';
import { connectToDatabase } from './dbConnect';
import { User } from './models/User';

export const handler: Handler = async (event) => {
  const authorization =
    event.headers.authorization || event.headers.Authorization;
  const userPayload = verifyTokenFromHeader(authorization as string);

  if (!userPayload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const method = event.httpMethod;

  try {
    await connectToDatabase();

    if (method === 'GET') {
      // Get user's watchlist
      const user = await User.findOne({ googleId: userPayload.id });
      return {
        statusCode: 200,
        body: JSON.stringify(user?.watchlist || []),
      };
    }

    if (method === 'POST') {
      // Add movie to watchlist
      const body = event.body ? JSON.parse(event.body) : null;
      if (!body)
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing body' }),
        };

      const user = await User.findOneAndUpdate(
        { googleId: userPayload.id },
        { $addToSet: { watchlist: body } },
        { new: true },
      );
      return { statusCode: 200, body: JSON.stringify(user?.watchlist || []) };
    }

    if (method === 'DELETE') {
      // Delete movie from watchlist
      const movieIdStr = event.queryStringParameters?.movieId;
      if (!movieIdStr)
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing movieId' }),
        };

      const movieId = Number(movieIdStr);
      if (isNaN(movieId))
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid movieId' }),
        };

      const user = await User.findOneAndUpdate(
        { googleId: userPayload.id },
        { $pull: { watchlist: { movieId } } },
        { new: true },
      );

      if (!user)
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'User not found' }),
        };

      return { statusCode: 200, body: JSON.stringify(user.watchlist) };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Watchlist error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to process request',
      }),
    };
  }
};
