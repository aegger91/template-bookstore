// Checks every content file against its JSON Schema, then checks that ids point at things that exist.
// Runs before every build. Usage: npm run validate
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";

const root = new URL("..", import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
for (const f of readdirSync(join(root, "schemas"))) ajv.addSchema(read(`schemas/${f}`));

const files = {
  "content/site.json": "site.schema.json",
  "content/navigation.json": "navigation.schema.json",
  "content/pages.json": "pages.schema.json",
  "content/events.json": "events.schema.json",
  "content/posts.json": "posts.schema.json",
  "content/faq.json": "faq.schema.json",
  "content/catalog/categories.json": "categories.schema.json",
  "content/catalog/people.json": "people.schema.json",
  "content/catalog/saints.json": "saints.schema.json",
  "content/catalog/products.json": "products.schema.json",
  "design/tokens.json": "tokens.schema.json",
};
for (const f of readdirSync(join(root, "content/i18n"))) files[`content/i18n/${f}`] = "i18n.schema.json";

const errors = [];
const warnings = [];
const data = {};
for (const [file, schema] of Object.entries(files)) {
  data[file] = read(file);
  const validate = ajv.getSchema(schema);
  if (!validate(data[file])) {
    for (const e of validate.errors) errors.push(`${file}${e.instancePath || ""}: ${e.message}${e.params?.allowedValues ? ` (${e.params.allowedValues.join(", ")})` : ""}`);
  }
}

const site = data["content/site.json"];
const { categories, groups } = data["content/catalog/categories.json"];
const { products } = data["content/catalog/products.json"];
const { people, publishers } = data["content/catalog/people.json"];
const { saints, seasons } = data["content/catalog/saints.json"];
const { events } = data["content/events.json"];
const { posts } = data["content/posts.json"];
const { pages, templates } = data["content/pages.json"];
const tokens = data["design/tokens.json"];

const ids = (list, key = "id") => new Set(list.map((x) => x[key]));
const has = (set, id, where) => set.has(id) || errors.push(`${where}: unknown id "${id}"`);
const unique = (list, key, where) => {
  const seen = new Set();
  for (const x of list) seen.has(x[key]) ? errors.push(`${where}: duplicate ${key} "${x[key]}"`) : seen.add(x[key]);
};

const langCodes = site.languages.map((l) => l.code);
if (!langCodes.includes(site.defaultLanguage)) errors.push(`content/site.json: defaultLanguage "${site.defaultLanguage}" is not in languages`);
for (const code of langCodes) if (!files[`content/i18n/${code}.json`]) warnings.push(`No content/i18n/${code}.json; interface text will use ${site.defaultLanguage}.`);

const categoryIds = ids(categories), productIds = ids(products), personIds = ids(people), publisherIds = ids(publishers);
const saintIds = ids(saints), seasonIds = ids(seasons), groupIds = ids(groups), clothNames = new Set(Object.keys(tokens.cloth));

unique(categories, "id", "categories");
unique(products, "id", "products");
unique(products, "slug", "products");
unique(posts, "slug", "posts");
unique(events, "id", "events");
unique(pages, "path", "pages");

for (const c of categories) {
  has(groupIds, c.group, `category ${c.id} group`);
  has(clothNames, c.cloth, `category ${c.id} cloth`);
}
for (const s of seasons) has(clothNames, s.accent, `season ${s.id} accent`);
for (const s of site.seasons.calendar) has(seasonIds, s.season, "site.seasons.calendar");
if (site.seasons.active !== "auto") has(seasonIds, site.seasons.active, "site.seasons.active");
has(seasonIds, site.seasons.fallback, "site.seasons.fallback");

for (const p of products) {
  const w = `product ${p.id}`;
  has(categoryIds, p.category, `${w} category`);
  p.authors.forEach((a) => has(personIds, a, `${w} authors`));
  p.translators.forEach((a) => has(personIds, a, `${w} translators`));
  if (p.publisher) has(publisherIds, p.publisher, `${w} publisher`);
  p.saints.forEach((s) => has(saintIds, s, `${w} saints`));
  p.seasons.forEach((s) => has(seasonIds, s, `${w} seasons`));
  if (p.art.cloth) has(clothNames, p.art.cloth, `${w} art.cloth`);
  unique(p.formats, "id", `${w} formats`);
}
for (const e of events) if (e.product) has(productIds, e.product, `event ${e.id} product`);
for (const p of posts) p.products.forEach((id) => has(productIds, id, `post ${p.slug} products`));

const allSections = [...pages.flatMap((p) => p.sections.map((s) => [p.path || "home", s])), ...Object.entries(templates).flatMap(([t, list]) => list.map((s) => [`template ${t}`, s]))];
for (const [where, s] of allSections) (s.products ?? []).forEach((id) => has(productIds, id, `${where} ${s.type}.products`));
const templateOnly = { productDetail: "product", relatedProducts: "product", postArticle: "post", postProducts: "post" };
for (const p of pages) for (const s of p.sections) if (templateOnly[s.type]) errors.push(`page "${p.path}": ${s.type} only works in templates.${templateOnly[s.type]}`);

const reserved = new Set([site.routes.category, site.routes.product, site.routes.post]);
for (const p of pages) {
  const [first, ...rest] = p.path.split("/");
  if (reserved.has(first) && rest.length === 1) errors.push(`page "${p.path}" collides with a ${first} URL`);
}

// Copy rules: no em dashes, and crosses are always drawn by the shared SVG component.
const scan = (node, where) => {
  if (typeof node === "string") {
    if (node.includes("\u2014")) errors.push(`${where}: contains an em dash`);
    if (node.includes("\u2626")) errors.push(`${where}: contains the U+2626 cross glyph; use the OrthodoxCross component`);
  } else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) scan(v, `${where}.${k}`);
};
for (const [file, json] of Object.entries(data)) scan(json, file);

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  console.error(`Content check failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Content OK: ${Object.keys(files).length} files, ${products.length} products, ${pages.length} pages, ${langCodes.length} languages.`);
