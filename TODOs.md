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
- [x] **Site name and favicon in Google** — results showed "guelec.eu" and a generic globe. The homepage now carries `WebSite` JSON-LD (`name`: Kadir Gülec), and `/assets/favicon-192.png` (white mark on `#101418`, rendered from `logo.svg`) sits next to the SVG icon, because Google's favicon docs do not list SVG.
- [x] **hreflang for EN/DE pairs** — posts and project pages link their translation via `<link rel="alternate" hreflang>` (+ `x-default` → English), `og:locale`, and a visible "Auf Deutsch lesen / Read in English" link. Pairs match on `translationKey`, else the project slug, else the filename without `-de`/`-en` (filter `translations` in `.eleventy.js`). The CMS names new files after the title, so new pairs need the "Translation key" field set on both versions.
- [x] **One `<h1>` per post** — eight posts opened with a `# Heading` under the layout's title `<h1>`; the `demoteH1` filter renders body h1s as h2 in `post.njk`/`project.njk`.
- [x] **SEO audit fixes (2026-10-12)** — meta descriptions of eight posts rewritten to ~150 characters (were 53–80); `/blog/` title now names its topics; `noindex` pages (Datenschutz) dropped out of the sitemap; SVG featured images (Coursera) fall back to the generated card for `og:image`, since social platforms do not render SVG; footer "Updated" line now meets WCAG contrast. Lighthouse: performance 100, SEO 100, best practices 100.
- [x] **Branded default share card** — `/assets/og/home.png` (1200×630, logo + name + role + Düren) replaces the stock `hero-1.jpg` fallback for every page without its own image, and `/assets/og/logo.png` (1024×1024) backs the `Person` schema's `image`. Both are generated in the `eleventy.after` hook from `logo.svg`, whose fill is forced white because a rasteriser never evaluates its `prefers-color-scheme` rule.
- [x] **Privacy-friendly analytics (GoatCounter)** — snippet in `base.njk`, config-gated. ⚠️ To activate: create a free account at https://www.goatcounter.com, then set your site code (the `xxx` in `xxx.goatcounter.com`) as `goatcounter` in `src/_data/site.json`. Mention it in the Datenschutzerklärung.

## Polish & correctness

- [x] **Contact section** — "Get in touch" on the homepage with mailto (info@kadirguelec.de, already public on the Impressum) + GitHub, in `sections/contact.njk`.
- [x] **A11y/PWA** — skip-to-content link, `apple-touch-icon` + `icon-192/512` (generated from `logo.svg`), `site.webmanifest`, `theme-color` metas, per-page `lang` (Impressum/Datenschutz now `lang: de`).
- [x] **Dark-only redesign from the Claude Design project** — new palette (`#101418` / accent `#f0801f`), Space Grotesk + IBM Plex Sans/Mono self-hosted in `src/assets/fonts/`, design tokens in `src/css/style.css`. The light/dark switcher is gone; the site is dark-only.
- [x] **EN/DE language switch** — every page that has a language (`docLang`) renders only that language (`src/_includes/partials/i18n.njk`, imported `with context`), and the header switch links to the same page in the other language. Posts declare `docLang: en|de`; German posts live under `/de/posts/<slug>/` so a translation can keep its original title without colliding with the English permalink. Tag pages and the 404 page are shared by both languages, so they still ship both variants and toggle them in place via `html[data-lang]`, remembering the choice in `localStorage` under `site-lang`.
- [x] **Optional detail pages for projects** — a project can have a long-form write-up at `/projects/<slug>/` (and `/de/projects/<slug>/`) for work that cannot be handed out as a live demo. Set "Detail page slug" on the project, then add the page under **Project Pages** in the CMS; the card links to it only once the page is published. Projects without one are unchanged.
- [x] **Projects, skills, certificates and history in Sveltia CMS** — both editable as file collections ("Site Data") in `src/admin/config.yml`. Data files were restructured from a root array to `{ "items": [...] }` for CMS compatibility.
- [x] **Article styles actually apply** — the `.prose-site` overrides sat in `@layer components`, but the typography plugin emits `.prose` in `@layer utilities`, and a later layer wins regardless of specificity. So the site palette never reached articles: links and inline code were white, inline code bold and wrapped in backticks. Moved to `@layer utilities` (`src/css/style.css`).
- [x] **One language per search excerpt** — Pagefind indexed both variants of every bilingual string, so excerpts read "5 min readLesezeit" or "…under control.Ich baue…". A transform in `.eleventy.js` marks the variant that does not match `<html lang>` with `data-pagefind-ignore`. (`exclude_selectors` cannot do it: it only matches inside the indexed body.) Since the German landing pages exist, only tag pages and the 404 still carry both variants.
- [x] **Consistent years in public service** — the hero said eleven years, the About section and the timeline seven (2009–2016). The hero now says seven too.
- [x] **German landing pages** — `/de/`, `/de/blog/` and `/de/certificates/` are built from the same templates as their English pages (pagination over `locales: [en, de]` with `alias: docLang`), each in one language, paired with `hreflang` and listed in the sitemap. Internal links stay in the page's language through the `localeUrl` filter in `.eleventy.js`. Old `?lang=de` / `?lang=en` links 301 to the matching URL (`src/.htaccess`). The homepage title and description now match its language (English on `/`, German on `/de/`).

