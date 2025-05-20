const filters = require(`./filters`)
const collections = require(`./collections`)
const plugins = require(`./plugins`)

module.exports = function (config) {
  // To prevent eleventy from ignoring changes to webpack layouts
  // since it is in our `.gitignore`
  config.setUseGitIgnore(false)

  config.setDataDeepMerge(true)

  // Collections
  config.addCollection('tagList', collections.getTagList)
  config.addCollection('tags', collections.getAllTags)
  config.addCollection('tagsWithPostsCount', collections.getAllTagsWithPostsCount)
  config.addCollection('popularPosts', collections.getPopularPosts)
  config.addCollection('posts', collections.getAllPosts)

  // Filters
  config.addFilter('version', filters.version)
  config.addFilter('readableDate', filters.readableDate)
  config.addFilter('readableDateShort', filters.readableDateShort)
  config.addFilter('random', filters.swapListItem)
  config.addFilter('relatedPosts', filters.relatedPosts)
  config.addFilter('toJSON', filters.toJSON)
  config.addFilter('htmlDateString', filters.htmlDateString)
  config.addFilter('head', filters.head)
  config.addFilter('paginationSize', filters.paginationSize)
  config.addFilter('reverse', filters.reverse)

  // Copy client assets and bundles
  config.addPassthroughCopy('src/client/build')
  config.addPassthroughCopy('src/assets')
  config.addPassthroughCopy('src/_redirects')
  config.addPassthroughCopy('src/manifest.json')

  // Register plugins
  plugins.registerRss(config)
  plugins.registerMarkdown(config)
  plugins.registerHandlebars(config)
  plugins.registerBrowserSync(config)
  plugins.registerHtmlMinification(config)

  return {
    templateFormats: ['md', 'njk', 'hbs', 'html', 'liquid'],
    pathPrefix: '/',
    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'hbs',
    dataTemplateEngine: 'hbs',
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '../../dist',
    },
  }
}
