# Modo verify separado para `/setup-skills`

O framework nao adiciona uma segunda skill ou flag exclusiva para conferir `docs/agents/*.md`.

## Razao

`/setup-skills` ja pode receber uma solicitacao explicita de auditoria sem reescrever arquivos. Uma superficie paralela duplicaria templates e criaria drift.

O check automatizado `npm run check` valida o framework distribuidor, nao a governanca de um projeto consumidor. Esses contratos permanecem separados.
