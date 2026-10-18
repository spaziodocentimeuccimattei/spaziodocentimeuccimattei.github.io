// Revisione editoriale: gli identificativi e il significato delle scelte restano stabili.
const revisioni={
 dipendenze:{
  scene:'Luca, 14 anni, gioca in una squadra di basket. Le partite online con gli amici si prolungano: dorme poco, è stanco e salta gli allenamenti. Vorrebbe riprendere il basket, ma gli dispiace lasciare gli amici mentre giocano.',
  need:'Il gioco online sta togliendo tempo al riposo e al basket.',
  observation:'Quali difficoltà emergono dal racconto di Luca?',
  explanations:['Luca dorme poco e salta gli allenamenti di basket per continuare a giocare online. Vorrebbe riprendere lo sport, ma gli dispiace interrompere le partite con gli amici.','Il gioco online sta togliendo tempo al riposo e al basket. Luca vorrebbe tornare ad allenarsi e continuare a frequentare gli amici con cui gioca.'],
  contexts:['Luca ne parla con un’educatrice del centro giovani che frequenta.','L’educatrice incontra Luca a tu per tu per comprendere meglio le sue difficoltà.','Luca vuole tornare agli allenamenti. Cerca con l’educatrice un aiuto per organizzarsi.','L’educatrice prepara un messaggio sul gioco online da esporre al centro giovani.','Il centro giovani vuole offrire un’attività per chi desidera parlare delle proprie abitudini di gioco.'],
  openings:[['«Che cosa ti manca degli allenamenti di basket?»','Approfondisci che cosa interessa a Luca.','«Mi mancano i compagni di squadra. Vorrei tornare, ma faccio fatica a staccarmi dal gioco online.»'],['«Che cosa ti impedisce di andare agli allenamenti?»','Approfondisci che cosa lo trattiene online.','«Gli amici mi chiedono un’altra partita online. Accetto e finisco per saltare l’allenamento.»']],
  participationContext:'L’educatrice propone a Luca di raccontare come si svolgono le sue giornate.',
  participation:[['Ripercorrere un episodio a tu per tu','Chiedi di raccontare l’ultimo allenamento saltato.','«Stavo per spegnere, ma mi hanno chiesto di restare. Quando abbiamo finito, l’allenamento era già iniziato.»'],['Annotare insieme gli orari','Luca indica quando gioca e quando dovrebbe andare in palestra.','«Mi collego prima dell’allenamento pensando di fare una sola partita. Poi continuo e non guardo più l’ora.»']],
  closings:['«Possiamo guardare gli orari degli allenamenti e scegliere quando giocare. Ti andrebbe?»','«Ti va di preparare un messaggio per spiegare agli amici a che ora devi lasciare la partita online?»'],
  desire:'«Vorrei tornare agli allenamenti e continuare a giocare con gli amici online.»',supportGoal:'Riprendere gli allenamenti e rispettare gli orari di riposo.',
  supports:[['Un calendario degli impegni','Luca segna gli allenamenti di basket e sceglie quando giocare online.'],['Un accordo con gli amici online','Prima di iniziare, Luca comunica a che ora dovrà smettere.'],['Il sostegno di un adulto scelto da Luca','Concordano come aiutarlo a rispettare l’orario di fine gioco.']],
  request:'«Gli amici propongono una partita online nell’orario del basket. Questa volta vorrei andare ad allenarmi.»',
  adaptations:[['Cercare con Luca un altro orario per giocare','Può collegarsi dopo l’allenamento, avvisando prima gli amici.'],['Preparare con l’adulto un accordo da proporre','Luca spiega agli amici il proprio impegno e chiede se possono spostare la partita.']],
  purposes:[['Riconoscere le conseguenze del gioco','Richiamare l’attenzione sul riposo e sugli altri impegni.'],['Far conoscere un aiuto','Spiegare che si può parlare con l’educatrice del centro.']],
  formats:[
   {label:'Un cartello per i ragazzi del centro',detail:'Una frase breve da esporre nella sala.',draft:'«Gioca meno online e organizza meglio il tuo tempo.»',byPurpose:{p1:['Una partita in più può togliere tempo al sonno o farti saltare un impegno. Ti succede?','Quando giochi online, riesci a rispettare gli orari del riposo e degli altri impegni?'],p2:['Fai fatica a interrompere le partite? Puoi parlarne con l’educatrice del centro giovani.','Vorresti cambiare le tue abitudini di gioco? Al centro giovani puoi chiedere un colloquio con l’educatrice.']}},
   {label:'Un dialogo scritto tra ragazzi',detail:'Una breve conversazione da leggere al centro.',draft:'«— Ho saltato il basket per giocare online. — Cerca di organizzarti meglio.»',byPurpose:{p1:['— Ho saltato il basket per giocare online. — Ti capita spesso di rinunciare allo sport per continuare una partita?','— Ieri ho giocato online fino a tardi. — Oggi come ti senti? Sei riuscito a riposare?'],p2:['— Vorrei fermarmi, ma continuo a giocare. — Ti va di parlarne con l’educatrice del centro giovani?','— Non riesco a rispettare gli orari che mi do. — Al centro giovani puoi chiedere un colloquio con l’educatrice.']}}
  ],
  team:'L’educatrice del centro giovani conduce l’attività e aiuta i ragazzi a orientarsi verso altri aiuti, se occorrono.',
  activities:[['Un incontro sulle abitudini digitali','I ragazzi si confrontano su gioco, riposo e impegni, senza racconti personali obbligatori.'],['Un colloquio individuale','Il ragazzo racconta la propria difficoltà e cerca con l’educatrice un primo cambiamento da provare.']],
  accessIssue:'Al centro si chiede di partecipare rivolgendosi all’educatrice mentre è con altri ragazzi. Luca preferirebbe contattarla in privato.',
  access:[['Un momento per le richieste individuali','Luca può rivolgersi all’educatrice a tu per tu.'],['Un biglietto consegnato all’educatrice','Luca lascia il proprio nome e chiede di essere ricontattato.']],
  badges:['Hai riconosciuto come il gioco online incide sul benessere di Luca.','Hai approfondito le difficoltà di Luca attraverso il dialogo.','Hai proposto come aiutare Luca a gestire i propri impegni.','Hai rielaborato un messaggio sul gioco online per altri ragazzi.','Hai organizzato un’attività del centro, dalla partecipazione alla verifica.']
 },
 disabilita:{
  // Restano la mostra, la carrozzina e i due ostacoli già descritti.
  need:'Il tavolo alto e il passaggio occupato ostacolano il lavoro di Irene.',observation:'Che cosa ostacola la partecipazione di Irene?',
  contexts:['Un’educatrice coordina il laboratorio fotografico in cui Irene prepara la mostra con altri ragazzi.','Prima di spostare materiali e postazioni, l’educatrice ascolta le richieste di Irene.','Irene vuole scegliere le foto con il gruppo. Preparate gli spazi e gli aiuti che le servono.','Per la mostra, il gruppo prepara indicazioni sugli spazi o un’attività per i visitatori.','L’educatrice organizza un laboratorio in cui ciascuno possa partecipare e scegliere il proprio ruolo.'],
  openings:[['«Quale parte della mostra ti piacerebbe preparare?»','Chiedi a Irene quale ruolo desidera.','«Vorrei scegliere le foto con gli altri, non limitarmi a guardare.»'],['«Che cosa ti impedisce di lavorare al tavolo con gli altri?»','Chiedi quali ostacoli incontra.','«Non arrivo agli strumenti e le scatole bloccano il passaggio. Se fanno tutto per me, resto a guardare.»']],
  participationContext:'L’educatrice chiede a Irene di indicare quali cambiamenti le sarebbero utili.',
  participation:[['Confrontarsi con Irene a tu per tu','Le chiedi quali strumenti vuole usare e come raggiungerli.','«Vorrei avere le foto e le forbici vicino a me. Se serve una mano, ve lo chiedo.»'],['Segnare insieme le modifiche su una pianta della sala','Irene indica postazione, materiali e passaggi.','«Qui vorrei il tavolo; queste scatole vanno spostate, così posso raggiungere gli altri.»']],
  closings:['«Sistemiamo insieme il tavolo e il passaggio. Poi ci dici se riesci a lavorare come desideri.»','«Scegli le foto di cui vuoi occuparti e indicaci dove ti serve una mano.»'],
  request:'«Vorrei spostarmi vicino agli altri per confrontare le foto. Possiamo sistemare anche quella postazione?»',
  purposes:[['Far riconoscere gli ostacoli','Mostrare che cosa può impedire di usare spazi e materiali.'],['Favorire la partecipazione alle scelte','Spiegare come concordare ruoli e aiuti con le persone.']],
  formats:[
   {draft:'«Per Irene abbiamo preparato un tavolo separato, lontano dal gruppo.»',byPurpose:{p1:['Lasciamo libero il passaggio tra ingresso e tavoli. Foto e strumenti devono essere raggiungibili dalle postazioni.','Prima di aprire il laboratorio, controlliamo con chi lo usa se tavoli, materiali e passaggi sono accessibili.'],p2:['Sulla pianta ognuno indica dove desidera lavorare. Concordiamo insieme postazioni e materiali.','Chiediamo a Irene dove vuole lavorare e sistemiamo gli strumenti in modo che possa scegliere le foto con gli altri.']}},
   {detail:'Un gioco per i visitatori della mostra, con strumenti e ruoli adattabili.',draft:'«I visitatori fanno la prova in piedi. Chi non riesce può guardare.»',byPurpose:{p1:['Le foto si possono osservare da seduti o in piedi. Materiali e comandi devono essere raggiungibili da tutti.','Prima della prova controlliamo strumenti e spazio con i partecipanti e modifichiamo gli ostacoli segnalati.'],p2:['Ogni partecipante sceglie se osservare le foto, abbinarle o raccontarle. I ruoli si concordano nel gruppo.','Adattiamo strumenti e regole con i partecipanti. Irene sceglie la parte che vuole svolgere.']}}
  ],
  test:'Irene legge la proposta per la mostra.',
  responses:[['«È chiaro come posso partecipare?»','Rileggi la proposta: spiega come usare lo spazio o prendere parte al gioco?'],['«Posso scegliere il mio ruolo?»','Controlla che la proposta lasci ai partecipanti la scelta di che cosa fare.']],
  team:'L’educatrice e i partecipanti concordano spazi, materiali e ruoli del laboratorio.',
  badges:['Hai individuato gli ostacoli tra Irene e l’attività che vuole svolgere.','Hai ascoltato le richieste di Irene prima di proporre un aiuto.','Hai adattato spazi e sostegni alle scelte di Irene.','Hai preparato indicazioni o regole per favorire la partecipazione.','Hai organizzato un laboratorio considerando accesso e ruoli dei partecipanti.']
 },
 immigrazione:{
  // La prima prova di pallavolo e le istruzioni veloci erano già comprensibili.
  need:'Sara vuole giocare a pallavolo, ma fatica a seguire le istruzioni in italiano.',observation:'Che cosa rende difficile a Sara partecipare alla prova?',
  contexts:['Un’educatrice affianca la squadra durante l’accoglienza dei nuovi iscritti alla pallavolo.','L’educatrice parla con Sara per capire quali istruzioni le sono chiare e quali occorre spiegare meglio.','Sara vuole provare la pallavolo. Scegli come rendere comprensibili le istruzioni.','La squadra prepara una guida o un gioco di presentazione per accogliere i nuovi iscritti.','Il centro sportivo organizza l’accoglienza dei ragazzi che partecipano per la prima volta.'],
  openings:[['«Che cosa ti piacerebbe provare con la squadra?»','Parti dall’attività a cui Sara vuole partecipare.','«Vorrei provare a giocare. Posso guardare prima un esempio?»'],['«Quali istruzioni fai fatica a seguire?»','Chiedi quali passaggi richiedono una spiegazione.','«Capisco alcune parole, ma quando tutti parlano insieme perdo il filo.»']],
  participationContext:'L’educatrice lascia a Sara il tempo di indicare i passaggi poco chiari.',
  participation:[['Riprendere le istruzioni a tu per tu','Sara può chiedere di ripetere un passaggio con calma.','«Se me lo mostri una volta, poi vorrei provare anch’io.»'],['Usare immagini dei passaggi','Sara indica ciò che ha capito e dove ha un dubbio.','«Questo disegno lo capisco. Il passaggio dopo viene prima o dopo il lancio?»']],
  closings:['«Guardiamo una dimostrazione, poi provi tu. Ci fermiamo nei passaggi su cui hai domande.»','«Mettiamo in ordine le immagini dei passaggi. Poi scegli da quale prova cominciare.»'],
  request:'«Ora ho capito. Vorrei rispondere io alle domande, senza che il compagno parli al posto mio.»',
  formats:[
   {detail:'Una guida ai primi passaggi della prova di pallavolo.',draft:'«Leggi tutte le regole. Quando le sai, puoi entrare in campo.»',byPurpose:{p1:['Guarda la dimostrazione, scegli un passaggio e prova. Puoi chiedere di ripeterlo prima di continuare.','Segui queste immagini nell’ordine. Se un passaggio non è chiaro, indicalo all’educatrice prima di provare.'],p2:['Scegli un compagno con cui guardare la dimostrazione. Prima di provare, potete fare domande all’educatrice.','Qui trovi i passaggi e le persone a cui chiedere. Puoi raccontare che cosa ti piacerebbe provare o mostrarlo con un gesto.']}},
   {detail:'Un breve gioco di presentazione per i nuovi iscritti.',draft:'«Ognuno racconta subito la propria storia alla squadra, in italiano.»',byPurpose:{p1:['Mostriamo un esempio del gioco. Ognuno può usare un’immagine, una parola o un gesto per presentarsi.','Usiamo carte illustrate e mostriamo un turno di prova. Chi ha una domanda può indicare il passaggio da ripetere.'],p2:['A coppie scegliamo un’immagine di uno sport che ci piace e cerchiamo un interesse comune.','Ognuno sceglie che cosa raccontare di sé, usando parole, disegni o gesti. Un compagno può fare una domanda.']}}
  ],
  test:'Sara legge o osserva il materiale preparato per i nuovi iscritti.',
  responses:[['«Posso vedere un esempio?»','Controlla se la proposta permette di osservare una dimostrazione prima di partecipare.'],['«A chi posso fare una domanda?»','Rileggi le indicazioni: è chiaro a chi rivolgersi se un passaggio non è comprensibile?']],
  team:'L’educatrice e gli allenatori preparano l’accoglienza. Un mediatore linguistico-culturale può aiutare la comunicazione, quando occorre.',
  badges:['Hai riconosciuto la difficoltà di comprendere istruzioni e partecipare alla squadra.','Hai chiesto a Sara che cosa comprende e che cosa vuole provare.','Hai proposto aiuti che permettano a Sara di partecipare in prima persona.','Hai adattato parole e immagini a chi arriva per la prima volta.','Hai organizzato l’accoglienza verificando comprensione e possibilità di fare domande.']
 },
 anziani:{
  // Restano interessi fotografici, incontro e prenotazione esclusivamente online.
  need:'Rosa cerca persone con cui condividere la fotografia, ma non riesce a prenotare l’incontro online.',observation:'Che cosa ostacola la partecipazione di Rosa?',
  explanations:['Rosa vorrebbe condividere le proprie foto con altre persone. La prenotazione soltanto online le rende difficile partecipare.','L’incontro interessa a Rosa, ma il modulo sul telefono è un ostacolo. Occorre offrirle un modo di prenotare che possa usare.'],
  contexts:['Un’operatrice del centro di quartiere raccoglie le richieste delle persone interessate all’incontro fotografico.','L’operatrice chiede a Rosa che cosa le interessa dell’incontro e quali difficoltà incontra nel prenotare.','Preparate con Rosa le condizioni per partecipare all’incontro fotografico.','Il centro prepara un invito o un’attività con le fotografie da proporre ai partecipanti.','Il centro vuole dare continuità agli incontri tra persone che condividono un interesse.'],
  openings:[['«Quali foto ti piacerebbe condividere all’incontro?»','Approfondisci gli interessi di Rosa.','«Vorrei portare le mie foto e ascoltare le storie degli altri.»'],['«In quale punto della prenotazione hai difficoltà?»','Chiedi quale ostacolo incontra.','«Il modulo sul telefono non lo capisco. Vorrei poter prenotare parlando con qualcuno.»']],
  participationContext:'L’operatrice chiede a Rosa come preferisce spiegare la propria richiesta.',
  participation:[['Parlarne con Rosa a tu per tu','Le chiedi quali informazioni le servono per partecipare.','«Vorrei sapere a che ora comincia l’incontro e se posso portare foto recenti.»'],['Annotare insieme domande e informazioni','Rosa sceglie che cosa scrivere per prepararsi all’incontro.','«Segniamo l’orario e il numero del centro. Vorrei chiedere come si scelgono le foto.»']],
  closings:['«Ti va di chiedere al centro come prenotare per telefono e quali foto portare?»','«Possiamo preparare le domande per il centro. Poi scegli quali foto desideri condividere.»'],
  formats:[
   {draft:'«Incontro di fotografie: prenotate sul sito e portate i ricordi di una volta.»',byPurpose:{p1:['Porta una foto, recente o del passato, che vuoi condividere. Puoi prenotare anche telefonando al centro.','Ti piace la fotografia? Il centro organizza un incontro per mostrare le proprie foto. Chiedi orario e prenotazione anche per telefono.'],p2:['Giovani e adulti si incontrano attraverso le fotografie. Ognuno sceglie quali immagini portare e che cosa raccontare.','Hai una foto di cui vorresti parlare con altre persone? Porta l’immagine che scegli e ascolta le storie degli altri.']}},
   {draft:'«L’animatore sceglie le foto più belle e invita i partecipanti a commentarle.»',byPurpose:{p1:['Porta una fotografia e scegli se raccontarla, mostrarla o fare una domanda. Il centro spiega come partecipare anche per telefono.','Ogni partecipante porta una foto a sua scelta. Prima dell’incontro può chiedere al centro come funziona il gioco.'],p2:['Ognuno sceglie una foto e una domanda da rivolgere al gruppo. A coppie cerchiamo un interesse comune.','Giovani e anziani confrontano fotografie recenti o del passato. Ciascuno decide che cosa mostrare e raccontare.']}}
  ],
  test:'Rosa legge la proposta del centro per l’incontro fotografico.',
  responses:[['«Posso iniziare a coppie?»','Controlla se la proposta permette un primo confronto con una persona, prima del gruppo.'],['«Posso mostrare una foto senza raccontarla?»','Verifica che sia possibile scegliere che cosa condividere, senza un racconto obbligatorio.']],
  badges:['Hai distinto l’interesse di Rosa dall’ostacolo che incontra per partecipare.','Hai approfondito desideri e richieste di Rosa attraverso il dialogo.','Hai proposto sostegni che rispettano le preferenze di Rosa.','Hai preparato un invito o un’attività a partire dagli interessi dei partecipanti.','Hai organizzato un’occasione d’incontro considerando prenotazione e continuità.']
 },
 disagio:{
  need:'Tommaso fatica a leggere davanti alla classe e subisce le prese in giro di alcuni compagni.',observation:'Quali difficoltà racconta Tommaso?',
  contexts:['Con l’aiuto di un’amica, Tommaso incontra un’educatrice che lavora nella sua scuola.','L’educatrice incontra Tommaso in un luogo tranquillo, senza i compagni di classe.','Tommaso cerca un modo per parlare della propria difficoltà con una persona di fiducia.','L’educatrice prepara con i ragazzi un messaggio sulle parole rispettose e sulla possibilità di chiedere aiuto.','La scuola vuole rendere più chiaro come accedere allo spazio di ascolto.'],
  explanations:['Tommaso racconta una difficoltà nella lettura davanti alla classe. Le prese in giro rendono più difficile parlarne e chiedere un aiuto.','Tommaso evita di leggere davanti ai compagni e dice di sentirsi in difficoltà. Occorre ascoltare il suo racconto, senza attribuirgli una diagnosi.'],
  openings:[['«Che cosa vorresti cambiasse quando devi leggere in classe?»','Chiedi che cosa desidera Tommaso.','«Vorrei poter dire che faccio fatica senza che mi prendano in giro.»'],['«Che cosa succede quando è il tuo turno di leggere?»','Approfondisci la situazione che lo preoccupa.','«Mi blocco e qualcuno ride. Poi faccio ancora più fatica a cominciare.»']],
  participationContext:'Tommaso dice: «Faccio fatica a trovare le parole per raccontarlo.»',
  participation:[['Lasciargli il tempo di raccontare a tu per tu','Gli chiedi da quale episodio preferisce cominciare.','«Posso raccontarti quello che è successo ieri durante la lettura.»'],['Proporre di scrivere prima poche parole','Tommaso sceglie se usarle per iniziare il colloquio.','«Posso scrivere che cosa mi preoccupa e poi leggerlo insieme a te.»']],
  closings:['«Possiamo scegliere un adulto della scuola con cui parlarne e preparare insieme che cosa vuoi dirgli.»','«Ti va di scrivere una richiesta di colloquio? Decidi tu quali informazioni condividere.»'],
  request:'«Vorrei chiedere un aiuto alla scuola, ma senza spiegare tutto davanti ai compagni.»',
  formats:[
   {draft:'«Per aiutare chi è in difficoltà, invitatelo a reagire e a non pensarci.»',byPurpose:{p1:['Quando un compagno racconta una difficoltà, ascoltalo. Ridere o chiamarlo strano può impedirgli di chiedere aiuto.','Prima di giudicare una difficoltà, ascolta chi la vive. Le parole rispettose permettono di parlarne.'],p2:['Se stai vivendo una difficoltà, puoi parlarne con un adulto di fiducia della scuola e chiedere come accedere allo spazio di ascolto.','Hai bisogno di parlare con qualcuno? Chiedi a un adulto della scuola come contattare lo spazio di ascolto in modo riservato.']}},
   {draft:'«— Faccio fatica a leggere davanti alla classe. — Non pensarci e vedrai che passa.»',byPurpose:{p1:['— Quando leggo qualcuno ride. — Mi dispiace. Se vuoi, raccontami che cosa succede senza fretta.','— Mi chiamano strano perché mi blocco. — Non è giusto prenderti in giro. Ti va di raccontarmi che cosa è successo?'],p2:['— Vorrei chiedere un aiuto, ma non so a chi. — Possiamo informarci con un adulto della scuola sullo spazio di ascolto.','— Non voglio parlarne davanti ai compagni. — Possiamo chiedere a un adulto di concordare un momento riservato.']}}
  ],
  test:'Un ragazzo legge il messaggio preparato per la scuola.',
  responses:[['«Posso scrivere prima?»','Controlla se è previsto un modo di chiedere aiuto anche quando parlare è difficile.'],['«Posso scegliere con chi parlare?»','Rileggi le indicazioni: aiutano a trovare un adulto o un professionista senza obbligare a raccontare tutto al gruppo?']],
  badges:['Hai considerato la difficoltà raccontata da Tommaso e il comportamento dei compagni.','Hai scelto come ascoltare Tommaso rispettando i suoi tempi.','Hai preparato un sostegno per chiedere aiuto in modo riservato.','Hai rielaborato parole rivolte a chi vive una difficoltà.','Hai organizzato l’accesso a un’attività di ascolto o confronto.']
 },
 infanzia:{
  scene:'In ludoteca, Nico, 6 anni, perde a un gioco di memoria con le carte. Si arrabbia e smette di giocare. Lia vuole continuare. L’educatrice cerca un modo per ascoltare entrambi e aiutarli a riprendere il gioco.',
  need:'Nico si arrabbia quando perde; Lia vorrebbe continuare a giocare con lui.',observation:'Che cosa sta succedendo tra Nico e Lia?',
  explanations:['Nico si arrabbia quando perde e lascia il gioco. Ha bisogno di esprimere la rabbia e trovare un modo per riprovare, considerando anche Lia.','Nico vorrebbe giocare, ma la sconfitta lo mette in difficoltà. L’educatrice ascolta lui e Lia per aiutarli a continuare insieme.'],
  contexts:['L’educatrice della ludoteca osserva che cosa accade durante il gioco di memoria.','L’educatrice si avvicina a Nico e gli propone di raccontare che cosa è successo.','L’educatrice cerca con Nico un modo per esprimere la rabbia e riprendere il gioco con Lia.','La ludoteca prepara una storia o delle carte per parlare delle emozioni attraverso il gioco.','L’educatrice organizza un laboratorio in cui i bambini possano esprimersi e giocare insieme.'],
  openings:[['«Ti piacerebbe tornare a giocare con Lia?»','Chiedi a Nico che cosa desidera.','«Sì, ma quando perdo mi arrabbio e non voglio più giocare.»'],['«Che cosa ti ha fatto arrabbiare durante il gioco?»','Chiedi di raccontare l’episodio.','«Lia ha trovato più coppie di carte. Io non riuscivo a ricordarmi dove fossero.»']],
  participationContext:'Nico esita a raccontare quello che prova. L’educatrice gli propone due modi per cominciare.',
  participation:[['Ascoltarlo a tu per tu, vicino al gioco','Gli lasci il tempo di raccontare prima di tornare dagli altri bambini.','«Mi dà fastidio perdere. Posso dirtelo qui e poi tornare da Lia?»'],['Usare un disegno o un’immagine','Nico mostra come si sente, anche senza spiegare subito tutto.','«Questa faccia arrabbiata è come mi sento io.»']],
  closings:['«Possiamo scegliere una carta per dire come ti senti. Poi decidiamo con Lia come riprendere il gioco.»','«Ti va di fare una pausa e poi proporre a Lia di riprovare insieme?»'],
  request:'«Adesso vorrei riprovare con Lia. Possiamo cominciare con meno carte?»',
  adaptations:[['Concordare una prova in coppia con meno carte','Nico e Lia provano e decidono quando tornare al gioco completo.'],['Scegliere insieme tra due versioni del gioco','I bambini confrontano una partita con poche carte e una con tutte le carte.']],
  formats:[
   {draft:'«Nico perde. L’adulto gli dice che non deve arrabbiarsi e gli ordina di tornare al gioco.»',byPurpose:{p1:['Nico sceglie un’immagine per dire come si sente dopo aver perso. Lia racconta che cosa prova mentre lo aspetta.','Nico e Lia guardano due facce: una arrabbiata e una dispiaciuta. Scelgono quale rappresenta i personaggi della storia.'],p2:['Nico propone una pausa; Lia chiede di continuare. Insieme scelgono una partita con meno carte e poi decidono come proseguire.','Nico e Lia scelgono i ruoli e una prova da fare in coppia. Dopo il tentativo decidono se cambiare le regole.']}},
   {draft:'«Ogni bambino deve spiegare davanti a tutti perché ha scelto una carta.»',byPurpose:{p1:['Ogni bambino sceglie una carta delle emozioni. Può mostrarla, disegnarla o raccontare quando si sente così.','Le carte mostrano come si sentono i personaggi. I bambini possono indicare un’immagine senza dover parlare davanti a tutti.'],p2:['A coppie i bambini scelgono due carte e inventano come i personaggi possono aiutarsi durante il gioco.','Nico e Lia scelgono una carta ciascuno. Con l’educatrice decidono una regola che aiuti entrambi a partecipare.']}}
  ],
  test:'L’educatrice propone il materiale a Nico e Lia.',
  responses:[['«Posso mostrarlo senza parlare?»','Controlla che il materiale permetta di esprimersi anche con un gesto o un’immagine.'],['«Possiamo scegliere come continuare?»','Rileggi la proposta: lascia a entrambi i bambini una scelta su come partecipare?']],
  badges:['Hai considerato le emozioni di Nico e il desiderio di Lia di continuare il gioco.','Hai scelto un modo di ascoltare adatto a un bambino di sei anni.','Hai adattato un aiuto per permettere ai bambini di riprovare insieme.','Hai preparato una storia o delle carte per esprimersi attraverso il gioco.','Hai organizzato un’attività considerando come partecipano i bambini.']
 }
};

