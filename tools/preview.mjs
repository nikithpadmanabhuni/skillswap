import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

/**
 * Static preview server with SPA fallback.
 *
 * adapter-static writes 200.html as a fallback for parameterised routes
 * (/sessions/[id], /u/[userId], ...). Real hosts -- Vercel, Netlify,
 * Cloudflare Pages -- serve that automatically on a miss. `vite preview` does
 * not, so previewing the production build there 404s every dynamic route and
 * makes a correct build look broken. This serves it the way a host would.
 *
 *   node tools/preview.mjs user-web/build 4173
 */
const root = process.argv[2] ?? 'user-web/build';
const port = Number(process.argv[3] ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

const send = (res, file, status = 200) => {
  res.writeHead(status, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-cache'
  });
  createReadStream(file).pipe(res);
};

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  // normalize() collapses any ../ before it can escape the build directory
  const rel = normalize(url).replace(/^(\.\.[/\\])+/, '');
  const candidates = [join(root, rel), join(root, rel, 'index.html'), join(root, `${rel}.html`)];

  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return send(res, c);
  }

  const fallback = join(root, '200.html');
  if (existsSync(fallback)) return send(res, fallback);

  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('Not found');
}).listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port} (SPA fallback: 200.html)`);
});
