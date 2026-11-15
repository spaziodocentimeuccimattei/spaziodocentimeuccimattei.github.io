# AFM — testi prima → dopo (riordino novembre 2026, agente A5)

Clienti e casi restano quelli di prima (Officina Forme, Linea Studio, la quantità di kit, i 14 giorni di attesa del pagamento, le email in inglese). Cambia il testo e il modo di presentarlo: una scelta per schermo, con «Avanti» e «Indietro», la barra di avanzamento e un foglio di lavoro che si costruisce accanto alla scelta.

**Che cosa non cambia nei dati.** Le dieci tappe, l'ordine, gli identificativi delle scelte (offer, feature, order, obstacle, quantity, price, payment, agreement, amendment, tone, headline, question, response) e il formato del progetto salvato restano identici. I testi dei dati in `afm-core.mjs` (proposte, compiti, imprevisti, ecc.) non sono toccati, perché monitoraggio e attestato li leggono: i testi per il ragazzo sono in `afm.mjs`. In `afm-core.mjs` cambia solo `STAGES` (titolo, frase, aiuto, pulsante del primo schermo di ogni tappa), che compare nelle etichette delle note.

## Apertura e finale

| Prima | Dopo |
|---|---|
| «Dai valore alle idee. Falle funzionare.» | «Lancia la tua idea.» |
| «Entra in uno studio d'impresa. Dai forma a una proposta, organizza un incarico, prova i conti e comunica con un cliente.» + «Cinque laboratori brevi…» + quattro schede + «In questo indirizzo impari a…» | «In AFM impari a trasformare un'idea in un piano di attività.» |
| Disegno «STUDIO D'IMPRESA» con quattro scrivanie | Foglio che si compila da solo («Segno», «Il cliente dice sì ✓») e bollino «La lanci tu!» |
| Pulsanti «Inizia» / «Riprendi i laboratori» | «Inizia» / «Riprendi» |
| Finale a cinque blocchi, avviso del video | Finale comune (A3) con le tre cose qui sotto |

## Titoli e frasi (STAGES, primo schermo di ogni tappa)

| Tappa | Prima | Dopo |
|---|---|---|
| 0 | Quale idea vuoi far crescere? / Scegli una proposta su cui lavorare. Il tuo studio comincia da qui. | Quale idea lanci? / Scegli quella che ti piace. |
| 1 | Che cosa può significare per qualcuno? / Scegli una richiesta. La tua proposta cambierà per rispondere a quel bisogno. | Che cosa dice il cliente? / Scegli a quale rispondere. |
| 2 | Da una richiesta a un lavoro organizzato. / Per Officina Forme, prepara l'ordine di tre incarichi. Usa le frecce… | Da dove comincia Officina Forme? / Tocca i tre compiti in fila. |
| 3 | Un imprevisto. Tre modi per affrontarlo. / Officina Forme deve consegnare 8 lavori venerdì. Il materiale per 2 arriva lunedì… | Due lavori sono in ritardo. / Che cosa proponi al cliente? |
| 4 | I numeri cambiano il progetto. / …quantità e prezzo… | Quanti kit vende Linea Studio? / Li vende tutti a 15 € l'uno. |
| 5 | Il denaro arriva in tempo? / Linea Studio ha 80 € disponibili. I costi vanno pagati oggi… | Oggi i soldi non bastano. / In cassa ci sono 80 €. |
| 6 | Una proposta che si capisce. / …il cliente deve sapere che cosa aspettarsi prima di confermare. | Quando consegni? / Il preventivo è l'offerta scritta. |
| 7 | Una richiesta in più cambia l'accordo. / …guarda che cosa cambia nella proposta. | Il cliente vuole di più. / Come rispondi? |
| 8 | Dai una voce alla tua idea. / …puoi anche cambiare il titolo. | Come presenti la tua idea? / Che cosa metti al centro? |
| 9 | Un cliente ti scrive in inglese. / Fai una domanda, leggi la risposta… | Un cliente ti scrive in inglese. / Scegli che cosa chiedergli. |

I pulsanti «Dai valore alla proposta», «Passa all'organizzazione», «Passa ai dati», «Conserva il piano», «Passa agli accordi», «Prova una nuova richiesta», «Passa alla comunicazione», «Apri la conversazione», «Raccogli il tuo lavoro» diventano tutti «Avanti».

