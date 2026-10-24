import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {JSDOM,VirtualConsole} from 'jsdom';
const base=new URL('../',import.meta.url);
const {isolatedBussola}=await import(new URL('scripts/bussola-test-db.mjs',base));
const env=await isolatedBussola(),data=new Map(),checks=[];let failArchive=false;
const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(failArchive&&k.endsWith(':conservati'))throw new Error('Spazio esaurito nel test');data.set(k,String(v));},removeItem:k=>data.delete(k),key:i=>[...data.keys()][i]??null,get length(){return data.size;}};
const record=(name,actual,expected)=>{assert.deepEqual(actual,expected,name);checks.push({name,actual});};
async function until(fn,label){const end=Date.now()+4000;while(Date.now()<end){if(fn())return;await new Promise(r=>setTimeout(r,15));}throw new Error('Timeout: '+label);}
async function page(url,{offline=false}={}){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(await readFile(new URL('bussola-turismo.html',base),'utf8'),{url,pretendToBeVisual:true,virtualConsole:console});
 const w=dom.window,doc=w.document;let destination='';
 const loc={get href(){return w.location.href;},set href(v){destination=v;},get origin(){return w.location.origin;},get pathname(){return w.location.pathname;},get hostname(){return w.location.hostname;},get search(){return w.location.search;},get hash(){return w.location.hash;},assign(v){destination=v;}};
 w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};w.scrollTo=()=>{};
 Object.defineProperty(w,'localStorage',{value:storage});
 const context=vm.createContext({window:w,document:doc,location:loc,localStorage:storage,crypto,URL,URLSearchParams,AbortController,Blob,TextEncoder,TextDecoder,btoa,structuredClone,FormData:w.FormData,CustomEvent:w.CustomEvent,setTimeout:w.setTimeout.bind(w),clearTimeout:w.clearTimeout.bind(w),fetch:async(url,opts={})=>{
  const u=new URL(url,w.location.href);
  if(offline)throw new Error('Connessione assente nella prova');
  if(u.pathname.startsWith('/__test/'))return (u.pathname.endsWith('bussola-esperienze')?env.experiences:env.handler)(new Request(u,{...opts,headers:{...opts.headers,Origin:'http://127.0.0.1:8766'}}));
  return new Response(await readFile(new URL('.'+u.pathname,base)),{status:200});
 }}),modules=new Map();
 async function mod(url){if(!modules.has(url.href))modules.set(url.href,(async()=>new vm.SourceTextModule(await readFile(fileURLToPath(url),'utf8'),{context,identifier:url.href}))());return modules.get(url.href);}
 const m=await mod(new URL('turismo.mjs',base));await m.link((s,p)=>mod(new URL(s,p.identifier)));await m.evaluate();
 const $=id=>doc.getElementById(id);
 return {dom,w,$,get url(){return w.location.href;},get destination(){return destination;},get button(){return $('enter')?.textContent.trim().replace(/\s*→$/,'');},get project(){const id=new URL(w.location.href).searchParams.get('progetto');return [...data].filter(([k])=>k.endsWith('.'+id)&&!k.includes('.remote.')).map(([,v])=>JSON.parse(v))[0];},errors};
}
try{
 let p=await page('http://127.0.0.1:8766/bussola-turismo.html?prova=ingresso-a');
 record('Primo accesso',p.button,'Inizia');record('Nessuna attività avviata',p.project.started,false);let firstURL=p.url;p.w.close();
 p=await page(firstURL);record('Ricarica senza iniziare',p.button,'Inizia');p.$('enter').click();record('Dialogo di accesso',p.$('classDialog').open,true);p.$('closeClass').click();record('Chiudere il dialogo non avvia',p.project.started,false);record('Invito dopo annullamento',p.button,'Inizia');
 p.$('enter').click();p.$('classGuest').click();await until(()=>p.$('previous'),'avvio');p.$('previous').click();record('Ritorno dopo avvio',p.button,'Riprendi l’attività salvata');
 // Save one choice to distinguish the old work from a genuine new activity.
 p.$('enter').click();p.w.document.querySelector('[data-key="place"][data-value="laguna"]').click();await until(()=>p.$('saved').textContent.includes('Tutto salvato'),'salvataggio online');p.$('previous').click();firstURL=p.url;
 const old=p.project,oldId=old.id,oldRemote=JSON.stringify((await env.db.query("select partecipante_id,corso,payload,revision from bussola_v2_progetti where payload->>'id'=$1",[oldId])).rows);
 record('Scelta registrata',old.choices.place,'laguna');p.w.close();
 p=await page(firstURL);await until(()=>p.$('saved').textContent.includes('Tutto salvato'),'ripresa online');record('Ripresa dopo ricarica',p.button,'Riprendi l’attività salvata');record('Scelta ripresa',p.project.choices.place,'laguna');
 p.$('newDemo').click();const next=p.destination;assert.ok(next);p.w.close();
 p=await page(next);await until(()=>p.$('saved').textContent.includes('Tutto salvato'),'nuova copia online');
 checks.push({name:'Inizia un altro lavoro: risultato',button:p.button,oldId,newId:p.project.id,choices:p.project.choices});
 record('Nuovo lavoro conserva un ID distinto',p.project.id===oldId,false);
 record('Nuovo lavoro non è avviato',p.project.started,false);
 record('Nuovo lavoro non riprende scelte precedenti',p.project.choices.place,undefined);
 record('Nuovo ingresso presenta Inizia',p.button,'Inizia');
 record('Recupero precedente disponibile',p.$('savedActivities').querySelectorAll('a').length,1);
 const recoveredURL=p.$('savedActivities').querySelector('a').href;
 record('Link conservato punta al lavoro precedente',new URL(recoveredURL).searchParams.get('progetto'),oldId);
 record('Lavoro precedente online conservato',JSON.stringify((await env.db.query("select partecipante_id,corso,payload,revision from bussola_v2_progetti where payload->>'id'=$1",[oldId])).rows),oldRemote);
 p.w.close();
 p=await page(recoveredURL);await until(()=>p.$('saved').textContent.includes('Tutto salvato'),'riapertura archivio');
 record('Attività precedente riaperta con il suo ID',p.project.id,oldId);
 record('Scelta precedente conservata',p.project.choices.place,'laguna');
 record('Attività precedente ancora riprendibile',p.button,'Riprendi l’attività salvata');
 record('Alternativa visibile nell’ingresso',p.w.document.querySelectorAll('[data-new-activity]').length,1);
 const personBefore=data.get('bussola-partecipante:prova:ingresso-a');failArchive=true;
 p.w.document.querySelector('[data-new-activity]').click();
 record('Archivio non disponibile: nessun cambio di pagina',p.destination,'');
 record('Archivio non disponibile: identità conservata',data.get('bussola-partecipante:prova:ingresso-a'),personBefore);
 record('Archivio non disponibile: messaggio comprensibile',p.$('saved').textContent.includes('Non riesco a conservare'),true);
 failArchive=false;p.w.document.querySelector('[data-new-activity]').click();const visibleDestination=p.destination;p.w.close();
 p=await page(visibleDestination);await until(()=>p.$('saved').textContent.includes('Tutto salvato'),'nuova attività da ingresso');
 record('Alternativa nell’ingresso apre una nuova attività',p.button,'Inizia');
 record('Alternativa nell’ingresso conserva il recupero',p.$('savedActivities').querySelectorAll('a').length,1);
 p.$('openClass').click();
 [...p.w.document.querySelectorAll('button')].find(b=>b.textContent==='Cambia partecipante').click();
 const anotherURL=p.destination;p.w.close();
 p=await page(anotherURL);await until(()=>p.$('saved').textContent.includes('Tutto salvato'),'cambio partecipante');
 record('Altra persona vede Inizia',p.button,'Inizia');
 record('Altra persona non eredita scelte',p.project.choices.place,undefined);
 record('Altra persona ha un progetto distinto',p.project.id===oldId,false);
 record('Altra persona non eredita i link dei lavori precedenti',p.$('savedActivities').querySelectorAll('a').length,0);
 record('Nessun errore JavaScript nel DOM',p.errors,[]);
 p.w.close();
 p=await page(recoveredURL,{offline:true});await until(()=>!p.$('retrySave').hidden,'recupero offline');
 record('Recupero senza rete mantiene Riprendi',p.button,'Riprendi l’attività salvata');
 record('Recupero senza rete conserva la scelta',p.project.choices.place,'laguna');p.w.close();

}finally{console.log(JSON.stringify({scope:'Moduli reali Turismo eseguiti in DOM simulato e PostgreSQL isolato, con soli dati fittizi',limite:'Non sostituisce un nuovo controllo visivo nel browser',checks},null,2));await env.db.close();}
