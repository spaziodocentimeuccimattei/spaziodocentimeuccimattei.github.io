import {COURSE_NAMES} from './bussola-records-core.mjs?v=20261009-turismo';
import {certificateName,participantCertificate} from './bussola-attestato-alunno-core.mjs?v=20261009-turismo';
import {certificateCanvas,downloadCertificate} from './bussola-attestati-render.mjs?v=20261009-turismo';

export function setupParticipantCertificate(ctx){
 const $=id=>document.getElementById(id),dialog=$('certificateDialog');
 let trigger=null,identity=null,generation=0,url=null;
 const message=text=>{$('certificateStatus').textContent=text;};
 function release(){if(url?.startsWith('blob:'))URL.revokeObjectURL(url);url=null;}
 function hideResult(){release();$('certificateResult').hidden=true;$('certificateSheet').replaceChildren();$('certificateDownload').removeAttribute('href');}
 function stamp(){const j=ctx.journey?ctx.journey():ctx.project().labJourney;if(!/^[0-9a-f-]{36}$/i.test(j.attestato?.id)||!Number.isFinite(Date.parse(j.attestato?.date))){j.attestato={...j.attestato,id:crypto.randomUUID(),date:new Date().toISOString()};ctx.save();}return j.attestato;}
 async function prepare(){
  const turn=++generation;hideResult();$('certificateSubmit').disabled=true;message('Preparo il tuo attestato…');
  try{
   const saved=stamp(),name=certificateName(identity?.alunno?`${identity.alunno.nome} ${identity.alunno.cognome}`:$('certificateName').value);
   if(saved.name!==name){saved.name=name;ctx.save();}
   const record=participantCertificate(ctx.project(),{identity,name,participant:ctx.participant(),revision:ctx.revision(),id:saved.id,date:saved.date});
   const [canvas,file]=await Promise.all([certificateCanvas(record),downloadCertificate(record)]);
   if(turn!==generation||!dialog.open){if(file.url.startsWith('blob:'))URL.revokeObjectURL(file.url);return;}
   url=file.url;const s=record.snapshot;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`Attestato di partecipazione di ${name}. Cinque laboratori ${COURSE_NAMES[s.corso]||s.corso} completati: ${s.laboratori.join(', ')}. Curiosità: ${s.curiosita.join(', ')}.`);
   $('certificateSheet').append(canvas);$('certificateDownload').href=file.url;$('certificateDownload').download=file.name;
   $('certificateForm').hidden=true;$('certificateResult').hidden=false;$('certificateHeading').focus();message('');
  }catch(e){if(turn!==generation)return;$('certificateForm').hidden=false;message(e.message||'L’attestato non è pronto. Riprova.');}
  finally{if(turn===generation)$('certificateSubmit').disabled=false;}
 }
 async function open(button){
  trigger=button;generation++;identity=null;hideResult();$('certificateForm').hidden=true;$('certificateSubmit').disabled=false;message('Preparo il tuo attestato…');dialog.showModal();
  const turn=generation;identity=await ctx.identity();if(turn!==generation||!dialog.open)return;
  const saved=stamp();$('certificateName').value=identity?.alunno?`${identity.alunno.nome} ${identity.alunno.cognome}`:saved.name||'';
  if($('certificateName').value)await prepare();else{$('certificateForm').hidden=false;message('');$('certificateName').focus();}
 }
 $('certificateForm').addEventListener('submit',e=>{e.preventDefault();prepare();});
 $('closeCertificate').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{generation++;document.body.classList.remove('print-certificate');hideResult();trigger?.focus();});
 $('certificatePrint').addEventListener('click',()=>{document.body.classList.add('print-certificate');window.print();});
 window.addEventListener('afterprint',()=>document.body.classList.remove('print-certificate'));
 $('certificateEditName').addEventListener('click',()=>{if(identity?.alunno)return;hideResult();$('certificateForm').hidden=false;$('certificateName').focus();});
 return {open:async button=>{await open(button);$('certificateEditName').hidden=!!identity?.alunno;}};
}
