# Diário de desenvolvimento

## Situação inicial
Este pacote de contexto, guia e prompts foi preparado com ChatGPT a pedido da aluna. O sistema ainda não foi implementado. As referências visuais e o HTML da aula são materiais anteriores. Não há testes/CI/deploy executados nem aprovações de desenvolvimento registradas neste pacote.

## Registro por etapa — copiar e preencher com fatos

- Etapa/data:
- Pedido recebido:
- Plano apresentado:
- Aprovação humana real e escopo:
- O que Claude executou:
- Arquivos alterados:
- Verificação, comando e resultado:
- O que a aluna conferiu/aprovou:
- Commit/PR/CI/deploy, quando existentes:
- Limites e pendências:
- Forma de reversão:

Não preencher eventos futuros como concluídos. Não guardar credenciais ou a conversa integral sem revisão.

## Etapa 01 · Contexto — 2026-10-15
- Pedido recebido: ler README, CLAUDE.md, CONTEXTO e ETAPAS; identificar pasta ativa; somente leitura.
- O que Claude executou: leitura dos arquivos e resumo de objetivo e limites. Nenhum comando, edição ou instalação.
- Pasta ativa: `/Users/leticiafreitas/Developer/fauna-u06` (pasta local, sem worktree).

## Etapa 02 · Ambiente — 2026-10-15
- Pedido recebido: ler ARQUITETURA e conferir diretório/branch, Git, Node e npm; sem instalação.
- Verificação (comandos de leitura: `pwd`, `git rev-parse`, `git --version`, `node -v`, `npm -v`, `lsof` na porta 3000):
  - Git 2.55.0; a pasta ainda não era repositório.
  - Node v24.20.0 (nvm); npm/npx 11.19.0.
  - Porta 3000 ocupada por `next-server` de outro projeto local (SIGD-WEB).
- Plano da etapa 03 apresentado e aguardando aprovação.

## Etapa 03 · Base e prévia — 2026-10-15
- Pedido recebido: criar Next.js com App Router e TypeScript em `sistema/`, sem Git aninhado, e abrir a prévia.
- Aprovação humana real e escopo: a aluna aprovou o plano e as ações locais da etapa 03, informou o e-mail para o Git local e autorizou parar o servidor do SIGD-WEB e usar a porta padrão 3000.
- O que Claude executou:
  1. `kill 41526` — encerrou o `next-server` do SIGD-WEB; porta 3000 confirmada livre.
  2. `git init -b main` na raiz e `git config --local user.email` com o e-mail informado. `user.name` não foi definido (não informado).
  3. `npx create-next-app@latest --help` para conferir as opções atuais (versão 16.4.2).
  4. `npx create-next-app@16.4.2 sistema --ts --app --eslint --no-tailwind --no-src-dir --no-react-compiler --import-alias "@/*" --use-npm --disable-git --no-agents-md --no-agent-feedback --yes`
  5. Prévia iniciada pela configuração "Fauna Silvestre" do `.claude/launch.json` (`npm run dev` em `sistema/`, porta 3000).
- Arquivos alterados: criado `sistema/` (app/, public/, package.json, package-lock.json, tsconfig.json, next.config.ts, eslint.config.mjs, .gitignore, README.md, next-env.d.ts); criado `.git/` na raiz; este diário. Documentos da raiz e `.claude/launch.json` não foram alterados.
- Versões instaladas: next 16.4.2, react/react-dom 19.3.0, typescript ^5, eslint ^9, eslint-config-next 16.4.2.
- Verificação, comando e resultado:
  - `sistema/.git` não existe; único repositório em `fauna-u06/.git`, branch `main`, sem commits.
  - Servidor: "Next.js 16.4.2 (Turbopack) ... Ready"; `GET / 200`.
  - Navegador da prévia: página inicial padrão "Create Next App" carregada em http://localhost:3000; console apenas com mensagens informativas (React DevTools, HMR conectado), sem erros.
  - `npm audit --omit=dev`: 0 vulnerabilidades. `npm audit` com dependências de desenvolvimento: 5 de severidade alta (cadeia de `braces`, ferramenta de lint); não corrigido.
- O que a aluna conferiu/aprovou: pendente.
- Commit/PR/CI/deploy: nenhum feito por Claude. Depois da etapa, a aluna fez fora desta sessão o commit `09ab333 chore: inicia SIGFAUNA MT` (17 arquivos de `sistema/`) e configurou `origin` = `https://github.com/freitaszLe/sigfauna-mt.git`, com `main` ligada a `origin/main`. O push não foi verificado por Claude (sem consulta ao remoto). Arquivos da raiz, como `CLAUDE.md`, `README.md`, `COMECE-AQUI.html` e `.claude/`, ficaram fora desse commit.
- Limites e pendências:
  - O gerador ativou por padrão `cacheComponents` e `partialPrefetching` em `next.config.ts`; mantido como gerado, decidir na próxima etapa.
  - Aviso de `eslint@9.39.5` descontinuado e script de instalação de `unrs-resolver` não aprovado pelo npm; sem erro na execução.
  - `user.name` do Git local pendente antes do primeiro commit.
  - O servidor do SIGD-WEB ficou parado e precisa ser reiniciado manualmente quando for usado.
