const { DateTime } = require('luxon');
const fs = require('fs');
const pluginRss = require('@11ty/eleventy-plugin-rss');
// const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

// eslint-disable-next-line max-statements
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  // eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

  eleventyConfig.addFilter('version', value => {
    const version = process.env.COMMIT_REF || 'dev';

    return `${value}${version}`;
  });

  eleventyConfig.addFilter('readableDate', dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd/LL/yyyy');
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

  eleventyConfig.addFilter('readableDateShort', dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd/LL');
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

  eleventyConfig.addCollection('tagList', require('../src/_11ty/getTagList'));

  // eleventyConfig.addPassthroughCopy('./src/');
  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy('src/_redirects');
  eleventyConfig.addPassthroughCopy('src/manifest.json');

  /* Markdown Plugins */
  const markdownIt = require('markdown-it');
  const markdownItAnchor = require('markdown-it-anchor');
  const options = {
    html: true,
    breaks: false,
    linkify: true
  };
  const opts = {
    permalink: true,
    permalinkClass: 'direct-link',
    permalinkSymbol: '#'
  };

  eleventyConfig.setLibrary('md', markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready(err, browserSync) {
        const content404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content404);
          res.end();
        });
      }
    }
  });

  return {
    templateFormats: [
      'md',
      'njk',
      'html',
      'liquid'
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use '' or '/' (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site'
    }
  };
};
