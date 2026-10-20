/**
 * Gramscii Motion System v1 — progressive enhancement, no dependencies.
 *
 * Narrative rhythm: one contained hero entrance, one-time viewport reveals,
 * evidence transitions only after the user selects a source or mode.
 * Content always remains visible without JavaScript, IntersectionObserver,
 * or when the user requests reduced motion.
 */
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function motionAllowed() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && !window.matchMedia(MOTION_QUERY).matches;
}

const REVEAL_TITLES = [
  ".section-intro h2",
  ".section-intro > p:last-child",
  ".value-heading",
  ".local-copy h2",
  ".local-copy > p:not(.eyebrow)",
  ".mission-content h2",
  ".mission-content .mission-lead",
  ".mission-everyday",
  ".vision-heading h2",
  ".vision-heading > p",
  ".independence h2",
  ".tech-copy h2",
  ".faq-section h2",
  ".closing h2"
];
const CARD_GROUPS = [
  ".stories-grid > .story-card",
  ".value-grid > .value-item",
  ".case-grid > .case-card",
  ".vision-path > .vision-step"
];

/**
 * Installs a single bounded IntersectionObserver. Never hides semantic content
 * in the source HTML or at stylesheet load. On reduced-motion changes, reveals
 * pending items and cancels the ornamental entrance.
 */
export function initMotion(doc = document, win = window) {
  const root = doc.documentElement;
  const preference = win.matchMedia?.(MOTION_QUERY);
  if (!preference || preference.matches || typeof win.IntersectionObserver !== "function") {
    root.classList.add("motion-static");
    return () => {};
  }

  const candidates = [];
  const seen = new Set();
  const add = (el, index = 0) => {
    if (!el || seen.has(el)) return;
    seen.add(el);
    el.style.setProperty("--motion-delay", Math.min(index, 3) * 75 + "ms");
    candidates.push(el);
  };

  REVEAL_TITLES.forEach(selector => doc.querySelectorAll(selector).forEach(el => add(el)));
  CARD_GROUPS.forEach(selector => doc.querySelectorAll(selector).forEach((el, index) => add(el, index)));

  const observer = new win.IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });

  // Elements initially visible never briefly disappear while the observer
  // queues its initial delivery.
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    el.classList.add("reveal-pending");
    if (rect.bottom > 0 && rect.top < win.innerHeight * 0.9) {
      el.classList.add("is-visible");
    } else {
      observer.observe(el);
    }
  }
  root.classList.add("motion-ready");

  function disableMotion() {
    observer.disconnect();
    root.classList.remove("motion-ready");
    root.classList.add("motion-static");
    for (const el of candidates) el.classList.add("is-visible");
  }
  const onPreferenceChange = e => { if (e.matches) disableMotion(); };
  preference.addEventListener?.("change", onPreferenceChange);

  return () => {
    observer.disconnect();
    preference.removeEventListener?.("change", onPreferenceChange);
    root.classList.remove("motion-ready");
    for (const el of candidates) el.classList.add("is-visible");
  };
}

/** Lightweight response feedback, never blocks user interaction. */
export function pulseEvidence(element) {
  if (!element || !motionAllowed() || typeof element.animate !== "function") return;
  // A fresh text excerpt should read as a changed evidence state rather than
  // as a decorative global transition.
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate([
    { opacity: 0.55, transform: "translate3d(0, 5px, 0)" },
    { opacity: 1, transform: "translate3d(0, 0, 0)" }
  ], { duration: 340, easing: "cubic-bezier(.22, 1, .36, 1)" });
}
