import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadProjectConfig } from "userstyle-dev/src/context.mjs";
import { compileBundles, cssForHref } from "userstyle-dev/src/compile.mjs";
import { chromeFamilies, pageIdFromUrl } from "../style.config.mjs";

await loadProjectConfig();
const compiled = compileBundles({ style: "compressed" });

describe("pageIdFromUrl", () => {
  it("treats a wiki search without s as wiki-view", () => {
    assert.equal(
      pageIdFromUrl("https://gelbooru.com/index.php?page=wiki&search=foo"),
      "wiki-view",
    );
    assert.equal(
      pageIdFromUrl("https://gelbooru.com/index.php?page=wiki&s=list&search=foo"),
      "wiki-list",
    );
  });
});

describe("hoisted chrome", () => {
  it("emits shared chrome families once", () => {
    const byFile = Object.fromEntries(compiled.map((bundle) => [bundle.file, bundle]));
    assert.match(byFile["src/chrome-bootstrap.scss"].css, /\.navbar-brand/);
    assert.match(byFile["src/chrome-default.scss"].css, /h2\.siteName/);
    assert.match(byFile["src/chrome-messages.scss"].css, /#createMessage/);
    assert.match(
      byFile["src/chrome-messages-thread.scss"].css,
      /\.grid-left-menu-item/,
    );
    assert.match(
      byFile["src/chrome-grid-collapse.scss"].css,
      /grid-template-columns:minmax/,
    );
    assert.match(byFile["src/chrome-paginator.scss"].css, /--paginator-inset-x/);
    assert.match(byFile["src/chrome-highlightable.scss"].css, /table\.highlightable/);

    const pageCss = compiled
      .filter((bundle) => bundle.file.startsWith("src/pages/"))
      .map((bundle) => bundle.css)
      .join("\n");
    assert.doesNotMatch(pageCss, /\.navbar-brand\{/);
    assert.doesNotMatch(pageCss, /h2\.siteName\{/);
    assert.doesNotMatch(pageCss, /#createMessage\.messageButton/);

    const tagsList = compiled.find((bundle) => bundle.file === "src/pages/tags-list.scss");
    assert.doesNotMatch(tagsList.css, /position:sticky/);
    assert.doesNotMatch(tagsList.css, /\.aside\{display:none/);
  });

  it("still applies chrome on a bootstrap and a default page", () => {
    const profile = cssForHref(
      compiled,
      "https://gelbooru.com/index.php?page=account&s=profile",
    );
    assert.match(profile, /\.navbar-brand/);
    assert.match(profile, /#submenu a\[href\*="s=profile"\]/);

    const favorites = cssForHref(
      compiled,
      "https://gelbooru.com/index.php?page=favorites&s=view",
    );
    assert.match(favorites, /h2\.siteName/);
    assert.match(favorites, /page=favorites/);
    assert.match(favorites, /--paginator-inset-x/);

    const tags = cssForHref(
      compiled,
      "https://gelbooru.com/index.php?page=tags&s=list",
    );
    assert.match(tags, /\.aside,\s*aside|aside,\s*\.aside|\.aside/);
    assert.match(tags, /table\.highlightable/);
    assert.match(tags, /position:sticky/);

    const conversation = cssForHref(
      compiled,
      "https://gelbooru.com/index.php?page=conversation&s=list",
    );
    assert.match(conversation, /#createMessage/);
    assert.match(conversation, /\.grid-left-menu-item/);
  });

  it("lists every chrome family page", () => {
    assert.ok(chromeFamilies.bootstrap.length >= 10);
    assert.ok(chromeFamilies.default.length >= 13);
    assert.equal(chromeFamilies.messages.length, 3);
    assert.equal(chromeFamilies["messages-thread"].length, 2);
    assert.ok(chromeFamilies["grid-collapse"].length >= 12);
    assert.ok(chromeFamilies.paginator.length >= 12);
    assert.ok(chromeFamilies.highlightable.length >= 6);
  });
});
