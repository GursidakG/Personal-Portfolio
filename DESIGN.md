---
name: Gursidak Grover Portfolio
description: A warm, paper-and-caramel personal portfolio whose hero is a vector likeness that projects an amber hologram.
colors:
  cream: "#f4e9da"
  paper: "#f9f3ea"
  espresso: "#2e1f16"
  caramel: "#c4813f"
  rust: "#a4592f"
  muted: "#75614f"
  line: "#daccb9"
  stage-sand: "#e7cfb1"
  holo-glass: "rgb(46 31 22 / 0.9)"
  holo-light: "#f2c58a"
  holo-text: "#f1e4d2"
  holo-muted: "#d4bc9d"
  sage: "#5f6c54"
  turban-navy: "#2b3348"
  skin: "#cd9a6e"
  redstone-red: "#ff1a1a"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(58px, 5.7vw, 82px)"
    fontWeight: 500
    lineHeight: 1.07
    letterSpacing: "-2.5px"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(37px, 3.8vw, 52px)"
    fontWeight: 500
    lineHeight: 1.13
    letterSpacing: "-1.8px"
  title:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.4px"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.8
  small:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "1.6px"
rounded:
  sm: "4px"
  md: "7px"
  lg: "18px"
  pill: "30px"
  round: "50%"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  section: "100px"
components:
  button-primary:
    backgroundColor: "{colors.caramel}"
    textColor: "#24170e"
    typography: "{typography.small}"
    rounded: "{rounded.sm}"
    padding: "14px 22px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "#cc9156"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.espresso}"
    rounded: "{rounded.sm}"
    padding: "14px 22px"
    height: "50px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.espresso}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "9px 15px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.md}"
    padding: "30px"
  input:
    backgroundColor: "#fbf5ec"
    textColor: "{colors.espresso}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "13px"
  holo-panel:
    backgroundColor: "{colors.holo-glass}"
    textColor: "{colors.holo-text}"
    rounded: "{rounded.lg}"
    padding: "20px 22px"
  holo-chip:
    backgroundColor: "rgb(255 255 255 / 0.04)"
    textColor: "#ead9c2"
    rounded: "{rounded.pill}"
    padding: "7px 12px"
---

# Design System: Gursidak Grover Portfolio

## Overview

**Creative North Star: "The Warm Workshop"** (named by the documenter from the built site, not yet confirmed by the owner)

A maker's desk in late-afternoon light. Cream paper, espresso ink, one caramel accent, and type that reads like a good magazine: a high-contrast serif for the few words that matter and a plain humanist sans for everything else. Density is editorial, not app-like; sections breathe at 100px, hairlines do the structural work, and colour is spent on emphasis only.

The one futuristic object in the room, the hologram, obeys the room's light. It glows amber, not cyan; its glass is espresso, not black; its type is cream. The hero's vector likeness is flat geometric vector in the same palette, so the person and the page belong to each other.

**Key Characteristics:**
- Warm neutrals with a single caramel-to-rust accent family
- Fraunces display at tight tracking, DM Sans body at 17px / 1.8
- Hairline structure; shadows only on hover and on the two floating objects (speech bubble, hologram)
- One authored motion moment: the watch tap and the rising panel
- Flat vector illustration, stroke-icon system at 1.6px, no emoji, no photography

## Colors

A warm paper palette with one accent family and a small set of hologram tints.

