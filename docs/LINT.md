# Style linter

`npm run lint:styles` compiles every bundle in [`style.config.mjs`](../style.config.mjs) and reports duplicate, redundant, and unused selectors. Findings are printed to the terminal and written to `lint-results.json` (gitignored). Pass `--no-json` to skip the file. Errors are listed in full; warnings are counted unless you pass `--verbose`.

The linter works on **compiled CSS**, then maps each rule back to SCSS via Sass source maps. That matches the shipped userstyle and treats `@include` expansions as their emitted rules.

## Rules

| Rule | Severity | What it catches |
| --- | --- | --- |
| `duplicate-selector` | error | Same selector, same `@media` / at-rule context, more than once in one bundle. Later declarations win. |
| `duplicate-block` | error | Exact same selector **and** declaration block repeated in one bundle. |
| `duplicate-declarations` | warning | The same declaration block (or a consecutive rule sequence) appears in 2+ page files. Candidate for a mixin — see [Page style guide](PAGE_STYLE_GUIDE.md) (grid collapse, bootstrap chrome). |
| `redundant-base` | warning | A page rule is identical to a `base.scss` rule (same selector, at-rule, and values). Extra properties or a different `!important` are not flagged. |
| `dead-selector` | warning | After stripping `:hover` / `::before` and similar, the selector matches nothing in the page snapshot. Often optional UI (pending rows, video, admin chrome) that this snapshot did not include. |

Cross-file `duplicate-declarations`, `redundant-base`, and `dead-selector` warnings never fail the run. `duplicate-selector` and `duplicate-block` set exit code 1.

Rules that already live in a shared partial (`src/_*.scss`) are skipped for cross-file clustering so mixin output is not reported as “extract a mixin.” Sass source maps often point `@include` expansions at the call site, so a mixin that is already extracted can still show up if every caller maps there.

## Snapshot mapping

Dead-selector checks load [`snapshots/pages/<id>.html`](../snapshots/INDEX.md).

1. [`style.lint.config.mjs`](../style.lint.config.mjs) `snapshotMap` override
2. Else `src/pages/<id>.scss` → `snapshots/pages/<id>.html` when that file exists

Bundles without a snapshot (and `src/base.scss`) are skipped. The summary prints how many were skipped.

## False positives

Snapshots are slimmed. A selector can look dead when:

- The matching nodes were replaced by `<!-- snapshot: omitted … -->`
- The UI is login- or JS-only and the snapshot is a public fetch
- The selector uses `:has()` (optional UI or a query the HTML parser cannot evaluate) — those rules are skipped, not failed
- The rule is only for a hover/focus state — the linter already strips those and queries the rest
- The rule comes from a shared mixin (`src/_*.scss`) — checked once via the mixin, not against every including page

Sass also emits comment-only parent shells and splits `@include` plus extra properties into two same-selector blocks. Empty shells are ignored. Same-selector blocks with **disjoint** properties are not `duplicate-selector` errors.

Add an ignore rather than deleting a real fallback rule. Default ignores cover the dev overlay, empty `.aside` collapse, spacer `> br` hiders, and `div.help*` (help index snapshot vs topic article styles).

## Ignores

Edit [`style.lint.config.mjs`](../style.lint.config.mjs):

```js
export default {
  minDeclarationsForCrossFile: 4,
  minFilesForCrossFile: 2,
  ignoreSelectors: [":root", "html", "body"],
  ignoreFiles: [],
  ignoreRules: {
    "duplicate-declarations": [], // declaration fingerprints or sequence keys
    "dead-selector": ["#gelbooru-dev-overlay", "#gelbooru-dev-overlay *"],
  },
  snapshotMap: {
    "src/pages/wiki.scss": "wiki-list",
  },
};
```

`ignoreRules` entries accept exact strings or `*` / `?` globs.

## Mixin extraction

A `duplicate-declarations` warning is a hint, not a rewrite. If the same grid collapse (`.aside` / `#container` / `main`) or table chrome appears in several page files, move it to a mixin as described in the page style guide, then `@include` it. Re-run the linter — rules that now map to `src/_*.scss` drop out of the cross-file report.
