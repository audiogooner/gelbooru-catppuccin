# Page style guide

How to add and extend per-page styles in this userstyle. Read this together with [`snapshots/INDEX.md`](../snapshots/INDEX.md) and [`.cursor/rules/snapshots.mdc`](../.cursor/rules/snapshots.mdc).

## Architecture

| Layer | File | Scope |
| --- | --- | --- |
| Palette | `src/_palette.scss` | Catppuccin Mocha CSS variables (`--base`, `--blue`, …) |
| Global | `src/base.scss` | Every Gelbooru page: body, links, forms, nav, tags, tables, pagination, comments |
| Shared chrome | `src/_bootstrap-chrome.scss`, `src/_messages-chrome.scss` | Mixins for bootstrap-layout pages (navbar, mail alerts) and messages.css pages |
| Page bundle | `src/pages/<name>.scss` | One SCSS file per URL match in `style.config.mjs` |
| Export | `gelbooru.user.css`, `gelbooru.min.user.css` | All bundles wrapped in `@-moz-document` rules (expanded + minified) |

**Rule of thumb:** put cross-page patterns in `base.scss`. Put layout-specific or page-only overrides in `src/pages/`. Do not duplicate what `base.scss` already handles unless the page needs to fight site CSS more aggressively.

## Workflow for a new page

1. **Find or capture a snapshot** — open [`snapshots/INDEX.md`](../snapshots/INDEX.md). If the page is missing, run `npm run snapshot:fetch` (public) or **Alt+Shift+S** on a live tab (logged-in / JS-heavy).
2. **Read structure first** — `snapshots/pages/<id>.outline.txt` (tree), then `.html` for attributes and inline styles. Check which site CSS the page loads (column in INDEX).
3. **Identify the layout family** (see below). Copy patterns from the closest existing page bundle.
4. **Create** `src/pages/<name>.scss` with a section header comment.
5. **Register the bundle** in `style.config.mjs`:
   - Add an entry to `bundles` with a matching `@-moz-document` URL.
   - Prefer `url-prefix("…")` whenever pagination or query params appear (`&pid=`, `&id=`, form GET params). Exact `url("…")` only for truly static URLs.
6. **Develop** with `npm run dev` and the live-inject userscript. Use the dev chip to toggle individual bundles — confirm the new id is checked under **THIS PAGE**.
7. **Export** with `npm run export` when testing Stylus (not only live inject). That writes expanded `gelbooru.user.css` and minified `gelbooru.min.user.css`.
8. **Optional:** run `npm run preview:install` once, then hover selectors in SCSS to see snapshot screenshots.

### `@-moz-document` matching

The bundle `document` string must match the page URL you are styling:

```js
// Prefer prefix — covers pagination and form GET params
document:
  'url-prefix("https://gelbooru.com/index.php?page=tags&s=list")',

// Exact page (no varying query)
document: 'url("https://gelbooru.com/index.php?page=account&s=options")',
```

When several bundles could match, **more specific `url()` rules win over `url-prefix()`** in practice because each bundle is emitted separately — but avoid overlapping prefixes that style the same elements differently unless you intend cascade order in `style.config.mjs`.

Keep sibling actions on different prefixes (`s=list` vs `s=view` vs `s=add`) so pool/forum list and detail do not steal each other’s rules.

## Layout families

Gelbooru uses four distinct chrome stacks. Match the one your snapshot loads.

### 1. Grid layout (`gridStyle.css`)

**Chrome:** `#container` → `.topnav` / `#myTopnav`, `.navSubmenu`, `.searchArea`, `main .mainBodyPadding`.

**Examples:** account options/home, tags list/implications, alias list, pool list, forum list, saved searches.

**Patterns:**

```scss
/* Current submenu tab */
.navSubmenu > a[href*="s=options"] {
  color: var(--blue) !important;
}

/* Gelbooru uses <br> for vertical spacing — hide when replacing layout */
.mainBodyPadding > br {
  display: none;
}
```

Many list pages leave `<section class="aside">` empty. Collapse it the same way as saved searches:

```scss
.aside {
  display: none !important;
}

#container {
  grid-template-columns: minmax(0, 1fr) !important;
  max-width: 100%;
}

main {
  grid-column: 1 / -1;
  min-width: 0;
  max-width: 100%;
}
```

Global nav/submenu colors already live in `base.scss`. Page files usually only mark the active tab and reshape main content.

### 2. Bootstrap layout (`bootstrap.css` + `responsive.css`)

**Chrome:** `.navbar`, `#navbar`, `#submenu.navbar`, `.padding15`, `.container`, Bootstrap grid classes.