### Primary
- **Caramel** (#c4813f): the accent. Primary button fill, the Khanda's chakkar in the brand mark, active markers, hologram light source, link hover. Kept rare.
- **Rust** (#a4592f): emphasised words in headings (always italic), active nav, text-link hover, focus rings.

### Neutral
- **Cream** (#f4e9da): page background and header.
- **Paper** (#f9f3ea): alternating section background (What I do, Projects) and card fill.
- **Espresso** (#2e1f16): body text, the Skills section and footer background.
- **Muted** (#75614f): secondary copy, labels, captions. On espresso surfaces secondary text is tinted cream (#c5b19b, #cdb394), never gray.
- **Line** (#daccb9): hairlines, card borders, dividers.
- **Stage Sand** (#e7cfb1): the soft radial warmth behind the character.

### Hologram
- **Holo Glass** (rgb(46 31 22 / 0.9)): panel background with a 14px backdrop blur on desktop; opaque (0.985) when the panel becomes a sheet.
- **Holo Light** (#f2c58a): the lit edge, link pills, watch screen when active.
- **Holo Text** (#f1e4d2) and **Holo Muted** (#d4bc9d): panel copy and secondary copy.

### Character and brand marks
- **Sage** (#68765e to #4a5644), **Turban Navy** (#3d4660 to #1f2438), **Skin** (#cd9a6e): the vector likeness only.
- **Redstone Red** (#ff1a1a): the Redstone Automations cube mark only. It never colours type or UI.

### Named Rules
**The One Accent Rule.** Caramel and rust are the only accent hues. Emphasis is a rust italic word or a caramel fill, never a second hue.
**The Amber Light Rule.** Anything that emits light on this site (the watch, the beam, the panel edge) is caramel or holo-light. No cyan, no white-blue.

## Typography

**Display Font:** Fraunces (with Georgia, serif)
**Body Font:** DM Sans (with Arial, sans-serif)

**Character:** A sharp editorial serif for names and headings, set tight, with the key word in rust italic; a quiet humanist sans for everything else, set large and loose for reading.

### Hierarchy
- **Display** (500, clamp(58px, 5.7vw, 82px), 1.07, -2.5px): the name in the hero only.
- **Headline** (500, clamp(37px, 3.8vw, 52px), 1.13, -1.8px): section headings; the hologram title uses the same face at 25px.
- **Title** (600, 21 to 28px, 1.4): card and timeline titles in DM Sans; project titles in Fraunces 500 at 28px.
- **Body** (400, 17px, 1.8): paragraphs and list items; hologram copy at 14.5px / 1.6.
- **Small** (400 to 600, 14px): buttons, chips, links, captions.
- **Label** (600, 12px, 1.6px tracking, uppercase): section labels, item types, strip captions.

### Named Rules
**The Rust Italic Rule.** One italic rust phrase per heading carries the emphasis. Never two, never a colour other than rust (or #d49a61 on espresso).

## Layout

The page opens on a cover pinned along a 300svh runway: particle portrait (sampled offline from a photograph) centred slightly above the middle, meta columns across the top (brand, Currently, Based in, Navigation), lede bottom-left, "Step inside" bottom-right, the name along the bottom edge at `clamp(80px, 13.2vw, 196px)` bleeding past the viewport. Scrolling flies the camera through the particle field; the header and main slide up over the cover's last screen (the runway carries a -100svh bottom margin and main sits above the cover with its own cream background), then the sticky header takes over and the rest of the page follows.

A single column of sections inside a 1200px container (`min(1200px, calc(100% - 112px))`, narrowing to 40px gutters below 960px). Sections pad 100px vertically (80px below 1100px, 65px below 640px). Two-column grids (about, skills, contact) collapse to one column at 700px. The hero is a 1.12fr / 1fr grid: copy left, a 580px-tall stage right; it stacks at 700px with the stage at 440px. Service cards run four across, two at 1100px, one at 640px. The timeline alternates sides around a centre line and becomes a left-rail list at 640px. The hologram is absolutely positioned inside the stage on desktop and becomes a fixed bottom sheet with a dimmed backdrop below 960px.

## Elevation & Depth

Hairlines carry structure; surfaces are flat at rest. Shadows appear in three places only: on hover (cards lift 5 to 6px with a soft caramel-tinted shadow, buttons lift 3px), under the speech bubble, and under the hologram panel, which is lit from the lower left where the watch is.

### Shadow Vocabulary
- **Card hover** (`box-shadow: 0 12px 26px #c4813f15`): service and project cards on hover.
- **Button hover** (`box-shadow: 0 7px 22px #c4813f32`): primary buttons on hover.
- **Speech bubble** (`box-shadow: 0 14px 28px -14px rgb(98 66 35 / .45)`): the floating "Click on me" note.
- **Hologram** (`box-shadow: 0 40px 70px -34px rgb(46 31 22 / .7), -18px 22px 70px -28px rgb(196 129 63 / .6)`): the panel, with the amber component offset toward the watch.

### Named Rules
**The Hairline Rule.** Structure is a 1px line in Line; a shadow is a response to hover or to floating, never a resting state on a card.

## Shapes

Small radii on controls (4px buttons and inputs), 5 to 7px on cards, 18px on the hologram panel, pills (20 to 30px) on chips and link pills, circles on icon buttons and the assistant mark. The speech bubble is 16px with a 4px bottom-left corner and a clipped square tail. The character is built from rounded paths with no outlines.

## Components

### Buttons
- **Shape:** 4px radius, 50px tall, 14px 22px padding, 14px 600 text, icon 17px at the right with 22px gap.
- **Primary:** Caramel fill, #24170e text; hover #cc9156, lifts 3px with the button-hover shadow.
- **Outline:** transparent with a #b7a38d 1px border; hover a faint white wash.
- **Icon buttons:** 44px circles; hover a 12% caramel wash.

### Chips
- **Style:** 30px pill, 1px Line border, 14px text, 17px rust stroke icon.
- **Hologram chips:** pill, 1px caramel 35% border, 4% white fill, #ead9c2 text; hover 16% caramel wash.

### Cards / Containers
- **Corner Style:** 5px (service, timeline) to 6px (project).
- **Background:** Paper; timeline cards #f8f0e4.
- **Shadow Strategy:** none at rest, card-hover shadow with a 5 to 6px lift.
- **Border:** 1px #e1d3c2 or Line; a reached timeline card warms its border to #c99e72.
- **Internal Padding:** 25 to 32px.

### Inputs / Fields
- **Style:** #fbf5ec fill, 1px #d9c9b5 border, 4px radius, 13px padding, 17px text, placeholder #76634f.
- **Focus:** border turns rust; the global 3px rust outline at 5px offset.
- **Hologram input:** 6% white fill, caramel 35% border, 10px radius, caramel caret; focus-visible a 2px holo-light outline.

### Navigation
- Sticky cream header with a hairline, 100px tall condensing to 74px on scroll. Links 15px 550, rust 1px underline slides in on hover and on the current section. Below 960px a 44px bordered toggle opens a stacked menu.

### Brand mark
A Khanda drawn in `currentColor` with the chakkar in caramel, 42px in the header, 36px in the footer, 16px inside the assistant's message mark. No wordmark.

### The Cover and the Companion (signature)
The cover's particles are about 7,000 squares from `portrait-data.js` (or sampled from the hero SVG's head as a fallback), drawn on a canvas over the cream ground with 220 faint caramel "stars" at varied depths; they assemble over 1.9s with up to 0.9s stagger, drift ±0.7px, repel within 90px of the pointer, and as scroll progress runs 0 to 1 a camera travels 1.08 units through the field so near particles pass first, everything fading in the last 8%. The companion is a 96 × 130px bust fixed bottom-right with a cream bubble (14/14/4/14 radii), appearing with a 24px rise; it points for 1.4s when a new section arrives.

### The Character and the Hologram (signature)
A 320 x 560 inline SVG figure inside a `<button>`: a photographic dastar (`assets/dastar.png`, feathered cutout) on a flat vector head, thin glasses, beard, sage sweater, dark trousers, a watch on the left wrist. Idle: breathing (4.4s), script-timed blinks (2.5 to 6.5s, sometimes doubled), eyes and head following the pointer (±2.4px pupils, ±5deg head), a glance at the watch every 11 to 17 seconds, a floating speech bubble with a cycling hint. Hover waves the free arm, raises the brows and widens the smile. Click: a 140ms wind-up, then the watch arm rotates to the chest (-40deg / -52deg), the head tilts 8deg, the tapping arm reaches across (-56deg / 128deg) and the finger extends; at 0.9s the watch flashes; at 1s an amber cone rises and the panel resolves from blur over 0.55 to 0.7s with `cubic-bezier(.16, 1, .3, 1)`. Close reverses in 0.35s. Reduced motion skips the choreography and fades the panel.

## Do's and Don'ts

### Do:
- **Do** set body copy at 17px / 1.8 and labels uppercase at 12px with 1.6px tracking.
- **Do** keep every emitted light caramel or holo-light.
- **Do** use the stroke icon library (1.6px, round caps) for every icon.
- **Do** list skills with where they shipped; the site deliberately has no proficiency bars.
- **Do** keep the hologram's answers honest: text from the knowledge base only, links from the same source.

### Don't:
- **Don't** introduce a second accent hue or use Redstone Red outside the cube mark.
- **Don't** add a photograph of the owner to the hero; the vector likeness is the hero.
- **Don't** make the hologram cyan, black, or white.
- **Don't** add resting shadows to cards.
- **Don't** use emoji or Unicode glyphs as icons.
