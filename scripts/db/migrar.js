// Cria o banco (se não existir) e aplica as migrações pendentes.
//   node --env-file=<admin> scripts/db/migrar.js --db=masterproject_portal_fat_hml [--apply]
//   node --env-file=<admin> scripts/db/migrar.js --db=masterproject_portal_fat --prod [--apply]
// Sem --apply só mostra o que faria.
const { parseArgs, bancoAlvo, conectar } = require('./_db');
const migracoes = require('./migracoes');

(async () => {
  const args = parseArgs();
  const db = bancoAlvo(args);
  const c = await conectar(undefined);
  const [existe] = await c.query('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?', [db]);
  if (!existe.length) {
    console.log(`${args.apply ? '[ok]' : '[simulação]'} CREATE DATABASE ${db}`);
    if (args.apply) await c.query(`CREATE DATABASE \`${db}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
  }
  if (!existe.length && !args.apply) { console.log('Banco ainda não existe: as migrações seriam todas aplicadas.'); await c.end(); return; }
  await c.query(`USE \`${db}\``);
  await c.query('CREATE TABLE IF NOT EXISTS _migracoes (nome VARCHAR(100) NOT NULL PRIMARY KEY, aplicada_em DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()))');
  const [feitas] = await c.query('SELECT nome FROM _migracoes');
  const ja = new Set(feitas.map((r) => r.nome));
  for (const m of migracoes) {
    if (ja.has(m.nome)) { console.log(`  já aplicada: ${m.nome}`); continue; }
    console.log(`${args.apply ? '[aplicando]' : '[simulação]'} ${m.nome} (${m.sql.length} comandos)`);
    if (!args.apply) continue;
    for (const s of m.sql) await c.query(s);
    await c.query('INSERT INTO _migracoes (nome) VALUES (?)', [m.nome]);
  }
  const [tabs] = await c.query('SHOW TABLES');
  console.log('Tabelas:', tabs.map((t) => Object.values(t)[0]).join(', '));
  await c.end();
})().catch((e) => { console.error('Falhou:', e.code || '', e.message); process.exit(1); });
