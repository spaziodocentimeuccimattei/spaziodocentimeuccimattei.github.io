# Bussola: area docenti, classi e lavori

Un solo ingresso, `bussola-docenti.html`, dalla Bussola, dal catalogo e dai cinque indirizzi. Gli indirizzi precedenti `gestione.html#bussola` e `gestione.html?corso=ssas#bussola` portano alla nuova area. La gestione amministrativa resta separata; il collegamento agli strumenti precedenti usa `gestione.html?strumenti=bussola#bussola`.

## Le due password già esistenti

- **Funzione Strumentale:** la password abituale apre tutte le classi e tutti i lavori, compresi quelli senza classe. Restano disponibili gestione generale, elenchi e attestati.
- **Commissione Orientamento:** la password abituale del ruolo `orientatore` permette di creare una classe e ricevere subito codice/QR, oppure aprire una classe con il suo codice di sei caratteri. Il collega vede i lavori delle classi aperte nella propria sessione, nei cinque indirizzi e nelle dodici domande. Non ottiene la gestione amministrativa generale né l'elenco di tutti i partecipanti.
- Dopo essere usciti, i colleghi riaprono la stessa classe con il codice già comunicato agli alunni. Non occorre ricreare la classe o impostare altre password.
- La password condivisa riconosce il ruolo Commissione, non identifica il singolo collega. Non si attribuiscono automaticamente le attività a un docente specifico.
- Gli accessi personali preparati in precedenza rimangono facoltativi, in una sezione chiusa della Funzione Strumentale. Non sono necessari per il percorso ordinario della Commissione. Conservano i limiti di indirizzi/classi assegnati e la revoca immediata.

## Uso in classe

1. Il docente entra, sceglie l'indirizzo e crea la classe oppure inserisce il codice esistente.
2. Condivide codice, collegamento o QR: il primo approdo degli alunni è la Bussola. Possono svolgere le domande o usare «Salta» per passare all'attività.
3. Gli alunni entrano con nome/cognome o con il link personale già previsto. Le risposte e le note si salvano; «Cambia partecipante» conserva il lavoro precedente sui computer condivisi.
4. Il docente usa **Riepilogo**, **Bacheca** e **Quaderno**. Vede anche i lavori incompleti, apre le risposte, seleziona i prodotti per la presentazione e può esportare il report.
5. La Funzione Strumentale può consultare anche le classi create e seguite dai colleghi.

## Consultazione e presentazione

Le viste leggono i progetti senza impersonare gli alunni o avviare salvataggi. Nella presentazione i nomi sono inizialmente nascosti; le note private restano nel quaderno. Prima di proiettare occorre controllare i testi liberi, che potrebbero contenere nomi scritti dagli alunni.

Report, CSV e stampa comprendono tutte le pagine della selezione. I nominativi sono nascosti come impostazione iniziale. I conteggi si riferiscono ai percorsi; un lavoro senza nominativo non dimostra una persona unica fra dispositivi o indirizzi. Le classi contrassegnate come prove restano escludibili dai report ordinari. L'ultimo salvataggio non è una misura di presenza o attenzione.

## Salvataggi e sicurezza

Le dodici domande mantengono la bozza locale e si salvano anche in `bussola_v2_questionari`. I tentativi ripetuti sono idempotenti; i conflitti conservano la bozza e permettono di riaprire la versione online. Nessuna unione automatica di omonimi o ricostruzione di risposte mai inviate.

Le versioni registrano solo passaggi significativi dalla data di attivazione: primo salvataggio, avanzamento, conclusione e revisione. I progetti precedenti non ricevono uno storico inventato. Non si registrano battiture o movimenti del mouse.

Ogni richiesta ricontrolla sul server sessione, ruolo, classi e indirizzi. Le classi aperte dalla Commissione sono associate al token di sessione nella tabella riservata `bussola_v2_classi_sessione`; l'associazione si chiude al logout. Creazione e associazione della nuova classe avvengono nella stessa transazione. Aprire una classe richiede la password Commissione e il codice; conoscere soltanto un ID non concede accesso. I tentativi sono limitati sul server.

Le nuove tabelle hanno RLS e nessun accesso per `anon`, `authenticated` o `PUBLIC`. Gli RPC applicativi sono riservati al backend. Gli endpoint amministrativi precedenti continuano ad accettare soltanto la Funzione Strumentale. Le password esistenti e la loro verifica non sono modificate. Password, salt e token reali non entrano nei log o negli archivi.

## Prove e anteprima

Richiede Node.js 24 e le dipendenze fissate in `package-lock.json`, esclusivamente per sviluppo.

```sh
npm ci
npm run test:monitoraggio
npm run test:interfaccia
npm run preview:monitoraggio
```

Anteprima: http://127.0.0.1:8885/bussola-docenti.html?prova=monitoraggio

Credenziali **esclusivamente fittizie locali**: `ANTEPRIMA` per la Funzione Strumentale; `ORIENTATORE` per la Commissione. Il nome di accesso resta vuoto. Le prove degli accessi personali facoltativi usano `collega.ssas` / `PROVA-docente-2026`.

Il server usa PostgreSQL/PGlite in memoria e gli handler effettivi. Tutti i salvataggi sono locali; le richieste della pagina verso le funzioni pubbliche sono riscritte ai servizi locali. È stato corretto il percorso della radice che nella prima anteprima causava HTTP 403 e impediva il collaudo nel browser.

## Attivazione e conservazione

1. Rileggere `origin/main` e il diff approvato. La base pubblicata è `bbb67f4`; le modifiche del monitoraggio sono state integrate su questa base senza duplicare il precedente rilascio.
2. Rilevare conteggi e impronte aggregate non identificative dei dati preesistenti. Conservare il servizio precedente per il ripristino.
3. Dopo l'autorizzazione, applicare una sola volta la migrazione additiva `supabase/sql/bussola-monitoraggio.sql`: non contiene password o dati fittizi e non riscrive i lavori precedenti.
4. Distribuire `bussola-gestione` con tutti i suoi sorgenti, `monitor-auth.mjs`, `monitor-handler.mjs` e `questionario-data.json`. Quest'ultimo deve coincidere con `data/bussola.json`. Conservare le impostazioni di autenticazione del wrapper precedente.
5. Pubblicare la revisione approvata; attendere Pages e verificare file, collegamenti, conservazione e accessi non autenticati. Non creare sessioni privilegiate nel database o alunni fittizi in produzione per provare l'accesso.
6. La prova con le password reali richiede il normale login del titolare; le verifiche locali complete non vengono dichiarate come autenticazione reale o prova educativa con gli alunni.

Il ripristino consiste nel ridistribuire pagine e servizio precedenti. Le tabelle aggiunte possono restare riservate senza cancellare i dati eventualmente raccolti.
