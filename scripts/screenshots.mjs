// Desktop and mobile screenshots of the key pages in every language, taken from the built site.
// Usage: npm run build && npm run screenshots [output-dir]
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";

const root = new URL("..", import.meta.url).pathname;
const site = JSON.parse(readFileSync(join(root, "content/site.json"), "utf8"));
const products = JSON.parse(readFileSync(join(root, "content/catalog/products.json"), "utf8")).products;
const dest = resolve(process.argv[2] ?? join(root, "screenshots"));
const port = 4320;
mkdirSync(dest, { recursive: true });

const cart = {
  lines: [
    { productId: "ladder", formatId: "hc", qty: 1 },
    { productId: "icon-theotokos", formatId: "m", qty: 1 },
    { productId: "star-picture-book", formatId: "hc", qty: 2 },
    { productId: "rope-33", formatId: "blk", qty: 1 },
  ],
  giftWrap: true,
  giftMessage: "",
};
const product = products.find((p) => p.id === "ladder");
const pages = {
  home: "",
  catalog: "catalog/",
  product: `${site.routes.product}/${product.slug}/`,
  cart: "cart/",
  checkout: "checkout/",
  wholesale: "wholesale/",
  events: "events/",
};
const devices = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const server = spawn(process.execPath, [join(root, "scripts/serve-static.mjs"), join(root, "out"), String(port)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome" });
const base = `http://127.0.0.1:${port}`;

async function open(device, path) {
  const ctx = await browser.newContext({ ...devices[device], reducedMotion: "reduce" });
  await ctx.addInitScript((c) => localStorage.setItem("orthodox-bookstore-template:cart", JSON.stringify(c)), cart);
  const page = await ctx.newPage();
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  return { ctx, page };
}

try {
  for (const { code } of site.languages) {
    for (const [name, path] of Object.entries(pages)) {
      for (const device of Object.keys(devices)) {
        const { ctx, page } = await open(device, `/${code}/${path}`);
        await page.screenshot({ path: join(dest, `${code}-${name}-${device}.png`), fullPage: true });
        await ctx.close();
      }
    }

    const d = await open("desktop", `/${code}/`);
    await d.page.locator("header nav[aria-label='Main'] button").first().click();
    await d.page.waitForTimeout(300);
    await d.page.screenshot({ path: join(dest, `${code}-extra-mega-menu-desktop.png`) });
    await d.page.keyboard.press("Escape");
    await d.page.mouse.move(700, 600);
    await d.page.evaluate(() => scrollTo(0, 1400));
    await d.page.waitForTimeout(400);
    await d.page.screenshot({ path: join(dest, `${code}-extra-condensed-header-desktop.png`) });
    await d.ctx.close();

    const m = await open("mobile", `/${code}/`);
    const dict = JSON.parse(readFileSync(join(root, `content/i18n/${code}.json`), "utf8"));
    await m.page.locator(`header button[aria-label="${dict.common.menu}"]`).first().click();
    await m.page.waitForTimeout(400);
    await m.page.screenshot({ path: join(dest, `${code}-extra-drawer-mobile.png`) });
    await m.ctx.close();
    console.log(`${code}: done`);
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(`Screenshots saved to ${dest}`);
