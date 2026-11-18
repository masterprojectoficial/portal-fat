// Cria o usuário de banco que o SISTEMA usa no dia a dia: só lê e grava dados (SELECT, INSERT, UPDATE, DELETE)
// em UM banco, só com conexão criptografada. A senha vai para um arquivo local (fora do git) e não aparece na tela.
//   node --env-file=<admin> scripts/db/criar-usuario-app.js --db=<banco> --user=<nome> --out=<arquivo> [--apply] [--prod]
const crypto = require('crypto');
const fs = require('fs');
const { parseArgs, bancoAlvo, conectar } = require('./_db');

(async () => {
  const args = parseArgs();
  const db = bancoAlvo(args);
  const user = args.user, out = args.out;
  if (!user || user === true || !/^[a-z0-9_]{3,32}$/.test(user)) { console.error('Informe --user=<nome> (minúsculas, números, _)'); process.exit(1); }
  if (!out || out === true) { console.error('Informe --out=<arquivo> para gravar a senha'); process.exit(1); }
  if (!args.apply) { console.log(`[simulação] criaria '${user}' com SELECT/INSERT/UPDATE/DELETE só em ${db}, exigindo SSL, e gravaria em ${out}.`); return; }
  const c = await conectar(db);
  const senha = crypto.randomBytes(24).toString('base64url');
  const [ex] = await c.query('SELECT 1 FROM mysql.user WHERE user = ?', [user]);
  if (ex.length) await c.query(`ALTER USER '${user}'@'%' IDENTIFIED BY ? REQUIRE SSL`, [senha]);
  else await c.query(`CREATE USER '${user}'@'%' IDENTIFIED BY ? REQUIRE SSL`, [senha]);
  await c.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON \`${db}\`.* TO '${user}'@'%'`);
  const linhas = [`MYSQL_HOST=${process.env.MYSQL_HOST}`, `MYSQL_PORT=${Number(process.env.MYSQL_PORT) || 3306}`, `MYSQL_USER=${user}`, `MYSQL_PASS=${senha}`, `MYSQL_DATABASE=${db}`];
  const atual = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split(/\r?\n/).filter((l) => l && !/^MYSQL_(HOST|PORT|USER|PASS|DATABASE)=/.test(l)) : [];
  fs.writeFileSync(out, [...atual, ...linhas].join('\n') + '\n', { mode: 0o600 });
  const [grants] = await c.query(`SHOW GRANTS FOR '${user}'@'%'`);
  grants.forEach((g) => console.log('  ' + Object.values(g)[0]));
  console.log(`Usuário ${ex.length ? 'atualizado' : 'criado'}. Credenciais gravadas em: ${out}`);
  await c.end();
})().catch((e) => { console.error('Falhou:', e.code || '', e.message); process.exit(1); });
