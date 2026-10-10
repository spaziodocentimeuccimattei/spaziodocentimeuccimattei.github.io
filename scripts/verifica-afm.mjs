import assert from 'node:assert/strict';
import {createProject,choose,advance,moveTask,addNote,ready,completed,validProject,economics,cashflow,posterTitle} from '../afm-core.mjs';
let checks=0;const check=(condition)=>{assert.ok(condition);checks++;};
let p=createProject();p.screen=0;check(!advance(p));choose(p,'offer','segno');check(advance(p));check(p.screen===1);check(!advance(p));choose(p,'feature','gruppo');check(advance(p));check(p.screen===2);moveTask(p,'cliente',1);check(p.choices.order.join(',')==='risorse,cliente,riepilogo');moveTask(p,'risorse',-1);check(p.choices.order.join(',')==='risorse,cliente,riepilogo');check(advance(p));choose(p,'obstacle','dividi');check(advance(p));check(advance(p));check(p.screen===5);check(!advance(p));choose(p,'payment','anticipo');check(advance(p));choose(p,'agreement','prova');check(advance(p));choose(p,'amendment','separata');check(advance(p));choose(p,'tone','storia');check(advance(p));choose(p,'question','uso');check(!advance(p));choose(p,'response','gruppo');check(advance(p));check(completed(p)&&p.finished&&p.screen===10);
// Baseline numerico verificato indipendentemente: 20*15 - (60+20*7) = 100.
let m=economics(p);assert.deepEqual([m.revenue,m.cost,m.difference,m.withoutAgreement],[300,200,100,-120]);checks++;
let cash=cashflow(p);assert.deepEqual([cash.deposit,cash.todayBalance,cash.laterRevenue,cash.finalBalance],[180,60,120,180]);checks++;
choose(p,'payment','dopo');cash=cashflow(p);assert.deepEqual([cash.todayBalance,cash.laterRevenue,cash.laterCost,cash.finalBalance],[80,300,200,180]);checks++;
for(const q of [10,20,30])for(const price of [12,15,18]){p.choices.quantity=q;p.choices.price=price;for(const policy of ['anticipo','dopo']){p.choices.payment=policy;cash=cashflow(p);check(cash.todayBalance>=0);check(Math.abs(cash.todayBalance+cash.laterRevenue-cash.laterCost-cash.finalBalance)<1e-8);check(cash.difference===q*(price-7)-60);}}
p.choices.quantity=10;p.choices.price=12;check(economics(p).difference===-10);check(cashflow(p).finalBalance===70);
// Le scelte non determinano un voto. Un risultato economico negativo non blocca l'esplorazione.
check(ready(p,4));
// Note autonome e contesto stabile, senza aggiornare una nota precedente.
p.screen=0;addNote(p,{text:'Prima nota',role:'alunno'},'nota-1');p.screen=5;addNote(p,{text:'Seconda nota',role:'docente'},'nota-2');check(p.notes.length===2&&p.notes[0].screen==='passaggio-1'&&p.notes[1].screen==='passaggio-6');check(p.notes[0].id!==p.notes[1].id);check(p.notes[1].role==='docente');check(!addNote(p,{text:' '}));
// Tornare a un'offerta conserva la variante e il titolo personale.
choose(p,'offer','segno');choose(p,'feature','gruppo');p.choices.headline='Il titolo di Alex';choose(p,'offer','riparti');check(!p.choices.feature&&!p.done.includes(1));check(!completed(p));choose(p,'feature','stile');choose(p,'offer','segno');check(p.choices.feature==='gruppo'&&posterTitle(p)==='Il titolo di Alex');
// Cambiare domanda richiede una risposta coerente; ripristinare la domanda recupera la variante.
choose(p,'question','uso');choose(p,'response','gruppo');choose(p,'question','tempo');check(!ready(p,9));choose(p,'question','uso');check(p.choices.response==='gruppo'&&ready(p,9));
check(validProject(JSON.parse(JSON.stringify(p))));check(!validProject({...p,course:'ssas'}));check(!validProject({...p,choices:{...p.choices,quantity:999}}));check(!validProject({...p,done:[0,0]}));check(!validProject({...p,choices:{...p.choices,order:['cliente','cliente','risorse']}}));
console.log(JSON.stringify({checks,status:'pass',scope:'Stato, conti, pagamenti, note, varianti e recupero; nessun database reale'},null,2));
