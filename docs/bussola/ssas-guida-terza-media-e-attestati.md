# SSAS: nuova guida e gestione degli attestati

La revisione è stata autorizzata per la pubblicazione l’8 ottobre 2026. La versione integrale del 7 ottobre resta conservata separatamente. Questo documento descrive struttura, prove locali e procedura di attivazione; lo stato verificato della pubblicazione viene registrato nel resoconto di rilascio.

## Provare la nuova guida

Apri http://127.0.0.1:8768/bussola-ssas.html?prova=guida-terza-media . È un ambiente locale isolato: la fascia «DATI FITTIZI» distingue la prova dal sito pubblico. Le cinque aree sono tutte presenti, con una decisione principale alla volta, risultato visibile, avanti/indietro e ripresa del lavoro. I titoli dei prodotti sono proposti e modificabili; le note sono disponibili in ogni passaggio. La prima parte introduttiva della Bussola non è stata modificata.

La prova locale salva su un database temporaneo sul computer e sul browser; non inserire nominativi reali. Riavviare il server ricrea il database di prova. Per conservare il prodotto di una prova usa «Conserva progetto e note».

## Provare nomi, scuole, classi e attestati

Apri http://127.0.0.1:8768/gestione-verifica.html . È la nuova scheda integrata nella Gestione, con autenticazione simulata locale. Dopo l’accesso scegli «Bussola e attestati». Sono predisposte 3A, 3B e 3C con alunni fittizi; il nome della 3B va prima verificato.

1. Crea la scuola e la classe, con comune e anno scolastico.
2. Normalmente condividi il link della classe: ciascun alunno scrive nome e cognome. In alternativa prepara l’elenco «nome; cognome» e distribuisci link individuali. Nessuna password personale agli alunni.
3. Ogni nominativo è legato a un identificativo e al proprio lavoro. Gli omonimi restano distinti. La gestione riservata permette di correggere dati e classe senza sostituire il progetto.
4. Controlla il nome e la classe nei dettagli. I nomi inseriti dagli alunni richiedono la verifica della gestione; l’elenco preparato dalla gestione è già contrassegnato come verificato.
5. Seleziona i percorsi conclusi, anche passando tra più classi, e genera gli attestati.
6. Prepara lo ZIP e usa il link di download: contiene un PDF per alunno, nelle cartelle di scuola/comune e classe/anno, e un CSV che associa nomi e file. Il PDF unico riunisce gli attestati selezionati.
7. Gli attestati emessi si ritrovano nello storico della classe. Una correzione successiva non cambia il documento già emesso: si genera una nuova versione quando necessario.

Il documento attesta partecipazione, cinque laboratori completati e curiosità dichiarate. Non certifica capacità o un consiglio vincolante sulla scelta scolastica. Il CSV degli attestati non contiene link di accesso; i link individuali si scaricano separatamente. Solo la sessione ordinaria della Funzione Strumentale può accedere alla gestione nominativa.

## Verifiche svolte

- Percorso completo con scelte, scrittura, simulazione della storia, ritorno ai passaggi e ripresa dopo ricaricamento; completamento verificato sul server dal contenuto effettivo.
- Associazione di un lavoro già svolto alla classe, elenco con omonimi, link personale, correzione di nome e classe, note legate al singolo lavoro.
- Area Gestione originale integrata: login locale simulato, nuova scheda, creazione classe/elenco, selezione ed emissione; schede navigabili con frecce della tastiera.
- Tastiera, messaggi sul singolo requisito mancante, focus, chiusura dei dialoghi con Escape, guida a 390 px senza scorrimento orizzontale.
- PostgreSQL locale: schema e funzioni reali, privilegi/RLS chiusi, ruoli non autorizzati respinti, revisioni obsolete respinte, emissione atomica dell’intero gruppo, attestati immutabili e generazione ripetuta senza duplicati.
- ZIP controllato, tre PDF individuali A4 e PDF unico di tre pagine aperti e renderizzati; nomi composti e accenti leggibili. Il PDF è un’immagine stampabile; i dati restano anche nella restituzione HTML e nell’elenco CSV testuale.
- Controlli di sintassi, compatibilità dei lavori precedenti e campi aggiuntivi conservati; prima Bussola e attestati precedenti passano i controlli esistenti. Logo originale identico alla versione pubblicata.
- Copie originali controllate: integrità ZIP, impronte SHA-256 e archivio della storia Git.

Queste sono prove tecniche con dati fittizi, non una sperimentazione con tredicenni né una prova dell’accesso reale della Funzione Strumentale alla nuova funzione pubblicata.

## Attivazione e verifica in produzione

Applicare la migrazione additiva `supabase/sql/bussola-classi-attestati.sql` sul progetto già usato dalla Bussola, distribuire la nuova funzione `bussola-gestione` con verifica JWT della piattaforma disabilitata (usa token proprietario per il singolo lavoro e sessione ordinaria con ruolo controllato sul server per la gestione), poi pubblicare i nuovi file GitHub Pages. La chiave di servizio resta nella funzione, mai nel browser. La funzione esistente `bussola-esperienze` e le sue tabelle non vengono sostituite.

Verificare in produzione la sessione ordinaria della Funzione Strumentale e un’intera prova con dati fittizi: associazione, nota, riapertura, verifica nome, selezione, emissione e download. Non creare sessioni privilegiate via SQL. Non registrare dati reali prima della verifica operativa. Il salvataggio di progetti e note e la gestione nominativa sono due componenti distinte, collegate dal proprietario del lavoro.

L’archivio conserva codice, progettazione e storia Git; non è un’esportazione dei dati di Supabase. Per ripristinare l’applicativo ricco si usa il commit 238a5561e7daaac26bf2611b785d01d8d0331c93 o lo ZIP originale. Non si cancellano le tabelle né i lavori per ripristinare la grafica.

## Prove con gli alunni

Salvatore svolgerà la prima prova con i propri alunni dell’indirizzo SSAS. Questa prova serve a raccogliere osservazioni su funzionamento, contenuti e interesse. Non dimostra l’immediatezza per tredicenni; la verifica con ragazzi di terza media resta un passaggio successivo.


Far provare individualmente la guida a un piccolo gruppo di ragazzi di terza media, anche con diversa familiarità con il computer. Osservare senza spiegare prima le azioni; annotare dove si fermano, quale pulsante cercano, quando chiedono aiuto e se notano le conseguenze delle scelte. Le note possono essere aperte nel punto preciso. Chiedere poi «Che cosa hai creato?», «Quale parte vorresti continuare?» e «Dove non era chiaro cosa fare?». Se lo stesso passaggio blocca più ragazzi, rivederlo prima di estendere il test. Il tempo necessario e l’adeguatezza all’età restano da verificare.

## Riavviare l’anteprima

L’anteprima e i dati fittizi si avviano dalla cartella di lavoro giornaliera, fuori dal sito pubblico:

```sh
node work/database-test/preview.mjs
```

Il server si limita a `127.0.0.1:8768`, usa dipendenze di prova già installate e rigenera solo i dati fittizi. Il server precedente e gli output integrali del 7 ottobre sono separati.
