import { existsSync, lstatSync, mkdirSync, rmSync, symlinkSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "editor/selector-preview");
const extDir =
  process.env.CURSOR_EXTENSIONS_DIR || join(homedir(), ".cursor", "extensions");
const dest = join(extDir, "gelbooru-userstyle.gelbooru-selector-preview-0.1.1");
const stale = [
  join(extDir, "gelbooru-userstyle.selector-preview-0.1.0"),
  join(extDir, "gelbooru-userstyle.gelbooru-selector-preview-0.1.0"),
];

function removePath(target) {
  if (!existsSync(target)) {
    return;
  }
  const stat = lstatSync(target);
  if (stat.isSymbolicLink()) {
    unlinkSync(target);
  } else {
    rmSync(target, { recursive: true, force: true });
  }
}

mkdirSync(extDir, { recursive: true });
for (const old of stale) {
  removePath(old);
}
removePath(dest);

symlinkSync(src, dest);
console.log(`Linked ${dest}`);
console.log(`     -> ${src}`);
console.log("Reload the Cursor window (Developer: Reload Window) to pick it up.");
console.log("Then Alt+Shift+S on a Gelbooru page to capture selector screenshots.");
