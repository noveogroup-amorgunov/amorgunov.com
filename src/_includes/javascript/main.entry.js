import '../stylesheets/main.entry.css';

import initCopyToClipboard from './modules/copy';
import Quiz from './modules/quiz';

const initQuiz = selectors => {
  selectors.forEach(el => {
    const quiz = new Quiz(JSON.parse(el.dataset.opts), el);

    quiz.loadData();
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const $quizs = document.querySelectorAll('.quiz');

  initQuiz($quizs);
  initCopyToClipboard();
});
