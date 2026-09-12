import { createServer } from "node:http";
import { readFileSync, watch, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  assembleUserstyle,
  compileBundles,
  cssForHref,
  root,
  serializeDevBundles,
  useConfig,
} from "./lib.mjs";
import { exportFile, host, port } from "../style.config.mjs";
import { writeSnapshot } from "./lib/snapshot-io.mjs";
import { selectorTargetsForHref } from "./lib/selector-targets.mjs";
import { writeSnapshotPreviews } from "./lib/snapshot-previews.mjs";

const userscriptPath = join(root, "userscript/gelbooru-dev.user.js");
const slimPath = join(root, "scripts/lib/slim-document.mjs");
const capturePath = join(root, "scripts/snapshot-capture.js");
const html2canvasPath = join(root, "node_modules/html2canvas/dist/html2canvas.min.js");
const MAX_SNAPSHOT_BYTES = 8 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 32 * 1024 * 1024;

let compiled = [];
let generation = 0;
let compileError = null;
let configRevision = 0;

async function compile() {
  try {
    // The query string bypasses Node's ESM cache when style.config.mjs changes.
    const configUrl = new URL("../style.config.mjs", import.meta.url);
    configUrl.searchParams.set("revision", String(configRevision++));
    const config = await import(configUrl.href);
    useConfig(config);
    const nextCompiled = compileBundles();
    writeFileSync(join(root, config.exportFile), assembleUserstyle(nextCompiled));
    compiled = nextCompiled;
    compileError = null;
    generation += 1;
    console.log(
      `[${timestamp()}] compiled and published ${config.exportFile} (${generation})`,
    );
  } catch (error) {
    compileError = error.message;
    console.error(`[${timestamp()}] sass error:\n${error.message}`);
  }
}

