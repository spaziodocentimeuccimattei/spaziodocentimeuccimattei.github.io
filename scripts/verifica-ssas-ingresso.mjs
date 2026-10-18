import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {readEntryState} from '../ssas-situazioni-entry-core.mjs';
import {restoreProject,selectCase,freshProject,FORMAT} from '../ssas-situazioni-core.mjs';

// Exercise the actual entry module with old/absent/remote state: its only action
// must be loading the current interface, without consulting storage or the API.
const source=await readFile(new URL('../ssas-situazioni-entry.mjs',import.meta.url),'utf8');
 const imports=[];
 const entry=new vm.SourceTextModule(source,{context:vm.createContext({}),importModuleDynamically:async specifier=>{
  imports.push(specifier);
  const module=new vm.SyntheticModule([],()=>{});await module.link(()=>{});await module.evaluate();return module;
 }});
 await entry.link(()=>{throw new Error('L’ingresso non deve dipendere dal vecchio percorso.');});
 await entry.evaluate();
 assert.equal(imports.length,1);
 assert.match(imports[0],/^\.\/ssas-situazioni\.mjs\?v=/);

const legacy={project:{version:1,labJourney:{format:'ssas-cinque-laboratori-1',step:4,visited:4,health:{focus:'asma',explanation:'Risposta precedente'},unknown:{keep:true}}},token:'A'.repeat(43),participant:'prova',revision:3,dirty:true,lastOp:'operazione-pendente',notes:[{id:'nota',testo:'Nota precedente',pending:true}],draft:{text:'Bozza nota'}};
const snapshot=JSON.stringify(legacy);
for(const suffix of ['',':alunno:'+('B'.repeat(43)),':prova:vecchio',':alunno:'+('B'.repeat(43))+':prova:vecchio']){
 const key='bussola-ssas-sei-situazioni-v2'+suffix,oldKey=key.replace('sei-situazioni-v2','cinque-laboratori-v1');
 const map=new Map([[oldKey,snapshot],[oldKey+':classe',JSON.stringify({code:'LUNA24'})]]);
 const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const raw=readEntryState(storage,key),project=restoreProject(raw.project);
 assert.equal(project.caseJourney.format,FORMAT);assert.equal(project.caseJourney.step,0);
 assert.deepEqual(project.labJourney,legacy.project.labJourney);
 assert.deepEqual(raw,legacy);assert.equal(map.get(oldKey),snapshot);
 assert.equal(map.get(key+':classe'),map.get(oldKey+':classe'));
 const modern={...legacy,project:selectCase(freshProject(),'infanzia')};
 map.set(key,JSON.stringify(modern));assert.deepEqual(readEntryState(storage,key),modern);
 // Broken/missing current storage must still recover the previous work.
 for(const broken of ['{','null','[]','{}','{"project":[]}']){map.set(key,broken);assert.deepEqual(readEntryState(storage,key),legacy);}
 map.delete(oldKey);map.delete(key);assert.equal(readEntryState(storage,key),null);
}
assert.equal(readEntryState({getItem(){throw new Error('storage blocked');}},'bussola-ssas-sei-situazioni-v2'),null);
// A project returned by the API also uses the new journey, retaining all old fields.
assert.deepEqual(restoreProject(legacy.project).labJourney,legacy.project.labJourney);
assert.equal(JSON.stringify(legacy),snapshot);
console.log('Ingresso sempre attuale; progetti locali, link personali, note pendenti, classe, dati remoti e storage non disponibile verificati.');
