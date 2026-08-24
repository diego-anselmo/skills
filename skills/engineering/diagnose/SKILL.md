---
name: diagnose
description: Diagnostica bugs e regressoes por reproducao, minimizacao, hipoteses falsificaveis, instrumentacao e teste de regressao. Use quando algo falha, quebra ou fica lento.
---

# Diagnose

Nao sugira tentativas. Construa evidencia, encontre a causa raiz, aplique a menor correcao e repita o cenario original.

Leia o glossario de dominio e os ADRs da area quando existirem. Eles sao dependencias soft: a ausencia reduz precisao, mas nao bloqueia o diagnostico.

## Segredos e artefatos

Comandos, logs, HARs, traces e dumps podem conter credenciais. Antes de mostrar ou persistir qualquer saida:

- substitua secrets por `<REDACTED>`;
- mantenha credenciais em variaveis de ambiente;
- cite somente linhas que carregam sinal;
- nao grave headers de autenticacao em fixtures.

Se a redacao remover a evidencia necessaria, explique o limite e solicite um artefato seguro.

## Fase 1 - Loop red-capable

Antes de formular solucao, obtenha um comando rapido, deterministico e executavel pelo agente que possa ficar vermelho para o sintoma exato informado pelo usuario.

Ordem preferida:

1. teste no seam que alcanca o bug;
2. requisicao HTTP/curl contra o servidor;
3. CLI com fixture e saida esperada;
4. browser headless verificando DOM, console e rede;
5. replay de trace ou payload capturado;
6. harness minimo;
7. property/fuzz loop para falha intermitente;
8. `git bisect run` para regressao entre estados conhecidos;
9. comparacao diferencial entre versoes/configuracoes;
10. script HITL baseado em `scripts/hitl-loop.template.sh`.

O loop esta pronto somente quando:

- ja foi executado e reproduziu o sintoma correto;
- falha pelo comportamento, nao por erro de setup;
- leva segundos, nao minutos;
- produz o mesmo veredito em repeticoes;
- pode ser executado sem intervencao, salvo pelo template HITL.

Sem esse comando, nao avance para hipoteses. Liste o que foi tentado e solicite acesso, artefato redigido ou instrumentacao temporaria.

## Fase 2 - Reproduzir e minimizar

Execute o loop mais de uma vez. Confirme que ele detecta o problema relatado, nao uma falha vizinha.

Reduza uma variavel por vez:

- entrada e dados;
- callers;
- configuracao;
- dependencias;
- ambiente;
- passos do fluxo.

Cada elemento restante deve ser load-bearing: removê-lo faz o loop ficar verde. A reproducao minima sera a base do teste de regressao.

## Fase 3 - Hipoteses falsificaveis

Produza de tres a cinco hipoteses ordenadas por probabilidade e custo de teste.

Formato obrigatorio:

```text
H1: Se <causa> for verdadeira, entao <probe> produzira <resultado observavel>.
```

Uma explicacao sem predicao testavel e apenas um palpite. Mostre a lista ao usuario; conhecimento de dominio pode reordena-la. Se o usuario estiver AFK, prossiga pela ordem registrada.

## Fase 4 - Instrumentar e testar

Cada probe deve distinguir hipoteses especificas. Altere uma variavel por vez.

Preferencia:

1. debugger ou REPL;
2. assertion ou probe no seam;
3. log direcionado;
4. trace/metrica quando o fluxo for distribuido.

Logs temporarios recebem prefixo unico, como `[DEBUG-a4f2]`. Nunca use “logar tudo e procurar depois”.

Para performance:

1. estabeleca baseline reproduzivel;
2. use profiler, query plan ou medicao apropriada;
3. faça bisect quando houver estado conhecido;
4. compare medidas antes e depois.

## Fase 5 - Teste de regressao e correcao

Escreva o teste de regressao antes do fix, no seam que reproduz o padrao real.

Se o seam disponivel for superficial demais, nao escreva um teste que gera falsa confianca. Registre que a arquitetura impede travar a regressao e encaminhe o gap para `/improve-codebase-architecture`.

Com seam correto:

1. transforme a reproducao minima em teste;
2. observe o teste falhar pelo motivo esperado;
3. aplique a menor correcao de causa raiz;
4. observe o teste passar;
5. repita o loop original, nao minimizado.

Nao silencie excecoes, nao relaxe assertions e nao crie special case para a fixture.

## Fase 6 - Limpeza e fechamento

Antes de declarar resolvido:

- loop original verde;
- teste de regressao verde;
- testes diretamente afetados verdes;
- todos os prefixos `[DEBUG-...]` removidos;
- artefatos temporarios removidos;
- causa correta e hipoteses descartadas registradas;
- nenhum secret persistido.

Se o fix for entrega permanente, encaminhe o diff para `/code-review` e depois `/qa-analyst`. Push e PR permanecem bloqueados ate QA aprovado.