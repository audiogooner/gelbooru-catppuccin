import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inspectProject } from "./doctor.mjs";
import { pageIdFromUrl } from "./lib/slim-document.mjs";
import {
  compileBundles,
  cssForHref,
  isSharedBundleFile,
} from "./lib.mjs";
import { chromeFamilies } from "../style.config.mjs";

describe("pageIdFromUrl", () => {
  it("names homepage and php endpoints", () => {
    assert.equal(pageIdFromUrl("https://gelbooru.com/"), "homepage");
    assert.equal(pageIdFromUrl("https://gelbooru.com/index.php"), "homepage");
    assert.equal(pageIdFromUrl("https://gelbooru.com/tos.php"), "tos");
    assert.equal(
      pageIdFromUrl("https://gelbooru.com/redeemCode.php"),
      "redeemcode",
    );
  });

  it("uses page and the first non-empty s", () => {
    assert.equal(
      pageIdFromUrl("https://gelbooru.com/index.php?page=wiki&s=edit&id=1"),
      "wiki-edit",
    );
    assert.equal(
      pageIdFromUrl("https://gelbooru.com/index.php?page=wiki&s=&s=edit&id=1"),
      "wiki-edit",
    );
    assert.equal(
      pageIdFromUrl("https://gelbooru.com/index.php?page=post&s=list&tags=all"),
      "post-list",
    );
  });

  it("treats wiki search without s as wiki-view", () => {
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

describe("doctor", () => {
  it("accepts the current catalog", () => {
    const report = inspectProject();
    assert.deepEqual(
      report.errors.map((item) => item.message),
      [],
    );
  });
});

describe("isSharedBundleFile", () => {
  it("treats base and chrome bundles as shared", () => {
    assert.equal(isSharedBundleFile("src/base.scss"), true);
    assert.equal(isSharedBundleFile("src/chrome-default.scss"), true);
    assert.equal(isSharedBundleFile("src/chrome-bootstrap.scss"), true);
    assert.equal(isSharedBundleFile("src/chrome-paginator.scss"), true);
    assert.equal(isSharedBundleFile("src/chrome-messages-thread.scss"), true);
    assert.equal(isSharedBundleFile("src/pages/help.scss"), false);
  });
});

describe("hoisted chrome", () => {
  const compiled = compileBundles({ style: "compressed" });

  it("emits shared chrome families once", () => {
    const byFile = Object.fromEntries(compiled.map((b) => [b.file, b]));
    assert.match(byFile["src/chrome-bootstrap.scss"].css, /\.navbar-brand/);
    assert.match(byFile["src/chrome-default.scss"].css, /h2\.siteName/);
    assert.match(byFile["src/chrome-messages.scss"].css, /#createMessage/);
    assert.match(byFile["src/chrome-messages-thread.scss"].css, /\.grid-left-menu-item/);
    assert.match(byFile["src/chrome-grid-collapse.scss"].css, /grid-template-columns:minmax/);
    assert.match(byFile["src/chrome-paginator.scss"].css, /--paginator-inset-x/);
    assert.match(byFile["src/chrome-highlightable.scss"].css, /table\.highlightable/);

    const pageCss = compiled
      .filter((b) => b.file.startsWith("src/pages/"))
      .map((b) => b.css)
      .join("\n");
    assert.doesNotMatch(pageCss, /\.navbar-brand\{/);
    assert.doesNotMatch(pageCss, /h2\.siteName\{/);
    assert.doesNotMatch(pageCss, /#createMessage\.messageButton/);

    const tagsList = compiled.find((b) => b.file === "src/pages/tags-list.scss");
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
