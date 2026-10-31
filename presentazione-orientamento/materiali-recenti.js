addEventListener('DOMContentLoaded',()=>{
  const viewer=document.getElementById('viewer'),image=document.getElementById('learning-image'),figure=image.closest('figure');
  function openTerritory(){
    document.querySelectorAll('video').forEach(v=>v.pause());
    viewer.classList.add('territorio-open');viewer.setAttribute('aria-label','La scuola e il territorio');
    document.getElementById('viewer-content').innerHTML='<article class="agora-story"><header class="agora-story-head"><div><p>Persone, servizi, imprese e comunità</p><h2 id="territorio-title" tabindex="-1">La scuola è parte del territorio.</h2><span class="agora-status">Visual illustrativo della campagna</span></div></header><figure class="agora-story-image"><img src="assets/scuola-territorio-campagna.png" alt="Visual della campagna sul rapporto tra la scuola, le persone, i servizi, le imprese, la tecnologia e la comunità"></figure><footer class="agora-story-footer"><p>Studiare significa anche conoscere il luogo in cui viviamo e contribuire alla sua vita.</p><button data-close="viewer">Torna alla presentazione →</button></footer></article>';
    if(!viewer.open)viewer.showModal();document.getElementById('territorio-title').focus();
  }
  function updateLearning(){
    const selected=+document.querySelector('[data-learning][aria-pressed="true"]').dataset.learning;
    figure.classList.toggle('territorio-learning',selected===1);
    if(selected===1){
      image.setAttribute('role','button');image.tabIndex=0;image.setAttribute('aria-label','Apri il visual della scuola nel territorio');
      if(!figure.querySelector('[data-territorio-open]')){const button=document.createElement('button');button.dataset.territorioOpen='';button.textContent='Apri il visual ↗';figure.querySelector('figcaption').append(button)}
    }else if(selected>1){image.removeAttribute('role');image.removeAttribute('tabindex');image.removeAttribute('aria-label')}
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-territorio-open]')){openTerritory();return}
    if(event.target.closest('[data-learning]'))updateLearning();
    if(event.target===image&&figure.classList.contains('territorio-learning'))openTerritory();
  });
  image.addEventListener('keydown',event=>{if(figure.classList.contains('territorio-learning')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopPropagation();openTerritory()}});
  viewer.addEventListener('close',()=>{if(viewer.classList.contains('territorio-open')){viewer.classList.remove('territorio-open');viewer.removeAttribute('aria-label')}});
  document.querySelectorAll('.gallery-pages').forEach(g=>{if(g.children.length===1)document.querySelectorAll(`[data-gallery="${g.id}"]`).forEach(b=>b.hidden=true)});
  updateLearning();
});
