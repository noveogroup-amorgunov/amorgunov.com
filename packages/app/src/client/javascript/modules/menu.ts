export function registerMenuHandlers() {
  const $toggler = document.querySelector('.header__menu-toggler') as HTMLDivElement
  const $togglerCross = document.querySelector('.menu__toggler') as HTMLDivElement
  const $dialog = document.querySelector('dialog.menu') as HTMLDialogElement
  const $mainContainer = document.querySelector('.page') as HTMLDivElement

  function openMenu(event: MouseEvent) {
    event.preventDefault()
    $dialog.showModal()
    $mainContainer.setAttribute('inert', 'true')
  }

  function closeMenu(event: MouseEvent | KeyboardEvent) {
    event.preventDefault()
    $mainContainer.removeAttribute('inert')

    setTimeout(() => {
      $dialog.close()
      $toggler.focus()
    }, 10)
  }

  function closeOnBackDropClick(event: MouseEvent) {
    const { target, currentTarget } = event
    const dialog = currentTarget
    const isClickedOnBackDrop = target === dialog

    if (isClickedOnBackDrop) {
      closeMenu(event)
    }
  }

  $toggler.addEventListener('click', openMenu)
  $dialog.addEventListener('click', closeOnBackDropClick)
  $togglerCross.addEventListener('click', closeMenu)

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMenu(event)
    }
  })
}
