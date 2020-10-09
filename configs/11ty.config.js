const fs = require('fs');
const { DateTime } = require('luxon');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const htmlmin = require('html-minifier');

const htmlMinOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
};

const markdownItOptions = {
  html: true,
  breaks: false,
  linkify: true,
};

const markdownItAnchorOptions = {
  permalink: true,
  permalinkClass: 'direct-link',
  permalinkSymbol: '#',
};

function getTagList(collection) {
  const tagSet = new Set();
  const skippedTag = ['all', 'nav', 'post', 'posts'];

  collection.getAll().forEach(item => {
    if ('tags' in item.data) {
      item.data.tags
        .filter(tagItem => !skippedTag.includes(tagItem))
        .forEach(tag => tagSet.add(tag));
    }
  });

  return [...tagSet];
}

module.exports = function (eleventyConfig) {
  // Needed to prevent eleventy from ignoring changes to `webpack.njk`
  // since it is in our `.gitignore`
  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

  eleventyConfig.addFilter('version', value => {
    const version = process.env.COMMIT_REF || 'dev';

    return `${value}${version}`;
  });

  eleventyConfig.addFilter('readableDate', dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd/LL/yyyy');
  });

  eleventyConfig.addFilter('readableDateShort', dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd/LL');
  });

  eleventyConfig.addFilter('random', (arr, n) => {
    return arr.sort(() => Math.random() - Math.random()).slice(0, n);
  });

  eleventyConfig.addFilter('relatedPosts', (arr, pageUrl, tags, n) => {
    const relatedPosts = [...arr];

    relatedPosts.forEach(post => {
      post.related = 0;

      (post.data.tags || []).forEach(tag => {
        if (tags.includes(tag)) {
          post.related += 1;
        }
      });
    });

    return relatedPosts
      .filter(post => post.url !== pageUrl)
      .sort((a, b) => b.related - a.related)
      .slice(0, n);
  });

  eleventyConfig.addFilter('toJSON', obj => {
    return JSON.stringify(obj);
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addCollection('tagList', getTagList);

  eleventyConfig.addPassthroughCopy('src/assets/build');
  eleventyConfig.addPassthroughCopy('src/assets/images');
  eleventyConfig.addPassthroughCopy('src/assets/cache-polyfill.js');
  eleventyConfig.addPassthroughCopy('src/assets/highlight.js');
  eleventyConfig.addPassthroughCopy('src/assets/js-quiz-1.json');
  eleventyConfig.addPassthroughCopy('src/assets/favicon.png');
  eleventyConfig.addPassthroughCopy('src/_redirects');
  eleventyConfig.addPassthroughCopy('src/manifest.json');

  eleventyConfig.setLibrary(
    'md',
    markdownIt(markdownItOptions).use(markdownItAnchor, markdownItAnchorOptions)
  );

  // Minify eleventy pages in production
  if (process.env.NODE_ENV === 'production') {
    eleventyConfig.addTransform('html-min', (content, outputPath) =>
      outputPath.endsWith('.html') ? htmlmin.minify(content, htmlMinOptions) : content
    );
  }

  eleventyConfig.setBrowserSyncConfig({
    reloadDelay: 2000,
    files: ['src', '!src/_includes/javascript/*', '!src/_includes/stylesheets/*'],
    callbacks: {
      ready(err, browserSync) {
        const content404 = fs.readFileSync('dist/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content404);
          res.end();
        });
      },
    },
  });

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],
    pathPrefix: '/',
    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: 'dist',
    },
  };
};
