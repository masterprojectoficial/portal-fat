// Conexão com o MySQL (Amazon RDS), no mesmo padrão do MasterKey.
// Variáveis: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASS, MYSQL_DATABASE, MYSQL_SSL (off só para MySQL local).
const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DATABASE || 'masterproject_portal_fat',
      waitForConnections: true,
      connectionLimit: 5,
      idleTimeout: 60000,
      dateStrings: true,
      timezone: 'Z',
      charset: 'utf8mb4',
      // Conexão criptografada com o certificado da Amazon RDS verificado.
      ssl: process.env.MYSQL_SSL === 'off' ? undefined : 'Amazon RDS',
    });
  }
  return pool;
}

async function q(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

async function um(sql, params = []) {
  const rows = await q(sql, params);
  return rows[0] || null;
}

// Executa fn(conexão) dentro de uma transação.
async function tx(fn) {
  const c = await getPool().getConnection();
  try {
    await c.beginTransaction();
    const r = await fn({
      q: async (sql, params = []) => (await c.execute(sql, params))[0],
      um: async (sql, params = []) => (await c.execute(sql, params))[0][0] || null,
    });
    await c.commit();
    return r;
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}

module.exports = { getPool, q, um, tx };
