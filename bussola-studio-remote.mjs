const screen=n=>Number.isInteger(n.screen)?n.screen:n.screen==='ingresso'?-1:n.screen==='conclusione'?10:Number(n.screen?.replace('passaggio-',''))-1;
export function setupStudioRemote(ctx){
 const testing=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('prova');
 const API=testing?'/__test/bussola-esperienze':'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-esperienze';
 let state={token:ctx.entryToken||'',participant:'',revision:0,dirty:false,lastOp:''},connected=false,syncing=false,conflict=false,clock=0,timer,connecting=null;
 try{const raw=JSON.parse(localStorage.getItem(ctx.key));if(raw&&/^[A-Za-z0-9_-]{43}$/.test(raw.token)&&(!ctx.entryToken||ctx.entryToken===raw.token))state={...state,...raw};}catch{}
 const keep=()=>{try{localStorage.setItem(ctx.key,JSON.stringify(state));}catch{}};
 async function api(action,payload={}){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  try{const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-bussola-token':state.token},body:JSON.stringify({action,corso:ctx.course,...payload}),signal:controller.signal});const reply=await response.json();if(!response.ok)throw Object.assign(new Error(reply.error||'Salvataggio non disponibile.'),{status:response.status});return reply;}
  finally{clearTimeout(timeout);}
 }
 function mergeNotes(reply){
  const pending=ctx.project().notes.filter(n=>n.pending);
  const received=(reply.notes||[]).map(n=>({id:n.id,projectId:ctx.project().id,course:ctx.course,lab:'',screen:n.passaggio===0?-1:n.contesto.startsWith('Conclusione')?10:Math.max(0,n.passaggio*2-2)+(n.contesto.includes(' · 2/2 · ')?1:0),version:n.versione,label:n.contesto,role:n.ruolo_dichiarato,kind:n.tipo,text:n.testo,createdAt:n.created_at,pending:false}));
  ctx.project().notes=[...new Map([...pending,...received].map(n=>[n.id,n])).values()];ctx.keep();ctx.notesChanged();
 }
 function accept(reply){
  const pending=ctx.project().notes.filter(n=>n.pending);
  if(reply.project){const p=ctx.restore(reply.project.payload);if(!p)throw new Error('Il lavoro salvato non è riconosciuto. La copia sul dispositivo è conservata.');p.notes=pending;ctx.loaded(p);state.revision=reply.project.revision;}
  state.participant=reply.participant;mergeNotes(reply);
 }
 async function connect(){
  if(connected)return;if(connecting)return connecting;
  connecting=(async()=>{
   if(!state.token){state.token=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');keep();}
   const reply=await api('start');
   if(reply.project&&state.dirty&&reply.project.revision!==state.revision){
    if(state.lastOp&&reply.project.payload?._save_operation===state.lastOp)state.revision=reply.project.revision;
    else{conflict=true;ctx.conflict();throw Object.assign(new Error('Il lavoro è cambiato in un’altra finestra.'),{status:409});}
   }
   state.participant=reply.participant;
   if(!state.dirty)accept(reply);else mergeNotes(reply);
   connected=true;keep();
  })().finally(()=>{connecting=null;});return connecting;
 }
 async function sync(){
  if(syncing||conflict)return;syncing=true;let failed=false;ctx.status('Salvataggio in corso…',false);
  try{
   await connect();
   while(state.dirty){
    const stamp=clock,snapshot=ctx.remoteProject(ctx.project());if(!snapshot)throw new Error('Il progetto non è pronto per il salvataggio.');
    state.lastOp=crypto.randomUUID();snapshot._save_operation=state.lastOp;keep();
    const reply=await api('save',{project:snapshot,revision:state.revision});state.revision=reply.revision;if(stamp===clock)state.dirty=false;keep();
   }
   for(const n of ctx.project().notes.filter(x=>x.pending)){
    const note={id:n.id,passaggio:screen(n)<0?0:Math.min(5,Math.floor(screen(n)/2)+1),contesto:n.label,versione:1,ruolo_dichiarato:n.role,tipo:n.kind,testo:n.text};
    const reply=await api('note',{note});n.pending=false;n.createdAt=reply.note.created_at;ctx.keep();
   }
   ctx.notesChanged();ctx.status(ctx.localOK()?'Tutto salvato. Puoi riprendere da questo dispositivo.':'Salvato online. Conserva il link personale da «La mia classe» per riprendere.',false);
  }catch(e){
   failed=true;if(e.status===409){conflict=true;ctx.conflict();}
   ctx.status(conflict?'Il lavoro è cambiato in un’altra finestra. La tua copia è conservata.':'Il lavoro resta su questo dispositivo. Il salvataggio online è da riprovare.',!conflict);ctx.notesChanged();
  }finally{syncing=false;if(!failed&&!conflict&&state.dirty){clearTimeout(timer);timer=setTimeout(sync,600);}}
 }
 function changed(){clock++;state.dirty=true;keep();clearTimeout(timer);timer=setTimeout(sync,600);}
 async function reload(){
  const reply=await api('load');if(!reply.project)throw new Error('La versione salvata non è disponibile.');
  state.dirty=false;conflict=false;accept(reply);connected=true;keep();ctx.status('Versione salvata aperta.',false);
 }
 window.addEventListener('pagehide',keep);
 return {changed,sync,ensure:connect,reload,hasConflict:()=>conflict,token:()=>state.token,participant:()=>state.participant,revision:()=>state.revision};
}
