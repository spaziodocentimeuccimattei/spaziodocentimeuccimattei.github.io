// PostgreSQL WASM + the actual Edge handlers. All records and credentials are fictitious.
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {makeHandler} from '../supabase/functions/bussola-gestione/handler.mjs';
import {tokenHash,passwordHash} from '../supabase/functions/bussola-gestione/monitor-auth.mjs';
import {freshProject,selectCase,CASES,LABS} from '../ssas-situazioni-core.mjs';
import * as AFM from '../afm-core.mjs';
import * as SIA from '../sia-core.mjs';
import * as CAT from '../cat-core.mjs';
import * as TUR from '../turismo-core.mjs';
import {remoteProject as restoreAFM} from '../afm-records.mjs';
import {remoteProject as restoreSIA} from '../sia-records.mjs';
import {restoreProject} from '../supabase/functions/bussola-esperienze/ssas-core.mjs';
import assert from 'node:assert/strict';

export function samples(){
 const c=CASES[1],p=selectCase(freshProject(),c.id),j=p.caseJourney;
 Object.assign(j.health,{title:'Partecipare alla mostra',explanation:c.explanations[0]});Object.assign(j.relation,{opening:c.openings[0].id,participation:c.participation[0].id,closing:c.closings[0]});
 Object.assign(j.autonomy,{supports:[c.supports[0].id],adaptation:c.adaptations[0].id});Object.assign(j.creative,{goal:c.purposes[0].id,setting:c.formats[0].id,title:'Una mostra accessibile',ending:c.formats[0].improvements[0]});Object.assign(j.service,{activity:c.activities[0].id,access:c.access[0].id,check:c.checks[0].id,name:c.service});Object.assign(j,{done:LABS.map(l=>l.id),step:6,visited:6,finished:true,interests:['relazione']});p.extraFuture={conservare:true};
 const a=AFM.createProject();a.started=true;a.screen=0;for(const [k,v] of [['offer','segno'],['feature','gruppo'],['order',a.choices.order],['obstacle','dividi'],['quantity',20],['payment','anticipo'],['agreement','prova'],['amendment','separata'],['tone','storia'],['response','gruppo']]){if(k==='response')AFM.choose(a,'question','uso');AFM.choose(a,k,v);AFM.advance(a);}a.interests=['idee'];
 const s=SIA.createProject();s.started=true;s.screen=0;SIA.processRun(s);SIA.advance(s);s.process.handoff='completa';SIA.handoffRun(s);SIA.advance(s);s.data.fields=['status','day','price'];SIA.advance(s);s.data.merged=true;s.data.missingDay='Lunedì';s.data.searched=true;SIA.advance(s);s.program.blocks=['leggi','controlla','rispondi'];SIA.advance(s);SIA.runProgram(s,'libero');SIA.runProgram(s,'pieno');SIA.advance(s);s.ui.title='Le mie immagini';s.ui.button='Prenota qui';SIA.advance(s);SIA.runUI(s,'foto',2);SIA.runUI(s,'animazione',2);SIA.advance(s);s.access.permissions.cliente.edit=false;SIA.advance(s);SIA.runAccess(s,'cliente',0);SIA.runAccess(s,'accoglienza',22);SIA.advance(s);
 const t=TUR.createProject();t.started=true;for(const [k,v] of [['place','laguna'],['angle','stagioni'],['question','fare'],['welcome','prova'],['plan','crea'],['rain','museo'],['service','entrambi'],['terms','coperto'],['tone','scoperta'],['repair','dati']]){TUR.choose(t,k,v);TUR.next(t);}t.interests=['territorio'];TUR.complete(t);
 const cat=CAT.createProject();cat.started=true;cat.screen=0;cat.survey.measures=['larghezza','profondita','ingresso'];cat.survey.views=['pianta','sezione'];CAT.composeSurvey(cat);CAT.place(cat,'suono',1,1);CAT.place(cat,'video',3,1);CAT.place(cat,'montaggio',2,2);CAT.testLayout(cat);cat.build.roof='opaca';cat.build.floor='compatto';CAT.testWeather(cat,'sole');CAT.testWeather(cat,'pioggia');cat.heritage.observations=['frammenti','misura','mancante'];cat.heritage.hypothesis='arco';CAT.compareHeritage(cat);cat.plan.phase='suolo';CAT.testPlan(cat,'base');CAT.testPlan(cat,'budget');for(let i=0;i<10;i++)CAT.advance(cat);
 return {ssas:p,afm:a,sia:s,cat,turismo:t};
}
const ident=key=>{if(!/^[a-z_][a-z0-9_]*$/.test(key))throw new Error('Unsafe fixture identifier');return '"'+key+'"';};
export async function isolatedBussola(){
 const db=new PGlite();await db.waitReady;
 await db.exec("create role anon;create role authenticated;create role service_role bypassrls;create table public.orientamento_sessioni(token_hash text primary key,expires_at timestamptz not null,access_level text not null);alter table public.orientamento_sessioni enable row level security;grant select,insert,delete on public.orientamento_sessioni to service_role;");
 for(const file of ['bussola-esperienze-v2.sql','bussola-classi-attestati.sql','bussola-codice-classe.sql'])await db.exec(await readFile(new URL('../supabase/sql/'+file,import.meta.url),'utf8'));
 const legacy=crypto.randomUUID(),legacyClass=crypto.randomUUID();
 await db.query('insert into bussola_v2_partecipanti(id,token_hash) values($1,$2)',[legacy,'f'.repeat(64)]);
 await db.query('insert into bussola_v2_progetti(partecipante_id,corso,payload) values($1,\'ssas\',$2)',[legacy,JSON.stringify({version:1,legacy:{unknown:'da conservare'},labJourney:{done:[]}})]);
 await db.query('insert into bussola_v2_classi(id,scuola,comune,classe,anno,modalita,codice) values($1,\'Scuola precedente fittizia\',\'Comune fittizio\',\'3OLD\',\'2026/2027\',\'nomi\',$2)',[legacyClass,'L'.repeat(43)]);
 const legacyBefore=(await db.query('select * from bussola_v2_progetti where partecipante_id=$1',[legacy])).rows;
 const classBefore=(await db.query('select * from bussola_v2_classi where id=$1',[legacyClass])).rows[0];
 await db.exec(await readFile(new URL('../supabase/sql/bussola-monitoraggio.sql',import.meta.url),'utf8'));
 assert.deepEqual((await db.query('select * from bussola_v2_progetti where partecipante_id=$1',[legacy])).rows,legacyBefore,'la migrazione non riscrive i progetti precedenti');
 const classAfter=(await db.query('select * from bussola_v2_classi where id=$1',[legacyClass])).rows[0];delete classAfter.prova;assert.deepEqual(classAfter,classBefore,'codici, ID e date della classe conservati');
 assert.equal((await db.query('select count(*) as n from bussola_v2_revisioni')).rows[0].n,0,'nessuno storico inventato per i lavori precedenti');
 await db.query('delete from bussola_v2_progetti where partecipante_id=$1',[legacy]);await db.query('delete from bussola_v2_partecipanti where id=$1',[legacy]);await db.query('delete from bussola_v2_classi where id=$1',[legacyClass]);
 const log=[];
 class Query{
  constructor(table){this.table=table;this.filters=[];this.orders=[];this.mode='select';this.columns='*';this.values=[];this.offset=0;this.count=null;this.onConflict=null;}
  select(columns='*'){this.columns=columns;return this;}
  param(v,key=''){this.values.push(v&&typeof v==='object'&&!Array.isArray(v)?JSON.stringify(v):v);const n='$'+this.values.length;return n+(['payload','snapshot'].includes(key)?'::jsonb':Array.isArray(v)?(key==='corsi'?'::text[]':'::uuid[]'):'');}
  eq(k,v){this.filters.push(`${ident(k)}=${this.param(v,k)}`);return this;}
  gt(k,v){this.filters.push(`${ident(k)}>${this.param(v,k)}`);return this;}
  lt(k,v){this.filters.push(`${ident(k)}<${this.param(v,k)}`);return this;}
  in(k,v){this.filters.push(`${ident(k)}=any(${this.param(v,k)})`);return this;}
  not(k,op,v){if(op!=='in')throw new Error('Unexpected fixture operator');this.filters.push(`not (${ident(k)}=any(${this.param(v.slice(1,-1).split(','),k)}))`);return this;}
  order(k,{ascending=true}={}){this.orders.push(`${ident(k)} ${ascending?'asc':'desc'}`);return this;}
  range(from,to){this.offset=from;this.count=to-from+1;return this;}
  limit(n){this.count=n;return this;}
  insert(value){this.mode='insert';this.row=value;return this;}
  upsert(value,{onConflict,ignoreDuplicates}={}){this.mode='insert';this.row=value;this.onConflict={columns:onConflict,ignore:ignoreDuplicates};return this;}
  update(value){this.mode='update';this.row=value;return this;}
  delete(){this.mode='delete';return this;}
  async result(single=false){
   try{
    const cols=this.columns==='*'?'*':this.columns.split(',').map(ident).join(','),table='public.'+ident(this.table);let sql;
    if(this.mode==='select')sql=`select ${cols} from ${table}`;
    if(this.mode==='insert'){const keys=Object.keys(this.row);sql=`insert into ${table} (${keys.map(ident)}) values (${keys.map(k=>this.param(this.row[k],k))})`;if(this.onConflict)sql+=` on conflict (${ident(this.onConflict.columns)}) do nothing`;}
    if(this.mode==='update')sql=`update ${table} set ${Object.entries(this.row).map(([k,v])=>`${ident(k)}=${this.param(v,k)}`).join(',')}`;
    if(this.mode==='delete')sql=`delete from ${table}`;
    if(this.filters.length)sql+=' where '+this.filters.join(' and ');
    if(this.mode!=='select')sql+=' returning '+cols;
    else{if(this.orders.length)sql+=' order by '+this.orders.join(',');if(this.count!==null)sql+=' limit '+this.count;if(this.offset)sql+=' offset '+this.offset;}
    const r=await db.query(sql,this.values);log.push({table:this.table,operation:this.mode});return {data:single?r.rows[0]||null:r.rows,error:null};
   }catch(error){return {data:null,error};}
  }
  maybeSingle(){return this.result(true);}single(){return this.result(true);}then(resolve,reject){return this.result().then(resolve,reject);}
 }
 const admin={from:table=>new Query(table),rpc:async(name,args)=>{
  if(name==='verifica_orientamento_accesso')return {data:args.p_password==='ANTEPRIMA'?'funzione_strumentale':args.p_password==='ORIENTATORE'?'orientatore':null,error:null};
  try{const values=Object.values(args).map(x=>x&&typeof x==='object'?JSON.stringify(x):x),sql=`select public.${ident(name)}(${Object.keys(args).map((k,i)=>`${ident(k)}=>$${i+1}`).join(',')}) as value`,r=await db.query(sql,values);return {data:r.rows[0].value,error:null};}catch(error){return {data:null,error};}
 }};
 const ids={classA:crypto.randomUUID(),classB:crypto.randomUUID(),classTest:crypto.randomUUID(),teacherA:crypto.randomUUID(),teacherB:crypto.randomUUID()},projects=samples(),people=[];
 for(const [id,name,prova] of [[ids.classA,'3A',false],[ids.classB,'3B',false],[ids.classTest,'DOC',true]])await admin.from('bussola_v2_classi').insert({id,scuola:'Scuola di prova',comune:'Comune fittizio',classe:name,anno:'2026/2027',modalita:'nomi',codice:crypto.randomUUID().replaceAll('-','')+'A'.repeat(11),prova});
 for(let i=0;i<4;i++){
  const token=String.fromCharCode(65+i).repeat(43),id=crypto.randomUUID(),classe=i===0?ids.classA:i===1?ids.classB:i===2?null:ids.classTest;people.push({id,token,classe});
  await admin.from('bussola_v2_partecipanti').insert({id,token_hash:await tokenHash(token),expires_at:new Date(Date.now()+86400000*30).toISOString()});
  if(classe)await admin.from('bussola_v2_alunni').insert({id:crypto.randomUUID(),classe_id:classe,nome:'Alunno '+(i+1),cognome:'Fittizio',partecipante_id:id,verificato:true});
  for(const [corso,value] of Object.entries(projects)){const payload=structuredClone(value);if(i===1&&corso==='ssas'){payload.caseJourney.done=['salute'];payload.caseJourney.finished=false;payload.caseJourney.step=2;payload.caseJourney.visited=2;}
   await admin.from('bussola_v2_progetti').insert({partecipante_id:id,corso,payload,revision:1});}
 }
 for(const [id,accesso,nome,corsi,classi] of [[ids.teacherA,'collega.ssas','Collega SSAS',['ssas'],[ids.classA]],[ids.teacherB,'collega.turismo','Collega Turismo',['turismo'],[ids.classB]]]){const salt='S'.repeat(43);await admin.from('bussola_v2_docenti').insert({id,accesso,nome,corsi,classi,salt,password_hash:await passwordHash('PROVA-docente-2026',salt)});}
 await db.exec('set role service_role');
 const handler=makeHandler(admin);
 let experiences;
 const source=await readFile(new URL('../supabase/functions/bussola-esperienze/index.ts',import.meta.url),'utf8');
 vm.runInNewContext(stripTypeScriptTypes(source.replace(/^import .*;\n/gm,'')),{createClient:()=>admin,restoreAFM,restoreSIA,restoreCat:CAT.remoteProject,restoreTur:TUR.remoteProject,restoreProject,Deno:{env:{get:()=>''},serve:fn=>{experiences=fn;}},Request,Response,crypto,TextEncoder,Uint8Array,console,btoa,Date,setTimeout,clearTimeout});
 const call=async(action,payload={},token='',participant='')=>{const response=await handler(new Request('http://127.0.0.1:8765/__test/bussola-gestione',{method:'POST',headers:{Origin:'http://127.0.0.1:8765','Content-Type':'application/json',...(token?{'x-orientamento-session':token}:{}),...(participant?{'x-bussola-token':participant}:{})},body:JSON.stringify({action,...payload})}));return {status:response.status,body:await response.json()};};
 return {db,admin,handler,experiences,call,ids,people,projects,log};
}
