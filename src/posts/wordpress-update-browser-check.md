---
title: Why HTTP 200 Is Not Enough After a WordPress Update
date: 2026-11-07
docLang: en
description: "Every page returned 200 after a WordPress update, but the registration form was gone. How I now test whole sites in a real browser before and after updates."
tags:
  - post
  - WordPress
  - Puppeteer
  - Testing
  - ACF
image: /assets/images/posts/wordpress-update-browser-check.jpg
imageAlt: "Hands typing on a laptop with the WordPress post editor open (photo: StockSnap, Pixabay)"
draft: false
---

Part of my job is keeping WordPress sites up to date. Some time ago I updated an events website: WordPress core, around twenty plugins, translations. After every step I checked the important pages from the outside. Every page answered with HTTP 200, there were no PHP errors in the HTML, and the page builder rendered the same number of elements as before. Everything looked fine.

It was not. For about eight hours, nobody could register for an event.

## The symptom: the page is there, the form is not

On every event page, the registration form had lost its `<form>` tag and every `<input>` field. The labels were still there, and so was the textarea. At a quick glance the form looked almost normal. But there was nothing to fill in and no button to press.

My checks missed it because they asked the wrong question. "Does the page load?" is not the same as "can a visitor do what the page is for?" A `curl` that returns 200 cannot tell the difference.

## The cause: ACF now escapes `the_field()`

The site uses Advanced Custom Fields (ACF), and the update took ACF from 6.2.4 to the current version. That jump crossed a security change: since **ACF 6.2.7**, `the_field()` and `the_sub_field()` pass their output through `wp_kses_post()`. That function only keeps HTML that is safe inside a blog post. Forms, inputs, iframes and scripts are removed.

The theme's event template printed the registration form, a Contact Form 7 form stored in an ACF field, with `the_field()`. Before the update the HTML went out as it was. After the update ACF stripped it.

ACF does warn you, but only inside wp-admin, and it keeps a log of every field it had to escape. With WP-CLI you can read that log directly:

```bash
wp option get acf_escaped_html_log --format=json
```

On this site it listed nine fields. The fix is to allow unescaped HTML again, but only for those fields, and only because their content is entered by trusted admins. Every other field stays escaped:

```php
// functions.php of the child theme
add_filter('acf/the_field/allow_unsafe_html', function ($allowed, $selector) {
    $trusted = ['registration_form', 'registration_options' /* … */];

    return in_array($selector, $trusted, true) ? true : $allowed;
}, 10, 2);
```

The other option ACF suggests is `echo get_field('registration_form');` in the template, which does not go through the escaping.

The fix took minutes. Finding out that something was broken took eight hours. That was the part I wanted to fix.

## The real fix: a baseline before, a comparison after

I now check every site twice per update, **once before** (the baseline) and **once after**, and compare the two. Without a baseline you cannot tell new damage from problems that were already there.

The check runs in a real browser, because only a browser sees what a visitor sees: JavaScript errors, sliders that never start, a cookie banner covering the submit button. It is three small scripts.

### 1. Collect every URL from the sitemaps

WordPress has a core sitemap at `wp-sitemap.xml`, and Yoast and Rank Math use `sitemap_index.xml`. The script tries each one, follows the sub-sitemaps and collects every `<loc>`:

```bash
fetch_locs() { curl -s -L --max-time 30 "$1" | grep -o '<loc>[^<]*' | sed 's/<loc>//; s/&amp;/\&/g'; }
```

Sitemaps do not list everything. Thank-you pages and booking steps are often missing, so I add those by hand.

### 2. Open every page in headless Chrome

A Node script uses [Puppeteer](https://pptr.dev/) to open every URL in headless Chrome, four tabs at a time. Per page it records a fingerprint: status, title, a hash of the h1/h2 headings, JavaScript errors, failed requests to the same domain, broken images, PHP errors and unrendered shortcodes in the visible text, sliders (initialised? how many slides?) and, most importantly, forms.

For every form it counts the visible fields and the submit buttons. Then it types into every visible text field and reads the value back, to prove the field really accepts input:

```js
await h.click({ clickCount: 3 });
await h.type(probe, { delay: 5 });
const ok = (await h.evaluate(e => e.value)).includes(probe);
await h.evaluate(e => { e.value = ''; });
```

It never submits a form, though. A test submission sends a real email to a real client.

And it looks for exactly the bug from above, form leftovers **without** a form: a form plugin's wrapper that no longer contains a `<form>`, or text fields that are not inside any form:

```js
const orphanFields = [...document.querySelectorAll('textarea, input[type="text"], input[type="email"], select')]
  .filter(e => !e.closest('form') && visible(e) && !e.closest('header, nav, [role="search"]')).length;
```

On the broken events site this would have reported a textarea outside any form on every single event page.

### 3. Compare before and after

A small Python script compares the two JSON files page by page and sorts the differences into two groups:

- **WORSE**: a page is gone, a form or a submit button disappeared, fewer fields can be filled in, a slider stopped working, or there are new JavaScript errors, failed requests, broken images or form leftovers. Any of these makes the script exit with code 1.
- **Check by eye**: a changed title, fewer images, different headings. Often harmless, so I look at the screenshots of those pages before deciding.

A `WORSE` line gets fixed or rolled back before anyone hears the word "done".

## What I had to learn while building it

The first runs were full of false alarms. Most of them taught me something about how real WordPress sites are built:

- **Honeypots look like broken fields.** Anti-spam plugins add a field that visitors never see: clipped to one pixel, pushed off screen or behind the page. My script first reported it as a "hidden field". Now it detects honeypots and leaves them out (and never types into them, since a filled-in honeypot marks you as a bot).
- **Cookie banners cover everything.** Many forms and sliders are behind a consent banner, sometimes inside a shadow DOM. The script clicks "Accept all" before it looks at the page.
- **Sliders need time.** With four tabs loading at once, some sliders initialised too late and showed up as broken. On one site that was seven false alarms in parallel and zero when the pages loaded one at a time. Now every page that looks broken is loaded again on its own before it gets reported.
- **Lazy loading needs scrolling.** The script scrolls through each page so lazy images and sliders below the fold actually load.
- **A 403 on `wp-login.php` is fine.** A security plugin blocking the login page is a feature.

## What it does not check

The script sees the site as a logged-out visitor. The admin area, page builders, members-only pages and a real form submission are still manual steps, and I list them as "not checked" in my notes instead of quietly skipping them. A test only helps if you know where it ends.

## What I learned from this bug

- **HTTP 200 means the server answered. It does not mean the page works.** Test what the page is for: the form, the booking, the slider.
- **A check without a baseline is half a check.** Only the comparison shows what the update changed.
- **Read the changelog of the plugins that print your HTML.** ACF announced this change one release ahead and showed warnings in wp-admin. Updating straight from 6.2.4, I jumped over all of it.
- **Security changes can break features on purpose.** Escaping output is the right default. The fix is to allow exactly the fields you trust, not to turn it off.

These days the whole check runs as part of my monthly WordPress maintenance, and an update is only done once the comparison is clean.
