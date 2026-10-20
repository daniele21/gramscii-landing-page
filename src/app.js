import { initProofJourney, initAsciiWave } from "./storytelling.js";
import { initMotion, pulseEvidence } from "./motion.js";
import { scenarios } from "./content.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const workspace = $("#demo-workspace");
const sourceQuote = $("#source-quote");
const demoTabs = $$(".demo-tabs [role='tab']");
let activeCase = "contracts";
let activeSource = scenarios.contracts.defaultSource;

function span(className, text) {
  const node = document.createElement("span");
  node.className = className;
  node.textContent = text;
  return node;
}

function renderSource(sourceIndex) {
  const scenario = scenarios[activeCase];
  const source = scenario.sources[sourceIndex];
  if (!source) return;
  activeSource = sourceIndex;

  $("#source-file").textContent = source.file;
  $("#source-page").textContent = source.page;
  $("#source-heading").textContent = source.heading;

  // Construct excerpt from text nodes, never HTML strings.
  const highlight = document.createElement("mark");
  highlight.textContent = source.highlight;
  sourceQuote.replaceChildren(
    document.createTextNode(source.before),
    highlight,
    document.createTextNode(source.after)
  );

  $$(".source-link", workspace).forEach(button => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.source) === sourceIndex));
  });
}

function renderFindings(findings) {
  const container = $("#demo-findings");
  const nodes = findings.map((finding, index) => {
    const article = document.createElement("article");
    article.className = "finding";

    const number = span("finding-number", String(index + 1).padStart(2, "0"));
    const content = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = finding.title;
    const body = document.createElement("p");
    body.textContent = finding.text;
    content.append(heading, body);

    finding.citations.forEach(citation => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "source-link";
      button.dataset.source = String(citation.source);
      button.textContent = "↗ " + citation.label;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Verifica la fonte: " + citation.label);
      content.append(button);
      content.append(document.createTextNode(" "));
    });

    article.append(number, content);
    return article;
  });
  container.replaceChildren(...nodes);
}

function renderCase(name, options = {}) {
  const scenario = scenarios[name];
  if (!scenario) return;
  activeCase = name;
  const { focusTab = false } = options;

  demoTabs.forEach(tab => {
    const selected = tab.dataset.case === name;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected) {
      workspace.setAttribute("aria-labelledby", tab.id);
      if (focusTab) tab.focus();
    }
  });

  const fileNodes = scenario.files.map(file => span("file-pill", "▤ " + file));
  $("#demo-files").replaceChildren(...fileNodes);
  $("#demo-question").textContent = scenario.question;
  $("#demo-summary").textContent = scenario.summary;
  renderFindings(scenario.findings);
  renderSource(scenario.defaultSource);
}

demoTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => { renderCase(tab.dataset.case); pulseEvidence(workspace); });
  tab.addEventListener("keydown", event => {
    let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % demoTabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + demoTabs.length) % demoTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = demoTabs.length - 1;
    if (next !== null) {
      event.preventDefault();
      renderCase(demoTabs[next].dataset.case, { focusTab: true });
    }
  });
});

workspace.addEventListener("click", event => {
  const button = event.target.closest(".source-link");
  if (!button || !workspace.contains(button)) return;
  const index = Number(button.dataset.source);
  renderSource(index);
  pulseEvidence(sourceQuote);
});

$$("[data-demo-select]").forEach(button => {
  button.addEventListener("click", () => {
    renderCase(button.dataset.demoSelect);
    $("#demo").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
});

$$("[data-mode]").forEach(button => {
  button.addEventListener("click", () => {
    const selected = button.dataset.mode;
    $$("[data-mode]").forEach(control => {
      const isSelected = control.dataset.mode === selected;
      control.classList.toggle("is-selected", isSelected);
      control.setAttribute("aria-pressed", String(isSelected));
    });
    $("#mode-local").hidden = selected !== "local";
    $("#mode-connected").hidden = selected !== "connected";
    pulseEvidence($("#mode-" + selected));
  });
});

const menuToggle = $(".menu-toggle");
const menu = $("#site-nav");
function closeMenu() {
  menu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Apri menu");
}
menuToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Chiudi menu" : "Apri menu");
});
$$("a", menu).forEach(link => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menu.classList.contains("is-open")) {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener("click", event => {
  if (!menu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

$("#year").textContent = String(new Date().getFullYear());
renderCase(activeCase);
initMotion();
initProofJourney();
initAsciiWave();
