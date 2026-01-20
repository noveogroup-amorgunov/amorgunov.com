import * as keyux from 'keyux'

function registerSkipToContent() {
  const $toggler = document.querySelector('#a11y-skip-to-content') as HTMLButtonElement
  const $main = document.querySelector('#main-content-id') as HTMLDivElement
  const $skippedLink = document.querySelector('#skipped-link-id') as HTMLAnchorElement

  if (!$toggler || !$main) {
    return
  }

  $toggler.innerHTML = `Пропустить (<kbd>${keyux.getHotKeyHint(window, 'alt+0')}</kbd>)`

  $toggler.addEventListener('click', () => {
    $main.scrollIntoView({ behavior: 'smooth' })
    $skippedLink.focus()
  })
}

export function registerA11y() {
  registerSkipToContent()
}
