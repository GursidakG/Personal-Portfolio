// Character life: the eyes and head follow the pointer, blinks run on randomized timers, the figure
// glances at his watch when idle, and the speech-bubble hint cycles. Pure helpers are exported for
// tests/character.test.mjs; in the browser the module mounts itself.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.PortfolioCharacter = api;
    api.mount();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const BLINK_MIN_MS = 2500;
  const BLINK_RANGE_MS = 4000;
  const BLINK_DURATION_MS = 110;
  const DOUBLE_BLINK_CHANCE = 0.2;
  const DOUBLE_BLINK_GAP_MS = 190;
  const GLANCE_MIN_MS = 11000;
  const GLANCE_RANGE_MS = 6000;
  const GLANCE_DURATION_MS = 1600;
  const HINT_INTERVAL_MS = 4500;
  const HINT_FADE_MS = 220;
  const LOOK_LERP = 0.14;
  const LOOK_SETTLED = 0.002;
  const HINTS = ['I have something to show you.', 'Ask me about my work.'];
  const KEYBOARD_HINT = 'Alt + / opens the panel.';

  function clamp(value, low, high) {
    return Math.min(high, Math.max(low, value));
  }

  // Direction from the head to the pointer, scaled by half the viewport so the edges map to ±1.
  function lookVector(pointer, anchor, viewport) {
    if (!pointer || !anchor || !viewport) return { x: 0, y: 0 };
    const halfWidth = Math.max(1, viewport.width / 2);
    const halfHeight = Math.max(1, viewport.height / 2);
    return {
      x: clamp((pointer.x - anchor.x) / halfWidth, -1, 1),
      y: clamp((pointer.y - anchor.y) / halfHeight, -1, 1),
    };
  }

  function nextBlinkDelay(random) {
    return BLINK_MIN_MS + Math.floor(clamp(random, 0, 0.999) * BLINK_RANGE_MS);
  }

  function nextHint(hints, index) {
    return hints[(index + 1) % hints.length];
  }

  function mount() {
    const stage = document.querySelector('#stage');
    if (!stage) return;
    const avatar = stage.querySelector('#avatar');
    const head = stage.querySelector('.head');
    const hint = document.querySelector('#speech-hint');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    const isVisible = () => !document.hidden && !stage.classList.contains('is-offscreen');
    const isIdle = () => isVisible() && !stage.classList.contains('is-open') && !stage.classList.contains('is-winding');

    // Pointer following, eased toward the target each frame and stopped once settled.
    let target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    function settle() {
      frame = 0;
      current.x += (target.x - current.x) * LOOK_LERP;
      current.y += (target.y - current.y) * LOOK_LERP;
      stage.style.setProperty('--look-x', current.x.toFixed(3));
      stage.style.setProperty('--look-y', current.y.toFixed(3));
      if (Math.abs(target.x - current.x) > LOOK_SETTLED || Math.abs(target.y - current.y) > LOOK_SETTLED) {
        frame = requestAnimationFrame(settle);
      }
    }
    function aim(next) {
      target = next;
      if (!frame) frame = requestAnimationFrame(settle);
    }
    if (finePointer.matches && head) {
      document.addEventListener('pointermove', event => {
        if (reduceMotion.matches || !isVisible()) return;
        const box = head.getBoundingClientRect();
        aim(lookVector(
          { x: event.clientX, y: event.clientY },
          { x: box.left + box.width / 2, y: box.top + box.height / 2 },
          { width: window.innerWidth, height: window.innerHeight }
        ));
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', () => aim({ x: 0, y: 0 }));
    }

    // Blinks on a randomized timer, with an occasional double blink.
    function blinkOnce() {
      stage.classList.add('is-blinking');
      window.setTimeout(() => stage.classList.remove('is-blinking'), BLINK_DURATION_MS);
    }
    function scheduleBlink() {
      window.setTimeout(() => {
        if (isVisible() && !reduceMotion.matches) {
          blinkOnce();
          if (Math.random() < DOUBLE_BLINK_CHANCE) window.setTimeout(blinkOnce, DOUBLE_BLINK_GAP_MS);
        }
        scheduleBlink();
      }, nextBlinkDelay(Math.random()));
    }
    scheduleBlink();

    // An idle glance at the watch, hinting at the interaction without stealing it.
    function scheduleGlance() {
      window.setTimeout(() => {
        if (isIdle() && !reduceMotion.matches && avatar && !avatar.matches(':hover')) {
          stage.classList.add('is-glancing');
          window.setTimeout(() => stage.classList.remove('is-glancing'), GLANCE_DURATION_MS);
        }
        scheduleGlance();
      }, GLANCE_MIN_MS + Math.random() * GLANCE_RANGE_MS);
    }
    scheduleGlance();

    // The bubble's second line cycles through short hints.
    if (hint) {
      const hints = finePointer.matches ? HINTS.concat(KEYBOARD_HINT) : HINTS;
      let index = 0;
      window.setInterval(() => {
        if (!isVisible()) return;
        const swap = () => {
          hint.textContent = nextHint(hints, index);
          index = (index + 1) % hints.length;
          hint.classList.remove('is-swapping');
        };
        if (reduceMotion.matches) {
          swap();
          return;
        }
        hint.classList.add('is-swapping');
        window.setTimeout(swap, HINT_FADE_MS);
      }, HINT_INTERVAL_MS);
    }
  }

  return { lookVector, nextBlinkDelay, nextHint, mount, HINTS };
});
