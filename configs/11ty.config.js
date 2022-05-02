const fs = require('fs');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const htmlmin = require('html-minifier');

const NOT_LINE_NUMBERS_LANG = ['treeview', 'bash', 'json', 'env'];

const HTML_ESCAPE_TEST_RE = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
const HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

const components = require(`../src/_includes/components`);
const filters = require(`../src/_includes/filters`);

const tagListCollection = require(`../src/_includes/collections/tagList`);

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
  highlight: function (str, meta = 'default') {
    const [lang, turnOffLineNumbers] = meta.split('##');
    const noLineNumbersClass = turnOffLineNumbers === '1' || NOT_LINE_NUMBERS_LANG.includes(lang) ? 'no-line-numbers' : '';
    return `<pre class="language-${lang} ${noLineNumbersClass}"><code class="language-${lang}">${escapeHtml(str)}</code></pre>`;
  }
};

const markdownItAnchorOptions = {
  permalink: true,
  permalinkClass: 'direct-link',
  permalinkSymbol: '#',
};

module.exports = function (config) {
  // Needed to prevent eleventy from ignoring changes to webpack layouts
  // since it is in our `.gitignore`
  config.setUseGitIgnore(false);

  config.addPlugin(pluginRss);

  config.setDataDeepMerge(true);

  config.addLayoutAlias('post', 'layouts/post.njk');

  config.addCollection('tagList', tagListCollection);

  config.addFilter('version', filters.version);
  config.addFilter('readableDate', filters.readableDate);
  config.addFilter('readableDateShort', filters.readableDateShort);
  config.addFilter('random', filters.swapListItem);
  config.addFilter('relatedPosts', filters.relatedPosts);
  config.addFilter('toJSON', filters.toJSON);
  config.addFilter('htmlDateString', filters.htmlDateString);
  config.addFilter('head', filters.head);

  config.addShortcode('TagList', components.TagList);
  config.addShortcode('PostList', components.PostList);
  config.addShortcode('Pagination', components.Pagination);

  config.addPassthroughCopy('src/assets/build');
  config.addPassthroughCopy('src/assets/images');
  config.addPassthroughCopy('src/assets/cache-polyfill.js');
  config.addPassthroughCopy('src/assets/prism.js');
  config.addPassthroughCopy('src/assets/js-quiz-1.json');
  config.addPassthroughCopy('src/_redirects');
  config.addPassthroughCopy('src/manifest.json');

  config.setLibrary(
    'md',
    markdownIt(markdownItOptions).use(markdownItAnchor, markdownItAnchorOptions)
  );

  // Minify eleventy pages in production
  if (process.env.NODE_ENV === 'production') {
    config.addTransform('html-min', (content, outputPath) =>
      outputPath.endsWith('.html') ? htmlmin.minify(content, htmlMinOptions) : content
    );
  }

  config.setBrowserSyncConfig({
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
