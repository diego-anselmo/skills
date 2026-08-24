---
name: implement
description: Executa uma GitHub Issue aprovada com TDD, verificacao, code review em dois eixos e QA antes do PR.
---

# Implement

Execute uma unica GitHub Issue aprovada por vez. Esta skill nao planeja roadmap, cria escopo nem publica Issues; `/orchestrator` e `/to-issues` fazem isso.

A configuracao do GitHub, das labels e da documentacao e dependencia hard. Se `docs/agents/issue-tracker.md` estiver ausente, instrua o usuario a executar `/setup-skills` e pare.

Use as definicoes compartilhadas de Module, Interface, Seam e Adapter do `CONTEXT.md`; quando o projeto nao as definir, consulte o vocabulario de `/improve-codebase-architecture`.

## Contrato de entrada

Antes de editar:

1. leia a Issue completa, comentarios, criterios de aceite, dependencias e Issue pai;
2. confirme que bloqueadores estao concluidos;
3. leia `CONTEXT.md`/`CONTEXT-MAP.md`, ADRs e regras do repositorio;
4. identifique a branch e o worktree da Issue;
5. registre os seams publicos que receberao testes;
6. pare para decisao humana se a mudanca tocar schema, autenticacao, dados persistidos ou API publica sem aprovacao registrada.

Requisito ausente ou contraditorio volta para a Issue; nao seja preenchido por suposicao do agente.

## Fluxo de execucao

### 1. TDD em slices verticais

Invoque `/tdd`. Para cada comportamento:

```text
RED: teste observavel falha pelo motivo esperado
GREEN: implementacao minima passa
VERIFICAR: teste especifico permanece verde
```

Nao escreva todos os testes antes da implementacao e nao teste detalhes internos.

### 2. Verificacao incremental

Depois de cada slice, rode apenas o teste e o typecheck aplicaveis. Ao concluir a Issue:

- execute todos os testes diretamente afetados;
- execute a verificacao de tipos/build aplicavel;
- exercite o comportamento real por smoke test quando houver superficie executavel;
- registre comandos e resultados sem expor secrets.

### 3. Commits locais

Commits locais pequenos sao permitidos antes do QA e fornecem pontos estaveis de revisao. Eles nao constituem entrega.

- mantenha o worktree limpo antes da revisao final;
- nao faça push e nao abra PR nesta fase;
- nunca misture mudancas de outra Issue.

### 4. Code review

Invoque `/code-review` contra a branch base. Ela deve revisar separadamente Standards e Spec.

Se o veredito exigir correcoes:

1. corrija por TDD quando houver mudanca comportamental;
2. reexecute verificacoes;
3. crie novo commit local;
4. repita `/code-review`.

### 5. Portao de QA

Com code review aprovado, invoque `/qa-analyst`. O QA confronta Issue, criterios, implementacao, testes, cenarios de erro e mudancas fora de escopo.

Falha de QA reabre o ciclo:

```text
correcao -> testes -> commit local -> code-review -> QA
```

## Entrega

Somente depois de `code-review: APROVADO` e `QA: APROVADO`:

1. confirme worktree limpo e verificacoes finais verdes;
2. faca push da branch conforme as regras do repositorio;
3. abra o PR usando o template do repositorio;
4. inclua Issue, criterios atendidos, evidencias de teste, veredito do code review e evidencia do QA.

Nunca abra o PR para obter o primeiro feedback de QA. Se o repositorio depender de CI remoto para um teste, o push da branch pode ser autorizado separadamente, mas o PR continua bloqueado ate QA aprovado.
