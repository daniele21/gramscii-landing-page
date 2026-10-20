# Gramscii — Landing page

Landing page italiana per Gramscii, fondata sulla promessa **«La tua AI. Sotto il tuo controllo.»** e su una proposta di valore concreta: analisi documentale con fonti consultabili, maggiore controllo dei dati e possibilità di funzionamento locale/offline nelle configurazioni supportate. È un prototipo marketing, non un'interfaccia connessa all'engine Gramscii.

## Avvio locale

Requisiti: browser moderno e Python 3. Non servono dipendenze npm.

    python3 -m http.server 4173

Apri http://localhost:4173 . In alternativa, esegui npm run dev.

Per i test è richiesto Node.js 20 o superiore:

    npm test

Il comando esegue test unitari e controlli sintattici con Node.js, senza installare dipendenze.

## Contenuti

- **Hero:** promessa «La tua AI. Sotto il tuo controllo.», tre caratteristiche «Privata. Locale. Verificabile.» e risultato commerciale «Trova quello che conta nei tuoi documenti. Senza cercare pagina per pagina.»
- **Demo:** tre scenari interattivi con citazioni cliccabili e passaggi originali (tutti fittizi e dichiarati).
- **Storie quotidiane:** contratto aggiornato, file riservato, lavoro in treno senza connessione. Una quarta microstoria (verbale condominiale) esemplifica l'accessibilità.
- **Quattro benefici:** controllo dei dati, fonti verificabili, offline e personalizzazione.
- **Privacy:** switch che distingue inferenza locale da funzionalità con servizi esterni.
- **Applicazioni:** contratti, report, documentazione tecnica.
- **Mission:** rendere l'AI accessibile a tutti senza rinunciare al controllo.
- **Vision:** un'AI personale disponibile sui dispositivi scelti; l'hardware specializzato è una direzione di lungo periodo, non un prodotto in vendita.
- **Altre sezioni:** costi API qualificati, tecnologia, FAQ e contatto.

## Design system — Dark Contrast V5 · Typography & Section Rhythm

I token di base rimangono quelli del brand kit Gramscii: ink `#0d0f12`, bone `#e8e6df`, teal `#6f9490`, ice `#cfe3f2`, blue `#8fb4cf`, steel `#5a7e9a`, navy `#2e4254`. Le superfici intermedie sono varianti tonali, non una nuova palette.

### Tipografia — perché questa scelta

- **Marchio:** Bodoni 72 Smallcaps / Didot; è un elemento identitario e non un font da applicare indiscriminatamente al resto della landing.
- **Titoli editoriali:** Georgia, una serif più robusta e facilmente reperibile su sistemi diversi; mantiene l'aspetto premium ma evita i tratti particolarmente sottili di Didot/Bodoni quando i titoli si leggono su display.
- **Testi:** stack sans di sistema, con `-apple-system` e `Segoe UI` come opzioni native; 17px desktop, 16px mobile, interlinea 1.69–1.72.
- **Microcopy tecnico:** SF Mono / Menlo / Consolas, usato per label, navigazione, CTA e metadati; target >=12px per le etichette operative e >=13px per i controlli. Le piccole scritte dell'anteprima documentale sono illustrative e utilizzano dimensioni dedicate.
- **Ampiezza:** paragrafi principali lunghi max `68ch`, titoli max `4.4rem` e gerarchia responsive con breakpoints 1120/800/560/390px.
- **Privacy/offline:** nessun font caricato da CDN, nessuna dipendenza runtime introdotta. Georgia è una scelta con fallback serif se manca nel sistema.

### Contrasto tra sezioni

Non trasformiamo Gramscii in un sito chiaro. Il fondale dominante rimane ink/navy, ma ogni capitolo importante deve avere uno **stacco di luminanza riconoscibile**:

1. **Hero:** ink `#0d0f12`.
2. **Demo verificabile:** slate originale `#2e4254`, con workspace scuro.
3. **Storie:** midnight `#101920`.
4. **Quattro vantaggi:** blue-petrolio `#203b49`, card volutamente più scure del fondale.
5. **Privacy:** antracite, con pannello dati in evidenza.
6. **Applicazioni:** slate desaturato `#243846`.
7. **Mission:** fascia editoriale **bone `#e8e6df`**, testo scuro.
8. **Vision:** navy `#172b37`.
9. **Costi API:** fascia **ice `#cfe3f2`**, testo scuro (già in V4, ora riarmonizzata).
10. **Tecnologia:** ink; **FAQ:** slate; **CTA:** charcoal con bordi leggibili.

