import assert from 'node:assert/strict';
import {freshProject,restoreProject,issues,beginRevision,LABS,CONDITIONS,PERSONS,GOALS,SETTINGS,SERVICES,summaryItems} from '../ssas-labs-core.mjs';
import {restoreProject as serverRestore} from '../ssas-core.mjs';
const p=freshProject(),j=p.labJourney;
assert(issues(j,1,0).length);
j.health.focus=CONDITIONS[0].id;j.step=1;beginRevision(j);j.health.title='Salute, cura e informazioni';j.health.explanation=CONDITIONS[0].examples[0];assert.equal(issues(j,1,1).length,0);
j.relation.opening='giornata';j.relation.participation='biglietto';j.relation.closing='Concordiamo insieme da quale richiesta continuare.';
j.autonomy.person='nico';j.autonomy.supports=['sequenza','prova'];j.autonomy.adaptation='riduci';
j.creative.goal='emozioni';j.creative.setting='ponte';j.creative.title='Il ponte che cambia';j.creative.ending=GOALS[0].endings[0];
j.service.kind='salute';j.service.activity='incontro';j.service.name='Informazioni per tutti';j.service.access='telefono';j.service.check='utile';
for(let s=1;s<=5;s++)assert.equal(issues(j,s,1).length,0);
j.done=LABS.map(l=>l.id);j.step=6;j.interests=['salute','creativita'];j.finished=true;
const oldUnknown={legacy:'keep'},nestedUnknown={future:3};p.extra=oldUnknown;j.health.future=nestedUnknown;
const remote=serverRestore(p);assert.deepEqual(remote.labJourney,j);assert.deepEqual(remote.extra,oldUnknown);
const restored=restoreProject(remote);assert.equal(restored.labJourney.finished,true);assert.deepEqual(restored.labJourney.health.future,nestedUnknown);assert.deepEqual(restored.extra,oldUnknown);
const incomplete=structuredClone(p);incomplete.labJourney.creative.ending='';assert.equal(restoreProject(incomplete).labJourney.finished,false);assert(!restoreProject(incomplete).labJourney.done.includes('creativita'));
const missing=structuredClone(j);missing.done.pop();assert(issues(missing,6).length);
assert.equal(summaryItems(j).length,5);assert(summaryItems(j)[0].text.includes('asma'));
for(const condition of CONDITIONS){const trial=structuredClone(p);trial.labJourney.health.focus=condition.id;trial.labJourney.health.explanation=condition.examples[0];assert.equal(issues(restoreProject(trial).labJourney,1,1).length,0);}
for(const person of PERSONS){const trial=structuredClone(p);trial.labJourney.autonomy={person:person.id,supports:person.supports.map(x=>x.id),adaptation:person.adaptations[0].id,before:null};assert.equal(issues(restoreProject(trial).labJourney,3,1).length,0);}
for(const service of SERVICES){const trial=structuredClone(p);trial.labJourney.service={kind:service.id,activity:service.activities[0].id,name:'Servizio di prova',access:'presenza',check:'accesso'};assert.equal(issues(restoreProject(trial).labJourney,5,1).length,0);}
for(const goal of GOALS)for(const setting of SETTINGS){const trial=structuredClone(p);trial.labJourney.creative={goal:goal.id,setting:setting.id,title:'Storia di prova',ending:goal.endings[1]};assert.equal(issues(restoreProject(trial).labJourney,4,1).length,0);}
console.log('Percorso in cinque laboratori: sequenza completa, tutti i temi, ripristino, completamento, campi precedenti e compatibilità API verificati.');
