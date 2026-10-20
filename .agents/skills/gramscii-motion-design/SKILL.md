---
name: gramscii-motion-design
description: Design and review intentional premium motion for the Gramscii static landing page.
---

# Gramscii Motion Design

Use when editing the landing hero, reveal choreography, card feedback, scroll transitions, evidence interactions or ASCII signature.

## Design intent

Gramscii communicates **control, evidence, locality and craftsmanship**. Keep ink, navy, ice, bone, slate and subtle teal. Keep Georgia for editorial headings, Bodoni/Didot for the wordmark only, system sans for body and mono for technical labels. Avoid generic AI particle orbs, parallax overload, cursor trails, typewriter text, scroll-jacking or Lottie-heavy decorations.

## Animation hierarchy

1. **Hero:** traits → promise → document outcome → description/CTA → product illustration. One entrance, approximately 1.4s, never block input.
2. **Proof of source:** animate the specific updated excerpt after a citation click. Use 250–350ms.
3. **Narrative chapters:** one-time viewport reveal, title then cards, stagger ≤225ms, Y-offset ≤24px, opacity and transform only.
4. **Hover/focus:** card lift max 4px and border accent, no 3D rotation; preserve keyboard focus.
5. **Brand signature:** subtle [::] / ASCII accents, never effects competing with copy.

Default ease: cubic-bezier(.22, 1, .36, 1); entrance ~650ms; interaction ~300ms; stagger 75ms. Continuous animations should be rare.

## Technical contracts

- Site is native HTML/CSS/ES modules, served locally using python3 -m http.server 4173. No npm runtime dependencies, CDN assets or external font requests. Motion implementation lives in motion.css and src/motion.js.
- **No JavaScript = full content visible.** Never hide semantic content before opt-in is established. Do not gate navigation on animation completion.
- Honor prefers-reduced-motion: reduce at first render and on preference changes. All information must remain readable and focus visible.
- Use IntersectionObserver for one-time reveals, not global scroll listeners. No scroll hijacking or unexpected movement triggered by pointer.
- Prefer compositor-friendly opacity and transform. Limit shadow/border transitions to small hovered interactive elements. Avoid layout-changing width/height animation.
- Decorative animation is aria-hidden; demo remains explicitly illustrative and fictional; preserve keyboard, ARIA and source links.
- Do not introduce trackers, remote calls, large dependencies or rewrite the site's architecture for animations.

## Quality gates

1. npm test and node --check src/motion.js pass.
2. Browser audit on 320/390/640/768/1440 widths covers scroll reveal, layout overflow and theme.
3. Test no JavaScript/CSS, reduced-motion and keyboard navigation; demo tabs, source citations, local/connected toggle, menu and anchor links still work.
4. Verify local-ci/mac on the exact branch SHA; dispatch-success is not sufficient.
5. When visual layout changes, require screenshot/manual review; layout tests alone are not pixel-level aesthetic QA.

## When GSAP might be worth adding

Only in a later experiment if user testing demonstrates need for multi-step pinned scroll scenes or dense coordinated motion. Never combine GSAP and Motion by default. Measure performance and reduced-motion before merging such an experiment.

## Phase 2 narrative and animated signature

- `storytelling.css` and `src/storytelling.js` define the restrained three-chapter **documenti → AI locale → fonte verificabile** source-trace scene inside the demo section. This is a visual explanation, never a claim of actual inference. The three complete explanatory cards remain legible and accessible without JavaScript.
- Desktop: the framed schema uses `position: sticky` as the browser scrolls alongside the prose, but never pins or intercepts scroll input. At <=960px the panel becomes normal flow; small screens stack each chapter vertically.
- Hero: an aria-hidden, decorative ASCII sine wave draws at <=10fps only when visible, ceases work offscreen or on a hidden page, and freezes under reduced motion. No network, no user data, no canvas, no telemetry.
- Tests assert the chapter selection and backward scrolling logic, animation lifecycle, reduced motion, layout and no overflow.

## Review rule: trust settled screenshots, not transient CSS animation frames

- Automated screenshot capture must wait for the visual composition to settle and explicitly bypass temporary CSS entrance opacity. A blank hero in a QA screenshot is **not** evidence of a well-rendered page.
- Every desktop-to-mobile grid override must be checked on 320, 390 and 768px; reject any hero preview that overlaps main copy.
- Select the source-trace chapter from persisted visibility ratios of **all** observed steps; partial IntersectionObserver callbacks are not full scene snapshots.
- Source-trace transitions must never tween light backgrounds and text colours independently through unreadable intermediate contrast.
- GitHub Actions may attach a small `gramscii-local-preview` static bundle for exact-version offline review; do not deploy or introduce an external host for QA.
