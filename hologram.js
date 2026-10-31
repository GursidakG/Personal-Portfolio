// Hero character and holographic assistant.
// The character is a button. Clicking it winds up, poses the figure (CSS transitions sequenced by
// delay), lights the watch and opens the panel, which answers from assistant.js in the browser.
// The panel can also read answers aloud and take questions by voice where the browser allows it.
(function () {
  const stage = document.querySelector('#stage');
  const assistant = window.PortfolioAssistant;
  if (!stage || !assistant) return;

  const avatar = stage.querySelector('#avatar');
  const panel = stage.querySelector('#holo');
  const log = panel.querySelector('#holo-log');
  const chips = panel.querySelector('#holo-chips');
  const form = panel.querySelector('#holo-form');
  const input = panel.querySelector('#holo-input');
  const closeButton = panel.querySelector('#holo-close');
  const voiceButton = panel.querySelector('#holo-voice');
  const micButton = panel.querySelector('#holo-mic');
  const status = panel.querySelector('#holo-status');
  const clock = panel.querySelector('#holo-time');
  const forearm = stage.querySelector('#forearm-watch');
  const watchFace = stage.querySelector('#watch-face');
  const beam = stage.querySelector('#holo-beam');
  const beamCone = beam && beam.querySelector('polygon');
  const beamGlow = beam && beam.querySelector('circle');
  const beamGradient = beam && beam.querySelector('linearGradient');
  const backdrop = document.querySelector('#holo-backdrop');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sheetLayout = window.matchMedia('(max-width: 960px)');

  const TYPE_INTERVAL_MS = 14;
  const TYPE_MAX_MS = 2200;
  const THINK_MS = 260;
  const WIND_UP_MS = 140;
  const FOCUS_FALLBACK_MS = 1850;
  const MAX_QUESTION_LENGTH = 300;
  const STATUS_CLEAR_MS = 3200;
  const VOICE_STORAGE_KEY = 'holo-voice';
  const FOCUSABLE = 'button:not([hidden]), [href], input, [tabindex]:not([tabindex="-1"])';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const POSE_FALLBACK_MS = 900;
  const MINUTE_MS = 60000;

  let isOpen = false;
  let forcedSheet = false;
  const isSheet = () => sheetLayout.matches || forcedSheet;
  let typing = null;
  let focusTimer = null;
  let windTimer = null;
  let pendingAnswer = null;
  let pendingResult = null;
  let statusTimer = null;
  let poseTimer = null;

  // Beam geometry: from the watch face to the lower part of the panel's left edge.
  function positionBeam() {
    if (!beamCone || !isOpen || isSheet()) return;
    const stageBox = stage.getBoundingClientRect();
    const watchBox = watchFace.getBoundingClientRect();
    const sx = watchBox.left + watchBox.width / 2 - stageBox.left;
    const sy = watchBox.top + watchBox.height / 2 - stageBox.top;
    const px = panel.offsetLeft;
    const py = panel.offsetTop + panel.offsetHeight;
    const topY = py - Math.min(panel.offsetHeight * 0.52, 240);
    const bottomY = py - 14;
    beamCone.setAttribute('points', `${sx - 2},${sy - 2} ${sx + 2},${sy + 2} ${px + 2},${bottomY} ${px + 2},${topY}`);
    beamGlow.setAttribute('cx', sx);
    beamGlow.setAttribute('cy', sy);
    beamGradient.setAttribute('x1', sx);
    beamGradient.setAttribute('y1', sy);
    beamGradient.setAttribute('x2', px);
    beamGradient.setAttribute('y2', (topY + bottomY) / 2);
    stage.classList.add('has-beam');
  }

  function onForearmSettled(event) {
    if (event.target !== forearm) return;
    clearPoseWait();
    positionBeam();
  }
  function clearPoseWait() {
    window.clearTimeout(poseTimer);
    forearm.removeEventListener('transitionend', onForearmSettled);
  }
  function afterPose() {
    clearPoseWait();
    if (reduceMotion.matches) {
      requestAnimationFrame(positionBeam);
      return;
    }
    forearm.addEventListener('transitionend', onForearmSettled);
    poseTimer = window.setTimeout(() => { clearPoseWait(); positionBeam(); }, POSE_FALLBACK_MS);
  }

  function scrollLog() {
    log.scrollTo({ top: log.scrollHeight, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  function setStatus(text) {
    window.clearTimeout(statusTimer);
    status.textContent = text;
    if (text) statusTimer = window.setTimeout(() => { status.textContent = ''; }, STATUS_CLEAR_MS);
  }

  // Clock: Gursidak's local time, so visitors know when a reply is likely.
  function tickClock() {
    if (!clock) return;
    try {
      const now = new Date();
      clock.textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' }).format(now);
      clock.setAttribute('datetime', now.toISOString());
    } catch {
      clock.closest('.holo-clock').hidden = true;
    }
  }
  tickClock();
  window.setTimeout(() => {
    tickClock();
    window.setInterval(tickClock, MINUTE_MS);
  }, MINUTE_MS - (Date.now() % MINUTE_MS));

  // Speech: read answers aloud when the visitor asks for it.
  const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let speakEnabled = false;
  function readVoicePreference() {
    try { return window.localStorage.getItem(VOICE_STORAGE_KEY) === 'on'; } catch { return false; }
  }
  function storeVoicePreference(enabled) {
    try { window.localStorage.setItem(VOICE_STORAGE_KEY, enabled ? 'on' : 'off'); } catch { /* storage unavailable */ }
  }
  let chosenVoice = null;
  function pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    const english = voices.filter(voice => /^en(-|_)?/i.test(voice.lang));
    const local = english.filter(voice => voice.localService);
    chosenVoice = local.find(voice => /Samantha|Daniel|Karen|Natural/i.test(voice.name)) || local[0] || english[0] || voices[0] || null;
  }
  // Long answers are spoken one sentence at a time: some engines stop silently after about 15 seconds.
  function speak(text) {
    if (!canSpeak || !speakEnabled) return;
    window.speechSynthesis.cancel();
    if (!chosenVoice) pickVoice();
    const sentences = text.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [text];
    sentences.map(part => part.trim()).filter(Boolean).forEach(part => {
      const utterance = new SpeechSynthesisUtterance(part);
      if (chosenVoice) utterance.voice = chosenVoice;
      utterance.lang = 'en-CA';
      utterance.rate = 1.02;
      window.speechSynthesis.speak(utterance);
    });
  }
  function stopSpeaking() {
    if (canSpeak) window.speechSynthesis.cancel();
  }
  function setSpeakEnabled(enabled) {
    speakEnabled = enabled;
    voiceButton.setAttribute('aria-pressed', String(enabled));
    storeVoicePreference(enabled);
    if (!enabled) stopSpeaking();
    setStatus(enabled ? 'Answers will be read aloud.' : '');
  }
  if (canSpeak && voiceButton) {
    voiceButton.hidden = false;
    speakEnabled = readVoicePreference();
    voiceButton.setAttribute('aria-pressed', String(speakEnabled));
    voiceButton.addEventListener('click', () => setSpeakEnabled(!speakEnabled));
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
  }

  // Listening: dictate a question where the browser offers speech recognition.
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognizer = null;
  let isListening = false;
  let isStarting = false;
  function setListening(listening) {
    isListening = listening;
    micButton.setAttribute('aria-pressed', String(listening));
  }
  function abortListening() {
    if (!recognizer) return;
    try { recognizer.abort(); } catch { /* already stopped */ }
    recognizer = null;
    isStarting = false;
    setListening(false);
  }
  function startListening() {
    if (isListening || isStarting) {
      abortListening();
      return;
    }
    stopSpeaking();
    isStarting = true;
    recognizer = new Recognition();
    recognizer.lang = 'en-CA';
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 1;
    recognizer.onstart = () => {
      isStarting = false;
      setListening(true);
      setStatus('Listening. Ask your question.');
    };
    recognizer.onresult = event => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      input.value = transcript;
      if (result.isFinal && transcript) ask(transcript);
    };
    recognizer.onerror = event => {
      if (event.error === 'aborted') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setStatus('Voice input is not available here. You can still type.');
        micButton.hidden = true;
        return;
      }
      setStatus(event.error === 'no-speech' ? 'I did not hear anything. Try again, or type your question.' : 'I did not catch that. Try again, or type your question.');
    };
    recognizer.onend = () => {
      isStarting = false;
      setListening(false);
      if (recognizer) recognizer.onresult = recognizer.onerror = recognizer.onstart = recognizer.onend = null;
      recognizer = null;
      if (status.textContent.startsWith('Listening')) setStatus('');
    };
    try {
      recognizer.start();
    } catch {
      isStarting = false;
      setStatus('Voice input is not available right now. You can still type.');
    }
  }
  if (Recognition && micButton) {
    micButton.hidden = false;
    micButton.addEventListener('click', startListening);
  }

  // While typing, the visible text is hidden from assistive tech and the full answer sits in a
  // visually hidden sibling, so the live region announces the answer once instead of per tick.
  function finishTyping() {
    if (!typing) return;
    clearInterval(typing.timer);
    typing.visible.textContent = typing.text;
    typing.visible.removeAttribute('aria-hidden');
    typing.hidden.remove();
    typing = null;
  }

  function typeInto(container, text) {
    finishTyping();
    if (reduceMotion.matches) {
      container.textContent = text;
      return;
    }
    const visible = document.createElement('span');
    visible.setAttribute('aria-hidden', 'true');
    const hidden = document.createElement('span');
    hidden.className = 'sr-only';
    hidden.textContent = text;
    container.replaceChildren(visible, hidden);
    const ticks = Math.max(1, Math.floor(TYPE_MAX_MS / TYPE_INTERVAL_MS));
    const step = Math.max(1, Math.ceil(text.length / ticks));
    let shown = 0;
    typing = { visible, hidden, text, timer: 0 };
    typing.timer = setInterval(() => {
      shown = Math.min(text.length, shown + step);
      visible.textContent = text.slice(0, shown);
      if (shown % 24 < step) scrollLog();
      if (shown >= text.length) {
        finishTyping();
        scrollLog();
      }
    }, TYPE_INTERVAL_MS);
  }

  function renderLinks(links) {
    if (!links.length) return null;
    const row = document.createElement('div');
    row.className = 'holo-links';
    links.forEach(link => {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.label;
      if (link.external) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      row.append(anchor);
    });
    return row;
  }

  function speakerLabel(name) {
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = `${name}: `;
    return label;
  }

  function khandaMark() {
    const mark = document.createElement('span');
    mark.className = 'holo-mark';
    mark.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'khanda');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-khanda');
    svg.append(use);
    mark.append(svg);
    return mark;
  }

  function addUserMessage(text) {
    const item = document.createElement('li');
    item.className = 'holo-msg user';
    item.append(speakerLabel('You'), document.createTextNode(text));
    log.append(item);
    scrollLog();
  }

  function addAssistantMessage(result, animate) {
    const item = document.createElement('li');
    item.className = 'holo-msg assistant';
    const body = document.createElement('div');
    const text = document.createElement('p');
    text.className = 'holo-text';
    body.append(speakerLabel('Gursidak'), text);
    const links = renderLinks(result.links);
    if (links) body.append(links);
    item.append(khandaMark(), body);
    log.append(item);
    if (animate) typeInto(text, result.text);
    else text.textContent = result.text;
    scrollLog();
  }

  function renderChips(questions) {
    chips.replaceChildren();
    questions.forEach(question => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = question;
      chip.addEventListener('click', () => {
        ask(question);
        input.focus({ preventScroll: true });
      });
      chips.append(chip);
    });
  }

  function ask(question) {
    const clean = String(question || '').trim().slice(0, MAX_QUESTION_LENGTH);
    if (!clean) {
      input.focus();
      return;
    }
    finishTyping();
    stopSpeaking();
    flushPendingAnswer();
    addUserMessage(clean);
    input.value = '';
    const result = assistant.answer(clean);
    panel.classList.add('is-thinking');
    pendingResult = result;
    pendingAnswer = window.setTimeout(() => {
      pendingResult = null;
      panel.classList.remove('is-thinking');
      addAssistantMessage(result, true);
      renderChips(result.suggestions);
      speak(result.text);
    }, reduceMotion.matches ? 0 : THINK_MS);
  }

  // A question asked while the previous answer is still "thinking" renders that answer at once.
  function flushPendingAnswer() {
    window.clearTimeout(pendingAnswer);
    if (!pendingResult) return;
    panel.classList.remove('is-thinking');
    addAssistantMessage(pendingResult, false);
    pendingResult = null;
  }

  function seed() {
    if (log.children.length) return;
    addAssistantMessage(assistant.answer('hello'), false);
    renderChips(assistant.suggestions());
  }

  function focusInput() {
    window.clearTimeout(focusTimer);
    panel.removeEventListener('transitionend', onPanelShown);
    input.focus({ preventScroll: true });
  }

  function onPanelShown(event) {
    if (event.target === panel && event.propertyName === 'opacity') focusInput();
  }

  function syncLayoutMode() {
    const sheet = isSheet();
    document.body.classList.toggle('holo-sheet', isOpen && sheet);
    document.body.classList.toggle('holo-forced', isOpen && forcedSheet);
    panel.setAttribute('aria-modal', isOpen && sheet ? 'true' : 'false');
  }

  // In sheet mode the panel covers the page, so Tab stays inside it.
  function trapFocus(event) {
    if (event.key !== 'Tab' || !isOpen || !isSheet()) return;
    const focusable = [...panel.querySelectorAll(FOCUSABLE)].filter(el => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function open(options) {
    if (isOpen) return;
    isOpen = true;
    forcedSheet = Boolean(options && options.asSheet);
    seed();
    stage.classList.remove('is-glancing');
    avatar.setAttribute('aria-expanded', 'true');
    const reveal = () => {
      stage.classList.remove('is-winding');
      stage.classList.add('is-open');
      syncLayoutMode();
      afterPose();
      panel.addEventListener('transitionend', onPanelShown);
      focusTimer = window.setTimeout(focusInput, reduceMotion.matches ? 30 : FOCUS_FALLBACK_MS);
    };
    if (reduceMotion.matches) {
      reveal();
      return;
    }
    // Anticipation: a short counter-movement before the arms swing up.
    stage.classList.add('is-winding');
    windTimer = window.setTimeout(reveal, WIND_UP_MS);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    window.clearTimeout(windTimer);
    window.clearTimeout(focusTimer);
    clearPoseWait();
    flushPendingAnswer();
    panel.removeEventListener('transitionend', onPanelShown);
    finishTyping();
    stopSpeaking();
    abortListening();
    stage.classList.remove('is-open', 'is-winding', 'has-beam');
    avatar.setAttribute('aria-expanded', 'false');
    const wasForced = forcedSheet;
    const hadFocus = panel.contains(document.activeElement);
    forcedSheet = false;
    syncLayoutMode();
    // The companion is hidden while the sheet is open; it takes the focus back once it is visible again.
    if (hadFocus && wasForced) document.dispatchEvent(new CustomEvent('holo:closed', { detail: { fromCompanion: true } }));
    else if (hadFocus) avatar.focus({ preventScroll: true });
  }

  window.PortfolioHologram = { open, close, isOpen: () => isOpen };

  function isEditable(element) {
    return element && (element.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName));
  }

  avatar.addEventListener('click', () => (isOpen ? close() : open()));
  closeButton.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  form.addEventListener('submit', event => {
    event.preventDefault();
    ask(input.value);
  });
  panel.addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) close();
  });
  panel.addEventListener('keydown', trapFocus);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen) close();
    if (event.code === 'Slash' && event.altKey && !event.metaKey && !event.ctrlKey && !event.repeat && !event.isComposing && !isOpen && !isEditable(event.target)) {
      event.preventDefault();
      open();
    }
  });
  window.addEventListener('pagehide', () => {
    stopSpeaking();
    abortListening();
  });
  window.addEventListener('resize', () => {
    if (!isOpen) return;
    syncLayoutMode();
    positionBeam();
  });

  // Pause the idle animation when the hero is offscreen.
  if ('IntersectionObserver' in window) {
    const idle = new IntersectionObserver(entries => {
      entries.forEach(entry => stage.classList.toggle('is-offscreen', !entry.isIntersecting));
    }, { threshold: 0 });
    idle.observe(stage);
  }
})();
