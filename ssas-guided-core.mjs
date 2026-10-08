import {CONDITIONS, GOALS, SETTINGS, SERVICES, issues} from './ssas-labs-core.mjs?v=20261008';
export const GUIDE = [
 ['Scegli una patologia','Prepara la scheda'],
 ['Apri il dialogo','Dai spazio a Sonia','Chiudi l’incontro'],
 ['Scegli una persona','Scegli i sostegni','Adatta l’aiuto'],
 ['Scegli lo scopo','Scegli l’inizio','Crea il seguito'],
 ['Scegli un servizio','Scegli l’attività','Apri l’accesso','Pensa al miglioramento']
];
export function storyBranch(j){
 if(j.creative.editedBranch===0||j.creative.editedBranch===1)return j.creative.editedBranch;
 const goal=GOALS.find(x=>x.id===j.creative.goal);
 return goal?.endings[1]===j.creative.ending?1:0;
}
// A new cursor inside the existing envelope; old products and unknown fields survive.
export function cursor(j){
 if(j.step<1||j.step>5)return 0;
 const max=GUIDE[j.step-1].length-1;
 let c=j.guideVersion===1&&Number.isInteger(j.guideCursor)?Math.max(0,Math.min(max,j.guideCursor)):j.part===1?Math.min(1,max):0;
 const dependencies=[[j.health.focus],[j.relation.opening,j.relation.participation],[j.autonomy.person,j.autonomy.supports.length],[j.creative.goal,j.creative.setting],[j.service.kind,j.service.activity,j.service.access]][j.step-1];
 for(let i=0;i<c;i++)if(!dependencies[i])return i;
 return c;
}
export function guideIssues(j,c=cursor(j)){
 const keys=[['health-focus-asma','health-explanation'],['relation-opening-giornata','relation-participation-biglietto','relation-closing'],['autonomy-person-nico','autonomy-supports','autonomy-adaptation'],['creative-goal-emozioni','creative-setting-ponte','creative-ending'],['service-kind-salute','service-activity','service-access-presenza','service-check-accesso']];
 if(j.step===6)return issues(j,6,1);
 if(j.step<1||j.step>5)return [];
 // Earlier dependencies are checked too when an old journey resumes midway.
 const ids=keys[j.step-1].slice(0,c+1);
 return issues(j,j.step,1).filter(x=>ids.includes(x.id));
}
export function titleDefaults(j){
 if(j.step===1&&!j.health.title.trim())j.health.title=CONDITIONS.find(x=>x.id===j.health.focus)?.label||'La mia scheda sulla salute';
 if(j.step===4&&!j.creative.title.trim())j.creative.title=SETTINGS.find(x=>x.id===j.creative.setting)?.label||'La mia storia';
 if(j.step===5&&!j.service.name.trim())j.service.name=SERVICES.find(x=>x.id===j.service.kind)?.label||'Il mio servizio';
}
