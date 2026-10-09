import {FORMAT as TUR_FORMAT,restore as restoreTur,LABS as TUR_LABS,summaryItems as turSummary} from './turismo-core.mjs?v=20261009-turismo';
import {FORMAT,restoreProject,summaryItems,LABS} from './ssas-labs-core.mjs';
export const COURSE_NAMES={ssas:'Servizi per la sanità e l’assistenza sociale',turismo:'Turismo'};
export function courseDetails(payload){if(payload?.format===TUR_FORMAT){const p=restoreTur(payload);if(!p)throw new Error('Progetto Turismo non valido.');return {corso:'turismo',journey:p,labs:TUR_LABS,works:turSummary(p),idea:''};}const j=restoreProject(payload).labJourney;return {corso:'ssas',journey:j,labs:LABS,works:summaryItems(j),idea:j.nextIdea};}
export function completion(project){
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
