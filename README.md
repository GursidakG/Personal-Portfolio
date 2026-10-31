# Gursidak Grover — Personal Portfolio

A responsive, single-page portfolio in HTML, CSS, and vanilla JavaScript. No dependencies or build step are required.

## Preview

From this folder, run:

```sh
python3 -m http.server 3000 --bind 127.0.0.1
```

Open http://127.0.0.1:3000. You can also open `index.html` directly, though a local server is recommended for clipboard support.

## Test

```sh
node --test
```

The tests cover the assistant's knowledge engine: tokenizing, routing of representative questions, fallbacks, and the shape of every knowledge entry.

## Files

- `index.html`: biography, the hero character and holographic assistant, experience, selected projects, skills, social links, contact details, and JSON-LD structured data.
- `styles.css`: caramel theme, responsive layouts, accessibility, and motion styles.
- `refinements.css`: readable typography, entrance and scroll-linked timeline animations, the north-star band, and the skills list.
- `cover.css`: the cover (particle portrait, name, meta columns) and the companion guide.
- `hero.css`: the hero stage, the vector character's idle and watch-tap poses, the speech bubble, and the holographic panel (absolute on desktop, a fixed sheet below 960px).
- `script.js`: navigation, progress indicator, counters, skill tabs, and contact draft preparation.
- `assistant.js`: the knowledge base and the keyword-scored engine behind the assistant. Also loads in Node for the tests.
- `hologram.js`: the character button, the open and close sequence, message rendering, suggestions, the light beam, the local clock, spoken answers and voice input.
- `cover.js`: the cover's particle portrait, the scroll-driven fly-through along the pinned runway, and the hero's gated entrance.
- `portrait-data.js`: particle positions and colours sampled offline from a photograph; the photo itself is not part of the site.
- `companion.js`: the small guide that follows the visitor down the page, one line per section, and opens the assistant as a sheet.
- `character.js`: pointer-following eyes and head, randomized blinks, the idle glance at the watch, and the cycling speech-bubble hint.
- `assets/Gursidak-Grover-Resume.pdf`: the supplied résumé, linked by the hero button and the assistant.
- `assets/developer-portrait.jpg`, `assets/developer.svg`: the earlier hero imagery, no longer referenced by the page.
- `assets/favicon.svg`: Khanda favicon.
- `assets/dastar.png`: the owner's dastar, cut out of a photograph with a feathered edge, worn by the vector figure.
- `robots.txt`, `llms.txt`, `resume.json`: crawler and machine-readable companions (JSON Resume v1). Add a `Sitemap:` line and canonical/Open Graph URLs once the domain is known.
- `PRODUCT.md`, `DESIGN.md`: product context and the design system.
- `docs/`, `handoff.md`: working notes (plan, decisions, open items). Local only; both are gitignored.
- `.vercelignore`, `vercel.json`: the allowlist of files Vercel publishes, and the host security headers.

## The cover

The first screen is a field of warm particles that fly together into a portrait, with the name running along the bottom edge. The particles come from `portrait-data.js` (sampled offline from a photograph); without that file the page samples the hero's own SVG instead. Moving the pointer pushes particles aside. The cover stays pinned while you scroll about two screens: the camera travels through the field, near particles pass first, the name falls away, and the page slides up underneath, where the hero's entrance plays as it comes into view. "Step inside" jumps there directly.

## The hero and the assistant

The hero shows a flat vector likeness instead of a photograph, wearing his real dastar cut out of a photo. His eyes and head follow the pointer, he blinks on his own schedule and glances at his watch when ignored. The figure is a real `<button>`: hovering waves, clicking winds up and poses the arms so one hand taps the watch on the other wrist, the watch lights, and a panel rises from it. Pressing Alt + / opens the panel from the keyboard. The panel is a non-modal dialog where visitors ask questions in plain language.

The panel shows Brampton's local time, can read answers aloud (browser speech synthesis, off by default, remembered per browser), and takes spoken questions in browsers that offer speech recognition. Nothing is sent to any server by the site itself.

Once the hero has scrolled away, a small version of the figure appears bottom-right with one line per section; clicking him opens the same assistant as a sheet from anywhere on the page. The × hides him for the session.

Answers come from `assistant.js`: each knowledge entry has weighted keywords and phrases, the question is tokenized and stemmed, and the highest-scoring entry answers. Unknown questions get an honest fallback with suggested questions. Nothing is sent anywhere; there is no API key and no tracking. To change an answer, edit the entry in `assistant.js` and run the tests.

## Content

Experience, projects, dates, achievements, and statistics are drawn from the supplied résumé. The company formerly called AIVAA is Redstone Automations throughout, and the linked résumé is the October 2026 version that uses the new name. Project cards link to the Chrome Web Store listing and the GitHub repositories, and each carries a short case study in a collapsible block. The skills list shows where each tool shipped rather than proficiency bars. The copy describes the résumé rather than independently verifying its claims.

## Contact form

The form validates the visitor's input, then creates a draft addressed to **gursidakg123@gmail.com**. The visitor can open the draft in their own email application or copy the message. The website never sends mail itself and does not store submissions. Update the address in `index.html`, `script.js`, and `assistant.js` if it changes.

## Accessibility and motion

Includes semantic landmarks, a skip link, visible focus styles, labeled fields, keyboard-accessible skill tabs (arrow keys, Home, End), an Escape-dismissable mobile menu, and reduced-motion support. The assistant panel moves focus to its input when it opens, closes on Escape or its close button, and returns focus to the character. Content remains visible without JavaScript; the assistant is an enhancement. With reduced motion, the character does not animate and the panel appears without choreography.

Google Fonts supplies Fraunces and DM Sans, with local serif and sans-serif fallbacks. No tracking or analytics is included.

## Publish

Upload only the site files to a static web host: `index.html`, the four stylesheets, the seven scripts, `assets/`, `robots.txt`, `llms.txt`, and `resume.json`. Leave `docs/`, `tests/`, `.impeccable/`, `PRODUCT.md`, `DESIGN.md`, `handoff.md`, and this README out of the published bundle. Serve `index.html` at the root; no build command is required. The page ships a Content Security Policy meta tag; set `frame-ancestors`, HSTS, and `X-Content-Type-Options` as headers at the host, since a meta tag cannot carry them. On Vercel, `.vercelignore` and `vercel.json` already handle both the file list and the headers.
