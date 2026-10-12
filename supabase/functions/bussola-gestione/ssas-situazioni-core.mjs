import {CASES,caseById} from './ssas-situazioni-data.mjs';
import {LABS as originalLabs,xml} from './ssas-labs-core.mjs';
export {CASES,caseById,xml};
export const FORMAT='ssas-sei-situazioni-2';
export const LABS=originalLabs.map((l,i)=>i?{...l}:{...l,label:'Salute e bisogni',title:'Un bisogno da capire',bridge:'Benessere, prevenzione e bisogni della persona: osservare una situazione e comunicarla con parole chiare.'});
export const GUIDE=[['Scegli la situazione','Spiega il bisogno'],['Apri il dialogo','Scegli come ascoltare','Concorda il prossimo passo'],['Scegli i sostegni','Adatta l’aiuto'],['Scegli lo scopo','Scegli il materiale','Migliora e prova'],['Scegli l’attività','Apri l’accesso','Pensa al miglioramento']];
export const PRESENTATION=[
 {title:'Un bisogno da capire.',product:'La tua scheda del bisogno',result:'Scegli una situazione. Spiega che cosa occorre capire prima di proporre un aiuto.'},
 {title:'Una conversazione da aprire.',product:'La tua proposta di dialogo',result:'Ascolta la persona e concorda un primo passo.'},
 {title:'Un sostegno da adattare.',product:'Il tuo piano di sostegno',result:'Parti dal desiderio della persona. Poi ascolta la nuova richiesta.'},
 {title:'Un’idea da far provare.',product:'Il tuo materiale',result:'Prepara un materiale, migliora la bozza e ascolta chi lo userà.'},
 {title:'Un servizio da organizzare.',product:'La tua proposta di servizio',result:'Scegli un’attività, rendila accessibile e decidi che cosa osservare.'}
];
const clone=x=>JSON.parse(JSON.stringify(x));
const areas=['health','relation','autonomy','creative','service'];
const has=(list,value)=>list?.some(x=>x.id===value);
const text=(value,max)=>typeof value==='string'?value.slice(0,max):'';
export function freshJourney(){return {format:FORMAT,step:0,part:0,visited:0,done:[],guideVersion:1,guideCursor:0,health:{focus:'',title:'',explanation:'',before:null},relation:{opening:'',participation:'',closing:'',before:null},autonomy:{supports:[],adaptation:'',before:null},creative:{goal:'',setting:'',title:'',ending:'',before:null},service:{activity:'',access:'',check:'',name:'',before:null},interests:[],nextIdea:'',finished:false};}
export const freshProject=()=>({version:1,caseJourney:freshJourney(),scenarioDrafts:{}});
export function cursor(j){
 if(j.step<1||j.step>5)return 0;
 let c=Number.isInteger(j.guideCursor)?Math.max(0,Math.min(GUIDE[j.step-1].length-1,j.guideCursor)):0;
 const dependencies=[[j.health.focus],[j.relation.opening,j.relation.participation],[j.autonomy.supports.length],[j.creative.goal,j.creative.setting],[j.service.activity,j.service.access]][j.step-1];
 for(let i=0;i<c;i++)if(!dependencies[i])return i;
 return c;
}
export function guideIssues(j,c=cursor(j)){
 const pending=[],need=(ok,message,id)=>{if(!ok)pending.push({text:message,id});};
 if(j.step===6){need(j.done.length===5,'Completa i cinque laboratori.','stepNav');need(j.interests.length,'Scegli una parte che vorresti approfondire.','interest-salute');return pending;}
 if(j.step<1||j.step>5)return pending;
 need(caseById(j.health.focus),'Scegli una situazione.','health-focus');
 if(j.step===1&&c>=1)need(j.health.explanation.trim(),'Scegli una frase o scrivila tu.','health-explanation');
 if(j.step===2){need(j.relation.opening,'Scegli una domanda.','relation-opening');if(c>=1)need(j.relation.participation,'Scegli come ascoltare.','relation-participation');if(c>=2)need(j.relation.closing.trim(),'Scegli una frase o scrivila tu.','relation-closing');}
 if(j.step===3){need(j.autonomy.supports.length,'Scegli almeno un sostegno.','autonomy-supports');if(c>=1)need(j.autonomy.adaptation,'Scegli come adattare l’aiuto.','autonomy-adaptation');}
 if(j.step===4){need(j.creative.goal,'Scegli lo scopo.','creative-goal');if(c>=1)need(j.creative.setting,'Scegli il materiale.','creative-setting');if(c>=2)need(j.creative.ending.trim(),'Scegli una proposta o scrivila tu.','creative-ending');}
 if(j.step===5){need(j.service.activity,'Scegli l’attività.','service-activity');if(c>=1)need(j.service.access,'Scegli come aprire l’accesso.','service-access');if(c>=2)need(j.service.check,'Scegli che cosa osservare.','service-check');}
 return pending;
}
export function issues(j,step=j.step){const copy={...j,step};return guideIssues(copy,step>=1&&step<=5?GUIDE[step-1].length-1:0);}
export function restoreProject(raw){
 const p=raw&&typeof raw==='object'&&!Array.isArray(raw)?clone(raw):{},source=p.caseJourney?.format===FORMAT?p.caseJourney:{},fresh=freshJourney();
 const j={...source,...fresh};for(const area of areas)j[area]={...source[area],...fresh[area]};
 const item=caseById(source.health?.focus);j.health.focus=item?.id||'';j.health.title=text(source.health?.title,65);j.health.explanation=text(source.health?.explanation,230);
 if(item){
  for(const [area,key,choices] of [['relation','opening',item.openings],['relation','participation',item.participation],['autonomy','adaptation',item.adaptations],['creative','goal',item.purposes],['creative','setting',item.formats],['service','activity',item.activities],['service','access',item.access],['service','check',item.checks]])j[area][key]=has(choices,source[area]?.[key])?source[area][key]:'';
  j.autonomy.supports=item.supports.filter(s=>Array.isArray(source.autonomy?.supports)&&source.autonomy.supports.includes(s.id)).map(s=>s.id);
 }
 j.relation.closing=text(source.relation?.closing,180);j.creative.title=text(source.creative?.title,65);j.creative.ending=text(source.creative?.ending,230);j.service.name=text(source.service?.name,65);
 for(const area of areas)j[area].before=source[area]?.before&&typeof source[area].before==='object'?clone(source[area].before):null;
 j.step=Number.isInteger(source.step)?Math.max(0,Math.min(6,source.step)):0;if(j.step>1&&!item)j.step=1;
 j.visited=Number.isInteger(source.visited)?Math.max(j.step,Math.min(6,source.visited)):j.step;j.part=source.part===1?1:0;
 j.guideCursor=Number.isInteger(source.guideCursor)?source.guideCursor:0;j.guideCursor=cursor(j);
 j.done=LABS.filter((l,i)=>source.done?.includes?.(l.id)&&!issues(j,i+1).length).map(l=>l.id);
 j.interests=LABS.filter(l=>source.interests?.includes?.(l.id)).map(l=>l.id);j.nextIdea=text(source.nextIdea,180);j.finished=source.finished===true&&j.done.length===5&&j.interests.length>0;
 p.version=1;p.caseJourney=j;p.scenarioDrafts=p.scenarioDrafts&&typeof p.scenarioDrafts==='object'&&!Array.isArray(p.scenarioDrafts)?p.scenarioDrafts:{};
 return p; // labJourney et al. are retained byte-for-byte as legacy work.
}
export function selectCase(project,id){
 if(!caseById(id))return project;
 const p=clone(project),j=p.caseJourney;if(j.health.focus===id)return p;
 p.scenarioDrafts={...p.scenarioDrafts};if(j.health.focus)p.scenarioDrafts[j.health.focus]=clone(j);
 const next=p.scenarioDrafts[id]||freshJourney();next.health.focus=id;next.step=1;next.part=0;next.guideCursor=0;next.visited=Math.max(1,next.visited);p.caseJourney=next;return restoreProject(p);
}
export function beginRevision(j){const key=areas[j.step-1];if(key&&!j[key].before){const {before,...draft}=j[key];j[key].before=clone(draft);}j.part=1;}
export function titleDefaults(j){const c=caseById(j.health.focus);if(!c)return;if(j.step===1&&!j.health.title.trim())j.health.title=c.label;if(j.step===4&&!j.creative.title.trim())j.creative.title=c.formats.find(x=>x.id===j.creative.setting)?.label||'Il mio materiale';if(j.step===5&&!j.service.name.trim())j.service.name=c.service;}
export function summaryItems(j){
 const c=caseById(j.health.focus);if(!c)return [];
 return [
  {title:j.health.title||c.label,text:j.health.explanation,detail:c.scene},
  {title:'Il dialogo con '+c.person,text:[c.openings.find(x=>x.id===j.relation.opening)?.label,c.participation.find(x=>x.id===j.relation.participation)?.label,j.relation.closing].filter(Boolean).join(' '),detail:c.desire},
  {title:'Il sostegno per '+c.person,text:[...c.supports.filter(x=>j.autonomy.supports.includes(x.id)).map(x=>x.label),c.adaptations.find(x=>x.id===j.autonomy.adaptation)?.label].filter(Boolean).join(' · '),detail:c.supportGoal},
  {title:j.creative.title||'Il mio materiale',text:j.creative.ending,detail:c.purposes.find(x=>x.id===j.creative.goal)?.label||''},
  {title:j.service.name||c.service,text:[c.activities.find(x=>x.id===j.service.activity)?.label,c.access.find(x=>x.id===j.service.access)?.label,c.checks.find(x=>x.id===j.service.check)?.label].filter(Boolean).join(' · '),detail:c.team}
 ];
}
