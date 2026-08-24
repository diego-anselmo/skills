# Orchestrator Delegation Protocol

> Templates e estruturas auxiliares para o `/orchestrator` v2.
> Importado por `SKILL.md` nas seções de Mentoria, Fragmentação e Fiscalização.

---

## Matriz de Autonomia de Delegação

O Orquestrador opera com base em **Tiers de Risco**. A autonomia é concedida conforme a natureza da tarefa:

### Tier 1: Rota Direta ("Fast Path" - Risco Mínimo)
O Orquestrador reconhece tarefas T1 (limpeza, documentações simples que não alteram lógica, refatorações safe e setups de ferramentas/linters) como elegíveis para o **Fast Path**:
- **Bypass de Processo**: Pula obrigatoriamente a atualização/auditoria de Roadmap estratégico global e as sessões burocráticas/extensivas de interrogatório via `/grill-with-docs` ou `/grill-me`.
- **Execução Atômica**: O Orquestrador planeja e executa a tarefa imediatamente de forma direta.
- **Guardrails de Qualidade Mandatorios**: Mudanca de codigo passa por `/implement`: TDD, verificacoes, commits locais, `/code-review` e `/qa-analyst`. Push e PR continuam bloqueados ate QA aprovado.
- **Acao**: Executa a mudanca atomica, registra no `ESTADO_ORQUESTRATOR.md` e entrega por PR somente depois dos gates.

### Tier 2: Execução em Batch (Risco Médio)
- **Configuração de ambiente**: Instalação de linters e formatadores, instrumentação de cobertura de testes, criação de ADRs estruturais e melhorias de performance localizada sem breaking changes.
- **Burocracia Reduzida**: Exige alinhamento com o `/roadmap` ativo antes de rodar os batches, mas permite agregação de commits.
- **Acao**: Executa cada Issue por `/implement`, permite commits locais agregados quando pertencem ao mesmo lote, registra o estado e reporta ao final.

### Tier 3: Governança Estratégica (Interativa Obrigatória)
Para decisões que impactam o domínio do projeto, a autonomia é **suspensa**. O Orquestrador deve pausar, apresentar o plano e aguardar o "Go" humano.
- **Mudanças de Domínio**: Definição de modelos de dados, novas funcionalidades, mudanças de arquitetura macro (ex: mudar de Monólito para Microserviços).
- **Roadmap**: Qualquer alteração na direção estratégica, priorização de Epics ou definição de prazos.
- **Regras de Negócio**: Qualquer modificação que altere o comportamento da aplicação conforme a regra do usuário.
- **Ação**: Para o fluxo → Apresenta PRD/Roadmap → Aguarda aprovação do usuário.

---



## Gatilho de Aprovação por Risco

O Orquestrador possui autonomia diferenciada baseada na criticidade técnica:
- **Tier 1 (Fast Path):** Pula grill e auditoria global de Roadmap, mas preserva verificacoes, code review e QA.
- **Tier 2 (Batchavel):** Executa continuamente o lote aprovado; cada Issue mantém seus gates e o batch para na primeira falha.
- **Tier 3 (Risco Alto):** Requer aprovacao explicita do plano e dos contratos que afetam dominio, schema, autenticacao, dados ou API publica. A aprovacao libera somente o escopo registrado. Testes, tipos, code review e QA continuam obrigatorios; o Orchestrator nunca amplia autonomamente o risco aprovado.

---

## Regras de Fragmentação (DAG & Atomização)

> **Regra de Ouro**: A autonomia é total. O Orquestrador fragmenta o plano macro em tarefas atômicas e identifica nós independentes no DAG.

### Delegação Paralela e Isolamento (Concorrência via Git Worktrees)
O Orquestrador pode e deve delegar tarefas simultâneas para otimizar o tempo de desenvolvimento, respeitando as seguintes diretrizes:

