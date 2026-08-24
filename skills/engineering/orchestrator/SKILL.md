---
name: orchestrator
description: Governa projetos com agentes, audita pre-condicoes, cria documentacao, transforma gaps em GitHub Issues e coordena execucao, testes e QA.
disable-model-invocation: true
---

# ORCHESTRATOR - Central de Controle

Planeja, governa, audita e delega execucao. Nao execute tarefas complexas diretamente quando uma skill especializada existir.

## Fase - Atualizacao do framework

Esta verificacao deve ocorrer no inicio de toda execucao do orchestrator, antes das pre-condicoes do projeto.

1. Localize `.diego-anselmo-skills.json` no diretorio que contem a skill carregada ou em seu diretorio pai. O manifesto instalado e a fonte primaria de `source`, `ref`, `commit` e `version`; um clone local e opcional.
2. Confirme que `source` e `diego-anselmo/skills`. Origem diferente deve ser informada como drift de proveniencia.
3. Consulte a revisao remota de `ref` com `git ls-remote https://github.com/diego-anselmo/skills.git <ref>` ou API GitHub equivalente. Nunca faca `pull`, merge ou reset durante a verificacao.
4. Compare o commit instalado com a revisao remota exata.
5. Se houver commit novo, informe:

```text
Atualizacao do framework disponivel
- Framework: diego-anselmo/skills
- Versao instalada: <version>
- Ref: <ref>
- Instalado: <commit>
- Disponivel: <commit>
- Novidades: <resumo factual dos commits ou arquivos>
- Acao: revisar e autorizar o re-deploy
```

6. Nao atualize automaticamente. Uma revisao remota nova e informacao, nao autorizacao para mudar todas as skills em uso.
7. Depois da autorizacao, execute `scripts/setup-diego-anselmo-skills.sh --redeploy <diretorios-detectados>` a partir de clone/cache persistente ou pelo instalador remoto.
8. Confirme que o manifesto de cada destino registra o novo commit e que `orchestrator`, `implement`, `code-review`, `setup-skills` e `qa-analyst` vieram da mesma revisao.
9. Se nao for possivel ler o manifesto, o remote ou a rede, informe `Nao foi possivel verificar atualizacoes do framework`; continue somente se as skills locais estiverem disponiveis e nao faca re-deploy.

Instalacao inicial, troca de origem e atualizacao continuam decisoes explicitas do usuario. O framework nunca executa codigo novo apenas porque `main` avancou.

## Fase 0 - Pre-condicoes de governanca

Antes de criar arquivos ou delegar trabalho:

1. Verifique se o projeto tem Git inicializado.
2. Verifique se existe um remote GitHub valido, preferencialmente `origin`.
3. Verifique acesso ao repositorio com `gh repo view` ou mecanismo equivalente.

Se o ambiente estiver vazio, nao tiver Git ou nao tiver repositorio remoto no GitHub, pare o fluxo e oriente o usuario a:

1. criar o repositorio no GitHub;
2. inicializar o repositorio local;
3. configurar o remote `origin`;
4. fazer o primeiro commit e push;
5. retornar ao orchestrator.

Nao substitua o GitHub silenciosamente por tracker local. GitHub e a fonte de rastreabilidade, Issues, revisao e historico deste framework.

## Fase 1 - Provisionamento documental

1. Invocar `/setup-skills` para completar `AGENTS.md` ou `CLAUDE.md`, `CONTEXT.md`, `docs/agents/` e `docs/adr/`.
2. Invocar `/roadmap` para criar ou atualizar `ORCHESTRATOR-ROADMAP.md` e Epics.
3. Invocar `/grill-with-docs` para consolidar linguagem de dominio e decisoes arquiteturais.
4. Em repositorio vazio, invocar `/scaffold-mvp` apos o alinhamento de dominio.
5. Revisar e persistir a documentacao antes de iniciar implementacao.

Documentacao nao e uma etapa opcional: o orchestrator deve deixar um estado compreensivel para outro agent continuar o trabalho.

### Caso especial - projeto novo com apenas um PRD na pasta

Quando o repositorio for inicializado a partir de uma pasta que contem somente um PRD (sem codigo):

1. Garantir repositorio GitHub inicializado, com remote `origin` configurado (Fase 0).
2. Criar e fazer checkout da branch `develop` a partir da branch padrao.
3. Transformar o PRD em Epics e registra-los como Issue(s) no GitHub (uma Issue por Epic, ou Issue mestre com os Epics listados).
4. Invocar `/to-issues` para fatiar cada Epic em Issues atomicas (slices verticais, rastreaveis, com criterios de aceite), registrando o mapeamento Epic -> Issues conforme Fase 3.
5. Seguir para a Fase 4 usando o modo de fila sequencial descrito abaixo.

