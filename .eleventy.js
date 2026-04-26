const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const Image = require("@11ty/eleventy-img");
const path = require('path');

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

    // 2. Add the Async Shortcode
    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

    // Make sure it works in Markdown files too
    eleventyConfig.addLiquidShortcode("image", imageShortcode);
    eleventyConfig.addJavaScriptFunction("image", imageShortcode);



    eleventyConfig.addPlugin(feedPlugin, {
        type: "rss", // or "rss", "json"
        outputPath: "/feed.xml",
        collection: {
            name: "posts", // iterate over `collections.posts`
            limit: 10,     // 0 means no limit
        },
        metadata: {
            language: "en",
            title: "Blog Title",
            subtitle: "My Blog page for Kadir Gülec.",
            base: "https://kadirguelec.de/",
            author: {
                name: "Kadir Gülec",
                email: "", // Optional
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