# Governanca de Skills

Repositorio canonico: `https://github.com/diego-anselmo/skills`.

Este framework distribui skills para desenvolvimento assistido por agentes. Ele deriva de `alltomatos/skills`, que deriva de `mattpocock/skills`; preserve creditos, mas toda instalacao e proveniencia ativa usam `diego-anselmo/skills`.

## Buckets e catalogo

Skills vivem sob `skills/`:

- `engineering/` - trabalho diario de codigo;
- `productivity/` - workflow geral;
- `misc/` - utilitarios publicos pouco frequentes;
- `personal/`, `in-progress/`, `deprecated/` - nao distribuidos.

`.claude-plugin/plugin.json` e a whitelist publica. Toda skill em `engineering/`, `productivity/` ou `misc/` deve:

1. possuir `SKILL.md` cujo `name` coincide com a pasta;
2. aparecer no manifesto;
3. possuir link no `README.md`;
4. manter metadata de invocacao coerente.

Execute `npm run check` depois de alterar skill, manifesto, instalador ou README.

## Invocacao

Cada skill e uma de duas:

- **user-invoked**: exige `disable-model-invocation: true` e `agents/openai.yaml` com `allow_implicit_invocation: false`;
- **model-invoked**: omite ambos e usa description rica em gatilhos.

Entry points, modos persistentes e provisionamento de maquina sao user-invoked. Subskills compostas pelo `/orchestrator` permanecem model-invoked, mas qualquer side effect exige um fluxo explicitamente iniciado e os gates da propria skill. Uma skill user-invoked nunca deve ser chamada implicitamente por outra.

## Instalacao

Instalador canonico:

```bash
./scripts/setup-diego-anselmo-skills.sh
```

Re-deploy explicito:

```bash
./scripts/setup-diego-anselmo-skills.sh --redeploy <destinos>
```

O instalador copia apenas a whitelist, preserva conteudo anterior em backup, grava `.diego-anselmo-skills.json` e fixa o commit resolvido. Execucao via pipe usa cache persistente por commit; nunca crie links para diretorios temporarios.

## Contrato do Orchestrator

O `/orchestrator` deve:

1. verificar origem, ref, versao e commit pelo manifesto instalado, sem exigir clone;
2. consultar o remote `diego-anselmo/skills` sem `pull`, merge ou reset;
3. informar atualizacoes, mas exigir autorizacao antes do re-deploy;
4. validar Git e remote GitHub do projeto consumidor;
5. documentar dominio e decisoes antes da implementacao;
6. manter roadmap e GitHub Issues como fontes persistentes;
7. delegar cada Issue aprovada para `/implement`;
8. exigir `/code-review` antes de `/qa-analyst`;
9. bloquear push e PR ate QA aprovado.

## Fluxo de qualidade

```text
GitHub Issue
-> implement/TDD
-> verificacoes
-> commits locais
-> code-review (Standards + Spec)
-> QA
-> push
-> PR
```

Commits locais podem anteceder QA; eles estabilizam o diff e nao constituem entrega. Falha em code review ou QA retorna a Issue ao ciclo. Nenhum PR e aberto antes da aprovacao do QA.

## Dependencias

- Hard: `to-issues`, `to-prd`, `triage`, `roadmap`, `implement` exigem configuracao criada por `/setup-skills`.
- Soft: `diagnose`, `tdd`, `code-review`, `improve-codebase-architecture`, `zoom-out` usam glossario e ADRs quando existirem, sem bloquear na ausencia.
