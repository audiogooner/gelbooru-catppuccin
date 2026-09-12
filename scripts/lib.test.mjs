import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inspectProject } from "./doctor.mjs";
import { pageIdFromUrl } from "./lib/slim-document.mjs";

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
