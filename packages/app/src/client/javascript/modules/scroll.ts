export function scroll() {
  const upContainer = document.querySelector('.post-layer__up')
  let lastScrolledY = 0

  if (!upContainer) {
    return
  }

  upContainer.addEventListener('click', () => {
    const scrolled = window.scrollY > 100

    if (lastScrolledY && !scrolled) {
      window.scrollTo(0, lastScrolledY)
      lastScrolledY = 0
    }
    else {
      lastScrolledY = window.scrollY
      window.scrollTo(0, 0)
    }
  })

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 100

    if (scrolled) {
      upContainer.classList.add('post-layer__up_scrolled')
      upContainer.classList.remove('post-layer__has_down_scroll')
    }
    else {
      upContainer.classList.remove('post-layer__up_scrolled')

      if (lastScrolledY) {
        upContainer.classList.add('post-layer__has_down_scroll')
      }
    }
  })
}
