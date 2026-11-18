// Cria a primeira administradora do portal (as demais pessoas ela cadastra pela tela "Usuários").
// A senha temporária vai para um arquivo local e não aparece na tela. No primeiro acesso o portal pede para trocar.
//   node --env-file=<admin> scripts/db/criar-admin.js --db=<banco> --nome="Nome" --email=<email> --out=<arquivo> [--apply] [--prod]
const crypto = require('crypto');
const fs = require('fs');
const { parseArgs, bancoAlvo, conectar } = require('./_db');

const SCRYPT = { N: 16384, r: 8, p: 1 };
const hash = (s) => { const sal = crypto.randomBytes(16); return `scrypt$${sal.toString('base64url')}$${crypto.scryptSync(s, sal, 64, SCRYPT).toString('base64url')}`; };

(async () => {
  const args = parseArgs();
  const db = bancoAlvo(args);
  const nome = String(args.nome || '').trim(), email = String(args.email || '').trim().toLowerCase(), out = args.out;
  if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error('Informe --nome="..." e --email=...'); process.exit(1); }
  if (!out || out === true) { console.error('Informe --out=<arquivo> para gravar a senha temporária'); process.exit(1); }
  if (!args.apply) { console.log(`[simulação] criaria a administradora ${nome} <${email}> em ${db}.`); return; }
  const c = await conectar(db);
  const [ex] = await c.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (ex.length) { console.error('Já existe usuário com esse e-mail.'); await c.end(); process.exit(1); }
  const senha = crypto.randomBytes(9).toString('base64url');
  await c.query("INSERT INTO usuarios (id, nome, email, papel, senha_hash, trocar_senha) VALUES (?, ?, ?, 'admin', ?, 1)", [crypto.randomUUID(), nome, email, hash(senha)]);
  fs.appendFileSync(out, `# ${db}\nPORTAL_LOGIN=${email}\nPORTAL_SENHA_TEMPORARIA=${senha}\n`, { mode: 0o600 });
  console.log(`Administradora criada em ${db}. Senha temporária gravada em: ${out}`);
  await c.end();
})().catch((e) => { console.error('Falhou:', e.code || '', e.message); process.exit(1); });