- Forma de reversão: parar a prévia; apagar `sistema/` e `.git/` da raiz; remover estas entradas do diário.

## Etapa 04 · Layout — 2026-10-15
- Pedido recebido: ler VISUAL.md e as imagens indicadas; implementar somente o layout institucional (navegação, bloco de página, cards e tabela de exemplo identificada) com as quatro entradas.
- Plano apresentado: moldura com menu lateral verde e barra superior, componentes de layout, quatro rotas, remoção dos arquivos do modelo, sem dependências novas.
- Aprovação humana real e escopo: a aluna aprovou o plano e as ações locais da etapa 04.
- Referências lidas: `referencias/layout-institucional.png` (somente estrutura: menu lateral, barra superior, bloco de página) e `referencias/paleta-referencia.png` (tabela com linhas alternadas, etiquetas de situação, botão "Novo" verde). Nenhum logotipo, nome ou imagem de terceiros foi copiado.
- O que Claude executou:
  - Criou `components/AppShell` (menu com Visão geral, Resgates e pacientes, Acompanhamento, Distribuição dos resgates; selo "Dados fictícios — demonstração"; botão Menu abaixo de 768px), `PageBlock`, `StatCard`, `StatusBadge` e `ExampleTable`, cada um com CSS Module.
  - Reescreveu `app/layout.tsx` (idioma pt-BR, título "Fauna Silvestre", fontes do sistema no lugar das fontes Geist baixadas do Google), `app/globals.css` (cores do VISUAL.md como variáveis; tema escuro do modelo removido) e `app/page.tsx` (Visão geral com cards e tabela de exemplo).
  - Criou `app/resgates`, `app/acompanhamento` e `app/distribuicao` com bloco de página e aviso da etapa em que o conteúdo será feito. O botão "Novo" está desativado.
  - Removeu `app/page.module.css` e os SVGs do modelo em `public/` (sem referências no código).
- Verificação, comando e resultado:
  - `npm run lint`: saída 0. `npx tsc --noEmit`: saída 0.
  - Prévia: `GET /`, `/resgates`, `/acompanhamento`, `/distribuicao` responderam 200; console sem erros; `lang="pt-BR"`; menu com `aria-current` na página atual; fundo do menu `rgb(20, 133, 75)` (#14854B).
  - 1280px: menu lateral fixo, quatro cards em linha, tabela inteira.
  - 768px e 375px: botão Menu abre e fecha a navegação, e o clique em um link troca a página e fecha o menu; largura da página igual à da tela (sem rolagem horizontal); a tabela rola dentro do próprio quadro.
  - Ajustes feitos durante a conferência: coluna "#" sem quebra, cards com largura mínima menor, nome "Fauna Silvestre" sem quebra na barra.
- O que a aluna conferiu/aprovou: pendente (revisão do diff).
- Commit/PR/CI/deploy: nenhum.
- Limites e pendências:
  - Indicadores mostram 0 e a tabela usa linhas fixas marcadas como exemplo; dados reais na etapa 05. Nomes de região são genéricos ("Região de exemplo 1") até a verificação na etapa 08.
  - Ícones do menu são símbolos de texto, sem biblioteca.
  - Em tela pequena, a legenda da tabela fica parcialmente oculta até rolar a tabela.
  - `cacheComponents` e `partialPrefetching` continuam como o gerador deixou.
  - `npm run build` não foi executado nesta etapa.
- Ajuste pedido pela aluna após a revisão: trocar o verde da navegação.
  - Testados na prévia: menu `#119620` com barra `#0c6b17` e menu `#1c6300` com barra `#144700`.
  - Contraste do texto branco, calculado no navegador: `#119620` 3,88:1 (abaixo de 4,5:1 para texto de 14px); `#1c6300` 7,41:1; `#144700` 10,87:1.
  - Escolha da aluna: menu `#1c6300` e barra superior `#144700` (variáveis `--nav` e `--nav-dark` em `app/globals.css`). É um verde mais escuro que o "verde vivo próximo de #14854B" descrito no VISUAL.md; a mudança foi decisão da aluna.
- Forma de reversão: `git restore sistema/app sistema/public` para os arquivos do commit `09ab333`; apagar `sistema/components/`, `sistema/app/resgates/`, `sistema/app/acompanhamento/` e `sistema/app/distribuicao/`; remover esta entrada do diário.
