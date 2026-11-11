// Revisione editoriale: gli identificativi e il significato delle scelte restano stabili.
// I testi che il ragazzo legge stanno qui e sovrascrivono quelli di ssas-situazioni-data.mjs.
// Laboratori 1 e 2: chi legge è una persona vicina al protagonista. Dal laboratorio 3: fa il mestiere.
const revisioni={
 dipendenze:{
  who:'Luca, 14 anni',
  hook:'Gioca online fino a tardi e salta il basket',
  role:'in squadra con lui',
  handoff:'Fin qui hai ascoltato Luca da vicino. Per aiutarlo davvero serve chi lo fa di mestiere. Prova tu il lavoro dell’educatrice del centro giovani.',
  scene:'Luca, 14 anni, gioca a basket. La sera resta online con gli amici fino a tardi. Il giorno dopo è stanco e salta gli allenamenti. Vorrebbe tornare in palestra, ma non vuole mollare gli amici.',
  need:'Il gioco online gli toglie ore di sonno e tempo per il basket.',
  observation:'Che cosa sta succedendo a Luca?',
  explanations:['Luca gioca online fino a tardi, dorme poco e salta gli allenamenti. Il basket gli manca.','Luca non vuole lasciare gli amici online. Per questo sonno e basket passano in secondo piano.'],
  contexts:['Luca è un tuo compagno di squadra. Da qualche settimana ti sembra stanco e spesso non viene agli allenamenti.','Dopo l’allenamento restate soli. Vuoi capire che cosa gli succede, senza farlo sentire sotto esame.','Adesso fai il lavoro dell’educatrice del centro giovani che Luca frequenta. Luca vuole tornare agli allenamenti: lo aiuti a organizzarsi.','Il centro giovani vuole esporre un messaggio sul gioco online. Lo prepari tu.','Il centro giovani vuole offrire un’attività a chi desidera parlare di come gioca. La organizzi tu.'],
  openings:[['«Ti manca qualcosa degli allenamenti?»','Parti da quello che vorrebbe.','«Mi mancano i compagni. Vorrei tornare, ma faccio fatica a staccarmi dal gioco.»'],['«Che cosa ti trattiene quando devi andare ad allenarti?»','Parti da quello che lo ferma.','«Gli amici mi chiedono un’altra partita. Dico di sì e salto l’allenamento.»']],
  participationContext:'Luca ti ha risposto. Ora vuoi capire meglio com’è fatta una sua giornata.',
  participation:[['Gli chiedo di raccontarmi l’ultimo allenamento saltato','Partite da un episodio vero.','«Volevo spegnere, ma mi hanno chiesto di restare. Quando ho finito, l’allenamento era già iniziato.»'],['Gli propongo di segnare insieme quando gioca','Guardate gli orari, uno accanto all’altro.','«Mi collego pensando a una sola partita. Poi continuo e non guardo più l’ora.»']],
  closings:['«Guardiamo insieme gli orari e scegliamo quando giocare. Poi ne parliamo con l’allenatore o con l’educatrice?»','«Scriviamo agli amici a che ora esci dalla partita. Se è difficile, chiediamo aiuto all’educatrice del centro giovani.»'],
  supportGoal:'Luca vuole tornare agli allenamenti e dormire di più.',
  supports:[['Un calendario con gli impegni di Luca','Luca segna allenamenti e orari di gioco.'],['Un accordo con gli amici online','Li avvisa a che ora deve smettere.'],['Un adulto scelto da Luca','Lo aiuta a smettere all’ora decisa.']],
  request:'«Gli amici propongono una partita proprio all’ora del basket. Questa volta vorrei andare ad allenarmi.»',
  adaptations:[['Trovare con Luca un altro orario per giocare','Gioca dopo l’allenamento e avvisa prima gli amici.'],['Preparare con l’adulto un accordo da proporre','Luca chiede agli amici di spostare la partita.']],
  purposes:[['Far notare come il gioco cambia le giornate','Il messaggio parla di riposo e impegni.'],['Far sapere che si può chiedere aiuto','Dice che si può parlare con l’educatrice.']],
  formats:[
   {label:'Un cartello per il centro giovani',detail:'Una frase breve da appendere nella sala.',draft:'«Gioca meno online e organizza meglio il tuo tempo.»',byPurpose:{p1:['Un’altra partita può toglierti il sonno o un impegno. Ti è mai successo?','Quando giochi online, riesci a rispettare il riposo e gli altri impegni?'],p2:['Fai fatica a fermarti? Puoi parlarne con l’educatrice del centro giovani.','Vuoi cambiare come giochi? Al centro giovani puoi chiedere un colloquio all’educatrice.']}},
   {label:'Un dialogo scritto tra ragazzi',detail:'Una breve conversazione da leggere al centro.',draft:'«— Ho saltato il basket per giocare online. — Cerca di organizzarti meglio.»',byPurpose:{p1:['— Ho saltato il basket per giocare online. — Ti capita spesso di rinunciare allo sport per una partita?','— Ieri ho giocato fino a tardi. — Oggi come stai? Hai dormito abbastanza?'],p2:['— Vorrei fermarmi, ma continuo a giocare. — Ti va di parlarne con l’educatrice del centro giovani?','— Non riesco a rispettare gli orari che mi do. — Al centro giovani puoi chiedere un colloquio all’educatrice.']}}
  ],
  test:'Un compagno dice: «Per me giocare è anche un modo per stare con gli amici.»',
  responses:[['«Quindi basta giocare meno?»','Sembra una regola per tutti. Fai capire che ascolti ogni situazione.'],['«Posso dire che cosa vorrei cambiare?»','C’è una porta aperta. Fai vedere a chi rivolgersi.']],
  team:'L’educatrice del centro giovani guida l’attività e indica altri aiuti, se servono.',
  activities:[['Un incontro su come giochiamo online','Si parla di gioco e riposo, senza obbligo di raccontare.'],['Un colloquio da soli con l’educatrice','Il ragazzo racconta e prova un primo cambiamento.']],
  accessIssue:'Al centro si chiede di partecipare davanti agli altri ragazzi. Luca preferirebbe parlare con l’educatrice in privato.',
  access:[['Un momento per parlare in privato','Luca può rivolgersi all’educatrice senza gli altri.'],['Un biglietto da lasciare all’educatrice','Luca scrive il nome e chiede di essere richiamato.']],
  checks:[['Se i ragazzi sanno a chi chiedere aiuto','Alla fine fai una domanda per controllare.'],['Se gli orari vanno bene a tutti','Le risposte ti dicono se cambiare gli appuntamenti.']],
  badges:['Hai capito come il gioco online cambia le giornate di Luca.','Hai ascoltato Luca con le domande giuste, senza giudicarlo.','Hai scelto aiuti per farlo tornare agli allenamenti.','Hai scritto un messaggio sul gioco online per altri ragazzi.','Hai organizzato un’attività del centro, dall’invito al controllo finale.']
 },
 disabilita:{
  who:'Irene, 14 anni',
  hook:'Non arriva al tavolo dove scelgono le foto',
  role:'nel suo gruppo per la mostra',
  handoff:'Fin qui hai ascoltato Irene da vicino. Ora serve chi organizza spazi e attività di mestiere. Prova tu il lavoro dell’educatrice del laboratorio fotografico.',
  scene:'Irene, 14 anni, usa la carrozzina. Il suo gruppo prepara una mostra di foto e lei vuole scegliere le immagini. Ma il tavolo è troppo alto e delle scatole bloccano il passaggio.',
  need:'Il tavolo alto e il passaggio bloccato le impediscono di lavorare con gli altri.',
  observation:'Che cosa impedisce a Irene di partecipare?',
  explanations:['Irene vuole scegliere le foto con il gruppo. Il tavolo troppo alto e le scatole sono un problema.','Non è Irene il problema, ma lo spazio. Per capire che cosa cambiare, bisogna chiederlo a lei.'],
  contexts:['Siete nello stesso gruppo per la mostra di foto. Irene vuole scegliere le immagini, ma non arriva al tavolo.','Il gruppo comincia a spostare i materiali. Prima di decidere qualcosa per lei, le fai una domanda.','Adesso fai il lavoro dell’educatrice del laboratorio fotografico. Irene vuole scegliere le foto con il gruppo: prepari spazi e aiuti.','Per la mostra serve un cartello sugli spazi, oppure un gioco per i visitatori. Lo prepari tu.','Organizzi un laboratorio dove ognuno può partecipare e scegliere che cosa fare.'],
  openings:[['«Quale parte della mostra ti piacerebbe preparare?»','Parti da quello che vuole fare.','«Vorrei scegliere le foto con gli altri, non solo guardare.»'],['«Che cosa ti impedisce di lavorare al tavolo con noi?»','Parti da quello che la blocca.','«Non arrivo agli strumenti e le scatole bloccano il passaggio. Se fate tutto voi, resto a guardare.»']],
  participationContext:'Irene ti ha risposto. Ora vuoi capire quali cambiamenti le servono davvero.',
  participation:[['Le chiedo quali strumenti vuole e come raggiungerli','Parlate voi due, con calma.','«Vorrei avere foto e forbici vicino a me. Se serve una mano, ve lo chiedo.»'],['Le propongo di segnare i cambiamenti su una pianta della sala','Irene indica tavolo, materiali e passaggi.','«Qui vorrei il tavolo. Queste scatole vanno spostate, così posso raggiungere gli altri.»']],
  closings:['«Spostiamo le scatole e sistemiamo il tavolo. Poi chiediamo all’educatrice se per te va bene.»','«Scegli le foto di cui vuoi occuparti e dicci dove serve una mano. Poi lo diciamo all’educatrice.»'],
  supportGoal:'Irene vuole lavorare alla mostra insieme al gruppo.',
  supports:[['Un tavolo a cui Irene arriva','Prende gli strumenti stando alla sua postazione.'],['Un passaggio libero','Può muoversi tra le postazioni.'],['Un aiuto deciso da lei','Irene dice quando e per che cosa serve.']],
  request:'«Vorrei spostarmi vicino agli altri per confrontare le foto. Possiamo sistemare anche quella postazione?»',
  adaptations:[['Preparare una postazione accessibile dentro il gruppo','Lo spazio cambia, così si confronta con gli altri.'],['Scegliere con Irene gli spostamenti utili','Decidete dove lavorare e tenete liberi i passaggi.']],
  purposes:[['Far notare gli ostacoli','Guarda lo spazio come lo vive chi lo usa.'],['Far scegliere a tutti che cosa fare','Ruoli e aiuti si decidono con le persone.']],
  formats:[
   {label:'Una mappa della sala',detail:'Poche indicazioni per un posto in cui tutti arrivano.',draft:'«Per Irene abbiamo preparato un tavolo separato, lontano dal gruppo.»',byPurpose:{p1:['Lasciamo libero il passaggio dall’ingresso ai tavoli. Foto e strumenti devono essere alla portata di tutti.','Prima di aprire, chiediamo a chi usa lo spazio se tavoli e passaggi vanno bene.'],p2:['Sulla mappa ognuno segna dove vuole lavorare. Poi decidiamo insieme postazioni e materiali.','Chiediamo a Irene dove vuole lavorare. Mettiamo gli strumenti in modo che scelga le foto con gli altri.']}},
   {label:'Un gioco da adattare',detail:'Un gioco per i visitatori, con ruoli e strumenti adattabili.',draft:'«I visitatori fanno la prova in piedi. Chi non riesce può guardare.»',byPurpose:{p1:['Le foto si guardano da seduti o in piedi. Comandi e materiali devono essere alla portata di tutti.','Prima del gioco proviamo strumenti e spazio con chi partecipa e togliamo gli ostacoli.'],p2:['Ognuno sceglie se guardare le foto, abbinarle o raccontarle. I ruoli si decidono nel gruppo.','Adattiamo strumenti e regole con chi gioca. Irene sceglie la parte che vuole fare.']}}
  ],
  test:'Irene legge la vostra proposta per la mostra.',
  responses:[['«È chiaro come posso partecipare?»','Rileggi: dice come usare lo spazio o entrare nel gioco?'],['«Posso scegliere il mio ruolo?»','Controlla che ognuno possa scegliere che cosa fare.']],
  team:'L’educatrice e chi partecipa decidono insieme spazi, materiali e ruoli.',
  activities:[['Una prova di strumenti e spazi','Ognuno prova e dice che cosa funziona.'],['Un’attività di gruppo adattabile','Ruoli e materiali cambiano secondo le richieste.']],
  accessIssue:'La sala scelta ha un gradino all’ingresso.',
  access:[['Scegliere una sala senza gradini','Controlli il percorso prima di invitare le persone.'],['Chiedere al servizio una soluzione che funzioni','Deve funzionare davvero, anche negli spostamenti.']],
  checks:[['Se tutti riescono a partecipare','Guardi quali ostacoli restano.'],['Se ognuno può scegliere il suo ruolo','Chiedi a tutti che cosa cambierebbero.']],
  badges:['Hai capito che cosa separa Irene dal lavoro che vuole fare.','Hai ascoltato Irene prima di decidere qualcosa per lei.','Hai adattato spazi e aiuti alle scelte di Irene.','Hai preparato indicazioni o regole perché tutti possano partecipare.','Hai organizzato un laboratorio dove ognuno arriva e sceglie il suo ruolo.']
 },
 immigrazione:{
  who:'Sara, 13 anni',
  hook:'È arrivata da poco e non capisce le istruzioni',
  role:'in squadra con lei a pallavolo',
  handoff:'Hai ascoltato Sara e capito dove si blocca. Adesso serve chi accoglie le persone di mestiere. Prova tu il lavoro dell’educatrice della squadra di pallavolo.',
  scene:'Sara, 13 anni, è arrivata da poco in Italia e vuole giocare a pallavolo. Conosce ancora poche parole di italiano. Durante la prova le istruzioni sono veloci e la squadra vuole iniziare subito.',
  need:'Sara vuole giocare, ma fa fatica a seguire le istruzioni in italiano.',
  observation:'Perché Sara fa fatica nella prova?',
  explanations:['Sara vuole giocare. Con immagini, esempi e tempo per le domande capirebbe le istruzioni.','Prima bisogna capire che cosa Sara ha già capito. Poi la squadra può accoglierla in modo più chiaro.'],
  contexts:['Sei in squadra con Sara. Oggi c’è la prima prova di pallavolo e lei guarda gli altri senza muoversi.','Finita la prova, vi fermate vicino alle panchine. Vuoi capire che cosa le è chiaro e che cosa no.','Adesso fai il lavoro dell’educatrice che affianca la squadra. Sara vuole provare la pallavolo: scegli come rendere chiare le istruzioni.','La squadra prepara una guida o un gioco per chi arriva per la prima volta.','Il centro sportivo organizza l’accoglienza di chi partecipa per la prima volta. Tocca a te.'],
  openings:[['«Che cosa ti piacerebbe provare con la squadra?»','Parti da quello che vuole fare.','«Vorrei giocare. Posso guardare prima un esempio?»'],['«Quali istruzioni fai più fatica a seguire?»','Parti da quello che non capisce.','«Capisco alcune parole, ma se parlano tutti insieme perdo il filo.»']],
  participationContext:'Sara ti ha risposto. Ora puoi capire meglio quali passaggi non le sono chiari.',
  participation:[['Le rispiego i passaggi da soli, con calma','Può chiedere di ripetere.','«Se me lo fai vedere una volta, poi provo anch’io.»'],['Le mostro le immagini dei passaggi','Indica ciò che ha capito e i dubbi.','«Questo disegno lo capisco. Il passaggio dopo viene prima o dopo il lancio?»']],
  closings:['«Guardiamo una dimostrazione, poi provi tu. Se ci sono dubbi, chiediamo all’allenatore o all’educatrice.»','«Mettiamo in ordine le immagini dei passaggi. Poi scegli da quale prova cominciare e lo diciamo all’allenatore.»'],
  supportGoal:'Sara vuole capire le istruzioni e giocare con gli altri.',
  supports:[['Immagini dei passaggi','Le informazioni non sono solo parole.'],['Una breve dimostrazione','Sara vede la prova e chiede di ripeterla.'],['Una persona della squadra di cui si fida','Si decide insieme. Sara sceglie per sé.']],
  request:'«Adesso ho capito. Vorrei rispondere io alle domande, senza che il compagno parli al posto mio.»',
  adaptations:[['Lasciare provare Sara, restando lì vicino','L’aiuto diminuisce dove non serve più.'],['Chiederle quali passaggi vuole fare da sola','Sara dice dove vuole ancora una mano.']],
  purposes:[['Rendere chiare le informazioni','Poche parole e indicazioni da guardare.'],['Far incontrare i compagni','Ognuno parla per sé, nessuno per gli altri.']],
  formats:[
   {label:'Una guida di benvenuto',detail:'Pochi passaggi e una persona a cui chiedere.',draft:'«Impara tutte le regole prima di entrare nel gruppo.»',byPurpose:{p1:['Guarda la dimostrazione, scegli un passaggio e prova. Puoi chiedere di rivederlo.','Segui le immagini nell’ordine. Se un passaggio non è chiaro, dillo all’educatrice prima di provare.'],p2:['Scegli con chi guardare la dimostrazione. Prima di provare potete fare domande all’educatrice.','Qui trovi i passaggi e le persone a cui chiedere. Puoi dire che cosa vuoi provare, anche a gesti.']}},
   {label:'Un gioco per conoscersi',detail:'Ognuno si presenta con disegni, parole o gesti.',draft:'«Ognuno racconta subito la propria storia alla squadra, in italiano.»',byPurpose:{p1:['Facciamo vedere un esempio. Ognuno si presenta con un’immagine, una parola o un gesto.','Usiamo carte con immagini e proviamo un turno. Chi ha un dubbio indica il passaggio da ripetere.'],p2:['A coppie scegliamo l’immagine di uno sport che ci piace. Cerchiamo cosa abbiamo in comune.','Ognuno sceglie che cosa raccontare di sé, con parole, disegni o gesti. Un compagno può fare una domanda.']}}
  ],
  test:'Sara guarda il materiale preparato per chi arriva.',
  responses:[['«Posso vedere un esempio?»','Controlla se c’è una dimostrazione prima di provare.'],['«A chi posso fare una domanda?»','Rileggi: è chiaro a chi chiedere se non capisci?']],
  team:'L’educatrice e gli allenatori preparano l’accoglienza. Se serve, un mediatore aiuta chi parla un’altra lingua a capirsi.',
  activities:[['Una guida illustrata della squadra','Mostra luoghi, passaggi e persone a cui chiedere.'],['Un incontro per conoscersi','Ognuno sceglie che cosa raccontare.']],
  accessIssue:'Le informazioni sono solo in italiano, con frasi lunghe.',
  access:[['Usare immagini e parole semplici','Chi legge può indicare che cosa non è chiaro.'],['Chiedere un incontro con un mediatore','Aiuta a capirsi quando serve.']],
  checks:[['Se tutti capiscono i passaggi','Chiedi che cosa faranno dopo.'],['Se riescono a fare domande','Raccogli i dubbi, anche quelli detti piano.']],
  badges:['Hai capito perché le istruzioni sono un problema per Sara.','Hai chiesto a Sara che cosa capisce e che cosa vuole provare.','Hai scelto aiuti che lasciano a Sara la parte principale.','Hai adattato parole e immagini per chi arriva per la prima volta.','Hai organizzato l’accoglienza pensando a chi non capisce e vuole chiedere.']
 },
 anziani:{
  who:'Rosa, 76 anni',
  hook:'Vive sola e non riesce a prenotare online',
  role:'tra i suoi vicini di casa',
  handoff:'Hai ascoltato Rosa e capito che cosa le serve. Ora serve chi organizza gli incontri di mestiere. Prova tu il lavoro dell’operatrice del centro di quartiere.',
  scene:'Rosa, 76 anni, vive sola e ama la fotografia. Vorrebbe parlare delle sue foto con qualcuno. Il centro del quartiere organizza un incontro, ma si prenota solo online.',
  need:'Rosa vuole condividere le sue foto, ma non riesce a prenotare online.',
  observation:'Che cosa impedisce a Rosa di partecipare?',
  explanations:['Rosa vorrebbe far vedere le sue foto ad altre persone. Ma la prenotazione solo online la blocca.','L’incontro le interessa, ma il modulo sul telefono è un ostacolo. Serve un altro modo per prenotare.'],
  contexts:['Rosa abita accanto a te. Vorrebbe andare a un incontro sulle foto, ma non riesce a iscriversi.','Passi a trovarla. Prima di offrirle aiuto, vuoi sapere che cosa le interessa e dove si blocca.','Adesso fai il lavoro dell’operatrice del centro di quartiere. Rosa vuole partecipare all’incontro fotografico: prepari le condizioni per farlo.','Il centro prepara un invito o un gioco con le fotografie. Lo prepari tu.','Il centro vuole che gli incontri continuino nel tempo. Li organizzi tu.'],
  openings:[['«Quali foto ti piacerebbe far vedere?»','Parti da quello che le piace.','«Vorrei portare le mie foto e ascoltare le storie degli altri.»'],['«Dove ti blocchi quando provi a prenotare?»','Parti da quello che la ferma.','«Il modulo sul telefono non lo capisco. Vorrei prenotare parlando con qualcuno.»']],
  participationContext:'Rosa ti ha risposto. Ora vuoi capire come preferisce spiegare che cosa le serve.',
  participation:[['Le chiedo che cosa le serve per partecipare','Parlate voi due, con calma.','«Vorrei sapere a che ora inizia e se posso portare foto recenti.»'],['Le propongo di segnare insieme domande e informazioni','Rosa sceglie che cosa scrivere.','«Segniamo l’orario e il numero del centro. Vorrei chiedere come si scelgono le foto.»']],
  closings:['«Ti va di chiamare il centro? Chiediamo come si prenota per telefono e quali foto portare.»','«Prepariamo le domande per il centro. Poi scegli tu le foto, e un’operatrice ci aiuta a prenotare.»'],
  supportGoal:'Rosa vuole partecipare all’incontro con le sue foto.',
  supports:[['Una prenotazione anche per telefono','Rosa prenota senza usare il modulo online.'],['Informazioni chiare su luogo e orario','Così può organizzarsi prima.'],['Una persona che l’accompagna, se vuole','Rosa decide se la vuole e chi.']],
  request:'«Preferisco portare foto recenti: non voglio parlare solo del passato.»',
  adaptations:[['Aprire il tema anche alle foto di oggi','L’attività segue ciò che interessa a Rosa.'],['Lasciare che ognuno scelga quali foto mostrare','Ognuno decide che cosa raccontare.']],
  purposes:[['Invitare a un incontro','Dice che cosa si farà e come partecipare.'],['Far incontrare interessi diversi','Dà spazio alle idee di giovani e anziani.']],
  formats:[
   {label:'Un invito illustrato',detail:'Tema, attività e modo per prenotare.',draft:'«Incontro di fotografie: prenotate sul sito e portate i ricordi di una volta.»',byPurpose:{p1:['Porta una foto, di oggi o del passato, che vuoi far vedere. Puoi prenotare anche per telefono.','Ti piace la fotografia? Il centro organizza un incontro. Chiedi orario e prenotazione, anche per telefono.'],p2:['Giovani e adulti si incontrano con le fotografie. Ognuno sceglie quali portare e che cosa raccontare.','Hai una foto di cui vorresti parlare? Portala e ascolta le storie degli altri.']}},
   {label:'Un gioco con le fotografie',detail:'Ognuno sceglie che cosa mostrare e che cosa chiedere.',draft:'«L’animatore sceglie le foto più belle e invita i partecipanti a commentarle.»',byPurpose:{p1:['Porta una foto e scegli se raccontarla, mostrarla o fare una domanda. Per partecipare puoi anche telefonare.','Ognuno porta una foto a sua scelta. Prima dell’incontro puoi chiedere al centro come funziona il gioco.'],p2:['Ognuno sceglie una foto e una domanda per il gruppo. A coppie cerchiamo qualcosa in comune.','Giovani e anziani confrontano foto di oggi o del passato. Ognuno decide che cosa mostrare e raccontare.']}}
  ],
  test:'Rosa legge la proposta del centro per l’incontro fotografico.',
  responses:[['«Posso iniziare a coppie?»','Controlla se si può prima parlare con una sola persona.'],['«Posso mostrare una foto senza raccontarla?»','Controlla che nessuno sia obbligato a raccontare.']],
  team:'Chi lavora al centro e chi partecipa preparano insieme attività per età diverse.',
  activities:[['Un incontro tra giovani e anziani','Ognuno sceglie le foto e le domande.'],['Un gruppo che continua a incontrarsi','Si raccolgono idee per i prossimi incontri.']],
  accessIssue:'Il centro accetta solo prenotazioni online.',
  access:[['Aggiungere la prenotazione per telefono','Si partecipa senza usare il modulo.'],['Accogliere le persone di persona','Qualcuno aiuta a scegliere e prenotare.']],
  checks:[['Se nascono occasioni per ritrovarsi','Raccogli gli interessi per il prossimo incontro.'],['Se prenotare è davvero facile','Chiedi quali ostacoli hanno trovato.']],
  badges:['Hai capito che cosa interessa a Rosa e che cosa la blocca.','Hai ascoltato i desideri di Rosa con le domande giuste.','Hai scelto aiuti che rispettano le preferenze di Rosa.','Hai preparato un invito o un gioco partendo dagli interessi di tutti.','Hai organizzato un incontro che continua nel tempo e si prenota facilmente.']
 },
 disagio:{
  who:'Tommaso, 14 anni',
  hook:'In classe lo prendono in giro',
  role:'in classe con lui',
  handoff:'Hai ascoltato Tommaso e pensato a un adulto di fiducia. Ora tocca a chi ascolta i ragazzi di mestiere. Prova tu il lavoro dell’educatrice della scuola.',
  scene:'Tommaso, 14 anni, da qualche settimana non vuole leggere ad alta voce in classe. Dice di sentirsi in difficoltà. Alcuni compagni lo prendono in giro.',
  need:'Tommaso ha bisogno di qualcuno che lo ascolti, senza dargli etichette.',
  observation:'Che cosa sta vivendo Tommaso?',
  explanations:['Tommaso fa fatica a leggere davanti alla classe. Le prese in giro gli rendono difficile anche chiedere aiuto.','Tommaso evita di leggere e dice di sentirsi in difficoltà. Meglio ascoltarlo, senza decidere noi che cosa ha.'],
  contexts:['Tommaso è in classe con te. Da qualche settimana non vuole leggere ad alta voce e qualcuno ride di lui.','Dopo le lezioni lo avvicini, lontano dai compagni. Vuoi ascoltarlo senza metterlo a disagio.','Adesso fai il lavoro dell’educatrice della scuola di Tommaso. Lui cerca una persona di fiducia con cui parlare.','Con i ragazzi prepari un messaggio sulle parole rispettose e su come chiedere aiuto.','La scuola vuole spiegare meglio come arrivare allo spazio di ascolto. Lo organizzi tu.'],
  openings:[['«Che cosa vorresti cambiare quando devi leggere?»','Parti da quello che vorrebbe.','«Vorrei poter dire che faccio fatica senza che mi prendano in giro.»'],['«Che cosa succede quando tocca a te leggere?»','Parti da quello che succede.','«Mi blocco e qualcuno ride. Poi faccio ancora più fatica a cominciare.»']],
  participationContext:'Tommaso dice: «Faccio fatica a trovare le parole per spiegarlo.»',
  participation:[['Gli lascio tempo e gli chiedo da dove vuole cominciare','Senza fretta, solo voi due.','«Posso raccontarti che cosa è successo ieri quando ho dovuto leggere.»'],['Gli propongo di scrivere prima poche parole','Poi decide se leggerle insieme a te.','«Posso scrivere che cosa mi preoccupa e poi leggerlo insieme a te.»']],
  closings:['«Possiamo scegliere un adulto della scuola di cui ti fidi. Poi prepariamo che cosa vuoi dirgli.»','«Ti va di scrivere una richiesta per parlare con un adulto della scuola? Decidi tu che cosa dire.»'],
  supportGoal:'Tommaso vuole un modo per parlare con una persona di fiducia.',
  supports:[['Un momento tranquillo per ascoltarlo','Tommaso sceglie che cosa raccontare.'],['Un messaggio da preparare insieme','Lo aiuta ad aprire il dialogo con un adulto.'],['Un adulto di fiducia a cui rivolgersi','Non resta tutto sulle spalle dei compagni.']],
  request:'«Vorrei parlarne, ma non davanti alla classe.»',
  adaptations:[['Organizzare un incontro riservato con un adulto','Tommaso spiega la richiesta in un posto tranquillo.'],['Aiutarlo a scrivere come vuole essere ascoltato','Il messaggio apre il contatto con l’adulto scelto.']],
  purposes:[['Far cambiare le parole che feriscono','Rivede insulti ed etichette.'],['Far conoscere un aiuto','Invita a parlare con un adulto o un professionista.']],
  formats:[
   {label:'Un messaggio per la scuola',detail:'Una frase rispettosa e un invito a chiedere aiuto.',draft:'«Per aiutare chi è in difficoltà, invitatelo a reagire e a non pensarci.»',byPurpose:{p1:['Se un compagno ti racconta una difficoltà, ascoltalo. Ridere di lui può impedirgli di chiedere aiuto.','Prima di giudicare, ascolta chi vive la difficoltà. Le parole rispettose permettono di parlarne.'],p2:['Se stai vivendo una difficoltà, parlane con un adulto di fiducia. Chiedi come arrivare allo spazio di ascolto.','Hai bisogno di parlare con qualcuno? Chiedi a un adulto della scuola come contattare lo spazio di ascolto, in modo riservato.']}},
   {label:'Un dialogo da provare',detail:'Una conversazione che lascia spazio a chi parla.',draft:'«— Faccio fatica a leggere davanti alla classe. — Non pensarci e vedrai che passa.»',byPurpose:{p1:['— Quando leggo, qualcuno ride. — Mi dispiace. Se vuoi, raccontami che cosa succede, senza fretta.','— Mi chiamano strano perché mi blocco. — Non è giusto. Ti va di raccontarmi che cosa è successo?'],p2:['— Vorrei chiedere aiuto, ma non so a chi. — Possiamo informarci con un adulto della scuola sullo spazio di ascolto.','— Non voglio parlarne davanti ai compagni. — Possiamo chiedere a un adulto un momento riservato.']}}
  ],
  test:'Un ragazzo legge il messaggio preparato per la scuola.',
  responses:[['«Posso scrivere prima?»','Controlla se si può chiedere aiuto anche scrivendo.'],['«Posso scegliere con chi parlare?»','Rileggi: aiuta a trovare un adulto senza raccontare a tutti?']],
  team:'Una persona esperta di ascolto accoglie le richieste. Gli adulti della scuola aiutano a trovarla.',
  activities:[['Un colloquio di ascolto','Si sceglie un momento per parlare.'],['Un incontro sulle parole e le etichette','Il gruppo rivede le frasi, nessuno deve raccontare di sé.']],
  accessIssue:'Gli appuntamenti si chiedono a voce, davanti a tutti.',
  access:[['Permettere una richiesta riservata','Si contatta l’adulto senza dirlo agli altri.'],['Fissare un momento tranquillo, solo in due','È un primo spazio per parlare con calma.']],
  checks:[['Se è chiaro come chiedere un appuntamento','Controlli che le informazioni si capiscano.'],['Se le parole usate sono rispettose','Raccogli frasi da migliorare, senza fare nomi.']],
  badges:['Hai capito la difficoltà di Tommaso e come lo trattano i compagni.','Hai ascoltato Tommaso rispettando i suoi tempi.','Hai preparato un modo per chiedere aiuto in modo riservato.','Hai riscritto parole rivolte a chi vive una difficoltà.','Hai organizzato come arrivare a uno spazio di ascolto.']
 },
 infanzia:{
  who:'Nico, 6 anni',
  hook:'Quando perde, si arrabbia e lascia il gioco',
  role:'suo fratello o sua sorella maggiore',
  handoff:'Hai aiutato Nico come fratello o sorella maggiore. Adesso serve chi lavora con i bambini di mestiere. Prova tu il lavoro dell’educatrice della ludoteca.',
  scene:'Nico, 6 anni, gioca a memory in ludoteca. Perde e si arrabbia, così lascia il gioco. Lia vorrebbe continuare a giocare con lui.',
  need:'Nico si arrabbia quando perde. Lia vorrebbe continuare a giocare con lui.',
  observation:'Che cosa è successo tra Nico e Lia?',
  explanations:['Nico si arrabbia quando perde e lascia il gioco. Lia vorrebbe ancora giocare con lui.','Nico vuole giocare, ma perdere gli è difficile. Qualcuno deve ascoltare lui e anche Lia.'],
  contexts:['Nico è il tuo fratellino. Lo vedi perdere a memory in ludoteca e lasciare il tavolo, arrabbiato.','Ti siedi accanto a Nico. Vuoi capire che cosa è successo, parlando in modo semplice.','Adesso fai il lavoro dell’educatrice della ludoteca. Aiuti Nico a sfogare la rabbia e a tornare a giocare con Lia.','La ludoteca prepara una storia o delle carte per parlare delle emozioni giocando. Le prepari tu.','Organizzi un laboratorio in cui i bambini giocano insieme e si esprimono come vogliono.'],
  openings:[['«Ti va di tornare a giocare con Lia?»','Parti da quello che vorrebbe.','«Sì, ma quando perdo mi arrabbio e non voglio più giocare.»'],['«Che cosa ti ha fatto arrabbiare?»','Parti da quello che è successo.','«Lia ha trovato più coppie di me. Io non mi ricordavo dove fossero le carte.»']],
  participationContext:'Nico fa fatica a dire come si sente. Puoi provare in due modi.',
  participation:[['Mi siedo vicino a lui e lo ascolto con calma','Poi può tornare dagli altri bambini.','«Mi dà fastidio perdere. Te lo dico qui e poi torno da Lia?»'],['Gli propongo di mostrarmelo con un disegno','Può farlo senza spiegare tutto subito.','«Questa faccia arrabbiata è come mi sento io.»']],
  closings:['«Scegliamo una carta che dice come ti senti. Poi chiediamo all’educatrice di aiutarci a giocare con Lia.»','«Facciamo una pausa. Poi chiediamo a Lia di riprovare insieme e all’educatrice di aiutarci.»'],
  supportGoal:'Nico vuole dire come si sente e scegliere come tornare a giocare.',
  supports:[['Immagini delle emozioni','Nico indica come si sente.'],['Una pausa decisa insieme','Si ferma e sceglie quando riprovare.'],['Una prova in coppia','Si ricomincia in un gruppo più piccolo.']],
  request:'«Adesso voglio riprovare con Lia. Possiamo cominciare con meno carte?»',
  adaptations:[['Provare in coppia con meno carte','Nico e Lia decidono quando tornare al gioco completo.'],['Scegliere insieme tra due versioni del gioco','Provano poche carte e poi tutte le carte.']],
  purposes:[['Dare un nome alle emozioni','Il bambino capisce che cosa prova un personaggio.'],['Imparare a decidere insieme','I bambini provano a scegliere in due.']],
  formats:[
   {label:'Una storia da giocare',detail:'I bambini scelgono come continua.',draft:'«Nico perde. L’adulto gli dice che non deve arrabbiarsi e gli ordina di tornare al gioco.»',byPurpose:{p1:['Nico sceglie un’immagine per dire come si sente dopo aver perso. Lia dice che cosa prova mentre aspetta.','Nico e Lia guardano due facce, una arrabbiata e una dispiaciuta. Scelgono quale somiglia ai personaggi della storia.'],p2:['Nico propone una pausa e Lia chiede di continuare. Scelgono una partita con meno carte.','Nico e Lia scelgono i ruoli e provano in due. Poi decidono se cambiare le regole.']}},
   {label:'Carte delle emozioni',detail:'Si può indicare, disegnare o raccontare.',draft:'«Ogni bambino deve spiegare davanti a tutti perché ha scelto una carta.»',byPurpose:{p1:['Ogni bambino sceglie una carta delle emozioni. Può mostrarla, disegnarla o dire quando si sente così.','Le carte mostrano come stanno i personaggi. I bambini possono indicare una carta senza parlare davanti a tutti.'],p2:['A coppie scelgono due carte e inventano come i personaggi si aiutano nel gioco.','Nico e Lia scelgono una carta ciascuno. Con l’educatrice decidono una regola buona per entrambi.']}}
  ],
  test:'L’educatrice mostra il materiale a Nico e Lia.',
  responses:[['«Posso mostrarlo senza parlare?»','Controlla che si possa rispondere con un gesto o un’immagine.'],['«Possiamo scegliere come continuare?»','Rileggi: tutti e due i bambini possono scegliere?']],
  team:'L’educatrice e gli operatori inventano i giochi. I bambini possono proporre e scegliere.',
  activities:[['Un gioco sulle emozioni','Con immagini, parole e gesti.'],['Una storia con scelte','I bambini scelgono come continua.']],
  accessIssue:'Per partecipare, ogni bambino dovrebbe parlare davanti a tutti.',
  access:[['Offrire anche immagini e disegni','Si può partecipare senza parole.'],['Cominciare in coppia o in piccolo gruppo','È un modo più tranquillo di partecipare.']],
  checks:[['Se i bambini trovano un modo per partecipare','Osservi come scelgono di esprimersi.'],['Se propongono di cambiare il gioco','Le loro idee ti aiutano a rivederlo.']],
  badges:['Hai capito che Nico e Lia vogliono giocare insieme.','Hai scelto un modo di ascoltare adatto a un bambino di sei anni.','Hai trovato un aiuto per far riprovare i bambini insieme.','Hai preparato una storia o delle carte per esprimersi giocando.','Hai organizzato un’attività pensando a come partecipa ogni bambino.']
 }
};

