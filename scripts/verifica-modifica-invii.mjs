import assert from 'node:assert/strict';
import {isolatedOrientation} from './verifica-conferma-visite.mjs';

// La Funzione Strumentale corregge disponibilità e proposte già inviate senza password (9/11/2026).
const supporterId='11111111-1111-4111-8111-111111111111';
const proposalId='22222222-2222-4222-8222-222222222222';
const supporter={id:supporterId,nome:'Mario',cognome:'Esempio',scuole:['uta-sede'],nota:'',stato:'assegnata',created_at:'2026-10-01T08:00:00Z',updated_at:'2026-10-01T08:00:00Z'};
const proposal={id:proposalId,nome:'Anna',cognome:'Prova',titolo:'Laboratorio',area:'SSAS',tipologia:'laboratorio',descrizione:'Descrizione di prova',durata_minuti:60,partecipanti:20,esigenze:'',nota:'',stato:'approvata',created_at:'2026-10-02T08:00:00Z',updated_at:'2026-10-02T08:00:00Z'};
const env=await isolatedOrientation({now:'2026-11-09T10:00:00Z',seed:{orientamento_disponibilita:[structuredClone(supporter)],orientamento_proposte:[structuredClone(proposal)]}});
const {call,tables}=env;
const token=async password=>(await call('login',{password})).body.token;
const fs=await token('ANTEPRIMA');
const row=()=>tables.get('orientamento_disponibilita')[0];
const prop=()=>tables.get('orientamento_proposte')[0];
const editS={id:supporterId,nome:'Mario',cognome:'Esempio',scuole:['uta-sede','siliqua-sede'],nota:'Nota aggiunta dalla FS'};
const editP={...proposal,titolo:'Laboratorio corretto',nota:'Nota della FS',durata_minuti:90,partecipanti:''};

// Senza sessione, con password Commissione o supporter: nessuna modifica.
for(const [t,expected] of [['',401],[await token('SUPPORTER'),403],[await token('ORIENTATORE'),403]]) {
  assert.equal((await call('edit_supporter',editS,t)).status,expected);
  assert.equal((await call('edit_proposal',editP,t)).status,expected);
}
assert.deepEqual(row(),supporter);
assert.deepEqual(prop(),proposal);

// La FS corregge tutto; stato, codice e data di invio restano quelli di prima.
let r=await call('edit_supporter',{...editS,stato:'archiviata',created_at:'2020-01-01'},fs);
assert.equal(r.status,200);
assert.deepEqual(row().scuole,['uta-sede','siliqua-sede']);
assert.equal(row().nota,'Nota aggiunta dalla FS');
assert.equal(row().stato,'assegnata');
assert.equal(row().created_at,supporter.created_at);
assert.equal(row().id,supporterId);
assert.notEqual(row().updated_at,supporter.updated_at);
r=await call('edit_proposal',{...editP,stato:'ricevuta'},fs);
assert.equal(r.status,200);
assert.equal(prop().titolo,'Laboratorio corretto');
assert.equal(prop().durata_minuti,90);
assert.equal(prop().partecipanti,null);
assert.equal(prop().stato,'approvata');
assert.equal(prop().created_at,proposal.created_at);

// Stessi limiti del modulo pubblico: niente dati non validi.
const before=JSON.stringify([row(),prop()]);
for(const bad of [{scuole:[]},{scuole:['a1','b2','c3','d4','e5','f6']},{scuole:['scuola-inesistente']},{scuole:['uta-sede','uta-sede']},{nome:'X'},{nota:'x'.repeat(601)},{id:'non-valido'}])
  assert.equal((await call('edit_supporter',{...editS,...bad},fs)).status,400);
for(const bad of [{tipologia:'altro-tipo'},{durata_minuti:50},{descrizione:'corta'},{partecipanti:500}])
  assert.equal((await call('edit_proposal',{...editP,...bad},fs)).status,400);
assert.equal((await call('edit_supporter',{...editS,id:'33333333-3333-4333-8333-333333333333'},fs)).status,400);
assert.equal(JSON.stringify([row(),prop()]),before);

// Errore del database: risposta 503 e dati invariati.
env.failWrites(true);
assert.equal((await call('edit_supporter',{...editS,nota:'altra'},fs)).status,503);
env.failWrites(false);
assert.equal(JSON.stringify([row(),prop()]),before);

// La pagina pubblica mostra subito le scuole corrette, senza la nota.
const overview=(await call('overview')).body;
assert.deepEqual(overview.scuole.find(s=>s.id==='siliqua-sede').docenti,['M. Esempio']);
assert.ok(!JSON.stringify(overview).includes('Nota aggiunta'));
// L'invio pubblico continua a funzionare con gli stessi controlli.
assert.equal((await call('submit_supporter',{nome:'Lucia',cognome:'Nuova',scuole:['uta-sede'],nota:''})).status,201);
assert.equal((await call('submit_supporter',{nome:'Lucia',cognome:'Nuova',scuole:[]})).status,400);
assert.equal((await call('submit_proposal',{...editP,id:undefined})).status,201);
console.log('Modifica invii: riservata alla FS (401/403 per gli altri), tutti i campi correggibili, stato e data di invio conservati, controlli del modulo pubblico, errori senza perdite, nota mai pubblica.');
