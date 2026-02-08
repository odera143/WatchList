import { Handler } from '@netlify/functions';
import { verifyTokenFromHeader } from './auth';
import { connectToDatabase } from './dbConnect';
import { User } from './models/User';
import { corsHeaders } from './cors';

export const handler: Handler = async (event) => {
  const headers = corsHeaders(event?.headers?.origin);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  const authorization =
    event.headers.authorization || event.headers.Authorization;
  const userPayload = verifyTokenFromHeader(authorization as string);

  if (!userPayload) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const method = event.httpMethod;

  try {
    await connectToDatabase();

    if (method === 'GET') {
      // Get user's watched list
      const user = await User.findOne({ googleId: userPayload.id });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user?.watched || []),
      };
    }

    if (method === 'POST') {
      // Add movie to watched list (remove from watchlist)
      const body = event.body ? JSON.parse(event.body) : null;
      if (!body)
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing body' }),
        };

      const user = await User.findOneAndUpdate(
        { googleId: userPayload.id },
        {
          $addToSet: { watched: body },
          $pull: { watchlist: { movieId: body.movieId } },
        },
        { new: true },
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user?.watched || []),
      };
    }

    if (method === 'PUT') {
      // Update watched item
      const movieIdStr = event.queryStringParameters?.movieId;
      if (!movieIdStr)
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing movieId' }),
        };

      const movieId = Number(movieIdStr);
      if (isNaN(movieId))
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid movieId' }),
        };

      const body = event.body ? JSON.parse(event.body) : null;
      if (!body)
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing body' }),
        };

      const user = await User.findOneAndUpdate(
        { googleId: userPayload.id },
        {
          $set: { 'watched.$[elem]': body },
        },
        {
          arrayFilters: [{ 'elem.movieId': movieId }],
          new: true,
        },
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user?.watched || []),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: any) {
    console.error('Watched error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to process request',
      }),
    };
  }
};
