module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("src/assets");

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
            day: 'numeric',
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