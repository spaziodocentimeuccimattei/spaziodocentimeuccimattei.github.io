import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { validateContent, summarize, suggestCourses, freshState, sanitizeState, readState, saveState, clearState, SESSION_KEY, totals } from '../bussola-core.mjs';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=async name=>JSON.parse(await fs.readFile(path.join(root,'data',`${name}.json`),'utf8'));
const [b,d,c,m,contacts]=await Promise.all(['bussola','dimensioni','indirizzi','missioni','contatti'].map(read));
const {situations}=b,{dimensions}=d,{courses}=c,{missions}=m;
const check=validateContent(situations,dimensions,courses,missions);
assert.deepEqual(check.errors,[]);
assert.equal(b.version,3);
for (const file of [d,c,m,contacts]) assert.equal(file.version,2);
assert.equal(new Set(missions.map(m=>m.type)).size,5);

// Invalid, outdated, blocked and unrelated storage must never leak into a new path.
const state=freshState();
state.answers[situations[0].id]=situations[0].options[0].id;
state.answers.fake='not-an-answer'; state.missions.afm={completed:true,arbitrary:'discard'};
const cleaned=sanitizeState(state,situations,missions.map(m=>m.id));
assert.equal(cleaned.answers.fake,undefined);
assert.deepEqual(cleaned.missions.afm,{completed:true});
assert.equal(sanitizeState({...state,version:999},situations),null);
assert.equal(sanitizeState({...state,index:situations.length},situations),null);
assert.equal(sanitizeState({...state,index:-1},situations),null);
assert.equal(sanitizeState({...state,stage:'unexpected'},situations),null);
const memory=new Map([['mattei-orientamento-session','teacher-session']]);
const store={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
saveState(store,state); assert.ok(readState(store,situations)); clearState(store);
assert.equal(memory.get('mattei-orientamento-session'),'teacher-session'); assert.equal(memory.has(SESSION_KEY),false);
store.setItem(SESSION_KEY,'invalid json'); assert.equal(readState(store,situations),null);
const blocked={getItem:()=>{throw Error();},setItem:()=>{throw Error();},removeItem:()=>{throw Error();}};
assert.equal(readState(blocked,situations),null); assert.equal(saveState(blocked,state),false); assert.equal(clearState(blocked),false);
assert.equal(summarize(situations,dimensions,{}).selected.length,0);
assert.equal(summarize(situations,dimensions,{[situations[0].id]:situations[0].options[0].id}).selected.length,0);
assert.equal(summarize(situations,dimensions,Object.fromEntries(situations.map(s=>[s.id,null]))).selected.length,0);
const legacy = {...freshState(), version:2, stage:'results', index:7,
  answers:Object.fromEntries(situations.slice(0,8).map(s=>[s.id,s.options[0].id])), missions:{cat:{completed:true}}};
const migrated = sanitizeState(legacy,situations,missions.map(m=>m.id));
assert.equal(migrated.version,3); assert.equal(migrated.stage,'question'); assert.equal(migrated.index,8);
assert.deepEqual(migrated.answers,legacy.answers); assert.deepEqual(migrated.missions,legacy.missions);
assert.equal(suggestCourses(situations,courses,{}).reason,'few');
assert.equal(suggestCourses(situations,courses,Object.fromEntries(situations.map(s=>[s.id,null]))).selected.length,0);
// A repeated course-specific interest must emerge for every course, including subjects and aspirations.
for (const course of courses) {
  const answers=Object.fromEntries(situations.map(s=>[s.id,s.options.find(o=>o.courseLinks[course.id]?.weight===2)?.id||null]));
  const result=suggestCourses(situations,courses,answers);
  assert.deepEqual(result.selected.map(item=>item.course.id),[course.id]);
  assert.equal(result.reason,'suggested');
  assert.ok(result.selected[0].evidence.some(e=>e.situationId==='materie'));
  assert.ok(result.selected[0].evidence.some(e=>e.situationId==='aspirazioni'));
}
const mixedAnswers=Object.fromEntries(situations.map(s=>[s.id,null]));
for (const [id,course] of [['materie','afm'],['predisposizioni','sia'],['sogni','afm'],['aspirazioni','sia']])
  mixedAnswers[id]=situations.find(s=>s.id===id).options.find(o=>o.courseLinks[course]?.weight===2).id;
assert.deepEqual(suggestCourses(situations,courses,mixedAnswers).selected.map(item=>item.course.id),['afm','sia']);
assert.equal(suggestCourses(situations,courses,mixedAnswers).reason,'tentative');
const budget=missions.find(m=>m.type==='budget');
assert.equal(totals(budget.options,['tastiera','mouse','cuffie'],'cost'),125);
const itinerary=missions.find(m=>m.type==='itinerary');
assert.equal(totals(itinerary.options,['piazza','museo'],'minutes'),50);

// Equal-probability random paths detect structural imbalance; they are not a model of students.
let seed=20261004;
function random() { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }
const paths=Number(process.argv[2]||50000);
assert.ok(Number.isInteger(paths)&&paths>=1000&&paths<=1000000);
const included=Object.fromEntries(dimensions.map(d=>[d.id,0]));
const leading=Object.fromEntries(dimensions.map(d=>[d.id,0]));
const reasons={selected:0,open:0,few:0}; const sizes={}; let topTies=0,cutoffTies=0;
const courseLeading=Object.fromEntries(courses.map(c=>[c.id,0]));
const courseIncluded=Object.fromEntries(courses.map(c=>[c.id,0]));
const courseReasons={few:0,mixed:0,tentative:0,suggested:0};
for (let i=0;i<paths;i++) {
 const answers=Object.fromEntries(situations.map(s=>[s.id,s.options[Math.floor(random()*s.options.length)].id]));
 const result=summarize(situations,dimensions,answers);
 const direction=suggestCourses(situations,courses,answers);
 courseReasons[direction.reason]++;
 const topScore=Math.max(...direction.items.map(item=>item.score));
 const leaders=direction.items.filter(item=>Math.abs(item.score-topScore)<1e-9);
 for (const item of leaders) courseLeading[item.course.id]+=1/leaders.length;
 for (const item of direction.selected) {
   courseIncluded[item.course.id]++;
   assert.ok(item.support>=2);
   for (const evidence of item.evidence) {
     const s=situations.find(s=>s.id===evidence.situationId);
     const option=s.options.find(o=>o.id===answers[s.id]);
     assert.equal(option.text,evidence.action);
     assert.equal(option.courseLinks[item.course.id].weight,2);
     assert.equal(option.courseLinks[item.course.id].reason,evidence.reason);
   }
 }
 reasons[result.reason]++; sizes[result.selected.length]=(sizes[result.selected.length]||0)+1;
 if(result.ranked.length) {
   const top=result.ranked.filter(item=>Math.abs(item.score-result.ranked[0].score)<1e-9);
   if(top.length>1)topTies++;
   for(const item of top)leading[item.id]+=1/top.length;
   if(result.ranked.length>3&&Math.abs(result.ranked[2].score-result.ranked[3].score)<1e-9)cutoffTies++;
 }
 for (const item of result.selected) {
   included[item.id]++;
   assert.ok(item.support>=3&&item.evidence.length>=3&&item.primary>=1);
   assert.ok(item.evidence.every(e=>answers[e.situationId]===situations.find(s=>s.id===e.situationId).options.find(o=>o.text===e.action).id));
 }
 // Editorial display order must not reveal the internal ordering.
 const order=result.selected.map(item=>dimensions.findIndex(d=>d.id===item.id));
 assert.deepEqual(order,[...order].sort((a,b)=>a-b));
}
const pct=value=>Number((value/paths*100).toFixed(2));
const table=dimensions.map(d=>({dimension:d.id,coverage:check.coverage[d.id].length,leadingPct:pct(leading[d.id]),includedPct:pct(included[d.id])}));
const warnings=[];
for (const row of table) {
 if(row.leadingPct<8||row.leadingPct>22) warnings.push(`${row.dimension}: frequenza prevalente fuori dall’intervallo tecnico 8–22%.`);
 if(row.includedPct<20||row.includedPct>65)warnings.push(`${row.dimension}: frequenza in restituzione fuori dall’intervallo tecnico 20–65%.`);
}
const courseTable=courses.map(course=>({course:course.id,leadingPct:pct(courseLeading[course.id]),suggestedPct:pct(courseIncluded[course.id])}));
for (const row of courseTable) if(row.leadingPct<12||row.leadingPct>28) warnings.push(`${row.course}: frequenza prevalente fuori dall’intervallo tecnico 12–28%.`);
const report={date:'2026-10-04',contentVersion:3,seed:20261004,paths,model:'Scelta uniforme e indipendente tra le azioni; non rappresenta le preferenze degli studenti.',normalization:'Pesi centrati e scalati sulle opportunità offerte dalle sole situazioni risposte.',table,reasons,sizes,topTies,cutoffTies,courseTable,courseReasons,courseVisibility: Object.fromEntries(courses.map(c=>[c.id,'Sempre disponibile; indicazioni motivate dalle scelte, nessun punteggio pubblico.'])),warnings,scientificValidation:false};
console.log(JSON.stringify(report,null,2));
if(process.env.BUSSOLA_REPORT) await fs.writeFile(process.env.BUSSOLA_REPORT,JSON.stringify(report,null,2)+'\n');
if(warnings.length)process.exitCode=1;
