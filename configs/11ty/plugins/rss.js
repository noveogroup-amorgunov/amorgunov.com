const process = require('node:process')
const pluginRss = require('@11ty/eleventy-plugin-rss')

module.exports = function registerRss(config) {
  if (process.env.NODE_ENV === 'production') {
    config.addPlugin(pluginRss)
  }
  else {
    config.ignores.add('./src/pages/feed.xml.njk')
    config.ignores.add('./src/pages/sitemap.xml.njk')
  }
}
