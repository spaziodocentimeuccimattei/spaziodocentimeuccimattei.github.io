window.SPUNTI_ACCOGLIENZA=[
  {label:'Sentirsi parte',title:'Che cosa ti aiuta a entrare nel gruppo?',text:'Conoscersi, lavorare con i compagni e avere un ruolo nelle attività.',speaker:'Partire da un esempio concreto di accoglienza o di lavoro cooperativo. La foto della vela mostra una stessa esperienza resa accessibile con strumenti, ruoli e accompagnamento diversi.'},
  {label:'Il tuo modo di imparare',title:'Di cosa hai bisogno per imparare?',text:'Spiegazioni chiare, tempi adatti, mappe e strumenti diversi: si cerca il modo che ti aiuta.',speaker:'Mostrare un esempio semplice di consegna, mappa o strumento digitale. Personalizzare riguarda attività, tempi, materiali e modi di mostrare ciò che si è imparato; gli strumenti si scelgono a partire dai bisogni della persona.'},
  {label:'Chiedere aiuto',title:'Se qualcosa diventa difficile?',text:'Puoi parlarne. Docenti e compagni possono aiutarti a trovare un passo possibile.',speaker:'Spiegare il ruolo della collega insieme agli altri docenti: osservare, progettare e rendere possibile la partecipazione. Parlare di fiducia, richiesta di aiuto e piccoli progressi, senza attribuire diagnosi o difficoltà agli studenti ritratti.'},
  {label:'Scuola e famiglia',title:'Chi costruisce il percorso con te?',text:'Tu, la tua famiglia e i docenti condividete bisogni, obiettivi e progressi.',speaker:'Raccontare come il confronto con lo studente, la famiglia e la scuola media aiuta il passaggio. Quando necessario entrano in gioco anche le altre figure che seguono il percorso. Per situazioni personali invitare a un colloquio riservato con la scuola.'}
];
window.SCENA_ACCOGLIENZA={
  id:'inclusione',title:'Una scuola per ciascuno',class:'inclusion inclusion-expanded',
  note:`INTERVENTO DELLA COLLEGA DI SOSTEGNO
La schermata parla a tutti: partecipare, imparare, avere un ruolo e trovare sostegno quando serve. I quattro pulsanti permettono di scegliere il filo del racconto. Restare su esempi concreti e riconoscibili per una terza media.

1. SENTIRSI PARTE
Accoglienza, conoscenza reciproca, lavoro con i compagni. Nella foto della vela il protagonista partecipa alla stessa esperienza del gruppo, con accompagnamento e strumenti adatti. Evitare di raccontarla come un gesto di pietà o di dedurre condizioni personali dalla fotografia.

2. TROVARE IL PROPRIO MODO DI IMPARARE
Far vedere o descrivere una consegna resa più chiara, una mappa, un materiale o uno strumento digitale. Spiegare che attività, tempi e modalità di lavoro si costruiscono sui bisogni reali. I percorsi personalizzati si progettano insieme: non esiste un unico strumento adatto a tutti.

3. SAPERE A CHI CHIEDERE AIUTO
La collega lavora insieme agli altri docenti per osservare, progettare e rendere possibile la partecipazione nelle attività della classe. Citare collaborazione, fiducia, gestione delle difficoltà e riconoscimento dei progressi. Presentare il sostegno come una risorsa per la vita della classe, senza etichette rivolte alle persone.

4. COSTRUIRE CONTINUITÀ
Studente, famiglia e scuola condividono informazioni utili, obiettivi e verifiche dei progressi. Raccontare il raccordo con la scuola media e, quando necessario, con le altre figure del percorso. Per bisogni specifici proporre un colloquio riservato, senza entrare in storie personali davanti alla platea.

CHIUSURA POSSIBILE
«Qual è una cosa che ti aiuta a imparare e a stare bene in un gruppo?» Una risposta breve può collegare il tema alle esperienze dei ragazzi. Lasciare visibili i contatti della scuola.`,
  html:`<div class="inclusion-photo"><button class="photo-button" data-photo="vela1" aria-label="Ingrandisci l’esperienza di vela"><img src="assets/vela-1.jpg" alt="Un’esperienza di vela con accompagnamento e strumenti per partecipare"><span class="enlarge" aria-hidden="true">⤢</span><span class="photo-caption">Vela accessibile · Partecipare all’esperienza insieme</span></button></div><div class="inclusion-copy"><p class="kicker">Una scuola per ciascuno</p><h2>Partecipare.<br>Con i propri strumenti.</h2><p class="lead">Il tuo modo di imparare conta.<br>Il percorso si costruisce insieme.</p><div class="support-topics" role="group" aria-label="Quattro spunti per partecipare alla vita della scuola">${SPUNTI_ACCOGLIENZA.map((t,i)=>`<button data-support="${i}" aria-pressed="${i===0}">${t.label}</button>`).join('')}</div><div class="support-detail" id="support-detail" aria-live="polite"><h3>${SPUNTI_ACCOGLIENZA[0].title}</h3><p>${SPUNTI_ACCOGLIENZA[0].text}</p></div></div>`
};
addEventListener('DOMContentLoaded',()=>document.addEventListener('click',event=>{
  const b=event.target.closest('[data-support]');if(!b)return;
  const t=SPUNTI_ACCOGLIENZA[+b.dataset.support],detail=document.getElementById('support-detail');
  detail.innerHTML=`<h3>${t.title}</h3><p>${t.text}</p>`;
  document.querySelectorAll('[data-support]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  try{const state=JSON.parse(localStorage.getItem('mattei-v02-relatore'));if(state){state.note='SPUNTO SELEZIONATO · '+t.label+'\n'+t.speaker+'\n\n'+SCENA_ACCOGLIENZA.note;localStorage.setItem('mattei-v02-relatore',JSON.stringify(state))}}catch(_){}
}));
