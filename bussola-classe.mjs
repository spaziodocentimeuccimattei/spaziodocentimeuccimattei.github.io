import {classCode,isShortCode} from './bussola-codice.mjs?v=20261008-codice';
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
export function classEntry(){const p=new URLSearchParams(location.hash.slice(1));return {classe:classCode(p.get('classe')),alunno:TOKEN.test(p.get('alunno'))?p.get('alunno'):''};}
export function setupClass(ctx){
 const $=id=>document.getElementById(id),dialog=$('classDialog'),form=$('classForm'),codeInput=form.elements.link;
 const testing=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('prova');
 const API=testing?'/__test/bussola-gestione':'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-gestione';
 let entry=classEntry(),access=entry.classe,info=null,identity=null,returnFocus=null,startMode=false,lookupVersion=0,pendingLookup=null;
 try{if(!access)access=classCode(JSON.parse(localStorage.getItem(ctx.key+':classe'))?.code);}catch{}
 codeInput.value=isShortCode(access)?access:'';
 function keep(){try{localStorage.setItem(ctx.key+':classe',JSON.stringify({code:access}));}catch{}}
 async function api(action,payload={}){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-bussola-token':ctx.token()},body:JSON.stringify({action,...payload}),signal:ctrl.signal});const b=await r.json();if(!r.ok)throw Object.assign(new Error(b.error||'Classe non disponibile.'),{status:r.status});return b;}finally{clearTimeout(timer);}}
 function show(){
  const panel=$('classSummary');panel.replaceChildren();$('classTitle').textContent=startMode?'Prima di iniziare':'Il tuo lavoro e la tua classe';
  $('classSubmit').textContent=startMode?'Inizia il percorso':'Collega il mio lavoro';
  $('classGuest').hidden=!startMode||!!entry.classe||!!identity?.alunno;
  if(identity?.alunno){
   const text=document.createElement('span');text.textContent=`${identity.alunno.nome} ${identity.alunno.cognome} · ${identity.classe.classe} · ${identity.classe.scuola}`;panel.append(text);
   $('openClass').textContent='La mia classe';$('classIdentity').textContent=text.textContent;form.hidden=true;$('classResume').hidden=false;
   const u=new URL(location.href);u.hash=new URLSearchParams({classe:access,alunno:ctx.token()}).toString();$('classResumeLink').href=u.href;
  }else{
   form.hidden=false;$('classResume').hidden=true;$('openClass').textContent='La mia classe';
   $('classIdentity').textContent=info?`${info.scuola} · ${info.comune} · Classe ${info.classe}`:'Inserisci il codice che ti dà il docente, poi nome e cognome.';
   $('classIdentity').dataset.recognized=String(!!info);$('classNames').hidden=info?.modalita==='elenco';
   form.elements.nome.required=info?.modalita!=='elenco';form.elements.cognome.required=info?.modalita!=='elenco';
   $('classLinkField').hidden=!!info&&!!access&&!isShortCode(access);$('classCodeHelp').hidden=$('classLinkField').hidden;codeInput.required=!$('classLinkField').hidden;
  }
  panel.hidden=!identity?.alunno;
 }
 function start(){if(!dialog.open)return;startMode=false;dialog.close();ctx.start();}
 async function resolve(raw){
  const code=classCode(raw);if(!code)throw new Error('Scrivi il codice di 6 caratteri che ti dà il docente.');
  if(info&&access===code)return info;
  if(pendingLookup?.code===code)return pendingLookup.promise;
  const version=++lookupVersion;
  const current={code,promise:null};current.promise=(async()=>{
   const d=await api('class_info',{classe:code});
   if(version!==lookupVersion)throw new Error('Il codice è cambiato. Controllalo e riprova.');
   info=d.classe;access=code;show();return info;
  })().finally(()=>{if(pendingLookup===current)pendingLookup=null;});pendingLookup=current;return current.promise;
 }
 async function refresh(){
  if(ctx.token()){
   const d=await api('identity');if(d.alunno){identity=d;info=d.classe;access=info.codice_breve||info.codice||access;codeInput.value=isShortCode(access)?access:'';keep();show();return;}
  }
  if(access){info=(await api('class_info',{classe:access})).classe;show();}
 }
 async function open(trigger,begin=false){
  if(identity?.alunno&&begin){ctx.start();return;}
  returnFocus=trigger;startMode=begin;$('classMessage').textContent='';show();if(!dialog.open)dialog.showModal();
  (identity?.alunno?$('closeClass'):info?.modalita==='elenco'?$('classSubmit'):info?form.elements.nome:codeInput).focus();
  if(ctx.token()||access)try{await refresh();if(dialog.open&&startMode&&identity?.alunno)start();}catch(e){if(dialog.open)$('classMessage').textContent=e.message;}
 }
 $('openClass').addEventListener('click',e=>open(e.currentTarget,ctx.isIntro()));$('closeClass').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{startMode=false;returnFocus?.focus();});
 codeInput.addEventListener('input',()=>{lookupVersion++;pendingLookup=null;info=null;access='';$('classMessage').textContent='';show();});
 codeInput.addEventListener('blur',async()=>{if(!classCode(codeInput.value)||identity?.alunno)return;try{await resolve(codeInput.value);$('classMessage').textContent='Classe riconosciuta. Controlla nome e cognome, poi inizia.';}catch(e){$('classMessage').textContent=e.message;}});
 form.addEventListener('submit',async e=>{
  e.preventDefault();const submit=$('classSubmit');submit.disabled=true;$('classMessage').textContent='Controllo la classe…';
  try{
   await resolve($('classLinkField').hidden?access:codeInput.value);
   if(info.modalita==='elenco'&&!entry.alunno)throw new Error('Questa classe usa accessi personali. Apri quello ricevuto dal docente.');
   const nome=form.elements.nome.value,cognome=form.elements.cognome.value;
   await ctx.ensure();identity=await api('enroll',{classe:access,accesso:entry.alunno||ctx.token(),nome,cognome});keep();show();
   if(startMode)start();else dialog.close();
  }catch(e){$('classMessage').textContent=e.message;}finally{submit.disabled=false;}
 });
 $('classGuest').addEventListener('click',()=>{if(!startMode||entry.classe||identity?.alunno)return;access='';info=null;codeInput.value='';try{localStorage.removeItem(ctx.key+':classe');}catch{}start();});
 document.addEventListener('bussola-progetto-nuovo',()=>{identity=null;form.elements.nome.value='';form.elements.cognome.value='';show();});
 const initial=ctx.token()||access?refresh().catch(()=>{}):Promise.resolve();
 if(entry.classe)initial.then(()=>{if(info&&!identity?.alunno)open($('openClass'),ctx.isIntro());});
 window.addEventListener('hashchange',()=>{const next=classEntry();if(!next.classe)return;if(next.alunno&&next.alunno!==entry.alunno){location.reload();return;}entry=next;access=next.classe;codeInput.value=isShortCode(access)?access:'';info=null;open($('openClass'),ctx.isIntro());});
 return {begin:trigger=>open(trigger,true),refresh,identity:async()=>{if(access&&!identity?.alunno)await refresh();return identity?.alunno?JSON.parse(JSON.stringify(identity)):null;}};
}
