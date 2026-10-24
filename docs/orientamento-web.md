# Grafica, testi e navigazione del portale

La revisione del 24 ottobre 2026 riguarda le porte pubbliche del portale: home,
indirizzi, famiglie, Bussola, catalogo delle attività e curricoli. La pagina di
riferimento è `indirizzi.html`, per tutti e cinque i diurni e i tre serali.

## Criterio grafico

La prima proposta chiara del commit `82e3be1` è stata rifiutata da Salvatore:
fondi, schede e sezioni avevano valori troppo simili e la pagina risultava piatta.
Un buon contrasto del testo non dimostrava una gerarchia visiva efficace. Questa
revisione differenzia le superfici secondo il loro ruolo e rende dominante
l’azione principale, conservando testi, navigazione e identità della scuola.


- Logo e fotografia della sede originali, senza ricostruzioni del marchio.
- Fondo neutro `#e6edef`; aperture blu `#123c57`, titoli bianchi e accento lime.
- Pulsante principale lime `#c9f981` su campo scuro; link secondari distinti per forma.
- Copertine e schede dei cinque corsi con campiture solide di pari risalto; corpi di lettura chiari.
- La home alterna apertura scura, sezione educativa chiara e schede dei corsi colorate.
- Tipografia di sistema, titoli con interlinea almeno 1,1; testo almeno 13 px.
- Riquadri con angoli di 12–18 px, ombre leggere solo quando spiegano un livello.
- Menu comune visibile anche sul telefono. Il marchio riporta alla home.
- Barra degli indirizzi blu con sei pulsanti bianchi e testo scuro. Selezione lime con sottolineatura; hover azzurro chiaro con sottolineatura; focus con anello lime esterno.

Il foglio `orientamento-web.css` è collegato dopo i fogli esistenti e usa il
contesto `orientation-web`. Non cambiare i fogli condivisi dei laboratori per
modificare le porte di ingresso. Aggiornare la versione del nuovo foglio nei
sei HTML quando si prepara una revisione successiva alla versione approvata.

## Percorso

Home → conoscenza della scuola → confronto tra indirizzi → Bussola → attività.
Il contatto e il percorso delle famiglie rimangono disponibili nel menu comune.
La Bussola conserva il primo approdo e il comando per saltare alle attività.
I link contestuali conservano `?corso=…`; gli accessi docenti conservano il link
usato dal modulo esistente per lo stesso contesto.

La barra degli indirizzi resta visibile durante lo scorrimento. Il salto al
corso è immediato e lascia spazio sopra il titolo. La pagina distingue SIA,
articolazione di AFM dal terzo anno, e il Socio-sanitario serale da SSAS diurno.

## Inviti all’azione e testi

Ogni corso mostra una domanda concreta, una caption sulle attività e un invito
`Esplora [indirizzo]`. L’azione precede gli approfondimenti richiudibili. I
contatti per indirizzo restano quelli approvati. La home invita a iniziare dalla
Bussola, confrontare i corsi o conoscere la scuola insieme alla famiglia.

I testi descrivono conoscenze, attività e possibilità. Non promettono lavoro,
qualifiche o un esito della scelta e non creano urgenze. Gli esempi delle attività
restano distinti da esperienze reali della scuola. I progetti mantengono il loro
stato dichiarato. Il riferimento ad Avanguardie educative è mantenuto; è tolta
l’attribuzione al PTOF che la consegna dell’ecosistema indicava come non documentata.

## Conservazione e verifiche

Fino alla revisione v4, dati, identificativi, campi, logiche di accesso e salvataggio,
backend, contenuti dei laboratori e immagini originali restano invariati. Il secondo esame modifica
solo due frasi nei moduli SIA/Turismo e lo stato accessibile delle slide di
Accoglienza; aggiorna i riferimenti alle risorse cambiate. I contenuti di approfondimento
delle schede restano disponibili; la motivazione educativa è spostata nel dettaglio.

Verifiche: sei pagine a 320, 390, 768 e 1280 px; cinque inviti fino agli ingressi
delle attività; sei tappe famiglie; tutti i dettagli degli indirizzi aperti a
320 px; contrasti dei testi misurati almeno 7:1; menu con bersagli di almeno
44 px; nessun errore o avviso nella console osservata. Conservati ID e contratti
dei campi, nessun riferimento locale mancante. Superati i controlli esistenti
su navigazione, percorsi, accessi e 90 controlli di interfaccia con database
locale fittizio. Le prove non equivalgono a un test su dispositivi fisici,
a una verifica con lettore di schermo o a un pilotaggio con famiglie e alunni.

