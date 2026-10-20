import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { scenarios } from "../src/content.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const darkTheme = readFileSync(new URL("../brand-dark.css", import.meta.url), "utf8");
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
  for (const id of ["demo", "storie", "perche", "locale", "casi", "mission", "vision", "tecnologia", "domande", "contatto"]) {
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

test("brand dark theme preserves original Gramscii palette and typographic identity", () => {
  assert.match(html, /href="\.\/brand-dark\.css"/);
  assert.doesNotMatch(html, /soft-theme\.css/);
  assert.match(html, /name="theme-color" content="#0d0f12"/);
  assert.match(html, /class="preview-window"/);
  assert.match(html, /ANTEPRIMA ILLUSTRATIVA/);
  assert.match(html, /value-private/);
  assert.match(html, /value-sources/);
  assert.match(html, /value-offline/);
  assert.match(html, /value-tailored/);
  for (const color of ["#0d0f12","#e8e6df","#6f9490","#cfe3f2","#8fb4cf","#5a7e9a","#2e4254"]) {
    assert.ok(darkTheme.includes(color), "Missing brand token " + color);
  }
  assert.match(darkTheme, /--brand-serif:/);
  assert.match(darkTheme, /--brand-mono:/);
  assert.match(darkTheme, /color-scheme: dark/);
  assert.match(darkTheme, /\.local-section\s*\{[^}]*background:/);
  assert.match(darkTheme, /\.demo-frame\s*\{[^}]*border-radius:/);
  assert.match(darkTheme, /@media\(max-width:560px\)/);
  assert.match(darkTheme, /prefers-reduced-motion/);
  assert.doesNotMatch(darkTheme, /Manrope|Nunito Sans|Plus Jakarta Sans/);
});


test("no fabricated absolute privacy or compliance promises are on the landing", () => {
  assert.doesNotMatch(html, /GDPR compliant by default|sempre compliant|nessun dato nel cloud, mai/i);
  assert.match(html, /può restare sul computer|sul tuo dispositivo nella modalità completamente locale/i);
  assert.match(html, /documenti fittizi/i);
});

test("commercial hero begins with the brand promise and a concrete, qualified product outcome", () => {
  assert.match(html, /LA TUA AI\. ALLE TUE CONDIZIONI\./);
  assert.match(html, /<h1 id="hero-heading">Fai lavorare l'AI sui tuoi documenti\.<br><em>Senza perdere il controllo\.<\/em><\/h1>/);
  assert.match(html, /Le risposte rimandano|risposte collegate alle fonti/);
  assert.match(html, /nelle configurazioni supportate/);
  const hero = html.indexOf('class="hero section-shell"');
  const demo = html.indexOf('class="section demo-section"');
  const stories = html.indexOf('class="section stories-section"');
  const benefits = html.indexOf('class="value-strip"');
  const mission = html.indexOf('class="section mission-section"');
  const vision = html.indexOf('class="section vision-section"');
  assert.ok(hero < demo && demo < stories && stories < benefits && benefits < mission && mission < vision,
    "Narrative order should be promise → proof → relatable stories → capabilities → mission → vision");
});

test("everyday stories have concrete situations and actionable destinations", () => {
  for (const phrase of [
    'Hanno aggiornato il contratto',
    'il file contiene dati di un cliente',
    'Sono in treno',
    'verbale di condominio',
  ]) assert.ok(html.includes(phrase), "Missing story: " + phrase);
  assert.match(html, /data-demo-select="contracts"/);
  assert.match(html, /class="story-action" href="#locale"/);
  assert.match(html, /class="story-action" href="#domande"/);
  assert.match(html, /Le storie sono situazioni illustrative/);
});

test("purpose and hardware vision remain distinct and future-facing", () => {
  assert.match(html, /id="mission" aria-labelledby="mission-heading"/);
  assert.match(html, /id="vision" aria-labelledby="vision-heading"/);
  assert.match(html, /accessibile a tutti/);
  assert.match(html, /Il cloud può essere un'opzione/);
  assert.match(html, /Hardware pensato per l'AI/);
  assert.match(html, /HARDWARE DEDICATO: DIREZIONE FUTURA, NON PRODOTTO DISPONIBILE/);
  assert.doesNotMatch(html, /Compra ora l'AI Box|hardware Gramscii disponibile ora/i);
});

test("new storytelling retains responsive dark-brand contrast and editorial fonts", () => {
  for (const part of [".stories-section", ".mission-section", ".vision-section", ".stories-grid", ".vision-path", ".story-card"]) {
    assert.ok(darkTheme.includes(part), "Missing new visual component: " + part);
  }
  assert.match(darkTheme, /@media \(max-width: 800px\)/);
  assert.match(darkTheme, /@media \(max-width: 560px\)/);
  assert.match(darkTheme, /var\(--brand-serif\)/);
  assert.doesNotMatch(darkTheme, /Manrope|Plus Jakarta Sans/);
});


function relativeLuminance(hex) {
  const channels = (hex.match(/[0-9a-f]{2}/gi) || []).map(h => Number.parseInt(h,16) / 255);
  assert.equal(channels.length, 3, "Only six-digit sRGB hex is accepted");
  const linear = channels.map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}

function textContrast(foreground, background) {
  const light = relativeLuminance(foreground);
  const dark = relativeLuminance(background);
  return (Math.max(light,dark) + .05) / (Math.min(light,dark) + .05);
}

test("type hierarchy retains Bodoni in wordmark but uses sturdy on-screen heading glyphs", () => {
  assert.match(darkTheme, /--reading-serif:\s*Georgia/);
  assert.match(darkTheme, /\.brand-name,\s*\.preview-brand\s*\{\s*font-family:\s*var\(--brand-serif\)/);
  assert.match(darkTheme, /h1,h2,h3,\s*\.value-item h2/);
  assert.match(darkTheme, /font-family:\s*var\(--reading-serif\)/);
  assert.match(darkTheme, /--brand-sans:\s*-apple-system,\s*BlinkMacSystemFont/);
  assert.match(darkTheme, /body\s*\{\s*font-family:\s*var\(--brand-sans\);\s*font-size:\s*17px/);
  assert.match(darkTheme, /\.nav a\s*\{\s*font-family:\s*var\(--brand-mono\);\s*font-size:\s*\.79rem/);
  assert.match(darkTheme, /\.eyebrow, \.small-label, \.hero \.eyebrow,[\s\S]*?font-size: \.75rem/);
  assert.match(darkTheme, /--readable-line:\s*68ch/);
  assert.doesNotMatch(darkTheme, /@import\s+url|fonts\.googleapis\.com/i);
});

test("large-scale dark section rhythm uses brand slate and two editorial light transitions", () => {
  assert.match(darkTheme, /--page-ink: #0d0f12/);
  assert.match(darkTheme, /--page-slate: #2e4254/);
  assert.match(darkTheme, /--page-bone: #e8e6df/);
  assert.match(darkTheme, /--page-ice: #cfe3f2/);
  assert.match(darkTheme, /\.demo-section\s*\{\s*background:\s*var\(--page-slate\)/);
  assert.match(darkTheme, /\.stories-section\s*\{\s*background:\s*var\(--page-midnight\)/);
  assert.match(darkTheme, /\.value-strip\s*\{\s*background:\s*var\(--page-deep-teal\)/);
  assert.match(darkTheme, /\.mission-section\s*\{\s*background:\s*var\(--page-bone\)/);
  assert.match(darkTheme, /\.vision-section\s*\{\s*background:\s*#172b37/);
  assert.match(darkTheme, /\.independence\s*\{\s*background:\s*var\(--page-ice\)/);
  assert.match(darkTheme, /\.faq-section\s*\{\s*background:\s*var\(--page-slate\)/);
});

test("representative copy colours on section surfaces reach WCAG AA text contrast", () => {
  const combinations = [
    ["Hero text", "#e8e6df", "#0d0f12"],
    ["Demo body", "#d1e0e7", "#2e4254"],
    ["Story body", "#c4d6df", "#101920"],
    ["Benefits body", "#c8dbe2", "#203b49"],
    ["Local body", "#c5d6de", "#0d1014"],
    ["Case body", "#c8dce4", "#243846"],
    ["Mission text", "#293c49", "#e8e6df"],
    ["Mission metadata", "#465d6b", "#e8e6df"],
    ["Vision body", "#d0dce3", "#172b37"],
    ["Independence text", "#172b39", "#cfe3f2"],
    ["FAQ body", "#c4d6df", "#2e4254"],
    ["Ice on slate", "#cfe3f2", "#2e4254"],
  ];
  for (const [name, foreground, background] of combinations) {
    assert.ok(textContrast(foreground, background) >= 4.5,
      name + " is below WCAG AA 4.5:1: " + textContrast(foreground,background).toFixed(2));
  }
});
