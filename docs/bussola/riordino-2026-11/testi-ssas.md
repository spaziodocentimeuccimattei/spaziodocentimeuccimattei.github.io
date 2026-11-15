# Testi SSAS: prima e dopo (riordino novembre 2026, agente A8)

File: `bussola-ssas.html`, `ssas-situazioni.mjs` (schermi, ingresso e finale comuni), `ssas-situazioni-revisione.mjs` (testi delle sei storie), `ssas-situazioni-core.mjs`, `ssas-situazioni-data.mjs`, `ssas-labs-core.mjs`, `ssas-terza-media.css`, copie in `supabase/functions/bussola-gestione/` (non pubblicate).
Il percorso aperto oggi è quello delle sei storie (`ssas-sei-situazioni-2`). I tredici identificativi delle scelte, l'ordine e il formato dei dati salvati non sono cambiati. Gli interessi restano nel formato (campo `interests`) ma non servono più per concludere.

## Struttura

| Prima | Dopo |
|---|---|
| Apertura con titolo, frase, scena, «Inizia» | Stessa struttura, aspetto scuro; una riga a fondo pagina: «Storie e persone sono inventate. Il diploma non dà da solo qualifiche come OSS o infermiere.» |
| Ingresso proprio della pagina (nome, codice classe, link) | Ingresso comune «Come ti chiami?», poi si sceglie la storia come prima |
| Avvisi per gli adulti sulle schermate | Tolti. Resta solo la riga a fondo apertura (sopra) |
| Cinque laboratori in schede chiare, titoli come «Un aiuto che lascia spazio» | Un passo per schermo, barra «N di 5 · titolo», Avanti e Indietro, effetto a ogni scelta |
| Sesto passo «Che cosa ti incuriosisce?» (interessi, obbligatorio) | Tolto. Dopo il quinto passo si conclude da soli |
| Riepilogo, attestato, video e contatti nello stesso schermo | Finale comune a quattro schermi. Il riepilogo sta dietro «Rivedi il tuo lavoro» |
| Schermo «Passaggio di mano» con la sola frase della storia | Schermo «Ora cambi ruolo» con la frase della storia e la frase sul mestiere che si impara a scuola (vedi sotto) |

## Titoli dei cinque passi

| N. | Prima | Dopo |
|---|---|---|
| 1 | Un bisogno da capire | Capisci che cosa succede |
| 2 | Un incontro, più voci | Ascolti e fai le domande giuste |
| 3 | Un aiuto che lascia spazio | Scegli gli aiuti per la persona |
| 4 | Una storia da far giocare | Prepari un materiale per gli altri |
| 5 | Un servizio prende forma | Organizzi un'attività per tutti |

Anche le due righe «Scegli…» dei sotto-passi e le frasi di presentazione dell'attestato seguono questi titoli (`GUIDE`, `PRESENTATION` in `ssas-situazioni-core.mjs`). Le etichette di area dell'attestato (Capisci, Ascolta, Aiuta, Crea, Organizza) non sono cambiate.

Sotto-passi (`GUIDE`):

| Prima | Dopo |
|---|---|
| Scegli la situazione · Descrivi la situazione | Scegli la storia · Spiega che cosa succede |
| Scegli la domanda · Approfondisci il racconto · Proponi un primo passo | Fai la prima domanda · Ascolta ancora · Proponi un primo passo |
| Scegli i sostegni · Adatta l'aiuto | Scegli gli aiuti · Cambia l'aiuto |
| Scegli lo scopo · Scegli il materiale · Migliora e prova | Scegli a che cosa serve · Scegli il materiale · Migliora e prova |
| Scegli l'attività · Apri l'accesso · Pensa al miglioramento | Scegli l'attività · Fai partecipare tutti · Controlla come è andata |

## Parole difficili nelle sei storie (`ssas-situazioni-revisione.mjs`)

Le frasi erano già corte (revisione precedente): qui sono cambiate solo le parole che un dodicenne non usa.

| Storia | Prima | Dopo |
|---|---|---|
| Irene | Preparare una postazione accessibile dentro il gruppo | Preparare un posto dove Irene arriva, dentro il gruppo |
| Irene | Un gioco da adattare | Un gioco che tutti possono fare |
| Irene | …con ruoli e strumenti adattabili. | …con ruoli e strumenti che si possono cambiare. |
| Irene | Adattiamo strumenti e regole con chi gioca. | Cambiamo strumenti e regole insieme a chi gioca. |
| Irene | Laboratorio accessibile | Laboratorio per tutti |
| Irene | Un'attività di gruppo adattabile | Un'attività di gruppo che si può cambiare |
| Irene | Hai adattato spazi e aiuti alle scelte di Irene. | Hai cambiato spazi e aiuti seguendo le scelte di Irene. |
| Sara | Chiedere un incontro con un mediatore | Chiedere l'aiuto di un mediatore, che traduce e spiega |
| Sara | Hai adattato parole e immagini per chi arriva per la prima volta. | Hai scelto parole e immagini per chi arriva per la prima volta. |
| Tommaso | …che lo ascolti, senza dargli etichette. | …che lo ascolti, senza giudicarlo. |
| Tommaso | Organizzare un incontro riservato con un adulto | Organizzare un incontro in privato con un adulto |
| Tommaso | Rivede insulti ed etichette. | Toglie gli insulti e le parole che giudicano. |
| Tommaso | Un incontro sulle parole e le etichette | Un incontro sulle parole che giudicano |
| Tommaso | Permettere una richiesta riservata | Permettere di chiedere aiuto in privato |
| Tommaso | …in modo riservato / un momento riservato | …in privato / un momento in privato |
| Nico | Osservi come scelgono di esprimersi. | Osservi come scelgono di dire che cosa provano. |
| Nico | …un modo di ascoltare adatto a un bambino… | …un modo di ascoltare giusto per un bambino… |
| Nico | …delle carte per esprimersi giocando. | …delle carte per dire che cosa si prova. |

