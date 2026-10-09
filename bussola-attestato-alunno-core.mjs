import {completion,courseDetails} from './bussola-records-core.mjs?v=20261009-cat';
import {restoreProject,summaryItems,LABS} from './ssas-labs-core.mjs';

export function certificateName(value){
 const name=typeof value==='string'?value.trim().replace(/\s+/gu,' ').normalize('NFC'):'';
 if(!name||name.length>161||/[\u0000-\u001f<>]/u.test(value))throw new Error('Inserisci il tuo nome e cognome, come vuoi che compaiano nell’attestato.');
 return name;
}
// Copia personale disponibile a fine percorso. L'emissione riservata della
// Gestione continua a richiedere la verifica del nominativo sul server.
export function participantCertificate(project,{identity=null,name='',participant='',revision=0,id,date}){
 if(!completion({payload:project}).completed)throw new Error('Concludi i cinque laboratori prima di aprire l’attestato.');
 if(!/^[0-9a-f-]{36}$/i.test(id)||!Number.isFinite(Date.parse(date)))throw new Error('Riapri l’attestato per prepararlo.');
 const d=courseDetails(project),j=d.journey,a=identity?.alunno,c=identity?.classe;
 const full=certificateName(a?`${a.nome} ${a.cognome}`:name);
 return {id,created_at:date,origine:'percorso_alunno',snapshot:{format:'bussola-attestato-partecipazione-1',alunno_id:a?.id||'',classe_id:a?.classe_id||'',partecipante_id:participant,nome:a?.nome||full,cognome:a?.cognome||'',scuola:c?.scuola||'',comune:c?.comune||'',classe:c?.classe||'',anno:c?.anno||'',corso:d.corso,revision,laboratori:d.labs.map(l=>l.label),lavori:d.works,curiosita:completion({payload:project}).interests,idea:d.idea}};
}
