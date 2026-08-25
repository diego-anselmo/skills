---
name: skill-router
description: Indica a skill e o fluxo adequados para uma situacao sem iniciar governanca ou executar mudancas.
disable-model-invocation: true
---

# Skill Router

Roteie; nao execute. O usuario invoca `/skill-router` quando nao souber qual skill usar.

## Fluxo principal

```text
ideia/feature
-> grill-with-docs ou grill-feature-with-docs
-> orchestrator
-> roadmap/to-issues
-> implement
   (interno: TDD -> verificacoes -> commits locais -> code-review -> QA -> push/PR)
```

## Tabela de decisao

| Situacao | Skill inicial | Limite |
|---|---|---|
| Projeto ou iniciativa rastreavel | `/orchestrator` | Governa; nao implementa trabalho complexo |
| Feature nova em repositorio existente | `/grill-with-docs` | Define dominio e decisoes antes da DAG |
| Evolucao de feature existente | `/grill-feature-with-docs` | Confronta codigo e documentacao; nao implementa |
| Issue aprovada e desbloqueada | `/implement` | Executa somente aquela Issue |
| Bug ou regressao | `/diagnose` | Exige reproducao red-capable antes da solucao |
| Comportamento novo test-first | `/tdd` | Trabalha um seam e uma slice por ciclo |
| Revisao de branch/diff | `/code-review` | Standards e Spec; nao substitui QA |
| Portao final antes de PR | `/qa-analyst` | Obrigatorio depois do code review |
| API de biblioteca conhecida | `/query-docs` | Context7 e tipos locais |
| Investigacao ampla de plataforma/spec | `/research` | Fontes primarias citadas |
| Fluxos E2E ou barreiras de seguranca | `/secure-e2e` | Testa caminhos felizes e negativos |
| Arquitetura degradada | `/improve-codebase-architecture` | Descobre oportunidades; nao refatora sem aprovacao |
| Prototipo para responder design | `/prototype` | Codigo descartavel, fora da implementacao final |
| Falta de contexto da area | `/zoom-out` | Produz mapa; nao altera codigo |
| Nova skill necessaria | `/write-a-skill` | Use apenas para gargalo recorrente sem cobertura |

## Regras

- Uma pergunta simples nao deve acionar `/orchestrator`.
- Uma Issue ja pronta nao volta para grilling sem contradicao real.
- `/code-review` vem antes de `/qa-analyst`.
- Commits locais podem anteceder QA; push e PR permanecem bloqueados ate aprovacao.
- Se duas rotas forem igualmente plausiveis, apresente o trade-off e recomende uma; nao execute nenhuma.
