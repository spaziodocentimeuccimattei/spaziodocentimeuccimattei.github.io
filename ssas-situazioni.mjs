import {sceneCardArt,sceneFigure,entranceImage} from './ssas-illustrazioni.mjs?v=20261012-scene';
import {classEntry,setupClass} from './bussola-classe.mjs?v=20261012-ingresso';
import {setupParticipantCertificate} from './bussola-attestato-alunno.mjs?v=20261013-ssas';
import {FORMAT,LABS,CASES,caseById,PRESENTATION as LAB_PRESENTATION,GUIDE,cursor,guideIssues,titleDefaults,freshProject,restoreProject,selectCase,issues,beginRevision,summaryItems,xml} from './ssas-situazioni-core.mjs';
const localTest=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('prova');
const API=localTest?'/__test/bussola-esperienze':'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-esperienze';
const entryAlumno=classEntry().alunno;
const KEY='bussola-ssas-sei-situazioni-v2'+(entryAlumno?':alunno:'+entryAlumno:'')+(localTest?':prova:'+localTest.replace(/[^a-z0-9-]/gi,'').slice(0,60):'');
const mount=document.getElementById('workspace'), nav=document.getElementById('stepNav');
const saveStatus=document.getElementById('saveStatus'),retry=document.getElementById('retrySave');
const notesDialog=document.getElementById('notesDialog');
const $=id=>document.getElementById(id);
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const btn=(text,fn,cls='primary')=>{const n=node('button',text,cls);n.type='button';n.addEventListener('click',fn);return n;};
const label=(text,control)=>{const n=node('label',text,'field');control.setAttribute('aria-label',text);n.append(control);return n;};
const unique=x=>[...new Map(x.map(v=>[v.id,v])).values()];
const copy=x=>JSON.parse(JSON.stringify(x));
const fileCache=new Map();
function fileURL(content,type){const previous=fileCache.get(type);if(previous?.content===content)return previous.url;const url=URL.createObjectURL(new Blob([content],{type}));fileCache.set(type,{content,url});if(previous)setTimeout(()=>URL.revokeObjectURL(previous.url),60000);return url;}
let localOK=true, connected=false, syncing=false, conflict=false, clock=0, timer, epoch=0, noteTrigger;
let state={project:freshProject(),token:'',participant:'',revision:0,dirty:false,notes:[],draft:null};
try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw&&typeof raw==='object')state={...state,...raw,project:restoreProject(raw.project),token:/^[\w-]{43}$/.test(raw.token)?raw.token:'',revision:Number.isInteger(raw.revision)?raw.revision:0,notes:Array.isArray(raw.notes)?raw.notes.filter(n=>n&&typeof n.testo==='string'):[]};}catch{}
if(entryAlumno&&!state.token)state.token=entryAlumno;
function keep(){try{localStorage.setItem(KEY,JSON.stringify(state));localOK=true;}catch{localOK=false;}}
function status(text,error=false){saveStatus.textContent=localTest?text.replaceAll('Supabase','database di prova')+' · Prova locale':text;$('saveStatus').parentElement.dataset.error=String(error);retry.hidden=!error||conflict;}
function newToken(){const bytes=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
async function call(action,payload={}){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-bussola-token':state.token},body:JSON.stringify({action,...payload}),signal:controller.signal});
  const body=await r.json();if(!r.ok){const e=new Error(body.error||'Salvataggio non disponibile.');e.code=r.status;throw e;}return body;
 }finally{clearTimeout(timeout);}
}
async function connect(){
 if(!state.token){state.token=newToken();keep();}
 const generation=epoch,reply=await call('start');if(generation!==epoch)return;
 if(reply.project&&state.dirty&&reply.project.revision!==state.revision){
  if(state.lastOp&&reply.project.payload?._save_operation===state.lastOp)state.revision=reply.project.revision;
  else{conflict=true;throw Object.assign(new Error('Il progetto è cambiato in un’altra finestra. Scarica il tuo lavoro prima di ricaricare.'),{code:409});}
 }
 state.participant=reply.participant;
 if(reply.project&&!state.dirty){state.project=restoreProject(reply.project.payload);state.revision=reply.project.revision;render(false);}
 state.notes=unique([...state.notes.filter(n=>n.pending),...(reply.notes||[]).map(n=>({...n,pending:false}))]);
 connected=true;keep();renderNotes();
}
async function sync(){
 if(syncing||conflict)return;
 syncing=true;const generation=epoch;status('Salvataggio in corso…');
 try{
  if(!connected)await connect();if(generation!==epoch)return;
  while(state.dirty){
   const stamp=clock,snapshot=copy(state.project);state.lastOp=crypto.randomUUID();snapshot._save_operation=state.lastOp;keep();
   const reply=await call('save',{project:snapshot,revision:state.revision});
   if(generation!==epoch)return;state.revision=reply.revision;
   if(stamp===clock)state.dirty=false;keep();
  }
  for(const n of state.notes.filter(x=>x.pending)){
   const reply=await call('note',{note:n});if(generation!==epoch)return;
   n.pending=false;n.created_at=reply.note.created_at;keep();
  }
  renderNotes();status(state.notes.some(n=>n.pending)?'Una nuova nota è in attesa di salvataggio…':localOK?'Tutto salvato. Puoi riprendere da questo dispositivo.':'Salvato online. Questo browser non conserva l’accesso: scarica una copia prima di chiudere.');
 }catch(e){
  if(generation!==epoch)return;
  if(e.code===409)conflict=true;
  const message=conflict?e.message:localOK?'Il lavoro è sul dispositivo. Il salvataggio online è da riprovare.':'Il lavoro è ancora aperto. Scarica una copia: il salvataggio non è riuscito.';
  status(message,true);renderNotes();
 }finally{syncing=false;if(!conflict&&(state.dirty||state.notes.some(n=>n.pending))&&(generation!==epoch||(connected&&saveStatus.parentElement.dataset.error!=='true')))schedule();}
}
function schedule(){clearTimeout(timer);timer=setTimeout(sync,600);}
function changed(redraw=false,complete=false){
 if(!complete)journey().finished=false;clock++;state.dirty=true;keep();
 status(localOK?'Salvato sul dispositivo · aggiornamento in corso…':'Salvataggio sul dispositivo non disponibile.');schedule();
 updateLive();updateHelp();if(journey().step===6&&!redraw){const next=$('continue');if(next){next.disabled=journey().finished||guideIssues(journey()).length>0;next.textContent=journey().finished?'Percorso concluso ✓':'Concludi il percorso';}if(!journey().finished)$('completion')?.remove();}if(redraw)render(false);
}

