// GET /api/me  -> usuário logado e nomes das aprovadoras (para o envio)
const { rota } = require('./_lib/http');
const { q } = require('./_lib/db');
const { usuario } = require('./_lib/auth');

module.exports = rota({
  GET: async (req) => {
    const u = await usuario(req, null, { permitirTroca: true });
    const ap = await q("SELECT DISTINCT nome FROM usuarios WHERE ativo = 1 AND papel = 'aprovadora' ORDER BY nome");
    return { usuario: { id: u.id, nome: u.nome, email: u.email, papel: u.papel, trocar_senha: u.trocar_senha }, aprovadoras: ap.map((x) => x.nome) };
  },
});
