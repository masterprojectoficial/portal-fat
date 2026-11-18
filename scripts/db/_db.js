// Utilitários dos scripts de banco (rodam com o usuário administrador do RDS).
// O administrador vem de MYSQL_ADMIN_USER / MYSQL_ADMIN_PASS, ou de MYSQL_USER / MYSQL_PASS do arquivo passado em --env-file.
//   node --env-file=<arquivo com o admin> scripts/db/<script>.js --db=<banco> [--apply] [--prod]
const mysql = require('mysql2/promise');

const PROD_DB = 'masterproject_portal_fat';
const HML_DB = 'masterproject_portal_fat_hml';

function parseArgs() {
  const out = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) out[m[1]] = m[2] === undefined ? true : m[2];
  }
  return out;
}

function bancoAlvo(args) {
  const db = args.db;
  if (!db || db === true) { console.error('Informe o banco alvo: --db=<nome>'); process.exit(1); }
  if (![PROD_DB, HML_DB].includes(db)) { console.error(`Banco fora do Portal FAT: ${db}. Use ${HML_DB} ou ${PROD_DB}.`); process.exit(1); }
  if (db === PROD_DB && !args.prod) { console.error(`"${db}" é o banco de PRODUÇÃO. Rode com --prod para confirmar.`); process.exit(1); }
  return db;
}

function conectar(database) {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_ADMIN_USER || process.env.MYSQL_USER,
    password: process.env.MYSQL_ADMIN_PASS || process.env.MYSQL_PASS,
    database,
    connectTimeout: 15000,
    multipleStatements: false,
    charset: 'utf8mb4',
    ssl: process.env.MYSQL_SSL === 'off' ? undefined : 'Amazon RDS',
  });
}

module.exports = { PROD_DB, HML_DB, parseArgs, bancoAlvo, conectar };
