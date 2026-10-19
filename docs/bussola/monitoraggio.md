# Bussola: attività e lavori nell’area docenti

Un solo ingresso, `bussola-docenti.html`, dalla Bussola, dal catalogo delle attività e dai cinque indirizzi. Tre viste: **Riepilogo**, **Bacheca**, **Quaderno**. Periodo, aggiornamento automatico, segnalazioni e accessi della commissione restano richiudibili.

La Funzione Strumentale usa la propria password, lasciando vuoto il nome di accesso. Ogni collega ha un nome di accesso e una password personali, creati dalla Funzione Strumentale in «Accessi della commissione». Gli indirizzi selezionati sono visibili in tutte le classi assegnate. Il collega può creare una propria classe per gli indirizzi autorizzati; non può assegnarsi una classe già esistente, cambiare permessi, emettere attestati o accedere alla gestione generale.

## Lavori e presentazione

- Il riepilogo distingue lavori in corso, conclusi e non iniziati degli alunni presenti nell’elenco. I lavori senza classe rimangono consultabili dalla Funzione Strumentale, senza attribuire automaticamente un’identità.
- Bacheca e quaderno leggono anche progetti incompleti e formati precedenti. Le viste sono di sola lettura: non aprono la pagina impersonando uno studente e non ne attivano il salvataggio.
- Per la LIM si scelgono i singoli lavori. La presentazione parte con nominativi nascosti; le note private restano nel quaderno. I testi liberi vanno controllati prima della proiezione perché possono contenere nomi scritti dagli alunni.
- I report raccolgono tutte le pagine della selezione e possono essere esportati in CSV o stampati/salvati in PDF. Di default nascondono i nominativi. Le date sono quelle dell’ultimo salvataggio nel fuso italiano. I conteggi riguardano lavori, non persone uniche fra dispositivi o indirizzi; i filtri della vista corrente indicano esplicitamente la pagina visualizzata.
- «Classe di prova del docente» consente di distinguere le prove e di escluderle dai riepiloghi ordinari.

## Salvataggi

Le dodici domande mantengono la ripresa locale e si salvano anche in `bussola_v2_questionari`, con controllo della revisione e richieste ripetibili. In assenza di rete la bozza viene conservata prima dell’invio; un conflitto offre download della bozza e riapertura della versione online, archiviando la copia locale.

Il token personale viene riutilizzato nei nuovi percorsi e trasportato nei soli collegamenti interni della Bussola; i progetti esistenti mantengono il proprio proprietario. Nessuna unione automatica per nome e cognome e nessuna ricostruzione delle risposte mai trasmesse dal browser. Il token rimane nel frammento del collegamento personale, non in un URL di presentazione o report.

Su un computer condiviso, «La mia classe → Cambia partecipante» apre un accesso personale distinto e lascia conservato il lavoro precedente. Il codice della classe rimane disponibile; la persona successiva entra con il proprio nome.

Le versioni sono registrate dal database ai passaggi significativi: primo salvataggio, avanzamenti, conclusione e revisione, conservando lo stato prima della revisione. Non si registrano battiture, movimenti del mouse o presunte presenze online. I dati precedenti alla migrazione non ricevono uno storico inventato.

## Accessi e protezione

`monitor-handler.mjs` è raggiunto dal wrapper esistente della funzione `bussola-gestione`. Ogni richiesta ricontrolla sul server sessione, stato del collega, indirizzi e classi. I token della commissione non sono accettati dagli endpoint precedenti riservati alla Funzione Strumentale. Sessioni di sei ore per i nuovi accessi; logout revocato nel database; un reset della password cambia `auth_version`. Disattivazione e revoca delle assegnazioni sono effettive nelle richieste successive.

Le password della commissione sono derivate con PBKDF2-SHA256, 310.000 iterazioni e salt casuale; hash e salt non sono restituiti al client. Il login ha una quota atomica per rete. Le nuove tabelle hanno RLS e nessun privilegio per `anon`, `authenticated` o `PUBLIC`; le funzioni applicative sono eseguibili dal solo backend. Le autorizzazioni non dipendono da un ruolo dichiarato dal browser.

L’interfaccia cancella lavori, presentazioni e report al logout/scadenza e ricontrolla gli accessi anche quando la presentazione è aperta. Password e token reali non vanno nei sorgenti, nei log o nei materiali di consegna.

## Prove e anteprima locale

Serve Node.js 24 o successivo. Le dipendenze sono esclusivamente di sviluppo; nessun framework o nuovo servizio è richiesto per le pagine pubbliche.

```sh
npm ci
npm run test:monitoraggio
npm run test:interfaccia
npm run preview:monitoraggio
```

Anteprima: `http://127.0.0.1:8766/bussola-docenti.html?prova=monitoraggio`.

Credenziali **solo dell’archivio locale fittizio**:

- Funzione Strumentale: nome di accesso vuoto, password `ANTEPRIMA`.
- Commissione: `collega.ssas` oppure `collega.turismo`, password `PROVA-docente-2026`.

L’anteprima usa PGlite/PostgreSQL in memoria e gli handler effettivi; si azzera alla chiusura del server. Non contiene dati o password reali e non inoltra salvataggi alla produzione. I test dell’interfaccia usano un DOM simulato: provano i comandi e le richieste, ma non attestano la resa visiva del browser, della LIM o della stampa fisica.

## Attivazione, dopo l’approvazione della revisione concreta

1. Rileggere `main` e confrontare il diff autorizzato. La lavorazione comprende anche la precedente revisione locale del primo approdo alla Bussola e dell’accesso ai codici, base `bbb67f4`, importata senza modificare il checkout originale.
2. Applicare **una sola volta** `supabase/sql/bussola-monitoraggio.sql` come migrazione tracciata. È additiva e transazionale: non riscrive progetti, note, codici o nominativi preesistenti. Non contiene credenziali o record dimostrativi.
3. Distribuire `bussola-gestione` includendo `monitor-handler.mjs`, `monitor-auth.mjs` e `questionario-data.json`, oltre ai file già necessari alla funzione. Mantenere le impostazioni di autenticazione del wrapper precedente; la funzione verifica le proprie sessioni in ogni richiesta.
4. Pubblicare i file del sito approvati e verificare i file serviti, gli accessi dai cinque indirizzi e il recupero dei lavori. Il JSON `questionario-data.json` deve coincidere con `data/bussola.json`; aggiornarli insieme se cambiano le dodici domande.
5. Collaudare il normale accesso della Funzione Strumentale e poi un accesso personale realmente assegnato. Le nuove tabelle partono senza colleghi: la Funzione Strumentale crea solo gli accessi effettivamente necessari. Non usare alunni fittizi nei progressi di produzione.

Prima del rilascio resta necessario il collaudo visivo in un browser effettivo, sul telefono e sullo schermo destinato alla presentazione. Nell’ambiente di lavorazione il browser integrato ha rifiutato le pagine locali con `net::ERR_BLOCKED_BY_CLIENT`; non è una verifica negativa dell’applicazione.

Per tornare alla versione precedente basta ridistribuire i file e la funzione precedenti: le nuove tabelle possono restare riservate, senza cancellare quanto eventualmente salvato. Nessun processo di eliminazione dei lavori è introdotto da questa revisione.
