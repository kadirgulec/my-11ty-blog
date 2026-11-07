const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
// eleventy-img v7 is ESM-only. Node's require(esm) hands back the module
// namespace, so the callable lives on .default (generateHTML hangs off it).
const Image = require("@11ty/eleventy-img").default;
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');
const site = require('./src/_data/site.json');

// "https://kadir.guelec.eu" -> "kadir.guelec.eu", printed on the OG cards.
const SITE_HOST = new URL(site.url).host;

// `eager` is for the one image that is the page's LCP element (the largest
// thing in the first viewport). Lazy-loading it delays the paint Google
// measures, so it loads immediately and ahead of other images instead.
async function imageShortcode(src, alt, cls = "", sizes = "(max-width: 768px) 100vw, 800px", eager = false) {
    let metadata = await Image(src, {
        widths: [300, 600, 900, 1200, 2000],
        formats: ["avif", "webp", "jpeg"],
        urlPath: "/assets/images/",
        outputDir: "./_site/assets/images/",
        filenameFormat: function (id, src, width, format, options) {
            const extension = path.extname(src);
            const name = path.basename(src, extension);
            return `${name}-${width}w.${format}`;
        }
    });

    let imageAttributes = {
        alt,
        sizes,
        class: cls,
        loading: eager ? "eager" : "lazy",
        decoding: "async",
        ...(eager && { fetchpriority: "high" }),
    }

    return Image.generateHTML(metadata, imageAttributes);
}



// "/posts/foo/" -> "foo";  "/de/posts/foo/" -> "de-foo".
// Keeps every existing English OG filename byte-identical.
function ogSlug(url) {
    const parts = (url || "").split("/").filter(Boolean);
    const slug = parts[parts.length - 1];
    return parts.length > 2 ? `${parts[0]}-${slug}` : slug;
}

const xmlEscape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const htmlUnescape = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// Wrap a title into SVG text lines (max 4 lines of ~22 chars)
function wrapTitle(title) {
    const lines = [];
    let line = "";
    for (const word of title.split(/\s+/)) {
        if ((line + " " + word).trim().length > 22 && line) {
            lines.push(line);
            line = word;
        } else {
            line = (line + " " + word).trim();
        }
    }
    if (line) lines.push(line);
    if (lines.length > 4) {
        lines.length = 4;
        lines[3] += " …";
    }
    return lines;
}

const OG_INK = "#101418";
const OG_ACCENT = "#f0801f";
const OG_MUTED = "#98a2ad";

// The logo paints itself black and only flips to white inside a
// prefers-color-scheme query, which a rasteriser never evaluates. Force the
// fill so the mark stays legible on the dark cards.
function whiteLogoSvg() {
    const svg = fs.readFileSync("./src/assets/logo.svg", "utf8");
    return svg.replace(/<style>[\s\S]*?<\/style>/, "<style>path { fill: #ffffff; }</style>");
}

function logoBuffer(size) {
    return sharp(Buffer.from(whiteLogoSvg())).resize(size, size).png().toBuffer();
}

// Default share card for every page that is not a post and brings no image of
// its own — the homepage above all.
async function writeHomeCard(destination) {
    const logo = await logoBuffer(150);
    const card = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="${OG_INK}"/>
        <rect width="1200" height="12" fill="${OG_ACCENT}"/>
        <text x="80" y="332" font-family="DejaVu Sans, Arial, sans-serif" font-size="76" font-weight="bold" fill="#ffffff">Kadir G\u00fclec</text>
        <text x="80" y="402" font-family="DejaVu Sans, Arial, sans-serif" font-size="38" fill="${OG_MUTED}">Webentwickler &amp; Software Developer</text>
        <text x="80" y="470" font-family="DejaVu Sans, Arial, sans-serif" font-size="32" font-weight="bold" fill="${OG_ACCENT}">D\u00fcren \u00b7 PHP \u00b7 Laravel \u00b7 Livewire \u00b7 Alpine.js</text>
        <text x="80" y="572" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="bold" fill="${OG_ACCENT}">${SITE_HOST}</text>
    </svg>`;
    await sharp(Buffer.from(card))
        .composite([{ input: logo, top: 78, left: 80 }])
        .png()
        .toFile(destination);
}

// Square mark on the site ground, referenced as the Person schema's image.
async function writeLogoCard(destination) {
    const logo = await logoBuffer(620);
    await sharp({ create: { width: 1024, height: 1024, channels: 4, background: OG_INK } })
        .composite([{ input: logo, gravity: "centre" }])
        .png()
        .toFile(destination);
}

function ogImageSvg(title) {
    const lines = wrapTitle(title);
    const text = lines.map((l, i) =>
        `<text x="80" y="${240 + i * 82}" font-family="DejaVu Sans, Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">${xmlEscape(l)}</text>`
    ).join("\n");
    return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#101418"/>
        <rect width="1200" height="12" fill="#f0801f"/>
        <text x="80" y="130" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="bold" fill="#f0801f" letter-spacing="3">BLOG</text>
        ${text}
        <text x="80" y="560" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="bold" fill="#f0801f">${SITE_HOST}</text>
        <text x="1120" y="560" text-anchor="end" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="#98a2ad">Kadir Gülec</text>
    </svg>`;
}

