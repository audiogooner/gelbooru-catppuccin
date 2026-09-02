# Page snapshots

Slimmed live-DOM captures of Gelbooru, plus original site CSS. Use these when writing selectors.

Media `src` values are stripped, script bodies are emptied (tags stay so `nth-child` matches the live tree), and long repeated lists are collapsed to a few examples. Header/nav and named chrome ids are kept intact.

## Pages

| Page | URL | Files | Classes | Site CSS |
|------|-----|-------|---------|----------|
| aboutus | https://gelbooru.com/index.php?page=aboutus | [html](pages/aboutus.html) · [outline](pages/aboutus.outline.txt) · [meta](pages/aboutus.json) | 9 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| account-change-avatar | https://gelbooru.com/index.php?page=account&s=change_avatar | [html](pages/account-change-avatar.html) · [outline](pages/account-change-avatar.outline.txt) · [meta](pages/account-change-avatar.json) | 10 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| account-change-password | https://gelbooru.com/index.php?page=account&s=change_password | [html](pages/account-change-password.html) · [outline](pages/account-change-password.outline.txt) · [meta](pages/account-change-password.json) | 17 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| account-home | https://gelbooru.com/index.php?page=account&s=home | [html](pages/account-home.html) · [outline](pages/account-home.outline.txt) · [meta](pages/account-home.json) | 19 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| account-options | https://gelbooru.com/index.php?page=account&s=options | [html](pages/account-options.html) · [outline](pages/account-options.outline.txt) · [meta](pages/account-options.json) | 19 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| account-profile | https://gelbooru.com/index.php?page=account&s=profile&id=1231719 | [html](pages/account-profile.html) · [outline](pages/account-profile.outline.txt) · [meta](pages/account-profile.json) | 47 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| account-report | https://gelbooru.com/index.php?page=account&s=report | [html](pages/account-report.html) · [outline](pages/account-report.outline.txt) · [meta](pages/account-report.json) | 11 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| account-tag-edits | https://gelbooru.com/index.php?page=account&s=tag_edits&id=1231719 | [html](pages/account-tag-edits.html) · [outline](pages/account-tag-edits.outline.txt) · [meta](pages/account-tag-edits.json) | 16 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| account-view-user-comments | https://gelbooru.com/index.php?page=account&s=view_user_comments&id=1231719 | [html](pages/account-view-user-comments.html) · [outline](pages/account-view-user-comments.outline.txt) · [meta](pages/account-view-user-comments.json) | 31 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| alias-list | https://gelbooru.com/index.php?page=alias&s=list | [html](pages/alias-list.html) · [outline](pages/alias-list.outline.txt) · [meta](pages/alias-list.json) | 24 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| comment-list | https://gelbooru.com/index.php?page=comment&s=list | [html](pages/comment-list.html) · [outline](pages/comment-list.outline.txt) · [meta](pages/comment-list.json) | 24 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| conversation-create | https://gelbooru.com/index.php?page=conversation&s=create&id=1231719 | [html](pages/conversation-create.html) · [outline](pages/conversation-create.outline.txt) · [meta](pages/conversation-create.json) | 13 | [messages.css](css/messages.css), [jquery-ui.css](css/jquery-ui.css) |
| conversation-list | https://gelbooru.com/index.php?page=conversation&s=list | [html](pages/conversation-list.html) · [outline](pages/conversation-list.outline.txt) · [meta](pages/conversation-list.json) | 11 | [messages.css](css/messages.css) |
| conversation-view | https://gelbooru.com/index.php?page=conversation&s=view&id=29710 | [html](pages/conversation-view.html) · [outline](pages/conversation-view.outline.txt) · [meta](pages/conversation-view.json) | 23 | [messages.css](css/messages.css) |
| extras-artists | https://gelbooru.com/index.php?page=extras&s=artists | [html](pages/extras-artists.html) · [outline](pages/extras-artists.outline.txt) · [meta](pages/extras-artists.json) | 10 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| favorites-view | https://gelbooru.com/index.php?page=favorites&s=view&id=1231719&pid=100 | [html](pages/favorites-view.html) · [outline](pages/favorites-view.outline.txt) · [meta](pages/favorites-view.json) | 11 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| forum-add | https://gelbooru.com/index.php?page=forum&s=add | [html](pages/forum-add.html) · [outline](pages/forum-add.outline.txt) · [meta](pages/forum-add.json) | 11 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| forum-list | https://gelbooru.com/index.php?page=forum&s=list&pid=2 | [html](pages/forum-list.html) · [outline](pages/forum-list.outline.txt) · [meta](pages/forum-list.json) | 28 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| forum-view | https://gelbooru.com/index.php?page=forum&s=view&id=484 | [html](pages/forum-view.html) · [outline](pages/forum-view.outline.txt) · [meta](pages/forum-view.json) | 41 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| gmail-home | https://gelbooru.com/index.php?page=gmail&s=home&search=outbox | [html](pages/gmail-home.html) · [outline](pages/gmail-home.outline.txt) · [meta](pages/gmail-home.json) | 17 | [gridStyle.css](css/gridStyle.css) |
| gmail-manage | https://gelbooru.com/index.php?page=gmail&s=manage | [html](pages/gmail-manage.html) · [outline](pages/gmail-manage.outline.txt) · [meta](pages/gmail-manage.json) | 17 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| help | https://gelbooru.com/index.php?page=help | [html](pages/help.html) · [outline](pages/help.outline.txt) · [meta](pages/help.json) | 10 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| history | https://gelbooru.com/index.php?page=history&type=tag_history&id=8902206 | [html](pages/history.html) · [outline](pages/history.outline.txt) · [meta](pages/history.json) | 31 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| homepage | https://gelbooru.com/ | [html](pages/homepage.html) · [outline](pages/homepage.outline.txt) · [meta](pages/homepage.json) | 3 | [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [bootstrap.css](css/bootstrap.css) |
| pool-add | https://gelbooru.com/index.php?page=pool&s=add | [html](pages/pool-add.html) · [outline](pages/pool-add.outline.txt) · [meta](pages/pool-add.json) | 11 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| pool-list | https://gelbooru.com/index.php?page=pool&s=list | [html](pages/pool-list.html) · [outline](pages/pool-list.outline.txt) · [meta](pages/pool-list.json) | 20 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| pool-show | https://gelbooru.com/index.php?page=pool&s=show&id=73820 | [html](pages/pool-show.html) · [outline](pages/pool-show.outline.txt) · [meta](pages/pool-show.json) | 26 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| post-add | https://gelbooru.com/index.php?page=post&s=add | [html](pages/post-add.html) · [outline](pages/post-add.outline.txt) · [meta](pages/post-add.json) | 20 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| post-list | https://gelbooru.com/index.php?page=post&s=list&tags=all | [html](pages/post-list.html) · [outline](pages/post-list.outline.txt) · [meta](pages/post-list.json) | 34 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| post-view | https://gelbooru.com/index.php?page=post&s=view&id=13547220&tags=koseki_bijou+rating%3Ag+-video+sort%3Ascore | [html](pages/post-view.html) · [outline](pages/post-view.outline.txt) · [meta](pages/post-view.json) | 43 | [gridStyle.css](css/gridStyle.css), [noteGrid.css](css/noteGrid.css), [jquery-ui.css](css/jquery-ui.css) |
| redeemcode | https://gelbooru.com/redeemCode.php | [html](pages/redeemcode.html) · [outline](pages/redeemcode.outline.txt) · [meta](pages/redeemcode.json) | 18 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| tags-edit | https://gelbooru.com/index.php?page=tags&s=edit&tag=danmug58 | [html](pages/tags-edit.html) · [outline](pages/tags-edit.outline.txt) · [meta](pages/tags-edit.json) | 19 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| tags-implications | https://gelbooru.com/index.php?page=tags&s=implications | [html](pages/tags-implications.html) · [outline](pages/tags-implications.outline.txt) · [meta](pages/tags-implications.json) | 22 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| tags-list | https://gelbooru.com/index.php?page=tags&s=list&pid=50 | [html](pages/tags-list.html) · [outline](pages/tags-list.outline.txt) · [meta](pages/tags-list.json) | 27 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| tags-saved-search | https://gelbooru.com/index.php?page=tags&s=saved_search&pid=0 | [html](pages/tags-saved-search.html) · [outline](pages/tags-saved-search.outline.txt) · [meta](pages/tags-saved-search.json) | 21 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| tos | https://gelbooru.com/tos.php | [html](pages/tos.html) · [outline](pages/tos.outline.txt) · [meta](pages/tos.json) | 23 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| tracker-changelog | https://gelbooru.com/index.php?page=tracker&s=changelog | [html](pages/tracker-changelog.html) · [outline](pages/tracker-changelog.outline.txt) · [meta](pages/tracker-changelog.json) | 24 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| tracker-create-ticket | https://gelbooru.com/index.php?page=tracker&s=create_ticket | [html](pages/tracker-create-ticket.html) · [outline](pages/tracker-create-ticket.outline.txt) · [meta](pages/tracker-create-ticket.json) | 10 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| tracker-list | https://gelbooru.com/index.php?page=tracker&s=list | [html](pages/tracker-list.html) · [outline](pages/tracker-list.outline.txt) · [meta](pages/tracker-list.json) | 26 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| tracker-roadmap | https://gelbooru.com/index.php?page=tracker&s=roadmap | [html](pages/tracker-roadmap.html) · [outline](pages/tracker-roadmap.outline.txt) · [meta](pages/tracker-roadmap.json) | 23 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| tracker-view | https://gelbooru.com/index.php?page=tracker&s=view&id=1521 | [html](pages/tracker-view.html) · [outline](pages/tracker-view.outline.txt) · [meta](pages/tracker-view.json) | 11 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| wiki-create | https://gelbooru.com/index.php?page=wiki&s=create&title=ravennvi | [html](pages/wiki-create.html) · [outline](pages/wiki-create.outline.txt) · [meta](pages/wiki-create.json) | 12 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| wiki-history | https://gelbooru.com/index.php?page=wiki&s=history&id=30344 | [html](pages/wiki-history.html) · [outline](pages/wiki-history.outline.txt) · [meta](pages/wiki-history.json) | 12 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |
| wiki-list | https://gelbooru.com/index.php?page=wiki&s=list | [html](pages/wiki-list.html) · [outline](pages/wiki-list.outline.txt) · [meta](pages/wiki-list.json) | 14 | [gridStyle.css](css/gridStyle.css), [jquery-ui.css](css/jquery-ui.css) |
| wiki-view | https://gelbooru.com/index.php?page=wiki&s=view&id=7337 | [html](pages/wiki-view.html) · [outline](pages/wiki-view.outline.txt) · [meta](pages/wiki-view.json) | 28 | [bootstrap.css](css/bootstrap.css), [responsive.css](css/responsive.css), [jquery-ui.css](css/jquery-ui.css), [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css) |
| wiki | https://gelbooru.com/index.php?page=wiki&s=&s=edit&id=26769 | [html](pages/wiki.html) · [outline](pages/wiki.outline.txt) · [meta](pages/wiki.json) | 12 | [default.css](css/default.css), [jquery-ui.css](css/jquery-ui.css) |

## Not captured yet

- **extras-patreon** — https://gelbooru.com/index.php?page=extras&s=patreon (`npm run snapshot:fetch`)
- **dmca** — https://gelbooru.com/index.php?page=dmca&s=index (`npm run snapshot:fetch`)

## Site CSS

- [bootstrap.css](css/bootstrap.css)
- [default.css](css/default.css)
- [gridStyle.css](css/gridStyle.css)
- [jquery-ui.css](css/jquery-ui.css)
- [jquery-ui.icon-font.min.css](css/jquery-ui.icon-font.min.css)
- [messages.css](css/messages.css)
- [noteGrid.css](css/noteGrid.css)
- [responsive.css](css/responsive.css)

## Capture

- Public pages: `npm run snapshot:fetch`
- Any page (logged-in too): with `npm run dev` running, open the page and press **Alt+Shift+S**
