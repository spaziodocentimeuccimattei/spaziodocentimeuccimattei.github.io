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
- **«Aiutare è un mestiere che si impara. In SSAS lo impari a scuola: osservi, ascolti e progetti attività.»**

Fonte della seconda frase: `indirizzi.html` riga 271 («Impari a osservare i bisogni, comunicare e progettare attività che favoriscono benessere, autonomia e partecipazione») e `data/indirizzi.json`, SSAS, «learn». Il legame «mestiere che si impara a scuola» è una **mia interpretazione**: le fonti dicono che il diploma non dà da solo qualifiche come OSS o infermiere, e per questo la riga a fondo apertura lo ricorda.

## Una frase «In SSAS…» per ogni passo

Compare in testa all'ultimo schermo di ogni passo (`SSAS_LEGAMI`).

| Passo | Frase | Fonte |
|---|---|---|
| 1 | In SSAS osservi i bisogni delle persone. | `indirizzi.html` r. 271; `indirizzi.json` lenti «persone» («Osservare bisogni, relazioni e contesti di vita») e «dati» |
| 2 | (non mostrata: subito dopo parla il passaggio «Ora cambi ruolo») In SSAS ascolti e comunichi con chiarezza. | `indirizzi.json` lente «comunicazione» («Ascoltare e comunicare in modo comprensibile»); `indirizzi.html` «Competenze in azione: ascolto, … comunicazione» |
| 3 | In SSAS cambi aiuti e ambienti. | `indirizzi.json` lente «progetto» («Adattare attività e ambienti per favorire la partecipazione») |
| 4 | In SSAS progetti attività per il benessere. | `indirizzi.html` r. 271 («progettare attività che favoriscono benessere, autonomia e partecipazione») |
| 5 | In SSAS organizzi attività in gruppo. | `indirizzi.json` lente «organizzazione» («Progettare attività e collaborare con altre figure»); `indirizzi.html` «lavoro di gruppo» |

Interpretazione mia: l'abbinamento di ciascuna competenza a un passo preciso (le fonti elencano le competenze, non dicono in quale prova si esercitano). «Per il benessere» e «in gruppo» sono parole delle fonti accorciate.

## Finale: «In questo indirizzo fai tre cose» (`TRE_COSE`)

| N. | Testo | Fonte |
|---|---|---|
| 1 | Osservi i bisogni e ascolti. | `indirizzi.json` lenti «persone», «comunicazione»; `indirizzi.html` r. 271 |
| 2 | Cambi aiuti e ambienti per tutti. | `indirizzi.json` lente «progetto» |
| 3 | Progetti attività con altri professionisti. | `indirizzi.json` lente «organizzazione» («collaborare con altre figure»); `indirizzi.html` r. 271 |

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

## Durata

Misura: parole leggibili sullo schermo (esclusi pulsanti, barra di avanzamento, testo nascosto) divise per 120 al minuto, più 4 secondi per scelta (21 scelte e azioni per storia → 84 s). Strumento: `percorso.py` (non nel repository), telefono 390×844, scelta automatica della prima opzione.

### Misura precedente (agente A8, prima della pulizia comune)

Luca: 895 parole → 448 s + 84 s = 532 s, circa 8,9 minuti. Con Rosa 8,5. L'agente A8 non aveva toccato i raccordi per non riscrivere la trama.

### Dopo la pulizia comune (agente A10)

Tagliate solo ripetizioni e frasi di passaggio. Non sono cambiati trama, personaggi, scelte, identificativi né i testi delle scelte (alcuni sono salvati come testo: non si toccano).

| Storia | Parole prima | Parole dopo | Tolte (di cui finale comune) | Minuti prima | Minuti dopo |
|---|---|---|---|---|---|
| Luca | 895 | 796 | 99 (34) | 8,9 | 8,0 |
| Irene | 879 | 782 | 97 (34) | 8,7 | 7,9 |
| Sara | 845 | 753 | 92 (34) | 8,4 | 7,7 |
| Rosa | 852 | 755 | 97 (34) | 8,5 | 7,7 |
| Tommaso | 862 | 770 | 92 (34) | 8,6 | 7,8 |
| Nico | 857 | 777 | 80 (34) | 8,5 | 7,9 |

