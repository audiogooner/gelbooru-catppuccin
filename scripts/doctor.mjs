import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { bundles, snapshotPages } from "../style.config.mjs";
import lintConfig from "../style.lint.config.mjs";
import { bundleId, parseDocumentRules, root } from "./lib.mjs";
import { snapshotIdForBundle } from "./lib/lint-dead-selectors.mjs";
import { pagesDir } from "./lib/snapshot-io.mjs";

export function inspectProject({
  bundleList = bundles,
  pages = snapshotPages,
  config = lintConfig,
} = {}) {
  const findings = [];

  function add(severity, message) {
    findings.push({ severity, message });
  }

  const bundleFiles = new Set();
  for (const bundle of bundleList) {
    if (bundleFiles.has(bundle.file)) {
      add("error", `duplicate bundle ${bundle.file}`);
    }
    bundleFiles.add(bundle.file);
    if (!existsSync(join(root, bundle.file))) {
      add("error", `bundle file missing: ${bundle.file}`);
    }
    try {
      parseDocumentRules(bundle.document);
    } catch (error) {
      add("error", `${bundle.file}: ${error.message}`);
    }
  }

  const pageDir = join(root, "src/pages");
  const pageFiles = existsSync(pageDir)
    ? readdirSync(pageDir)
        .filter((name) => name.endsWith(".scss"))
        .map((name) => `src/pages/${name}`)
    : [];

  for (const file of pageFiles) {
    if (!bundleFiles.has(file)) {
      add("error", `${file} is not registered in style.config.mjs`);
    }
  }

  const snapshotIds = new Set(
    existsSync(pagesDir)
      ? readdirSync(pagesDir)
          .filter((name) => name.endsWith(".html"))
          .map((name) => name.replace(/\.html$/, ""))
      : [],
  );

  const missingSnapshots = new Set();
  for (const bundle of bundleList) {
    if (bundle.file.endsWith("base.scss")) {
      continue;
    }
    if (!snapshotIdForBundle(bundle.file, config)) {
      const id = bundleId(bundle.file);
      missingSnapshots.add(id);
      add(
        "warning",
        `${id} has no page snapshot (dead-selector lint is skipped)`,
      );
    }
  }

  const catalogIds = new Set();
  for (const page of pages) {
    if (catalogIds.has(page.id)) {
      add("error", `duplicate snapshotPages id ${page.id}`);
    }
    catalogIds.add(page.id);
    if (!page.url && !page.discover) {
      add("error", `snapshotPages ${page.id} needs url or discover`);
    }
  }

  for (const id of snapshotIds) {
    if (!catalogIds.has(id)) {
      add("warning", `snapshot ${id} is not listed in snapshotPages`);
    }
  }

  for (const page of pages) {
    if (!snapshotIds.has(page.id) && !missingSnapshots.has(page.id)) {
      const how = page.userscriptOnly
        ? "Alt+Shift+S while logged in"
        : "npm run snapshot:fetch";
      add("info", `no snapshot yet for ${page.id} (${how})`);
    }
  }

  return {
    findings,
    errors: findings.filter((item) => item.severity === "error"),
    warnings: findings.filter((item) => item.severity === "warning"),
    info: findings.filter((item) => item.severity === "info"),
  };
}

export function formatDoctor(report) {
  const lines = [
    `doctor — ${report.errors.length} errors, ${report.warnings.length} warnings, ${report.info.length} notes`,
    "",
  ];
  const label = { error: "ERROR", warning: "WARN ", info: "note " };
  for (const finding of report.findings) {
    lines.push(`${label[finding.severity]}  ${finding.message}`);
  }
  if (report.findings.length === 0) {
    lines.push("ok  bundles, pages, and snapshots line up");
  }
  return `${lines.join("\n").trim()}\n`;
}

function main() {
  const report = inspectProject();
  console.log(formatDoctor(report));
  if (report.errors.length > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
