# Trackers diferentes do GitHub

`diego-anselmo/skills` usa GitHub como fonte obrigatoria de Issues, dependencias, revisao e historico. Adicionar GitLab, Linear, tracker local ou backend experimental ao fluxo principal esta fora de escopo.

## Razao

Cada backend adiciona semantica propria de labels, dependencias, comentarios, sub-issues, autenticacao e CLI. Uma abstracao generica reduziria as garantias de rastreabilidade que motivam este fork e multiplicaria a superficie de testes de `setup-skills`, `roadmap`, `to-issues`, `triage`, `implement` e `code-review`.

Projetos que nao usam GitHub podem adaptar o fork, mas o framework canonico falha cedo em vez de usar fallback local silencioso.
