const defaultState = {
  currentStep: 0,
  rightCount: 0,
  answers: [],
  startTime: null
};

class Quiz {
  constructor(opts, selector) {
    this.opts = opts;
    this.selector = selector;
    this.state = { ...defaultState };
  }

  loadData() {
    return fetch(this.opts.dataUrl)
      .then(res => res.json())
      .then(data => {
        this.data = data;
        this.render();
      });
  }

  render() {
    this.data.steps.forEach((step, idx) => this.renderStep(step, idx));

    Array
      .from(this.selector.querySelectorAll('.quiz__btn'))
      .forEach(element => {
        element.addEventListener('click', event => this.changeStep(event));
      });

    this.selector
      .querySelectorAll('.quiz__step')[0]
      .classList.add('quiz__step_current');
  }

  // eslint-disable-next-line
  changeStep(event) {
    if (this.state.currentStep === this.data.steps.length - 1) {
      this.state = { ...defaultState, answers: [] };
      this.selector.innerHTML = '';
      this.render();

      return;
    }

    this.state.currentStep += 1;

    if (!this.state.startTime) {
      this.state.startTime = Date.now();
    }

    this.selector
      .querySelector('.quiz__step_current')
      .classList.remove('quiz__step_current');
    this.selector
      .querySelectorAll('.quiz__step')[this.state.currentStep]
      .classList.add('quiz__step_current');

    const { idx } = event.currentTarget.dataset;

    if (typeof idx !== 'undefined') {
      this.state.answers.push(idx);
    }

    // Проверка на последний шаг и результаты
    if (this.state.currentStep === this.data.steps.length - 1) {
      this.state.endTime = Math.round((Date.now() - this.state.startTime) / 1000);

      let c = [];

      this.data.answers.split('').forEach((answer, i) => {
        if (answer === this.state.answers[i]) {
          this.state.rightCount += 1;
        } else {
          c.push(`<a href="#${i + 1}">#${i + 1}</a>`);
        }
      });

      if (c.length === 0) {
        c = 'Очень круто!' +
          '<br/><br/><img src="/assets/images/2019-04-05-review-js-quiz-codefest/3.gif"/><br/>';
      } else {
        c = this.opts.preview ? '' : `<br/>Разбор неверных ответов:<br/>${c.join(', ')}`;
      }

      this.content = c;
      const content = this.getStepContent(this.data.steps[this.data.steps.length - 1], 0);
      const selector = this.selector.querySelectorAll('.quiz__step')[this.state.currentStep];

      selector.innerHTML = content;
      selector.classList.add('quiz__step_current');

      selector
        .querySelector('.quiz__btn')
        .addEventListener('click', e => this.changeStep(e));
    }
  }

  renderStep(step, idx) {
    const content = this.getStepContent(step, idx);

    this.selector.appendChild(Quiz.generateDiv(content, 'quiz__step'));
  }

  getStepContent(step, idx) {
    let content = step.content
      .replace('{counter}', `${idx}/${this.data.steps.length - 2}`)
      .replace('{time}', this.state.endTime)
      .replace('{rightCount}', this.state.rightCount)
      .replace('{totalCount}', this.data.steps.length - 2)
      .replace('{wrongLinks}', this.content);

    if (step.answers) {
      const answers = step.answers.map((answer, i) => {
        return `<button data-idx="${i}" class="quiz__btn">${answer}</button>`;
      });

      content += `<div class="quiz__answers">${answers.join('')}</div>`;
    }

    return content;
  }

  static generateDiv(content, className) {
    const div = document.createElement('div');

    div.className = className;
    div.innerHTML = content;

    return div;
  }
}

export default Quiz;
