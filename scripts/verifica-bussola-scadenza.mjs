// Scadenza dei lavori: il file supabase/sql/bussola-scadenza-lavori.sql, provato su PostgreSQL in memoria.
// Dati fittizi. La data usata qui è calcolata dal giorno di oggi: NON è la data ufficiale delle iscrizioni.
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';

let checks = 0;
const eq = (a, b, m) => { assert.deepEqual(a, b, m); checks++; };
const file = await readFile(new URL('../supabase/sql/bussola-scadenza-lavori.sql', import.meta.url), 'utf8');
const SEGNAPOSTO = "'SEGNAPOSTO-DA-CONFERMARE'";
assert.ok(file.includes(SEGNAPOSTO), 'il file contiene il segnaposto visibile in cima'); checks++;
assert.ok(file.indexOf(SEGNAPOSTO) < 3500, 'il parametro sta nelle prime righe'); checks++;

async function nuovoDb() {
  const db = new PGlite(); await db.waitReady;
  await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');
  await db.exec(await readFile(new URL('../supabase/sql/bussola-esperienze-v2.sql', import.meta.url), 'utf8'));
  const ids = {};
  for (const [nome, intervallo] of [['recente', "now()+interval '25 days'"], ['scaduto', "now()-interval '2 days'"], ['lontano', "now()+interval '400 days'"], ['quasi', "now()+interval '1 hour'"]]) {
    ids[nome] = crypto.randomUUID();
    await db.query(`insert into bussola_v2_partecipanti(id,token_hash,expires_at) values($1,$2,${intervallo})`, [ids[nome], (nome[0].charCodeAt(0).toString(16).padStart(2, '0')).repeat(32)]);
  }
  return {db, ids};
}
const scadenze = async db => Object.fromEntries((await db.query('select id,expires_at from bussola_v2_partecipanti')).rows.map(r => [r.id, new Date(r.expires_at).getTime()]));
const giornoIn = giorni => new Date(Date.now() + giorni * 86400000).toISOString().slice(0, 10);

// 1. Il file lasciato com'è si ferma senza cambiare nulla.
{
  const {db, ids} = await nuovoDb(), prima = await scadenze(db);
  await assert.rejects(db.exec(file), /Manca la data di fine iscrizioni/); checks++;
  await db.exec('rollback').catch(() => {});
  eq(await scadenze(db), prima, 'con il segnaposto non cambia nessuna scadenza');
  eq((await db.query("select column_default from information_schema.columns where table_name='bussola_v2_partecipanti' and column_name='expires_at'")).rows[0].column_default.includes('30 days'), true, 'il valore predefinito resta 30 giorni');
}
// 2. Date non accettabili: passato, troppo lontana, formato sbagliato.
for (const data of [giornoIn(-3), giornoIn(0), giornoIn(700), '27/02/2027']) {
  const {db} = await nuovoDb();
  await assert.rejects(db.exec(file.replace(SEGNAPOSTO, `'${data}'`)), /nel passato|Manca la data/); checks++;
  await db.exec('rollback').catch(() => {});
}
// 3. Data valida: esistenti non scaduti allungati, scaduti e già più lunghi invariati, nuovi con la data fissa.
{
  const {db, ids} = await nuovoDb(), prima = await scadenze(db), data = giornoIn(120);
  await db.exec(file.replace(SEGNAPOSTO, `'${data}'`));
  const dopo = await scadenze(db);
  const atteso = new Date((await db.query("select ((($1::date+1)::timestamp) at time zone 'Europe/Rome') as t", [data])).rows[0].t).getTime();
  eq(dopo[ids.recente], atteso, 'il partecipante ancora valido arriva a mezzanotte (ora italiana) alla fine del giorno indicato');
  eq(dopo[ids.quasi], atteso, 'anche chi scadeva fra un\'ora');
  eq(dopo[ids.scaduto], prima[ids.scaduto], 'un lavoro già scaduto NON viene riaperto');
  eq(dopo[ids.lontano], prima[ids.lontano], 'chi aveva già una scadenza più lontana non viene accorciato');
  await db.exec('set role service_role');
  await db.exec("insert into bussola_v2_partecipanti(token_hash) values('" + 'c'.repeat(64) + "')");
  const nuovo = new Date((await db.query("select expires_at from bussola_v2_partecipanti where token_hash=$1", ['c'.repeat(64)])).rows[0].expires_at).getTime();
  eq(nuovo, atteso, 'un partecipante nuovo, creato come fa la funzione (solo token_hash), riceve la data fissa');
  await db.exec('reset role');
  await db.exec('set role anon');
  await assert.rejects(db.query('select public.bussola_v2_scadenza_lavori()'), /permission denied/); checks++;
  await db.exec('reset role');
  // La data si può spostare riesaminando solo il file con un'altra data: chi è già più avanti non retrocede.
  await db.exec(file.replace(SEGNAPOSTO, `'${giornoIn(60)}'`).replace(/^begin;/m, 'begin;'));
  const ancora = await scadenze(db);
  eq(ancora[ids.recente], atteso, 'rieseguire con una data più vicina non accorcia nessuno');
}
// 4. Data molto vicina (meno di 30 giorni): i nuovi partecipanti hanno comunque almeno 30 giorni, come oggi.
{
  const {db} = await nuovoDb();
  await db.exec(file.replace(SEGNAPOSTO, `'${giornoIn(5)}'`));
  await db.exec('set role service_role');
  await db.exec("insert into bussola_v2_partecipanti(token_hash) values('" + 'd'.repeat(64) + "')");
  const giorni = ((await db.query("select expires_at from bussola_v2_partecipanti where token_hash=$1", ['d'.repeat(64)])).rows[0].expires_at - Date.now()) / 86400000;
  assert.ok(giorni > 29.9 && giorni < 30.1, 'almeno 30 giorni'); checks++;
}
// 5. Il questionario e gli attestati non hanno una scadenza propria.
for (const f of ['bussola-monitoraggio.sql', 'bussola-classi-attestati.sql']) {
  const t = await readFile(new URL('../supabase/sql/' + f, import.meta.url), 'utf8');
  const tabelle = t.split(/create table /).slice(1).filter(x => /^public\.bussola_v2_(questionari|attestati|alunni)\b/.test(x));
  assert.ok(tabelle.length > 0 && tabelle.every(x => !/expires_at/.test(x.split(');')[0])), 'nessuna scadenza propria in ' + f); checks++;
}
const fn = await readFile(new URL('../bussola-questionario-remote.mjs', import.meta.url), 'utf8');
assert.ok(!/expires|scad|30\s*giorni/i.test(fn), 'il client del questionario non calcola scadenze'); checks++;
console.log(JSON.stringify({status: 'superato', checks, scope: 'Scadenza dei lavori: segnaposto che ferma il file, date non accettabili, allungamento solo per i non scaduti, nessun accorciamento, valore predefinito per i nuovi, minimo 30 giorni, questionario senza scadenza propria'}, null, 1));