**Examples:** account profile, wiki view, pool show, forum view.

**Start every bootstrap page with:**

```scss
@use "bootstrap-chrome";

@include bootstrap-chrome.navbar;
@include bootstrap-chrome.mail-alert;
```

Then style page content. Submenu active / semantic colors need **at least** this specificity — the chrome mixin sets `#submenu .navbar-nav > li > a { color: var(--text) !important }`:

```scss
#submenu .navbar-nav > li > a[href*="s=add"] {
  color: var(--green) !important;
}
```

Shared navbar rules live in `_bootstrap-chrome.scss` so bootstrap pages stay aligned with grid-layout nav sizing (46px logo, 20px/16px/23px link padding, surface colors).

**Submenu action groups** (pool show Edit → History): keep List/New/Help on the left; pull the rest into a right-aligned `--surface0` chip with flex:

```scss
#submenu .navbar-nav {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

#submenu .navbar-nav > li:has(> a[href*="s=edit"]) {
  margin-left: auto;
  border-radius: 7px 0 0 7px;
  background: var(--surface0);
}

#submenu .navbar-nav > li:has(> a[href*="s=edit"]) ~ li {
  background: var(--surface0);
}
```

### 3. Legacy default layout (`default.css`)

**Chrome:** `.header`, `h2.siteName`, `ul.flat-list`, `div.submenu`, `ul.flat-list2`.

**Examples:** favorites, account change avatar, pool add.

There is no shared partial yet — copy chrome from `src/pages/favorites-view.scss` (or `pool-add.scss` / `account-change-avatar.scss`) when adding another default.css page. Keep logo sizing and submenu spacing identical to grid/bootstrap nav for visual consistency.

**Typography trap:** `default.css` forces `font-family: Tahoma` on `h1–h4`. Always reset content titles:

```scss
#content > h3 {
  font-family: verdana, sans-serif, helvetica;
  font-size: 1.5em; /* match grid Tag Listing h2 */
  font-weight: bold;
}
```

Also rename “My Account” → “Settings” via the `::after` trick used on favorites/pool-add so legacy chrome matches grid nav labels.

### 4. Messages layout (`messages.css`)

**Chrome:** `.grid-container` → left `.grid-item` (compose / thread list), `#messageWindow`, optional `#replyBox` / `#rightMenu`. Desktop hides `#header`; below 850px a hamburger (`.menu__btn` / `.menu__box`) appears.

**Examples:** conversation create, conversation list, conversation view.

Shared rules live in `src/_messages-chrome.scss` (`@include messages-chrome.shell`); the left thread list is `@include messages-chrome.thread-list`, shared by list and view. Create and list collapse the empty third column; view keeps left thread list, `#rightMenu`, `#replyBox`, and footer. Recolor inline `#333` / `#0773fb` on `.grid-item` / `#createMessage`. Hide form `<br>` spacers and restyle `.usernameInput`, `#textMessageArea`, and `input[type="submit"]` like other forms.

## Design tokens

Always use palette variables from `src/_palette.scss`. Never introduce new hex colors unless recoloring SVG/PNG assets with `filter`.

| Role | Token | Typical use |
| --- | --- | --- |
| Page background | `--base` | `body`, main canvas |
| Raised panel | `--mantle`, `--surface0` | Cards, inputs, nav bars, post bodies |
| Nested / hover surface | `--surface1`, `--surface2` | Submenu, hover states, inactive toggles, userbars |
| Primary text | `--text` | Body copy, labels |
| Secondary text | `--subtext0`, `--subtext1`, `--subtext2` | Help text, metadata, section titles |
| Primary action | `--blue` | Links, active nav, primary buttons, table headers |
| Primary action hover | `--sapphire` | Button `:hover`, implication/alias `→` |
| Destructive | `--red`, `--maroon` | Delete, ban, locked topics, warnings |
| Success / create | `--green` | Alerts, New / Add / Help submenu links |
| Sticky / warn accent | `--peach` | Forum “Sticky:” labels |
| On-color text | `--crust` | Text on saturated buttons (blue/green/red fills) |
| Depth / shadow | `--crust` | `box-shadow` on thumbnails and panels |
| Tag colors | `--red`, `--green`, `--pink`, `--yellow`, `--blue` | Via `.tag-type-*` in `base.scss` |

### Submenu semantic colors

Keep these consistent across grid / bootstrap / default chrome:

| Item | Color |
| --- | --- |
| Current section tab | `--blue` |
| Create / New / Add Reply | `--green` |
| Help | `--green` |
| Delete | `--red` |

### Subtle status tints

