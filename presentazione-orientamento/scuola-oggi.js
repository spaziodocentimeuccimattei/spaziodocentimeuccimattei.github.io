window.SCUOLA_OGGI = [
  {
    id:'abitare',title:'La scuola oggi · Abitare la scuola',class:'navy project-scene',
    note:'Fonte: progetto completo Abitare la scuola nella raccolta PTOF 2026-2027, coordinato al bilancio partecipativo Partecipo e Conto. Il percorso partecipativo è avviato; trasformazioni, importi e attuazione restano proposti e subordinati a fattibilità e scelte. L’orto esiste già. Tre azioni integrate: Agorà, cortile, orto. Gli studenti propongono, discutono e votano. La clip estesa 205.0–239.1 (34,1s) conserva la voce originale: valore culturale della scuola, rapporto con studenti e comunità, poi nascita di Abitare la scuola. Nella premessa si vedono la sede e il lavoro insieme, al posto delle note del piano social nel filmato di lavoro; la parte 3D mantiene Avviato/Proposto. La domanda iniziale collega benessere, apprendimento, partecipazione e cura: non è solo rinnovo degli arredi. Non mostrare budget indicativi come fondi assegnati.',
    html:`<div class="project-layout"><div class="project-copy"><p class="kicker">La scuola oggi · Partecipo e Conto</p><h2>Abitare<br>la scuola.</h2><p class="project-intro">Gli studenti partecipano alle scelte<br>e alla trasformazione degli spazi.</p><div id="project-words" class="project-words is-reflection"><small>L’idea da cui partiamo</small><h3>Come possiamo vivere<br>meglio la scuola?</h3><p>Imparare insieme, stare bene e avere voce nelle decisioni. Gli spazi diventano luoghi di incontro e di cura condivisa.</p></div><p class="project-path">Proporre <span>→</span> Discutere <span>→</span> Votare</p></div><div class="project-media"><div class="video-frame"><video id="project-video" src="assets/abitare-riflessione.mp4" poster="assets/scuola.webp" controls playsinline preload="metadata" aria-label="Abitare la scuola: il progetto partecipativo"></video><button id="project-play" class="play-overlay"><span class="play-pill"><b aria-hidden="true">▶</b> Da dove nasce il progetto · 34 secondi</span></button></div><div class="project-tabs" role="group" aria-label="Le tre proposte per gli spazi"><button data-project="3" aria-pressed="true">L’idea</button><button data-project="0" aria-pressed="false">Agorà</button><button data-project="1" aria-pressed="false">Cortile</button><button data-project="2" aria-pressed="false">Orto inclusivo</button></div><div class="project-actions"><button class="text-button" data-agora-open>Un esempio: l’Agorà ↗</button><button class="text-button" id="project-sequence">Mostra le tre proposte ▶</button></div></div></div>`
  },
  {
    id:'convegno',title:'La scuola oggi · La proposta del convegno',class:'paper conference-scene',
    note:'Fonte corrente: 05_Convegno_L importanza della scuola oggi_progetto.docx, revisione culturale 26 ottobre. Proposta pubblica, critica e divulgativa, aperta alla cittadinanza, con voce autonoma degli studenti. Quattro nuclei. Data, sede, ospiti, collaborazione Comune e programma da concordare. Non annunciare relatori o date inesistenti. L’offerta formativa entra come esperienza collegata alle questioni educative, non sostituisce lo scopo culturale. I pulsanti aprono le domande in forma breve per la platea.',
    html:`<p class="kicker">La scuola oggi · Proposta di convegno aperto al territorio</p><div class="conference-layout"><div class="conference-copy"><h2>L’importanza<br>della scuola<br><span>oggi.</span></h2><p class="lead">Un confronto su adolescenza, apprendimento e comunità educante.</p><p class="conference-voice">Anche la voce degli studenti<br>al centro del confronto.</p></div><div class="conference-themes"><div class="conference-question" id="conference-question">Che cosa ci aiuta a stare bene e a partecipare a scuola?</div><button data-conference="0" aria-pressed="true"><span>01</span>Crescere e stare bene</button><button data-conference="1" aria-pressed="false"><span>02</span>Imparare ed essere valutati</button><button data-conference="2" aria-pressed="false"><span>03</span>Studiare nell’epoca dell’IA</button><button data-conference="3" aria-pressed="false"><span>04</span>Spazi e comunità</button></div></div><div class="conference-people"><span>Studenti</span><span>Docenti</span><span>Famiglie</span><span>Territorio</span></div>`
  }
];

window.addEventListener('DOMContentLoaded',()=>{
  const words=[
    ['Agorà · In progetto','Leggere.<br>Studiare. Incontrarsi.','Uno spazio nell’atrio da progettare con sedute, tavoli e libri.'],
    ['Cortile · In progetto','Imparare<br>anche all’aperto.','Attrezzare spazi per osservare, fare attività e lavorare insieme.'],
    ['Orto già esistente · Da rendere più accessibile','Prendersi cura.<br>Insieme.','Organizzare compiti e strumenti per la partecipazione di tutti.'],
    ['L’idea da cui partiamo','Come possiamo vivere<br>meglio la scuola?','Imparare insieme, stare bene e avere voce nelle decisioni. Gli spazi diventano luoghi di incontro e di cura condivisa.']
  ];
  const projectVideo=document.getElementById('project-video');
  if(projectVideo)projectVideo.src='assets/abitare-riflessione.mp4';
  const questions=[
    'Che cosa ci aiuta a stare bene e a partecipare a scuola?',
    'Come riconosciamo i progressi e affrontiamo le difficoltà?',
    'Come usiamo l’IA mantenendo autonomia e senso critico?',
    'Come rendiamo gli spazi luoghi di apprendimento e di relazione?'
  ];
  let sequence;
  function selectSpace(i){
    const box=document.getElementById('project-words');if(!box)return;
    box.classList.toggle('is-reflection',i===3);
    box.innerHTML=`<small>${words[i][0]}</small><h3>${words[i][1]}</h3><p>${words[i][2]}</p>`;
    box.classList.remove('word-change');void box.offsetWidth;box.classList.add('word-change');
    document.querySelectorAll('[data-project]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.project===i)));
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.project!==undefined){clearInterval(sequence);selectSpace(+b.dataset.project)}
    if(b.dataset.conference!==undefined){const i=+b.dataset.conference,box=document.getElementById('conference-question');box.textContent=questions[i];box.classList.remove('word-change');void box.offsetWidth;box.classList.add('word-change');document.querySelectorAll('[data-conference]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))}
    if(b.id==='project-play')document.getElementById('project-video').play().catch(()=>{});
    if(b.id==='project-sequence'){
      clearInterval(sequence);let i=0;selectSpace(i);sequence=setInterval(()=>{if(!document.getElementById('abitare').classList.contains('active')&&!document.body.classList.contains('explore')){clearInterval(sequence);return}i++;if(i>2){clearInterval(sequence);return}selectSpace(i)},4300);
    }
  });
  const video=document.getElementById('project-video');
  if(video){video.addEventListener('play',()=>{document.getElementById('project-play').hidden=true;Sottofondo.duck(true)});['pause','ended'].forEach(name=>video.addEventListener(name,()=>{Sottofondo.duck(false);if(video.ended)document.getElementById('project-play').hidden=false}))}
});
