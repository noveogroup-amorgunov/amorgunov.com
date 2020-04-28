const REACTION_ENDPOINT = 'https://i7on6ck7ng.execute-api.us-east-2.amazonaws.com/dev/posts/{slug}/likes';

export default function initPostReactions() {
  const postReactionWrapper = document.querySelector('.post__emotions');

  if (!postReactionWrapper) {
    return;
  }

  getReaction(postReactionWrapper);

  postReactionWrapper.addEventListener('click', event => {
    const { target } = event;

    if (!target || !target.dataset.type) {
      return;
    }

    setReaction(target.dataset.type, postReactionWrapper);
  });
}

function getSlug() {
  const [, slug] = document.location.pathname
    .match(/^\/posts\/([a-z0-9-_]+)/) || [];

  return slug;
}

function setReaction(type, postReactionWrapper) {
  const params = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `{"reactionId":"${type}"}` // , "testSourceIp": "192.168.0.1"}`
  };

  fetch(REACTION_ENDPOINT.replace('{slug}', getSlug()), params)
    .then(response => response.json())
    .then(result => !result.error && renderItems(result, postReactionWrapper))
    .catch(err => console.error(err));
}

function getReaction(postReactionWrapper) {
  fetch(REACTION_ENDPOINT.replace('{slug}', getSlug()))
    .then(response => response.json())
    .then(result => renderItems(result, postReactionWrapper))
    .catch(err => console.error(err));
}

function renderItems(reactions, postReactionWrapper) {
  if (typeof reactions !== 'object') {
    return;
  }

  const content = Object.entries(reactions).map(([type, count]) => {
    return `
      <div data-type="${type}" class="post_emotion post_emotion_type_${type}">
        <div class="post_emotion__counter ${count ? '' : 'post_emotion__counter_empty'}">
          ${count}
        </div>
      </div>
    `;
  });

  postReactionWrapper.innerHTML = content.join('\n');
}
