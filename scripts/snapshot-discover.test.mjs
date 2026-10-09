import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  discoverUrl,
  isDiscoverSeed,
  seedUrl,
} from "./lib/snapshot-discover.mjs";

describe("snapshot-discover", () => {
  it("resolves post-view from a list snippet", () => {
    const html = `<a href="index.php?page=post&amp;s=view&amp;id=42">x</a>`;
    assert.equal(
      discoverUrl("post-view", html),
      "https://gelbooru.com/index.php?page=post&s=view&id=42",
    );
    assert.equal(seedUrl("post-view").includes("page=post"), true);
  });

  it("resolves wiki-view by id and falls back to search", () => {
    assert.equal(
      discoverUrl(
        "wiki-view",
        `<a href="index.php?page=wiki&amp;s=view&amp;id=9">w</a>`,
      ),
      "https://gelbooru.com/index.php?page=wiki&s=view&id=9",
    );
    assert.equal(
      discoverUrl(
        "wiki-view",
        `<a href="index.php?page=wiki&amp;s=view&amp;search=foo_bar">w</a>`,
      ),
      "https://gelbooru.com/index.php?page=wiki&s=view&search=foo_bar",
    );
  });

  it("rewrites wiki list ids into edit and history URLs", () => {
    const html = `<a href="index.php?page=wiki&amp;s=view&amp;id=7">w</a>`;
    assert.equal(
      discoverUrl("wiki-edit", html),
      "https://gelbooru.com/index.php?page=wiki&s=edit&id=7",
    );
    assert.equal(
      discoverUrl("wiki-history", html),
      "https://gelbooru.com/index.php?page=wiki&s=history&id=7",
    );
  });

  it("resolves tags-edit and conversation-view", () => {
    assert.equal(
      discoverUrl(
        "tags-edit",
        `<a href="index.php?page=tags&amp;s=edit&amp;tag=1girl">t</a>`,
      ),
      "https://gelbooru.com/index.php?page=tags&s=edit&tag=1girl",
    );
    assert.equal(
      discoverUrl(
        "conversation-view",
        `<a href="index.php?page=conversation&amp;s=view&amp;id=3">c</a>`,
      ),
      "https://gelbooru.com/index.php?page=conversation&s=view&id=3",
    );
  });

  it("detects discover seed pages", () => {
    assert.equal(
      isDiscoverSeed(
        "https://gelbooru.com/index.php?page=tags&s=list&pid=0",
        "tags-edit",
      ),
      true,
    );
    assert.equal(
      isDiscoverSeed(
        "https://gelbooru.com/index.php?page=tags&s=edit&tag=1girl",
        "tags-edit",
      ),
      false,
    );
  });
});
