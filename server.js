import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.PORT) || 8080;
const DIST_DIR = path.join(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  // Health check for cloud orchestrator / Railway
  if (pathname === '/health' || pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  // Admin SPA Routing
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    let relative = pathname.replace(/^\/admin\/?/, '');
    let filePath = path.join(DIST_DIR, 'admin', relative);
    
    if (relative && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveFile(filePath, res);
    }
    return serveFile(path.join(DIST_DIR, 'admin', 'index.html'), res, { 'X-Robots-Tag': 'noindex, nofollow' });
  }

  // Museum Main SPA Routing
  let filePath = path.join(DIST_DIR, pathname);
  if (pathname !== '/' && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveFile(filePath, res);
  }
  
  return serveFile(path.join(DIST_DIR, 'index.html'), res);
});

function serveFile(filePath, res, extraHeaders = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      const isLongLivedAsset = /\.[a-f0-9]{8,}\.(?:js|css|png|jpg|jpeg|svg|woff2?)$/i.test(path.basename(filePath));
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : isLongLivedAsset ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        ...extraHeaders
      });
      res.end(content);
    }
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on 0.0.0.0:${PORT}`);
});