Le «parole prima» sono state rimisurate dal ramo precedente con lo stesso strumento (Luca coincide con le 895 di A8). Il finale comune perde 34 parole perché il quarto schermo è stato ridotto (vedi `bussola-finale-comune.mjs`).

**Non si arriva a 7 minuti.** Restano 7,7-8,0 minuti. Per scendere sotto 7 servirebbero altre 100-130 parole, e quelle che restano sono contenuto: le due frasi tra cui il ragazzo sceglie a ogni passo, le battute dei personaggi, le righe «✓» che spiegano che cosa fa ogni scelta e le cinque frasi «In SSAS impari…». Va deciso se toglierle o accorciarle, oppure se accettare circa otto minuti per SSAS.

### Che cosa è stato tolto o accorciato

Nei testi (`ssas-situazioni-revisione.mjs`), per tutte e sei le storie:

| Dove | Prima (Luca) | Dopo (Luca) |
|---|---|---|
| Passaggio da amico a operatore | Fin qui hai ascoltato Luca da vicino. Per aiutarlo davvero serve chi lo fa di mestiere. Prova tu il lavoro dell’educatrice del centro giovani. | Fin qui hai ascoltato Luca. Ora prova il lavoro dell’educatrice del centro giovani. |
| Passo 1, frase di apertura | Luca è un tuo compagno di squadra. Da qualche settimana ti sembra stanco e spesso non viene agli allenamenti. | Luca, tuo compagno di squadra, è stanco e salta gli allenamenti da settimane. |
| Passo 2, frase di apertura | Dopo l’allenamento restate soli. Vuoi capire che cosa gli succede, senza farlo sentire sotto esame. | Dopo l’allenamento restate soli. Vuoi capire, senza metterlo sotto esame. |
| Passo 3, frase di apertura | Adesso fai il lavoro dell’educatrice del centro giovani che Luca frequenta. Luca vuole tornare agli allenamenti: lo aiuti a organizzarsi. | Sei l’educatrice del centro giovani che Luca frequenta. |
| Passo 2, secondo sotto-passo | Luca ti ha risposto. Ora vuoi capire meglio com’è fatta una sua giornata. | Ora vuoi capire meglio com’è fatta una sua giornata. |
| Passo 5, ostacolo | Al centro si chiede di partecipare davanti agli altri ragazzi. Luca preferirebbe parlare con l’educatrice in privato. | Al centro si partecipa davanti agli altri. Luca preferirebbe parlare in privato. |

Le altre cinque storie hanno la stessa riduzione (passaggio, aperture dei passi 1, 2 e 3, frase del secondo sotto-passo); i testi nuovi sono nel file. Nico: resta il nome di Lia nella frase del passo 3.

Nella schermata (`ssas-situazioni.mjs`):

| Dove | Prima | Dopo |
|---|---|---|
| Titolo del passo sopra la barra | «2 di 5 · Ascolti e fai le domande giuste» su ogni schermata | Una volta sola, sulla prima schermata del passo; nelle altre resta per il lettore di schermo |
| Schermo «Scegli una storia» | Riga «Ti accompagna in tutti e cinque i passi.» | Tolta |
| Passo 1 | Riga «Tu sei in squadra con lui.» (ripeteva la frase di apertura) | Tolta (il dato `role` resta nel file) |
| Nome sopra le battute | «Luca, 14 anni» | «Luca» (l’età sta già nella scelta della storia) |
| Collegamento in alto | ← Prova gli indirizzi | ← Indirizzi (il nome accessibile resta «Torna a Prova gli indirizzi»); aggiornato il controllo `verifica-bussola-percorsi.mjs` |
| Menu in alto | Menu proprio di SSAS | Invariato (è il modello copiato dalle altre quattro prove) |

Copie per la gestione: `supabase/functions/bussola-gestione/ssas-situazioni-revisione.mjs` rigenerata identica (senza deploy).

## Correzioni prima della pubblicazione (agente A12, 15 novembre 2026)

