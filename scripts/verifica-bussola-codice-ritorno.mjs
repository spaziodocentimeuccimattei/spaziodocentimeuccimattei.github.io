// Codice breve personale per il ritorno da casa: generazione, unicità, niente collisione con i codici classe,
// limiti di frequenza, riapertura del lavoro, codice sconosciuto o scaduto. Database PostgreSQL in memoria (PGlite)
// e la VERA funzione supabase/functions/bussola-esperienze/index.ts. Dati e codici interamente fittizi. Nessuna rete.
import assert from 'node:assert/strict';
import {isolatedBussola} from './bussola-test-db.mjs';

let checks = 0;
const ok = (valore, messaggio) => { assert.ok(valore, messaggio); checks++; };
const eq = (a, b, messaggio) => { assert.deepEqual(a, b, messaggio); checks++; };
const ORIGINE = 'http://127.0.0.1:8766';
const PERSONALE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

const env = await isolatedBussola();
const {db, admin, experiences, people, projects} = env;
const chiama = async (azione, extra = {}, {token = '', rete = '10.0.0.1'} = {}) => {
  const r = await experiences(new Request(ORIGINE + '/__test/bussola-esperienze', {method: 'POST',
    headers: {Origin: ORIGINE, 'Content-Type': 'application/json', 'x-forwarded-for': rete, ...(token ? {'x-bussola-token': token} : {})},
    body: JSON.stringify({action: azione, corso: 'afm', ...extra})}));
  return {stato: r.status, corpo: await r.json()};
};
const sql = async (testo, parametri = []) => (await db.query(testo, parametri)).rows;

// ---- 1. Generazione: formato, alfabeto, distribuzione ----------------------------------------------------
const campione = [];
for (let i = 0; i < 400; i++) campione.push(...(await sql('select public.bussola_v2_nuovo_codice_ritorno() as c')).map(r => r.c));
ok(campione.every(c => PERSONALE.test(c)), 'sei caratteri, solo alfabeto leggibile');
ok(campione.every(c => !/[01OIL]/.test(c)), 'mai 0, O, 1, I, L');
const conteggio = new Map();
for (const c of campione.join('')) conteggio.set(c, (conteggio.get(c) || 0) + 1);
eq(conteggio.size, 31, 'tutti i 31 simboli compaiono');
const atteso = campione.length * 6 / 31;
ok([...conteggio.values()].every(n => n > atteso * 0.6 && n < atteso * 1.4), 'distribuzione senza distorsioni evidenti');
ok(new Set(campione).size > 395, 'codici diversi tra loro (400 estratti, nessuna ripetizione sistematica)');

// ---- 2. Il codice corrisponde al partecipante, non al nome ------------------------------------------------
const [p0, p1, p2] = people;
const a = await chiama('codice_ottieni', {}, {token: p0.token});
eq(a.stato, 200, 'codice_ottieni risponde');
ok(PERSONALE.test(a.corpo.codice), 'il codice ha il formato personale');
const a2 = await chiama('codice_ottieni', {}, {token: p0.token});
eq(a2.corpo.codice, a.corpo.codice, 'lo stesso partecipante riceve sempre lo stesso codice');
const b = await chiama('codice_ottieni', {}, {token: p1.token});
ok(b.corpo.codice !== a.corpo.codice, 'partecipanti diversi, codici diversi');
// Due partecipanti con lo stesso nome (omonimi) hanno comunque codici diversi: il nome non entra nel codice.
eq((await sql('select count(*)::int as n from bussola_v2_codici_ritorno'))[0].n, 2, 'una riga per partecipante');
const senzaToken = await chiama('codice_ottieni');
eq(senzaToken.stato, 401, 'senza token non si ottiene alcun codice');
eq((await chiama('codice_ottieni', {}, {token: 'Z'.repeat(43)})).stato, 401, 'token sconosciuto: nessun codice');
eq((await chiama('load', {}, {})).stato, 401, 'le altre azioni senza token restano 401');
eq((await chiama('save', {project: {}, revision: 0}, {})).stato, 401, 'anche save senza token resta 401');
ok(!JSON.stringify(await sql('select * from bussola_v2_codici_ritorno')).match(/Alunno|Fittizio/), 'nel database del codice non compare nessun nome');

