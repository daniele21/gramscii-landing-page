# Gramscii — Landing page

Landing page italiana per Gramscii, focalizzata su AI locale, controllo dei dati e risposte collegate alle fonti. È un prototipo marketing, non un'interfaccia connessa all'engine Gramscii.

## Avvio locale

Requisiti: browser moderno e Python 3. Non servono dipendenze npm.

    python3 -m http.server 4173

Apri http://localhost:4173 . In alternativa, esegui npm run dev.

Per i test è richiesto Node.js 20 o superiore:

    npm test

Il comando esegue test unitari e controlli sintattici con Node.js, senza installare dipendenze.

## Contenuti

- Hero centrata sul controllo dei dati.
- Tre valori: locale e privata, fonti verificabili, indipendenza dal cloud.
- Tre scenari di demo interattivi con citazioni cliccabili e vista del passaggio originale.
- Switch che distingue inferenza locale da funzionalità con servizi esterni.
- Casi d'uso, tecnologia, FAQ e invito a contattare il team tramite LinkedIn.

## Design system — Soft Hybrid (V2)

I token sono ripresi dal materiale esistente Gramscii (laboratorio ASCII):
- Ink: #0d0f12
- Bone: #e8e6df
- Teal: #6f9490
- Ice: #cfe3f2
- Blue: #8fb4cf
- Steel: #5a7e9a

Il wordmark mantiene Bodoni/Didot, mentre i titoli e i testi usano una sans morbida: preferenza Manrope con fallback locali (Avenir Next, Nunito Sans, Segoe UI). Il monospace resta per micro-label, dettagli ASCII e metadati. Non vengono caricati font di terze parti.

La V2 usa sezioni chiare derivate da bone/ice/blue, una sezione privacy navy ad alto contrasto, card arrotondate (22–28px) e un mockup di risposta con link alla fonte già nella hero. I valori cromatici ufficiali del laboratorio ASCII rimangono i riferimenti; le superfici secondarie sono variazioni tonali, non una nuova palette.

DA FINALIZZARE: sostituire il monogramma [::] e il favicon [g] con gli asset ufficiali del brand, dopo approvazione del team. La grafica ASCII è un'interpretazione coerente con l'identità, non una riproduzione dell'asset proprietario. L'anteprima hero è illustrativa e usa documenti fittizi, coerenti con gli esempi della demo.

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
