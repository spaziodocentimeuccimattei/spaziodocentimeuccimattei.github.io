import assert from 'node:assert/strict';
import {isolatedOrientation} from './verifica-conferma-visite.mjs';

// Correzione dell'elenco delle scuole dalla Gestione (23/11/2026): solo la Funzione Strumentale,
// nessuna cancellazione, date e visite restano legate alla stessa scuola.
const {call, tables} = await isolatedOrientation();
const tokens = {};
for (const password of ['ANTEPRIMA', 'SUPPORTER', 'ORIENTATORE']) tokens[password] = (await call('login', {password})).body.token;
const fs = tokens.ANTEPRIMA;
const school = tables.get('orientamento_scuole')[0];
const before = tables.get('orientamento_scuole').length;

for (const token of ['', 'invalid-token-that-is-long-enough-for-validation', tokens.SUPPORTER, tokens.ORIENTATORE]) {
  const response = await call('save_school', {id: school.id, comune: 'Altro', etichetta: 'Altro nome'}, token);
  assert.equal(response.status, token === tokens.SUPPORTER || token === tokens.ORIENTATORE ? 403 : 401);
}
assert.notEqual(school.comune, 'Altro');

const date = await call('save_appointment', {scuola_id: school.id, tipo: 'aule', data: '2026-12-03', stato: 'prevista'}, fs);
assert.equal(date.status, 201);

const renamed = await call('save_school', {id: school.id, comune: '  Assemini ', etichetta: 'Istituto  Pascoli', area: 'bacino'}, fs);
assert.equal(renamed.status, 200);
assert.equal(school.comune, 'Assemini');
assert.equal(school.etichetta, 'Istituto Pascoli');
assert.equal(school.id, renamed.body.id);

assert.equal((await call('save_school', {comune: 'X', etichetta: 'Scuola'}, fs)).status, 400);
assert.equal((await call('save_school', {id: 'ID NON VALIDO', comune: 'Uta', etichetta: 'Scuola'}, fs)).status, 400);
assert.equal((await call('save_school', {id: 'non-esiste', comune: 'Uta', etichetta: 'Scuola'}, fs)).status, 400);

const added = await call('save_school', {comune: 'Villacidro', etichetta: 'Scuola media «Loru»', area: 'esterno'}, fs);
assert.equal(added.status, 201);
assert.match(added.body.id, /^[a-z0-9-]{3,80}$/);
const newSchool = tables.get('orientamento_scuole').find((row) => row.id === added.body.id);
assert.equal(newSchool.attiva, true);
assert.equal(newSchool.area, 'esterno');
assert.equal(tables.get('orientamento_scuole').length, before + 1);

const hidden = await call('save_school', {id: school.id, comune: school.comune, etichetta: school.etichetta, area: 'bacino', attiva: false}, fs);
assert.equal(hidden.status, 200);
let list = (await call('list_contributions', {}, fs)).body;
assert.ok(!list.scuole.some((row) => row.id === school.id));
assert.ok(list.scuole_tolte.some((row) => row.id === school.id));
assert.ok(!(await call('overview')).body.scuole.some((row) => row.id === school.id));
assert.equal(tables.get('orientamento_appuntamenti').filter((row) => row.scuola_id === school.id).length, 1);

assert.equal((await call('save_school', {id: school.id, comune: school.comune, etichetta: school.etichetta, area: 'bacino', attiva: true}, fs)).status, 200);
list = (await call('list_contributions', {}, fs)).body;
assert.ok(list.scuole.some((row) => row.id === school.id));
assert.equal(tables.get('orientamento_scuole').length, before + 1);

console.log('Correzione scuole: solo FS, nome e comune corretti, nuova scuola, tolta e rimessa senza cancellare date e visite, input non validi respinti.');

// Alunni dell'istituto partecipanti a un incontro: solo FS, mai nella pagina pubblica, conservati se la richiesta non li porta.
{
  const {call, tables} = await isolatedOrientation();
  const fs = (await call('login', {password: 'ANTEPRIMA'})).body.token;
  const commission = (await call('login', {password: 'ORIENTATORE'})).body.token;
  const school = tables.get('orientamento_scuole')[0];
  const base = {scuola_id: school.id, tipo: 'aule', data: '2026-10-10', stato: 'confermata'};
  const saved = await call('save_appointment', {...base, alunni: ['  Mario Rossi 4SA ', 'Mario Rossi 4SA', '', 'Anna Bianchi 3SB']}, fs);
  assert.equal(saved.status, 201);
  const row = tables.get('orientamento_appuntamenti').find((item) => item.id === saved.body.id);
  assert.deepEqual(row.alunni, ['Mario Rossi 4SA', 'Anna Bianchi 3SB']);
  row.archiviata = false; // valore predefinito del database, che l'archivio in memoria non applica
  assert.equal((await call('save_appointment', {...base, id: row.id, luogo: 'Aula magna'}, fs)).status, 200);
  assert.deepEqual(row.alunni, ['Mario Rossi 4SA', 'Anna Bianchi 3SB']);
  assert.equal((await call('save_appointment', {...base, id: row.id, alunni: Array(81).fill('X Y')}, fs)).status, 400);
  assert.equal((await call('save_appointment', {...base, id: row.id, alunni: []}, commission)).status, 403);
  assert.deepEqual(row.alunni, ['Mario Rossi 4SA', 'Anna Bianchi 3SB']);
  assert.ok(!JSON.stringify((await call('overview')).body).includes('Mario Rossi'));
  assert.deepEqual((await call('list_contributions', {}, fs)).body.appuntamenti.find((item) => item.id === row.id).alunni, ['Mario Rossi 4SA', 'Anna Bianchi 3SB']);
  console.log('Alunni partecipanti: salvati e ripuliti, conservati se non inviati, limite 80, solo FS, mai nella pagina pubblica.');
}
