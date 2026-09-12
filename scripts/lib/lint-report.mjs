import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { root } from "../lib.mjs";

export const defaultReportPath = join(root, "audit/lint-results.json");

export function summarizeFindings(findings, skippedDead = []) {
  let errors = 0;
  let warnings = 0;
  const byRule = {};
  for (const finding of findings) {
    if (finding.severity === "error") {
      errors += 1;
    } else {
      warnings += 1;
    }
    byRule[finding.rule] = (byRule[finding.rule] || 0) + 1;
  }
  return {
    generatedAt: new Date().toISOString(),
    totals: {
      errors,
      warnings,
      findings: findings.length,
      deadSelectorSkipped: skippedDead.length,
    },
    byRule,
    skippedDead,
    findings,
  };
}

function formatLocation(location) {
  return `${location.file}:${location.line}`;
}

export function formatReport(report) {
  const lines = [
    `lint:styles — ${report.totals.errors} errors, ${report.totals.warnings} warnings`,
    "",
  ];

  for (const finding of report.findings) {
    const label = finding.severity === "error" ? "ERROR" : "WARN ";
    const primary = finding.locations[0];
    const where = primary ? `  ${formatLocation(primary)}` : "";
    lines.push(`${label}  ${finding.rule}${where}`);
    lines.push(`       ${finding.message}`);
    if (finding.locations.length > 1) {
      const extras = finding.locations
        .slice(1)
        .map((location) => formatLocation(location))
        .join(", ");
      lines.push(`       also ${extras}`);
    }
    lines.push("");
  }

  if (report.skippedDead.length) {
    const noSnapshot = report.skippedDead.filter((item) => item.reason === "no-snapshot");
    if (noSnapshot.length) {
      lines.push(
        `dead-selector: ${noSnapshot.length} bundles skipped (no snapshot)`,
      );
    }
  }

  lines.push(`Summary written to audit/lint-results.json`);
  return lines.join("\n");
}

export function writeReport(report, dest = defaultReportPath) {
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `${JSON.stringify(report, null, 2)}\n`);
}
