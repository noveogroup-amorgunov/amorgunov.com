export function registerMenuHandlers() {
  const $toggler = document.querySelector('.header__menu-toggler') as HTMLDivElement
  const $togglerCross = document.querySelector('.menu__toggler') as HTMLDivElement
  const $menu = document.querySelector('.menu') as HTMLDivElement
  const $menuOverlay = document.querySelector('.menu__overlay') as HTMLDivElement

  function openMenu(event: MouseEvent) {
    event.preventDefault()
    $menu.classList.add('menu_opened')
  }

  function closeMenu(event: MouseEvent) {
    event.preventDefault()
    $menu.classList.remove('menu_opened')
  }

  $toggler.addEventListener('click', openMenu)
  $menuOverlay.addEventListener('click', closeMenu)
  $togglerCross.addEventListener('click', closeMenu)

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      $menu.classList.remove('menu_opened')
    }
  })
}
