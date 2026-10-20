import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { scenarios } from "../src/content.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const softTheme = readFileSync(new URL("../soft-theme.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");

test("every demo citation points to a real excerpt in its own scenario", () => {
  assert.equal(Object.keys(scenarios).length, 3);
  for (const [name, scenario] of Object.entries(scenarios)) {
    assert.ok(scenario.files.length > 0, name + ": files missing");
    assert.ok(scenario.question && scenario.summary, name + ": copy missing");
    assert.ok(scenario.sources[scenario.defaultSource], name + ": invalid default source");
    for (const finding of scenario.findings) {
      assert.ok(finding.title && finding.text);
      assert.ok(finding.citations.length > 0);
      for (const citation of finding.citations) {
        assert.ok(Number.isInteger(citation.source));
        assert.ok(scenario.sources[citation.source], name + ": broken source index");
        assert.ok(citation.label.length > 0);
      }
    }
    for (const source of scenario.sources) {
      assert.ok(source.file && source.page && source.heading);
      assert.ok(source.highlight && source.before && source.after);
      assert.ok(scenario.files.includes(source.file), name + ": source not in attached files");
    }
  }
});

test("landing has meaningful navigation, heading and key sections", () => {
  assert.match(html, /<html lang="it">/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<h1 id="hero-heading">/);
  for (const id of ["perche", "demo", "casi", "tecnologia", "domande", "contatto"]) {
    assert.ok(html.includes('id="' + id + '"'), "Missing section: " + id);
  }
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<meta name="description"/);
});

test("demo is explicitly labelled as fictional, and local mode is qualified", () => {
  assert.match(html, /Esempio illustrativo con dati fittizi/);
  assert.match(html, /senza costi API per l'inferenza/);
  assert.match(html, /Ricerca sul web.*richiedono connettività/);
  assert.match(html, /la conformità dipende/);
});

test("tabs and mobile menu expose keyboard accessible states", () => {
  for (const name of Object.keys(scenarios)) {
    assert.match(html, new RegExp('data-case="' + name + '"'));
  }
  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(js, /ArrowRight/);
  assert.match(js, /ArrowLeft/);
  assert.match(js, /Escape/);
  assert.match(js, /createTextNode/);
});

test("site has responsive styles, no web font or analytics requirement", () => {
  assert.match(css, /--ink: #0d0f12/);
  assert.match(css, /--bone: #e8e6df/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.ok(!/google-analytics|googletagmanager|gtag\(/i.test(html + js));
});

test("every external target-blank link protects the opener", () => {
  const links = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? [];
  assert.ok(links.length > 0);
  for (const link of links) {
    assert.match(link, /rel="noopener noreferrer"/);
  }
});

test("all local dependencies referenced in head exist", () => {
  for (const path of ["index.html", "styles.css", "src/app.js", "src/content.js", "favicon.svg"]) {
    assert.ok(existsSync(new URL("../" + path, import.meta.url)), "File missing: " + path);
  }
});

test("soft-hybrid page honours Gramscii palette, gentle cards and contrasting sections", () => {
  assert.match(html, /href="\.\/soft-theme\.css"/);
  assert.match(html, /class="preview-window"/);
  assert.match(html, /ANTEPRIMA ILLUSTRATIVA/);
  assert.match(html, /value-private/);
  assert.match(html, /value-sources/);
  assert.match(html, /value-offline/);
  assert.match(html, /value-tailored/);
  assert.match(softTheme, /--paper: #f8f9f8/);
  assert.match(softTheme, /--friendly:/);
  assert.match(softTheme, /\.local-section\s*\{[^}]*background:/);
  assert.match(softTheme, /\.demo-frame\s*\{[^}]*border-radius: 28px/);
  assert.match(softTheme, /@media\(max-width:560px\)/);
  assert.match(softTheme, /prefers-reduced-motion/);
});

test("no fabricated absolute privacy or compliance promises are on the landing", () => {
  assert.doesNotMatch(html, /GDPR compliant by default|sempre compliant|nessun dato nel cloud, mai/i);
  assert.match(html, /può restare sul computer|sul tuo dispositivo nella modalità completamente locale/i);
  assert.match(html, /documenti fittizi/i);
});