module.exports = function(eleventyConfig) {

    // Generate the social share images after each build: the branded default
    // card, the square logo, and a 1200x630 PNG per post.
    eleventyConfig.on("eleventy.after", async ({ results }) => {
        fs.mkdirSync("./_site/assets/og", { recursive: true });
        await Promise.all([
            writeHomeCard("./_site/assets/og/home.png"),
            writeLogoCard("./_site/assets/og/logo.png"),
        ]);

        const posts = results.filter(r => r.url && /^\/(?:[a-z]{2}\/)?posts\/[^/]+\/$/.test(r.url) && r.content);
        if (!posts.length) return;
        await Promise.all(posts.map(async (post) => {
            const slug = ogSlug(post.url);
            const m = post.content.match(/<meta property="og:title" content="([^"]*)"/);
            const title = m ? htmlUnescape(m[1]) : slug;
            await sharp(Buffer.from(ogImageSvg(title))).png().toFile(`./_site/assets/og/${slug}.png`);
        }));
    });

    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/.htaccess");

    // Ship the Sveltia CMS admin page verbatim (not processed as a Nunjucks template)
    eleventyConfig.addPassthroughCopy("src/admin");

    // Exclude draft posts from every build (output, collections, sitemap and RSS),
    // including local dev. Uncheck "Draft" in the CMS to preview or publish a post.
    eleventyConfig.addPreprocessor("drafts", "*", (data) => {
        if (data.draft) {
            return false;
        }
    });

    // Build-time syntax highlighting for Markdown code fences (no client JS)
    eleventyConfig.addPlugin(syntaxHighlight);

    // Add cache buster plugin
    eleventyConfig.addPlugin(cacheBuster({
        outputDirectory: '_site'
    }));

    // The cache buster appends ?v=<hash> to every <link href>, including the
    // font preloads — but the @font-face rules inside style.css request the
    // unhashed URL, so a hashed preload would never match and the browser would
    // fetch the file twice. Font filenames already encode family/weight/subset
    // and never change contents, so drop the hash again.
    //
    // Registered as a plugin because addPlugin() is deferred: a plain
    // addTransform() here would run *before* the cache buster, not after.
    eleventyConfig.addPlugin(function (config) {
        config.addTransform("unhashFontPreloads", function (content) {
            if (!(this.page.outputPath || "").endsWith(".html")) return content;
            return content.replace(/<link\b[^>]*\bas="font"[^>]*>/g, (tag) =>
                tag.replace(/(href="[^"?]+)\?v=[^"]*"/, '$1"')
            );
        });
    });

    // Bilingual markup ships both variants (partials/i18n.njk), and Pagefind
    // indexed both, so excerpts ran the languages together ("5 min
    // readLesezeit", "…under control.Ich baue…"). Hide the variant that does
    // not match <html lang> — the language Pagefind files the page under.
    // German posts have their own pages, so they stay findable. Pagefind's
    // exclude_selectors cannot do this: it only matches inside the indexed
    // body, so `html[lang="en"] [data-lang-de]` never fires.
    eleventyConfig.addTransform("pagefindIgnoreOtherLanguage", function (content) {
        if (!(this.page.outputPath || "").endsWith(".html")) return content;
        const lang = (content.match(/<html\b[^>]*\slang="([a-z]+)"/) || [])[1];
        const other = lang === "de" ? "en" : "de";
        return content.replace(
            new RegExp(`(<[a-zA-Z][^>]*?\\s)data-lang-${other}(?=[\\s>])`, "g"),
            `$1data-lang-${other} data-pagefind-ignore="all"`
        );
    });

    // 2. Add the Async Shortcode
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

    // Make sure it works in Markdown files too
    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);



    // One feed per language, so a feed's <language> is true for every item and
    // a reader never gets each post twice. Each page advertises its own one.
    eleventyConfig.addCollection("postEn", (api) =>
        api.getFilteredByTag("post").filter(post => (post.data.docLang || "en") === "en")
    );
    eleventyConfig.addCollection("postDe", (api) =>
        api.getFilteredByTag("post").filter(post => post.data.docLang === "de")
    );

    const feeds = [
        {
            lang: "en", collection: "postEn", outputPath: "/feed.xml",
            title: "Kadir Gülec — Blog",
            subtitle: "Notes on web development, the TALL stack, and the road from Umschulung to software developer.",
        },
        {
            lang: "de", collection: "postDe", outputPath: "/de/feed.xml",
            title: "Kadir Gülec — Blog (Deutsch)",
            subtitle: "Notizen zu Webentwicklung, dem TALL-Stack und dem Weg von der Umschulung zum Softwareentwickler.",
        },
    ];
    for (const feed of feeds) {
        eleventyConfig.addPlugin(feedPlugin, {
            type: "rss",
            outputPath: feed.outputPath,
            collection: {
                name: feed.collection,
                limit: 10,
            },
            metadata: {
                language: feed.lang,
                title: feed.title,
                subtitle: feed.subtitle,
                base: `${site.url}/`,
                author: {
                    name: "Kadir Gülec",
                    email: "",
                }
            }
        });
    }

    // Accepts a Date or anything Date can parse (front-matter `updated`).
    eleventyConfig.addFilter("isoDate", (dateObj) => {
        return new Date(dateObj).toISOString();
    });

    // The date a page last changed in substance: `updated` when the front
    // matter sets one, else its publish date. Feeds dateModified and lastmod.
    eleventyConfig.addFilter("modifiedDate", (item) =>
        new Date(item.data.updated || item.date)
    );

    // Certificates as schema.org credentials for the Person JSON-LD. Google
    // has no rich result for them; they only tell crawlers what the person
    // holds and who issued it.
    eleventyConfig.addFilter("credentials", (items) =>
        (items || []).filter(item => !item.draft).map(item => ({
            "@type": "EducationalOccupationalCredential",
            name: item.name,
            recognizedBy: { "@type": "Organization", name: item.issuer },
            ...(item.url && item.url !== "#" && { url: item.url }),
        }))
    );

    // Newest change among `items`, for listings whose content is those items.
    eleventyConfig.addFilter("latestModified", (items) =>
        new Date(Math.max(...(items || []).map(item => new Date(item.data.updated || item.date))))
    );

    eleventyConfig.addFilter("readingTime", (content) => {
        const words = String(content).replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
    });

    eleventyConfig.addFilter("postDate", (dateObj, locale = 'de-DE') => {
        return new Date(dateObj).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).replace(',', '');
    });

    // Drop the bookkeeping tags that drive collections but mean nothing to a reader.
    const INTERNAL_TAGS = new Set(["post", "featured"]);
    eleventyConfig.addFilter("visibleTags", (tags) =>
        (tags || []).filter(tag => !INTERNAL_TAGS.has(tag))
    );

    // Nunjucks' selectattr does not reliably apply a test, so filter explicitly.
    eleventyConfig.addFilter("where", (list, key, value) =>
        (list || []).filter(item => item[key] === value)
    );

    // Only some projects earn a write-up. A project names its page through
    // `detailSlug`; the page names its project through `project`. Both sides use
    // the slug rather than the title, so renaming a project in the CMS never
    // moves a published URL.
    eleventyConfig.addFilter("projectPage", (pages, slug, lang = "en") =>
        slug ? (pages || []).find(page =>
            page.data.project === slug && (page.data.docLang || "en") === lang
        ) : undefined
    );

    // The reverse lookup, so a detail page can re-show the badge, tagline and
    // meta rows its card already carries instead of restating them. Returns
    // undefined for an unknown or draft project — the layout then renders the
    // body alone rather than failing the build, which is what a half-finished
    // page in the CMS should do.
    eleventyConfig.addFilter("projectEntry", (items, slug) =>
        slug ? (items || []).find(item => !item.draft && item.detailSlug === slug) : undefined
    );

    // Data-file entries can be flagged `draft: true` in the CMS: still editable
    // there, never rendered here. (Blog posts use front matter + a preprocessor.)
    // CMS "text" widgets store real newlines, which HTML collapses to spaces.
    // Escape first (the result is injected as markup), then turn the newlines
    // into <br>. A run of blank lines collapses to a single blank line so a
    // stray extra Return does not open a big gap.
    eleventyConfig.addFilter("nl2br", (value) => {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .trim()
            .replace(/(\r\n|\r|\n){2,}/g, "<br><br>")
            .replace(/\r\n|\r|\n/g, "<br>");
    });

    // Descriptions may now be multi-line; meta tags and JSON-LD want one line.
    eleventyConfig.addFilter("oneLine", (value) =>
        String(value === null || value === undefined ? "" : value).replace(/\s+/g, " ").trim()
    );

    eleventyConfig.addFilter("ogSlug", ogSlug);

    eleventyConfig.addFilter("published", (items) =>
        (items || []).filter(item => !item.draft)
    );

    eleventyConfig.addFilter("countUnique", (list, attribute) =>
        new Set((list || []).map(item => item[attribute])).size
    );

    // Certificate dates are authored as free text ("January 2025"). Localise
    // the ones that parse as a date and pass anything else through untouched.
    eleventyConfig.addFilter("monthYear", (value, locale = 'en-GB') => {
        if (!value) return value;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
    });

    // Posts declare the language they are written in via `docLang` (en|de);
    // anything without it counts as English.
    eleventyConfig.addFilter("byLang", (posts, lang) =>
        (posts || []).filter(post => (post.data.docLang || "en") === lang)
    );

    // The pages that are built once per language (`locales` in their front
    // matter) and live under /de/ in German, plus the per-language feed.
    // Keep in sync with those templates and the feed setup above.
    const LOCALIZED_PATHS = new Set(["/", "/blog/", "/certificates/", "/feed.xml"]);

    // "/blog/" -> "/de/blog/" and "/#work" -> "/de/#work" on German pages, so a
    // link never drops the reader back into the other language. Pages without
    // a German twin (tags, legal pages, the feed) keep their one URL.
    eleventyConfig.addFilter("localeUrl", (url, lang) => {
        if (lang !== "de") return url;
        const [path, hash] = String(url).split("#");
        if (!LOCALIZED_PATHS.has(path)) return url;
        return `/de${path}${hash === undefined ? "" : "#" + hash}`;
    });

    // A post and its translation share a key: `translationKey` when set (the
    // CMS names files after the title, so new pairs need it), else the project
    // slug for project pages, else the filename without its -de/-en suffix.
    const translationKey = (item) =>
        item.data.translationKey || item.data.project || item.page.fileSlug.replace(/-(de|en)$/, "");

    // Every language version of the page at `inputPath`, itself included, for
    // hreflang and the "read in…" link. Empty while a page has no translation.
    eleventyConfig.addFilter("translations", (items, inputPath) => {
        const self = (items || []).find(item => item.inputPath === inputPath);
        if (!self) return [];
        const key = translationKey(self);
        const versions = items.filter(item => translationKey(item) === key);
        return versions.length > 1 ? versions : [];
    });

    // The layout already renders the title as the page's <h1>, so a "# Heading"
    // in a post body would make a second one. Markdown escapes "<" inside code,
    // so only real heading tags match.
    eleventyConfig.addFilter("demoteH1", (html) =>
        String(html || "").replace(/<(\/?)h1(?=[\s>])/g, "<$1h2")
    );


    eleventyConfig.addGlobalData("year", () => new Date().getFullYear());

    eleventyConfig.addGlobalData("buildTime", () => {
        return Date.now();
    });

    return {
        markdownTemplateEngine: "njk",
        dataTemplateEngine: "njk",
        htmlTemplateEngine: "njk",

        dir: {
            input: "src",
            output: "_site"
        }
    };


};