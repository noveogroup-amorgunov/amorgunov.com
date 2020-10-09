import * as ClipboardJS from 'clipboard';

export function initCopyToClipboard() {
  document.querySelectorAll('.copy-btn').forEach(el => {
    const clipboard = new ClipboardJS(el);

    clipboard.on('success', e => {
      if (!e.trigger.innerHTML.endsWith(' copied!')) {
        const defaultText = e.trigger.innerHTML;

        e.trigger.innerHTML += ' copied!';

        // eslint-disable-next-line
        setTimeout(() => {
          e.trigger.innerHTML = defaultText;
        }, 2000);
      }
    });
  });
}
