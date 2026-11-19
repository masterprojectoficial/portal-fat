// Acrescenta regras de justificativa (Frente 1) nos parâmetros gravados no banco, sem mexer nas que já existem.
//   node --env-file=<admin> scripts/db/adicionar-regras.js --db=<banco> --arquivo=<regras.json> [--prod] [--apply]
// O arquivo é uma lista de regras no mesmo formato de js/config.js. Regra com o mesmo tipo e a mesma condição é ignorada.
// Sem --apply só mostra o que faria.
const fs = require('fs');
const { parseArgs, bancoAlvo, conectar } = require('./_db');

(async () => {
  const args = parseArgs();
  const db = bancoAlvo(args);
  if (!args.arquivo) { console.error('Informe --arquivo=<regras.json>'); process.exit(1); }
  const novas = JSON.parse(fs.readFileSync(args.arquivo, 'utf8'));
  const c = await conectar(db);
  const [rows] = await c.query('SELECT config FROM parametros WHERE id = 1');
  if (!rows.length) { console.log('Sem parâmetros gravados neste banco: o portal usa o padrão do código, que já tem as regras.'); await c.end(); return; }
  const config = JSON.parse(rows[0].config);
  const assinatura = (r) => String(r.tipo) + '|' + JSON.stringify(r.condicao || null);
  const ja = new Set((config.regras || []).map(assinatura));
  const entrar = novas.filter((r) => !ja.has(assinatura(r)));
  novas.forEach((r) => console.log(`${ja.has(assinatura(r)) ? '  já existe' : args.apply ? '[incluindo]' : '[simulação]'} tipo ${r.tipo} · ${r.nome}`));
  if (args.apply && entrar.length) {
    config.regras = entrar.concat(config.regras || []);
    await c.query('UPDATE parametros SET config = ?, atualizado_em = UTC_TIMESTAMP() WHERE id = 1', [JSON.stringify(config)]);
    console.log(`Gravado: ${config.regras.length} regras no total.`);
  }
  await c.end();
})().catch((e) => { console.error('Falhou:', e.code || '', e.message); process.exit(1); });
