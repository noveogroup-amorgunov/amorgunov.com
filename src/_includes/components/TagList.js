const { html } = require('common-tags');
const swapListItem = require('../filters/swapListItem');

module.exports = ({ items, sectionClassName = 'tags-section', showTitle }) => {
  function renderTag(tag) {
    if (tag === 'posts') {
      return null;
    }

    const tagUrl = `/tags/${tag}/`;

    return html`
      <li class="tags__item">
        <a class="tags__item-link" href="${tagUrl}">${tag}</a>
      </li>
    `;
  }

  function renderTitle() {
    if (!showTitle) {
      return null;
    }

    return html`<h3 class="subtitle">Теги</h3>`;
  }

  return html`
    <section class="${sectionClassName}">
      ${renderTitle()}
      <ul class="tags">
        ${swapListItem(items).map(renderTag)}
      </ul>
    </section>
  `;
};
