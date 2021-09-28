import mediumZoom from 'medium-zoom';
import {initBurgerMenu} from './modules/burger';
import {lazyload} from './modules/lazyload';
import {initCopyToClipboard} from './modules/copy';
import {Quiz} from './modules/quiz';
import {scroll} from './modules/scroll';
import {prepareExternalLinks} from './modules/prepareExternalLinks';
import {initPostReactions} from './modules/postReactions';
import * as bot from './modules/bot/createBot';

import '../stylesheets/post.entry.css';

const initQuiz = (nodes: NodeListOf<HTMLDivElement>) => {
  nodes.forEach(el => {
    const quiz = new Quiz(JSON.parse(el.dataset.opts), el);

    quiz.loadData();
  });
};

const initTerminalBot = (nodes: NodeListOf<HTMLDivElement>) => {
  nodes.forEach(el => bot.addHandlers(el.dataset.bot, bot.createBot(el)));
};

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  const $postImages = document.querySelectorAll('.post img');
  const $terminals: NodeListOf<HTMLDivElement> = document.querySelectorAll('.terminal');
  const $quizs: NodeListOf<HTMLDivElement> = document.querySelectorAll('.quiz');

  initBurgerMenu();
  lazyload();
  initCopyToClipboard();
  mediumZoom($postImages, {background: '#2f2f2ed6'});
  initQuiz($quizs);
  initTerminalBot($terminals);
  prepareExternalLinks();
  initPostReactions();
  scroll();
});
