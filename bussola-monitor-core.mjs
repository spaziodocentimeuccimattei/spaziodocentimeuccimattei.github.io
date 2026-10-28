import {courseDetails,completion} from './bussola-records-core.mjs?v=20261028-cat42';
import {caseById} from './ssas-situazioni-core.mjs?v=20261018-testi';
import * as AFM from './afm-core.mjs';
import * as SIA from './sia-core.mjs';
import * as TUR from './turismo-core.mjs';
import * as CAT from './cat-core.mjs';
export const COURSES={ssas:'SSAS',afm:'AFM',sia:'SIA',turismo:'Turismo',cat:'CAT 4+2',bussola:'Le dodici domande'};
export const STATES={empty:'Non iniziato',working:'In corso',done:'Concluso'};
const labels={offer:'Proposta',feature:'Bisogno e caratteristica',order:'Ordine delle azioni',obstacle:'Imprevisto',quantity:'Quantità',price:'Prezzo',payment:'Accordo sui pagamenti',agreement:'Consegna',amendment:'Modifica dell’accordo',tone:'Tono',question:'Domanda',response:'Risposta',headline:'Titolo',place:'Luogo',angle:'Punto di vista',storyTitle:'Titolo del racconto',welcome:'Accoglienza',plan:'Esperienza',rain:'Alternativa con pioggia',service:'Servizio',people:'Partecipanti',terms:'Condizioni',posterTitle:'Titolo dell’invito',repair:'Revisione',handoff:'Passaggio di informazioni',fields:'Campi scelti',merged:'Duplicato riunito',filter:'Filtro',blocks:'Sequenza delle azioni',condition:'Condizione',title:'Titolo',button:'Comando',permissions:'Permessi',view:'Può vedere',edit:'Può modificare',measures:'Misure rilevate',views:'Rappresentazioni',width:'Larghezza',route:'Percorso',zones:'Zone',roof:'Copertura',floor:'Suolo',cover:'Metri quadrati coperti',observations:'Osservazioni',hypothesis:'Ipotesi',encoding:'Rappresentazione',control:'Comando delle luci',consumption:'Consumo annuo (kWh)',saved:'Energia risparmiata (kWh)',hours:'Ore al giorno',phase:'Fasi',reason:'Motivazione',explanation:'Spiegazione',closing:'Conclusione del dialogo',supports:'Sostegni',adaptation:'Adattamento',goal:'Obiettivo',setting:'Formato',ending:'Testo del materiale',activity:'Attività',access:'Accesso',check:'Verifica',name:'Nome',opening:'Apertura',participation:'Partecipazione',focus:'Situazione',suono:'Suono',riprese:'Riprese',sosta:'Sosta'};
const ignored=new Set(['before','runs','handoffRuns','signature','id','version','format','revision','identity','notes','updatedAt','createdAt','finished','done','started','guideCursor','guideVersion','visited','step','part','screen','unlocked','_save_operation']);
Object.assign(labels,{missingDay:'Giorno da completare',searched:'Ricerca eseguita',yes:'Se la condizione è vera',no:'Se la condizione è falsa',activity:'Attività',groupSize:'Posti richiesti',area:'Area scelta',x:'Colonna della griglia',y:'Riga della griglia'});
function dictionary(source){const out={};function walk(v){if(Array.isArray(v)){if(typeof v[0]==='string'&&typeof v[1]==='string')out[v[0]]=v[1];else v.forEach(walk);}else if(v&&typeof v==='object'){if(v.id)out[v.id]=v.label||v.name||v.title||v.text||v.id;Object.values(v).forEach(walk);}}walk(source);return out;}
const dicts={afm:dictionary(AFM),sia:dictionary(SIA),turismo:dictionary(TUR),cat:dictionary(CAT)};
function fields(value,dict={},prefix=''){
 const out=[];for(const [k,v] of Object.entries(value||{})){
  if(ignored.has(k)||v===null||v===undefined||v===''||!Object.hasOwn(labels,k)&&!Object.hasOwn(dict,k))continue;
  const label=(prefix?prefix+' · ':'')+(labels[k]||dict[k]||k.replace(/[_-]/g,' '));
  if(Array.isArray(v)){const vals=v.filter(x=>typeof x!=='object').map(x=>dict[x]||String(x));if(vals.length)out.push({label,value:vals.join(' → ')});}
  else if(typeof v==='object')out.push(...fields(v,dict,label));
  else out.push({label,value:typeof v==='boolean'?(v?'Sì':'No'):dict[v]||String(['x','y'].includes(k)&&typeof v==='number'?v+1:v)});
 }return out;
}
function areas(p,course){
 if(course==='ssas')return ['health','relation','autonomy','creative','service'].map(k=>p[k]);
 if(course==='sia')return [p.process,p.data,p.program,p.ui,p.access];
 if(course==='cat')return [p.survey,p.layout,p.build,CAT.isFour(p)?p.energy:p.heritage,p.plan];
 const keys=course==='afm'?[['offer','feature'],['order','obstacle'],['quantity','price','payment'],['agreement','amendment'],['tone','headline','question','response']]:[['place','angle','storyTitle'],['question','welcome'],['plan','rain'],['service','people','terms'],['tone','posterTitle','repair']];
 return keys.map(list=>Object.fromEntries(list.map(k=>[k,p.choices?.[k]])));
}
export function projectView(project,course,questions=[]){
 if(course==='bussola'){
  const p=project?.payload,answered=Object.keys(p?.answers||{}).length;
  return {valid:true,completed:p?.stage==='results',done:answered,total:questions.length||12,labs:questions.map((q,i)=>{const has=Object.hasOwn(p?.answers||{},q.id),v=p?.answers[q.id];return {id:q.id,label:q.title,title:q.question,status:has?'done':'empty',text:has?(v===null?'Non lo so ancora':q.options.find(o=>o.id===v)?.text||'Risposta non più disponibile'):'Non ancora compilata',detail:q.scenario,fields:[],index:i};})};
 }
 if(!project)return {valid:true,completed:false,done:0,total:5,labs:Array.from({length:5},(_,i)=>({index:i,label:'Laboratorio '+(i+1),title:'Laboratorio '+(i+1),status:'empty',text:'Non ancora iniziato',fields:[]}))};
 try{
  const d=courseDetails(project.payload),state=completion({...project,corso:course}),j=d.journey;
  if(d.corso!==course)throw new Error('Indirizzo incoerente');
  const caseData=course==='ssas'?caseById(j.health?.focus):null,dict=caseData?dictionary(caseData):dicts[course]||{};
  const grouped=areas(j,course),done=j.done||[];
  const isSSAS=course==='ssas',isTour=course==='turismo';
  const lastDone=Math.max(-1,...done.map(n=>typeof n==='number'?(isTour?n*2+1:n):-1));
  const reach=isSSAS?Math.max(0,(j.visited||j.step||0)-1):Math.floor(Math.max(j.screen??-1,j.unlocked??-1,lastDone)/2);
  const labs=d.labs.map((l,i)=>{
   const finished=isSSAS?done.includes(l.id):isTour?done.includes(i):done.includes(i*2)&&done.includes(i*2+1);
   const entered=finished||(isSSAS?reach>=i&&Boolean(j.visited||j.step):j.started&&reach>=i);
   const item=d.works[i]||{};
   return {index:i,id:l.id,label:l.label,title:item.title||l.label,status:finished?'done':entered?'working':'empty',text:entered?item.text||'Bozza ancora da completare':'Non ancora iniziato',detail:entered?item.detail||'':'',fields:entered?fields(grouped[i],dict):[],before:grouped[i]?.before?fields(grouped[i].before,dict):[]};
  });
  return {valid:true,completed:state.completed,done:state.done,total:5,labs,caseLabel:caseData?.label||'',interests:state.interests,idea:d.idea,journey:j};
 }catch{return {valid:false,completed:false,done:0,total:5,labs:[],error:'Questo formato di lavoro richiede una verifica. Il salvataggio è conservato.'};}
}
export function filterRows(rows,{from='',to='',status='all',search=''}={}){
 return rows.filter(row=>{
  const day=row.project?.updated_at?new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome'}).format(new Date(row.project.updated_at)):'';
  if(from&&(!day||day<from)||to&&(!day||day>to))return false;
  const state=row.view.completed?'done':row.project?'working':'empty';
  if(status!=='all'&&state!==status)return false;
  return !search||`${row.alunno?.nome||''} ${row.alunno?.cognome||''}`.toLowerCase().includes(search.toLowerCase());
 });
}
