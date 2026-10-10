import {completion,certificateSnapshot} from './bussola-records-core.mjs';
import {classCode,isShortCode} from './bussola-codice.mjs';
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORIGINS=new Set(['https://spaziodocentimeuccimattei.github.io','http://127.0.0.1:8766','http://localhost:8766','http://127.0.0.1:8765','http://localhost:8765','http://127.0.0.1:8768','http://localhost:8768']);
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const value=(x,max,min=1)=>{if(typeof x!=='string'||x.trim().length<min||x.length>max||/[\u0000-\u001f<>]/u.test(x))throw fail('Controlla i campi richiesti.');return x.trim().normalize('NFC');};
const id=x=>{if(!UUID.test(x))throw fail('Identificativo non valido.');return x;};
const secret=x=>{if(!TOKEN.test(x))throw fail('Link non valido.',404);return x;};
export async function sha256(x){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x))),b=>b.toString(16).padStart(2,'0')).join('');}
function randomToken(){return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
async function data(query){const r=await query;if(r.error)throw fail('Operazione non disponibile. Riprova.',503);return r.data;}
export function makeHandler(admin){
 return async req=>{
  const origin=req.headers.get('origin'),headers={'Access-Control-Allow-Origin':ORIGINS.has(origin)?origin:'null','Access-Control-Allow-Headers':'content-type,x-orientamento-session,x-bussola-token','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8'};
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(origin&&!ORIGINS.has(origin))return reply({error:'Origine non autorizzata.'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply({error:'Metodo non disponibile.'},405);
  try{
   const raw=await req.text();if(raw.length>80000)throw fail('Richiesta troppo grande.',413);
   let p;try{p=JSON.parse(raw);}catch{throw fail('Richiesta non valida.');}
   if(!p||typeof p!=='object'||Array.isArray(p))throw fail('Richiesta non valida.');
   const publicActions=['class_info','identity','enroll'];
   let participant=null;
   if(publicActions.includes(p.action)){
    const classInfo=async()=>{
     const code=classCode(p.classe);if(!code)throw fail('Controlla il codice della classe.',404);
     if(isShortCode(code)){
      const address=(req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'rete-condivisa').split(',')[0].trim();
      const quota=await admin.rpc('bussola_v2_quota_ingresso',{p_fingerprint:await sha256('bussola-ingresso:'+address)});
      if(quota.error)throw fail('Ingresso non disponibile. Riprova.',503);
      if(quota.data!==true)throw fail('Troppi tentativi. Riprova più tardi.',429);
     }
     const c=await data(admin.from('bussola_v2_classi').select('*').eq(isShortCode(code)?'codice_breve':'codice',code).eq('attiva',true).maybeSingle());
     if(!c)throw fail('Il codice non è disponibile. Controllalo con il docente.',404);return c;
    };
    if(p.action==='class_info'){
     const c=await classInfo();return reply({classe:{scuola:c.scuola,comune:c.comune,classe:c.classe,anno:c.anno,modalita:c.modalita}});
    }
    const token=req.headers.get('x-bussola-token')??'';if(!TOKEN.test(token))throw fail('Apri prima il tuo percorso.',401);
    participant=await data(admin.from('bussola_v2_partecipanti').select('id,expires_at').eq('token_hash',await sha256(token)).gt('expires_at',new Date().toISOString()).maybeSingle());
    if(!participant)throw fail('L’accesso al tuo percorso non è disponibile.',401);
    if(p.action==='identity'){
     const a=await data(admin.from('bussola_v2_alunni').select('id,classe_id,nome,cognome,verificato').eq('partecipante_id',participant.id).maybeSingle());
     if(!a)return reply({alunno:null});const c=await data(admin.from('bussola_v2_classi').select('scuola,comune,classe,anno,codice,codice_breve').eq('id',a.classe_id).single());return reply({alunno:a,classe:c});
    }
    const c=await classInfo();let code=null,nome='',cognome='';
    if(c.modalita==='elenco'){
     code=secret(p.accesso);if(code!==token)throw fail('Apri il tuo link individuale per entrare.',403);
    }else{nome=value(p.nome,80);cognome=value(p.cognome,80);code=token;}
    const enrolled=await admin.rpc('bussola_v2_iscrivi',{p_partecipante:participant.id,p_classe:c.id,p_nome:nome,p_cognome:cognome,p_codice:code});
    if(enrolled.error)throw fail('Il lavoro è già associato oppure il link non è più disponibile. Chiedi al docente di controllare.',409);
    return reply({alunno:enrolled.data,classe:{scuola:c.scuola,comune:c.comune,classe:c.classe,anno:c.anno}});
   }
   // Ordinary protected-area session: the role is looked up on every request.
   // A declared pupil/teacher role, a UUID or a frontend flag grants no access.
   const session=req.headers.get('x-orientamento-session')??'';
   if(session.length<32||session.length>128)throw fail('Accedi alla gestione riservata.',401);
   const auth=await data(admin.from('orientamento_sessioni').select('access_level').eq('token_hash',await sha256(session)).gt('expires_at',new Date().toISOString()).maybeSingle());
   if(!auth)throw fail('La sessione è scaduta. Accedi di nuovo.',401);
   if(auth.access_level!=='funzione_strumentale')throw fail('Questa sezione è riservata alla Funzione Strumentale.',403);
   if(p.action==='classes')return reply({classi:await data(admin.from('bussola_v2_classi').select('*').order('scuola').order('classe'))});
   if(p.action==='create_class'){
    const row={id:id(p.id),scuola:value(p.scuola,140,2),comune:value(p.comune,80,2),classe:value(p.classe,20).toUpperCase(),anno:value(p.anno,9),modalita:p.modalita,codice:secret(p.codice)};
    if(!/^20\d{2}\/20\d{2}$/.test(row.anno)||Number(row.anno.slice(5))!==Number(row.anno.slice(0,4))+1||!['nomi','elenco'].includes(row.modalita))throw fail('Controlla anno scolastico e modalità.');
    for(let attempt=0;attempt<3;attempt++){
     const r=await admin.from('bussola_v2_classi').insert(row).select('*').single();
     if(!r.error)return reply({classe:r.data});
     if(r.error.code==='23505'&&r.error.message?.includes('codice_breve'))continue;
     if(r.error.code==='23505')throw fail('La scuola e la classe sono già presenti. Usa la classe esistente.',409);
     throw fail('Classe non salvata. Riprova.',503);
    }
    throw fail('Non riesco a preparare il codice. Riprova.',503);
   }
   const getClass=async()=>{const c=await data(admin.from('bussola_v2_classi').select('*').eq('id',id(p.classe_id)).maybeSingle());if(!c)throw fail('Classe non trovata.',404);return c;};
   if(p.action==='update_class'){
    await getClass();const patch={};
    if(typeof p.attiva==='boolean')patch.attiva=p.attiva;
    else{patch.scuola=value(p.scuola,140,2);patch.comune=value(p.comune,80,2);patch.classe=value(p.classe,20).toUpperCase();patch.anno=value(p.anno,9);if(!/^20\d{2}\/20\d{2}$/.test(patch.anno)||Number(patch.anno.slice(5))!==Number(patch.anno.slice(0,4))+1)throw fail('Controlla l’anno scolastico.');}
    const changed=await admin.from('bussola_v2_classi').update(patch).eq('id',p.classe_id).eq('updated_at',value(p.updated_at,50)).select('*').maybeSingle();
    if(changed.error?.code==='23505')throw fail('Questa scuola e classe sono già presenti.',409);
    if(changed.error)throw fail('Classe non salvata. Riprova.',503);
    if(!changed.data)throw fail('La classe è cambiata. Aggiorna prima di correggerla.',409);
    return reply({classe:changed.data});
   }
   if(p.action==='add_roster'){
    const c=await getClass();if(c.modalita!=='elenco')throw fail('Questa classe usa il link con inserimento del nome.');
    if(!Array.isArray(p.alunni)||p.alunni.length<1||p.alunni.length>100)throw fail('Inserisci da 1 a 100 alunni.');
    const rows=p.alunni.map(x=>({id:id(x.id),classe_id:c.id,nome:value(x.nome,80),cognome:value(x.cognome,80),codice:secret(x.codice),verificato:true}));
    if(new Set(rows.map(x=>x.id)).size!==rows.length||new Set(rows.map(x=>x.codice)).size!==rows.length)throw fail('Gli identificativi devono essere distinti.');
    const r=await admin.from('bussola_v2_alunni').insert(rows).select('*');if(r.error)throw fail('Elenco non salvato. Aggiorna la classe prima di riprovare.',409);return reply({alunni:r.data});
   }
   const corso=p.corso??'ssas';if(!['ssas','afm','sia','turismo','cat'].includes(corso))throw fail('Indirizzo non disponibile.');
   if(p.action==='students'){
    await getClass();const pupils=await data(admin.from('bussola_v2_alunni').select('*').eq('classe_id',p.classe_id).order('cognome').order('nome'));
    const owners=pupils.map(a=>a.partecipante_id).filter(Boolean);
    const projects=owners.length?await data(admin.from('bussola_v2_progetti').select('partecipante_id,corso,payload,revision,updated_at').in('partecipante_id',owners).eq('corso',corso)):[];
    return reply({alunni:pupils.map(a=>{const project=projects.find(x=>x.partecipante_id===a.partecipante_id);return {...a,project:project||null,...completion(project)};})});
   }
   if(p.action==='update_student'){
    const row={nome:value(p.nome,80),cognome:value(p.cognome,80),verificato:p.verificato};if(typeof row.verificato!=='boolean')throw fail('Stato non valido.');
    if(p.classe_id){const c=await data(admin.from('bussola_v2_classi').select('id').eq('id',id(p.classe_id)).maybeSingle());if(!c)throw fail('Classe non disponibile.',404);row.classe_id=c.id;}
    const a=await data(admin.from('bussola_v2_alunni').update(row).eq('id',id(p.id)).eq('updated_at',value(p.updated_at,50)).select('*').maybeSingle());if(!a)throw fail('Il nominativo è cambiato. Aggiorna la classe.',409);return reply({alunno:a});
   }
   if(p.action==='notes'){
    const a=await data(admin.from('bussola_v2_alunni').select('partecipante_id').eq('id',id(p.id)).maybeSingle());if(!a)throw fail('Alunno non trovato.',404);
    const notes=a.partecipante_id?await data(admin.from('bussola_v2_note').select('id,corso,passaggio,contesto,tipo,testo,ruolo_dichiarato,created_at').eq('partecipante_id',a.partecipante_id).eq('corso',corso).order('created_at')):[];return reply({note:notes});
   }
   if(p.action==='history'){
    await getClass();return reply({attestati:await data(admin.from('bussola_v2_attestati').select('*').eq('classe_id',p.classe_id).eq('corso',corso).order('created_at',{ascending:false}))});
   }
   if(p.action==='issue'){
    if(!Array.isArray(p.selezione)||p.selezione.length<1||p.selezione.length>100)throw fail('Seleziona da 1 a 100 percorsi conclusi.');
    const ids=p.selezione.map(x=>id(x.id));if(new Set(ids).size!==ids.length)throw fail('Selezione duplicata.');
    const pupils=await data(admin.from('bussola_v2_alunni').select('*').in('id',ids));if(pupils.length!==ids.length)throw fail('Alcuni alunni non sono disponibili.',409);
    const classes=await data(admin.from('bussola_v2_classi').select('*').in('id',[...new Set(pupils.map(a=>a.classe_id))]));
    const projects=await data(admin.from('bussola_v2_progetti').select('*').in('partecipante_id',pupils.map(a=>a.partecipante_id).filter(Boolean)).eq('corso',corso));
    const docs=[];
    for(const a of pupils){const expected=p.selezione.find(x=>x.id===a.id),project=projects.find(x=>x.partecipante_id===a.partecipante_id),c=classes.find(x=>x.id===a.classe_id);
     if(!a.verificato||!completion(project).completed)throw fail('Verifica i nomi e seleziona solo percorsi conclusi.',409);
     if(expected.revision!==project.revision||expected.updated_at!==a.updated_at)throw fail('Un lavoro o un nominativo è cambiato. Aggiorna prima di generare.',409);
     const snapshot=certificateSnapshot(a,c,project);docs.push({alunno_id:a.id,corso,revision:project.revision,alunno_updated_at:a.updated_at,classe_updated_at:c.updated_at,impronta:await sha256(JSON.stringify(snapshot)),snapshot});
    }
    const issued=await admin.rpc('bussola_v2_emetti',{p_documenti:docs});if(issued.error)throw fail('I dati sono cambiati durante la generazione. Aggiorna e riprova.',409);return reply({attestati:issued.data});
   }
   throw fail('Operazione non disponibile.');
  }catch(e){return reply({error:e.status?e.message:'Operazione non disponibile. Riprova.'},e.status||503);}
 };
}
