const mathFilters = require('./site/src/filters/mathFilters');
const stringFilters = require('./site/src/filters/stringFilters');
const dateFilters = require('./site/src/filters/dateFilters');

module.exports = function (eleventyConfig) {
  eleventyConfig.addLayoutAlias('base', 'layout-base.njk');
  eleventyConfig.addLayoutAlias('generic', 'layout-generic.njk');

  eleventyConfig.addPassthroughCopy('site/**/*.css');
  eleventyConfig.addPassthroughCopy('site/**/*.js');
  eleventyConfig.addPassthroughCopy('site/**/*.png');
  eleventyConfig.addPassthroughCopy('site/**/*.gif');
  eleventyConfig.addPassthroughCopy('site/**/*.jpg');
  eleventyConfig.addPassthroughCopy('site/**/*.jpeg');
  eleventyConfig.addPassthroughCopy('site/**/*.csv');
  eleventyConfig.addPassthroughCopy({
    'site/src/fonts/**/*.eot': 'fonts',
    'site/src/fonts/**/*.otf': 'fonts',
    'site/src/fonts/**/*.ttf': 'fonts',
    'site/src/fonts/**/*.woff': 'fonts',
    'site/src/fonts/**/*.woff2': 'fonts',
  });

  eleventyConfig.addFilter('round', mathFilters.round);
  eleventyConfig.addFilter('formatNumber', mathFilters.formatNumber);
  eleventyConfig.addFilter(
    'removeTrailingSlash',
    stringFilters.removeTrailingSlash
  );
  eleventyConfig.addFilter('formatDate', dateFilters.formatDateFilter);
  eleventyConfig.addFilter('currentDate', dateFilters.currentDateFilter);

  return {
    dir: {
      input: 'site',
      data: 'data',
      includes: 'src/includes',
      output: 'dist',
    },
  };
};
