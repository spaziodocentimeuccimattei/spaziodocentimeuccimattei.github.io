import {restore,remoteProject} from './turismo-core.mjs?v=20261009-turismo';
export function setupTourismRemote(ctx){
 const testing=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('prova');
 const API=testing?'/__test/bussola-esperienze':'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-esperienze';
 let state={token:ctx.entryToken||'',participant:'',revision:0,dirty:false,lastOp:''},connected=false,syncing=false,conflict=false,clock=0,timer,connecting=null;
 try{const raw=JSON.parse(localStorage.getItem(ctx.key));if(raw&&/^[A-Za-z0-9_-]{43}$/.test(raw.token)&&(!ctx.entryToken||ctx.entryToken===raw.token))state={...state,...raw};}catch{}
 const keep=()=>{try{localStorage.setItem(ctx.key,JSON.stringify(state));}catch{}};
 async function api(action,payload={}){const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-bussola-token':state.token},body:JSON.stringify({action,corso:'turismo',...payload}),signal:ctrl.signal});const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error||'Salvataggio non disponibile.'),{status:r.status});return d;}finally{clearTimeout(timeout);}}
 async function connect(){
  if(connected)return;if(connecting)return connecting;
  connecting=(async()=>{
   if(!state.token){state.token=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');keep();}
   const reply=await api('start');
   if(reply.project&&state.dirty&&reply.project.revision!==state.revision){
    if(state.lastOp&&reply.project.payload?._save_operation===state.lastOp)state.revision=reply.project.revision;
    else{conflict=true;throw Object.assign(new Error('Il lavoro è cambiato in un’altra finestra. Questa copia resta sul dispositivo. Apri il percorso in una sola finestra.'),{status:409});}
   }
   state.participant=reply.participant;
   const pending=ctx.project().notes.filter(n=>n.pending);
   if(reply.project&&!state.dirty){const p=restore(reply.project.payload);if(!p)throw new Error('Il progetto salvato non è riconosciuto. La copia sul dispositivo è conservata.');p.notes=pending;ctx.loaded(p);state.revision=reply.project.revision;}
   ctx.project().notes=[...new Map([...pending,...(reply.notes||[]).map(n=>({id:n.id,course:'tur',context:n.contesto,step:n.passaggio,role:n.ruolo_dichiarato,kind:n.tipo,text:n.testo,date:n.created_at,pending:false}))].map(n=>[n.id,n])).values()];
   connected=true;keep();ctx.keep();ctx.notesChanged();
  })().finally(()=>{connecting=null;});return connecting;
 }
 async function sync(){
  if(syncing||conflict)return;syncing=true;ctx.status('Salvataggio in corso…',false);
  try{
   await connect();
   while(state.dirty){const stamp=clock,snapshot=remoteProject(ctx.project());state.lastOp=crypto.randomUUID();snapshot._save_operation=state.lastOp;keep();const reply=await api('save',{project:snapshot,revision:state.revision});state.revision=reply.revision;if(stamp===clock)state.dirty=false;keep();}
   for(const n of ctx.project().notes.filter(x=>x.pending)){const note={id:n.id,passaggio:Math.min(5,Math.floor(n.step/2)+1),contesto:n.context,versione:1,ruolo_dichiarato:n.role,tipo:n.kind,testo:n.text};const reply=await api('note',{note});n.pending=false;n.date=reply.note.created_at;ctx.keep();}
   ctx.notesChanged();ctx.status(ctx.localOK()?'Tutto salvato. Puoi riprendere da questo dispositivo.':'Salvato online. Conserva il link personale da «La mia classe» per riprendere.',false);
  }catch(e){if(e.status===409)conflict=true;ctx.status(conflict?e.message:'Il lavoro resta su questo dispositivo. Il salvataggio online è da riprovare.',!conflict);ctx.notesChanged();}
  finally{syncing=false;if(!conflict&&(state.dirty||ctx.project().notes.some(n=>n.pending))&&!document.getElementById('retrySave').hidden)return;if(!conflict&&(state.dirty||ctx.project().notes.some(n=>n.pending)))schedule();}
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(sync,600);}
 function changed(){clock++;state.dirty=true;keep();ctx.status(ctx.localOK()?'Salvato sul dispositivo · aggiornamento online…':'Salvataggio online in corso. Tieni aperta questa pagina.',false);schedule();}
 window.addEventListener('pagehide',()=>{keep();ctx.keep();});
 return {changed,sync,ensure:connect,token:()=>state.token,participant:()=>state.participant,revision:()=>state.revision};
}
