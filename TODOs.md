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
- [x] **Privacy-friendly analytics (GoatCounter)** — snippet in `base.njk`, config-gated. ⚠️ To activate: create a free account at https://www.goatcounter.com, then set your site code (the `xxx` in `xxx.goatcounter.com`) as `goatcounter` in `src/_data/site.json`. Mention it in the Datenschutzerklärung.

## Polish & correctness

- [x] **Contact section** — "Get in touch" on the homepage with mailto (info@kadirguelec.de, already public on the Impressum) + GitHub, in `sections/contact.njk`.
- [x] **A11y/PWA** — skip-to-content link, `apple-touch-icon` + `icon-192/512` (generated from `logo.svg`), `site.webmanifest`, `theme-color` metas, per-page `lang` (Impressum/Datenschutz now `lang: de`).
- [x] **Certificates and history in Sveltia CMS** — both editable as file collections ("Site Data") in `src/admin/config.yml`. Data files were restructured from a root array to `{ "items": [...] }` for CMS compatibility.

## Ideas for later

- [ ] Square icon version of the aks-Service logo for the history timeline marker (current wordmark reads small in a circle).
- [ ] Related posts by tag on post pages.
- [ ] Webmentions or share buttons, if social reach becomes a goal.
