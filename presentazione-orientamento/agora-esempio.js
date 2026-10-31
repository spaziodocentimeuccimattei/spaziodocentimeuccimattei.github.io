/* Immagini fornite dall’utente: spazio attuale e proposta illustrativa, integre. */
addEventListener('DOMContentLoaded',()=>{
  const images=[
    {file:'agora-spazio-attuale.png',title:'Lo spazio attuale',status:'Un luogo reale della nostra scuola',alt:'Lo spazio attuale della scuola con colonne e distributori automatici',caption:'Partiamo da come viviamo gli spazi e dalle idee degli studenti.',next:'E se diventasse così? →'},
    {file:'agora-possibilita.png',title:'Una possibile Agorà',status:'Proposta illustrativa · Da progettare insieme',alt:'Ipotesi illustrativa dell’Agorà con lettura, studio, incontro e partecipazione',caption:'Gli studenti partecipano alle scelte sugli usi, sulle regole e sulla cura dello spazio.',next:'← Rivedi lo spazio attuale'}
  ];
  const viewer=document.getElementById('viewer');let current=0;
  function render(){
    const item=images[current];
    document.getElementById('viewer-content').innerHTML=`<article class="agora-story"><header class="agora-story-head"><div><p>Abitare la scuola · Un esempio concreto</p><h2 id="agora-title" tabindex="-1">${item.title}</h2><span class="agora-status">${item.status}</span></div><div class="agora-switch" role="group" aria-label="Lo spazio attuale e una possibile trasformazione"><button data-agora-image="0" aria-pressed="${current===0}">Lo spazio attuale</button><button data-agora-image="1" aria-pressed="${current===1}">Una possibilità</button></div></header><figure class="agora-story-image"><img src="assets/${item.file}" alt="${item.alt}"></figure><footer class="agora-story-footer"><p>${item.caption}</p><button data-agora-image="${current===0?1:0}">${item.next}</button></footer></article>`;
    document.getElementById('agora-title').focus({preventScroll:true});
  }
  function open(){
    document.querySelectorAll('video').forEach(v=>v.pause());
    current=0;viewer.classList.add('agora-open');viewer.setAttribute('aria-label','Abitare la scuola: lo spazio attuale e una possibile Agorà');
    render();if(!viewer.open)viewer.showModal();document.getElementById('agora-title').focus({preventScroll:true});
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-agora-open')){open();return}
    if(b.dataset.agoraImage!==undefined&&viewer.open&&viewer.classList.contains('agora-open')){current=+b.dataset.agoraImage;render()}
  });
  document.addEventListener('keydown',event=>{
    if(!viewer.open||!viewer.classList.contains('agora-open'))return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();current=event.key==='ArrowRight'?1:0;render()}
  });
  viewer.addEventListener('close',()=>{if(viewer.classList.contains('agora-open')){viewer.classList.remove('agora-open');viewer.removeAttribute('aria-label');current=0}});
  // Il poster contiene già testi e loghi: mostrarlo per intero e renderlo apribile.
  const image=document.getElementById('learning-image'),figure=image.closest('figure');
  function updateLearning(){
    const first=document.querySelector('[data-learning="0"]').getAttribute('aria-pressed')==='true';
    figure.classList.toggle('agora-learning',first);
    if(first){image.setAttribute('role','button');image.tabIndex=0;image.setAttribute('aria-label','Apri lo spazio attuale e una possibile Agorà');if(!figure.querySelector('[data-agora-open]')){const button=document.createElement('button');button.dataset.agoraOpen='';button.textContent='Apri l’esempio ↗';figure.querySelector('figcaption').append(button)}}
    else {image.removeAttribute('role');image.removeAttribute('tabindex');image.removeAttribute('aria-label')}
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-learning]'))updateLearning();
    if(event.target===image&&figure.classList.contains('agora-learning'))open();
  });
  image.addEventListener('keydown',event=>{if(figure.classList.contains('agora-learning')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopPropagation();open()}});
  updateLearning();
});
