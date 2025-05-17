export function isWebShareSupported() {
  if (!('share' in window.navigator)) {
    return false
  }

  if ('canShare' in navigator) {
    const url = `https://${window.location.hostname}`
    return (window.navigator as any).canShare({ url })
  }

  return true
}

export function registerShare() {
  const button = document.querySelector('[data-id=share-button') as HTMLButtonElement

  if (!button || !isWebShareSupported()) {
    return
  }

  const shareData = {
    text: document.title,
    url: window.location.href,
  }

  button.addEventListener('click', (event: MouseEvent) => {
    try {
      event.preventDefault()
      navigator.share(shareData)
    }
    catch (err) {
      console.error(err)
    }
  })
}
