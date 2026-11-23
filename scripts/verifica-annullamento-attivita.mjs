import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {JSDOM,VirtualConsole} from 'jsdom';
import {isolatedOrientation} from './verifica-conferma-visite.mjs';

const base=new URL('../',import.meta.url),ids={pending:'11111111-1111-4111-8111-111111111111',future:'22222222-2222-4222-8222-222222222222',confirmed:'33333333-3333-4333-8333-333333333333'};
const record=(id,data,stato)=>({id,nome:'Docente',cognome:'Esempio',tipo:'visita',scuola_id:'sanluri-calasanzio',data,stato,archiviata:false,titolo:'',nota:'Prova isolata',created_at:'2026-10-14T08:00:00Z'});
const appointment=(scuola_id,data,ora_inizio)=>({scuola_id,data,ora_inizio,stato:'confermata',tipo:'aule',archiviata:false});
const env=await isolatedOrientation({now:'2026-10-20T12:00:00Z',seed:{
 orientamento_attivita:[record(ids.pending,'2026-10-14','da_confermare'),record(ids.future,'2026-11-09','da_confermare'),record(ids.confirmed,'2026-10-13','confermata')],
 orientamento_appuntamenti:[
   appointment('uta-sede','2026-10-15','09:30'),
   appointment('uta-sede','2026-10-15','10:30'),
   appointment('sanluri-calasanzio','2026-10-14','09:00'),
   appointment('decimoputzu-gramsci','2026-11-19','09:00'),
 ],
}});
const errors=[],calls=[],virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(await readFile(new URL('gestione.html',base),'utf8'),{url:'http://127.0.0.1:8765/gestione.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
const w=dom.window,context=dom.getInternalVMContext(),modules=new Map();let failNextList=false,nativeDialogs=0,checks=0;
const NativeDate=w.Date;
w.Date=class extends NativeDate{
 constructor(...args){super(...(args.length?args:['2026-10-20T12:00:00Z']));}
 static now(){return NativeDate.parse('2026-10-20T12:00:00Z');}
};
w.HTMLElement.prototype.scrollIntoView=function(){};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
w.HTMLDialogElement.prototype.close=function(){this.open=false;};
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
 eq($('pendingList').querySelectorAll('[data-activity-id]').length,1);
 eq($('futureActivities').open,false);
 eq($('futureActivities').querySelectorAll('[data-activity-id]').length,1);
 const upcoming=$('upcomingAppointments'),past=$('pastAppointments');
 eq(upcoming.querySelectorAll('[data-school="uta-sede"]').length,0);
 eq(past.querySelectorAll('[data-school="uta-sede"]').length,2);
 eq($('appointmentSchool').options.length,24);
 const missing=$('pendingList').querySelectorAll('li[data-school="uta-sede"]');
 eq(missing.length,1,'una riga per scuola e giorno, anche con più orari');
 eq(missing[0].querySelector('.visit-hour').textContent,'dalle 09:30 · dalle 10:30');
 const prepare=button(missing[0],'Aggiungi docente');
 prepare.click();
 const form=$('activityForm');
 eq($('activityEditor').open,true);
 eq(form.elements.scuola_id.value,'uta-sede');
 eq(form.elements.data.value,'2026-10-15');
 eq($('activityDateField').hidden,true);
 form.elements.nome.value='Bozza da mantenere';
 form.elements.nome.dispatchEvent(new w.Event('input',{bubbles:true}));
 const escape = new w.Event('cancel',{cancelable:true});
 $('activityEditor').dispatchEvent(escape);
 eq(escape.defaultPrevented,true);
 eq(form.elements.nome.value,'Bozza da mantenere');
 eq(calls.includes('register_activity'),false,'aprire il modulo non registra la visita');
 $('activityCancel').click();
 eq(recordById(ids.pending).stato,'da_confermare');
 eq([...row(ids.pending).querySelectorAll('.visit-actions > button.ok')].map(b=>b.textContent),['Conferma visita']);
 eq(row(ids.pending).querySelector('details').open,false);
 eq(row(ids.future).querySelectorAll('.visit-actions > button.ok').length,0);
 eq(button(row(ids.future),'Annulla registrazione').disabled,false);
 const initial=JSON.stringify(env.tables.get('orientamento_attivita'));
 button(row(ids.pending),'Annulla registrazione').click();
 eq(calls.filter(a=>a==='archive_activity').length,0,'aprire la richiesta non annulla');
 eq(row(ids.pending).querySelector('.visit-actions').hidden,true);
 button(row(ids.pending),'Mantieni la registrazione').click();
 eq(JSON.stringify(env.tables.get('orientamento_attivita')),initial,'mantieni non scrive dati');
 eq(row(ids.pending).querySelector('.activity-cancel-prompt'),null);
 env.failWrites(true);
 button(row(ids.pending),'Annulla registrazione').click();button(row(ids.pending),'Sì, annulla registrazione').click();
 await until(()=>row(ids.pending).textContent.includes('Riprova ad annullare'),'errore recuperabile');
 eq(JSON.stringify(env.tables.get('orientamento_attivita')),initial,'errore non modifica il record');
 eq(button(row(ids.pending),'Mantieni la registrazione').disabled,false);
 button(row(ids.pending),'Mantieni la registrazione').click();env.failWrites(false);
 button(row(ids.pending),'Modifica registrazione').click();
 eq(form.elements.id.value,ids.pending);eq($('activityDiscard').hidden,false);
 eq($('activityEditor').open,true,'modifica apre il modulo visibile');
 form.elements.nome.value='Docente corretto';form.elements.data.value='2026-10-15';submit(form);
 await until(()=>recordById(ids.pending).nome==='Docente corretto'&&!form.elements.id.value,'salvataggio modifica');
 eq(recordById(ids.pending).id,ids.pending,'identificativo preservato');
 // Regola di Salvatore del 23/11/2026: ciò che la Funzione Strumentale registra o corregge per una data passata è già fatto.
 eq(recordById(ids.pending).stato,'confermata','la correzione FS di una data passata conferma');
 button(row(ids.pending),'Modifica registrazione').click();$('activityDiscard').click();
 eq(form.querySelector('.appointment-buttons').hidden,true);
 button(form,'Mantieni la registrazione').click();eq(form.elements.id.value,ids.pending);
 $('activityDiscard').click();button(form,'Sì, annulla registrazione').click();
 await until(()=>recordById(ids.pending).archiviata&&!row(ids.pending),'annullamento dal modulo');
 eq(recordById(ids.pending).stato,'confermata','annullare non cambia lo stato');
 eq(form.elements.id.value,'');eq($('activityDiscard').hidden,true);eq($('pendingList').querySelectorAll('[data-activity-id]').length,0);
 const confirmedBefore=JSON.stringify(recordById(ids.confirmed));
 button(row(ids.confirmed),'Modifica registrazione').click();form.elements.nota.value='Bozza da conservare';
 button(row(ids.future),'Annulla registrazione').click();failNextList=true;button(row(ids.future),'Sì, annulla registrazione').click();
 await until(()=>recordById(ids.future).archiviata&&!row(ids.future),'annullamento anche senza ricaricamento');
 eq($('futureActivities').hidden,true,'notifica rimossa senza conferma di visita');
 eq(form.elements.id.value,ids.confirmed,'altra modifica preservata');
 eq(form.elements.nota.value,'Bozza da conservare');eq(JSON.stringify(recordById(ids.confirmed)),confirmedBefore);
 $('refreshButton').click();await until(()=>!$('refreshButton').disabled,'ripresa dopo errore di rete');
 eq($('pendingList').querySelectorAll('[data-activity-id]').length,0);
 button(row(ids.confirmed),'Annulla registrazione').click();button(row(ids.confirmed),'Sì, annulla registrazione').click();
 await until(()=>recordById(ids.confirmed).archiviata&&!row(ids.confirmed),'annullamento di una conferma esistente');
 eq(env.tables.get('orientamento_attivita').length,3,'nessuna cancellazione fisica');
 eq(calls.filter(a=>a==='confirm_activity').length,1,'una sola conferma: quella della correzione FS di una data passata');eq(nativeDialogs,0);
 eq(errors,[],'nessun errore DOM');
 console.log(JSON.stringify({checks,status:'superato',scope:'FS, annullamento da scheda e modulo, errore e ripresa, date future, correzione FS di una data passata già confermata, conservazione e notifica',realDataUsed:false}));
}finally{w.close();}
