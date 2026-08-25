# Dependencias hard e soft de `/setup-skills`

Skills de engenharia consomem configuracao por repositorio: GitHub, labels de triagem e layout de documentacao. Algumas nao produzem resultado correto sem essa configuracao; outras apenas ficam menos precisas.

## Decisao

- **Dependencia hard** (`to-issues`, `to-prd`, `triage`, `roadmap`, `implement`): instrua o usuario a executar `/setup-skills` quando `docs/agents/issue-tracker.md` ou a configuracao exigida estiver ausente. Sem o mapeamento, pare antes de publicar, rotular ou executar uma Issue.
- **Dependencia soft** (`diagnose`, `tdd`, `code-review`, `improve-codebase-architecture`, `zoom-out`): consulte o glossario do projeto e os ADRs aplicaveis quando existirem. A ausencia nao bloqueia o trabalho; declare a perda de contexto quando ela afetar a conclusao.

O split mantem skills soft pequenas e evita carregar um ponteiro de setup onde ele nao e load-bearing. Dependencias hard falham cedo; dependencias soft degradam explicitamente.
