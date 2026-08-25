# diego-anselmo/skills

Skills de engenharia com governanca GitHub, documentacao persistente, TDD, revisao Standards + Spec e QA obrigatorio antes de PR.

[![skills.sh](https://skills.sh/b/diego-anselmo/skills)](https://skills.sh/diego-anselmo/skills)

Este repositorio e um fork de [alltomatos/skills](https://github.com/alltomatos/skills), derivado de [mattpocock/skills](https://github.com/mattpocock/skills). Credito integral aos autores e contribuidores anteriores. A origem operacional e de distribuicao deste framework e `diego-anselmo/skills`.

## Instalacao

### Direto, sem clone

```bash
curl -fsSL https://raw.githubusercontent.com/diego-anselmo/skills/main/scripts/setup-diego-anselmo-skills.sh | bash
```

O instalador le a entrada interativa em `/dev/tty`. Para CI ou execucao sem terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/diego-anselmo/skills/main/scripts/setup-diego-anselmo-skills.sh \
  | SKILLS_ENVIRONMENTS="1 2" bash
```

| Opcao | Ambiente | Diretorio padrao |
|---|---|---|
| `1` | Codex | `~/.codex/skills` |
| `2` | Claude | `~/.claude/skills` |
| `3` | Hermes | `~/.hermes/skills` |
| `4` | Outro | `SKILLS_CUSTOM_DIR` ou prompt |

Destino explicito:

```bash
curl -fsSL https://raw.githubusercontent.com/diego-anselmo/skills/main/scripts/setup-diego-anselmo-skills.sh \
  | bash -s -- --dest ~/.agents/skills --dest ~/.claude/skills
```

O bootstrap resolve `main` para um commit exato, baixa esse commit para cache persistente e copia somente a whitelist publica. Cada destino recebe `.diego-anselmo-skills.json` com origem, ref, commit e versao.

### A partir de clone

```bash
git clone https://github.com/diego-anselmo/skills.git
cd skills
./scripts/setup-diego-anselmo-skills.sh
```

Remotes recomendados para manutencao do fork:

```bash
git remote add upstream https://github.com/alltomatos/skills.git
git remote add source https://github.com/mattpocock/skills.git
```

### Re-deploy

Atualizacoes nunca sao aplicadas apenas porque o remote avancou. Depois de revisar e autorizar:

```bash
./scripts/setup-diego-anselmo-skills.sh --redeploy ~/.agents/skills ~/.claude/skills
```

Uma pasta existente que nao foi criada pelo framework recebe backup. Re-deploy de pasta gerenciada substitui somente a copia gerenciada, sem gerar backups repetidos.

## Fluxo de qualidade

```text
GitHub Issue aprovada
-> /implement
-> /tdd
-> verificacoes
-> commits locais
-> /code-review (Standards + Spec)
-> /qa-analyst
-> push
-> PR
```

Commits locais podem anteceder QA porque estabilizam o diff e nao constituem entrega. Push e PR permanecem bloqueados ate QA aprovado. Falha em code review ou QA retorna ao loop de implementacao.

## Invocacao

- **User-invoked**: a pessoa precisa escolher a skill. Claude usa `disable-model-invocation: true`; Codex usa `allow_implicit_invocation: false`.
- **Model-invoked**: o agent pode usar a skill quando a tarefa corresponder aos gatilhos.

`/orchestrator`, `/skill-router`, modos persistentes e provisionamento de maquina sao user-invoked. Subskills de planejamento, publicacao, implementacao, review e QA podem ser compostas por um fluxo ja autorizado; seus side effects continuam sujeitos a aprovacao e precondicoes proprias.

## Roteamento rapido

| Situacao | Skill |
|---|---|
| Nao sabe qual fluxo usar | [`/skill-router`](./skills/engineering/skill-router/SKILL.md) |
| Governar projeto e DAG | [`/orchestrator`](./skills/engineering/orchestrator/SKILL.md) |
| Executar uma Issue pronta | [`/implement`](./skills/engineering/implement/SKILL.md) |
| Revisar Standards e Spec | [`/code-review`](./skills/engineering/code-review/SKILL.md) |
| Validar entrega antes de PR | [`/qa-analyst`](./skills/engineering/qa-analyst/SKILL.md) |
| Diagnosticar bug ou regressao | [`/diagnose`](./skills/engineering/diagnose/SKILL.md) |
| Consultar assinatura de biblioteca | [`/query-docs`](./skills/engineering/query-docs/SKILL.md) |
| Investigar plataforma ou especificacao | [`/research`](./skills/engineering/research/SKILL.md) |

## Skills publicas

### Engineering

- [`/code-review`](./skills/engineering/code-review/SKILL.md): revisao independente de Standards e Spec.
- [`/devsetup`](./skills/engineering/devsetup/SKILL.md): provisionamento explicito de ambiente Windows.
- [`/diagnose`](./skills/engineering/diagnose/SKILL.md): reproducao, hipoteses falsificaveis e regressao.
- [`/grill-feature-with-docs`](./skills/engineering/grill-feature-with-docs/SKILL.md): alinhamento de feature existente contra codigo e docs.
- [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md): alinhamento de design, linguagem de dominio e ADRs.
- [`/implement`](./skills/engineering/implement/SKILL.md): execucao de uma GitHub Issue aprovada.
- [`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md): oportunidades de aprofundamento de modulos.
- [`/orchestrator`](./skills/engineering/orchestrator/SKILL.md): governanca, roadmap, Issues, execucao e QA.
- [`/prototype`](./skills/engineering/prototype/SKILL.md): prototipo descartavel para responder design.
- [`/qa-analyst`](./skills/engineering/qa-analyst/SKILL.md): portao final de qualidade antes de PR.
- [`/query-docs`](./skills/engineering/query-docs/SKILL.md): documentacao versionada de bibliotecas.
- [`/research`](./skills/engineering/research/SKILL.md): pesquisa auditavel em fontes primarias.
- [`/roadmap`](./skills/engineering/roadmap/SKILL.md): Epics estaveis ligadas a GitHub Issues.
- [`/scaffold-mvp`](./skills/engineering/scaffold-mvp/SKILL.md): bootstrap explicito de um MVP.
- [`/secure-e2e`](./skills/engineering/secure-e2e/SKILL.md): E2E com negative testing e seguranca.
- [`/setup-skills`](./skills/engineering/setup-skills/SKILL.md): governanca documental e tracker GitHub.
- [`/skill-router`](./skills/engineering/skill-router/SKILL.md): roteamento sem executar mudancas.
- [`/tdd`](./skills/engineering/tdd/SKILL.md): red-green-refactor em slices verticais.
- [`/to-issues`](./skills/engineering/to-issues/SKILL.md): planos e Epics em Issues rastreaveis.
- [`/to-prd`](./skills/engineering/to-prd/SKILL.md): contexto atual em PRD publicado.
- [`/triage`](./skills/engineering/triage/SKILL.md): maquina de estados de Issues e PRs externos.
- [`/zoom-out`](./skills/engineering/zoom-out/SKILL.md): mapa de modulos, callers e contexto.

### Productivity

- [`/caveman`](./skills/productivity/caveman/SKILL.md): comunicacao ultracompacta.
- [`/grill-me`](./skills/productivity/grill-me/SKILL.md): entrevista de plano sem persistencia documental.
- [`/handoff`](./skills/productivity/handoff/SKILL.md): transferencia compacta de contexto.
- [`/write-a-skill`](./skills/productivity/write-a-skill/SKILL.md): criacao de nova skill.

### Misc

- [`/git-guardrails-claude-code`](./skills/misc/git-guardrails-claude-code/SKILL.md): bloqueio de comandos Git destrutivos.
- [`/migrate-to-shoehorn`](./skills/misc/migrate-to-shoehorn/SKILL.md): migracao de assertions em testes.
- [`/scaffold-exercises`](./skills/misc/scaffold-exercises/SKILL.md): estrutura de exercicios.
- [`/setup-pre-commit`](./skills/misc/setup-pre-commit/SKILL.md): Husky, lint-staged, tipos e testes.

Skills em `personal/`, `in-progress/` e `deprecated/` nao sao distribuidas.

## Manutencao

```bash
npm run check
```

O check valida:

- manifesto e versao;
- whitelist contra as pastas publicas;
- links do README;
- nomes de frontmatter;
- pareamento de invocacao Claude/Codex;
- instalacao por stdin, backup e proveniencia.
