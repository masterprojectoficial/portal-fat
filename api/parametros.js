// /api/parametros  GET -> { config } (null = usar o padrão)   PUT { config } (admin e executora)
const { rota, corpo, Erro, dataHoraBR } = require('./_lib/http');
const { um, q } = require('./_lib/db');
const { usuario } = require('./_lib/auth');

module.exports = rota({
  GET: async (req) => {
    await usuario(req);
    const r = await um('SELECT p.config, p.atualizado_em, u.nome AS por FROM parametros p LEFT JOIN usuarios u ON u.id = p.atualizado_por WHERE p.id = 1');
    return r ? { config: JSON.parse(r.config), atualizado_em: dataHoraBR(r.atualizado_em), atualizado_por: r.por || '' } : { config: null };
  },
  PUT: async (req) => {
    const u = await usuario(req, ['executora']);
    const b = await corpo(req);
    const c = b.config;
    if (!c || !Array.isArray(c.tiposOperacao) || !Array.isArray(c.regras) || !Array.isArray(c.unidadesResumo)) throw new Erro(400, 'Parâmetros incompletos.');
    const txt = JSON.stringify(c);
    if (txt.length > 2 * 1024 * 1024) throw new Erro(413, 'Parâmetros grandes demais.');
    await q('INSERT INTO parametros (id, config, atualizado_por) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE config = VALUES(config), atualizado_por = VALUES(atualizado_por), atualizado_em = UTC_TIMESTAMP()', [txt, u.id]);
    return { ok: true };
  },
});
