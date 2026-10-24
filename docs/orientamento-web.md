# Grafica, testi e navigazione del portale

La revisione del 24 ottobre 2026 riguarda le porte pubbliche del portale: home,
indirizzi, famiglie, Bussola, catalogo delle attività e curricoli. La pagina di
riferimento è `indirizzi.html`, per tutti e cinque i diurni e i tre serali.

## Criterio grafico

- Logo e fotografia della sede originali, senza ricostruzioni del marchio.
- Fondo chiaro `#f8f8f3`, titoli `#123c57`, testo `#33495a`.
- Azione principale verde `#005a35`; un colore scuro distinto per ogni indirizzo.
- Tipografia di sistema, titoli con interlinea almeno 1,1; testo almeno 13 px.
- Riquadri con angoli di 12–18 px, ombre leggere solo quando spiegano un livello.
- Menu comune visibile anche sul telefono. Il marchio riporta alla home.

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

Moduli JavaScript, dati, identificativi, campi, logiche di accesso, backend,
laboratori e immagini originali restano invariati. I contenuti di approfondimento
delle schede restano disponibili; la motivazione educativa è spostata nel dettaglio.

Verifiche: sei pagine a 320, 390, 768 e 1280 px; cinque inviti fino agli ingressi
delle attività; sei tappe famiglie; tutti i dettagli degli indirizzi aperti a
320 px; contrasti dei testi misurati almeno 7:1; menu con bersagli di almeno
44 px; nessun errore o avviso nella console osservata. Conservati ID e contratti
dei campi, nessun riferimento locale mancante. Superati i controlli esistenti
su navigazione, percorsi, accessi e 90 controlli di interfaccia con database
locale fittizio. Le prove non equivalgono a un test su dispositivi fisici,
a una verifica con lettore di schermo o a un pilotaggio con famiglie e alunni.

Questa revisione è locale: pubblicazione e verifica del sito vivo richiedono
l’autorizzazione di Salvatore.
