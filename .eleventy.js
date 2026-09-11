const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const Image = require("@11ty/eleventy-img");
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const cacheBuster = require('@mightyplow/eleventy-plugin-cache-buster');

async function imageShortcode(src, alt,cls = "", sizes = "(max-width: 768px) 100vw, 800px") {
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
        loading: "lazy",
        decoding: "async",
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
        <text x="80" y="572" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="bold" fill="${OG_ACCENT}">kadirguelec.de</text>
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
        <text x="80" y="560" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="bold" fill="#f0801f">kadirguelec.de</text>
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

    // 2. Add the Async Shortcode
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

    // Make sure it works in Markdown files too
    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);



    eleventyConfig.addPlugin(feedPlugin, {
        type: "rss",
        outputPath: "/feed.xml",
        collection: {
            name: "post",
            limit: 10,
        },
        metadata: {
            language: "en",
            title: "Kadir Gülec — Blog",
            subtitle: "Notes on web development, the TALL stack, and the road from Umschulung to software developer.",
            base: "https://kadirguelec.de/",
            author: {
                name: "Kadir Gülec",
                email: "",
            }
        }
    });

    eleventyConfig.addFilter("isoDate", (dateObj) => {
        return dateObj.toISOString();
    });

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

    eleventyConfig.addShortcode("lastUpdated", () => {
        return new Date().toLocaleDateString('de-DE', {
            timeZone: 'Europe/Berlin',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    })

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