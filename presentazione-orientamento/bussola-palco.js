/* Prova pubblica della Bussola: stato solo in memoria, nessuna chiamata o salvataggio. */
window.BussolaPalco=(()=>{
  'use strict';
  const data=window.BUSSOLA_PALCO_DATA;
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let answers={},mode='short',index=0,result=false,previousMix=null;
  const viewer=()=>document.getElementById('viewer');
  const questions=()=>mode==='short'?data.shortIds.map(id=>data.situations.find(q=>q.id===id)):data.situations;
  const course=id=>window.SCUOLA.courses.find(c=>c.id===id);
  const name=item=>course(item.course.id).code;
  const join=names=>names.length>1?`${names.slice(0,-1).join(', ')} e ${names.at(-1)}`:names[0];
  const valid=q=>q.options.some(o=>o.id===answers[q.id]);
  function header(qs){
    return `<header class="palco-header"><div><p class="palco-kicker">La tua Bussola · Proviamo insieme</p><p class="palco-format">${mode==='short'?'Prova breve · 4 domande su 12':'Il percorso · 12 domande'}</p></div><div class="palco-header-actions"><button class="palco-mode" data-palco-mode="${mode==='short'?'full':'short'}">${mode==='short'?'Tutte le 12 domande':'Prova breve · 4 domande'}</button><button class="palco-restart" data-palco-reset>Nuova prova ↺</button></div></header><nav class="palco-steps" aria-label="Le domande della Bussola">${qs.map((q,i)=>`<button data-palco-step="${i}" ${!result&&i===index?'aria-current="step"':''} class="${valid(q)?'answered':''}" aria-label="Domanda ${i+1}: ${escape(q.title)}${valid(q)?', risposta scelta':''}">${i+1}</button>`).join('')}</nav>`;
  }
  function render(focus=true){
    const qs=questions(),q=qs[index],selected=answers[q.id];
    const html=result?results(qs):`<section class="palco-question"><p class="palco-area">${escape(q.area)} · Domanda ${index+1} di ${qs.length}</p><h2 id="palco-title" tabindex="-1">${escape(q.title)}</h2><p class="palco-scenario">${escape(q.scenario)}</p><p class="palco-prompt">${escape(q.question)}</p><div class="palco-options" role="group" aria-label="${escape(q.question)}">${q.options.map((o,i)=>`<button data-palco-option="${escape(o.id)}" aria-pressed="${selected===o.id}"><span class="palco-number">${i+1}</span><span><strong>${escape(o.label)}</strong><span class="palco-option-detail">${escape(o.detail||o.text)}</span></span></button>`).join('')}</div><p class="palco-answer-hint" id="palco-feedback" role="status">${selected?`Hai scelto ${q.options.findIndex(o=>o.id===selected)+1}. Puoi confermare o cambiare risposta.`:'Puoi dire il numero della tua risposta.'}</p></section><footer class="palco-navigation"><button class="palco-secondary" data-palco-back ${index===0?'disabled':''}>← Indietro</button><div><button class="palco-secondary" data-palco-skip>Passo</button><button class="btn" data-palco-next ${!valid(q)?'disabled':''}>${index===qs.length-1?'Scopri i collegamenti':'Conferma e avanti'} →</button></div></footer>`;
    document.getElementById('viewer-content').innerHTML=`<article class="palco-app">${header(qs)}${html}</article>`;
    if(focus)document.getElementById('palco-title').focus({preventScroll:true});
    document.getElementById('viewer-content').scrollTop=0;
  }
  function results(qs){
    const direction=BussolaPalcoCore.suggestCourses(qs,data.courses,answers),names=direction.selected.map(name);
    let message;
    if(!names.length)message=direction.reason==='few'?'Le risposte sono ancora poche per suggerire un punto di partenza. Puoi rispondere ad altre domande oppure esplorare i cinque indirizzi.':'Le tue scelte toccano interessi diversi. Nessun indirizzo ritorna più degli altri: puoi confrontare le materie e provare le attività.';
    else if(direction.reason==='tentative')message=`Per ora c’è un primo indizio verso ${join(names)}. Ecco le risposte che fanno emergere questi collegamenti.`;
    else if(direction.reason==='mixed')message=`Le tue scelte vanno in più direzioni: ${join(names)}. Puoi confrontarle partendo dalle ragioni e dalle materie.`;
    else message=`Dalle tue risposte ${names.length===1?'emerge soprattutto':'emergono'} ${join(names)}. Ecco da dove potresti iniziare.`;
    return `<section class="palco-results"><p class="palco-area">${direction.answeredCount} risposte ${mode==='short'?'nella prova breve':'su 12 domande'}</p><h2 id="palco-title" tabindex="-1">Da dove potresti partire?</h2><p class="palco-result-intro">${escape(message)}</p>${direction.selected.length?`<div class="palco-result-grid">${direction.selected.map(item=>{
      const c=course(item.course.id);
      return `<article class="palco-course" style="--palco-course:${c.color}"><span class="palco-course-code">${escape(c.code)}</span><h3>${escape(c.name)}</h3><p class="palco-course-field">${escape(c.field)}</p><ul>${item.evidence.slice(0,2).map(e=>`<li><p>«${escape(e.action)}»</p><p>${escape(e.reason)}</p></li>`).join('')}</ul><details><summary>Cosa studi e cosa puoi fare</summary><div>${c.panels[1]}${c.panels[2]}</div></details></article>`;
    }).join('')}</div>`:''}<div class="palco-all-courses"><p>${names.length?'Puoi esplorare anche gli altri indirizzi.':'Cinque percorsi da conoscere.'}</p><div>${SCUOLA.courses.map(c=>`<button data-palco-course="${c.id}">${escape(c.code)} →</button>`).join('')}</div><div id="palco-course-detail"></div></div><div class="palco-result-actions"><button class="btn" data-palco-review>Rivedi le risposte ←</button>${mode==='short'?'<button class="palco-secondary" data-palco-mode="full">Continua con tutte le 12 domande →</button>':''}</div><p class="palco-result-note">È un punto di partenza, non un voto sulle tue capacità. Puoi cambiare idea e scegliere anche un altro percorso.</p></section>`;
  }
  function open(){
    document.querySelectorAll('video').forEach(v=>v.pause());
    if(viewer().open)viewer().close();
    answers={};mode='short';index=0;result=false;
    previousMix=Sottofondo.mode;Sottofondo.setMode('talk');
    viewer().classList.add('palco-open');viewer().setAttribute('aria-label','La Bussola: prova insieme');
    render(false);viewer().showModal();document.getElementById('palco-title').focus();
  }
  function choose(id){
    const q=questions()[index];if(!q.options.some(o=>o.id===id))return;
    answers[q.id]=id;
    document.querySelectorAll('[data-palco-option]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palcoOption===id)));
    const n=q.options.findIndex(o=>o.id===id)+1;
    document.querySelector('[data-palco-next]').disabled=false;
    document.querySelector(`[data-palco-step="${index}"]`).classList.add('answered');
    document.getElementById('palco-feedback').textContent=`Hai scelto ${n}. Puoi confermare o cambiare risposta.`;
  }
  function next(skip=false){
    if(result)return;
    const qs=questions(),q=qs[index];
    if(skip)answers[q.id]=null;else if(!valid(q))return;
    if(index===qs.length-1)result=true;else index++;
    render();
  }
  document.addEventListener('click',event=>{
    if(!viewer().classList.contains('palco-open')||!viewer().open)return;
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.palcoOption){choose(b.dataset.palcoOption);return}
    if(b.hasAttribute('data-palco-next')){next();return}
    if(b.hasAttribute('data-palco-skip')){next(true);return}
    if(b.hasAttribute('data-palco-back')&&index>0){index--;result=false;render();return}
    if(b.dataset.palcoStep!==undefined){index=+b.dataset.palcoStep;result=false;render();return}
    if(b.hasAttribute('data-palco-review')){index=0;result=false;render();return}
    if(b.hasAttribute('data-palco-reset')){answers={};index=0;result=false;render();return}
    if(b.dataset.palcoMode){mode=b.dataset.palcoMode;const qs=questions(),missing=qs.findIndex(q=>!valid(q));index=missing<0?0:missing;result=false;render();return}
    if(b.dataset.palcoCourse){
      const c=course(b.dataset.palcoCourse),mount=document.getElementById('palco-course-detail');
      document.querySelectorAll('[data-palco-course]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      mount.innerHTML=`<article class="palco-course-info"><h3>${escape(c.code)} · ${escape(c.name)}</h3><div>${c.panels.join('')}</div></article>`;
      mount.scrollIntoView({behavior:'smooth',block:'nearest'});
    }
  });
  document.addEventListener('keydown',event=>{
    if(!viewer().open||!viewer().classList.contains('palco-open')||result||event.ctrlKey||event.metaKey||event.altKey)return;
    if(/^[1-5]$/.test(event.key)){event.preventDefault();choose(questions()[index].options[+event.key-1].id)}
    else if(event.key==='Enter'&&(!event.target.closest('button,summary,a')||event.target.closest('[data-palco-option],[data-palco-next]'))){event.preventDefault();next()}
    else if(event.key==='ArrowRight'){event.preventDefault();next()}
    else if(event.key==='ArrowLeft'&&index>0){event.preventDefault();index--;render()}
  });
  addEventListener('DOMContentLoaded',()=>viewer().addEventListener('close',()=>{
    if(!viewer().classList.contains('palco-open'))return;
    viewer().classList.remove('palco-open');viewer().removeAttribute('aria-label');
    answers={};index=0;result=false;
    if(previousMix!==null){Sottofondo.setMode(previousMix);previousMix=null}
  }));
  return {open};
})();
