import '../stylesheets/main.entry.css';

import initCopyToClipboard from './modules/copy';
import Quiz from './modules/quiz';
import initBurgerMenu from './modules/burger';

const initQuiz = selectors => {
  selectors.forEach(el => {
    const quiz = new Quiz(JSON.parse(el.dataset.opts), el);

    quiz.loadData();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const $quizs = document.querySelectorAll('.quiz');

  initBurgerMenu();
  initQuiz($quizs);
  initCopyToClipboard();
});
