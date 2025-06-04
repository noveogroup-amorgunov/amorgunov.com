function registerSkipToContent() {
  const $toggler = document.querySelector('#a11y-skip-to-content') as HTMLButtonElement
  const $main = document.querySelector('#main-content-id') as HTMLDivElement
  const $skippedLink = document.querySelector('#skipped-link-id') as HTMLAnchorElement

  if (!$toggler || !$main) {
    return
  }

  // Focus toggler on Alt-0
  window.addEventListener('keydown', (event) => {
    if (event.type === 'keydown') {
      if (event.code === 'Digit0' && event.altKey && !event.repeat) {
        $toggler.focus()
      }
    }
  }, false)

  $toggler.addEventListener('click', () => {
    $main.scrollIntoView({ behavior: 'smooth' })
    $skippedLink?.focus()
  })
}

export function registerA11y() {
  registerSkipToContent()
}
