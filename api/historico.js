// GET /api/historico -> aprovações e devoluções, mais recentes primeiro
const { rota, dataHoraBR } = require('./_lib/http');
const { q } = require('./_lib/db');
const { usuario } = require('./_lib/auth');

module.exports = rota({
  GET: async (req) => {
    await usuario(req);
    const rows = await q('SELECT em, frente, rotina, competencia, status, por, resultado, obs, relatorio_id, arquivo FROM historico ORDER BY em DESC, id DESC LIMIT 500');
    return rows.map((r) => ({ em: dataHoraBR(r.em), frente: r.frente, rotina: r.rotina || '', competencia: r.competencia, status: r.status, por: r.por, resultado: r.resultado, obs: r.obs || '', relatorioId: r.relatorio_id || null, arquivo: r.arquivo || '' }));
  },
});
