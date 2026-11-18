// Regras da conferência no servidor: itens que precisam de aval, texto do resultado e leitura das linhas.
const { dataHoraBR } = require('./http');

const NOME_FRENTE = { f1: 'Conferência da Integração', f2: 'Resumo de Tópicos' };
const int = (n) => Number(n || 0).toLocaleString('pt-BR');
const dataBR = (iso) => (iso ? String(iso).slice(0, 10).split('-').reverse().join('/') : '');
const json = (s, padrao) => { if (s == null || s === '') return padrao; try { return JSON.parse(s); } catch (e) { return padrao; } };

// Mesma lista de itens que a tela usa (js/app.js > itensAval): a aprovação só passa com todos "de acordo".
function itensAval(frente, res) {
  if (!res) return [];
  if (frente === 'f1') {
    const just = new Map();
    (res.justificados || []).forEach((j) => { const g = just.get(j.tipoOp) || { tipo: j.tipoOp, nome: j.nomeTipoOp, qtd: 0 }; g.qtd++; just.set(j.tipoOp, g); });
    return [
      ...(res.pendencias || []).map((x) => ({ key: 'p:' + x.idOp, label: `Pendência ${x.idOp} · tipo ${x.tipoOp} · ${x.filial} ${dataBR(x.dia)}` })),
      ...[...just.values()].map((g) => ({ key: 'j:' + g.tipo, label: `Justificadas tipo ${g.tipo} · ${g.nome} (${g.qtd})` })),
    ];
  }
  return (res.consolidado || []).map((u) => ({ key: 'u:' + u.unidade, label: 'Unidade ' + u.unidade }));
}

function contagemAval(frente, res, aval) {
  const c = { total: 0, sim: 0, nao: 0, sem: 0, desacordos: [] };
  itensAval(frente, res).forEach((i) => {
    c.total++;
    const a = (aval || {})[i.key] || {};
    if (a.ok === 'sim') c.sim++;
    else if (a.ok === 'nao') { c.nao++; c.desacordos.push({ ...i, obs: a.obs || '' }); } else c.sem++;
  });
  return c;
}

function resultadoTexto(frente, res, decisoes) {
  if (frente === 'f1') {
    const k = res.kpis || {}, dec = Object.values(decisoes || {}).filter((d) => d && d.decisao).length;
    return `${int(k.total)} operações · ${int(k.contabilizado)} contabilizadas · ${int(k.justificado)} justificadas · ${int(k.pendentes)} pendentes (${int(dec)} com decisão)`;
  }
  const difs = (res.unidades || []).filter((u) => Math.abs(u.check.difFaturamento) > 0.05 || u.check.difAlunos !== 0).length;
  return `${(res.unidades || []).length} unidades · ${int((res.totalGeral || {}).qtd)} alunos · check ${difs ? difs + ' com diferença' : 'fechado'}`;
}

// Linha do banco para o formato que a tela usa.
function paraTela(r) {
  if (!r) return null;
  const fluxo = json(r.fluxo, { tramite: [] });
  fluxo.status = r.status;
  return {
    id: r.id, frente: r.frente, rotina: r.rotina, competencia: r.competencia, status: r.status, versao: r.versao,
    resultado: json(r.resultado, null), arquivos: json(r.arquivos, {}), decisoes: json(r.decisoes, {}), aval: json(r.aval, {}), fluxo,
    aprovador_previsto: r.aprovador_previsto, criado_por: r.criado_por_nome || '', criado_em: dataHoraBR(r.criado_em), atualizado_em: dataHoraBR(r.atualizado_em),
  };
}

const SELECT_CONF = `SELECT c.*, u.nome AS criado_por_nome FROM conferencias c LEFT JOIN usuarios u ON u.id = c.criado_por`;

module.exports = { NOME_FRENTE, itensAval, contagemAval, resultadoTexto, paraTela, json, SELECT_CONF };