## Etichette delle risposte (schermi 3, 5, 6, 7)

| Schermo | Prima (sintesi) | Dopo |
|---|---|---|
| 3 | Tre soluzioni con spiegazione lunga | «Consegno 6 venerdì e 2 lunedì» / «Uso un materiale diverso» / «Consegno tutto lunedì» |
| 5 | Due accordi di pagamento con linea del tempo | «Il cliente paga prima una parte» / «Il fornitore aspetta 14 giorni» (con una riga di esito) |
| 6 | Tre condizioni di consegna con testo lungo | «Tutto in 7 giorni» / «Prima un esempio» / «Una data scelta insieme» |
| 7 | Tre risposte alla richiesta in più | «Una proposta a parte» / «Una sola immagine inclusa» / «Resta il lavoro iniziale» |
| 9 | Domande e risposte in inglese con traduzioni lunghe | Frasi inglesi brevi con l'italiano accanto (solo a livello di schermo: i testi del core restano interi) |

## Una frase «In AFM…» per laboratorio, con fonte

Compare dopo la seconda tappa di ogni laboratorio, solo a lavoro fatto.

| Laboratorio | Frase | Fonte |
|---|---|---|
| 1 Dai forma a una proposta | In AFM impari a trasformare un'idea in un piano di attività. | `data/indirizzi.json`, lente «progetto»; Canovaccio in `docs/bussola/afm-fonti.md` («idee, pubblicità, regole, organizzazione e denaro») |
| 2 Metti in ordine il lavoro | In AFM impari a pianificare attività e responsabilità. | `data/indirizzi.json`, lente «organizzazione» («Pianificare attività e responsabilità in un'organizzazione.») |
| 3 Fai i conti | In AFM impari a leggere dati economici. | `indirizzi.html`, scheda AFM («leggere dati economici, organizzare risorse e comprendere le scelte di un'impresa»); lenti «dati» e «risorse» |
| 4 Scrivi un accordo chiaro | In AFM, con Diritto, impari a scrivere accordi chiari. | Materia Diritto nell'elenco `subjects` AFM; «regole» nel Canovaccio. Il collegamento è una mia inferenza, non una frase scritta nelle fonti. |
| 5 Presenta la tua idea | In AFM impari a spiegare le decisioni, anche in inglese. | `data/indirizzi.json`, lente «comunicazione»; Canovaccio («inglese con traduzione») |

## Le tre cose del finale

1. «Trasformi un'idea in un piano di attività.» Fonte: lente «progetto» e Canovaccio.
2. «Leggi i numeri e confronti costi e risorse.» Fonte: scheda AFM di `indirizzi.html` e lente «risorse» («Confrontare costi, risorse e possibilità.»).
3. «Spieghi le tue decisioni a persone diverse, anche in inglese.» Fonte: lenti «persone» e «comunicazione», Canovaccio («inglese con traduzione»).

L'accostamento tra queste frasi e le fonti è in parte interpretativo: le fonti non le dicono in queste parole.

## Scelte che il ragazzo non vede più

- Il prezzo (12, 15, 18 €): resta 15 €, valore predefinito. Il ragazzo sceglie solo la quantità.
- Il titolo personale del manifesto (campo «headline»): il manifesto usa il titolo generato da `posterTitle`.
- Le frecce per spostare i compiti: sostituite dal toccare i tre compiti in fila (stesso risultato salvato in `order`).
- «Cambia domanda» nello schermo dell'inglese: sostituito da «Indietro».
- Il blocco «Materie coinvolte» e il menu del prossimo passo (`bussola-prossimo-passo`).

## Durata stimata

Formula: parole ÷ 120 al minuto + 4 s per scelta, finale compreso. Misurato sui testi mostrati dopo la scelta: apertura più 11 schermi 526 parole e 12 scelte; ingresso 23 parole e 3 scelte; finale comune 174 parole e 4 scelte. Totale 705 parole = 352 s, più 19 scelte = 76 s, cioè circa 7,1 minuti. L'obiettivo di 6,5 non è raggiunto: il quarto schermo del finale comune da solo ha 78 parole (circa 39 s) ed è un file di A3. Accorciandolo il totale scenderebbe a circa 6,7 minuti.
