/* Frente 2 - Resumo de Tópicos (abertura de receita por unidade, tipo de aluno e semestre). */
(function (root) {
  const FAT = (root.FAT = root.FAT || {});
  const { norm } = FAT.parse;

  const TIPOS_ALUNO = ['PAGANTE', 'PROUNI', 'FIES'];
  const T = {
    FAT: 'FATURAMENTO POR SEMESTRE', PROV: 'PROV RECEITA', CF: 'CF', TXMAT: 'TX MATRÍCULA / VESTIBULAR',
    RECFIN: 'RECEITA FINANCEIRA', DESCINC: 'DESCONTO INCONDICIONAL', CANCEL: 'CANCELAMENTOS', IMPOSTOS: 'IMPOSTOS',
    DEDFIES: 'DEDUÇÃO FIES', PROUNI: 'BOLSA PROUNI', PDD: 'PDD', DESCPONT: 'DESCONTO PONTUALIDADE', DESCCOND: 'DESCONTO CONDICIONAL',
  };

  function tipoAluno(t) {
    const v = norm(t);
    if (v === 'IMES') return 'PAGANTE'; // regra do manual: IMES = pagante
    return TIPOS_ALUNO.includes(v) ? v : '';
  }

  function zero(topicos) { const o = {}; topicos.forEach((t) => (o[t] = 0)); return o; }

  function run({ razao, baseAlunos, alunosLyceum, config }) {
    const topicos = config.topicos;
    const ccMed = config.centroCustoMedicina;
    const contaTopico = config.contaTopico;
    const unidades = config.unidadesResumo;

    const alunoByRa = new Map();
    // Como o XLOOKUP da planilha: vale a primeira linha do RA na base de alunos.
    for (const a of baseAlunos) if (a.ra && !alunoByRa.has(a.ra)) alunoByRa.set(a.ra, { tipo: tipoAluno(a.tipoAluno), serie: a.serie });
    const fallbackByRa = new Map();
    for (const a of alunosLyceum || []) if (a.ra && !fallbackByRa.has(a.ra)) fallbackByRa.set(a.ra, { tipo: tipoAluno(a.tipoAluno), serie: a.serie });

    function unidadeDe(filial, cc) {
      return unidades.find((u) => u.filial === filial && (u.ccRegra === 'diferente' ? cc !== ccMed : cc === ccMed)) || null;
    }

    // acc[unidade][tipo][serie][topico]
    const acc = {};
    const razaoFat = {};
    const excecoes = { semAluno: [], foraUnidade: [], contasSemTopico: [] };
    const semTopico = new Map();
    unidades.forEach((u) => { acc[u.nome] = {}; TIPOS_ALUNO.forEach((t) => (acc[u.nome][t] = {})); razaoFat[u.nome] = 0; });

    for (const rz of razao) {
      const topico = contaTopico[rz.conta];
      if (!topico) {
        if (rz.conta.startsWith('3010101')) {
          const g = semTopico.get(rz.conta) || { conta: rz.conta, qtd: 0, movimento: 0 };
          g.qtd++; g.movimento += rz.movimento; semTopico.set(rz.conta, g);
        }
        continue;
      }
      const u = unidadeDe(rz.filial, rz.cc);
      if (!u) { excecoes.foraUnidade.push({ conta: rz.conta, topico, filial: rz.filial, cc: rz.cc, ra: rz.itemConta, data: rz.data, historico: rz.historico, movimento: rz.movimento }); continue; }
      if (topico === T.FAT) razaoFat[u.nome] += rz.movimento;
      const al = alunoByRa.get(rz.itemConta) || fallbackByRa.get(rz.itemConta);
      if (!al || !al.tipo) {
        excecoes.semAluno.push({ unidade: u.nome, conta: rz.conta, topico, ra: rz.itemConta, data: rz.data, historico: rz.historico, movimento: rz.movimento });
        continue;
      }
      const bloco = acc[u.nome][al.tipo];
      const s = al.serie || 0;
      bloco[s] = bloco[s] || zero(topicos);
      bloco[s][topico] += rz.movimento;
    }

    // Quantidade de alunos ativos (BI) por unidade x tipo x série
    const qtd = {};
    const alunosBI = {};
    unidades.forEach((u) => { qtd[u.nome] = { PAGANTE: {}, PROUNI: {}, FIES: {} }; alunosBI[u.nome] = 0; });
    const uByBI = new Map(unidades.map((u) => [norm(u.unidadeBI), u]));
    // Exportação direta do BI: curso de medicina fica na unidade do código; os demais vão para a variante
    // cadastrada com o mesmo código + sufixo (ex.: "IMEPAC -ARAGUARI EXMED", "ZARNS-PA ODON").
    const cursoMed = norm(config.cursoMedicina || 'Medicina');
    const unidadeBIde = (a) => {
      if (a.unidadeBI || !a.codigoUnidade) return a.unidadeBI;
      if (norm(a.curso) === cursoMed) return a.codigoUnidade;
      const cod = norm(a.codigoUnidade);
      const alt = unidades.find((u) => norm(u.unidadeBI) !== cod && norm(u.unidadeBI).startsWith(cod + ' '));
      return alt ? alt.unidadeBI : a.codigoUnidade;
    };
    for (const a of baseAlunos) {
      if (a.status !== 1) continue;
      const u = uByBI.get(norm(unidadeBIde(a)));
      const t = tipoAluno(a.tipoAluno);
      if (!u || !t) continue;
      qtd[u.nome][t][a.serie] = (qtd[u.nome][t][a.serie] || 0) + 1;
      alunosBI[u.nome]++;
    }

    const resultado = unidades.map((u) => {
      const series = new Set();
      TIPOS_ALUNO.forEach((t) => { Object.keys(acc[u.nome][t]).forEach((s) => series.add(+s)); Object.keys(qtd[u.nome][t]).forEach((s) => series.add(+s)); });
      const lista = [...series].sort((a, b) => a - b);

      const blocos = {};
      TIPOS_ALUNO.forEach((t) => {
        blocos[t] = lista.map((s) => {
          const v = { ...zero(topicos), ...(acc[u.nome][t][s] || {}) };
          const q = qtd[u.nome][t][s] || 0;
          // ISS não incide sobre ProUni (imunidade).
          v[T.IMPOSTOS] = t === 'PROUNI' ? 0 : -(v[T.FAT] + v[T.PROV] + v[T.CF] + v[T.TXMAT] + v[T.DESCINC] + v[T.CANCEL]) * u.iss;
          return { serie: s, qtd: q, valores: v };
        });
      });
      // PDD do semestre (soma dos 3 blocos), lançado no bloco Pagante.
      lista.forEach((s, i) => {
        let base = 0;
        TIPOS_ALUNO.forEach((t) => { const v = blocos[t][i].valores; base += v[T.FAT] + v[T.PROV] + v[T.CF] + v[T.TXMAT] + v[T.CANCEL]; });
        blocos.PAGANTE[i].valores[T.PDD] = base * -u.pdd;
      });
      TIPOS_ALUNO.forEach((t) => blocos[t].forEach((l) => {
        l.ticket = l.qtd ? l.valores[T.FAT] / l.qtd : 0;
        l.ticketLiquido = l.qtd ? topicos.reduce((a, k) => a + l.valores[k], 0) / l.qtd : 0;
      }));

      const totalBloco = {};
      TIPOS_ALUNO.forEach((t) => {
        const tv = zero(topicos); let tq = 0;
        blocos[t].forEach((l) => { tq += l.qtd; topicos.forEach((k) => (tv[k] += l.valores[k])); });
        totalBloco[t] = { qtd: tq, valores: tv, ticket: tq ? tv[T.FAT] / tq : 0, ticketLiquido: tq ? topicos.reduce((a, k) => a + tv[k], 0) / tq : 0 };
      });
      const tot = zero(topicos); let tq = 0;
      TIPOS_ALUNO.forEach((t) => { tq += totalBloco[t].qtd; topicos.forEach((k) => (tot[k] += totalBloco[t].valores[k])); });

      const somaTot = topicos.reduce((a, k) => a + tot[k], 0);
      const resumoSemestre = resumoSemestreDe({ series: lista, blocos, total: { qtd: tq, valores: tot } }, topicos);

      return {
        unidade: u.nome, filial: u.filial, unidadeBI: u.unidadeBI, razaoSocial: u.razaoSocial, iss: u.iss, pdd: u.pdd,
        series: lista, blocos, totalBloco,
        total: { qtd: tq, ticket: tq ? tot[T.FAT] / tq : 0, ticketLiquido: tq ? somaTot / tq : 0, valores: tot },
        resumoSemestre,
        check: {
          faturamentoResumo: tot[T.FAT], faturamentoRazao: razaoFat[u.nome], difFaturamento: tot[T.FAT] - razaoFat[u.nome],
          alunosResumo: tq, alunosBI: alunosBI[u.nome], difAlunos: tq - alunosBI[u.nome],
        },
      };
    });

    excecoes.contasSemTopico = [...semTopico.values()].sort((a, b) => b.qtd - a.qtd);
    const consolidado = resultado.map((r) => ({ unidade: r.unidade, qtd: r.total.qtd, ticket: r.total.ticket, ticketLiquido: r.total.ticketLiquido, ...r.total.valores }));
    const totalGeral = { unidade: 'TOTAL CONSOLIDADO', qtd: 0, ...zero(topicos) };
    consolidado.forEach((c) => { totalGeral.qtd += c.qtd; topicos.forEach((k) => (totalGeral[k] += c[k])); });
    totalGeral.ticket = totalGeral.qtd ? totalGeral[T.FAT] / totalGeral.qtd : 0;
    totalGeral.ticketLiquido = totalGeral.qtd ? topicos.reduce((a, k) => a + totalGeral[k], 0) / totalGeral.qtd : 0;

    return { topicos, unidades: resultado, consolidado, totalGeral, excecoes };
  }

  // Quadro "SEMESTRE / Total Alunos / Ticket Bruto / Receita Bruta / Ticket Líquido / Receita Líquida" das abas de unidade:
  // soma dos 3 blocos por semestre. Como na planilha, bloco sem aluno no semestre não entra (qtd x ticket = 0).
  function resumoSemestreDe(u, topicos) {
    const soma = (v) => topicos.reduce((a, k) => a + (v[k] || 0), 0);
    const linhas = u.series.map((s, i) => {
      let q = 0, bruta = 0, liq = 0;
      TIPOS_ALUNO.forEach((t) => { const l = u.blocos[t][i]; if (!l) return; q += l.qtd; if (l.qtd) { bruta += l.valores[T.FAT] || 0; liq += soma(l.valores); } });
      return { serie: s, qtd: q, receitaBruta: -bruta, ticketBruto: q ? -bruta / q : 0, receitaLiquida: -liq, ticketLiquido: q ? -liq / q : 0 };
    });
    const sq = linhas.reduce((a, l) => a + l.qtd, 0), sb = linhas.reduce((a, l) => a + l.receitaBruta, 0), sl = linhas.reduce((a, l) => a + l.receitaLiquida, 0);
    return {
      linhas,
      total: { qtd: sq, receitaBruta: sb, ticketBruto: sq ? sb / sq : 0, receitaLiquida: sl, ticketLiquido: sq ? sl / sq : 0 },
      // Conferência da planilha (linha abaixo do total): alunos, receita bruta e receita líquida contra o total da unidade
      dif: { alunos: sq - u.total.qtd, receitaBruta: sb + (u.total.valores[T.FAT] || 0), receitaLiquida: sl + soma(u.total.valores) },
    };
  }

  // Completa resultados gravados por versões anteriores (sem ticket líquido nos totais e sem resumo por semestre).
  function completar(res) {
    if (!res || !res.unidades) return res;
    const tp = res.topicos, soma = (v) => tp.reduce((a, k) => a + (v[k] || 0), 0);
    const tl = (o) => { if (o && o.ticketLiquido == null) o.ticketLiquido = o.qtd ? soma(o.valores || o) / o.qtd : 0; };
    res.unidades.forEach((u) => {
      TIPOS_ALUNO.forEach((t) => { (u.blocos[t] || []).forEach(tl); tl(u.totalBloco[t]); });
      tl(u.total);
      if (!u.resumoSemestre) u.resumoSemestre = resumoSemestreDe(u, tp);
    });
    (res.consolidado || []).forEach((c) => { if (c.ticketLiquido == null) { const u = res.unidades.find((x) => x.unidade === c.unidade); c.ticketLiquido = u ? u.total.ticketLiquido : 0; } });
    if (res.totalGeral) tl(res.totalGeral);
    return res;
  }

  FAT.resumo = { run, completar, TIPOS_ALUNO, T };
})(typeof window !== 'undefined' ? window : globalThis);