## Fase 2 - Auditoria

Verifique:

```text
[ ] Git inicializado
[ ] Remote GitHub configurado e acessivel
[ ] AGENTS.md ou CLAUDE.md
[ ] CONTEXT.md ou CONTEXT-MAP.md
[ ] docs/agents/ com tracker e labels
[ ] docs/adr/ quando houver decisoes relevantes
[ ] ORCHESTRATOR-ROADMAP.md
[ ] Skills instaladas no ambiente escolhido
```

Classifique gaps como P1 (seguranca/tipos), P2 (arquitetura), P3 (performance) ou P4 (higiene/documentacao). Use `/improve-codebase-architecture`, `/diagnose`, `/query-docs` ou `/zoom-out` conforme o caso.

## Fase 3 - Fragmentacao no GitHub

Os gaps aprovados devem ser transformados em Issues por `/to-issues`. O GitHub e a fonte persistente de escopo, criterios de aceite, dependencias e status; `ESTADO_ORQUESTRATOR.md` e apenas a visao operacional da DAG.

1. Passe para `/to-issues` os gaps, roadmap e documentacao aprovados.
2. Apresente a decomposicao para aprovacao quando houver decisao HITL.
3. Publique as Issues em ordem de dependencia, usando IDs reais em `Blocked by`.
4. Registre o mapeamento `Tarefa -> Issue GitHub -> branch/worktree`.
5. Nunca crie uma DAG apenas em memoria ou apenas em arquivo local quando a tarefa puder ser rastreada no GitHub.

## Fase 4 - Execucao

Use slices verticais pequenos. Tarefas independentes podem ser executadas em paralelo com worktrees isoladas. Tarefas que alterem schema, autenticacao, APIs publicas ou dados exigem confirmacao humana.

O orchestrator delega para skills especializadas, por exemplo:

- `/implement` para executar uma GitHub Issue aprovada;
- `/tdd` para o loop red-green-refactor dentro da Issue;
- `/code-review` para revisar Standards e Spec antes do QA;
- `/secure-e2e` para fluxos E2E e seguranca;
- `/diagnose` para bugs e regressoes;
- `/query-docs` para APIs pontuais de terceiros;
- `/research` para investigacao ampla com fontes primarias;
- `/write-a-skill` para gargalos recorrentes nao cobertos.

### Fila sequencial para Epics fatiados de um PRD

Quando as Issues vierem do caso especial "projeto novo com apenas um PRD" (Fase 1), a execucao **nao** e paralela: despachar **um unico agente por vez**, na ordem de dependencia das Issues.

1. Para o Epic atual, processe suas Issues uma a uma por `/implement`: TDD -> verificacoes -> commits locais -> `/code-review` -> `/qa-analyst` -> push/PR da Issue. Falha em review ou QA retorna a mesma Issue ao ciclo antes de qualquer push.
2. A proxima Issue so inicia depois que o PR da anterior estiver integrado na branch base definida pelo repositorio.
3. O Epic termina quando todos os PRs filhos estiverem integrados e seus criterios de sucesso forem verificados; atualize a Issue da Epic e avance para a proxima.
4. Ao concluir todos os Epics, siga a convencao do repositorio para promover a branch de integracao para producao. Nao invente `develop` quando o projeto nao a utiliza.

## Fase 5 - Verificacao e QA

Depois de cada tarefa, execute verificacoes proporcionais e registre evidencia. Se falhar, invoque `/diagnose` antes de continuar.

Cada Issue passa por `/code-review` depois dos testes e commits locais. Corrija achados de Standards ou Spec antes de chamar QA.

Quando a DAG estiver concluida, invoque obrigatoriamente `/qa-analyst`, sem excecao de tier. O QA confronta requisitos, Issues, implementacao, testes, cenarios de erro e mudancas fora de escopo. Falhas reabrem Issues ou criam novas tarefas e exigem novo code review.

Commits locais podem anteceder QA porque fornecem um diff estavel e nao constituem entrega. Push da branch e abertura do PR somente ocorrem depois de QA aprovado. Se nao existir uma skill de fluxo Git/PR instalada, use as regras documentadas do repositorio; nunca invoque uma skill inexistente.
