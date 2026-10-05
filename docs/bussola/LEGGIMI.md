# La tua Bussola — revisione locale, 4 ottobre 2026

Versione 3 locale, non ancora pubblicata, preparata per il pilotaggio del percorso di orientamento IIS Meucci - Mattei | Decimomannu. Sito statico, senza framework, registrazione, analytics o backend aggiuntivi. Non è uno strumento psicometrico e non assegna un indirizzo agli studenti.

## Avvio

Dalla radice del sito: `python3 -m http.server 8767 --bind 127.0.0.1`, poi aprire `http://127.0.0.1:8767/bussola.html`. Serve HTTP: non aprire i file HTML direttamente dal Finder perché i moduli e i JSON richiedono un server. Per il pilotaggio su altri dispositivi occorre servire questa versione in un ambiente accessibile sulla rete scolastica, previa scelta della scuola.

## File e manutenzione

- `bussola.html`, `bussola.mjs`: ingresso rivolto alla terza media, ripresa esplicita, dodici situazioni, revisione e salto; conclusione con indicazioni motivate sugli indirizzi da approfondire. Gli altri percorsi sono disponibili nel confronto richiudibile; materie e attività restano accessibili per tutti.
- `bussola-core.mjs`: stato, validazione, restituzione, calcoli delle attività.
- `bussola-ui.mjs`, `bussola.css`: controlli, caricamento, focus, contatti e stile condiviso.
- `data/bussola.json`, `data/dimensioni.json`: situazioni e matrice delle sette dimensioni.
- `data/indirizzi.json`, `indirizzi-esplora.mjs`: sette possibili collegamenti per ciascun corso, attivati solo su richiesta; collegamenti personalizzati mostrati solo dopo richiesta esplicita dello studente.
- `missioni.html`, `missioni.mjs`, `data/missioni.json`: budget AFM, archivio SIA, itinerario Turismo, pianta CAT, osservazioni SSAS. Situazioni dichiaratamente immaginate; contenuti proposti da validare con i docenti.
- `data/contatti.json`, `documenti/contatti-mattei.vcf`, `assets/qr-orientamento.svg`: contatti pubblici, fonti e data di verifica. Il QR porta alla home pubblica esistente; non contiene risposte o un profilo.
- `index.html`, `indirizzi.html`, `indirizzi.css`: ingresso dalla home, approfondimenti dei corsi, contrasto SIA/CAT. Collegamenti preesistenti conservati.

## Restituzione e pareggi — versione 3

Ogni risposta ha collegamenti editoriali espliciti con uno o più indirizzi (`courseLinks`): diretto con peso 2, trasversale con peso 1. Ogni collegamento include una ragione legata alle materie o alle attività del corso. Il CSV `collegamenti-indirizzi.csv` rende questa matrice rivedibile dai docenti; le fonti delle materie sono le cinque pagine ufficiali della scuola, consultate il 4 ottobre 2026. La relazione risposta-indirizzo è una proposta editoriale, non una misura validata delle capacità.

Per non favorire un corso solo perché compare in più opzioni, i valori vengono centrati e scalati sulle opportunità delle sole domande effettivamente risposte. Con meno di quattro risposte non si produce un’indicazione. Occorrono almeno due collegamenti diretti, in domande diverse, per mettere in evidenza un corso. Tra quattro e cinque risposte l’indicazione è dichiarata preliminare. Gli indirizzi entro 0,75 unità dal valore interno maggiore vengono mostrati insieme, in ordine editoriale: tutti i pareggi rimangono visibili. Con quattro o più direzioni vicine, o segnali complessivamente deboli, il testo dichiara interessi misti. Le soglie sono scelte di progettazione, da riesaminare nel pilotaggio; nessun punteggio o percentuale di attitudine è mostrato agli studenti.

Le schede in primo piano citano risposte realmente scelte e ne spiegano il collegamento con materie e attività. Tutti gli altri indirizzi restano nel confronto. La sintesi delle sette curiosità è un approfondimento facoltativo e non condiziona l’indicazione sui corsi.

Verifica ripetibile: `BUSSOLA_REPORT=docs/bussola/verifica-bilanciamento-v3.json node scripts/verifica-bussola.mjs 50000`. Include percorsi coerenti con ciascuno dei cinque corsi, interessi misti, risposte saltate, motivazioni corrispondenti alle scelte e migrazione dello stato. La simulazione uniforme rileva sbilanciamenti strutturali; non rappresenta gli studenti e non valida scientificamente il percorso.

## Domande e grafica — versione 3

