# Website Improvement TODOs

## Content & blog experience

- [x] **Syntax highlighting for code blocks** — `@11ty/eleventy-plugin-syntaxhighlight` (Prism, build-time, no client JS). Theme: `prism-tomorrow`, vendored in `src/assets/vendor/`.
- [x] **Previous/next post navigation + reading time** — reading time next to the post date, prev/next cards at the bottom of each post (`post.njk`).
- [ ] **Comments via giscus** — backed by GitHub Discussions; no backend, no tracking.

## Reach & SEO

- [x] **JSON-LD structured data** — `Person` schema on the homepage, `BlogPosting` on posts (`base.njk`).
- [ ] **Auto-generated OG images per post** — build-time generator (satori or eleventy-img) compositing the post title, instead of the shared fallback hero image.
- [ ] **Privacy-friendly analytics** — GoatCounter or Plausible; single script tag, GDPR-friendly, no cookie banner needed.

## Polish & correctness

- [ ] **Contact path** — contact section with mailto + social links, or a form via a static-friendly service (e.g. Formspree).
- [ ] **A11y/PWA gaps** — skip-to-content link, `apple-touch-icon` + webmanifest, per-page `lang` override (Impressum/Datenschutz are German but `<html lang="en">` is hardcoded).
- [ ] **Wire certificates and history into Sveltia CMS** — add `src/_data/certificates.json` and `src/_data/history.json` as file collections in `src/admin/config.yml`.
