interface IReactions {
  [key: string]: number;
}

const REACTION_ENDPOINT =
  'https://i7on6ck7ng.execute-api.us-east-2.amazonaws.com/dev/posts/{slug}/likes';

function getSlug() {
  const [, slug] = document.location.pathname.match(/^\/posts\/([a-z0-9-_]+)/) || [];

  return slug;
}

function renderItems(reactions: IReactions, postReactionWrapperEl: HTMLDivElement) {
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

  postReactionWrapperEl.innerHTML = content.join('\n');
}

function getReaction(postReactionWrapperEl: HTMLDivElement) {
  fetch(REACTION_ENDPOINT.replace('{slug}', getSlug()))
    .then(response => response.json())
    .then(result => renderItems(result, postReactionWrapperEl))
    .catch(err => console.error(err));
}

function setReaction(type: string, postReactionWrapperEl: HTMLDivElement) {
  const params = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `{"reactionId":"${type}"}`, // , "testSourceIp": "192.168.0.1"}`
  };

  fetch(REACTION_ENDPOINT.replace('{slug}', getSlug()), params)
    .then(response => response.json())
    .then(result => !result.error && renderItems(result, postReactionWrapperEl))
    .catch(err => console.error(err));
}

export function initPostReactions() {
  const postReactionWrapperEl: HTMLDivElement = document.querySelector('.post__emotions');

  if (!postReactionWrapperEl) {
    return;
  }

  getReaction(postReactionWrapperEl);

  postReactionWrapperEl.addEventListener('click', (event: MouseEvent) => {
    const { target } = event;

    if (!target || !(target as HTMLDivElement).dataset.type) {
      return;
    }

    setReaction((target as HTMLDivElement).dataset.type, postReactionWrapperEl);
  });
}
