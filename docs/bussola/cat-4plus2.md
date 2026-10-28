# CAT 4+2 nella Bussola

Revisione locale del 28 ottobre 2026. Sostituisce la presentazione pubblica CAT Archeodesign con CAT 4+2, mantenendo lo stesso percorso in cinque laboratori, il codice tecnico `cat`, salvataggi, note, dossier e attestato. Non è ancora pubblicata.

## Fonti e limiti dei testi

- `PRESENTAZIONE SINTETICA DEL PROGETTO QUADRIENNALE.pdf`, quattro pagine, fornito da Salvatore: progetto quadriennale CAT, sostenibilità, BIM, rilievo e geomatica; raccordo descritto con Università di Cagliari e ITS Academy Energia Sardegna, Home & Building Manager 4.0. Collegio dei Geometri e ANCE risultano in divenire: non vengono presentati come accordi già operativi.
- `ITS_ACADEMY.pdf`, tre pagine, fornito da Salvatore: efficienza energetica, edilizia sostenibile, impianti e domotica. La prima pagina riporta offerta 2023/2025: sedi, gratuità, borsa di studio e scadenze non sono riproposte come informazioni attuali.
- [FAQ MIM sulla filiera](https://www.mim.gov.it/documents/20182/7978739/FAQ%2BPiano%2Bnazionale%2Bsperimentazione%2Bfiliera%2Btecnologico_professionale%2B05_01_2024.pdf/6b3786fc-7f88-ff02-fc5a-2984c09b0ec3?t=1704470019215): prosecuzione ITS facoltativa dopo il diploma; restano università e lavoro.

La pagina parla del progetto: avvio, quadro orario, iscrizioni e offerta ITS aggiornata si verificano con la scuola. Non si dichiarano attrezzature, convenzioni, autorizzazione o attivazione di una classe non documentate. Non viene ripetuta l'affermazione sulle ore ridotte né attribuito un titolo professionale all'attestato della Bussola.

## Presentazione e attività

Stesso ingresso grafico, cinque prodotti personali, due passaggi per laboratorio e conclusione con curiosità dichiarate dall'alunno. Non vengono attribuiti voti, capacità o un indirizzo obbligato.

1. Rilievo: misure e tavola con due rappresentazioni.
2. Spazi: attività di musica/video nella pianta e verifica dei passaggi.
3. Materiali: copertura, suolo e prove qualitative di sole/pioggia.
4. Energia: tre dati della sala di montaggio, confronto fra comando attuale, orario programmato e sensore di presenza. Potenza ipotetica 0,10 kW, 200 giorni: rispettivamente 120, 80 e 60 kWh/anno. Per continuare occorre provare il riferimento e un'alternativa. Il modello esplicita ipotesi e limiti; non è una diagnosi energetica.
5. Risorse: quantità, costi e fasi del solo cortile. Non include i costi delle soluzioni di illuminazione.

La presentazione distingue quattro anni per il diploma e la possibile prosecuzione biennale ITS. Il BIM è spiegato come collegamento fra modello e informazioni, senza chiamare BIM il semplice disegno della prova.

## Conservazione e integrazione

Il marcatore aggiuntivo `journey: cat-4plus2` distingue i nuovi lavori. I vecchi payload senza marcatore mantengono prove, risposte, campi sconosciuti, note e completamento originari. La nuova presentazione compare anche a chi riprende un vecchio lavoro, con un comando esplicito di recupero; il lavoro recuperato mantiene i laboratori storici.

Nessun campo esistente viene eliminato. Non occorrono migrazioni di tabelle, cambi di RLS, password o ruoli. Il quarto laboratorio dei nuovi lavori è Energia; gli attestati nuovi riportano il percorso 4+2 e un'illustrazione coerente. Le esportazioni e gli attestati storici mantengono la distinzione Archeodesign.

Aggiornate scheda diurna degli indirizzi, catalogo esperienze, richiamo nella home e in Una scuola da vivere. CAT serale invariato. Gli altri indirizzi ricevono solo riferimenti aggiornati ai moduli condivisi degli attestati.

## Verifica e rilascio

- `node scripts/verifica-cat-4plus2.mjs`: 90 controlli su calcoli, avanzamento, recupero, campi sconosciuti, note, isolamento, revisioni concorrenti, riepilogo docente e attestati; database in memoria con soli dati fittizi.
- `node scripts/verifica-cat-laboratori.mjs`: 21 casi storici, 24 combinazioni di stima e 72 piani.
- Verifiche esistenti di monitoraggio, interfaccia, collegamenti e prima Bussola.
- Browser: percorso completo, tre consumi, nota, curiosità, PDF A4 di una pagina e ricaricamento. Controllo mobile a 320/390 px del nuovo confronto energetico; ingresso e scheda indirizzo anche a 320 px, senza overflow dei pulsanti.

Prima della pubblicazione sono stati riletti i sorgenti attivi: `bussola-esperienze` v4 (8 file), `bussola-gestione` v8 (17 file), identici alla base GitHub. Per distribuire la revisione occorre aggiornare entrambe le funzioni con i rispettivi nuclei CAT e l'adattatore dei record, poi il sito. Nessun deploy o scrittura nel database di produzione è stato eseguito durante la preparazione.

Base GitHub: `f60556afa5431a9b97fa29109538daadf9a40554`. Il dominio indicato `spaziodocentimeuccimattei.it` non si risolve durante questa sessione; la versione esistente è stata letta su `https://spaziodocentimeuccimattei.github.io/bussola-cat.html`.

Resta distinto il collaudo tecnico dalla prova educativa con alunni, dai dispositivi fisici e dagli accessi docenti reali. La pubblicazione richiede la conferma della revisione mostrata e la successiva verifica dei file serviti e dei percorsi live.