// ---- 3. Unicità e controllo incrociato con le classi ------------------------------------------------------
await assert.rejects(db.query('insert into bussola_v2_codici_ritorno(partecipante_id,codice) values($1,$2)', [p2.id, a.corpo.codice]), /unique|duplicate/i);
checks++;
const idClasse = crypto.randomUUID();
const codiceDaScontro = a.corpo.codice;
const inserimento = await admin.from('bussola_v2_classi').insert({id: idClasse, scuola: 'Scuola di prova', comune: 'Comune fittizio', classe: '3COLL', anno: '2026/2027', modalita: 'nomi', codice: 'K'.repeat(43), codice_breve: codiceDaScontro});
ok(inserimento.error, 'una classe NON può avere il codice breve già assegnato a un partecipante');
eq(inserimento.error.code, '23505', 'errore di tipo «valore già presente»');
ok(inserimento.error.message.includes('codice_breve'), 'il messaggio contiene «codice_breve»: la creazione classi del server lo riprova da sola');
// Una classe con un codice senza L che poi non esiste fra quelli personali si crea normalmente.
const libero = 'ZZZZZ9';
const classeOk = await admin.from('bussola_v2_classi').insert({id: idClasse, scuola: 'Scuola di prova', comune: 'Comune fittizio', classe: '3COLL', anno: '2026/2027', modalita: 'nomi', codice: 'K'.repeat(43), codice_breve: libero});
eq(classeOk.error, null, 'una classe con un codice libero si crea');
// Un partecipante non può ricevere un codice uguale a quello di quella classe.
await assert.rejects(db.query('insert into bussola_v2_codici_ritorno(partecipante_id,codice) values($1,$2)', [p2.id, libero]), /coincide|23505|unique/i);
checks++;
// Cambiare il codice breve di una classe esistente con uno personale è vietato.
const cambio = await admin.from('bussola_v2_classi').update({codice_breve: codiceDaScontro}).eq('id', idClasse);
ok(cambio.error && cambio.error.code === '23505', 'nemmeno un aggiornamento può creare una collisione');
eq((await sql('select count(*)::int as n from bussola_v2_classi where codice_breve=$1', [codiceDaScontro]))[0].n, 0, 'nessuna classe con il codice personale');

// ---- 4. Riprova del generatore: se il codice estratto è già di una classe, ne estrae un altro --------------
await db.exec('reset role');
const originale = (await sql("select pg_get_functiondef('public.bussola_v2_nuovo_codice_ritorno()'::regprocedure) as d"))[0].d;
await db.exec(`create table prova_coda(n serial primary key, c text);insert into prova_coda(c) values('ZZZZZ9'),('ZZZZZ9'),('QQQQQ7');
 create or replace function public.bussola_v2_nuovo_codice_ritorno() returns text language plpgsql volatile security definer set search_path='' as $f$
 declare r text; begin select c into r from public.prova_coda order by n limit 1; delete from public.prova_coda where n=(select min(n) from public.prova_coda); return r; end $f$;`);
await db.exec('set role service_role');
const rip = await chiama('codice_ottieni', {}, {token: p2.token});
eq(rip.corpo.codice, 'QQQQQ7', 'due estrazioni scartate perché coincidevano con una classe, la terza è buona');
await db.exec('reset role');
await db.exec('drop table prova_coda cascade;');
await db.exec(originale);
await db.exec('set role service_role');

// ---- 5. Riapertura del lavoro con il codice ---------------------------------------------------------------
const aperto = await chiama('codice_apri', {codice: a.corpo.codice}, {rete: '10.0.1.1'});
eq(aperto.stato, 200, 'il codice riapre il lavoro, senza token');
eq(aperto.corpo.projects.map(x => x.corso).sort(), ['afm', 'cat', 'sia', 'ssas', 'turismo'], 'tutti e cinque i lavori del partecipante');
eq(aperto.corpo.projects.find(x => x.corso === 'afm').payload.screen, projects.afm.screen, 'il lavoro è quello salvato');
ok(!/Alunno|Fittizio/.test(JSON.stringify(aperto.corpo)), 'nessun nome di alunno nella risposta (il nome non è sul server per chi entra senza classe; per chi è in classe non viene restituito)');
eq((await chiama('codice_apri', {codice: ' ' + a.corpo.codice.slice(0, 3).toLowerCase() + '-' + a.corpo.codice.slice(3).toLowerCase() + ' '}, {rete: '10.0.1.2'})).stato, 200, 'minuscole, spazi e trattino sono tollerati');
const altro = await chiama('codice_apri', {codice: b.corpo.codice}, {rete: '10.0.1.3'});
ok(JSON.stringify(altro.corpo.projects) !== JSON.stringify(aperto.corpo.projects) || altro.corpo.participant !== aperto.corpo.participant, 'un altro codice apre un altro partecipante');
eq(altro.corpo.participant, p1.id, 'il codice del secondo partecipante apre il secondo');

