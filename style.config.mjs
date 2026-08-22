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
    document: 'url("https://gelbooru.com/index.php")',
  },
  {
    file: "src/pages/account-options.scss",
    document: 'url("https://gelbooru.com/index.php?page=account&s=options")',
  },
  {
    file: "src/pages/wiki.scss",
    document: 'url-prefix("https://gelbooru.com/index.php?page=wiki")',
  },
  {
    file: "src/pages/tags-list.scss",
    document: 'url("https://gelbooru.com/index.php?page=tags&s=list")',
  },
  {
    file: "src/pages/tags-saved-search.scss",
    document:
      'url-prefix("https://gelbooru.com/index.php?page=tags&s=saved_search")',
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
  { id: "tracker-list", url: "https://gelbooru.com/index.php?page=tracker&s=list" },
  { id: "account-home", url: "https://gelbooru.com/index.php?page=account&s=home" },
  {
    id: "account-options",
    url: "https://gelbooru.com/index.php?page=account&s=options",
  },
  { id: "help", url: "https://gelbooru.com/index.php?page=help" },
  { id: "tos", url: "https://gelbooru.com/tos.php" },
];
