/**
 * Gramscii V2 — native visual storytelling.
 * Evidence stages respond to viewport intersection, not scroll listeners.
 * ASCII wave is purely decorative, local, low-frequency and pauses offscreen.
 */
const proofLabels = ["DOCUMENTI", "AI LOCALE", "FONTE"];
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Pure, deterministic ASCII waveform; no content, telemetry or random values. */
export function renderAsciiFrame(phase = 0, cols = 32, rows = 9) {
  const result = [];
  for (let y = 0; y < rows; y++) {
    let line = "";
    for (let x = 0; x < cols; x++) {
      const center = (rows - 1) / 2 + Math.sin(x * .29 - phase * .31) * 1.55;
      const offset = Math.abs(y - center);
      const shimmer = Math.sin(x * .6 + y * .9 + phase * .21);
      if (offset < .5) line += shimmer > .2 ? "*" : "+";
      else if (offset < 1.14) line += shimmer > -.35 ? ":" : ".";
      else if (offset < 1.85 && (x + y) % 3 === 0) line += ".";
      else line += " ";
    }
    result.push(line);
  }
  return result.join("\n");
}

/** Updates the presentation only; all three copy blocks always remain visible. */
export function setProofStep(scene, steps, index) {
  if (!scene || !steps.length) return;
  const safe = Math.max(0, Math.min(steps.length - 1, index));
  scene.dataset.activeStep = String(safe);
  scene.querySelectorAll("[data-proof-node]").forEach((node, i) => {
    node.classList.toggle("is-active", i === safe);
  });
  steps.forEach((step, i) => step.classList.toggle("is-active", i === safe));
  const readout = scene.querySelector("[data-proof-readout]");
  const counter = scene.querySelector("[data-proof-index]");
  if (readout) readout.textContent = proofLabels[safe] ?? proofLabels[0];
  if (counter) counter.textContent = String(safe + 1).padStart(2, "0") + " / 03";
}

/** Sticky scene changes to match the adjacent scroll chapter. */
export function initProofJourney(doc = document, win = window) {
  const scene = doc.querySelector("[data-proof-scene]");
  const steps = Array.from(doc.querySelectorAll("[data-proof-step]"));
  if (!scene || steps.length !== 3) return () => {};
  setProofStep(scene, steps, 0);

  if (typeof win.IntersectionObserver !== "function") return () => {};
  // IntersectionObserver callbacks contain only CHANGED entries, not a full
  // snapshot of every chapter. Persist each ratio so the scene always picks
  // the most visible chapter rather than whichever entry fired last.
  const ratios = new Map(steps.map(step => [step, 0]));
  const observer = new win.IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!ratios.has(entry.target)) continue;
      ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    }
    let bestIndex = -1;
    let bestRatio = 0;
    for (const [index, step] of steps.entries()) {
      const ratio = ratios.get(step) ?? 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIndex = index;
      }
    }
    if (bestIndex >= 0 && Number(scene.dataset.activeStep) !== bestIndex) {
      setProofStep(scene, steps, bestIndex);
    }
  }, { rootMargin: "-16% 0px -30% 0px", threshold: [0, .1, .3, .5, .7] });

  steps.forEach(step => observer.observe(step));
  return () => observer.disconnect();
}

/** 10fps maximum, paused when offscreen, hidden or motion is reduced. */
export function initAsciiWave(doc = document, win = window) {
  const field = doc.querySelector(".hero-ascii-signal");
  if (!field) return () => {};
  const reduced = win.matchMedia?.(REDUCED);
  const compact = win.matchMedia?.("(max-width: 650px)")?.matches ?? false;
  const cols = compact ? 24 : 32;
  const rows = compact ? 7 : 9;
  field.textContent = renderAsciiFrame(0, cols, rows);

  if (!reduced || typeof win.IntersectionObserver !== "function" ||
      typeof win.requestAnimationFrame !== "function" ||
      typeof win.cancelAnimationFrame !== "function") return () => {};

  let inView = false;
  let running = false;
  let rafId = 0;
  let lastPaint = -Infinity;
  let phase = 0;
  const allowed = () => !reduced.matches && doc.visibilityState !== "hidden";

  const tick = time => {
    if (!running) return;
    if (time - lastPaint >= 100) {
      field.textContent = renderAsciiFrame(phase++, cols, rows);
      lastPaint = time;
    }
    rafId = win.requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    win.cancelAnimationFrame(rafId);
    rafId = 0;
  };
  const reconcile = () => {
    if (!inView || !allowed()) {
      stop();
      if (reduced.matches) field.textContent = renderAsciiFrame(0, cols, rows);
      return;
    }
    if (!running) {
      running = true;
      lastPaint = -Infinity;
      rafId = win.requestAnimationFrame(tick);
    }
  };

  const observer = new win.IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === field) inView = entry.isIntersecting;
    }
    reconcile();
  }, { threshold: .01 });
  observer.observe(field);
  const onChange = () => reconcile();
  const onVisibility = () => reconcile();
  reduced.addEventListener?.("change", onChange);
  doc.addEventListener?.("visibilitychange", onVisibility);

  return () => {
    stop();
    observer.disconnect();
    reduced.removeEventListener?.("change", onChange);
    doc.removeEventListener?.("visibilitychange", onVisibility);
  };
}
