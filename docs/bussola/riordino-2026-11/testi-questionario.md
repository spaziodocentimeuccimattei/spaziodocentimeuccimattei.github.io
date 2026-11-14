# Testi del questionario e del risultato — prima → dopo (agente A2, 14/11/2026)

Id delle domande e delle risposte, pesi (`weights`), `courseLinks` con le loro ragioni, `text`, `detail` e ordine sono invariati in `data/bussola.json`. Cambiano solo alcuni titoli brevi (`label`, che non entra nei calcoli) ed è stato aggiunto il campo nuovo `icona` (un'emoji per risposta; chi non lo legge lo ignora).

Nelle domande il ragazzo vede ora: il titolo della situazione (etichetta), la domanda, le cinque risposte con icona e titolo breve. Non vede più la frase introduttiva (`scenario`) né la frase lunga della risposta (`detail`): restano nei dati.

## Titoli brevi delle risposte cambiati

| Risposta | Prima | Dopo |
|---|---|---|
| `imparare-1` | Capire e ascoltare | Ascoltare le persone |
| `imparare-5` | Il tuo paese da vicino | I servizi del tuo paese |
| `visita-interessi-4` | Confrontare costi e possibilità | Prezzi, tempi e trasporti |
| `computer-1` | Dare ordine ai dati | Mettere in ordine i dati |
| `computer-2` | Capire i passaggi di un programma | Come lavora un programma |
| `libro-2` | Un edificio spiegato dal disegno | Il disegno di un edificio |
| `futuro-2` | Niente sprechi | Soldi e tempo senza sprechi |
| `predisposizioni-1` | Ragionare con ordine | Confrontare spese e vantaggi |
| `predisposizioni-2` | Provare e capire l’errore | Trovare l’errore al computer |
| `predisposizioni-3` | Trovare le parole | Raccontare in un’altra lingua |
| `predisposizioni-4` | Accorgermi delle persone | Accorgermi di chi resta fuori |
| `predisposizioni-5` | Pensare per immagini | Fare uno schizzo con le misure |
| `sogni-1` | Far nascere un’idea | Avviare una piccola attività |
| `sogni-3` | Incontrare il mondo | Accogliere chi viene da lontano |
| `sogni-4` | Far sentire qualcuno parte del gruppo | Aiutare chi è in difficoltà |
| `aspirazioni-1` | Decidere con i conti in mano | Gestire conti e costi |
| `aspirazioni-2` | Passare dall’idea al programma | Creare un programma che funziona |

Gli altri 43 titoli brevi sono invariati.

## Apertura (`bussola.html`)

| Prima | Dopo |
|---|---|
| Barra «Le tue curiosità · Gli indirizzi da approfondire · La scelta di un’attività» | tolta (non accendeva mai la terza tappa) |
| «Dalla terza media alle superiori» / «La tua Bussola» | «La tua **Bussola**» |
| «Alla fine dell’attività potrai guardare il video del corso e quelli degli altri indirizzi.» | tolta (la promessa non era vera) |
| «Dodici domande su ciò che ti incuriosisce, su come ti piace lavorare e su ciò che vorresti imparare. Alla fine trovi gli indirizzi da cui partire, con le ragioni.» | «Dodici domande su ciò che ti piace. Alla fine, un indirizzo da provare.» |
| Pulsante «Inizia la Bussola» | «Inizia» |
| Argomenti, «12 domande · Al tuo ritmo · 5 indirizzi», «Non ci sono risposte giuste…» | tolti |
| «Salta e vai alle attività →» | «Vai subito alle attività» (link piccolo) |
| — | «Ho un codice» (link piccolo, segnaposto per A3) |
| «Date degli Open Day ↓» | «Video e Open Day ↓» (video e Open Day scendono sotto il primo schermo) |
| «Video di un minuto, senza audio. Una volta avviato riparte da solo.» | «Un minuto, senza audio.» |
| «Le risposte si salvano mentre procedi. Nell’area docenti possono consultarle solo le persone autorizzate.» | «Le risposte si salvano mentre procedi. Le vedono solo i docenti autorizzati.» (in fondo, sotto l'Open Day) |
| Foto dello spazio condiviso | tolta dall'apertura |
| «La tua Bussola è salvata» / «Riprendi la Bussola» / «Inizia una nuova Bussola» / «Iniziare una nuova Bussola cancella le risposte precedenti del questionario.» | «La tua Bussola è salvata» / «Riprendi da dove eri rimasto.» / «Riprendi» / «Inizia una nuova» / «Una nuova Bussola cancella queste risposte.» |
| «Il tuo risultato è pronto» / «Rivedi il risultato» | invariati, con la frase «Puoi rivederlo o ricominciare.» |

## Domande

| Prima | Dopo |
|---|---|
| «Domanda 3 di 12» con «Ricomincia» accanto | «3 di 12» con barra; «Ricomincia» in fondo, piccolo |
| Area + titolo + scenario + domanda | titolo della situazione (etichetta lime) + domanda come titolo |
| «Indietro» · «Non lo so ancora» · «Continua» / «Vedi il risultato» | «Indietro» · «Avanti» (sempre «Avanti»); sotto, piccoli, «Non lo so» e «Ricomincia» |

## Risultato

| Prima | Dopo |
|---|---|
| «Il tuo punto di partenza» / «Da dove potresti partire» | «Il tuo indirizzo» oppure «I tuoi indirizzi» |
| Frase di esito, «Hai risposto a N domande su 12», avvertenza «È un punto di partenza, non un voto…» | tolte |
| Schede con «Che cosa ti collega», «Materie da conoscere», «Prova X», «Materie e percorso di studio», «Crea il tuo attestato» | per ogni indirizzo: sigla grande, nome intero, illustrazione nel disco, «Prova», «Perché?» |
| «Confronta anche gli altri indirizzi», «Le curiosità che ritornano…», «Rileggi tutte le tue scelte», «Ora scegli un’attività…», «Tutte le attività», «Rivedi le domande», pannello contatti con cinque pulsanti e «Lascia il dispositivo al prossimo studente» | tolti; restano in fondo, piccoli, «Vedi gli altri indirizzi» e «Ricomincia» |
| Meno di 4 risposte: «Le risposte sono ancora poche per indicare un punto di partenza…» | «Servono più risposte» / «Con meno di quattro risposte la Bussola non sceglie. Prova gli indirizzi!» / «Vedi gli indirizzi»; piccoli «Rispondi alle domande», «Ricomincia» |
| Interessi sparsi: «Le tue scelte toccano interessi diversi e nessun indirizzo ritorna più degli altri…» | «Ti piacciono tante cose» / «Nessun indirizzo vince sugli altri. Provali e scopri quale ti piace.» / «Vedi gli indirizzi» |

## «Perché?» (nuovo)

Titolo «Perché AFM?»; frase «Hai risposto a queste. Tocca una risposta accesa.»; tessere accese (risposte con un collegamento all'indirizzo, peso 2 o 1); toccandone una compare la ragione già presente nei dati (`courseLinks.<corso>.reason`); poi «Meno a queste» con le tessere spente (le risposte saltate si leggono «Non lo so»). Pulsanti «Indietro» e «Prova». Con più indirizzi, in alto un tasto per ciascuno.

## Catalogo (`missioni.html`)

| Prima | Dopo |
|---|---|
| Barra «1. Scegli l’indirizzo · 2. Segui i cinque laboratori · 3. Riguarda il tuo lavoro» | tolta |
| «Orientamento per la terza media» / «Prova gli indirizzi» + tre frasi | «Prova un **indirizzo**» / «Scegline uno. Puoi provarli tutti.» |
| Schede con sigla, titolo, nome, descrizione lunga, «Prova X» | sigla, nome intero (non ripetuto per Turismo), una riga, «Prova» |
| Descrizioni: «Idee e impresa, organizzazione…», «Processi, dati…», «Territorio, lingue…», «Sei storie per provare ascolto…», «Pilota un drone virtuale…» | tolte; restano le righe «Dai forma a un’idea d’impresa», «Progetta una soluzione digitale», «Crea una proposta turistica», «Ascolta una persona e progetta l’aiuto»; CAT: «CAT 4+2 · Missione Aurora» → «Missione Aurora: un drone e un edificio» |
| «Vuoi tornare alla Bussola?» con frase e due pulsanti; «Contatti e informazioni per l’orientamento» | solo il link piccolo «Torna alla Bussola» |
