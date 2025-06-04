type Nullable<T> = T | null

type Theme = 'dark' | 'light'

function getPreferedTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadThemeFromStorage(): Nullable<Theme> {
  return localStorage.getItem('theme') as Nullable<Theme>
}

function saveThemeToStorage(theme: Theme) {
  return localStorage.setItem('theme', theme)
}

function setTheme(theme: Theme) {
  saveThemeToStorage(theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export function syncTheme() {
  const currentTheme = loadThemeFromStorage() || getPreferedTheme()
  setTheme(currentTheme)
}

export function registerThemeToggler() {
  const $toggler = document.querySelector('.header__theme-toggler') as Nullable<HTMLDivElement>

  if (!$toggler) {
    return
  }

  $toggler.setAttribute('aria-label', `Сменить тему на ${document.documentElement.getAttribute('data-theme') === 'light' ? 'тёмную' : 'светлую'}`)

  function onTogglerClick(event: MouseEvent) {
    event.preventDefault()

    const theme = document.documentElement.getAttribute('data-theme') as Theme
    const nextTheme = theme === 'light' ? 'dark' : 'light'

    setTheme(nextTheme)

    $toggler?.setAttribute('aria-label', `Сменить тему на ${nextTheme === 'light' ? 'тёмную' : 'светлую'}`)
  }

  $toggler.addEventListener('click', onTogglerClick)
}
