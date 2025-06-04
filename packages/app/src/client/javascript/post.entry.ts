import registerImageZoom from 'medium-zoom'
import { registerA11y } from './modules/a11y'
import { registerTerminals } from './modules/bot/createBot'
import { initCopyToClipboard as registerCopyToClipboard } from './modules/copy'
import { lazyload as registerImageLazyload } from './modules/lazyload'
import { registerMenuHandlers } from './modules/menu'
import { registerPostReactions } from './modules/postReactions'
import { prepareExternalLinks as registerExternalLinks } from './modules/prepareExternalLinks'
import { scroll as registerScrollTop } from './modules/scroll'
import { registerShare } from './modules/share'

import { registerThemeToggler, syncTheme } from './modules/theme'

import '../stylesheets/post.entry.css'

syncTheme()

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded')

  const $postImages = document.querySelectorAll('.post__content img')
  const $terminals: NodeListOf<HTMLDivElement> = document.querySelectorAll('.terminal')

  registerMenuHandlers()
  registerCopyToClipboard()
  registerImageLazyload()
  registerImageZoom($postImages, { background: '#2f2f2ed6' })
  registerPostReactions()
  registerExternalLinks()
  registerScrollTop()
  registerTerminals($terminals)
  registerShare()
  registerThemeToggler()
  registerA11y()
})
