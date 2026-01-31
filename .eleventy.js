module.exports = function(eleventyConfig) {

    eleventyConfig.addPassthroughCopy("src/assets");

    eleventyConfig.addFilter("postDate", dateObj => {
        return new Date(dateObj).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).replace(',', '');
    });

    eleventyConfig.addGlobalData("year", () => new Date().getFullYear());
    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
};