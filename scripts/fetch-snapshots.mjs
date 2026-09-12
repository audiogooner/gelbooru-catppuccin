import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseHTML } from "linkedom";
import { snapshotPages } from "../style.config.mjs";
import {
  collectInventory,
  outlineTree,
  pageIdFromUrl,
  serializeHtml,
  slimDocument,
  stylesheetHrefs,
  stylesheetName,
} from "./lib/slim-document.mjs";
import { pagesDir, writeSnapshot } from "./lib/snapshot-io.mjs";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const cssCache = new Map();
let listHtml = "";
let wikiHtml = "";

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,text/css,*/*" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

async function resolveUrl(entry) {
  if (entry.url) {
    return entry.url;
  }

  if (entry.discover === "post-view") {
    if (!listHtml) {
      listHtml = await fetchText(
        "https://gelbooru.com/index.php?page=post&s=list&tags=all",
      );
    }
    const match = listHtml.match(/page=post&(?:amp;)?s=view&(?:amp;)?id=(\d+)/);
    if (!match) {
      throw new Error("Could not discover a post-view id from the post list");
    }
    return `https://gelbooru.com/index.php?page=post&s=view&id=${match[1]}`;
  }

  if (entry.discover === "wiki-view") {
    if (!wikiHtml) {
      wikiHtml = await fetchText(
        "https://gelbooru.com/index.php?page=wiki&s=list",
      );
    }
    const match = wikiHtml.match(
      /href="(index\.php\?page=wiki&(?:amp;)?s=(?:view|list)&(?:amp;)?search=[^"]+)"/,
    );
    if (!match) {
      throw new Error("Could not discover a wiki page URL");
    }
    return new URL(match[1].replaceAll("&amp;", "&"), "https://gelbooru.com/")
      .href;
  }

  throw new Error(`Unknown snapshot entry: ${JSON.stringify(entry)}`);
}

async function capturePage(url, forcedId) {
  const html = await fetchText(url);
  if (url.includes("page=post&s=list")) {
    listHtml = html;
  }
  if (/page=wiki&s=list/.test(url) && !url.includes("search=")) {
    wikiHtml = html;
  }

  const { document } = parseHTML(html);
  const sheetHrefs = stylesheetHrefs(document, url);
  const { root, notes } = slimDocument(document);
  const inventory = collectInventory(root);
  const outline = outlineTree(root);
  const id = forcedId || pageIdFromUrl(url);
  const title = document.querySelector("title")?.textContent?.trim() ?? "";
  const capturedAt = new Date().toISOString();

  const stylesheets = [];
  for (const href of sheetHrefs) {
    const name = stylesheetName(href);
    if (!cssCache.has(name)) {
      try {
        cssCache.set(name, await fetchText(href));
      } catch (error) {
        notes.push(`failed to fetch CSS ${href}: ${error.message}`);
        continue;
      }
    }
    stylesheets.push({ name, css: cssCache.get(name), url: href });
  }

  const pageHtml = serializeHtml(root, {
    id,
    url,
    title,
    capturedAt,
    source: "fetch",
    stylesheets: stylesheets.map((sheet) => sheet.name),
    notes,
  });

  const meta = writeSnapshot({
    id,
    url,
    title,
    html: pageHtml,
    classes: inventory.classes,
    ids: inventory.ids,
    notes,
    stylesheets,
    source: "fetch",
    capturedAt,
    outline,
  });

  const extra = notes.length ? notes.join("; ") : "kept in full";
  console.log(
    `  ${meta.id.padEnd(18)} ${String(meta.classes.length).padStart(3)} classes  ${extra}`,
  );
}

function parseArgs(argv) {
  const args = { force: false, only: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--force") {
      args.force = true;
    } else if (arg === "--only") {
      args.only = argv[++i];
    } else if (arg.startsWith("--only=")) {
      args.only = arg.slice("--only=".length);
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function existingSource(id) {
  const metaPath = join(pagesDir, `${id}.json`);
  if (!existsSync(metaPath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(metaPath, "utf8")).source || null;
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Fetch public Gelbooru snapshots.

  npm run snapshot:fetch
  npm run snapshot:fetch -- --only tags-list
  npm run snapshot:fetch -- --force

Live (Alt+Shift+S) captures are skipped unless --force is set.
Logged-in pages stay userscript-only.`);
    return;
  }

  let entries = snapshotPages;
  if (args.only) {
    entries = snapshotPages.filter((entry) => entry.id === args.only);
    if (!entries.length) {
      throw new Error(`Unknown snapshot id: ${args.only}`);
    }
  }

  console.log("Fetching Gelbooru page snapshots…");

  const skippedLogin = [];
  const skippedLive = [];
  for (const entry of entries) {
    if (entry.userscriptOnly) {
      skippedLogin.push(entry);
      continue;
    }
    if (!args.force && existingSource(entry.id) === "live") {
      skippedLive.push(entry);
      continue;
    }
    try {
      const url = await resolveUrl(entry);
      await capturePage(url, entry.id);
    } catch (error) {
      console.error(`  FAIL ${entry.id || entry.url}: ${error.message}`);
    }
    await wait(250);
  }

  if (skippedLive.length) {
    console.log(
      `\nKept live captures (pass --force to overwrite with a public fetch):\n${skippedLive
        .map((entry) => `  ${entry.id}`)
        .join("\n")}`,
    );
  }

  if (skippedLogin.length) {
    console.log(
      `\nUserscript-only (open the page, Alt+Shift+S):\n${skippedLogin
        .map((entry) => `  ${entry.id}  ${entry.url}`)
        .join("\n")}`,
    );
  }

  console.log("Done. See snapshots/INDEX.md");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
