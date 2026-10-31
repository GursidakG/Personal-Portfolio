// The companion: once the hero has scrolled away, a small version of the figure keeps pace in the
// corner, says one line per section, and opens the assistant as a sheet when clicked.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.PortfolioCompanion = api;
    api.mount();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const SWAP_MS = 240;
  const POINT_MS = 1400;
  const DISMISS_KEY = 'companion-dismissed';
  const FALLBACK = 'Scroll on, I’ll keep up. Click me to ask anything.';
  const LINES = {
    about: 'That’s the short version. The hologram has the long one.',
    'north-star': 'Stated plainly, so you know where I’m aiming.',
    services: 'Four things I do when someone hands me a problem.',
    experience: 'Summer 2025: the first time real patients used something I built.',
    projects: 'Open “How it was built” on any card. I wrote those for you.',
    skills: 'No percentage bars. Just where each tool has shipped.',
    contact: 'This is the part where you say hi.',
  };

  function lineFor(sectionId, lines, fallback) {
    if (!sectionId) return fallback;
    return Object.prototype.hasOwnProperty.call(lines, sectionId) ? lines[sectionId] : fallback;
  }

  function shouldShow({ heroBottom, sheetOpen, dismissed }) {
    return heroBottom < 0 && !sheetOpen && !dismissed;
  }

  function mount() {
    const companion = document.querySelector('#companion');
    const bubble = document.querySelector('#companion-bubble');
    const ask = document.querySelector('#companion-ask');
    const dismiss = document.querySelector('#companion-dismiss');
    const stage = document.querySelector('#stage');
    if (!companion || !bubble || !ask || !stage) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sections = [...document.querySelectorAll('main section[id]')].filter(section => section.id !== 'home');

    let dismissed = false;
    try { dismissed = window.sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { /* storage unavailable */ }
    let currentSection = null;
    let shown = false;
    let pointTimer = 0;
    let pendingFocus = false;

    function sheetOpen() {
      return document.body.classList.contains('holo-sheet');
    }

    function update() {
      const heroBottom = stage.getBoundingClientRect().bottom;
      const show = shouldShow({ heroBottom, sheetOpen: sheetOpen(), dismissed });
      const reveal = () => {
        companion.classList.toggle('is-visible', show);
        if (show && pendingFocus) {
          pendingFocus = false;
          requestAnimationFrame(() => ask.focus({ preventScroll: true }));
        }
      };
      if (show && !shown) {
        companion.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(reveal));
      } else {
        reveal();
      }
      shown = show;
    }

    function focusNearestHeading() {
      const heading = currentSection && document.querySelector(`#${currentSection} h2`);
      if (!heading) return;
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
    }

    function say(sectionId) {
      if (sectionId === currentSection) return;
      currentSection = sectionId;
      const text = lineFor(sectionId, LINES, FALLBACK);
      const swap = () => {
        bubble.textContent = text;
        bubble.classList.remove('is-swapping');
      };
      if (reduceMotion.matches || !bubble.textContent) {
        swap();
      } else {
        bubble.classList.add('is-swapping');
        window.setTimeout(swap, SWAP_MS);
      }
      if (!reduceMotion.matches) {
        window.clearTimeout(pointTimer);
        companion.classList.add('is-pointing');
        pointTimer = window.setTimeout(() => companion.classList.remove('is-pointing'), POINT_MS);
      }
    }

    if ('IntersectionObserver' in window) {
      const watcher = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (visible.length) say(visible[visible.length - 1].target.id);
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      sections.forEach(section => watcher.observe(section));
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', update);

    ask.addEventListener('click', () => {
      if (window.PortfolioHologram) {
        if (window.PortfolioHologram.isOpen()) window.PortfolioHologram.close();
        window.PortfolioHologram.open({ asSheet: true });
        update();
      } else {
        document.querySelector('#avatar').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      }
    });
    if (dismiss) {
      dismiss.addEventListener('click', () => {
        dismissed = true;
        try { window.sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* storage unavailable */ }
        focusNearestHeading();
        update();
        window.setTimeout(() => { companion.hidden = true; }, 500);
      });
    }

    document.addEventListener('holo:closed', event => {
      if (event.detail && event.detail.fromCompanion) pendingFocus = true;
      update();
    });

    // The hologram toggles body.holo-sheet; watch it so the companion steps aside while the sheet is open.
    if ('MutationObserver' in window) {
      new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    update();
  }

  return { lineFor, shouldShow, mount, LINES };
});
