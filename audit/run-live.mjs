import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire("/tmp/pptr-audit/package.json");
const puppeteer = require("puppeteer-core");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const routes = JSON.parse(readFileSync(join(root, "audit/routes.json"), "utf8")).routes;
const shotDir = join(root, "audit/screenshots");
mkdirSync(shotDir, { recursive: true });

const [port, browserPath] = readFileSync(
  `${process.env.HOME}/.config/google-chrome/DevToolsActivePort`,
  "utf8",
)
  .trim()
  .split("\n");
const browserWSEndpoint = `ws://127.0.0.1:${port}${browserPath}`;

const PROBE = () => {
  function parseRgb(c) {
    const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3] };
  }
  function lum(rgb) {
    return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  }
  const injected = [...document.querySelectorAll("style[data-gelbooru-dev]")].map(
    (s) => s.getAttribute("data-gelbooru-dev"),
  );
  const rootStyle = getComputedStyle(document.documentElement);
  const selectors = [
    "body",
    "#container",
    "main",
    "#content",
    ".mainBody",
    ".contain-push",
    "article",
    "#post-list",
  ];
  const backgrounds = {};
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const bg = getComputedStyle(el).backgroundColor;
    const rgb = parseRgb(bg);
    backgrounds[sel] = { bg, lum: rgb ? +lum(rgb).toFixed(3) : null };
  }
  let whiteBoxes = 0;
  const samples = [];
  const overlay = document.getElementById("gelbooru-dev-overlay");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (overlay && overlay.contains(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 200 || r.height < 80) continue;
    const rgb = parseRgb(getComputedStyle(el).backgroundColor);
    if (!rgb) continue;
    if (rgb.r >= 240 && rgb.g >= 240 && rgb.b >= 240) {
      whiteBoxes++;
      if (samples.length < 6) {
        samples.push({
          tag: el.tagName,
          id: el.id,
          className: String(el.className || "").slice(0, 80),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }
  }
  const de = document.documentElement;
  const text = (document.body && document.body.innerText) || "";
  const loginWall = /you must be logged in|please log in|not logged in/i.test(
    text.slice(0, 800),
  );
  const notFound =
    /404|page not found|invalid id/i.test(document.title) ||
    /page not found/i.test(text.slice(0, 400));
  const empty = !document.body || text.trim().length < 20;
  const lightMain = Object.values(backgrounds).some((b) => b.lum != null && b.lum > 0.7);
  return {
    title: document.title,
    href: location.href,
    injected,
    baseVar: rootStyle.getPropertyValue("--base").trim(),
    overlayPresent: !!overlay,
    backgrounds,
    whiteBoxes,
    whiteSamples: samples,
    overflowX: de.scrollWidth > de.clientWidth + 20,
    bodyHeight: document.body ? document.body.offsetHeight : 0,
    loginWall,
    notFound,
    empty,
    lightMain,
  };
};

function classify(route, probe, error) {
  if (error) return "unreachable";
  if (!probe) return "unreachable";
  if (probe.empty || probe.loginWall || probe.notFound) return "unreachable";
  const injected = (probe.injected || []).filter((id) => id && id !== "overlay" && id !== "blackout");
  if (!injected.includes("base")) return "missing-bundle";
  const missing = (route.expectedPageBundles || []).filter((id) => !injected.includes(id));
  if (missing.length) return "missing-bundle";
  if (probe.overflowX || probe.bodyHeight < 40) return "layout-broken";
  if (probe.whiteBoxes > 0 || probe.lightMain) return "unstyled-pockets";
  if (route.classification === "base-only") return "base-only";
  return "ok";
}

const browser = await puppeteer.connect({
  browserWSEndpoint,
  defaultViewport: null,
});

const pages = await browser.pages();
let page = pages.find((p) => (p.url() || "").includes("gelbooru.com")) || pages[0];
if (!page) {
  page = await browser.newPage();
}

const results = [];
for (const [i, route] of routes.entries()) {
  const screenshot = join(shotDir, `${route.id}.png`);
  const row = {
    id: route.id,
    requestedUrl: route.url,
    expectedPageBundles: route.expectedPageBundles,
    staticClassification: route.classification,
    screenshot: `audit/screenshots/${route.id}.png`,
  };
  process.stderr.write(`[${i + 1}/${routes.length}] ${route.id}\n`);
  try {
    await page.goto(route.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 900));
    const probe = await page.evaluate(PROBE);
    await page.screenshot({ path: screenshot, type: "png" });
    Object.assign(row, probe, {
      liveClass: classify(route, probe, null),
      notes: probe.href !== route.url ? `redirected from ${route.url}` : "",
    });
  } catch (err) {
    row.liveClass = "unreachable";
    row.error = String(err?.message || err);
    row.notes = row.error;
  }
  results.push(row);
  writeFileSync(join(root, "audit/live-results.json"), JSON.stringify(results, null, 2) + "\n");
}

await browser.disconnect();

const counts = {};
for (const r of results) counts[r.liveClass] = (counts[r.liveClass] || 0) + 1;
console.log(JSON.stringify({ total: results.length, counts }, null, 2));
