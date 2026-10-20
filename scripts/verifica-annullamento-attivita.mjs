import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {JSDOM,VirtualConsole} from 'jsdom';
import {isolatedOrientation} from './verifica-conferma-visite.mjs';

const base=new URL('../',import.meta.url),ids={pending:'11111111-1111-4111-8111-111111111111',future:'22222222-2222-4222-8222-222222222222',confirmed:'33333333-3333-4333-8333-333333333333'};
const record=(id,data,stato)=>({id,nome:'Docente',cognome:'Esempio',tipo:'visita',scuola_id:'sanluri-calasanzio',data,stato,archiviata:false,titolo:'',nota:'Prova isolata',created_at:'2026-10-14T08:00:00Z'});
const env=await isolatedOrientation({now:'2026-10-20T12:00:00Z',seed:{orientamento_attivita:[record(ids.pending,'2026-10-14','da_confermare'),record(ids.future,'2026-11-09','da_confermare'),record(ids.confirmed,'2026-10-13','confermata')]}});
const errors=[],calls=[],virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(await readFile(new URL('gestione.html',base),'utf8'),{url:'http://127.0.0.1:8765/gestione.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
const w=dom.window,context=dom.getInternalVMContext(),modules=new Map();let failNextList=false,nativeDialogs=0,checks=0;
const NativeDate=w.Date;
w.Date=class extends NativeDate{
 constructor(...args){super(...(args.length?args:['2026-10-20T12:00:00Z']));}
 static now(){return NativeDate.parse('2026-10-20T12:00:00Z');}
};
w.HTMLElement.prototype.scrollIntoView=function(){};
w.confirm=()=>{nativeDialogs++;throw new Error('Finestra nativa non disponibile');};
w.fetch=async(url,options={})=>{
 const payload=JSON.parse(options.body);calls.push(payload.action);
 if(failNextList&&payload.action==='list_contributions'){failNextList=false;throw new Error('Ricaricamento non disponibile nella prova');}
 return env.handler(new Request('http://127.0.0.1:8765/functions/v1/orientamento',{...options,headers:{...options.headers,Origin:'http://127.0.0.1:8765'}}));
};
async function module(url){if(!modules.has(url.href))modules.set(url.href,new vm.SourceTextModule(await readFile(fileURLToPath(url),'utf8'),{context,identifier:url.href}));return modules.get(url.href);}
const m=await module(new URL('gestione.js',base));await m.link((id,parent)=>module(new URL(id,parent.identifier)));await m.evaluate();
const $=id=>w.document.getElementById(id),row=id=>w.document.querySelector(`[data-activity-id="${id}"]`),recordById=id=>env.tables.get('orientamento_attivita').find(r=>r.id===id);
const eq=(actual,expected,label)=>{assert.deepEqual(actual,expected,label);checks++;};
const button=(area,text)=>{const b=[...area.querySelectorAll('button')].find(b=>b.textContent===text);assert.ok(b,text);return b;};
const submit=form=>form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
async function until(fn,label){const end=Date.now()+5000;while(Date.now()<end){if(fn()){checks++;return;}await new Promise(resolve=>setTimeout(resolve,5));}throw new Error('Timeout: '+label);}
try{
 $('managePassword').value='ANTEPRIMA';submit($('passwordForm'));
 await until(()=>row(ids.pending)&&!$('workspacePanel').hidden,'accesso FS con credenziale fittizia');
 eq($('pendingList').querySelectorAll('article').length,2);
 eq(recordById(ids.pending).stato,'da_confermare');
 eq([...row(ids.pending).querySelector('.review-actions').children].map(b=>b.textContent),['Annulla registrazione','Modifica dati o docente','Conferma che si è svolta']);
 eq(button(row(ids.future),'Conferma che si è svolta').disabled,true);
 eq(button(row(ids.future),'Annulla registrazione').disabled,false);
 const initial=JSON.stringify(env.tables.get('orientamento_attivita'));
 button(row(ids.pending),'Annulla registrazione').click();
 eq(calls.filter(a=>a==='archive_activity').length,0,'aprire la richiesta non annulla');
 eq(row(ids.pending).querySelector('.review-actions').hidden,true);
 button(row(ids.pending),'Mantieni la registrazione').click();
 eq(JSON.stringify(env.tables.get('orientamento_attivita')),initial,'mantieni non scrive dati');
 eq(row(ids.pending).querySelector('.activity-cancel-prompt'),null);
 env.failWrites(true);
 button(row(ids.pending),'Annulla registrazione').click();button(row(ids.pending),'Sì, annulla registrazione').click();
 await until(()=>row(ids.pending).textContent.includes('Riprova ad annullare'),'errore recuperabile');
 eq(JSON.stringify(env.tables.get('orientamento_attivita')),initial,'errore non modifica il record');
 eq(button(row(ids.pending),'Mantieni la registrazione').disabled,false);
 button(row(ids.pending),'Mantieni la registrazione').click();env.failWrites(false);
 button(row(ids.pending),'Modifica dati o docente').click();
 const form=$('activityForm');
 eq(form.elements.id.value,ids.pending);eq($('activityDiscard').hidden,false);
 eq(w.document.querySelector('[data-panel="attivita"]').hidden,false,'modifica apre il modulo visibile');
 form.elements.nome.value='Docente corretto';form.elements.data.value='2026-10-15';submit(form);
 await until(()=>recordById(ids.pending).nome==='Docente corretto'&&!form.elements.id.value,'salvataggio modifica');
 eq(recordById(ids.pending).id,ids.pending,'identificativo preservato');
 eq(recordById(ids.pending).stato,'da_confermare','modificare non conferma');
 button(row(ids.pending),'Modifica dati o docente').click();$('activityDiscard').click();
 eq(form.querySelector('.appointment-buttons').hidden,true);
 button(form,'Mantieni la registrazione').click();eq(form.elements.id.value,ids.pending);
 $('activityDiscard').click();button(form,'Sì, annulla registrazione').click();
 await until(()=>recordById(ids.pending).archiviata&&!row(ids.pending),'annullamento dal modulo');
 eq(recordById(ids.pending).stato,'da_confermare','annullare non attesta svolgimento');
 eq(form.elements.id.value,'');eq($('activityDiscard').hidden,true);eq($('countConfermare').textContent,'1');
 const confirmedBefore=JSON.stringify(recordById(ids.confirmed));
 button(row(ids.confirmed),'Modifica dati o docente').click();form.elements.nota.value='Bozza da conservare';
 w.document.querySelector('[data-tab="confermare"]').click();
 button(row(ids.future),'Annulla registrazione').click();failNextList=true;button(row(ids.future),'Sì, annulla registrazione').click();
 await until(()=>recordById(ids.future).archiviata&&!row(ids.future),'annullamento anche senza ricaricamento');
 eq($('countConfermare').textContent,'','notifica rimossa senza conferma di visita');
 eq(form.elements.id.value,ids.confirmed,'altra modifica preservata');
 eq(form.elements.nota.value,'Bozza da conservare');eq(JSON.stringify(recordById(ids.confirmed)),confirmedBefore);
 $('refreshButton').click();await until(()=>!$('refreshButton').disabled,'ripresa dopo errore di rete');
 eq($('pendingList').textContent,'Nessuna attività da verificare.');
 button(row(ids.confirmed),'Annulla registrazione').click();button(row(ids.confirmed),'Sì, annulla registrazione').click();
 await until(()=>recordById(ids.confirmed).archiviata&&!row(ids.confirmed),'annullamento di una conferma esistente');
 eq(env.tables.get('orientamento_attivita').length,3,'nessuna cancellazione fisica');
 eq(calls.includes('confirm_activity'),false,'nessuna conferma implicita');eq(nativeDialogs,0);
 eq(errors,[],'nessun errore DOM');
 console.log(JSON.stringify({checks,status:'superato',scope:'FS, annullamento da scheda e modulo, errore e ripresa, date future, modifica senza conferma, conservazione e notifica',realDataUsed:false}));
}finally{w.close();}
