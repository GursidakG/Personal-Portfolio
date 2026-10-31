// Update the public email here and in index.html if it changes.
const CONTACT_EMAIL = 'gursidakg123@gmail.com';
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const navigationLinks = [...navigation.querySelectorAll('a')];
const sections = [...document.querySelectorAll('main section[id]')];
const timeline = document.querySelector('.timeline');
const timelineItems = [...document.querySelectorAll('.timeline-item')];

document.querySelector('#year').textContent = new Date().getFullYear();

function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('open');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('open', opening);
});
navigationLinks.forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 961px)').addEventListener('change', () => closeMenu());

let scrollScheduled = false;
function updateScroll() {
  const y = window.scrollY;
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, y / distance) : 0})`;
  header.classList.toggle('condensed', y > 40);
  // Fill the line to the reader's position and illuminate passed milestones.
  const timelineBounds = timeline.getBoundingClientRect();
  const readingLine = window.innerHeight * 0.72;
  const timelineProgress = Math.max(0, Math.min(1, (readingLine - timelineBounds.top) / timelineBounds.height));
  timeline.style.setProperty('--timeline-progress', motionPreference.matches ? 1 : timelineProgress);
  timelineItems.forEach(item => {
    item.classList.toggle('reached', motionPreference.matches || item.getBoundingClientRect().top + 28 <= readingLine);
  });
  const currentSection = sections
    .filter(section => section.getBoundingClientRect().top <= 160).at(-1);
  if (currentSection) {
    navigationLinks.forEach(link => {
      if (link.hash === `#${currentSection.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(updateScroll);
  }
}, { passive: true });
window.addEventListener('resize', updateScroll);
document.fonts.ready.then(updateScroll);
window.addEventListener('load', updateScroll, { once: true });
updateScroll();

const counted = new WeakSet();
function countUp(element) {
  if (counted.has(element)) return;
  counted.add(element);
  const target = Number(element.dataset.count);
  if (motionPreference.matches) {
    element.textContent = target;
    return;
  }
  const start = performance.now();
  const step = time => {
    const fraction = Math.min((time - start) / 1300, 1);
    element.textContent = Math.round(target * (1 - (1 - fraction) ** 3));
    if (fraction < 1 && !motionPreference.matches) requestAnimationFrame(step);
    else element.textContent = target;
  };
  requestAnimationFrame(step);
}

if ('IntersectionObserver' in window) {
  if (!motionPreference.matches) document.body.classList.add('motion-ready');
  // cover.js reveals the gated hero when it scrolls into view; if that script is missing, reveal it here.
  window.addEventListener('load', () => {
    if (!window.PortfolioCover) document.querySelectorAll('.hero[data-gated]').forEach(hero => hero.classList.add('is-ready'));
  }, { once: true });
  document.querySelectorAll('.service-grid, .project-grid, .interests, .stats').forEach(group => {
    [...group.children].forEach((item, index) => item.style.setProperty('--stagger', `${index * 90}ms`));
  });
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
}
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) document.body.classList.remove('motion-ready');
  updateScroll();
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(selected, focus = false) {
  tabs.forEach(tab => {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) selected.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(tabs[next], true);
    }
  });
});

const form = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(form);
  const name = String(fields.get('name')).trim().replace(/\s+/g, ' ');
  const email = String(fields.get('email')).trim();
  const message = String(fields.get('message')).trim();
  if (!name || !message) {
    formStatus.textContent = 'Please add your name and a message before continuing.';
    document.querySelector(!name ? '#name' : '#message').focus();
    return;
  }
  const body = `Hi Gursidak,\n\n${message}\n\n${name}\n${email}`;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Portfolio enquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
  document.querySelector('#prepared-message').value = body;
  document.querySelector('#message-preview').hidden = false;
  document.querySelector('#email-draft').href = mailto;
  formStatus.textContent = 'Your draft is ready. Open it in your email app to review and send, or copy it below.';
});
document.querySelector('#copy-message').addEventListener('click', async () => {
  const preparedMessage = document.querySelector('#prepared-message');
  try {
    await navigator.clipboard.writeText(preparedMessage.value);
    formStatus.textContent = 'Copied. You can paste your message into an email to ' + CONTACT_EMAIL + '.';
  } catch {
    preparedMessage.focus();
    preparedMessage.select();
    formStatus.textContent = 'Select and copy the highlighted message, then paste it into your email app.';
  }
});
