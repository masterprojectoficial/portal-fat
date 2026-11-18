/* Exportação dos resultados em Excel. */
(function (root) {
  const FAT = (root.FAT = root.FAT || {});

  function sheet(rows, cols) {
    const XLSX = root.XLSX;
    const aoa = [cols.map((c) => c.titulo)];
    rows.forEach((r) => aoa.push(cols.map((c) => (typeof c.v === 'function' ? c.v(r) : r[c.v]))));
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = cols.map((c) => ({ wch: c.largura || Math.max(12, c.titulo.length + 2) }));
    return ws;
  }

  function aoaSheet(aoa, larguras) {
    const ws = root.XLSX.utils.aoa_to_sheet(aoa);
    if (larguras) ws['!cols'] = larguras.map((w) => ({ wch: w }));
    return ws;
  }

  // Aba com o aval da aprovadora, item a item
  function abaAval(wb, meta) {
    const itens = meta.avalItens || [];
    if (!itens.length) return;
    const av = meta.aval || {};
    root.XLSX.utils.book_append_sheet(wb, sheet(itens, [
      { titulo: 'Item', v: 'label', largura: 60 },
      { titulo: 'Aval da aprovadora', v: (i) => ({ sim: 'De acordo', nao: 'Não de acordo' })[(av[i.key] || {}).ok] || 'Sem aval', largura: 20 },
      { titulo: 'Observação da aprovadora', v: (i) => (av[i.key] || {}).obs || '', largura: 50 },
    ]), 'Aval da aprovação');
  }

  const dataBR = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso || '');

  function conferencia(res, meta, decisoes) {
    const XLSX = root.XLSX;
    const wb = XLSX.utils.book_new();
    const k = res.kpis;
    XLSX.utils.book_append_sheet(wb, aoaSheet([
      ['Conferência da Integração - ' + res.rotina], [],
      ['Competência', meta.competencia], ['Validado por', meta.validadoPor || '(não validado)'], ['Validado em', meta.validadoEm || ''], ['Observação', meta.observacao || ''], [],
      ['Operações no escopo (Lyceum)', k.total, k.valorTotal],
      ['Contabilizadas', k.contabilizado, k.valor_contabilizado],
      ['Justificadas por regra', k.justificado, k.valor_justificado],
      ['Não integraram', k.nao_integrado, k.valor_nao_integrado],
      ['Integraram, não estão no razão', k.nao_contabilizado, k.valor_nao_contabilizado],
      ['Erro na integração', k.erro, k.valor_erro],
      ['Total pendente', k.pendentes, k.valorPendente],
      ['Integrado sem origem no Lyceum', k.semOrigem], ['Tipos sem regra (pré-análise)', k.semRegra], ['Excluídas (não contabiliza)', k.naoContabiliza],
    ], [38, 18, 18]), 'Resumo');

    const S = FAT.conferencia.STATUS;
    const dec = (p) => (decisoes && decisoes[p.idOp]) || {};
    XLSX.utils.book_append_sheet(wb, sheet(res.pendencias, [
      { titulo: 'Situação', v: (p) => S[p.status], largura: 28 }, { titulo: 'Filial', v: 'filial' }, { titulo: 'Dia', v: (p) => dataBR(p.dia) },
      { titulo: 'ID Operação Lyceum', v: 'idOp', largura: 18 }, { titulo: 'Tipo', v: 'tipoOp' }, { titulo: 'Tipo de operação', v: 'nomeTipoOp', largura: 36 },
      { titulo: 'Cobrança', v: 'cobranca' }, { titulo: 'Aluno', v: 'aluno' }, { titulo: 'PRINCIP_COD_LANC', v: 'principCodLanc', largura: 18 },
      { titulo: 'Valor', v: 'valor' }, { titulo: 'Histórico integração', v: 'historico', largura: 40 }, { titulo: 'Msg erro', v: 'msgErro', largura: 30 },
      { titulo: 'Decisão', v: (p) => dec(p).decisao || '', largura: 18 }, { titulo: 'Observação', v: (p) => dec(p).obs || '', largura: 40 },
    ]), 'Pendências');
    XLSX.utils.book_append_sheet(wb, sheet(res.reprocessar, [
      { titulo: 'Filial', v: 'filial' }, { titulo: 'Dia', v: (r) => dataBR(r.dia) }, { titulo: 'Qtd', v: 'qtd' }, { titulo: 'Valor', v: 'valor' }, { titulo: 'Motivos', v: 'motivos', largura: 50 },
    ]), 'Reprocessar');
    XLSX.utils.book_append_sheet(wb, sheet(res.justificados, [
      { titulo: 'Filial', v: 'filial' }, { titulo: 'Dia', v: (p) => dataBR(p.dia) }, { titulo: 'ID Operação Lyceum', v: 'idOp', largura: 18 },
      { titulo: 'Tipo', v: 'tipoOp' }, { titulo: 'Tipo de operação', v: 'nomeTipoOp', largura: 36 }, { titulo: 'Valor', v: 'valor' },
      { titulo: 'Análise (regra)', v: 'regraAnalise', largura: 60 }, { titulo: 'Ação', v: 'regraAcao', largura: 30 },
    ]), 'Justificadas');
    const m = res.matriz;
    const aoa = [['Filial', ...m.dias.map(dataBR)]];
    m.filiais.forEach((f) => aoa.push([f, ...m.dias.map((d) => { const c = m.cells[f + '|' + d]; return c ? (c.pend ? `${c.pend} pend.` : 'OK') : ''; })]));
    XLSX.utils.book_append_sheet(wb, aoaSheet(aoa), 'Filial x dia');
    if (res.semRegra.length) XLSX.utils.book_append_sheet(wb, sheet(res.semRegra, [{ titulo: 'Tipo', v: 'tipoOp' }, { titulo: 'Nome', v: 'nome', largura: 40 }, { titulo: 'Qtd', v: 'qtd' }, { titulo: 'Valor', v: 'valor' }]), 'Pré-análise');
    if (res.semOrigem.length) XLSX.utils.book_append_sheet(wb, sheet(res.semOrigem, [{ titulo: 'Filial', v: 'filial' }, { titulo: 'Dia', v: (r) => dataBR(r.dia) }, { titulo: 'ID Operação', v: 'idOp' }, { titulo: 'Tipo', v: 'tipoOp' }, { titulo: 'Descrição', v: 'descTipoOp', largura: 36 }, { titulo: 'Valor', v: 'valor' }, { titulo: 'Histórico', v: 'historico', largura: 40 }]), 'Sem origem Lyceum');
    abaAval(wb, meta);
    XLSX.writeFile(wb, `Conferencia_${res.rotina}_${meta.competencia}.xlsx`);
  }

  function reprocessamento(res, meta) {
    const XLSX = root.XLSX;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet(res.reprocessar, [
      { titulo: 'Filial', v: 'filial' }, { titulo: 'Dia', v: (r) => dataBR(r.dia) }, { titulo: 'Qtd pendências', v: 'qtd' }, { titulo: 'Valor', v: 'valor' }, { titulo: 'Motivos', v: 'motivos', largura: 50 },
    ]), 'Reprocessar');
    XLSX.writeFile(wb, `Reprocessar_${res.rotina}_${meta.competencia}.xlsx`);
  }

  function resumo(res, meta) {
    const XLSX = root.XLSX;
    const wb = XLSX.utils.book_new();
    const tp = res.topicos;
    const cab = ['Unidade', 'Qtd alunos', 'Ticket médio', 'Ticket médio líquido', ...tp];
    const linhas = [...res.consolidado, res.totalGeral].map((c) => [c.unidade, c.qtd, c.ticket, c.ticketLiquido, ...tp.map((t) => c[t])]);
    XLSX.utils.book_append_sheet(wb, aoaSheet([['Resumo de Tópicos - ' + meta.competencia], ['Validado por', meta.validadoPor || '(não validado)', 'em', meta.validadoEm || ''], [], cab, ...linhas], [22, 12, 14, 16, ...tp.map(() => 16)]), 'Consolidado');
    XLSX.utils.book_append_sheet(wb, sheet(res.unidades, [
      { titulo: 'Unidade', v: 'unidade', largura: 22 }, { titulo: 'Faturamento resumo', v: (u) => u.check.faturamentoResumo, largura: 18 },
      { titulo: 'Faturamento razão', v: (u) => u.check.faturamentoRazao, largura: 18 }, { titulo: 'Diferença', v: (u) => u.check.difFaturamento },
      { titulo: 'Alunos resumo', v: (u) => u.check.alunosResumo }, { titulo: 'Alunos BI', v: (u) => u.check.alunosBI }, { titulo: 'Diferença alunos', v: (u) => u.check.difAlunos },
    ]), 'Check');
    res.unidades.forEach((u) => {
      const aoa = [[u.unidade, u.razaoSocial], ['% ISS', u.iss, '% PDD', u.pdd], []];
      FAT.resumo.TIPOS_ALUNO.forEach((t) => {
        aoa.push([t], ['Semestre', 'Qtd alunos', 'Ticket médio', ...tp, 'Ticket médio líquido']);
        u.blocos[t].forEach((l) => aoa.push([l.serie, l.qtd, l.ticket, ...tp.map((k) => l.valores[k]), l.ticketLiquido]));
        const tb = u.totalBloco[t];
        aoa.push(['Total ' + t, tb.qtd, tb.ticket, ...tp.map((k) => tb.valores[k]), tb.ticketLiquido], []);
      });
      aoa.push(['Total unidade', u.total.qtd, u.total.ticket, ...tp.map((k) => u.total.valores[k]), u.total.ticketLiquido], []);
      const rs = u.resumoSemestre;
      aoa.push(['Resumo por semestre'], ['Semestre', 'Total alunos', 'Ticket bruto', 'Receita bruta', 'Ticket líquido', 'Receita líquida']);
      rs.linhas.forEach((l) => aoa.push([l.serie, l.qtd, l.ticketBruto, l.receitaBruta, l.ticketLiquido, l.receitaLiquida]));
      aoa.push(['Total', rs.total.qtd, rs.total.ticketBruto, rs.total.receitaBruta, rs.total.ticketLiquido, rs.total.receitaLiquida]);
      aoa.push(['Conferência', rs.dif.alunos, '', rs.dif.receitaBruta, '', rs.dif.receitaLiquida]);
      XLSX.utils.book_append_sheet(wb, aoaSheet(aoa, [16, 12, 14, ...tp.map(() => 16)]), u.unidade.slice(0, 31));
    });
    const ex = res.excecoes;
    if (ex.semAluno.length) XLSX.utils.book_append_sheet(wb, sheet(ex.semAluno, [{ titulo: 'Unidade', v: 'unidade' }, { titulo: 'Conta', v: 'conta' }, { titulo: 'Tópico', v: 'topico', largura: 26 }, { titulo: 'RA', v: 'ra' }, { titulo: 'Data', v: (r) => dataBR(r.data) }, { titulo: 'Histórico', v: 'historico', largura: 40 }, { titulo: 'Movimento', v: 'movimento' }]), 'Sem aluno');
    if (ex.foraUnidade.length) XLSX.utils.book_append_sheet(wb, sheet(ex.foraUnidade, [{ titulo: 'Filial', v: 'filial' }, { titulo: 'C. Custo', v: 'cc' }, { titulo: 'Conta', v: 'conta' }, { titulo: 'Tópico', v: 'topico', largura: 26 }, { titulo: 'RA', v: 'ra' }, { titulo: 'Data', v: (r) => dataBR(r.data) }, { titulo: 'Histórico', v: 'historico', largura: 40 }, { titulo: 'Movimento', v: 'movimento' }]), 'Fora das unidades');
    if (ex.contasSemTopico.length) XLSX.utils.book_append_sheet(wb, sheet(ex.contasSemTopico, [{ titulo: 'Conta', v: 'conta', largura: 16 }, { titulo: 'Lançamentos', v: 'qtd' }, { titulo: 'Movimento', v: 'movimento' }]), 'Contas sem tópico');
    abaAval(wb, meta);
    XLSX.writeFile(wb, `Resumo_de_Topicos_${meta.competencia}.xlsx`);
  }

  FAT.exportar = { conferencia, reprocessamento, resumo, dataBR };
})(typeof window !== 'undefined' ? window : globalThis);