1. **Paralelismo da DAG**: Identifique tarefas independentes com dependências resolvidas no grafo e despache-as concorrentemente acionando múltiplos agentes executores em paralelo (ex: 2 subagentes operando em direções distintas).
2. **Uso de Git Worktree para Concorrência**: Sempre que a execução de tarefas paralelas for disparada, os subagentes associados **devem** rodar sob isolamento de worktree (`isolation: "worktree"`). Isso isola o ambiente de arquivos do usuário contra regressões sintáticas e conflitos no Git.
3. **Uso de Git Worktree por Tamanho de Atividade**: Mesmo no caso de uma única tarefa, se o tamanho da atividade envolver refatoração pesada de infra, transição de esquemas ou desenvolvimento de novos módulos inteiros (ou seja, tarefas que excedam a escrita de um único arquivo isolado ou demandem mais de 10 minutos de computação contínua), **instancie o subagente em uma worktree dedicada** para preservar a segurança da ramificação de desenvolvimento ativa do desenvolvedor.
4. **Resolução de Fusão (Merge)**: Ao finalizar as tarefas paralelas, o Orquestrador assume o papel de coletor das branches isoladas temporárias e executa a mesclagem estruturada (resolvendo conflitos se houverem) e valida a compilação geral da aplicação.

### Estrutura de Declaração de DAG (Grafo de Dependências):
Ao fragmentar o plano macro, o Orchestrator monta e persiste a modelagem no arquivo local `.claude/ESTADO_ORCHESTRATOR.md` seguindo o formato:

```markdown
### Tarefas
- [ ] T1: Configurar ambiente e scripts básicos (Tier 1) | depends_on: []
- [ ] T2: Implementar validador de domínio (Tier 2) | depends_on: [T1]
- [ ] T3: Alteração de schema Crítico (Tier 3) | depends_on: [T2]
```
O Orchestrator identifica tarefas elegíveis (dependências resolvidas) e pode disparar subagentes concorrentemente.
---

---

## Protocolo de Fila Sequencial e Gestão de Estado

O Orchestrator **nunca** gerencia tarefas apenas na memória curta. O estado persistido é rei.

### Guia de Delegação Rápida
O Orquestrador deve consultar esta tabela antes de disparar qualquer delegação:

| Problema | Skill |
| --- | --- |
| Governança & Orquestração | `/orchestrator` |
| Execucao de Issue aprovada | `/implement` |
| Revisao Standards + Spec | `/code-review` |
| QA final antes de push/PR | `/qa-analyst` |
| Versionamento & PRs | Fluxo Git documentado, depois de QA |
| Infraestrutura documental ausente | `/setup-skills` |
| Linguagem de dominio ausente | `/grill-with-docs` |
| Arquitetura degradada | `/improve-codebase-architecture` |
| Bug dificil ou regressao | `/diagnose` |
| Codigo sem testes | `/tdd` |
| Pesquisa ampla de plataforma/spec | `/research` |
| Falta de contexto | `/zoom-out` |
| Gargalo recorrente nao mapeado | `/write-a-skill` |
| Alinhamento antes de mudanca | `/grill-me` |
| Handoff para outro agent | `/handoff` |

---

### Ciclo de Execução do Gestor de Operações:

1. **Atualiza Estado**: O Orchestrator lê de/escreve em `.claude/ESTADO_ORCHESTRATOR.md` a cada tarefa concluída.
2. **Checa Bloqueios**: Identifica a próxima tarefa cujas dependências já foram finalizadas.
3. **Delegação e Retorno**:
   - Dispara a tarefa no agente/skill associada.
   - Aguarda conclusão.
4. **Sanity Checkpoint (A cada 3-5 conclusões)**:
   A cada 3 tarefas passadas à categoria de `completed`, o Orchestrator deve pausar para rodar a checklist de sanidade:
   ```checklist
   [ ] As premissas originais do projeto continuam válidas?
   [ ] Houve desvio técnico que necessita de replanejamento na DAG?
   [ ] Novas dependências ou GAPs de criticidade P1 surgiram durante a execução?
   ```
   *Se falhar*: Recalcula rotas, edita a DAG no arquivo de estado e reinicia a execução de forma controlada.

---

## Protocolo de Operação: Modo Eficiência (Qualidade e Validação)

A partir de agora, o Orquestrador opera em **Modo Eficiência**. O objetivo é zero retrabalho.