## Open

- [ ] **QR Invites screenshot** — the design project's `assets/invite-card.png` exceeded the 256 KiB import limit and came back truncated, so it was not committed. Upload it via the CMS (Site Data → Projects → QR Invites → Screenshot); until then the card shows a "Screenshot coming soon" placeholder.

## Open — SEO

Details and sources for every item: `SEO-RESEARCH.md` (numbers refer to its prioritized summary).

1. [ ] **Merge `seo/german-landing-pages` into `master`** — that triggers the deploy. Then check on the live site:
   - `curl -sI "https://kadir.guelec.eu/?lang=de"` → `301` to `/de/` (the rules in `src/.htaccess` were tested on a local Apache only; HestiaCP puts nginx in front).
   - `curl -sI https://kadir.guelec.eu/admin/` → `X-Robots-Tag: noindex, nofollow` (needs Apache's `mod_headers`; nginx may serve `.yml`/`.js` under `/admin/` without it, which is fine because the page itself is noindex).
   - `/de/`, `/de/blog/`, `/de/certificates/` and `/de/feed.xml` answer 200; `/a0a9e5610cddefa8bc72f936ae819f70.txt` shows the IndexNow key.
   - The "📣 Notify IndexNow" step in the Actions log: the first run submits every page (HTTP 200 or 202).
2. [ ] **Search Console + Bing Webmaster Tools (#7)** — submit `/sitemap.xml` (and `/feed.xml`, `/de/feed.xml`), file a Change of Address for `kadirguelec.de` and `www.kadirguelec.de`, then watch the Page indexing report for the new `/de/` URLs. Leave the "Search generative AI" control on *Include*. In Bing, import the site from Search Console.
3. [ ] **Impressum address** — § 5 DDG asks for a *ladungsfähige Anschrift*; the Impressum lists only "52351 Düren". Add a street address (or a service address) — a legal question, not an SEO one.
4. [ ] **A German page about the work itself** — nothing targets a local service intent ("Webentwickler Düren" only matches the homepage). Needs the content first: what is offered, to whom, and whether freelance work is possible next to the job.
5. [ ] **Optional: `/about/` page as `ProfilePage`** (#11) — the byline and the `BlogPosting` author currently point at the homepage's About section. A dedicated page marked up as `ProfilePage` is what Google's docs describe; worth it only together with real content.

### Done on `seo/german-landing-pages`

- [x] German URLs for the homepage, blog and certificates; one language per page; hreflang; `?lang=` redirects (#1–#3).
- [x] Lead image on `/blog/` loads eagerly with `fetchpriority="high"` (#4).
- [x] Post URLs frozen: `urlSlug` in every post, fallback to the filename, field in the CMS (#8).
- [x] Variable fonts declared once per subset: 5 font files on the homepage instead of 10 (#5).
- [x] Byline with labelled Published/Updated dates; optional `updated` field (CMS + front matter); no build-time footer stamp; truthful sitemap `lastmod`, no `changefreq`/`priority` (#6, #9).
- [x] IndexNow after each deploy: `scripts/indexnow.mjs`, key in `site.json`, steps in `deploy.yml` (#10).
- [x] `/admin/` no longer disallowed, `X-Robots-Tag` from `.htaccess`; no `/tags/featured/` (#14, #15).
- [x] RSS split into `/feed.xml` (en) and `/de/feed.xml` (de) (#12).
- [x] JSON-LD: `dateModified`, author `@id`, image list, all certificates as `hasCredential` (#11).
- [x] `og:image:alt`/`twitter:image:alt` everywhere, real alt texts, `max-image-preview:large`, share image 4.2 MB → 405 KB (#13).
- [x] Impressum cites § 5 DDG and Art. 8 DSA instead of the TMG.
- [x] Header and footer links follow the chosen language on tag pages and the 404.
- [x] "How I Built This Static Blog" describes the current HestiaCP/rsync setup (both languages).
- [x] **HTTP → HTTPS redirect** — `http://kadir.guelec.eu/…` answers 301 to HTTPS (checked with `curl -sI` on 2026-10-16).

## Ideas for later

- [ ] Square icon version of the aks-Service logo for the history timeline marker (current wordmark reads small in a circle).
- [ ] Related posts by tag on post pages.
- [ ] Webmentions or share buttons, if social reach becomes a goal.
