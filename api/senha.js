// POST /api/senha  { atual, nova }  -> troca a própria senha e renova a sessão
const { rota, corpo, Erro } = require('./_lib/http');
const { um, q } = require('./_lib/db');
const { usuario, confereSenha, hashSenha, validaNovaSenha, abrirSessao } = require('./_lib/auth');

module.exports = rota({
  POST: async (req, res) => {
    const u = await usuario(req, null, { permitirTroca: true });
    const b = await corpo(req);
    const atual = await um('SELECT senha_hash FROM usuarios WHERE id = ?', [u.id]);
    if (!confereSenha(String(b.atual || ''), atual.senha_hash)) throw new Erro(400, 'A senha atual não confere.');
    validaNovaSenha(b.nova);
    if (b.nova === b.atual) throw new Erro(400, 'A nova senha precisa ser diferente da atual.');
    await q('UPDATE usuarios SET senha_hash = ?, trocar_senha = 0, sessao_versao = sessao_versao + 1 WHERE id = ?', [hashSenha(b.nova), u.id]);
    abrirSessao(req, res, { id: u.id, sessao_versao: u.sessao_versao + 1 });
    return { ok: true };
  },
});