const journey=()=>state.project.caseJourney;
const noteStep=()=>Math.min(5,journey().step);
const areaKeys=['health','relation','autonomy','creative','service'];
const iconPaths={salute:'M12 4v16M4 12h16M9 4H6v5H2v6h4v5h5v-4h5v-5h4V9h-4V4h-5',relazione:'M4 5h16v11H10l-5 4v-4H4ZM8 9h8M8 12h5',autonomia:'M5 12l4 4L20 5M4 4h6M4 4v6M20 20h-6M20 20v-6',creativita:'M4 19l4-1L20 6l-4-4L4 14ZM14 4l4 4M3 22h18',progettazione:'M3 3h7v6H3ZM14 15h7v6h-7ZM6 9v9h8M14 3h7v6h-7M17 9v6'};
function symbol(id){const n=node('span',null,'lab-symbol');n.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPaths[id]}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/></svg>`;return n;}
function sheet(title,description){const s=node('section',null,'sheet');s.append(node('h2',title));if(description)s.append(node('p',description));return s;}
function edit(area,key,value,redraw=true){const j=journey(),p=j[area];
 if(p[key]===value)return;
 if(area==='health'&&key==='focus'){state.project=selectCase(state.project,value);changed(true);return;}
 if((area==='health'&&key==='focus')||(area==='autonomy'&&key==='person')||(area==='service'&&key==='kind')){
  const {alternatives,...current}=p;p.alternatives={...p.alternatives};if(p[key])p.alternatives[p[key]]=copy(current);
  const previous=p.alternatives[value];
  if(area==='health'){p.title=previous?.title||'';p.explanation=previous?.explanation||'';p.before=previous?.before||null;}
  if(area==='autonomy'){p.supports=previous?.supports||[];p.adaptation=previous?.adaptation||'';p.before=previous?.before||null;}
  if(area==='service'){p.name=previous?.name||'';p.activity=previous?.activity||'';p.access=previous?.access||'';p.check=previous?.check||'';p.before=previous?.before||null;}
 }
 if(area==='creative'&&key==='setting'){const old=caseById(j.health.focus)?.formats.find(x=>x.id===p.setting);if(p.title===old?.label)p.title=caseById(j.health.focus).formats.find(x=>x.id===value)?.label||'';}
 if(['explanation','closing','ending'].includes(key)&&typeof p[key]==='string'&&p[key].trim()&&!p.before?.[key]){const {before,...draft}=p;p.before=copy(draft); }
 if(area==='creative'&&['goal','setting'].includes(key)){if(p.ending)p.previousEndings=[...new Set([...(p.previousEndings||[]),p.ending])].slice(-8);p.ending='';p.before=null;}
 p[key]=value;j.done=j.done.filter(id=>id!==LABS[areaKeys.indexOf(area)].id);changed(redraw);
}
function choose(arr,area,key,{check=false,compact=false,prefix=''}={}){const box=node('fieldset',null,`choices${compact?' compact-choices':''}`);box.append(node('legend',GUIDE[journey().step-1]?.[cursor(journey())]||'Scegli una proposta','sr-only'));box.id=`${area}-${key}`;
 for(const item of arr){const input=node('input');input.type=check?'checkbox':'radio';input.id=`${area}-${key}-${item.id}`;input.name=`ssas-${area}-${key}`;input.value=item.id;input.checked=check?journey()[area][key].includes(item.id):journey()[area][key]===item.id;
 input.addEventListener('change',()=>{if(check){const values=journey()[area][key];edit(area,key,input.checked?[...values,item.id]:values.filter(x=>x!==item.id));}else edit(area,key,item.id);});const l=node('label',null,'choice');if(area==='health'&&key==='focus'){l.classList.add('case-option');l.dataset.case=item.id;const art=sceneCardArt(item.id);if(art)l.append(art);}l.append(input);const c=node('span');c.append(node('strong',prefix+(item.label||item.name)));if(item.detail||item.group)c.append(node('small',item.detail||item.group));l.append(c);box.append(l);}return box;}
function field(title,area,key,max=180,multiline=false){const c=node(multiline?'textarea':'input');if(!multiline)c.type='text';else c.rows=3;c.name=`ssas-${area}-${key}`;c.id=`${area}-${key}`;c.maxLength=max;c.value=journey()[area][key];c.addEventListener('input',()=>edit(area,key,c.value,false));return label(title,c,'field');}
// Keep field labels explicit; the reusable helper above adds both association and an accessible name.
function examples(texts,area,key){const list=node('div',null,'example-buttons');texts.forEach((text,i)=>list.append(btn(`Usa l’esempio ${i+1}`,()=>edit(area,key,text),'secondary')));return list;}
function exampleChoices(texts,area,key){const d=node('div',null,'choices');texts.forEach((text,i)=>{const b=btn(text,()=>{if(area==='creative'&&key==='ending')journey().creative.editedBranch=i;edit(area,key,text);},'secondary');b.id=`example-${area}-${key}-${i}`;d.append(b);});return d;}
function info(title,text){const c=node('div',null,'micro-card');c.append(node('h3',title),node('p',text));return c;}
function svgWrap(content,title,description){
 const captions=[...content.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(m=>m[1]);
 const shapes=content.replace(/<text[^>]*>[\s\S]*?<\/text>/g,'');
 return `<figure class="illustration"><svg viewBox="0 0 440 245" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${xml(title+'. '+description)}"><rect width="440" height="245" rx="16" fill="#e1edf2"/>${shapes}</svg>${captions.length?`<figcaption>${captions.map(t=>`<span>${t}</span>`).join('')}</figcaption>`:''}</figure>`;
}

