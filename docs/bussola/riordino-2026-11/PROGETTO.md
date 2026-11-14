# Riordino della Bussola — progetto unico (14 novembre 2026)

Questo documento è l'unica consegna per tutti gli agenti. Raccoglie le decisioni prese da Salvatore Picconi (Commissione Orientamento, IIS Meucci - Mattei, sede di Decimomannu) nella sessione del 14/11/2026. Ogni agente legge TUTTO il documento, poi esegue solo la propria sezione del capitolo 6.

## 1. Che cosa stiamo sistemando

Il percorso completo di un ragazzo di terza media (12-13 anni):

`bussola.html` (apertura) → 12 domande → risultato → prova di un indirizzo (`bussola-afm.html`, `bussola-sia.html`, `bussola-turismo.html`, `bussola-ssas.html`, `bussola-cat.html`; catalogo in `missioni.html`) → finale della prova con attestato.

Sigle: AFM = Amministrazione, Finanza e Marketing; SIA = Sistemi Informativi Aziendali; SSAS = Servizi per la Sanità e l'Assistenza Sociale; CAT = Costruzioni, Ambiente e Territorio.

## 2. Obiettivo

In 5-7 minuti per prova il ragazzo gioca, capisce **che cosa si fa in quell'indirizzo** e si ricorda dell'esperienza. Deve funzionare identico allo stand su Chromebook condivisi, in classe e a casa dal telefono. La sensazione è quella di un videogioco. È orientamento: non si deve disorientare. Il problema numero uno segnalato da Salvatore è il rumore: troppo testo, troppi pulsanti, grafica opaca.

## 3. Che cosa dicono i dati (test del 12/11/2026 a Elmas)

Fonte: `report-bussola-2026-11-12.md` su Drive (registro Supabase, dati anonimi).

- 89 Bussole concluse, ma solo 37 prove di indirizzo aperte e 29 concluse (prove sottostimate per un difetto poi corretto).
- 25 risultati su 87 suggerivano due o tre indirizzi a pari merito.
- AFM 9 concluse su 9; SSAS 10 su 12; SIA 4 su 7 con abbandoni alla tappa 2 e 3; CAT 4 su 6 con due aperte e lasciate a zero; Turismo 2 su 3, una bloccata perché senza la scelta finale «Che cosa ti ha incuriosito?» l'attestato non si sblocca.
- 4 prove su 8 non concluse sono state aperte e chiuse subito.

Criticità lette nel codice: la pagina del risultato ha più di venti comandi; ci sono due attestati (uno inutile dopo le domande); la barra a tre tappe di `bussola.html` non accende mai la terza; l'apertura promette un video «alla fine dell'attività» che dopo le domande non c'è; i pulsanti nominano la tappa successiva («Passa all'organizzazione») invece dell'azione; il legame fra attività e indirizzo è una riga piccola «Materie coinvolte»; ci sono avvertenze scritte per adulti.

## 4. Regole comuni (valgono per ogni schermo)

1. **Uno schermo = un titolo, una frase, un'azione principale.** Una scelta per schermo. Tutto il resto va dietro un tocco o sparisce.
2. **Pulsanti**: «Avanti» e «Indietro» (o un verbo d'azione di una parola). Mai il nome della tappa successiva.
3. **Parole per un dodicenne**: frasi di massimo 15 parole, un solo ordine per frase, niente codici (R02, T1), niente lessico da manuale. Una parola tecnica si può usare solo se è il cuore dell'indirizzo, spiegata in cinque parole la prima volta. Via le avvertenze per adulti («modello semplificato», «non è l'utile finale», «non una diagnosi automatica»): se serve una nota, una sola riga discreta nel piè di pagina della prova.
4. **Storie e ambientazioni restano quelle attuali.** Non si reinventano clienti, personaggi o casi. Si riduce e si riscrive il testo, non la trama.
5. **Scopo di ogni prova**: far capire che cosa si fa in quell'indirizzo. In ogni laboratorio una frase sola lega l'attività all'indirizzo («Nell'indirizzo AFM questo si chiama…»). Fonti dei contenuti: `docs/bussola/<corso>-fonti.md`, `indirizzi.html`, `data/indirizzi.json`. **Non inventare** materie, laboratori, sbocchi o promesse.
6. **Grafica lucida e vivace**: un colore pieno e brillante per ciascun indirizzo; pulsanti colorati con volume e riflesso; animazione breve a ogni scelta; momenti «esplosivi» sul risultato e sull'attestato. Contrasto del testo almeno 4,5:1 (meglio 7:1). Bersagli di tocco almeno 44 px. Rispettare `prefers-reduced-motion`.
7. **Gioco**: barra di avanzamento, effetto visivo a ogni scelta, distintivo dell'indirizzo a fine prova. **Nessun punteggio su risposte giuste o sbagliate**: i premi vanno al completamento.
8. **Suoni**: spenti all'avvio, con un tasto per accenderli (solo se l'agente della base grafica li realizza; non sono obbligatori).
9. **Durata**: ogni prova si conclude in 5-7 minuti leggendo tutto.
10. **Dispositivi**: telefono 390×844 e Chromebook 1366×768, senza scorrimento orizzontale.

