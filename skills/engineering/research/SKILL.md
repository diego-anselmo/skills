---
name: research
description: Investiga uma pergunta com fontes primarias e entrega achados citados. Use para APIs, plataformas, specs ou decisoes que Context7 nao cobre.
---

# Research

Investigue uma pergunta delimitada sem substituir planejamento ou decisao humana.

## Fontes

Priorize, nesta ordem:

1. especificacoes e normas oficiais;
2. documentacao oficial da versao em uso;
3. codigo-fonte e tipos publicados pelo fornecedor;
4. APIs e changelogs de primeira parte;
5. issues ou discussoes oficiais quando documentarem comportamento ainda nao publicado.

Nao fundamente conclusoes em posts, agregadores ou memoria parametrica quando uma fonte primaria estiver disponivel. Se uma fonte secundaria ajudar a localizar o fato, siga ate a fonte que o possui.

## Execucao

Quando o harness oferecer subagentes, delegue a leitura para um agente de pesquisa em background e continue apenas trabalhos independentes. Passe pergunta, versoes, restricoes e formato de saida completos.

Para cada afirmacao relevante:

- cite URL, arquivo ou simbolo;
- registre a versao/data observada;
- diferencie fato, inferencia e lacuna;
- confronte fontes que divergem;
- nao copie secrets, tokens ou dados pessoais.

Use `/query-docs` primeiro para uma assinatura pontual de biblioteca coberta por Context7. Use `/research` quando a pergunta cruza varias fontes, envolve plataforma/servico ou precisa de uma conclusao persistente e auditavel.

## Saida

Se o repositorio ja tiver uma convencao para notas de pesquisa, use-a. Caso contrario, publique os achados na Issue que motivou a investigacao em vez de criar documentacao solta.

```markdown
## Pergunta

## Conclusao

## Evidencias
- afirmacao — fonte primaria

## Incertezas

## Impacto na decisao
```

Pesquisa informa `/grill-with-docs`, ADRs e Issues; nao toma decisoes de produto nem implementa a mudanca pesquisada.
