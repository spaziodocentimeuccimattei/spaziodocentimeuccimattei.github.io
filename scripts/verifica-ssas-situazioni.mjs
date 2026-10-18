import assert from 'node:assert/strict';
import {CASES,FORMAT,LABS,GUIDE,freshProject,restoreProject,selectCase,guideIssues,titleDefaults,summaryItems} from '../ssas-situazioni-core.mjs';
import {completion,courseDetails} from '../bussola-records-core.mjs';
import {participantCertificate} from '../bussola-attestato-alunno-core.mjs';
assert.equal(CASES.length,6);assert.equal(new Set(CASES.map(c=>c.id)).size,6);
let runs=0;
for(const c of CASES){
 assert(c.scene.split(/\s+/).length<=45,c.id+' caso troppo lungo');
 for(const k of ['openings','participation','adaptations','purposes','formats','activities','access','checks','responses'])assert.equal(c[k].length,2,c.id+' '+k);
 assert.equal(c.supports.length,3);
 for(let bits=1;bits<8;bits++)for(let choice=0;choice<2;choice++){
  let p=selectCase(freshProject(),c.id),j=p.caseJourney;
  j.health.explanation=c.explanations[choice];j.relation={...j.relation,opening:c.openings[choice].id,participation:c.participation[choice].id,closing:c.closings[choice]};
  j.autonomy={...j.autonomy,supports:c.supports.filter((_,i)=>bits&(1<<i)).map(x=>x.id),adaptation:c.adaptations[choice].id};
  j.creative={...j.creative,goal:c.purposes[choice].id,setting:c.formats[choice].id,ending:c.formats[choice].improvements[choice]};
  j.service={...j.service,activity:c.activities[choice].id,access:c.access[choice].id,check:c.checks[choice].id};
  for(let s=1;s<=5;s++){j.step=s;titleDefaults(j);for(let cursor=0;cursor<GUIDE[s-1].length;cursor++){j.guideCursor=cursor;assert.deepEqual(guideIssues(j),[],c.id+' fase '+s+'/'+cursor);}j.done.push(LABS[s-1].id);}
  j.step=6;j.visited=6;j.interests=['salute','creativita'];j.finished=true;
  p.labJourney={format:'ssas-cinque-laboratori-1',health:{focus:'asma',explanation:'Lavoro precedente'},notes:{preserve:true}};
  p.oldUnknown={keep:true};j.health.unknown={preserve:true};
  const restored=restoreProject(p);assert(restored.caseJourney.finished);assert.deepEqual(restored.labJourney,p.labJourney);assert.deepEqual(restored.oldUnknown,p.oldUnknown);assert.deepEqual(restored.caseJourney.health.unknown,{preserve:true});
  assert.equal(summaryItems(j).length,5);assert.equal(completion({payload:restored}).completed,true);assert.equal(courseDetails(restored).works.length,5);
  assert.equal(completion({corso:'turismo',payload:restored}).completed,false);
  const record=participantCertificate(restored,{name:'Prova Locale',id:'00000000-0000-4000-8000-000000000001',date:'2026-10-12T16:00:00Z'});assert.equal(record.snapshot.lavori.length,5);
  const other=CASES.find(x=>x.id!==c.id),switched=selectCase(restored,other.id);assert.equal(switched.caseJourney.done.length,0);const back=selectCase(switched,c.id);assert.equal(back.caseJourney.health.explanation,j.health.explanation);assert(back.caseJourney.finished);
  const bad=structuredClone(restored);bad.caseJourney.service.access='inesistente';assert(!restoreProject(bad).caseJourney.finished);assert(!restoreProject(bad).caseJourney.done.includes('progettazione'));
  runs++;
 }
}
console.log(`${runs} percorsi verificati: sei casi, scelte alternative, salvataggio/ripresa, raccolta, attestato di prova e conservazione dei lavori precedenti.`);
const {restoreProject:serverRestore}=await import('../supabase/functions/bussola-esperienze/ssas-core.mjs');
const {completion:serverCompletion}=await import('../supabase/functions/bussola-gestione/bussola-records-core.mjs');
let candidate=selectCase(freshProject(),'infanzia');assert.deepEqual(serverRestore(candidate).caseJourney,candidate.caseJourney);assert.deepEqual(serverCompletion({payload:candidate}),completion({payload:candidate}));
console.log('Compatibilità: nuovo formato e conservazione dei lavori precedenti nel contratto API verificati.');
