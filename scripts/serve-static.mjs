// Serves the built site the way a plain static host would. Usage: node scripts/serve-static.mjs out 4318
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const dir = resolve(process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? 4318);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let file = join(dir, normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ""));
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith("/")) {
      res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    file = join(file, "index.html");
  }
  if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  let status = 200;
  if (!existsSync(file)) {
    status = 404;
    file = join(dir, "404.html");
  }
  res.writeHead(status, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(port, "0.0.0.0", () => console.log(`Serving ${dir} at http://127.0.0.1:${port}`));