// ---- 6. Codice sconosciuto, malformato, scaduto -----------------------------------------------------------
const MSG = 'Il codice non è valido o non è più disponibile.';
const sconosciuto = await chiama('codice_apri', {codice: 'ZZZZZ8'}, {rete: '10.0.2.1'});
eq([sconosciuto.stato, sconosciuto.corpo.error], [404, MSG], 'codice sconosciuto: 404');
const prima = (await sql('select coalesce(sum(tentativi),0)::int as n from bussola_v2_tentativi_codice'))[0].n;
for (const brutto of ['', 'ABC', 'ABCDEFG', 'ABCDE0', 'ABCDEL', 'ABCDEI', 12345, null, {}]) {
  const r = await chiama('codice_apri', {codice: brutto}, {rete: '10.0.2.2'});
  eq([r.stato, r.corpo.error], [404, MSG], 'formato errato: stessa risposta, nessun dettaglio');
}
eq((await sql('select coalesce(sum(tentativi),0)::int as n from bussola_v2_tentativi_codice'))[0].n, prima, 'un codice di formato errato non può esistere e non consuma tentativi');
await db.query("update bussola_v2_partecipanti set expires_at=now()-interval '1 minute' where id=$1", [p1.id]);
const scaduto = await chiama('codice_apri', {codice: b.corpo.codice}, {rete: '10.0.2.3'});
eq([scaduto.stato, scaduto.corpo.error], [404, MSG], 'partecipante scaduto: stessa risposta del codice sconosciuto');
eq((await chiama('codice_ottieni', {}, {token: p1.token})).stato, 401, 'partecipante scaduto: nessun nuovo codice');
await db.query("update bussola_v2_partecipanti set expires_at=now()+interval '30 days' where id=$1", [p1.id]);

// ---- 7. Limiti di frequenza -------------------------------------------------------------------------------
await db.query('delete from bussola_v2_tentativi_codice');
const reteCattiva = '203.0.113.9';
const esiti = [];
for (let i = 0; i < 12; i++) esiti.push((await chiama('codice_apri', {codice: 'ZZZZZ8'}, {rete: reteCattiva})).stato);
eq(esiti, [404, 404, 404, 404, 404, 404, 404, 404, 404, 404, 429, 429], 'dieci tentativi per rete ogni 15 minuti, poi 429');
eq((await chiama('codice_apri', {codice: a.corpo.codice}, {rete: reteCattiva})).stato, 429, 'bloccata la rete, anche con un codice giusto');
eq((await chiama('codice_apri', {codice: a.corpo.codice}, {rete: '198.51.100.7'})).stato, 200, 'un\'altra rete non è bloccata');
// Limite totale: 120 tentativi in 15 minuti da reti diverse.
await db.query('delete from bussola_v2_tentativi_codice');
let stato429 = 0, ultimo = 0;
for (let i = 0; i < 125; i++) { ultimo = (await chiama('codice_apri', {codice: 'ZZZZZ8'}, {rete: `192.0.2.${i}`})).stato; if (ultimo === 429) stato429++; }
eq(stato429, 5, 'oltre 120 tentativi totali in 15 minuti scatta il limite globale (gli ultimi 5 dei 125)');
eq((await chiama('codice_apri', {codice: a.corpo.codice}, {rete: '192.0.2.250'})).stato, 429, 'con il limite globale scattato anche un codice giusto aspetta');
await db.query('delete from bussola_v2_tentativi_codice');
// Pulizia automatica delle righe vecchie.
await db.exec('reset role');
await db.exec("insert into bussola_v2_tentativi_codice(fingerprint,finestra) values('vecchia',now()-interval '3 days')");
await db.exec('set role service_role');
await chiama('codice_apri', {codice: 'ZZZZZ8'}, {rete: '10.9.9.9'});
eq((await sql("select count(*)::int as n from bussola_v2_tentativi_codice where fingerprint='vecchia'"))[0].n, 0, 'le finestre di oltre un giorno si cancellano');

// ---- 8. Permessi e cancellazione --------------------------------------------------------------------------
await db.exec('reset role');
for (const ruolo of ['anon', 'authenticated']) {
  await db.exec(`set role ${ruolo}`);
  await assert.rejects(db.query('select * from public.bussola_v2_codici_ritorno'), /permission denied/); checks++;
  await assert.rejects(db.query('select public.bussola_v2_codice_ritorno($1)', [p0.id]), /permission denied/); checks++;
  await db.exec('reset role');
}
const nuovo = crypto.randomUUID();
await db.query('insert into bussola_v2_partecipanti(id,token_hash) values($1,$2)', [nuovo, 'e'.repeat(64)]);
ok(PERSONALE.test((await sql('select public.bussola_v2_codice_ritorno($1) as c', [nuovo]))[0].c), 'codice per un partecipante nuovo');
await db.query('delete from bussola_v2_partecipanti where id=$1', [nuovo]);
eq((await sql('select count(*)::int as n from bussola_v2_codici_ritorno where partecipante_id=$1', [nuovo]))[0].n, 0, 'cancellando il partecipante sparisce il suo codice');
await db.exec('set role service_role');

console.log(JSON.stringify({status: 'superato', checks, scope: 'Codice breve personale: generazione, unicità, collisioni con i codici classe (in entrambe le direzioni), riprova, riapertura, codice sconosciuto/malformato/scaduto, limiti per rete e globale, permessi, cancellazione'}, null, 1));
