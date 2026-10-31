// Holographic assistant knowledge engine.
// Runs entirely in the browser: a keyword-scored lookup over a knowledge base written from this
// page and the résumé. Also loads in Node for the tests in tests/assistant.test.mjs.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PortfolioAssistant = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const CONTACT_EMAIL = 'gursidakg123@gmail.com';
  const LINKEDIN = 'https://linkedin.com/in/gursidak-singh-grover-a8a345256';
  const GITHUB = 'https://github.com/GursidakG';
  const RESUME = 'assets/Gursidak-Grover-Resume.pdf';
  const REDSTONE_SITE = 'https://redstoneautomations.si';
  const NOTEVIS_STORE = 'https://chromewebstore.google.com/detail/notevis/iocjnepieopkfcmheegkoccpkdjdnlmi';
  const CHESS_REPO = 'https://github.com/GursidakG/Chess';

  const STOPWORDS = new Set(('a an the and or but of to in on at for with about as by from into is are was were be been ' +
    'being am do does did done have has had having i me my mine you your yours he him his she her it its we us our ours they ' +
    'them their this that these those what which who whom whose where when why how can could would should will shall may ' +
    'might must tell give know any some there here so if then than too very just please also get got much many lot up out ' +
    'over again ever really like want wanted need s t re ve ll d m whats im ive dont cant youre whos hows wheres isnt arent ' +
    'didnt doesnt wont wouldnt couldnt shouldnt yes no ok okay thing things something anything everything one bit little more ' +
    'most other another such only own same both each few all').split(/\s+/));

  const REPLACEMENTS = [
    [/c\+\+/g, ' cpp '],
    [/c#/g, ' csharp '],
    [/node\.js/g, ' nodejs '],
    [/next\.js/g, ' nextjs '],
    [/react\.js/g, ' react '],
    [/co-founder/g, ' cofounder '],
    [/on-device/g, ' on device '],
  ];

  // Names that look like plurals or verb forms but are not.
  const NO_STEM = new Set(['nodejs', 'nextjs', 'reactjs', 'aws', 'css', 'cpp', 'drf', 'rag', 'gpt', 'ccc', 'cs', 'ios', 'js']);

  function stem(word) {
    if (word.length <= 3 || NO_STEM.has(word)) return word;
    if (word.endsWith('sses')) return word.slice(0, -2);
    if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
    if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
    if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
    if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
    return word;
  }

  function words(text) {
    let clean = String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    for (const [pattern, replacement] of REPLACEMENTS) clean = clean.replace(pattern, replacement);
    clean = clean.replace(/'/g, '');
    return clean.split(/[^a-z0-9]+/).filter(Boolean);
  }

  // Every word stemmed, stopwords kept: used for phrase matching.
  function normalize(text) {
    return words(text).map(stem).join(' ');
  }

  // Content words only, stemmed: used for single-word matching.
  function tokenize(text) {
    return words(text).filter(word => !STOPWORDS.has(word) && word.length > 1).map(stem);
  }

  const START_QUESTIONS = [
    'What are you working on right now?',
    'What is Redstone Automations?',
    'Which projects are you proudest of?',
    'Where do you want to work one day?',
    'How can I get in touch?',
  ];

  const KNOWLEDGE = [
    {
      id: 'who',
      keys: { 'who are you': 5, 'who is gursidak': 5, 'describe yourself': 5, 'elevator pitch': 5, 'about yourself': 4,
        'in a nutshell': 4, 'about you': 3, 'tell me about you': 3, introduce: 4, intro: 3, bio: 3, background: 3,
        gursidak: 3, overview: 3, yourself: 2 },
      answer: "I'm Gursidak Singh Grover: a second-year Software Engineering student at York University's Lassonde School of Engineering, a Software Engineering Intern at SensTek Diagnostics, and Co-Founder & CTO of Redstone Automations. I'm based in Brampton, Ontario, and I like turning curious questions into software that ships. Right now I'm looking for a Software Engineering internship for Summer 2027.",
      links: [{ label: 'A little more about me', href: '#about' }],
      follow: ['What are you working on right now?', 'What is Redstone Automations?', 'Where do you want to work one day?'],
    },
    {
      id: 'now',
      keys: { 'right now': 5, 'these days': 5, 'at the moment': 5, 'working on': 4, currently: 4, nowadays: 4, lately: 4,
        current: 2, now: 2 },
      answer: "Two things in parallel. At SensTek Diagnostics I'm connecting lab equipment data to the web app and building the tooling around the team's pull requests. At Redstone Automations I'm shipping AI voice agents, websites and integrations for local businesses. In between, I keep side projects like NoteVis moving.",
      links: [{ label: 'Experience', href: '#experience' }, { label: 'Projects', href: '#projects' }],
      follow: ['What do you do at SensTek?', 'What is Redstone Automations?', 'Which projects are you proudest of?'],
    },
    {
      id: 'education',
      keys: { york: 4, yorku: 4, lassonde: 4, 'second year': 4, 'what year': 4, 'when do you graduate': 5, school: 3,
        university: 3, study: 3, degree: 3, education: 3, beng: 3, bachelor: 3, coursework: 3, sophomore: 3, graduate: 3,
        graduation: 3, program: 2, major: 2, course: 2, class: 2, gpa: 2, student: 2, semester: 2, campus: 2, college: 2,
        engineering: 1, year: 1, learn: 1, grade: 1 },
      answer: "I'm in the second year of a four-year Bachelor of Engineering in Software Engineering at York University's Lassonde School of Engineering, which I started in September 2025. Coursework so far includes discrete mathematics, applied linear algebra, multivariate and vector calculus, electricity and magnetism, and advanced object-oriented programming in Java. I'm also an executive member of YorkU CS Hub.",
      links: [{ label: 'See the timeline', href: '#experience' }],
      follow: ['Tell me about YorkU CS Hub', 'What do you do at SensTek?', 'What languages do you code in?'],
    },
    {
      id: 'senstek',
      keys: { senstek: 5, senstekdx: 4, 'where do you work': 5, 'your internship': 4, diagnostics: 4, 'pull request': 4,
        'dependency graph': 4, 'current job': 4, 'currently work': 4, 'current role': 4, internship: 4, intern: 3, lab: 3, laboratory: 3,
        equipment: 3, pr: 3, roadmap: 3, employer: 3, bot: 2, landing: 2, django: 1, drf: 1, mysql: 1 },
      answer: "Since May 2026 I've been a Software Engineering Intern at SensTek Diagnostics. I architected a full-stack proposal in Django/DRF, React and React Native that became the team's build roadmap, connected lab equipment activity to the web app with Python tracking scripts and a MySQL database, and cut pull-request review time by about 30% with an automated dependency-graph visualizer and a PR-commenting bot. I also redesigned the senstekdx.com landing page after benchmarking nine competitors.",
      links: [{ label: 'Experience', href: '#experience' }],
      follow: ['What is Redstone Automations?', 'What is your tech stack?', 'Why should we hire you?'],
    },
    {
      id: 'redstone',
      keys: { redstone: 5, aivaa: 5, startup: 4, founder: 4, cofounder: 4, cto: 4, receptionist: 4, 'forward deployed': 4,
        rename: 4, renamed: 4, 'name change': 4, 'changed its name': 4, 'used to be': 3, automation: 3, company: 3,
        voice: 3, client: 3, entrepreneurship: 3, entrepreneur: 3, venture: 3, agency: 3, 'small business': 3,
        'local business': 3, 'knowledge base': 3, business: 2, 'your own': 2, calendar: 2, agent: 2, website: 1 },
      answer: "Redstone Automations is the company I co-founded in February 2026 and run as CTO. It was originally called AIVAA; we renamed it Redstone Automations. We build AI agents, automated workflows and websites for small and mid-sized businesses: agents that read a situation, decide, and act across email, CRM, calendar and spreadsheets, with a person in the loop where wanted. I'm the main forward-deployed engineer, building voice agents with custom knowledge bases tied to client calendars and wiring multi-step LLM tool calling into client APIs, CRMs and email, validated with RAG and guardrails. I also own the full sales cycle for about 15 active customers, from cold outreach and discovery through closing.",
      links: [{ label: 'redstoneautomations.si', href: REDSTONE_SITE, external: true }, { label: 'Experience', href: '#experience' }],
      follow: ['How do you use AI in your work?', 'What do you do at SensTek?', 'How can I get in touch?'],
    },
    {
      id: 'nutritionwize',
      keys: { nutritionwize: 5, nutrition: 4, diet: 4, dietitian: 4, telehealth: 4, clinic: 3, prd: 3, patient: 3, csv: 3,
        'search api': 3, p95: 3, mobile: 2, latency: 2, app: 1, 'react native': 1 },
      answer: "In summer 2025 I was a Mobile App Developer at Nutritionwize Diet Clinic. I scoped and wrote the PRD for a three-module React Native app covering AI chat, telehealth and a dietitian portal, gathered requirements from the dietitians and wrote the feature specs (which improved practitioner efficiency by about 10%), and piloted the app with more than 100 patients and practitioners. On the engineering side I built CSV validation with row-level error handling in Node.js, integrated an AI chat feature using OpenAI's GPT-4o API, and reworked a high-traffic search API in Go, cutting p95 latency by 12%.",
      links: [{ label: 'See the project', href: '#projects' }],
      follow: ['What other projects have you built?', 'How do you use AI in your work?', 'What is your tech stack?'],
    },
    {
      id: 'projects',
      keys: { 'proudest of': 5, 'side project': 4, proudest: 4, project: 3, proud: 3, shipped: 3, github: 3, repo: 3,
        repository: 3, portfolio: 3, 'open source': 3, built: 2, build: 2, made: 2, ship: 2, 'show me': 2, 'what have you': 2,
        created: 2, make: 1, create: 1 },
      answer: "Three I'd point to. NoteVis: a Chrome extension that turns any webpage into structured study notes on-device, live on the Chrome Web Store. A Python chess app whose AI mode is a threaded minimax search with alpha-beta pruning, winning roughly 70% of games against intermediate players. And the Nutritionwize app, a full-stack React Native product with AI chat and a Go search API. On GitHub you'll also find a React Weather Dashboard built on Open-Meteo, a puzzle-platformer called Ember Tide Crystal Temple, and What Are The Odds, a live sportsbook odds comparison tool.",
      links: [{ label: 'Projects', href: '#projects' }, { label: 'GitHub', href: GITHUB, external: true }],
      follow: ['Tell me about NoteVis', 'Tell me about the chess engine', 'What did you do at Nutritionwize?'],
    },
    {
      id: 'notevis',
      keys: { notevis: 5, chrome: 4, extension: 4, 'web store': 4, summary: 3, summarize: 3, summarizer: 3, 'on device': 3,
        browser: 2, user: 1 },
      answer: "NoteVis is a Chrome extension I shipped in 2026. It turns any webpage, or a highlighted selection, into structured study notes: a summary, key points and a glossary in a side panel, generated on-device. Local-first, no account, no server, no analytics. Notes can be sorted into folders, searched and exported as Markdown. It passed Chrome Web Store review with minimal permissions and a hosted privacy policy, and holds a 5.0 rating from its first reviewers.",
      links: [{ label: 'Chrome Web Store', href: NOTEVIS_STORE, external: true }, { label: 'Projects', href: '#projects' }],
      follow: ['Tell me about the chess engine', 'What is your tech stack?', 'How do you use AI in your work?'],
    },
    {
      id: 'chess',
      keys: { chess: 5, minimax: 5, 'alpha beta': 5, pruning: 4, 'play chess': 4, 'board game': 3, 'win rate': 3,
        'search algorithm': 3, engine: 2, game: 2, algorithm: 1 },
      answer: "The chess engine is a Python project from 2025 to 2026: a playable app with a dark tournament-hall board, Pygame for rendering and python-chess for move legality, with check, checkmate and stalemate detection, castling, en passant and promotion. The AI mode is a threaded minimax search with alpha-beta pruning, and it wins roughly 70% of its games against intermediate players. It also has an evaluation bar, timers, a move history and captured pieces.",
      links: [{ label: 'Code on GitHub', href: CHESS_REPO, external: true }, { label: 'Projects', href: '#projects' }],
      follow: ['Tell me about NoteVis', 'What languages do you code in?', 'What do you do for fun?'],
    },
    {
      id: 'skills',
      keys: { skill: 4, python: 4, java: 4, javascript: 4, typescript: 4, cpp: 4, golang: 4, programming: 3, code: 3,
        coding: 3, 'c plus plus': 3, react: 3, nextjs: 3, node: 3, nodejs: 3, django: 3, drf: 3, 'react native': 3, aws: 3,
        sql: 3, mysql: 3, git: 3, stack: 3, tech: 3, technology: 3, framework: 3, frontend: 3, backend: 3, 'full stack': 3,
        fullstack: 3, proficient: 3, language: 2, cloud: 2, database: 2, tool: 2, expert: 2, familiar: 2, html: 2, css: 2,
        docker: 2, kubernetes: 2, rust: 2, next: 1, go: 1 },
      answer: "Languages: Python (the chess engine, SensTek's tracking scripts), JavaScript and TypeScript (NoteVis, Redstone websites), Java (coursework), Go (the Nutritionwize search API) and C++. Frameworks: React and Next.js, Node.js, Django and DRF, React Native. Tools and platforms: Git and GitHub, SQL and MySQL, AWS cloud deployment, REST API integration, data structures and algorithms, plus LLMs, RAG and machine learning. The tools change; the curiosity stays.",
      links: [{ label: 'My toolkit', href: '#skills' }],
      follow: ['Which projects are you proudest of?', 'How do you use AI in your work?', 'What are you working on right now?'],
    },
    {
      id: 'spoken-languages',
      keys: { speak: 4, spoken: 4, punjabi: 5, hindi: 5, french: 5, english: 4, bilingual: 4, multilingual: 4,
        language: 2, fluent: 3 },
      answer: 'I speak English, Punjabi, Hindi and French.',
      links: [],
      follow: ['What languages do you code in?', 'Where are you based?', 'What do you do for fun?'],
    },
    {
      id: 'interests',
      keys: { 'free time': 5, 'spare time': 5, hobby: 4, fun: 4, 'for fun': 4, music: 4, 'competitive programming': 4,
        interest: 3, instrument: 3, math: 3, mathematics: 3, enjoy: 3, passion: 3, passionate: 3, outside: 2, sport: 2,
        read: 1 },
      answer: "Outside the editor: competitive programming, entrepreneurship, mathematics and music. I like problems with a clean solution hiding inside them, and I like bringing people together, which is most of what YorkU CS Hub is about.",
      links: [{ label: 'Beyond the editor', href: '#about' }],
      follow: ['Any awards or competitions?', 'Tell me about YorkU CS Hub', 'What languages do you speak?'],
    },
    {
      id: 'location',
      keys: { brampton: 5, 'where do you live': 5, based: 4, live: 4, location: 4, toronto: 4, ontario: 4, gta: 4,
        hometown: 4, canada: 3, city: 3, relocate: 3, relocation: 3, 'where are you': 3, remote: 2, timezone: 3 },
      answer: "I'm based in Brampton, Ontario, in the Greater Toronto Area. York University's Keele campus is my second home during the term.",
      links: [{ label: 'Contact', href: '#contact' }],
      follow: ['How can I get in touch?', 'Are you open to internships?', 'Where do you want to work one day?'],
    },
    {
      id: 'contact',
      keys: { 'get in touch': 5, contact: 4, email: 4, reach: 4, linkedin: 4, 'talk to you': 4, message: 3, connect: 3,
        phone: 3, dm: 3, mail: 3, touch: 2, call: 2, number: 2, recruiter: 2, chat: 2 },
      answer: `The fastest way is email: ${CONTACT_EMAIL}. You can also connect on LinkedIn, or use the contact form on this page, which prepares an email draft for you to review and send.`,
      links: [
        { label: 'Email me', href: `mailto:${CONTACT_EMAIL}` },
        { label: 'Contact form', href: '#contact' },
        { label: 'LinkedIn', href: LINKEDIN, external: true },
      ],
      follow: ['Can I see your resume?', 'Are you open to internships?', 'Where are you based?'],
    },
    {
      id: 'resume',
      keys: { resume: 5, cv: 5, pdf: 3, download: 3 },
      answer: 'My résumé is a one-page PDF. It covers the same ground as this site with dates and specifics.',
      links: [{ label: 'Open the résumé (PDF)', href: RESUME, external: true }, { label: 'LinkedIn', href: LINKEDIN, external: true }],
      follow: ['How can I get in touch?', 'What do you do at SensTek?', 'Which projects are you proudest of?'],
    },
    {
      id: 'nvidia',
      keys: { nvidia: 6, 'dream company': 5, 'dream job': 5, 'where do you want to work': 5, 'five years': 4, 'ten years': 4,
        dream: 4, gpu: 4, cuda: 4, 'see yourself': 3, 'want to work': 3, 'one day': 3, 'long term': 3, future: 3, goal: 3,
        aspire: 3, aspiration: 3, ambition: 3, someday: 3, headed: 3, hardware: 2, plan: 2, 'work at': 2, next: 1 },
      answer: "One day I'd like to work at NVIDIA. Most of what excites me in software right now runs on their hardware, and I want to work where the hardware and the software that makes AI possible meet. Until then I'm building the fundamentals: systems, performance, and shipping real products with real users.",
      links: [{ label: 'Where I am headed', href: '#north-star' }],
      follow: ['How do you use AI in your work?', 'What is your tech stack?', 'Why should we hire you?'],
    },
    {
      id: 'leadership',
      keys: { 'cs hub': 5, 'hack club': 5, leadership: 4, club: 4, executive: 4, 'north park': 4, extracurricular: 4,
        hub: 3, event: 3, hackathon: 3, community: 3, volunteer: 3, organize: 3, organizing: 3, teach: 3, teaching: 3,
        mentor: 3, 'high school': 5, 'student life': 3, cs: 1 },
      answer: "I've been an Executive Member of YorkU CS Hub since December 2025, co-organizing tech events and networking sessions and helping run the club day to day. Before that I was a Hack Club executive at North Park Secondary School from 2023 to 2025, organizing hackathons and workshops that drew more than 200 participants and teaching members the fundamentals of coding.",
      links: [{ label: 'Experience', href: '#experience' }],
      follow: ['Any awards or competitions?', 'What do you do for fun?', 'Where do you go to school?'],
    },
    {
      id: 'achievements',
      keys: { ccc: 5, 'canadian computing': 5, fermat: 5, award: 4, achievement: 4, won: 4, win: 4, winner: 4,
        certificate: 4, certification: 4, distinction: 4, 'data analytics': 4, competition: 3, contest: 3, waterloo: 3,
        certified: 3, google: 3, medal: 3, prize: 3, cybersecurity: 3, hackathon: 2, accomplishment: 2, honor: 2,
        honour: 2 },
      answer: "A few: distinction in the Canadian Computing Competition and in the Fermat Mathematics Competition, winner of the Peel Region Hackathon, and the Google Data Analytics and Google Cybersecurity certificates. I'm currently working toward the AWS Certified Cloud Practitioner certification.",
      links: [{ label: 'Open the résumé (PDF)', href: RESUME, external: true }],
      follow: ['Tell me about YorkU CS Hub', 'Which projects are you proudest of?', 'What do you do for fun?'],
    },
    {
      id: 'ai',
      keys: { llm: 4, rag: 4, 'machine learning': 4, 'tool calling': 4, 'artificial intelligence': 4, ai: 3, ml: 3,
        openai: 3, gpt: 3, orchestration: 3, guardrail: 3, model: 2, agent: 2, prompt: 2, chatgpt: 3 },
      answer: "AI shows up across my work. At Redstone Automations I build voice agents and wire LLM tool calling, RAG and multi-step orchestration into client systems with guardrails. NoteVis runs an on-device summarizer. The Nutritionwize app uses GPT-4o for chat. The chess engine is classic search, minimax with alpha-beta pruning. What I care about most is the system around the model: data, latency, limits, and handing off to a person when that is the right call.",
      links: [{ label: 'Experience', href: '#experience' }, { label: 'Projects', href: '#projects' }],
      follow: ['What is Redstone Automations?', 'Where do you want to work one day?', 'What is this hologram?'],
    },
    {
      id: 'services',
      keys: { 'what do you do': 2, 'do you do': 1, 'build me': 4, 'website for': 3, 'help me': 3, service: 4, offer: 3,
        freelance: 3, hire: 1, 'for me': 2, help: 1 },
      answer: 'Four things, mostly: full-stack development, automation and tooling, data and backend systems, and product thinking. Through Redstone Automations I also take on client work: agentic AI, automated workflows and websites for small and mid-sized businesses.',
      links: [{ label: 'What I do', href: '#services' }, { label: 'Contact', href: '#contact' }],
      follow: ['What is Redstone Automations?', 'Which projects are you proudest of?', 'How can I get in touch?'],
    },
    {
      id: 'experience',
      keys: { experience: 4, 'work history': 4, career: 3, timeline: 3, journey: 2, job: 2, worked: 2, role: 1, work: 1 },
      answer: "Right now I'm a Software Engineering Intern at SensTek Diagnostics (since May 2026) and Co-Founder & CTO of Redstone Automations (since February 2026). In summer 2025 I was a Mobile App Developer at Nutritionwize Diet Clinic. Alongside that I'm a second-year Software Engineering student at York University and an executive member of YorkU CS Hub.",
      links: [{ label: 'The journey so far', href: '#experience' }],
      follow: ['What do you do at SensTek?', 'What is Redstone Automations?', 'What did you do at Nutritionwize?'],
    },
    {
      id: 'availability',
      keys: { 'open to': 3, 'new grad': 3, 'work with': 2, available: 4, availability: 4, looking: 3, seeking: 3,
        position: 3, hiring: 3, summer: 3, 2027: 3, 'full time': 3, 'part time': 3, opportunity: 3, collaborate: 3,
        collaboration: 3, internship: 2, role: 2, open: 2, graduate: 1, intern: 1, job: 1, freelance: 1 },
      answer: "I'm looking for a Software Engineering internship for Summer 2027, and I'm always open to a conversation about collaborations or Redstone Automations projects. Email me with what you have in mind and I'll reply personally.",
      links: [{ label: 'Email me', href: `mailto:${CONTACT_EMAIL}` }, { label: 'Open the résumé (PDF)', href: RESUME, external: true }],
      follow: ['Why should we hire you?', 'Can I see your resume?', 'Where are you based?'],
    },
    {
      id: 'why-hire',
      keys: { 'hire you': 3, 'why should': 3, 'good at': 4, 'stand out': 4, 'why you': 3, hire: 4, strength: 4, weakness: 4,
        unique: 3, accomplishment: 3, impact: 3, best: 2, different: 2, biggest: 2, result: 2, proud: 1 },
      answer: "I ship, and I measure. At SensTek my proposal became the team's roadmap and my tooling cut review time by about 30%. At Redstone Automations I'm the engineer who turns a client's messy workflow into a working agent. I'm comfortable with people as well as code: requirements sessions, events, teaching. Weaknesses are a better conversation in person; I'd rather give you an honest answer than a rehearsed one.",
      links: [{ label: 'Experience', href: '#experience' }, { label: 'Contact', href: '#contact' }],
      follow: ['What do you do at SensTek?', 'Which projects are you proudest of?', 'How can I get in touch?'],
    },
    {
      id: 'about-assistant',
      keys: { hologram: 5, holographic: 5, chatbot: 5, 'how does this work': 5, 'are you real': 5, 'are you an ai': 5,
        'who am i talking': 5, assistant: 4, bot: 4, 'this panel': 4, 'how do you work': 4, powered: 3, 'this thing': 3,
        watch: 3, privacy: 3, track: 2, data: 1 },
      answer: "This panel is a small assistant I wrote for the site. It matches your question against a knowledge base built from this page and my résumé, entirely in your browser: no API, no tracking, nothing leaves the page. If I can't answer something, I'll say so and point you to a way to ask me directly.",
      links: [{ label: 'Email me instead', href: `mailto:${CONTACT_EMAIL}` }],
      follow: ['Who are you?', 'How do you use AI in your work?', 'How can I get in touch?'],
    },
    {
      id: 'name',
      keys: { pronounce: 5, pronunciation: 5, 'full name': 4, spell: 4, name: 3, singh: 3, grover: 3 },
      answer: 'My full name is Gursidak Singh Grover. Gursidak has three syllables: Gur-si-dak.',
      links: [],
      follow: ['Who are you?', 'Where are you based?', 'How can I get in touch?'],
    },
    {
      id: 'personal',
      keys: { age: 4, old: 4, birthday: 4, religion: 4, girlfriend: 4, married: 4, salary: 4, politics: 4, family: 3,
        sikh: 3, turban: 3, single: 3, relationship: 3, pay: 2, money: 2 },
      answer: "I keep this page about my work. For anything else, say hi by email and we can talk like people.",
      links: [{ label: 'Email me', href: `mailto:${CONTACT_EMAIL}` }],
      follow: ['Who are you?', 'What do you do for fun?', 'Which projects are you proudest of?'],
    },
    {
      id: 'greeting',
      social: true,
      keys: { 'good morning': 5, 'good afternoon': 5, 'good evening': 5, hi: 5, hello: 5, hey: 5, greetings: 5, howdy: 5,
        yo: 4, sup: 4 },
      answer: "Hi! Ask me about my work at SensTek, Redstone Automations, my projects, my skills, or where I'm headed. Or pick one of the questions below.",
      links: [],
      follow: START_QUESTIONS.slice(0, 3),
    },
    {
      id: 'thanks',
      social: true,
      keys: { thanks: 5, thank: 5, cheers: 4, appreciate: 4, bye: 4, goodbye: 4, awesome: 3, cool: 3, great: 3, nice: 3,
        perfect: 3 },
      answer: 'Anytime. If you want to take this further, my email is in the contact section, and the résumé is one click away.',
      links: [{ label: 'Contact', href: '#contact' }],
      follow: ['How can I get in touch?', 'Can I see your resume?', 'Where do you want to work one day?'],
    },
  ];

  const FALLBACK = {
    id: 'fallback',
    answer: "I don't have that on this page. I can tell you about my education, my work at SensTek and Redstone Automations, my projects, my skills, where I'm headed, or how to reach me.",
    links: [{ label: 'Ask me directly', href: `mailto:${CONTACT_EMAIL}` }],
    follow: START_QUESTIONS,
  };

  // Pre-stem the keys once so a query costs one pass over the knowledge base.
  const INDEX = KNOWLEDGE.map(entry => ({
    entry,
    phrases: Object.entries(entry.keys).filter(([key]) => key.includes(' ')).map(([key, weight]) => [normalize(key), weight]),
    terms: Object.entries(entry.keys).filter(([key]) => !key.includes(' ')).map(([key, weight]) => [stem(words(key)[0] || key), weight]),
  }));

  function scoreEntry(indexed, tokens, full) {
    const padded = ` ${full} `;
    let score = 0;
    for (const [phrase, weight] of indexed.phrases) if (padded.includes(` ${phrase} `)) score += weight;
    for (const [term, weight] of indexed.terms) if (tokens.includes(term)) score += weight;
    return score;
  }

  const TOPICAL_MIN_SCORE = 2;

  function present(entry, matched) {
    return {
      id: entry.id,
      text: entry.answer,
      links: entry.links.map(link => ({ ...link })),
      suggestions: entry.follow.slice(),
      matched,
    };
  }

  function answer(question) {
    const tokens = tokenize(question);
    const full = normalize(question);
    if (!full) return present(FALLBACK, false);
    // Greetings and thanks ("social" entries) only win when no topical entry scores meaningfully,
    // so "hi, what is your email?" still answers the question.
    let topical = null;
    let topicalScore = 0;
    let social = null;
    let socialScore = 0;
    for (const indexed of INDEX) {
      const score = scoreEntry(indexed, tokens, full);
      if (indexed.entry.social) {
        if (score > socialScore) { socialScore = score; social = indexed.entry; }
      } else if (score > topicalScore) {
        topicalScore = score;
        topical = indexed.entry;
      }
    }
    if (topical && topicalScore >= TOPICAL_MIN_SCORE) return present(topical, true);
    if (social) return present(social, true);
    if (topical) return present(topical, true);
    return present(FALLBACK, false);
  }

  function suggestions() {
    return START_QUESTIONS.slice();
  }

  return { tokenize, normalize, answer, suggestions, KNOWLEDGE };
});
