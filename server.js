import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

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

const COMPRESSIBLE_EXTS = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.xml', '.txt', '.svg']);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  // Health check for any30.com cloud orchestrator
  if (pathname === '/health' || pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('OK');
  }

  // Admin SPA Routing
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    let relative = pathname.replace(/^\/admin\/?/, '');
    let filePath = path.join(DIST_DIR, 'admin', relative);
    
    if (relative && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveFile(filePath, req, res);
    }
    return serveFile(path.join(DIST_DIR, 'admin', 'index.html'), req, res, { 'X-Robots-Tag': 'noindex, nofollow' });
  }

  // Museum Main SPA Routing
  let filePath = path.join(DIST_DIR, pathname);
  if (pathname !== '/' && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveFile(filePath, req, res);
  }
  
  return serveFile(path.join(DIST_DIR, 'index.html'), req, res);
});

function serveFile(filePath, req, res, extraHeaders = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not Found');
    }

    const isLongLivedAsset = /\.[a-f0-9]{8,}\.(?:js|css|png|jpg|jpeg|svg|woff2?)$/i.test(path.basename(filePath));
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : isLongLivedAsset ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Vary': 'Accept-Encoding',
    const acceptEncoding = req.headers['accept-encoding'] || '';

    // Handle HEAD requests (essential for Twitterbot, WhatsApp, Facebook crawlers)
    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      return res.end();
    }

    // Fast-path: compress text/code files (75-80% smaller network payload)
    if (COMPRESSIBLE_EXTS.has(ext) && content.length > 256) {
      if (/\bbr\b/.test(acceptEncoding) && typeof zlib.brotliCompress === 'function') {
        return zlib.brotliCompress(content, (compErr, compressed) => {
          if (compErr) {
            res.writeHead(200, headers);
            return res.end(content);
          }
          headers['Content-Encoding'] = 'br';
          res.writeHead(200, headers);
          res.end(compressed);
        });
      } else if (/\bgzip\b/.test(acceptEncoding)) {
        return zlib.gzip(content, (compErr, compressed) => {
          if (compErr) {
            res.writeHead(200, headers);
            return res.end(content);
          }
          headers['Content-Encoding'] = 'gzip';
          res.writeHead(200, headers);
          res.end(compressed);
        });
      }
    }

    res.writeHead(200, headers);
    res.end(content);
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on 0.0.0.0:${PORT}`);
});