export function reviseCase(c){
 const r=revisioni[c.id];if(!r)return c;
 const paired=['supports','adaptations','purposes','activities','access','checks','responses'];
 for(const [key,value] of Object.entries(r)){
  if(paired.includes(key))c[key]=c[key].map((item,i)=>({...item,label:value[i][0],detail:value[i][1]}));
  else if(['openings','participation'].includes(key))c[key]=c[key].map((item,i)=>({...item,label:value[i][0],detail:value[i][1],reply:value[i][2]}));
  else if(key==='formats')c.formats=c.formats.map((item,i)=>({...item,...value[i],improvements:value[i].byPurpose?.p1||item.improvements}));
  else c[key]=value; // anche i campi who, hook, role, handoff
 }
 // Le risposte generali riprendono quelle effettivamente offerte nel dialogo.
 c.desire=c.openings[0].reply;c.difficulty=c.openings[1].reply;
 return c;
}

export function materialExamples(c,goal,format){
 const f=c?.formats.find(x=>x.id===format);return f?.byPurpose?.[goal]||f?.improvements||[];
}

export function materialCheck(c,goal){
 // Queste domande invitano a controllare il proprio testo, senza valutarlo automaticamente.
 if(c?.id==='dipendenze')return goal==='p1'?
  {context:'Un ragazzo del centro legge il tuo messaggio.',questions:[['«Mi dice che cosa può togliermi il gioco?»','Controlla che nomini una cosa vera, come il sonno o un impegno.'],['«Mi fa pensare a qualcosa che ho vissuto?»','Controlla che chi legge si riconosca, senza sentirsi giudicato.']]}:
  {context:'Un ragazzo del centro legge il tuo messaggio.',questions:[['«So a chi posso chiedere aiuto?»','Controlla che il messaggio nomini l’educatrice o un adulto.'],['«So dove posso chiedere un colloquio?»','Controlla che si capisca che si va al centro giovani.']]};
 return {context:c?.test||'',questions:c?.responses.map(r=>[r.label,r.detail])||[]};
}

export const INTEREST_ACTIVITIES=['Capire che cosa sta succedendo a una persona.','Ascoltare una persona e fare le domande giuste.','Trovare gli aiuti giusti per una persona.','Creare un materiale per altre persone.','Organizzare un’attività a cui tutti partecipano.'];
