export function initBurgerMenu() {
  const $burgerControl = document.querySelector('.header__menu');
  const $burgerOverlay = document.querySelector('.burger__overlay');
  const $burgerMenu = document.querySelector('.burger__menu');
  const state = {opened: false};

  function toggleMenu() {
    if (state.opened) {
      $burgerOverlay.classList.add('burger__overlay_opened');
      $burgerMenu.classList.add('burger__menu_opened');
    } else {
      $burgerOverlay.classList.remove('burger__overlay_opened');
      $burgerMenu.classList.remove('burger__menu_opened');
    }
  }

  $burgerControl.addEventListener('click', () => {
    state.opened = true;
    toggleMenu();
  });

  $burgerOverlay.addEventListener('click', () => {
    state.opened = false;
    toggleMenu();
  });
}
