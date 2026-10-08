import assert from 'node:assert/strict';
import {freshProject,restoreProject,LABS,CONDITIONS,GOALS} from '../ssas-labs-core.mjs';
import {GUIDE,cursor,guideIssues,titleDefaults,storyBranch} from '../ssas-guided-core.mjs';
const p=freshProject(),j=p.labJourney;
j.step=1;assert.equal(guideIssues(j).length,1);j.health.focus='alzheimer';j.guideCursor=1;j.guideVersion=1;assert.equal(guideIssues(j).length,1);j.health.explanation=CONDITIONS[2].examples[0];assert.equal(guideIssues(j).length,0);titleDefaults(j);assert.equal(j.health.title,CONDITIONS[2].label);
j.relation={opening:'giornata',participation:'ascolto',closing:'Concordiamo come proseguire.'};j.autonomy={person:'rosa',supports:['caratteri','scheda'],adaptation:'tempo'};j.creative={goal:'collaborazione',setting:'spazio',title:'Una base da inventare',ending:GOALS[1].endings[1]};j.service={kind:'famiglie',activity:'gruppo',access:'presenza',check:'utile',name:'Famiglie insieme'};
assert.equal(storyBranch(j),1);j.creative.editedBranch=1;j.creative.ending='Il mio seguito personale.';assert.equal(storyBranch(j),1);
for(let s=1;s<=5;s++){j.step=s;for(let action=0;action<GUIDE[s-1].length;action++){j.guideCursor=action;assert.equal(guideIssues(j).length,0);}j.done.push(LABS[s-1].id);}
j.step=6;j.finished=true;j.interests=['relazione'];j.health.unknown={keep:true};p.oldProject={keep:'yes'};const restored=restoreProject(p);assert.equal(restored.labJourney.finished,true);assert.deepEqual(restored.labJourney.health.unknown,{keep:true});assert.deepEqual(restored.oldProject,{keep:'yes'});
const legacy=structuredClone(j);delete legacy.guideVersion;delete legacy.guideCursor;legacy.step=3;legacy.part=1;assert.equal(cursor(legacy),1);legacy.guideVersion=1;legacy.guideCursor=99;assert.equal(cursor(legacy),2);
console.log('Guida: singole decisioni, ripresa della versione precedente, titoli facoltativi, completamento e conservazione dei lavori verificati.');
