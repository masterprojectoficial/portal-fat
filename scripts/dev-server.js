// Servidor local que imita a Vercel: arquivos estáticos + funções em /api + bloqueio de quem não está logado.
//   npm run dev   (lê .env.local)  ->  http://127.0.0.1:3000
const http = require('http');
const fs = require('fs');
const path = require('path');
const { verificar, cookies, COOKIE } = require('../api/_lib/auth');

const RAIZ = path.resolve(__dirname, '..');
const PORTA = Number(process.env.PORT) || 3000;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon' };
const LIVRE = /^\/(login\.html|assets\/|favicon)/;
const BLOQUEADO = /^\/(\.|scripts\/|db\/|node_modules\/|test\/|exemplos\/|package|middleware\.js|vercel\.json)/;

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://local');
  const p = decodeURIComponent(url.pathname);
  try {
    if (p.startsWith('/api/')) {
      const nome = p.slice(5).replace(/\/$/, '');
      if (!/^[a-z]+$/.test(nome) || !fs.existsSync(path.join(RAIZ, 'api', nome + '.js'))) { res.statusCode = 404; return res.end('{"erro":"não encontrado"}'); }
      req.query = Object.fromEntries(url.searchParams);
      return await require(path.join(RAIZ, 'api', nome + '.js'))(req, res);
    }
    if (BLOQUEADO.test(p)) { res.statusCode = 404; return res.end('não encontrado'); }
    if (!LIVRE.test(p)) {
      let ok = false;
      try { ok = !!verificar(cookies(req)[COOKIE]); } catch (e) { ok = false; }
      if (!ok) { res.statusCode = 302; res.setHeader('Location', '/login.html'); return res.end(); }
    }
    let arq = path.join(RAIZ, p === '/' ? 'index.html' : p);
    if (!arq.startsWith(RAIZ) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.statusCode = 404; return res.end('não encontrado'); }
    res.setHeader('Content-Type', TIPOS[path.extname(arq)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(arq).pipe(res);
  } catch (e) {
    console.error(e);
    res.statusCode = 500; res.end('erro');
  }
}).listen(PORTA, '127.0.0.1', () => console.log(`Portal FAT local em http://127.0.0.1:${PORTA}`));
