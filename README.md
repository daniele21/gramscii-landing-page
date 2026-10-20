# Gramscii — Landing page

Landing page italiana per Gramscii, fondata sulla promessa **«La tua AI. Alle tue condizioni.»** e su una proposta di valore concreta: analisi documentale con fonti consultabili, maggiore controllo dei dati e possibilità di funzionamento locale/offline nelle configurazioni supportate. È un prototipo marketing, non un'interfaccia connessa all'engine Gramscii.

## Avvio locale

Requisiti: browser moderno e Python 3. Non servono dipendenze npm.

    python3 -m http.server 4173

Apri http://localhost:4173 . In alternativa, esegui npm run dev.

Per i test è richiesto Node.js 20 o superiore:

    npm test

Il comando esegue test unitari e controlli sintattici con Node.js, senza installare dipendenze.

## Contenuti

- **Hero:** promessa «La tua AI. Alle tue condizioni.» e risultato commerciale «Fai lavorare l'AI sui tuoi documenti. Senza perdere il controllo.»
- **Demo:** tre scenari interattivi con citazioni cliccabili e passaggi originali (tutti fittizi e dichiarati).
- **Storie quotidiane:** contratto aggiornato, file riservato, lavoro in treno senza connessione. Una quarta microstoria (verbale condominiale) esemplifica l'accessibilità.
- **Quattro benefici:** controllo dei dati, fonti verificabili, offline e personalizzazione.
- **Privacy:** switch che distingue inferenza locale da funzionalità con servizi esterni.
- **Applicazioni:** contratti, report, documentazione tecnica.
- **Mission:** rendere l'AI accessibile a tutti senza rinunciare al controllo.
- **Vision:** un'AI personale disponibile sui dispositivi scelti; l'hardware specializzato è una direzione di lungo periodo, non un prodotto in vendita.
- **Altre sezioni:** costi API qualificati, tecnologia, FAQ e contatto.

## Design system — Dark Contrast (V3)

I token sono ripresi dal materiale esistente Gramscii (laboratorio ASCII):
- Ink: #0d0f12
- Bone: #e8e6df
- Teal: #6f9490
- Ice: #cfe3f2
- Blue: #8fb4cf
- Steel: #5a7e9a

La V3 mantiene un **tema scuro** in tutte le sezioni, derivando il contrasto da tonalità originali del brand: ink antracite, superfici charcoal e navy, accenti ghiaccio e teal. Solo il documento delle fonti nella demo e la fascia economica sono deliberatamente molto chiare per guidare la lettura.

**Tipografia:** wordmark e titoli Bodoni/Didot con fallback Georgia; microcopy, navigazione, CTA, metadata e source-chip in monospace SF Mono/Menlo/Consolas. I paragrafi usano una sans neutra Helvetica Neue/Segoe UI/Arial, non una rounded/friendly. Nessun font viene caricato da terze parti.

**Componenti:** card dark con tonalità differenziate, bordi contrastati, angoli controllati di 9–18px (non grandi pillole), demo con fondo scuro e documenti originali bone/ice ad alto contrasto. Foglio di stile di riferimento: `brand-dark.css` caricato dopo `styles.css` per la V3. I token corrispondono al laboratorio ASCII senza introdurre una nuova palette.

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

- **Brand promise (evergreen):** «La tua AI. Alle tue condizioni.» Anche in inglese «Your AI. On your terms.»
- **Hero commerciale (B2B):** «Fai lavorare l'AI sui tuoi documenti. Senza perdere il controllo.»
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

## Pubblicazione

Il sito è completamente statico ed è ospitabile su GitHub Pages, Netlify, Vercel o qualsiasi hosting statico. Dopo il merge su main, puoi utilizzare GitHub Pages in Settings → Pages → Deploy from a branch → main / root.

Prima del lancio: asset ufficiali, revisione legale dei claim, output reali del prodotto e un canale di contatto commerciale definitivo.

## Checklist manuale

Oltre a npm test, verificare browser desktop e mobile (320px–1440px), interazioni da tastiera, screen reader, animazioni ridotte, correttezza dei link esterni e leggibilità dei testi.
