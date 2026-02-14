import { Handler } from '@netlify/functions';
import { corsHeaders } from './cors';

export const handler: Handler = async (event) => {
  const headers = corsHeaders(event?.headers?.origin);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'TMDB_API_KEY not configured' }),
    };
  }

  // Parse the path to extract TMDB endpoint
  // Format: /.netlify/functions/tmdb/<path>?<query>
  // Example: /.netlify/functions/tmdb/search/movie?query=batman
  const path = event.path.split('/functions/tmdb')[1] || '';
  const queryString = event.rawQuery || '';

  const fullUrl = `https://api.themoviedb.org/3/search/movie?${queryString ? '&' + queryString : ''}`;

  console.log('Proxying TMDB request to:', fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const data = await response.json();

    console.log('TMDB response:', response);
    console.log('TMDB response data:', data);

    return {
      statusCode: response.status,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error('TMDB proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Failed to fetch from TMDB',
      }),
    };
  }
};
