const { html } = require('common-tags');
const readableDate = require('../filters/readableDate');
const htmlDateString = require('../filters/htmlDateString');

module.exports = ({ pagination }) => {
  function renderPrev() {
    if (!pagination.nextPageLink) {
      return null;
    }

    const prevPageLink = `/posts/page/${pagination.pageNumber + 1}`;
    // prettier-ignore
    return html`
      <a class="pagination__item" href="${prevPageLink}" rel="prev">
        К старым постам
      </a>
    `;
  }

  function renderNext() {
    if (!pagination.previousPageLink) {
      return null;
    }

    const prevPageNumber = pagination.pageNumber - 1;
    const nextPageLink = pagination.pageNumber === 1 ? '/posts/' : `/posts/page/${prevPageNumber}`;

    // prettier-ignore
    return html`
      <a class="pagination__item" href="${nextPageLink}" rel="next">
        К новым
      </a>
    `;
  }

  // prettier-ignore
  return html`
    <section class="pagination-section">
      <nav class="pagination">
        ${renderPrev()}
        ${renderNext()}
      </nav>
    </section>
  `;
};
