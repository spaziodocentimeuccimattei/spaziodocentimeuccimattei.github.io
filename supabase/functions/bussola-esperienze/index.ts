import {remoteProject as restoreAFM} from './afm-records.mjs';
import {remoteProject as restoreSIA} from './sia-records.mjs';
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.112.4";
import {remoteProject as restoreCat} from './cat-core.mjs';
import {remoteProject as restoreTur} from './turismo-core.mjs';
import {restoreProject} from './ssas-core.mjs';
const admin=createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'',{auth:{persistSession:false,autoRefreshToken:false}});
const origins=new Set(['https://spaziodocentimeuccimattei.github.io','http://127.0.0.1:8766','http://localhost:8766']);
const tokenPattern=/^[A-Za-z0-9_-]{43}$/;
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');}
function headers(req:Request){return {'Access-Control-Allow-Origin':origins.has(req.headers.get('origin')??'')?req.headers.get('origin')!:'null','Access-Control-Allow-Headers':'content-type,x-bussola-token','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store'};}
function reply(req:Request,data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...headers(req),'Content-Type':'application/json; charset=utf-8'}});}
function text(value:unknown,max:number){if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error('Controlla il testo della nota.');return value.trim();}
// Authentication is a 256-bit per-participant capability, validated on EVERY data operation.
// No request may provide an owner ID, a privileged role or another participant's token hash.
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers(req)});
 if(req.method!=='POST')return reply(req,{error:'Metodo non disponibile.'},405);
 const origin=req.headers.get('origin'); if(origin&&!origins.has(origin))return reply(req,{error:'Origine non autorizzata.'},403);
 const token=req.headers.get('x-bussola-token')??'';
 if(!tokenPattern.test(token))return reply(req,{error:'Accesso al progetto non valido.'},401);
 try{
   const body=await req.text(); if(body.length>50000)return reply(req,{error:'Richiesta troppo grande.'},413);
   const p=JSON.parse(body); if(!p||typeof p!=='object'||Array.isArray(p))return reply(req,{error:'Richiesta non valida.'},400);
   const corso=p.corso??'ssas';if(!['ssas','afm','sia','turismo','cat'].includes(corso))return reply(req,{error:'Indirizzo non disponibile.'},400);
   const tokenHash=await hash(token);
   let {data:person,error}=await admin.from('bussola_v2_partecipanti').select('id,expires_at').eq('token_hash',tokenHash).maybeSingle();
   if(error)throw error;
   if(p.action==='start'&&!person){
     const ip=req.headers.get('cf-connecting-ip')??req.headers.get('x-forwarded-for')?.split(',')[0]??'unknown';
     const fingerprint=await hash(`${new Date().toISOString().slice(0,10)}:${ip}:${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`);
     const quota=await admin.rpc('bussola_v2_quota',{p_fingerprint:fingerprint});
     if(quota.error)throw quota.error;
     if(quota.data!==true)return reply(req,{error:'Troppe nuove prove oggi. Riprova più tardi.'},429);
     const created=await admin.from('bussola_v2_partecipanti').upsert({token_hash:tokenHash},{onConflict:'token_hash',ignoreDuplicates:true});
     if(created.error)throw created.error;
     const found=await admin.from('bussola_v2_partecipanti').select('id,expires_at').eq('token_hash',tokenHash).single();
     if(found.error)throw found.error; person=found.data;
   }
   if(!person||new Date(person.expires_at).getTime()<=Date.now())return reply(req,{error:'Questa prova è scaduta. Puoi scaricare il lavoro conservato sul dispositivo e iniziarne una nuova.'},401);
   if(p.action==='start'||p.action==='load'){
     const [project,notes]=await Promise.all([
       admin.from('bussola_v2_progetti').select('payload,revision,updated_at').eq('partecipante_id',person.id).eq('corso',corso).maybeSingle(),
       admin.from('bussola_v2_note').select('id,passaggio,contesto,versione,ruolo_dichiarato,tipo,testo,created_at').eq('partecipante_id',person.id).eq('corso',corso).order('created_at')
     ]);
     if(project.error||notes.error)throw project.error??notes.error;
     return reply(req,{participant:person.id,project:project.data,notes:notes.data??[]});
   }
   if(p.action==='save'){
     if(!p.project||p.project.version!==1||!Number.isInteger(p.revision)||p.revision<0)return reply(req,{error:'Formato del progetto non valido.'},400);
     if(corso==='ssas'&&(p.project.course==='tur'||p.project.course==='cat'||p.project.format))return reply(req,{error:'Il progetto non appartiene a questo indirizzo.'},400);
     const payload=corso==='afm'?restoreAFM(p.project):corso==='sia'?restoreSIA(p.project):corso==='cat'?restoreCat(p.project):corso==='turismo'?restoreTur(p.project):restoreProject(p.project);if(!payload)return reply(req,{error:'Formato del progetto non valido.'},400);
     const saved=await admin.rpc('bussola_v2_salva',{p_partecipante:person.id,p_corso:corso,p_payload:payload,p_revision:p.revision});
     if(saved.error)throw saved.error;
     if(!saved.data)return reply(req,{error:'Il progetto è cambiato in un’altra finestra. Scarica il tuo lavoro prima di ricaricare.'},409);
     return reply(req,{revision:saved.data});
   }
   if(p.action==='note'){
     const n=p.note;
     if(!n||!uuidPattern.test(n.id)||!Number.isInteger(n.passaggio)||n.passaggio<0||n.passaggio>5||n.versione!==1||!['alunno','docente'].includes(n.ruolo_dichiarato)||!['chiarezza','problema','idea','piaciuto'].includes(n.tipo))return reply(req,{error:'Nota non valida.'},400);
     const note={id:n.id,partecipante_id:person.id,corso,passaggio:n.passaggio,contesto:text(n.contesto,240),versione:1,ruolo_dichiarato:n.ruolo_dichiarato,tipo:n.tipo,testo:text(n.testo,2000)};
     if(note.testo.length<2)return reply(req,{error:'Scrivi almeno due caratteri.'},400);
     const inserted=await admin.from('bussola_v2_note').upsert(note,{onConflict:'id',ignoreDuplicates:true});
     if(inserted.error)throw inserted.error;
     const found=await admin.from('bussola_v2_note').select('id,created_at').eq('id',note.id).eq('partecipante_id',person.id).eq('corso',corso).single();
     if(found.error)return reply(req,{error:'Identificativo della nota non disponibile.'},409);
     return reply(req,{note:found.data});
   }
   return reply(req,{error:'Operazione non disponibile.'},400);
 }catch{return reply(req,{error:'Il salvataggio non è disponibile. Il lavoro resta sul dispositivo: riprova.'},503);}
});
