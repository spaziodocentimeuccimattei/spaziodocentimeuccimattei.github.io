# La tua Bussola — consegna tecnica, 4 ottobre 2026

Versione funzionante per il pilotaggio del percorso di orientamento IIS Meucci - Mattei | Decimomannu. Sito statico, senza framework, registrazione, analytics o backend aggiuntivi. Non è uno strumento psicometrico e non assegna un indirizzo agli studenti.

## Avvio

Dalla radice del sito: `python3 -m http.server 8767 --bind 127.0.0.1`, poi aprire `http://127.0.0.1:8767/bussola.html`. Serve HTTP: non aprire i file HTML direttamente dal Finder perché i moduli e i JSON richiedono un server. Per il pilotaggio su altri dispositivi occorre servire questa versione in un ambiente accessibile sulla rete scolastica, previa scelta della scuola.

## File e manutenzione

- `bussola.html`, `bussola.mjs`: ingresso rivolto alla terza media, ripresa esplicita, otto situazioni, revisione e salto; conclusione con tutti e cinque gli indirizzi direttamente visibili, materie, collegamenti alle curiosità scelte e accesso alle attività. Restituzione delle scelte e contatti seguono le schede dei corsi.
- `bussola-core.mjs`: stato, validazione, restituzione, calcoli delle attività.
- `bussola-ui.mjs`, `bussola.css`: controlli, caricamento, focus, contatti e stile condiviso.
- `data/bussola.json`, `data/dimensioni.json`: situazioni e matrice delle sette dimensioni.
- `data/indirizzi.json`, `indirizzi-esplora.mjs`: sette possibili collegamenti per ciascun corso, attivati solo su richiesta; nessun ordinamento personalizzato dei corsi.
- `missioni.html`, `missioni.mjs`, `data/missioni.json`: budget AFM, archivio SIA, itinerario Turismo, pianta CAT, osservazioni SSAS. Situazioni dichiaratamente immaginate; contenuti proposti da validare con i docenti.
- `data/contatti.json`, `documenti/contatti-mattei.vcf`, `assets/qr-orientamento.svg`: contatti pubblici, fonti e data di verifica. Il QR porta alla home pubblica esistente; non contiene risposte o un profilo.
- `index.html`, `indirizzi.html`, `indirizzi.css`: ingresso dalla home, approfondimenti dei corsi, contrasto SIA/CAT. Collegamenti preesistenti conservati.

## Restituzione e pareggi

Ogni azione contribuisce a più dimensioni. I pesi sono centrati e scalati rispetto alle opportunità delle sole situazioni risposte. Non vengono trasformati in un punteggio del corso. La restituzione richiede almeno quattro situazioni risposte, tre dimensioni con sostegno in almeno tre situazioni e almeno un'azione primaria. Mostra tre temi o quattro quando il quarto è vicino alla soglia; se il quinto è altrettanto vicino oppure la distribuzione è troppo uniforme, lascia aperta l'esplorazione. I temi sono mostrati nell'ordine editoriale, con esempi delle azioni effettivamente scelte. Con poche risposte o tutte saltate non si forza un profilo.

Verifica ripetibile: `node scripts/verifica-bussola.mjs 50000`. La simulazione uniforme rileva sbilanciamenti strutturali, non rappresenta le preferenze degli studenti e non valida scientificamente il percorso. Ogni cambiamento di situazioni/pesi richiede una nuova esecuzione e una nuova revisione editoriale.

## Revisione grafica e contenuti — versione 2

Foto originale della sede in formato responsive fino a 1440 pixel, logo invariato, colori dei cinque corsi ispirati al logo e illustrazioni vettoriali nitide. Nessuna fotografia inventata di studenti o laboratori. `bussola-visuals.mjs` contiene le illustrazioni, i misuratori di spesa/tempo e le tappe. Le due piante CAT sono visibili prima della scelta. Le otto domande riguardano gli interessi personali; i precedenti scenari organizzativi sono sostituiti. La versione 2 ignora lo stato della vecchia versione.

Ogni corso ha una propria attività e un collegamento esplicito alle materie: AFM/economia aziendale, SIA/informatica, Turismo/geografia turistica e lingue, CAT/progettazione e topografia, SSAS/psicologia e metodologie operative. La restituzione mostra come esempi solo le risposte con collegamento diretto al tema (peso 2). I testi e i segnaposto del piano grafico restano nella tavola per il committente; non sono inseriti nelle pagine degli studenti.

Verifica della revisione nell’In-app Browser: otto domande complete, ripresa, cinque attività complete, riscontri dei vincoli, due piante CAT e console senza errori osservati. Restituzione, catalogo e CAT controllati a 320, 390, 768 e 1366 pixel senza scorrimento orizzontale. Le prove Chrome descritte sotto appartengono alla precedente versione; non sostituiscono le prove della revisione.

## Stato e privacy tecnica

Solo `sessionStorage`, chiave `mattei-bussola-v1`, nella scheda del browser. Nessun nome, scuola o account richiesto; nessun invio delle risposte. I dettagli delle scelte nelle missioni restano in memoria; viene salvato soltanto il completamento. Stato corrotto o versione sconosciuta sono ignorati. Se lo storage è bloccato, il percorso continua in memoria. I comandi di cancellazione toccano soltanto la chiave Bussola, senza modificare lo stato dell'area docenti. Alla riapertura dello stato salvato si chiede di continuare o iniziare per un'altra persona prima di mostrare le risposte.

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
