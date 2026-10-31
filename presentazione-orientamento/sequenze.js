/* Sequenze fotografiche attivate dal relatore; nessun cambio automatico di slide. */
addEventListener('DOMContentLoaded',()=>{
  const stories={laboratori:['scienze','topografia','musica'],metodologie:['moDigitale','moScrittura','moRolePlaying','moSanitaSociale','moSensoriale','moOrientamento','moManipolazione','moAnimazione','moSimulazione','moCooperazione','moAmicizia','moPartecipazione'],'fuori-aula':['museo','citta','m9','monumenti','romanico2','arte','intervista'],erasmus:['erasmusStudenti','erasmusDocenti']};
  let timer=null,active=null,step=0,previousMix='talk';
  for(const id of Object.keys(stories)){
    const parent=document.querySelector(`#${id} .gallery-controls`)||document.querySelector(`#${id} .erasmus-bottom`);
    if(!parent)continue;const button=document.createElement('button');button.className='sequence-start';button.dataset.sequence=id;button.textContent='Guarda ▶';button.setAttribute('aria-label','Guarda una sequenza di fotografie');parent.append(button);
  }
  function frame(){
    const id=stories[active][step],photo=SCUOLA.photos[id],box=document.getElementById('viewer-content');
    box.innerHTML=`<div class="photo-sequence"><div class="sequence-photo"><img src="assets/${photo.file}" alt="${photo.caption}"></div><div class="sequence-caption"><span>${photo.caption}</span><small>${step+1} / ${stories[active].length}</small></div><div class="sequence-actions"><button data-sequence-prev aria-label="Foto precedente">←</button><button data-sequence-next aria-label="Foto successiva">→</button><button data-sequence-replay>Riguarda ▶</button></div></div>`;
  }
  function start(id){
    clearInterval(timer);if(!active)previousMix=Sottofondo.mode;active=id;step=0;
    document.querySelectorAll('video').forEach(v=>v.pause());
    Sottofondo.duck(false);Sottofondo.setMode('media');frame();
    const viewer=document.getElementById('viewer');if(!viewer.open)viewer.showModal();
    timer=setInterval(()=>{if(step<stories[active].length-1){step++;frame()}else clearInterval(timer)},3800);
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.sequence)start(b.dataset.sequence);
    if(b.hasAttribute('data-sequence-prev')||b.hasAttribute('data-sequence-next')){clearInterval(timer);step=Math.max(0,Math.min(stories[active].length-1,step+(b.hasAttribute('data-sequence-next')?1:-1)));frame()}
    if(b.hasAttribute('data-sequence-replay'))start(active);
  });
  document.getElementById('viewer').addEventListener('close',()=>{if(active){clearInterval(timer);active=null;Sottofondo.setMode(previousMix)}});
});