Luca e Rosa: nessuna modifica. Non ho riscritto la trama né i personaggi (PROGETTO 8.3).

«Sostegni», «adattare l'aiuto» e «accesso» ora si leggono così: «aiuti» (non «sostegni»), «Cambia l'aiuto», «Fai partecipare tutti».

## Passaggio da amico a operatore

Dopo il secondo passo, uno schermo intero. Ogni storia mantiene la sua frase di passaggio (campo `handoff`, per esempio per Luca: «Fin qui hai ascoltato Luca da vicino. Per aiutarlo davvero serve chi lo fa di mestiere. Prova tu il lavoro dell'educatrice del centro giovani.»). Si aggiunge, uguale per tutte:

- Titolo: «Ora cambi ruolo» · occhiello «Da amico a professionista».
- **«Aiutare le persone è un mestiere che si impara. In SSAS cominci a scuola: impari a osservare i bisogni, comunicare e progettare attività.»**

Fonte della seconda frase: `indirizzi.html` riga 271 («Impari a osservare i bisogni, comunicare e progettare attività che favoriscono benessere, autonomia e partecipazione») e `data/indirizzi.json`, SSAS, «learn». Il legame «mestiere che si impara a scuola» è una **mia interpretazione**: le fonti dicono che il diploma non dà da solo qualifiche come OSS o infermiere, e per questo la riga a fondo apertura lo ricorda.

## Una frase «In SSAS…» per ogni passo

Compare in testa all'ultimo schermo di ogni passo (`SSAS_LEGAMI`).

| Passo | Frase | Fonte |
|---|---|---|
| 1 | In SSAS impari a osservare i bisogni delle persone. | `indirizzi.html` r. 271; `indirizzi.json` lenti «persone» («Osservare bisogni, relazioni e contesti di vita») e «dati» |
| 2 | In SSAS impari ad ascoltare e a comunicare in modo chiaro. | `indirizzi.json` lente «comunicazione» («Ascoltare e comunicare in modo comprensibile»); `indirizzi.html` «Competenze in azione: ascolto, … comunicazione» |
| 3 | In SSAS impari a cambiare aiuti e ambienti per tutti. | `indirizzi.json` lente «progetto» («Adattare attività e ambienti per favorire la partecipazione») |
| 4 | In SSAS impari a progettare attività per il benessere. | `indirizzi.html` r. 271 («progettare attività che favoriscono benessere, autonomia e partecipazione») |
| 5 | In SSAS impari a organizzare attività e a lavorare in gruppo. | `indirizzi.json` lente «organizzazione» («Progettare attività e collaborare con altre figure»); `indirizzi.html` «lavoro di gruppo» |

Interpretazione mia: l'abbinamento di ciascuna competenza a un passo preciso (le fonti elencano le competenze, non dicono in quale prova si esercitano). «Per il benessere» e «in gruppo» sono parole delle fonti accorciate.

## Finale: «In questo indirizzo fai tre cose» (`TRE_COSE`)

| N. | Testo | Fonte |
|---|---|---|
| 1 | Osservi i bisogni delle persone e le ascolti. | `indirizzi.json` lenti «persone», «comunicazione»; `indirizzi.html` r. 271 |
| 2 | Cambi aiuti e ambienti, perché tutti possano partecipare. | `indirizzi.json` lente «progetto» |
| 3 | Progetti attività e lavori con altri professionisti. | `indirizzi.json` lente «organizzazione» («collaborare con altre figure»); `indirizzi.html` r. 271 |

Interpretazione mia: «professionisti» al posto di «altre figure», e l'unione di due lenti nella prima voce.
Nessuna promessa di qualifica o di lavoro: coerente con `indirizzi.json`, «destination» («Il diploma non attribuisce automaticamente qualifiche come OSS, infermiere…»).

## Altri testi della pagina

| Dove | Prima | Dopo |
|---|---|---|
| Apertura, frase | Scegli una storia e prova a capire, ascoltare e aiutare una persona, in cinque passi. | Scegli una storia e aiuta una persona in cinque passi. |
| Apertura, pulsante con lavoro iniziato | Rivedi il tuo percorso / Riprendi | Vai al finale / Riprendi |
| Apertura, frase con lavoro iniziato | Hai concluso la storia di X. Puoi rivedere il tuo riepilogo. | Hai finito la storia di X. Puoi riprendere dal finale. |
| Menu | Situazioni e personaggi immaginari. | Storie e persone sono inventate. |
| Collegamento in alto | ← Indirizzi | ← Prova gli indirizzi |
| Finestra attestato dentro la pagina | `#certificateDialog` | Tolta: l'attestato si scarica dal finale comune |

## Durata (una storia, Luca, telefono)

Misura: parole leggibili sullo schermo (esclusi pulsanti, barra di avanzamento, testo nascosto) divise per 120 al minuto, più 4 secondi per scelta. Strumento: `percorso.py` (non nel repository).

- 16 schermi del percorso (apertura 43, ingresso 15, storie 65, cinque passi con le loro schermate, passaggio) + 4 del finale comune: 895 parole → 448 s.
- 21 scelte e azioni (storia, nome, ogni scelta, ogni Avanti nel finale) → 84 s.
- Totale 532 s, cioè **circa 8,9 minuti**. Con la storia di Rosa, 8,5. **Oltre i 5-7 minuti richiesti.** Per rientrare servirebbe togliere circa 250 parole, cioè le frasi di raccordo dei sotto-passi: non l'ho fatto per non riscrivere la trama.
