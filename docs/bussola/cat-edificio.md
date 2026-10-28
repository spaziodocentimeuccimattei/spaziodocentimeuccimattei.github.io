# CAT 4+2 · Edificio Aurora

Revisione del 28 ottobre 2026, autorizzata da Salvatore con «Aggiorna e pubblica il CAT 4+2» dopo la valutazione dei due audio. Sostituisce l’attività proposta ai nuovi ingressi; i lavori esistenti conservano la loro variante.

## Presentazione

Diploma CAT in quattro anni, con pari valore legale del corrispondente quinquennale. Il +2 ITS è facoltativo: specializzazione tecnica superiore, università e lavoro sono possibilità distinte. La libera professione di geometra richiede il percorso formativo o di tirocinio, l’abilitazione e l’iscrizione all’albo previsti. Confermati i riferimenti contenuti nei PDF della scuola, senza attribuire l’attualità dell’offerta 2023/25 del volantino ITS o nuove dotazioni all’istituto.

Aggiornati ingresso Bussola CAT, scheda diurna Indirizzi, catalogo attività e spunto CAT in Una scuola da vivere. Serale e altri indirizzi conservati. Le materie del riepilogo iniziale CAT seguono il catalogo aggiornato.

## Cinque laboratori, dieci passaggi

1. **Rilievo:** scegli tre punti fra sei, avvia il drone illustrato, controlla la copertura di quattro facciate e tetto. Il riscontro spiega cosa manca. Il percorso è una simulazione di copertura delle riprese, non pianificazione di volo o ricostruzione fotogrammetrica.
2. **Edificio:** pianta, prospetto e modello del fabbricato 12 × 8 × 6 m; tavola con almeno due viste e lettura dei tre dati costruttivi. Superficie lorda delle facciate 240 m², finestre 40, pareti e telaio 200.
3. **Materiali:** distingui fotocamera e termocamera, osserva parete/telaio/contorno finestre e proponi isolamento parziale, continuo o sostituzione dei serramenti. Il riscontro riguarda i componenti trattati, senza voti o giudizi sulle capacità.
4. **Energia:** confronto termico prima/dopo con scala fissa, vista esterna invernale, interno 20 °C, esterno 5 °C e assenza di sole diretto. Le temperature sono dati illustrativi. Le classi del dossier sono dati separati già forniti: situazione iniziale G, EPgl,nren 320; pareti F/215, continuo D/140, serramenti F/240 kWh/m² anno; medesimo riferimento 80. Non sono dedotte dalla termografia e non sono un APE. Non vengono calcolate emissioni da questi valori.
5. **Risorse:** computo con quantità e prezzi inventati, 1.000 € di preparazione, budget 12.000 €. Proposta completa o prima progetto/verifiche; la fase preliminare non attribuisce all’edificio il miglioramento previsto dopo i lavori.

## Compatibilità e salvataggi

Formato e versione del contenitore CAT invariati; nuovo discriminante `journey: cat-4plus2-edificio` e oggetto additivo `building`. `cat-4plus2` resta la variante cortile/luci; payload senza discriminante restano Archeodesign. Non si migrano o riscrivono i lavori esistenti, non si traducono vecchie risposte in nuove. Ripristino e invio conservano campi futuri e prove precedenti; note, conflitti e identità mantengono i meccanismi esistenti.

Per la nuova variante, la conferma di un passaggio ricontrolla anche quelli precedenti già raggiunti: correggere i punti nel secondo passaggio non lascia il primo incompleto e non blocca l’attestato. Il monitoraggio legge e illustra la variante corretta, snapshot e CSV identificano il 4+2 e l’attestato usa l’illustrazione edificio/drone/termografia.

Il nucleo di validazione è copiato nelle funzioni `bussola-esperienze` e `bussola-gestione`, con query di versione rimosse solo nelle copie server. Nessuna migrazione, nuovo ruolo o modifica all’autenticazione. Per il deploy viene conservata la mappa della dipendenza di sole dichiarazioni `@supabase/functions-js` già usata nel precedente rilascio.

## Verifica e fonti

`node scripts/verifica-cat-edificio.mjs`: 193 controlli, tutte le 20 terne di ripresa, dipendenze e correzioni, costi/fasi, campi sconosciuti, due varianti precedenti, monitoraggio, snapshot, CSV e vero handler con PostgreSQL isolato. Conservate le verifiche precedenti CAT 4+2/luci, CAT storico, monitoraggio e interfaccia condivisa. Percorso completo, correzione dei punti, ripresa, confronto termico, curiosità e attestato provati nel browser locale; verifiche a 390 e 320 px. PDF di prova in una pagina A4. Le prove locali usano soltanto dati fittizi.

Il verbale corrente del rilascio e le verifiche live sono in `work/verifica-edificio-finale.json` della chat e nello stato istituzionale condiviso; questa pagina descrive la revisione e i suoi criteri, senza attestare da sola l’avvenuta pubblicazione. Non sostituisce una prova con alunni reali o dispositivi fisici.

Fonti: i due PDF forniti dal docente e i due audio del 28 ottobre; [FAQ MIM sulla filiera 4+2](https://www.mim.gov.it/documents/20182/7978739/FAQ%2BPiano%2Bnazionale%2Bsperimentazione%2Bfiliera%2Btecnologico_professionale%2B05_01_2024.pdf/6b3786fc-7f88-ff02-fc5a-2984c09b0ec3?t=1704470019215); [Ministero del Lavoro, formazione tecnica superiore](https://lavoro.gov.it/temi-e-priorita/orientamento-e-formazione/focus-on/formazione/pagine/formazione-tecnica-superiore); [ENEA Trisaia, termocamere e ponti termici](https://www.trisaia.enea.it/attivita-di-ricerca/tecnologie-energetiche/applicazioni-energetiche/attivita-applicazioni-energetiche/caratterizzazione-materiali.html); [ENEA, indice energetico e APE](https://www.apecalabria.enea.it/conoscere-ape).
