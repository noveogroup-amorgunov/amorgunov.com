type ReactionCode = 'shocked' | 'love' | 'like' | 'rage' | 'dislike' | 'party' | 'partyPopper'
type Reactions = Record<ReactionCode, number>

const EMOJI_MAP: Record<ReactionCode, string> = {
  shocked: '🤯',
  love: '😍',
  like: '👍',
  dislike: '🥱',
  rage: '😡',
  party: '🥳',
  partyPopper: '🥳',
}

const IMAGES_MAP: Record<ReactionCode, string> = {
  shocked: '/assets/reactions/shocked.svg',
  love: '/assets/reactions/love.svg',
  like: '/assets/reactions/like.svg',
  dislike: '/assets/reactions/dislike.svg',
  rage: '/assets/reactions/rage.svg',
  party: '/assets/reactions/party.svg',
  partyPopper: '/assets/reactions/partyPopper.svg',
}

const REACTION_ENDPOINT
  = 'https://i7on6ck7ng.execute-api.us-east-2.amazonaws.com/dev/posts/{slug}/likes'

function getSlug() {
  const [, slug] = document.location.pathname.match(/^\/posts\/([a-z0-9-_]+)/) || []
  return slug
}

function getInitialReactions() {
  return {
    shocked: 0,
    love: 0,
    like: 0,
    dislike: 0,
    rage: 0,
    party: 0,
    partyPopper: 0,
  }
}

function renderItems(reactions: Reactions, wrapperEl: HTMLDivElement) {
  if (typeof reactions !== 'object') {
    return
  }

  const content = Object.entries(reactions).map(([type, count]) => {
    const typedType = type as ReactionCode
    return `
    <li class="reactions__item reaction" data-type="${type}">
      <button aria-label="Поставить реакцию ${typedType}">
        <img aria-hidden="true" class="reaction__image" src="${IMAGES_MAP[typedType]}" alt="${EMOJI_MAP[typedType]}" width="64" height="64" />
        <div class="reaction__counter" aria-label="Реакция поставлена ${count} раз">${count}</div>
      </button>
    </li>
    `
  })

  wrapperEl.innerHTML = content.join('\n')
}

function getReaction(slug: string) {
  return fetch(REACTION_ENDPOINT.replace('{slug}', slug))
    .then(response => response.json())
    .catch(err => console.error(err))
}

function clientOptimisticUpdate(
  wrapperEl: HTMLDivElement,
  selector: string,
  increaseValue: boolean,
) {
  const el = wrapperEl.querySelector(selector) as HTMLDivElement | undefined

  if (!el) {
    return
  }

  const imageEl = el.querySelector('.reaction__image') as HTMLImageElement
  const counterEl = el.querySelector('.reaction__counter') as HTMLDivElement
  const button = el.querySelector('button') as HTMLButtonElement

  if (increaseValue) {
    el.classList.add('reaction_active')
    button.setAttribute('aria-current', 'true')
    imageEl.src = imageEl.src.replace('.svg', '.gif')
    counterEl.textContent = String(Number(counterEl.textContent) + 1)
  }
  else {
    el.classList.remove('reaction_active')
    button.removeAttribute('aria-current')
    imageEl.src = imageEl.src.replace('.gif', '.svg')
    counterEl.textContent = String(Number(counterEl.textContent) - 1)
  }
}

function setReaction(type: ReactionCode, wrapperEl: HTMLDivElement) {
  const params = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `{"reactionId":"${type}"}`,
  }

  clientOptimisticUpdate(wrapperEl, '.reaction_active', false)
  clientOptimisticUpdate(wrapperEl, `.reaction[data-type=${type}]`, true)

  return fetch(REACTION_ENDPOINT.replace('{slug}', getSlug()), params)
    .then(response => response.json())
    .catch(err => console.error(err))
}

export function registerPostReactions() {
  const wrapperEl: HTMLDivElement | null = document.querySelector('.reactions')

  if (!wrapperEl) {
    return
  }

  renderItems(getInitialReactions(), wrapperEl)

  getReaction(getSlug()).then((reactions) => {
    renderItems(reactions, wrapperEl)

    wrapperEl.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLDivElement

      if (!target) {
        return
      }

      const el: HTMLDivElement = target.closest('.reaction') || target

      if (!el.dataset.type) {
        return
      }

      setReaction(el.dataset.type as ReactionCode, wrapperEl)
    })
  })
}
