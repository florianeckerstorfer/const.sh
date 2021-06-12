const mathFilters = require('./src/filters/mathFilters');
const stringFilters = require('./src/filters/stringFilters');
const dateFilters = require('./src/filters/dateFilters');

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
    'src/fonts/**/*.eot': 'fonts',
    'src/fonts/**/*.otf': 'fonts',
    'src/fonts/**/*.ttf': 'fonts',
    'src/fonts/**/*.woff': 'fonts',
    'src/fonts/**/*.woff2': 'fonts',
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
      includes: '../src/includes',
      output: 'dist',
    },
  };
};