function board(){const b=node('aside',null,'visual-board');b.setAttribute('aria-label','Il lavoro che stai costruendo');b.dataset.lab=LABS[journey().step-1]?.id;b.append(node('div',LAB_PRESENTATION[journey().step-1]?.product||'Il tuo lavoro','board-label'));b.append(node('p','Le tue scelte aggiornano questa anteprima.','board-help'));const canvas=node('div',null,'board-canvas');canvas.id='liveCanvas';b.append(canvas);return b;}
function intro(){
 const s=node('section',null,'intro'),c=node('div');
 c.append(node('p','Servizi per la sanità e l’assistenza sociale','eyebrow'),node('h1','Da una situazione a un aiuto concreto.'),node('p','Scegli che cosa ti interessa. Ascolta le persone, prova un’idea e migliorala.','lead'),node('p','Cinque laboratori: il tuo caso ti accompagna fino alla proposta di un servizio.'),btn(journey().visited>0?'Riprendi i laboratori →':'Inizia →',e=>classUI.begin(e.currentTarget),'primary bussola-start'),node('small','Il lavoro si salva. Puoi riprenderlo da questo dispositivo.'));
 const art=node('div',null,'intro-visual');art.append(entranceImage());art.append(node('div','Sei situazioni · cinque lavori personali','intro-caption'));s.append(c,art);mount.append(s);
 const route=node('div',null,'route-intro');const hints=['Capire la situazione.','Ascoltare la persona.','Adattare un sostegno.','Creare e provare un materiale.','Organizzare un’attività accessibile.'];LABS.forEach((l,i)=>{const card=node('section',null,'route-card');card.style.setProperty('--accent',l.color);card.append(symbol(l.id),node('h2',l.label),node('p',hints[i]));route.append(card);});mount.append(route);
}
function heading(){
 const j=journey(),lab=LABS[j.step-1],c=cursor(j),h=node('div',null,'stage-heading'),copy=node('div');
 copy.append(node('p',`Laboratorio ${j.step} di 5 · ${lab.label}`,'eyebrow'),node('h1',LAB_PRESENTATION[j.step-1].title),node('p',LAB_PRESENTATION[j.step-1].result,'stage-purpose'));
 h.append(copy,btn('Nota su questo punto',e=>openNotes(e.currentTarget),'plain-button'));mount.append(h);
 const phases=node('ol',null,'guide-progress');phases.setAttribute('aria-label',`Passaggi di ${lab.label}`);
 GUIDE[j.step-1].forEach((t,i)=>{const n=node('li',null,c===i?'active':'');n.append(node('b',`${i+1}.`),' ',node('span',t));n.dataset.position=i<c?'past':i===c?'current':'next';if(c===i)n.setAttribute('aria-current','step');phases.append(n);});mount.append(phases);
}
function optionalTitle(text,area,key){const d=node('details',null,'optional-title');d.append(node('summary',text+' · facoltativo'),field(text,area,key,65));return d;}
function guidedTask(left){
 const j=journey(),n=cursor(j),c=caseById(j.health.focus);let s;
 if(j.step===1){
  if(n===0){s=sheet('Quale situazione vuoi affrontare?','Scegli quella che ti incuriosisce. Lavorerai su questo caso nei cinque laboratori.');const choices=choose(CASES,'health','focus');choices.classList.add('case-choices');s.append(choices);}
  else{s=sheet('Che cosa occorre capire?',c.need);s.append(node('p','Scegli una frase. Puoi cambiarla con le tue parole.','field-help'),exampleChoices(c.explanations,'health','explanation'),field('La tua scheda del bisogno','health','explanation',230,true),optionalTitle('Titolo della scheda','health','title'));}
 }
 if(j.step===2){
  if(n===0){s=sheet('Quale domanda fai a '+c.person+'?','Una domanda può far emergere un desiderio o una difficoltà. Guarda che cosa risponde.');s.append(choose(c.openings,'relation','opening'));}
  if(n===1){s=sheet('Come dai spazio alla persona?',c.person+': «Non me la sento di parlare davanti al gruppo.»');s.append(choose(c.participation,'relation','participation'));}
  if(n===2){s=sheet('Quale primo passo concordate?','Scegli una frase che lasci spazio alla richiesta. Puoi modificarla.');s.append(exampleChoices(c.closings,'relation','closing'),field('La tua frase per proseguire','relation','closing',180,true));}
 }
 if(j.step===3){
  if(n===0){s=sheet('Quali sostegni prepari?',c.supportGoal);s.append(node('p',c.person+': '+c.desire,'voice'),node('p','Puoi scegliere più sostegni. Guarda come cambia il piano.','field-help'),choose(c.supports,'autonomy','supports',{check:true}));}
  else{s=sheet('La richiesta è cambiata.',c.person+': '+c.request);s.append(node('p','Come adatti il sostegno?','field-help'),choose(c.adaptations,'autonomy','adaptation'));}
 }
 if(j.step===4){
  if(n===0){s=sheet('Che cosa vuoi ottenere con il materiale?','Scegli uno scopo legato alla tua situazione.');s.append(choose(c.purposes,'creative','goal'));}
  if(n===1){s=sheet('Che cosa vuoi preparare?','Scegli un materiale che la persona o il gruppo possano usare.');s.append(choose(c.formats,'creative','setting'));}
  if(n===2){const f=c.formats.find(x=>x.id===j.creative.setting);s=sheet('Migliora la bozza e provala.','Questa bozza proposta dall’IA lascia poco spazio alle persone. Come la cambi?');s.append(node('p',f.draft,'voice'),exampleChoices(f.improvements,'creative','ending'),field('Il tuo materiale','creative','ending',230,true),optionalTitle('Titolo del materiale','creative','title'));}
 }
 if(j.step===5){
  if(n===0){s=sheet('Che cosa offrirà il servizio?',c.team);s.append(choose(c.activities,'service','activity'));}
  if(n===1){s=sheet('Come rendi possibile partecipare?',c.accessIssue);s.append(choose(c.access,'service','access'));}
  if(n===2){s=sheet('Che cosa osserverai per migliorare?','Scegli un’informazione utile per rivedere l’attività.');s.append(choose(c.checks,'service','check'),optionalTitle('Nome del servizio','service','name'));}
 }
 if(c&&!(j.step===1&&n===0)){const chip=node('p',c.label+' · '+c.person,'case-chip');left.append(chip);}left.append(s);
}
function voiceReply(text){const card=node('blockquote',null,'voice-card'),colon=text.indexOf(':');if(colon>0&&colon<25){card.append(node('strong',text.slice(0,colon),'speaker'),node('p',text.slice(colon+1).trim()));}else card.append(node('p',text));return card;}
function productPart(title,text){const card=node('section',null,'product-part');card.append(node('h3',title),node('p',text));return card;}
function updateLive(){
 const canvas=$('liveCanvas'),j=journey(),n=cursor(j),c=caseById(j.health.focus);
 if(canvas){canvas.replaceChildren();canvas.dataset.lab=LABS[j.step-1]?.id;
  if(!c){canvas.append(entranceImage(),node('h2','Da quale situazione vuoi partire?'),node('p','La tua scelta aprirà il caso e i cinque lavori.','empty-preview'));}
  else{
   canvas.append(sceneFigure(c.id),node('p',c.label,'product-kicker'));
   if(j.step===1){canvas.append(node('h2',n?j.health.title||'La scheda del bisogno':'Il caso di '+c.person));if(!n)canvas.append(node('p',c.scene,'case-scene'),productPart('Da esplorare',c.need));else canvas.append(productPart('La tua spiegazione',j.health.explanation||'La frase che scegli o scrivi comparirà qui.'));}
   if(j.step===2){canvas.append(node('h2','Il dialogo con '+c.person));const open=c.openings.find(x=>x.id===j.relation.opening),p=c.participation.find(x=>x.id===j.relation.participation);if(n===0)canvas.append(open?voiceReply(c.person+': '+open.reply):node('p','Scegli una domanda per ascoltare la risposta.','empty-preview'));else if(n===1)canvas.append(p?voiceReply(c.person+': '+p.reply):node('p','Scegli come aprire uno spazio per parlare.','empty-preview'));else canvas.append(productPart('Per iniziare',open.label),productPart('Per ascoltare',p.label),productPart('Per proseguire',j.relation.closing||'La tua frase entrerà qui.'));}
   if(j.step===3){canvas.append(node('h2','Il piano per '+c.person),productPart('Il desiderio',c.supportGoal));const supports=c.supports.filter(x=>j.autonomy.supports.includes(x.id));supports.forEach(x=>canvas.append(productPart(x.label,x.detail)));if(!supports.length)canvas.append(node('p','I sostegni scelti entreranno nel piano.','empty-preview'));const a=c.adaptations.find(x=>x.id===j.autonomy.adaptation);if(n&&a)canvas.append(productPart('La nuova richiesta',c.request),productPart('Il cambiamento',a.detail));}
   if(j.step===4){const purpose=c.purposes.find(x=>x.id===j.creative.goal),f=c.formats.find(x=>x.id===j.creative.setting);canvas.append(node('h2',j.creative.title||f?.label||'Il tuo materiale'));if(purpose)canvas.append(node('p',purpose.label,'board-pill'));if(f&&n===1)canvas.append(productPart('Che cosa preparerai',f.detail));if(n===2){canvas.append(productPart('La tua versione',j.creative.ending||'La proposta che scegli o scrivi comparirà qui.'));if(j.creative.ending){const reader=node('section',null,'story-reader');reader.append(node('h3','Provalo con chi lo userà'),node('p',c.test));const controls=node('div',null,'story-controls'),outcome=node('p','Ascolta una richiesta: che cosa potresti migliorare?','story-outcome');outcome.setAttribute('role','status');c.responses.forEach(r=>controls.append(btn(r.label,()=>{outcome.textContent=r.detail;},'')));reader.append(controls,outcome);canvas.append(reader);}}}
   if(j.step===5){canvas.append(node('h2',j.service.name||c.service),productPart('Chi collabora',c.team));for(const [key,list,title] of [['activity',c.activities,'L’attività'],['access',c.access,'L’accesso'],['check',c.checks,'Che cosa osserverai']]){const x=list.find(v=>v.id===j.service[key]);if(x)canvas.append(productPart(title,x.label+' · '+x.detail));}}
   const before=j[areaKeys[j.step-1]]?.before,current=j[areaKeys[j.step-1]];
   if(before&&n>0){const keys=Object.keys(before).filter(k=>!['before','alternatives'].includes(k)),changedKeys=keys.filter(k=>JSON.stringify(before[k])!==JSON.stringify(current[k]));if(changedKeys.length){const r=node('details',null,'revision-record');r.append(node('summary','La prima versione del tuo lavoro'));const oldText=before.explanation||before.closing||before.ending||before.supports?.map(id=>c.supports.find(v=>v.id===id)?.label).filter(Boolean).join(' · ');if(oldText){r.append(node('p',oldText));canvas.append(r);}}}
   const sources=node('details',null,'more-info');sources.append(node('summary','Nel curricolo SSAS'),node('p','Attività adattata dall’UDA '+c.uda));const a=node('a','Apri le UDA del curricolo');a.href='https://salvapicconi.github.io/conoscenzessas2025/uda.html';a.target='_blank';a.rel='noopener';sources.append(a);canvas.append(sources);
  }
 }
 if($('downloadProject'))$('downloadProject').href=jsonHref();if($('downloadPortfolio'))$('downloadPortfolio').href=svgHref();if($('backupBeforeReset'))$('backupBeforeReset').href=jsonHref();
}

