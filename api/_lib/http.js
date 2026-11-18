// Utilitários HTTP das funções da API. Funcionam na Vercel e no servidor local (scripts/dev-server.js).
const LIMITE_CORPO = 4 * 1024 * 1024;

class Erro extends Error {
  constructor(status, mensagem) { super(mensagem); this.status = status; }
}

function query(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  return Object.fromEntries(new URL(req.url, 'http://local').searchParams);
}

async function corpo(req) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8') || '{}');
    if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
    return req.body;
  }
  const partes = [];
  let total = 0;
  for await (const p of req) {
    total += p.length;
    if (total > LIMITE_CORPO) throw new Erro(413, 'Conteúdo grande demais para enviar.');
    partes.push(p);
  }
  const txt = Buffer.concat(partes).toString('utf8');
  try { return JSON.parse(txt || '{}'); } catch (e) { throw new Erro(400, 'JSON inválido.'); }
}

function enviar(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

// Monta a função a partir dos métodos aceitos: rota({ GET: fn, POST: fn }).
// Escritas só aceitam JSON (proteção simples contra envio de formulário de outro site).
function rota(metodos) {
  return async (req, res) => {
    try {
      const fn = metodos[req.method];
      if (!fn) throw new Erro(405, 'Método não permitido.');
      if (req.method !== 'GET' && !String(req.headers['content-type'] || '').includes('application/json')) throw new Erro(415, 'Envie os dados em JSON.');
      // Lê o corpo inteiro antes de qualquer resposta (responder antes derruba a conexão de quem ainda está enviando).
      if (req.method !== 'GET') req.body = await corpo(req);
      const r = await fn(req, res);
      if (!res.writableEnded) enviar(res, 200, r === undefined ? { ok: true } : r);
    } catch (e) {
      if (e && e.status) enviar(res, e.status, { erro: e.message });
      else { console.error(e); enviar(res, 500, { erro: 'Erro interno. Tente de novo em instantes.' }); }
    }
  };
}

const agoraBR = () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
// DATETIME em UTC ('YYYY-MM-DD HH:MM:SS') para texto no horário de Brasília.
const dataHoraBR = (s) => (s ? new Date(String(s).replace(' ', 'T') + 'Z').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '');

module.exports = { Erro, query, corpo, enviar, rota, agoraBR, dataHoraBR };
