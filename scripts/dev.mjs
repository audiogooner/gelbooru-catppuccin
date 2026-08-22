import { createServer } from "node:http";
import { readFileSync, watch } from "node:fs";
import { join } from "node:path";
import { compileBundles, cssForHref, root, serializeDevBundles } from "./lib.mjs";
import { host, port } from "../style.config.mjs";
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

function compile() {
  try {
    compiled = compileBundles();
    compileError = null;
    generation += 1;
    console.log(`[${timestamp()}] compiled (${generation})`);
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
    timer = setTimeout(() => fn(...args), ms);
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
    send(
      res,
      200,
      `Gelbooru userstyle dev server\n\nUserscript: http://${host}:${port}/gelbooru-dev.user.js\nCSS:        http://${host}:${port}/style.css\nOverlay:    Alt+Shift+D on a Gelbooru page\nSnapshot:   Alt+Shift+S on a Gelbooru page\n`,
      "text/plain; charset=utf-8",
    );
    return;
  }

  send(res, 404, "Not found\n", "text/plain; charset=utf-8");
});

compile();
watch(join(root, "src"), { recursive: true }, debounce(compile, 80));

server.listen(port, host, () => {
  console.log(`
Gelbooru userstyle — live inject
  1. Install the userscript in Violentmonkey:
       http://${host}:${port}/gelbooru-dev.user.js
  2. Open https://gelbooru.com — edits to src/ reload automatically
  3. Alt+Shift+D toggles the dev overlay (disable theme / page bundles / site CSS)
  4. Alt+Shift+S captures a slimmed DOM snapshot and selector hover previews
  5. Export a UserStyle with: npm run export
`);
});
