export const port = Number(process.env.PORT) || 3847;
export const host = "127.0.0.1";

export const metadata = {
  name: "Gelbooru - Catppuccin Mocha",
  version: "1.1.0",
  description: "A dark theme for Gelbooru using the Catppuccin Mocha color palette",
  author: "Nanumpf",
  preprocessor: "default",
  namespace: "https://github.com/nils-affentranger",
  "run-at": "document-start",
};

export const bundles = [
  {
    file: "src/base.scss",
    document: 'url-prefix("https://gelbooru.com")',
  },
  {
    file: "src/pages/homepage.scss",
    document:
      'url("https://gelbooru.com/"), url("https://gelbooru.com/index.php")',
  },
  {
    file: "src/pages/account-home.scss",
    document: 'url("https://gelbooru.com/index.php?page=account&s=home")',
  },
  {
    file: "src/pages/account-options.scss",
    document: 'url("https://gelbooru.com/index.php?page=account&s=options")',
  },
  {
    file: "src/pages/account-change-password.scss",
    document:
      'url("https://gelbooru.com/index.php?page=account&s=change_password")',
  },
  {
    file: "src/pages/account-change-avatar.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=account&s=change_avatar")',
  },
  {
    file: "src/pages/account-report.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=account&s=report")',
  },
  {
    file: "src/pages/redeemcode.scss",
    document: 'url("https://gelbooru.com/redeemCode.php")',
  },
  {
    file: "src/pages/account-profile.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=account&s=profile")',
  },
  {
    file: "src/pages/account-tag-edits.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=account&s=tag_edits")',
  },
  {
    file: "src/pages/wiki.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=wiki&s=list")',
  },
  {
    file: "src/pages/wiki-view.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=wiki")',
  },
  {
    file: "src/pages/wiki-history.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=wiki&s=history")',
  },
  {
    file: "src/pages/wiki-create.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=wiki&s=create")',
  },
  {
    file: "src/pages/wiki-edit.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=wiki&s=edit")',
  },
  {
    file: "src/pages/tags-list.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tags&s=list")',
  },
  {
    file: "src/pages/tags-implications.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tags&s=implications")',
  },
  {
    file: "src/pages/tags-edit.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tags&s=edit")',
  },
  {
    file: "src/pages/alias-list.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=alias")',
  },
  {
    file: "src/pages/tags-saved-search.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tags&s=saved_search")',
  },
  {
    file: "src/pages/pool-list.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=pool&s=list")',
  },
  {
    file: "src/pages/pool-show.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=pool&s=show")',
  },
  {
    file: "src/pages/pool-add.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=pool&s=add")',
  },
  {
    file: "src/pages/post-add.scss",
    document: 'url("https://gelbooru.com/index.php?page=post&s=add")',
  },
  {
    file: "src/pages/post-view.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=post&s=view")',
  },
  {
    file: "src/pages/post-list.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=post&s=list")',
  },
  {
    file: "src/pages/comment-list.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=comment&s=list")',
  },
  {
    file: "src/pages/extras-artists.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=extras&s=artists")',
  },
  {
    file: "src/pages/dmca.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=dmca&s=index")',
  },
  {
    file: "src/pages/tos.scss",
    document: 'url("https://gelbooru.com/tos.php")',
  },
  {
    file: "src/pages/aboutus.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=aboutus")',
  },
  {
    file: "src/pages/extras-patreon.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=extras&s=patreon")',
  },
  {
    file: "src/pages/forum-list.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=forum&s=list")',
  },
  {
    file: "src/pages/forum-view.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=forum&s=view")',
  },
  {
    file: "src/pages/forum-add.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=forum&s=add")',
  },
  {
    file: "src/pages/favorites-view.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=favorites")',
  },
  {
    file: "src/pages/conversation-create.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=conversation&s=create")',
  },
  {
    file: "src/pages/conversation-view.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=conversation&s=view")',
  },
  {
    file: "src/pages/conversation-list.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=conversation&s=list")',
  },
  {
    file: "src/pages/gmail-home.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=gmail&s=home")',
  },
  {
    file: "src/pages/gmail-manage.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=gmail&s=manage")',
  },
  {
    file: "src/pages/gmail-active-inbox.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=gmail&s=home&search=inbox")',
  },
  {
    file: "src/pages/gmail-active-outbox.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=gmail&s=home&search=outbox")',
  },
  {
    file: "src/pages/gmail-active-mod-notices.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=gmail&s=home&search=mod_notices")',
  },
  {
    file: "src/pages/gmail-active-all.scss",
    document: 'url("https://gelbooru.com/index.php?page=gmail&s=home")',
  },
  {
    file: "src/pages/help.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=help")',
  },
  {
    file: "src/pages/history.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=history")',
  },
  {
    file: "src/pages/tracker-list.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tracker&s=list")',
  },
  {
    file: "src/pages/tracker-view.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tracker&s=view")',
  },
  {
    file: "src/pages/tracker-changelog.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tracker&s=changelog")',
  },
  {
    file: "src/pages/tracker-roadmap.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tracker&s=roadmap")',
  },
  {
    file: "src/pages/tracker-create-ticket.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tracker&s=create_ticket")',
  },
];

