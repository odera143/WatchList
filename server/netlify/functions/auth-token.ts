import { Handler } from '@netlify/functions';
import { verifyTokenFromHeader } from './auth';
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

  // Token is valid - return success
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Token verified', user: userPayload }),
  };
};
