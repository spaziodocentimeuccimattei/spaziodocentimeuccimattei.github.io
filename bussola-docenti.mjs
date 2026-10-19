import {COURSES,STATES,projectView,filterRows} from './bussola-monitor-core.mjs?v=20261019-monitor';
import {csvCell} from './bussola-records-core.mjs?v=20261013-ssas';
import {planBoard,viewDrawing,construction,heritage} from './cat-visuals.mjs';
import qrcode from './assets/vendor/qrcode-generator-2.0.4.mjs';
const $=id=>document.getElementById(id),el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(label,fn,cls='secondary')=>{const b=el('button',label,cls);b.type='button';b.addEventListener('click',fn);return b;};
const test=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('prova');
const API=test?'/__test/bussola-gestione':'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-gestione';
const KEY='bussola-docente-session',FS_KEY='mattei-gestione-session',COMMISSION_KEY='mattei-orientamento-session';
let token=sessionStorage.getItem(KEY)||sessionStorage.getItem(FS_KEY)||sessionStorage.getItem(COMMISSION_KEY)||'',session=null,questions=[],rows=[],offset=0,more=false,view='summary',lab=0,student='',requestVersion=0,authVersion=0,reportRows=[];
let course=new URLSearchParams(location.search).get('corso')?.toLowerCase()||'ssas';if(!COURSES[course])course='ssas';
let selections=new Map(),presentIndex=0,showNames=false,focusBeforeDialog=null,expiryTimer;
const when=value=>value?new Date(value).toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'}):'—';
function status(value,error=false){$('teacherStatus').textContent=value;$('teacherStatus').dataset.error=String(error);}
function dropSession(){
 const old=token;authVersion++;requestVersion++;clearTimeout(expiryTimer);token='';session=null;rows=[];reportRows=[];selections.clear();
 sessionStorage.removeItem(KEY);if(sessionStorage.getItem(FS_KEY)===old)sessionStorage.removeItem(FS_KEY);
 if(sessionStorage.getItem(COMMISSION_KEY)===old)sessionStorage.removeItem(COMMISSION_KEY);
 for(const d of document.querySelectorAll('dialog[open]'))d.close();
 for(const id of ['monitorBody','viewTools','codeContent','staffList','feedbackList','reportContent','presentationContent'])$(id).replaceChildren();
 for(const f of document.querySelectorAll('form'))f.reset();
 for(const id of ['teacherName','pageDescription','selectedWorkCount'])$(id).textContent='';
 for(const id of ['monitorSchool','monitorClass','monitorCourse'])$(id).replaceChildren();
 $('includeTests').checked=false;$('autoRefresh').checked=false;$('reportAnonymous').checked=true;$('compareWorks').checked=false;$('monitorFrom').value='';$('monitorTo').value='';$('monitorState').value='all';view='summary';student='';offset=0;lab=0;showNames=false;
 for(const b of document.querySelectorAll('[data-view]')){b.setAttribute('aria-selected',String(b.dataset.view==='summary'));b.tabIndex=b.dataset.view==='summary'?0:-1;}$('monitorBody').setAttribute('aria-labelledby','tabSummary');
 $('teacherWorkspace').hidden=true;$('teacherLogin').hidden=false;$('teacherLoginForm').reset();
}
async function api(action,payload={}){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);
 try{
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',...(token?{'x-orientamento-session':token}:{})},body:JSON.stringify({action,corso:course,...payload}),signal:ctrl.signal});
  const d=await r.json();if(!r.ok){if(r.status===401&&action!=='monitor_login'){dropSession();status('Sessione scaduta. Accedi di nuovo.',true);}throw Object.assign(new Error(d.error||'Operazione non riuscita.'),{status:r.status});}return d;
 }catch(e){
  if(e.name==='AbortError')throw new Error('La connessione è lenta. Premi Aggiorna per riprovare.');
  if(e instanceof TypeError)throw new Error('Connessione non disponibile. Controlla la rete e riprova.');
  throw e;
 }finally{clearTimeout(timer);}
}
function options(select,items,value){select.replaceChildren(...items.map(([v,label])=>{const o=el('option',label);o.value=v;return o;}));if(items.some(([v])=>v===value))select.value=value;}
function schoolKey(c){return c.scuola+' · '+c.comune;}
function fillFilters(){
 const school=$('monitorSchool').value,chosen=$('monitorClass').value;
 options($('monitorSchool'),[['','Tutte le scuole'],...[...new Set(session.classi.map(schoolKey))].map(x=>[x,x])],school);
 const classes=session.classi.filter(c=>(!$('monitorSchool').value||schoolKey(c)===$('monitorSchool').value)&&($('includeTests').checked||!c.prova));
 options($('monitorClass'),[['',session.admin?'Tutti i lavori':session.commissione?'Classi aperte in questo accesso':'Tutte le mie classi'],...(session.admin&&!$('monitorSchool').value?[['senza-classe','Lavori senza classe']]:[]),...classes.map(c=>[c.id,`${c.classe} · ${c.anno} · ${c.scuola}${c.prova?' · prova docente':''}`])],chosen);
 $('showClassCode').disabled=!classes.some(c=>c.id===$('monitorClass').value);$('newMonitorClass').disabled=course==='bussola';
}
async function startSession(){
 const version=authVersion,r=await api('monitor_session');if(version!==authVersion)return;
 session=r;armExpiry();if(course!=='bussola'&&!session.corsi.includes(course))course=session.corsi[0];
 options($('monitorCourse'),[...session.corsi.map(c=>[c,COURSES[c]]),['bussola',COURSES.bussola]],course);
 $('teacherName').textContent=session.nome;$('staffAccessBox').hidden=!session.admin;$('adminLinks').hidden=!session.admin;
 $('openMonitorClass').hidden=!session.commissione;$('commissionHelp').hidden=!session.commissione;
 $('teacherWorkspace').hidden=false;$('teacherLogin').hidden=true;
 if(session.admin)sessionStorage.setItem(FS_KEY,token);
 fillFilters();await load();
}
function armExpiry(){clearTimeout(expiryTimer);const ms=Date.parse(session?.expires_at)-Date.now();if(Number.isFinite(ms))expiryTimer=setTimeout(()=>{dropSession();status('Sessione scaduta. Accedi di nuovo.',true);},Math.max(0,ms));}
async function verifyAccess(){
 const identity=authVersion;try{const r=await api('monitor_session');if(identity!==authVersion)return;
  const fingerprint=s=>JSON.stringify([s.admin,s.corsi,s.classi.map(c=>c.id).sort()]);const changed=fingerprint(r)!==fingerprint(session);session=r;armExpiry();
  if(changed){requestVersion++;clearSelection();for(const d of document.querySelectorAll('dialog[open]'))d.close();if(course!=='bussola'&&!r.corsi.includes(course))course=r.corsi[0];options($('monitorCourse'),[...r.corsi.map(c=>[c,COURSES[c]]),['bussola',COURSES.bussola]],course);fillFilters();await load();}
 }catch(e){status(e.message,true);}
}
const currentFilters=()=>({from:$('monitorFrom').value,to:$('monitorTo').value,status:$('monitorState').value});
function decorate(reply){return reply.rows.map(r=>({...r,view:projectView(r.project,course,questions)}));}
function visible(){return filterRows(rows,currentFilters());}
function listPayload(page=offset){return {offset:page,classe_id:$('monitorClass').value,scuola:$('monitorSchool').value,prove:$('includeTests').checked};}
async function load(silent=false){
 const version=++requestVersion,identity=authVersion;
 if(!silent){$('monitorBody').replaceChildren(el('p','Caricamento dei lavori…'));status('');}
 $('monitorRefresh').disabled=true;
 try{
  const reply=await api('monitor_list',listPayload());if(version!==requestVersion||identity!==authVersion||!session)return;
  rows=decorate(reply);more=reply.more;session.classi=reply.classi;fillFilters();render();
  if(!silent)status('Lavori aggiornati.');
 }catch(e){if(version!==requestVersion)return;if(e.status===403){rows=[];reportRows=[];selections.clear();for(const id of ['monitorBody','viewTools','presentationContent','reportContent','codeContent'])$(id).replaceChildren();for(const d of document.querySelectorAll('dialog[open]'))d.close();updateSelection();}else if(session&&!silent)$('monitorBody').replaceChildren(el('p','Aggiornamento non riuscito. Premi Aggiorna per riprovare.','empty'));if(session)status(e.message,true);}
 finally{if(version===requestVersion)$('monitorRefresh').disabled=false;}
}
function name(row,anonymous=false,index=0){return anonymous?`Partecipante ${index+1}`:row.alunno?`${row.alunno.cognome} ${row.alunno.nome}`:'Partecipante senza nominativo';}
function className(row){const c=session?.classi.find(c=>c.id===row.alunno?.classe_id);return c?`${c.scuola} · ${c.classe}${c.prova?' · prova docente':''}`:'Senza classe';}
function labOptions(){return course==='bussola'?questions.map((q,i)=>[String(i),`${i+1}. ${q.title}`]):(rows.find(r=>r.view.labs.length===5)?.view.labs||Array.from({length:5},(_,i)=>({label:'Laboratorio '+(i+1)}))).map((l,i)=>[String(i),`${i+1}. ${l.label}`]);}
function chooseView(next){view=next;for(const b of document.querySelectorAll('[data-view]')){const active=b.dataset.view===view;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;if(active)$('monitorBody').setAttribute('aria-labelledby',b.id);}render();}
function render(){
 if(!session)return;const filtered=visible();$('viewTools').replaceChildren();
 $('pageDescription').textContent=`${filtered.length} ${filtered.length===1?"percorso":"percorsi"} in questa pagina${rows.length!==filtered.length?' su '+rows.length+' prima dei filtri':''}. ${course==='bussola'?'Le domande iniziali possono essere saltate.':'Apri un partecipante per leggere il suo lavoro.'}`;
 $('previousPage').disabled=offset===0;$('nextPage').disabled=!more;$('pageNumber').textContent='Pagina '+(offset/50+1);
 if(view==='summary')renderSummary(filtered);else if(view==='board')renderBoard(filtered);else renderNotebook(filtered);
 updateSelection();
}
function openNotebook(row,index=0){student=row.key;lab=index;chooseView('notebook');$('monitorBody').scrollIntoView({block:'start'});}
function renderSummary(filtered){
 const box=$('monitorBody');box.replaceChildren();if(!filtered.length){const message=session.commissione&&!session.classi.length?'Per iniziare, crea una classe oppure aprila con il suo codice.':$('monitorClass').value&&$('monitorClass').value!=='senza-classe'?'I lavori compariranno qui quando gli alunni entreranno con il codice della classe.':'Nessun percorso con i filtri scelti. Controlla anche le pagine successive.';box.append(el('p',message,'empty'));return;}
 const tiles=el('div',null,'summary-tiles');for(const [n,label] of [[filtered.length,'percorsi visualizzati'],[filtered.filter(r=>r.project).length,'con risposte salvate'],[filtered.filter(r=>r.view.completed).length,'percorsi conclusi']]){const p=el('p');p.append(el('strong',String(n)),el('span',label));tiles.append(p);}box.append(tiles);
 const wrap=el('div',null,'table-scroll'),table=el('table'),head=el('tr');head.append(el('th','Partecipante'));
 for(const [i,label] of labOptions()){const th=el('th');th.append(button(course==='bussola'?String(Number(i)+1):String(Number(i)+1),()=>{lab=Number(i);chooseView('board');}));th.title=label;head.append(th);}head.append(el('th','Ultimo salvataggio'));const thead=el('thead');thead.append(head);table.append(thead);
 const body=el('tbody');for(const row of filtered){const tr=el('tr'),th=el('th');th.scope='row';th.append(button(name(row),()=>openNotebook(row),'row-name'),el('small',className(row)));if(row.alunno&&!row.alunno.verificato)th.append(el('small','Nominativo dichiarato · da verificare'));tr.append(th);
  if(!row.view.valid){const td=el('td',row.view.error);td.colSpan=course==='bussola'?12:5;tr.append(td);}else for(const [i,l] of row.view.labs.entries()){const td=el('td'),b=button(l.status==='done'?'✓ Concluso':l.status==='working'?'In corso':'—',()=>openNotebook(row,i),'cell-button '+l.status);b.setAttribute('aria-label',`${name(row)} · ${l.label}: ${STATES[l.status]}`);td.append(b);tr.append(td);}tr.append(el('td',when(row.project?.updated_at)));body.append(tr);
 }table.append(body);wrap.append(table);box.append(wrap);
}
function detailsList(fields){const dl=el('dl');for(const f of fields){dl.append(el('dt',f.label),el('dd',f.value));}return dl;}
let visualSerial=0;
function renderVisual(card,row,index){
 if(course!=='cat'||!row.view.journey||row.view.labs[index]?.status==='empty')return;
 const p=row.view.journey,visual=el('div');
 // These renderers escape labels and receive a validated project, never arbitrary HTML.
 if(index===0)visual.innerHTML=viewDrawing(p,'pianta');
 if(index===1){visual.innerHTML=planBoard(p,{showRoute:true});const board=visual.querySelector('.plan-grid');if(board){board.className='plan-readonly';for(const b of board.querySelectorAll('[id]'))b.removeAttribute('id');}}
 if(index===2)visual.innerHTML=construction(p);
 if(index===3)visual.innerHTML=heritage(p);
 const prefix='monitor-visual-'+(++visualSerial)+'-';for(const n of visual.querySelectorAll('[id]')){const old=n.id;n.id=prefix+old;for(const e of visual.querySelectorAll('[fill],[stroke]'))for(const a of ['fill','stroke'])if(e.getAttribute(a)===`url(#${old})`)e.setAttribute(a,`url(#${prefix+old})`);}
 card.append(visual);
}
function workCard(row,index,{present=false,anonymous=false,personIndex=0}={}){
 const l=row.view.labs[index],card=el('article',null,'work-card');if(!l){card.append(el('p','Lavoro non disponibile.'));return card;}
 card.append(el('p',name(row,anonymous,personIndex),'eyebrow'),el('p',l.label,'tag'),el('h3',l.title),el('p',l.text,'answer'));
 if(l.status!=='done')card.append(el('p',STATES[l.status]+' · il testo può essere una bozza.','muted'));
 if(l.detail)card.append(el('p',l.detail,'muted'));renderVisual(card,row,index);
 if(l.fields.length){const d=el('details');d.append(el('summary','Scelte e risposte'),detailsList(l.fields));card.append(d);}
 if(l.before?.length&&!present){const d=el('details');d.append(el('summary','Prima proposta conservata'),detailsList(l.before));card.append(d);}
 if(!present&&l.status!=='empty'){
  const id=row.key+':'+index,label=el('label',null,'check select-work'),check=el('input');check.type='checkbox';check.checked=selections.has(id);check.setAttribute('aria-label','Seleziona per presentare: '+name(row)+' · '+l.label);
  check.addEventListener('change',()=>{if(check.checked)selections.set(id,{row:structuredClone(row),index,personIndex:rows.findIndex(r=>r.key===row.key)});else selections.delete(id);updateSelection();});label.append(check,document.createTextNode('Seleziona per presentare'));card.append(label);
 }return card;
}
function renderBoard(filtered){
 const label=el('label','Attività'),select=el('select');options(select,labOptions(),String(lab));select.addEventListener('change',()=>{lab=Number(select.value);render();});label.append(select);$('viewTools').append(label);
 const box=$('monitorBody');box.replaceChildren();if(!filtered.length){box.append(el('p','Nessun lavoro in questa pagina.','empty'));return;}
 const grid=el('div',null,'works-grid');for(const row of filtered){if(row.view.valid)grid.append(workCard(row,lab));else grid.append(el('p',row.view.error,'empty'));}box.append(grid);
}
function renderNotebook(filtered){
 const box=$('monitorBody');box.replaceChildren();if(!filtered.length){box.append(el('p','Scegli una classe o un lavoro dal riepilogo.','empty'));return;}
 if(!filtered.some(r=>r.key===student))student=filtered[0].key;
 const i=filtered.findIndex(r=>r.key===student),row=filtered[i];
 const label=el('label','Partecipante'),select=el('select');options(select,filtered.map(r=>[r.key,name(r)]),student);select.addEventListener('change',()=>{student=select.value;render();});label.append(select);
 const prev=button('←',()=>{student=filtered[i-1].key;render();}),next=button('→',()=>{student=filtered[i+1].key;render();});prev.disabled=i===0;next.disabled=i===filtered.length-1;$('viewTools').append(prev,label,next);
 box.append(el('h2',name(row)),el('p',`${className(row)} · Ultimo salvataggio: ${when(row.project?.updated_at)}`,'muted'));
 if(!row.view.valid){box.append(el('p',row.view.error,'empty'));return;}
 const grid=el('div',null,'works-grid');for(const [n] of row.view.labs.entries())grid.append(workCard(row,n));box.append(grid);
 if(row.view.interests?.length)box.append(el('p','Vorrei approfondire: '+row.view.interests.join(', ')));if(row.view.idea)box.append(el('p',row.view.idea));
 if(row.partecipante_id){const more=el('details'),content=el('div');more.append(el('summary','Note e versioni conservate'),content);more.addEventListener('toggle',async()=>{
   if(!more.open||more.dataset.loaded)return;const version=requestVersion,identity=authVersion;content.textContent='Caricamento…';
   try{const detail=await api('monitor_detail',{partecipante_id:row.partecipante_id});if(version!==requestVersion||identity!==authVersion||student!==row.key)return;content.replaceChildren();
    if(!detail.notes.length)content.append(el('p','Nessuna nota salvata.','muted'));
    for(const n of detail.notes){const note=el('section',null,'note');note.append(el('h3',n.contesto),el('p',n.testo),el('small',when(n.created_at)));content.append(note);}
    const history=el('section');history.append(el('h3','Versioni ai passaggi significativi'));if(!detail.history.length)history.append(el('p','Lo storico inizia dall’attivazione del registro; le vecchie versioni sovrascritte non sono disponibili.','muted'));
    for(const h of detail.history){const d=el('details'),v=projectView({payload:h.snapshot},course,questions);d.append(el('summary',`${when(h.created_at)} · ${h.tipo.replaceAll('_',' ')} · versione ${h.revision}`));d.addEventListener('toggle',()=>{if(d.open&&!d.dataset.loaded){const g=el('div',null,'works-grid');v.labs.forEach((l,k)=>g.append(workCard({...row,view:v},k,{present:true})));d.append(g);d.dataset.loaded='true';}});history.append(d);}content.append(history);more.dataset.loaded='true';
   }catch(e){if(identity===authVersion)content.textContent=e.message;}
  });box.append(more);
 }
}
function updateSelection(){$('monitorPresent').disabled=selections.size===0;$('selectedWorkCount').textContent=selections.size?`${selections.size} lavori selezionati`:'';}
function clearSelection(){selections.clear();updateSelection();}
function showDialog(id){focusBeforeDialog=document.activeElement;$(id).showModal();}
function presentation(){
 const items=[...selections.values()],step=$('compareWorks').checked?2:1;presentIndex=Math.min(Math.max(0,presentIndex),Math.max(0,items.length-1));const content=$('presentationContent');content.replaceChildren();
 for(const item of items.slice(presentIndex,presentIndex+step))content.append(workCard(item.row,item.index,{present:true,anonymous:!showNames,personIndex:item.personIndex}));
 $('presentationPosition').textContent=`${presentIndex+1}–${Math.min(items.length,presentIndex+step)} / ${items.length}`;$('presentationPrevious').disabled=presentIndex===0;$('presentationNext').disabled=presentIndex+step>=items.length;$('presentationNames').textContent=showNames?'Nascondi i nomi':'Mostra i nomi';
}
function codeFor(c){const u=new URL('bussola.html',location.href);u.search='';if(course!=='bussola')u.searchParams.set('corso',course);if(test)u.searchParams.set('prova','classe-locale');u.hash=new URLSearchParams({classe:c.codice_breve}).toString();return u.href;}
function showCode(c){const content=$('codeContent');content.replaceChildren(el('p',`${c.scuola} · ${c.classe}${c.prova?' · prova docente':''}`),el('p',c.codice_breve||'Codice non disponibile','class-code'));
 if(c.codice_breve){const q=qrcode(0,'M');q.addData(codeFor(c));q.make();const qr=el('div');qr.innerHTML=q.createSvgTag(5,20,'Apri la Bussola con il codice di questa classe','QR della classe');const a=el('a','Apri la Bussola con questa classe');a.href=codeFor(c);a.target='_blank';a.rel='noopener';content.append(qr,el('p','Gli alunni possono fare le dodici domande o saltare all’attività. Entrano poi con il codice e il proprio nome.'),a,button('Copia il collegamento',async()=>{try{await navigator.clipboard.writeText(codeFor(c));status('Collegamento copiato.');}catch{status('Apri il collegamento e copialo dalla barra degli indirizzi.');}}));}showDialog('codeDialog');}
