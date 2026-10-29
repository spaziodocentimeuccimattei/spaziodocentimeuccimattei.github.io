import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as C from '../cat-core.mjs';
import * as E from '../cat-edificio-core.mjs';
import {buildingContent,buildingCards,buildingMonitorVisual} from '../cat-edificio.mjs';
import {courseDetails,completion,certificateSnapshot} from '../bussola-records-core.mjs';
import {participantCertificate} from '../bussola-attestato-alunno-core.mjs';
import {certificateCSV} from '../bussola-attestati-files.mjs';
import {projectView} from '../bussola-monitor-core.mjs';
import {isolatedBussola} from './bussola-test-db.mjs';
let checks=0;const eq=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;},ok=(a,label)=>{assert.ok(a,label);checks++;};
const p=C.createProject(undefined,'edificio'),b=p.building;p.started=true;p.screen=0;
eq(p.journey,E.BUILDING_JOURNEY);ok(C.validProject(p));eq(C.completed(p),false);
// Copertura incompleta, correzione, numero massimo e ricalcolo delle dipendenze.
for(const id of ['A','B','C'])ok(E.toggleShot(b,id));eq(E.toggleShot(b,'D'),false);eq(E.testShots(b).missing,['nord','tetto']);eq(C.ready(p,1),false);
E.toggleShot(b,'B');E.toggleShot(b,'D');eq(E.shotResult(b).complete,true);eq(C.ready(p,1),false,'La nuova scelta deve essere provata');E.testShots(b);eq(C.ready(p,1),true);
// Riproduce la correzione del percorso dopo aver già superato la prima schermata.
const correction=C.createProject(undefined,'edificio');correction.started=true;correction.screen=0;correction.building.points=['A','B','C'];C.advance(correction);E.toggleShot(correction.building,'B');C.invalidate(correction);eq(correction.done,[]);E.toggleShot(correction.building,'D');E.testShots(correction.building);C.advance(correction);ok(correction.done.includes(0)&&correction.done.includes(1),'Il rilievo corretto non blocca l’attestato');
const combinations=[];for(let a=0;a<4;a++)for(let c=a+1;c<5;c++)for(let d=c+1;d<6;d++){
 const q=E.newBuilding();q.points=[E.SHOTS[a].id,E.SHOTS[c].id,E.SHOTS[d].id];const r=E.shotResult(q),union=new Set(q.points.flatMap(id=>E.SHOTS.find(s=>s.id===id).sees));eq(r.complete,E.SURFACES.every(s=>union.has(s)));eq(r.covered.length+r.missing.length,5);combinations.push({points:q.points,complete:r.complete});
}
eq(combinations.length,20);ok(combinations.some(c=>c.complete)&&combinations.some(c=>!c.complete));
b.views=['pianta','prospetto'];b.facts=E.BUILDING_FACTS.map(v=>v.id);E.composeBuilding(b);
b.thermal=E.THERMAL_SPOTS.map(v=>v.id);b.intervention='continuo';E.testMaterial(b);E.compareBuilding(b);E.compareBuildingEnergy(b);E.testBuildingEstimate(b);b.phase='progetto';E.testBuildingPlan(b);
for(let s=0;s<10;s++){ok(C.ready(p,s),'Passaggio pronto '+s);eq(p.screen,s);ok(C.advance(p));}ok(C.completed(p));ok(C.validProject(p));
eq(E.buildingEnergy(b),{intervention:'continuo',before:320,after:140,beforeClass:'G',afterClass:'D'});
eq(E.buildingEstimate(b).total,14000);eq(E.buildingPlan(b).now,1000);eq(E.buildingPlan(b).later,13000);
for(const i of E.INTERVENTIONS){for(const phase of E.BUILDING_PHASES){const q={intervention:i.id,phase:phase.id},e=E.buildingEstimate(q),plan=E.buildingPlan(q);eq(e.total,e.area*e.price+1000);eq(plan.now+plan.later,e.total);eq(plan.gap,Math.max(0,plan.now-12000));eq(plan.remaining,Math.max(0,12000-plan.now));}}
const q=C.clone(p);q.building.intervention='serramenti';C.invalidate(q);eq(q.done,[0,1,2,3,4],'La scelta nuova invalida solo i risultati che ne dipendono');eq(q.building.comparisonRuns,b.comparisonRuns,'Le prove precedenti restano');eq(C.completed(q),false);
p.interests=['rilievo','energia'];C.addNote({...p,screen:7},{text:'Vorrei approfondire la termografia.',role:'alunno',kind:'piaciuto'});p.future={keep:['risposta futura']};b.future={value:'conservare'};
const restored=C.restore(C.clone(p));eq(restored,p,'Ripristino integrale, campi futuri compresi');eq(C.remoteProject(p).building,b);eq(C.remoteProject(p).notes,[]);eq(C.remoteProject(p).future,p.future);
for(const mutate of [v=>delete v.building,v=>v.building.points.push('A'),v=>v.building.views.push('inventata'),v=>v.building.intervention='inventato',v=>v.building.phase='inventata',v=>v.building.thermal.push('inventato'),v=>v.building.energyRuns[0].after=0,v=>v.building.comparisonRuns[0].after[1]=0,v=>v.building.estimateRuns[0].total=0,v=>v.building.planRuns[0].gap=-1]){const v=C.clone(p);mutate(v);eq(C.validProject(v),false);}
const details=courseDetails(p);eq(details.labs.map(l=>l.label),['Rilievo','Edificio','Materiali','Energia','Risorse']);eq(completion({corso:'cat',payload:p}).done,5);eq(completion({corso:'cat',payload:p}).interests,['Rilievo','Energia']);
const view=projectView({payload:p},'cat');ok(view.valid);ok(view.completed);ok(view.labs[0].fields.some(f=>f.label==='Punti di ripresa'&&f.value.includes('Nord-est')));ok(view.labs[2].fields.some(f=>f.value==='Isolamento esterno continuo'));ok(view.labs[3].text.includes('G → D'));
for(let s=0;s<10;s++){const v=buildingContent(p,s);ok(v.left&&v.right,'Schermata '+s);ok(!/undefined|NaN/.test(v.left+v.right));}eq(buildingCards(p).length,5);for(let i=0;i<4;i++)ok(buildingMonitorVisual(p,i).includes('<svg'));
const cert=participantCertificate(p,{name:'Prova Locale',id:crypto.randomUUID(),date:new Date().toISOString()});eq(cert.snapshot.percorso,E.BUILDING_JOURNEY);eq(cert.snapshot.laboratori,details.labs.map(l=>l.label));ok(certificateCSV([cert]).includes('CAT 4+2'));ok(!JSON.stringify(cert.snapshot).includes('Archeodesign'));
// Handler e database isolati: identità, conflitti, note, snapshot, entrambe le varianti precedenti.
const env=await isolatedBussola(),token=Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url'),other=Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
async function call(action,body={},key=token){const r=await env.experiences(new Request('http://127.0.0.1:8885/__test/bussola-esperienze',{method:'POST',headers:{'Content-Type':'application/json','Origin':'http://127.0.0.1:8766','x-bussola-token':key},body:JSON.stringify({action,corso:'cat',...body})}));return {status:r.status,body:await r.json()};}
eq((await call('start')).status,200);eq((await call('save',{project:p,revision:0})).status,200);const loaded=await call('load');eq(loaded.body.project.payload.building,b);ok(C.completed(loaded.body.project.payload));eq(loaded.body.project.payload.future,p.future);eq((await call('save',{project:p,revision:0})).status,409);eq((await call('start',{},other)).status,200);eq((await call('load',{},other)).body.project,null);
const note=p.notes[0];eq((await call('note',{note:{id:note.id,passaggio:4,contesto:note.label,versione:1,ruolo_dichiarato:'alunno',tipo:'piaciuto',testo:note.text}})).status,200);eq((await call('load')).body.notes[0].testo,note.text);
const snap=certificateSnapshot({id:crypto.randomUUID(),nome:'Prova',cognome:'Locale',verificato:true},{scuola:'Scuola fittizia',comune:'Comune fittizio',classe:'3P',anno:'2026/2027'},{corso:'cat',payload:p,revision:1});eq(snap.percorso,E.BUILDING_JOURNEY);eq(snap.laboratori,cert.snapshot.laboratori);
for(const variant of ['legacy','4plus2']){const old=C.createProject(undefined,variant);old.extra='risposta precedente';old.notes=[{id:crypto.randomUUID(),label:'Nota precedente',text:'Conservare'}];const before=C.clone(old);eq(C.restore(old),before);eq(C.labsFor(old)[3].id,variant==='legacy'?'tracce':'energia');}
const legacy=env.projects.cat;ok(C.completed(C.restore(legacy)));eq(C.labsFor(legacy)[3].id,'tracce');eq(C.createProject(undefined,'4plus2').energy,{observations:[],control:null,runs:[]});
for(const folder of ['bussola-esperienze','bussola-gestione'])for(const name of ['cat-core.mjs','cat-edificio-core.mjs'])eq(await readFile(new URL(`../supabase/functions/${folder}/${name}`,import.meta.url),'utf8'),(await readFile(new URL('../'+name,import.meta.url),'utf8')).replace(/\?v=[\w-]+/g,''),'Parità nucleo server '+folder+'/'+name);
await env.db.close();console.log(JSON.stringify({result:'superato',checks,shotCombinations:combinations.length,journey:E.BUILDING_JOURNEY,oldJourneys:'conservati',database:'isolato, nessun dato reale'},null,2));
