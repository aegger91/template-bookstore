// Loads every built page in every language at 360, 390, 768, 1280 and 1440 px and fails on sideways scrolling.
// Also re-checks each page with the document forced to right-to-left.
// Usage: npm run build && npm run check   (needs Chrome; set CHROME_PATH if it is not at /usr/local/bin/google-chrome)
import { spawn } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "playwright-core";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "out");
const port = 4319;
const widths = [360, 390, 768, 1280, 1440];
const rtlWidths = [390, 1280];
const only = process.argv[2];

export const sampleCart = {
  lines: [
    { productId: "ladder", formatId: "hc", qty: 1 },
    { productId: "icon-theotokos", formatId: "m", qty: 1 },
    { productId: "star-picture-book", formatId: "hc", qty: 2 },
    { productId: "rope-33", formatId: "blk", qty: 1 },
  ],
  giftWrap: true,
  giftMessage: "",
};

function pagesIn(dir) {
  const list = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) list.push(...pagesIn(p));
    else if (name === "index.html") list.push(`/${relative(out, dir)}/`.replace(/\/+/g, "/"));
  }
  return list;
}

const server = spawn(process.execPath, [join(root, "scripts/serve-static.mjs"), out, String(port)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));

const paths = pagesIn(out).filter((p) => p !== "/" && !p.startsWith("/_") && (!only || p.includes(only)));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome" });
const failures = [];
let checks = 0;

async function run(width, rtl) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript((cart) => localStorage.setItem("orthodox-bookstore-template:cart", JSON.stringify(cart)), sampleCart);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => failures.push(`${width}px ${page.url()}: script error ${e.message}`));
  for (const path of paths) {
    await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    if (rtl) await page.evaluate(() => (document.documentElement.dir = "rtl"));
    const collision = await page.evaluate(() => {
      const header = document.querySelector("header");
      const boxes = [...(header?.querySelectorAll("[data-header-part]") ?? [])]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0);
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const [a, b] = [boxes[i], boxes[j]];
          if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) return true;
        }
      return false;
    });
    if (collision) failures.push(`${width}px${rtl ? " rtl" : ""} ${path}: logo, menu and header buttons overlap`);
    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const overflow = document.documentElement.scrollWidth - vw;
      if (overflow <= 1) return null;
      const scrollsOrClips = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const s = getComputedStyle(p);
          if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
        }
        return false;
      };
      const offenders = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !scrollsOrClips(el);
        })
        .slice(0, 3)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")}`);
      return { overflow, offenders };
    });
    checks++;
    if (result) failures.push(`${width}px${rtl ? " rtl" : ""} ${path}: ${result.overflow}px sideways scroll; ${result.offenders.join(", ")}`);
  }
  await ctx.close();
}

try {
  await Promise.all(widths.map((w) => run(w, false)));
  await Promise.all(rtlWidths.map((w) => run(w, true)));
} finally {
  await browser.close();
  server.kill();
}

if (failures.length) {
  console.error(`${failures.length} of ${checks} checks failed:`);
  for (const f of failures.slice(0, 60)) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`Layout OK: ${paths.length} pages x ${widths.length} widths, plus right-to-left at ${rtlWidths.join(" and ")} px (${checks} checks).`);