Le otto risposte preesistenti conservano frasi, ID e ordine; ora hanno titoli brevi che aiutano a confrontarle. Quattro nuove situazioni riguardano materie, predisposizioni da coltivare, sogni e aspirazioni. Le predisposizioni sono modi di lavorare riconosciuti dalla persona, non abilità inferite né requisiti di ingresso. Nessun riferimento a voti.

Domande su due colonne desktop e una mobile, selezione visibile anche attraverso il controllo radio, contesto illustrato compatto. La restituzione ha prima un’indicazione esplicita, poi le schede motivate e infine confronto con gli altri corsi, rilettura e contatti. Logo e foto della sede originali. Stili nuovi limitati alla pagina Bussola.

Lo stato versione 2 viene migrato conservando le otto risposte e i completamenti delle attività. Chi aveva concluso riparte dalla prima domanda nuova, senza dover rispondere di nuovo alle precedenti. La versione 3 usa la stessa chiave in `sessionStorage`, senza trasmettere risposte.

## Verifiche della revisione locale — versione 3

Verificati: struttura dei dati, sintassi dei moduli, simulazione deterministica di 50.000 percorsi senza avvisi, ciascun corso che emerge su risposte coerenti, interessi misti e salto; nessuna motivazione proviene da risposte non selezionate. Nel browser: percorso SIA completo con due domande saltate, confronto degli altri quattro indirizzi, domande su materie e aspirazioni, ripresa/revisione/reset e navigazione alle pagine collegate. Restituzione e domande a 320, 390, 768 e 1366 pixel senza scorrimento orizzontale. Le prove con docenti, studenti e dispositivi scolastici restano da svolgere.

Le sezioni seguenti descrivono la versione 2 pubblicata e le sue verifiche storiche; non sono una pubblicazione della revisione 3.

## Attestati della revisione locale — 5 ottobre 2026

Ogni indirizzo suggerito nella restituzione offre «Crea il tuo attestato». Il dialogo mostra il risultato scelto, due motivazioni derivate dalle risposte, le materie, gli eventuali altri indirizzi emersi e la natura ancora preliminare di un percorso con poche risposte. Si tratta di un attestato di esplorazione, senza certificazioni di capacità, voti, percentuali, diplomi o promesse di ammissione.

Il nome è facoltativo e richiesto solo qui, senza cognome: resta nell’input del dialogo e nel canvas dell’anteprima, viene cancellato alla chiusura, non entra in sessionStorage, URL, nome del file o richieste alla scuola. Se si scarica il file, il nome compare naturalmente al suo interno. La condivisione è una scelta successiva dello studente dal proprio dispositivo; la Bussola non pubblica su Instagram.

Due formati generati nel browser senza servizi di esportazione esterni: PNG 1080 × 1350 e PDF A4 di una pagina, con immagine JPEG 1620 × 2292. Il PDF riproduce il disegno ed è stampabile; non contiene testo selezionabile né una struttura PDF per lettori di schermo. Il risultato della pagina e la descrizione testuale dell’anteprima restano accessibili nel DOM. Logo originale, QR pubblico già esistente e invito a conoscere l’IIS Meucci - Mattei di Decimomannu e le modalità d’iscrizione.

Moduli `bussola-attestato-core.mjs` (contenuto, nome e struttura PDF) e `bussola-attestato.mjs` (anteprima ed esportazione), con stili separati. La generazione PDF incorpora il JPEG nella pagina A4 e calcola i riferimenti sui byte effettivi; non usa librerie remote. Questa aggiunta è locale e non modifica lo stato del rilascio pubblico.

Verificati i download reali nei due formati per tutti e cinque gli indirizzi, riapertura del PDF con parser rigoroso e resa delle cinque pagine con Poppler, nomi facoltativi/accentati/lunghi, svuotamento del nome alla chiusura e alla riapertura, esiti misti e preliminari, chiusura con Escape e ritorno del focus. Finestra a 320, 390 e 768 pixel senza scorrimento orizzontale; console senza errori o avvisi rilevati. Comando `node scripts/verifica-attestati.mjs`; evidenze in `verifica-attestati.json`. Le prove con stampante fisica, dispositivi scolastici, Safari/iOS/Android e pubblicazione effettiva su Instagram restano da svolgere.

## Revisione grafica e contenuti — versione 2

Foto originale della sede in formato responsive fino a 1440 pixel, logo invariato, colori dei cinque corsi ispirati al logo e illustrazioni vettoriali nitide. Nessuna fotografia inventata di studenti o laboratori. `bussola-visuals.mjs` contiene le illustrazioni, i misuratori di spesa/tempo e le tappe. Le due piante CAT sono visibili prima della scelta. Le otto domande riguardano gli interessi personali; i precedenti scenari organizzativi sono sostituiti. La versione 2 ignora lo stato della vecchia versione.