1. **Atraso Deliberado (The "Wait-and-Validate" Principle)**: Em vez de disparar delegações em paralelo, o Orquestrador deve esperar a confirmação completa da skill anterior (ex: `setup-skills`) antes de cogitar a próxima (ex: `grill-with-docs`).
2. **Qualidade em Tiers**:
   - **Fase de Setup**: Interatividade total. Nenhum comando é automatizado sem feedback positivo.
   - **Fase de Planejamento**: Obrigatório o uso do `roadmap` e `plan`. Nenhuma delegação de código ocorre sem o plano estar aprovado no `ORCHESTRATOR-ROADMAP.md`.
   - **Fase de Execução**: O foco é em atomicidade. Se uma tarefa complexa surgir, ela **deve** ser fatiada antes da execução.
3. **Paciência Estratégica**: É preferível perder 5 minutos a mais no setup do que ter que deletar e reconstruir arquivos por causa de falhas de contexto.
---

## Template: Fiscalização de Testes (Durante e Pós-Fila)

### 1. Checkpoint de Fila (Após cada tarefa que altere código)
Antes de marcar a tarefa como `completed` no estado, o Orchestrator deve validar o suite de teste localmente:
- A funcionalidade alterada possui testes? (verificado via `git diff` / `Read`)
- O runner de testes local (`npm test`, `pytest`, etc.) está verde?
Se falhar: Invocar `/diagnose` imediatamente na unidade afetada antes de passar para a próxima tarefa da DAG.

### 2. Fiscalização Pós-Fila (Conclusão Geral)
Após a última tarefa da DAG passar para `completed`, executa a fiscalização agregada final:
```checklist
[ ] Suite completa de testes passa?
[ ] Novos arquivos de teste (.test.* / .spec.*) foram criados/modificados?
[ ] A cobertura de código manteve ou aumentou em relação à baseline?
[ ] Nenhum teste flaky (falha intermitente) foi introduzido?
[ ] Nenhuma credencial/secreto foi exposta em arquivos de teste ou fixtures?
```
- Opcional: Gerar um resumo de impacto das mudanças.

### 3. Code Review (Mandatario, Pre-QA)

Depois dos testes e commits locais, toda mudanca de codigo passa por `/code-review`:

- [ ] Standards confrontou regras, glossario e ADRs?
- [ ] Spec classificou cada criterio de aceite?
- [ ] Achados bloqueantes foram corrigidos e revisados novamente?

Code review aprovado libera QA; nao libera PR.

### 4. Portao de QA (Mandatario, Pre-PR)

`/qa-analyst` e o ultimo portao independente para todos os Tiers:

- [ ] requisitos e Issue foram confrontados com a implementacao?
- [ ] caminhos felizes, erros e barreiras de seguranca foram avaliados?
- [ ] evidencias de testes e smoke test correspondem ao comportamento?
- [ ] nao houve mudanca fora de escopo?

Falha de QA reabre a DAG: correcao -> testes -> commit local -> code review -> novo QA.

### 5. Protocolo de PR e Fechamento

Somente depois de QA aprovado:

- [ ] push da branch conforme regras do repositorio;
- [ ] commits seguem a convencao local;
- [ ] template de PR foi preenchido;
- [ ] Issue, code review, QA e evidencias foram vinculados;
- [ ] nenhuma credencial/secreto foi exposta.
---


## Referência Rápida: Mapeamento GAP → Skill

| GAP Identificado | Skill Delegada | Tier de Risco |
|------------------|----------------|---------------|
| Testes ausentes ou frageis | `/tdd` | Batch |
| Issue aprovada para execucao | `/implement` | Conforme Issue |
| Diff concluido, antes de QA | `/code-review` | Mandatorio |
| Fim de desenvolvimento, antes de push/PR | `/qa-analyst` | Mandatorio |
| Arquitetura degradada/acoplada | `/improve-codebase-architecture` | Batch |
| Bug/regressão | `/diagnose` | Block |
| Linguagem de domínio desalinhada | `/grill-with-docs` | Auto |
| Repositório vazio requer base técnica e frameworks para MVP ágil | `/scaffold-mvp` | Block |
| Não há skill para o gargalo | `/write-a-skill` | Block |
