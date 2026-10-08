import {FORMAT,restoreProject,summaryItems,LABS} from './ssas-labs-core.mjs';
export function completion(project){
 if(project?.payload?.labJourney?.format!==FORMAT)return {completed:false,done:0,interests:[]};
 const j=restoreProject(project.payload).labJourney;
 return {completed:j.finished&&j.done.length===5,done:j.done.length,interests:LABS.filter(l=>j.interests.includes(l.id)).map(l=>l.label)};
}
export function certificateSnapshot(alunno,classe,project){
 if(!alunno.verificato||!completion(project).completed)throw new Error('Occorrono un nominativo verificato e un percorso concluso.');
 const j=restoreProject(project.payload).labJourney;
 return {format:'bussola-attestato-partecipazione-1',alunno_id:alunno.id,classe_id:classe.id,partecipante_id:alunno.partecipante_id,nome:alunno.nome,cognome:alunno.cognome,scuola:classe.scuola,comune:classe.comune,classe:classe.classe,anno:classe.anno,corso:'ssas',revision:project.revision,laboratori:LABS.map(l=>l.label),lavori:summaryItems(j),curiosita:completion(project).interests,idea:j.nextIdea};
}
export function csvCell(x){const value=String(x??'');return '"'+(/^[\s]*[=+\-@]/.test(value)?"'"+value:value).replaceAll('"','""')+'"';}
export function safeName(s){return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,100)||'attestato';}
