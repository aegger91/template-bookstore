// LANGUAGE FIT: every built page in every language at 360, 768 and 1280 px.
// Flags text elements with scrollWidth > clientWidth, scrollHeight > clientHeight,
// or pairwise overlap in the header / primary UI. Also fails on document sideways scroll.
// Usage: npm run build && npm run check:fit   (needs Chrome; set CHROME_PATH if needed)
import { spawn } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "playwright-core";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "out");
const port = 4321;
const widths = [360, 768, 1280];
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

async function run(width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript((cart) => localStorage.setItem("orthodox-bookstore-template:cart", JSON.stringify(cart)), sampleCart);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => failures.push(`${width}px ${page.url()}: script error ${e.message}`));

  for (const path of paths) {
    await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(60);

    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const issues = [];
      const labelOf = (el) => {
        const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
        const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 42);
        return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${text ? ` "${text}"` : ""}`;
      };

      const sideways = document.documentElement.scrollWidth - vw;
      if (sideways > 1) issues.push(`page ${sideways}px wider than viewport`);

      const ignored = (el) =>
        !el ||
        el.closest(".sr-only, [aria-hidden='true'], [data-overflow-ok], svg, script, style, noscript") ||
        el.querySelector?.("[data-overflow-ok]") ||
        el.getAttribute("aria-hidden") === "true";

      const hasIntentionalClamp = (el) => {
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          const s = getComputedStyle(n);
          if (s.textOverflow === "ellipsis") return true;
          if (s.webkitLineClamp && s.webkitLineClamp !== "none") return true;
          if (n.classList?.contains("truncate")) return true;
          if ([...n.classList || []].some((c) => c.startsWith("line-clamp-"))) return true;
          if (n.hasAttribute?.("data-overflow-ok")) return true;
        }
        return false;
      };

      // Leaf text carriers: element has its own text node(s), not only nested wrappers.
      const textLeaves = [];
      for (const el of document.querySelectorAll("body *")) {
        if (ignored(el)) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) continue;
        if (/^(SCRIPT|STYLE|SVG|PATH|IMG|VIDEO|CANVAS|BR|HR|INPUT|TEXTAREA|SELECT|OPTION)$/.test(el.tagName)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        // Skip icon-only checkbox/radio/switch controls (hit-area pseudos inflate scrollWidth).
        if (el.tagName === "BUTTON" && (el.getAttribute("role") === "checkbox" || el.getAttribute("role") === "radio" || el.getAttribute("role") === "switch")) continue;
        if (el.classList?.contains("peer") && r.width <= 24 && r.height <= 24) continue;
        const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!ownText && !/^(A)$/.test(el.tagName)) continue;
        if (el.tagName === "BUTTON" && !ownText && !(el.textContent || "").trim()) continue;
        // Prefer deepest text node parents: skip if a child already carries the same text.
        if ([...el.children].some((c) => (c.textContent || "").trim() === (el.textContent || "").trim() && c.childElementCount === 0)) continue;
        textLeaves.push(el);
      }

      for (const el of textLeaves) {
        if (hasIntentionalClamp(el)) continue;
        const style = getComputedStyle(el);
        const r = el.getBoundingClientRect();

        // background-clip:text often reports 1–2px phantom overflow from glyph ink; require a real gap.
        const clipSlop = style.webkitBackgroundClip === "text" || style.backgroundClip === "text" ? 2 : 1;
        if (el.scrollWidth > el.clientWidth + clipSlop) issues.push(`scrollWidth>clientWidth ${labelOf(el)}`);
        if (el.scrollHeight > el.clientHeight + clipSlop) {
          const clipsY = /(hidden|clip|auto|scroll)/.test(style.overflowY) || /(hidden|clip)/.test(style.overflow);
          if (clipsY) issues.push(`scrollHeight>clientHeight ${labelOf(el)}`);
        }

        // Clipped by a nearby overflow:hidden ancestor (not page sections that merely clip decoration).
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          if (a.hasAttribute("data-overflow-ok")) break;
          const s = getComputedStyle(a);
          const clips =
            /(hidden|clip)/.test(s.overflow) ||
            /(hidden|clip)/.test(s.overflowX) ||
            /(hidden|clip)/.test(s.overflowY) ||
            (s.webkitLineClamp && s.webkitLineClamp !== "none");
          if (!clips) continue;
          // Only flag when this ancestor is a tight text box (button, chip, heading clamp, logo),
          // not a large section/hero that uses overflow-hidden for decoration.
          const box = a.getBoundingClientRect();
          const tight = box.height < 120 || a.matches("button, a, h1, h2, h3, h4, label, span, li, [role='button'], [role='tab']") || (s.webkitLineClamp && s.webkitLineClamp !== "none");
          if (!tight) break;
          if (r.right > box.right + 1.5 || r.left < box.left - 1.5 || r.bottom > box.bottom + 1.5 || r.top < box.top - 1.5) {
            issues.push(`clipped by overflow ancestor ${labelOf(el)}`);
          }
          break;
        }
      }

      // Overlap among header chrome parts and visible nav/button labels.
      const header = document.querySelector("header");
      if (header) {
        const visible = [...header.querySelectorAll("[data-header-part], nav[aria-label='Main'] > a, nav[aria-label='Main'] button, nav[aria-label='Utility'] a")]
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ el, r }) => r.width > 1 && r.height > 1 && getComputedStyle(el).visibility !== "hidden");
        for (let i = 0; i < visible.length; i++) {
          for (let j = i + 1; j < visible.length; j++) {
            const a = visible[i];
            const b = visible[j];
            if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
            const overlapX = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
            const overlapY = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
            if (overlapX > 1 && overlapY > 1) issues.push(`overlap ${labelOf(a.el)} × ${labelOf(b.el)}`);
          }
        }
      }

      return [...new Set(issues)].slice(0, 20);
    });

    checks++;
    for (const issue of result) failures.push(`${width}px ${path}: ${issue}`);
  }

  await ctx.close();
}

try {
  for (const w of widths) await run(w);
} finally {
  await browser.close();
  server.kill();
}

const issueCount = failures.length;
if (issueCount) {
  console.error(`Language fit FAILED: ${issueCount} issue(s) across ${checks} page×width checks (${paths.length} pages × ${widths.join("/")}).`);
  for (const f of failures.slice(0, 100)) console.error(`  - ${f}`);
  if (failures.length > 100) console.error(`  … ${failures.length - 100} more`);
  process.exit(1);
}
console.log(`Language fit OK: ${paths.length} pages × ${widths.join("/")} (${checks} checks, 0 issues).`);
