// /api/relatorios
//   GET ?id=                               -> { html, nome }
//   POST { conferencia_id, html, nome }    -> guarda o relatório final de uma conferência aprovada (uma vez)
const crypto = require('crypto');
const { rota, corpo, query, Erro } = require('./_lib/http');
const { um, tx } = require('./_lib/db');
const { usuario } = require('./_lib/auth');
const { json } = require('./_lib/conf');

module.exports = rota({
  GET: async (req) => {
    await usuario(req);
    const r = await um('SELECT html, nome_arquivo FROM relatorios WHERE id = ?', [String(query(req).id || '')]);
    if (!r) throw new Erro(404, 'Relatório não encontrado.');
    return { html: r.html, nome: r.nome_arquivo };
  },
  POST: async (req) => {
    const u = await usuario(req, ['aprovadora']);
    const b = await corpo(req);
    const html = String(b.html || '');
    if (!html.startsWith('<!doctype html>') && !html.startsWith('<!DOCTYPE html>')) throw new Erro(400, 'Relatório inválido.');
    if (html.length > 3.5 * 1024 * 1024) throw new Erro(413, 'Relatório grande demais.');
    const nome = String(b.nome || 'relatorio.html').replace(/[^\w.\-]/g, '_').slice(0, 200);
    const id = crypto.randomUUID();
    await tx(async (t) => {
      const c = await t.um('SELECT id, status, fluxo FROM conferencias WHERE id = ? FOR UPDATE', [String(b.conferencia_id || '')]);
      if (!c) throw new Erro(404, 'Conferência não encontrada.');
      if (c.status !== 'aprovado') throw new Erro(409, 'O relatório final só é guardado depois da aprovação.');
      const ap = json(c.fluxo, {}).aprovacao || {};
      if (u.papel !== 'admin' && ap.usuario_id !== u.id) throw new Erro(403, 'Só quem aprovou guarda o relatório final.');
      if (await t.um('SELECT id FROM relatorios WHERE conferencia_id = ? LIMIT 1', [c.id])) throw new Erro(409, 'O relatório final desta conferência já foi guardado.');
      await t.q('INSERT INTO relatorios (id, conferencia_id, nome_arquivo, html) VALUES (?, ?, ?, ?)', [id, c.id, nome, html]);
      await t.q("UPDATE historico SET relatorio_id = ?, arquivo = ? WHERE conferencia_id = ? AND status = 'Aprovado' AND relatorio_id IS NULL", [id, nome, c.id]);
    });
    return { id };
  },
});
