// POST /api/login  { email, senha }
const { rota, corpo, Erro } = require('./_lib/http');
const { um, q } = require('./_lib/db');
const { abrirSessao, confereSenha } = require('./_lib/auth');

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = rota({
  POST: async (req, res) => {
    const b = await corpo(req);
    const email = String(b.email || '').trim().toLowerCase();
    const senha = String(b.senha || '');
    if (!email || !senha) throw new Erro(400, 'Informe e-mail e senha.');
    const u = await um('SELECT id, nome, papel, senha_hash, ativo, trocar_senha, falhas, sessao_versao, (bloqueado_ate IS NOT NULL AND bloqueado_ate > UTC_TIMESTAMP()) AS bloqueado FROM usuarios WHERE email = ?', [email]);
    if (u && u.bloqueado) throw new Erro(429, 'Muitas tentativas erradas. Tente de novo em 15 minutos.');
    const ok = confereSenha(senha, u ? u.senha_hash : '');
    if (!u || !u.ativo || !ok) {
      if (u) {
        const falhas = u.falhas + 1;
        if (falhas >= 5) await q('UPDATE usuarios SET falhas = 0, bloqueado_ate = UTC_TIMESTAMP() + INTERVAL 15 MINUTE WHERE id = ?', [u.id]);
        else await q('UPDATE usuarios SET falhas = ? WHERE id = ?', [falhas, u.id]);
      }
      await espera(400);
      throw new Erro(401, 'E-mail ou senha incorretos.');
    }
    await q('UPDATE usuarios SET falhas = 0, bloqueado_ate = NULL, ultimo_acesso = UTC_TIMESTAMP() WHERE id = ?', [u.id]);
    abrirSessao(req, res, u);
    return { ok: true, trocar_senha: !!u.trocar_senha };
  },
});
