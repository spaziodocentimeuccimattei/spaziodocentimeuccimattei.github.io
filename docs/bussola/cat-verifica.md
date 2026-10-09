# CAT Archeodesign: verifiche del rilascio

9 ottobre 2026. Separazione fra prototipo conservato, integrazione tecnica e prova educativa. Versione dei moduli di rilascio `20261009-cat`.

## Prove sui moduli e sui servizi

`node scripts/verifica-cat-laboratori.mjs`: **21 casi superati**, con 24 combinazioni di stima e 72 piani di attuazione. Comprende dieci passaggi, dipendenze fra scelte e prove, posizioni fuori griglia o occupate, area modificata, conservazione delle prove precedenti, distinzione dell’incarico archeologico, note autonome e campi compatibili sconosciuti. [Rapporto ripetibile](cat-verifica-core.json).

Con PGlite e i gestori effettivi delle due funzioni, in un ambiente isolato con dati fittizi:

- creazione del codice breve, riconoscimento e associazione dell’alunno;
- completamento dei dieci passaggi e cinque elaborati CAT;
- revisioni concorrenti respinte, identificativi delle note idempotenti e due contesti distinti;
- progetti di un corso diverso respinti; SSAS e CAT distinti anche per uno stesso partecipante;
- accesso al lavoro vietato a una credenziale diversa, operazioni riservate negate senza sessione o al ruolo orientatore;
- verifica del nome prima dell’emissione della Funzione Strumentale, snapshot nominativo dei cinque lavori, CSV CAT;
- snapshot emesso immutato dopo una revisione; versione corrente incompleta non attestabile;
- parità del core CAT fra browser e le due funzioni.

Superate anche le regressioni di Turismo, laboratori e guida SSAS, attestati e attestato personale. I controlli del prototipo iniziale sul salvataggio (sette casi, comprese copie di dati corrotti o formati futuri, conflitti e chiavi estranee conservate) restano nell’archivio originale; il raccordo remoto è stato verificato separatamente.

## Percorso realmente svolto nel browser

Server locale dedicato e servizi isolati: codice LUNA24 e Alunno Fittizio, Scuola di prova, 3A. Nessun dato sintetico inserito nel database di produzione.

Ingresso e associazione alla classe; tutti i dieci passaggi; area 10×6 m, tre misure e due viste; Suono/Video/Montaggio sulla pianta; prova dei passaggi; copertura filtrante e suolo drenante, 12 m²; sole e pioggia; tre osservazioni archeologiche, ipotesi ad arco e campitura; stima di 1.700 € e copertura prima. Dossier completo, Materiali e Archeodesign come curiosità. Nota contestualizzata conservata. Dopo ricaricamento, scelte, nota, completamento e identità disponibili.

L’attestato personale si apre con il nominativo ed è stato scaricato: PDF di una pagina A4, 595,28×841,89 pt. Dalla Gestione: filtro CAT, classe 3A, nome verificato, selezione ed emissione. ZIP scaricato e controllato: un PDF nella cartella della scuola/classe e CSV, senza errori d’integrità. Console osservate senza errori o avvisi. Stampa configurata mediante CSS A4: stampa fisica non provata.

## Qualità visiva e accessibilità

Il prototipo conservato documenta 66 letture dei dieci passaggi e del dossier a 320, 360, 390, 412, 768 e 1280 px, più le regressioni di pianta e Archeodesign. Nessuno scorrimento orizzontale rilevato; testo almeno 13 px, contrasto calcolato almeno 7,03:1 sui testi attivi, bersagli almeno 24×24 px con i label dei checkbox. Questa misura non copre ogni sovrapposizione grafica né certifica conformità WCAG.

Nel raccordo sono stati ricontrollati attestato, dossier e dialogo della classe a 320 px, senza scorrimento orizzontale. Link della barra superiore bianco su sfondo scuro; chiusura dei dialoghi con bersaglio alto 44 px. La pianta funziona con pulsanti e tastiera, senza trascinare; SVG con titolo e descrizione, dati e ipotesi distinguibili anche mediante tratteggio e legenda. Focus visibile e note accessibili durante il percorso.

Non verificati: telefono fisico, Safari/Chrome esterni, lettore di schermo, stampante, dispositivi e rete della scuola. La verifica protetta completa riguarda l’ambiente isolato, non il normale accesso personale alla Gestione online.

## Prova educativa ancora necessaria

Prima 4–6 alunni delle superiori per trovare difficoltà operative, poi prova distinta con 5–8 ragazzi di terza media. Osservazioni senza nomi: primo clic, esitazioni, aiuto richiesto, revisioni, scroll e durata. Chiedere quali scelte riconoscono come proprie, come distinguono dato e ipotesi e che cosa vorrebbero progettare ancora. Separare attrazione grafica, comprensione autonoma e curiosità verso il percorso; una risposta dopo aiuto non dimostra autonomia.

La durata **12–18 minuti resta un’ipotesi**. Nessuna prova scolastica già svolta e nessun effetto educativo dimostrato dai test tecnici. Fonti e limiti progettuali: [cat-fonti.md](cat-fonti.md).
