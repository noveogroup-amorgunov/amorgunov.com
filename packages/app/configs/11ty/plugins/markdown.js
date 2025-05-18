const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')

const NOT_LINE_NUMBERS_LANG = ['treeview', 'bash', 'json', 'env']

const HTML_ESCAPE_TEST_RE = /[&<>"]/
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g
const HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch]
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar)
  }
  return str
}

const markdownItOptions = {
  html: true,
  breaks: false,
  linkify: true,
  highlight(str, meta = 'default') {
    const [lang, turnOffLineNumbers] = meta.split('##')
    const noLineNumbersClass
      = turnOffLineNumbers === '1' || NOT_LINE_NUMBERS_LANG.includes(lang) ? 'no-line-numbers' : ''
    return `<pre class="language-${lang} ${noLineNumbersClass}"><code class="language-${lang}">${escapeHtml(
      str,
    )}</code></pre>`
  },
}

const markdownItAnchorOptions = {
  permalink: true,
  permalinkClass: 'direct-link',
  permalinkSymbol: '#',
}

module.exports = function registerMarkdown(config) {
  const plugin = markdownIt(markdownItOptions).use(markdownItAnchor, markdownItAnchorOptions)

  config.setLibrary('md', plugin)
}