function updateHelp(error=false){const box=$('requirements');if(!box)return;box.replaceChildren();const pending=guideIssues(journey());box.hidden=!pending.length;box.dataset.error=String(error&&!!pending.length);if(pending.length)box.append(node('p',pending[0].text));const next=$('continue');if(next)next.disabled=journey().step===6&&journey().finished||pending.length>0;}
function go(step,part=0,action=null){const j=journey();j.step=step;j.part=part;j.guideVersion=1;j.guideCursor=action??(step>=1&&step<=5&&part?GUIDE[step-1].length-1:0);j.visited=Math.max(j.visited,step);clock++;state.dirty=true;keep();schedule();render(true);}
function advance(){const j=journey(),c=cursor(j),pending=guideIssues(j,c);if(pending.length){updateHelp(true);const target=$(pending[0].id);target?.scrollIntoView({block:'center',behavior:'instant'});(target?.matches('input,textarea,button')?target:target?.querySelector('input,button'))?.focus({preventScroll:true});return;}
 if(j.step===6){j.finished=true;j.attestato={...j.attestato,id:crypto.randomUUID(),date:new Date().toISOString()};changed(true,true);$('completion')?.querySelector('h2')?.focus();$('completion')?.scrollIntoView({block:'center',behavior:'instant'});return;}
 if(c<GUIDE[j.step-1].length-1){beginRevision(j);go(j.step,1,c+1);}
 else{titleDefaults(j);const id=LABS[j.step-1].id;if(!j.done.includes(id))j.done.push(id);go(j.step+1,0);}
}
function footer(){const j=journey(),c=cursor(j),help=node('div',null,'requirements');help.id='requirements';help.hidden=true;help.setAttribute('role','status');mount.append(help);const actions=node('div',null,'stage-footer');actions.append(btn('Indietro',()=>{if(j.step===6)go(5,1);else if(c>0)go(j.step,1,c-1);else go(j.step-1,j.step>1?1:0);},'secondary'));
 const next=btn(j.step===6?(j.finished?'Percorso concluso ✓':'Concludi il percorso'):c<GUIDE[j.step-1].length-1?GUIDE[j.step-1][c+1]+' →':j.step===5?'Raccogli i tuoi lavori →':'Continua con '+LABS[j.step].label+' →',advance);next.id='continue';next.disabled=j.step===6&&j.finished||guideIssues(j).length>0;actions.append(next);if(j.step===6)$('summaryNextActions').append(help,actions);else mount.append(actions);}
