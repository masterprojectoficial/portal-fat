# Portal FAT - Automação do Faturamento

Portal da Master Project para a Clariens (Contabilidade e Controladoria). Funciona de dois jeitos:

- **Versão compartilhada (publicada na Vercel):** cada pessoa entra com e-mail e senha. Executora e aprovadora usam computadores diferentes e veem a mesma fila. O resultado de cada conferência, o aval, o histórico, os relatórios finais e os parâmetros ficam no banco MySQL da Master. Os relatórios brutos do Lyceum e do Protheus são lidos no navegador de quem sobe e não vão para o servidor. Publicação e banco estão em `docs/DEPLOY.md`.
- **Modo local:** abrindo o `index.html` com duplo clique, tudo fica no navegador de quem usa e nada é enviado para servidor.

## Fluxo de aprovação (igual nas Frentes 1 e 2)

1. **Envio dos arquivos** - a executora sobe os relatórios e o portal processa.
2. **Conferência** - o portal cruza as bases e aponta o que precisa de atenção. A executora registra as decisões e clica em "Enviar para aprovação".
3. **Aprovação** - a responsável (Raquel) dá o aval item a item e depois decide:
   - O painel "Aval da aprovadora" aparece no topo da frente. À esquerda fica a lista de itens (pendências e justificadas na Frente 1, unidades na Frente 2). À direita ficam o detalhe do item, os botões "De acordo" e "Não de acordo" e a observação dela.
   - Atalhos: A (de acordo), N (não de acordo), setas para cima e para baixo (navegar), Esc (sai da observação). Ao marcar "De acordo", o portal já vai para o próximo item sem aval.
   - Filtros: Todos, Sem aval, Não de acordo e De acordo, mais a busca. O botão "De acordo nos sem aval" marca de uma vez os itens que ainda estão sem aval no filtro e mantém os que ela marcou como "Não de acordo".
   - **Aprovar**: todos os itens precisam estar "De acordo" e ela precisa marcar a confirmação de que revisou.
   - **Devolver para ajuste**: vale com algum item "Não de acordo" ou com o parecer preenchido. Volta para a executora com os itens em desacordo marcados em vermelho nas tabelas. Quando ela reenvia, o painel abre direto no filtro "Não de acordo".
4. **Resultado final** - só depois da aprovação é liberado:
   - **Relatório final em HTML**, no formato de painel, com o carimbo da aprovação e o trâmite (quem enviou, devolveu e aprovou). Abre em qualquer navegador e tem o botão "Imprimir ou salvar PDF".
   - **Excel** com a base completa.

Na etapa de aprovação existe a "Prévia do relatório", marcada como não aprovada.

O relatório final traz o bloco "Aval da aprovadora, item a item", com o total de itens de acordo e em desacordo e as observações, além do aval em cada linha. O Excel ganha a aba "Aval da aprovação".

Cada aprovação e devolução fica no "Histórico de aprovações". Os 15 relatórios aprovados mais recentes podem ser reabertos por lá.

Na pasta `exemplos` tem um relatório final de cada frente, gerado com os dados de set/26. A aprovação e o aval desses exemplos são simulados, só para mostrar o formato.

## Fila de trabalho

A tela inicial é a fila de trabalho. Ela mostra cada frente com a situação, com quem está, desde quando e o próximo passo. O filtro separa o que está com a executora e o que está com a aprovadora. O número ao lado de "Fila de trabalho" no menu conta o que espera uma ação: aprovação pendente ou devolução para ajustar.

Na versão compartilhada a fila é a mesma para todo mundo, e o botão "Atualizar" traz o que mudou. No modo local, a fila mostra o que está aberto no navegador.

## Perfis (versão compartilhada)

- **Executa e aprova (padrão):** faz o fluxo inteiro: sobe, confere, envia, dá o aval e aprova, inclusive a própria conferência. O histórico registra quem enviou e quem aprovou.
- **Só executa** e **Só aprova:** limitam a pessoa a uma parte do fluxo.
- **Administradora:** faz tudo e cadastra as pessoas na tela "Usuários". A senha temporária aparece uma vez e é trocada no primeiro acesso.
- Em "Usuários > Aprovação", a administradora pode exigir que a aprovação seja feita por outra pessoa. Com isso ligado, quem envia não aprova a própria conferência.

## Checklist da conferência

No topo de cada frente há o checklist das etapas, com quem faz e a situação de cada uma: arquivos, pré-análise ou check, decisões, envio, aval, aprovação e resultado final. O botão "Ver" leva até a seção. Ao lado, o quadro "O que fazer agora" diz o próximo passo de quem está logado.

