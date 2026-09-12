export default {
  minDeclarationsForCrossFile: 4,
  minFilesForCrossFile: 2,
  ignoreSelectors: [":root", "html", "body"],
  ignoreFiles: [],
  ignoreRules: {
    "duplicate-declarations": [],
    "dead-selector": [
      "#gelbooru-dev-overlay",
      "#gelbooru-dev-overlay *",
      ".aside",
      "* > br",
      "div.help*",
    ],
  },
  snapshotMap: {
    "src/pages/wiki.scss": "wiki-list",
    "src/pages/gmail-active-inbox.scss": "gmail-home",
    "src/pages/gmail-active-outbox.scss": "gmail-home",
    "src/pages/gmail-active-mod-notices.scss": "gmail-home",
    "src/pages/gmail-active-all.scss": "gmail-home",
  },
};
