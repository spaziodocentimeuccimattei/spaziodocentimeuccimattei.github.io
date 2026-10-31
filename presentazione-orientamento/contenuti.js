/* Fonti e corrispondenze complete in STORYBOARD.md e FONTI.md. */
window.SCUOLA = {
  photos: {
    moDigitale:{file:"mo-digitale-ia.jpg",caption:"Digitale e IA · Esplorare strumenti, verificare e capire",group:"Metodologie operative · SSAS"},
    moScrittura:{file:"mo-scrittura.jpg",caption:"Scrittura autobiografica · Conoscersi, raccontarsi e ascoltare",group:"Metodologie operative · SSAS"},
    moAmicizia:{file:"mo-amicizia.jpg",caption:"Relazioni · Conoscersi e stare bene insieme",group:"Metodologie operative · SSAS"},
    moOrientamento:{file:"mo-orientamento-digitale.jpg",caption:"Orientamento e strumenti digitali · Imparare facendo",group:"Metodologie operative · SSAS"},
    moPartecipazione:{file:"mo-partecipazione.jpg",caption:"Partecipazione · Dare spazio alle idee degli studenti",group:"Metodologie operative · SSAS"},
    moRelazioni:{file:"mo-relazioni.jpg",caption:"Metodologie operative · Relazioni e collaborazione nel gruppo",group:"Metodologie operative · SSAS"},
    moManipolazione:{file:"mo-manipolazione.jpg",caption:"Manipolazione artistica · Progettare e costruire materiali",group:"Metodologie operative · SSAS"},
    moAnimazione:{file:"mo-animazione.jpg",caption:"Animazione · Dare forma a idee e personaggi",group:"Metodologie operative · SSAS"},
    moCooperazione:{file:"mo-cooperazione.jpg",caption:"Attività di gruppo · Coordinarsi, provare e collaborare",group:"Metodologie operative · SSAS"},
    moSimulazione:{file:"mo-simulazione.jpg",caption:"Sperimentazione · Inventare e provare attività insieme",group:"Metodologie operative · SSAS"},
    moClima:{file:"mo-clima.jpg",caption:"Vita del gruppo · Complicità, sorrisi e amicizia",group:"Metodologie operative · SSAS"},
    moRolePlaying:{file:"mo-role-playing.jpg",caption:"Role playing e lavoro di gruppo · Esplorare ruoli e punti di vista",group:"Metodologie operative · SSAS"},
    moSensoriale:{file:"mo-sensoriale.jpg",caption:"Laboratorio sensoriale · Osservare e confrontare le percezioni",group:"Metodologie operative · SSAS"},
    moSanitaSociale:{file:"mo-sanita-sociale.jpg",caption:"Sanità e sociale · Sperimentare strumenti e situazioni in laboratorio",group:"Metodologie operative · SSAS"},

    scuola:{file:'scuola.webp',caption:'La sede di Decimomannu · Via Ugo Foscolo 48',group:'Spazi'},
    scienze:{file:'scienze.jpg',caption:'Scienze · Osservare e sperimentare in laboratorio',group:'Laboratori'},
    lingue:{file:'lingue.jpg',caption:'Lingue · Gli strumenti per comunicare',group:'Laboratori'},
    informatica:{file:'informatica.jpg',caption:'Informatica · Lavorare con dati e strumenti digitali',group:'Laboratori'},
    musica:{file:'musica.jpg',caption:'Aula musica · Suonare e ascoltare insieme',group:'Laboratori'},
    topografia:{file:'topografia.jpg',caption:'Topografia e disegno · Strumenti per leggere gli spazi',group:'Laboratori'},
    scrittura:{file:'metodologie-gruppo.jpg',caption:'Scrittura autobiografica · Raccontarsi e ascoltare',group:'Laboratori'},
    creativita:{file:'metodologie-creativita.jpg',caption:'Laboratorio creativo · Progettare attività insieme',group:'Laboratori'},
    progetto:{file:'metodologie-progetto.jpg',caption:'Metodologie operative · Dall’idea al progetto di intervento',group:'Laboratori'},
    lavoro:{file:'pcto-lavoro.jpg',caption:'PCTO · Incontrare contesti di lavoro e professionisti',group:'Esperienze'},
    premio:{file:'progetto-premio.jpg',caption:'Progetti · Presentare il lavoro realizzato',group:'Esperienze'},
    monumenti:{file:'monumenti-aperti.jpg',caption:'Monumenti Aperti · Gli studenti raccontano il patrimonio',group:'Territorio'},
    museo:{file:'uscita-museo.jpg',caption:'Uscite didattiche · Conoscere attraverso i luoghi',group:'Territorio'},
    citta:{file:'uscita-citta.jpg',caption:'In viaggio · La città diventa un’aula',group:'Territorio'},
    m9:{file:'museo-m9.jpg',caption:'M9, Museo del ’900 · Incontrare la storia',group:'Territorio'},
    intervista:{file:'territorio-intervista.jpg',caption:'Territorio · Raccontare un’esperienza',group:'Territorio'},
    cultura:{file:'cultura-sarda.jpg',caption:'Uscite didattiche · Conoscere la cultura della Sardegna',group:'Territorio'},
    arte:{file:'arte-strada.jpg',caption:'Arte e territorio · Osservare e interpretare',group:'Territorio'},
    erasmusStudenti:{file:'erasmus-studenti.jpg',caption:'Erasmus+ · Esperienze europee degli studenti',group:'Europa'},
    erasmusDocenti:{file:'erasmus-docenti.jpg',caption:'Erasmus+ · Formazione e scambio tra docenti',group:'Europa'},
    stampa:{file:'stampa-3d.jpg',caption:'Tecnologie · Dalla rappresentazione alla stampa 3D',group:'Laboratori'},
    insieme:{file:'lavoro-insieme.jpg',caption:'In classe · Imparare con gli altri',group:'Laboratori'},
    romanico1:{file:'romanico-1.jpg',caption:'Giovani guide del Romanico · Raccontare un monumento',group:'Territorio'},
    romanico2:{file:'romanico-2.jpg',caption:'Giovani guide del Romanico · Prepararsi sul campo',group:'Territorio'},
    romanico3:{file:'romanico-3.jpg',caption:'Giovani guide del Romanico · Patrimonio e partecipazione',group:'Territorio'},
    vela1:{file:'vela-1.jpg',caption:'Vela accessibile · Partecipare all’esperienza insieme',group:'Inclusione'},
    vela2:{file:'vela-2.jpg',caption:'Vela accessibile · Collaborare in barca',group:'Inclusione'},
    vela3:{file:'vela-3.jpg',caption:'Vela accessibile · Relazioni, autonomia e collaborazione',group:'Inclusione'},
    autore:{file:'incontro-autore-barbara-serra.jpg',caption:'Incontri con l’autore · Fascismo in famiglia, di Barbara Serra',group:'Lettura e incontri'},
    cat:{file:'pcto-cat.jpg',caption:'PCTO CAT · Stage, catamarano e rilievo con drone',group:'Esperienze'}
  },
  courses:[
    {id:'afm',code:'AFM',name:'Amministrazione, Finanza e Marketing',field:'Economia, risorse, decisioni',question:'Come trasformi un’idea in un’attività?',color:'#00823f',panels:[
      '<p>Leggi dati economici, organizzi risorse, confronti costi e prendi decisioni.</p><p>Impari a capire come funziona un’impresa.</p>',
      '<p>Economia aziendale · Diritto · Economia politica · Informatica · Lingue.</p><p class="small-note">Analisi dei dati, organizzazione, comunicazione e lavoro di gruppo.</p>',
      '<p>Università in ambito economico e giuridico, ITS Academy, attività amministrative e aziendali.</p><p class="small-note">Uffici contabili, aziende finanziarie, assicurazioni e pubblica amministrazione: accessi e mansioni richiedono i rispettivi requisiti.</p>'
    ]},
    {id:'sia',code:'SIA',name:'Sistemi Informativi Aziendali',field:'Dati, programmi, soluzioni',question:'Come può un programma semplificare un’attività?',color:'#58bba9',photo:'informatica',visual:'Informatica + economia',panels:[
      '<p>Organizzi informazioni, descrivi processi e progetti soluzioni digitali per le organizzazioni.</p><p class="small-note">SIA si sceglie dal terzo anno, dopo il biennio AFM. In prima ci si iscrive ad AFM.</p>',
      '<p>Informatica · Economia aziendale · Diritto · Economia politica · Lingue.</p><p class="small-note">Programmazione, archivi di dati, problem solving e processi aziendali.</p>',
      '<p>Università in ambito informatico ed economico-giuridico, ITS Academy e sistemi informativi aziendali.</p><p class="small-note">Software, elaborazione dati, assistenza informatica, credito, assicurazioni e pubblica amministrazione, secondo i requisiti dei ruoli.</p>'
    ]},
    {id:'turismo',code:'Turismo',name:'Indirizzo tecnico · settore economico',field:'Lingue, luoghi, accoglienza',question:'Come fai scoprire un luogo a chi non lo conosce?',color:'#ef0b62',photo:'romanico1',visual:'Lingue + territorio',panels:[
      '<p>Progetti itinerari, racconti il patrimonio e prepari esperienze di accoglienza.</p><p>Conosci luoghi e culture attraverso le lingue.</p>',
      '<p>Discipline turistiche e aziendali · Diritto e legislazione turistica · Arte e territorio · Geografia turistica · Seconda e terza lingua comunitaria.</p>',
      '<p>Università in ambito linguistico ed economico-giuridico, ITS Academy e servizi turistici.</p><p class="small-note">Accoglienza, marketing e promozione, tour operator, crociere e strutture ricettive. Alcune professioni richiedono ulteriori titoli o abilitazioni.</p>'
    ]},
    {id:'cat',code:'CAT 4+2',name:'Costruzioni, Ambiente e Territorio',field:'Spazi, sostenibilità, progetto',question:'Come progetti spazi che funzionano meglio?',color:'#79cf1b',photo:'cat',visual:'Rilievo + progetto + energia',panels:[
      '<p>Misuri, rappresenti e progetti. Usi strumenti digitali, rilievo e modelli per leggere edifici e territorio.</p><p class="small-note">Diploma in 4 anni. Il successivo +2 all’ITS Academy è facoltativo.</p>',
      '<p>Progettazione, costruzioni e impianti · Rilievo e geomatica · Estimo · Cantiere e sicurezza · Tecnologie digitali e BIM.</p><p class="small-note">Edifici, energia e ambiente; esperienze di rilievo e documentazione del patrimonio.</p>',
      '<p>Dopo il diploma quadriennale: università, ITS Academy o lavoro. Il diploma ha lo stesso valore legale del corrispondente quinquennale.</p><p class="small-note">Ingegneria, architettura, agraria, studi tecnici e costruzioni. La libera professione richiede il percorso e l’abilitazione previsti.</p>'
    ]},
    {id:'ssas',code:'SSAS',name:'Servizi per la Sanità e l’Assistenza Sociale',field:'Persone, salute, comunità',question:'Come aiuti una persona a partecipare e stare meglio?',color:'#ef0b62',photo:'moRelazioni',visual:'Ascolto + metodo + cura',panels:[
      '<p>Osservi i bisogni, costruisci relazioni e progetti attività per il benessere e la partecipazione.</p><p>La cura si impara anche attraverso l’esperienza.</p>',
      '<p>Scienze umane e sociali · Igiene e cultura medico-sanitaria · Metodologie operative · Psicologia generale e applicata · Diritto ed economia.</p>',
      '<p>Università e formazione in ambito sociale, educativo, psicologico, sanitario e della riabilitazione; servizi al cittadino, cooperative e strutture sociali.</p><p class="small-note">Il diploma non assegna automaticamente qualifiche come OSS, infermiere, educatore o assistente sociale.</p>'
    ]}
  ],
  chapters:[
    {year:'1977',title:'Le origini',copy:'Si parte dalla ragioneria. Nel 1982/83 nasce l’istituto autonomo Enrico Mattei.',file:'storia-origini.mp4',seconds:'28',playLabel:'Guarda le origini',map:'<span>All’inizio</span><strong>Ragioneria</strong>'},
    {year:'1996–2018',title:'Gli indirizzi cambiano',copy:'Arrivano turismo e programmazione. La riforma ridefinisce gli indirizzi; nel 2018 si aggiunge SSAS.',file:'storia-indirizzi.mp4',seconds:'36',playLabel:'Guarda il cambiamento',map:'<span>Dalla ragioneria ai percorsi di oggi</span><strong>AFM · SIA · Turismo<br>CAT · SSAS</strong>'},
    {year:'Oggi',title:'Chi siamo',copy:'Una scuola legata al territorio, alle conoscenze, alle competenze e alla crescita delle persone.',file:'storia-oggi.mp4',seconds:'23',playLabel:'La nostra idea di scuola',map:'<span>Una formazione che tiene insieme</span><strong>Cultura · Esperienza<br>Persone · Professioni</strong>'}
  ],
  demo:[
    {label:'Persone e benessere',detail:'Capire come si sentono le persone e che cosa può aiutarle nella vita di tutti i giorni.'},
    {label:'Spazi da immaginare',detail:'Disegnare una stanza o un edificio e capire come vengono realizzati.'},
    {label:'Soldi e scelte quotidiane',detail:'Capire come si usano i soldi e come si confrontano prezzi e spese.'},
    {label:'App e informazioni',detail:'Scoprire come funzionano app e programmi e come si usano le informazioni.'},
    {label:'Lingue e luoghi',detail:'Parlare altre lingue e raccontare luoghi attraverso parole e immagini.'}
  ]
};
