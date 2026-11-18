// POST /api/acao  { id, acao: 'enviar'|'devolver'|'aprovar', obs, check, aprovador }
// O servidor confere o perfil, a situação e o aval de cada item antes de mudar o fluxo.
const { rota, corpo, Erro, agoraBR } = require('./_lib/http');
const { um, tx } = require('./_lib/db');
const { usuario, pode } = require('./_lib/auth');
const { exigeAprovadorDiferente, json, contagemAval, resultadoTexto, paraTela, SELECT_CONF, NOME_FRENTE } = require('./_lib/conf');

const texto = (s, max) => String(s == null ? '' : s).trim().slice(0, max);

module.exports = rota({
  POST: async (req) => {
    const u = await usuario(req);
    const b = await corpo(req);
    const id = String(b.id || '');
    const acao = String(b.acao || '');
    if (!['enviar', 'devolver', 'aprovar'].includes(acao)) throw new Erro(400, 'Ação inválida.');

    await tx(async (t) => {
      const c = await t.um('SELECT * FROM conferencias WHERE id = ? FOR UPDATE', [id]);
      if (!c) throw new Erro(404, 'Conferência não encontrada.');
      const f = json(c.fluxo, { tramite: [] });
      f.tramite = f.tramite || [];
      const res = json(c.resultado, {});
      const aval = json(c.aval, {});
      const em = agoraBR();
      const hist = (status, obs) => t.q('INSERT INTO historico (conferencia_id, frente, rotina, competencia, status, por, usuario_id, resultado, obs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, NOME_FRENTE[c.frente], c.rotina, c.competencia, status, u.nome, u.id, resultadoTexto(c.frente, res, json(c.decisoes, {})), obs || '']);

      if (acao === 'enviar') {
        if (!pode(u, 'executora')) throw new Erro(403, 'Seu perfil não envia para aprovação.');
        if (!['rascunho', 'devolvido'].includes(c.status)) throw new Erro(409, 'Esta conferência já foi enviada.');
        const aprovador = texto(b.aprovador, 120);
        if (!aprovador) throw new Erro(400, 'Escolha com quem fica a aprovação.');
        f.envio = { por: u.nome, usuario_id: u.id, em, obs: texto(b.obs, 1000) };
        f.tramite.push({ acao: c.status === 'devolvido' ? 'Reenviado para aprovação' : 'Enviado para aprovação', por: u.nome, em, obs: f.envio.obs });
        await t.q("UPDATE conferencias SET status = 'em_aprovacao', fluxo = ?, aprovador_previsto = ?, versao = versao + 1 WHERE id = ?", [JSON.stringify(f), aprovador, c.id]);
        return;
      }

      // devolver e aprovar
      if (!pode(u, 'aprovadora')) throw new Erro(403, 'Seu perfil não aprova nem devolve.');
      if (c.status !== 'em_aprovacao') throw new Erro(409, 'Esta conferência não está aguardando aprovação.');
      if (u.papel !== 'admin' && f.envio && f.envio.usuario_id === u.id && (await exigeAprovadorDiferente(t))) throw new Erro(403, 'Pelos parâmetros, quem enviou a conferência não pode aprovar nem devolver.');
      const cont = contagemAval(c.frente, res, aval);
      const obs = texto(b.obs, 1000);

      if (acao === 'devolver') {
        if (!obs && !cont.nao) throw new Erro(400, 'Marque os itens em desacordo ou escreva no parecer o que precisa ser ajustado.');
        const itens = cont.nao ? `${cont.nao} item(ns) em desacordo: ` + cont.desacordos.slice(0, 10).map((d) => d.label + (d.obs ? ' (' + d.obs + ')' : '')).join('; ') + (cont.nao > 10 ? '; e mais ' + (cont.nao - 10) : '') : '';
        f.devolucao = { por: u.nome, usuario_id: u.id, em, obs: [obs, itens].filter(Boolean).join(' · ') };
        f.tramite.push({ acao: 'Devolvido para ajuste', por: u.nome, em, obs: f.devolucao.obs });
        await t.q("UPDATE conferencias SET status = 'devolvido', fluxo = ?, versao = versao + 1 WHERE id = ?", [JSON.stringify(f), c.id]);
        await hist('Devolvido', f.devolucao.obs);
        return;
      }

      if (cont.nao) throw new Erro(400, `Há ${cont.nao} item(ns) não de acordo. Use "Devolver para ajuste".`);
      if (cont.sem) throw new Erro(400, `Faltam ${cont.sem} item(ns) sem aval.`);
      if (b.check !== true) throw new Erro(400, 'Marque a confirmação de que a conferência foi revisada.');
      f.aprovacao = { por: u.nome, usuario_id: u.id, em, parecer: obs };
      f.tramite.push({ acao: 'Aprovado', por: u.nome, em, obs });
      await t.q("UPDATE conferencias SET status = 'aprovado', fluxo = ?, versao = versao + 1 WHERE id = ?", [JSON.stringify(f), c.id]);
      await hist('Aprovado', obs);
    });
    return { conferencia: paraTela(await um(`${SELECT_CONF} WHERE c.id = ?`, [id])) };
  },
});
