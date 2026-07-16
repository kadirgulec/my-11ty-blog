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

function ogImageSvg(title) {
    const lines = wrapTitle(title);
    const text = lines.map((l, i) =>
        `<text x="80" y="${240 + i * 82}" font-family="DejaVu Sans, Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">${xmlEscape(l)}</text>`
    ).join("\n");
    return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#111827"/>
        <rect width="1200" height="12" fill="#6366f1"/>
        <text x="80" y="130" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="bold" fill="#818cf8">BLOG</text>
        ${text}
        <text x="80" y="560" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="bold" fill="#818cf8">kadirguelec.de</text>
        <text x="1120" y="560" text-anchor="end" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="#9ca3af">Kadir Gülec</text>
    </svg>`;
}

module.exports = function(eleventyConfig) {

    // Generate a social share image (1200x630 PNG) for every post after each build
    eleventyConfig.on("eleventy.after", async ({ results }) => {
        const posts = results.filter(r => r.url && /^\/posts\/[^/]+\/$/.test(r.url) && r.content);
        if (!posts.length) return;
        fs.mkdirSync("./_site/assets/og", { recursive: true });
        await Promise.all(posts.map(async (post) => {
            const slug = post.url.split("/")[2];
            const m = post.content.match(/<meta property="og:title" content="([^"]*)"/);
            const title = m ? htmlUnescape(m[1]) : slug;
            await sharp(Buffer.from(ogImageSvg(title))).png().toFile(`./_site/assets/og/${slug}.png`);
        }));
    });

    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/.htaccess");

    // Ship the Sveltia CMS admin page verbatim (not processed as a Nunjucks template)
    eleventyConfig.addPassthroughCopy("src/admin");

    // Exclude draft posts from production builds (output, collections, and RSS).
    // Drafts stay visible during local dev (`--serve`) so you can preview them.
    eleventyConfig.addPreprocessor("drafts", "*", (data) => {
        if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
            return false;
        }
    });

    // Build-time syntax highlighting for Markdown code fences (no client JS)
    eleventyConfig.addPlugin(syntaxHighlight);

    // Add cache buster plugin
    eleventyConfig.addPlugin(cacheBuster({
        outputDirectory: '_site'
    }));

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

    eleventyConfig.addFilter("postDate", dateObj => {
        return new Date(dateObj).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).replace(',', '');
    });

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