async function loadStaff(){const identity=authVersion;const r=await api('monitor_staff');if(identity!==authVersion)return;$('staffList').replaceChildren();for(const d of r.docenti){const line=el('div',null,'staff-row'),copy=el('div');copy.append(el('strong',d.nome),el('p',`${d.accesso} · ${d.corsi.map(c=>COURSES[c]).join(', ')} · ${d.classi.length} classi · ${d.attivo?'attivo':'disattivato'}`,'muted'));line.append(copy,button('Modifica',()=>editStaff(d)));$('staffList').append(line);}}
function editStaff(d=null){const f=$('staffForm');f.reset();for(const key of ['id','updated_at','nome','accesso'])f.elements[key].value=d?.[key]||'';f.elements.attivo.checked=d?.attivo!==false;f.elements.password.required=!d;f.elements.password.value='';$('staffPasswordHelp').textContent=d?'Lascia vuota la password per conservarla. Una nuova password chiude gli accessi precedenti.':'Comunica nome di accesso e password personalmente al collega.';
 $('staffCourses').replaceChildren(el('legend','Indirizzi assegnati'));for(const [c,label] of Object.entries(COURSES)){if(c==='bussola')continue;const l=el('label',null,'check'),check=el('input');check.type='checkbox';check.name='corsi';check.value=c;check.checked=d?.corsi.includes(c)||false;l.append(check,document.createTextNode(label));$('staffCourses').append(l);}options(f.elements.classi,session.classi.map(c=>[c.id,`${c.scuola} · ${c.classe}${c.prova?' · prova':''}`]));for(const o of f.elements.classi.options)o.selected=d?.classi.includes(o.value)||false;$('staffEditorStatus').textContent='';showDialog('staffEditor');}
