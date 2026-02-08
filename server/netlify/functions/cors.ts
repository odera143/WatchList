export function corsHeaders(origin?: string, allowCredentials = true) {
  const allowedOrigin = process.env.FE_BASE_URL || origin || '*';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };

  if (allowCredentials) headers['Access-Control-Allow-Credentials'] = 'true';
  return headers;
}
