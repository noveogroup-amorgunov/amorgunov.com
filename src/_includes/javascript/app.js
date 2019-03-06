import '@babel/polyfill';
import '../stylesheets/app.css';

import lazyload from './lazyload';
import scroll from './scroll';
import { addHandlers, createBot } from './createBot';
import prepareExternalLinks from './prepareExternalLinks';

document.addEventListener('DOMContentLoaded', () => {
  prepareExternalLinks();
  lazyload();

  document.querySelectorAll('pre code').forEach(el => {
    hljs.highlightBlock(el); // eslint-disable-line no-undef
  });

  document.querySelectorAll('.terminal').forEach(el => {
    addHandlers(el.dataset.bot, createBot(el));
  });

  scroll();
});
