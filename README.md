# Bingo

Aplicação web simples para conduzir bingos presenciais: um painel de operador para sortear números e uma tela de projeção para o público acompanhar.

## Páginas

- **`dashboard.html`** — painel do operador: digitar/sortear números, definir a rodada, editar os prêmios e resetar o jogo.
- **`projecao.html`** — tela pública (projetor/TV): grade de 75 números (B-I-N-G-O), número atual sorteado, lista de prêmios e rodada.

Abra as duas páginas em abas/janelas separadas (ex: notebook do operador + tela do projetor) no mesmo navegador.

## Como rodar

Não há build, instalação de dependências ou etapa de compilação. Basta abrir os arquivos `.html` direto no navegador.

Se preferir, sirva a pasta com qualquer servidor estático — útil caso a sincronização entre abas via `BroadcastChannel` precise ser testada fora do protocolo `file://` (a maioria dos navegadores já funciona bem mesmo sem servidor).

## Como funciona

- **`bingo.js`** mantém o estado do jogo (`rodada`, `numeroAtual`, `sorteados`, `premios`) e sincroniza esse estado entre as abas usando `BroadcastChannel`. Toda alteração de estado é transmitida e recebida por todas as abas abertas, sem precisar de servidor/backend.
- Cada página (`dashboard.html` e `projecao.html`) define sua própria função `renderizar()`, chamada automaticamente sempre que o estado muda — é assim que a tela é atualizada.
- **`estilo.css`** é compartilhado pelas duas páginas, com temas claro (operador) e escuro (projeção).

## Estrutura

```
dashboard.html   → painel do operador
projecao.html    → tela de projeção
bingo.js         → estado do jogo + sincronização entre abas
estilo.css       → estilos compartilhados
```
