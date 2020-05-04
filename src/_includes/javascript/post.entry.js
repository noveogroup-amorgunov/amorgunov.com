import '../stylesheets/post.entry.css';

import mediumZoom from 'medium-zoom';
import * as bot from './modules/bot/createBot';
import lazyload from './modules/lazyload';
import scroll from './modules/scroll';
import Quiz from './modules/quiz';
import prepareExternalLinks from './modules/prepareExternalLinks';
import initPostReactions from './modules/postReactions';
import initCopyToClipboard from './modules/copy';

console.log('post.entry.js');

const initHljs = _selectors => {
  const selectors = _selectors || document.querySelectorAll('pre code');

  selectors.forEach(el => {
    hljs.highlightBlock(el); // eslint-disable-line no-undef
  });
};

const initQuiz = selectors => {
  selectors.forEach(el => {
    const quiz = new Quiz(JSON.parse(el.dataset.opts), el);

    quiz.loadData().then(initHljs);
  });
};

const initTerminalBot = selectors => {
  selectors.forEach(el => bot.addHandlers(el.dataset.bot, bot.createBot(el)));
};

// eslint-disable-next-line max-statements
document.addEventListener('DOMContentLoaded', () => {
  const $postImages = document.querySelectorAll('.post img');
  const $terminals = document.querySelectorAll('.terminal');
  const $quizs = document.querySelectorAll('.quiz');
  const $codeBlocks = document.querySelectorAll('pre code');

  initQuiz($quizs);
  initTerminalBot($terminals);
  initCopyToClipboard();
  prepareExternalLinks();
  lazyload();
  initHljs($codeBlocks);
  initPostReactions();
  scroll();
  mediumZoom($postImages, { background: '#2f2f2ed6' });
});
