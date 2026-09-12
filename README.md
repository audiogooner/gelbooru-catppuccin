# Gelbooru — Catppuccin Mocha

SCSS source for a Gelbooru UserStyle, with a Violentmonkey userscript that live-injects compiled CSS while you edit.

## Develop

```bash
npm install
npm run dev
```

Then install the userscript from [http://127.0.0.1:3847/gelbooru-dev.user.js](http://127.0.0.1:3847/gelbooru-dev.user.js) in Violentmonkey. Open [gelbooru.com](https://gelbooru.com) — changes under `src/` and bundle changes in `style.config.mjs` are compiled and injected automatically. Every successful rebuild also publishes the latest complete UserStyle to `gelbooru.user.css`; a Sass or configuration error leaves the last good bundle in place.

A **dev** chip sits in the top-right of Gelbooru pages (**Alt+Shift+D**). From there you can turn the theme off, black out media, disable individual page bundles, or disable Gelbooru’s own CSS, without uninstalling anything. Drag the chip (or the panel header) to move it out of the way — the position is remembered, and **Reset** puts it back. Reinstall the userscript if it is still below 1.5.0.

Disable any installed copy of the exported UserStyle while developing, or the two will fight.

## Page styles

Per-page SCSS bundles, layout families, tokens, and selector conventions: [`docs/PAGE_STYLE_GUIDE.md`](docs/PAGE_STYLE_GUIDE.md).

## Page snapshots

Slimmed HTML + original Gelbooru CSS live in [`snapshots/`](snapshots/INDEX.md). They exist so selectors can be written against the real DOM without keeping megabytes of thumbnails, script bodies, and ads.

```bash
npm run snapshot:fetch    # public pages
```

On any Gelbooru tab with the dev userscript and server running, **Alt+Shift+S** captures the live DOM (after JS, ads, and login state). Reinstall the userscript if it is still below 1.4.0.

## Selector hover previews

Captured element screenshots can show up when you hover a selector in `src/**/*.scss`.

```bash
npm run preview:install    # once; then reload the Cursor window
```

After that, **Alt+Shift+S** also screenshots matching elements into `snapshots/previews/` (gitignored). Hover a rule to see the last capture. Turn off **Black out media** first if you want post thumbnails visible in the preview.

## Export

```bash
npm run export
```

Writes an expanded Stylus/Violentmonkey UserStyle to `gelbooru.user.css` (git / review) and a minified install copy to `gelbooru.min.user.css`.

## Lint

```bash
npm run lint:styles   # duplicate/redundant/dead selector report
```

Compiles each page bundle and reports duplicate selectors, copied declaration blocks, rules that already live in `base.scss`, and selectors that miss the page snapshot. See [`docs/LINT.md`](docs/LINT.md).
