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

declare global {
  interface Window {
    hljs: {highlightBlock: (el: HTMLElement) => void};
  }
}

const initHljs = (passedNodes?: NodeListOf<HTMLElement>) => {
  const nodes: NodeListOf<HTMLElement> = passedNodes || document.querySelectorAll('pre code');
  const hljsIsLoaded = 'hljs' in window;

  if (!hljsIsLoaded) {
    return setTimeout(() => {
      initHljs(passedNodes);
    }, 300);
  }

  nodes.forEach(el => {
    window.hljs.highlightBlock(el);
  });
};

const initQuiz = (nodes: NodeListOf<HTMLDivElement>) => {
  nodes.forEach(el => {
    const quiz = new Quiz(JSON.parse(el.dataset.opts), el);

    quiz.loadData().then(() => initHljs());
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
  const $codeBlocks: NodeListOf<HTMLElement> = document.querySelectorAll('pre code');

  initBurgerMenu();
  lazyload();
  initCopyToClipboard();
  mediumZoom($postImages, {background: '#2f2f2ed6'});
  initQuiz($quizs);
  initHljs($codeBlocks);
  initTerminalBot($terminals);
  prepareExternalLinks();
  initPostReactions();
  scroll();
});
