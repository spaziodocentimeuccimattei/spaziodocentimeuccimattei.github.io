# Testi CAT: prima e dopo (riordino novembre 2026, agente A6)

File: `bussola-cat.html`, `cat.mjs` (collegamento), `cat-percorso.mjs` (schermi e testi nuovi), `cat-bussola.css`, `cat-missione.mjs` (resta solo la scena), `cat-remote.mjs` (aggiunto `saved()` per il QR).
Percorso aperto oggi per chi entra senza lavori salvati: **Missione Aurora** (`journey: cat-4plus2-missione`), ed è quello rifatto. Le altre varianti (dieci tappe classiche, 4+2, edificio) si aprono come prima per chi ha un lavoro salvato: intro con «Riprendi l'attività precedente» e «Inizia la missione».
I dati (cat-missione-core.mjs, tre tappe salvate, ordine e identificativi) non sono cambiati: i testi nuovi stanno in `cat-percorso.mjs`.

## Struttura

| Prima | Dopo |
|---|---|
| Apertura con titolo, due paragrafi, riquadro «Il diploma in quattro anni», cinque elaborati, avviso sul video | «Pilota il drone. Cambia l'edificio.», una frase, scena con il drone, «Inizia» |
| Finestra «Come vuoi iniziare?» | Ingresso comune «Come ti chiami?» |
| Tre tappe lunghe con più controlli per schermo | Sette schermi, uno per scelta, barra di avanzamento, Avanti e Indietro |
| Dossier con cinque schede, interessi, attestato, contatti, video | Finale comune a quattro schermi; il dossier è dietro «Rivedi il tuo lavoro» |
| Barra a tre tappe in cima | Barra di avanzamento unica |

## Schermi (titolo → frase → azione)

| N. | Prima | Dopo |
|---|---|---|
| 1 | «Decolla. Cerca i punti deboli.» + paragrafo di 40 parole + facciate, riprese, taccuino | «Fai volare il drone.» / «Scatta una foto per ogni lato dell'edificio.» / Scatta (il drone passa da solo al lato seguente) |
| 2 | «Termografia»: scala, avviso sulle temperature superficiali, tre punti con «ponte termico» | «Guarda dove scappa il caldo.» / «La termocamera mostra il caldo in rosso e il freddo in blu.» / Accendi, poi tocca tre punti |
| 3 | «Le tue scelte cambiano l'edificio.» con tre gruppi in una pagina | «Come proteggi i muri?» (lasciali così, cappotto di lana minerale, cappotto di sughero) |
| 4 | idem | «Che finestre metti?» (finestre vecchie, doppi vetri, tripli vetri) |
| 5 | «Finitura a basse emissioni… g/L di VOC» | «Che vernice scegli?» / «Cambia l'aria dentro casa, non il calore che scappa.» (rilascia più / meno sostanze nell'aria) |
| 6 | Risultato con kWh/anno, formula, «Da dove vengono i numeri» | «Prova il tuo progetto.» / barre Prima 100% e Con il tuo progetto 36%, spesa su 23.000 €, nessuna unità di misura |
| 7 | «Dai forma alla tua proposta.» con avvertenze | «Trasforma l'edificio.» / «Applica il progetto e muovi la barra: prima e dopo.» |

Sostituzioni: «ponte termico» → «da qui il calore scappa»; «composti organici volatili (VOC)» → «sostanze nell'aria»; «kWh/anno» → percentuali; «dispersioni» → «calore che scappa»; «telaio» → «travi e pilastri»; «infissi» → «finestre»; «riqualificazione» → «sistemarlo / cambiare l'edificio»; «i colori indicano temperature, non una diagnosi automatica» → una riga nel piè di pagina («è una simulazione, non una diagnosi»).
Nella scena del drone sono tolte le scritte tecniche (N E S O, «CAM TERMICA · ESTERNO», quote). Il budget compare sotto la scena e cambia a ogni scelta; l'edificio cambia colore con le scelte.

