import {sharedParticipant,rememberParticipant,personalDestination} from './bussola-identita.mjs?v=20261019-monitor';
const local=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('prova');
const base='https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/';
const API=local?'/__test/bussola-gestione':base+'bussola-gestione',START=local?'/__test/bussola-esperienze':base+'bussola-esperienze';
export function questionnaireRemote({status,loaded,links}){
 let token=sharedParticipant(),revision=0,dirty=false,snapshot=null,operation='',timer,busy=false,connected=false,version=0,conflict=false;
 const key=()=>`bussola-questionario:${token}${local?':prova':''}`;
 const keep=()=>{try{if(token)localStorage.setItem(key(),JSON.stringify({revision,dirty,state:snapshot,operation}));}catch{}};
 async function api(action,payload={},url=API){const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-bussola-token':token},body:JSON.stringify({action,corso:'ssas',...payload}),signal:ctrl.signal});const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error||'Salvataggio non disponibile.'),{status:r.status});return d;}finally{clearTimeout(timeout);}}
 async function connect(){
  if(connected)return;
  if(!token)token=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  rememberParticipant(token);await api('start',{},START);
  const r=await api('questionnaire_load'),remote=r.questionnaire;
  if(remote&&dirty){if(remote.payload._operation===operation){revision=remote.revision;dirty=false;}else if(remote.revision!==revision){conflict=true;throw new Error('Le risposte sono cambiate in un’altra finestra. La tua bozza resta sul dispositivo.');}}
  else if(remote){revision=remote.revision;snapshot=remote.payload;loaded(remote.payload);}
  connected=true;keep();links(personalDestination);
 }
 async function sync(){
  if(busy||conflict||!dirty)return;busy=true;status('Risposte conservate sul dispositivo · salvataggio online…');
  try{await connect();while(dirty){const v=version,s=structuredClone(snapshot),op=operation;const r=await api('questionnaire_save',{state:s,revision,operation:op});revision=r.revision;if(v===version)dirty=false;keep();}status('Risposte salvate. Sono consultabili nell’area docenti riservata.');}
  catch(e){if(e.status===409)conflict=true;status(conflict?e.message:'Risposte conservate sul dispositivo. Premi «Riprova il salvataggio» quando torna la connessione.',true,{conflict});}
  finally{busy=false;}
 }
 return {
  async init(){
   if(!token)return null;
   try{const old=JSON.parse(localStorage.getItem(key()));if(old){revision=old.revision||0;dirty=old.dirty===true;snapshot=old.state;operation=old.operation||crypto.randomUUID();}}catch{}
   try{await connect();if(dirty){loaded(snapshot);sync();}return snapshot;}catch{if(snapshot)loaded(snapshot);status('La copia sul dispositivo è conservata; il collegamento online è da riprovare.',true,{conflict});return snapshot;}
  },
  changed(state){if(!token){token=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');rememberParticipant(token);links(personalDestination);}version++;snapshot=structuredClone(state);dirty=true;operation=crypto.randomUUID();keep();clearTimeout(timer);timer=setTimeout(sync,600);},
  retry:sync,
  copy:()=>structuredClone(snapshot),
  async reload(){const r=await api('questionnaire_load');if(!r.questionnaire)throw new Error('Nessuna versione online disponibile.');try{localStorage.setItem(key()+':archivio:'+Date.now(),JSON.stringify({revision,state:snapshot}));}catch{throw new Error('Non riesco a conservare la bozza. Scaricala prima di riaprire la versione online.');}revision=r.questionnaire.revision;snapshot=r.questionnaire.payload;dirty=false;conflict=false;connected=true;keep();loaded(snapshot);status('Versione online aperta. La bozza precedente è conservata sul dispositivo.');},
  destination:href=>personalDestination(href,token||sharedParticipant())
 };
}
