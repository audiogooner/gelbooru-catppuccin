# Gelbooru — Catppuccin Mocha

SCSS source for a Gelbooru UserStyle, with a Violentmonkey userscript that live-injects compiled CSS while you edit.

## Develop

```bash
npm install
npm run dev
```

Then install the userscript from [http://127.0.0.1:3847/gelbooru-dev.user.js](http://127.0.0.1:3847/gelbooru-dev.user.js) in Violentmonkey. Open [gelbooru.com](https://gelbooru.com) — changes under `src/` are compiled and injected automatically.

A **dev** chip sits in the top-right of Gelbooru pages (**Alt+Shift+D**). From there you can turn the theme off, black out media, disable individual page bundles, or disable Gelbooru’s own CSS, without uninstalling anything. Reinstall the userscript if it is still below 1.4.0.

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

Writes a Stylus/Violentmonkey-compatible UserStyle to `gelbooru.user.css`.
