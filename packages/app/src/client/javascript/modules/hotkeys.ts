import * as keyux from 'keyux'

const {
  focusGroupKeyUX,
  focusGroupPolyfill,
  hiddenKeyUX,
  hotkeyKeyUX,
  hotkeyOverrides,
  jumpKeyUX,
  pressKeyUX,
  startKeyUX,
} = keyux

export function registerHotkeys() {
  startKeyUX(window, [
    hotkeyKeyUX([hotkeyOverrides({})]),
    focusGroupKeyUX(),
    focusGroupPolyfill(),
    pressKeyUX('is-pressed'),
    // jumpKeyUX(),
    hiddenKeyUX(),
  ])
}
