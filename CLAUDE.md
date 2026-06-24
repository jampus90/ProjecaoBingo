# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A vanilla HTML/CSS/JS bingo caller app for in-person events, with no build step, no package manager, and no dependencies. There are two pages meant to be open in separate browser windows/tabs (e.g. operator's laptop + projector display) on the same browser session:

- `dashboard.html` — operator control panel: draw numbers, set the round, edit prizes, reset the game.
- `projecao.html` — the public-facing projection screen: 75-number grid (B-I-N-G-O), current drawn number, prize list, round header.

## Running

There is no build/test/lint tooling. Open the HTML files directly in a browser, or serve the folder with any static file server (required if `BroadcastChannel` cross-tab behavior needs to be tested from `file://`, some browsers handle this fine without a server too). Open both `dashboard.html` and `projecao.html` to see state sync in action.

## Architecture

**State synchronization via `BroadcastChannel`:** `bingo.js` is loaded by both pages and holds a single shared `estado` object (`{ rodada, numeroAtual, sorteados, premios }`). All mutating functions (`sortearNumero`, `setRodada`, `setPremio`, `resetar`) mutate the local `estado`, then call `sincronizar()` to `postMessage` the entire state object over a `BroadcastChannel('bingo')`. Every tab listens via `canal.onmessage` and replaces its local `estado` wholesale with the received data — this is how the dashboard and projection screen stay in sync across tabs/windows without a server or backend.

**Render hook pattern:** `bingo.js` has no knowledge of the DOM. Each page defines its own `renderizar()` function in an inline `<script>` block after loading `bingo.js`. Every state-mutating function in `bingo.js` checks `typeof renderizar === 'function'` and calls it after changing state — this is also called by `canal.onmessage` when state arrives from the other tab. This means `bingo.js` is shared, but the actual DOM update logic is page-specific and lives inline in `dashboard.html` / `projecao.html`.

**Letter mapping:** `getLetra(numero)` maps 1-75 into the B/I/N/G/O ranges (1-15/16-30/31-45/46-60/61-75) and is used by both pages.

**Shared styling:** `estilo.css` is shared by both pages via the `.tela-dashboard` (light, operator) and `.tela-projecao` (dark, projector) body classes, plus CSS custom properties defined once in `:root`.

**Prize data flow:** prize descriptions are edited locally in `dashboard.html` (`premiosLocais` array) and pushed to shared state on every keystroke/add/remove. The projection page only reads `estado.premios` in its `renderizar()` — it has no editing UI.
