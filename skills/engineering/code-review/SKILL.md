---
name: code-review
description: Revisa um diff em dois eixos independentes, Standards e Spec. Use ao concluir uma Issue, revisar uma branch ou preparar o portao de QA.
---

# Code Review

Revise a mudanca sem editar o codigo. O objetivo e separar dois tipos de falha que nao podem se mascarar:

- **Standards**: o diff respeita as regras e a arquitetura do repositorio?
- **Spec**: o diff implementa exatamente a Issue, spec ou PRD de origem?

Esta revisao acontece depois dos testes e commits locais, mas antes de `/qa-analyst` e antes de abrir o PR.

## 1. Fixar o ponto de comparacao

Use o ponto informado pelo usuario. Se nenhum foi informado, use a base declarada pela Issue ou pela convencao de branches do repositorio. Nao adivinhe entre referencias igualmente plausiveis.

Confirme que a referencia resolve e que o diff de tres pontos nao esta vazio:

```bash
git diff <base>...HEAD
git log <base>..HEAD --oneline
```

Inclua alteracoes ainda nao commitadas apenas quando o usuario pedir revisao de work in progress; identifique-as separadamente.

## 2. Localizar a Spec

Procure nesta ordem:

1. Issue referenciada na branch ou nos commits;
2. Issue pai registrada no roadmap ou estado operacional;
3. caminho de spec/PRD informado pelo usuario;
4. arquivo correspondente sob `docs/` ou `specs/`.

Se nao houver Spec, declare `Spec indisponivel`; nao invente requisitos.

## 3. Fontes de Standards

Leia somente as fontes aplicaveis ao diff:

- `AGENTS.md` ou `CLAUDE.md`;
- `CONTEXT.md` ou contexto apontado por `CONTEXT-MAP.md`;
- ADRs da area alterada;
- `CONTRIBUTING.md` e configuracoes de linguagem;
- convencoes existentes nos modulos vizinhos.

Ferramentas ja cobrem formatacao, lint e tipos. Nao repita seus diagnosticos como achados de revisao.

Use como heuristicas, nunca como violacoes automaticas: nome misterioso, duplicacao, feature envy, data clump, primitive obsession, switches repetidos, shotgun surgery, divergent change, speculative generality, message chain e middle man. Uma regra documentada do repositorio sempre prevalece.

## 4. Executar dois eixos independentes

Quando o harness oferecer subagentes, execute Standards e Spec em contextos independentes, preferencialmente em paralelo. Se nao oferecer, execute sequencialmente sem misturar os criterios.

### Standards

Para cada achado:

- cite arquivo e linha/hunk;
- cite a regra documentada violada;
- diferencie `violacao` de `heuristica`;
- explique o impacto observavel;
- ignore preferencias sem consequencia tecnica.

### Spec

Para cada criterio de aceite, classifique:

- `atendido`;
- `parcial`;
- `ausente`;
- `fora de escopo`.

Reporte requisitos faltantes, comportamento adicional nao solicitado e implementacoes que aparentam cumprir o texto mas quebram o comportamento pretendido.

## 5. Saida

```markdown
## Standards

### Bloqueantes
- [arquivo:linha] achado, regra e impacto

### Nao bloqueantes
- [arquivo:linha] heuristica e trade-off

## Spec

| Criterio | Estado | Evidencia |
|---|---|---|
| ... | atendido/parcial/ausente | arquivo, teste ou comando |

## Veredito

APROVADO | CORRECOES NECESSARIAS | SPEC INDISPONIVEL
```

Nao aprove quando houver achado bloqueante em qualquer eixo. Depois das correcoes, revise novamente o diff atualizado. A aprovacao desta skill libera o portao de `/qa-analyst`; nao o substitui.
