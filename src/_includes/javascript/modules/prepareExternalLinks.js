function isExternalLink(url = '') {
  const { host } = document.location;
  const isExternal = url.startsWith('http') && !url.includes(host);

  return isExternal;
}

export default function prepareExternalLinks() {
  document.querySelectorAll('.post a').forEach(a => {
    if (isExternalLink(a.getAttribute('href'))) {
      a.setAttribute('rel', 'noreferrer external');
      a.setAttribute('target', '_blank');
    }
  });
}
