import assert from 'node:assert/strict';
import {createProject,restore,remoteProject,choose,next,complete,costs,LABS} from '../turismo-core.mjs';
import {completion,certificateSnapshot} from '../bussola-records-core.mjs';
import {participantCertificate} from '../bussola-attestato-alunno-core.mjs';
const p=createProject();assert.equal(next(p),false);
for(const [key,value] of [['place','laguna'],['angle','stagioni'],['question','fare'],['welcome','prova'],['plan','crea'],['rain','museo'],['service','entrambi'],['terms','coperto'],['tone','scoperta'],['repair','dati']]){choose(p,key,value);assert(next(p));}
assert.equal(complete(p),false);p.interests=['territorio','comunicazione'];assert(complete(p));
assert.equal(completion({corso:'turismo',payload:p}).completed,true);assert.equal(completion({corso:'ssas',payload:p}).completed,false);
const forged=structuredClone(p);delete forged.choices.welcome;assert.equal(restore(forged).finished,false);assert.equal(restore({...p,course:'ssas'}),null);
assert.equal(costs('entrambi',12).total,216);assert.equal(costs('lingue',8).each,20);
p.notes=[{text:'Nota fittizia',context:'Prova'}];p.identity={name:'Non nel progetto remoto'};assert.deepEqual(remoteProject(p).notes,[]);assert.equal(remoteProject(p).identity,null);
const a={verificato:true,id:crypto.randomUUID(),nome:'Nome',cognome:'Fittizio'},c={id:crypto.randomUUID(),scuola:'Scuola fittizia',classe:'3TEST'};
const s=certificateSnapshot(a,c,{corso:'turismo',payload:p,revision:1});assert.equal(s.corso,'turismo');assert.equal(s.lavori.length,5);assert.deepEqual(s.laboratori,LABS.map(l=>l.label));
const personal=participantCertificate(p,{identity:{alunno:a,classe:c},id:crypto.randomUUID(),date:new Date().toISOString()});assert.equal(personal.snapshot.nome,'Nome');assert.equal(personal.snapshot.corso,'turismo');
choose(p,'question','tempo');assert(!p.choices.welcome);assert(!p.done.includes(1));assert.equal(completion({corso:'turismo',payload:p}).completed,false);assert.throws(()=>certificateSnapshot(a,c,{payload:p,revision:2}));
console.log('Turismo: avanzamento, revisione, completamento, costi, separazione dei corsi, sanitizzazione e attestati verificati.');
