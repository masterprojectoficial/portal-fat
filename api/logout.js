// POST /api/logout
const { rota } = require('./_lib/http');
const { fecharSessao } = require('./_lib/auth');

module.exports = rota({ POST: async (req, res) => { fecharSessao(req, res); return { ok: true }; } });
