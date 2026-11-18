# Portal FAT - publicação (GitHub + Vercel + MySQL)

## Como está montado

- **Tela:** os mesmos arquivos estáticos de sempre (`index.html`, `assets/`, `js/`). Os relatórios do Lyceum e do Protheus continuam sendo lidos no navegador de quem sobe e não saem do computador.
- **API:** funções em `api/` (Node na Vercel). Guardam só o resultado da conferência: pendências, decisões, aval, trâmite, relatório final, histórico e parâmetros.
- **Banco:** MySQL no mesmo RDS da Amazon do MasterKey, em bancos próprios:
  - `masterproject_portal_fat` (produção)
  - `masterproject_portal_fat_hml` (homologação)

  Cada banco tem um usuário exclusivo, só com leitura e gravação de dados e só com conexão criptografada: `portalfat_app` e `portalfat_app_hml`. Nada do MasterKey foi alterado.
- **Login:** e-mail e senha, com cookie httpOnly assinado (12 horas). Depois de 5 senhas erradas o acesso fica bloqueado por 15 minutos. A senha temporária é trocada no primeiro acesso.
- **Proteção das páginas:** o `middleware.ts` só entrega as páginas e os scripts para quem está logado. Sem login, só abrem a tela de login, a pasta `assets` e a API, que confere a sessão sozinha.
- **Perfis:**

  | Perfil | O que faz |
  |---|---|
  | Executora | Sobe os relatórios, processa, registra as decisões, envia e altera os parâmetros. |
  | Aprovadora | Dá o aval item a item e aprova ou devolve. Quem enviou não pode aprovar a própria conferência. |
  | Administradora | Faz tudo e cadastra as pessoas na tela "Usuários". |

  As regras valem no servidor, não só na tela.
- **Modo local:** quem abre o `index.html` com duplo clique continua usando o modo local de antes, com os dados no navegador.

## Arquivos com segredo (ficam fora do git)

| Arquivo | O que tem |
|---|---|
| `.env.local` | Homologação: usuário `portalfat_app_hml` e JWT_SECRET de teste. Usado pelo `npm run dev`. |
| `.env.vercel-producao` | Produção: valores para cadastrar na Vercel. |
| `.env.acesso-producao` | Seu primeiro login no portal publicado. Apagar depois de trocar a senha. |

Estão na pasta do OneDrive. Depois de cadastrar tudo na Vercel, dá para apagar o `.env.vercel-producao`. Se precisar de novo, gere outra senha com `scripts/db/criar-usuario-app.js`.

## Passo a passo para publicar

1. **GitHub.** Neste computador, o `gh` está logado como `paulo-filho-art`, que não tem acesso à organização da Master. No seu terminal, faça:
   - `gh auth login` com a conta `masterprojectoficial`
   - `gh repo create masterprojectoficial/portal-fat --private --source . --push`

   Rode o segundo comando dentro desta pasta.
2. **Vercel.** No time `master-project1`:
   - Abra Add New > Project e importe `portal-fat`.
   - Em Framework Preset, escolha `Other`. Deixe Build Command e Output Directory em branco.
3. **Variáveis de ambiente** (Settings > Environment Variables, ambiente Production). Copie de `.env.vercel-producao`:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASS`
   - `MYSQL_DATABASE`
   - `JWT_SECRET`

   Para o ambiente Preview, use os valores de `.env.local` (homologação). Assim, os testes de branch não tocam a produção.
4. **Deploy.** Faça o deploy, ou um push na `main`.
5. **Domínio (opcional).** Por exemplo, `portalfat.masterproject.com.br`: em Settings > Domains, adicione o domínio e crie o CNAME no DNS da Master.
6. **Primeiro acesso.**
   - Entre com o e-mail e a senha temporária de `.env.acesso-producao` e troque a senha.
   - Em "Usuários", cadastre a Raquel como aprovadora e a executora como executora. Passe a senha temporária de cada uma por um canal separado do link.
   - Depois, apague o `.env.acesso-producao`.

## Rodar local

```powershell
npm install
npm run dev
```

Abre em http://127.0.0.1:3000 com o banco de homologação, usando o arquivo `.env.local`.

## Banco

Os comandos usam o administrador do RDS que está no `.env` do MasterKey. Sem `--apply`, eles só mostram o que fariam. Na produção, também é preciso passar `--prod`.

```powershell
node --env-file="<MasterKey>\.env" scripts/db/migrar.js --db=masterproject_portal_fat_hml --apply
node --env-file="<MasterKey>\.env" scripts/db/migrar.js --db=masterproject_portal_fat --prod --apply
```

- **Nova mudança de estrutura:** acrescente uma migração em `scripts/db/migracoes.js`. Nunca edite uma migração já aplicada.
- **Nova administradora:** use `scripts/db/criar-admin.js`. As demais pessoas são cadastradas pela tela.
