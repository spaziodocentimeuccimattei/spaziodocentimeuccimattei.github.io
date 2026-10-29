import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {JSDOM,VirtualConsole} from 'jsdom';
import {isolatedBussola} from './bussola-test-db.mjs';
const env=await isolatedBussola(),base=new URL('../',import.meta.url),errors=[],virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e.message));let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;},ok=(v,label)=>{assert.ok(v,label);checks++;};
const html=await readFile(new URL('bussola-cat.html',base),'utf8');
async function browser(url,storage=null){
 const dom=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole}),w=dom.window,modules=new Map();
 Object.defineProperty(w,'crypto',{value:crypto});Object.assign(w,{structuredClone,TextEncoder,TextDecoder,AbortController,Blob});
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 if(storage)for(const [k,v] of Object.entries(storage))w.localStorage.setItem(k,v);
 w.fetch=async(url,options={})=>{const u=new URL(url,w.location.href);if(u.pathname.startsWith('/__test/'))return (u.pathname.endsWith('bussola-esperienze')?env.experiences:env.handler)(new Request(u,{...options,headers:{...options.headers,Origin:'http://127.0.0.1:8766'}}));return new Response(await readFile(new URL('.'+u.pathname,base)),{status:200});};
 async function module(url){if(!modules.has(url.href))modules.set(url.href,(async()=>new vm.SourceTextModule(await readFile(fileURLToPath(url),'utf8'),{context:dom.getInternalVMContext(),identifier:url.href,initializeImportMeta(meta){meta.url=url.href;}}))());return modules.get(url.href);}
 const m=await module(new URL('cat.mjs',base));await m.link((id,parent)=>module(new URL(id,parent.identifier)));await m.evaluate();
 const $=id=>w.document.getElementById(id);
 async function until(fn,label){const end=Date.now()+8000;while(Date.now()<end){if(await fn()){checks++;return;}await new Promise(r=>setTimeout(r,15));}throw new Error('Timeout '+label+'; '+$('saveStatus')?.textContent);}
 const click=id=>{const n=$(id);assert.ok(n,'Controllo presente: '+id);assert.ok(!n.disabled,'Controllo abilitato: '+id);n.click();};
 const stored=()=>{for(const k of Object.keys(w.localStorage)){try{const v=JSON.parse(w.localStorage.getItem(k));if(v?.format==='bussola-cat-proposta-1')return v;}catch{}}return null;};
 return {dom,w,$,until,click,stored};
}
// Un alunno già collegato alla sua classe apre davvero la nuova attività e conserva la precedente.
const token=env.people[0].token,original=(await env.db.query("select payload from bussola_v2_progetti where partecipante_id=$1 and corso='cat'",[env.people[0].id])).rows[0].payload;
const b=await browser('http://127.0.0.1:8885/bussola-cat.html?prova=missione-dom#alunno='+token);
await b.until(()=>b.$('startMission')&&b.stored()?.journey===undefined,'ripresa della variante storica');eq(b.$('startMission').textContent.includes('Inizia la missione'),true);b.click('startMission');
await b.until(()=>b.$('mission-capture')||b.$('classDialog').open,'nuova missione pronta');if(b.$('classDialog').open&&b.$('classGuest')&&!b.$('classGuest').hidden)b.click('classGuest');
await b.until(()=>b.$('mission-capture'),'drone');eq(b.stored().journey,'cat-4plus2-missione');eq(b.stored()._cat_archives[0].project.heritage,original.heritage);eq(b.stored()._cat_archives[0].project.done,original.done);
for(let n=0;n<4;n++){b.click('mission-capture');b.click('mission-right');}eq(b.stored().mission.captures.length,4);eq(b.$('next').disabled,true);b.click('mission-camera-termica');for(const s of ['parete','infissi','telaio'])b.click('mission-spot-'+s);eq(b.$('next').disabled,false);ok(b.$('stage').textContent.includes('possibile ponte termico'));
b.click('next');eq(b.$('stageTitle').textContent,'Le tue scelte cambiano l’edificio.');
for(const id of ['isolamento-assente','infissi-attuali','finitura-bassovoc'])b.click('mission-'+id);b.click('mission-test');eq(b.$('next').disabled,true);ok(b.$('stage').textContent.includes('La sola finitura cambia l’aspetto'));
for(const id of ['isolamento-sughero','infissi-tripli'])b.click('mission-'+id);b.click('mission-test');eq(b.$('next').disabled,true);ok(b.$('stage').textContent.includes('supera il budget'));
for(const id of ['isolamento-minerale','infissi-doppi'])b.click('mission-'+id);b.click('mission-test');eq(b.$('next').disabled,false);ok(b.$('stage').textContent.includes('−64%'));ok(b.$('stage').textContent.includes('22.200 €'));eq(b.stored().mission.runs.length,3);
b.click('next');eq(b.$('next').disabled,true);b.click('mission-apply');eq(b.$('next').disabled,false);ok(b.$('missionCompare'));b.$('missionCompare').value=30;b.$('missionCompare').dispatchEvent(new b.w.Event('input',{bubbles:true}));eq(b.stored().mission.compare,30);eq(b.w.document.querySelector('.mission-compare').style.getPropertyValue('--reveal'),'30%');
b.click('next');eq(b.stored().screen,3);eq(b.$('certificateOpen').disabled,false);eq(b.w.document.querySelectorAll('.end-card').length,5);
const interest=b.w.document.querySelector('input[name=interest][value=termografia]');interest.checked=true;interest.dispatchEvent(new b.w.Event('change',{bubbles:true}));ok(b.$('interestMessage').textContent.includes('Termografia'));
b.click('notesOpen');const form=b.$('noteForm');form.elements.text.value='Mi interessa confrontare le scelte dei materiali.';form.dispatchEvent(new b.w.Event('submit',{bubbles:true,cancelable:true}));b.$('notesDialog').close();await b.until(()=>b.$('saveStatus').textContent.startsWith('Tutto salvato')&&!b.stored().notes.some(n=>n.pending),'salvataggio missione e nota');
let saved=(await env.db.query("select payload from bussola_v2_progetti where partecipante_id=$1 and corso='cat'",[env.people[0].id])).rows[0].payload;eq(saved.journey,'cat-4plus2-missione');eq(saved.mission.compare,30);eq(saved._cat_archives[0].project.survey,original.survey);eq((await env.db.query('select count(*) as n from bussola_v2_alunni where partecipante_id=$1',[env.people[0].id])).rows[0].n,1,'stessa identità e classe');
const archiveKey=b.stored()._cat_archives[0].key;b.w.document.querySelector('[data-cat-restore="'+archiveKey+'"]').click();eq(b.stored().journey,undefined);eq(b.stored().done,original.done);eq(b.stored().heritage,original.heritage);b.click('start');ok(b.$('stageTitle').textContent.includes('elaborati')||b.stored().screen===10);eq(b.$('certificateOpen').disabled,false,'attestato storico disponibile');
const newArchive=b.stored()._cat_archives.find(a=>a.project.journey==='cat-4plus2-missione');b.w.document.querySelector('[data-cat-restore="'+newArchive.key+'"]').click();eq(b.stored().mission.compare,30);eq(b.stored().mission.runs.length,3);b.click('start');eq(b.$('certificateOpen').disabled,false);await b.until(async()=>{const r=await env.db.query("select payload from bussola_v2_progetti where partecipante_id=$1 and corso='cat'",[env.people[0].id]);return r.rows[0].payload.journey==='cat-4plus2-missione';},'ripresa missione');
// Ripresa su un nuovo dispositivo: archivio e missione arrivano dal server, senza localStorage precedente.
const reopened=await browser('http://127.0.0.1:8885/bussola-cat.html?prova=missione-secondo#alunno='+token);await reopened.until(()=>reopened.stored()?.mission?.compare===30,'ripresa remota');eq(reopened.stored()._cat_archives.length,1);eq(reopened.stored().mission.runs.length,3);reopened.click('start');eq(reopened.$('certificateOpen').disabled,false);
eq(errors,[],'nessun errore nel DOM simulato');b.w.close();reopened.w.close();await env.db.close();console.log(JSON.stringify({status:'superato',checks,coverage:['ingresso da lavoro storico','quattro facciate','termocamera e osservazioni','finitura senza falso risparmio','budget superato e corretto','confronto interattivo','dossier e interessi','note','stessa identità e classe','archivio storico','ripresa da altro dispositivo'],limite:'DOM simulato con handler e PostgreSQL reali isolati; non misura il layout di un browser'},null,2));
