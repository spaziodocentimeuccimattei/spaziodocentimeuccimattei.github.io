# Testi Turismo: prima e dopo (riordino novembre 2026, agente A7)

File: `bussola-turismo.html`, `turismo.mjs`, `turismo.css`, `turismo-core.mjs` (logica), `turismo-remote.mjs`.
Regola usata: una scelta per schermo (un titolo, una frase, un'azione), frasi di al massimo 15 parole, nessun avviso per adulti a schermo
(resta una riga nel piè di pagina). I testi dei dati (core) non sono cambiati: monitor, attestato e riepilogo li leggono per posizione.
Le etichette mostrate al ragazzo stanno in mappe separate (`*_UI`) dentro `turismo.mjs`.

## Struttura

| Prima | Dopo |
|---|---|
| Finestra d'ingresso «Come vuoi iniziare?» | Ingresso comune «Come ti chiami?» (`mostraIngresso`) |
| Cinque laboratori con menu a tendina e testi lunghi | Dieci schermi, uno per scelta, con Avanti, Indietro e barra di avanzamento |
| Blocco finale con video, contatti e attestato in pagina | Finale comune di quattro schermi (`mostraFinale`) |
| Domanda «Che cosa ti ha incuriosito?» obbligatoria | Tolta dalla schermata; il lavoro si conclude senza interessi |
| Titolo «Come nasce una proposta turistica?» | Apertura «Crea una visita da ricordare.» con l'anteprima di quello che si costruisce |

## Schermi (titolo, frase, scelte mostrate)

| N. | Titolo | Frase | Scelte |
|---|---|---|---|
| 1 | Che luogo fai scoprire? | Scegli un posto di Cala delle Trame. | La bottega, Il museo, La laguna |
| 2 | Che storia racconti? | Scegli il punto di partenza. | tre angoli per luogo (frasi brevi in `ANGOLO_UI`) |
| 3 | Che cosa chiedi a Sam e Jo? | Vogliono visitare (il luogo scelto). | Volete guardare o creare? / Quanto tempo avete? / Che cosa vi incuriosisce? |
| 4 | Come rispondi a Sam e Jo? | (il bisogno dei visitatori) | tre risposte; l'inglese compare solo nel fumetto e nel foglio |
| 5 | Che cosa fa il gruppo? | 12 ragazzi, 90 minuti, nessun gradino. | tre programmi |
| 6 | Piove: che cosa cambi? | La laguna è chiusa. | tre alternative |
| 7 | Che cosa aggiungi alla visita? | Guarda il prezzo a persona. | tre servizi, con costo |
| 8 | Che cosa dici se piove? | Chi prenota deve saperlo prima. | Alternativa al coperto confermata / Nuova data concordata / Annullamento con rimborso |
| 9 | Come inviti i visitatori? | Scegli la voce dell’invito. | quattro toni |
| 10 | Controlla la bozza dell’IA. | L’IA ha scritto l’invito: due promesse sono sbagliate. | «Correggi con i dati dell’offerta» |

Prima, gli stessi punti avevano titoli come «Una conversazione aperta», «Un’offerta trasparente», «Dal servizio all’offerta»
e paragrafi di spiegazione sopra e sotto le scelte. Quei paragrafi sono stati tolti.

## Scelte non più mostrate (restano nel formato salvato)

- `interests` (interessi): non è più chiesto. Resta nei dati e nel formato, vuoto per i lavori nuovi.
- `people` (partecipanti, di norma 12) e il controllo «Cambia partecipanti +/-»: non mostrato, vale 12.
- `storyTitle` e `posterTitle` (titoli liberi della storia e dell'invito): non chiesti; si usa il titolo proposto.
- Nell'ultima schermata la correzione è un solo pulsante (`repair`), non più una scelta per ciascuna promessa.

## Una frase «In Turismo…» per laboratorio, con la fonte

| Laboratorio | Frase | Fonte |
|---|---|---|
| 1 Racconta un luogo | In Turismo impari a valorizzare i luoghi. | `data/indirizzi.json`, lente «territorio»: «Conoscere e valorizzare luoghi e patrimonio» |
| 2 Accogli due visitatori | In Turismo usi le lingue per incontrare culture diverse. | lente «comunicazione»: «Usare lingue e linguaggi per incontrare culture diverse» |
| 3 Progetta la visita | In Turismo impari a organizzare tappe e tempi. | lente «organizzazione»: «Organizzare tappe, tempi e servizi» |
| 4 Fai il prezzo | In Turismo impari a confrontare costi e risorse. | lente «risorse»: «Confrontare costi e risorse di un’esperienza» |
| 5 Scrivi l'invito | In Turismo impari a comunicare e verificare le informazioni. | lenti «comunicazione» e «dati». **Il legame con il controllo della bozza dell'IA è una mia interpretazione.** |

## Le tre cose del finale («In questo indirizzo fai tre cose»)

1. Fai conoscere un luogo e il suo patrimonio. Fonte: `indirizzi.html`, intento del corso e lente «territorio».
2. Organizzi un’esperienza e ne confronti i costi. Fonte: `indirizzi.html`, lenti «organizzazione» e «risorse».
3. Parli con persone di culture diverse, anche in inglese. Fonte: lente «comunicazione» e Canovaccio con «inglese con traduzione» in `turismo-fonti.md`. **«Anche in inglese» è una mia interpretazione del Canovaccio.**

## Durata (parole su schermo ÷ 120 al minuto + 4 secondi per scelta)

Misura fatta in Chrome sul testo realmente visibile (`inner_text` dopo la scelta), 18 scelte tra ingresso e finale.
Parole per schermo: apertura 29, ingresso 23, schermi 1-10: 29, 39, 55, 60, 39, 46, 51, 42, 38, 45; finale 39 + 38 + 18 + 82.

- Totale: 673 parole = 336 s, più 18 scelte = 72 s, cioè 408 s, circa 6,8 minuti (obiettivo 5-7).
- Parte Turismo (apertura più dieci schermi, 473 parole, 14 scelte): 236 s + 56 s, circa 4,9 minuti, cioè sopra i 4,5 minuti indicati. È una stima, non una prova con ragazzi.
