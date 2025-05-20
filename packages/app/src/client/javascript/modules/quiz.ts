interface IState {
  currentStep: number
  rightCount: number
  answers: string[]
  startTime: number
  endTime?: number
}

interface IOptions {
  dataUrl: string
  preview: boolean
}

interface IDataStep {
  content: string
  answers?: string[]
}

interface IData {
  steps: IDataStep[]
  answers: string
}

const defaultState: IState = {
  currentStep: 0,
  rightCount: 0,
  answers: [],
  startTime: null,
}

export class Quiz {
  opts: IOptions

  nodeEl: HTMLElement

  state: IState

  data: IData

  content: string

  constructor(opts: IOptions, nodeEl: HTMLElement) {
    this.opts = opts
    this.nodeEl = nodeEl
    this.state = { ...defaultState }
  }

  loadData() {
    return fetch(this.opts.dataUrl)
      .then(res => res.json())
      .then((data: IData) => {
        this.data = data
        this.render()
      })
  }

  render() {
    this.data.steps.forEach((step, idx) => this.renderStep(step, idx))

    Array.from(this.nodeEl.querySelectorAll('.quiz__btn')).forEach((element) => {
      element.addEventListener('click', event => this.changeStep(event))
    })

    this.nodeEl.querySelectorAll('.quiz__step')[0].classList.add('quiz__step_current')
  }

  changeStep(event: Event) {
    if (this.state.currentStep === this.data.steps.length - 1) {
      this.state = { ...defaultState, answers: [] }
      this.nodeEl.innerHTML = ''
      this.render()

      return
    }

    this.state.currentStep += 1

    if (!this.state.startTime) {
      this.state.startTime = Date.now()
    }

    this.nodeEl.querySelector('.quiz__step_current').classList.remove('quiz__step_current')

    const currentStepEl = this.nodeEl.querySelectorAll('.quiz__step')[this.state.currentStep]

    currentStepEl.classList.add('quiz__step_current')

    const { idx } = (event.currentTarget as HTMLDivElement).dataset

    if (typeof idx !== 'undefined') {
      this.state.answers.push(idx)
    }

    // Проверка на последний шаг и результаты
    if (this.state.currentStep === this.data.steps.length - 1) {
      this.state.endTime = Math.round((Date.now() - this.state.startTime) / 1000)

      const contentArr: string[] = []
      let joinedContent: string

      this.data.answers.split('').forEach((answer, i) => {
        if (answer === this.state.answers[i]) {
          this.state.rightCount += 1
        }
        else {
          contentArr.push(`<a href="#${i + 1}">#${i + 1}</a>`)
        }
      })

      if (contentArr.length === 0) {
        joinedContent
          = 'Очень круто!'
            + '<br/><br/><img src="/assets/images/2019-06-29-review-js-quiz-codefest/3.gif"/><br/>'
      }
      else {
        joinedContent = this.opts.preview
          ? ''
          : `<br/>Разбор неверных ответов:<br/>${contentArr.join(', ')}`
      }

      this.content = joinedContent
      const content = this.getStepContent(this.data.steps[this.data.steps.length - 1], 0)
      const selector = this.nodeEl.querySelectorAll('.quiz__step')[this.state.currentStep]

      selector.innerHTML = content
      selector.classList.add('quiz__step_current')

      selector.querySelector('.quiz__btn').addEventListener('click', e => this.changeStep(e))
    }
  }

  renderStep(step: IDataStep, idx: number) {
    const content = this.getStepContent(step, idx)

    this.nodeEl.appendChild(Quiz.generateDiv(content, 'quiz__step'))
  }

  getStepContent(step: IDataStep, idx: number) {
    let content = step.content
      .replace('{counter}', `${idx}/${this.data.steps.length - 2}`)
      .replace('{time}', String(this.state.endTime))
      .replace('{rightCount}', String(this.state.rightCount))
      .replace('{totalCount}', String(this.data.steps.length - 2))
      .replace('{wrongLinks}', this.content)

    if (step.answers) {
      const answers = step.answers.map(
        (answer, i) => `<button data-idx="${i}" class="quiz__btn">${answer}</button>`,
      )

      content += `<div class="quiz__answers">${answers.join('')}</div>`
    }

    return content
  }

  static generateDiv(content: string, className: string) {
    const div = document.createElement('div')

    div.className = className
    div.innerHTML = content

    return div
  }
}

export function registerQuiz() {
  const $quizs: NodeListOf<HTMLDivElement> = document.querySelectorAll('.quiz')

  if (!$quizs.length) {
    return
  }

  $quizs.forEach((el) => {
    if (el.dataset.opts) {
      const quiz = new Quiz(JSON.parse(el.dataset.opts), el)

      quiz.loadData()
    }
  })
}
