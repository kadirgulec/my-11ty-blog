# SEO research: kadir.guelec.eu

**Date:** 2026-10-16 · **Scope:** a read-only audit of this repository (Eleventy 3, bilingual EN/DE, deployed by GitHub Actions and rsync to HestiaCP) and of what `https://kadir.guelec.eu` actually serves, checked against primary sources only: Google Search Central, web.dev, developer.chrome.com, schema.org, ogp.me, X/Twitter developer docs, Bing Webmaster docs and blog, indexnow.org, Google Business Profile Help, the Eleventy docs, the Pagefind docs and the Sveltia CMS docs. The basics already listed as done under "Reach & SEO" in `TODOs.md` are only audited for gaps here, not explained again. Every claim links its source. Anything I could not verify is marked as unverified. File and line references were checked against the working tree at commit `fbdc90d`. Live behaviour was checked with `curl` and headless Chrome on 2026-10-16.

---

## Prioritized summary

Ordered by impact first, then by effort (cheapest first).

| # | Impact | Effort | Recommendation | Where |
|---|---|---|---|---|
| 1 | High | S | **The homepage's title and description are German, but Google sees English content.** Googlebot keeps no `localStorage`, so it always renders `data-lang="en"`, and the German strings stay `display:none`. Google determines a page's language from its *visible* content, and rewrites title links when the title's language doesn't match it. In the short term, pick one language for `/` (title, description and default visible text must agree). | `src/index.njk:3-4`, `src/_includes/base.njk:189` |
| 2 | High | L | **Give the German version its own URLs: `/de/` (homepage) and `/de/blog/`**, render them in one language on the server, pair them with hreflang, and turn the EN/DE switch into `<a href>` links. Google recommends separate URLs per language and advises against both cookie/JS-based switching and `?lang=` parameters. | `src/index.njk`, `src/blog.njk`, `src/_includes/base.njk:2,36-49,183-194`, `src/_includes/partials/i18n.njk:21-24`, `src/_includes/header.njk:55-58` |
| 3 | Med | S | **German posts and project pages show English navigation** to first-time visitors and to Googlebot, because the language script falls back to `'en'` regardless of `<html lang>`. Google asks for "a single language for content and navigation on each page". Default to the document's own language. | `src/_includes/base.njk:189` (and `:2`) |
| 4 | Med | S | **The LCP image on `/blog/` is lazy-loaded** (measured: the lead `<img loading="lazy">` is the LCP element on mobile and desktop). Load the English lead image eagerly with `fetchpriority="high"`. | `.eleventy.js:28-34`, `src/blog.njk:70` |
| 5 | Med | S | **The same font is downloaded several times.** Each family is one file copied under several weight names (identical md5 hashes). The homepage fetches 10 font files, of which 5 are byte-identical duplicates (about 156 KB wasted). Collapse to one `@font-face` per family and subset, with a weight range. | `src/assets/fonts/fonts.css:34-150`, `src/_includes/base.njk:202-203` |
| 6 | Med | S | **Add a visible author byline (linked to an author/about page) and a "last updated" date on posts. Remove the per-build "Updated <timestamp>" from page footers.** It competes with the real dates and changes every page on every build. | `src/_includes/post.njk:20-32`, `src/_includes/footer.njk:23-25` |
| 7 | Med | S | **Set up Search Console and Bing Webmaster Tools properly:** submit the sitemap (and the feed), file a Change of Address for every `kadirguelec.de` variant, watch the Page indexing report, and leave the new "Search generative AI" control on *Include*. | (ops, no code) |
| 8 | Med | S | **Freeze post URLs.** Post permalinks are derived from `title \| slugify`, so editing a title in the CMS silently moves the URL (old URL returns 404, signals are lost). | `src/posts/posts.json:5` |
| 9 | Med | M | **Make sitemap `lastmod` truthful:** an `updated` front-matter field for posts, no build-time `lastmod` for aggregate pages. Drop `changefreq`/`priority`, which Google and Bing both ignore. | `src/sitemap.xml.njk:21-23` |
| 10 | Med | M | **Add an IndexNow step after rsync** that submits only changed, new or deleted URLs (reaches Bing, Yandex, Seznam, Naver, Yep and others, but **not Google**). A concrete sketch is in section 6. | `.github/workflows/deploy.yml` after `:48` |
| 11 | Low | S | **Fill the JSON-LD gaps:** `dateModified`, author `@id` and `url` pointing to a profile page, an `image` array, and `ProfilePage` on the profile page. Certificates go in `hasCredential[]` (schema.org only; Google has no rich result for them). | `src/_includes/base.njk:87-166` |
| 12 | Low | S | **Split the RSS feed per language.** `/feed.xml` declares `<language>en</language>` but half its items are German duplicates. | `.eleventy.js:216-233` |
| 13 | Low | S | Add `max-image-preview:large` and `og:image:alt`/`twitter:image:alt`. 13 post files set `imageAlt: ''` and 3 omit it. Shrink the 4.18 MB share JPEG (already a TODO). | `src/_includes/base.njk:55-74`, `src/posts/*.md` |
| 14 | Low | S | `/admin/` is both `Disallow`ed and `noindex`. The Disallow stops Google from ever seeing the noindex. Drop the Disallow, or add an `X-Robots-Tag` header. | `src/robots.njk:7`, `src/.htaccess` |
| 15 | Low | S | The tag pagination filter misses the internal `featured` tag, so `/tags/featured/` is generated (200, noindex). | `src/tags.njk:5-11` |
| 16 | Low | S | Housekeeping: `TODOs.md` says HTTP→HTTPS is still open, but `http://kadir.guelec.eu/…` already answers **301** to HTTPS. | `TODOs.md` ("Open — SEO follow-ups") |

---

## 1. Bilingual setup

### What the sources say

