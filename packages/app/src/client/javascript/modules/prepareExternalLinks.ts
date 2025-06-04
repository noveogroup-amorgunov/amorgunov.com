function isExternalLink(url = '') {
  const { host } = document.location
  return url.startsWith('http') && !url.includes(host)
}

export function prepareExternalLinks() {
  document.querySelectorAll('.post a').forEach((a) => {
    const href = a.getAttribute('href')
    if (href && isExternalLink(href)) {
      a.setAttribute('rel', 'noreferrer external')
      a.setAttribute('target', '_blank')
    }
  })
}