function timestamp() {
  return new Date().toLocaleTimeString();
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => void fn(...args), ms);
  };
}

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type,
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function hrefFrom(url) {
  return url.searchParams.get("href") ?? "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function landingPage() {
  const userscript = `http://${host}:${port}/gelbooru-dev.user.js`;
  const errorBlock = compileError
    ? `<pre class="err">${escapeHtml(compileError)}</pre>`
    : "";
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gelbooru userstyle — dev</title>
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0;
    font: 15px/1.45 ui-sans-serif, system-ui, sans-serif;
    background: #1e1e2e;
    color: #cdd6f4;
  }
  main { max-width: 40rem; margin: 0 auto; padding: 2.5rem 1.25rem; }
  h1 { font-size: 1.25rem; font-weight: 650; }
  a { color: #89b4fa; }
  ol { padding-left: 1.2rem; }
  li { margin: 0.4rem 0; }
  kbd, code, pre {
    font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  kbd, code {
    padding: 0.1em 0.35em;
    background: #313244;
    border-radius: 6px;
  }
  pre {
    padding: 0.75rem 1rem;
    overflow: auto;
    background: #313244;
    border-radius: 6px;
  }
  .err { color: #f38ba8; }
  .hint { color: #6c7086; font-size: 0.9rem; }
</style>
<main>
  <h1>Gelbooru userstyle — live inject</h1>
  ${errorBlock}
  <ol>
    <li>Install the userscript in Violentmonkey:<br>
      <a href="${userscript}">${userscript}</a></li>
    <li>Open <a href="https://gelbooru.com">gelbooru.com</a> — edits under <code>src/</code> reload automatically</li>
    <li><kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> toggles the overlay (theme / page bundles / site CSS)</li>
    <li><kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> captures a snapshot and selector hover previews</li>
  </ol>
  <p class="hint">Disable any installed copy of the exported UserStyle while developing.
  Generation ${generation}${compileError ? " · last good CSS still served" : ""}.</p>
</main>
`;
}

function captureDriver() {
  const slim = readFileSync(slimPath, "utf8").replaceAll(/^export /gm, "");
  const driver = readFileSync(capturePath, "utf8");
  const html2canvasSrc = readFileSync(html2canvasPath, "utf8");
  return (
    "var html2canvas = (function () {\n" +
    "  var module = { exports: {} };\n" +
    "  var exports = module.exports;\n" +
    "  var define;\n" +
    html2canvasSrc +
    "\n  return module.exports;\n" +
    "})();\n" +
    slim +
    "\n" +
    driver +
    "\n"
  );
}

function readBody(req, maxBytes = MAX_SNAPSHOT_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("snapshot too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handleSnapshot(req, res) {
  const payload = JSON.parse(await readBody(req));
  const result = writeSnapshot(payload);
  console.log(`[${timestamp()}] snapshot ${result.id}`);
  send(res, 200, JSON.stringify(result), "application/json; charset=utf-8");
}

async function handleSnapshotPreviews(req, res) {
  const payload = JSON.parse(await readBody(req, MAX_PREVIEW_BYTES));
  const result = writeSnapshotPreviews(payload);
  console.log(`[${timestamp()}] previews ${result.id} (${result.count})`);
  send(res, 200, JSON.stringify(result), "application/json; charset=utf-8");
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${host}:${port}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    });
    res.end();
    return;
  }

  if (url.pathname === "/style.css") {
    send(res, 200, cssForHref(compiled, hrefFrom(url)), "text/css; charset=utf-8");
    return;
  }

  if (url.pathname === "/dev.json") {
    const clientGen = Number(url.searchParams.get("generation"));
    if (Number.isFinite(clientGen) && clientGen > 0 && clientGen === generation) {
      send(
        res,
        200,
        JSON.stringify({ generation, unchanged: true, error: compileError }),
        "application/json; charset=utf-8",
      );
      return;
    }

    send(
      res,
      200,
      JSON.stringify({
        generation,
        error: compileError,
        bundles: serializeDevBundles(compiled, hrefFrom(url)),
      }),
      "application/json; charset=utf-8",
    );
    return;
  }

  if (url.pathname === "/snapshot-capture.js") {
    send(res, 200, captureDriver(), "text/javascript; charset=utf-8");
    return;
  }

  if (url.pathname === "/selector-targets") {
    try {
      const targets = selectorTargetsForHref(hrefFrom(url));
      send(
        res,
        200,
        JSON.stringify(targets),
        "application/json; charset=utf-8",
      );
    } catch (error) {
      console.error(`[${timestamp()}] selector-targets:`, error.message);
      send(
        res,
        500,
        JSON.stringify({ error: error.message }),
        "application/json; charset=utf-8",
      );
    }
    return;
  }

  if (url.pathname === "/snapshot" && req.method === "POST") {
    handleSnapshot(req, res).catch((error) => {
      console.error(`[${timestamp()}] snapshot error:`, error.message);
      if (!res.headersSent) {
        send(
          res,
          400,
          JSON.stringify({ error: error.message }),
          "application/json; charset=utf-8",
        );
      }
    });
    return;
  }

  if (url.pathname === "/snapshot-previews" && req.method === "POST") {
    handleSnapshotPreviews(req, res).catch((error) => {
      console.error(`[${timestamp()}] preview error:`, error.message);
      if (!res.headersSent) {
        send(
          res,
          400,
          JSON.stringify({ error: error.message }),
          "application/json; charset=utf-8",
        );
      }
    });
    return;
  }

  if (url.pathname === "/gelbooru-dev.user.js") {
    send(
      res,
      200,
      readFileSync(userscriptPath),
      "text/javascript; charset=utf-8",
    );
    return;
  }

  if (url.pathname === "/") {
    send(res, 200, landingPage(), "text/html; charset=utf-8");
    return;
  }

  send(res, 404, "Not found\n", "text/plain; charset=utf-8");
});

await compile();
const rebuild = debounce(compile, 80);
watch(join(root, "src"), { recursive: true }, rebuild);
watch(join(root, "style.config.mjs"), rebuild);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the other \`npm run dev\`, or set PORT=…`,
    );
    process.exit(1);
  }
  throw error;
});

server.listen(port, host, () => {
  console.log(`
Gelbooru userstyle — live inject
  Open  http://${host}:${port}
  1. Install the userscript in Violentmonkey:
       http://${host}:${port}/gelbooru-dev.user.js
  2. Open https://gelbooru.com — source and bundle config edits reload automatically
  3. Alt+Shift+D toggles the dev overlay (disable theme / page bundles / site CSS)
  4. Alt+Shift+S captures a slimmed DOM snapshot and selector hover previews
  5. The latest UserStyle is published to ${exportFile} after every successful build
`);
});
