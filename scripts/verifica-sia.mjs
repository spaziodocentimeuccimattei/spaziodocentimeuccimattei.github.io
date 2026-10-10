import assert from 'node:assert/strict';
import * as c from '../sia-core.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;},ok=a=>{assert.ok(a);checks++;};
const p=c.createProject();eq(p.course,'sia');ok(!c.completed(p));eq(c.ready(p,0),false);p.started=true;p.identity={demo:true};
eq(c.advance(p),false);p.screen=0;const bad=c.processRun(p);ok(bad.warning);ok(c.ready(p));eq(c.advance(p),true);eq(p.screen,1);
c.move(p.process.order,'risorse',-1);c.invalidate(p,0);ok(!c.ready(p,0));const good=c.processRun(p);eq(good.warning,false);eq(p.process.runs.length,2);p.screen=0;c.advance(p);
p.process.handoff='completa';c.invalidate(p,0);ok(p.done.includes(0));ok(!c.ready(p,1));c.handoffRun(p);ok(c.ready(p,1));p.screen=1;c.advance(p);eq(p.screen,2);
p.data.fields=['status','day','price'];c.invalidate(p,1);ok(c.ready(p,2));c.advance(p);eq(c.records(p).length,5);eq(c.query(p).count,1);eq(c.query(p).total,18);ok(!c.ready(p,3));
p.data.merged=true;p.data.missingDay='Lunedì';p.data.searched=true;eq(c.records(p).length,4);eq(c.query(p).count,1);p.data.filter='Lunedì';eq(c.query(p).count,2);eq(c.query(p).total,35);p.data.missingDay='Venerdì';eq(c.query(p).count,1);p.data.filter='Venerdì';eq(c.query(p).count,2);eq(c.query(p).total,33);
p.data.fields=['status','day'];eq(c.query(p).total,null);p.data.fields=['price'];eq(c.query(p).known,false);p.data.fields=['status','day','price'];ok(c.ready(p,3));c.advance(p);eq(p.screen,4);
p.program.blocks=['leggi','controlla','rispondi'];eq(c.ready(p,4),true);c.advance(p);const yes=c.runProgram(p,'libero'),no=c.runProgram(p,'pieno');eq(yes.output,'conferma');eq(yes.remaining,1);eq(no.output,'attesa');eq(no.remaining,0);ok(c.ready(p,5));
const last=c.runProgram(p,'ultimo');eq(last.remaining,0);eq(last.output,'conferma');p.program.condition='piu';c.invalidate(p,2);eq(c.ready(p,5),false);eq(c.runProgram(p,'ultimo').output,'attesa');eq(p.program.runs.length,4);c.runProgram(p,'libero');c.runProgram(p,'pieno');ok(c.ready(p,5));
p.program.no='conferma';c.invalidate(p,2);const over=c.runProgram(p,'pieno');eq(over.remaining,-1);ok(over.problem);ok(over.trace.some(t=>t.label==='Una conferma senza posto'));
p.program.no='attesa';p.program.condition='almeno';c.invalidate(p,2);c.runProgram(p,'libero');c.runProgram(p,'pieno');ok(c.ready(p,5));c.advance(p);eq(p.screen,6);
p.ui.title='Le mie immagini';p.ui.button='Prenota qui';ok(c.ready(p,6));c.advance(p);eq(p.screen,7);eq(c.runUI(p,'foto',2).output,'attesa');eq(c.runUI(p,'animazione',2).remaining,0);ok(c.ready(p,7));
p.program.condition='piu';c.invalidate(p,2);eq(c.ready(p,7),false);ok(c.ready(p,5));p.program.yes='attesa';c.invalidate(p,2);ok(!p.done.includes(5));c.runProgram(p,'libero');c.runProgram(p,'pieno');p.screen=5;c.advance(p);p.screen=7;eq(c.runUI(p,'foto',1).output,'attesa');c.advance(p);eq(p.screen,8);
p.access.permissions.cliente.edit=false;c.invalidate(p,4);ok(c.ready(p,8));c.advance(p);const blocked=c.runAccess(p,'cliente',0),allowed=c.runAccess(p,'accoglienza',22);eq(blocked.allowed,false);eq(blocked.after,18);eq(allowed.allowed,true);eq(allowed.after,22);ok(c.ready(p,9));c.advance(p);eq(p.screen,10);ok(c.completed(p));
p.access.permissions.cliente.edit=true;c.invalidate(p,4);eq(c.ready(p,9),false);eq(c.completed(p),false);eq(c.runAccess(p,'cliente',0).after,0);c.runAccess(p,'accoglienza',22);p.screen=9;c.advance(p);ok(c.completed(p));
eq(c.runAccess(p,'anonimo',22),null);eq(c.runAccess(p,'cliente',-1),null);eq(c.runAccess(p,'cliente',NaN),null);eq(c.runAccess(p,'cliente',101),null);
p.screen=3;const n1=c.addNote(p,{text:'Test dati',role:'alunno',kind:'chiarezza'});p.screen=5;const n2=c.addNote(p,{text:'Test programma',role:'docente',kind:'idea'});eq(n1.lab,'dati');eq(n2.lab,'programma');ok(n1.id!==n2.id);eq(n2.role,'docente');eq(c.addNote(p,{text:' '}),null);eq(p.notes.length,2);
p.unknownFuture={preserved:true};p.data.future='da conservare';const restored=JSON.parse(JSON.stringify(p));ok(c.validProject(restored));eq(restored.notes.length,2);eq(restored.unknownFuture,{preserved:true});eq(restored.data.future,'da conservare');eq(c.validProject({...restored,course:'afm'}),false);
// Every permutation executes the student's order, rather than a hidden canonical program.
for(const order of [['leggi','controlla','rispondi'],['leggi','rispondi','controlla'],['controlla','leggi','rispondi'],['controlla','rispondi','leggi'],['rispondi','leggi','controlla'],['rispondi','controlla','leggi']]){const x=c.createProject();x.program.blocks=order;const r=c.execute(x,{available:2,requested:1});eq(r.problem,order.join(',')!=='leggi,controlla,rispondi');}
console.log(`${checks} asserzioni superate: modelli, esecuzione, dipendenze, archivio, permessi, note e conservazione.`);
