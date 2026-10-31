// The cover: a field of warm particles flies together into the portrait, drifts while you read, and
// as you scroll the camera travels through the field (near particles pass first) until the page
// arrives underneath. Pure helpers are exported for tests/cover.test.mjs; the browser mounts itself.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.PortfolioCover = api;
    api.mount();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const ASSEMBLE_MS = 1900;
  const ASSEMBLE_STAGGER_MS = 900;
  const SETTLED_MS = 2600;
  const FACE_HEIGHT_RATIO = 0.6;
  const FACE_MAX_HEIGHT = 540;
  const FACE_CENTER_Y = 0.43;
  const COMPACT_WIDTH = 700;
  const COMPACT_FACE_HEIGHT_RATIO = 0.36;
  const COMPACT_FACE_CENTER_Y = 0.32;
  const DRIFT_PX = 0.7;
  const REPEL_RADIUS = 90;
  const REPEL_PX = 22;
  const STAR_COUNT = 220;
  const CAMERA_TRAVEL = 1.08;
  const NEAR_PLANE = 0.05;
  const FACE_DEPTH_JITTER = 0.06;
  const CANVAS_FADE_FROM = 0.92;
  const LEAVING_AT = 0.3;
  const FACE_VIEWBOX = { x: 80, y: 0, width: 160, height: 180 };
  const RENDER_SCALE = 1.4;
  const MINUTE_MS = 60000;

  function clamp(value, low, high) {
    return Math.min(high, Math.max(low, value));
  }

  function coverProgress(scrollY, coverHeight) {
    if (coverHeight <= 0) return 1;
    return clamp(scrollY / coverHeight, 0, 1);
  }

  // Progress along the pinned runway: the cover stays put while the wrapper scrolls one extra screen or more.
  function runwayProgress(scrollY, runwayHeight, viewportHeight) {
    const distance = runwayHeight - viewportHeight;
    if (distance <= 0) return 1;
    return clamp(scrollY / distance, 0, 1);
  }

  function disperse(home, center, progress, spread) {
    if (progress <= 0) return home;
    return {
      x: home.x + (home.x - center.x) * progress * spread,
      y: home.y + (home.y - center.y) * progress * spread - progress * 120,
    };
  }

  // Perspective: a point at depth z seen from a camera at `camera`; null once it has passed the camera.
  function project(point, center, camera) {
    const depth = point.z - camera;
    if (depth <= NEAR_PLANE) return null;
    const scale = 1 / depth;
    return { x: center.x + (point.x - center.x) * scale, y: center.y + (point.y - center.y) * scale, scale };
  }

  function sampleStep(viewportWidth) {
    return viewportWidth < COMPACT_WIDTH ? 3 : 2;
  }

  function easeOutCubic(t) {
    const clamped = clamp(t, 0, 1);
    return 1 - Math.pow(1 - clamped, 3);
  }

  function hash(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  // Preferred source: particle data sampled offline from a photograph (portrait-data.js).
  function portraitFromData(data) {
    const particles = [];
    for (let i = 0; i < data.points.length; i += 3) {
      particles.push({ u: data.points[i], v: data.points[i + 1], color: data.palette[data.points[i + 2]], seed: particles.length });
    }
    return { particles, aspect: data.aspect };
  }

  // Fallback: render the figure's head to an offscreen canvas and sample it.
  async function sampleFace(figure, step) {
    const clone = figure.cloneNode(true);
    const { x, y, width, height } = FACE_VIEWBOX;
    clone.removeAttribute('class');
    clone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    clone.setAttribute('width', width * RENDER_SCALE);
    clone.setAttribute('height', height * RENDER_SCALE);
    clone.querySelectorAll('.arm').forEach(arm => arm.remove());
    // A relative image URL cannot resolve inside a data: URL; the fallback samples the drawn head only.
    clone.querySelectorAll('image').forEach(image => image.remove());
    const markup = new XMLSerializer().serializeToString(clone);
    const image = new Image();
    const loaded = new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('portrait failed to load'));
    });
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
    await loaded;
    const scratch = document.createElement('canvas');
    scratch.width = width * RENDER_SCALE;
    scratch.height = height * RENDER_SCALE;
    const context = scratch.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, scratch.width, scratch.height);
    const particles = [];
    const quantize = channel => Math.min(255, (channel >> 3) * 8 + 4);
    for (let py = 0; py < scratch.height; py += step) {
      for (let px = 0; px < scratch.width; px += step) {
        const index = (py * scratch.width + px) * 4;
        if (data[index + 3] < 140) continue;
        particles.push({
          u: px / scratch.width,
          v: py / scratch.height,
          color: `rgb(${quantize(data[index])} ${quantize(data[index + 1])} ${quantize(data[index + 2])})`,
          seed: particles.length,
        });
      }
    }
    particles.sort((a, b) => (a.color < b.color ? -1 : a.color > b.color ? 1 : 0));
    return { particles, aspect: width / height };
  }

  function mount() {
    const wrap = document.querySelector('#cover-wrap');
    const cover = document.querySelector('#cover');
    const canvas = document.querySelector('#cover-canvas');
    const figure = document.querySelector('#stage .figure');
    const hero = document.querySelector('.hero[data-gated]');
    const clock = document.querySelector('#cover-time');

    // The hero's entrance waits until it scrolls into view. This runs even if the canvas is missing.
    if (hero && 'IntersectionObserver' in window) {
      const gate = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          hero.classList.add('is-ready');
          gate.disconnect();
        }
      }, { threshold: 0.25 });
      gate.observe(hero);
    } else if (hero) {
      hero.classList.add('is-ready');
    }

    if (!wrap || !cover || !canvas) return;
    const context = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    function tickClock() {
      if (!clock) return;
      try {
        const now = new Date();
        clock.textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' }).format(now);
        clock.setAttribute('datetime', now.toISOString());
      } catch {
        clock.parentElement.hidden = true;
      }
    }
    tickClock();
    window.setTimeout(() => { tickClock(); window.setInterval(tickClock, MINUTE_MS); }, MINUTE_MS - (Date.now() % MINUTE_MS));

    let particles = [];
    let aspect = 1;
    let stars = [];
    let width = 0;
    let height = 0;
    let dpr = 0;
    let face = { left: 0, top: 0, width: 0, height: 0, size: 2 };
    let startedAt = 0;
    let progress = 0;
    let lastProgress = -1;
    let runwayHeight = 1;
    let pointer = null;
    let frame = 0;
    let running = false;

    function layout() {
      const nextDpr = Math.min(2, window.devicePixelRatio || 1);
      const nextWidth = cover.clientWidth;
      const nextHeight = cover.clientHeight;
      runwayHeight = wrap.offsetHeight || 1;
      if (nextWidth === width && nextHeight === height && nextDpr === dpr && stars.length) return;
      dpr = nextDpr;
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const compact = width < COMPACT_WIDTH;
      const faceHeight = Math.min(FACE_MAX_HEIGHT, height * (compact ? COMPACT_FACE_HEIGHT_RATIO : FACE_HEIGHT_RATIO));
      const faceWidth = faceHeight * aspect;
      const columns = Math.sqrt(Math.max(1, particles.length) / aspect) || 60;
      face = {
        left: (width - faceWidth) / 2,
        top: height * (compact ? COMPACT_FACE_CENTER_Y : FACE_CENTER_Y) - faceHeight / 2,
        width: faceWidth,
        height: faceHeight,
        size: Math.max(1.4, (faceWidth / columns) * 0.84),
      };
      stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
        x: hash(i * 7.1) * width,
        y: hash(i * 3.7 + 1) * height,
        z: 0.35 + hash(i * 9.3 + 7) * 2.6,
        size: 1 + hash(i * 1.3 + 2) * 1.8,
        alpha: 0.16 + hash(i * 5.9 + 3) * 0.3,
      }));
      particles.forEach(particle => {
        particle.hx = face.left + particle.u * face.width;
        particle.hy = face.top + particle.v * face.height;
        particle.z = 1 + (hash(particle.seed * 8.9 + 11) - 0.5) * FACE_DEPTH_JITTER;
        particle.sx = hash(particle.seed * 2.3) * width;
        particle.sy = hash(particle.seed * 4.1 + 9) * height;
        particle.delay = hash(particle.seed * 6.7 + 5) * ASSEMBLE_STAGGER_MS;
      });
    }

    function draw(now) {
      frame = 0;
      const still = reduceMotion.matches;
      context.clearRect(0, 0, width, height);
      const center = { x: face.left + face.width / 2, y: face.top + face.height / 2 };
      const camera = still ? 0 : progress * CAMERA_TRAVEL;
      // Everything fades together in the last stretch so the page arrives on a clean ground.
      const groundFade = still ? 1 - progress : 1 - clamp((progress - CANVAS_FADE_FROM) / (1 - CANVAS_FADE_FROM), 0, 1);
      context.fillStyle = '#b9966f';
      for (const star of stars) {
        const seen = project(star, center, camera);
        if (!seen) continue;
        context.globalAlpha = star.alpha * groundFade * clamp((5 - seen.scale) / 3, 0, 1);
        context.fillRect(seen.x, seen.y, star.size * seen.scale, star.size * seen.scale);
      }
      const elapsed = now - startedAt;
      let currentColor = null;
      for (const particle of particles) {
        let x = particle.hx;
        let y = particle.hy;
        if (!still) {
          const t = easeOutCubic((elapsed - particle.delay) / ASSEMBLE_MS);
          x = particle.sx + (particle.hx - particle.sx) * t;
          y = particle.sy + (particle.hy - particle.sy) * t;
          if (t >= 1 && camera === 0) {
            x += Math.sin(now / 1400 + particle.seed) * DRIFT_PX;
            y += Math.cos(now / 1700 + particle.seed * 0.7) * DRIFT_PX;
            if (pointer) {
              const dx = x - pointer.x;
              const dy = y - pointer.y;
              const distance = Math.hypot(dx, dy);
              if (distance < REPEL_RADIUS && distance > 0.01) {
                const push = (1 - distance / REPEL_RADIUS) * REPEL_PX;
                x += (dx / distance) * push;
                y += (dy / distance) * push;
              }
            }
          }
        }
        const seen = project({ x, y, z: particle.z }, center, camera);
        if (!seen) continue;
        if (particle.color !== currentColor) {
          currentColor = particle.color;
          context.fillStyle = currentColor;
        }
        context.globalAlpha = groundFade * clamp((7 - seen.scale) / 4, 0, 1);
        const size = Math.min(48, face.size * seen.scale);
        context.fillRect(seen.x, seen.y, size, size);
      }
      context.globalAlpha = 1;
      if (running && progress < 1 && !document.hidden && !still) frame = requestAnimationFrame(draw);
    }

    function schedule() {
      if (!frame && running) frame = requestAnimationFrame(draw);
    }

    function onScroll() {
      progress = runwayProgress(window.scrollY, runwayHeight, window.innerHeight);
      if (progress === lastProgress) return;
      lastProgress = progress;
      pointer = null;
      cover.style.setProperty('--cover-p', progress.toFixed(4));
      if (progress > 0) cover.classList.add('is-settled');
      cover.classList.toggle('is-leaving', progress > LEAVING_AT);
      schedule();
    }

    const source = window.PortfolioPortrait
      ? Promise.resolve(portraitFromData(window.PortfolioPortrait))
      : (figure ? sampleFace(figure, sampleStep(window.innerWidth)) : Promise.reject(new Error('no portrait source')));

    source.then(result => {
      particles = result.particles;
      aspect = result.aspect;
      stars = [];
      layout();
      startedAt = performance.now();
      running = true;
      onScroll();
      window.setTimeout(() => cover.classList.add('is-settled'), SETTLED_MS);
    }).catch(() => {
      canvas.style.display = 'none';
      cover.classList.add('is-settled');
    });

    let resizeFrame = 0;
    window.addEventListener('resize', () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        layout();
        lastProgress = -1;
        onScroll();
      });
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    if (finePointer.matches) {
      cover.addEventListener('pointermove', event => {
        const box = cover.getBoundingClientRect();
        pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      }, { passive: true });
      cover.addEventListener('pointerleave', () => { pointer = null; });
    }
  }

  return { coverProgress, runwayProgress, disperse, project, sampleStep, easeOutCubic, mount };
});
