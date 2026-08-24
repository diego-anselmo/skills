---
name: tdd
description: Desenvolvimento orientado a testes em slices verticais. Use para implementar comportamento novo ou corrigir bugs com red-green-refactor.
---

# TDD

TDD verifica comportamento por interfaces publicas. O teste deve sobreviver a uma troca completa da implementacao quando o contrato observavel permanece.

O glossario do projeto e os ADRs aplicaveis sao dependencias soft. Use seus termos nos testes quando existirem.

## Seam e interface

**Seam** e o ponto publico onde callers e testes observam comportamento. A interface inclui assinatura, invariantes, erros, ordem, configuracao e caracteristicas de performance.

Antes do primeiro teste:

1. identifique os seams candidatos;
2. escolha o menor conjunto que cobre os comportamentos criticos;
3. registre esse acordo com o usuario ou na Issue;
4. nao teste alem da interface escolhida.

Se nao houver seam testavel, o problema e de design. Use o vocabulario de modulo, interface, profundidade, seam, adapter, leverage e locality de `/improve-codebase-architecture` antes de criar mocks ou metodos apenas para teste.

## Testes que permanecem

Um bom teste:

- descreve um comportamento observavel;
- usa valor esperado vindo da spec, exemplo trabalhado ou fonte independente;
- exercita codigo real pelo seam;
- e deterministico e isolado;
- falha em um bug plausivel.

Evite:

- mocks de colaboradores internos;
- assertions tautologicas;
- acesso a metodos privados;
- snapshots de shape sem valor de negocio;
- teste que consulta um side channel em vez da interface;
- todos os testes primeiro e toda a implementacao depois.

Consulte [tests.md](tests.md), [mocking.md](mocking.md), [deep-modules.md](deep-modules.md) e [interface-design.md](interface-design.md).

## Loop por slice

Para cada comportamento, exatamente nesta ordem:

```text
RED      -> escrever um teste minimo
VER RED  -> executar e confirmar falha pelo motivo esperado
GREEN    -> escrever apenas o codigo necessario
VER GREEN-> executar o teste e os vizinhos afetados
REFACTOR -> limpar duplicacao somente com tudo verde
```

Regras:

- uma slice, um teste e um comportamento por ciclo;
- teste que passa imediatamente nao prova o novo contrato;
- erro de setup nao e RED valido;
- nao antecipe a proxima slice;
- nao altere o teste para acomodar implementacao errada;
- refactor nunca acontece em RED.

## Fechamento

Ao concluir:

1. rode os testes diretamente afetados e o typecheck/build aplicavel;
2. exercite a superficie real quando houver;
3. permita commits locais pequenos como checkpoints;
4. envie o diff para `/code-review`;
5. corrija e repita a revisao;
6. com code review aprovado, invoque `/qa-analyst`.

Push e PR permanecem bloqueados ate QA aprovado. Commits locais nao sao entrega e podem anteceder o portao.
