# diego-anselmo/skills

Framework de skills para desenvolvimento assistido por agentes, com governanca GitHub, documentacao persistente, TDD, revisao em dois eixos e QA obrigatorio.

Origem ativa: [diego-anselmo/skills](https://github.com/diego-anselmo/skills). Linhagem: fork de [alltomatos/skills](https://github.com/alltomatos/skills), por sua vez derivado de [mattpocock/skills](https://github.com/mattpocock/skills).

## Linguagem

**Framework**:
O conjunto versionado de Skills, manifesto, instalador e regras de governanca publicado por `diego-anselmo/skills`.
_Evitar_: alltomatos framework, clone de skills

**Skill**:
Unidade composavel de instrucao definida por uma pasta com `SKILL.md`.
_Evitar_: plugin, comando como sinonimo

**Module**:
Qualquer unidade com Interface e implementacao: funcao, classe, pacote ou slice.
_Evitar_: component, service

**Interface**:
Tudo que um caller precisa saber para usar um Module: tipos, invariantes, erros, ordem, configuracao e performance.
_Evitar_: assinatura como definicao completa, API

**Seam**:
Local onde a Interface permite alterar comportamento sem editar o caller; e tambem a superficie de teste.
_Evitar_: detalhe interno, boundary

**Adapter**:
Implementacao concreta que ocupa um Seam.
_Evitar_: abstracao criada sem variacao real

**Skill publica**:
Skill pertencente a `engineering`, `productivity` ou `misc` e declarada na whitelist do plugin.
_Evitar_: toda pasta encontrada, skill instalada por acidente

**ModoInvocacao**:
Contrato que define se uma Skill e iniciada somente pelo Usuario (`user-invoked`) ou tambem pelo agent (`model-invoked`).
_Evitar_: trigger como autorizacao implicita

**ManifestoInstalado**:
Arquivo `.diego-anselmo-skills.json` que registra origem, ref, commit, versao e instante da copia instalada.
_Evitar_: clone local como unica proveniencia, data de arquivo como versao

**Issue**:
Unidade rastreada de trabalho no GitHub: bug, tarefa, PRD, Epic ou slice vertical.
_Evitar_: tarefa apenas em memoria, ticket local

**PapelTriagem**:
Label canonica da maquina de estados de uma Issue, mapeada em `docs/agents/triage-labels.md`.
_Evitar_: label livre sem estado

**CodeReview**:
Revisao do diff em dois eixos independentes: Standards e Spec.
_Evitar_: QA, lint ou teste como sinonimos

**QA**:
Portao final que confronta requisitos, implementacao, testes, erros e escopo antes de push e PR.
_Evitar_: code review como substituto, CI como aprovacao de QA

## Relacoes

- O Framework distribui Skills publicas.
- Cada Skill possui exatamente um ModoInvocacao.
- O ManifestoInstalado identifica uma revisao exata do Framework.
- Um Module apresenta uma Interface.
- Um Adapter ocupa um Seam e satisfaz a Interface.
- Callers e testes observam o Module pelo mesmo Seam.
- Uma Issue aprovada e executada por `implement`.
- CodeReview aprovado libera QA.
- QA aprovado libera push e PR.
