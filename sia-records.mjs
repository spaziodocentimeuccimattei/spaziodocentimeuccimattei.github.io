import {FORMAT,LABS,PROCESS,BLOCKS,ROLES,CASES,find,ready,validProject,query,processSignature,programSignature,uiSignature,accessSignature,currentRuns} from './sia-core.mjs?v=20261010-all';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function restore(value){
 try{
  if(!validProject(value)||value.version!==1||typeof value.started!=='boolean'||new Set(value.done).size!==value.done.length||value.title.length>80||value.ui.title.length>64||value.ui.button.length>36)return null;
  if(value.notes.some(n=>!uuid.test(n.id)||typeof n.label!=='string'))return null;
  for(const list of [value.process.runs,value.process.handoffRuns,value.program.runs,value.ui.runs,value.access.runs])if(list.some(r=>!uuid.test(r.id)||typeof r.signature!=='string'||r.signature.length>2000))return null;
  if(value.process.handoff!=null&&!['completa','essenziale'].includes(value.process.handoff))return null;
  const p=JSON.parse(JSON.stringify(value));
  // jsonb riordina le chiavi: ripristina l'ordine del modello prima di confrontare le prove.
  p.access.permissions={...Object.fromEntries(ROLES.map(r=>{const v=p.access.permissions[r.id];return [r.id,{view:v.view,edit:v.edit,...v}];})),...Object.fromEntries(Object.entries(p.access.permissions).filter(([id])=>!ROLES.some(r=>r.id===id)))};
  p.done=p.done.filter(s=>ready(p,s));return p;
 }catch{return null;}
}
export function remoteProject(value){const p=restore(value);if(!p)return null;p.notes=[];p.identity=null;return p;}
export function summaryItems(value){
 const p=restore(value);if(!p)throw new Error('Progetto SIA non valido.');const q=query(p);
 return [
 {title:LABS[0].label,text:p.process.order.map(id=>find(PROCESS,id).label).join(' → ')+`. Passaggio di informazioni: ${p.process.handoff==='completa'?'scheda completa':'scheda essenziale'}.`},
 {title:LABS[1].label,text:`Archivio con ${p.data.fields.length} campi scelti. Duplicato ${p.data.merged?'riunito':'da riunire'}; filtro ${p.data.filter}: ${q.count??'da verificare'} ${q.count===1?'intervento pronto':'interventi pronti'}.`},
 {title:LABS[2].label,text:p.program.blocks.map(id=>find(BLOCKS,id).label).join(' → ')+`. Condizione: posti disponibili ${p.program.condition==='almeno'?'almeno pari ai':'maggiori dei'} posti richiesti. ${currentRuns(p.program.runs,programSignature(p)).length} ${currentRuns(p.program.runs,programSignature(p)).length===1?'prova':'prove'} della configurazione attuale.`},
 {title:LABS[3].label,text:`«${p.ui.title}», comando «${p.ui.button}». ${currentRuns(p.ui.runs,uiSignature(p)).length} ${currentRuns(p.ui.runs,uiSignature(p)).length===1?'prova':'prove'} dell’interfaccia attuale.`},
 {title:LABS[4].label,text:ROLES.map(r=>`${r.label}: ${p.access.permissions[r.id].view?'vede':'non vede'}, ${p.access.permissions[r.id].edit?'modifica':'non modifica'}`).join('; ')+'.'}
 ];
}
