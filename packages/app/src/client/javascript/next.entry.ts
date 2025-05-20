import { initCopyToClipboard as registerCopyToClipboard } from './modules/copy'
import { registerMenuHandlers } from './modules/menu'
import { registerQuiz } from './modules/quiz'
import { registerThemeToggler, syncTheme } from './modules/theme'

import '../stylesheets/next.entry.css'

syncTheme()

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded')

  registerQuiz()
  registerMenuHandlers()
  registerCopyToClipboard()
  registerThemeToggler()
})
