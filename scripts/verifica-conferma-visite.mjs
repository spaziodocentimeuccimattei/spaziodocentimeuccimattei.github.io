import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {realpathSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {webcrypto} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

// Esegue il vero handler Edge con un archivio in memoria e senza accesso alla rete.
export async function isolatedOrientation({now = '2026-10-16T12:00:00Z', seed = {}} = {}) {
  const source = await readFile(new URL('../supabase/functions/orientamento/index.ts', import.meta.url), 'utf8');
  const schools = JSON.parse(await readFile(new URL('../scuole-orientamento.json', import.meta.url), 'utf8'));
  const tables = new Map(Object.entries({
    orientamento_scuole: schools.map(s => ({...s, attiva:true})),
    orientamento_appuntamenti: [], orientamento_attivita: [], orientamento_disponibilita: [],
    orientamento_proposte: [], orientamento_sessioni: [], orientamento_documenti: [], ...seed,
  }));
  let instant = now;
  let failWrites = false;
  class Clock extends Date {
    constructor(...args) {super(...(args.length ? args : [instant]));}
    static now() {return Date.parse(instant);}
  }
  class Query {
    constructor(table) {this.table=table; this.filters=[]; this.operation='select';}
    select() {return this;}
    eq(k,v) {this.filters.push(r=>r[k]===v); return this;}
    gt(k,v) {this.filters.push(r=>r[k]>v); return this;}
    lt(k,v) {this.filters.push(r=>r[k]<v); return this;}
    lte(k,v) {this.filters.push(r=>r[k]<=v); return this;}
    order() {return this;}
    limit() {return this;}
    insert(fields) {this.operation='insert'; this.fields=fields; return this;}
    update(fields) {this.operation='update'; this.fields=fields; return this;}
    delete() {this.operation='delete'; return this;}
    result(single=false) {
      if(failWrites && this.operation!=='select') return {data:null,error:{message:'isolated database failure'}};
      const records=tables.get(this.table);
      assert.ok(records, `Unexpected table ${this.table}`);
      let rows=records.filter(r=>this.filters.every(fn=>fn(r)));
      if(this.operation==='insert') {
        const defaults=this.table==='orientamento_attivita'?{stato:'da_confermare',archiviata:false}:{};
        const row={id:webcrypto.randomUUID(),created_at:instant,...defaults,...structuredClone(this.fields)};
        records.push(row); rows=[row];
      } else if(this.operation==='update') rows.forEach(r=>Object.assign(r,structuredClone(this.fields)));
      else if(this.operation==='delete') tables.set(this.table,records.filter(r=>!rows.includes(r)));
      return {data:single?structuredClone(rows[0]??null):structuredClone(rows),error:null};
    }
    maybeSingle() {return Promise.resolve(this.result(true));}
    single() {return this.maybeSingle();}
    then(resolve,reject) {return Promise.resolve(this.result()).then(resolve,reject);}
  }
  const client={
    from:table=>new Query(table),
    rpc:async(name,args)=>{
      if(name==='orientamento_consuma_quota') return {data:true,error:null};
      assert.equal(name,'verifica_orientamento_accesso');
      const roles={ANTEPRIMA:'funzione_strumentale',SUPPORTER:'supporter',ORIENTATORE:'orientatore'};
      return {data:roles[args.p_password]??null,error:null};
    },
  };
  let handler;
  vm.runInNewContext(stripTypeScriptTypes(source.replace(/^import .*;\n/gm,'')),{
    createClient:()=>client,Deno:{env:{get:()=>''},serve:fn=>{handler=fn;}},
    Request,Response,crypto:webcrypto,TextEncoder,Uint8Array,URL,console,btoa,Date:Clock,
    fetch:()=>{throw new Error('Network access is forbidden in this test');},
  });
  const call=async(action,payload={},token='')=>{
    const response=await handler(new Request('http://127.0.0.1:8765/functions/v1/orientamento',{
      method:'POST',headers:{'Content-Type':'application/json',Origin:'http://127.0.0.1:8765',...(token?{'x-orientamento-session':token}:{})},
      body:JSON.stringify({action,...payload}),
    }));
    return {status:response.status,body:await response.json()};
  };
  return {handler,call,tables,setNow:value=>{instant=value;},failWrites:value=>{failWrites=value;}};
}

async function verify() {
  const env=await isolatedOrientation();
  const {call,tables}=env;
  const sessions={};
  for(const password of ['ANTEPRIMA','SUPPORTER','ORIENTATORE']) {
    const result=await call('login',{password});
    assert.equal(result.status,200);
    sessions[password]=result.body.token;
  }
  const fs=sessions.ANTEPRIMA;
  const visit={nome:'Docente',cognome:'Esempio',tipo:'visita',scuola_id:'sanluri-calasanzio',data:'2026-10-14',nota:'Prova isolata'};
  const publicReport=await call('report_activity',{...visit,stato:'confermata',access_level:'funzione_strumentale'});
  assert.equal(publicReport.status,201);
  const reported=tables.get('orientamento_attivita')[0];
  assert.equal(reported.stato,'da_confermare');
  assert.equal((await call('overview')).body.totali.scuole_visitate,0);
  const initialList=await call('list_contributions',{},fs);
  assert.equal(initialList.body.da_confermare.length,1);
  assert.equal(initialList.body.attivita.length,0);
  for(const token of ['', 'invalid-token-that-is-long-enough-for-validation',sessions.SUPPORTER,sessions.ORIENTATORE]) {
    const expected=token===sessions.SUPPORTER||token===sessions.ORIENTATORE?403:401;
    for(const action of ['confirm_activity','register_activity','update_activity','archive_activity']) {
      assert.equal((await call(action,{...visit,id:reported.id,stato:'confermata'},token)).status,expected);
    }
  }
  assert.equal(reported.stato,'da_confermare');
  const future=await call('register_activity',{...visit,data:'2026-10-17',stato:'confermata'},fs);
  assert.equal(future.status,201);
  assert.equal(tables.get('orientamento_attivita')[1].stato,'da_confermare');
  assert.equal((await call('confirm_activity',{id:future.body.id},fs)).status,400);
  assert.equal((await call('report_activity',{...visit,data:'2026-10-17'})).status,400);
  assert.equal((await call('confirm_activity',{id:reported.id},fs)).status,200);
  assert.equal((await call('overview')).body.totali.scuole_visitate,1);
  assert.equal((await call('confirm_activity',{id:reported.id},fs)).status,400);
  assert.equal((await call('update_activity',{...visit,id:reported.id,scuola_id:'decimoputzu-gramsci'},fs)).status,200);
  assert.equal(reported.stato,'da_confermare');
  assert.equal(reported.id,initialList.body.da_confermare[0].id);
  assert.equal((await call('overview')).body.totali.scuole_visitate,0);
  const rowsBefore=JSON.stringify(tables.get('orientamento_attivita'));
  env.failWrites(true);
  assert.equal((await call('confirm_activity',{id:reported.id},fs)).status,500);
  env.failWrites(false);
  assert.equal(JSON.stringify(tables.get('orientamento_attivita')),rowsBefore);
  // Due giorni dopo, il passare del tempo da solo non conferma alcuna visita.
  env.setNow('2026-10-18T12:00:00Z');
  assert.equal((await call('overview')).body.totali.scuole_visitate,0);
  // Nuovo accesso ordinario: le sessioni del 16 ottobre sono scadute.
  const nextFs=(await call('login',{password:'ANTEPRIMA'})).body.token;
  assert.equal((await call('confirm_activity',{id:future.body.id},nextFs)).status,200);
  assert.equal((await call('overview')).body.totali.scuole_visitate,1);
  const second=await call('register_activity',{...visit,tipo:'mattinee',titolo:'Laboratorio di prova'},nextFs);
  assert.equal(second.status,201);
  assert.equal((await call('overview')).body.totali.mattinee_svolte,0);
  assert.equal((await call('confirm_activity',{id:second.body.id},nextFs)).status,200);
  assert.equal((await call('overview')).body.totali.mattinee_svolte,1);
  const archived=await call('register_activity',visit,nextFs);
  assert.equal((await call('archive_activity',{id:archived.body.id},nextFs)).status,200);
  assert.equal((await call('confirm_activity',{id:archived.body.id},nextFs)).status,400);
  assert.equal(tables.get('orientamento_attivita').length,4);
  // Il limite temporale segue il giorno italiano anche a cavallo della mezzanotte UTC.
  env.setNow('2026-10-18T22:30:00Z');
  assert.equal((await call('report_activity',{...visit,data:'2026-10-19'})).status,201);
  assert.equal((await call('report_activity',{...visit,data:'2026-10-20'})).status,400);
  console.log('Conferma visite: stati forzati ignorati, ruoli verificati, conferma FS esplicita, nessun automatismo temporale, modifiche da riconfermare, errori e archivi, Mattinée e giorno italiano verificati.');
}

if(process.argv[1] && realpathSync(process.argv[1])===fileURLToPath(import.meta.url)) await verify();
