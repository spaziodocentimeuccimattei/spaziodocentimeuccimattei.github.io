import {sharedParticipant,rememberParticipant} from './bussola-identita.mjs?v=20261019-monitor';
import {setupExperienceNavigation} from './bussola-navigazione.mjs?v=20261018-flow';
import {materialExamples,materialCheck,INTEREST_ACTIVITIES} from './ssas-situazioni-revisione.mjs';
import {readEntryState} from './ssas-situazioni-entry-core.mjs?v=20261018-ingresso';
import {sceneImage,entranceImage} from './ssas-illustrazioni.mjs?v=20261012-scene';
import {classEntry,setupClass} from './bussola-classe.mjs?v=20261019-monitor';
import {setupParticipantCertificate} from './bussola-attestato-alunno.mjs?v=20261029-missione';
import {nextStep} from './bussola-prossimo-passo.mjs?v=20261020-contatti';
import {FORMAT,LABS,CASES,caseById,GUIDE,cursor,guideIssues,titleDefaults,freshProject,restoreProject,selectCase,beginRevision,summaryItems,xml} from './ssas-situazioni-core.mjs?v=20261018-testi';
const localTest=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('prova');
const API=localTest?'/__test/bussola-esperienze':'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-esperienze';
const entryAlumno=classEntry().alunno;
const KEY='bussola-ssas-sei-situazioni-v2'+(entryAlumno?':alunno:'+entryAlumno:'')+(localTest?':prova:'+localTest.replace(/[^a-z0-9-]/gi,'').slice(0,60):'');
const mount=document.getElementById('workspace'), nav=document.getElementById('stepNav');
const saveStatus=document.getElementById('saveStatus'),retry=document.getElementById('retrySave');
const notesDialog=document.getElementById('notesDialog');
const menuToggle=document.getElementById('menuToggle'),pageMenu=document.getElementById('pageMenu');
const $=id=>document.getElementById(id);
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const btn=(text,fn,cls='primary')=>{const n=node('button',text,cls);n.type='button';n.addEventListener('click',fn);return n;};
const unique=x=>[...new Map(x.map(v=>[v.id,v])).values()];
const copy=x=>JSON.parse(JSON.stringify(x));
const fileCache=new Map();
function fileURL(content,type){const previous=fileCache.get(type);if(previous?.content===content)return previous.url;const url=URL.createObjectURL(new Blob([content],{type}));fileCache.set(type,{content,url});if(previous)setTimeout(()=>URL.revokeObjectURL(previous.url),60000);return url;}
let localOK=true, connected=false, syncing=false, conflict=false, clock=0, timer, epoch=0, noteTrigger;
// Il passaggio di mano tra il laboratorio 2 e il 3 è solo presentazione: non si salva e non ha una rotta.
let handoff=false;
let state={project:freshProject(),token:'',participant:'',revision:0,dirty:false,notes:[],draft:null};
try{const raw=readEntryState(localStorage,KEY);if(raw&&typeof raw==='object')state={...state,...raw,project:restoreProject(raw.project),token:/^[\w-]{43}$/.test(raw.token)?raw.token:'',revision:Number.isInteger(raw.revision)?raw.revision:0,notes:Array.isArray(raw.notes)?raw.notes.filter(n=>n&&typeof n.testo==='string'):[]};}catch{}
if(entryAlumno&&!state.token)state.token=entryAlumno;
if(!state.token)state.token=sharedParticipant();
const navigation=setupExperienceNavigation(route=>{restoreRoute(route);render(true);});
function restoreRoute(route){
 handoff=false;
 const m=route.match(/^laboratorio-([1-5])-([1-3])$/),step=route==='conclusione'?6:Number(m?.[1]),part=Number(m?.[2])-1,j=journey();
 if(step===6&&j.visited>=6){navigation.enter();j.step=6;}
 else if(m&&step<=j.visited&&part<GUIDE[step-1].length){navigation.enter();j.step=step;j.guideCursor=part;j.guideVersion=1;j.part=part?1:0;}
 else navigation.showIntro();
}
function resume(){navigation.enter();if(journey().step===0)go(1,0);else render(true);}

