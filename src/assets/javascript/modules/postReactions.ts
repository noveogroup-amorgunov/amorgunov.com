type ReactionCode = 'shocked' | 'love' | 'like' | 'dislike' | 'rage';
type Reactions = Record<ReactionCode, number>;

const EMOJI_MAP: Record<ReactionCode, string> = {
  shocked: '🤯',
  love: '😍',
  like: '👍',
  dislike: '👎',
  rage: '😡',
};

const REACTION_ENDPOINT =
  'https://i7on6ck7ng.execute-api.us-east-2.amazonaws.com/dev/posts/{slug}/likes';

function getSlug() {
  const [, slug] = document.location.pathname.match(/^\/posts\/([a-z0-9-_]+)/) || [];

  return slug;
}

function getEmojiFromCode(code: ReactionCode) {
  return EMOJI_MAP[code];
}

function renderItems(reactions: Reactions, postReactionWrapperEl: HTMLDivElement) {
  if (typeof reactions !== 'object') {
    return;
  }

  const content = Object.entries(reactions).map(([type, count]) => {
    return `
      <div class="tags__item">
        <a data-type="${type}" href="#" class="tags__item-link">
          <span style="font-size: 20px;">${getEmojiFromCode(type as ReactionCode)}</span>
          <span style="padding-left: 5px;">${count}</span>
        </a>
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

function setReaction(type: string, postReactionWrapperEl: HTMLDivElement): Promise<boolean> {
  const params = {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `{"reactionId":"${type}"}`, // , "testSourceIp": "192.168.0.1"}`
  };

  return fetch(REACTION_ENDPOINT.replace('{slug}', getSlug()), params)
    .then(response => response.json())
    .then(result => {
      if (result.error) {
        return true;
      }

      renderItems(result, postReactionWrapperEl);
    })
    .catch(err => {
      console.error(err);
      return true;
    });
}

export function initPostReactions() {
  const postReactionWrapperEl: HTMLDivElement = document.querySelector('.post__emotions');

  if (!postReactionWrapperEl) {
    return;
  }

  postReactionWrapperEl.classList.remove('post__emotions_error');

  getReaction(postReactionWrapperEl);

  postReactionWrapperEl.addEventListener('click', (event: MouseEvent) => {
    const {target} = event;

    event.preventDefault();

    if (!target) {
      return;
    }

    const typedEl: HTMLLinkElement =
      (target as HTMLLinkElement).closest('.tags__item-link') || (target as HTMLLinkElement);

    if (!typedEl.dataset.type) {
      return;
    }

    setReaction(typedEl.dataset.type, postReactionWrapperEl).then(hasError => {
      if (hasError) {
        postReactionWrapperEl.classList.add('post__emotions_error');
      }
    });
  });
}
