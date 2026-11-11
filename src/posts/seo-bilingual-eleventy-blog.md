---
title: What Google Actually Sees on a Bilingual Eleventy Blog
urlSlug: what-google-actually-sees-on-a-bilingual-eleventy-blog
date: 2026-11-11
docLang: en
description: "Googlebot never saw my language switch, so a German title sat on English content. How I fixed my bilingual Eleventy blog, checked against Google's own docs."
tags:
  - post
  - 11ty
  - SEO
  - Multilingual
image: /assets/images/posts/seo-bilingual-eleventy-blog.png
imageAlt: "Word cloud around the word SEO with a magnifying glass: Google, Bing, Yahoo!, meta, title, tags, URL, ranking (illustration: Tumisu, Pixabay)"
draft: true
---

This site exists in English and German. I live and work in Düren, and I want people here to find me when they search for "Webentwickler Düren", so the German side matters. For a long time I thought the bilingual setup was fine: an EN/DE switch in the header, the choice saved in the browser, and every page available in both languages.

Then I audited the site against primary sources only: Google Search Central, web.dev, schema.org, the Bing and IndexNow docs and the Eleventy docs. No SEO blogs, no "ultimate checklists". The audit found sixteen things to fix. The first one was the worst: Google had never seen the German version of my homepage.

## The problem: Googlebot has no memory

My homepage, `/blog/` and `/certificates/` were one URL each, with both languages in the HTML. A small script read the visitor's choice from `localStorage` and hid the other language with `display: none`. Without a stored choice, it showed English.

Google's rendering service does not keep anything between page loads: "Local Storage and Session Storage data are cleared across page loads. HTTP Cookies are cleared across page loads." ([Google Search Central](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript)). So Googlebot always got the default, English.

And Google decides a page's language from what is visible on it: "We don't use any code-level language information such as `lang` attributes, or the URL." ([Google Search Central](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)).

