# Modifiche al server da applicare (Bussola) — documento per il committente

Stato al 15 novembre 2026: **tutto preparato, niente applicato**. Nessun file qui sotto è stato eseguito sul database vero né pubblicato. Servono il tuo sì esplicito (e, per la scadenza, la data ufficiale).

Parole usate: «server» è il servizio online (Supabase) dove la Bussola salva i lavori dei ragazzi; «migrazione» è un file di istruzioni che cambia il database; «funzione» è il programma che sta sul server e risponde alla Bussola (`bussola-esperienze`); «token» è il lungo codice segreto che identifica un lavoro (quello dei link personali e del QR).

## 1. Che cosa cambia e perché

**A. Codice breve personale (per l'Open Day dell'11 dicembre 2026).** Chi finisce una prova vede nel biglietto, sotto il QR, un codice di 6 caratteri (per esempio `UM43FQ`) con la frase «Scrivilo: a casa, con i tuoi genitori, torna qui». A casa, in `bussola.html`, «Ho un codice» e si scrive il codice: arriva a «Bentornato» con l'attestato, i distintivi, le date dell'Open Day e «Come ci si iscrive». Serve a chi non ha il telefono con sé per inquadrare il QR (allo stand si scrive su un cartoncino). Il server tiene la corrispondenza fra codice e lavoro.

**B. Scadenza dei lavori fino a fine iscrizioni.** Oggi ogni lavoro sul server scade dopo 30 giorni dalla creazione e la scadenza non si rinnova (letto in `supabase/sql/bussola-esperienze-v2.sql`, riga 6: `expires_at ... default now()+30 days`; la funzione non calcola nulla, inserisce solo il token cifrato). Chi fa la prova l'11 dicembre troverebbe «non più disponibile» a gennaio. Con la modifica la scadenza diventa una data fissa di fine campagna.

## 2. File da applicare, in quest'ordine

1. `supabase/sql/bussola-scadenza-lavori.sql` — **prima scrivi la data** nella riga in cima (vedi punto 7). Se lasci il segnaposto il file si ferma da solo con un errore e non cambia nulla.
2. `supabase/sql/bussola-codice-ritorno.sql` — crea due tabelle nuove (`bussola_v2_codici_ritorno`, `bussola_v2_tentativi_codice`) e le funzioni di generazione, controllo e limite dei tentativi. Va applicato **prima** della funzione.
3. Pubblicare la funzione `supabase/functions/bussola-esperienze/` (cambia solo `index.ts`: due azioni nuove, `codice_ottieni` e `codice_apri`). Con le impostazioni di autenticazione già in uso.
4. Pubblicare le pagine del sito con i file browser nuovi: `bussola-ritorno-codice.mjs` (nuovo), `bussola-finale-comune.mjs`, `bussola-bentornato.mjs`. **Con `CODICE_BREVE_ATTIVO = false`** (come ora): nulla di nuovo si vede.
5. Solo dopo aver provato il server (punto 5), in `bussola-interruttori.mjs` portare `CODICE_BREVE_ATTIVO` a `true` e pubblicare di nuovo. Per l'11 dicembre il margine è di quasi quattro settimane: conviene accendere almeno una settimana prima, provando con una prova reale tua.

I due file SQL sono indipendenti fra loro: si possono applicare anche separatamente.

## 3. Che cosa succede ai dati esistenti

