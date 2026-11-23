# Orthodox Bookstore Template

`orthodox-bookstore-template`: a Project Orthodox website template for an Orthodox bookstore, shown as the sample store "St. Example Orthodox Bookstore". Every title, price, ISBN, person, publisher and event in it is a placeholder.

It is one design, with no presets or modes. Clients change it by editing content fields and by turning sections on or off and reordering them.

## Run it

```bash
npm install
npm run dev        # http://localhost:4317
npm run build      # checks content, then writes the static site to out/
npm run preview    # serves out/ at http://localhost:4318
```

The `out/` folder is plain HTML, CSS and JS. Upload it to any static host. No server is needed.

## Where things live

| File | What it controls |
| --- | --- |
| `content/site.json` | Store name, logo style (`wordmark`, `seal`, `kiot`, `square`), languages, address, hours, shipping, payments, OrthodoxConnect |
| `content/pages.json` | Every page and its sections. Each section has `type` and `enabled`; order in the list is order on the page |
| `content/navigation.json` | Header, top bar and footer menus |
| `content/catalog/*.json` | Categories, products, people and publishers, saints and seasons |
| `content/events.json`, `posts.json`, `faq.json` | Events, journal posts, FAQ |
| `content/i18n/<code>.json` | Buttons and labels for each language |
| `design/tokens.json` | Colors, cloth colors, fonts, spacing |
| `schemas/` | JSON Schemas for all of the above; `npm run validate` runs before every build |

**Add a page:** add an entry to `pages` with any `path` (nested paths like `about/staff` work) and a list of sections, then link it from `navigation.json`.

**Add a language:** add it to `languages` in `site.json` and add `content/i18n/<code>.json`. Any text field may be a plain string or `{ "en": "...", "ru": "..." }`; a missing language falls back to the default. Set `"dir": "rtl"` for right-to-left languages.

**Photos:** products show drawn placeholders until you set `photos.front` (and optionally `back`, `spine`) to files in `public/`. Never mirror icon photos.

## Copy

The template ships only layout and short neutral placeholder text. It has no explainer, catechesis, how-to or etiquette content. That is the client's own content. To add some, create a page with a `pageHeader` and a `richText` section. The home page `welcome` section is an optional About/Welcome block; set `"enabled": false` to hide it.

## Before going live

- **Payments:** set `commerce.provider` to `stripe` or `authorize-net` and `commerce.checkoutEndpoint` to your server endpoint. See the TODOs in `lib/commerce.ts`. With `none`, checkout runs in demo mode.
- **Forms:** set `forms.endpoint` for the contact, parish order and back-in-stock forms. Without it they run in demo mode.
- **OrthodoxConnect:** set `orthodoxConnect.organizationId`, each event's `orthodoxConnectId` and the newsletter endpoint. The RSVP link format is a TODO in `lib/content.ts`.
- **Accounts and reviews** are placeholders until accounts are connected.

## Checks

```bash
npm run check        # every page, every language, at 360/390/768/1280/1440 px, plus right-to-left
npm run check:fit    # LANGUAGE FIT: every page × language at 360/768/1280; flags text overflow and overlap
npm run screenshots  # desktop and mobile screenshots into screenshots/
```

Both need Chrome (set `CHROME_PATH` if it is not at `/usr/local/bin/google-chrome`).

All crosses come from one component, `components/orthodox/orthodox-cross.tsx`. Fonts and imagery are listed in `SOURCES.md`.
