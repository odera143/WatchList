import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const siteUrl = trimTrailingSlash(
  process.env.VITE_SITE_URL?.trim() || 'http://localhost:5173',
);

const xmlEscape = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const crawlableRoutes = ['/'];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${crawlableRoutes
  .map(
    (route) => `  <url>
    <loc>${xmlEscape(`${siteUrl}${route}`)}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /auth

Sitemap: ${siteUrl}/sitemap.xml
`;

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(path.join(publicDir, 'robots.txt'), robots, 'utf8');
