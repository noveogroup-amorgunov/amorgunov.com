import * as ClipboardJS from 'clipboard'

export function initCopyToClipboard() {
  document.querySelectorAll('.copy-btn').forEach((el) => {
    const clipboard = new ClipboardJS(el)

    clipboard.on('success', (e) => {
      if (!e.trigger.innerHTML.endsWith(' 🤟')) {
        const defaultText = e.trigger.innerHTML

        e.trigger.innerHTML += ' 🤟'

        setTimeout(() => {
          e.trigger.innerHTML = defaultText
        }, 2000)
      }
    })
  })
}
