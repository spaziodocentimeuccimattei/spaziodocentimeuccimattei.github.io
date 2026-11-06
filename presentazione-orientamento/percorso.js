/* Percorso della presentazione: atti, ordine delle schermate, battute del relatore,
   sezione sull'IA e schermate finali compatte. Si carica prima di presentazione.js. */
(() => {
  'use strict';
  const k=t=>`<p class="kicker">${t}</p>`;

  /* Studiare nell'epoca dell'IA · tre questioni di fondo (imparare, verità, responsabilità) fondate su Linee guida MIM sull'IA a scuola (2025),
     Linee guida per l'educazione civica (D.M. 183/2024) e UNESCO (2024). */
  const iaDomanda={id:'ia-domanda',title:'L’IA risponde in un secondo. Ci possiamo fidare?',class:'navy ia-hook',
    note:'Esempio costruito apposta: indagine e numero sono inventati e lo si dichiara nella risposta svelata. Serve a mostrare l’errore tipico di un chatbot (risposta plausibile, fonte inventata). Far votare per alzata di mano prima di svelare.',
    html:`<div class="ia-hook-copy">${k('Studiare nell’epoca dell’IA')}<h2 class="enter">L’IA risponde<br>in un secondo.<br><span class="lime">Ci possiamo fidare?</span></h2><p class="ia-hook-hint">Leggete la risposta. Alzate la mano: ci credete?</p></div>
    <div class="ia-chat" aria-label="Esempio di conversazione con un chatbot">
      <p class="ia-msg ia-user">Quante ore dormono, in media, i ragazzi di 13 anni in Sardegna? Dammi la fonte.</p>
      <p class="ia-msg ia-bot"><span class="ia-bot-name">Chatbot</span>In media <b>6 ore e 12 minuti</b> a notte, secondo l’indagine regionale <b>«Giovani e sonno 2021»</b>.</p>
      <div class="ia-vote" role="group" aria-label="Ci credi?"><button data-ia-vote="si">Ci credo</button><button data-ia-vote="no">Non ci credo</button></div>
      <div class="ia-reveal" id="ia-reveal" hidden aria-live="polite"><strong id="ia-reveal-title"></strong><p>Numero e indagine <b>li abbiamo inventati noi</b> per l’esempio. Eppure suonano veri.</p><p>Un chatbot può fare lo stesso: <b>genera</b> frasi plausibili, <b>non controlla</b> se sono vere.</p></div>
      <small class="ia-chat-note">Esempio costruito per la presentazione</small>
    </div>`};

  const iaScuola={id:'ia-scuola',title:'Tre domande che l’IA pone alla scuola',class:'paper ia-school',
    note:'Tre questioni di fondo per la scuola: didattica (che cosa vuol dire imparare se la risposta è già pronta), di verità (le risposte plausibili e le «allucinazioni»), etica (decisione e responsabilità umana). Fonti: Linee guida MIM per l’introduzione dell’IA nelle istituzioni scolastiche (2025), § 4.4 (potenzialità e limiti, senso critico, uso che non danneggi lo sviluppo delle proprie conoscenze) e § 3.1 (intervento e sorveglianza umana, trasparenza, dati); Linee guida per l’educazione civica, D.M. 183/2024, cittadinanza digitale; UNESCO, AI competency framework for students (2024), approccio centrato sulla persona. Non citare progetti interni.',
    html:`${k('Studiare nell’epoca dell’IA')}<h2 class="enter">Tre domande che l’IA<br><span>pone alla scuola.</span></h2>
    <div class="ia-questions">
      <div class="ia-q enter"><small>Imparare</small><h3>Se l’IA risponde a tutto, perché imparare?</h3><p><span>Come la affrontiamo</span>Capire non si delega. <b>Prima pensi tu, poi l’IA</b>: conta il percorso, non solo il risultato.</p></div>
      <div class="ia-q enter"><small>Verità</small><h3>Se una risposta suona vera, è vera?</h3><p><span>Come la affrontiamo</span>Non sempre. A scuola si impara a <b>dubitare e verificare</b>: fonti, prove, confronto.</p></div>
      <div class="ia-q enter"><small>Responsabilità</small><h3>Chi decide: la macchina o la persona?</h3><p><span>Come la affrontiamo</span><b>La persona.</b> Si dichiara l’aiuto ricevuto, si proteggono i dati, si risponde delle proprie scelte.</p></div>
    </div>`};

  /* «Tocca a voi»: dopo ogni video, domande leggere per coinvolgere la sala. Una domanda per clic (stesso tasto delle slide);
     nessuna risposta a schermo: il collegamento con l'indirizzo è nelle note del relatore. La terza domanda è facoltativa. */
  const MODI={mano:['✋','Alzate la mano'],voce:['💬','Rispondete a voce'],scelta:['↔','Scegliete']};
  const TOCCA={
    cat:{code:'CAT',color:'#79cf1b',q:[
      ['mano','Alzi la mano chi, da piccolo, costruiva case con i Lego o su Minecraft.','«Progettare è la stessa cosa, ma con regole vere: misure, materiali, sicurezza.»'],
      ['voce','Potete ridisegnare un posto del vostro paese: quale scegliete, e che cosa ci fate?','«È il lavoro di chi studia CAT: leggere un luogo, rilevarlo e progettare come farlo funzionare meglio.»'],
      ['scelta','Casa sull’albero o casa sott’acqua: quale progettereste?','«In tutti e due i casi servono rilievo, calcolo e i materiali giusti: le materie che avete visto nel video.»']]},
    afm:{code:'AFM',color:'#00823f',q:[
      ['voce','Avete cento euro per aprire un’attività nel vostro paese: che cosa aprite?','«Avete appena fatto la prima domanda di AFM: come si trasforma un’idea in un’attività.»'],
      ['mano','Alzi la mano chi, quando si ordina la pizza con gli amici, è quello che fa i conti.','«Tenere i conti è il cuore di Economia aziendale, la materia più ampia di AFM.»'],
      ['scelta','Meglio inventare il prodotto, o convincere tutti a comprarlo?','«Servono tutte e due le cose: la seconda si chiama marketing, ed è la M di AFM.»']]},
    sia:{code:'SIA',color:'#58bba9',q:[
      ['mano','Alzi la mano chi ha pensato almeno una volta: «Questa app la farei meglio io».','«In SIA si impara proprio questo: progettare programmi che semplificano il lavoro.»'],
      ['voce','Una cosa noiosa che fate ogni giorno e che fareste fare a un programma?','«Ordini, magazzino, fatture: in un’azienda le cose ripetitive sono tante, e un programma le può organizzare.»'],
      ['voce','Siete l’informatico di una pizzeria: che cosa fate fare al computer?','«Ordini, magazzino, conti e dati dei clienti protetti: è un piccolo sistema informativo aziendale.»']]},
    turismo:{code:'Turismo',color:'#d35400',q:[
      ['voce','Un turista arriva nel vostro paese per un giorno solo: dove lo portate?','«Avete appena progettato un itinerario: è il primo lavoro di chi studia Turismo.»'],
      ['voce','Chi sa dire «benvenuto» in tre lingue? Proviamo.','«In Turismo le lingue sono tre: inglese, francese e spagnolo.»'],
      ['scelta','Viaggio dei sogni: mare, montagna o città d’arte?','«Dietro ogni viaggio c’è qualcuno che lo progetta, lo racconta e accoglie: tour operator, enti, strutture ricettive.»']]},
    ssas:{code:'SSAS',color:'#ef0b62',q:[
      ['mano','Alzi la mano chi, quando un amico è giù, è quello a cui va a raccontarlo.','«Avete già uno strumento del mestiere: l’ascolto. In SSAS lo allenate in laboratorio, con i giochi di ruolo.»'],
      ['scelta','Superpotere: capire cosa prova una persona solo guardandola, oppure riuscire a farla ridere quando è triste?','«In questo indirizzo si allenano tutti e due: si chiamano empatia e animazione.»'],
      ['voce','Nel vostro paese c’è una signora anziana che vive da sola e non esce quasi mai. Avete un pomeriggio: che cosa vi inventate?','«È quello che chiamiamo invecchiamento attivo: non assistere, ma far tornare a partecipare.»']]}
  };
  const toccaScenes=Object.fromEntries(Object.entries(TOCCA).map(([id,t])=>[`tocca-${id}`,{id:`tocca-${id}`,title:`Tocca a voi · ${t.code}`,class:'tocca-scene',course:`${id}`,color:t.color,
    note:`Una domanda per clic, con lo stesso tasto delle slide: la domanda precedente sfuma e arriva la successiva. Nessuna risposta a schermo. Lascia rispondere due o tre ragazzi, poi il collegamento. ${t.q.map((x,i)=>`${i+1}${i===2?' (facoltativa, si salta se si è in ritardo)':''}: ${x[2]}`).join(' ')}`,
    html:`<div class="tocca-head">${k('Tocca a voi')}<span class="tocca-tag">${t.code}</span></div>
    <div class="tocca-stage">${t.q.map((x,i)=>`<div class="tocca-q${i===0?' on':''}" data-step="${i}"><span class="tocca-mode"><i aria-hidden="true">${MODI[x[0]][0]}</i>${MODI[x[0]][1]}</span><p>${x[1]}</p></div>`).join('')}</div>
    <div class="tocca-foot"><div class="tocca-dots" aria-hidden="true">${t.q.map((_,i)=>`<span class="${i===0?'on':''}"></span>`).join('')}</div><span class="tocca-count">Domanda 1 di ${t.q.length}</span></div>`}]));

  /* Il prossimo passo: Open Day, Bussola e iscrizione in un’unica schermata. */
  const prossimiPassi={id:'prossimipassi',title:'Il prossimo passo · Visite, Bussola, iscrizione',class:'navy nextsteps nextsteps-compact',
    note:'Riunisce le vecchie schermate Bussola e Open Day; la Bussola qui è solo annunciata, si apre nell’ultima schermata. Date di Open Day e iscrizioni: si seguono sul sito ufficiale, non inventare scadenze 2027/28. SIA: in prima si sceglie AFM.',
    html:`<div class="nextsteps-left">${k('Il prossimo passo')}<h2 class="enter">Vieni a vedere.<br>Prova.<br><span class="lime">Scegli.</span></h2></div>
    <div class="nextsteps-list">
      <div class="nextsteps-item"><small>01</small><div><h3>Vieni a vedere</h3><p>Open Day e visite su appuntamento.</p><a class="text-button" href="mailto:orientamattei@gmail.com?subject=Orientamento%20-%20Visita%20alla%20sede">Chiedi una visita ↗</a></div></div>
      <div class="nextsteps-item"><small>02</small><div><h3>Prova la Bussola</h3><p>Tra poco, sul tuo Chromebook. Poi anche a casa, con la famiglia.</p><a class="text-button" data-esterno href="https://spaziodocentimeuccimattei.github.io/bussola.html" target="_blank" rel="noopener">Apri la Bussola completa ↗</a></div></div>
      <div class="nextsteps-item"><small>03</small><div><h3>Iscriviti online</h3><p>Domanda su Unica. Per SIA si sceglie AFM.</p><a class="text-button" href="https://spaziodocentimeuccimattei.github.io/famiglie.html#iscrizione" target="_blank" rel="noopener">Come iscriversi ↗</a></div></div>
    </div>`};

  /* Orari e come arrivare in un’unica schermata. */
  const info={id:'info',title:'Info pratiche · Orari e come arrivare',class:'reach info-scene',
    note:'Riunisce orari e trasporti. Orario: fonte ufficiale https://www.iismeuccimattei.edu.it/orario-lezioni/, in vigore dal 19 ottobre 2026 e definito provvisorio; è l’orario attuale, non quello garantito per il 2027/28. Trasporti: Trenitalia, ARST e CTM; non dare tempi a piedi non verificati.',
    html:`<div class="reach-photo"><img src="assets/scuola.webp" alt="La sede di Decimomannu"><div class="location"><strong>Via Ugo Foscolo, 48</strong><span>09033 Decimomannu</span></div></div>
    <div class="reach-copy">${k('Info pratiche')}<h2>Si comincia<br>alle <span class="accent">8:30.</span></h2>
      <div class="info-rows"><div><span>Lun · Mer · Ven · Sab</span><strong>8:30 → 13:30</strong></div><div><span>Mar · Gio</span><strong>8:30 → 14:30</strong></div></div>
      <p class="info-transport"><b>Treno · ARST · CTM</b><br>Stazione e fermate in paese.</p>
      <div class="btn-row"><a class="btn" href="https://www.google.com/maps/search/?api=1&query=IIS+Meucci+Mattei+Via+Ugo+Foscolo+48+Decimomannu" target="_blank" rel="noopener">Mappa ↗</a><a class="text-button" href="https://www.iismeuccimattei.edu.it/orario-lezioni/" target="_blank" rel="noopener">Orario ↗</a></div>
    </div>`};

  /* Ultima schermata: resta proiettata mentre i ragazzi lavorano sui Chromebook. */
  const bussolaVia={id:'bussola-via',title:'Ora tocca a voi · La Bussola sul Chromebook',class:'paper launch',
    note:'Resta proiettata durante il lavoro individuale sui Chromebook; dopo, si chiude con la schermata «Grazie». «Proviamo insieme» apre la dimostrazione dal palco (nessun nominativo, nessun salvataggio): bastano una o due domande, poi si passa ai Chromebook. Non ci sono codici: si scrive l’indirizzo principale del sito e si sceglie «La Bussola» nel menu. Se il Chromebook è già stato usato da un altro ragazzo, compare «Riprendi la tua Bussola»: va scelto «Inizia una nuova Bussola». La Bussola non assegna un indirizzo: dà indicazioni motivate da approfondire.',
    html:`<div class="launch-copy">${k('Ora tocca a voi')}<h2 class="enter">Prendete<br>il Chromebook.</h2><div class="launch-url"><span>Scrivi nella barra degli indirizzi</span><strong>spaziodocentimeuccimattei<wbr>.github.io</strong><em>poi nel menu scegli <b>La Bussola</b></em></div><div class="launch-actions"><button class="btn" id="open-demo">Proviamo insieme la prima domanda →</button><a class="btn launch-full" data-esterno href="https://spaziodocentimeuccimattei.github.io/bussola.html" target="_blank" rel="noopener">Apri la Bussola completa ↗</a><img src="assets/qr-bussola.svg" alt="QR per aprire la Bussola"></div></div>
    <ol class="launch-steps">
      <li><small>01</small><div><h3>Apri la Bussola</h3><p>Dal sito, voce <b>La Bussola</b> nel menu. Chromebook già usato da un altro? Scegli <b>«Inizia una nuova Bussola»</b>.</p></div></li>
      <li><small>02</small><div><h3>Rispondi a 12 domande</h3><p>Non ci sono risposte giuste. <b>Al tuo ritmo.</b></p></div></li>
      <li><small>03</small><div><h3>Prova le attività</h3><p>Degli indirizzi che ti incuriosiscono. <b>Le ragioni restano a te.</b></p></div></li>
    </ol>`};

  /* Schermata finale: ringraziamento e inviti all'azione per i ragazzi. Riprende i contatti della vecchia schermata «Salva telefono ed email». */
  const grazie={id:'grazie',title:'Grazie · Segna i contatti e parlane a casa',class:'navy finale-scene',
    note:'Ultima schermata: resta proiettata mentre i ragazzi escono o fanno domande. Invitare esplicitamente a segnare telefono ed email adesso, sul diario o sul telefono, e a darli ai genitori. Il QR salva in rubrica la vCard con il numero della SEDE di Decimomannu (non quello della sede centrale). Riunisce i contenuti della vecchia schermata «Salva telefono ed email».',
    html:`<div class="finale-rings" aria-hidden="true"><svg viewBox="0 0 600 600"><circle cx="300" cy="300" r="270"/><circle cx="300" cy="300" r="225"/><circle cx="300" cy="300" r="180"/><circle cx="300" cy="300" r="135"/></svg></div>
    <div class="finale-layout">
      <div class="finale-copy">${k('Grazie per l’ascolto')}<h2 class="finale-title">Grazie.<br><span class="lime">Ti aspettiamo.</span></h2>
        <ol class="finale-steps">
          <li><b>1</b><div><h3>Segna numero ed email</h3><p>Adesso: sul diario o sul telefono.</p></div></li>
          <li><b>2</b><div><h3>Dalli ai tuoi genitori</h3><p>La scelta si fa insieme, a casa.</p></div></li>
          <li><b>3</b><div><h3>Prova la Bussola a casa</h3><p>Con la tua famiglia: <a class="finale-url" data-esterno href="https://spaziodocentimeuccimattei.github.io/bussola.html" target="_blank" rel="noopener">spaziodocentimeuccimattei.github.io</a> → La Bussola.</p></div></li>
          <li><b>4</b><div><h3>Contattaci</h3><p>Per una visita, una domanda o per iscriverti.</p></div></li>
        </ol>
      </div>
      <div class="finale-card">
        <img class="finale-logo" src="assets/logo.jpeg" alt="Logo IIS Meucci - Mattei | Decimomannu">
        <p class="finale-school">IIS Meucci - Mattei <span>| Decimomannu</span></p>
        <a class="finale-phone" href="tel:+390704657043">070 4657043</a>
        <a class="finale-mail" href="mailto:orientamattei@gmail.com">orientamattei@gmail.com</a>
        <div class="finale-qr"><img src="assets/qr-contatti.svg" alt="QR per salvare i contatti della sede"><p><b>Inquadra.</b><br>La scuola entra<br>in rubrica.</p></div>
        <button class="btn finale-save" data-save-contact>Salva il contatto ↓</button>
      </div>
    </div>`};

  const chapters=[
    {label:'La domanda',ids:['benvenuti','imparare','ia-domanda','ia-scuola']},
    {label:'Chi siamo',ids:['coetanei','storia','convegno','abitare','metodo']},
    {label:'Che cosa studi',ids:['indirizzi','cat','tocca-cat','afm','tocca-afm','sia','tocca-sia','turismo','tocca-turismo','ssas','tocca-ssas','serali']},
    {label:'Come si impara',ids:['fsl','erasmus']},
    {label:'Per ciascuno',ids:['inclusione','vita']},
    {label:'Il prossimo passo',ids:['prossimipassi','info','bussola','bussola-via','grazie']},
    /* Fuori dal percorso lineare: il loro contenuto è ora nei video degli indirizzi. Si leggono in Esplora, dopo «Grazie». */
    {label:'Approfondimenti · in Esplora',extra:true,ids:['laboratori','metodologie','fuori-aula','tecnologie']}
  ];

  /* Scaletta di circa 33 minuti (in minuti per schermata); le facoltative si saltano se si è in ritardo. */
  const minutes={benvenuti:.5,imparare:1,'ia-domanda':2,'ia-scuola':2,
    coetanei:1,storia:1,convegno:.5,abitare:1,metodo:1,
    indirizzi:.5,cat:1.75,'tocca-cat':.75,afm:1.75,'tocca-afm':.75,sia:1.75,'tocca-sia':.75,turismo:1.5,'tocca-turismo':.75,ssas:1.75,'tocca-ssas':.75,serali:.5,
    fsl:.5,erasmus:1,
    inclusione:1,vita:.5,
    prossimipassi:1,info:.5,bussola:2,'bussola-via':3,grazie:1};
  const optional=['convegno','serali','vita','bussola'];

  /* Che cosa dire: una battuta e il passaggio alla schermata successiva. */
  const say={
    bussola:'Fai salire un ragazzo qualsiasi: «Proviamo insieme». Risponde a voce con il numero, tu selezioni e confermi; bastano le 4 domande della prova breve. Poi: «Avete visto com’è fatta: a casa la rifate tutta, con la vostra famiglia» e indica il QR. Nelle classi con i Chromebook si può passare subito alla schermata successiva.',
    grazie:'«Grazie a tutti.» Poi i quattro gesti, uno per uno: segnate numero ed email adesso, dateli ai vostri genitori, rifate la Bussola a casa con la famiglia, scriveteci o chiamateci per una visita o per iscrivervi. Lascia la schermata proiettata mentre escono.',
    benvenuti:'Avvia con o senza audio. Presentati in una frase e annuncia: «Oggi partiamo da una domanda».',
    imparare:'Fai la domanda e aspetta. Raccogli due risposte dal pubblico. Poi: «E se lo chiedessimo a un’intelligenza artificiale?»',
    'ia-domanda':'Leggi la domanda al chatbot, poi la risposta. Fai votare per alzata di mano, poi svela. «Sembrava vero. Ecco perché a scuola si impara anche questo.»',
    'ia-scuola':'Leggi una domanda alla volta e lascia un attimo di silenzio. Poi la risposta: come la affrontiamo a scuola. La seconda l’hanno appena vista con il chatbot. Chiudi: «Non vietiamo l’IA e non la lasciamo fare da sola: ci pensiamo insieme».',
    coetanei:'Fai scegliere la risposta. «Non siete soli: tanti ragazzi della vostra età vivono qui intorno.»',
    storia:'Il video completo dura 1 minuto e 39 secondi; se sei in ritardo, fallo partire da «Oggi». «Siamo nati come ragioneria: oggi gli indirizzi sono cinque.»',
    convegno:'«Ci chiediamo che cosa serve alla scuola di oggi»: indica i quattro temi, compreso quello sull’IA appena visto.',
    abitare:'Gli studenti partecipano alle scelte sugli spazi. Il video parte dal piano di quest’anno. Se chiedono dell’orto: c’è già, il video parla della sua versione inclusiva. Fai vedere un esempio: l’Agorà.',
    metodo:'Scegli una sola delle quattro voci, quella più vicina al pubblico. «Si impara anche abitando bene la scuola.»',
    indirizzi:'«Cinque indirizzi, cinque domande diverse. Ve li facciamo raccontare da cinque brevi video, e dopo ognuno tocca a voi.» Si parte da CAT. Puoi anche cliccare l’indirizzo che sceglie il pubblico.',
    afm:'«Come si trasforma un’idea in un’attività? Ve lo racconta AFM.» Premi «Guarda il video». Il video si chiude presentando SIA, che vedete subito dopo.',
    sia:'«In prima ci si iscrive ad AFM; dal terzo anno si può scegliere SIA.» Premi «Guarda il video».',
    turismo:'«Come fai scoprire un luogo a chi non lo conosce? Ecco Turismo.» Premi «Guarda il video».',
    cat:'«Si comincia da CAT: Costruzioni, Ambiente e Territorio, diploma in quattro anni.» Premi «Guarda il video» e lascia parlare il video. Questo video non ha sottotitoli: tieni l’audio acceso. Alla fine, avanti: tocca a loro.',
    ssas:'«Come aiuti una persona a partecipare e stare meglio? Ecco SSAS.» Premi «Guarda il video».',
    serali:'Un minuto per le famiglie: anche gli adulti possono riprendere gli studi.',
    laboratori:'Lascia parlare le foto. Premi «Guarda» se vuoi la sequenza.',
    metodologie:'«Qui si impara facendo»: avvia la sequenza delle foto e commenta due attività.',
    fsl:'Trenta secondi: «Stage e uscite li avete visti in tutti i video: è la formazione scuola-lavoro, comune a ogni indirizzo».',
    'fuori-aula':'Il territorio è un’aula: musei, patrimonio, uscite.',
    erasmus:'Europa e lingue insieme: mobilità Erasmus+ e certificazioni in inglese, francese e spagnolo.',
    tecnologie:'Dal disegno all’oggetto: stampa 3D, drone, modelli digitali.',
    inclusione:'Una scuola per ciascuno: scegli una delle quattro domande.',
    vita:'Chiudi la parte delle esperienze con le persone: progetti, incontri, amicizie.',
    prossimipassi:'Tre passi: vieni a vedere, prova la Bussola, iscriviti. «La Bussola la provate tra due minuti.»',
    info:'Orari e come arrivare, in trenta secondi.',
    contatti:'«Segnate il numero e l’email, anche per i vostri genitori.» Raccogli una o due domande, poi passa all’ultima schermata.',
    'tocca-cat':'Una domanda per clic. Lascia rispondere due o tre ragazzi, poi il collegamento che trovi nelle note. La terza domanda è facoltativa.',
    'tocca-afm':'Una domanda per clic. Lascia rispondere due o tre ragazzi, poi il collegamento che trovi nelle note. La terza domanda è facoltativa.',
    'tocca-sia':'Una domanda per clic. Lascia rispondere due o tre ragazzi, poi il collegamento che trovi nelle note. La terza domanda è facoltativa.',
    'tocca-turismo':'Una domanda per clic. Lascia rispondere due o tre ragazzi, poi il collegamento che trovi nelle note. La terza domanda è facoltativa.',
    'tocca-ssas':'Una domanda per clic. Lascia rispondere due o tre ragazzi, poi il collegamento che trovi nelle note. La terza domanda è facoltativa.',
    'bussola-via':'«Ora tocca a voi.» Fai insieme la prima domanda dal palco. Poi tutti sul Chromebook: scrivono l’indirizzo del sito e li guidi a «La Bussola» nel menu. Lascia questa schermata proiettata finché lavorano.'
  };

  window.PERCORSO={chapters,say,scenes:{...toccaScenes,'ia-domanda':iaDomanda,'ia-scuola':iaScuola,prossimipassi:prossimiPassi,info,'bussola-via':bussolaVia,grazie},minutes,optional,
    order:chapters.flatMap(c=>c.ids),extra:chapters.filter(c=>c.extra).flatMap(c=>c.ids),chapterOf:id=>chapters.findIndex(c=>c.ids.includes(id))};

  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-ia-vote]');if(!b)return;
    const yes=b.dataset.iaVote==='si',box=document.getElementById('ia-reveal');
    document.getElementById('ia-reveal-title').textContent=yes?'Attenzione: è un tranello.':'Hai fatto bene a dubitare.';
    box.hidden=false;document.querySelectorAll('[data-ia-vote]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  });
})();