## Scelte non più mostrate (restano nel formato salvato)

- Lo spostamento libero del drone con le frecce c'è ancora, ma dopo ogni scatto il drone va da solo al lato non ancora fotografato (stessi dati: `captures`).
- Il «taccuino di volo», la storia delle prove (`runs` si riempie come prima), la formula e le ipotesi del modello: non più a schermo.
- `interests` (curiosità): non più chiesto; resta vuoto nei lavori nuovi. Il completamento non lo richiede (verificato nel nucleo).

## «In CAT…» per elaborato, con la fonte

| Elaborato | Frase | Fonte |
|---|---|---|
| Rilievo aereo | In CAT impari il rilievo: misurare e rappresentare un edificio con strumenti digitali. | `data/indirizzi.json`: materia «Rilievo e Geomatica», lente «dati» («Usare misure, rilievi e strumenti digitali») |
| Termografia | In CAT ti chiedi come ridurre il calore che un edificio perde, e come intervenire. | `data/indirizzi.json`, campo `face` («ridurre le dispersioni di calore»). Riformulazione mia. |
| Materiali | In CAT studi i materiali e confronti le soluzioni per costruire. | `cat-fonti.md`, PTOF: CAT integra «materiali, rilievo, restituzione grafica, progetto…»; materia «Progettazione, Costruzioni e Impianti» |
| Progetto energetico | In CAT confronti interventi, costi e consumi. L'estimo stima quanto costa un lavoro. | lente «risorse» («Confrontare interventi, costi e prestazioni energetiche»); materia «Estimo» |
| Trasformazione | In CAT disegni e progetti spazi e costruzioni. | lente «progetto» («Disegnare e progettare spazi e costruzioni») |

Richiamo al resto del corso (ultimo schermo): «Ma CAT non è solo energia: nel corso fai anche rilievo, progetto, cantiere e stima.» Fonte: materie `data/indirizzi.json` («Rilievo e Geomatica», «Progettazione…», «Estimo», «Cantiere e Sicurezza»).

## Le tre cose del finale

1. Rilevi e disegni un edificio, anche con strumenti digitali. Fonte: «Rilievo e Geomatica»; lente «dati»; PTOF in `cat-fonti.md` (rilievo, restituzione grafica). «Anche con strumenti digitali» è nella lente «dati».
2. Progetti e scegli i materiali per costruire e rinnovare. Fonte: «Progettazione, Costruzioni e Impianti»; `face` (interventi sull'edificio). «Rinnovare» è mia interpretazione di quella domanda.
3. Stimi i costi e organizzi il cantiere in sicurezza. Fonte: materie «Estimo» e «Cantiere e Sicurezza»; lente «organizzazione» («Organizzare le fasi di un lavoro tecnico»).

## CAT 4+2 (verificato nelle fonti)

Significa: diploma in quattro anni (stesso valore legale del quinquennale), poi un biennio facoltativo di ITS Academy (+2); in alternativa università o lavoro (`cat-4plus2.md`, `data/indirizzi.json` campo `destination`). Avvio, quadro orario e iscrizioni vanno verificati con la scuola. Nella prova compare solo nell'occhiello dell'apertura e in una riga del piè di pagina; la sezione «Il diploma in quattro anni» è tolta dall'apertura.

## Durata (parole su schermo ÷ 120 al minuto + 4 secondi per scelta)

Misura in Chrome sul testo visibile (`inner_text`). Parole: apertura 27; schermi 1-7: 37, 68, 47, 46, 59, 58, 62; finale comune 42 + 38 + 18 + 78.
- Parte CAT: 404 parole = 202 s, più 14 scelte = 56 s, cioè 258 s, circa 4,3 minuti (limite 4,5).
- Totale con ingresso e finale: 603 parole = 302 s, più 21 scelte = 84 s, circa 6,4 minuti. Stima, non prova con ragazzi.
