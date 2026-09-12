# Agent notes

Gelbooru UserStyle. Edit SCSS under `src/`; `style.config.mjs` registers `@-moz-document` bundles.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Live-inject server on `:3847` + publish `gelbooru.user.css` |
| `npm run check` | Tests, catalog doctor, style lint |
| `npm run doctor` | Bundles vs `src/pages` vs snapshots |
| `npm run lint:styles` | Duplicate / redundant / dead selectors |
| `npm run export` | Expanded + minified UserStyle |
| `npm run snapshot:fetch` | Public page snapshots (`--only id`, `--force`) |
| `npm run preview:install` | Symlink the selector-hover editor extension |

## Selectors

Before changing selectors, read `snapshots/INDEX.md`, the page `outline.txt` + `.html`, and site CSS in `snapshots/css/`. Prefer class/id. Treat `<!-- snapshot: omitted … -->` as a gap — `:nth-child` after it is not the live tree.

New page: add `src/pages/<id>.scss`, register it in `bundles`, capture a snapshot (Alt+Shift+S or `snapshot:fetch`), then `npm run doctor`.