Put together, that was a real mismatch. The homepage `<title>` and meta description were German ("Webentwickler & Software Developer in Düren"), but the visible heading was English. A title in a different language than the page is one of the cases where Google [rewrites the title link](https://developers.google.com/search/docs/appearance/title-link) in its results. And a German search for "Webentwickler Düren" could only match my title and some text that Google saw as hidden.

There was a second, smaller bug. German posts showed English navigation to every first-time visitor, because the script fell back to English even on a page with `lang="de"`. Google asks for "a single language for content and navigation on each page".

One thing I had wrong in my head: hidden content is not a penalty in itself. Google's spam policy explicitly allows tabs and accordions. The problem was relevance, not spam.

## The fix: one URL per language

Google recommends "different URLs for each language version of a page rather than using cookies or browser settings", and lists a URL parameter such as `?loc=de` as "Not recommended". My posts already had their own German URLs. The homepage, the blog and the certificates page now have German twins: `/de/`, `/de/blog/` and `/de/certificates/`.

In Eleventy this is cheap. It is the same template, paginated over the two languages:

{% raw %}
```yaml
pagination:
  data: locales
  size: 1
  alias: docLang
  addAllPagesToCollections: true
locales: [en, de]
permalink: "{{ '/de/' if docLang == 'de' else '/' }}"
```
{% endraw %}

Every page now renders only its own language on the server, so nothing has to be hidden. There was one catch. In Nunjucks, an imported macro cannot see the variables of the page that imports it. My translation macro `i18n.t()` needs `docLang` to choose a language, so it has to be imported `with context`:

{% raw %}
```njk
{% import "partials/i18n.njk" as i18n with context %}
```
{% endraw %}

The language switch in the header became a plain link to the other page. Google only follows `<a href>` links, so a button that switched a CSS attribute never told Google that a German page existed at all.

### hreflang: every version lists every version

`hreflang` tells Google that two URLs are translations of each other, not duplicates, and which one to show to which reader. The rules are strict: every version lists itself and all other versions, with absolute URLs, and if two pages don't point to each other, Google ignores the tags. `x-default` names the fallback for every other language. In my layout it is a short loop:

{% raw %}
```njk
{% for version in versions %}
<link rel="alternate" hreflang="{{ version.data.docLang or 'en' }}" href="{{ site.url }}{{ version.url }}">
{% if (version.data.docLang or 'en') == 'en' %}
<link rel="alternate" hreflang="x-default" href="{{ site.url }}{{ version.url }}">
{% endif %}
{% endfor %}
```
{% endraw %}

`versions` comes from a small filter that finds a page's translations. Two posts belong together when they share a `translationKey` in their front matter, or else when their filenames match without the `-de` suffix: `livewire.md` and `livewire-de.md` are one pair.

The live homepage now answers with exactly this:

```html
<link rel="alternate" hreflang="en" href="https://kadir.guelec.eu/">
<link rel="alternate" hreflang="x-default" href="https://kadir.guelec.eu/">
<link rel="alternate" hreflang="de" href="https://kadir.guelec.eu/de/">
```

### Old links move with a 301

The old switch also read `?lang=de` from the URL. Nothing on the site linked to it, but a shared link would have shown German content with a canonical URL pointing to the English page. Now the server redirects those links permanently:

```apache
RewriteCond %{QUERY_STRING} (^|&)lang=de(&|$) [NC]
RewriteRule ^(blog/|certificates/)?$ /de/$1? [R=301,L]
```

The `?` at the end of the target drops the old query string, so `/blog/?lang=de` lands on a clean `/de/blog/`.

## Smaller things that were quietly wrong

- **A typo fix moved a post.** Post URLs were built from `title | slugify`. Correcting a title in the CMS gave the post a new URL and left a 404 behind. Every post now carries its URL as a fixed `urlSlug` in the front matter, and the CMS warns not to change it.
- **Every page "changed" on every deploy.** The sitemap's `<lastmod>` was the build time, and the footer printed an "Updated" timestamp from the build. Google and Bing only trust `lastmod` while it is truthful. Now it comes from a post's `updated` or publish date, and pages without a real date get none. `changefreq` and `priority` are gone, because both engines ignore them. Posts also show a byline and their Published and Updated dates.
- **The CMS was hidden from the wrong side.** `/admin/` was blocked in `robots.txt` and also marked `noindex`. But a crawler that may not fetch a page never reads its `noindex`, so the block could keep the bare URL in the index. Now `robots.txt` allows it, and the server sends an `X-Robots-Tag: noindex, nofollow` header for it.
- **One feed, two languages.** `/feed.xml` declared `<language>en</language>` but carried every post twice, once per language. Now `/feed.xml` is English and `/de/feed.xml` is German.
- **The same font, downloaded four times.** IBM Plex Sans and Space Grotesk are variable fonts, so one file covers every weight. My CSS declared them once per weight, each pointing to its own copy of the same file. Browsers cache by URL, so the homepage loaded 10 font files, 5 of them byte-identical copies, about 156 KB for nothing. Now each subset is declared once with a weight range:

  ```css
  @font-face {
    font-family: 'Space Grotesk';
    font-weight: 300 700;
    font-display: swap;
    src: url(/assets/fonts/space-grotesk-latin.woff2) format('woff2');
  }
  ```

- **The most important image loaded last.** On `/blog/` the lead image is the Largest Contentful Paint (LCP), the paint Google uses to measure loading speed. It had `loading="lazy"`, which delays exactly that paint. Now it loads eagerly with `fetchpriority="high"`.
- **Structured data had gaps.** Posts now carry `dateModified` and link their author to the person on the homepage. Worth knowing: structured data does not improve rankings. It only makes a page eligible for rich results.

## Telling search engines what changed: IndexNow

[IndexNow](https://www.indexnow.org/) is a protocol for telling search engines which URLs changed. Bing, Yandex, Seznam, Naver and others take part. Google does not; it relies on the sitemap and its own crawling. The IndexNow FAQ asks you to submit only new, changed or deleted URLs, not the whole site on every deploy.

A static site doesn't know what changed, so my deploy works it out. After the build, a small Node script writes a manifest with one SHA-256 hash per indexable page. Before hashing, it strips the cache-busting `?v=…` strings from the HTML, so a CSS change alone doesn't count as a change to every page:

```js
const normalized = html.replace(/\?v=[0-9a-f]+/g, "");
pages[url] = createHash("sha256").update(normalized).digest("hex");
```

The manifest is published with the site. The next deploy downloads the live manifest before `rsync` replaces it, compares the two and submits only the differences. The step runs with `continue-on-error: true` in GitHub Actions, so a failed ping never fails a deploy.

## SEO advice I stopped believing

The audit also checked common SEO advice against the official docs. Some of it I had believed for years:

- **Meta keywords help.** Google Search doesn't use the keywords meta tag.
- **A Lighthouse score of 100 is a ranking factor.** Google's Core Web Vitals come from real visitors' data. Lighthouse is a lab tool.
- **Posts need a minimum word count.** Google: "there's no magical word count target".
- **Translations are duplicate content.** Only "if the main content of the page remains untranslated".
- **hreflang boosts rankings.** It helps Google show the right language version. That's all.
- **Fresh dates make a site look fresh.** Changing dates without changing content: "(No, it won't)".
- **`Disallow` in robots.txt removes a page from Google.** It can still be indexed without its content, and a `noindex` behind a `Disallow` is never read.
- **Ping Google with your sitemap.** The `google.com/ping?sitemap=` endpoint has been gone since 2023.

## What I learned

- **Check what the crawler sees, not what your browser shows.** Googlebot remembers nothing: no `localStorage`, no cookies, no clicks. Whatever a page shows on a fresh first visit is the page.
- **One URL, one language.** Content, navigation and title in the same language, and real links between the versions.
- **Keep dates honest.** A `lastmod` that changes on every build teaches search engines to ignore it.
- **Read the primary sources.** Most of the SEO advice I had collected disappeared the moment I compared it with Google's own documentation.

None of this is a trick to rank higher. It removes the reasons for Google to misunderstand the site. This post is about what I changed and why, not about ranking numbers.
