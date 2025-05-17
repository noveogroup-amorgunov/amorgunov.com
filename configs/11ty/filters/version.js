const process = require('node:process')

module.exports = () => {
  const version = process.env.COMMIT_REF || 'dev'

  return version
}