Site light-theme row colors (`#f6dcdc`, `#dcecf6`) are too bright. Mix into `--base`:

```scss
tr.rejected-tag {
  background: color-mix(in srgb, var(--red) 16%, var(--base)) !important;
}

tr.pending-tag {
  background: color-mix(in srgb, var(--blue) 16%, var(--base)) !important;
}
```

## Recurring UI patterns

Copy these shapes rather than inventing new radii or transitions.

### Border radius

| Size | Use |
| --- | --- |
| `7px` | Inputs, textareas, small buttons, thumbnail default, quote boxes, action chips |
| `10px` | Panels, cards, alerts, pagination pills, profile sections, data tables, post cards |
| `999px` | Toggle switches |

### Primary button (`.searchList`, submit inputs)

```scss
input.searchList {
  padding: 0.55rem 1.25rem !important;
  color: var(--crust) !important;
  font-weight: 600;
  background: var(--blue) !important;
  border: none !important;
  border-radius: 7px !important;
  cursor: pointer;

  &:hover {
    background: var(--sapphire) !important;
  }
}
```

### Secondary button (Cancel, neutral actions)

```scss
input[type="button"] {
  padding: 0.55rem 1.25rem !important;
  color: var(--text) !important;
  font-weight: 600;
  background: var(--surface1) !important;
  border: none !important;
  border-radius: 7px !important;

  &:hover {
    background: var(--surface2) !important;
  }
}
```

### Alerts / notices

Success mail (`bootstrap-chrome.mail-alert`) and legacy `.success-notice`:

- Background: `--surface0`
- Border: `1px solid var(--green)`
- Text/links: `--green`
- Padding: ~`0.65rem 1rem`, radius `10px`

Info / civil notices (forum): same panel shape with `--subtext0` text and no green border.

### Thumbnails

Standard hover (posts, wiki, profile, favorites, pools, forum avatars use related shadows):

```scss
.thumbnail-preview {
  border-radius: 7px;
  box-shadow: 0 0 10px var(--crust);
  transition: 400ms cubic-bezier(0, 0.55, 0.45, 1) 0s;

  &:hover {
    scale: 110%;
    border-radius: 0;
    box-shadow: 0 0 30px var(--surface0);
  }
}
```

Animated / video posts — blue outline when `.webm` class or `animated`/`video` in `title`/`alt`:

```scss
&:has(img.webm),
&:has(img[title~="animated"]),
&:has(img[alt~="video"]) {
  outline: 3px solid var(--blue);
  outline-offset: -3px;
}
```

On pool show the class is on the **`img`**, not a wrapper — target `img.thumbnail-preview` directly.

### Pagination

`#paginator` base styling is global. Page bundles add spacing only:

```scss
#paginator {
  padding: 0.5rem 1.25rem 1.5rem;

  > br {
    display: none;
  }
}
```

Forum view also wraps `#paginator` in `.paginator` — pad the outer wrapper if needed. Style `span.current` like other paginator chips when the site uses it instead of `b`.

### Tables

Global `th` in `base.scss` paints **every** header blue. Always reset form / label tables:

```scss
table.form {
  th,
  td {
    border: none !important;
    background: transparent !important;
    color: var(--text) !important;
    text-align: left !important;
    font-weight: normal;
  }
}
```

**Rounded data tables** (tags, implications, aliases, pools, forum list) — prefer a single outer border over thick per-cell borders:

```scss
table.highlightable {
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--surface1);
  border-radius: 10px;
  overflow: hidden;

  th,
  td {
    border: none !important;
    border-bottom: 1px solid var(--surface1) !important;
  }

  tr:last-child > td {
    border-bottom: none !important;
  }

  td + td,
  th + th {
    border-left: 1px solid var(--surface1) !important;
  }
}
```

Override inline header paints (`style="background:#006ffa"`) with `tr[style*="006ffa"]` / `tr[style*="background"]` → `background: var(--blue) !important` and `--crust` text.

### Form layout: search beside input

Gelbooru often puts the submit in a **second row** (sometimes a second `<tbody>`). Flatten with `display: contents` and place the button next to the field:

```scss
table.form {
  width: max-content !important; /* beat width="100%" */
  display: grid;
  grid-template-columns: max-content max-content max-content;
  justify-content: start;
  column-gap: 0.4rem;

  tbody,
  tr {
    display: contents;
  }

  th,
  td {
    width: auto !important; /* beat width="15%" / "85%" */
  }

  tr:has(#name) > td {
    grid-column: 2;
    grid-row: 1;
  }

  tr:has(> td > input.searchList) > td:has(input.searchList) {
    grid-column: 3;
    grid-row: 1;
  }

  td:first-child:empty {
    display: none !important;
  }
}
```

