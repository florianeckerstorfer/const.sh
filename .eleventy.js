const dayjs = require('dayjs');
const covid19AtFilters = require('./src/filters/covid19AtFilters');
const mathFilters = require('./src/filters/mathFilters');

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
  eleventyConfig.addPassthroughCopy({ 'src/styles/**/*.css': 'styles' });
  eleventyConfig.addPassthroughCopy({
    'src/fonts/**/*.otf': 'fonts',
    'src/fonts/**/*.ttf': 'fonts',
    'src/fonts/**/*.woff': 'fonts',
    'src/fonts/**/*.woff2': 'fonts',
  });

  eleventyConfig.addFilter(
    'covid19AtRowByProvince',
    covid19AtFilters.covid19AtRowByProvince
  );

  eleventyConfig.addFilter('round', mathFilters.round);

  return {
    dir: {
      input: 'site',
      data: 'data',
      includes: '../src/includes',
      output: 'dist',
    },
  };
};
