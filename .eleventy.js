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

  return {
    dir: {
      input: 'site',
      includes: '../src/includes',
      output: 'dist',
    },
  };
};