export function reviseCase(c){
 const r=revisioni[c.id];if(!r)return c;
 const paired=['supports','adaptations','purposes','activities','access','checks','responses'];
 for(const [key,value] of Object.entries(r)){
  if(paired.includes(key))c[key]=c[key].map((item,i)=>({...item,label:value[i][0],detail:value[i][1]}));
  else if(['openings','participation'].includes(key))c[key]=c[key].map((item,i)=>({...item,label:value[i][0],detail:value[i][1],reply:value[i][2]}));
  else if(key==='formats')c.formats=c.formats.map((item,i)=>({...item,...value[i],improvements:value[i].byPurpose?.p1||item.improvements}));
  else c[key]=value;
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
  {context:'Un ragazzo del centro legge il messaggio.',questions:[['«Quali conseguenze del gioco ti fa notare?»','Verifica che il messaggio richiami una conseguenza concreta sul riposo o sugli impegni.'],['«Ti richiama una situazione che hai vissuto?»','Controlla che il lettore possa riconoscere un episodio, senza sentirsi giudicato.']]}:
  {context:'Un ragazzo del centro legge il messaggio.',questions:[['«È chiaro a chi puoi rivolgerti?»','Controlla che il messaggio indichi l’educatrice o un adulto a cui rivolgersi.'],['«Capisci dove puoi chiedere un colloquio?»','Verifica che il centro giovani sia riconoscibile nel messaggio.']]};
 return {context:c?.test||'',questions:c?.responses.map(r=>[r.label,r.detail])||[]};
}

export const INTEREST_ACTIVITIES=['Comprendere una situazione.','Ascoltare una persona attraverso il dialogo.','Cercare un aiuto adatto alle sue difficoltà.','Preparare un materiale per altre persone.','Organizzare un’attività.'];
