import {classEntry} from './bussola-classe.mjs?v=20261012-ingresso';
import {needsLegacy} from './ssas-situazioni-entry-core.mjs';
const local=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('prova');
const pupil=classEntry().alunno;
const suffix=(pupil?':alunno:'+pupil:'')+(local?':prova:'+local.replace(/[^a-z0-9-]/gi,'').slice(0,60):'');
const read=key=>{try{return JSON.parse(localStorage.getItem(key+suffix));}catch{return null;}};
const modern=read('bussola-ssas-sei-situazioni-v2'),old=read('bussola-ssas-cinque-laboratori-v1');
let legacy=!modern?.project?.caseJourney&&needsLegacy(old?.project);
const token=pupil||modern?.token||old?.token;
if(token&&(!modern&&!old||pupil&&!modern?.project?.caseJourney)){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{
  const r=await fetch(local?'/__test/bussola-esperienze':'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-esperienze',{method:'POST',headers:{'Content-Type':'application/json','x-bussola-token':token},body:JSON.stringify({action:'load'}),signal:controller.signal});
  if(r.ok)legacy=needsLegacy((await r.json()).project?.payload);
 }catch{}finally{clearTimeout(timer);}
}
if(legacy)document.addEventListener('bussola-progetto-nuovo',()=>location.reload());
await import(legacy?'./ssas-labs.mjs?v=20261012-ingresso':'./ssas-situazioni.mjs?v=20261013-ssas');
