const handlebars = require('handlebars')
const helpers = require('handlebars-helpers')()

const HELPERS_LIST_KEYS = ['append', 'plus', 'eq', 'not', 'or', 'JSONstringify']

module.exports = function registerHandlebars(config) {
  config.setLibrary('hbs', handlebars)

  HELPERS_LIST_KEYS.forEach((helperKey) => {
    config.addHandlebarsHelper(helperKey, helpers[helperKey])
  })
}
