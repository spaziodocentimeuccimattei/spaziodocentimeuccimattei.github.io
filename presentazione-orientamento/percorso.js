/* Percorso della presentazione: atti, ordine delle schermate, battute del relatore,
   sezione sull'IA e schermate finali compatte. Si carica prima di presentazione.js. */
(() => {
  'use strict';
  const k=t=>`<p class="kicker">${t}</p>`;

  /* Studiare nell'epoca dell'IA · tre temi comuni a Linee guida MIM sull'IA a scuola (2025),
     Linee guida per l'educazione civica (D.M. 183/2024) e UNESCO (2024): capire, verificare, decidere. */
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

  const iaScuola={id:'ia-scuola',title:'Imparare serve ancora · Che cosa insegniamo sull’IA',class:'paper ia-school',
    note:'Tre temi per introdurre e studiare l’IA a scuola, comuni alle fonti: Linee guida MIM per l’introduzione dell’IA nelle istituzioni scolastiche (2025), § 4.4 (potenzialità e limiti, «allucinazioni», senso critico, uso che non danneggi il proprio apprendimento) e § 3.1 (intervento e sorveglianza umana, trasparenza, dati); Linee guida per l’educazione civica, D.M. 183/2024, cittadinanza digitale (valutare fonti, dichiarare ciò che è prodotto dal programma, proteggere i dati); UNESCO, AI competency framework for students (2024). Le attività «In classe» generalizzano a tutti gli indirizzi tre attività del programma dei contenuti IA (smistamento IA/non IA, verifica di una risposta generata, bozza personale con nota d’uso). Non citare progetti interni.',
    html:`<div class="ia-school-head">${k('Studiare nell’epoca dell’IA')}<h2 class="enter">Imparare serve ancora.<br><span>Anzi, serve di più.</span></h2></div>
    <div class="ia-pillars">
      <div class="ia-pillar enter"><small>01</small><h3>Capire</h3><p><b>Potenzialità e limiti.</b> Non cerca, <b>genera</b>: impara dai dati e può inventare con sicurezza.</p><div class="ia-class"><span>In classe</span><b>IA o non IA?</b> Smistiamo strumenti di tutti i giorni (navigatore, traduttore, assistente vocale) e scopriamo da quali dati imparano.</div></div>
      <div class="ia-pillar enter"><small>02</small><h3>Verificare</h3><p><b>Controllare le fonti</b> prima di fidarsi. <b>Proteggere i dati</b>, propri e degli altri.</p><div class="ia-class"><span>In classe</span><b>Caccia all’errore.</b> Una risposta del chatbot, le fonti vere: ogni frase si segna come confermata, falsa o incerta.</div></div>
      <div class="ia-pillar enter"><small>03</small><h3>Decidere</h3><p><b>L’ultima parola è di una persona.</b> Dichiari quando l’IA ti ha aiutato.</p><div class="ia-class"><span>In classe</span><b>Prima la tua bozza.</b> Poi il confronto con l’IA, la revisione motivata e una nota che dichiara l’aiuto ricevuto.</div></div>
    </div>
    <div class="ia-work"><strong>Come la affrontiamo</strong><span><b>Prima il tuo lavoro</b>, poi l’IA: serve a imparare, non a saltare la fatica.</span><span><b>Con la guida del docente</b>, a ogni età il suo passo.</span><span><b>Ne parliamo insieme</b>: studenti, docenti e famiglie.</span></div>`};

  /* Il prossimo passo: Open Day, Bussola e iscrizione in un’unica schermata. */
  const prossimiPassi={id:'prossimipassi',title:'Il prossimo passo · Visite, Bussola, iscrizione',class:'navy nextsteps nextsteps-compact',
    note:'Riunisce le vecchie schermate Bussola e Open Day; la Bussola qui è solo annunciata, si apre nell’ultima schermata. Date di Open Day e iscrizioni: si seguono sul sito ufficiale, non inventare scadenze 2027/28. SIA: in prima si sceglie AFM.',
    html:`<div class="nextsteps-left">${k('Il prossimo passo')}<h2 class="enter">Vieni a vedere.<br>Prova.<br><span class="lime">Scegli.</span></h2></div>
    <div class="nextsteps-list">
      <div class="nextsteps-item"><small>01</small><div><h3>Vieni a vedere</h3><p>Open Day e visite su appuntamento.</p><a class="text-button" href="mailto:orientamattei@gmail.com?subject=Orientamento%20-%20Visita%20alla%20sede">Chiedi una visita ↗</a></div></div>
      <div class="nextsteps-item"><small>02</small><div><h3>Prova la Bussola</h3><p>Tra poco, sul tuo Chromebook. Poi anche a casa, con la famiglia.</p></div></div>
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
    note:'Ultima schermata: resta proiettata durante il lavoro individuale sui Chromebook. «Proviamo insieme» apre la dimostrazione dal palco (nessun nominativo, nessun salvataggio): bastano una o due domande, poi si passa ai Chromebook. Non ci sono codici: si scrive l’indirizzo principale del sito e si sceglie «La Bussola» nel menu. Se il Chromebook è già stato usato da un altro ragazzo, compare «Riprendi la tua Bussola»: va scelto «Inizia una nuova Bussola». La Bussola non assegna un indirizzo: dà indicazioni motivate da approfondire.',
    html:`<div class="launch-copy">${k('Ora tocca a voi')}<h2 class="enter">Prendete<br>il Chromebook.</h2><div class="launch-url"><span>Scrivi nella barra degli indirizzi</span><strong>spaziodocentimeuccimattei<wbr>.github.io</strong><em>poi nel menu scegli <b>La Bussola</b></em></div><div class="launch-actions"><button class="btn" id="open-demo">Proviamo insieme la prima domanda →</button><img src="assets/qr-bussola.svg" alt="QR per aprire la Bussola"></div></div>
    <ol class="launch-steps">
      <li><small>01</small><div><h3>Apri la Bussola</h3><p>Dal sito, voce <b>La Bussola</b> nel menu. Chromebook già usato da un altro? Scegli <b>«Inizia una nuova Bussola»</b>.</p></div></li>
      <li><small>02</small><div><h3>Rispondi a 12 domande</h3><p>Non ci sono risposte giuste. <b>Al tuo ritmo.</b></p></div></li>
      <li><small>03</small><div><h3>Prova le attività</h3><p>Degli indirizzi che ti incuriosiscono. <b>Le ragioni restano a te.</b></p></div></li>
    </ol>`};

  const chapters=[
    {label:'La domanda',ids:['benvenuti','imparare','ia-domanda','ia-scuola']},
    {label:'Chi siamo',ids:['coetanei','storia','convegno','abitare','metodo']},
    {label:'Che cosa studi',ids:['indirizzi','afm','sia','turismo','cat','ssas','serali']},
    {label:'Come si impara',ids:['laboratori','metodologie','fsl','fuori-aula','erasmus','tecnologie']},
    {label:'Per ciascuno',ids:['inclusione','vita']},
    {label:'Il prossimo passo',ids:['prossimipassi','info','contatti','bussola-via']}
  ];

  /* Scaletta da 30 minuti (in minuti per schermata); le facoltative si saltano se si è in ritardo. */
  const minutes={benvenuti:.5,imparare:1,'ia-domanda':2,'ia-scuola':2,
    coetanei:1,storia:1,convegno:.5,abitare:1,metodo:1,
    indirizzi:.5,afm:1.5,sia:1,turismo:1.5,cat:1.5,ssas:1.5,serali:.5,
    laboratori:.5,metodologie:1.5,fsl:1,'fuori-aula':1,erasmus:1,tecnologie:.5,
    inclusione:1,vita:.5,
    prossimipassi:1,info:.5,contatti:.5,'bussola-via':3};
  const optional=['convegno','serali','fuori-aula','tecnologie','vita'];

  /* Che cosa dire: una battuta e il passaggio alla schermata successiva. */
  const say={
    benvenuti:'Avvia con o senza audio. Presentati in una frase e annuncia: «Oggi partiamo da una domanda».',
    imparare:'Fai la domanda e aspetta. Raccogli due risposte dal pubblico. Poi: «E se lo chiedessimo a un’intelligenza artificiale?»',
    'ia-domanda':'Leggi la domanda al chatbot, poi la risposta. Fai votare per alzata di mano, poi svela. «Sembrava vero. Ecco perché a scuola si impara anche questo.»',
    'ia-scuola':'Tre parole: capire, verificare, decidere. «Non vietiamo l’IA e non la lasciamo fare da sola: la insegniamo.» Per ogni tema leggi l’attività «In classe»: è quello che faranno davvero. Chiudi con la riga in basso: prima il tuo lavoro, con la guida del docente, insieme alle famiglie.',
    coetanei:'Fai scegliere la risposta. «Non siete soli: tanti ragazzi della vostra età vivono qui intorno.»',
    storia:'Una clip, al massimo due. «Siamo nati come ragioneria: oggi gli indirizzi sono cinque.»',
    convegno:'«Ci chiediamo che cosa serve alla scuola di oggi»: indica i quattro temi, compreso quello sull’IA appena visto.',
    abitare:'Gli studenti partecipano alle scelte sugli spazi. Fai vedere un esempio: l’Agorà.',
    metodo:'Scegli una sola delle quattro voci, quella più vicina al pubblico. «Si impara anche abitando bene la scuola.»',
    indirizzi:'«Cinque domande diverse: quale vi incuriosisce?» Puoi cliccare l’indirizzo che il pubblico sceglie.',
    afm:'Leggi la domanda. Muovi il cursore dei costi. Indica le materie di indirizzo in evidenza.',
    sia:'Ricorda: in prima ci si iscrive ad AFM, SIA si sceglie dal terzo anno. Indica le materie.',
    turismo:'Leggi la domanda e indica le tre lingue. Le giovani guide del Romanico sono studenti della scuola.',
    cat:'Diploma in quattro anni, con lo stesso valore del quinquennale. Il +2 all’ITS è facoltativo.',
    ssas:'Leggi la domanda. Indica le materie di indirizzo, Metodologie operative in testa. Il diploma non dà da solo qualifiche come OSS o educatore.',
    serali:'Un minuto per le famiglie: anche gli adulti possono riprendere gli studi.',
    laboratori:'Lascia parlare le foto. Premi «Guarda» se vuoi la sequenza.',
    metodologie:'«Qui si impara facendo»: avvia la sequenza delle foto e commenta due attività.',
    fsl:'Quello che studi incontra il lavoro: stage presso imprese, enti e servizi.',
    'fuori-aula':'Il territorio è un’aula: musei, patrimonio, uscite.',
    erasmus:'Europa e lingue insieme: mobilità Erasmus+ e certificazioni in inglese, francese e spagnolo.',
    tecnologie:'Dal disegno all’oggetto: stampa 3D, drone, modelli digitali.',
    inclusione:'Una scuola per ciascuno: scegli una delle quattro domande.',
    vita:'Chiudi la parte delle esperienze con le persone: progetti, incontri, amicizie.',
    prossimipassi:'Tre passi: vieni a vedere, prova la Bussola, iscriviti. «La Bussola la provate tra due minuti.»',
    info:'Orari e come arrivare, in trenta secondi.',
    contatti:'«Segnate il numero e l’email, anche per i vostri genitori.» Raccogli una o due domande, poi passa all’ultima schermata.',
    'bussola-via':'«Ora tocca a voi.» Fai insieme la prima domanda dal palco. Poi tutti sul Chromebook: scrivono l’indirizzo del sito e li guidi a «La Bussola» nel menu. Lascia questa schermata proiettata finché lavorano.'
  };

  window.PERCORSO={chapters,say,scenes:{'ia-domanda':iaDomanda,'ia-scuola':iaScuola,prossimipassi:prossimiPassi,info,'bussola-via':bussolaVia},minutes,optional,
    order:chapters.flatMap(c=>c.ids),chapterOf:id=>chapters.findIndex(c=>c.ids.includes(id))};

  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-ia-vote]');if(!b)return;
    const yes=b.dataset.iaVote==='si',box=document.getElementById('ia-reveal');
    document.getElementById('ia-reveal-title').textContent=yes?'Attenzione: è un tranello.':'Hai fatto bene a dubitare.';
    box.hidden=false;document.querySelectorAll('[data-ia-vote]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  });
})();
