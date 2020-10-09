import { initBurgerMenu } from './modules/burger';
import { initCopyToClipboard } from './modules/copy';
import { Quiz } from './modules/quiz';

import '../stylesheets/main.entry.css';

const initQuiz = (nodes: NodeListOf<HTMLDivElement>) => {
  nodes.forEach(el => {
    const quiz = new Quiz(JSON.parse(el.dataset.opts), el);

    quiz.loadData();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const $quizs: NodeListOf<HTMLDivElement> = document.querySelectorAll('.quiz');

  initBurgerMenu();
  initCopyToClipboard();
  initQuiz($quizs);
});
