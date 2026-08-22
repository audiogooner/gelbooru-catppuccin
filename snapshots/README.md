# Snapshots

Slimmed Gelbooru DOM + original site CSS, so userstyle selectors can be written against real markup.

See [INDEX.md](INDEX.md) for captured pages.

## What is kept vs dropped

| Kept | Dropped / reduced |
| --- | --- |
| Element tree, classes, ids, inline `style` | Script/iframe *bodies* (empty tags stay for `:nth-child`); `on*` handlers |
| Header / nav / named chrome (so `:nth-child` still matches) | Image/video `src` (filename kept as `data-snapshot-src`) |
| A few samples of long lists (thumbnails, tag rows) | The rest of those lists, with an HTML comment noting the count |
| Original site stylesheets in `css/` | Huge `title`/`alt`/text payloads |

## Capture

```bash
npm run snapshot:fetch    # public pages
```

On any Gelbooru tab with `npm run dev` and the live-inject userscript: **Alt+Shift+S**. Use that for logged-in pages and for JS-injected chrome (ads, MOTD variants) that a plain fetch will miss.

Live capture also writes element screenshots to `previews/` for editor hover. Those PNGs stay local (gitignored). Install the hover extension with `npm run preview:install`.