async function collectReport(){
 $('monitorReport').disabled=true;status('Preparazione di tutte le pagine del report…');const version=requestVersion,identity=authVersion,result=[];
 try{for(let page=0;page<100000;page+=50){const reply=await api('monitor_list',listPayload(page));if(identity!==authVersion||version!==requestVersion)return;result.push(...decorate(reply));if(!reply.more)break;if(page>=4950)throw new Error('Per un report così ampio scegli una scuola o una classe.');}
  reportRows=filterRows([...new Map(result.map(r=>[r.key,r])).values()],currentFilters());renderReport();showDialog('reportDialog');status('Report pronto.');
 }catch(e){status(e.message,true);}finally{$('monitorReport').disabled=false;}
}
function reportData(){const anon=$('reportAnonymous').checked;return reportRows.map((r,i)=>[name(r,anon,i),className(r),COURSES[course],`${r.view.done}/${r.view.total}`,r.view.completed?'Concluso':r.project?'In corso':'Non iniziato',when(r.project?.updated_at),(r.view.interests||[]).join(', ')]);}
const reportHead=['Partecipante','Classe','Percorso','Completamento','Stato','Ultimo salvataggio','Interessi dichiarati'];
function renderReport(){const box=$('reportContent');box.replaceChildren(el('p',`${COURSES[course]} · ${reportRows.length} ${reportRows.length===1?"lavoro":"lavori"} nel report · ${reportRows.filter(r=>r.view.completed).length} conclusi`));const div=el('div',null,'report-table'),table=el('table'),head=el('tr');reportHead.forEach(t=>head.append(el('th',t)));const thead=el('thead');thead.append(head);table.append(thead);const body=el('tbody');for(const line of reportData()){const tr=el('tr');line.forEach(v=>tr.append(el('td',v)));body.append(tr);}table.append(body);div.append(table);box.append(div);}
function saveCSV(){const text='\ufeff'+[reportHead,...reportData()].map(r=>r.map(csvCell).join(';')).join('\r\n'),url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=el('a');a.href=url;a.download='bussola-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}

$('teacherLoginForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('button');b.disabled=true;status('Verifica dell’accesso…');try{const r=await api('monitor_login',{accesso:f.elements.accesso.value,password:f.elements.password.value});token=r.token;sessionStorage.setItem(KEY,token);f.reset();await startSession();}catch(e){dropSession();status(e.message,true);}finally{b.disabled=false;}});
$('teacherLogout').addEventListener('click',async()=>{try{await api('monitor_logout');}catch{}dropSession();status('Accesso chiuso.');});
for(const b of document.querySelectorAll('[data-view]')){b.addEventListener('click',()=>chooseView(b.dataset.view));b.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[data-view]')],i=tabs.indexOf(b);const next=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;if(next!==null){e.preventDefault();tabs[next].click();tabs[next].focus();}});}
$('monitorCourse').addEventListener('change',()=>{course=$('monitorCourse').value;offset=0;lab=0;student='';clearSelection();load();});
for(const id of ['monitorSchool','monitorClass','includeTests'])$(id).addEventListener('change',()=>{if(id==='monitorSchool')$('monitorClass').value='';fillFilters();offset=0;student='';clearSelection();load();});
for(const id of ['monitorFrom','monitorTo','monitorState'])$(id).addEventListener('change',()=>{clearSelection();render();});
$('monitorRefresh').addEventListener('click',()=>load());$('previousPage').addEventListener('click',()=>{offset=Math.max(0,offset-50);clearSelection();load();});$('nextPage').addEventListener('click',()=>{offset+=50;clearSelection();load();});
$('monitorPresent').addEventListener('click',()=>{showNames=false;presentIndex=0;presentation();showDialog('presentation');});$('presentationPrevious').addEventListener('click',()=>{presentIndex-=$('compareWorks').checked?2:1;presentation();});$('presentationNext').addEventListener('click',()=>{presentIndex+=$('compareWorks').checked?2:1;presentation();});$('compareWorks').addEventListener('change',presentation);$('presentationNames').addEventListener('click',()=>{showNames=!showNames;presentation();});$('presentationFullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('presentation').requestFullscreen();}catch{status('Usa il comando a schermo intero del browser.');}});
for(const b of document.querySelectorAll('[data-close]'))b.addEventListener('click',()=>$(b.dataset.close).close());
for(const d of document.querySelectorAll('dialog'))d.addEventListener('close',()=>{if(d.id==='presentation'){$('presentationContent').replaceChildren();showNames=false;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}if(d.id==='staffEditor')$('staffForm').elements.password.value='';focusBeforeDialog?.focus({preventScroll:true});});
$('showClassCode').addEventListener('click',()=>{const c=session.classi.find(c=>c.id===$('monitorClass').value);if(c)showCode(c);});
$('newMonitorClass').addEventListener('click',()=>{$('monitorClassForm').reset();$('classEditorStatus').textContent='';showDialog('classEditor');});
$('openMonitorClass').addEventListener('click',()=>{$('openClassForm').reset();$('openClassStatus').textContent='';showDialog('openClassDialog');});
$('openClassForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type=submit]');b.disabled=true;try{const r=await api('monitor_open_class',{codice:f.elements.codice.value});$('openClassDialog').close();if(!session.classi.some(c=>c.id===r.classe.id))session.classi.push(r.classe);if(r.classe.prova)$('includeTests').checked=true;$('monitorSchool').value='';fillFilters();$('monitorClass').value=r.classe.id;offset=0;clearSelection();await load();}catch(e){$('openClassStatus').textContent=e.message;}finally{b.disabled=false;}});
$('monitorClassForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type=submit]');b.disabled=true;try{const r=await api('monitor_create_class',{...Object.fromEntries(new FormData(f)),prova:f.elements.prova.checked});$('classEditor').close();session.classi.push(r.classe);if(r.classe.prova)$('includeTests').checked=true;fillFilters();$('monitorClass').value=r.classe.id;offset=0;await load();showCode(r.classe);}catch(e){$('classEditorStatus').textContent=e.message;}finally{b.disabled=false;}});
$('staffAccessBox').addEventListener('toggle',()=>{if($('staffAccessBox').open)loadStaff().catch(e=>status(e.message,true));});$('newStaff').addEventListener('click',()=>editStaff());
$('staffForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type=submit]');b.disabled=true;try{await api('monitor_save_staff',{id:f.elements.id.value||undefined,updated_at:f.elements.updated_at.value,nome:f.elements.nome.value,accesso:f.elements.accesso.value,password:f.elements.password.value,corsi:[...f.querySelectorAll('[name=corsi]:checked')].map(x=>x.value),classi:[...f.elements.classi.selectedOptions].map(x=>x.value),attivo:f.elements.attivo.checked});$('staffEditor').close();await loadStaff();status('Accesso del collega salvato.');}catch(e){$('staffEditorStatus').textContent=e.message;}finally{b.disabled=false;}});
$('teacherFeedback').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('button');b.disabled=true;const id=f.dataset.operation||crypto.randomUUID();f.dataset.operation=id;try{await api('monitor_feedback',{id,...Object.fromEntries(new FormData(f))});f.reset();delete f.dataset.operation;$('feedbackStatus').textContent='Segnalazione salvata.';}catch(e){$('feedbackStatus').textContent=e.message;}finally{b.disabled=false;}});
$('readFeedback').addEventListener('click',async()=>{const identity=authVersion;try{const r=await api('monitor_feedback_list');if(identity!==authVersion)return;const box=$('feedbackList');box.replaceChildren();if(!r.segnalazioni.length)box.append(el('p','Nessuna segnalazione.'));for(const n of r.segnalazioni){const a=el('article',null,'note');a.append(el('h3',`${COURSES[n.corso]} · ${n.contesto}`),el('p',n.testo),el('small',when(n.created_at)));box.append(a);}}catch(e){status(e.message,true);}});
$('monitorReport').addEventListener('click',collectReport);$('reportAnonymous').addEventListener('change',renderReport);$('downloadMonitorCsv').addEventListener('click',saveCSV);$('printMonitorReport').addEventListener('click',()=>window.print());
setInterval(()=>{if(session&&document.visibilityState==='visible'){if($('autoRefresh').checked&&!document.querySelector('dialog[open]'))load(true);else verifyAccess();}},30000);
document.addEventListener('visibilitychange',()=>{if(session&&document.visibilityState==='visible')verifyAccess();});
$('teacherFeedback').addEventListener('input',()=>{delete $('teacherFeedback').dataset.operation;});
try{const r=await fetch('data/bussola.json');if(!r.ok)throw new Error('Domande non disponibili.');questions=(await r.json()).situations;if(token)await startSession();}catch(e){if(token)dropSession();status(e.message,true);}
