import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {calendarModel,shiftMonth,chronologicalRows,compareAppointments,filterCounts,filterDates,ADMIN_FILTERS,TEACHER_FILTERS} from '../scuole-calendario.mjs';
const schools=JSON.parse(await readFile(new URL('../scuole-orientamento.json',import.meta.url),'utf8'));
const base={start:'2026-10',today:'2026-10-14'};
const appointments=[
 {id:'test-confirmed',scuola_id:schools[0].id,data:'2026-11-04',ora_inizio:'11:00',stato:'confermata',nota:'Nota da preservare'},
 {id:'test-planned',scuola_id:schools[1].id,data:'2026-11-05',stato:'prevista'},
 {id:'test-past',scuola_id:schools[2].id,data:'2026-10-01',stato:'confermata'},
 {id:'test-later',scuola_id:schools[0].id,data:'2027-01-08',stato:'prevista'},
 {id:'test-second',scuola_id:schools[0].id,data:'2026-11-04',ora_inizio:'09:00',stato:'confermata'},
 {id:'test-archived',scuola_id:schools[3].id,data:'2026-11-07',stato:'confermata',archiviata:true},
];
const original=JSON.stringify({schools,appointments});
let model=calendarModel(schools,appointments,base);
assert.equal(model.rows.length,24);
assert.deepEqual(model.months,['2026-10','2026-11','2026-12']);
assert.deepEqual(model.counts,{all:24,bookable:2});
assert.equal(model.rows[0].state,'bookable');
assert.equal(model.rows[1].state,'bookable');
assert.equal(model.rows[2].state,'undated');
assert.equal(model.rows[3].state,'undated');
assert.equal(model.rows[0].cells[1].length,2);
assert.equal(model.rows[0].cells[1][0].ora_inizio,'09:00');
assert.equal(model.rows[0].outside[0].id,'test-later');
assert.equal(model.rows[0].all.find(x=>x.id==='test-confirmed').nota,'Nota da preservare');
assert.equal(JSON.stringify({schools,appointments}),original);
const entries=chronologicalRows(model.rows,model.months);
assert.deepEqual(entries.flatMap(row=>row.all).map(item=>item.id),['test-past','test-second','test-confirmed','test-planned','test-later']);
assert.equal(new Set(entries.map(row=>row.school.id)).size,24);
assert.equal(entries.filter(row=>!row.all.length).length,21);
const bookableEntries=chronologicalRows(model.rows,model.months,true);
assert.deepEqual(bookableEntries.flatMap(row=>row.all).map(item=>item.id),['test-second','test-confirmed','test-planned','test-later']);
assert.equal(new Set(bookableEntries.map(row=>row.school.id)).size,2);
assert.equal(bookableEntries.find(row=>row.all[0].id==='test-later').outside[0].id,'test-later');
assert.equal(chronologicalRows(model.rows,model.months).flatMap(row=>row.all).find(item=>item.id==='test-confirmed').nota,'Nota da preservare');
assert.equal(JSON.stringify({schools,appointments}),original);
assert.ok(compareAppointments({data:'2026-11-26',ora_inizio:'08:50'},{data:'2026-11-26',ora_inizio:'10:10'})<0);
assert.ok(compareAppointments({data:'2026-11-26',ora_inizio:'10:10'},{data:'2026-11-26'})<0);
model=calendarModel(schools,appointments,{...base,start:'2027-01'});
assert.equal(model.rows.length,24);
assert.equal(model.rows[0].cells[0].length,1);
assert.equal(model.rows[0].outside.length,2);
assert.deepEqual(model.counts,{all:24,bookable:2});
model=calendarModel(schools,[],{...base,ready:false});
assert.equal(model.counts.bookable,null);
assert.ok(model.rows.every(x=>x.state==='unknown'));
assert.equal(calendarModel(schools,[],base).counts.bookable,0);
for(const stato of ['confermata','prevista']) assert.equal(calendarModel(schools,[{scuola_id:schools[0].id,data:base.today,stato}],base).counts.bookable,1);
assert.equal(shiftMonth('2026-12',1),'2027-01');
assert.equal(shiftMonth('2027-01',-3),'2026-10');
assert.equal(calendarModel(schools,[{scuola_id:schools[0].id,data:'2026-02-31',stato:'confermata'}],base).counts.bookable,0);
// Gestione: date definite (confermate dalla scuola), da confermare e scuole senza data; i docenti restano con due filtri.
model=calendarModel(schools,appointments,base);
assert.deepEqual(TEACHER_FILTERS.map(([key])=>key),['all','bookable']);
assert.deepEqual(filterCounts(model,ADMIN_FILTERS.map(([key])=>key)),{all:24,bookable:2,confirmed:1,planned:2,undated:22});
assert.deepEqual(chronologicalRows(model.rows.filter(row=>filterDates(row,'confirmed').length),model.months,row=>filterDates(row,'confirmed')).flatMap(row=>row.all).map(item=>item.id),['test-second','test-confirmed']);
const undatedRows=chronologicalRows(model.rows.filter(row=>!row.upcoming.length),model.months,()=>[]);
assert.equal(undatedRows.length,22);assert.ok(undatedRows.every(row=>!row.all.length));
assert.equal(filterCounts(calendarModel(schools,[],{...base,ready:false}),['all','confirmed']).confirmed,null);
assert.equal(JSON.stringify({schools,appointments}),original);
console.log('Calendario scuole: conservazione, 24 scuole, stati, ordine, periodi e dati indisponibili verificati.');
// La nuova apertura non deve mai sovrascrivere una data non ancora salvata.
const managementSource=await readFile(new URL('../gestione.js',import.meta.url),'utf8');
const start=managementSource.indexOf('function openCalendarForm(');
const end=managementSource.indexOf('\ndocument.',start);
const draft=[{value:'2026-10-27'},{value:'Bozza da conservare'}];
const form={querySelectorAll:()=>draft,scrollIntoView:()=>{},elements:{data:{focus:()=>{}}}};
const tools={open:false}, message={textContent:''}, cancel={hidden:true,textContent:''}, schoolSelect={value:'scuola-in-compilazione'};
let editing=0,resetting=0;
const open=new Function('appointmentForm','managementTools','document','appointmentMessage','appointmentCancel','editAppointment','resetAppointmentForm','appointmentSchool','return ('+managementSource.slice(start,end)+');')(form,tools,{querySelector:()=>({click:()=>{}})},message,cancel,()=>editing++,()=>resetting++,schoolSelect);
open({id:'altra-scuola'});
assert.equal(schoolSelect.value,'scuola-in-compilazione');
assert.deepEqual(draft.map(x=>x.value),['2026-10-27','Bozza da conservare']);
assert.equal(editing,0);assert.equal(resetting,0);assert.equal(cancel.hidden,false);
assert.match(message.textContent,/non ancora salvata/);
draft.forEach(x=>x.value='');open({id:'altra-scuola'});
assert.equal(schoolSelect.value,'altra-scuola');assert.equal(resetting,1);
console.log('Bozza calendario: apertura di un’altra scuola protetta senza cancellazioni.');
