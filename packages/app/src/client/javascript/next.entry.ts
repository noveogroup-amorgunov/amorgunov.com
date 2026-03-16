import { registerA11y } from './modules/a11y'
import { initCopyToClipboard as registerCopyToClipboard } from './modules/copy'
import { registerHotkeys } from './modules/hotkeys'
import { registerMenuHandlers } from './modules/menu'
import { registerQuiz } from './modules/quiz'
import { registerThemeToggler, syncTheme } from './modules/theme'

import '../stylesheets/next.entry.css'

syncTheme()

document.addEventListener('DOMContentLoaded', () => {
  registerQuiz()
  registerMenuHandlers()
  registerCopyToClipboard()
  registerThemeToggler()
  registerA11y()
  registerHotkeys()

  document.body.classList.add('loaded')
})
