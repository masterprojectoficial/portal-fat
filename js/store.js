/* Parâmetros e histórico salvos no navegador (localStorage). */
(function (root) {
  const FAT = (root.FAT = root.FAT || {});
  const K_CONFIG = 'portalFat.config.v1';
  const K_HIST = 'portalFat.historico.v1';

  const clone = (o) => JSON.parse(JSON.stringify(o));
  function ler(k) { try { const v = root.localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function gravar(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  function getConfig() {
    const salvo = ler(K_CONFIG);
    return salvo && salvo.tiposOperacao ? salvo : clone(FAT.DEFAULT_CONFIG);
  }
  function setConfig(cfg) { return gravar(K_CONFIG, cfg); }
  function resetConfig() { try { root.localStorage.removeItem(K_CONFIG); } catch (e) { /* sem storage */ } return clone(FAT.DEFAULT_CONFIG); }

  function getHistorico() { return ler(K_HIST) || []; }
  function addHistorico(item) { const h = getHistorico(); h.unshift(item); gravar(K_HIST, h.slice(0, 500)); return h; }
  function limparHistorico() { gravar(K_HIST, []); }

  // Relatórios finais aprovados (HTML), os mais recentes, para reabrir pelo histórico.
  const K_REL = 'portalFat.relatorios.v1';
  function salvarRelatorio(id, html) {
    const lista = (ler(K_REL) || []).filter((r) => r.id !== id);
    lista.unshift({ id, html });
    while (lista.length && !gravar(K_REL, lista.slice(0, 15))) lista.pop();
  }
  function getRelatorio(id) { const r = (ler(K_REL) || []).find((x) => x.id === id); return r ? r.html : null; }
  function limparRelatorios() { gravar(K_REL, []); }

  FAT.store = { getConfig, setConfig, resetConfig, getHistorico, addHistorico, limparHistorico, salvarRelatorio, getRelatorio, limparRelatorios, clone };
})(typeof window !== 'undefined' ? window : globalThis);
