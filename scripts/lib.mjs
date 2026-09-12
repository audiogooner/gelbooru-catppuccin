import * as sass from "sass";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bundles as configBundles,
  metadata as configMetadata,
} from "../style.config.mjs";

// Node caches this module, so the dev server cannot pick up config changes by
// re-importing style.config.mjs alone. It hands the fresh config to useConfig().
let bundles = configBundles;
let styleMetadata = configMetadata;

export function useConfig(config) {
  bundles = config.bundles ?? configBundles;
  styleMetadata = config.metadata ?? configMetadata;
}

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function compileFile(file, { style = "expanded" } = {}) {
  return sass.compile(join(root, file), {
    style,
    sourceMap: false,
    loadPaths: [join(root, "src")],
  }).css;
}

export function compileBundles({ style = "expanded" } = {}) {
  return bundles.map((bundle) => ({
    ...bundle,
    css: compileFile(bundle.file, { style }).trim(),
  }));
}

export function parseDocumentRules(document) {
  const rules = [];
  const re = /(url-prefix|url|regexp)\("([^"]+)"\)/g;
  let match;
  while ((match = re.exec(document)) !== null) {
    rules.push({ kind: match[1], value: match[2] });
  }

  if (rules.length === 0) {
    throw new Error(`Unsupported @-moz-document rule: ${document}`);
  }

  return rules;
}

export function parseDocument(document) {
  return parseDocumentRules(document)[0];
}

export function matchesDocument(document, href) {
  if (!href) {
    return true;
  }

  return parseDocumentRules(document).some(({ kind, value }) => {
    if (kind === "url-prefix") {
      return href.startsWith(value);
    }
    if (kind === "regexp") {
      return new RegExp(value).test(href);
    }

    return href === value;
  });
}

export function cssForHref(compiled, href) {
  return compiled
    .filter((bundle) => matchesDocument(bundle.document, href))
    .map((bundle) => bundle.css)
    .join("\n\n");
}

export function bundleId(file) {
  return file.replace(/^src\/(?:pages\/)?/, "").replace(/\.scss$/, "");
}

export function serializeDevBundles(compiled, href) {
  return compiled.map((bundle) => {
    const matches = matchesDocument(bundle.document, href);
    const entry = {
      id: bundleId(bundle.file),
      file: bundle.file,
      document: bundle.document,
      matches,
    };

    if (matches) {
      entry.css = bundle.css;
    }

    return entry;
  });
}

export function userstyleHeader() {
  const lines = Object.entries(styleMetadata).map(
    ([key, value]) => `@${key.padEnd(15)} ${value}`,
  );

  return `/* ==UserStyle==\n${lines.join("\n")}\n==/UserStyle== */`;
}

export function indent(css, spaces = 2) {
  const pad = " ".repeat(spaces);
  return css
    .split("\n")
    .map((line) => (line.length ? pad + line : line))
    .join("\n");
}

export function assembleUserstyle(compiled, { compact = false } = {}) {
  const sections = compiled.map((bundle) => {
    const css = bundle.css.trim();
    if (compact) {
      return `@-moz-document ${bundle.document}{${css}}`;
    }
    return `@-moz-document ${bundle.document} {\n${indent(css)}\n}`;
  });

  return `${userstyleHeader()}\n\n${sections.join(compact ? "\n" : "\n\n")}\n`;
}
