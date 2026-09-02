# Gelbooru theme audit

Live pass on 2 Sep 2026 against the logged-in Chrome session (Violentmonkey + `gelbooru-dev.user.js`, `npm run dev` on `:3847`). Theme injection was on (`style[data-gelbooru-dev="base"]`, `--base: #1e1e2e`). Stylus was not fighting the injector.

**67 distinct routes.** Chrome DevTools MCP cannot be driven by multiple agents at once (they race on the same browser). This pass walked every URL **sequentially** on the existing Chrome profile (CDP on the same debug port MCP uses). Screenshots: [`audit/screenshots/`](screenshots/). Inventory: [`audit/routes.json`](routes.json).

| live class | count |
| --- | --- |
| ok (page bundle present, dark, usable) | 42 |
| base-only (no page SCSS, or redirect away from a distinct UI) | 18 |
| unstyled-pockets (heuristic; see visual) | 4 |
| unreachable / stub | 3 |

No page that already has a `src/pages/*.scss` bundle failed to inject it, except when the URL redirected to a different route.

---

## Critical

Theme **is injecting**. Nothing in the styled set came back with a missing `base` or missing expected page bundle.

Two matcher / chrome issues are still worth fixing first:

1. **Homepage bundle never matches `/`.** [`style.config.mjs`](../style.config.mjs) uses `url("https://gelbooru.com/index.php")`, but the live homepage is `https://gelbooru.com/`. Injected tags: `base` only. The page still looks dark because `base` covers body/links; [`src/pages/homepage.scss`](../src/pages/homepage.scss) is not applied. `index.php?page=history` redirected to a URL that *did* mount `homepage`.
2. **Older default.css chrome on unstyled routes.** `forum-add` and `account-report` keep Gelbooru’s **bright blue header** instead of the dark nav. `base` paints the body but does not restyle that header.

---

## Coverage gaps

Live routes with **no page SCSS** (only `base`). Candidates for new `src/pages/*.scss` + `style.config.mjs` entries.

### Real UIs (worth styling)

| id | url | notes |
| --- | --- | --- |
| homepage | https://gelbooru.com/ | Bundle exists but matcher misses `/` |
| aboutus | https://gelbooru.com/index.php?page=aboutus | About copy + posts chrome; dark via base only |
| account-view-user-comments | `…&s=view_user_comments&id=` | Comment list for a user; needs `id` |
| account-tag-edits | `…&s=tag_edits&id=` | Tag-edit history table; needs `id` |
| account-report | `…&s=report` | Reputation / score form; **blue header** |
| forum-add | `…&page=forum&s=add` | New topic form; **blue header** |
| gmail-manage | `…&page=gmail&s=manage` | Compose mail; recaptcha; white strip at bottom |
| post-addVideo | `…&page=post&s=addVideo` | Permission error: “Not enough regular contributions.” Bare `base` page |

### Distinct URLs that did not show a unique UI in this session

| id | what happened |
| --- | --- |
| post-random | Redirects to `post-view` (styled) |
| gmail (no `s`) | Redirects to `gmail-home` (styled) |
| forum-search | Redirects to `forum-list` (styled) |
| tags-merge | Redirects (landed on homepage-like chrome) |
| wiki-manage | Redirects to wiki list |
| public-lock | Redirects to `post-list` |
| pool-edit / pool-order / pool-import | With `id=73897` redirected to `pool-show` (likely not owner). Distinct owner UI may still exist. |
| forum-edit | Without lock/pin/id: Cloudflare-style “not available in your country” error card |
| public-edit-post | CSRF error without a token (“Your CSRF Token is expired or not set.”) |
| conversation-manage | POST endpoint; blank GET |
| tracker-manage | Blank even with `id=1521` |
| pool-history | “Disabled for now.” |

---

## Visual

Heuristic white boxes (≥200×80, rgb ≥ 240) were **almost all Google reCAPTCHA widgets**, not unthemed Gelbooru chrome. Ignore those as false positives.

| id | screenshot | judgment |
| --- | --- | --- |
| alias-list | [screenshots/alias-list.png](screenshots/alias-list.png) | Page SCSS is on; recaptcha is the white box. **ok** |
| conversation-view | [screenshots/conversation-view.png](screenshots/conversation-view.png) | Styled; recaptcha. **ok** |
| conversation-create | [screenshots/conversation-create.png](screenshots/conversation-create.png) | Styled; recaptcha. **ok** |
| gmail-manage | [screenshots/gmail-manage.png](screenshots/gmail-manage.png) | **No page bundle.** Recaptcha + a white bar under the compose form. Coverage gap. |
| forum-add | [screenshots/forum-add.png](screenshots/forum-add.png) | Dark body, **stock blue header**. Needs page styles. |
| account-report | [screenshots/account-report.png](screenshots/account-report.png) | Same older chrome / blue header. |
| homepage | [screenshots/homepage.png](screenshots/homepage.png) | Looks fine from `base`; homepage-specific rules are not loading. |

Wiki `url-prefix("…page=wiki")` also matches list/create/edit/history. Live tags were `wiki` + `wiki-view` (and the more specific bundle). Harmless overlap, not a miss.

Gmail inbox/outbox/mod_notices/all mounted the matching `gmail-active-*` bundles as expected.

---

## OK

42 routes with the expected page bundle injected and a dark, usable layout, including: account home/options/profile/password/avatar, post list/view/add, comments, wiki list/view/create/edit/history, tags list/implications/edit/saved-search, alias list, pool list/show/add, forum list/view, tracker list/view/create/changelog/roadmap, conversation list/view/create, gmail home + search variants, favorites (with `id=`), extras artists/patreon, DMCA, TOS, redeem code, help.

Favorites without `id` is a blank page; with `id=1231719` it is styled.

---

## Session notes

- Logged in for the whole pass (account nav, favorites, mail, conversations).
- No unexpected login redirects.
- `account-login` (logout) was not visited.
- `page=search` is POST-only and was skipped.
- Help `topic=*` variants collapse to the same `help` UI (already styled).
- Dev overlay chip appears in every screenshot; ignore it.

Suggested next styling work, in order: fix homepage `url`/`url-prefix` so `/` matches; then **aboutus**, **gmail-manage**, **forum-add**, **account-report**, **account-tag-edits**, **account-view-user-comments**.