- **Lavori, note, classi, nominativi, attestati: non vengono riscritti.** Il file del codice breve aggiunge solo tabelle nuove (vuote). Le classi e i loro codici restano identici.
- **Scadenza:** i partecipanti già presenti e non ancora scaduti vengono portati alla data fissa (mezzanotte, ora italiana, alla fine del giorno indicato). Non si accorcia mai nessuna scadenza; i lavori già scaduti non vengono riaperti; chi aveva già una scadenza più lontana la conserva. I nuovi partecipanti ricevono la stessa data (mai meno di 30 giorni, come oggi).
- **Questionario (le 12 domande):** non ha una scadenza propria, dipende dal partecipante (tabella `bussola_v2_questionari` legata a `bussola_v2_partecipanti`). Si allunga quindi insieme agli altri lavori: **non serve alcuna modifica separata**. Idem per gli attestati nominativi delle classi.
- I partecipanti che a oggi hanno già fatto una prova **non hanno ancora un codice breve**: lo ricevono la prima volta che vedono il biglietto (cioè rifacendo l'attestato) con l'interruttore acceso.

## 4. Rischi

- **Indovinare un codice a caso.** I codici possibili sono circa 887 milioni (31 simboli, 6 posti). Il server ammette 10 tentativi ogni 15 minuti da una stessa rete e 120 in totale ogni 15 minuti; oltre, risponde «Troppi tentativi». Con 2000 codici in uso, in 24 ore di attacco continuo la probabilità teorica di azzeccarne uno è dell'ordine dell'1% (**calcolo mio, non misurato**). Anche in quel caso chi indovina vede solo un lavoro anonimo: il nome non sta sul server e non viene restituito. Rischio di blocco: un attacco da molte reti potrebbe consumare il limite totale e far dire «riprova» anche ai ragazzi veri; i valori 10 e 120 stanno in cima a `index.ts` e si cambiano senza toccare il database.
- **Codice uguale a quello di una classe.** Impedito dal database in entrambe le direzioni (vedi 8). La creazione di una classe che per caso estraesse un codice già personale viene rifiutata e il server la riprova da solo (fino a tre volte, come già fa).
- **Il codice non permette di continuare la prova**, solo di rivedere attestato e distintivi: il server conserva il token solo cifrato e non può ridarlo. Chi non ha finito deve riprendere dal dispositivo dove ha iniziato.
- **Più indirizzi:** il codice è uno per partecipante (dispositivo), non per indirizzo: a casa si può aprire l'attestato di ognuno degli indirizzi conclusi.
- **Scadenza lunga = dati conservati più a lungo** (lavori anonimi, senza nomi per chi entra senza classe). Se la data cambia, rieseguire il file con la nuova data.
- Funzione pubblicata **prima** dell'SQL: le due azioni nuove danno errore, ma nessuno le chiama (interruttore spento). Per questo l'ordine non è pericoloso, solo da rispettare.

## 5. Come provare dopo l'applicazione

Con `CODICE_BREVE_ATTIVO = true` su una copia di prova: finire una prova AFM con un nome finto, vedere il codice, aprire `bussola.html` da un altro telefono, «Ho un codice». Non usare dati di ragazzi veri. Le prove automatiche locali (sotto) non sostituiscono questo collaudo.

## 6. Come tornare indietro

- **Codice breve:** rimettere `CODICE_BREVE_ATTIVO = false` e ripubblicare: il codice sparisce subito dalle schermate; le tabelle possono restare. Per cancellarle, in fondo a `bussola-codice-ritorno.sql` c'è il blocco di annullamento (commentato). I lavori non si toccano.
- **Funzione:** ripubblicare la versione precedente di `bussola-esperienze`.
- **Scadenza:** in fondo a `bussola-scadenza-lavori.sql` c'è il ritorno al «30 giorni» per i nuovi partecipanti. Le scadenze già allungate non si riportano indietro in modo esatto: **prima di applicare, salvare l'elenco** con `select id, expires_at from public.bussola_v2_partecipanti;`.

## 7. Che cosa decidi o confermi tu

1. **La data di fine iscrizioni 2027/28.** Non l'ho inventata. Al 15/11/2026 non ho trovato la nota del Ministero per il 2027/28; per l'anno scorso (2026/27) le iscrizioni andavano dal 13 gennaio al 14 febbraio 2026, con nota MIM prot. 8069 del 18/12/2025 (fonte di orientamento, non vale per quest'anno). Quando esce la nota 2027/28, scrivi nella prima riga del file `bussola-scadenza-lavori.sql` la data nel formato `AAAA-MM-GG`, al posto di `SEGNAPOSTO-DA-CONFERMARE`. Se le iscrizioni fossero prorogate, si rieseguisce il file con la nuova data. Se vuoi dare una tregua alle famiglie dopo la chiusura, scegli tu una data successiva.
2. Il **sì all'applicazione** dei due file SQL e alla pubblicazione della funzione.
3. Il **giorno in cui accendere** `CODICE_BREVE_ATTIVO`.
4. Se a casa, con il codice, va bene che **il nome venga richiesto di nuovo** (scelta mia: il server non lo conosce; sullo stesso dispositivo viene riusato quello ricordato).

## 8. Dati personali

- Il **codice breve non contiene dati personali**: è un valore casuale generato dal database, mai ricavato dal nome o da altri dati.
- Il **nome resta sul dispositivo come oggi**; a casa si scrive nella schermata e non viene salvato né inviato (verificato nella prova in Chrome: nessuna richiesta al server contiene i nomi digitati).
- Sul server la tabella nuova contiene solo: identificativo interno del partecipante, codice, data di creazione. La seconda tabella conta i tentativi per «impronta» cifrata della rete (non l'indirizzo in chiaro), con cancellazione automatica dopo un giorno.
- Le due tabelle non sono leggibili dal browser: accesso solo dalla funzione.
- **Regola contro le collisioni con i codici delle classi.** I codici classe usano 32 simboli (con la L), quelli personali 31 (senza L): quindi un codice con la L è sempre «di classe». Per gli altri il database controlla, con un blocco comune, che un codice personale non sia mai uguale a un codice di classe e che nessuna classe (esistente o futura) riceva un codice già personale. Dalla parte del browser si prova prima come codice di classe e solo se non esiste come codice personale. Non si può cambiare il formato dei codici di classe già distribuiti, per questo la separazione è un controllo e non un formato diverso.

## 9. Prove eseguite in locale (nessuna chiamata a servizi veri)

- `node scripts/verifica-bussola-codice-ritorno.mjs` — database PostgreSQL in memoria con la vera funzione: generazione, unicità, collisioni, riapertura, codice sconosciuto/scaduto, limiti, permessi.
- `node scripts/verifica-bussola-scadenza.mjs` — il file della scadenza: segnaposto che lo ferma, date non accettabili, solo allungamento, valore per i nuovi.
- `python3 scripts/prova-browser-codice-breve.py` (con `python3 -m http.server 8781 --bind 127.0.0.1` dalla radice) — Chrome con server finto: spento nulla si vede e non parte nessuna chiamata nuova; acceso, il dispositivo A vede il codice e il dispositivo B arriva a «Bentornato» con l'attestato.
- Non provati: server Supabase vero, scansione del QR con un telefono, ripetizione sotto carico reale.