### Riferimento grafico obbligatorio: il video della Bussola

Salvatore ha indicato come modello di «lucido» il video `assets/video/bussola-orientamento.mp4` (quello dell'apertura di `bussola.html`, usato anche come salvaschermo a scuola): «è molto bello perché risulta molto lucido». La nuova grafica deve sembrare la stessa famiglia di quel video. Che cosa si vede nei fotogrammi (estraili con `ffmpeg -ss <secondi> -i assets/video/bussola-orientamento.mp4 -frames:v 1 out.jpg`; alcuni sono già in `/home/claude/anteprime/riferimento/`):

- **Fondo scuro e profondo**, tinto del colore dell'indirizzo (blu petrolio per la Bussola generale, marrone caldo per Turismo, verde bosco per CAT, prugna per SSAS), con raggi di luce e un leggero pulviscolo.
- **Un grande disco di colore pieno e saturo** per ogni indirizzo (arancio per Turismo, verde lime per CAT, magenta per SSAS; AFM e SIA vanno letti dal video) su cui poggia una scheda illustrata chiara con angoli arrotondati e ombra.
- **Bussola 3D lucida** con riflessi, ago luminoso e alone.
- **Testo bianco, grande e in grassetto**; la parola chiave in lime.
- **Pulsante a pillola lime brillante** con testo scuro («Provala.»).
- Barretta verticale colorata accanto al titolo dell'indirizzo; fascia scura in basso con il marchio.

I colori degli indirizzi: SSAS resta il magenta attuale; gli altri quattro prendono i colori del logo della scuola (decisione di Salvatore del 14/11 sera, che sostituisce «si prendono dal video»): AFM verde scuro `#006949`, SIA turchese `#0ea7a5`, CAT verde chiaro `#85c140`, Turismo oro `#d89e18`. Lo stile lucido resta quello del video. La regola del contrasto resta valida: testo bianco su fondo scuro, testo scuro sui pulsanti lime.

## 5. Vincoli tecnici che non si toccano

- Sito statico senza framework e senza dipendenze remote nuove. Moduli `.mjs`, CSS semplice.
- **Non cambiare identificativi e contratti dei dati**: id delle 12 domande e delle risposte, pesi e `courseLinks` in `data/bussola.json`; id delle scelte dei cinque percorsi; formato dei progetti salvati; chiavi di `localStorage`/`sessionStorage`; chiamate alle funzioni Supabase `bussola-gestione` e `bussola-esperienze`. Il monitoraggio (`bussola_v2_*`) deve continuare a leggere le stesse tappe. Se ridurre le tappe romperebbe salvataggi, monitoraggio o attestato, si tengono le tappe e si alleggerisce ogni schermo.
- Restano funzionanti: ripresa del lavoro, «Inizia da capo», ingresso con codice classe e link personale, area docenti, attestato PDF.
- **Mai pubblicare.** Niente push su `main`, niente deploy di funzioni Supabase, niente migrazioni applicate, nessuna chiamata al database vero. Si lavora solo in locale sul ramo indicato.
- **Mai premere «Inizia» sul sito vero** (`spaziodocentimeuccimattei.github.io`): crea partecipanti reali. Le prove si fanno in locale (`python3 -m http.server` dalla radice) intercettando o simulando le chiamate di rete; vedere `docs/bussola/LEGGIMI.md` e `scripts/`.
- Nessun dato reale di alunni in file, log o schermate. Nelle prove usare nomi finti.
- La raccolta dell'email è dietro un interruttore spento (`EMAIL_ATTIVA = false`): si accende solo dopo l'informativa privacy e il via della Dirigente.
- Le verifiche esistenti in `scripts/verifica-*.mjs` che riguardano i file toccati vanno eseguite. Se un controllo fallisce per un cambiamento voluto, si aggiorna il controllo e lo si dichiara nel resoconto. Se falliva già prima, lo si dichiara senza nasconderlo.

## 6. Incarichi

### A1 — Base grafica comune (lavora per primo, da solo)
- Creare `bussola-tema.css`: variabili di colore (un colore vivace per indirizzo più varianti chiara e scura, colori di fondo, testo), pulsante lucido primario e secondario, scheda, barra di avanzamento, tessera, distintivo, schermo «esplosione», biglietto con codice personale e QR, tipografia grande. Tutto tramite variabili CSS, così la tavolozza si cambia in un punto solo.
- Creare `bussola-effetti.mjs`: funzioni riusabili senza dipendenze, per esempio `esplosione(elemento, corso)` (coriandoli/raggi su canvas o CSS), `premio(elemento)`, `suono(nome)` con interruttore spento all'avvio, tutte rispettose di `prefers-reduced-motion`.
- Collegare il tema a `bussola.html`, `missioni.html` e alle cinque pagine `bussola-<corso>.html`, dopo i fogli esistenti. Applicare subito il nuovo stile a pulsanti e schede esistenti senza cambiare testi né logica.
- Scrivere `docs/bussola/riordino-2026-11/TEMA.md`: elenco di classi, variabili e funzioni, con un esempio d'uso per ciascuna. Gli altri agenti useranno solo questo.
- Consegnare schermate prima/dopo di apertura, una domanda, il catalogo e l'ingresso di due prove.

### A2 — Questionario e risultato (`bussola.html`, `bussola.mjs`, `bussola.css`, `bussola-ui.mjs`, `data/bussola.json`, `missioni.html`, `missioni.mjs`)
- Apertura: un titolo, una frase, il pulsante «Inizia». Video, Open Day e spiegazioni scendono sotto o dietro un tocco. Togliere la promessa del video «alla fine dell'attività» oppure renderla vera. La barra a tre tappe o funziona su tutte e tre o si toglie.
- Domande: restano 12 con gli stessi id e pesi. Ogni risposta mostra un titolo breve (poche parole) e, se possibile, l'illustrazione; la frase lunga non serve per scegliere. Non modificare il campo usato per i calcoli.
- Risultato: primo schermo con il solo nome dell'indirizzo (fino a tre a pari merito) che «esplode», il suo colore, l'illustrazione e due tasti: «Prova» e «Perché?». Con più indirizzi, un «Prova» per ciascuno.
- «Perché?»: le 12 risposte come tessere; accese quelle che portano all'indirizzo, spente le altre («hai risposto a queste, meno a queste altre»). Toccando una tessera accesa compare la ragione breve.
- Via dal risultato: «Crea il tuo attestato», i riepiloghi aperti, il pannello contatti con i suoi pulsanti. Restano, in piccolo e in fondo: «Vedi gli altri indirizzi», «Ricomincia». I casi senza suggerimento (meno di 4 risposte, interessi sparsi) hanno uno schermo altrettanto semplice che porta al catalogo.
- Catalogo `missioni.html`: cinque schede colorate, un pulsante ciascuna, testo minimo.

### A3 — Ingresso, finale, attestato, area docenti (`bussola-classe.mjs`, `bussola-attestato-alunno*.mjs`, `bussola-prossimo-passo.mjs`, nuovi moduli comuni, finestre di dialogo nelle cinque pagine, `bussola-docenti.*`, `bussola-gestione.*`, `supabase/`)
- **Ingresso unico** `bussola-ingresso-comune.mjs`: al posto della finestra «Come vuoi iniziare?», uno schermo «Come ti chiami?» con nome e cognome obbligatori e un pulsante «Inizia». Un link piccolo «Ho un codice classe» apre il campo codice. Chi arriva con link di classe o personale non rivede lo schermo se è già riconosciuto. Il nome resta nel lavoro salvato sul dispositivo e arriva all'attestato senza richiederlo di nuovo.
- **Finale unico** `bussola-finale-comune.mjs`, quattro schermi in fila con «Avanti»:
  1. «In questo indirizzo fai tre cose»: tre voci brevi fornite da ogni percorso (parametro `treCose`).
  2. L'attestato «esplode» con il nome già inserito, pulsanti «Scarica» e «Stampa». Sotto, solo se `EMAIL_ATTIVA` è vero: campo «Email di un genitore: te lo mandiamo lì» e casella di consenso; facoltativo.
  3. Video dell'indirizzo (`presentazione-orientamento/assets/video/<corso>.mp4`), a tutto schermo con un pulsante per avviarlo.
  4. «Prova un altro indirizzo»: quattro pulsanti colorati con i distintivi già ottenuti in evidenza; sotto, più piccolo, «Guarda gli altri video» (quelli degli altri indirizzi, `indirizzi.html#video-<corso>`, e quello sulla storia della scuola, presente nella galleria video della home) e la riga con le date dell'Open Day. L'invito va detto in modo chiaro e semplice.
  Un link discreto «Rivedi il tuo lavoro» apre il riepilogo che oggi sta nel finale. La scelta «Che cosa ti ha incuriosito?» non blocca più l'attestato in nessun percorso.
- API da rispettare (gli agenti dei percorsi la useranno): `mostraIngresso({corso, contenitore, classe, onInizia(nome, cognome)})` e `mostraFinale({corso, contenitore, nome, treCose, apriAttestato, rivediLavoro})`. Documentare firma definitiva ed esempio in `docs/bussola/riordino-2026-11/INGRESSO-FINALE.md` e collegare i due moduli almeno in un percorso (AFM) come esempio funzionante.
- **Email e area docenti** (preparare, non attivare): salvataggio di nome, cognome, indirizzo provato, data, email del genitore e consenso con data e ora; nell'area docenti, per la sessione della funzione strumentale, un elenco con pulsante «Scarica» (CSV). Codice della funzione e file SQL nel repository, **non applicati**. Con `EMAIL_ATTIVA = false` nulla di tutto questo è visibile né inviato.
- **Ritorno da casa** (richiesta del 14/11, pomeriggio): nello schermo dell'attestato compaiono un **codice QR** e un **codice personale breve** da scrivere (6 caratteri leggibili, senza 0/O e 1/I, mai ricavato dal nome), con una frase sola: «A casa, con i tuoi genitori, torna qui: scarichi l'attestato e scopri di più». Il QR serve a chi ha il telefono; il codice a chi non lo ha (allo stand lo si scrive su un cartoncino). In `bussola.html` un link piccolo «Ho un codice» porta a uno schermo «Bentornato» con: scarica l'attestato, i distintivi ottenuti, «Prova un altro indirizzo», Open Day e «Come ci si iscrive» (`famiglie.html#iscrizione`). È lì, a casa con il genitore, il posto giusto per l'email e il consenso (sempre dietro `EMAIL_ATTIVA`). Realizzazione in due passi: (1) il QR apre il link personale già previsto dal sistema (`#alunno=<codice lungo>`): verificare nel codice che funzioni anche per chi è entrato senza classe e usarlo subito, senza modifiche al server; (2) il codice breve richiede una corrispondenza sul server: preparare funzione e SQL nel repository, **non applicati**, e tenerlo nascosto finché non sono attivi. Il nome non è mai una chiave di accesso (omonimi, e chiunque scaricherebbe l'attestato di un altro). Finché la privacy non è approvata, nome e cognome non vanno sul server: per il ritorno con QR possono viaggiare nella parte del link dopo `#`, che il browser non invia al server; altrimenti a casa si richiede il nome. Generare il QR nel browser, senza servizi né librerie remote.
- Allineare le etichette SSAS nella copia dei testi di `supabase/functions/bussola-gestione` (oggi sono quelle vecchie), senza deploy.

### A4-A8 — I cinque percorsi (un agente per indirizzo; ciascuno tocca solo i file del proprio corso e la propria pagina `bussola-<corso>.html`)
Per tutti: applicare le regole del capitolo 4; una scelta per schermo; pulsanti «Avanti/Indietro»; testo ridotto all'essenziale; una frase per laboratorio che lega l'attività all'indirizzo; scrivere le «tre cose» del finale; collegare ingresso e finale comuni secondo `INGRESSO-FINALE.md`; usare solo classi e funzioni di `TEMA.md`; verificare la durata di 5-7 minuti.
- **A4 SIA**: è il percorso che perde di più. Riscrivere a una scelta per schermo sul modello SSAS, partendo dalla parte più gradevole (costruire una schermata e usarla). Via codici, tendine dove si può, frasi con più ordini. Messaggio da far passare: qui si impara a costruire programmi e soluzioni digitali per aziende e servizi; SIA è l'articolazione di AFM dal terzo anno.
- **A5 AFM**: la struttura tiene. Stesse storie, testo tagliato, tappe più leggere, pulsanti semplici.
- **A6 CAT**: resta la Missione Aurora (drone, termocamera, materiali, prima e dopo). Parole semplici («ponte termico», «composti organici volatili», «kWh/anno» vanno spiegati o sostituiti), ingresso più agganciante, e un richiamo al resto del corso (rilievo, progetto, cantiere, stima) così non passa «CAT = solo droni e isolanti».
- **A7 Turismo**: testo tagliato (è il più lungo dopo SSAS), titoli concreti, scelta finale non bloccante.
- **A8 SSAS**: è il modello di riferimento, cambia poco. Titoli dei laboratori concreti, parole come «sostegni» e «adattare l'aiuto» rese semplici, e passaggio esplicito dall'amico all'operatore: far capire che è un mestiere che si impara a scuola. I testi che il ragazzo legge stanno in `ssas-situazioni-revisione.mjs`.

### A9 — Verificatore indipendente (per ultimo)
Non ha visto il lavoro degli altri. Percorre in locale, con dati finti, a 390×844 e 1366×768: apertura → 12 domande → risultato → «Perché?» → ciascuna delle cinque prove fino all'attestato. Controlla: nessuno schermo con più di un'azione principale; nessuna parola da manuale; durata 5-7 minuti per prova; attestato con il nome inserito all'inizio; ripresa e «Inizia da capo» funzionanti; codice classe funzionante; nessun errore in console; verifiche `scripts/verifica-*.mjs`; `EMAIL_ATTIVA` spento; nessuna chiamata al database vero. Per ogni prova risponde: chi finisce sa completare «In questo indirizzo si…»? Consegna un elenco di difetti con file e riga, senza correggerli.

## 7. Come lavora ogni agente

- Ramo: partire da `riordino-bussola`. Fare commit piccoli e descrittivi in italiano sul proprio ramo di lavoro; **nessun push**.
- Toccare solo i file della propria sezione. Se serve cambiare un file di un altro, scriverlo nel resoconto invece di farlo.
- Schermate di prova in `/home/claude/anteprime/<sigla-agente>/` (fuori dal repository), a 390×844 e 1366×768. Chrome è in `/usr/bin/google-chrome`, Playwright per Python è installato.
- Resoconto finale, breve: che cosa è stato fatto, file toccati, verifiche eseguite con esito, che cosa NON è stato fatto o provato, dubbi da far decidere a Salvatore. Distinguere sempre ciò che è stato verificato da ciò che è solo supposto.

## 8. Registro completo della sessione del 14/11/2026

Tutto ciò che è stato detto, in ordine. In caso di dubbio fra questo registro e i capitoli precedenti, vale il registro. Ogni agente lo legge per intero.

### 8.1 Osservazioni e richieste di Salvatore

1. Finite le 12 domande il sistema produce «tantissimo testo» per un ragazzino di 12 anni che si aspetta «un esito un po' esplosivo». Serve la sintesi: gli indirizzi suggeriti (per esempio SSAS e Turismo) «devono esplodere nello schermo».
2. Il perché arriva a richiesta: un tasto, oppure «chiedimi perché ti ho suggerito questo». Le motivazioni indicano le scelte fatte nella fase precedente con una sintesi visiva: «hai risposto a queste domande e meno a queste altre».
3. Errore da correggere: dopo le 12 domande, sotto «Prova AFM» ci sono molti tasti, molto rumore, e soprattutto la possibilità di creare l'attestato «inutilmente».
4. Nome e cognome vanno inseriti «fin da subito» quando si prova un indirizzo; il sistema li salva, così a fine prova l'attestato esce senza reinserirli.
5. Va raccolta anche l'email (del ragazzo «o del genitore») con la spunta del consenso privacy, perché la scuola possa mandare l'attestato.
6. Invio degli attestati: il sistema salva l'email; la scuola estrae l'elenco dall'area della Bussola con la password della funzione strumentale e invia a mano. Accanto, un modulo di carta per non perdere le email.
7. Dopo il test di Elmas il percorso «va rivisto», indirizzo per indirizzo, con «un piano di intervento unico» su tutto il flusso fino alla fine.
8. Revisione grafica: oggi è «tutto molto opaco, satinato», senza tasti colorati. La vuole «lucida», con «colori accattivanti». Il modello è il video della Bussola dell'apertura (`assets/video/bussola-orientamento.mp4`), che usa anche come salvaschermo: «molto bello perché risulta molto lucido».
9. Riduzione del rumore: «c'è troppo testo, troppo testo». Ripetuto più volte: è la priorità. «La Bussola va curata meglio».
10. Anche alla fine di ogni prova di indirizzo serve «qualcosa di eclatante»: l'attestato che dice «te lo manderemo via mail», oppure il video dell'indirizzo; alla fine del video l'invito a provare un altro percorso «detto bene, in modo chiaro, semplice», oppure a vedere altri video (storia della scuola, altri indirizzi). «Stiamo facendo orientamento e non bisogna disorientare le persone».
11. Ogni percorso va migliorato per linguaggio naturale, scopo dell'attività e gradevolezza.
12. Per «scopo» Salvatore intende lo scopo generale: far capire che cosa si fa in quell'indirizzo specifico.
13. La Bussola deve funzionare allo stesso modo in tutte le situazioni: stand, scuole medie, Open Day a scuola, casa.
14. Durata di una prova di indirizzo: 5-7 minuti.
15. Risultato numero uno per la scuola: il ragazzo «si ricorda del Mattei».
16. Sensazione durante la prova: «un videogioco».
17. Il lavoro va fatto con un progetto unico che dica ai sotto-agenti che cosa fare, con un orchestratore.
18. Far tornare le persone sul sito da casa, «coi tuoi genitori», per scaricare l'attestato, fare un'altra attività e saperne di più. Servono un codice da scrivere («scriviti questo codice, ritorna in questa sezione quando sei a casa») oppure un QR da inquadrare («inquadra il QR code per scaricare il tuo attestato»); chi non ha il telefono con sé usa il codice. «Bisogna ragionare su cosa è meglio fare».

19. Colori: «mantenendo il colore del SSAS così, agli altri indirizzi attribuisci i colori del logo».

### 8.2 Proposte di Claude accolte o non contestate (si applicano)

1. Risultato: solo il nome dell'indirizzo con animazione e due tasti, «Prova» e «Perché?»; il «Perché?» mostra le 12 risposte come tessere, accese quelle che portano lì. I dati ci sono già (`courseLinks`).
2. Un solo attestato, alla fine della prova; via quello dopo le domande.
3. Nome e cognome all'ingresso, **al posto** dell'attuale finestra «Come vuoi iniziare?», così i passaggi non aumentano.
4. Email chiesta alla fine, nello schermo dell'attestato, facoltativa, come «email di un genitore» con frase che spiega che riceverà l'attestato del figlio e nient'altro; il sistema registra consenso, data e ora. Motivi: un modulo all'inizio fa scappare i ragazzi proprio dove si perdono; sotto i 14 anni il consenso valido è del genitore (da confermare con il responsabile privacy della scuola).
5. A schermo si inserisce l'email; il foglio di carta serve solo a chi non la ricorda o non vuole scriverla. Anche il foglio è una raccolta di dati personali.
6. Niente servizio di invio automatico: una vista nell'area docenti con nome, indirizzo provato, data ed email, e un pulsante per scaricare il file.
7. La raccolta delle email si pubblica solo dopo l'informativa privacy e il via della Dirigente.
8. «Una scelta per schermo», sul modello SSAS, è la regola comune per tutti e cinque i percorsi, con intensità diversa: SIA riscritto per intero; AFM, CAT e Turismo sfoltiti; SSAS quasi invariato.
9. La base grafica si fa per prima ed è unica (oggi ogni prova ha il suo foglio di stile); un colore pieno per indirizzo; contrasto del testo rispettato.
10. Regola contro il rumore: un titolo, una frase, un'azione per schermo.
11. Finale della prova in sequenza, uno schermo alla volta: «In questo indirizzo fai tre cose» → attestato che esplode con il nome e l'email facoltativa → video dell'indirizzo → «Prova un altro indirizzo», con sotto «Guarda gli altri video». L'attestato viene prima del video perché a Elmas i ragazzi lasciavano il posto appena finito.
12. Dal finale spariscono il riepilogo dei cinque lavori (dietro «Rivedi il tuo lavoro»), la domanda «che cosa ti ha incuriosito» come blocco dell'attestato, il blocco contatti.
13. In ogni laboratorio una frase che lega l'attività all'indirizzo; criterio di collaudo: chi finisce sa completare «In questo indirizzo si…».
14. Pulsanti «Avanti» e «Indietro» al posto del nome della tappa successiva; via il lessico da manuale e le avvertenze per adulti.
15. Questionario: è il testo più difficile del percorso; restano le 12 domande, con risposte ridotte a poche parole più un'immagine.
16. CAT: la Missione Aurora mostra una sola fetta del corso; aggiungere un richiamo al resto. SSAS: rendere esplicito il passaggio dall'amico all'operatore e allineare le etichette nell'area docenti.
17. Gioco: barra di avanzamento, effetto a ogni scelta, distintivo dell'indirizzo a fine prova. Nessun punteggio su risposte giuste o sbagliate, perché direbbe al ragazzo che è «bravo» in un indirizzo e «scarso» in un altro.
18. Suoni spenti all'avvio, con un tasto per accenderli.
19. Sotto-agenti: uno per la base grafica (per primo), uno per questionario e risultato, uno per ingresso, finale e area docenti, cinque per gli indirizzi, un verificatore indipendente per ultimo.
20. Priorità di pubblicazione: per l'Open Day dell'11 dicembre 2026 grafica, questionario, risultato, ingresso, finale e tagli di testo; per il 16 gennaio 2027 la riscrittura di SIA e l'elenco email nell'area docenti.
21. Si lavora su un ramo di prova; si pubblica solo al «Pubblica» di Salvatore; nei collaudi non si preme «Inizia» sul sito vero.
22. Ritorno da casa: si danno **tutti e due**, QR e codice breve, che portano allo stesso schermo «Bentornato». Il nome non si usa come chiave. L'email del genitore e il consenso si chiedono lì, a casa, dove il genitore c'è davvero. Il cartoncino con il codice sostituisce il modulo di carta per le email. (Proposta di Claude in risposta a 8.1.18, in attesa del parere di Salvatore.)

### 8.3 Proposte respinte da Salvatore o ritirate (NON si applicano)

1. **Ambientare le storie al Mattei** (laboratori e studenti veri come personaggi): respinta. «Le parti vanno bene quelle di prima». Storie, clienti e casi restano quelli attuali.
2. Di conseguenza resta fuori anche l'idea di ridurre AFM a un solo cliente: i tre clienti attuali restano.
3. **Mappa con cinque «mondi»**, livelli e «tre missioni» per prova: accantonata insieme alla proposta precedente («stai incasinando tutto»). La cornice di gioco resta leggera: barra, effetti, distintivo.
4. **Email chiesta all'inizio insieme al nome**: sostituita dalla controproposta 8.2.4, non contestata.
5. **Servizio di invio automatico degli attestati**: sostituito dall'estrazione dall'area docenti e invio a mano.
6. **«Dichiarare lo scopo» come «alla fine avrai costruito questo in tot minuti»**: ritirata. Lo scopo è quello del punto 8.1.12.

### 8.4 Punti aperti (non decisi: non darli per fatti)

0. Il codice breve per il ritorno da casa richiede una modifica al server (funzione e tabella): si prepara ma non si attiva senza il sì di Salvatore. Il QR invece dovrebbe funzionare con il link personale esistente: è da verificare nel codice, non è ancora un fatto.

1. Informativa privacy e via della Dirigente per la raccolta di nome ed email sul server. Fino ad allora `EMAIL_ATTIVA = false`, e nome e cognome dell'ospite restano solo sul dispositivo.
2. Chi approva i testi riscritti di AFM, SIA, Turismo e CAT: solo Salvatore o anche i colleghi di quegli indirizzi. Per questo ogni agente di percorso consegna l'elenco «prima → dopo» dei testi cambiati in `docs/bussola/riordino-2026-11/testi-<corso>.md`.
3. Quale versione di CAT hanno provato i ragazzi a Elmas (dieci tappe o Missione Aurora): non ricostruibile dai dati.
4. Le schermate non sono state viste da Claude prima dell'intervento: il giudizio di partenza viene da codice, testi e dati.