Il verificatore indipendente aveva misurato 9,0-9,2 minuti. Stesso metodo (parole davvero visibili nel `main` ÷ 120 al minuto + 4 secondi a scelta, finale e «Come ti chiami?» compresi; telefono 390×844). Trama, personaggi, scelte, identificativi e testi salvati (risposte, esempi, frasi dell'attestato e del riepilogo) non sono cambiati.

### Durata dopo le correzioni

| Storia | Parole | Scelte | Secondi | Minuti |
|---|---|---|---|---|
| Luca | 659 | 21 | 414 | 6,9 |
| Irene | 664 | 21 | 416 | 6,9 |
| Sara | 637 | 21 | 402 | 6,7 |
| Rosa | 648 | 21 | 408 | 6,8 |
| Tommaso | 660 | 21 | 414 | 6,9 |
| Nico | 654 | 21 | 411 | 6,8 |

Con Irene e Nico anche su 1366×768: 6,9 e 6,8 minuti (stesse parole). I margini sono stretti (2-18 secondi): ogni parola in più rimette a rischio i 7 minuti.

### Che cosa è stato tolto o accorciato

Nella schermata (`ssas-situazioni.mjs`), per tutte le storie:

| Dove | Prima | Dopo |
|---|---|---|
| Note sotto le scelte dei passi 3, 4 e 5 (campo `detail`) | Una riga di spiegazione dopo ogni scelta (7-10 parole) | Non si mostra più; il campo resta nei dati |
| Passo 2, domanda «Come continui ad ascoltare…»: battuta del personaggio | Mostrata | Non si mostra (resta quella del primo sotto-passo) |
| Frase che riprendeva quanto appena letto o scelto (passo 2 «Che cosa proponi», passo 4 «Che cosa prepari?», passo 5 «Che cosa controlli dopo?») | Ripeteva la battuta o la scelta precedente | Tolta |
| Frase di contesto prima di «Che cosa chiedi a…?», «Come continui…», «Quali aiuti prepari?» | Una frase di 8-14 parole | Tolta |
| Titolo accanto a «N di 5» | «2 di 5 · Ascolti e fai le domande giuste» | «2 di 5» |
| Frase «In SSAS…» del passo 2 | Mostrata | Non mostrata (subito dopo c'è il passaggio «Ora cambi ruolo»); le altre quattro restano, senza la parola «SSAS» ripetuta in grassetto |
| Bozza dell'IA, riquadro «Un ragazzo legge il tuo messaggio» | Contesto di 9 parole, domanda e nota | Etichetta «Chi legge» e solo la domanda |
| Apertura | «Storie e persone sono inventate. Il diploma non dà da solo qualifiche come OSS o infermiere.» | Tolte entrambe (la prima resta nel menu) |
| «IA» | «Bozza scritta con l'IA» | «Bozza dell'intelligenza artificiale» |

Nei testi (`ssas-situazioni-revisione.mjs`): frasi-gancio delle sei storie a 4-6 parole («Luca: Gioca online, salta il basket»; Irene: «Non arriva al tavolo»; Sara: «Non capisce le istruzioni»; Rosa: «Non riesce a prenotare»; Tommaso: «Lo prendono in giro»; Nico: «Perde e lascia il gioco»); frase del passaggio «Hai ascoltato X. Ora fai l'educatrice/l'operatrice…»; frasi di apertura dei passi 1, 4 e 5 più brevi; qualche battuta più corta (Luca, Irene, Sara). Copia per la gestione: `supabase/functions/bussola-gestione/ssas-situazioni-revisione.mjs` rigenerata togliendo i `?v=` (senza deploy).

### Altri cambiamenti di questa correzione

- La barra in alto è un indicatore non cliccabile (`<progress class="bt-avanzamento">`), come nelle altre quattro prove; prima erano cinque pulsanti alti 28 px.
- Ricaricando su «Ora cambi ruolo» lo schermo resta quello (indirizzo `#passaggio-3`).
- «Inizia da capo» (apertura) e «Riprendere o iniziare un altro lavoro» (menu): nessuna finestra di conferma, come nelle altre quattro prove; il lavoro di prima resta conservato nel dispositivo.
- Comandi per schermo: 5-6 nei passi; 8 solo nella scelta della storia (sei storie più Indietro e Avanti) e 7 nel quarto schermo del finale (comune a tutte le prove).