- **Language detection uses visible content only.** "Google uses the visible content of your page to determine its language. We don't use any code-level language information such as `lang` attributes, or the URL." ([Managing multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)). The hreflang page repeats it: "Google doesn't use `hreflang` or the HTML `lang` attribute to detect the language of a page" ([Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)).
- **Separate URLs per language are recommended.** Google recommends "using different URLs for each language version of a page rather than using cookies or browser settings to adjust the content language on the page". In the URL-structure table, a parameter such as `site.com?loc=de` is "Not recommended". The same page recommends "using a single language for content and navigation on each page, and avoiding side-by-side translations", and says to avoid automatic redirects by perceived language ([multi-regional](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)).
- **Googlebot has no memory between page loads.** The Web Rendering Service "does not retain state across page loads: Local Storage and Session Storage data are cleared across page loads. HTTP Cookies are cleared across page loads." ([Fix Search-related JavaScript problems](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript)). So a stored `site-lang` can never apply to Googlebot.
- **Content hidden by CSS is not spam in itself.** The spam policy lists "Accordion or tabbed content that toggle between hiding and showing additional content" as not violating policy ([Spam policies, hidden text and link abuse](https://developers.google.com/search/docs/essentials/spam-policies)). The problem with hiding one language is relevance and language detection, not a penalty.
- **hreflang mechanics.** "Each language version must list itself as well as all other language versions." URLs must be fully qualified. "If two pages don't both point to each other, the tags will be ignored." `x-default` is the fallback for unmatched languages. HTML tags, HTTP headers and sitemaps "are equivalent from Google's perspective" ([Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)). Translated pages "are only considered duplicates if the main content of the page remains untranslated" (same page).
- **Canonical and hreflang.** "Specify a canonical page in the same language", and Google "prefers URLs that are part of hreflang clusters" when it picks canonicals ([Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)).
- **Titles must match the content's language.** "Use the same language and writing system … as the page's primary content". A "language or script mismatch" is one of the listed cases where Google rewrites the title link ([Title links](https://developers.google.com/search/docs/appearance/title-link)).
- **Bing is older and different.** A 2011 Bing post says Bing reads the `content-language` meta tag or `<html lang>` and advises keeping title, description and body in one language ([Bing, 2011](https://blogs.bing.com/webmaster/March-2011-(1)/How-To-Tell-Bing-Your-Website-s-Country-and-Langua/)). This is dated; I found no current Bing doc on the subject (unverified for 2026).
- **Eleventy's own guidance** recommends one folder per locale (`/en/`, `/de/`) and offers an i18n plugin with `locale_url`/`locale_links` ([11ty i18n](https://www.11ty.dev/docs/i18n/), [i18n plugin](https://www.11ty.dev/docs/plugins/i18n/)).

### Current state

- **Posts and project pages match the guidance.** Live check of `/posts/ai-assisted-engineering/` and `/de/posts/ki-gestuetzte-entwicklung/`: each lists `de`, `en` and `x-default`→EN with absolute HTTPS URLs, self-reference included, reciprocal. Each has a self-canonical and the correct `<html lang>` (`base.njk:29,36-49`). The same holds for `/projects/comon/` ↔ `/de/projects/comon/`. No gap found against the hreflang rules.
- **The homepage, `/blog/` and `/certificates/` are one URL carrying two languages.** `base.njk:2` renders `<html lang="en" data-lang="en">`. The script at `base.njk:183-194` switches `data-lang`, and `style.css:87-91` hides the other language with `display:none`. Googlebot keeps no `localStorage`, so it only ever sees English.
  - The homepage `<title>` and meta description are German (`index.njk:3-4`, live: "Kadir Gülec — Webentwickler & Software Developer in Düren"), while the visible H1 is "I build web apps that keep the boring stuff under control." (`hero.njk:30-35`).
  - `og:locale` is `en_US`, and the Person JSON-LD `description` is German.
  - This is exactly the title-link "language mismatch" case, and German queries like "Webentwickler Düren" can only match hidden text plus the title.
- **German pages show English navigation.** `base.njk:189`, `var lang = choice === 'de' || choice === 'en' ? choice : 'en';`, falls back to English even when `<html lang="de">`. On `/de/posts/…`, Googlebot and every first-time visitor see German body text with English chrome ("All posts", "Previous", nav, footer). That is mixed-language navigation.
- **`?lang=de`** only exists as a client-side switch. The served HTML is identical (same ETag as `/`) and the canonical points to `/`. Nothing on the site links to it (grep finds no `?lang=` link). If someone shares it, Google would render German content whose canonical is the English URL, a cross-language canonical that the guidance above says to avoid. The risk is low while nothing links to it.

### Recommendation

1. **Quick fix (S): make `/` consistent today.** Either write the homepage title and description in English to match the default visible text, or make German the server-side default on `/` (`data-lang="de"` in `base.njk:2` for the homepage) if local German clients are the main audience. Don't leave a German title over English content.
2. **Fix the German chrome (S).** Let a language-specific page default to its own language:
   ```js
   // base.njk:189
   var docLang = document.documentElement.lang === 'de' ? 'de' : 'en';
   var lang = choice === 'de' || choice === 'en' ? choice : docLang;
   ```
   Better still, on pages that have a `docLang` translation pair (posts, projects), render `data-lang="{{ pageLang }}"` on the server and let the URL, not the stored preference, decide the chrome language. A stored "en" on a `/de/` URL would otherwise reintroduce the mix.
3. **Proper fix (L): `/de/` and `/de/blog/`** (this is the open TODO "German landing pages"):
   - Paginate `index.njk` and `blog.njk` over `["en","de"]`, with permalinks `/` and `/de/` (and `/blog/`, `/de/blog/`).
   - Render **only** the page's language on the server. The `i18n.t` macro currently emits both spans. Nunjucks macros don't see the page context unless imported `with context` (`{% import "partials/i18n.njk" as i18n with context %}`), so they need that, or an explicit `lang` argument, to choose one variant.
   - Extend the hreflang `versions` logic (`base.njk:37-43`) to the home and blog pairs, with `x-default` → `/`.
   - Replace the `<button data-set-lang>` switch (`header.njk:55-58`) with `<a href="/de/…" hreflang="de">` links. Google only follows `<a href>` ([Link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)).
   - Side benefit: Pagefind indexes per `<html lang>` ([Pagefind multilingual](https://pagefind.app/docs/multilingual)), so the German homepage becomes searchable again. That undoes the trade-off noted in `TODOs.md`.
   - Don't auto-redirect by browser language (guidance above). A banner that suggests the other language is fine.

---

## 2. Core Web Vitals, fonts, images

### What the sources say

- **Metrics and thresholds:** LCP ≤ 2.5 s, INP < 200 ms, CLS < 0.1 ([Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)). Target "at least 75% of page visits" ([web.dev, Optimize LCP](https://web.dev/articles/optimize-lcp)).
- **How much they weigh:** "Core Web Vitals are used by our ranking systems", but "There is no single signal". Good scores don't guarantee top rankings, and "Google Search always seeks to show the most relevant content, even if the page experience is sub-par" ([Page experience](https://developers.google.com/search/docs/appearance/page-experience)).
- **Field data, not lab:** the Search Console CWV report "comes from the CrUX report", which is real-user data. URL groups without enough data are omitted, and Lighthouse is only an external testing tool ([CWV report help](https://support.google.com/webmasters/answer/9205520)). CrUX only includes origins and pages that are "sufficiently popular", with an undisclosed minimum visitor count, and only opted-in Chrome users ([CrUX methodology](https://developer.chrome.com/docs/crux/methodology)). A low-traffic site will very likely show "not enough data". So the Lighthouse 100s are lab results, not ranking inputs.
- **LCP image:** "Never lazy-load your LCP image". Set `fetchpriority="high"` on the likely LCP `<img>`. The LCP resource must be discoverable in the HTML source ([Optimize LCP](https://web.dev/articles/optimize-lcp)). Lazy images hidden with `display:none` are not fetched. Add `width`/`height` to all images ([Browser-level lazy loading](https://web.dev/articles/browser-level-image-lazy-loading)).
- **Fonts:**
  - Preload only the most important fonts; "preload ignores unicode-range".
  - `font-display: optional` avoids swap-related layout shift, and `swap` needs early delivery.
  - "A single variable font can be used as a replacement for multiple font files".
  - `size-adjust` reduces the CLS of font swaps.
  - Inline the `@font-face` declarations.
  
  All from [web.dev, Font best practices](https://web.dev/articles/font-best-practices).

### Current state (measured with headless Chrome against the live site)

| Page / viewport | LCP element | Notes |
|---|---|---|
| `/` 412×915 | `<p>` hero lede (text) | 10 font files requested |
| `/` 1366×768 | `<h1>` (text) | 10 font files |
| `/blog/` 412×915 | **`<img loading="lazy">` `pest-playwright-orphaned-server-900w.avif`** | lazy LCP image |
| `/blog/` 1366×768 | **`<img loading="lazy">` `…-1200w.avif`** | lazy LCP image |
| `/de/posts/ki-gestuetzte-entwicklung/` 412×915 | `<p>` (text) | 7 font files |

- **Lazy LCP on `/blog/`.** `.eleventy.js:28-34` hard-codes `loading: "lazy"` for every `{% image %}`. On mobile the lead card's image sits first (`blog.njk:40-41,69-71`), so it is in the first viewport.
- **Duplicate font downloads (real bug).** `md5sum` shows that `space-grotesk-{400,500,600,700}-latin.woff2` are one identical file, and so are `ibm-plex-sans-{400,500,600}-latin.woff2` and the latin-ext pairs. These are almost certainly variable fonts that the Google Fonts download saved once per weight. I did not inspect the `fvar` table (fontTools isn't installed), so verify before collapsing. `fonts.css:34-150` maps each weight to its own URL. Browsers cache by URL, so the homepage downloads Space Grotesk 4 times (~22 KB each) and Plex Sans 3 times (~45 KB each), about **156 KB of duplicate font bytes**.
- `font-display: swap` is set everywhere (`fonts.css`). `unicode-range` subsetting is in place. Two preloads (`base.njk:202-203`) match the first-paint faces. No `size-adjust` fallback is defined.
- eleventy-img outputs AVIF, WebP and JPEG at 300–2000 px, with `width`/`height` and `sizes` (`.eleventy.js:15-37`). Good. Post pages render no featured `<img>` at all (`post.njk`), so their LCP is text.
- **Field data could not be verified.** The PageSpeed Insights API returned "Quota exceeded", so I couldn't check whether CrUX has data for this origin.

### Recommendation

- **Lazy LCP.** Add a `loading` parameter to the shortcode and use it for the lead image. Only the **English** lead should be eager: the German lead sits in a `display:none` block, and an eager `<img>` downloads even when hidden.
  ```js
  // .eleventy.js:15 — add a 5th param
  async function imageShortcode(src, alt, cls = "", sizes = "…", eager = false) {
    …
    let imageAttributes = { alt, sizes, class: cls,
      loading: eager ? "eager" : "lazy",
      decoding: "async",
      ...(eager && { fetchpriority: "high" }) };
  ```
  ```njk
  {# blog.njk:70 #}
  {% image "src" + …, …, "h-full w-full object-cover", "(max-width: 768px) 100vw, 560px", locale == "en" %}
  ```
  Once `/de/blog/` exists (section 1), each page has exactly one lead image and this caveat goes away.
- **Duplicate fonts.** Keep one file per family and subset, and declare a weight range:
  ```css
  @font-face {
    font-family: 'Space Grotesk';
    font-style: normal;
    font-weight: 400 700;          /* variable range */
    font-display: swap;
    src: url(/assets/fonts/space-grotesk-latin.woff2) format('woff2');
    unicode-range: U+0000-00FF, …;
  }
  ```
  Then point the preloads at the renamed files. **Gotcha:** if a file turns out to be static (no `wght` axis), the browser will synthesise bold, so check with `fonttools ttx -t fvar` first.
- **Optional:** a metric-matched fallback (`@font-face { font-family: "Space Grotesk Fallback"; src: local("Arial"); size-adjust: …; }`) to remove the remaining swap shift. Lighthouse already reports a CLS of 0, so this is cosmetic.
- **Measure field data yourself.** Expect "not enough data" in Search Console. Treat Lighthouse as a regression check, not a ranking score.

---

## 3. Structured data (projects, certificates, existing JSON-LD)

### What the sources say

- **Google supports these rich-result types today** (search gallery, fetched 2026-10-16): Article, Breadcrumb, Carousel, Course list, Dataset, Discussion forum, Education Q&A, Employer aggregate rating, Event, Image metadata, Job posting, Local business, Math solver, Movie, Organization, Product, Profile page, Q&A, Recipe, Review snippet, Software app, Speakable, Subscription/paywalled, Vacation rental, Video ([Search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)).
- **Recent removals.** In June 2025 Google phased out Book Actions, Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement and Vehicle Listing, noting "This update won't affect how pages are ranked" ([blog, 2025-06](https://developers.google.com/search/blog/2025/06/simplifying-search-results)). In November 2025 it phased out Practice problem and limited Dataset to Dataset Search ([docs changelog](https://developers.google.com/search/updates), [blog, 2025-11](https://developers.google.com/search/blog/2025/11/update-on-our-efforts)). On 2026-05-07 it dropped FAQ rich results, and their docs were removed in June 2026 ([changelog](https://developers.google.com/search/updates)). Sitelinks search box, HowTo and FAQ are gone.
- **Article/BlogPosting.** "There are no required properties." Recommended are `author` (with `type` and `url`/`sameAs`), `dateModified`, `datePublished` (with timezone), `headline` and `image`. For images, Google recommends multiple images of at least 50K pixels in 16x9, 4x3 and 1x1, and "Images must represent the marked up content". For `author.url`: "If the URL is an internal profile page, we recommend marking up that author using profile page structured data" ([Article](https://developers.google.com/search/docs/appearance/structured-data/article)).
- **ProfilePage.** Requires `mainEntity` (a Person or Organization) and its `name`. "The primary focus of the page must be a single person or organization that is affiliated with the overall website". Author pages are a valid example, and "the main home page of a store" is an invalid one ([Profile page](https://developers.google.com/search/docs/appearance/structured-data/profile-page)).
- **Software app** requires `name`, `offers.price` **and** `aggregateRating` or `review` ([Software app](https://developers.google.com/search/docs/appearance/structured-data/software-app)). A portfolio project without real ratings is not eligible.
- **Breadcrumb** rich results are available "on desktop" only ([Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)).
- **Organization/LocalBusiness:** see section 4.
- **Schema.org-only types:** schema.org defines [`EducationalOccupationalCredential`](https://schema.org/EducationalOccupationalCredential), [`hasCredential`](https://schema.org/hasCredential), [`SoftwareSourceCode`](https://schema.org/SoftwareSourceCode) and `CreativeWork`. **None of them produce a Google rich result.** They only help disambiguation.
- **Not required for AI features.** "Structured data isn't required for generative AI search, and there's no special schema.org markup you need to add" ([AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).
- **Preferred image.** Google picks thumbnails from `primaryImageOfPage`/`image` or `og:image`. It advises to "Avoid using a generic image (for example, your site logo) or an image with text" ([Image SEO, preferred image](https://developers.google.com/search/docs/appearance/google-images)).

### Current state

- **Homepage** (`base.njk:76-129`): `WebSite` plus `Person` (`@id …/#person`, address, `areaServed`, `knowsAbout`, a single `hasCredential`, `sameAs` GitHub). `Person.url` is `https://kadir.guelec.eu` without the trailing slash, while `WebSite.url` has one (cosmetic). `Person.image` is the logo, not a photo.
- **Posts** (`base.njk:131-148`): `BlogPosting` with `headline`, `description`, `url`, a single `image` URL, `datePublished` (`2026-03-01T00:00:00.000Z`), `inLanguage`, `author{Person,name,url}` and `mainEntityOfPage`. Gaps:
  - No `dateModified`.
  - The author isn't linked to the `#person` node.
  - `author.url` is the homepage rather than a profile page.
  - `image` is one URL. The generated cards are 1200×630 (≈1.9:1), with text on them.
  - The post page itself never shows the featured image (`post.njk` has no `<img>`), which strains "images must represent the marked up content".
- **Project pages** (`base.njk:149-166`): a plain `CreativeWork`. Valid schema.org, but no Google feature uses it.
- **Certificates** (`src/certificates.njk`): no markup. Only the IHK credential is in `Person.hasCredential`.

### Recommendation

- **BlogPosting:**
  - Add `"dateModified": "{{ (updated or page.date) | isoDate }}"` with a new optional `updated` front-matter field. The same field drives the sitemap `lastmod` (section 6).
  - Set `"author": {"@type":"Person","@id":"{{ site.url }}/#person","name":…,"url":"{{ site.url }}/about/"}`.
  - Optionally make `image` an array: the 1200×630 card plus the original featured image.
- **ProfilePage:** create a short `/about/` page (bilingual pair) and mark it up as `ProfilePage` with `mainEntity` = the `#person` node. Point `author.url` and the visible byline to it (section 7). Using the homepage instead is defensible, since it is about one person affiliated with the site, but Google's examples don't cover a personal portfolio homepage, so `/about/` is the unambiguous choice. Uncertain point: whether Google shows anything for it on a site this small. The benefit is author disambiguation, not a visible rich result.
- **Certificates:** move them into `Person.hasCredential` as an array generated from `src/_data/certificates.json` (name, `recognizedBy` = issuer, `url` when it isn't `#`). This is schema.org-only, so the effort is S and the impact is low.
- **Projects:** keep `CreativeWork` (or `SoftwareSourceCode` with `codeRepository` where a repo is public). Don't add `SoftwareApplication` with made-up ratings. That would break the review-snippet guidelines.
- **BreadcrumbList:** low value (desktop only, a two-level site). Skip it unless it's trivial to add.

---

## 4. Local SEO without a storefront

### What the sources say

- **Eligibility.** A Business Profile is for a business that "has a physical location that customers can visit, or travels to customers where they are". A service-area business should "hide your business address", for example a plumber running the business from a residential address should "clear the address". The service area "shouldn't extend farther than about 2 hours of driving time". The name must be the real-world name; "Including unnecessary information in your business name isn't permitted" ([GBP guidelines](https://support.google.com/business/answer/3038177)).
- **Local ranking** is "mainly based on relevance, distance, and popularity", with prominence built from "how many websites link to your business and how many reviews you have". "There's no way to request or pay for a better local ranking." The page doesn't mention structured data at all ([GBP, local ranking](https://support.google.com/business/answer/7091)).
- **LocalBusiness markup** can feed a knowledge panel and requires `name` and `address`. The doc says nothing about service-area businesses or `areaServed` ([LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business)). Organization markup recommends the homepage, but the page doesn't address sole traders or Person ([Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)).
- **AI features.** Business Profile data "can help your products and services to be visible in both AI responses and other Google Search results" ([AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).

### Current state

`Person` with `PostalAddress` (postcode and city only), `areaServed`, and a NAP line in the footer (`footer.njk:18-22`). `worksFor` is aks-Service GmbH.

### Recommendation

- **On-site markup has no documented effect on the map pack.** Local pack and Maps ranking is driven by the Business Profile (relevance, distance, prominence), not by schema on the site. The current Person/PostalAddress markup is fine as entity information. Don't expect local rankings from it, and don't add `LocalBusiness` with a home address you then have to publish.
- **A Business Profile only fits if it's true.** Create one only if there is an actual business, such as registered freelance work, that meets clients in person (travels to them). If so, register it as a service-area business with the address hidden, a service area within about 2 hours (Düren, Aachen, Köln fit), and the real business name without keywords. While the work is employment at aks-Service GmbH, a personal profile would misrepresent the business. That's a judgement call for the owner. The guidelines don't mention freelancers or remote developers explicitly.
- **The main local lever is the German homepage.** The on-site work that matters is section 1: a German page whose *visible* content targets "Webentwickler in Düren". That's also the open TODO "A German page about the work itself".

---

## 5. Internal linking, tag pages, `/blog/`

### What the sources say

- Google crawls `<a href>` links. Anchor text should be descriptive, and "Every page you care about should have a link from at least one other page on your site" ([Link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)).
- "We don't recommend using noindex to prevent selection of a canonical page within a single site". `rel=canonical` is the preferred tool, and robots.txt is not for canonicalization ([Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)).
- A duplicate-content "penalty" doesn't exist: "it's not something that will cause a manual action" ([SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)).

### Current state

- **No orphans found.** Every published post is linked from `/blog/` (both language lists are in the DOM, `blog.njk:30-115`). The homepage links the 3 latest posts per language and both project detail pages in both languages (live: `/projects/…` and `/de/projects/…`). Posts link their translation and prev/next. Anchor text is the post title. Good.
- **Tag pages** are `noindex, follow`, kept out of the sitemap and out of Pagefind (`tags.njk:15-17`). There are 36 pages in `_site/tags/`, most with 1–2 posts per language. That's a sensible choice for thin archives. The noindex here is a quality choice, not a canonicalization trick, so the Google warning above doesn't apply.
- **Bug:** `tags.njk:5-11` filters `all, post, posts, projectPage, tagList` but not `featured`, so `/tags/featured/` is built (live 200, 6 posts). No page links to it, and it's noindexed. This is cosmetic.
- **`/blog/`** has no pagination, which is fine for 7 posts per language (`blog.njk:13-14`).

### Recommendation

- Add `featured` to the filter list in `tags.njk:5-11`.
- When posts grow, add "Related posts by tag" (already an idea in `TODOs.md`). Contextual links in the body are what Google's guidance actually encourages.
- Keep the tag pages noindexed while they stay thin. If a tag gets real substance, such as an intro paragraph and 5 or more posts, it can be indexed. Don't add a canonical pointing to `/blog/` on top of noindex (see Folklore).

---

## 6. Search Console, Bing Webmaster Tools, sitemaps, IndexNow

### What the sources say

- **Sitemaps:**
  - "Google ignores `<priority>` and `<changefreq>` values."
  - `lastmod` is used "if it's consistently and verifiably … accurate", and should reflect "the last significant update". "An update to the copyright date is not" significant.
  - RSS and Atom feeds are accepted as sitemaps.
  - Submit via Search Console, the API, or a `Sitemap:` line in robots.txt. WebSub works for feeds.
  
  All from [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- **The ping endpoint is gone.** The sitemap "ping" endpoint is deprecated and returns 404 ([blog, 2023-06](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)).
- **Bing agrees on `lastmod`.** "Avoid setting lastmod to the time your sitemap was generated unless the content on that URL was actually updated", and "changefreq and priority are ignored by Bing" ([Bing blog, 2025-07](https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/)). The Bing help pages are JS-rendered and couldn't be fetched directly.
- **IndexNow protocol:**
  - `POST https://api.indexnow.org/indexnow` with JSON `{host, key, keyLocation, urlList}`, up to 10,000 URLs per post.
  - The key is 8–128 characters (letters, digits, dashes), served as a UTF-8 file `/{key}.txt`.
  - Responses: 200 OK, 202 (key validation pending), 400, 403, 422, 429.
  - Submissions are shared with all participating engines.
  
  From [IndexNow documentation](https://www.indexnow.org/documentation). The FAQ adds: submit "only when content has changed. Do not resubmit unchanged URLs"; submitting "does not guarantee immediate indexing"; and sitemaps are still needed ([IndexNow FAQ](https://www.indexnow.org/faq)).
- **Who participates:** Bing, Yandex, Seznam, Naver, Yep, Internet Archive and Amazonbot ([searchengines.json](https://www.indexnow.org/searchengines.json)). **Google is not listed**, and no Google doc says it consumes IndexNow. Google's Indexing API "can only be used to crawl pages with either JobPosting or BroadcastEvent" ([Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart)), so it is not an alternative for blog posts.
- **Search Console:**
  - The Page indexing report explains statuses like "Crawled – currently not indexed" (no need to resubmit) and notes that "Alternate language pages are not detected by Search Console" ([Page indexing report](https://support.google.com/webmasters/answer/7440203)).
  - The Change of Address tool should be used for **all verified variants** of the old domain. Keep the redirects "generally at least 1 year" ([Site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)).
  - New since 2026-08-31: a **Search generative AI control** (Settings → Search generative AI; the default is Include) and a **Generative AI performance report** ([control](https://support.google.com/webmasters/answer/16908024), [report](https://support.google.com/webmasters/answer/16984139)).
- **Eleventy dates.** The default `date` is the file creation time, which "may reset … on a Continuous Integration server". `date: git Last Modified` resolves to the file's latest commit ([11ty dates](https://www.11ty.dev/docs/dates/)). `actions/checkout` fetches "a single commit" by default, so `fetch-depth: 0` is needed for real git dates ([actions/checkout README](https://github.com/actions/checkout)).

### Current state

- **Live sitemap:** 22 URLs, all HTML, absolute HTTPS. robots.txt references it.
  - Posts and projects carry their front-matter `date` as `lastmod`. An edited post keeps its publish date, and there is no `updated` field.
  - `/`, `/blog/`, `/certificates/` and `/impressum/` carry the **build time** (`2026-10-12T10:56:25.652Z`), because they have no `date` and CI checks the files out fresh.
  - Every URL has `changefreq` `monthly` and `priority` `0.5` (`sitemap.xml.njk:21-23`).
- **The footer timestamp changes every page on every build.** `{% lastUpdated %}` in `footer.njk:23-25` makes every page's HTML differ after each build. A crawler comparing content sees change everywhere, and the "Updated <date>" competes with the real post date (section 7).
- **The old domain still redirects.** `https://kadirguelec.de/*`, `www.` and `http://` all 301 to the new host. Only `/robots.txt` on the old host answers 200 with a HestiaCP default (`Crawl-delay: 10`, allow all). That's harmless: crawling is allowed, so Google can see the redirects, and Google ignores `crawl-delay` ([robots.txt spec](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)).
- **The deploy has no notification step** (`deploy.yml:43-48` ends with rsync).

### Recommendation

1. **Search Console (S, ops).**
   - Use a Domain property for `guelec.eu` or a URL-prefix property for `https://kadir.guelec.eu/`.
   - Submit `/sitemap.xml`, and optionally `/feed.xml` as a second sitemap.
   - Verify `kadirguelec.de` **and** `www.kadirguelec.de`, then submit Change of Address from each to `kadir.guelec.eu`.
   - Keep the `.htaccess` redirect (`src/.htaccess:6-10`) for at least a year.
   - Check Page indexing for "Duplicate, Google chose different canonical" on `/` vs `/index.html` (`/index.html` returns 200; the canonical should handle it).
   - Leave the generative AI control on Include unless that is a deliberate choice.
2. **Bing Webmaster Tools (S).** Import the site from Search Console, submit the sitemap, then add IndexNow (below).
3. **Truthful `lastmod` (M).**
   ```njk
   {# sitemap.xml.njk:21-23 #}
   {#- only pages with a real authored date (posts, project pages) or an explicit `updated` #}
   {%- set modified = entry.data.updated or (entry.date if entry.data.date) %}
   {%- if modified %}<lastmod>{{ modified | isoDate }}</lastmod>{% endif %}
   ```
   Drop `changefreq` and `priority`. For `/` and `/blog/`, either omit `lastmod` (allowed: "just the ones you're confident about", [blog, 2023-06](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)) or use the newest post's date.

   Alternative: `date: git Last Modified` (the same date for `dateModified`). This needs `fetch-depth: 0` in `deploy.yml:21-22`. **Gotcha:** git dates also change on typo or whitespace commits, and every CMS save is a commit, so an explicit `updated` field is more honest.
4. **Remove or neutralize the footer build timestamp** (`footer.njk:23-25`). If you want to keep it, show it only on the homepage, or wrap it in `data-nosnippet`. Removing it is what makes the IndexNow diff below meaningful.
5. **IndexNow (M).** Generate a key once (for example `openssl rand -hex 16`) and store it as the repo secret `INDEXNOW_KEY`. The key is public by design, since it's served as a file. Changes to `.github/workflows/deploy.yml`:

   ```yaml
   # after "🏗️ Build Site" (deploy.yml:32-33), before "🔑 Set up SSH" (:35)
         - name: 🗝️ IndexNow key + page manifest
           env:
             INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}
           run: |
             echo -n "$INDEXNOW_KEY" > "_site/${INDEXNOW_KEY}.txt"
             # Previous deploy's manifest, fetched before rsync replaces it.
             curl -fsS https://kadir.guelec.eu/indexnow-manifest.json -o /tmp/prev.json || echo '{}' > /tmp/prev.json
             node scripts/indexnow.mjs manifest _site > _site/indexnow-manifest.json

   # after "📂 Sync files to HestiaCP" (deploy.yml:43-48)
         - name: 📣 Notify IndexNow (Bing, Yandex, Seznam, Naver, …)
           env:
             INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}
           run: node scripts/indexnow.mjs submit /tmp/prev.json _site/indexnow-manifest.json || echo "IndexNow failed (non-fatal)"
   ```

   And a small script, `scripts/indexnow.mjs` (Node 24 has `fetch`; no dependencies):

   ```js
   import { readFileSync, readdirSync, statSync } from "node:fs";
   import { createHash } from "node:crypto";
   import { join } from "node:path";
   const SITE = "https://kadir.guelec.eu";
   const [, , cmd, a, b] = process.argv;

   // url -> sha256 of the page, with volatile bits stripped so only real edits count.
   function manifest(dir, base = "") {
     const out = {};
     for (const name of readdirSync(dir)) {
       const p = join(dir, name), rel = `${base}/${name}`;
       if (statSync(p).isDirectory()) { if (!/^\/(admin|pagefind|assets)$/.test(rel)) Object.assign(out, manifest(p, rel)); continue; }
       if (name !== "index.html") continue;
       const html = readFileSync(p, "utf8");
       if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue;
       const normalized = html
         .replace(/\?v=[0-9a-f]{32}/g, "")                     // cache-buster hashes
         .replace(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/g, "");      // footer build time, if kept
       out[SITE + (base || "") + "/"] = createHash("sha256").update(normalized).digest("hex");
     }
     return out;
   }

   if (cmd === "manifest") console.log(JSON.stringify(manifest(a), null, 1));
   if (cmd === "submit") {
     const prev = JSON.parse(readFileSync(a, "utf8")), next = JSON.parse(readFileSync(b, "utf8"));
     const urlList = [...new Set([
       ...Object.keys(next).filter(u => prev[u] !== next[u]),   // new or changed
       ...Object.keys(prev).filter(u => !(u in next)),          // deleted
     ])];
     if (!urlList.length) { console.log("IndexNow: nothing changed"); process.exit(0); }
     const key = process.env.INDEXNOW_KEY;
     const res = await fetch("https://api.indexnow.org/indexnow", {
       method: "POST",
       headers: { "Content-Type": "application/json; charset=utf-8" },
       body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${key}.txt`, urlList }),
     });
     console.log(`IndexNow: ${res.status} for ${urlList.length} URL(s)`, urlList);
   }
   ```

   **Gotchas:**
   - The first run submits everything (22 URLs), which is fine.
   - The manifest is public. It only contains URLs and hashes.
   - The workflow's `concurrency` group (`deploy.yml:12-14`) already serializes deploys, so manifests don't race.
   - A 202 on the first call is normal while the key is validated.
   - Don't fail the deploy on a 4xx or 429.
   - Google is unaffected; it relies on the sitemap and crawling.

---

## 7. Other documented factors a small portfolio/blog might miss

### Title links
The guidance is in section 1 ([Title links](https://developers.google.com/search/docs/appearance/title-link)). Posts use `Title | Kadir Gülec` (`base.njk:26`), which matches the site-name advice. The only problem is the homepage language mismatch (summary item 1).

### Authorship, dates, people-first content
- **What the sources say.** Google asks "Do pages carry a byline, where one might be expected? Do bylines lead to further information about the author…?", and "We strongly encourage adding accurate authorship information". "E-E-A-T itself isn't a specific ranking factor" ([Creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)). On dates, Google wants a "user-visible date … labelled" ("Published", "Last updated"), matching structured data, and to "Minimize the presence of other dates on the page" ([Byline dates](https://developers.google.com/search/docs/appearance/publication-dates)).
- **Current state.** The post meta row (`post.njk:20-32`) shows date, reading time and a language badge, but **no author name**. The footer adds a second, build-time "Updated" date to every post (`footer.njk:23-25`).
- **Recommendation.**
  - Add a byline: `von/by <a href="/about/">Kadir Gülec</a>`.
  - Label the date "Published", plus "Updated" when `updated` is set.
  - Drop the footer timestamp (section 6).
  - Refresh the outdated "How I Built This Static Blog" post (open TODO). Google's helpful-content questions explicitly ask whether content is accurate. Bump `updated` only on substantial edits: the same doc warns against "changing the date of pages to make them seem fresh".

### Images and social cards
- **Google image SEO.** Alt text is "the most important attribute", and Google indexes `<img src>`, not CSS backgrounds ([Image SEO](https://developers.google.com/search/docs/appearance/google-images)). Discover wants images at least 1200 px wide, "enabled by the `max-image-preview:large` setting" ([Discover](https://developers.google.com/search/docs/appearance/google-discover)). `max-image-preview: large` allows "a larger image preview, up to the width of the viewport" ([robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)).
- **Open Graph.** "If the page specifies an og:image it should specify og:image:alt". `og:locale` uses the `language_TERRITORY` format ([ogp.me](https://ogp.me/)).
- **X cards.** `summary_large_image` needs a 2:1 image, at least 300×157, under 5 MB, in JPG, PNG, WEBP or GIF (no SVG). Source: the legacy X developer page ([developer.twitter.com](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary-card-with-large-image)). The current developer.x.com URL redirected to a generic overview and returned 402 to WebFetch, so these numbers are **from the legacy page only**.
- **Current state.**
  - `og:image:alt` is only emitted when `imageAlt` is set (`base.njk:60`), and 13 post files set `imageAlt: ''` (3 omit it).
  - There is no `twitter:image:alt`.
  - The AI posts' share image is 4,179,839 bytes, under but close to 5 MB (already a TODO).
  - There is no `max-image-preview` directive.
  - The generated cards are images with text, which Google's preferred-image section advises against for Google thumbnails. That's fine for social; consider the original photo in the JSON-LD `image` instead.
- **Recommendation.**
  ```njk
  {# base.njk:72-74 #}
  <meta name="robots" content="{{ robots or 'max-image-preview:large' }}">
  <meta property="og:image:alt" content="{{ imageAlt or title }}">
  <meta name="twitter:image:alt" content="{{ imageAlt or title }}">
  ```
  Then write real alt texts in the 13 posts. They also serve as anchor text wherever an image is a link.

### RSS feed
- **Current state.** `/feed.xml` (`.eleventy.js:216-233`) uses `collections.post`, which includes German items, under `<language>en</language>`. The last 10 items are 5 EN/DE pairs. The feed `<link rel="alternate">` is on every page (`base.njk:175`).
- **Recommendation.** Build two feeds with two `addPlugin(feedPlugin, …)` calls (the plugin supports per-call `collection.name`, `outputPath` and `metadata.language`, per the [11ty RSS plugin docs](https://www.11ty.dev/docs/plugins/rss/)): `/feed.xml` (en) and `/de/feed.xml` (de), each backed by a language collection. Advertise the one matching `pageLang`. Feeds are also valid sitemaps for Google ([Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)).

### AI features (AI Overviews, AI Mode), snippet controls, Google-Extended
- **No special optimization is needed.** "There are no additional requirements to appear in AI Overviews or AI Mode". A page must be indexed and snippet-eligible ([AI features](https://developers.google.com/search/docs/appearance/ai-features)).
- **Search Console control.** The 2026 [Search generative AI control](https://support.google.com/webmasters/answer/16908024) in Search Console decides inclusion. The default is Include, and the control "isn't used as a ranking or inclusion signal affecting other parts of Search".
- **Snippet-level controls:** `nosnippet` (which also stops use "as a direct input for AI Overviews and AI Mode"), `data-nosnippet` and `max-snippet` ([robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)).
- **Google-Extended.** This robots.txt token controls use for Gemini training and grounding outside Search ([Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)). It doesn't affect Search.
- **No `llms.txt`.** Google Search ignores it, and "Overfocusing on structured data" and "chunking" aren't needed ([AI optimization guide, mythbusting](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).
- **Recommendation.** Nothing to add for visibility. If the owner doesn't want the content used for Gemini training, add `User-agent: Google-Extended` / `Disallow: /` to `robots.njk`; it has no Search impact. Check the new Generative AI performance report after a few weeks.

### Pagefind
- **Pagefind's docs are silent on SEO.** They only cover indexing (by `<html lang>`, with `data-pagefind-ignore`) and hosting ([indexing](https://pagefind.app/docs/indexing), [multilingual](https://pagefind.app/docs/multilingual)).
- **The site has no search-result URLs.** Search lives in a modal and fetches `/pagefind/pagefind.js` only when it opens (`search.njk:121-128`). There are no `?q=` pages, so there is nothing to noindex, and blocking the bundle doesn't affect rendering.
- **Recommendation.** Keep `Disallow: /pagefind/` (`robots.njk:8`). It keeps index fragments and JS out of the crawl, and nothing render-critical lives there.

### `/admin/` (Sveltia CMS)
- **What the sources say.** "If a page is disallowed from crawling through the robots.txt file, then any information about indexing or serving rules will not be found and will therefore be ignored" ([robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)). Disallowed URLs "may still be indexed … without their content" ([Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)). Sveltia's own starter `admin/index.html` includes `<meta name="robots" content="noindex" />` ([Sveltia docs](https://sveltiacms.app/en/docs/start)). The repo's `src/admin/index.html:6` matches that.
- **Current state.** `robots.njk:7` disallows `/admin/`, so Google can't see that noindex. `/admin/config.yml` is publicly served (200, `application/yaml`); Sveltia needs it, and it holds no secrets.
- **Recommendation (low).** Remove `Disallow: /admin/` so the noindex is seen, and add a header for good measure in the root `.htaccess`:
  ```apache
  <If "%{REQUEST_URI} =~ m#^/admin/#">
      Header set X-Robots-Tag "noindex, nofollow"
  </If>
  ```
  **HestiaCP gotcha (inferred, not verified from Hestia docs):** responses show nginx serving static extensions directly. They carry `cache-control: max-age=315360000`, and on the old host `/robots.txt` bypassed the `.htaccess` redirect. HTML goes to Apache: the trailing-slash 301 has Apache's `iso-8859-1` signature, and `ErrorDocument` works. So the header will likely apply to `/admin/index.html` but **not** to `.yml`/`.js` files served by nginx. Check with `curl -sI https://kadir.guelec.eu/admin/` after deploying. Requires `mod_headers`.

### Smaller notes
- **Pin post slugs (summary item 8).** `posts.json:5` builds the URL from the title. Add a `slug` field in the CMS (or pin `permalink` per post) and use `{{ slug or (title | slugify) }}`. If a URL has already moved, add a 301 in `src/.htaccess`.
- **Outside SEO scope:** the Impressum heading still cites "§ 5 TMG". The TMG was replaced by the DDG in 2024, so worth a legal check. Not researched here.

---

## Folklore check

| Claim | Status | Source |
|---|---|---|
| Meta keywords help ranking | **Contradicted.** "Google Search doesn't use the keywords meta tag." | [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| A Lighthouse score of 100 is a ranking factor | **Not supported.** The ranking-relevant CWV data is CrUX field data; Lighthouse is a lab tool. Good scores don't "guarantee" rankings. | [CWV report](https://support.google.com/webmasters/answer/9205520), [Page experience](https://developers.google.com/search/docs/appearance/page-experience) |
| Text-to-HTML ratio matters | **Not in any Google doc I found.** Google says there's no ideal page length and HTML needn't be perfect. | [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) |
| "LSI keywords" / every keyword variation | **Not supported.** "AI systems can understand synonyms", so you don't need every long-tail variation. | [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) |
| Minimum word count | **Contradicted.** "there's no magical word count target"; "(No, we don't.)" | [Starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) |
| Google uses sitemap `priority`/`changefreq` | **Contradicted** (Google and Bing). | [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Bing blog](https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/) |
| Pinging `google.com/ping?sitemap=` | **Dead since 2023** (404). | [Google blog](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping) |
| "Duplicate content penalty" | **Contradicted.** Duplicates are "not something that will cause a manual action" (copying others' content is different). Bing: duplicates don't trigger "penalties on its own". | [Starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Bing blog](https://blogs.bing.com/webmaster/December-2025/Does-Duplicate-Content-Hurt-SEO-and-AI-Search-Visibility) |
| Translations are duplicate content | **Contradicted.** Only "if the main content … remains untranslated". | [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) |
| hreflang is a ranking boost | **Not supported.** It helps Google "point users to the most appropriate version"; no ranking claim. | [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) |
| `<html lang>` tells Google the language | **Contradicted** for Google (visible content decides). Bing's 2011 guidance does read it. | [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [Bing 2011](https://blogs.bing.com/webmaster/March-2011-(1)/How-To-Tell-Bing-Your-Website-s-Country-and-Langua/) |
| `noindex` + `rel=canonical` to another page "consolidates" | **Not recommended.** Google advises against noindex for canonical selection and prefers `rel=canonical` alone. The signals conflict. | [Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) |
| `robots.txt Disallow` removes a page from Google | **Contradicted.** It may still be indexed without content, and a noindex behind a Disallow is never read. | [robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [Consolidate](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) |
| Exactly one `<h1>` / heading order is a ranking factor | **Contradicted for Search.** "It doesn't matter if you're using them out of order"; no ideal number. (One `<h1>` is still good for accessibility.) | [Starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| E-E-A-T is a ranking factor | **Contradicted.** "No, it's not." | [Starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| Hidden (CSS) content is always spam | **Contradicted.** Tabs and accordions are explicitly fine. The problem here is language relevance, not a penalty. | [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) |
| You need `llms.txt` / special AI markup | **Contradicted for Google Search.** | [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) |
| Google honours `Crawl-delay` | **Contradicted.** "Other fields such as crawl-delay aren't supported." | [robots.txt spec](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec) |
| IndexNow / the Indexing API gets blog posts into Google faster | **Not supported.** Google isn't an IndexNow participant, and the Indexing API is limited to JobPosting/BroadcastEvent. | [searchengines.json](https://www.indexnow.org/searchengines.json), [Indexing API](https://developers.google.com/search/apis/indexing-api/v3/quickstart) |
| Keywords in the domain/URL boost ranking | **Contradicted.** "Hardly any effect beyond appearing in breadcrumbs." | [Starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| Structured data improves rankings | **Not supported.** It enables eligibility for rich results; removing types "won't affect how pages are ranked". | [Google blog 2025-06](https://developers.google.com/search/blog/2025/06/simplifying-search-results), [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) |
| Updating dates often makes a site "fresh" | **Contradicted.** "(No, it won't)". | [Helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) |

---

## What could not be verified

- **Field data (CrUX) for this origin.** The PageSpeed Insights API returned a quota error. Check Search Console → Core Web Vitals and PageSpeed Insights by hand.
- **Whether the duplicate font files are variable fonts.** They are byte-identical; their `fvar` table was not inspected.
- **Current X card docs.** developer.x.com redirected and WebFetch got a 402, so the legacy developer.twitter.com numbers are used.
- **Bing Webmaster help pages** (JS-rendered, empty to WebFetch). Bing positions are taken from blogs.bing.com posts instead. The language-detection post dates from 2011.
- **HestiaCP's nginx/Apache split.** This is inferred from response headers, not from HestiaCP docs (which aren't on the allowed source list). Verify `X-Robots-Tag` with `curl -sI` after deploying.
- **Whether Google shows anything for ProfilePage on a small personal site.** The docs define eligibility but don't promise display.
- **Google Business Profile fit for an employed developer.** This is a policy judgement for the owner; the guidelines don't mention freelancers or remote developers explicitly.

---

## Sources

Google Search Central and Search Console
- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/docs/appearance/page-experience
- https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/profile-page
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/search/docs/appearance/structured-data/software-app
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/blog/2025/06/simplifying-search-results
- https://developers.google.com/search/blog/2025/11/update-on-our-efforts
- https://developers.google.com/search/updates
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/appearance/search-profiles
- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- https://developers.google.com/search/docs/appearance/google-discover
- https://developers.google.com/search/docs/appearance/google-images
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/appearance/publication-dates
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/apis/indexing-api/v3/quickstart
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- https://support.google.com/webmasters/answer/9205520 (Core Web Vitals report)
- https://support.google.com/webmasters/answer/7440203 (Page indexing report)
- https://support.google.com/webmasters/answer/16908024 (Search generative AI control)
- https://support.google.com/webmasters/answer/16984139 (Generative AI performance report)

Google Business Profile
- https://support.google.com/business/answer/3038177
- https://support.google.com/business/answer/7091

web.dev and Chrome
- https://web.dev/articles/optimize-lcp
- https://web.dev/articles/font-best-practices
- https://web.dev/articles/browser-level-image-lazy-loading
- https://developer.chrome.com/docs/crux/methodology

Standards and platforms
- https://schema.org/EducationalOccupationalCredential · https://schema.org/hasCredential · https://schema.org/SoftwareSourceCode · https://schema.org/ProfilePage
- https://ogp.me/
- https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/summary-card-with-large-image (legacy; current X URL not fetchable)

Bing and IndexNow
- https://blogs.bing.com/webmaster/2025/7/Keeping-Content-Discoverable-with-Sitemaps-in-AI-Powered-Search/
- https://blogs.bing.com/webmaster/December-2025/Does-Duplicate-Content-Hurt-SEO-and-AI-Search-Visibility
- https://blogs.bing.com/webmaster/March-2011-(1)/How-To-Tell-Bing-Your-Website-s-Country-and-Langua/
- https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a (JS-rendered; content not retrievable)
- https://www.indexnow.org/documentation · https://www.indexnow.org/faq · https://www.indexnow.org/searchengines.json

Tools and libraries
- https://www.11ty.dev/docs/dates/ · https://www.11ty.dev/docs/plugins/rss/ · https://www.11ty.dev/docs/i18n/ · https://www.11ty.dev/docs/plugins/i18n/ (via Context7 `/11ty/docs`)
- https://pagefind.app/docs/multilingual · https://pagefind.app/docs/indexing · https://pagefind.app/docs/hosting (via Context7 `/websites/pagefind_app`)
- https://sveltiacms.app/en/docs/start
- https://github.com/actions/checkout (README, `fetch-depth`)
