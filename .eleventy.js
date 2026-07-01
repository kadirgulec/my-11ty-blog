const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");
const path = require('path');
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



module.exports = function(eleventyConfig) {

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