/* Small static file server that behaves like GitHub Pages for a project site:
   served below a base path (default /Fitnesstracker/, everything else is 404), Cache-Control max-age=600, proper MIME types.
   Usage: node tools/serve.mjs [dir=_site] [--base /Fitnesstracker/] [--port 4173]
   As a module: startServer({ root, base, port }) -> { url, port, setRoot(dir), requests, close() } */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
};

export function startServer({ root, base = '/Fitnesstracker/', port = 0, maxAge = 600 } = {}) {
  let dir = path.resolve(root);
  const requests = [];
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    requests.push({ method: req.method, path: url.pathname });
    const send = (code, body, headers = {}) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', ...headers }); res.end(body); };
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'Method not allowed');
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch { return send(400, 'Bad request'); }
    if (rel === base.replace(/\/$/, '')) return send(301, '', { Location: base });
    if (!rel.startsWith(base)) return send(404, 'Not found');
    rel = rel.slice(base.length);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const file = path.resolve(dir, rel);
    if (file !== dir && !file.startsWith(dir + path.sep)) return send(403, 'Forbidden');
    try {
      if (!(await stat(file)).isFile()) return send(404, 'Not found');
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=' + maxAge, 'Content-Length': body.length
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { send(404, 'Not found'); }
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const p = server.address().port;
      resolve({
        port: p, url: 'http://localhost:' + p + base, origin: 'http://localhost:' + p, requests,
        setRoot(d) { dir = path.resolve(d); },
        close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(() => r()); })
      });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const positional = process.argv.slice(2).find((a, i, all) => !a.startsWith('--') && !(i > 0 && all[i - 1].startsWith('--')));
  const s = await startServer({ root: path.resolve(positional || path.join(here, '_site')), base: arg('base', '/Fitnesstracker/'), port: Number(arg('port', 4173)) });
  console.log('Serving on ' + s.url);
}
