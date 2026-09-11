# Website Improvement TODOs

## Content & blog experience

- [x] **Syntax highlighting for code blocks** — `@11ty/eleventy-plugin-syntaxhighlight` (Prism, build-time, no client JS). Theme: `prism-tomorrow`, vendored in `src/assets/vendor/`.
- [x] **Previous/next post navigation + reading time** — reading time next to the post date, prev/next cards at the bottom of each post (`post.njk`).
- [x] **Comments via giscus** — implemented in `post.njk`, config-gated. ⚠️ To activate:
  1. Enable **Discussions** on the GitHub repo (Settings → General → Features).
  2. Install the giscus app: https://github.com/apps/giscus
  3. Get `repoId`, `category` (e.g. "Announcements") and `categoryId` from https://giscus.app
  4. Fill them into `src/_data/site.json` under `giscus`. Comments stay hidden until `repoId` is set.

## Reach & SEO

- [x] **JSON-LD structured data** — `Person` schema on the homepage, `BlogPosting` on posts (`base.njk`).
- [x] **Auto-generated OG images per post** — build hook in `.eleventy.js` renders a 1200×630 PNG per post (title on dark card) into `/assets/og/<slug>.png` via sharp. Posts with an `image` in frontmatter keep their own.
- [x] **Local SEO for "Webentwickler Düren"** — homepage title/description rewritten around the target keywords; `Person` JSON-LD extended with `PostalAddress` (52351 Düren), `areaServed`, `knowsAbout`, `knowsLanguage` and `hasCredential` (data lives in `src/_data/site.json`); "Düren" added to the hero chip, hero lede and About copy, plus a NAP `<address>` block in the footer. Impressum is indexable again (Datenschutz stays `noindex`).
- [x] **Sitemap and robots hygiene** — the sitemap now lists HTML output only, so `/feed.xml` and the Sveltia `/admin/` app dropped out (25 → 23 URLs); `robots.txt` disallows `/admin/`.
- [x] **Branded default share card** — `/assets/og/home.png` (1200×630, logo + name + role + Düren) replaces the stock `hero-1.jpg` fallback for every page without its own image, and `/assets/og/logo.png` (1024×1024) backs the `Person` schema's `image`. Both are generated in the `eleventy.after` hook from `logo.svg`, whose fill is forced white because a rasteriser never evaluates its `prefers-color-scheme` rule.
- [x] **Privacy-friendly analytics (GoatCounter)** — snippet in `base.njk`, config-gated. ⚠️ To activate: create a free account at https://www.goatcounter.com, then set your site code (the `xxx` in `xxx.goatcounter.com`) as `goatcounter` in `src/_data/site.json`. Mention it in the Datenschutzerklärung.

## Polish & correctness

- [x] **Contact section** — "Get in touch" on the homepage with mailto (info@kadirguelec.de, already public on the Impressum) + GitHub, in `sections/contact.njk`.
- [x] **A11y/PWA** — skip-to-content link, `apple-touch-icon` + `icon-192/512` (generated from `logo.svg`), `site.webmanifest`, `theme-color` metas, per-page `lang` (Impressum/Datenschutz now `lang: de`).
- [x] **Dark-only redesign from the Claude Design project** — new palette (`#101418` / accent `#f0801f`), Space Grotesk + IBM Plex Sans/Mono self-hosted in `src/assets/fonts/`, design tokens in `src/css/style.css`. The light/dark switcher is gone; the site is dark-only.
- [x] **EN/DE language switch** — both variants ship in the HTML, `html[data-lang]` reveals one (`src/_includes/partials/i18n.njk`). Choice persists in `localStorage` under `site-lang`, and `?lang=de` forces it for shareable links. Posts declare `docLang: en|de`; `/blog/` groups them so a reader only sees posts in their language. German posts live under `/de/posts/<slug>/` so a translation can keep its original title without colliding with the English permalink.
- [x] **Projects, skills, certificates and history in Sveltia CMS** — both editable as file collections ("Site Data") in `src/admin/config.yml`. Data files were restructured from a root array to `{ "items": [...] }` for CMS compatibility.

## Open

- [ ] **QR Invites screenshot** — the design project's `assets/invite-card.png` exceeded the 256 KiB import limit and came back truncated, so it was not committed. Upload it via the CMS (Site Data → Projects → QR Invites → Screenshot); until then the card shows a "Screenshot coming soon" placeholder.

## Open — SEO follow-ups

- [ ] **German landing pages + `hreflang`** — there is no `/de/` homepage or `/de/blog/`, and no `hreflang` anywhere, so the EN/DE post pairs are not linked as translations. The homepage ships both languages in one `lang="en"` document with CSS hiding one, which dilutes relevance for both.
- [ ] **Canonical host redirect** — `src/.htaccess` only sets `ErrorDocument`; no www→non-www or http→https rule.
- [ ] **A German page about the work itself** — the blog is all English technical/career writing, so nothing targets a local service intent.

## Ideas for later

- [ ] Square icon version of the aks-Service logo for the history timeline marker (current wordmark reads small in a circle).
- [ ] Related posts by tag on post pages.
- [ ] Webmentions or share buttons, if social reach becomes a goal.