function interests(){const box=node('div',null,'choices interest-choices');LABS.forEach(l=>{const input=node('input');input.type='checkbox';input.name='ssas-interests';input.id=`interest-${l.id}`;input.value=l.id;input.checked=journey().interests.includes(l.id);input.addEventListener('change',()=>{const j=journey();j.interests=input.checked?[...j.interests,l.id]:j.interests.filter(id=>id!==l.id);changed(false);});const lab=node('label',null,'choice');lab.append(input,node('strong',l.label));box.append(lab);});return box;}
function summary(){const j=journey(),h=node('section',null,'summary-head');h.append(node('p','Cinque laboratori · il tuo percorso','eyebrow'),node('h1','Ecco che cosa hai creato.'),node('p','Una situazione, cinque lavori: bisogno, dialogo, sostegno, materiale e servizio.'));const selected=caseById(j.health.focus);if(selected){h.classList.add('summary-with-art');const text=node('div');while(h.firstChild)text.append(h.firstChild);h.append(text,sceneFigure(selected.id));}mount.append(h);const portfolio=node('section',null,'portfolio');portfolio.setAttribute('aria-label','I tuoi cinque lavori');const items=summaryItems(j);items.forEach((item,i)=>{const l=LABS[i],card=node('article');card.append(node('p',l.label,'eyebrow'));const detail=node('details',null,'portfolio-detail'),entry=node('summary');entry.append(node('h2',item.title),node('p',item.text));const body=node('div',null,'portfolio-body');body.append(node('p',item.detail));detail.append(entry,body);card.append(detail);const subject=node('details',null,'subject');subject.append(node('summary','Materie di indirizzo'),node('strong',l.subject),node('p',l.bridge));body.append(subject,btn('Rivedi questo lavoro',()=>go(i+1,1),'secondary'));portfolio.append(card);});mount.append(portfolio);const reflect=sheet('Che cosa vorresti approfondire?','Puoi indicare più parti, anche tutte.');reflect.append(interests());const field=node('textarea');field.id='nextIdea';field.name='ssas-next-idea';field.maxLength=180;field.rows=2;field.value=j.nextIdea;field.addEventListener('input',()=>{j.nextIdea=field.value;changed(false);});reflect.append(label('Una tua idea da continuare · facoltativo',field));const nextSlot=node('div');nextSlot.id='summaryNextActions';reflect.append(nextSlot);h.after(reflect);const actions=node('div',null,'actions');actions.append(btn('Nota sul percorso',e=>openNotes(e.currentTarget),'plain-button'));mount.append(actions);
 if(j.finished){const done=node('section',null,'complete');done.id='completion';const title=node('h2','Hai attraversato tutti e cinque i laboratori.');title.tabIndex=-1;done.append(title,node('p',`Vorresti approfondire: ${LABS.filter(l=>j.interests.includes(l.id)).map(l=>l.label.toLowerCase()).join(', ')}.`));if(j.nextIdea.trim())done.append(node('p',j.nextIdea));done.append(node('p','Porta uno dei tuoi lavori all’incontro con studenti e docenti: sarà un punto da cui fare domande.'));done.append(btn('Apri il tuo attestato',e=>certificateUI.open(e.currentTarget),'primary'));const link=node('a','Esplora l’indirizzo SSAS →','secondary');link.href='https://spaziodocentimeuccimattei.github.io/indirizzi.html#ssas';done.append(link);reflect.after(done);}}
