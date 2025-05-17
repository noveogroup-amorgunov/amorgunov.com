const registerBrowserSync = require('./browserSync')
const registerHandlebars = require('./handlebars')
const registerHtmlMinification = require('./htmlMin')
const registerMarkdown = require('./markdown')
const registerRss = require('./rss')

module.exports = {
  registerMarkdown,
  registerHandlebars,
  registerBrowserSync,
  registerHtmlMinification,
  registerRss,
}
