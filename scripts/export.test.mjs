import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assembleUserstyle,
  compileFile,
  parseDocumentRules,
  useConfig,
  userstyleHeader,
} from "./lib.mjs";
import { extractStyleRules } from "./lib/css-rules.mjs";

const fixture = "scripts/fixtures/lint/page-a.scss";

const compressedCss = compileFile(fixture, { style: "compressed" }).trim();

const sampleBundles = [
  {
    file: fixture,
    document: 'url-prefix("https://gelbooru.com/index.php?page=tags&s=list")',
    css: compressedCss,
  },
  {
    file: fixture,
    document: 'url("https://gelbooru.com/")',
    css: compressedCss,
  },
];

describe("assembleUserstyle compact", () => {
  it("keeps the UserStyle header and document matchers", () => {
    useConfig({
      metadata: {
        name: "Test Theme",
        version: "0.0.0",
        preprocessor: "default",
      },
    });

    const output = assembleUserstyle(sampleBundles, { compact: true });
    const header = userstyleHeader();

    assert.ok(output.startsWith(header));
    assert.match(output, /==UserStyle==/);
    assert.match(output, /@name\s+Test Theme/);

    for (const bundle of sampleBundles) {
      assert.ok(output.includes(`@-moz-document ${bundle.document}{`));
      for (const { kind, value } of parseDocumentRules(bundle.document)) {
        assert.ok(output.includes(`${kind}("${value}")`));
      }
    }
  });

  it("emits one line per document block after the header", () => {
    const output = assembleUserstyle(sampleBundles, { compact: true });
    const body = output.slice(output.indexOf("==/UserStyle== */")).trim();
    const blocks = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("@-moz-document"));

    assert.equal(blocks.length, sampleBundles.length);
    for (const block of blocks) {
      assert.equal(block.includes("\n"), false);
      assert.match(block, /\{.+\}$/);
    }
  });
});

describe("compressed compile", () => {
  it("emits the same selectors as expanded", () => {
    const expanded = compileFile(fixture, { style: "expanded" });
    const compressed = compileFile(fixture, { style: "compressed" });
    const selectors = (css) =>
      extractStyleRules(css).map((rule) => rule.selector);

    assert.deepEqual(selectors(expanded), selectors(compressed));
  });
});