function render(focus=true){const focused=document.activeElement?.id,j=journey();nav.replaceChildren();mount.replaceChildren();const lab=LABS[j.step-1];document.documentElement.style.setProperty('--accent',lab?.color||'#a44844');if(j.step===0)intro();else{LABS.forEach((l,i)=>{const b=btn('',()=>go(i+1,0),'');const done=j.done.includes(l.id);b.append(node('span',done?'✓':String(i+1),'nav-number'),node('span',l.label));b.disabled=i+1>j.visited;if(j.step===i+1)b.setAttribute('aria-current','step');b.setAttribute('aria-label',`${l.label}${done?' · completato':''}`);nav.append(b);});if(j.step===6)summary();else{heading();const grid=node('div',null,'workspace-grid'),left=node('div');guidedTask(left);grid.append(left,board());mount.append(grid);}footer();}updateLive();updateHelp();renderNotes();const headingTarget=mount.querySelector('h1');if(headingTarget)headingTarget.tabIndex=-1;if(focus){const title=headingTarget;title.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}else if(focused)$(focused)?.focus({preventScroll:true});}
function context(){const j=journey();return `SSAS · ${caseById(j.health.focus)?.label||'Sei situazioni'} · ${j.step===0?'Ingresso':j.step===6?'Raccolta e curiosità':`${LABS[j.step-1].label} · ${GUIDE[j.step-1][cursor(j)]}`}`;}
function exportedProject(){return {experience:FORMAT,participant:state.participant,project:state.project,notes:state.notes.map(({pending,...n})=>n)};}
function jsonHref(){return fileURL(JSON.stringify(exportedProject(),null,2),'application/json;charset=utf-8');}
function wrap(s,max=70){const rows=[];let line='';for(const word of String(s).split(/\s+/)){if(word.length>max){if(line){rows.push(line);line='';}for(let i=0;i<word.length;i+=max)rows.push(word.slice(i,i+max));continue;}if(line.length+word.length+1>max){rows.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)rows.push(line);return rows;}
function collectionSVG(){const j=journey(),items=summaryItems(j),cardHeights=items.map(x=>95+(wrap(x.title,40).length-1)*25+wrap(x.text,68).length*21+wrap(x.detail,75).length*18);let y=160;const cards=items.map((x,i)=>{const l=LABS[i],top=y;y+=cardHeights[i]+18;let ty=top+61;const title=wrap(x.title,40).map(t=>{const v=`<text x="54" y="${ty}" font-size="21" font-weight="700">${xml(t)}</text>`;ty+=25;return v;}).join('');const body=wrap(x.text,68).map(t=>{const v=`<text x="54" y="${ty+3}" font-size="15">${xml(t)}</text>`;ty+=21;return v;}).join('');const detail=wrap(x.detail,75).map(t=>{const v=`<text x="54" y="${ty+4}" font-size="12" fill="#596452">${xml(t)}</text>`;ty+=18;return v;}).join('');return `<rect x="30" y="${top}" width="700" height="${cardHeights[i]}" rx="15" fill="#fffdf4" stroke="#cbd6c3"/><text x="54" y="${top+28}" font-size="11" font-weight="700" fill="${l.color}">${xml(l.label)}</text>${title}${body}${detail}`;}).join('');const reflection=wrap(`Vorrei approfondire: ${LABS.filter(l=>j.interests.includes(l.id)).map(l=>l.label.toLowerCase()).join(', ')||'da scegliere'}. ${j.nextIdea}`,72);const height=y+reflection.length*20+90;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 ${height}" role="img" aria-labelledby="title desc"><title id="title">I miei cinque laboratori SSAS</title><desc id="desc">I cinque lavori e le curiosità dichiarate nel percorso.</desc><rect width="760" height="${height}" fill="#f2f1e5"/><g font-family="Arial,sans-serif" fill="#294538"><text x="34" y="42" font-size="12">Bussola · IIS Meucci - Mattei | Decimomannu</text><text x="34" y="94" font-size="31" font-weight="700">I miei cinque laboratori SSAS</text><text x="34" y="126" font-size="13">Salute e bisogni · Relazione · Cura e autonomia · Creatività · Progettazione</text>${cards}${reflection.map((t,i)=>`<text x="34" y="${y+27+i*20}" font-size="14">${xml(t)}</text>`).join('')}<text x="34" y="${height-23}" font-size="11">Il mio percorso di esplorazione · Situazioni e personaggi immaginari</text></g></svg>`;}
function svgHref(){return fileURL(collectionSVG(),'image/svg+xml;charset=utf-8');}
document.addEventListener('click',async event=>{const a=event.target.closest?.('a[download]');if(!a||!['downloadPortfolio','downloadProject','backupBeforeReset'].includes(a.id)||!['localhost','127.0.0.1'].includes(location.hostname))return;if(a.dataset.ready==='true'){delete a.dataset.ready;return;}event.preventDefault();try{const kind=a.id==='downloadPortfolio'?'svg':'json';const r=await fetch('/__bussola/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,content:kind==='svg'?collectionSVG():JSON.stringify(exportedProject(),null,2)})});if(!r.ok)throw new Error();a.href=(await r.json()).url;a.dataset.ready='true';a.click();}catch{a.href=a.id==='downloadPortfolio'?svgHref():jsonHref();a.dataset.ready='true';a.click();}});
function renderNotes(){const pending=state.notes.filter(n=>n.pending).length;$('noteCount').textContent=String(state.notes.length);const list=$('notesList');list.replaceChildren();if(!state.notes.length)list.append(node('p','Qui ritroverai ogni nota con il punto del percorso a cui si riferisce.','field-help'));for(const n of state.notes){const entry=node('article',null,'note-entry');entry.append(node('div',`${n.contesto} · ${n.ruolo_dichiarato==='docente'?'Prova docente':'Prova alunno'}`,'note-meta'),node('p',n.testo),node('div',n.pending?'Conservata sul dispositivo · da inviare':localTest?'Salvata nel database di prova':'Salvata online','note-sync'));list.append(entry);}if(notesDialog.open&&pending)$('noteStatus').textContent='La nota è sul dispositivo. Il salvataggio online è in corso o da riprovare.';else if(notesDialog.open&&state.notes.length)$('noteStatus').textContent='Le tue note sono salvate, ciascuna separatamente.';}
function draftFromForm(){return {text:$('noteText').value,role:$('noteRole').value,type:$('noteType').value,context:$('noteContext').value,step:state.draft?.step??noteStep()};}
function openNotes(trigger){noteTrigger=trigger;const d=state.draft?.text?.trim()?state.draft:{text:'',role:state.draft?.role||'alunno',type:state.draft?.type||'chiarezza',context:context(),step:noteStep()};state.draft=d;keep();$('noteContext').value=d.context;$('noteRole').value=d.role;$('noteType').value=d.type;$('noteText').value=d.text;$('noteStatus').textContent='';renderNotes();notesDialog.showModal();$('noteText').focus();}
for(const id of ['noteText','noteRole','noteType'])$(id).addEventListener('input',()=>{state.draft=draftFromForm();keep();});
$('noteForm').addEventListener('submit',event=>{event.preventDefault();const draft=draftFromForm(),text=draft.text.trim();if(text.length<2)return;const n={id:crypto.randomUUID(),passaggio:draft.step,contesto:draft.context,versione:1,ruolo_dichiarato:draft.role,tipo:draft.type,testo:text,created_at:new Date().toISOString(),pending:true};state.notes.push(n);state.draft=null;$('noteText').value='';$('noteContext').value=context();state.draft={text:'',role:draft.role,type:draft.type,context:context(),step:noteStep()};keep();renderNotes();updateLive();sync();});
$('openNotes').addEventListener('click',e=>openNotes(e.currentTarget));$('closeNotes').addEventListener('click',()=>notesDialog.close());notesDialog.addEventListener('close',()=>{state.draft=draftFromForm();keep();noteTrigger?.focus({preventScroll:true});});
retry.addEventListener('click',()=>sync());window.addEventListener('online',()=>sync());
$('newProject').addEventListener('click',()=>{$('backupBeforeReset').href=jsonHref();$('resetDialog').showModal();});$('cancelReset').addEventListener('click',()=>$('resetDialog').close());$('confirmReset').addEventListener('click',()=>{try{localStorage.setItem(KEY+':archivio:'+crypto.randomUUID(),JSON.stringify(state));}catch{status('Non riesco a conservare il percorso precedente. Scarica una copia prima di iniziarne uno nuovo.',true);return;}epoch++;clearTimeout(timer);connected=false;conflict=false;state={project:freshProject(),token:'',participant:'',revision:0,dirty:false,notes:[],draft:null};keep();$('resetDialog').close();document.dispatchEvent(new CustomEvent('bussola-progetto-nuovo'));status('Un progetto nuovo, con un identificativo distinto.');render(true);});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')keep();});
const classUI=setupClass({key:KEY,isIntro:()=>journey().step===0,start:()=>go(1,0),token:()=>state.token,ensure:async()=>{if(!connected)await connect();if(!state.participant)throw new Error('Il collegamento non è riuscito. Riprova tra poco.');}});
const certificateUI=setupParticipantCertificate({project:()=>state.project,journey:()=>journey(),participant:()=>state.participant,revision:()=>state.revision,identity:()=>classUI.identity(),save:()=>changed(false,true)});
if(localTest)document.querySelector('.preview-strip').textContent='Anteprima locale · Sei situazioni SSAS · 13–14 anni';
render(false);if(state.token)sync();
