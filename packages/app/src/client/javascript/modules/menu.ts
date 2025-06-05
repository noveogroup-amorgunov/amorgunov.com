export function registerMenuHandlers() {
  const $toggler = document.querySelector('.header__menu-toggler') as HTMLDivElement
  const $togglerCross = document.querySelector('.menu__toggler') as HTMLDivElement
  const $dialog = document.querySelector('dialog.menu') as HTMLDialogElement

  function openMenu(event: MouseEvent) {
    event.preventDefault()
    $dialog.showModal()
  }

  function closeMenu(event: MouseEvent) {
    event.preventDefault()
    $dialog.close()
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
      $dialog.close()
    }
  })
}
