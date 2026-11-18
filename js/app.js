/* Portal FAT - interface. */
(function () {
  const FAT = window.FAT;
  const $main = document.getElementById('main');
  const $file = document.getElementById('fileInput');
  const $json = document.getElementById('jsonInput');

  let config = FAT.store.getConfig();
  const R = FAT.remoto;

  // Perfis (no modo local tudo é liberado, como antes)
  const papel = () => (R.ativo ? R.me.papel : 'admin');
  const podeExecutar = () => ['admin', 'executora'].includes(papel());
  const podeAprovar = (s) => ['admin', 'aprovadora'].includes(papel()) && (!R.ativo || papel() === 'admin' || !s.fluxo.envio || s.fluxo.envio.usuario_id !== R.me.id);
  const podeDecidir = (s) => podeExecutar() && (s.fluxo.status === 'rascunho' || s.fluxo.status === 'devolvido');
  const roAbre = (ok) => (ok ? '' : '<fieldset class="ro" disabled>');
  const roFecha = (ok) => (ok ? '' : '</fieldset>');
  const historico = () => (R.ativo ? R.historico : FAT.store.getHistorico());

  // ---------- utilitários ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fN2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fInt = new Intl.NumberFormat('pt-BR');
  const brl = (n) => fBRL.format(n || 0);
  const n2 = (n) => fN2.format(n || 0);
  const int = (n) => fInt.format(n || 0);
  const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1).replace('.', ',') + '%' : '-');
  const dataBR = FAT.exportar.dataBR;
  const diaMes = (iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '');
  const agora = () => new Date().toLocaleString('pt-BR');
  function mesAnterior() { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); }
  const compBR = (c) => (c ? c.slice(5, 7) + '/' + c.slice(0, 4) : '');
  const nomeFilial = (f) => (config.filiais[f] ? `${f} · ${config.filiais[f]}` : f);

  const fluxoNovo = () => ({ status: 'rascunho', envio: null, aprovacao: null, devolucao: null, tramite: [] });
  const STATUS_FLUXO = { rascunho: ['info', 'Em conferência'], em_aprovacao: ['warn', 'Aguardando aprovação'], devolvido: ['bad', 'Devolvido para ajuste'], aprovado: ['ok', 'Aprovado'] };
  const pillFluxo = (s) => (s.res ? pill(STATUS_FLUXO[s.fluxo.status][0], STATUS_FLUXO[s.fluxo.status][1] + (s.fluxo.status === 'aprovado' ? ' por ' + s.fluxo.aprovacao.por : '')) : '');

  const state = {
    rota: 'inicio',
    f1: { rotina: 'Faturamento', competencia: mesAnterior(), reports: {}, res: null, filtro: 'todas', filial: '', dia: '', busca: '', decisoes: {}, aval: {}, fluxo: fluxoNovo(), envPor: 'Master Project', envObs: '', valPor: 'Raquel', valObs: '', valCheck: false, sel: '', avalFiltro: 'todos', avalBusca: '' },
    f2: { competencia: mesAnterior(), reports: {}, res: null, unidade: '', bloco: 'PAGANTE', aval: {}, fluxo: fluxoNovo(), envPor: 'Master Project', envObs: '', valPor: 'Raquel', valObs: '', valCheck: false, sel: '', avalFiltro: 'todos', avalBusca: '' },
    regras: { aba: 'regras', busca: '', edit: null },
    uploadAlvo: 'f1',
    usuarios: { nome: '', email: '', papel: 'executora' },
    filaVer: 'tudo',
  };

  let tCfg = null;
  function salvarConfig() {
    if (!R.ativo) { FAT.store.setConfig(config); return; }
    clearTimeout(tCfg); marcaSalvo('Salvando...');
    tCfg = setTimeout(async () => {
      try { await R.api('PUT', 'parametros', { config }); marcaSalvo('Parâmetros salvos'); } catch (e) { marcaSalvo('Não salvo'); toast('Não consegui salvar os parâmetros: ' + e.message); }
    }, 600);
  }
  function marcaSalvo(txt) { const e = document.getElementById('salvoTxt'); if (e) e.textContent = txt; }

  // ---------- gravação no portal (decisões e aval vão aos poucos, só o que mudou)
  const pend = { f1: { decisoes: new Set(), aval: new Set() }, f2: { decisoes: new Set(), aval: new Set() } };
  let tPend = null;
  function agendar(fr, tipo, chave) {
    if (!R.ativo || !state[fr].id) return;
    pend[fr][tipo].add(chave); marcaSalvo('Salvando...');
    clearTimeout(tPend); tPend = setTimeout(salvarPendentes, 700);
  }
  function corpoPendente(fr) {
    const s = state[fr], p = pend[fr], c = {};
    if (p.decisoes.size) { c.decisoes = {}; p.decisoes.forEach((k) => { c.decisoes[k] = s.decisoes[k] || null; }); }
    if (p.aval.size) { c.aval = {}; p.aval.forEach((k) => { c.aval[k] = s.aval[k] || null; }); }
    return c;
  }
  async function salvarPendentes() {
    clearTimeout(tPend);
    if (!R.ativo) return true;
    for (const fr of ['f1', 'f2']) {
      const s = state[fr], p = pend[fr];
      if (!s.id || (!p.decisoes.size && !p.aval.size)) continue;
      const corpo = corpoPendente(fr), dk = [...p.decisoes], ak = [...p.aval];
      p.decisoes.clear(); p.aval.clear();
      try {
        await R.api('PATCH', 'conferencias?id=' + encodeURIComponent(s.id), corpo);
        marcaSalvo('Salvo às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        if (e.status !== 403 && e.status !== 409) { dk.forEach((k) => p.decisoes.add(k)); ak.forEach((k) => p.aval.add(k)); }
        marcaSalvo('Não salvo'); toast('Não consegui salvar: ' + e.message);
        return false;
      }
    }
    return true;
  }
  window.addEventListener('pagehide', () => {
    if (!R.ativo) return;
    ['f1', 'f2'].forEach((fr) => {
      const p = pend[fr];
      if (!state[fr].id || (!p.decisoes.size && !p.aval.size)) return;
      fetch('/api/conferencias?id=' + encodeURIComponent(state[fr].id), { method: 'PATCH', keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpoPendente(fr)) });
    });
  });

  // Conferência do banco para a tela
  const metaArquivos = (reports, lista) => Object.fromEntries(lista.filter(([t]) => reports[t]).map(([t]) => [t, { arquivo: reports[t].arquivo, aba: reports[t].aba, linhas: reports[t].linhas }]));
  function aplicarConf(fr, c) {
    const s = state[fr];
    if (!c) {
      if (s.id) { s.id = null; s.res = null; s.conf = null; s.decisoes = {}; s.aval = {}; s.fluxo = fluxoNovo(); }
      return;
    }
    const mesma = s.id === c.id;
    s.id = c.id; s.res = c.resultado; s.competencia = c.competencia;
    if (fr === 'f1' && c.rotina) s.rotina = c.rotina;
    s.decisoes = c.decisoes || {}; s.aval = c.aval || {}; s.fluxo = c.fluxo;
    s.conf = { criado_por: c.criado_por, criado_em: c.criado_em };
    if (c.criado_por) s.envPor = c.criado_por;
    if (c.aprovador_previsto) s.valPor = c.aprovador_previsto;
    if (!mesma) {
      s.sel = ''; s.avalBusca = ''; s.avalFiltro = c.status === 'em_aprovacao' && contagemAval(fr).nao ? 'nao' : 'todos';
      if (fr === 'f1') { s.filtro = 'todas'; s.filial = ''; s.dia = ''; s.busca = ''; }
      if (fr === 'f2' && s.res && s.res.unidades && s.res.unidades[0]) { s.unidade = s.res.unidades[0].unidade; s.bloco = 'PAGANTE'; }
    }
    Object.entries(c.arquivos || {}).forEach(([t, m]) => { if (!s.reports[t] || !s.reports[t].rows) s.reports[t] = m; });
  }
  async function sincronizar(rota) {
    try {
      if (['inicio', 'frente1', 'frente2'].includes(rota)) { const c = await R.api('GET', 'conferencias?atual=1'); aplicarConf('f1', c.f1); aplicarConf('f2', c.f2); }
      if (rota === 'inicio' || rota === 'historico') R.historico = await R.api('GET', 'historico');
      if (rota === 'usuarios' && papel() === 'admin') R.usuarios = await R.api('GET', 'usuarios');
    } catch (e) { toast('Não consegui atualizar: ' + e.message); }
  }
  async function recarregarUsuarios() {
    try { R.usuarios = await R.api('GET', 'usuarios'); const m = await R.api('GET', 'me'); R.aprovadoras = m.aprovadoras || []; } catch (e) { toast(e.message); }
    render();
  }
  function montarUsuario() {
    const box = document.getElementById('userbox'); if (!box) return;
    const PAP = { admin: 'administradora', executora: 'executora', aprovadora: 'aprovadora' };
    box.className = 'user';
    box.innerHTML = `<span class="salvo" id="salvoTxt" aria-live="polite"></span><span><b>${esc(R.me.nome)}</b> <span class="papel muted">· ${PAP[R.me.papel] || ''}</span></span><a href="#senha">Trocar senha</a><a href="#" data-sair>Sair</a>`;
    box.querySelector('[data-sair]').addEventListener('click', (e) => { e.preventDefault(); salvarPendentes().finally(R.sair); });
    if (R.me.papel === 'admin') document.getElementById('navUsuarios').classList.remove('hidden');
  }
  function abrirRemoto(id) {
    const w = window.open('', '_blank');
    R.api('GET', 'relatorios?id=' + encodeURIComponent(id)).then((r) => {
      const url = URL.createObjectURL(new Blob([r.html], { type: 'text/html;charset=utf-8' }));
      if (w) w.location.href = url; else FAT.relatorio.abrir(r.html);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }).catch((e) => { if (w) w.close(); toast(e.message); });
  }
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 3800);
  }
  function overlay(msg) {
    let o = document.querySelector('.overlay');
    if (!msg) { if (o) o.remove(); return; }
    if (!o) { o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = '<div class="box"><div class="spin"></div><div class="msg"></div></div>'; document.body.appendChild(o); }
    o.querySelector('.msg').textContent = msg;
  }
  const pausa = () => new Promise((r) => setTimeout(r, 30));

  // ---------- roteamento ----------
  const ROTAS = { inicio: vInicio, guia: vGuia, frente1: vFrente1, frente2: vFrente2, frente3: vFrente3, regras: vRegras, historico: vHistorico, usuarios: vUsuarios, senha: vSenha };
  function render() {
    const r = ROTAS[state.rota] ? state.rota : 'inicio';
    document.querySelectorAll('.side a').forEach((a) => a.classList.toggle('on', a.dataset.route === r));
    $main.innerHTML = '<div class="page">' + ROTAS[r]() + '</div>';
    const b = document.getElementById('badgeFila');
    if (b) { const n = itensFila().filter((q) => q.papel === 'aprov' || q.cls === 'q-dev').length; b.textContent = n ? String(n) : ''; }
  }
  async function irPara() {
    state.rota = (location.hash || '#inicio').slice(1);
    if (R.ativo && R.me.trocar_senha) state.rota = 'senha';
    if (R.ativo) { await salvarPendentes(); await sincronizar(state.rota); }
    render(); $main.focus({ preventScroll: true }); window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', irPara);

  // ---------- componentes ----------
  const pill = (cls, txt) => `<span class="pill ${cls}">${esc(txt)}</span>`;
  const kpi = (l, v, s, cls = '') => `<div class="kpi ${cls}"><div class="l">${esc(l)}</div><div class="v">${v}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
  const cabecalho = (kicker, titulo, texto, direita = '') => `<div class="page-head"><div><div class="kicker">${esc(kicker)}</div><h1>${esc(titulo)}</h1>${texto ? `<p>${texto}</p>` : ''}</div>${direita}</div>`;
  const tituloEtapa = (n, t, on = true) => `<div class="title-row"><span class="step ${on ? '' : 'off'}">${n}</span><h2>${esc(t)}</h2></div>`;
  const iconeUpload = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M4 15v4h16v-4"/></svg>';

  const soExecutora = (inner) => (podeExecutar() ? inner : '<p class="small muted" style="margin-bottom:12px">Quem sobe os relatórios e processa é a executora.</p>' + roAbre(false) + inner + roFecha(false));
  function blocoAprovacao(fr) {
    const s = state[fr];
    if (!s.res || s.fluxo.status !== 'em_aprovacao') return '';
    if (podeAprovar(s)) return avalWs(fr) + decisaoBox(fr);
    const f = s.fluxo, c = contagemAval(fr);
    const minha = R.ativo && f.envio && f.envio.usuario_id === R.me.id && papel() !== 'admin';
    return `<div class="alert warn"><div><b>Com ${esc(s.valPor)} para aprovação desde ${esc(f.envio.em)}.</b>${minha ? 'Você enviou esta conferência, então o aval e a aprovação ficam com outra pessoa. ' : ''}Aval até agora: ${int(c.sim + c.nao)} de ${int(c.total)} itens. Se ela devolver para ajuste, volta para a fila da executora.</div></div>`;
  }
  function camposEnvio(fr, s) {
    if (!R.ativo) return `<label class="fld">Enviado por<input type="text" data-bind="${fr}.envPor" value="${esc(s.envPor)}"></label>
          <label class="fld">Aprovação com<input type="text" data-bind="${fr}.valPor" value="${esc(s.valPor)}"></label>`;
    const ap = R.aprovadoras.length ? R.aprovadoras : [s.valPor].filter(Boolean);
    if (!ap.includes(s.valPor)) s.valPor = ap[0] || '';
    return `<label class="fld">Enviado por<input type="text" value="${esc(R.me.nome)}" disabled></label>
          <label class="fld">Aprovação com<select data-bind="${fr}.valPor">${ap.length ? ap.map((n) => `<option ${n === s.valPor ? 'selected' : ''}>${esc(n)}</option>`).join('') : '<option value="">Nenhuma aprovadora cadastrada</option>'}</select></label>`;
  }

  function cardUpload(n, titulo, s, inner, resumo) {
    if (!s.res) return `<div class="card"><div class="card-head">${tituloEtapa(n, titulo)}</div>${inner}</div>`;
    return `<details class="card fold"><summary>${tituloEtapa(n, titulo)}<span class="small muted grow">${resumo}</span><span class="tg">Trocar arquivos</span></summary><div class="fold-body">${inner}</div></details>`;
  }

  function listaArquivos(reports, exigidos) {
    return '<ul class="files">' + exigidos.map(([tipo, nome, opcional]) => {
      const r = reports[tipo];
      if (r) return `<li class="ok"><span class="ic">✓</span><span><span class="nm">${esc(nome)}</span><br><span class="small muted">${esc(r.arquivo)} · aba "${esc(r.aba)}"</span></span><span class="meta">${int(r.linhas)} linhas</span></li>`;
      return `<li class="wait"><span class="ic">${opcional ? '·' : '!'}</span><span><span class="nm">${esc(nome)}</span><br><span class="small muted">${opcional ? 'Opcional' : 'Aguardando arquivo'}</span></span></li>`;
    }).join('') + '</ul>';
  }

  // ======================================================== INÍCIO
  function itensFila() {
    const fr = [['f1', 'frente1', 'Conferência da Integração', 'Frente 1'], ['f2', 'frente2', 'Resumo de Tópicos', 'Frente 2']];
    const out = fr.map(([k, rota, nome, n]) => {
      const s = state[k], f = s.fluxo, st = f.status;
      const det = k === 'f1' ? `${s.rotina === 'Baixa' ? 'Baixas' : 'Faturamento'} · ${compBR(s.competencia)}` : compBR(s.competencia);
      const b = { k, rota, nome, n, det };
      if (!s.res) return { ...b, papel: 'exec', cls: 'q-exec', tag: pill('mute', 'Aguardando arquivos'), quem: s.envPor + ' (executora)', desde: '-', prox: 'Subir os relatórios e processar', acao: 'Abrir' };
      if (st === 'rascunho') return { ...b, papel: 'exec', cls: 'q-exec', tag: pill('info', 'Em conferência'), quem: s.envPor + ' (executora)', desde: '-', prox: k === 'f1' ? `Registrar as decisões das ${int(s.res.kpis.pendentes)} pendências e enviar` : 'Conferir o check e enviar para aprovação', acao: 'Continuar' };
      if (st === 'devolvido') return { ...b, papel: 'exec', cls: 'q-dev', tag: pill('bad', 'Devolvido para ajuste'), quem: s.envPor + ' (executora)', desde: f.devolucao.em, prox: 'Ajustar o que foi apontado e reenviar', acao: 'Ajustar' };
      if (st === 'em_aprovacao') { const c = contagemAval(k); return { ...b, papel: 'aprov', cls: 'q-aprov', tag: pill('warn', 'Aguardando aprovação'), quem: s.valPor + ' (aprovadora)', desde: f.envio.em, prox: `Dar o aval: ${int(c.sim + c.nao)} de ${int(c.total)} itens avaliados`, acao: 'Avaliar' }; }
      return { ...b, papel: 'fim', cls: 'q-ok', tag: pill('ok', 'Aprovado'), quem: f.aprovacao.por + ' (aprovou)', desde: f.aprovacao.em, prox: 'Baixar o relatório final', acao: 'Ver resultado' };
    });
    out.push({ k: 'f3', rota: 'frente3', nome: 'Base Consolidada', n: 'Frente 3', det: 'sem prazo', papel: 'bloq', cls: '', tag: pill('mute', 'Aguarda Lyceum v10'), quem: '-', desde: '-', prox: 'Começa depois da atualização do Lyceum', acao: 'Ver' });
    return out;
  }

  function vInicio() {
    const fila = itensFila(), ver = state.filaVer;
    const vis = fila.filter((q) => ver === 'tudo' || q.papel === ver);
    const hist = historico();
    const nAprov = fila.filter((q) => q.papel === 'aprov').length, nExec = fila.filter((q) => q.papel === 'exec').length;
    const aprovadas = hist.filter((h) => (h.status || 'Aprovado') === 'Aprovado').length, devolvidas = hist.filter((h) => h.status === 'Devolvido').length;
    const opt = [['tudo', 'Tudo'], ['exec', 'Com a executora'], ['aprov', 'Com a aprovadora']];
    const passos = [['Envio dos arquivos', 'Executora sobe os relatórios'], ['Conferência', 'Portal cruza e aponta pendências'], ['Aprovação', 'Aval item a item, aprova ou devolve'], ['Resultado final', 'Relatório HTML e Excel']];
    return cabecalho('Clariens · Contabilidade e Controladoria', 'Fila de trabalho',
      'O que está com cada pessoa agora. A executora sobe e confere, a aprovadora dá o aval item a item e aprova ou devolve, e só depois sai o resultado final.') +
      `<div class="grid k" style="margin-bottom:16px">
        ${kpi('Com a executora', int(nExec), 'subir, conferir ou ajustar')}
        ${kpi('Aguardando aprovação', int(nAprov), 'aval da aprovadora', nAprov ? 'warn' : '')}
        ${kpi('Aprovações registradas', int(aprovadas), R.ativo ? 'no portal' : 'neste navegador', aprovadas ? 'ok' : '')}
        ${kpi('Devoluções registradas', int(devolvidas), R.ativo ? 'no portal' : 'neste navegador')}
      </div>
      <div class="card"><div class="card-head"><h2>Em andamento</h2><div class="btns">${R.ativo ? '<button type="button" class="btn ghost sm" data-action="sync">Atualizar</button>' : ''}<div class="seg" role="group" aria-label="Filtrar a fila">${opt.map(([v, t]) => `<button type="button" data-action="fila-ver" data-v="${v}" class="${ver === v ? 'on' : ''}">${t}</button>`).join('')}</div></div></div>
      ${vis.length ? `<div class="tbl-wrap"><table class="fila"><thead><tr><th>Frente</th><th>Situação</th><th>Com quem</th><th>Desde</th><th>Próximo passo</th><th></th></tr></thead><tbody>${vis.map((q) => `<tr class="${q.cls}"><td class="fr">${esc(q.n)} · ${esc(q.nome)}<small>${esc(q.det)}</small></td><td>${q.tag}</td><td>${esc(q.quem)}</td><td class="small">${esc(q.desde)}</td><td class="nx">${esc(q.prox)}</td><td class="num"><a class="btn ${q.papel === 'aprov' || q.papel === 'exec' ? '' : 'ghost'} sm" href="#${q.rota}">${esc(q.acao)}</a></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Nada com essa pessoa agora.</div>'}
      <p class="small muted" style="margin-top:10px">${R.ativo ? 'A fila é a mesma para todo mundo que entra no portal. Use "Atualizar" para ver o que mudou desde que você abriu a página.' : 'A fila mostra o trabalho aberto neste navegador. No modo local, executora e aprovadora usam o mesmo computador.'}</p></div>
      <div class="card"><div class="card-head"><h2>Concluídas recentemente</h2><a class="btn ghost sm" href="#historico">Ver histórico</a></div>${hist.length ? tabelaHistorico(hist.slice(0, 6)) : '<div class="empty">Nenhuma aprovação registrada ainda.</div>'}</div>
      <div class="card"><div class="card-head"><h2>Como funciona</h2><a class="btn ghost sm" href="#guia">Ver o passo a passo completo</a></div><ol class="flow" style="margin:0" aria-label="Fluxo das frentes">${passos.map(([t, d], i) => `<li><span class="dot">${i + 1}</span><span><b>${t}</b><small>${d}</small></span></li>`).join('')}</ol></div>`;
  }

  // ======================================================== COMO FUNCIONA
  const FR_ATUAL = () => (state.rota === 'frente2' ? 'f2' : 'f1');
  const NOME_PAPEL = { admin: 'administradora', executora: 'executora', aprovadora: 'aprovadora' };

  // O que a pessoa logada precisa fazer agora nesta frente.
  function passoAgora(fr) {
    const s = state[fr], st = s.fluxo.status, f1 = fr === 'f1';
    const exec = podeExecutar(), aprov = s.res && podeAprovar(s);
    const quemAprova = s.valPor || 'a aprovadora';
    if (!s.res) return exec
      ? { vez: true, t: 'Subir os relatórios e processar', p: f1
        ? ['Escolha a rotina (Faturamento no 1º dia útil, Baixas no 4º dia útil) e a competência.', 'Arraste os três relatórios: Integração do Protheus, Movimentação Contábil do Lyceum e Razão do Protheus. Pode ser um Excel só, com as abas.', 'Clique em "Processar conferência". Os arquivos são lidos no seu computador e só o resultado vai para o portal.']
        : ['Escolha a competência.', 'Arraste o Razão do Protheus (contas de resultado) e a Base de Alunos do BI. A lista de alunos do Lyceum é opcional.', 'Clique em "Gerar resumo".'] }
      : { vez: false, t: 'Aguardando a executora', p: ['A executora sobe os relatórios e processa. Quando ela enviar para aprovação, a conferência aparece na sua fila de trabalho.'] };
    if (st === 'rascunho') return exec
      ? { vez: true, t: f1 ? 'Conferir e registrar as decisões' : 'Conferir o resumo', p: f1
        ? ['Veja a pré-análise das regras e a matriz unidade x dia. As células vermelhas são os dias e as unidades com pendência.', 'Em "Pendências", registre uma decisão para cada operação: Reprocessar, Justificar, Criar regra ou Abrir chamado, com observação quando ajudar. Tudo é salvo sozinho.', `No fim da página, em "Aprovação", escolha ${esc(quemAprova)} e clique em "Enviar para aprovação".`]
        : ['Confira o consolidado, o check (razão x resumo e alunos BI x resumo) e as exceções.', `No fim da página, em "Aprovação", escolha ${esc(quemAprova)} e clique em "Enviar para aprovação".`] }
      : { vez: false, t: 'Em conferência com a executora', p: ['A executora está registrando as decisões. Quando ela enviar, a conferência aparece na sua fila de trabalho.'] };
    if (st === 'devolvido') return exec
      ? { vez: true, t: 'Ajustar o que foi devolvido', p: ['Leia o motivo da devolução no quadro "Aprovação", no fim da página. Os itens em desacordo aparecem em vermelho nas tabelas, com a observação da aprovadora.', 'Ajuste as decisões. Se precisar de arquivos novos, suba e processe de novo: o trâmite e o aval dos itens que continuam são mantidos.', 'Clique em "Reenviar para aprovação".'] }
      : { vez: false, t: 'Devolvido para a executora', p: ['A conferência voltou para ajuste. Quando a executora reenviar, ela aparece na sua fila de trabalho, já filtrada nos itens em desacordo.'] };
    if (st === 'em_aprovacao') return aprov
      ? { vez: true, t: 'Dar o aval e decidir', p: [`No painel "Aval da aprovadora", avalie cada item: De acordo (tecla A) ou Não de acordo (tecla N). Use as setas para navegar. Ao marcar de acordo, o portal já vai para o próximo item.`, 'Em item com problema, marque Não de acordo e escreva a observação: ela volta junto com a devolução.', 'Em "Decisão final", marque a confirmação de que revisou e clique em "Aprovar". Se algum item estiver em desacordo, use "Devolver para ajuste".'] }
      : { vez: false, t: `Com ${esc(quemAprova)} para aprovação`, p: [R.ativo && s.fluxo.envio && s.fluxo.envio.usuario_id === R.me.id && papel() !== 'admin' ? 'Você enviou esta conferência, então a aprovação fica com outra pessoa. Enquanto isso, as decisões ficam travadas.' : 'A aprovadora está dando o aval item a item. Se ela devolver, a conferência volta para a sua fila com os itens marcados.'] };
    return { vez: true, t: 'Aprovado: pegar o resultado final', p: [`No fim da página, em "Resultado final", baixe o relatório em HTML (com o carimbo da aprovação) e o Excel${f1 ? ', e a lista de reprocessamento só com os dias e unidades pendentes' : ' com uma aba por unidade'}.`, 'O relatório também fica guardado no "Histórico de aprovações" para qualquer pessoa reabrir.', 'Para a próxima competência, é só subir os novos relatórios.'] };
  }

  function guiaAgora(fr) {
    const g = passoAgora(fr);
    return `<section class="agora ${g.vez ? 'vez' : 'espera'}" aria-label="O que fazer agora"><div class="agora-h"><span class="pill ${g.vez ? 'info' : 'mute'}">${g.vez ? (R.ativo ? 'Sua vez' : 'Próximo passo') : 'Aguardando'}</span><b>${g.t}</b><a href="#guia" class="small">Como funciona</a></div>
      <ol>${g.p.map((x) => `<li>${x}</li>`).join('')}</ol></section>`;
  }

  function vGuia() {
    const voce = R.ativo ? `<p class="small muted" style="margin-top:6px">Você entrou como <b>${esc(NOME_PAPEL[papel()] || '')}</b>.</p>` : '';
    const etapa = (n, t, quem, itens) => `<li class="g-etapa"><span class="g-n">${n}</span><div><h3>${t}</h3><p class="small muted">${quem}</p><ul>${itens.map((x) => `<li>${x}</li>`).join('')}</ul></div></li>`;
    return cabecalho('Ajuda', 'Como funciona o portal', 'O mesmo fluxo vale para as duas frentes: quem executa sobe e confere, quem aprova dá o aval item a item, e só depois da aprovação sai o resultado final.') + voce +
      `<div class="card"><div class="card-head"><h2>As quatro etapas</h2></div><ol class="g-etapas">
        ${etapa(1, 'Envio dos arquivos', 'Executora', ['Frente 1 (Conferência da Integração): rotina Faturamento no 1º dia útil e Baixas no 4º dia útil. Relatório de Integração do Protheus, Movimentação Contábil do Lyceum e Razão do Protheus.', 'Frente 2 (Resumo de Tópicos): mensal. Razão do Protheus (contas de resultado) e Base de Alunos do BI. A lista de alunos do Lyceum é opcional.', 'Os arquivos são lidos no computador de quem sobe e não vão para o servidor. Só o resultado da conferência fica guardado no portal.'])}
        ${etapa(2, 'Conferência', 'Executora', ['O portal cruza as bases e mostra o que precisa de atenção: pré-análise das regras, matriz unidade x dia, pendências e justificadas (Frente 1); consolidado, check e exceções (Frente 2).', 'Na Frente 1, a executora registra uma decisão para cada pendência: Reprocessar, Justificar, Criar regra ou Abrir chamado. Tudo é salvo sozinho.', 'No fim da página, ela escolhe a aprovadora e clica em "Enviar para aprovação".'])}
        ${etapa(3, 'Aprovação', 'Aprovadora (Raquel)', ['A conferência aparece na fila de trabalho dela, com o painel "Aval da aprovadora" no topo da frente.', 'Ela avalia cada item: De acordo ou Não de acordo, com observação. Atalhos: A, N e as setas.', 'Para aprovar, todos os itens precisam estar de acordo e ela marca a confirmação de que revisou. Se algo estiver errado, ela devolve: a conferência volta para a executora com os itens e as observações.'])}
        ${etapa(4, 'Resultado final', 'Todas as pessoas', ['Depois da aprovação saem o relatório final em HTML (com o carimbo da aprovação, o trâmite e o aval item a item) e o Excel.', 'O relatório fica no "Histórico de aprovações" e pode ser reaberto por qualquer pessoa do portal.'])}
      </ol></div>
      <div class="grid f" style="margin-bottom:16px">
        <div class="card" style="margin:0"><div class="card-head"><h2>Executora</h2></div><ul class="g-lista"><li>Sobe os relatórios e processa</li><li>Registra as decisões das pendências</li><li>Envia e reenvia para aprovação</li><li>Ajusta as regras e os parâmetros</li><li>Baixa o resultado final</li></ul></div>
        <div class="card" style="margin:0"><div class="card-head"><h2>Aprovadora</h2></div><ul class="g-lista"><li>Dá o aval em cada item</li><li>Aprova ou devolve para ajuste</li><li>Consulta regras e histórico</li><li>Baixa o resultado final</li></ul></div>
        <div class="card" style="margin:0"><div class="card-head"><h2>Administradora</h2></div><ul class="g-lista"><li>Faz tudo o que as outras fazem</li><li>Cadastra as pessoas e define o perfil</li><li>Gera nova senha temporária</li><li>Desativa quem sai do processo</li></ul></div>
      </div>
      <div class="card"><div class="card-head"><h2>Regras que o portal garante</h2></div><ul class="g-lista">
        <li>Quem envia uma conferência não aprova essa mesma conferência.</li>
        <li>Enquanto a frente está com a aprovadora, ninguém reprocessa nem muda as decisões.</li>
        <li>Aprovação só com todos os itens de acordo e com a confirmação marcada. Devolução precisa de item em desacordo ou de um parecer.</li>
        <li>O relatório final só é liberado depois da aprovação e não pode ser trocado depois.</li>
        <li>Toda aprovação e devolução fica registrada no histórico, com quem fez e quando.</li>
      </ul></div>
      <div class="card"><div class="card-head"><h2>Dúvidas comuns</h2></div><dl class="g-faq">
        <dt>Esqueci a senha ou fui bloqueada.</dt><dd>Depois de 5 senhas erradas o acesso fica bloqueado por 15 minutos. A administradora pode gerar uma nova senha temporária na tela "Usuários".</dd>
        <dt>A tela não mostra o que a outra pessoa acabou de fazer.</dt><dd>Clique em "Atualizar" na fila de trabalho ou troque de página no menu: o portal busca a situação mais recente.</dd>
        <dt>Preciso corrigir algo depois de aprovado.</dt><dd>Suba os relatórios de novo e processe: começa uma conferência nova, que passa pelo mesmo fluxo. A aprovada continua no histórico.</dd>
        <dt>Aparece "Salvando..." no topo.</dt><dd>As decisões e o aval são salvos sozinhos em poucos segundos. Espere aparecer "Salvo às..." antes de fechar a página.</dd>
      </dl></div>`;
  }

  // ======================================================== FRENTE 1
  const F1_ARQS = [['integracao', 'Relatório de Integração (Protheus)'], ['movLyceum', 'Movimentação Contábil (Lyceum)'], ['razao', 'Razão (Protheus)']];

  function vFrente1() {
    const s = state.f1;
    const pronto = F1_ARQS.every(([t]) => s.reports[t] && s.reports[t].rows);
    const tabelasNoArquivo = s.reports.tipoOperacao || s.reports.regra;
    let html = cabecalho('Frente 1', 'Conferência da Integração',
      'Confere se tudo que foi gerado no Lyceum subiu para o Protheus e entrou no razão. O "verde" da integração não basta: só o cruzamento com o razão confirma.',
      `<div>${pillFluxo(s)}</div>`) + etapas(s, pronto) + guiaAgora(FR_ATUAL());

    html += blocoAprovacao('f1');
    const upInner = `<div class="row" style="margin-bottom:16px">
        <div class="fld"><span class="small" style="font-weight:600;color:var(--ink-2)">Rotina</span>
          <div class="seg" role="group" aria-label="Rotina">
            <button type="button" data-action="f1-rotina" data-v="Faturamento" class="${s.rotina === 'Faturamento' ? 'on' : ''}">Faturamento · 1º dia útil</button>
            <button type="button" data-action="f1-rotina" data-v="Baixa" class="${s.rotina === 'Baixa' ? 'on' : ''}">Baixas · 4º dia útil</button>
          </div></div>
        <label class="fld">Competência<input type="month" data-bind="f1.competencia" value="${esc(s.competencia)}"></label>
      </div>
      <div class="drop" role="button" tabindex="0" data-action="upload" data-alvo="f1">${iconeUpload}
        <strong>Arraste os relatórios aqui ou clique para escolher</strong>
        <span class="small muted">Integração do Protheus, Movimentação Contábil do Lyceum e Razão do Protheus. Pode ser um arquivo por relatório ou um único Excel com as abas.</span></div>
      ${listaArquivos(s.reports, F1_ARQS)}
      ${tabelasNoArquivo ? `<div class="alert info" style="margin-top:14px"><div><b>O arquivo também traz ${s.reports.tipoOperacao ? 'a tabela de Tipos de Operação' : ''}${s.reports.tipoOperacao && s.reports.regra ? ' e ' : ''}${s.reports.regra ? 'a tabela de Regras' : ''}.</b>Você pode atualizar os parâmetros do portal com ela (as condições já cadastradas são mantidas).</div><button class="btn ghost sm" data-action="f1-importar-tabelas" style="margin-left:auto">Atualizar parâmetros</button></div>` : ''}
      <div class="btns" style="margin-top:16px">
        <button class="btn" data-action="f1-processar" ${pronto ? '' : 'disabled'}>Processar conferência</button>
        ${Object.keys(s.reports).length ? '<button class="btn ghost" data-action="f1-limpar">Limpar arquivos</button>' : ''}
        ${pronto ? '' : '<span class="small muted">Suba os 3 relatórios para liberar o processamento.</span>'}
      </div>`;
    html += cardUpload(1, 'Relatórios do dia', s, soExecutora(upInner), `${F1_ARQS.filter(([t]) => s.reports[t]).length} relatórios · ${s.rotina === 'Baixa' ? 'Baixas' : 'Faturamento'} · ${compBR(s.competencia)}${s.conf ? ' · processado por ' + esc(s.conf.criado_por) + ' em ' + esc(s.conf.criado_em) : ''}`);

    if (!s.res) return html;
    const r = s.res, k = r.kpis;

    // Pré-análise
    html += `<div class="card"><div class="card-head">${tituloEtapa(2, 'Pré-análise das regras')}</div>` +
      (r.semRegra.length ? `<div class="alert warn"><div><b>${r.semRegra.length} tipo(s) de operação do Lyceum sem regra cadastrada.</b>Essas operações cairiam na conta lixo e não sobem para o Protheus. Avaliar a criação de regra no Agiros.</div></div>
        <div class="tbl-wrap"><table><thead><tr><th>Tipo</th><th>Nome</th><th class="num">Operações</th><th class="num">Valor</th></tr></thead><tbody>${r.semRegra.map((x) => `<tr><td>${esc(x.tipoOp)}</td><td>${esc(x.nome)}</td><td class="num">${int(x.qtd)}</td><td class="num">${brl(x.valor)}</td></tr>`).join('')}</tbody></table></div>`
        : `<div class="alert ok"><div><b>Todos os tipos de operação do Lyceum têm regra cadastrada.</b>Nenhuma operação vai para a conta lixo por falta de regra.</div></div>`) +
      `<p class="small muted">Fora do escopo desta rotina: ${int(k.naoContabiliza)} operações marcadas como "Não contabiliza" na tabela de tipos de operação.</p></div>`;

    // Conferência
    html += `<div class="card"><div class="card-head">${tituloEtapa(3, 'Conferência · ' + (r.rotina === 'Baixa' ? 'Baixas' : 'Faturamento') + ' · ' + compBR(s.competencia))}</div>
      <div class="grid k" style="margin-bottom:18px">
        ${kpi('Operações no escopo (Lyceum)', int(k.total), brl(k.valorTotal))}
        ${kpi('Contabilizadas', int(k.contabilizado), pct(k.contabilizado, k.total) + ' do total', 'ok')}
        ${kpi('Justificadas por regra', int(k.justificado), brl(k.valor_justificado))}
        ${kpi('Pendentes', int(k.pendentes), brl(k.valorPendente), k.pendentes ? 'bad' : 'ok')}
        ${kpi('Integradas sem origem no Lyceum', int(k.semOrigem), 'informativo', k.semOrigem ? 'warn' : '')}
      </div>
      ${k.pendentes ? `<div class="alert bad"><div><b>${int(k.pendentes)} operação(ões) pendente(s) em ${r.reprocessar.length} combinação(ões) de unidade e dia.</b>${int(k.nao_integrado)} não integraram · ${int(k.nao_contabilizado)} integraram mas não estão no razão · ${int(k.erro)} com erro na integração.</div></div>`
        : `<div class="alert ok"><div><b>Tudo conferido.</b>Todas as operações do escopo estão contabilizadas no razão ou justificadas por regra.</div></div>`}
      <h3 style="margin:18px 0 10px">Unidade x dia <span class="small muted" style="font-weight:400">· clique numa célula vermelha para filtrar as pendências</span></h3>
      ${matriz(r)}
      </div>`;

    html += cardPendencias(r);

    // Justificadas
    const just = agrupar(r.justificados, (j) => j.tipoOp, (j) => ({ tipoOp: j.tipoOp, nome: j.nomeTipoOp, analise: j.regraAnalise, acao: j.regraAcao }));
    html += `<div class="card"><div class="card-head"><h2>Justificadas automaticamente</h2><div class="btns">${pill('info', int(k.justificado) + ' operações')}</div></div>` +
      (just.length ? `<div class="tbl-wrap"><table><thead><tr><th>Tipo</th><th>Operação</th><th class="num">Qtd</th><th class="num">Valor</th><th>Regra aplicada</th><th>Ação</th>${avalHead(s)}</tr></thead><tbody>${just.map((g) => `<tr class="${classeAval('f1', 'j:' + g.tipoOp)}"><td>${esc(g.tipoOp)}</td><td>${esc(g.nome)}</td><td class="num">${int(g.qtd)}</td><td class="num">${brl(g.valor)}</td><td class="small">${esc(g.analise)}</td><td class="small">${esc(g.acao)}</td>${avalCells('f1', 'j:' + g.tipoOp)}</tr>`).join('')}</tbody></table></div>`
        : '<div class="empty">Nenhuma operação precisou de justificativa nesta conferência.</div>') + '</div>';

    if (r.semOrigem.length) {
      html += `<div class="card"><details class="box" style="margin:0;border:0;padding:0"><summary>Integrado no Protheus sem origem na movimentação do Lyceum (${int(r.semOrigem.length)}) · informativo</summary>
        <div class="tbl-wrap tbl-scroll"><table><thead><tr><th>Filial</th><th>Dia</th><th>ID operação</th><th>Tipo</th><th class="num">Valor</th><th>Histórico</th></tr></thead><tbody>${r.semOrigem.slice(0, 300).map((x) => `<tr><td>${esc(x.filial)}</td><td>${esc(dataBR(x.dia))}</td><td class="mono">${esc(x.idOp)}</td><td>${esc(x.tipoOp)} · ${esc(x.descTipoOp)}</td><td class="num">${brl(x.valor)}</td><td class="small">${esc(x.historico)}</td></tr>`).join('')}</tbody></table></div></details></div>`;
    }

    html += cardFluxo('f1', s, [
      ['f1-export', 'Conferência completa (Excel)'], ['f1-export-rep', 'Lista de reprocessamento (Excel)'],
    ], 'Registre as decisões das pendências e envie para aprovação. A aprovadora confere e aprova ou devolve. Depois da aprovação o portal entrega o relatório final e a lista de reprocessamento, só com os dias e unidades pendentes, nunca o período inteiro.');
    return html;
  }

  function agrupar(lista, chaveFn, baseFn) {
    const m = new Map();
    lista.forEach((x) => { const k = chaveFn(x); const g = m.get(k) || { ...baseFn(x), qtd: 0, valor: 0 }; g.qtd++; g.valor += x.valor; m.set(k, g); });
    return [...m.values()].sort((a, b) => b.qtd - a.qtd);
  }

  function matriz(r) {
    const m = r.matriz;
    return `<div class="tbl-wrap"><table class="mx"><thead><tr><th>Unidade</th>${m.dias.map((d) => `<th>${esc(diaMes(d))}</th>`).join('')}</tr></thead><tbody>` +
      m.filiais.map((f) => `<tr><td>${esc(nomeFilial(f))}</td>${m.dias.map((d) => {
        const c = m.cells[f + '|' + d];
        if (!c) return '<td><span class="c none">·</span></td>';
        if (c.pend) return `<td><button type="button" class="c bad" data-action="f1-cel" data-f="${esc(f)}" data-d="${esc(d)}" title="${esc(nomeFilial(f))} em ${esc(dataBR(d))}: ${c.pend} pendente(s) de ${c.total} · ${brl(c.valorPend)}">${c.pend}</button></td>`;
        return `<td><span class="c ok" title="${esc(nomeFilial(f))} em ${esc(dataBR(d))}: ${c.total} operações ok${c.just ? ' (' + c.just + ' justificadas)' : ''}">✓</span></td>`;
      }).join('')}</tr>`).join('') + '</tbody></table></div>';
  }

  function cardPendencias(r) {
    const s = state.f1, S = FAT.conferencia.STATUS;
    let lista = r.pendencias;
    if (s.filtro !== 'todas') lista = lista.filter((p) => p.status === s.filtro);
    if (s.filial) lista = lista.filter((p) => p.filial === s.filial);
    if (s.dia) lista = lista.filter((p) => p.dia === s.dia);
    if (s.busca) { const b = s.busca.toLowerCase(); lista = lista.filter((p) => [p.idOp, p.cobranca, p.aluno, p.nomeTipoOp, p.tipoOp, p.principCodLanc].join(' ').toLowerCase().includes(b)); }
    const LIM = 300;
    const chips = [['todas', 'Todas', r.kpis.pendentes], ['nao_integrado', S.nao_integrado, r.kpis.nao_integrado], ['nao_contabilizado', S.nao_contabilizado, r.kpis.nao_contabilizado], ['erro', S.erro, r.kpis.erro]];
    const decididas = Object.values(s.decisoes).filter((d) => d.decisao).length;
    return `<div class="card"><div class="card-head"><h2>Pendências</h2><div class="btns"><span class="small muted">${int(decididas)} de ${int(r.kpis.pendentes)} com decisão registrada</span></div></div>` +
      (r.pendencias.length ? `
      <div class="chips" style="margin-bottom:12px">${chips.map(([v, t, n]) => `<button type="button" class="chip ${s.filtro === v ? 'on' : ''}" data-action="f1-filtro" data-v="${v}">${esc(t)} · ${int(n)}</button>`).join('')}</div>
      <div class="row" style="margin-bottom:12px">
        <label class="fld">Unidade<select data-bind="f1.filial"><option value="">Todas</option>${r.matriz.filiais.map((f) => `<option value="${esc(f)}" ${s.filial === f ? 'selected' : ''}>${esc(nomeFilial(f))}</option>`).join('')}</select></label>
        <label class="fld">Dia<select data-bind="f1.dia"><option value="">Todos</option>${r.matriz.dias.map((d) => `<option value="${esc(d)}" ${s.dia === d ? 'selected' : ''}>${esc(dataBR(d))}</option>`).join('')}</select></label>
        <label class="fld" style="flex:1;min-width:200px">Buscar<input type="search" data-bind="f1.busca" value="${esc(s.busca)}" placeholder="ID, cobrança, aluno, tipo..."></label>
      </div>
      <div class="tbl-wrap tbl-scroll"><table><thead><tr>${avalHead(s)}<th>Situação</th><th>Unidade</th><th>Dia</th><th>ID operação</th><th>Tipo de operação</th><th class="num">Valor</th><th>Decisão</th><th>Observação</th><th>Cobrança</th><th>PRINCIP_COD_LANC</th></tr></thead><tbody>
      ${lista.slice(0, LIM).map((p) => { const d = s.decisoes[p.idOp] || {}; return `<tr class="${classeAval('f1', 'p:' + p.idOp)}" data-pend="${esc(p.idOp)}">${avalCells('f1', 'p:' + p.idOp)}
        <td>${pill(p.status === 'erro' ? 'bad' : p.status === 'nao_contabilizado' ? 'warn' : 'bad', S[p.status])}</td>
        <td>${esc(p.filial)}</td><td>${esc(dataBR(p.dia))}</td><td class="mono">${esc(p.idOp)}</td>
        <td>${esc(p.tipoOp)} · ${esc(p.nomeTipoOp)}${p.msgErro ? `<div class="small" style="color:var(--bad)">${esc(p.msgErro)}</div>` : ''}</td>
        <td class="num">${brl(p.valor)}</td>
        <td><select data-dec="${esc(p.idOp)}" ${podeDecidir(s) ? '' : 'disabled'} aria-label="Decisão da operação ${esc(p.idOp)}"><option value="">-</option>${['Reprocessar', 'Justificar', 'Criar regra', 'Abrir chamado'].map((o) => `<option ${d.decisao === o ? 'selected' : ''}>${o}</option>`).join('')}</select></td>
        <td><input type="text" data-obs="${esc(p.idOp)}" ${podeDecidir(s) ? '' : 'disabled'} value="${esc(d.obs || '')}" aria-label="Observação da operação ${esc(p.idOp)}" style="min-width:160px"></td><td class="mono">${esc(p.cobranca)}</td><td class="small">${esc(p.principCodLanc)}</td></tr>`; }).join('')}
      </tbody></table></div>
      <p class="small muted" style="margin-top:8px">${lista.length > LIM ? `Mostrando ${LIM} de ${int(lista.length)}. A exportação traz todas.` : `${int(lista.length)} pendência(s) no filtro.`}</p>
      <details class="box"><summary>Resumo por tipo de operação</summary><div class="tbl-wrap"><table><thead><tr><th>Situação</th><th>Tipo</th><th class="num">Qtd</th><th class="num">Valor</th></tr></thead><tbody>${r.porTipo.map((g) => `<tr><td>${esc(S[g.status])}</td><td>${esc(g.tipoOp)} · ${esc(g.nome)}</td><td class="num">${int(g.qtd)}</td><td class="num">${brl(g.valor)}</td></tr>`).join('')}</tbody></table></div></details>
      <details class="box"><summary>Dias e unidades a reprocessar (${r.reprocessar.length})</summary><div class="tbl-wrap"><table><thead><tr><th>Unidade</th><th>Dia</th><th class="num">Pendências</th><th class="num">Valor</th><th>Motivos</th></tr></thead><tbody>${r.reprocessar.map((x) => `<tr><td>${esc(nomeFilial(x.filial))}</td><td>${esc(dataBR(x.dia))}</td><td class="num">${int(x.qtd)}</td><td class="num">${brl(x.valor)}</td><td class="small">${esc(x.motivos)}</td></tr>`).join('')}</tbody></table></div></details>`
        : '<div class="empty">Nenhuma pendência.</div>') + '</div>';
  }

  // ---------- aval da aprovadora, item a item ----------
  // Itens que a aprovadora avalia: pendências e justificadas (Frente 1), unidades do resumo (Frente 2).
  function itensAval(fr) {
    const s = state[fr];
    if (!s.res) return [];
    if (fr === 'f1') {
      const S = FAT.conferencia.STATUS;
      const just = agrupar(s.res.justificados, (j) => j.tipoOp, (j) => ({ tipoOp: j.tipoOp, nome: j.nomeTipoOp, analise: j.regraAnalise, acao: j.regraAcao }));
      return [
        ...s.res.pendencias.map((x) => { const d = s.decisoes[x.idOp] || {}; return { key: 'p:' + x.idOp, grupo: 'Pendências', label: `Pendência ${x.idOp} · tipo ${x.tipoOp} · ${x.filial} ${dataBR(x.dia)}`,
          titulo: `${x.tipoOp} · ${x.nomeTipoOp}`, sub: `${S[x.status]} · ${x.filial} · ${dataBR(x.dia)} · ${brl(x.valor)}`,
          campos: [['Situação', S[x.status]], ['Unidade', nomeFilial(x.filial)], ['Dia', dataBR(x.dia)], ['ID operação', x.idOp], ['Tipo de operação', x.tipoOp + ' · ' + x.nomeTipoOp], ['Valor', brl(x.valor)], ['Cobrança', x.cobranca], ['PRINCIP_COD_LANC', x.principCodLanc], ...(x.msgErro ? [['Erro na integração', x.msgErro, 1]] : []), ['Decisão da executora', d.decisao || 'Sem decisão registrada', d.decisao ? 0 : 1], ['Observação da executora', d.obs || '-']] }; }),
        ...just.map((g) => ({ key: 'j:' + g.tipoOp, grupo: 'Justificadas por regra', label: `Justificadas tipo ${g.tipoOp} · ${g.nome} (${g.qtd})`,
          titulo: `${g.tipoOp} · ${g.nome}`, sub: `${int(g.qtd)} operações · ${brl(g.valor)}`,
          campos: [['Tipo de operação', g.tipoOp + ' · ' + g.nome], ['Operações', int(g.qtd)], ['Valor', brl(g.valor)], ['Regra aplicada', g.analise || '-'], ['Ação', g.acao || '-']] })),
      ];
    }
    return s.res.consolidado.map((u) => {
      const un = s.res.unidades.find((x) => x.unidade === u.unidade), c = un ? un.check : null;
      const okF = !c || Math.abs(c.difFaturamento) <= 0.05, okA = !c || c.difAlunos === 0;
      return { key: 'u:' + u.unidade, grupo: 'Unidades do consolidado', label: 'Unidade ' + u.unidade, titulo: u.unidade,
        sub: `${int(u.qtd)} alunos · ticket ${n2(u.ticket)} · check ${okF && okA ? 'ok' : 'com diferença'}`,
        campos: [['Qtd alunos', int(u.qtd)], ['Ticket médio', n2(u.ticket)], ...s.res.topicos.map((t) => [t, n2(u[t])]),
          ...(c ? [['Faturamento resumo x razão', `${n2(c.faturamentoResumo)} x ${n2(c.faturamentoRazao)} (dif. ${n2(c.difFaturamento)})`, okF ? 0 : 1], ['Alunos resumo x BI', `${int(c.alunosResumo)} x ${int(c.alunosBI)} (dif. ${int(c.difAlunos)})`, okA ? 0 : 1]] : [])] };
    });
  }
  function contagemAval(fr) {
    const s = state[fr], itens = itensAval(fr);
    const c = { total: itens.length, sim: 0, nao: 0, sem: 0, desacordos: [] };
    itens.forEach((i) => { const a = s.aval[i.key] || {}; if (a.ok === 'sim') c.sim++; else if (a.ok === 'nao') { c.nao++; c.desacordos.push({ ...i, obs: a.obs || '' }); } else c.sem++; });
    return c;
  }
  const mostraAval = (s) => s.fluxo.status === 'devolvido' || s.fluxo.status === 'aprovado';
  const avalHead = (s) => (mostraAval(s) ? '<th class="aval-h">Aval da aprovadora</th><th class="aval-h">Obs. da aprovadora</th>' : '');
  function avalCells(fr, key) {
    const s = state[fr];
    if (!mostraAval(s)) return '';
    const a = s.aval[key] || {};
    return `<td class="aval">${a.ok === 'sim' ? pill('ok', 'De acordo') : a.ok === 'nao' ? pill('bad', 'Não de acordo') : '<span class="muted small">-</span>'}</td><td class="aval small">${esc(a.obs || '')}</td>`;
  }
  const classeAval = (fr, key) => { const a = state[fr].aval[key]; return a && a.ok ? 'aval-' + a.ok : ''; };
  function resumoAvalHTML(fr) {
    const c = contagemAval(fr);
    if (!c.total) return '<p class="small muted">Nenhum item para avaliar nesta conferência.</p>';
    return `<div class="aval-resumo"><span>${pill('ok', int(c.sim) + ' de acordo')}</span><span>${pill('bad', int(c.nao) + ' não de acordo')}</span><span>${pill('info', int(c.sem) + ' sem aval')}</span><span class="small muted">de ${int(c.total)} itens</span></div>` +
      (c.desacordos.length ? `<ul class="small" style="margin:8px 0 0;padding-left:18px">${c.desacordos.slice(0, 15).map((d) => `<li>${esc(d.label)}${d.obs ? ' · ' + esc(d.obs) : ''}</li>`).join('')}${c.desacordos.length > 15 ? `<li>e mais ${c.desacordos.length - 15}</li>` : ''}</ul>` : '');
  }
  // Itens no filtro atual. O item selecionado fica visível até a aprovadora sair dele.
  function avalVisiveis(fr) {
    const s = state[fr], f = s.avalFiltro, b = (s.avalBusca || '').toLowerCase();
    return itensAval(fr).filter((i) => { const ok = (s.aval[i.key] || {}).ok; return (f === 'todos' || (f === 'sem' && !ok) || f === ok || i.key === s.sel) && (!b || (i.titulo + ' ' + i.sub + ' ' + i.label).toLowerCase().includes(b)); });
  }
  const LIM_AV = 600;
  function avalWsInner(fr) {
    const s = state[fr], itens = itensAval(fr), c = contagemAval(fr);
    if (!itens.length) return '<div class="av-empty">Nenhum item para avaliar nesta conferência. Pode seguir para a decisão final.</div>';
    let vis = avalVisiveis(fr);
    if (!vis.some((i) => i.key === s.sel)) { s.sel = (vis[0] || {}).key || ''; vis = avalVisiveis(fr); }
    const sel = itens.find((i) => i.key === s.sel);
    const fil = [['todos', 'Todos', c.total], ['sem', 'Sem aval', c.sem], ['nao', 'Não de acordo', c.nao], ['sim', 'De acordo', c.sim]];
    const semVis = vis.filter((i) => !(s.aval[i.key] || {}).ok).length;
    let grp = '', lista = '';
    vis.slice(0, LIM_AV).forEach((i) => {
      if (i.grupo !== grp) { grp = i.grupo; lista += `<li class="av-grp">${esc(grp)}</li>`; }
      const ok = (s.aval[i.key] || {}).ok || 'sem';
      lista += `<li class="av-item st-${ok} ${i.key === s.sel ? 'on' : ''}" data-action="aval-sel" data-fr="${fr}" data-key="${esc(i.key)}" role="option" aria-selected="${i.key === s.sel}"><span class="mk"></span><span class="tx"><b>${esc(i.titulo)}</b><small>${esc(i.sub)}</small></span><span class="st" title="${ok === 'sim' ? 'De acordo' : ok === 'nao' ? 'Não de acordo' : 'Sem aval'}">${ok === 'sim' ? '✓' : ok === 'nao' ? '✕' : ''}</span></li>`;
    });
    if (vis.length > LIM_AV) lista += `<li class="av-empty small">Mostrando ${LIM_AV} de ${int(vis.length)}. Use a busca para achar os demais.</li>`;
    if (!vis.length) lista = '<li class="av-empty">Nenhum item neste filtro.</li>';
    const a = sel ? s.aval[sel.key] || {} : {};
    const pos = sel ? vis.findIndex((i) => i.key === sel.key) : -1;
    const painel = !sel ? '<div class="av-empty">Selecione um item na lista.</div>' : `
      <div><div class="av-pos">${esc(sel.grupo)} · item ${pos + 1} de ${int(vis.length)}${s.avalFiltro !== 'todos' || s.avalBusca ? ' no filtro' : ''}</div><h3>${esc(sel.titulo)}</h3></div>
      <dl class="av-dl">${sel.campos.map(([k, v, hl]) => `<dt>${esc(k)}</dt><dd class="${hl ? 'hl' : ''}">${esc(v == null || v === '' ? '-' : v)}</dd>`).join('')}</dl>
      <div class="av-choice" role="group" aria-label="Seu aval">
        <button type="button" class="av-btn sim ${a.ok === 'sim' ? 'on' : ''}" data-action="aval-set" data-fr="${fr}" data-v="sim" aria-pressed="${a.ok === 'sim'}"><kbd>A</kbd> De acordo</button>
        <button type="button" class="av-btn nao ${a.ok === 'nao' ? 'on' : ''}" data-action="aval-set" data-fr="${fr}" data-v="nao" aria-pressed="${a.ok === 'nao'}"><kbd>N</kbd> Não de acordo</button>
      </div>
      <label class="fld">Observação da aprovadora<textarea data-avalobs="${fr}|${esc(sel.key)}" rows="2" placeholder="${a.ok === 'nao' ? 'Diga o que precisa ser ajustado' : 'Opcional'}">${esc(a.obs || '')}</textarea></label>
      <div class="av-nav"><button type="button" class="btn ghost sm" data-action="aval-nav" data-fr="${fr}" data-d="-1" ${pos <= 0 ? 'disabled' : ''}>Anterior</button><button type="button" class="btn ghost sm" data-action="aval-nav" data-fr="${fr}" data-d="1" ${pos >= vis.length - 1 ? 'disabled' : ''}>Próximo</button><span class="hint"><kbd>A</kbd> de acordo · <kbd>N</kbd> não de acordo · <kbd>↑</kbd> <kbd>↓</kbd> navegar · <kbd>Esc</kbd> sai da observação</span></div>`;
    return `<div class="av-head"><div><h2>Aval da aprovadora</h2><p>Confira item a item. Para aprovar, todos precisam estar de acordo. Item em desacordo volta para ajuste com a sua observação.</p></div>
        <div class="av-prog"><div class="bar"><i style="width:${(c.sim / c.total) * 100}%"></i><i class="n" style="width:${(c.nao / c.total) * 100}%"></i></div><span>${int(c.sim + c.nao)} de ${int(c.total)} avaliados · ${int(c.sim)} de acordo · ${int(c.nao)} não de acordo</span></div></div>
      <div class="av-tools"><div class="chips" role="group" aria-label="Filtrar itens">${fil.map(([v, t, n]) => `<button type="button" class="chip ${s.avalFiltro === v ? 'on' : ''}" data-action="aval-filtro" data-fr="${fr}" data-v="${v}">${t} · ${int(n)}</button>`).join('')}</div>
        <input type="search" data-avalbusca="${fr}" value="${esc(s.avalBusca)}" placeholder="Buscar ID, tipo, unidade..." aria-label="Buscar item">
        ${semVis ? `<button type="button" class="btn ghost sm" data-action="aval-todos" data-fr="${fr}">De acordo nos ${int(semVis)} sem aval${s.avalFiltro !== 'todos' || s.avalBusca ? ' do filtro' : ''}</button>` : ''}</div>
      <div class="av-body"><ul class="av-list" role="listbox" aria-label="Itens para avaliar">${lista}</ul><div class="av-panel">${painel}</div></div>`;
  }
  const avalWs = (fr) => `<section class="avalws" id="avalws-${fr}" aria-label="Aval da aprovadora">${avalWsInner(fr)}</section>`;

  // Atualiza só o painel de aval, sem redesenhar a página (mantém rolagem e foco).
  function atualizaAval(fr, focarObs) {
    const el = document.getElementById('avalws-' + fr);
    if (!el) { render(); return; }
    const l1 = el.querySelector('.av-list'), top = l1 ? l1.scrollTop : 0;
    const ae = document.activeElement, caret = ae && ae.dataset && ae.dataset.avalbusca != null ? ae.selectionStart : null;
    el.innerHTML = avalWsInner(fr);
    const l2 = el.querySelector('.av-list');
    if (l2) {
      l2.scrollTop = top;
      const on = l2.querySelector('.av-item.on');
      if (on) { const a = on.offsetTop - 30, b = on.offsetTop + on.offsetHeight; if (a < l2.scrollTop) l2.scrollTop = a; else if (b > l2.scrollTop + l2.clientHeight) l2.scrollTop = b - l2.clientHeight + 4; }
    }
    if (caret != null) { const b = el.querySelector('[data-avalbusca]'); if (b) { b.focus(); b.setSelectionRange(caret, caret); } }
    else if (focarObs) { const t = el.querySelector('textarea[data-avalobs]'); if (t) t.focus(); }
    const f = document.getElementById('decisao-falta-' + fr); if (f) f.innerHTML = faltaTxt(fr);
  }
  function marcarAval(fr, v) {
    const s = state[fr]; if (!s.sel) return;
    const vis = avalVisiveis(fr), idx = vis.findIndex((i) => i.key === s.sel);
    const a = s.aval[s.sel] || (s.aval[s.sel] = {}); a.ok = v; agendar(fr, 'aval', s.sel);
    if (v === 'sim') {
      const prox = vis.slice(idx + 1).concat(vis.slice(0, Math.max(idx, 0))).find((i) => !(s.aval[i.key] || {}).ok);
      if (prox) s.sel = prox.key; else if (vis[idx + 1]) s.sel = vis[idx + 1].key;
    }
    atualizaAval(fr, v === 'nao');
  }
  function moverSel(fr, d) {
    const s = state[fr], vis = avalVisiveis(fr), i = vis.findIndex((x) => x.key === s.sel);
    const n = vis[Math.min(vis.length - 1, Math.max(0, i + d))];
    if (n && n.key !== s.sel) { s.sel = n.key; atualizaAval(fr); }
  }
  function faltaTxt(fr) {
    const c = contagemAval(fr);
    if (c.nao) return `<span style="color:var(--bad)">${int(c.nao)} item(ns) não de acordo. Use "Devolver para ajuste".</span>`;
    if (c.sem) return `<span class="muted">Faltam ${int(c.sem)} item(ns) sem aval no painel acima.</span>`;
    return '<span style="color:var(--ok)">Todos os itens de acordo. Pode aprovar.</span>';
  }
  const tramiteHTML = (f) => (f.tramite.length ? `<details class="box"><summary>Trâmite (${f.tramite.length})</summary><ul class="small" style="margin:8px 0 0;padding-left:18px">${f.tramite.map((t) => `<li><b>${esc(t.acao)}</b> por ${esc(t.por)} em ${esc(t.em)}${t.obs ? ' · ' + esc(t.obs) : ''}</li>`).join('')}</ul></details>` : '');
  function decisaoBox(fr) {
    const s = state[fr], f = s.fluxo;
    return `<div class="card decisao" id="decisao-${fr}"><div class="card-head"><h2>Decisão final</h2>${pill('warn', 'Aguardando aprovação de ' + s.valPor)}</div>
      <p class="small muted" style="margin-bottom:12px">Enviado por ${esc(f.envio.por)} em ${esc(f.envio.em)}.${f.envio.obs ? ' Comentário: ' + esc(f.envio.obs) : ''} As tabelas abaixo ficam para consulta.</p>
      <div class="row" style="margin-bottom:12px">
        ${R.ativo ? `<label class="fld">Aprovado por<input type="text" value="${esc(R.me.nome)}" disabled></label>` : `<label class="fld">Aprovado por<input type="text" data-bind="${fr}.valPor" value="${esc(s.valPor)}"></label>`}
        <label class="fld" style="flex:1;min-width:240px">Parecer<input type="text" data-bind="${fr}.valObs" value="${esc(s.valObs)}" placeholder="Obrigatório para devolver sem item marcado"></label>
      </div>
      <label class="check" style="margin-bottom:14px"><input type="checkbox" data-bind="${fr}.valCheck" ${s.valCheck ? 'checked' : ''}>${fr === 'f1' ? 'Conferi as pendências, as decisões e as justificativas' : 'Conferi o consolidado, o check e as exceções'}</label>
      <div class="btns"><button class="btn" data-action="fluxo-aprovar" data-fr="${fr}">Aprovar</button><button class="btn danger" data-action="fluxo-devolver" data-fr="${fr}">Devolver para ajuste</button><button class="btn ghost" data-action="fluxo-previa" data-fr="${fr}">Prévia do relatório</button><span class="small" id="decisao-falta-${fr}" style="margin-left:6px">${faltaTxt(fr)}</span></div>${tramiteHTML(f)}</div>`;
  }

  // Etapas do fluxo: envio dos arquivos > conferência > aprovação > resultado final
  function etapas(s, pronto) {
    const st = s.fluxo.status;
    const passos = [
      ['Envio dos arquivos', 'Executora sobe os relatórios', pronto || s.res ? 'done' : 'now'],
      ['Conferência', 'Portal cruza e aponta o que precisa de atenção', !s.res ? 'todo' : st === 'rascunho' || st === 'devolvido' ? 'now' : 'done'],
      ['Aprovação', st === 'devolvido' ? 'Devolvido para ajuste' : 'Responsável confere e aprova ou devolve', st === 'em_aprovacao' ? 'now' : st === 'aprovado' ? 'done' : st === 'devolvido' ? 'back' : 'todo'],
      ['Resultado final', 'Relatório HTML e Excel liberados', st === 'aprovado' ? 'done' : 'todo'],
    ];
    return `<ol class="flow" aria-label="Etapas do fluxo">${passos.map(([t, d, c], i) => `<li class="${c}"><span class="dot">${c === 'done' ? '✓' : i + 1}</span><span><b>${esc(t)}</b><small>${esc(d)}</small></span></li>`).join('')}</ol>`;
  }

  function cardFluxo(fr, s, acoesExcel, texto) {
    const f = s.fluxo, st = f.status, n = fr === 'f1' ? 4 : 3;
    const tram = tramiteHTML(f);
    let corpo = '';
    if (st === 'rascunho' || st === 'devolvido') {
      corpo = (st === 'devolvido' ? `<div class="alert bad"><div><b>Devolvido por ${esc(f.devolucao.por)} em ${esc(f.devolucao.em)}.</b>${esc(f.devolucao.obs)}</div></div><h3 style="margin:14px 0 6px">Aval da aprovadora</h3>${resumoAvalHTML(fr)}<p class="small muted" style="margin:6px 0 14px">Os itens em desacordo aparecem em vermelho nas tabelas acima, com a observação dela.</p>` : '') + (podeExecutar() ? '' : '<p class="small muted" style="margin-bottom:10px">Quem registra as decisões e envia para aprovação é a executora.</p>') + roAbre(podeExecutar()) +
        `<p class="muted" style="margin-bottom:14px">${esc(texto)}</p>
        <div class="row" style="margin-bottom:12px">
          ${camposEnvio(fr, s)}
          <label class="fld" style="flex:1;min-width:220px">Comentário para a aprovação<input type="text" data-bind="${fr}.envObs" value="${esc(s.envObs)}" placeholder="${st === 'devolvido' ? 'O que foi ajustado' : 'Opcional'}"></label>
        </div>
        <div class="btns"><button class="btn" data-action="fluxo-enviar" data-fr="${fr}">${st === 'devolvido' ? 'Reenviar para aprovação' : 'Enviar para aprovação'}</button><span class="lock">Relatório final liberado após a aprovação</span></div>` + roFecha(podeExecutar());
    } else if (st === 'aprovado') {
      corpo = `<div class="alert ok"><div><b>Aprovado por ${esc(f.aprovacao.por)} em ${esc(f.aprovacao.em)}.</b>${f.aprovacao.parecer ? esc(f.aprovacao.parecer) : 'Sem observações.'}</div></div><h3 style="margin:14px 0 6px">Aval da aprovadora</h3>${resumoAvalHTML(fr)}`;
    }
    let html = st === 'em_aprovacao' ? '' : `<div class="card"><div class="card-head">${tituloEtapa(n, 'Aprovação')}${pill(STATUS_FLUXO[st][0], STATUS_FLUXO[st][1])}</div>${corpo}${tram}</div>`;
    const ok = st === 'aprovado';
    html += `<div class="card ${ok ? 'final' : ''}"><div class="card-head">${tituloEtapa(n + 1, 'Resultado final', ok)}</div>
      ${ok ? '<p class="muted" style="margin-bottom:14px">Relatório final em HTML, no formato de painel, com o carimbo da aprovação. Abre em qualquer navegador e pode ser impresso ou salvo em PDF. O Excel traz a base completa.</p>' : '<p class="muted" style="margin-bottom:14px">Liberado assim que a aprovação for registrada.</p>'}
      <div class="btns">
        <button class="btn" data-action="fluxo-relatorio" data-fr="${fr}" ${ok ? '' : 'disabled'}>Baixar relatório final (HTML)</button>
        <button class="btn ghost" data-action="fluxo-abrir" data-fr="${fr}" ${ok ? '' : 'disabled'}>Abrir relatório</button>
        ${acoesExcel.map(([a, t]) => `<button class="btn ghost" data-action="${a}" ${ok ? '' : 'disabled'}>${esc(t)}</button>`).join('')}
      </div></div>`;
    return html;
  }

  // ======================================================== FRENTE 2
  const F2_ARQS = [['razao', 'Razão (Protheus) - contas de resultado'], ['baseAlunos', 'Base de Alunos (BI)'], ['alunosLyceum', 'Alunos por matrícula (Lyceum) - reserva para RA não encontrado', true]];

  function vFrente2() {
    const s = state.f2;
    const pronto = !!(s.reports.razao && s.reports.razao.rows && s.reports.baseAlunos && s.reports.baseAlunos.rows);
    let html = cabecalho('Frente 2', 'Resumo de Tópicos',
      'Abertura da receita por unidade, tipo de aluno (pagante, ProUni, FIES) e semestre, a partir da mesma base: razão do Protheus classificado por tópico e base de alunos do BI.',
      `<div>${pillFluxo(s)}</div>`) + etapas(s, pronto) + guiaAgora(FR_ATUAL());

    html += blocoAprovacao('f2');
    const upInner = `<div class="row" style="margin-bottom:16px"><label class="fld">Competência<input type="month" data-bind="f2.competencia" value="${esc(s.competencia)}"></label>
      ${state.f1.reports.razao && state.f1.reports.razao.rows && !(s.reports.razao && s.reports.razao.rows) ? '<button class="btn ghost" data-action="f2-usar-razao">Usar o razão já carregado na Frente 1</button>' : ''}</div>
      <div class="drop" role="button" tabindex="0" data-action="upload" data-alvo="f2">${iconeUpload}
        <strong>Arraste as bases aqui ou clique para escolher</strong>
        <span class="small muted">Razão do Protheus (contas de receita) e Base de Alunos do BI. A lista de alunos por matrícula do Lyceum é opcional.</span></div>
      ${listaArquivos(s.reports, F2_ARQS)}
      <div class="btns" style="margin-top:16px"><button class="btn" data-action="f2-processar" ${pronto ? '' : 'disabled'}>Gerar resumo</button>
      ${Object.keys(s.reports).length ? '<button class="btn ghost" data-action="f2-limpar">Limpar arquivos</button>' : ''}</div>`;
    html += cardUpload(1, 'Bases do mês', s, soExecutora(upInner), `${F2_ARQS.filter(([t]) => s.reports[t]).length} bases · ${compBR(s.competencia)}${s.conf ? ' · processado por ' + esc(s.conf.criado_por) + ' em ' + esc(s.conf.criado_em) : ''}`);

    if (!s.res) return html;
    const r = s.res, T = FAT.resumo.T, tg = r.totalGeral;
    const difs = r.unidades.filter((u) => Math.abs(u.check.difFaturamento) > 0.05 || u.check.difAlunos !== 0);
    const ex = r.excecoes;

    html += `<div class="card"><div class="card-head">${tituloEtapa(2, 'Resumo · ' + compBR(s.competencia))}</div>
      <div class="grid k" style="margin-bottom:16px">
        ${kpi('Faturamento por semestre', brl(Math.abs(tg[T.FAT])), 'todas as unidades')}
        ${kpi('Alunos (BI)', int(tg.qtd), 'pagante + ProUni + FIES')}
        ${kpi('Ticket médio', brl(Math.abs(tg.ticket)), 'faturamento ÷ alunos')}
        ${kpi('Check razão x resumo', difs.length ? int(difs.length) + ' unidade(s)' : 'OK', difs.length ? 'com diferença' : 'faturamento e alunos batem', difs.length ? 'bad' : 'ok')}
      </div>
      ${difs.length ? `<div class="alert bad"><div><b>Diferença entre resumo e razão/BI.</b>${difs.map((u) => esc(u.unidade)).join(', ')}. Veja o check abaixo e as exceções.</div></div>`
        : '<div class="alert ok"><div><b>Check fechado.</b>O faturamento de cada unidade bate com o razão e a quantidade de alunos bate com o BI.</div></div>'}
      <div class="card-head" style="margin:16px 0 10px"><h3 style="margin:0">Consolidado</h3></div>
      <div class="tbl-wrap"><table><thead><tr><th>Unidade</th>${avalHead(s)}<th class="num">Qtd alunos</th><th class="num">Ticket médio</th>${r.topicos.map((t) => `<th class="num">${esc(t)}</th>`).join('')}</tr></thead><tbody>
      ${[...r.consolidado, tg].map((c, i, a) => { const tot = i === a.length - 1; return `<tr class="${tot ? 'total' : classeAval('f2', 'u:' + c.unidade)}"><td>${esc(c.unidade)}</td>${tot ? (mostraAval(s) ? '<td></td><td></td>' : '') : avalCells('f2', 'u:' + c.unidade)}<td class="num">${int(c.qtd)}</td><td class="num">${n2(c.ticket)}</td>${r.topicos.map((t) => `<td class="num">${n2(c[t])}</td>`).join('')}</tr>`; }).join('')}
      </tbody></table></div>
      <p class="small muted" style="margin-top:8px">Valores com o sinal do razão (receita negativa, deduções positivas), igual à planilha do resumo.</p></div>`;

    // Detalhe por unidade
    const un = r.unidades.find((u) => u.unidade === s.unidade) || r.unidades[0];
    const bl = s.bloco;
    const linhas = bl === 'TOTAL' ? null : un.blocos[bl];
    html += `<div class="card"><div class="card-head"><h2>Detalhe por unidade</h2>
      <label class="fld" style="flex-direction:row;align-items:center;gap:8px">Unidade<select data-bind="f2.unidade">${r.unidades.map((u) => `<option ${u.unidade === un.unidade ? 'selected' : ''}>${esc(u.unidade)}</option>`).join('')}</select></label></div>
      <p class="small muted" style="margin-bottom:12px">${esc(un.razaoSocial)} · filial ${esc(un.filial)} · BI "${esc(un.unidadeBI)}" · ISS ${n2(un.iss * 100)}% · PDD ${n2(un.pdd * 100)}%</p>
      <div class="tabs" role="tablist">${['PAGANTE', 'PROUNI', 'FIES', 'TOTAL'].map((b) => `<button type="button" role="tab" aria-selected="${bl === b}" class="${bl === b ? 'on' : ''}" data-action="f2-bloco" data-v="${b}">${b === 'TOTAL' ? 'Total por tipo' : b === 'PROUNI' ? 'ProUni' : b.charAt(0) + b.slice(1).toLowerCase()}</button>`).join('')}</div>
      <div class="tbl-wrap"><table><thead><tr><th>${linhas ? 'Semestre' : 'Tipo de aluno'}</th><th class="num">Qtd</th><th class="num">Ticket médio</th>${r.topicos.map((t) => `<th class="num">${esc(t)}</th>`).join('')}${linhas ? '<th class="num">Ticket líquido</th>' : ''}</tr></thead><tbody>
      ${linhas ? linhas.map((l) => `<tr><td>${esc(l.serie)}º</td><td class="num">${int(l.qtd)}</td><td class="num">${n2(l.ticket)}</td>${r.topicos.map((t) => `<td class="num">${n2(l.valores[t])}</td>`).join('')}<td class="num">${n2(l.ticketLiquido)}</td></tr>`).join('') +
        `<tr class="total"><td>Total</td><td class="num">${int(un.totalBloco[bl].qtd)}</td><td class="num">${n2(un.totalBloco[bl].ticket)}</td>${r.topicos.map((t) => `<td class="num">${n2(un.totalBloco[bl].valores[t])}</td>`).join('')}<td></td></tr>`
        : FAT.resumo.TIPOS_ALUNO.map((t) => `<tr><td>${esc(t)}</td><td class="num">${int(un.totalBloco[t].qtd)}</td><td class="num">${n2(un.totalBloco[t].ticket)}</td>${r.topicos.map((k) => `<td class="num">${n2(un.totalBloco[t].valores[k])}</td>`).join('')}</tr>`).join('') +
        `<tr class="total"><td>Total da unidade</td><td class="num">${int(un.total.qtd)}</td><td class="num">${n2(un.total.ticket)}</td>${r.topicos.map((k) => `<td class="num">${n2(un.total.valores[k])}</td>`).join('')}</tr>`}
      </tbody></table></div></div>`;

    // Check + exceções
    html += `<div class="card"><div class="card-head"><h2>Check e exceções</h2></div>
      <div class="tbl-wrap"><table><thead><tr><th>Unidade</th><th class="num">Faturamento resumo</th><th class="num">Faturamento razão</th><th class="num">Diferença</th><th class="num">Alunos resumo</th><th class="num">Alunos BI</th><th class="num">Diferença</th></tr></thead><tbody>
      ${r.unidades.map((u) => { const c = u.check; const okF = Math.abs(c.difFaturamento) <= 0.05, okA = c.difAlunos === 0; return `<tr><td>${esc(u.unidade)}</td><td class="num">${n2(c.faturamentoResumo)}</td><td class="num">${n2(c.faturamentoRazao)}</td><td class="num" style="color:${okF ? 'var(--ok)' : 'var(--bad)'}">${n2(c.difFaturamento)}</td><td class="num">${int(c.alunosResumo)}</td><td class="num">${int(c.alunosBI)}</td><td class="num" style="color:${okA ? 'var(--ok)' : 'var(--bad)'}">${int(c.difAlunos)}</td></tr>`; }).join('')}
      </tbody></table></div>
      <details class="box"><summary>Lançamentos sem aluno classificado (${int(ex.semAluno.length)})</summary>${ex.semAluno.length ? `<div class="tbl-wrap tbl-scroll"><table><thead><tr><th>Unidade</th><th>Conta</th><th>Tópico</th><th>RA</th><th>Data</th><th>Histórico</th><th class="num">Movimento</th></tr></thead><tbody>${ex.semAluno.slice(0, 300).map((x) => `<tr><td>${esc(x.unidade)}</td><td class="mono">${esc(x.conta)}</td><td>${esc(x.topico)}</td><td class="mono">${esc(x.ra)}</td><td>${esc(dataBR(x.data))}</td><td class="small">${esc(x.historico)}</td><td class="num">${n2(x.movimento)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nenhum. Todos os lançamentos foram classificados pelo RA.</p>'}</details>
      <details class="box"><summary>Lançamentos fora das unidades do resumo (${int(ex.foraUnidade.length)})</summary>${ex.foraUnidade.length ? `<div class="tbl-wrap tbl-scroll"><table><thead><tr><th>Filial</th><th>C. custo</th><th>Conta</th><th>Tópico</th><th>Data</th><th>Histórico</th><th class="num">Movimento</th></tr></thead><tbody>${ex.foraUnidade.slice(0, 300).map((x) => `<tr><td>${esc(x.filial)}</td><td>${esc(x.cc)}</td><td class="mono">${esc(x.conta)}</td><td>${esc(x.topico)}</td><td>${esc(dataBR(x.data))}</td><td class="small">${esc(x.historico)}</td><td class="num">${n2(x.movimento)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nenhum.</p>'}</details>
      <details class="box"><summary>Contas de receita sem tópico (${int(ex.contasSemTopico.length)}) · não entram no resumo</summary>${ex.contasSemTopico.length ? `<p class="small muted" style="margin-bottom:8px">Se alguma dessas contas deve entrar, mapeie em Regras e parâmetros &gt; Tópicos do resumo.</p><div class="tbl-wrap"><table><thead><tr><th>Conta</th><th class="num">Lançamentos</th><th class="num">Movimento</th></tr></thead><tbody>${ex.contasSemTopico.map((x) => `<tr><td class="mono">${esc(x.conta)}</td><td class="num">${int(x.qtd)}</td><td class="num">${n2(x.movimento)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nenhuma.</p>'}</details>
      </div>`;

    html += cardFluxo('f2', s, [['f2-export', 'Resumo completo (Excel)']], 'Confira o consolidado, o check e as exceções e envie para aprovação. A aprovadora confere e aprova ou devolve. Depois da aprovação o portal entrega o relatório final e o Excel com uma aba por unidade.');
    return html;
  }

  // ======================================================== FRENTE 3
  function vFrente3() {
    return cabecalho('Frente 3', 'Base Consolidada de Faturamento', '', `<div>${pill('warn', 'Aguarda Lyceum v10')}</div>`) +
      `<div class="alert warn"><div><b>Esta frente começa depois da atualização do Lyceum (v10).</b>A parte fiscal e a emissão de NF podem mudar com a nova versão. Atualizamos o cronograma quando os dados estiverem disponíveis.</div></div>
      <div class="card"><h2 style="margin-bottom:12px">O que esta frente vai fazer</h2>
        <div class="tbl-wrap"><table><tbody>
          <tr><td style="width:36px" class="muted">1</td><td>Ler a base única (Protheus + Lyceum) já usada nas frentes 1 e 2, sem colagem de relatórios.</td></tr>
          <tr><td class="muted">2</td><td>Preencher os lançamentos manuais pela chave de cobrança: nome, nº do aluno, situação e pagante/FIES.</td></tr>
          <tr><td class="muted">3</td><td>Tratar as classificações especiais: vestibular, clínicas, outras receitas, programas de bolsas e períodos anteriores.</td></tr>
          <tr><td class="muted">4</td><td>Classificar cobrança zerada x regular para emissão de NF e consolidar a base pronta para a auditoria.</td></tr>
          <tr><td class="muted">5</td><td>Liberar a base para o fiscal (Bianca) após a aprovação da Raquel.</td></tr>
        </tbody></table></div></div>
      <div class="card"><h2 style="margin-bottom:12px">Dependências</h2>
        <p>Atualização do Lyceum para a versão 10 · Base única da Frente 2 · Definição com o fiscal sobre a vinculação cobrança x NF.</p>
        <p class="muted small" style="margin-top:8px">Time: Raquel (aprova) · Bianca (fiscal) · Master Project (execução)</p></div>`;
  }

  // ======================================================== REGRAS
  const CAMPOS_COND = ['', 'PRINCIP_COD_LANC', 'TIPO_ENCARGO', 'CODIGO_LANC', 'TIPO_PAGAMENTO'];
  const descCond = (c) => (!c ? 'Sempre' : `${c.campo} ${c.operador === 'vazio_ou_em' ? 'vazio ou em' : 'em'} [${(c.valores || []).join(', ')}]`);

  function vRegras() {
    const s = state.regras;
    const abas = [['regras', 'Regras de justificativa'], ['tipos', 'Tipos de operação'], ['filiais', 'Unidades e filiais'], ['topicos', 'Tópicos do resumo'], ['unidades', 'Unidades do resumo']];
    let corpo = '';
    if (s.aba === 'regras') corpo = abaRegras();
    if (s.aba === 'tipos') corpo = abaTipos();
    if (s.aba === 'filiais') corpo = abaFiliais();
    if (s.aba === 'topicos') corpo = abaTopicos();
    if (s.aba === 'unidades') corpo = abaUnidades();
    return cabecalho('Gestão', 'Regras e parâmetros',
      'O painel central das regras: o time ajusta, inclui ou exclui uma regra sem depender de desenvolvimento. As alterações valem nas próximas execuções.',
      `<div class="btns"><button class="btn ghost sm" data-action="cfg-exportar">Exportar parâmetros</button>${podeExecutar() ? '<button class="btn ghost sm" data-action="cfg-importar">Importar parâmetros</button><button class="btn danger sm" data-action="cfg-reset">Restaurar padrão</button>' : ''}</div>`) +
      `<div class="alert info"><div>${R.ativo ? 'Os parâmetros ficam no banco do portal e valem para todo mundo na próxima conferência processada.' + (podeExecutar() ? '' : ' O seu perfil só consulta.') : 'Os parâmetros ficam salvos neste navegador. Para usar os mesmos parâmetros em outra máquina, exporte o arquivo e importe lá.'}</div></div>
      <div class="card"><div class="tabs" role="tablist">${abas.map(([v, t]) => `<button type="button" role="tab" aria-selected="${s.aba === v}" class="${s.aba === v ? 'on' : ''}" data-action="cfg-aba" data-v="${v}">${esc(t)}</button>`).join('')}</div>${roAbre(podeExecutar())}${corpo}${roFecha(podeExecutar())}</div>`;
  }

  function abaRegras() {
    const s = state.regras;
    const e = s.edit != null ? (s.edit === -1 ? { tipo: '', nome: '', analise: '', acao: 'Não parametrizar', condicao: null } : config.regras[s.edit]) : null;
    const c = (e && e.condicao) || {};
    const form = e ? `<div class="card" style="background:#fafbfd">
      <h3 style="margin-bottom:12px">${s.edit === -1 ? 'Nova regra' : 'Editar regra do tipo ' + esc(e.tipo)}</h3>
      <div class="row" style="margin-bottom:12px">
        <label class="fld">Tipo de operação<input type="text" id="r-tipo" value="${esc(e.tipo)}" style="width:110px"></label>
        <label class="fld" style="flex:1;min-width:220px">Nome<input type="text" id="r-nome" value="${esc(e.nome)}"></label>
        <label class="fld" style="flex:1;min-width:200px">Ação<input type="text" id="r-acao" value="${esc(e.acao)}"></label></div>
      <label class="fld" style="margin-bottom:12px">Análise (justificativa)<textarea id="r-analise">${esc(e.analise)}</textarea></label>
      <div class="row" style="margin-bottom:14px">
        <label class="fld">Condição - campo<select id="r-campo">${CAMPOS_COND.map((x) => `<option value="${x}" ${(c.campo || '') === x ? 'selected' : ''}>${x || 'Sem condição (sempre justifica)'}</option>`).join('')}</select></label>
        <label class="fld">Operador<select id="r-op"><option value="em" ${c.operador !== 'vazio_ou_em' ? 'selected' : ''}>está em</option><option value="vazio_ou_em" ${c.operador === 'vazio_ou_em' ? 'selected' : ''}>vazio ou está em</option></select></label>
        <label class="fld" style="flex:1;min-width:220px">Valores (separados por vírgula)<input type="text" id="r-valores" value="${esc((c.valores || []).join(', '))}"></label></div>
      <div class="btns"><button class="btn" data-action="regra-salvar">Salvar regra</button><button class="btn ghost" data-action="regra-cancelar">Cancelar</button></div></div>` : '';
    return form + `<div class="btns" style="margin-bottom:12px"><button class="btn sm" data-action="regra-nova">Nova regra</button><span class="small muted">${config.regras.length} regras · uma operação que não integrou e se encaixa numa regra vira "justificada".</span></div>
      <div class="tbl-wrap"><table><thead><tr><th>Tipo</th><th>Nome</th><th>Condição</th><th>Análise</th><th>Ação</th><th></th></tr></thead><tbody>
      ${config.regras.map((r, i) => `<tr><td>${esc(r.tipo)}</td><td>${esc(r.nome)}</td><td class="small mono">${esc(descCond(r.condicao))}</td><td class="small">${esc(r.analise)}</td><td class="small">${esc(r.acao)}</td>
        <td style="white-space:nowrap"><button class="btn ghost sm" data-action="regra-editar" data-i="${i}">Editar</button> <button class="btn danger sm" data-action="regra-excluir" data-i="${i}">Excluir</button></td></tr>`).join('')}
      </tbody></table></div>`;
  }

  function abaTipos() {
    const b = state.regras.busca.toLowerCase();
    const lista = config.tiposOperacao.map((t, i) => ({ ...t, i })).filter((t) => !b || (t.codigo + ' ' + t.descricao + ' ' + t.tipo).toLowerCase().includes(b));
    return `<div class="row" style="margin-bottom:12px"><label class="fld" style="flex:1;min-width:220px">Buscar<input type="search" data-bind="regras.busca" value="${esc(state.regras.busca)}" placeholder="Código, descrição ou classificação"></label>
      <label class="fld">Código<input type="text" id="t-cod" style="width:100px"></label><label class="fld" style="min-width:220px">Descrição<input type="text" id="t-desc"></label>
      <label class="fld">Classificação<select id="t-tipo"><option>Faturamento</option><option>Baixa</option><option>Não contabiliza</option></select></label><button class="btn sm" data-action="tipo-add">Adicionar</button></div>
      <p class="small muted" style="margin-bottom:10px">A classificação define em qual rotina a operação é conferida. "Não contabiliza" fica fora da conferência.</p>
      <div class="tbl-wrap tbl-scroll"><table><thead><tr><th>Código</th><th>Descrição</th><th>Classificação</th></tr></thead><tbody>
      ${lista.slice(0, 400).map((t) => `<tr><td class="mono">${esc(t.codigo)}</td><td>${esc(t.descricao)}</td><td><select data-tipo-i="${t.i}">${['Faturamento', 'Baixa', 'Não contabiliza'].map((o) => `<option ${t.tipo === o ? 'selected' : ''}>${o}</option>`).join('')}</select></td></tr>`).join('')}
      </tbody></table></div><p class="small muted" style="margin-top:8px">${lista.length} de ${config.tiposOperacao.length} tipos.</p>`;
  }

  function abaFiliais() {
    const m = Object.entries(config.unidadeFilial);
    return `<p class="muted" style="margin-bottom:12px">Como a unidade do Lyceum se relaciona com a filial do Protheus. Usado para montar a visão por unidade e dia.</p>
      <div class="tbl-wrap"><table><thead><tr><th>Unidade Lyceum</th><th>Filial Protheus</th><th>Nome da filial</th><th></th></tr></thead><tbody>
      ${m.map(([u, f]) => `<tr><td class="mono">${esc(u)}</td><td><input type="text" data-uf="${esc(u)}" value="${esc(f)}" style="width:110px"></td><td><input type="text" data-fn="${esc(f)}" value="${esc(config.filiais[f] || '')}"></td><td><button class="btn danger sm" data-action="uf-del" data-u="${esc(u)}">Remover</button></td></tr>`).join('')}
      </tbody></table></div>
      <div class="row" style="margin-top:12px"><label class="fld">Unidade Lyceum<input type="text" id="uf-u" style="width:110px"></label><label class="fld">Filial Protheus<input type="text" id="uf-f" style="width:110px"></label><label class="fld">Nome<input type="text" id="uf-n"></label><button class="btn sm" data-action="uf-add">Adicionar</button></div>`;
  }

  function abaTopicos() {
    const m = Object.entries(config.contaTopico).sort();
    const opts = (sel) => config.topicos.filter((t) => t !== 'IMPOSTOS' && t !== 'PDD').map((t) => `<option ${t === sel ? 'selected' : ''}>${esc(t)}</option>`).join('');
    return `<p class="muted" style="margin-bottom:12px">De-para da conta contábil para o tópico do resumo. Impostos e PDD são calculados pelos percentuais de cada unidade.</p>
      <div class="tbl-wrap"><table><thead><tr><th>Conta</th><th>Tópico</th><th></th></tr></thead><tbody>
      ${m.map(([c, t]) => `<tr><td class="mono">${esc(c)}</td><td><select data-ct="${esc(c)}">${opts(t)}</select></td><td><button class="btn danger sm" data-action="ct-del" data-c="${esc(c)}">Remover</button></td></tr>`).join('')}
      </tbody></table></div>
      <div class="row" style="margin-top:12px"><label class="fld">Conta<input type="text" id="ct-c" style="width:160px"></label><label class="fld">Tópico<select id="ct-t">${opts('')}</select></label><button class="btn sm" data-action="ct-add">Adicionar</button></div>`;
  }

  function abaUnidades() {
    return `<p class="muted" style="margin-bottom:12px">Cada unidade do resumo é uma filial com uma regra de centro de custo (${esc(config.centroCustoMedicina)} = medicina). O nome no BI liga a unidade à base de alunos.</p>
      <div class="tbl-wrap"><table><thead><tr><th>Unidade</th><th>Filial</th><th>Centro de custo</th><th>Nome no BI</th><th class="num">ISS %</th><th class="num">PDD %</th></tr></thead><tbody>
      ${config.unidadesResumo.map((u, i) => `<tr><td>${esc(u.nome)}</td><td><input type="text" data-un="${i}" data-k="filial" value="${esc(u.filial)}" style="width:100px"></td>
        <td><select data-un="${i}" data-k="ccRegra"><option value="igual" ${u.ccRegra === 'igual' ? 'selected' : ''}>= ${esc(config.centroCustoMedicina)}</option><option value="diferente" ${u.ccRegra === 'diferente' ? 'selected' : ''}>diferente de ${esc(config.centroCustoMedicina)}</option></select></td>
        <td><input type="text" data-un="${i}" data-k="unidadeBI" value="${esc(u.unidadeBI)}"></td>
        <td class="num"><input type="number" step="0.1" data-un="${i}" data-k="iss" value="${+(u.iss * 100).toFixed(4)}" style="width:90px"></td>
        <td class="num"><input type="number" step="0.1" data-un="${i}" data-k="pdd" value="${+(u.pdd * 100).toFixed(4)}" style="width:90px"></td></tr>`).join('')}
      </tbody></table></div>`;
  }

  // ======================================================== HISTÓRICO
  function tabelaHistorico(h) {
    return `<div class="tbl-wrap"><table><thead><tr><th>Data</th><th>Situação</th><th>Frente</th><th>Rotina</th><th>Competência</th><th>Responsável</th><th>Resultado</th><th>Parecer</th><th>Relatório</th></tr></thead><tbody>
      ${h.map((x) => { const st = x.status || 'Aprovado'; return `<tr><td>${esc(x.em)}</td><td>${pill(st === 'Aprovado' ? 'ok' : 'bad', st)}</td><td>${esc(x.frente)}</td><td>${esc(x.rotina || '-')}</td><td>${esc(compBR(x.competencia))}</td><td>${esc(x.por)}</td><td class="small">${esc(x.resultado)}</td><td class="small">${esc(x.obs || '')}</td><td>${x.relatorioId ? `<button class="btn ghost sm" data-action="hist-abrir" data-id="${esc(x.relatorioId)}">Abrir</button>` : '-'}</td></tr>`; }).join('')}
      </tbody></table></div>`;
  }
  function vHistorico() {
    const h = historico();
    return cabecalho('Gestão', 'Histórico de aprovações', R.ativo ? 'Registro de cada aprovação e devolução feita no portal, com o relatório final de cada aprovação.' : 'Registro de cada aprovação e devolução feita neste navegador. Os relatórios finais aprovados mais recentes podem ser reabertos por aqui.',
      h.length ? `<div class="btns"><button class="btn ghost sm" data-action="hist-export">Exportar (Excel)</button>${R.ativo ? '' : '<button class="btn danger sm" data-action="hist-limpar">Limpar histórico</button>'}</div>` : '') +
      `<div class="card">${h.length ? tabelaHistorico(h) : '<div class="empty">Nenhuma aprovação registrada ainda.</div>'}</div>`;
  }

  // ======================================================== USUÁRIOS (admin)
  const PAPEIS = { admin: 'Administradora', executora: 'Executora', aprovadora: 'Aprovadora' };
  function vUsuarios() {
    if (!R.ativo || papel() !== 'admin') return cabecalho('Gestão', 'Usuários', '') + '<div class="alert info"><div>Esta tela é só da administradora do portal compartilhado.</div></div>';
    const u = state.usuarios, nova = R.novaSenha;
    const opts = (sel) => Object.entries(PAPEIS).map(([v, t]) => `<option value="${v}" ${sel === v ? 'selected' : ''}>${t}</option>`).join('');
    return cabecalho('Gestão', 'Usuários', 'Quem entra no portal e o que cada pessoa pode fazer. A executora sobe, confere e envia. A aprovadora dá o aval e aprova ou devolve. A administradora faz tudo e cadastra as pessoas.') +
      (nova ? `<div class="alert ok"><div><b>Senha temporária de ${esc(nova.email)}</b>Passe por um canal separado do e-mail de acesso (telefone ou mensagem). No primeiro acesso o portal pede para trocar. Ela não aparece de novo.<br><span class="senha-temp">${esc(nova.senha)}</span></div><button class="btn ghost sm" data-action="usr-ok" style="margin-left:auto">Já anotei</button></div>` : '') +
      `<div class="card"><div class="card-head"><h2>Nova pessoa</h2></div><div class="row">
        <label class="fld" style="flex:1;min-width:200px">Nome<input type="text" data-bind="usuarios.nome" value="${esc(u.nome)}"></label>
        <label class="fld" style="flex:1;min-width:220px">E-mail<input type="text" data-bind="usuarios.email" value="${esc(u.email)}" inputmode="email" autocomplete="off"></label>
        <label class="fld">Perfil<select data-bind="usuarios.papel">${opts(u.papel)}</select></label>
        <button class="btn" data-action="usr-criar">Cadastrar</button></div></div>
      <div class="card"><div class="card-head"><h2>Pessoas com acesso</h2></div><div class="tbl-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th>Último acesso</th><th></th></tr></thead><tbody>
      ${R.usuarios.map((x) => `<tr><td>${esc(x.nome)}</td><td>${esc(x.email)}</td><td><select data-usr-papel="${esc(x.id)}" ${x.id === R.me.id ? 'disabled' : ''} aria-label="Perfil de ${esc(x.nome)}">${opts(x.papel)}</select></td>
        <td>${!x.ativo ? pill('mute', 'Desativado') : x.trocar_senha ? pill('warn', 'Aguarda 1º acesso') : pill('ok', 'Ativo')}</td><td class="small">${esc(x.ultimo_acesso || '-')}</td>
        <td class="num">${x.id === R.me.id ? '<span class="small muted">você</span>' : `<button class="btn ghost sm" data-action="usr-senha" data-id="${esc(x.id)}">Nova senha</button> <button class="btn ${x.ativo ? 'danger' : 'ghost'} sm" data-action="usr-ativo" data-id="${esc(x.id)}" data-v="${x.ativo ? 0 : 1}">${x.ativo ? 'Desativar' : 'Reativar'}</button>`}</td></tr>`).join('')}
      </tbody></table></div></div>`;
  }

  function vSenha() {
    const forcar = R.ativo && R.me.trocar_senha;
    return cabecalho('Acesso', 'Trocar senha', forcar ? 'Primeiro acesso: troque a senha temporária por uma sua para continuar.' : 'Use pelo menos 10 caracteres.') +
      `<div class="card" style="max-width:460px"><div style="display:grid;gap:12px">
        <label class="fld">Senha atual${forcar ? ' (a temporária)' : ''}<input type="password" id="s-atual" autocomplete="current-password"></label>
        <label class="fld">Nova senha (10 caracteres ou mais)<input type="password" id="s-nova" autocomplete="new-password"></label>
        <label class="fld">Repita a nova senha<input type="password" id="s-nova2" autocomplete="new-password"></label>
        <div class="btns"><button class="btn" data-action="senha-salvar">Salvar nova senha</button>${forcar ? '' : '<a class="btn ghost" href="#inicio">Cancelar</a>'}</div></div></div>`;
  }

  // ======================================================== ARQUIVOS
  async function lerArquivos(files, alvo) {
    const s = state[alvo];
    let reconhecidos = 0;
    try {
      for (const f of files) {
        overlay(`Lendo ${f.name}... arquivos grandes podem levar alguns segundos.`);
        await pausa();
        const buf = await f.arrayBuffer();
        await pausa();
        const found = FAT.parse.readWorkbook(new Uint8Array(buf), f.name);
        found.forEach((r) => { s.reports[r.tipo] = r; reconhecidos++; });
        if (!found.length) toast(`Não reconheci nenhum relatório em "${f.name}". Confira se é um dos relatórios esperados.`);
      }
    } catch (e) {
      console.error(e);
      toast('Não consegui ler o arquivo: ' + (e.message || e));
    } finally { overlay(null); }
    if (reconhecidos) toast(`${reconhecidos} relatório(s) reconhecido(s).`);
    render();
  }

  async function processarF1() {
    const s = state.f1;
    overlay('Conferindo Lyceum x Integração x Razão...'); await pausa();
    try {
      s.res = FAT.conferencia.run({ integracao: s.reports.integracao.rows, mov: s.reports.movLyceum.rows, razao: s.reports.razao.rows, rotina: s.rotina, config });
      s.decisoes = {}; s.aval = {}; s.sel = ''; s.avalFiltro = 'todos'; s.avalBusca = ''; s.fluxo = fluxoNovo(); s.valCheck = false; s.valObs = ''; s.filtro = 'todas'; s.filial = ''; s.dia = ''; s.busca = '';
    } catch (e) { console.error(e); toast('Erro ao processar: ' + e.message); }
    if (R.ativo && s.res) await gravarConferencia('f1', F1_ARQS);
    overlay(null); render();
  }

  async function gravarConferencia(fr, arqs) {
    const s = state[fr];
    overlay('Gravando no portal...');
    try {
      const c = await R.api('POST', 'conferencias', { frente: fr, rotina: fr === 'f1' ? s.rotina : null, competencia: s.competencia, resultado: s.res, arquivos: metaArquivos(s.reports, arqs) });
      s.id = null; aplicarConf(fr, c);
      toast('Conferência gravada no portal.');
    } catch (e) {
      toast(e.message); s.res = null; s.id = null;
      await sincronizar(fr === 'f1' ? 'frente1' : 'frente2');
    }
  }

  async function processarF2() {
    const s = state.f2;
    overlay('Montando o resumo de tópicos...'); await pausa();
    try {
      s.res = FAT.resumo.run({ razao: s.reports.razao.rows, baseAlunos: s.reports.baseAlunos.rows, alunosLyceum: s.reports.alunosLyceum ? s.reports.alunosLyceum.rows : [], config });
      s.unidade = s.res.unidades[0].unidade; s.bloco = 'PAGANTE'; s.aval = {}; s.sel = ''; s.avalFiltro = 'todos'; s.avalBusca = ''; s.fluxo = fluxoNovo(); s.valCheck = false; s.valObs = '';
    } catch (e) { console.error(e); toast('Erro ao processar: ' + e.message); }
    if (R.ativo && s.res) await gravarConferencia('f2', F2_ARQS);
    overlay(null); render();
  }

  // ---------- fluxo de aprovação ----------
  function resultadoTexto(fr, s) {
    if (fr === 'f1') {
      const k = s.res.kpis, dec = Object.values(s.decisoes).filter((d) => d.decisao).length;
      return `${int(k.total)} operações · ${int(k.contabilizado)} contabilizadas · ${int(k.justificado)} justificadas · ${int(k.pendentes)} pendentes (${int(dec)} com decisão)`;
    }
    const difs = s.res.unidades.filter((u) => Math.abs(u.check.difFaturamento) > 0.05 || u.check.difAlunos !== 0).length;
    return `${s.res.unidades.length} unidades · ${int(s.res.totalGeral.qtd)} alunos · check ${difs ? difs + ' com diferença' : 'fechado'}`;
  }
  function gerarRelatorio(fr) {
    const s = state[fr];
    const ctx = { competencia: s.competencia, fluxo: s.fluxo, decisoes: s.decisoes, aval: s.aval, avalItens: itensAval(fr), config };
    return fr === 'f1' ? FAT.relatorio.conferencia(s.res, ctx) : FAT.relatorio.resumo(s.res, ctx);
  }
  const nomeRelatorio = (fr) => (fr === 'f1' ? `Relatorio_Conferencia_${state.f1.rotina}_${state.f1.competencia}.html` : `Relatorio_Resumo_de_Topicos_${state.f2.competencia}.html`);
  function registrar(fr, status, por, obs, extra) {
    const s = state[fr];
    FAT.store.addHistorico({ em: agora(), frente: fr === 'f1' ? 'Conferência da Integração' : 'Resumo de Tópicos', rotina: fr === 'f1' ? s.rotina : '', competencia: s.competencia, status, por, resultado: resultadoTexto(fr, s), obs, ...extra });
  }

  async function fluxoRemoto(acao, fr) {
    const s = state[fr];
    if (acao === 'enviar' && !s.valPor) { toast('Escolha com quem fica a aprovação.'); return; }
    if (acao === 'devolver' && !s.valObs.trim() && !contagemAval(fr).nao) { toast('Marque os itens em desacordo ou escreva no parecer o que precisa ser ajustado.'); return; }
    if (acao === 'aprovar') {
      const ca = contagemAval(fr);
      if (ca.nao) { toast(`Há ${ca.nao} item(ns) não de acordo. Use "Devolver para ajuste".`); return; }
      if (ca.sem) { toast(`Faltam ${ca.sem} item(ns) sem aval. Marque de acordo ou não de acordo em cada um.`); return; }
      if (!s.valCheck) { toast('Marque a confirmação de que a conferência foi revisada.'); return; }
    }
    overlay('Registrando...');
    try {
      if (!(await salvarPendentes())) return;
      const r = await R.api('POST', 'acao', { id: s.id, acao, obs: acao === 'enviar' ? s.envObs : s.valObs, check: !!s.valCheck, aprovador: s.valPor });
      aplicarConf(fr, r.conferencia);
      if (acao === 'aprovar') {
        try { await R.api('POST', 'relatorios', { conferencia_id: s.id, html: gerarRelatorio(fr), nome: nomeRelatorio(fr) }); } catch (e) { toast('Aprovado, mas o relatório não foi guardado (' + e.message + '). Use "Baixar relatório final".'); }
      }
      s.envObs = ''; s.valObs = ''; s.valCheck = false;
      if (acao === 'enviar') { s.sel = ''; s.avalBusca = ''; }
      toast(acao === 'enviar' ? 'Enviado para aprovação de ' + s.valPor + '.' : acao === 'devolver' ? 'Devolvido para ajuste.' : 'Aprovado. Relatório final liberado.');
    } catch (e) { toast(e.message); } finally { overlay(null); render(); }
  }

  function fluxoAcao(acao, fr) {
    if (R.ativo) { fluxoRemoto(acao, fr); return; }
    const s = state[fr], f = s.fluxo;
    if (acao === 'enviar') {
      if (!s.envPor.trim()) { toast('Informe quem está enviando.'); return; }
      if (!s.valPor.trim()) { toast('Informe com quem fica a aprovação.'); return; }
      f.envio = { por: s.envPor.trim(), em: agora(), obs: s.envObs.trim() };
      f.tramite.push({ acao: f.status === 'devolvido' ? 'Reenviado para aprovação' : 'Enviado para aprovação', ...f.envio });
      f.status = 'em_aprovacao'; s.envObs = ''; s.valObs = ''; s.valCheck = false;
      s.sel = ''; s.avalBusca = ''; s.avalFiltro = contagemAval(fr).nao ? 'nao' : 'todos';
      toast('Enviado para aprovação de ' + s.valPor.trim() + '.');
    } else if (acao === 'devolver') {
      if (!s.valPor.trim()) { toast('Informe quem está devolvendo.'); return; }
      const cd = contagemAval(fr);
      if (!s.valObs.trim() && !cd.nao) { toast('Marque os itens em desacordo ou escreva no parecer o que precisa ser ajustado.'); return; }
      const itensTxt = cd.nao ? `${cd.nao} item(ns) em desacordo: ` + cd.desacordos.slice(0, 10).map((d) => d.label + (d.obs ? ' (' + d.obs + ')' : '')).join('; ') + (cd.nao > 10 ? '; e mais ' + (cd.nao - 10) : '') : '';
      f.devolucao = { por: s.valPor.trim(), em: agora(), obs: [s.valObs.trim(), itensTxt].filter(Boolean).join(' · ') };
      f.tramite.push({ acao: 'Devolvido para ajuste', ...f.devolucao });
      f.status = 'devolvido';
      registrar(fr, 'Devolvido', f.devolucao.por, f.devolucao.obs);
      toast('Devolvido para ajuste.');
    } else if (acao === 'aprovar') {
      if (!s.valPor.trim()) { toast('Informe quem está aprovando.'); return; }
      const ca = contagemAval(fr);
      if (ca.nao) { toast(`Há ${ca.nao} item(ns) não de acordo. Use "Devolver para ajuste".`); return; }
      if (ca.sem) { toast(`Faltam ${ca.sem} item(ns) sem aval. Marque de acordo ou não de acordo em cada um.`); return; }
      if (!s.valCheck) { toast('Marque a confirmação de que a conferência foi revisada.'); return; }
      f.aprovacao = { por: s.valPor.trim(), em: agora(), parecer: s.valObs.trim() };
      f.tramite.push({ acao: 'Aprovado', por: f.aprovacao.por, em: f.aprovacao.em, obs: f.aprovacao.parecer });
      f.status = 'aprovado';
      const id = 'r' + Date.now();
      FAT.store.salvarRelatorio(id, gerarRelatorio(fr));
      registrar(fr, 'Aprovado', f.aprovacao.por, f.aprovacao.parecer, { relatorioId: id, arquivo: nomeRelatorio(fr) });
      toast('Aprovado. Relatório final liberado.');
    }
    render();
  }

  function baixarJSON(obj, nome) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
    a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  // ======================================================== EVENTOS
  $main.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.closest('fieldset[disabled]')) return;
    const a = el.dataset.action, f1 = state.f1, f2 = state.f2, rg = state.regras;
    switch (a) {
      case 'upload': state.uploadAlvo = el.dataset.alvo; $file.value = ''; $file.click(); break;
      case 'f1-rotina': f1.rotina = el.dataset.v; if (f1.res) { f1.res = null; toast('Rotina alterada. Processe a conferência novamente.'); } render(); break;
      case 'f1-processar': processarF1(); break;
      case 'f1-limpar': f1.reports = {}; if (!R.ativo) f1.res = null; render(); break;
      case 'f1-filtro': f1.filtro = el.dataset.v; render(); break;
      case 'f1-cel': f1.filial = el.dataset.f; f1.dia = el.dataset.d; f1.filtro = 'todas'; render(); document.querySelector('[data-bind="f1.busca"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); break;
      case 'f1-importar-tabelas': {
        if (f1.reports.tipoOperacao) config.tiposOperacao = f1.reports.tipoOperacao.rows.filter((t) => t.codigo);
        if (f1.reports.regra) {
          const atuais = new Map(config.regras.map((r) => [r.tipo, r.condicao]));
          config.regras = f1.reports.regra.rows.filter((r) => r.tipo).map((r) => ({ ...r, condicao: atuais.get(r.tipo) || null }));
        }
        salvarConfig(); toast('Parâmetros atualizados com as tabelas do arquivo.'); render(); break;
      }
      case 'fluxo-enviar': fluxoAcao('enviar', el.dataset.fr); break;
      case 'aval-todos': {
        const fr = el.dataset.fr, s = state[fr];
        const sem = avalVisiveis(fr).filter((i) => !(s.aval[i.key] || {}).ok);
        sem.forEach((i) => { s.aval[i.key] = { ...(s.aval[i.key] || {}), ok: 'sim' }; agendar(fr, 'aval', i.key); });
        toast(`${int(sem.length)} item(ns) marcados de acordo. Os não de acordo foram mantidos.`);
        atualizaAval(fr); break;
      }
      case 'aval-sel': state[el.dataset.fr].sel = el.dataset.key; atualizaAval(el.dataset.fr); break;
      case 'aval-set': marcarAval(el.dataset.fr, el.dataset.v); break;
      case 'aval-nav': moverSel(el.dataset.fr, +el.dataset.d); break;
      case 'aval-filtro': state[el.dataset.fr].avalFiltro = el.dataset.v; state[el.dataset.fr].sel = ''; atualizaAval(el.dataset.fr); break;
      case 'fila-ver': state.filaVer = el.dataset.v; render(); break;
      case 'sync': irPara(); break;
      case 'usr-ok': R.novaSenha = null; render(); break;
      case 'usr-criar': (async () => {
        const u = state.usuarios;
        try { const r = await R.api('POST', 'usuarios', { nome: u.nome, email: u.email, papel: u.papel }); R.novaSenha = { email: r.email, senha: r.senhaTemporaria }; state.usuarios = { nome: '', email: '', papel: 'executora' }; await recarregarUsuarios(); window.scrollTo(0, 0); } catch (e) { toast(e.message); }
      })(); break;
      case 'usr-senha': if (confirm('Gerar uma nova senha temporária? A senha atual deixa de valer e a pessoa sai do portal.')) (async () => {
        try { const r = await R.api('PATCH', 'usuarios?id=' + encodeURIComponent(el.dataset.id), { novaSenha: true }); const x = R.usuarios.find((y) => y.id === el.dataset.id); R.novaSenha = { email: x ? x.email : '', senha: r.senhaTemporaria }; await recarregarUsuarios(); window.scrollTo(0, 0); } catch (e) { toast(e.message); }
      })(); break;
      case 'usr-ativo': (async () => {
        try { await R.api('PATCH', 'usuarios?id=' + encodeURIComponent(el.dataset.id), { ativo: el.dataset.v === '1' }); await recarregarUsuarios(); } catch (e) { toast(e.message); }
      })(); break;
      case 'senha-salvar': (async () => {
        const v = (id) => document.getElementById(id).value;
        if (v('s-nova') !== v('s-nova2')) { toast('As duas senhas novas não são iguais.'); return; }
        try { await R.api('POST', 'senha', { atual: v('s-atual'), nova: v('s-nova') }); R.me.trocar_senha = false; toast('Senha trocada.'); if (location.hash === '#inicio') irPara(); else location.hash = '#inicio'; } catch (e) { toast(e.message); }
      })(); break;
      case 'fluxo-aprovar': fluxoAcao('aprovar', el.dataset.fr); break;
      case 'fluxo-devolver': fluxoAcao('devolver', el.dataset.fr); break;
      case 'fluxo-previa': FAT.relatorio.abrir(gerarRelatorio(el.dataset.fr).replace('<body>', '<body><div style="background:#fdf3e2;color:#9a5b06;text-align:center;padding:8px;font:600 13px Segoe UI,sans-serif">PRÉVIA · ainda não aprovado</div>')); break;
      case 'fluxo-relatorio': FAT.relatorio.baixar(gerarRelatorio(el.dataset.fr), nomeRelatorio(el.dataset.fr)); break;
      case 'fluxo-abrir': FAT.relatorio.abrir(gerarRelatorio(el.dataset.fr)); break;
      case 'hist-abrir': if (R.ativo) { abrirRemoto(el.dataset.id); break; } { const h = FAT.store.getRelatorio(el.dataset.id); if (h) FAT.relatorio.abrir(h); else toast('Esse relatório não está mais guardado neste navegador.'); break; }
      case 'f1-export': FAT.exportar.conferencia(f1.res, { competencia: f1.competencia, validadoPor: f1.fluxo.aprovacao && f1.fluxo.aprovacao.por, validadoEm: f1.fluxo.aprovacao && f1.fluxo.aprovacao.em, observacao: f1.fluxo.aprovacao && f1.fluxo.aprovacao.parecer, aval: f1.aval, avalItens: itensAval('f1') }, f1.decisoes); break;
      case 'f1-export-rep': FAT.exportar.reprocessamento(f1.res, { competencia: f1.competencia }); break;
      case 'f2-usar-razao': f2.reports.razao = f1.reports.razao; render(); break;
      case 'f2-processar': processarF2(); break;
      case 'f2-limpar': f2.reports = {}; if (!R.ativo) f2.res = null; render(); break;
      case 'f2-bloco': f2.bloco = el.dataset.v; render(); break;
      case 'f2-export': FAT.exportar.resumo(f2.res, { competencia: f2.competencia, validadoPor: f2.fluxo.aprovacao && f2.fluxo.aprovacao.por, validadoEm: f2.fluxo.aprovacao && f2.fluxo.aprovacao.em, aval: f2.aval, avalItens: itensAval('f2') }); break;
      case 'cfg-aba': rg.aba = el.dataset.v; rg.edit = null; render(); break;
      case 'cfg-exportar': baixarJSON(config, 'parametros-portal-fat.json'); break;
      case 'cfg-importar': $json.value = ''; $json.click(); break;
      case 'cfg-reset': if (confirm(R.ativo ? 'Restaurar todos os parâmetros para o padrão? As alterações feitas no portal serão perdidas para todo mundo.' : 'Restaurar todos os parâmetros para o padrão? As alterações feitas neste navegador serão perdidas.')) { config = R.ativo ? FAT.store.clone(FAT.DEFAULT_CONFIG) : FAT.store.resetConfig(); if (R.ativo) salvarConfig(); toast('Parâmetros restaurados.'); render(); } break;
      case 'regra-nova': rg.edit = -1; render(); break;
      case 'regra-editar': rg.edit = +el.dataset.i; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'regra-cancelar': rg.edit = null; render(); break;
      case 'regra-excluir': { const r = config.regras[+el.dataset.i]; if (confirm(`Excluir a regra do tipo ${r.tipo} (${r.nome})?`)) { config.regras.splice(+el.dataset.i, 1); salvarConfig(); render(); } break; }
      case 'regra-salvar': {
        const v = (id) => document.getElementById(id).value.trim();
        if (!v('r-tipo')) { toast('Informe o tipo de operação.'); return; }
        const campo = v('r-campo');
        const nova = { tipo: v('r-tipo'), nome: v('r-nome'), analise: v('r-analise'), acao: v('r-acao'),
          condicao: campo ? { campo, operador: v('r-op'), valores: v('r-valores').split(',').map((x) => x.trim()).filter(Boolean) } : null };
        if (rg.edit === -1) config.regras.push(nova); else config.regras[rg.edit] = nova;
        rg.edit = null; salvarConfig(); toast('Regra salva.'); render(); break;
      }
      case 'tipo-add': {
        const cod = document.getElementById('t-cod').value.trim();
        if (!cod) { toast('Informe o código.'); return; }
        if (config.tiposOperacao.some((t) => t.codigo === cod)) { toast('Esse código já existe.'); return; }
        config.tiposOperacao.push({ codigo: cod, descricao: document.getElementById('t-desc').value.trim(), tipo: document.getElementById('t-tipo').value });
        salvarConfig(); render(); break;
      }
      case 'uf-add': {
        const u = FAT.parse.pad(document.getElementById('uf-u').value, 2), f = FAT.parse.pad(document.getElementById('uf-f').value, 6), n = document.getElementById('uf-n').value.trim();
        if (!u || !f) { toast('Informe unidade e filial.'); return; }
        config.unidadeFilial[u] = f; if (n) config.filiais[f] = n; salvarConfig(); render(); break;
      }
      case 'uf-del': delete config.unidadeFilial[el.dataset.u]; salvarConfig(); render(); break;
      case 'ct-add': { const c = document.getElementById('ct-c').value.trim(); if (!c) { toast('Informe a conta.'); return; } config.contaTopico[c] = document.getElementById('ct-t').value; salvarConfig(); render(); break; }
      case 'ct-del': delete config.contaTopico[el.dataset.c]; salvarConfig(); render(); break;
      case 'hist-export': { const h = historico(); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(h), 'Histórico'); XLSX.writeFile(wb, 'historico-aprovacoes-portal-fat.xlsx'); break; }
      case 'hist-limpar': if (confirm('Apagar todo o histórico de aprovações e os relatórios guardados neste navegador?')) { FAT.store.limparHistorico(); FAT.store.limparRelatorios(); render(); } break;
    }
  });

  // Atalhos do painel de aval: A de acordo, N não de acordo, setas para navegar.
  document.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const fr = state.rota === 'frente1' ? 'f1' : state.rota === 'frente2' ? 'f2' : null;
    if (!fr || state[fr].fluxo.status !== 'em_aprovacao' || !podeAprovar(state[fr])) return;
    const ws = document.getElementById('avalws-' + fr); if (!ws) return;
    const t = ev.target;
    if (t.closest && t.closest('input, textarea, select')) { if (ev.key === 'Escape') t.blur(); return; }
    const r = ws.getBoundingClientRect(); if (r.bottom < 80 || r.top > innerHeight - 80) return;
    const k = ev.key.toLowerCase();
    if (k === 'a') { ev.preventDefault(); marcarAval(fr, 'sim'); }
    else if (k === 'n') { ev.preventDefault(); marcarAval(fr, 'nao'); }
    else if (k === 'arrowdown' || k === 'j') { ev.preventDefault(); moverSel(fr, 1); }
    else if (k === 'arrowup' || k === 'k') { ev.preventDefault(); moverSel(fr, -1); }
  });

  $main.addEventListener('keydown', (ev) => {
    const d = ev.target.closest('.drop');
    if (d && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); d.click(); }
  });

  function aplicarBind(el) {
    const [fr, k] = el.dataset.bind.split('.');
    state[fr][k] = el.type === 'checkbox' ? el.checked : el.value;
  }
  $main.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.dataset.bind && el.type === 'search') {
      aplicarBind(el);
      clearTimeout(el._t);
      el._t = setTimeout(() => { const pos = el.selectionStart; render(); const n = document.querySelector(`[data-bind="${el.dataset.bind}"]`); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 250);
    } else if (el.dataset.bind && el.type === 'text') aplicarBind(el);
    if (el.dataset.avalbusca) { const fr = el.dataset.avalbusca; state[fr].avalBusca = el.value; clearTimeout(state[fr]._tb); state[fr]._tb = setTimeout(() => atualizaAval(fr), 200); }
    if (el.dataset.avalobs) { const [fr, k] = el.dataset.avalobs.split(/\|(.*)/s); const a = state[fr].aval[k] || (state[fr].aval[k] = {}); a.obs = el.value; agendar(fr, 'aval', k); }
    if (el.dataset.obs) { const d = state.f1.decisoes[el.dataset.obs] || (state.f1.decisoes[el.dataset.obs] = {}); d.obs = el.value; agendar('f1', 'decisoes', el.dataset.obs); }
  });
  $main.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.dataset.bind && el.type !== 'search' && el.type !== 'text') {
      aplicarBind(el);
      if (el.tagName === 'SELECT' || el.dataset.bind.endsWith('competencia')) render();
    }
    if (el.dataset.aval) {
      const [fr, k] = el.dataset.aval.split(/\|(.*)/s);
      const a = state[fr].aval[k] || (state[fr].aval[k] = {}); a.ok = el.value;
      const tr = el.closest('tr'); if (tr) { tr.classList.remove('aval-sim', 'aval-nao'); if (el.value) tr.classList.add('aval-' + el.value); }
      const box = document.getElementById('aval-resumo-' + fr); if (box) box.innerHTML = resumoAvalHTML(fr);
    }
    if (el.dataset.dec) { const d = state.f1.decisoes[el.dataset.dec] || (state.f1.decisoes[el.dataset.dec] = {}); d.decisao = el.value; agendar('f1', 'decisoes', el.dataset.dec); }
    if (el.dataset.usrPapel) R.api('PATCH', 'usuarios?id=' + encodeURIComponent(el.dataset.usrPapel), { papel: el.value }).then(() => { toast('Perfil atualizado.'); recarregarUsuarios(); }).catch((e) => { toast(e.message); recarregarUsuarios(); });
    if (el.dataset.tipoI) { config.tiposOperacao[+el.dataset.tipoI].tipo = el.value; salvarConfig(); toast('Classificação atualizada.'); }
    if (el.dataset.uf) { config.unidadeFilial[el.dataset.uf] = FAT.parse.pad(el.value, 6); salvarConfig(); }
    if (el.dataset.fn != null) { config.filiais[el.dataset.fn] = el.value.trim(); salvarConfig(); }
    if (el.dataset.ct) { config.contaTopico[el.dataset.ct] = el.value; salvarConfig(); }
    if (el.dataset.un != null) {
      const u = config.unidadesResumo[+el.dataset.un], k = el.dataset.k;
      u[k] = (k === 'iss' || k === 'pdd') ? (parseFloat(String(el.value).replace(',', '.')) || 0) / 100 : el.value.trim();
      salvarConfig(); toast('Unidade atualizada.');
    }
  });

  $main.addEventListener('dragover', (ev) => { const d = ev.target.closest('.drop'); if (d) { ev.preventDefault(); d.classList.add('over'); } });
  $main.addEventListener('dragleave', (ev) => { const d = ev.target.closest('.drop'); if (d) d.classList.remove('over'); });
  $main.addEventListener('drop', (ev) => {
    const d = ev.target.closest('.drop');
    if (!d || d.closest('fieldset[disabled]')) return;
    ev.preventDefault(); d.classList.remove('over');
    if (ev.dataTransfer.files.length) lerArquivos([...ev.dataTransfer.files], d.dataset.alvo);
  });
  $file.addEventListener('change', () => { if ($file.files.length) lerArquivos([...$file.files], state.uploadAlvo); });
  $json.addEventListener('change', async () => {
    const f = $json.files[0]; if (!f) return;
    try {
      const obj = JSON.parse(await f.text());
      if (!obj.tiposOperacao || !obj.regras || !obj.unidadesResumo) throw new Error('arquivo não parece ser de parâmetros do Portal FAT');
      config = obj; salvarConfig(); toast('Parâmetros importados.'); render();
    } catch (e) { toast('Não consegui importar: ' + e.message); }
  });

  if (!window.XLSX) {
    $main.innerHTML = '<div class="page"><div class="alert bad"><div><b>Não foi possível carregar a biblioteca de leitura de Excel.</b>O portal precisa de acesso à internet para carregar o componente (cdnjs). Verifique a conexão e recarregue a página.</div></div></div>';
  } else {
    (async () => {
      const ok = await R.iniciar();
      if (ok === 'login') return;
      if (R.ativo) {
        montarUsuario();
        try { const p = await R.api('GET', 'parametros'); config = p.config || FAT.store.clone(FAT.DEFAULT_CONFIG); } catch (e) { toast('Não consegui carregar os parâmetros: ' + e.message); }
      }
      irPara();
    })();
  }
})();
