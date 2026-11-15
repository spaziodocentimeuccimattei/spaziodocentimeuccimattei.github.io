import {CASES,caseById} from './ssas-situazioni-data.mjs?v=20261115-riordino';
import {LAB_TITLES} from './ssas-situazioni-revisione.mjs?v=20261115-riordino';
import {LABS as originalLabs,xml} from './ssas-labs-core.mjs?v=20261115-riordino';
export {CASES,caseById,xml};
export const FORMAT='ssas-sei-situazioni-2';
export const LABS=originalLabs.map((l,i)=>({...l,title:LAB_TITLES[i],...(i?{}:{label:'Salute e bisogni',bridge:'Benessere, prevenzione e bisogni della persona: osservare una situazione e comunicarla con parole chiare.'})}));
export const GUIDE=[['Scegli la storia','Spiega che cosa succede'],['Fai la prima domanda','Ascolta ancora','Proponi un primo passo'],['Scegli gli aiuti','Cambia l’aiuto'],['Scegli a che cosa serve','Scegli il materiale','Migliora e prova'],['Scegli l’attività','Fai partecipare tutti','Controlla come è andata']];
export const PRESENTATION=[
 {title:'Capisci che cosa succede.',product:'La tua spiegazione della storia',result:'Scegli una storia e dì che cosa sta succedendo alla persona.'},
 {title:'Ascolti e fai le domande giuste.',product:'Il tuo dialogo con la persona',result:'Ascolta la persona e proponi un primo passo.'},
 {title:'Scegli gli aiuti per la persona.',product:'Il tuo piano di aiuto',result:'Scegli gli aiuti e cambiali quando la persona lo chiede.'},
 {title:'Prepari un materiale per gli altri.',product:'Il tuo materiale',result:'Scegli a che cosa serve, poi migliora la bozza.'},
 {title:'Organizzi un’attività per tutti.',product:'La tua proposta di attività',result:'Scegli l’attività, come far partecipare tutti e che cosa controllare.'}
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
 if(j.step===6){need(j.done.length===5,'Completa i cinque laboratori.','stepNav');return pending;}
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
 j.interests=LABS.filter(l=>source.interests?.includes?.(l.id)).map(l=>l.id);j.nextIdea=text(source.nextIdea,180);j.finished=j.done.length===5&&(source.finished===true||j.visited>=6); // la scelta sugli interessi non blocca più; i lavori già arrivati alla conclusione risultano conclusi
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
  {title:'Il dialogo con '+c.person,text:[c.openings.find(x=>x.id===j.relation.opening)?.label,c.participation.find(x=>x.id===j.relation.participation)?.label,j.relation.closing].filter(Boolean).join(' '),detail:c.openings.find(x=>x.id===j.relation.opening)?.reply||''},
  {title:'Il sostegno per '+c.person,text:[...c.supports.filter(x=>j.autonomy.supports.includes(x.id)).map(x=>x.label),c.adaptations.find(x=>x.id===j.autonomy.adaptation)?.label].filter(Boolean).join(' · '),detail:c.supportGoal},
  {title:j.creative.title||'Il mio materiale',text:j.creative.ending,detail:c.purposes.find(x=>x.id===j.creative.goal)?.label||''},
  {title:j.service.name||c.service,text:[c.activities.find(x=>x.id===j.service.activity)?.label,c.access.find(x=>x.id===j.service.access)?.label,c.checks.find(x=>x.id===j.service.check)?.label].filter(Boolean).join(' · '),detail:c.team}
 ];
}