Ogni corso ha una propria attività e un collegamento esplicito alle materie: AFM/economia aziendale, SIA/informatica, Turismo/geografia turistica e lingue, CAT/progettazione e topografia, SSAS/psicologia e metodologie operative. La restituzione mostra come esempi solo le risposte con collegamento diretto al tema (peso 2). I testi e i segnaposto del piano grafico restano nella tavola per il committente; non sono inseriti nelle pagine degli studenti.

Verifica della revisione nell’In-app Browser: otto domande complete, ripresa, cinque attività complete, riscontri dei vincoli, due piante CAT e console senza errori osservati. Restituzione, catalogo e CAT controllati a 320, 390, 768 e 1366 pixel senza scorrimento orizzontale. Le prove Chrome descritte sotto appartengono alla precedente versione; non sostituiscono le prove della revisione.

## Stato e privacy tecnica

Solo `sessionStorage`, chiave `mattei-bussola-v1`, nella scheda del browser. Nessun nome, scuola o account richiesto per svolgere il percorso; nessun invio delle risposte. Solo l’esportazione dell’attestato permette di inserire un nome facoltativo, senza salvarlo nello stato del browser. I dettagli delle scelte nelle missioni restano in memoria; viene salvato soltanto il completamento. Stato corrotto o versione sconosciuta sono ignorati. Se lo storage è bloccato, il percorso continua in memoria. I comandi di cancellazione toccano soltanto la chiave Bussola, senza modificare lo stato dell'area docenti. Alla riapertura dello stato salvato si chiede di continuare o iniziare per un'altra persona prima di mostrare le risposte.

Mailto, telefono e sito sono normali collegamenti: l'eventuale messaggio e-mail è inviato volontariamente dallo studente tramite il suo programma di posta. Non inserire dati reali degli studenti nei file JSON o nelle osservazioni del pilotaggio.

## Verifiche e limiti

Eseguiti: simulazione deterministica di 50.000 percorsi; struttura dei contenuti; stato valido/corrotto/vecchio/bloccato; cancellazione limitata; esempi coerenti con le risposte; calcoli budget/tempi; sintassi dei moduli; 75 riferimenti locali e conservazione dei collegamenti originali. In Chrome su macOS: percorso completo, ripresa, collegamenti contestuali per tutti i corsi, cinque missioni complete, tastiera, indietro, tutte saltate, reset, focus del collegamento al contenuto, console senza errori rilevati. Quattro pagine a 320, 390, 768 e 1366 pixel senza scorrimento orizzontale.

La struttura semantica è stata controllata nell'albero di accessibilità. Sono presenti etichette native, focus visibile e riduzione delle animazioni tramite `prefers-reduced-motion`. Non eseguiti: uso effettivo con lettore di schermo, Chromebook fisico, smartphone/tablet fisici, rete scolastica, carico di una classe e pilotaggio. Non dichiarare conformità WCAG completa o validazione didattica sulla base di queste verifiche.

## Verifiche successive alla pubblicazione

1. Un docente di ciascun indirizzo verifica la propria missione, terminologia, vincoli ed esiti; verifica anche le formulazioni dei possibili sbocchi nelle schede.
2. Prova con 6–10 studenti della fascia destinataria, senza spiegazioni preventive e senza dati personali: annotare difficoltà, esitazioni, tempi, interpretazioni della restituzione, esplorazione dei corsi e scoperta dei contatti.
3. Prova con una classe, Chromebook e connessione scolastica; verificare contemporaneità, riavvio/reset tra studenti, lettore di schermo e riduzione animazioni nelle impostazioni reali.
4. Correggere le criticità osservate e ripetere i controlli pertinenti.

Salvatore ha autorizzato il completamento e la pubblicazione il 4 ottobre 2026, rinviando le prove con la scuola. Le fotografie delle attività non sono disponibili: sono sostituite da illustrazioni vettoriali. La verifica tecnica della pubblicazione è registrata in stato-consegna.json.

## Completamento visivo per il rilascio

Otto illustrazioni del contesto delle domande, schema SIA con evidenziazione dei codici correlati, mappa Turismo che segue le selezioni, tre categorie SSAS aggiornate dalle carte scelte e foto della sede nei contatti. Questi elementi completano budget AFM e piante CAT già realizzati. Nessun segnaposto fotografico né foto artificiale di attività della scuola. Le pagine pubbliche non includono spiegazioni di progettazione.
