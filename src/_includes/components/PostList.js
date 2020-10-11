const { html } = require('common-tags');
const readableDate = require('../filters/readableDate');
const htmlDateString = require('../filters/htmlDateString');

module.exports = ({ items, showQuiz, currentUrl }) => {
  function renderPost(post) {
    if (!post.data) {
      return null;
    }

    const styles = post.data.bg ? `background-image: url('${post.data.bg}');` : '';
    const classes = [
      'posts__item',
      post.url === currentUrl && 'posts__item_active',
      post.data.bg && 'posts__item_theme_light',
    ].filter(Boolean);

    return html`
      <div style="${styles}" class="${classes}">
        <time class="posts__date" datetime="${htmlDateString(post.date)}">
          ${readableDate(post.date)}
        </time>
        <a href="${post.url}" class="posts__link ${post.data.class}">${post.data.title}</a>
        <div class="posts__desc">${post.data.description}</div>
        <div class="posts__like-icon">${post.data.likes}</div>
      </div>
    `;
  }

  function renderQuiz() {
    if (!showQuiz) {
      return null;
    }

    // prettier-ignore
    return html`
      <a href="/javascript-quiz?from=home" class="posts__item posts__item_type_quiz">
        JSQ
      </a>`;
  }

  // prettier-ignore
  return html`
    <section class="post-section">
      <ul class="posts">
        ${items.reverse().map(renderPost)}
        ${renderQuiz()}
      </ul>
    </section>
  `;
};