## Regras de semestre (Frente 2)

Ficam em "Regras e parâmetros > Ajustes de aluno":
- **Regra automática:** semestre sem aluno não fica com valor. O valor vai para o próximo semestre com aluno do mesmo tipo e, se não houver próximo, para o anterior. Pode ser desligada.
- **Ajustes manuais:** para casos pontuais, por lançamento (RA, lote/doc/linha, conta e valor) ou para todos os lançamentos de um RA. O motivo é obrigatório. O ajuste pode ficar "para revisar", "ativo" ou "revogado".
- **Importar ajustes de uma planilha do resumo:** lê a aba Razão e traz para revisão só os lançamentos digitados à mão que a regra automática não explica.

Na planilha de set/26 eram 68 lançamentos digitados à mão: 41 a regra automática cobre e 21 viram ajustes. Os outros 6 não mudam o resultado. Com isso, todos os semestres batem com a planilha, menos Pouso Alegre MED, por causa do CF.

As regras aplicadas aparecem no resumo ("Regras de semestre aplicadas"), no aval de cada unidade e no relatório final.

Enquanto uma frente está com a aprovadora, ninguém reprocessa nem muda as decisões dela. Se a conferência for devolvida e a executora processar de novo a mesma competência, a nova conferência mantém o trâmite e o aval dos itens que continuam.

## Frentes

**Frente 1 - Conferência da Integração**
- Entradas: Relatório de Integração (Protheus), Movimentação Contábil do Lyceum e Razão do Protheus. Pode ser um arquivo por relatório ou um único Excel com as abas.
- Rotina Faturamento (1º dia útil) ou Baixas (4º dia útil).
- Cruza Lyceum x integração x razão (chave valor + histórico, lote 008888) e classifica cada operação: contabilizada, justificada por regra, não integrou, integrou e não está no razão, erro.
- Pré-análise: aponta tipos de operação sem regra (risco de conta lixo).
- Matriz filial x dia: mostra só os dias e filiais que precisam reprocessar.
- Saídas (após aprovação): relatório final em HTML, Excel da conferência e lista de reprocessamento.

**Frente 2 - Resumo de Tópicos**
- Entradas: Razão do Protheus (contas de resultado) e Base de Alunos do BI. A base pode ser a aba tratada da planilha (RA, Tipo de Aluno, Unidade BI) ou a exportação direta do BI (aba Export). Na exportação, o portal usa `MATRICULA`, `CLASSIFICACAO_TIPO_PAGANTE`, `ATIVOS_HOJE` e `CODIGO_UNIDADE` + `NOME_CURSO`: o curso "Medicina" (parâmetro `cursoMedicina`) fica na unidade MED e os demais cursos, inclusive Medicina Veterinária e Biomedicina, vão para a variante EXMED/ODON. A lista de alunos por matrícula do Lyceum é opcional (reserva para RA não encontrado).
- Monta o resumo por unidade, tipo de aluno (pagante, ProUni, FIES) e semestre, com impostos (ISS) e PDD calculados pelos percentuais de cada unidade.
- Check razão x resumo e alunos BI x resumo, mais as exceções (sem aluno, fora das unidades, contas sem tópico).
- Saídas (após aprovação): relatório final em HTML e Excel com consolidado, check e uma aba por unidade.

**Frente 3 - Base Consolidada**: aguarda o Lyceum v10, sem prazo definido.

## Regras e parâmetros

Tudo que é regra fica na tela "Regras e parâmetros": regras de justificativa, classificação dos tipos de operação, unidades e filiais, tópicos e percentuais de ISS/PDD. O time ajusta sem depender de desenvolvimento.

Os parâmetros ficam salvos no navegador. Para levar para outra máquina, use "Exportar parâmetros" e depois "Importar parâmetros" lá. O histórico de aprovações também fica no navegador.

## Validação feita com set/26

O script `test/validar-com-setembro.js` roda os dois motores com as planilhas reais de setembro:
- Frente 1: 47.417 operações de faturamento, 47.312 contabilizadas, 105 não integraram (Salvador 01, 09 e 15/09; Itumbiara 14 e 28/09).
- Frente 2: as 8 unidades batem com a aba CONSOLIDADO.

Ponto para alinhar com a Raquel: em Pouso Alegre Medicina a planilha não considerou o CF (curso de férias) de -169.736,00 que está no razão (conta 301010101002). O portal considera, por isso Impostos e PDD dessa unidade ficam um pouco maiores que na planilha.
