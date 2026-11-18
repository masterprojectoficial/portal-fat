// Login por cookie httpOnly com token assinado (HS256) e senhas com scrypt.
const crypto = require('crypto');
const { Erro } = require('./http');
const { um } = require('./db');

const COOKIE = 'fat_sessao';
const DURACAO = 12 * 3600; // 12 horas
const PAPEIS = ['admin', 'executora', 'aprovadora'];

function segredo() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 24) throw new Erro(500, 'JWT_SECRET não configurado no servidor.');
  return s;
}
const b64 = (x) => Buffer.from(x).toString('base64url');

function assinar(payload) {
  const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64(JSON.stringify(payload));
  const s = crypto.createHmac('sha256', segredo()).update(h + '.' + p).digest('base64url');
  return `${h}.${p}.${s}`;
}

function verificar(token) {
  const [h, p, s] = String(token || '').split('.');
  if (!h || !p || !s) return null;
  const esperado = crypto.createHmac('sha256', segredo()).update(h + '.' + p).digest('base64url');
  const a = Buffer.from(esperado), b = Buffer.from(s);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let pl;
  try { pl = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')); } catch (e) { return null; }
  if (!pl.exp || pl.exp * 1000 < Date.now()) return null;
  return pl;
}

function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach((c) => {
    const i = c.indexOf('=');
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

const seguro = (req) => !!process.env.VERCEL || req.headers['x-forwarded-proto'] === 'https';

function abrirSessao(req, res, u) {
  const token = assinar({ sub: u.id, v: u.sessao_versao, exp: Math.floor(Date.now() / 1000) + DURACAO });
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DURACAO}${seguro(req) ? '; Secure' : ''}`);
}
function fecharSessao(req, res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${seguro(req) ? '; Secure' : ''}`);
}

// Usuário logado. papeis: quem pode (admin sempre pode). permitirTroca: libera quem ainda precisa trocar a senha.
async function usuario(req, papeis, opcoes = {}) {
  const pl = verificar(cookies(req)[COOKIE]);
  if (!pl) throw new Erro(401, 'Sessão expirada. Entre de novo.');
  const u = await um('SELECT id, nome, email, papel, trocar_senha, ativo, sessao_versao FROM usuarios WHERE id = ?', [pl.sub]);
  if (!u || !u.ativo || u.sessao_versao !== pl.v) throw new Erro(401, 'Sessão expirada. Entre de novo.');
  u.trocar_senha = !!u.trocar_senha;
  if (u.trocar_senha && !opcoes.permitirTroca) throw new Erro(403, 'Troque a senha antes de continuar.');
  if (papeis && u.papel !== 'admin' && !papeis.includes(u.papel)) throw new Erro(403, 'Seu perfil não tem permissão para isso.');
  return u;
}

const SCRYPT = { N: 16384, r: 8, p: 1 };
function hashSenha(senha) {
  const sal = crypto.randomBytes(16);
  const h = crypto.scryptSync(String(senha), sal, 64, SCRYPT);
  return `scrypt$${sal.toString('base64url')}$${h.toString('base64url')}`;
}
function confereSenha(senha, guardado) {
  const [alg, sal, h] = String(guardado || '').split('$');
  if (alg !== 'scrypt' || !sal || !h) {
    crypto.scryptSync('x', 'yyyyyyyyyyyyyyyy', 64, SCRYPT); // mesmo tempo de resposta
    return false;
  }
  const x = crypto.scryptSync(String(senha), Buffer.from(sal, 'base64url'), 64, SCRYPT);
  const y = Buffer.from(h, 'base64url');
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function validaNovaSenha(s) {
  if (typeof s !== 'string' || s.length < 10) throw new Erro(400, 'A senha precisa ter pelo menos 10 caracteres.');
  if (s.length > 200) throw new Erro(400, 'Senha longa demais.');
}
const senhaTemporaria = () => crypto.randomBytes(9).toString('base64url');

module.exports = { COOKIE, PAPEIS, assinar, verificar, cookies, abrirSessao, fecharSessao, usuario, hashSenha, confereSenha, validaNovaSenha, senhaTemporaria };
