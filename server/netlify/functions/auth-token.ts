import { Handler } from '@netlify/functions';
import { verifyTokenFromHeader } from './auth';

export const handler: Handler = async (event) => {
  const authorization =
    event.headers.authorization || event.headers.Authorization;
  const userPayload = verifyTokenFromHeader(authorization as string);

  if (!userPayload) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  // Token is valid - return success
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Token verified', user: userPayload }),
  };
};
