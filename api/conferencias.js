// /api/conferencias
//   GET ?atual=1          -> { f1, f2 } conferência atual de cada frente
//   GET ?id=              -> uma conferência
//   POST { frente, rotina, competencia, resultado, arquivos }  (executora) -> nova conferência em conferência
//   PATCH ?id= { decisoes?, aval? }  -> grava só as chaves enviadas (valor null apaga)
const crypto = require('crypto');
const { rota, corpo, query, Erro } = require('./_lib/http');
const { q, um, tx } = require('./_lib/db');
const { usuario, pode } = require('./_lib/auth');
const { paraTela, json, SELECT_CONF, itensAval, exigeAprovadorDiferente } = require('./_lib/conf');

const FRENTES = ['f1', 'f2'];
const LIMITE = 3.5 * 1024 * 1024;

async function atual(frente) {
  return paraTela(await um(`${SELECT_CONF} WHERE c.frente = ? AND c.status <> 'descartada' ORDER BY c.criado_em DESC, c.seq DESC LIMIT 1`, [frente]));
}

function mesclar(base, delta, validar) {
  Object.entries(delta || {}).forEach(([k, v]) => {
    if (typeof k !== 'string' || k.length > 200) throw new Erro(400, 'Chave inválida.');
    if (v === null) delete base[k];
    else base[k] = validar(v);
  });
  return base;
}
const texto = (s, max) => String(s == null ? '' : s).slice(0, max);
const DECISOES = ['', 'Reprocessar', 'Justificar', 'Criar regra', 'Abrir chamado'];

module.exports = rota({
  GET: async (req) => {
    await usuario(req);
    const qs = query(req);
    if (qs.id) {
      const c = paraTela(await um(`${SELECT_CONF} WHERE c.id = ?`, [String(qs.id)]));
      if (!c) throw new Erro(404, 'Conferência não encontrada.');
      return c;
    }
    return { f1: await atual('f1'), f2: await atual('f2') };
  },

  POST: async (req) => {
    const u = await usuario(req, ['executora']);
    const b = await corpo(req);
    if (!FRENTES.includes(b.frente)) throw new Erro(400, 'Frente inválida.');
    if (!/^\d{4}-\d{2}$/.test(String(b.competencia || ''))) throw new Erro(400, 'Competência inválida.');
    const rotina = b.frente === 'f1' ? (b.rotina === 'Baixa' ? 'Baixa' : 'Faturamento') : null;
    if (!b.resultado || typeof b.resultado !== 'object') throw new Erro(400, 'Resultado da conferência ausente.');
    const resultado = JSON.stringify(b.resultado);
    if (resultado.length > LIMITE) throw new Erro(413, 'O resultado ficou grande demais para gravar. Fale com a Master Project.');
    const arquivos = JSON.stringify(b.arquivos || {});
    const id = crypto.randomUUID();

    await tx(async (t) => {
      const aberta = await t.um("SELECT id, status FROM conferencias WHERE frente = ? AND status = 'em_aprovacao' LIMIT 1 FOR UPDATE", [b.frente]);
      if (aberta) throw new Erro(409, 'Esta frente está com a aprovadora. Espere a aprovação ou a devolução antes de processar de novo.');
      // Se havia uma devolução da mesma competência, a nova conferência herda o trâmite e o aval (do que ainda existe).
      const dev = await t.um("SELECT * FROM conferencias WHERE frente = ? AND status = 'devolvido' AND competencia = ? AND (rotina <=> ?) ORDER BY criado_em DESC LIMIT 1 FOR UPDATE", [b.frente, b.competencia, rotina]);
      let fluxo = { envio: null, aprovacao: null, devolucao: null, tramite: [] }, status = 'rascunho', aval = {}, decisoes = {}, aprovador = null;
      if (dev) {
        fluxo = json(dev.fluxo, fluxo);
        fluxo.tramite = (fluxo.tramite || []).concat([{ acao: 'Reprocessado com novos arquivos', por: u.nome, em: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) }]);
        status = 'devolvido';
        const chaves = new Set(itensAval(b.frente, b.resultado).map((i) => i.key));
        Object.entries(json(dev.aval, {})).forEach(([k, v]) => { if (chaves.has(k)) aval[k] = v; });
        const ids = new Set((b.resultado.pendencias || []).map((p) => p.idOp));
        Object.entries(json(dev.decisoes, {})).forEach(([k, v]) => { if (ids.has(k)) decisoes[k] = v; });
        aprovador = dev.aprovador_previsto;
      }
      await t.q("UPDATE conferencias SET status = 'descartada' WHERE frente = ? AND status IN ('rascunho', 'devolvido')", [b.frente]);
      await t.q('INSERT INTO conferencias (id, frente, rotina, competencia, status, resultado, arquivos, decisoes, aval, fluxo, aprovador_previsto, criado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, b.frente, rotina, b.competencia, status, resultado, arquivos, JSON.stringify(decisoes), JSON.stringify(aval), JSON.stringify(fluxo), aprovador, u.id]);
    });
    return paraTela(await um(`${SELECT_CONF} WHERE c.id = ?`, [id]));
  },

  PATCH: async (req) => {
    const u = await usuario(req);
    const id = String(query(req).id || '');
    const b = await corpo(req);
    return tx(async (t) => {
      const c = await t.um('SELECT id, status, decisoes, aval, fluxo FROM conferencias WHERE id = ? FOR UPDATE', [id]);
      if (!c) throw new Erro(404, 'Conferência não encontrada.');
      const sets = [], vals = [];
      if (b.decisoes) {
        if (!pode(u, 'executora')) throw new Erro(403, 'Seu perfil não registra decisões.');
        if (!['rascunho', 'devolvido'].includes(c.status)) throw new Erro(409, 'As decisões ficam travadas enquanto a conferência está com a aprovadora ou depois de aprovada.');
        const d = mesclar(json(c.decisoes, {}), b.decisoes, (v) => {
          const dec = texto(v.decisao, 40);
          if (!DECISOES.includes(dec)) throw new Erro(400, 'Decisão inválida.');
          return { decisao: dec, obs: texto(v.obs, 1000) };
        });
        sets.push('decisoes = ?'); vals.push(JSON.stringify(d));
      }
      if (b.aval) {
        if (!pode(u, 'aprovadora')) throw new Erro(403, 'Seu perfil não dá aval.');
        if (c.status !== 'em_aprovacao') throw new Erro(409, 'O aval só pode ser dado enquanto a conferência está em aprovação.');
        const env = (json(c.fluxo, {}).envio || {});
        if (u.papel !== 'admin' && env.usuario_id === u.id && (await exigeAprovadorDiferente(t))) throw new Erro(403, 'Pelos parâmetros, quem enviou a conferência não pode dar o aval nela.');
        const a = mesclar(json(c.aval, {}), b.aval, (v) => {
          const ok = texto(v.ok, 3);
          if (!['', 'sim', 'nao'].includes(ok)) throw new Erro(400, 'Aval inválido.');
          return { ok, obs: texto(v.obs, 1000) };
        });
        sets.push('aval = ?'); vals.push(JSON.stringify(a));
      }
      if (!sets.length) throw new Erro(400, 'Nada para gravar.');
      await t.q(`UPDATE conferencias SET ${sets.join(', ')}, versao = versao + 1 WHERE id = ?`, [...vals, id]);
      return { ok: true };
    });
  },
});
