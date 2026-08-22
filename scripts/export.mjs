import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { assembleUserstyle, compileBundles, root } from "./lib.mjs";
import { exportFile } from "../style.config.mjs";

const compiled = compileBundles();
const output = assembleUserstyle(compiled);
const dest = join(root, exportFile);

writeFileSync(dest, output);
console.log(`Exported UserStyle → ${exportFile}`);
