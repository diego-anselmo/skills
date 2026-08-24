---
name: query-docs
description: Resolves library documentation and fetches authoritative code snippets using Context7. Ensures correct API usage and prevents code hallucination when integrating third-party frameworks. Use when interacting with external libraries (Redis, Next.js, shadcn, database SDKs) or resolving build errors caused by library API changes.
---

# query-docs

Evitar alucinações de API e assinaturas obsoletas em dependências externas (Next.js, Tailwind, Prisma, Upstash). 

## FLUXO COM MCP CONTEXT7

1. **Resolva ID (Resolve ID)**:
   Procurar `libraryId` correto via `mcp_context7_resolve_library_id`.
   ```typescript
   mcp_context7_resolve_library_id({ libraryName: "Prisma", query: "..." })
   ```
2. **Consulte Docs (Query Docs)**:
   Rodar busca com ID encontrado via `mcp_context7_query_docs`.
   ```typescript
   mcp_context7_query_docs({ libraryId: "/prisma/prisma", query: "Como criar transação..." })
   ```
3. **Mapeamento local**:
   Salvar dependências em `.claude/context7.json` na raiz:
   ```json
   {
     "dependencies": {
       "redis": "/upstash/redis",
       "prisma": "/prisma/prisma"
     }
   }
   ```

## FALLBACKS

Context7 sem a biblioteca ou sem resposta suficiente:

1. confira tipos e codigo da versao instalada em `node_modules/` ou vendor;
2. para pergunta ampla de plataforma, servico, spec ou comportamento entre fontes, invoque `/research`;
3. diferencie assinatura confirmada de inferencia.

Context7 offline (HTTP 429/rede indisponivel) nao autoriza inventar API. Use somente tipos e fontes locais verificaveis; se forem insuficientes, declare o bloqueio.

## INTEGRACAO

- `/scaffold-mvp`: gera manifesto `.claude/context7.json` base.
- `/tdd` e `/diagnose`: erro de compilacao/tipagem usa `/query-docs` antes de correcao ad hoc.
- `/research`: cobre investigacoes que excedem uma assinatura de biblioteca.
- `/setup-skills`: cria `.claude/context7.json` quando essa convencao for adotada pelo projeto.
