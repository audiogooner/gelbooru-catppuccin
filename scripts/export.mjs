import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { assembleUserstyle, compileBundles, root } from "./lib.mjs";
import { exportFile, exportMinFile } from "../style.config.mjs";

function writeExport(rel, contents) {
  writeFileSync(join(root, rel), contents);
  return { file: rel, bytes: Buffer.byteLength(contents) };
}

const expanded = compileBundles();
const compressed = compileBundles({ style: "compressed" });

const written = [
  writeExport(exportFile, assembleUserstyle(expanded)),
  writeExport(exportMinFile, assembleUserstyle(compressed, { compact: true })),
];

for (const { file, bytes } of written) {
  const kb = (bytes / 1024).toFixed(1);
  console.log(`Exported UserStyle → ${file} (${kb} KB)`);
}
