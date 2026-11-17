import assert from 'node:assert/strict';
import {isolatedOrientation} from './verifica-conferma-visite.mjs';

// Codice personale dei docenti (17/11/2026): voci per scuola con la propria nota, modificabili dal docente,
// dalla Commissione e dalla Funzione Strumentale; note dello storico da riconfermare se cambiate.
const pisano={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',nome:'Renato',cognome:'Esempio',codice:'K7P2-QX4M'};
const uta={id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',scuola_id:'uta-sede',tipo:'aule',data:'2026-11-20',ora_inizio:null,ora_fine:null,luogo:'',nota:'',stato:'confermata',archiviata:false};
const elmas={id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',scuola_id:'elmas-saba',tipo:'stand',data:'2026-11-12',ora_inizio:null,ora_fine:null,luogo:'',nota:'',stato:'confermata',archiviata:false};
const visit={id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',nome:'Renato',cognome:'Esempio',tipo:'visita',scuola_id:'elmas-saba',titolo:'',data:'2026-11-12',nota:'fuori orario 11.30-13.30',stato:'confermata',archiviata:false,docente_id:pisano.id,nota_precedente:null,modificata_dal_docente_at:null};
const other={...visit,id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',nome:'Anna',cognome:'Altra',docente_id:'ffffffff-ffff-4fff-8fff-ffffffffffff'};
const env=await isolatedOrientation({now:'2026-11-17T10:00:00Z',seed:{
  orientamento_docenti:[structuredClone(pisano),{id:other.docente_id,nome:'Anna',cognome:'Altra',codice:'ZZZZ-2222'}],
  orientamento_appuntamenti:[structuredClone(uta),structuredClone(elmas)],
  orientamento_attivita:[structuredClone(visit),structuredClone(other)],
}});
const {call,tables}=env;
const rows=table=>tables.get(table);
const token=async password=>(await call('login',{password})).body.token;

// 1. Primo invio: una voce per scuola, ognuna con la sua nota, e il codice personale nella risposta.
let r=await call('submit_supporter',{nome:'Lucia',cognome:'Nuova',voci:[
  {scuola_id:'uta-sede',appuntamento_id:uta.id,nota:'Posso dalle 10'},
  {scuola_id:'siliqua-sede',nota:''},
]});
assert.equal(r.status,201);
assert.match(r.body.codice_personale,/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
const lucia=r.body.codice_personale;
const luciaRows=rows('orientamento_disponibilita').filter(x=>x.cognome==='Nuova');
assert.equal(luciaRows.length,2);
assert.deepEqual(luciaRows.map(x=>x.scuole),[['uta-sede'],['siliqua-sede']]);
assert.equal(luciaRows[0].nota,'Posso dalle 10');
assert.equal(luciaRows[0].appuntamento_id,uta.id);
assert.equal(new Set(luciaRows.map(x=>x.docente_id)).size,1);

// La data deve essere della stessa scuola; niente doppioni; cinque scuole al massimo.
assert.equal((await call('submit_supporter',{codice:lucia,voci:[{scuola_id:'siliqua-sede',appuntamento_id:uta.id}]})).status,400);
assert.equal((await call('submit_supporter',{codice:lucia,voci:[{scuola_id:'siliqua-sede'}]})).status,409);
r=await call('submit_supporter',{codice:lucia,voci:[{scuola_id:'elmas-saba'}]});
assert.equal(r.status,201);
assert.equal(r.body.codice_personale,null);
assert.equal((await call('submit_supporter',{codice:lucia,voci:Array.from({length:6},(_,i)=>({scuola_id:['uta-sede','elmas-saba','siliqua-sede','assemini-nivola','assemini-pascoli','sardara-sede'][i]}))})).status,400);
assert.equal((await call('submit_supporter',{codice:'AAAA-AAAA',voci:[{scuola_id:'elmas-saba'}]})).status,404);

// 2. Chi è già registrato e invia senza codice: le voci vanno al suo nome, il codice non viene rivelato.
r=await call('submit_supporter',{nome:'renato',cognome:'esempio',voci:[{scuola_id:'siliqua-sede',nota:'nota mia'}]});
assert.equal(r.status,201);
assert.equal(r.body.codice_personale,null);
assert.equal(r.body.gia_registrato,true);
assert.ok(!JSON.stringify(r.body).includes(pisano.codice));
assert.equal(rows('orientamento_disponibilita').at(-1).docente_id,pisano.id);
assert.equal(rows('orientamento_docenti').length,3);
// Le copie della pagina precedente (scuole + una nota) continuano a funzionare.
r=await call('submit_supporter',{nome:'Mario',cognome:'Vecchio',scuole:['uta-sede','elmas-saba'],nota:'stessa nota'});
assert.equal(r.status,201);
assert.deepEqual(rows('orientamento_disponibilita').filter(x=>x.cognome==='Vecchio').map(x=>[x.scuole[0],x.nota]),[['uta-sede','stessa nota'],['elmas-saba','stessa nota']]);

// 3. Con il codice il docente vede solo le sue voci e il suo storico.
r=await call('teacher_entries',{codice:'k7p2qx4m'});
assert.equal(r.status,200);
assert.equal(r.body.docente.codice,pisano.codice);
assert.deepEqual(r.body.voci.map(x=>x.scuola_id),['siliqua-sede']);
assert.deepEqual(r.body.attivita.map(x=>x.id),[visit.id]);
assert.equal((await call('teacher_entries',{})).status,401);
assert.equal((await call('teacher_entries',{codice:'BBBB-BBBB'})).status,404);

// 4. Modifica della nota e della data di una propria voce; la voce di un altro non si tocca.
const entryId=r.body.voci[0].id;
assert.equal((await call('save_entry',{codice:pisano.codice,id:entryId,nota:'Nota corretta'})).status,200);
assert.equal(rows('orientamento_disponibilita').find(x=>x.id===entryId).nota,'Nota corretta');
assert.equal((await call('save_entry',{codice:lucia,id:entryId,nota:'intrusa'})).status,404);
assert.equal(rows('orientamento_disponibilita').find(x=>x.id===entryId).nota,'Nota corretta');
r=await call('save_entry',{codice:pisano.codice,scuola_id:'elmas-saba',appuntamento_id:elmas.id,nota:'Storico: c’ero'});
assert.equal(r.status,201);
assert.equal((await call('save_entry',{codice:pisano.codice,scuola_id:'elmas-saba',appuntamento_id:elmas.id})).status,409);
assert.equal((await call('remove_entry',{codice:lucia,id:r.body.id})).status,404);
assert.equal((await call('remove_entry',{codice:pisano.codice,id:r.body.id})).status,200);
assert.equal(rows('orientamento_disponibilita').find(x=>x.id===r.body.id).stato,'archiviata');

// 5. Nota di una visita confermata cambiata dal docente: torna da confermare, la nota precedente resta.
r=await call('save_activity_note',{codice:pisano.codice,id:visit.id,nota:'fuori orario 11.30-14.00'});
assert.equal(r.status,200);
assert.equal(r.body.da_riconfermare,true);
let row=rows('orientamento_attivita').find(x=>x.id===visit.id);
assert.equal(row.stato,'da_confermare');
assert.equal(row.nota_precedente,'fuori orario 11.30-13.30');
assert.ok(row.modificata_dal_docente_at);
assert.equal((await call('save_activity_note',{codice:pisano.codice,id:other.id,nota:'no'})).status,404);
assert.equal(rows('orientamento_attivita').find(x=>x.id===other.id).nota,visit.nota);
const fs=await token('ANTEPRIMA');
let list=(await call('list_contributions',{},fs)).body;
assert.equal(list.da_confermare.find(x=>x.id===visit.id).nota_precedente,'fuori orario 11.30-13.30');
assert.ok(list.docenti.some(x=>x.codice===pisano.codice));
assert.equal((await call('confirm_activity',{id:visit.id},fs)).status,200);
row=rows('orientamento_attivita').find(x=>x.id===visit.id);
assert.equal(row.stato,'confermata');
assert.equal(row.modificata_dal_docente_at,null);
// La Funzione Strumentale corregge senza riaprire la conferma.
assert.equal((await call('save_activity_note',{docente_id:pisano.id,id:visit.id,nota:'corretta dalla FS'},fs)).status,200);
assert.equal(row.stato,'confermata');

// 6. Password della Commissione: modifica tutto, ma non vede i codici; la password di consultazione no.
const commission=await token('ORIENTATORE');
r=await call('list_teachers',{},commission);
assert.equal(r.status,200);
assert.ok(r.body.docenti.every(x=>x.codice===null));
assert.ok(r.body.docenti.some(x=>x.cognome==='Esempio'));
r=await call('teacher_entries',{docente_id:pisano.id},commission);
assert.equal(r.status,200);
assert.equal(r.body.docente.codice,null);
assert.equal((await call('save_entry',{docente_id:pisano.id,id:entryId,nota:'Dalla Commissione'},commission)).status,200);
assert.equal(rows('orientamento_disponibilita').find(x=>x.id===entryId).nota,'Dalla Commissione');
assert.equal((await call('save_activity_note',{docente_id:pisano.id,id:visit.id,nota:'cambiata dalla Commissione'},commission)).status,200);
assert.equal(row.stato,'da_confermare');
const supporter=await token('SUPPORTER');
assert.equal((await call('list_teachers',{},supporter)).status,403);
assert.equal((await call('save_entry',{docente_id:pisano.id,id:entryId,nota:'x'},supporter)).status,403);
assert.equal((await call('new_code',{docente_id:pisano.id},commission)).status,403);
assert.equal((await call('list_teachers',{})).status,401);

// 7. Nome e cognome si correggono ovunque, senza toccare le conferme.
assert.equal((await call('confirm_activity',{id:visit.id},fs)).status,200);
assert.equal((await call('rename_teacher',{codice:pisano.codice,nome:'Renato Maria',cognome:'Esempio'})).status,200);
assert.ok(rows('orientamento_disponibilita').filter(x=>x.docente_id===pisano.id).every(x=>x.nome==='Renato Maria'));
assert.equal(row.nome,'Renato Maria');
assert.equal(row.stato,'confermata');
assert.equal((await call('rename_teacher',{codice:pisano.codice,nome:'Anna',cognome:'Altra'})).status,409);
assert.equal((await call('rename_teacher',{codice:pisano.codice,nome:'X',cognome:'Esempio'})).status,400);

// 8. Nuovo codice dalla Funzione Strumentale: il vecchio smette di funzionare.
r=await call('new_code',{docente_id:pisano.id},fs);
assert.equal(r.status,200);
assert.notEqual(r.body.codice,pisano.codice);
assert.equal((await call('teacher_entries',{codice:pisano.codice})).status,404);
assert.equal((await call('teacher_entries',{codice:r.body.codice})).status,200);

// 9. Segnalazione di una visita con il codice: nome del docente registrato e collegamento al suo storico.
r=await call('report_activity',{codice:lucia,nome:'Altro',cognome:'Nome',tipo:'visita',scuola_id:'uta-sede',data:'2026-11-16',nota:'fuori orario 9-11'});
assert.equal(r.status,201);
const reported=rows('orientamento_attivita').at(-1);
assert.equal(reported.cognome,'Nuova');
assert.equal(reported.stato,'da_confermare');
assert.equal((await call('teacher_entries',{codice:lucia})).body.attivita.length,1);

// 10. Pagina pubblica: nomi abbreviati per scuola, date con identificativo, mai note né codici.
const overview=(await call('overview')).body;
assert.ok(overview.scuole.find(s=>s.id==='uta-sede').docenti.includes('L. Nuova'));
assert.equal(overview.appuntamenti[0].id,uta.id);
const text=JSON.stringify(overview);
for(const secret of ['Posso dalle 10','Dalla Commissione',lucia,'fuori orario']) assert.ok(!text.includes(secret),secret);

// 11. Errore del database: nessuna voce scritta a metà.
const before=JSON.stringify(rows('orientamento_disponibilita'));
env.failWrites(true);
assert.equal((await call('save_entry',{codice:lucia,id:luciaRows[0].id,nota:'altra'})).status,503);
env.failWrites(false);
assert.equal(JSON.stringify(rows('orientamento_disponibilita')),before);
console.log('Codice docenti: voci per scuola con nota propria, codice al primo invio e mai rivelato a chi non lo ha, modifiche solo sulle proprie voci, Commissione e FS su tutte, storico da riconfermare se la nota cambia, nome corretto ovunque, nuovo codice, nessuna nota pubblica.');
