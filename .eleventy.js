const { feedPlugin } = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/.htaccess");

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
    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };


};