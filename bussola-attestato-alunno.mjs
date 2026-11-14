import {COURSE_NAMES} from './bussola-records-core.mjs?v=20261029-missione';
import {certificateName,participantCertificate} from './bussola-attestato-alunno-core.mjs?v=20261029-missione';
import {certificateCanvas,downloadCertificate} from './bussola-attestati-render.mjs?v=20261029-missione';
import {nextStep} from './bussola-prossimo-passo.mjs?v=20261114-a3';
import {nomeOspite,salvaNomeOspite,nomeCompleto} from './bussola-locale.mjs?v=20261114-a3';

// Identificativo e data del documento restano nel progetto. Il NOME no: il progetto viene sincronizzato per intero
// e, finché la privacy non è approvata, nome e cognome di chi entra senza classe restano solo sul dispositivo
// (chiave locale «bussola-ospite», vedi bussola-locale.mjs).
function stampDocument(ctx){
 const j=ctx.journey?ctx.journey():ctx.project().labJourney;
 if(!/^[0-9a-f-]{36}$/i.test(j.attestato?.id)||!Number.isFinite(Date.parse(j.attestato?.date))||'name' in (j.attestato||{})){
  const {name,...resto}=j.attestato||{};if(typeof name==='string'&&name.trim()&&!nomeOspite()){const [n,...c]=name.trim().split(/\s+/);salvaNomeOspite(n,c.join(' '));}
  const valido=/^[0-9a-f-]{36}$/i.test(resto.id)&&Number.isFinite(Date.parse(resto.date));
  j.attestato=valido?resto:{...resto,id:crypto.randomUUID(),date:new Date().toISOString()};ctx.save();
 }
 return j.attestato;
}
// Prepara l'attestato (record, canvas e PDF) senza toccare l'interfaccia. Lo usano la finestra qui sotto e il finale comune.
// `nome` serve solo a chi non ha una classe; chi ha una classe usa il nominativo registrato.
export async function preparaAttestato(ctx,{identity,nome=''}={}){
 const saved=stampDocument(ctx);
 const name=certificateName(identity?.alunno?`${identity.alunno.nome} ${identity.alunno.cognome}`:nome);
 const record=participantCertificate(ctx.project(),{identity,name,participant:ctx.participant(),revision:ctx.revision(),id:saved.id,date:saved.date});
 const [canvas,file]=await Promise.all([certificateCanvas(record),downloadCertificate(record)]);
 return {record,canvas,file,name,saved};
}
export function setupParticipantCertificate(ctx){
 const $=id=>document.getElementById(id),dialog=$('certificateDialog');
 let trigger=null,identity=null,generation=0,url=null;
 const message=text=>{$('certificateStatus').textContent=text;};
 function release(){if(url?.startsWith('blob:'))URL.revokeObjectURL(url);url=null;}
 function hideResult(){release();$('certificateResult').hidden=true;$('certificateSheet').replaceChildren();$('certificateResult').querySelector('.bussola-next-step')?.remove();$('certificateDownload').removeAttribute('href');}
 const stamp=()=>stampDocument(ctx);
 async function prepare(){
  const turn=++generation;hideResult();$('certificateSubmit').disabled=true;message('Preparo il tuo attestato…');
  try{
   const typed=$('certificateName').value;
   const {record,canvas,file,name}=await preparaAttestato(ctx,{identity,nome:typed});
   if(!identity?.alunno){const [n,...c]=name.split(' ');salvaNomeOspite(n,c.join(' '));}
   if(turn!==generation||!dialog.open){if(file.url.startsWith('blob:'))URL.revokeObjectURL(file.url);return;}
   url=file.url;const s=record.snapshot;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`Attestato di partecipazione di ${name}. Cinque laboratori ${COURSE_NAMES[s.corso]||s.corso}${['cat-4plus2','cat-4plus2-edificio','cat-4plus2-missione'].includes(s.percorso)?' 4+2':''} completati: ${s.laboratori.join(', ')}. Curiosità: ${s.curiosita.join(', ')}.`);
   $('certificateSheet').append(canvas);$('certificateSheet').before(nextStep(s.corso,{compact:true}));$('certificateDownload').href=file.url;$('certificateDownload').download=file.name;
   $('certificateForm').hidden=true;$('certificateResult').hidden=false;$('certificateHeading').focus();message('');
  }catch(e){if(turn!==generation)return;$('certificateForm').hidden=false;message(e.message||'L’attestato non è pronto. Riprova.');}
  finally{if(turn===generation)$('certificateSubmit').disabled=false;}
 }
 async function open(button){
  trigger=button;generation++;identity=null;hideResult();$('certificateForm').hidden=true;$('certificateSubmit').disabled=false;message('Preparo il tuo attestato…');dialog.showModal();
  const turn=generation;identity=await ctx.identity();if(turn!==generation||!dialog.open)return;
  const saved=stamp();$('certificateName').value=identity?.alunno?`${identity.alunno.nome} ${identity.alunno.cognome}`:nomeCompleto(nomeOspite())||saved.name||'';
  if($('certificateName').value)await prepare();else{$('certificateForm').hidden=false;message('');$('certificateName').focus();}
 }
 $('certificateForm').addEventListener('submit',e=>{e.preventDefault();prepare();});
 $('closeCertificate').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{generation++;document.body.classList.remove('print-certificate');hideResult();trigger?.focus();});
 $('certificatePrint').addEventListener('click',()=>{document.body.classList.add('print-certificate');window.print();});
 window.addEventListener('afterprint',()=>document.body.classList.remove('print-certificate'));
 $('certificateEditName').addEventListener('click',()=>{if(identity?.alunno)return;hideResult();$('certificateForm').hidden=false;$('certificateName').focus();});
 return {open:async button=>{await open(button);$('certificateEditName').hidden=!!identity?.alunno;},
  // Per il finale comune: attestato pronto con il nome già inserito (da classe o da questo dispositivo).
  prepara:async()=>{const id=await ctx.identity();return preparaAttestato(ctx,{identity:id,nome:nomeCompleto(nomeOspite())});}};
}
