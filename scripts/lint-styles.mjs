import { pathToFileURL } from "node:url";
import { bundles } from "../style.config.mjs";
import lintConfig from "../style.lint.config.mjs";
import { matchesIgnore } from "./lib/css-normalize.mjs";
import { compileBundleRules } from "./lib/css-rules.mjs";
import { lintCrossFile } from "./lib/lint-cross-file.mjs";
import { lintAllDead } from "./lib/lint-dead-selectors.mjs";
import { lintDuplicates } from "./lib/lint-duplicates.mjs";
import { lintRedundantBase } from "./lib/lint-redundant-base.mjs";
import { formatReport, summarizeFindings, writeReport } from "./lib/lint-report.mjs";
import { bundleId } from "./lib.mjs";

export function compileLintBundles(bundleList, options = {}) {
  return bundleList.map((bundle) => {
    const compiled = compileBundleRules(bundle.file, options);
    return {
      ...bundle,
      ...compiled,
      id: bundleId(bundle.file),
    };
  });
}

export function collectFindings(compiled, config = {}) {
  const findings = [];
  const usable = compiled.filter(
    (bundle) => !matchesIgnore(bundle.file, config.ignoreFiles),
  );
  const base = usable.find((bundle) => bundle.file.endsWith("base.scss"));

  for (const bundle of usable) {
    findings.push(...lintDuplicates(bundle, config));
    if (base && bundle !== base) {
      findings.push(...lintRedundantBase(bundle, base, config));
    }
  }

  findings.push(...lintCrossFile(usable, config));

  const dead = lintAllDead(usable, config);
  findings.push(...dead.findings);

  return { findings, skippedDead: dead.skipped };
}

export function runLint(options = {}) {
  const bundleList = options.bundles || bundles;
  const config = options.config || lintConfig;
  const compiled = compileLintBundles(bundleList, options);
  const { findings, skippedDead } = collectFindings(compiled, config);
  return summarizeFindings(findings, skippedDead);
}

function main() {
  const report = runLint();
  writeReport(report);
  console.log(formatReport(report));
  if (report.totals.errors > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
