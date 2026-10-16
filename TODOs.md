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

## Open — SEO follow-ups

- [x] **HTTP → HTTPS redirect** — `http://kadir.guelec.eu/…` answers 301 to HTTPS (checked with `curl -sI` on 2026-10-16).
- [ ] **Outdated "How I Built This Static Blog" post** — still describes Hetzner webhosting and an FTP deploy; the site now deploys to HestiaCP via rsync.
- [ ] **4 MB share image** — `assets/images/posts/ai-assisted-engineering.jpg` is the `og:image` of both AI posts; shrinking it to ~1200 px wide would keep it well under the platforms' 5 MB limits.
- [ ] **A German page about the work itself** — the blog is all English technical/career writing, so nothing targets a local service intent.

## Next steps — SEO plan

Ordered work list from `SEO-RESEARCH.md` (the numbers refer to its prioritized summary; each section there has the sources and file:line details). #1–#3 are done on branch `seo/german-landing-pages`.

1. [ ] **Merge `seo/german-landing-pages` into `master`** — that triggers the deploy. Then check on the live site:
   - `curl -sI "https://kadir.guelec.eu/?lang=de"` → `301` to `/de/` (the rule in `src/.htaccess` was only tested on a local Apache; HestiaCP puts nginx in front).
   - `/de/`, `/de/blog/`, `/de/certificates/` answer 200 and are in `/sitemap.xml`.
2. [ ] **Search Console + Bing Webmaster Tools (#7)** — submit `/sitemap.xml` (and `/feed.xml`), file a Change of Address for `kadirguelec.de` and `www.kadirguelec.de`, then watch the Page indexing report for the new `/de/` URLs. Leave the "Search generative AI" control on *Include*.
3. [ ] **Eager LCP image on `/blog/` (#4)** — the lead image is the LCP element but gets `loading="lazy"` from `imageShortcode` (`.eleventy.js:32`). Give the shortcode an option for `loading="eager"` + `fetchpriority="high"` and use it for the lead image in `src/blog.njk`. Pages are single-language now, so no hidden duplicate image downloads.
4. [ ] **Freeze post URLs (#8)** — permalinks come from `title | slugify` (`src/posts/posts.json:5`), so renaming a post in the CMS moves its URL and the old one 404s. Use a fixed `slug` front-matter field (fallback: the file slug) and set it on every existing post so no URL changes.
5. [ ] **Duplicate font files (#5)** — several weights in `src/assets/fonts/` are byte-identical copies (~156 KB wasted on the homepage). Check first whether they are variable fonts (`fonttools ttx -t fvar`), then collapse to one `@font-face` per family with a weight range (`src/assets/fonts/fonts.css:34-150`, preloads in `base.njk`).
6. [ ] **Byline and real dates (#6, #9)** — visible author byline linked to the about section, an optional `updated` front-matter field shown on posts and used for `dateModified` and sitemap `<lastmod>`. Drop the per-build "Updated <timestamp>" from `footer.njk` and the build-time `lastmod` for aggregate pages; remove `changefreq`/`priority` from `src/sitemap.xml.njk` (ignored by Google and Bing).
7. [ ] **IndexNow after deploy (#10)** — post-rsync step in `.github/workflows/deploy.yml` that submits only changed URLs; sketch and key-file setup are in section 6 of `SEO-RESEARCH.md`. Reaches Bing/Yandex/Seznam, not Google.
8. [ ] **Small fixes (#14, #15)** — `/admin/` is both `Disallow`ed (`src/robots.njk:7`) and `noindex`, so Google never sees the noindex: drop the Disallow or send `X-Robots-Tag` from `src/.htaccess`. Add `featured` to the pagination filter in `src/tags.njk` so `/tags/featured/` is no longer built.
9. [ ] **RSS per language (#12)** — `/feed.xml` says `<language>en</language>` but carries German posts too. Split into `/feed.xml` (en) and `/de/feed.xml` (de), each linked from its language's pages.
10. [ ] **JSON-LD gaps (#11)** — `dateModified`, author `@id`/`url`, `image` array on `BlogPosting`; certificates as `hasCredential[]` (schema.org only, no Google rich result).
11. [ ] **Images and share cards (#13)** — `max-image-preview:large`, `og:image:alt`/`twitter:image:alt`; 13 posts have `imageAlt: ''` and 3 have none. Together with the 4 MB share image above.
12. [ ] **Impressum** — still cites "§ 5 TMG"; the DDG replaced the TMG in 2024 (§ 5 DDG).
13. [ ] **Header links on tag pages and the 404** — these pages are shared by both languages and toggle in place; their header nav always links to the English pages, even after switching to German. Low priority: tag pages are noindex and the 404 is never indexed.

## Ideas for later

- [ ] Square icon version of the aks-Service logo for the history timeline marker (current wordmark reads small in a circle).
- [ ] Related posts by tag on post pages.
- [ ] Webmentions or share buttons, if social reach becomes a goal.
