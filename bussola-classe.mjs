const TOKEN=/^[A-Za-z0-9_-]{43}$/;
export function classEntry(){const p=new URLSearchParams(location.hash.slice(1));return {classe:TOKEN.test(p.get('classe'))?p.get('classe'):'',alunno:TOKEN.test(p.get('alunno'))?p.get('alunno'):''};}
export function setupClass(ctx){
 const $=id=>document.getElementById(id),dialog=$('classDialog');
 const testing=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('prova');
 const API=testing?'/__test/bussola-gestione':'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-gestione';
 let entry=classEntry();
 let classCode=entry.classe,info=null,identity=null,returnFocus=null;
 try{if(!classCode)classCode=JSON.parse(localStorage.getItem(ctx.key+':classe'))?.code||'';}catch{}
 function keep(){try{localStorage.setItem(ctx.key+':classe',JSON.stringify({code:classCode}));}catch{}}
 async function api(action,payload={}){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','x-bussola-token':ctx.token()},body:JSON.stringify({action,...payload}),signal:ctrl.signal});const b=await r.json();if(!r.ok)throw Object.assign(new Error(b.error||'Classe non disponibile.'),{status:r.status});return b;}finally{clearTimeout(timer);}}
 function show(){const panel=$('classSummary');panel.replaceChildren();if(identity?.alunno){const text=document.createElement('span');text.textContent=`${identity.alunno.nome} ${identity.alunno.cognome} · ${identity.classe.classe} · ${identity.classe.scuola}`;panel.append(text);$('openClass').textContent='La mia classe';$('classIdentity').textContent=text.textContent;$('classForm').hidden=true;$('classResume').hidden=false;const u=new URL(location.href);u.hash=new URLSearchParams({classe:classCode,alunno:ctx.token()}).toString();$('classResumeLink').href=u.href;}else{$('classForm').hidden=false;$('classResume').hidden=true;$('classIdentity').textContent=info?`${info.scuola} · ${info.classe} · ${info.anno}`:'Collega il tuo lavoro alla classe per l’attestato.';$('classNames').hidden=info?.modalita==='elenco';$('classForm').elements.nome.required=info?.modalita!=='elenco';$('classForm').elements.cognome.required=info?.modalita!=='elenco';$('classLinkField').hidden=!!info;}
 panel.hidden=!identity?.alunno&&!info;if(info&&!identity?.alunno){const text=document.createElement('span');text.textContent=`${info.scuola} · Classe ${info.classe}`;panel.append(text);}
 }
 async function refresh(){try{if(ctx.token()){try{identity=await api('identity');}catch(e){if(e.status!==401)throw e;}if(identity?.alunno){info=identity.classe;classCode=identity.classe.codice||classCode;keep();show();return;}}if(classCode){const d=await api('class_info',{classe:classCode});info=d.classe;keep();show();}}catch(e){if(dialog.open)$('classMessage').textContent=e.message;}}
 async function open(trigger){returnFocus=trigger;$('classMessage').textContent='';dialog.showModal();await refresh();show();if(identity?.alunno)$('closeClass').focus();else(info?.modalita==='elenco'?$('classSubmit'):$('classForm').elements.nome).focus();}
 $('openClass').addEventListener('click',e=>open(e.currentTarget));$('closeClass').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>returnFocus?.focus());
 $('classForm').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,submit=$('classSubmit');submit.disabled=true;$('classMessage').textContent='Collegamento del tuo lavoro…';try{
  if(!classCode){const raw=form.elements.link.value.trim();try{classCode=new URLSearchParams(new URL(raw).hash.slice(1)).get('classe')||raw;}catch{classCode=raw;}if(!TOKEN.test(classCode))throw new Error('Incolla il link della classe ricevuto dal docente.');info=(await api('class_info',{classe:classCode})).classe;if(info.modalita==='elenco')throw new Error('Per questa classe serve il tuo link individuale. Apri quello ricevuto dal docente.');}
  await ctx.ensure();identity=await api('enroll',{classe:classCode,accesso:entry.alunno||ctx.token(),nome:form.elements.nome.value,cognome:form.elements.cognome.value});keep();show();$('classMessage').textContent='Il lavoro è collegato alla tua classe. Puoi continuare.';dialog.close();
 }catch(e){$('classMessage').textContent=e.message;}finally{submit.disabled=false;}});
 document.addEventListener('bussola-progetto-nuovo',()=>{identity=null;show();});
 if(classCode){show();refresh().then(()=>{if(info&&!identity?.alunno)open($('openClass'));});}else if(ctx.token())refresh();
 window.addEventListener('hashchange',()=>{const next=classEntry();if(!next.classe)return;if(next.alunno&&next.alunno!==entry.alunno){location.reload();return;}entry=next;classCode=next.classe;info=null;refresh().then(()=>{if(info&&!identity?.alunno)open($('openClass'));});});
 return {refresh,identity:async()=>{if(classCode&&!identity?.alunno)await refresh();return identity?.alunno?JSON.parse(JSON.stringify(identity)):null;}};
}
