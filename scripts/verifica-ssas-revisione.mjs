import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CASES,GUIDE,LABS,FORMAT,freshProject,selectCase,restoreProject,guideIssues} from '../ssas-situazioni-core.mjs';
import {materialExamples,materialCheck} from '../ssas-situazioni-revisione.mjs';
import {completion} from '../bussola-records-core.mjs';
import {completion as serverCompletion} from '../supabase/functions/bussola-gestione/bussola-records-core.mjs';

let combinations=0;
for(const c of CASES){
 assert.equal(c.contexts.length,5);assert.equal(c.badges.length,5);
 for(const text of [...c.contexts,...c.badges,c.participationContext,c.observation])assert.equal(typeof text,'string');
 for(const goal of c.purposes)for(const format of c.formats)for(const ending of materialExamples(c,goal.id,format.id)){
  assert(ending.trim());assert(ending.length<=230,`${c.id}: testo troncato nel campo del materiale`);
  const p=selectCase(freshProject(),c.id),j=p.caseJourney;
  j.health.explanation=c.explanations[0];j.relation={...j.relation,opening:c.openings[0].id,participation:c.participation[1].id,closing:c.closings[1]};
  j.autonomy={...j.autonomy,supports:c.supports.map(x=>x.id),adaptation:c.adaptations[1].id};
  j.creative={...j.creative,goal:goal.id,setting:format.id,ending};
  j.service={...j.service,activity:c.activities[1].id,access:c.access[0].id,check:c.checks[1].id};
  for(let step=1;step<=5;step++){j.step=step;j.guideCursor=GUIDE[step-1].length-1;assert.deepEqual(guideIssues(j),[]);}
  j.done=LABS.map(l=>l.id);j.step=6;j.visited=6;j.interests=['relazione'];j.finished=true;
  const restored=restoreProject(p);
  assert.equal(restored.caseJourney.creative.ending,ending);
  assert(completion({payload:restored}).completed);assert(serverCompletion({payload:restored}).completed);
  assert.equal(materialCheck(c,goal.id).questions.length,2);
  combinations++;
 }
}

// Optional external baseline contains fictional cases only, never student records.
if(process.argv[2]){
 const before=JSON.parse(readFileSync(process.argv[2],'utf8'));
 assert.deepEqual(CASES.map(c=>c.id),before.map(c=>c.id));
 for(const old of before){
  const c=CASES.find(x=>x.id===old.id);
  for(const key of ['openings','participation','supports','adaptations','purposes','formats','activities','access','checks','responses'])assert.deepEqual(c[key].map(x=>x.id),old[key].map(x=>x.id),old.id+'/'+key);
  // Existing written answers, drafts, previous versions and extra fields survive.
  const p=selectCase(freshProject(),old.id),j=p.caseJourney;
  j.health.explanation=old.explanations[0];j.relation={...j.relation,opening:old.openings[1].id,participation:old.participation[0].id,closing:old.closings[0]};
  j.autonomy={...j.autonomy,supports:[old.supports[0].id],adaptation:old.adaptations[0].id};
  j.creative={...j.creative,goal:old.purposes[1].id,setting:old.formats[0].id,ending:old.formats[0].improvements[0],previousEndings:['Prima versione conservata']};
  j.service={...j.service,activity:old.activities[0].id,access:old.access[1].id,check:old.checks[0].id};
  j.health.before={explanation:'Bozza precedente'};j.done=LABS.map(l=>l.id);j.step=6;j.visited=6;j.interests=['salute','creativita'];j.finished=true;j.nextIdea='Una domanda già scritta';
  p.labJourney={format:'ssas-cinque-laboratori-1',health:{focus:'asma'}};p.unknown={keep:true};
  const restored=restoreProject(p);
  assert.deepEqual(restored,p,old.id+': conservazione progetto precedente');
  assert.equal(restored.caseJourney.format,FORMAT);
 }
 console.log('Baseline: ID e quantità delle scelte conservati nei sei casi; risposte, bozze, progressi, interessi e campi aggiuntivi invariati.');
}
console.log(`${combinations} combinazioni di scopo, formato e riscrittura verificate nei sei casi, con completamento e compatibilità della gestione.`);