export const exportFile = "gelbooru.user.css";

export const snapshotPages = [
  { id: "homepage", url: "https://gelbooru.com/" },
  {
    id: "post-list",
    url: "https://gelbooru.com/index.php?page=post&s=list&tags=all",
  },
  { id: "post-view", discover: "post-view" },
  {
    id: "post-add",
    url: "https://gelbooru.com/index.php?page=post&s=add",
    userscriptOnly: true,
  },
  { id: "comment-list", url: "https://gelbooru.com/index.php?page=comment&s=list" },
  { id: "tags-list", url: "https://gelbooru.com/index.php?page=tags&s=list" },
  {
    id: "tags-saved-search",
    url: "https://gelbooru.com/index.php?page=tags&s=saved_search",
    userscriptOnly: true,
  },
  { id: "wiki-list", url: "https://gelbooru.com/index.php?page=wiki&s=list" },
  { id: "wiki-view", discover: "wiki-view" },
  { id: "pool-list", url: "https://gelbooru.com/index.php?page=pool&s=list" },
  { id: "forum-list", url: "https://gelbooru.com/index.php?page=forum&s=list" },
  {
    id: "extras-artists",
    url: "https://gelbooru.com/index.php?page=extras&s=artists",
  },
  {
    id: "extras-patreon",
    url: "https://gelbooru.com/index.php?page=extras&s=patreon",
  },
  { id: "dmca", url: "https://gelbooru.com/index.php?page=dmca&s=index" },
  { id: "tracker-list", url: "https://gelbooru.com/index.php?page=tracker&s=list" },
  {
    id: "tracker-view",
    url: "https://gelbooru.com/index.php?page=tracker&s=view&id=1518",
  },
  {
    id: "tracker-create-ticket",
    url: "https://gelbooru.com/index.php?page=tracker&s=create_ticket",
  },
  {
    id: "favorites-view",
    url: "https://gelbooru.com/index.php?page=favorites&s=view",
    userscriptOnly: true,
  },
  { id: "account-home", url: "https://gelbooru.com/index.php?page=account&s=home" },
  {
    id: "account-options",
    url: "https://gelbooru.com/index.php?page=account&s=options",
  },
  {
    id: "account-profile",
    url: "https://gelbooru.com/index.php?page=account&s=profile",
    userscriptOnly: true,
  },
  {
    id: "account-change-avatar",
    url: "https://gelbooru.com/index.php?page=account&s=change_avatar",
    userscriptOnly: true,
  },
  {
    id: "conversation-create",
    url: "https://gelbooru.com/index.php?page=conversation&s=create",
    userscriptOnly: true,
  },
  {
    id: "conversation-view",
    url: "https://gelbooru.com/index.php?page=conversation&s=view",
    userscriptOnly: true,
  },
  {
    id: "conversation-list",
    url: "https://gelbooru.com/index.php?page=conversation&s=list",
    userscriptOnly: true,
  },
  { id: "help", url: "https://gelbooru.com/index.php?page=help" },
  { id: "tos", url: "https://gelbooru.com/tos.php" },
  { id: "aboutus", url: "https://gelbooru.com/index.php?page=aboutus" },
];
