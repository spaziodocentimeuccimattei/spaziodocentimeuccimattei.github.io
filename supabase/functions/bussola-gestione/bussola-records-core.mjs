import {FORMAT as AFM_FORMAT,LABS as AFM_LABS,ready as afmReady,completed as afmCompleted} from './afm-core.mjs';
import {restore as restoreAFM,summaryItems as afmSummary} from './afm-records.mjs';
import {FORMAT as SIA_FORMAT,LABS as SIA_LABS,ready as siaReady,completed as siaCompleted} from './sia-core.mjs';
import {restore as restoreSIA,summaryItems as siaSummary} from './sia-records.mjs';
import {FORMAT as CAT_FORMAT,restore as restoreCat,LABS as CAT_LABS,summaryItems as catSummary,completed as catCompleted,ready as catReady} from './cat-core.mjs';
import {FORMAT as TUR_FORMAT,restore as restoreTur,LABS as TUR_LABS,summaryItems as turSummary} from './turismo-core.mjs';
import {FORMAT,restoreProject,summaryItems,LABS} from './ssas-labs-core.mjs';
export const COURSE_NAMES={afm:'Amministrazione, Finanza e Marketing',sia:'Sistemi Informativi Aziendali',ssas:'Servizi per la sanità e l’assistenza sociale',turismo:'Turismo',cat:'Costruzioni, Ambiente e Territorio · Archeodesign'};
export function courseDetails(payload){if(payload?.format===AFM_FORMAT){const p=restoreAFM(payload);if(!p)throw new Error('Progetto AFM non valido.');return {corso:'afm',journey:p,labs:AFM_LABS,works:afmSummary(p),idea:''};}if(payload?.format===SIA_FORMAT){const p=restoreSIA(payload);if(!p)throw new Error('Progetto SIA non valido.');return {corso:'sia',journey:p,labs:SIA_LABS,works:siaSummary(p),idea:''};}if(payload?.format===CAT_FORMAT){const p=restoreCat(payload);if(!p)throw new Error('Progetto CAT non valido.');return {corso:'cat',journey:p,labs:CAT_LABS,works:catSummary(p),idea:''};}if(payload?.format&&payload.format!==TUR_FORMAT)throw new Error('Formato del progetto non riconosciuto.');if(payload?.format===TUR_FORMAT){const p=restoreTur(payload);if(!p)throw new Error('Progetto Turismo non valido.');return {corso:'turismo',journey:p,labs:TUR_LABS,works:turSummary(p),idea:''};}const j=restoreProject(payload).labJourney;return {corso:'ssas',journey:j,labs:LABS,works:summaryItems(j),idea:j.nextIdea};}
export function completion(project){
 if(project?.payload?.format===AFM_FORMAT){if(project.corso&&project.corso!=='afm')return {completed:false,done:0,interests:[]};const p=restoreAFM(project.payload);return p?{completed:p.started&&afmCompleted(p),done:AFM_LABS.filter((l,i)=>[i*2,i*2+1].every(n=>p.done.includes(n)&&afmReady(p,n))).length,interests:AFM_LABS.filter(l=>p.interests.includes(l.id)).map(l=>l.label)}:{completed:false,done:0,interests:[]};}
 if(project?.payload?.format===SIA_FORMAT){if(project.corso&&project.corso!=='sia')return {completed:false,done:0,interests:[]};const p=restoreSIA(project.payload);return p?{completed:p.started&&siaCompleted(p),done:SIA_LABS.filter((l,i)=>[i*2,i*2+1].every(n=>p.done.includes(n)&&siaReady(p,n))).length,interests:SIA_LABS.filter(l=>p.interests.includes(l.id)).map(l=>l.label)}:{completed:false,done:0,interests:[]};}
 if(project?.payload?.format===CAT_FORMAT){if(project.corso&&project.corso!=='cat')return {completed:false,done:0,interests:[]};const p=restoreCat(project.payload);return p?{completed:catCompleted(p),done:CAT_LABS.filter((l,i)=>[i*2,i*2+1].every(s=>p.done.includes(s)&&catReady(p,s))).length,interests:CAT_LABS.filter(l=>p.interests.includes(l.id)).map(l=>l.label)}:{completed:false,done:0,interests:[]};}
 if(project?.payload?.format===TUR_FORMAT){if(project.corso&&project.corso!=='turismo')return {completed:false,done:0,interests:[]};const p=restoreTur(project.payload);return p?{completed:p.finished&&p.done.length===5,done:p.done.length,interests:TUR_LABS.filter(l=>p.interests.includes(l.id)).map(l=>l.label)}:{completed:false,done:0,interests:[]};}
 if(project?.corso&&project.corso!=='ssas')return {completed:false,done:0,interests:[]};
 if(project?.payload?.labJourney?.format!==FORMAT)return {completed:false,done:0,interests:[]};
 const j=restoreProject(project.payload).labJourney;
 return {completed:j.finished&&j.done.length===5,done:j.done.length,interests:LABS.filter(l=>j.interests.includes(l.id)).map(l=>l.label)};
}
export function certificateSnapshot(alunno,classe,project){
 if(!alunno.verificato||!completion(project).completed)throw new Error('Occorrono un nominativo verificato e un percorso concluso.');
 const d=courseDetails(project.payload),j=d.journey;
 return {format:'bussola-attestato-partecipazione-1',alunno_id:alunno.id,classe_id:classe.id,partecipante_id:alunno.partecipante_id,nome:alunno.nome,cognome:alunno.cognome,scuola:classe.scuola,comune:classe.comune,classe:classe.classe,anno:classe.anno,corso:d.corso,revision:project.revision,laboratori:d.labs.map(l=>l.label),lavori:d.works,curiosita:completion(project).interests,idea:d.idea};
}
export function csvCell(x){const value=String(x??'');return '"'+(/^[\s]*[=+\-@]/.test(value)?"'"+value:value).replaceAll('"','""')+'"';}
export function safeName(s){return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,100)||'attestato';}
