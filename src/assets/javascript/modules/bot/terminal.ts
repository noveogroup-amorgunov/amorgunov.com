/* eslint-disable class-methods-use-this, @typescript-eslint/ban-ts-comment */

const template = `
    <div class="term">
        <div class="term-bar">
            <div class="term-winctrl">
                <span class="term-btn close"></span>
                <span class="term-btn minimise"></span>
                <span class="term-btn maximise"></span>
            </div>
        </div>
        <div class="term-cont">
            <div class="term-lines">
                {lines}
            </div>
            <div class="term-line">
              ~$ <span contentEditable="true" class="term-cmd current">{text}</span>
            </div>
        </div>
    </div>
`;

export class Terminal {
  el: HTMLDivElement;

  lines: string[];

  text: string;

  $cont: HTMLDivElement;

  $lines: HTMLDivElement;

  $cmd: HTMLDivElement;

  constructor(el: HTMLDivElement, { text = '' } = {}) {
    this.el = el;
    this.lines = [];
    this.text = text;

    this.render();

    this.el.addEventListener('click', () => this.$cmd.focus());

    setTimeout(() => {
      this.$cont = this.el.querySelector('.term-cont');
      this.$lines = this.el.querySelector('.term-lines');
      this.$cmd = this.el.querySelector('.term-cmd.current');

      this.$cmd.addEventListener('keydown', this.onKeyDown.bind(this));
    });
  }

  onKeyDown(e: KeyboardEvent) {
    const line = (e.target as HTMLDivElement).innerHTML;

    if (e.keyCode === 13) {
      e.preventDefault();

      this.addLine(line);

      // @ts-ignore
      this.readLine(line);
    }
  }

  addLine(line: string) {
    this.lines.push(line);

    this.$lines.innerHTML = this.lines
      .map(text => `<div class="term-line"><span class="term-cmd">~$&nbsp;${text}</span></div>`)
      .join('');

    this.$cmd.innerHTML = '';
    this.$cont.scrollTop = this.$cont.scrollHeight;
  }

  readLine() {
    return false;
  }

  render() {
    if (!this.el) {
      return;
    }
    this.el.innerHTML = template.replace('{text}', this.text).replace('{lines}', '');
  }
}