function keep(){try{localStorage.setItem(KEY,JSON.stringify(state));localOK=true;}catch{localOK=false;}}
function status(text,error=false){saveStatus.textContent=localTest?text.replaceAll('Supabase','database di prova')+' · Prova locale':text;$('saveStatus').parentElement.dataset.error=String(error);retry.hidden=!error||conflict;menuToggle.dataset.alert=String(error);}
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
 rememberParticipant(state.token);const generation=epoch,reply=await call('start');if(generation!==epoch)return;
 if(reply.project&&state.dirty&&reply.project.revision!==state.revision){
  if(state.lastOp&&reply.project.payload?._save_operation===state.lastOp)state.revision=reply.project.revision;
  else{conflict=true;throw Object.assign(new Error('Il progetto è cambiato in un’altra finestra. Scarica il tuo lavoro prima di ricaricare.'),{code:409});}
 }
 state.participant=reply.participant;
 if(reply.project&&!state.dirty){state.project=restoreProject(reply.project.payload);state.revision=reply.project.revision;restoreRoute(navigation.route());render(false);}
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
 updateLive();updateHelp();if(journey().step===6&&!redraw){const next=$('continue');if(next){next.disabled=journey().finished||guideIssues(journey()).length>0;next.textContent=journey().finished?'Percorso concluso ✓':'Concludi';}if(!journey().finished)$('completion')?.remove();}if(redraw)render(false);
}

const journey=()=>state.project.caseJourney;
const noteStep=()=>navigation.isIntro()?0:Math.min(5,journey().step);
const areaKeys=['health','relation','autonomy','creative','service'];
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

