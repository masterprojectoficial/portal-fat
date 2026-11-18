// /api/usuarios (só admin)
//   GET                                   -> lista
//   POST  { nome, email, papel }          -> cria com senha temporária (mostrada uma vez)
//   PATCH ?id=  { nome?, papel?, ativo?, novaSenha? }
const crypto = require('crypto');
const { rota, corpo, query, Erro, dataHoraBR } = require('./_lib/http');
const { q, um } = require('./_lib/db');
const { usuario, hashSenha, senhaTemporaria, PAPEIS } = require('./_lib/auth');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = rota({
  GET: async (req) => {
    await usuario(req, ['admin']);
    const rows = await q('SELECT id, nome, email, papel, ativo, trocar_senha, ultimo_acesso, criado_em FROM usuarios ORDER BY ativo DESC, nome');
    return rows.map((r) => ({ ...r, ativo: !!r.ativo, trocar_senha: !!r.trocar_senha, ultimo_acesso: dataHoraBR(r.ultimo_acesso), criado_em: dataHoraBR(r.criado_em) }));
  },
  POST: async (req) => {
    await usuario(req, ['admin']);
    const b = await corpo(req);
    const nome = String(b.nome || '').trim(), email = String(b.email || '').trim().toLowerCase(), papel = String(b.papel || '');
    if (!nome || nome.length > 120) throw new Erro(400, 'Informe o nome.');
    if (!EMAIL.test(email) || email.length > 190) throw new Erro(400, 'E-mail inválido.');
    if (!PAPEIS.includes(papel)) throw new Erro(400, 'Perfil inválido.');
    if (await um('SELECT id FROM usuarios WHERE email = ?', [email])) throw new Erro(409, 'Já existe usuário com esse e-mail.');
    const senha = senhaTemporaria();
    await q('INSERT INTO usuarios (id, nome, email, papel, senha_hash, trocar_senha) VALUES (?, ?, ?, ?, ?, 1)', [crypto.randomUUID(), nome, email, papel, hashSenha(senha)]);
    return { ok: true, email, senhaTemporaria: senha };
  },
  PATCH: async (req) => {
    const eu = await usuario(req, ['admin']);
    const id = String(query(req).id || '');
    const b = await corpo(req);
    const alvo = await um('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (!alvo) throw new Erro(404, 'Usuário não encontrado.');
    const sets = [], vals = [];
    let senha = null;
    if (b.nome !== undefined) { const n = String(b.nome).trim(); if (!n) throw new Erro(400, 'Informe o nome.'); sets.push('nome = ?'); vals.push(n); }
    if (b.papel !== undefined) {
      if (!PAPEIS.includes(b.papel)) throw new Erro(400, 'Perfil inválido.');
      if (id === eu.id && b.papel !== 'admin') throw new Erro(400, 'Você não pode tirar o seu próprio perfil de administradora.');
      sets.push('papel = ?'); vals.push(b.papel);
      sets.push('sessao_versao = sessao_versao + 1');
    }
    if (b.ativo !== undefined) {
      if (id === eu.id && !b.ativo) throw new Erro(400, 'Você não pode desativar o seu próprio acesso.');
      sets.push('ativo = ?'); vals.push(b.ativo ? 1 : 0);
      sets.push('sessao_versao = sessao_versao + 1');
    }
    if (b.novaSenha) {
      senha = senhaTemporaria();
      sets.push('senha_hash = ?'); vals.push(hashSenha(senha));
      sets.push('trocar_senha = 1', 'falhas = 0', 'bloqueado_ate = NULL', 'sessao_versao = sessao_versao + 1');
    }
    if (!sets.length) throw new Erro(400, 'Nada para alterar.');
    await q(`UPDATE usuarios SET ${[...new Set(sets)].join(', ')} WHERE id = ?`, [...vals, id]);
    return { ok: true, senhaTemporaria: senha };
  },
});
