# SSAS nello stile di CAT — revisione del percorso

[GPT 2026-10-10 01:49]

Richiesta di Salvatore: «Ora nello stesso stile migliora SSAs».
Base: `a7a7a9b2b693055aab5501a7b07c5b0b278f9aa0`, che comprende la revisione dei laboratori e della home pubblicata da Claude e il rilascio CAT. Questa revisione SSAS è stata consegnata inizialmente come anteprima locale. Salvatore ha autorizzato il rilascio dei cinque percorsi il 10 ottobre 2026; questa revisione ne fa parte. Non cambia il formato dei lavori SSAS.

## Che cosa cambia

La pagina d’ingresso mostra i cinque lavori che si possono creare. Ogni laboratorio presenta il risultato da costruire, il passaggio attuale e una consegna operativa; il comando per continuare si abilita quando la scelta richiesta è stata fatta. Le regole di completamento sono quelle già esistenti.

| Laboratorio | Anteprima del lavoro |
| --- | --- |
| Salute | Confronto illustrato tra funzionamento e cambiamento; scheda con la spiegazione personale per una famiglia. |
| Relazione | Risposte del gruppo distinte per persona; domanda di apertura, modo di partecipare e frase di chiusura riuniti nella proposta. |
| Cura e autonomia | Obiettivo della persona, sostegni scelti e adattamento dell’aiuto. Il disegno segue le scelte. |
| Creatività | Ambientazione, scopo educativo e seguito personale. Un lettore permette di provare i due rami della storia. |
| Progettazione | Bisogno, attività, collaborazione professionale, accesso e informazioni da raccogliere per migliorare il servizio. |

Colori, gerarchie, schede e comandi riprendono CAT. I testi prima inseriti in piccolo nei disegni sono didascalie HTML leggibili. La raccolta finale conserva i cinque lavori e rende apribili i dettagli, le materie di indirizzo e il comando per rivederli. L’attestato resta l’unico documento proposto nella conclusione.

## Continuità del percorso e dei dati

Restano cinque laboratori e quindici passaggi nello stesso ordine. Non cambiano domande, alternative, personaggi, argomenti sanitari, limiti dei campi, identificativi, chiavi locali, formato del progetto, criteri di completamento, collegamento alla classe, note contestuali o attestati.

Il confronto con la base conferma identità dei core, dei moduli classe e attestato, dei sorgenti delle funzioni Supabase, della prima Bussola, di CAT, di Turismo e del logo. Anche i blocchi di lettura/salvataggio dello stato, le consegne con i campi e la gestione delle note/attestato in `ssas-labs.mjs` sono invariati. I fogli di stile precedenti, compreso il contributo di Claude, sono conservati integralmente: il nuovo blocco è aggiunto in coda.

Il nuovo modulo `ssas-labs-visuals.mjs` contiene solo presentazione e illustrazione. Non valuta capacità né cambia le propensioni dichiarate.

## Verifiche eseguite

- Passano i quattro script esistenti: laboratori SSAS, guida SSAS, attestato alunno e attestati dei cinque indirizzi. Coprono anche ripristino di lavori precedenti e compatibilità API.
- Nel browser: ingresso con classe e nominativo fittizi, tutti i quindici passaggi, scrittura e revisione dei testi, storia con ramo personale, nota contestuale, conclusione e recupero dopo ricaricamento.
- Le cinque schede e la conclusione sono controllate a 320, 390, 768 e 1280 pixel: nessuno scorrimento orizzontale. Nei laboratori controllati non restano testi minuscoli nei disegni; le didascalie sono di 13 pixel e i campi hanno etichette accessibili. Controllati anche i contrasti della schermata di servizio e corretta la leggibilità della consegna sul fondo scuro.
- L’attestato fittizio si visualizza e il PDF si scarica: una pagina A4, 595,28 × 841,89 punti. Conservata l’impaginazione di stampa già presente.
- Anteprima su server locale con database isolato e dati fittizi; la pagina limita le connessioni allo stesso server. Nessun dato fittizio inviato a Supabase di produzione.

Questi controlli attestano il funzionamento tecnico. La maggiore comprensibilità è un’ipotesi progettuale da verificare con gli alunni; non costituisce un risultato educativo già dimostrato. Restano da provare comprensione delle consegne, interesse, tempi effettivi, telefoni fisici, lettore di schermo e stampa fisica. Non sono stati aggiunti test che misurino presunte capacità.

## Conservazione e consegna

Ramo isolato: `codex/ssas-stile-cat-20261010`.
Anteprima: `http://127.0.0.1:8776/bussola-ssas.html?prova=ssas-anteprima`.
Evidenze e copia integra della base: `outputs/ssas-stile-cat/`, fuori dalla radice del sito. Contengono solo sorgenti e prove fittizie.

Pubblicazione autorizzata da Salvatore il 10 ottobre 2026. Il confronto con `origin/main` è stato ripetuto e i contributi precedenti di Claude sono conservati. Il raccordo dei cinque percorsi è descritto in `cinque-percorsi-rilascio.md`.