/* ---------- Interfaccia per ragazzi di terza media: una scelta per schermo ---------- */
// Nomi dei laboratori per i ragazzi. Le etichette di LABS (core) restano per attestati e gestione.
const VERBS=['Capisci','Ascolta','Aiuta','Crea','Organizza'];
// Messaggi d'aiuto semplici al posto di quelli del core (per id dell'issue).
const HELP={stepNav:'Prima completa i cinque passi.','interest-salute':'Scegli almeno una cosa che ti è piaciuta.'};
const INFINITIVES=['capire','ascoltare','aiutare','creare','organizzare'];
// Inquadratura del protagonista dentro l'illustrazione esistente (posizione in percentuale).
// Punto (in % della larghezza e dell'altezza dell'illustrazione) da tenere al centro dell'avatar.
const AVATAR_FOCUS={dipendenze:[52,30],disabilita:[33,40],immigrazione:[27,30],anziani:[37,33],disagio:[19,34],infanzia:[24,48]};
const whoOf=c=>c?.who||c?.person||'';
const hookOf=c=>c?.hook||c?.detail||'';
function avatar(c,size=''){
 const a=node('span',null,'tm-avatar'+(size?' tm-avatar-'+size:''));a.setAttribute('aria-hidden','true');
 const img=c&&sceneImage(c.id,{decorative:true,className:'tm-avatar-img'});
 if(img){const [x,y]=AVATAR_FOCUS[c.id]||[50,40];img.loading='eager';img.style.transform=`translate(-${x}%,-${y}%)`;a.append(img);}
 return a;
}
function readerAvatar(){const a=node('span',null,'tm-avatar tm-avatar-ai');a.setAttribute('aria-hidden','true');a.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7Z" fill="currentColor"/></svg>';return a;}
function aiAvatar(){const a=node('span',null,'tm-avatar tm-avatar-ai');a.setAttribute('aria-hidden','true');a.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.5l-1.8-5L5 9.7l5.2-1.8ZM18.5 15l.8 2.1 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" fill="currentColor"/></svg>';return a;}
const isQuote=t=>/^[«—"“]/.test(String(t||'').trim());
// Fumetto del personaggio: avatar piccolo + nome + frase. Se la frase non è una battuta, è il racconto.
function bubble(c,text,{label,ai=false,reader=false,cls=''}={}){
 const row=node('div',null,'tm-speaker'+(cls?' '+cls:''));
 const b=node('div',null,'tm-bubble'+(isQuote(text)?' tm-quote':' tm-story'));
 const name=label||(isQuote(text)?whoOf(c):'');if(name)b.append(node('p',name,'tm-bubble-name'));b.append(node('p',text,'tm-bubble-text'));
 row.append(ai?aiAvatar():reader?readerAvatar():avatar(c),b);return row;
}
function progress(){
 const j=journey(),current=Math.min(j.step,5),bar=node('div',null,'tm-progress');
 const text=j.step===6?'5 di 5 · Fatto!':handoffActive()?'Cambio di ruolo':`${current} di 5 · ${VERBS[current-1]}`;
 bar.append(node('p',text,'tm-step-label'));
 const ticks=node('ol',null,'tm-ticks');ticks.setAttribute('aria-label','I cinque laboratori');
 LABS.forEach((l,i)=>{
  const done=j.done.includes(l.id),here=j.step===i+1,li=node('li'),b=btn('',()=>go(i+1,0),'tm-tick');
  b.dataset.state=here?'current':done?'done':i+1<=j.visited?'visited':'next';b.disabled=i+1>j.visited;
  b.setAttribute('aria-label',`${i+1}. ${VERBS[i]}${done?' · fatto':''}${here?' · sei qui':''}${b.disabled?' · ancora da fare':''}`);
  if(here)b.setAttribute('aria-current','step');
  b.append(node('span',null,'tm-tick-bar'));li.append(b);ticks.append(li);
 });
 bar.append(ticks);nav.append(bar);
}
function intro(){
 const j=journey(),s=node('section',null,'tm-intro'),c=caseById(j.health.focus);
 const entered=j.visited>0,started=entered&&Boolean(c);
 const title=node('h1','Che cosa fa chi aiuta le persone?');title.id='ssasEntryTitle';s.setAttribute('aria-labelledby',title.id);
 const line=started?`Hai iniziato la storia di ${c.person}. Puoi continuare da dove avevi lasciato.`:'Scegli una storia e prova a capire, ascoltare e aiutare una persona, in cinque passi.';
 const start=btn(started?'Riprendi':'Inizia',e=>entered?resume():classUI.begin(e.currentTarget),'tm-start');
 const art=node('div',null,'tm-intro-art');art.append(entranceImage());
 s.append(node('p','Servizi per la Sanità e l’Assistenza Sociale','tm-kicker'),title,node('p',line,'tm-lead'),start,art);
 mount.append(s);
}
function stories(){
 const j=journey(),s=node('section',null,'tm-stories'),title=node('h1','Scegli una storia');title.id='tmQuestion';
 s.append(title,node('p','Ti accompagnerà in tutti e cinque i passi.','tm-hint'));
 const box=node('fieldset',null,'tm-story-grid');box.id='health-focus';box.setAttribute('aria-labelledby','tmQuestion');
 for(const c of CASES){
  const input=node('input');input.type='radio';input.name='ssas-health-focus';input.id=`health-focus-${c.id}`;input.value=c.id;input.checked=j.health.focus===c.id;
  input.addEventListener('change',()=>edit('health','focus',c.id));
  const card=node('label',null,'tm-story');card.dataset.case=c.id;
  const art=sceneImage(c.id,{decorative:true,className:'tm-story-img'});if(art)card.append(art);
  const text=node('span',null,'tm-story-text');text.append(node('strong',whoOf(c)),node('span',hookOf(c)));
  card.append(input,text,node('span',null,'tm-check'));box.append(card);
 }
 s.append(box);mount.append(s);
}
// Che cosa mostra ogni passaggio: chi parla, la domanda, le opzioni e la reazione dopo la scelta.
function screen(j,c,n){
 const s=j.step,P=c.person,detail=x=>x?.detail?{note:x.detail}:null;
 const pick=(list,id)=>list.find(x=>x.id===id);
 if(s===1)return {lead:c.contexts?.[0]||c.scene,question:c.observation||`Che cosa sta succedendo a ${P}?`,options:{type:'example',area:'health',key:'explanation',texts:c.explanations,max:230}};
 if(s===2&&n===0)return {lead:c.contexts?.[1]||c.need,question:`Che cosa chiedi a ${P}?`,options:{type:'radio',area:'relation',key:'opening',list:c.openings},reply:x=>({quote:x.reply})};
 if(s===2&&n===1)return {lead:c.participationContext,question:`Come continui ad ascoltare ${P}?`,options:{type:'radio',area:'relation',key:'participation',list:c.participation},reply:x=>({quote:x.reply})};
 if(s===2){const p=pick(c.participation,j.relation.participation);return {lead:p?.reply||c.need,question:`Che cosa proponi a ${P}?`,options:{type:'example',area:'relation',key:'closing',texts:c.closings,max:180}};}
 if(s===3&&n===0)return {context:c.contexts?.[2],lead:c.supportGoal,question:'Quali aiuti prepari?',hint:'Puoi sceglierne più di uno.',options:{type:'check',area:'autonomy',key:'supports',list:c.supports},reply:detail};
 if(s===3)return {lead:c.request,question:'Come cambi l’aiuto?',options:{type:'radio',area:'autonomy',key:'adaptation',list:c.adaptations},reply:detail};
 if(s===4&&n===0)return {lead:c.contexts?.[3]||c.need,question:'A che cosa deve servire?',options:{type:'radio',area:'creative',key:'goal',list:c.purposes},reply:detail};
 if(s===4&&n===1){const g=pick(c.purposes,j.creative.goal);return {lead:g?`Deve servire a: ${g.label.charAt(0).toLowerCase()+g.label.slice(1).replace(/\.$/,'')}.`:c.need,question:'Che cosa prepari?',options:{type:'radio',area:'creative',key:'setting',list:c.formats},reply:detail};}
 if(s===4){const f=pick(c.formats,j.creative.setting);return {lead:f?.draft||'',ai:true,leadLabel:'Bozza scritta con l’IA',question:'Come la riscrivi?',options:{type:'example',area:'creative',key:'ending',texts:materialExamples(c,j.creative.goal,j.creative.setting),max:230},reply:(x,i)=>{const check=materialCheck(c,j.creative.goal),q=check.questions[(i??0)%Math.max(1,check.questions.length)];return q?{reader:check.context,quote:q[0],note:q[1]}:null;}};}
 if(s===5&&n===0)return {lead:c.contexts?.[4]||c.team,question:'Quale attività proponi?',options:{type:'radio',area:'service',key:'activity',list:c.activities},reply:detail};
 if(s===5&&n===1)return {lead:c.accessIssue,question:'Come fai partecipare tutti?',options:{type:'radio',area:'service',key:'access',list:c.access},reply:detail};
 const a=pick(c.activities,j.service.activity);return {lead:a?`La tua attività: ${a.label.charAt(0).toLowerCase()+a.label.slice(1).replace(/\.$/,'')}.`:c.team,question:'Che cosa controlli dopo?',options:{type:'radio',area:'service',key:'check',list:c.checks},reply:detail};
}
let current=null,lastToggled=null;
function replyContent(){
 if(!current?.reply)return null;const {options:o}=current,j=journey(),value=j[o.area][o.key];
 if(o.type==='example'){const i=o.texts.indexOf(value);if(!value.trim())return null;return current.reply(value,i>=0?i:(j.creative.editedBranch??0));}
 if(o.type==='check'){const chosen=o.list.filter(x=>value.includes(x.id));const x=chosen.find(v=>v.id===lastToggled)||chosen.at(-1);return x?current.reply(x):null;}
 const x=o.list.find(v=>v.id===value);return x?current.reply(x):null;
}
function updateReply(){
 const box=$('tmReply');if(!box)return;const r=replyContent(),c=caseById(journey().health.focus);box.replaceChildren();
 if(!r)return;
 if(r.quote){box.append(bubble(c,r.quote,{label:r.reader||whoOf(c),reader:!!r.reader,cls:'tm-reaction'}));}
 if(r.note){const p=node('p',null,'tm-note');if(!r.reader)p.append(node('span','✓ ','tm-note-mark'));p.append(r.note);box.append(p);}
 box.classList.remove('tm-appear');void box.offsetWidth;box.classList.add('tm-appear');
}
function optionsBox(o){
 const j=journey(),fs=node('fieldset',null,'tm-options');fs.id=`${o.area}-${o.key}`;fs.setAttribute('aria-labelledby','tmQuestion');
 const items=o.type==='example'?o.texts.map((t,i)=>({id:String(i),label:t})):o.list;
 items.forEach((item,i)=>{
  const input=node('input'),value=j[o.area][o.key];
  input.type=o.type==='check'?'checkbox':'radio';
  if(o.type==='example'){input.name=`ssas-example-${o.area}-${o.key}`;input.id=`example-${o.area}-${o.key}-${i}`;input.value=item.label;input.checked=value===item.label;}
  else{input.name=`ssas-${o.area}-${o.key}`;input.id=`${o.area}-${o.key}-${item.id}`;input.value=item.id;input.checked=o.type==='check'?value.includes(item.id):value===item.id;}
  input.addEventListener('change',()=>{
   if(o.type==='check'){const now=journey()[o.area][o.key];lastToggled=input.checked?item.id:null;edit(o.area,o.key,input.checked?[...now,item.id]:now.filter(x=>x!==item.id),false);}
   else if(o.type==='example'){if(o.area==='creative'&&o.key==='ending')journey().creative.editedBranch=i;edit(o.area,o.key,item.label,false);const ta=$(`${o.area}-${o.key}-testo`);if(ta)ta.value=item.label;}
   else edit(o.area,o.key,item.id,false);
   updateReply();
  });
  const l=node('label',null,'tm-option');l.htmlFor=input.id;l.append(input,node('span',item.label,'tm-option-text'),node('span',null,'tm-check'));fs.append(l);
 });
 return fs;
}
// «Scrivo io»: la frase scelta si può riscrivere, con gli stessi limiti di prima.
function writer(o){
 const j=journey(),value=j[o.area][o.key],custom=!!value.trim()&&!o.texts.includes(value),w=node('div',null,'tm-write');
 const id=`${o.area}-${o.key}-testo`,panel=node('div',null,'tm-write-panel');panel.id=id+'-pannello';panel.hidden=!custom;
 const toggle=btn(custom?'Scrivo io ✓':'Scrivo io',()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open){ta.value=journey()[o.area][o.key];ta.focus();ta.scrollIntoView({block:'nearest'});}},'tm-write-toggle');
 toggle.setAttribute('aria-expanded',String(custom));toggle.setAttribute('aria-controls',panel.id);
 const ta=node('textarea');ta.id=id;ta.name=`ssas-${o.area}-${o.key}`;ta.rows=3;ta.maxLength=o.max;ta.value=value;
 const lab=node('label','Scrivi con parole tue','tm-write-label');lab.htmlFor=id;
 ta.addEventListener('input',()=>{edit(o.area,o.key,ta.value,false);document.querySelectorAll(`input[name="ssas-example-${o.area}-${o.key}"]`).forEach(r=>{r.checked=r.value===ta.value;});updateReply();});
 panel.append(lab,ta);w.append(toggle,panel);return w;
}
function step(){
 const j=journey(),c=caseById(j.health.focus),n=cursor(j);if(!c){stories();return;}
 current=screen(j,c,n);lastToggled=null;
 const s=node('section',null,'tm-step');
 if(j.step===1&&c.role)s.append(node('p',`Tu sei ${c.role}.`,'tm-role'));
 if(current.context)s.append(node('p',current.context,'tm-role'));
 if(current.lead)s.append(bubble(c,current.lead,{label:current.leadLabel,ai:current.ai}));
 const q=node('h1',current.question,'tm-question');q.id='tmQuestion';s.append(q);
 if(current.hint)s.append(node('p',current.hint,'tm-hint'));
 s.append(optionsBox(current.options));
 if(current.options.type==='example')s.append(writer(current.options));
 const reply=node('div',null,'tm-reply');reply.id='tmReply';reply.setAttribute('aria-live','polite');s.append(reply);
 mount.append(s);updateReply();
}
function handoffActive(){const j=journey();return handoff&&j.step===3&&cursor(j)===0&&!!caseById(j.health.focus)?.handoff;}
function handoffScreen(){
 const c=caseById(journey().health.focus),s=node('section',null,'tm-handoff');
 const art=node('div',null,'tm-handoff-art');const img=sceneImage(c.id,{decorative:true,className:'tm-handoff-img'});if(img)art.append(img);
 const title=node('h1','Passaggio di mano');s.append(art,title,node('p',c.handoff,'tm-handoff-text'));mount.append(s);
}
function bottomBar(){
 const j=journey(),c=cursor(j),bar=node('div',null,'tm-bottom'),inner=node('div',null,'tm-bottom-inner');
 const back=btn('←',()=>{if(handoffActive()){go(2,1);return;}if(j.step===6)go(5,1);else if(c>0)go(j.step,1,c-1);else go(j.step-1,j.step>1?1:0);},'tm-back');back.setAttribute('aria-label','Indietro');
 let next;
 if(handoffActive()){next=btn('Avanti',()=>{handoff=false;render(true);},'tm-next');}
 else{next=btn('Avanti',advance,'tm-next');next.id='continue';next.disabled=guideIssues(j).length>0;}
 const help=node('div',null,'requirements tm-sr');help.id='requirements';help.hidden=true;help.setAttribute('role','status');
 inner.append(back,next);bar.append(help,inner);mount.append(bar);
}
function updateLive(){if($('downloadProject'))$('downloadProject').href=jsonHref();if($('downloadPortfolio'))$('downloadPortfolio').href=svgHref();if($('backupBeforeReset'))$('backupBeforeReset').href=jsonHref();}
function updateHelp(error=false){const box=$('requirements');if(!box)return;box.replaceChildren();const pending=guideIssues(journey());box.hidden=!pending.length;box.dataset.error=String(error&&!!pending.length);if(pending.length)box.append(node('p',HELP[pending[0].id]||'Scegli una risposta per andare avanti.'));const next=$('continue');if(next)next.disabled=journey().step===6&&journey().finished||pending.length>0;}
function go(step,part=0,action=null,showHandoff=false){handoff=showHandoff;if(step===0){navigation.showIntro();render(true);return;}navigation.enter();const j=journey();j.step=step;j.part=part;j.guideVersion=1;j.guideCursor=action??(step>=1&&step<=5&&part?GUIDE[step-1].length-1:0);j.visited=Math.max(j.visited,step);clock++;state.dirty=true;keep();schedule();render(true);}
function advance(){const j=journey(),c=cursor(j),pending=guideIssues(j,c);if(pending.length){updateHelp(true);const target=$(pending[0].id);target?.scrollIntoView({block:'center',behavior:'instant'});(target?.matches('input,textarea,button')?target:target?.querySelector('input,button'))?.focus({preventScroll:true});return;}
 if(j.step===6){j.finished=true;j.attestato={...j.attestato,id:crypto.randomUUID(),date:new Date().toISOString()};changed(true,true);$('completion')?.querySelector('h2')?.focus();$('completion')?.scrollIntoView({block:'start',behavior:'instant'});return;}
 if(c<GUIDE[j.step-1].length-1){beginRevision(j);go(j.step,1,c+1);}
 else{titleDefaults(j);const id=LABS[j.step-1].id;if(!j.done.includes(id))j.done.push(id);go(j.step+1,0,null,j.step===2&&!!caseById(j.health.focus)?.handoff);}
}
function interests(){
 const box=node('fieldset',null,'tm-options tm-interests');box.setAttribute('aria-labelledby','tmInterests');
 LABS.forEach((l,i)=>{const input=node('input');input.type='checkbox';input.name='ssas-interests';input.id=`interest-${l.id}`;input.value=l.id;input.checked=journey().interests.includes(l.id);input.addEventListener('change',()=>{const j=journey();j.interests=input.checked?[...j.interests,l.id]:j.interests.filter(id=>id!==l.id);changed(false);});
  const lab=node('label',null,'tm-option');lab.htmlFor=input.id;const text=node('span',null,'tm-option-text');text.append(node('strong',VERBS[i]),node('span',INTEREST_ACTIVITIES[i].replace(/\.$/,''),'tm-interest-what'),node('span','Si studia in: '+l.subject,'tm-interest-subject'));lab.append(input,text,node('span',null,'tm-check'));box.append(lab);});
 return box;
}
function recap(j,c){
 const pick=(list,id)=>list.find(x=>x.id===id)?.label||'';
 const f=c.formats.find(x=>x.id===j.creative.setting);
 return [
  j.health.explanation,
  [pick(c.openings,j.relation.opening),j.relation.closing].filter(Boolean).join(' '),
  [...c.supports.filter(x=>j.autonomy.supports.includes(x.id)).map(x=>x.label),pick(c.adaptations,j.autonomy.adaptation)].filter(Boolean).join(' · '),
  [f?.label,j.creative.ending].filter(Boolean).join(': '),
  [pick(c.activities,j.service.activity),pick(c.access,j.service.access)].filter(Boolean).join(' · ')
 ];
}
function summary(){
 const j=journey(),c=caseById(j.health.focus),s=node('section',null,'tm-summary');
 const head=node('div',null,'tm-summary-head');const h=node('h1',`Ecco che cosa hai fatto per ${c?.person||'la tua storia'}`);head.append(avatar(c,'large'),h);s.append(head);
 const list=node('ol',null,'tm-recap');list.setAttribute('aria-label','I tuoi cinque passi');
 (c?recap(j,c):[]).forEach((text,i)=>{const li=node('li');li.append(node('strong',VERBS[i]),node('span',text||'—','tm-recap-text'));list.append(li);});
 s.append(list);
 const q=node('h2','Che cosa ti è piaciuto di più?');q.id='tmInterests';s.append(q,node('p','Puoi sceglierne più di uno.','tm-hint'),interests());
 const field=node('textarea');field.id='nextIdea';field.name='ssas-next-idea';field.maxLength=180;field.rows=2;field.value=j.nextIdea;field.addEventListener('input',()=>{j.nextIdea=field.value;changed(false);});
 const lab=node('label','Vuoi chiedere qualcosa a studenti o docenti di questo indirizzo? (facoltativo)','tm-write-label');lab.htmlFor=field.id;s.append(lab,field);
 const help=node('div',null,'requirements tm-requirements');help.id='requirements';help.hidden=true;help.setAttribute('role','status');
 const actions=node('div',null,'tm-summary-actions');
 const back=btn('←',()=>go(5,1),'tm-back');back.setAttribute('aria-label','Indietro');
 const next=btn(j.finished?'Percorso concluso ✓':'Concludi',advance,'tm-next');next.id='continue';next.disabled=j.finished||guideIssues(j).length>0;
 actions.append(back,next);s.append(help,actions);mount.append(s);
 if(j.finished){
  const done=node('section',null,'tm-complete');done.id='completion';const title=node('h2','Hai completato i cinque passi!');title.tabIndex=-1;
  const liked=LABS.map((l,i)=>j.interests.includes(l.id)?INFINITIVES[i]:'').filter(Boolean);
  done.append(title,node('p',`Ti è piaciuto di più: ${liked.join(', ')}.`));if(j.nextIdea.trim())done.append(node('p',`La tua domanda: ${j.nextIdea}`));
  done.append(node('p','Porta il tuo lavoro all’incontro con studenti e docenti: sarà un buon punto da cui partire con le domande.'));
  done.append(btn('Apri il tuo attestato',e=>certificateUI.open(e.currentTarget),'tm-start'));
  const link=node('a','Esplora l’indirizzo SSAS →','tm-link');link.href='https://spaziodocentimeuccimattei.github.io/indirizzi.html#ssas';done.append(link);
  mount.append(done,nextStep('ssas'));
 }
}
function render(focus=true){
 const focused=document.activeElement?.id,j=journey();nav.replaceChildren();mount.replaceChildren();current=null;
 const isIntro=navigation.isIntro()||j.step===0;if(isIntro||!handoffActive())handoff=false;
 const storyChoice=!isIntro&&j.step===1&&(cursor(j)===0||!caseById(j.health.focus));
 document.body.dataset.view=isIntro?'ingresso':j.step===6?'conclusione':handoffActive()?'passaggio':storyChoice?'storie':'passo';
 if(isIntro)intro();
 else{progress();if(j.step===6)summary();else{if(handoffActive())handoffScreen();else if(storyChoice)stories();else step();bottomBar();}}
 navigation.write(isIntro?'ingresso':j.step===6?'conclusione':`laboratorio-${j.step}-${cursor(j)+1}`);updateLive();updateHelp();renderNotes();
 const headingTarget=mount.querySelector('h1');if(headingTarget)headingTarget.tabIndex=-1;
 if(focus){headingTarget?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}else if(focused)$(focused)?.focus({preventScroll:true});
}
function context(){const j=journey();return `SSAS · ${caseById(j.health.focus)?.label||'Sei situazioni'} · ${navigation.isIntro()||j.step===0?'Ingresso':j.step===6?'Raccolta e curiosità':`${LABS[j.step-1].label} · ${GUIDE[j.step-1][cursor(j)]}`}`;}
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
// Le note partono dal menu: il contesto è sempre quello del passaggio aperto.
$('openNotes').addEventListener('click',()=>openNotes(menuToggle));$('closeNotes').addEventListener('click',()=>notesDialog.close());notesDialog.addEventListener('close',()=>{state.draft=draftFromForm();keep();noteTrigger?.focus({preventScroll:true});});
retry.addEventListener('click',()=>sync());window.addEventListener('online',()=>sync());
$('newProject').addEventListener('click',()=>{$('backupBeforeReset').href=jsonHref();$('resetDialog').showModal();});$('cancelReset').addEventListener('click',()=>$('resetDialog').close());$('confirmReset').addEventListener('click',()=>{try{localStorage.setItem(KEY+':archivio:'+crypto.randomUUID(),JSON.stringify(state));}catch{status('Non riesco a conservare il percorso precedente. Scarica una copia prima di iniziarne uno nuovo.',true);return;}epoch++;clearTimeout(timer);connected=false;conflict=false;state={project:freshProject(),token:'',participant:'',revision:0,dirty:false,notes:[],draft:null};keep();navigation.showIntro();$('resetDialog').close();document.dispatchEvent(new CustomEvent('bussola-progetto-nuovo'));status('Un progetto nuovo, con un identificativo distinto.');render(true);});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')keep();});
// Menu in testa alla pagina: note, classe, area docenti, salvataggio, progetto nuovo.
function setMenu(open,focusFirst=true){pageMenu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));if(open&&focusFirst)pageMenu.querySelector('button:not([hidden]),a')?.focus();}
menuToggle.addEventListener('click',()=>setMenu(pageMenu.hidden));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pageMenu.hidden&&!document.querySelector('dialog[open]')){setMenu(false);menuToggle.focus();}});
document.addEventListener('click',e=>{if(!pageMenu.hidden&&!pageMenu.contains(e.target)&&!menuToggle.contains(e.target))setMenu(false);});
pageMenu.addEventListener('click',e=>{const item=e.target.closest('button,a');if(item&&item.id!=='retrySave')setMenu(false);});
for(const d of document.querySelectorAll('dialog'))d.addEventListener('close',()=>setTimeout(()=>{if(document.activeElement===document.body||!document.activeElement?.offsetParent)menuToggle.focus({preventScroll:true});}));
const classUI=setupClass({key:KEY,isIntro:()=>navigation.isIntro()||journey().step===0,start:async()=>{if(state.token&&!connected){try{await connect();}catch{status('Il lavoro salvato non è ancora disponibile. Riprova il collegamento.',true);return;}}resume();},token:()=>state.token,ensure:async()=>{if(!connected)await connect();if(!state.participant)throw new Error('Il collegamento non è riuscito. Riprova tra poco.');}});
const certificateUI=setupParticipantCertificate({project:()=>state.project,journey:()=>journey(),participant:()=>state.participant,revision:()=>state.revision,identity:()=>classUI.identity(),save:()=>changed(false,true)});
const courseLabel=document.querySelector('.experience-path [aria-current]');if(localTest&&courseLabel)courseLabel.textContent='SSAS · prova locale';
restoreRoute(navigation.route());render(false);if(state.token)sync();
