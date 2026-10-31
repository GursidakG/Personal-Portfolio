# Product

<!-- impeccable:product-schema 1 -->

Source for every fact below: the existing site content, the résumé in `assets/Gursidak-Grover-Resume.pdf`, the Redstone Automations brochure (`../Redstone Website/docs/Redstone_Automations_Detailed.pdf`), and the owner's request of 2026-10-30. No interview round was held because the session ran unattended; items marked (inferred) come from those sources, not from a confirmed answer.

## Platform

web

## Stack

Static HTML, CSS and vanilla JavaScript. No build step and no runtime dependencies, inherited from the existing site. Motion is CSS keyframes and the Web Animations API; no animation library.

## Users

Recruiters, hiring managers and engineers at companies Gursidak wants to work for (NVIDIA is the stated long-term goal); potential Redstone Automations clients and collaborators; classmates and the YorkU CS Hub community; automated crawlers and AI candidate-sourcing tools that read the page (inferred).

## Product Purpose

A personal portfolio for Gursidak Singh Grover, second-year Software Engineering student at York University's Lassonde School of Engineering, Software Engineering Intern at SensTek Diagnostics and Co-Founder & CTO of Redstone Automations. The site succeeds when a visitor understands who he is within one viewport, can verify the claims (résumé, GitHub, LinkedIn) and reaches out.

## Positioning

A student who already ships: an internship with measurable results, a company he co-founded, three shipped projects. Voice: warm, curious, honest, "engineer in the making". The hero is a person you can talk to, not a photograph.

## Operating Context

Visitors arrive from LinkedIn, the résumé, GitHub and search. Desktop and phone, often from a recruiter's laptop. Static hosting; the contact form prepares an email draft and sends nothing itself.

## Capabilities and Constraints

- Content: every claim traces to the résumé or the owner's words. The résumé still names the company AIVAA; the owner confirmed it is now Redstone Automations.
- The holographic assistant answers only from a knowledge base written from the site's own content and runs entirely in the browser. No backend, no API key, no data leaves the page.
- Undecided: the public domain, whether to state availability dates, GitHub stats, testimonials. See `docs/Open items.md`.

## Brand Commitments

- A Khanda mark (chakkar in caramel) is the brand mark, replacing the earlier "g." monogram at the owner's request. Warm cream, paper, espresso, caramel and rust palette. Fraunces for display, DM Sans for text. The established look stays; this work extends it.
- One new material: amber hologram light (espresso glass, caramel edge light, soft scanlines) for the assistant.
- Hero: no photograph. A flat vector likeness (navy turban, thin glasses, dark beard, sage-green sweater) stands in the frame, invites a click, taps a watch and projects the assistant.
- AIVAA is Redstone Automations everywhere on the site.

## Evidence on Hand

- Résumé facts: roles, dates, project outcomes, competition results, certificates.
- Stats already on the site: 3 featured projects, 30% faster PR reviews, 100+ pilot participants, 200+ Hack Club participants.
- No testimonials, client logos, photos of work or awards imagery exist. Do not fabricate any.

## Product Principles

1. Every claim traces to the résumé or the owner's words; the assistant never invents.
2. Playful hero, serious content underneath.
3. Content reads without JavaScript; the assistant is an enhancement.

## Accessibility & Inclusion

Reduced motion: no choreography; the panel fades in. The character is a real button; the assistant panel is a dialog with focus management, Escape to close and a visible close control. Text contrast at or above 4.5:1. Keyboard reachable throughout (inferred from the existing site's standards).
