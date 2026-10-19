import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {JSDOM,VirtualConsole} from 'jsdom';
import {isolatedBussola} from './bussola-test-db.mjs';
const env=await isolatedBussola(),base=new URL('../',import.meta.url),html=await readFile(new URL('bussola-docenti.html',base),'utf8');
const errors=[],virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'http://127.0.0.1:8766/bussola-docenti.html?prova=monitoraggio',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
const w=dom.window,context=dom.getInternalVMContext(),modules=new Map(),downloads=[];let prints=0,checks=0;
Object.defineProperty(w,'crypto',{value:crypto});Object.assign(w,{structuredClone,TextEncoder,TextDecoder,AbortController,Blob});
w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};w.print=()=>{prints++;};
w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:local-fixture';};w.URL.revokeObjectURL=()=>{};
const originalClick=w.HTMLAnchorElement.prototype.click;w.HTMLAnchorElement.prototype.click=function(){if(!this.download)return originalClick.call(this);};
w.fetch=async(url,options={})=>{
 const u=new URL(url,w.location.href);
 if(u.pathname.startsWith('/__test/'))return (u.pathname.endsWith('bussola-esperienze')?env.experiences:env.handler)(new Request(u,{...options,headers:{...options.headers,Origin:'http://127.0.0.1:8766'}}));
 return new Response(await readFile(new URL('.'+u.pathname,base)),{status:200});
};
async function module(url){const key=url.href;if(!modules.has(key))modules.set(key,(async()=>new vm.SourceTextModule(await readFile(fileURLToPath(url),'utf8'),{context,identifier:key,initializeImportMeta(meta){meta.url=key;}}))());return modules.get(key);}
const $=id=>w.document.getElementById(id),eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;};
async function until(fn,label){const end=Date.now()+6000;while(Date.now()<end){if(fn()){checks++;return;}await new Promise(r=>setTimeout(r,10));}throw new Error('DOM timeout: '+label+'; status='+$('teacherStatus').textContent);}
function change(node,value){if(node.type==='checkbox')node.checked=value;else node.value=value;node.dispatchEvent(new w.Event('change',{bubbles:true}));}
function submit(form){form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));}
const m=await module(new URL('bussola-docenti.mjs',base));await m.link((specifier,referencing)=>module(new URL(specifier,referencing.identifier)));await m.evaluate();eq($('teacherWorkspace').hidden,true);
$('teacherLoginForm').elements.password.value='ANTEPRIMA';submit($('teacherLoginForm'));await until(()=>$('monitorBody').querySelector('table'),'FS dashboard');
eq($('monitorBody').querySelectorAll('tbody tr').length,3);eq($('staffAccessBox').hidden,false);
const preserved=JSON.stringify((await env.db.query('select partecipante_id,corso,payload,revision,updated_at from bussola_v2_progetti order by partecipante_id,corso')).rows);
$('tabBoard').click();eq($('monitorBody').querySelectorAll('.work-card').length,3);
const choices=$('monitorBody').querySelectorAll('.select-work input');change(choices[0],true);change(choices[1],true);eq($('monitorPresent').disabled,false);$('monitorPresent').click();eq($('presentation').open,true);eq($('presentationContent').textContent.includes('Fittizio'),false);change($('compareWorks'),true);eq($('presentationContent').querySelectorAll('.work-card').length,2);
w.document.querySelector('[data-close="presentation"]').click();eq($('presentationContent').children.length,0);
$('tabNotebook').click();eq($('monitorBody').querySelectorAll('.work-card').length,5);const noteDetails=[...$('monitorBody').querySelectorAll('details')].find(d=>d.querySelector('summary')?.textContent==='Note e versioni conservate');noteDetails.open=true;noteDetails.dispatchEvent(new w.Event('toggle'));await until(()=>noteDetails.dataset.loaded,'history');
$('monitorReport').click();await until(()=>$('reportDialog').open,'report');eq($('reportContent').querySelectorAll('tbody tr').length,3);eq($('reportContent').textContent.includes('Fittizio'),false);change($('reportAnonymous'),false);eq($('reportContent').textContent.includes('Fittizio'),true);change($('reportAnonymous'),true);$('downloadMonitorCsv').click();eq(downloads.length,1);eq((await downloads[0].text()).includes('Fittizio'),false);$('printMonitorReport').click();eq(prints,1);$('reportDialog').close();
for(const c of ['afm','sia','turismo','cat','ssas']){change($('monitorCourse'),c);await until(()=>$('monitorRefresh').disabled===false&&$('monitorBody').querySelectorAll('.work-card').length===5,c+' notebook');eq($('monitorBody').textContent.includes('richiede una verifica'),false,c+' display');}
eq(JSON.stringify((await env.db.query('select partecipante_id,corso,payload,revision,updated_at from bussola_v2_progetti order by partecipante_id,corso')).rows),preserved,'interfaccia in sola lettura');
$('newMonitorClass').click();const cf=$('monitorClassForm');cf.elements.scuola.value='Scuola del collaudo DOM';cf.elements.comune.value='Comune fittizio';cf.elements.classe.value='3DOM';cf.elements.prova.checked=true;submit(cf);await until(()=>$('codeDialog').open,'creazione codice');assert.match($('codeContent').textContent,/[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}/);checks++;assert.ok($('codeContent').querySelector('svg'));checks++;$('codeDialog').close();
$('newStaff').click();const sf=$('staffForm');sf.elements.nome.value='Collega del collaudo DOM';sf.elements.accesso.value='collega.dom';sf.elements.password.value='PROVA-collega-dom-2026';sf.querySelector('[name=corsi][value=ssas]').checked=true;for(const o of sf.elements.classi.options)o.selected=o.value===env.ids.classA;submit(sf);await until(()=>$('staffEditor').open===false&&$('staffList').textContent.includes('Collega del collaudo DOM'),'creazione accesso');
$('teacherLogout').click();await until(()=>$('teacherWorkspace').hidden,'logout');eq($('monitorBody').textContent,'');eq($('reportContent').textContent,'');eq($('presentationContent').textContent,'');
const f=$('teacherLoginForm');f.elements.accesso.value='collega.ssas';f.elements.password.value='PROVA-docente-2026';submit(f);await until(()=>$('monitorBody').querySelectorAll('tbody tr').length===1,'commission login');eq($('staffAccessBox').hidden,true);eq([...$('monitorCourse').options].map(o=>o.value).join(','),'ssas,bussola');eq([...$('monitorClass').options].filter(o=>o.value).length,1);eq($('monitorBody').textContent.includes('Alunno 2'),false);
await env.db.query('update bussola_v2_docenti set attivo=false where id=$1',[env.ids.teacherA]);$('monitorRefresh').click();await until(()=>$('teacherWorkspace').hidden,'revoca');eq($('monitorBody').textContent,'');
f.elements.accesso.value='';f.elements.password.value='ORIENTATORE';submit(f);await until(()=>!$('teacherWorkspace').hidden&&!$('monitorRefresh').disabled,'password Commissione');
eq($('openMonitorClass').hidden,false);eq($('adminLinks').hidden,true);eq($('staffAccessBox').hidden,true);eq([...$('monitorClass').options].filter(o=>o.value).length,0,'Commissione senza elenco globale');
const code=(await env.admin.from('bussola_v2_classi').select('codice_breve').eq('id',env.ids.classA).single()).data.codice_breve;
$('openMonitorClass').click();$('openClassForm').elements.codice.value=code;submit($('openClassForm'));await until(()=>$('monitorBody').querySelectorAll('tbody tr').length===1,'apertura classe con codice');eq($('openClassDialog').open,false);
eq([...$('monitorCourse').options].length,6,'cinque indirizzi e domande iniziali');
$('newMonitorClass').click();cf.elements.scuola.value='Commissione DOM fittizia';cf.elements.comune.value='Comune fittizio';cf.elements.classe.value='3CO';submit(cf);await until(()=>$('codeDialog').open,'codice creato dalla Commissione');eq(Boolean($('codeContent').querySelector('svg')),true);
const newCode=$('codeContent').querySelector('.class-code').textContent;$('teacherLogout').click();await until(()=>$('teacherWorkspace').hidden,'logout Commissione');eq($('codeContent').textContent,'');
f.elements.password.value='ORIENTATORE';submit(f);await until(()=>!$('teacherWorkspace').hidden&&!$('monitorRefresh').disabled,'rientro Commissione');eq([...$('monitorClass').options].filter(o=>o.value).length,0);
$('openMonitorClass').click();$('openClassForm').elements.codice.value=newCode;submit($('openClassForm'));await until(()=>$('openClassDialog').open===false,'riapertura dopo logout');eq([...$('monitorClass').options].filter(o=>o.value).length,1);
const timeoutFetch=w.fetch;w.fetch=async()=>{throw Object.assign(new Error('signal is aborted without reason'),{name:'AbortError'});};$('monitorRefresh').click();await until(()=>$('teacherStatus').textContent.includes('La connessione è lenta'),'timeout comprensibile');eq($('monitorBody').textContent.includes('Aggiornamento non riuscito'),true);w.fetch=timeoutFetch;
$('teacherLogout').click();await until(()=>$('teacherWorkspace').hidden,'chiusura finale Commissione');
eq(errors,[],'nessun errore JavaScript nel DOM simulato');
// Client salvataggio: bozza immediata, rete assente, ripresa, due finestre e isolamento dei token.
const remoteModule=await module(new URL('bussola-questionario-remote.mjs',base));await remoteModule.link((specifier,referencing)=>module(new URL(specifier,referencing.identifier)));await remoteModule.evaluate();
const factory=remoteModule.namespace.questionnaireRemote;let lastStatus='',loaded=null;
const r=factory({status:t=>{lastStatus=t;},loaded:p=>{loaded=p;},links:()=>{}});
const q=JSON.parse(await readFile(new URL('data/bussola.json',base),'utf8')),first=q.situations[0];
const draft={version:3,stage:'question',index:1,answers:{[first.id]:first.options[0].id}};
r.changed(draft);const queueKey=Object.keys(w.localStorage).find(k=>k.startsWith('bussola-questionario:'));assert.ok(queueKey);checks++;eq(JSON.parse(w.localStorage.getItem(queueKey)).dirty,true,'bozza salvata prima del debounce');await r.retry();await until(()=>lastStatus.startsWith('Risposte salvate'),'question save');
const second=factory({status:t=>{lastStatus=t;},loaded:p=>{loaded=p;},links:()=>{}});await second.init();eq(JSON.stringify(loaded.answers),JSON.stringify(draft.answers),'ripresa da altra finestra');
const changeOne={...draft,answers:{[first.id]:first.options[1].id}};r.changed(changeOne);await r.retry();
second.changed({...draft,answers:{[first.id]:null}});await second.retry();assert.match(lastStatus,/altra finestra/);checks++;
await second.reload();eq(loaded.answers[first.id],first.options[1].id,'conflitto risolto senza perdere la versione online');
const normalFetch=w.fetch;w.fetch=async()=>{throw new Error('Rete assente nella prova');};
second.changed({...draft,index:2});await second.retry();assert.match(lastStatus,/conservate sul dispositivo/);checks++;
const offline=factory({status:t=>{lastStatus=t;},loaded:p=>{loaded=p;},links:()=>{}});await offline.init();eq(loaded.index,2,'bozza ricaricata offline');w.fetch=normalFetch;await offline.retry();await until(()=>lastStatus.startsWith('Risposte salvate'),'retry offline');
// Il cambio partecipante usa il controller effettivo e conserva l'archivio precedente.
const studentHtml=await readFile(new URL('bussola-ssas.html',base),'utf8');
const classInfo=(await env.admin.from('bussola_v2_classi').select('*').eq('id',env.ids.classA).single()).data;
const studentDom=new JSDOM(studentHtml,{url:'http://127.0.0.1:8766/bussola-ssas.html?prova=monitoraggio#classe='+classInfo.codice_breve});
const saved=new Map([['lavoro-precedente','risposte da conservare']]);const storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
let destination='';const studentLocation=new URL(studentDom.window.location.href);studentLocation.assign=url=>{destination=url;};
const context2=vm.createContext({document:studentDom.window.document,window:studentDom.window,location:studentLocation,localStorage:storage,crypto,URL,URLSearchParams,AbortController,setTimeout,clearTimeout,btoa,fetch:async(url,opts)=>env.handler(new Request(new URL(url,studentLocation),{...opts,headers:{...opts.headers,Origin:'http://127.0.0.1:8766'}}))});
const m2=new Map();async function load2(url){if(!m2.has(url.href))m2.set(url.href,(async()=>new vm.SourceTextModule(await readFile(fileURLToPath(url),'utf8'),{context:context2,identifier:url.href}))());return m2.get(url.href);}
const controller=await load2(new URL('bussola-classe.mjs',base));await controller.link((id,parent)=>load2(new URL(id,parent.identifier)));await controller.evaluate();
controller.namespace.setupClass({key:'archivio-immutato',token:()=>env.people[0].token,ensure:async()=>{},isIntro:()=>true,start:()=>{}});
await until(()=>studentDom.window.document.getElementById('classSummary').textContent.includes('Alunno 1'),'identità precedente riconosciuta');
[...studentDom.window.document.querySelectorAll('button')].find(b=>b.textContent==='Cambia partecipante').click();
const nextPerson=new URL(destination),identityParams=new URLSearchParams(nextPerson.hash.slice(1));eq(identityParams.get('classe'),classInfo.codice_breve);assert.notEqual(identityParams.get('alunno'),env.people[0].token);checks++;eq(identityParams.get('alunno').length,43);eq(saved.get('lavoro-precedente'),'risposte da conservare');assert.ok(nextPerson.searchParams.get('progetto'));checks++;studentDom.window.close();
console.log(JSON.stringify({status:'superato',checks,scope:'Client questionario (offline, retry, conflitti) e interfaccia eseguita in DOM simulato con il vero handler e PostgreSQL locale: tre viste, presentazione, CSV, stampa, cinque indirizzi, commissione e revoca',limite:'Non sostituisce un collaudo visivo nel browser'},null,2));w.close();await env.db.close();
