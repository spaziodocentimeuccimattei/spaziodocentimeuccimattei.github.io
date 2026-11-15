import assert from 'node:assert/strict';
import {createProject,restore,remoteProject,choose,next,complete,isComplete,costs,LABS} from '../turismo-core.mjs';
import {completion,certificateSnapshot} from '../bussola-records-core.mjs';
import {participantCertificate} from '../bussola-attestato-alunno-core.mjs';
const p=createProject();assert.equal(next(p),false);
for(const [key,value] of [['place','laguna'],['angle','stagioni'],['question','fare'],['welcome','prova'],['plan','crea'],['rain','museo'],['service','entrambi'],['terms','coperto'],['tone','scoperta'],['repair','dati']]){choose(p,key,value);assert(next(p));}
// Riordino novembre 2026: la scelta «Che cosa ti ha incuriosito?» è facoltativa e non blocca la conclusione.
assert.equal(p.interests.length,0);assert(complete(p));assert.equal(p.finished,true);assert(isComplete(p));
p.interests=['territorio','comunicazione'];assert(complete(p));
// Un lavoro salvato prima del riordino: tutte le tappe fatte, nessun interesse, finished=false → ripreso come concluso (e con gli interessi resta concluso).
const vecchio=JSON.parse(JSON.stringify(p));vecchio.interests=[];vecchio.finished=false;
assert.equal(restore(vecchio).finished,true);assert.equal(completion({corso:'turismo',payload:vecchio}).completed,true);assert.equal(completion({corso:'turismo',payload:restore(vecchio)}).completed,true);
assert.equal(restore({...vecchio,interests:['territorio']}).finished,true);assert.deepEqual(restore({...vecchio,interests:['territorio']}).interests,['territorio']);
const incompleto=JSON.parse(JSON.stringify(vecchio));incompleto.done=[0,1,2,3];assert.equal(restore(incompleto).finished,false);assert.equal(completion({corso:'turismo',payload:incompleto}).completed,false);
// Le scelte restano quelle di prima: stessi identificativi, stesse chiavi.
assert.deepEqual(Object.keys(p.choices).sort(),['angle','place','plan','question','rain','repair','service','terms','tone','welcome']);
assert.equal(completion({corso:'turismo',payload:p}).completed,true);assert.equal(completion({corso:'ssas',payload:p}).completed,false);
const forged=structuredClone(p);delete forged.choices.welcome;assert.equal(restore(forged).finished,false);assert.equal(restore({...p,course:'ssas'}),null);
assert.equal(costs('entrambi',12).total,216);assert.equal(costs('lingue',8).each,20);
p.notes=[{text:'Nota fittizia',context:'Prova'}];p.identity={name:'Non nel progetto remoto'};assert.deepEqual(remoteProject(p).notes,[]);assert.equal(remoteProject(p).identity,null);
const a={verificato:true,id:crypto.randomUUID(),nome:'Nome',cognome:'Fittizio'},c={id:crypto.randomUUID(),scuola:'Scuola fittizia',classe:'3TEST'};
const s=certificateSnapshot(a,c,{corso:'turismo',payload:p,revision:1});assert.equal(s.corso,'turismo');assert.equal(s.lavori.length,5);assert.deepEqual(s.laboratori,LABS.map(l=>l.label));
const personal=participantCertificate(p,{identity:{alunno:a,classe:c},id:crypto.randomUUID(),date:new Date().toISOString()});assert.equal(personal.snapshot.nome,'Nome');assert.equal(personal.snapshot.corso,'turismo');
choose(p,'question','tempo');assert(!p.choices.welcome);assert(!p.done.includes(1));assert.equal(completion({corso:'turismo',payload:p}).completed,false);assert.throws(()=>certificateSnapshot(a,c,{payload:p,revision:2}));
console.log('Turismo: avanzamento, revisione, completamento, costi, separazione dei corsi, sanitizzazione e attestati verificati.');