Correzione mirata della barra: verificate le superfici dei pulsanti rispetto al
fondo, oltre al testo, in stato normale, hover, selezionato e focus da tastiera.
Contrasto normale bianco/blu 11.6:1; minimo osservato tra gli stati
9.59:1. Sei salti verificati a 390 px, nessun titolo coperto; pulsanti
almeno 44 px e nessun overflow a 320, 390, 768 e 1280 px.

Questa revisione è locale: pubblicazione e verifica del sito vivo richiedono
l’autorizzazione di Salvatore.

## Esame dei percorsi interni

Esaminati i 17 HTML della radice a 320, 390, 768 e 1280 px, oltre ai riferimenti
della pagina conservata in archivio. Percorsi nel browser: dodici domande della
Bussola, un percorso completo per ciascuno dei cinque indirizzi, attestato
Turismo e ripresa, sei tappe famiglie e dettagli iscrizione, sette schermate
Accoglienza, tre viste docenti e report su dati fittizi. Il calendario pubblico
è stato letto senza inviare moduli; gli stati non caricati nell’anteprima
isolata non sono stati scambiati per problemi del sito online.

Correzioni emerse dall’uso: nomi dei laboratori SSAS visibili sul telefono e
numero attivo scuro sul lime; CTA Turismo lime sul pannello scuro; target di
44 px per dettagli, filtri e comandi prima troppo piccoli; nomi accessibili dei
comandi a icona di Accoglienza e slide inattive escluse dall’interazione e
dall’albero accessibile. Tolta una freccia duplicata nel nome del comando
Indietro di Turismo; consegna SIA riferita al prototipo senza indicazioni
spaziali che cambiano sul telefono.

Questa copertura non equivale a tutte le combinazioni possibili, a una prova
con lettore di schermo o dispositivi fisici, né a un accesso con credenziali
reali alle aree riservate. I controlli di monitoraggio usano un database
PostgreSQL isolato in memoria e non dati della scuola.

## Ingresso Turismo dopo la v4

Il primo accesso conserva «Inizia». Per un’attività avviata, «Riprendi l’attività
salvata» descrive lo stato del dispositivo senza attribuire il lavoro alla persona
che sta navigando. Una spiegazione breve e un comando visibile permettono di
iniziare una nuova attività.

Corretto anche il comando già presente nel footer: cambiava soltanto il progetto
locale, poi il recupero online ricaricava il lavoro precedente dello stesso
partecipante. La nuova attività usa un accesso distinto e conserva il progetto
precedente con il suo proprietario e un collegamento per riaprirlo. L’elenco di
recupero non passa a «Cambia partecipante». Se non può essere conservato, il
cambio si ferma e mostra un messaggio. Backend e campi dei moduli non cambiano.

`npm run test:turismo-ingresso` verifica questo flusso con moduli reali, DOM
simulato e PostgreSQL isolato, inclusi recupero offline e errore di archiviazione.
Superati anche i test esistenti Turismo, navigazione, accessi e interfaccia.
Per questo seguito il browser dell’app non era disponibile: il nuovo testo e
la nuova azione richiedono ancora un controllo visivo nel browser. Nessuna
pubblicazione eseguita.

## Home mobile: etichette fuori dai pulsanti

Lo screenshot iPhone fornito dopo la pubblicazione v5 mostra tre CTA iniziali
fuori dal fondo bianco. La vecchia regola mobile di `home.css` mantieneva
`width:44px;height:44px` per i pulsanti che in precedenza mostravano soltanto
una freccia; il nuovo foglio ripristinava il testo senza ripristinare le dimensioni.
Le quattro CTA della home ora hanno larghezza e altezza automatiche, larghezza
massima del contenitore, altezza minima di 44 px e ritorno a capo. Titoli lunghi
ed email possono andare a capo; le colonne mobili delle schede possono restringersi.
La versione del foglio viene aggiornata nella home: queste nuove regole sono
limitate al suo contesto e non cambiano le altre pagine.

Conservati tutti i testi e collegamenti. Verificata la cascata CSS a 13 larghezze,
inclusi i due lati del limite 700 px che attivava il difetto. Questo controllo
non misura l’overflow dei singoli elementi: l’assenza di scorrimento laterale
del documento, usata nel precedente esame, non provava che ogni testo fosse
contenuto nella propria scheda. Il nuovo controllo visivo su browser resta
da fare; il browser dell’app non era disponibile. Correzione locale, non pubblicata.
