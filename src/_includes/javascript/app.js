import '@babel/polyfill';
import '../stylesheets/app.css';
import mediumZoom from 'medium-zoom';
import ClipboardJS from 'clipboard';

import lazyload from './lazyload';
import scroll from './scroll';
import { addHandlers, createBot } from './createBot';
import Quiz from './quiz';
import prepareExternalLinks from './prepareExternalLinks';

const initHljs = () => {
  document.querySelectorAll('pre code').forEach(el => {
    hljs.highlightBlock(el); // eslint-disable-line no-undef
  });
};

document.addEventListener('DOMContentLoaded', () => {
  prepareExternalLinks();
  lazyload();
  initHljs();
  mediumZoom(document.querySelectorAll('.post img'), { background: '#2f2f2ed6' });

  document.querySelectorAll('.quiz').forEach(el => {
    const quiz = new Quiz(JSON.parse(el.dataset.opts), el);

    quiz.loadData().then(initHljs);
  });

  document.querySelectorAll('.terminal').forEach(el => {
    addHandlers(el.dataset.bot, createBot(el));
  });

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

  scroll();
});
