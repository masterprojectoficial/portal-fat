/* Frente 1 - Conferência da Integração (Lyceum x Integração Protheus x Razão). */
(function (root) {
  const FAT = (root.FAT = root.FAT || {});
  const { norm } = FAT.parse;

  const STATUS = {
    contabilizado: 'Contabilizado',
    justificado: 'Justificado (regra)',
    nao_integrado: 'Não integrou',
    nao_contabilizado: 'Integrou, não está no razão',
    erro: 'Erro na integração',
  };
  const PENDENTES = new Set(['nao_integrado', 'nao_contabilizado', 'erro']);

  // Chave do razão: valor + histórico (o Protheus guarda até 40 caracteres de histórico).
  function chave(valor, historico) {
    return valor.toFixed(2) + '|' + norm(historico).slice(0, 40);
  }

  function condicaoAtende(cond, raw) {
    if (!cond) return true;
    const v = norm(raw ? raw[norm(cond.campo)] : '');
    const vals = (cond.valores || []).map(norm);
    if (cond.operador === 'vazio_ou_em') return !v || vals.includes(v);
    if (cond.operador === 'igual') return v === vals[0];
    return vals.includes(v);
  }

  function run({ integracao, mov, razao, rotina, config }) {
    const tipoMap = new Map(config.tiposOperacao.map((t) => [String(t.codigo), t]));
    const regraMap = new Map();
    config.regras.forEach((r) => { if (!regraMap.has(String(r.tipo))) regraMap.set(String(r.tipo), []); regraMap.get(String(r.tipo)).push(r); });

    // Pré-análise: operações do Lyceum cujo tipo não tem regra contábil cadastrada.
    const semRegraMap = new Map();
    for (const op of mov) {
      if (tipoMap.has(op.tipoOp)) continue;
      const k = op.tipoOp;
      const g = semRegraMap.get(k) || { tipoOp: k, nome: op.nomeTipoOp, qtd: 0, valor: 0 };
      g.qtd++; g.valor += op.valor;
      semRegraMap.set(k, g);
    }

    const intByOp = new Map();
    for (const it of integracao) {
      const a = intByOp.get(it.idOp);
      if (a) a.push(it); else intByOp.set(it.idOp, [it]);
    }
    const razaoKeys = new Set();
    for (const rz of razao) razaoKeys.add(chave(rz.valor, rz.historico));

    const escopo = mov.filter((op) => tipoMap.has(op.tipoOp) && tipoMap.get(op.tipoOp).tipo === rotina);
    const naoContabiliza = mov.filter((op) => tipoMap.has(op.tipoOp) && norm(tipoMap.get(op.tipoOp).tipo) === 'NAO CONTABILIZA').length;
    const idsMov = new Set(mov.map((o) => o.idOp));

    const linhas = [];
    for (const op of escopo) {
      const ints = intByOp.get(op.idOp);
      let status, regra = null, intRef = null;
      if (ints) {
        intRef = ints[0];
        const comErro = ints.find((i) => (i.status && norm(i.status) !== 'REGISTRO VALIDADO') || i.msgErro);
        if (comErro) { status = 'erro'; intRef = comErro; }
        else status = ints.every((i) => razaoKeys.has(chave(i.valor, i.historico))) ? 'contabilizado' : 'nao_contabilizado';
      } else {
        const regras = regraMap.get(op.tipoOp) || [];
        regra = regras.find((r) => condicaoAtende(r.condicao, op.raw)) || null;
        status = regra ? 'justificado' : 'nao_integrado';
      }
      const filial = config.unidadeFilial[op.unidade] || (intRef && intRef.filial) || 'SEM FILIAL';
      linhas.push({
        status, filial, dia: op.data, idOp: op.idOp, tipoOp: op.tipoOp, nomeTipoOp: op.nomeTipoOp,
        valor: op.valor, cobranca: op.cobranca, aluno: op.aluno, unidade: op.unidade,
        principCodLanc: op.raw ? op.raw['PRINCIP_COD_LANC'] || '' : '',
        historico: intRef ? intRef.historico : '', msgErro: intRef ? intRef.msgErro : '',
        regraAnalise: regra ? regra.analise : '', regraAcao: regra ? regra.acao : '',
      });
    }

    // Integrado no Protheus sem origem na movimentação do Lyceum (informativo).
    const semOrigem = integracao.filter((i) => norm(i.tipoContab) === norm(rotina) && !idsMov.has(i.idOp))
      .map((i) => ({ filial: i.filial, dia: i.data, idOp: i.idOp, tipoOp: i.tipoOp, descTipoOp: i.descTipoOp, valor: i.valor, historico: i.historico }));

    // Agregações
    const kpis = { total: linhas.length, valorTotal: 0, naoContabiliza, semOrigem: semOrigem.length, semRegra: semRegraMap.size };
    Object.keys(STATUS).forEach((s) => { kpis[s] = 0; kpis['valor_' + s] = 0; });
    const filiais = new Set(), dias = new Set(), cells = {};
    for (const l of linhas) {
      kpis[l.status]++; kpis['valor_' + l.status] += l.valor; kpis.valorTotal += l.valor;
      filiais.add(l.filial); dias.add(l.dia);
      const k = l.filial + '|' + l.dia;
      const c = cells[k] || (cells[k] = { total: 0, ok: 0, just: 0, pend: 0, valorPend: 0 });
      c.total++;
      if (l.status === 'contabilizado') c.ok++;
      else if (l.status === 'justificado') c.just++;
      else { c.pend++; c.valorPend += l.valor; }
    }
    kpis.pendentes = kpis.nao_integrado + kpis.nao_contabilizado + kpis.erro;
    kpis.valorPendente = kpis.valor_nao_integrado + kpis.valor_nao_contabilizado + kpis.valor_erro;

    const pendencias = linhas.filter((l) => PENDENTES.has(l.status));
    const justificados = linhas.filter((l) => l.status === 'justificado');

    // RN03: reprocessar só os dias/unidades com pendência, nunca o período inteiro.
    const repMap = new Map();
    for (const p of pendencias) {
      const k = p.filial + '|' + p.dia;
      const r = repMap.get(k) || { filial: p.filial, dia: p.dia, qtd: 0, valor: 0, motivos: new Set() };
      r.qtd++; r.valor += p.valor; r.motivos.add(STATUS[p.status]);
      repMap.set(k, r);
    }
    const reprocessar = [...repMap.values()].map((r) => ({ ...r, motivos: [...r.motivos].join(', ') }))
      .sort((a, b) => a.filial.localeCompare(b.filial) || a.dia.localeCompare(b.dia));

    // Pendências agrupadas por tipo de operação
    const porTipoMap = new Map();
    for (const p of pendencias) {
      const k = p.status + '|' + p.tipoOp;
      const g = porTipoMap.get(k) || { status: p.status, tipoOp: p.tipoOp, nome: p.nomeTipoOp, qtd: 0, valor: 0 };
      g.qtd++; g.valor += p.valor;
      porTipoMap.set(k, g);
    }

    return {
      rotina, kpis,
      matriz: { filiais: [...filiais].sort(), dias: [...dias].sort(), cells },
      pendencias, justificados, semOrigem, reprocessar,
      porTipo: [...porTipoMap.values()].sort((a, b) => b.qtd - a.qtd),
      semRegra: [...semRegraMap.values()].sort((a, b) => b.qtd - a.qtd),
      contagens: { integracao: integracao.length, mov: mov.length, razao: razao.length },
    };
  }

  FAT.conferencia = { run, STATUS, PENDENTES, chave, condicaoAtende };
})(typeof window !== 'undefined' ? window : globalThis);