**Gotcha:** `width="85%"` on the name cell (or `width="100%"` on the table) will stretch column 2 across the page and leave a huge gap before the Search button. Always force `width: auto !important` / `max-content` on those cells.

Keep selects content-sized (`width: auto`, `min-width: ~10rem`, `max-width: ~14rem`) — do not stretch them to the name field width.

### Disabled controls

Markup may disable only the text field. Mirror onto the button with `:has()`:

```scss
form:has(.tag-list-search:disabled) input.searchList {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Site PNG sprites on dark UI

Light-theme clip icons (quote / lock / pin) clash on `--surface0` chips. Recolor with `filter` toward `--text` and size by height (keep aspect):

```scss
a.forum-top-button img {
  height: 14px !important;
  width: auto !important;
  filter: brightness(0) saturate(100%) invert(87%) sepia(12%) saturate(346%)
    hue-rotate(184deg) brightness(97%) contrast(92%);
}
```

Same idea as logo / vote filters in `base.scss` — do not invent new hex fills for raster icons.

### Toggle checkbox

See `src/pages/account-options.scss` — custom pill switch with CSS variables `--toggle-pad`, `--toggle-thumb`, `--toggle-travel`, `--toggle-ease`. Reuse that block for other boolean settings.

### Layout cleanup

Gelbooru markup relies on `<br>` and table layouts. Common fixes:

- `> br { display: none; }` on containers you flex/grid
- `display: contents` on `tbody` / `tr` when converting tables to CSS grid
- `:has()` to target rows by input name, href, or child type
- Hide empty spacer cells: `td:first-child:empty { display: none; }`
- Hide unused chrome (empty forum search on thread view) with `:has(form[action*="s=search"])`

## Selector rules

1. **Prefer classes and ids** from the snapshot. Gelbooru names are stable (`.profileAvatar`, `.mainBodyPadding`, `#paginator`, `.forum-spacing`).
2. **Use attribute selectors** for state: `[href*="s=options"]`, `[href*="page=favorites"]`, `[style*="006ffa"]`, `[style*="color"]`.
3. **Avoid `:nth-child`** except for anonymous nodes with no class (legacy homepage blocks in `base.scss`). Never use it across snapshot `<!-- omitted -->` gaps — sibling indices lie.
4. **Use `:has()`** for row-level styling tied to a field name, href, or child type.
5. **Override inline backgrounds / colors** with attribute selectors — forum userbars use `style="color: #fff;"`, table headers use `#006ffa`.
6. **Expect `!important`** — site CSS and inline styles are aggressive. Match existing files; do not strip `!important` to “clean up”.
7. **Match chrome specificity** on bootstrap submenus (see Layout families §2).
8. **Do not style ads or blocked content** in page files — that belongs in `src/content-blocking.scss`.

## SCSS conventions

```scss
/* ----------------------------------------------------
   PAGE TITLE (layout family if non-obvious)
   ---------------------------------------------------- */
```

- `@use "bootstrap-chrome"` at the top when needed (load path is `src/`).
- Nest with `&` for hover/focus and BEM-like site classes.
- Use `@include bootstrap-chrome.navbar` instead of copying navbar rules.
- Local CSS variables (e.g. toggle sizing) are fine inside a component block.
- Keep units consistent with neighbors: `rem` for spacing in newer pages, `px` where matching Gelbooru’s 12px verdana chrome.

## Responsive breakpoints

| Breakpoint | Used on | Notes |
| --- | --- | --- |
| `600px` | account options, tag/pool forms | Stack form table rows |
| `767px` | bootstrap pages | Bootstrap’s `xs` boundary; profile / forum post stack |
| `850px` | grid pages with `.sm-hidden` | Hide Updated By / Tools / pool meta columns (matches site inline CSS) |

Add a `@media` block at the bottom of the page file only when the page layout breaks on small screens. Do not change global breakpoints without checking other pages.

## Typography

- **Grid / default chrome:** `verdana, sans-serif, helvetica` at `12px`, line-height `1.42857143` — match Gelbooru so nav height stays aligned.
- **Page titles** (Tag Listing, Create Pool, Now Viewing, …): **`1.5em` bold verdana** — do not leave bootstrap/`default.css` heading fonts or undersized `1.15em` overrides.
- **Section titles** inside panels (Add Alias, New Topic): same family; `1.05em–1.5em` depending on hierarchy.
- **Help copy:** `--subtext0`, `line-height: 1.45–1.55`, `max-width: ~42em` for readability. Keep wildcard help on one line with `white-space: nowrap` when the label column is narrow.
- **Implication / alias arrows** (`b` containing `→`): `--sapphire`, modest horizontal margin.

