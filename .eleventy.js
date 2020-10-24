module.exports = function (eleventyConfig) {
  eleventyConfig.addLayoutAlias('base', 'layout-base.njk');
  eleventyConfig.addLayoutAlias('generic', 'layout-generic.njk');

  return {
    dir: {
      input: 'site',
      includes: '../src/includes',
      output: 'dist',
    },
  };
};
