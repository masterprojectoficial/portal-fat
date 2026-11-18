/* Versão compartilhada: conversa com a API (/api) quando o portal está publicado.
   Aberto direto do arquivo (duplo clique) ou sem API, o portal segue no modo local de antes. */
(function (root) {
  const FAT = (root.FAT = root.FAT || {});
  const R = { ativo: false, me: null, aprovadoras: [], historico: [], usuarios: [], novaSenha: null };

  async function api(metodo, caminho, corpo) {
    const op = { method: metodo, credentials: 'same-origin', headers: {} };
    if (metodo !== 'GET') { op.headers['Content-Type'] = 'application/json'; op.body = JSON.stringify(corpo || {}); }
    let r;
    try { r = await fetch('/api/' + caminho, op); } catch (e) { throw new Error('Sem conexão com o portal. Confira a internet e tente de novo.'); }
    let j = null;
    try { j = await r.json(); } catch (e) { j = null; }
    if (r.status === 401) { root.location.href = 'login.html'; throw new Error('Sessão expirada.'); }
    if (!r.ok) { const e = new Error((j && j.erro) || 'Erro ' + r.status); e.status = r.status; throw e; }
    return j;
  }

  // true: modo compartilhado | false: modo local | 'login': foi para a tela de login
  async function iniciar() {
    if (root.location.protocol === 'file:') return false;
    try {
      const r = await fetch('/api/me', { credentials: 'same-origin' });
      if (r.status === 401) { root.location.href = 'login.html'; return 'login'; }
      if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return false;
      const j = await r.json();
      R.ativo = true; R.me = j.usuario; R.aprovadoras = j.aprovadoras || [];
      return true;
    } catch (e) { return false; }
  }

  async function sair() {
    try { await api('POST', 'logout'); } catch (e) { /* segue */ }
    root.location.href = 'login.html';
  }

  R.api = api; R.iniciar = iniciar; R.sair = sair;
  FAT.remoto = R;
})(window);
