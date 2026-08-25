# Whitelist publica e proveniencia de `diego-anselmo/skills`

**Status**: Active  
**Origem**: decisao iniciada em `alltomatos/skills`, mantida e ampliada por `diego-anselmo/skills`

## Contexto

O framework acumula skills de producao, utilitarios, experimentos e configuracoes pessoais. Descoberta indiscriminada pode distribuir material instavel ou privado. Instalacoes sem commit registrado tambem tornam atualizacoes impossiveis de auditar.

## Decisao

1. `.claude-plugin/plugin.json` e a unica whitelist de Skills publicas.
2. `engineering/`, `productivity/` e `misc/` sao buckets publicos; `personal/`, `in-progress/` e `deprecated/` nunca sao instalados implicitamente.
3. O instalador le a whitelist em vez de descobrir todas as pastas por `find`.
4. Skills sao copiadas para o destino. Symlink so seria aceitavel para origem persistente, mas nao faz parte do instalador suportado.
5. Execucao remota resolve `ref` para commit antes do download e guarda o framework em cache persistente por commit.
6. Cada destino recebe `.diego-anselmo-skills.json` com origem, ref, commit e versao.
7. Atualizacao remota e informada, mas exige autorizacao antes do re-deploy.

## Consequencias

- uma pasta nova nao e publicada por acidente;
- manifesto, README e estrutura precisam mudar juntos;
- remover uma Skill da whitelist e uma mudanca de API publica;
- instalacoes sobrevivem a limpeza de diretorios temporarios;
- um clone local deixa de ser necessario para verificar proveniencia;
- `npm run check` bloqueia drift entre catalogo, links, versao e metadata de invocacao.

## Linhagem

Este repositorio preserva credito a [alltomatos/skills](https://github.com/alltomatos/skills) e [mattpocock/skills](https://github.com/mattpocock/skills). Credito historico nao altera a origem operacional: instaladores, manifests e locks ativos apontam para `diego-anselmo/skills`.