Solo **Mission** e **Costi API** sono sezioni chiare. Il contrasto nasce da colori del brand kit, non da gradients/glow decorativi.

### Regole di qualità

- Riferimento WCAG AA: contrasto testo normale >=4,5:1 e testo grande >=3:1.
- Test di regressione Node.js calcolano il contrasto delle principali combinazioni foreground/background delle sezioni e controllano font/scala/ritmo cromatico.
- Contrast test non sostituisce una verifica visuale con browser e zoom 200%, per il corretto wrapping su schermi piccoli.
- Il nuovo intervento è nello stesso foglio `brand-dark.css` caricato dopo `styles.css`. Nessun nuovo font web o tracking.


DA FINALIZZARE: sostituire il monogramma [::] e il favicon [g] con gli asset ufficiali del brand, dopo approvazione del team. La grafica ASCII è un'interpretazione coerente con l'identità, non una riproduzione dell'asset proprietario. L'anteprima hero è illustrativa e usa documenti fittizi, coerenti con gli esempi della demo.

## Local CI on shared Mac runners

This repository follows the **same shared Mac CI contract as Korgis and
RedactGuard**. The versioned `.github/ci/local-test.sh` runs fast,
deterministic Node >=20 checks on a macOS ARM64 runner hosted by
[daniele21/local-runner-infra](https://github.com/daniele21/local-runner-infra).
The `.github/workflows/local-ci.yml` dispatcher runs briefly on
GitHub-hosted Ubuntu and sends the exact source SHA; **the actual tests run
on the Mac**.

To enable this new source repository:

1. Review and merge the [central trust-allowlist PR](https://github.com/daniele21/local-runner-infra/pull/1).
2. Set `CENTRAL_DISPATCH_TOKEN` as a repository Actions secret for
   `daniele21/gramscii-landing-page`. Use a dedicated fine-grained token
   that is allowed to dispatch to `daniele21/local-runner-infra`;
   never paste tokens in chat or commit them.
   On your trusted workstation run:
   
       gh secret set CENTRAL_DISPATCH_TOKEN -R daniele21/gramscii-landing-page

3. In the central repo, ensure its existing `CENTRAL_SOURCE_TOKEN` can
   read this source repository and write **commit statuses**.
4. Confirm one of the central Mac runners is online and has Node >=20.
5. Push a trusted commit or manually dispatch local-ci.yml. Inspect
   `local-ci/mac` on that exact commit and the central workflow logs.

A green *dispatch* check only means the request was delivered. It does
**not** mean the Mac tests ran or passed. The original
`.github/workflows/quality.yml` is intentionally kept until the shared
Mac lane has been verified. Both now call the **same** source-owned
`.github/ci/local-test.sh`, so there is one validation definition.

Current state (2026-10-20): central allowlist PR #1 is merged,
and the source dispatch to `local-runner-infra` was successfully delivered
after adding the token. A green source dispatch is not the Mac test result:
verify the `local-ci/mac` status for the exact source SHA and inspect
central job logs before asserting that local CI passed. The existing hosted
quality workflow remains a required reference until equivalent Mac evidence
is confirmed. Full operating policy:
[shared runner integration guide](https://github.com/daniele21/local-runner-infra/blob/main/docs/integration-guide.md).

## Strategia narrativa e scope dei messaggi

La narrazione segue il percorso: **promessa → dimostrazione verificabile → situazione quotidiana → vantaggi → caso d'uso → mission → vision → costi e tecnologia → CTA**. L'utente deve capire prima cosa può fare e perché, poi scoprire lo scopo dell'azienda.

- **Brand promise (evergreen):** «La tua AI. Sotto il tuo controllo.» Le tre caratteristiche di supporto sono «Privata. Locale. Verificabile.»
- **Hero commerciale (B2B):** «Trova quello che conta nei tuoi documenti. Senza cercare pagina per pagina.» Il secondo livello di headline parla del risultato concreto; il motto rimane indipendente dal verticale documentale.
- **Mission:** rendere l'intelligenza artificiale accessibile a tutti, senza rinunciare al controllo. L'accessibilità non è sinonimo di gratuità.
- **Vision:** intelligenza artificiale personale, utilizzabile sui dispositivi scelti. Il cloud deve restare una possibilità, non un vincolo per ogni attività.
- **Hardware futuro:** eventuale offerta dedicata deve semplificare l'adozione e non creare lock-in. Nessun hardware viene indicato come disponibile.
- **Storie:** sono scenari narrativi, non casi cliente validati o benchmark. Sono distinti dalla demo interattiva, anch'essa fittizia.

La palette e la tipografia non cambiano con questa revisione: tema dark con Bodoni/Didot + microtipografia monospace, tonalità ink, bone, ice, steel, navy e teal. I nuovi elementi sono in `brand-dark.css`.

## Nota sulla correttezza delle promesse

- La demo è dichiaratamente fittizia: nessun output proviene dal sistema Gramscii. Il contenuto è in src/content.js.
- Offline vale solo per funzioni supportate con modelli e documenti disponibili in locale.
- La ricerca web e i servizi remoti richiedono rete e possono inviare informazioni all'esterno.
- Nessun costo API descrive la modalità di inferenza completamente locale, non il costo totale della soluzione.
- Le citazioni possono facilitare la verifica, ma non garantiscono assenza di errori.
- L'esecuzione locale non implica automaticamente conformità al GDPR o all'AI Act.
- Non ci sono cookie di analytics, tracker né moduli che raccolgono dati.

## Visualizzazione locale

Il sito è statico e si può visualizzare direttamente sul Mac, senza pubblicazione e senza installare dipendenze npm. In una cartella che contiene questo repository:

```bash
git status
git switch main
git pull --ff-only origin main
python3 -m http.server 4173
```

Apri http://localhost:4173 nel browser. Se la porta 4173 è già occupata, ferma il vecchio server con `Ctrl+C` nel relativo Terminale prima di ripartire. Verifica che il Terminale sia nella cartella giusta (`pwd`) e che il branch corrente sia `main` (`git branch --show-current`). Prima di cambiare branch, conserva eventuali modifiche locali: `git switch` può rifiutare l'operazione se ci sono modifiche non salvate.

**Nota:** un merge su GitHub non aggiorna automaticamente una copia locale. Un tab `file://`, un'anteprima locale avviata da un'altra cartella o una pagina in cache potrebbero continuare a mostrare la versione precedente. Nessun deploy pubblico è necessario per questa modalità.

Prima di un eventuale lancio pubblico: asset ufficiali, revisione legale dei claim, output reali del prodotto e un canale di contatto commerciale definitivo.

## Checklist manuale

Oltre a npm test, verificare browser desktop e mobile (320px–1440px), interazioni da tastiera, screen reader, animazioni ridotte, correttezza dei link esterni e leggibilità dei testi.

## Motion system V1 — dark editorial Gramscii

Il motion design è una **progressive enhancement senza dipendenze runtime**. La landing continua a funzionare localmente, con JS disattivato o su browser senza IntersectionObserver. Tutte le animazioni sono facoltative e rispettano la preferenza di sistema per la riduzione del movimento.

- `motion.css`: animazione iniziale della promessa, card hover, reveal delle sezioni, segnale luminoso discreto sulla demo e microanimazione ASCII del marchio.
- `src/motion.js`: IntersectionObserver one-shot con breve stagger e Web Animations API per visualizzare aggiornamenti delle fonti/documenti selezionati.
- `.agents/skills/gramscii-motion-design/SKILL.md`: regole di design, tempistiche, performance, privacy, accessibilità e test per ogni futuro intervento.
- **Non installati** GSAP, Motion, Rive, Lenis o Lottie: per questa fase aggiungerebbero complessità senza apportare funzionalità distintive rispetto alle API native. GSAP resta una possibile sperimentazione futura per scroll storytelling avanzato.

Controlli: `npm test`; GitHub Actions `Landing quality` include verifiche Chromium 320–1440 px, e il Mac condiviso esegue gli stessi test Node. Anche con motion attivo, la demo rimane illustrativa, non collegata all'engine.
