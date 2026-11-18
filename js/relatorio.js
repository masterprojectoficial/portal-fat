/* Relatório final (HTML autocontido) gerado depois da aprovação. Abre em qualquer navegador e imprime em PDF. */
(function (root) {
  const FAT = (root.FAT = root.FAT || {});

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fN2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fInt = new Intl.NumberFormat('pt-BR');
  const brl = (n) => fBRL.format(n || 0);
  const n2 = (n) => fN2.format(n || 0);
  const int = (n) => fInt.format(n || 0);
  const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1).replace('.', ',') + '%' : '-');
  const dataBR = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso || '');
  const compBR = (c) => (c ? c.slice(5, 7) + '/' + c.slice(0, 4) : '');

  const CSS = `
  :root{--navy:#01314f;--navy-d:#00233b;--navy-dd:#00162e;--navy-l:#e6eef4;--accent:#d28027;--ink:#0f172a;--muted:#5f6b7b;--line:#e1e6ed;--ok:#1a7a4c;--ok-l:#e5f4ec;--warn:#9a5b06;--warn-l:#fdf3e2;--bad:#b42318;--bad-l:#fdecea}
  *{box-sizing:border-box}
  body{margin:0;background:#f4f6f9;color:var(--ink);font:14px/1.5 Inter,"Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif}
  .wrap{max-width:1180px;margin:0 auto;padding:24px 16px 48px}
  header.top{background:var(--navy-dd);color:#fff;box-shadow:inset 0 -3px 0 var(--accent)}
  header.top .wrap{display:flex;align-items:center;gap:18px;padding-top:16px;padding-bottom:16px}
  header.top img{height:40px;background:#fff;border-radius:0;padding:4px 8px}
  header.top .t{flex:1;min-width:0}
  header.top .t b{display:block;font-size:17px}
  header.top .t span{font-size:12.5px;opacity:.8}
  .print{background:#fff;color:var(--navy-dd);border:0;border-radius:2px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}
  h1{font-size:24px;margin:0 0 4px;color:var(--navy-dd)}
  h2{font-size:16px;margin:0 0 12px;color:var(--navy-dd)}
  .sub{color:var(--muted);margin:0 0 18px}
  .card{background:#fff;border:1px solid var(--line);border-radius:0;padding:18px;margin-bottom:16px;break-inside:avoid}
  .stamp{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;border-left:4px solid var(--ok)}
  .stamp .l{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
  .stamp .v{font-weight:600}
  .badge{display:inline-block;padding:2px 10px;border-radius:2px;font-size:12px;font-weight:600}
  .badge.ok{background:var(--ok-l);color:var(--ok)} .badge.bad{background:var(--bad-l);color:var(--bad)} .badge.warn{background:var(--warn-l);color:var(--warn)}
  .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px}
  .kpi{background:#fff;border:1px solid var(--line);border-radius:0;padding:14px}
  .kpi .l{font-size:12px;color:var(--muted)} .kpi .v{font-size:22px;font-weight:700;color:var(--navy-dd)} .kpi .s{font-size:12px;color:var(--muted)}
  .kpi.ok .v{color:var(--ok)} .kpi.bad .v{color:var(--bad)}
  .bars{display:flex;flex-direction:column;gap:8px}
  .bar{display:grid;grid-template-columns:200px 1fr 130px;gap:10px;align-items:center;font-size:13px}
  .bar .trk{background:var(--navy-l);border-radius:0;height:14px;overflow:hidden}
  .bar .fill{height:100%;background:var(--navy)} .bar .fill.ok{background:var(--ok)} .bar .fill.bad{background:var(--bad)} .bar .fill.warn{background:var(--warn)}
  .bar .n{text-align:right;font-variant-numeric:tabular-nums}
  .tw{overflow-x:auto}
  table{width:100%;border-collapse:collapse;font-size:12.5px}
  th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
  th{background:var(--navy-l);color:var(--navy-dd);font-weight:600;white-space:nowrap}
  td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
  tr.tot td{font-weight:700;background:#f7f9fc}
  .mx td.c{text-align:center;font-weight:600}
  .mx td.okc{color:var(--ok)} .mx td.badc{background:var(--bad-l);color:var(--bad)}
  .muted{color:var(--muted)} .small{font-size:12px}
  .tl{list-style:none;margin:0;padding:0} .tl li{padding:6px 0;border-bottom:1px solid var(--line)} .tl li:last-child{border:0}
  footer{color:var(--muted);font-size:12px;text-align:center;margin-top:24px}
  @media (max-width:640px){.bar{grid-template-columns:110px 1fr 90px} header.top .wrap{flex-wrap:wrap} header.top .t{flex:1 1 200px} header.top .t b{font-size:15px} h1{font-size:20px}}
  @media print{body{background:#fff}.print{display:none}.card,.kpi{border-color:#ccc}header.top{-webkit-print-color-adjust:exact;print-color-adjust:exact}th,.badge,.fill,.mx td.badc{-webkit-print-color-adjust:exact;print-color-adjust:exact}.wrap{max-width:none}}
  `;

  function pagina(titulo, subtitulo, corpo) {
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(titulo)}</title><style>${CSS}</style></head><body>
<header class="top"><div class="wrap">${FAT.LOGO ? `<img src="${FAT.LOGO}" alt="Master Project">` : '<b>Master Project</b>'}<div class="t"><b>${esc(titulo)}</b><span>${esc(subtitulo)}</span></div><button class="print" onclick="window.print()">Imprimir ou salvar PDF</button></div></header>
<main class="wrap">${corpo}<footer>Gerado pelo Portal FAT · Master Project para Clariens · Contabilidade e Controladoria</footer></main></body></html>`;
  }

  // Bloco de aprovação + trâmite (envio, devoluções, aprovação)
  function blocoAprovacao(fluxo) {
    const ap = fluxo.aprovacao || {};
    const tram = (fluxo.tramite || []).map((t) => `<li><b>${esc(t.acao)}</b> por ${esc(t.por)} em ${esc(t.em)}${t.obs ? ` · <span class="muted">${esc(t.obs)}</span>` : ''}</li>`).join('');
    return `<div class="card stamp">
      <div><div class="l">Situação</div><div class="v"><span class="badge ok">Aprovado</span></div></div>
      <div><div class="l">Aprovado por</div><div class="v">${esc(ap.por)}</div></div>
      <div><div class="l">Aprovado em</div><div class="v">${esc(ap.em)}</div></div>
      <div><div class="l">Enviado por</div><div class="v">${esc((fluxo.envio || {}).por || '-')}</div></div>
      <div style="grid-column:1/-1"><div class="l">Parecer da aprovação</div><div>${esc(ap.parecer || 'Sem observações.')}</div></div>
    </div>
    ${tram ? `<div class="card"><h2>Trâmite</h2><ul class="tl">${tram}</ul></div>` : ''}`;
  }

  const avalTxt = (ctx, key) => { const a = (ctx.aval || {})[key] || {}; return a.ok === 'sim' ? '<span class="badge ok">De acordo</span>' : a.ok === 'nao' ? '<span class="badge bad">Não de acordo</span>' : '-'; };
  const avalObs = (ctx, key) => esc(((ctx.aval || {})[key] || {}).obs || '');
  function blocoAval(ctx) {
    const itens = ctx.avalItens || [];
    if (!itens.length) return '';
    let sim = 0, nao = 0; const obs = [];
    itens.forEach((i) => { const a = (ctx.aval || {})[i.key] || {}; if (a.ok === 'sim') sim++; if (a.ok === 'nao') nao++; if (a.obs) obs.push(`<li><b>${esc(i.label)}</b> · ${a.ok === 'nao' ? 'não de acordo' : 'de acordo'} · ${esc(a.obs)}</li>`); });
    return `<div class="card"><h2>Aval da aprovadora, item a item</h2><p><span class="badge ok">${int(sim)} de acordo</span> <span class="badge ${nao ? 'bad' : 'ok'}">${int(nao)} não de acordo</span> <span class="muted small">de ${int(itens.length)} itens avaliados</span></p>${obs.length ? `<h2 style="font-size:14px;margin-top:12px">Observações da aprovadora</h2><ul class="tl">${obs.join('')}</ul>` : '<p class="muted small">Sem observações nos itens.</p>'}</div>`;
  }
  const kpi = (l, v, s, cls = '') => `<div class="kpi ${cls}"><div class="l">${esc(l)}</div><div class="v">${v}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
  function barras(itens, fmt) {
    const max = Math.max(1, ...itens.map((i) => Math.abs(i.v)));
    return `<div class="bars">${itens.map((i) => `<div class="bar"><span>${esc(i.l)}</span><div class="trk"><div class="fill ${i.cls || ''}" style="width:${((Math.abs(i.v) / max) * 100).toFixed(1)}%"></div></div><span class="n">${fmt(i.v)}</span></div>`).join('')}</div>`;
  }

  // ---------------------------------------------------------------- Frente 1
  function conferencia(res, ctx) {
    const k = res.kpis, S = FAT.conferencia.STATUS, fil = (ctx.config && ctx.config.filiais) || {};
    const nomeF = (f) => (fil[f] ? `${f} · ${fil[f]}` : f);
    const dec = ctx.decisoes || {};
    const rot = res.rotina === 'Baixa' ? 'Baixas' : 'Faturamento';
    let c = `<h1>Conferência da Integração · ${esc(rot)}</h1><p class="sub">Competência ${esc(compBR(ctx.competencia))} · Lyceum x Integração x Razão do Protheus</p>`;
    c += blocoAprovacao(ctx.fluxo) + blocoAval(ctx);
    c += `<div class="kpis">
      ${kpi('Operações no escopo', int(k.total), brl(k.valorTotal))}
      ${kpi('Contabilizadas', int(k.contabilizado), pct(k.contabilizado, k.total) + ' do total', 'ok')}
      ${kpi('Justificadas por regra', int(k.justificado), brl(k.valor_justificado))}
      ${kpi('Pendentes', int(k.pendentes), brl(k.valorPendente), k.pendentes ? 'bad' : 'ok')}
      ${kpi('Sem origem no Lyceum', int(k.semOrigem), 'informativo')}
    </div>`;
    c += `<div class="card"><h2>Situação das operações</h2>${barras([
      { l: 'Contabilizadas', v: k.contabilizado, cls: 'ok' }, { l: 'Justificadas por regra', v: k.justificado },
      { l: 'Não integraram', v: k.nao_integrado, cls: 'bad' }, { l: 'Integraram, fora do razão', v: k.nao_contabilizado, cls: 'warn' }, { l: 'Erro na integração', v: k.erro, cls: 'bad' },
    ], int)}</div>`;

    const m = res.matriz;
    c += `<div class="card"><h2>Unidade x dia</h2><div class="tw"><table class="mx"><thead><tr><th>Unidade</th>${m.dias.map((d) => `<th>${esc(d.slice(8, 10))}</th>`).join('')}</tr></thead><tbody>${m.filiais.map((f) => `<tr><td>${esc(nomeF(f))}</td>${m.dias.map((d) => { const x = m.cells[f + '|' + d]; return x ? (x.pend ? `<td class="c badc">${x.pend}</td>` : '<td class="c okc">ok</td>') : '<td></td>'; }).join('')}</tr>`).join('')}</tbody></table></div><p class="small muted">Número = pendências no dia. "ok" = tudo contabilizado ou justificado.</p></div>`;

    c += `<div class="card"><h2>Dias e unidades a reprocessar (${res.reprocessar.length})</h2>${res.reprocessar.length ? `<div class="tw"><table><thead><tr><th>Unidade</th><th>Dia</th><th class="n">Pendências</th><th class="n">Valor</th><th>Motivos</th></tr></thead><tbody>${res.reprocessar.map((x) => `<tr><td>${esc(nomeF(x.filial))}</td><td>${esc(dataBR(x.dia))}</td><td class="n">${int(x.qtd)}</td><td class="n">${brl(x.valor)}</td><td>${esc(x.motivos)}</td></tr>`).join('')}</tbody></table></div><p class="small muted">Reprocessar só esses dias e unidades, nunca o período inteiro.</p>` : '<p class="muted">Nada a reprocessar.</p>'}</div>`;

    if (res.porTipo.length) c += `<div class="card"><h2>Pendências por tipo de operação</h2><div class="tw"><table><thead><tr><th>Situação</th><th>Tipo</th><th class="n">Qtd</th><th class="n">Valor</th></tr></thead><tbody>${res.porTipo.map((g) => `<tr><td>${esc(S[g.status])}</td><td>${esc(g.tipoOp)} · ${esc(g.nome)}</td><td class="n">${int(g.qtd)}</td><td class="n">${brl(g.valor)}</td></tr>`).join('')}</tbody></table></div></div>`;

    if (res.pendencias.length) c += `<div class="card"><h2>Pendências com decisão (${int(res.pendencias.length)})</h2><div class="tw"><table><thead><tr><th>Situação</th><th>Unidade</th><th>Dia</th><th>ID operação</th><th>Tipo</th><th class="n">Valor</th><th>Decisão</th><th>Observação</th><th>Aval</th><th>Obs. da aprovadora</th></tr></thead><tbody>${res.pendencias.map((p) => { const d = dec[p.idOp] || {}; return `<tr><td>${esc(S[p.status])}</td><td>${esc(p.filial)}</td><td>${esc(dataBR(p.dia))}</td><td>${esc(p.idOp)}</td><td>${esc(p.tipoOp)} · ${esc(p.nomeTipoOp)}</td><td class="n">${brl(p.valor)}</td><td>${esc(d.decisao || '-')}</td><td>${esc(d.obs || '')}</td><td>${avalTxt(ctx, 'p:' + p.idOp)}</td><td>${avalObs(ctx, 'p:' + p.idOp)}</td></tr>`; }).join('')}</tbody></table></div></div>`;

    const just = new Map();
    res.justificados.forEach((j) => { const g = just.get(j.tipoOp) || { tipo: j.tipoOp, nome: j.nomeTipoOp, analise: j.regraAnalise, qtd: 0, valor: 0 }; g.qtd++; g.valor += j.valor; just.set(j.tipoOp, g); });
    if (just.size) c += `<div class="card"><h2>Justificadas automaticamente</h2><div class="tw"><table><thead><tr><th>Tipo</th><th>Operação</th><th class="n">Qtd</th><th class="n">Valor</th><th>Regra aplicada</th><th>Aval</th><th>Obs. da aprovadora</th></tr></thead><tbody>${[...just.values()].sort((a, b) => b.qtd - a.qtd).map((g) => `<tr><td>${esc(g.tipo)}</td><td>${esc(g.nome)}</td><td class="n">${int(g.qtd)}</td><td class="n">${brl(g.valor)}</td><td>${esc(g.analise)}</td><td>${avalTxt(ctx, 'j:' + g.tipo)}</td><td>${avalObs(ctx, 'j:' + g.tipo)}</td></tr>`).join('')}</tbody></table></div></div>`;

    if (res.semRegra.length) c += `<div class="card"><h2>Tipos de operação sem regra (pré-análise)</h2><div class="tw"><table><thead><tr><th>Tipo</th><th>Nome</th><th class="n">Qtd</th><th class="n">Valor</th></tr></thead><tbody>${res.semRegra.map((x) => `<tr><td>${esc(x.tipoOp)}</td><td>${esc(x.nome)}</td><td class="n">${int(x.qtd)}</td><td class="n">${brl(x.valor)}</td></tr>`).join('')}</tbody></table></div></div>`;

    return pagina(`Conferência da Integração · ${rot} · ${compBR(ctx.competencia)}`, 'Clariens · Contabilidade e Controladoria', c);
  }

  // ---------------------------------------------------------------- Frente 2
  function resumo(res, ctx) {
    const T = FAT.resumo.T, tg = res.totalGeral, tp = res.topicos;
    const difs = res.unidades.filter((u) => Math.abs(u.check.difFaturamento) > 0.05 || u.check.difAlunos !== 0);
    let c = `<h1>Resumo de Tópicos</h1><p class="sub">Competência ${esc(compBR(ctx.competencia))} · receita por unidade, tipo de aluno e semestre</p>`;
    c += blocoAprovacao(ctx.fluxo) + blocoAval(ctx);
    c += `<div class="kpis">
      ${kpi('Faturamento por semestre', brl(Math.abs(tg[T.FAT])), 'todas as unidades')}
      ${kpi('Alunos (BI)', int(tg.qtd), 'pagante + ProUni + FIES')}
      ${kpi('Ticket médio', brl(Math.abs(tg.ticket)), 'faturamento ÷ alunos')}
      ${kpi('Check razão x resumo', difs.length ? int(difs.length) + ' unidade(s)' : 'Fechado', difs.length ? difs.map((u) => esc(u.unidade)).join(', ') : 'faturamento e alunos batem', difs.length ? 'bad' : 'ok')}
    </div>`;
    c += `<div class="card"><h2>Faturamento por unidade</h2>${barras(res.consolidado.map((u) => ({ l: u.unidade, v: u[T.FAT] })), (v) => brl(Math.abs(v)))}</div>`;
    c += `<div class="card"><h2>Consolidado</h2><div class="tw"><table><thead><tr><th>Unidade</th><th>Aval</th><th>Obs. da aprovadora</th><th class="n">Qtd alunos</th><th class="n">Ticket médio</th><th class="n">Ticket médio líquido</th>${tp.map((t) => `<th class="n">${esc(t)}</th>`).join('')}</tr></thead><tbody>${[...res.consolidado, tg].map((u, i, a) => `<tr class="${i === a.length - 1 ? 'tot' : ''}"><td>${esc(u.unidade)}</td>${i === a.length - 1 ? '<td></td><td></td>' : `<td>${avalTxt(ctx, 'u:' + u.unidade)}</td><td>${avalObs(ctx, 'u:' + u.unidade)}</td>`}<td class="n">${int(u.qtd)}</td><td class="n">${n2(u.ticket)}</td><td class="n">${n2(u.ticketLiquido)}</td>${tp.map((t) => `<td class="n">${n2(u[t])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="small muted">Valores com o sinal do razão: receita negativa, deduções positivas.</p></div>`;
    c += `<div class="card"><h2>Check razão e BI</h2><div class="tw"><table><thead><tr><th>Unidade</th><th class="n">Faturamento resumo</th><th class="n">Faturamento razão</th><th class="n">Diferença</th><th class="n">Alunos resumo</th><th class="n">Alunos BI</th><th class="n">Diferença</th></tr></thead><tbody>${res.unidades.map((u) => { const k = u.check; return `<tr><td>${esc(u.unidade)}</td><td class="n">${n2(k.faturamentoResumo)}</td><td class="n">${n2(k.faturamentoRazao)}</td><td class="n" style="color:${Math.abs(k.difFaturamento) > 0.05 ? 'var(--bad)' : 'var(--ok)'}">${n2(k.difFaturamento)}</td><td class="n">${int(k.alunosResumo)}</td><td class="n">${int(k.alunosBI)}</td><td class="n" style="color:${k.difAlunos ? 'var(--bad)' : 'var(--ok)'}">${int(k.difAlunos)}</td></tr>`; }).join('')}</tbody></table></div></div>`;

    res.unidades.forEach((u) => {
      const rs = u.resumoSemestre;
      c += `<div class="card"><h2>${esc(u.unidade)}</h2><p class="small muted">${esc(u.razaoSocial)} · filial ${esc(u.filial)} · ISS ${n2(u.iss * 100)}% · PDD ${n2(u.pdd * 100)}%</p>
        <h2 style="font-size:14px;margin-top:10px">Resumo por semestre</h2><div class="tw"><table><thead><tr><th>Semestre</th><th class="n">Total alunos</th><th class="n">Ticket bruto</th><th class="n">Receita bruta</th><th class="n">Ticket líquido</th><th class="n">Receita líquida</th></tr></thead><tbody>${rs.linhas.map((l) => `<tr><td>${esc(l.serie)}º</td><td class="n">${int(l.qtd)}</td><td class="n">${n2(l.ticketBruto)}</td><td class="n">${n2(l.receitaBruta)}</td><td class="n">${n2(l.ticketLiquido)}</td><td class="n">${n2(l.receitaLiquida)}</td></tr>`).join('')}<tr class="tot"><td>Total</td><td class="n">${int(rs.total.qtd)}</td><td class="n">${n2(rs.total.ticketBruto)}</td><td class="n">${n2(rs.total.receitaBruta)}</td><td class="n">${n2(rs.total.ticketLiquido)}</td><td class="n">${n2(rs.total.receitaLiquida)}</td></tr></tbody></table></div>
        <h2 style="font-size:14px;margin-top:14px">Tópicos por tipo de aluno e semestre</h2><div class="tw"><table><thead><tr><th>Tipo · semestre</th><th class="n">Qtd</th><th class="n">Ticket médio</th>${tp.map((t) => `<th class="n">${esc(t)}</th>`).join('')}<th class="n">Ticket médio líquido</th></tr></thead><tbody>`;
      FAT.resumo.TIPOS_ALUNO.forEach((t) => {
        u.blocos[t].filter((l) => l.qtd || tp.some((k) => Math.abs(l.valores[k]) > 0.005)).forEach((l) => { c += `<tr><td>${esc(t)} · ${esc(l.serie)}º</td><td class="n">${int(l.qtd)}</td><td class="n">${n2(l.ticket)}</td>${tp.map((k) => `<td class="n">${n2(l.valores[k])}</td>`).join('')}<td class="n">${n2(l.ticketLiquido)}</td></tr>`; });
        const b = u.totalBloco[t];
        c += `<tr class="tot"><td>Total ${esc(t)}</td><td class="n">${int(b.qtd)}</td><td class="n">${n2(b.ticket)}</td>${tp.map((k) => `<td class="n">${n2(b.valores[k])}</td>`).join('')}<td class="n">${n2(b.ticketLiquido)}</td></tr>`;
      });
      c += `<tr class="tot"><td>Total da unidade</td><td class="n">${int(u.total.qtd)}</td><td class="n">${n2(u.total.ticket)}</td>${tp.map((k) => `<td class="n">${n2(u.total.valores[k])}</td>`).join('')}<td class="n">${n2(u.total.ticketLiquido)}</td></tr></tbody></table></div></div>`;
    });

    const ex = res.excecoes;
    c += `<div class="card"><h2>Exceções</h2><ul class="tl">
      <li>Lançamentos sem aluno classificado: <b>${int(ex.semAluno.length)}</b>${ex.semAluno.length ? ` · ${brl(ex.semAluno.reduce((s, x) => s + x.movimento, 0))}` : ''}</li>
      <li>Lançamentos fora das unidades do resumo: <b>${int(ex.foraUnidade.length)}</b></li>
      <li>Contas de receita sem tópico (não entram no resumo): <b>${int(ex.contasSemTopico.length)}</b>${ex.contasSemTopico.length ? ' · ' + ex.contasSemTopico.slice(0, 12).map((x) => esc(x.conta)).join(', ') + (ex.contasSemTopico.length > 12 ? '...' : '') : ''}</li>
    </ul></div>`;
    return pagina(`Resumo de Tópicos · ${compBR(ctx.competencia)}`, 'Clariens · Contabilidade e Controladoria', c);
  }

  function baixar(html, nome) {
    const a = root.document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  function abrir(html) {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    root.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  FAT.relatorio = { conferencia, resumo, baixar, abrir };
})(typeof window !== 'undefined' ? window : globalThis);