## Pitfalls checklist

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Only `base` styles (blue `th`, classic blue header) | Page bundle not matching / unchecked in dev chip | Prefer `url-prefix`; hard-reload; enable bundle under THIS PAGE; re-export for Stylus |
| Huge gap before Search button | `width="100%"` table or `width="85%"` cell | `width: max-content !important` on table; `width: auto !important` on cells |
| Blue label boxes on forms | Global `th { background: var(--blue) }` | Reset `table.form th` to transparent |
| New/Help stay `--text` on bootstrap | Chrome mixin beats weak selectors | Use `#submenu .navbar-nav > li > a[href*=…]` |
| Title looks “wrong” on default.css | Tahoma from site `h1–h4` rule | Force verdana + `1.5em` |
| Two `<tbody>`s break layout | Submit row in second tbody | `display: contents` on both `tbody` and `tr` |
| Light yellow/red sprites on dark chips | Site PNG assets | `filter` toward `--text`; size by `height` |

## Reference pages

Use these as templates when adding similar pages:

| Page | File | Layout | Notable patterns |
| --- | --- | --- | --- |
| Account home | `account-home.scss` | Grid | Minimal — active tab only |
| Account options | `account-options.scss` | Grid | Form table, toggles, `:has()` rows, mobile stack |
| Account profile | `account-profile.scss` | Bootstrap | Chrome mixin, hero, stats box, thumb grid |
| Favorites | `favorites-view.scss` | Default | Legacy nav rebuild, thumb grid, paginator padding |
| Help | `help.scss` | Default | Legacy nav, index topic cards, `.help` article / dl |
| Wiki view | `wiki-view.scss` | Bootstrap | Table→grid, notice boxes, search row flex |
| Wiki list | `wiki.scss` | Grid | Pill table rows |
| Wiki history | `wiki-history.scss` | Default | Legacy nav, revision table, sprite filter |
| Tags list | `tags-list.scss` | Grid | Form grid, search beside name, rounded bordered table |
| Tag implications | `tags-implications.scss` | Grid | Form reset, bordered implication rows, status tints |
| Alias list | `alias-list.scss` | Grid | Add form, search row, bordered alias table |
| Pool list | `pool-list.scss` | Grid | Cover thumbs, meta row, rounded pool table |
| Pool show | `pool-show.scss` | Bootstrap | Action-chip submenu, thumb grid, delete-mode panel |
| Pool add | `pool-add.scss` | Default | Legacy nav, create form, Save/Cancel, Tahoma reset |
| Post add | `post-add.scss` | Grid | Rules notice panel, upload card, file input, radios |
| Forum list | `forum-list.scss` | Grid | Thread table, sticky/locked markers, disabled search |
| Forum view | `forum-view.scss` | Bootstrap | Post cards, quotes, reply box, sprite filters |
| Saved search | `tags-saved-search.scss` | Grid | Grid thumbs, custom `@font-face` trick, delete control |
| Conversation create | `conversation-create.scss` | Messages | Two-column compose, hamburger, form fields |
| Conversation view | `conversation-view.scss` | Messages | Thread list, bubbles, reply box, report modal |
| Conversation list | `conversation-list.scss` | Messages | Two-column shell, shared thread list, rules card |

`account-view-user-comments` has a snapshot but no page bundle yet — it still relies on `base.scss`. Add `src/pages/<id>.scss` when global rules are not enough, register it in `style.config.mjs`, then run `npm run doctor`.

## Checklist before opening a PR

- [ ] Snapshot exists or was recaptured after markup change
- [ ] Bundle URL matches the styled page(s); prefer `url-prefix` when query params vary
- [ ] Live inject shows the bundle under THIS PAGE (or Stylus export refreshed)
- [ ] Active nav/submenu tab highlighted in `--blue`; New/Help green; Delete red
- [ ] No new hardcoded colors outside palette / asset filters
- [ ] Form tables reset global blue `th`; data tables use 1px + 10px radius pattern
- [ ] Titles use verdana `1.5em` (especially on `default.css` / bootstrap pages)
- [ ] Empty aside collapsed on grid list pages when unused
- [ ] Thumbnails and buttons match established hover/radius patterns
- [ ] `<br>` spacers hidden where layout was reworked
- [ ] Tested on desktop and narrow viewport if layout uses flex/grid/table conversion
- [ ] `npm run check` is clean (tests, doctor, style lint)
- [ ] `npm run export` produces valid CSS
