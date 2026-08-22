# Page snapshots

Slimmed live-DOM captures of Gelbooru, plus original site CSS. Use these when writing selectors.

Media `src` values are stripped, script bodies are emptied (tags stay so `nth-child` matches the live tree), and long repeated lists are collapsed to a few examples. Header/nav and named chrome ids are kept intact.

## Pages

| Page | URL | Files | Classes | Site CSS |
|------|-----|-------|---------|----------|
| account-home | https://gelbooru.com/index.php?page=account&s=home | [html](pages/account-home.html) · [outline](pages/account-home.outline.txt) · [meta](pages/account-home.json) | 11 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| account-options | https://gelbooru.com/index.php?page=account&s=options | [html](pages/account-options.html) · [outline](pages/account-options.outline.txt) · [meta](pages/account-options.json) | 11 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| comment-list | https://gelbooru.com/index.php?page=comment&s=list | [html](pages/comment-list.html) · [outline](pages/comment-list.outline.txt) · [meta](pages/comment-list.json) | 24 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| extras-artists | https://gelbooru.com/index.php?page=extras&s=artists | [html](pages/extras-artists.html) · [outline](pages/extras-artists.outline.txt) · [meta](pages/extras-artists.json) | 10 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| forum-list | https://gelbooru.com/index.php?page=forum&s=list | [html](pages/forum-list.html) · [outline](pages/forum-list.outline.txt) · [meta](pages/forum-list.json) | 21 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| help | https://gelbooru.com/index.php?page=help | [html](pages/help.html) · [outline](pages/help.outline.txt) · [meta](pages/help.json) | 9 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| homepage | https://gelbooru.com/ | [html](pages/homepage.html) · [outline](pages/homepage.outline.txt) · [meta](pages/homepage.json) | 3 | [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [bootstrap.css](css/bootstrap.css) |
| pool-list | https://gelbooru.com/index.php?page=pool&s=list | [html](pages/pool-list.html) · [outline](pages/pool-list.outline.txt) · [meta](pages/pool-list.json) | 12 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| post-list | https://gelbooru.com/index.php?page=post&s=list&tags=all | [html](pages/post-list.html) · [outline](pages/post-list.outline.txt) · [meta](pages/post-list.json) | 26 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| post-view | https://gelbooru.com/index.php?page=post&s=view&id=13634155&tags=otohime_%28youngest_princess%29 | [html](pages/post-view.html) · [outline](pages/post-view.outline.txt) · [meta](pages/post-view.json) | 35 | [gridStyle.css](css/gridStyle.css), [noteGrid.css](css/noteGrid.css), [jquery-ui.css](css/jquery-ui.css) |
| tags-list | https://gelbooru.com/index.php?page=tags&s=list | [html](pages/tags-list.html) · [outline](pages/tags-list.outline.txt) · [meta](pages/tags-list.json) | 18 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| tags-saved-search | https://gelbooru.com/index.php?page=tags&s=saved_search&pid=0 | [html](pages/tags-saved-search.html) · [outline](pages/tags-saved-search.outline.txt) · [meta](pages/tags-saved-search.json) | 21 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| tos | https://gelbooru.com/tos.php | [html](pages/tos.html) · [outline](pages/tos.outline.txt) · [meta](pages/tos.json) | 23 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| tracker-list | https://gelbooru.com/index.php?page=tracker&s=list | [html](pages/tracker-list.html) · [outline](pages/tracker-list.outline.txt) · [meta](pages/tracker-list.json) | 25 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| wiki-list | https://gelbooru.com/index.php?page=wiki&s=list | [html](pages/wiki-list.html) · [outline](pages/wiki-list.outline.txt) · [meta](pages/wiki-list.json) | 14 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| wiki-view | https://gelbooru.com/index.php?page=wiki&s=list&search=howto | [html](pages/wiki-view.html) · [outline](pages/wiki-view.outline.txt) · [meta](pages/wiki-view.json) | 14 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |


## Site CSS

- [bootstrap.css](css/bootstrap.css)
- [default.css](css/default.css)
- [gridStyle.css](css/gridStyle.css)
- [jquery-ui.css](css/jquery-ui.css)
- [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css)
- [noteGrid.css](css/noteGrid.css)
- [responsive.css](css/responsive.css)

## Capture

- Public pages: `npm run snapshot:fetch`
- Any page (logged-in too): with `npm run dev` running, open the page and press **Alt+Shift+S**
