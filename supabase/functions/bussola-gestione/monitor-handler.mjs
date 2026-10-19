import {teacherSession,tokenHash,randomToken,passwordHash,equalHash} from './monitor-auth.mjs';
import questions from './questionario-data.json' with {type:'json'};
import {classCode,isShortCode} from './bussola-codice.mjs';
const COURSES=['ssas','afm','sia','turismo','cat'];
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const bad=(text,status=400)=>Object.assign(new Error(text),{status});
const text=(value,max,min=1)=>{if(typeof value!=='string'||value.trim().length<min||value.length>max)throw bad('Controlla i campi richiesti.');return value.trim().normalize('NFC');};
const uuid=value=>{if(!UUID.test(value||''))throw bad('Identificativo non valido.');return value;};
async function data(query){const r=await query;if(r.error)throw bad('Operazione non disponibile. Riprova.',503);return r.data;}
async function all(query){const rows=[];for(let i=0;i<20;i++){const batch=await data(query().range(i*250,i*250+249));rows.push(...batch);if(batch.length<250)return rows;}throw bad('Restringi la ricerca a una scuola o classe.',413);}
const safeClass=c=>({id:c.id,scuola:c.scuola,comune:c.comune,classe:c.classe,anno:c.anno,prova:c.prova,attiva:c.attiva,codice_breve:c.codice_breve});
const safeTeacher=d=>({id:d.id,nome:d.nome,accesso:d.accesso,corsi:d.corsi,classi:d.classi,attivo:d.attivo,updated_at:d.updated_at});

// All operations in this file are reached through the existing CORS/body/error wrapper.
// Classes, courses and ownership come from the live session on EVERY request.
export async function monitorAction(admin,req,p){
 if(p.action==='questionnaire_load'||p.action==='questionnaire_save'){
  const token=req.headers.get('x-bussola-token')||'';
  if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw bad('Apri prima il tuo percorso.',401);
  const person=await data(admin.from('bussola_v2_partecipanti').select('id').eq('token_hash',await tokenHash(token)).gt('expires_at',new Date().toISOString()).maybeSingle());
  if(!person)throw bad('Accesso al percorso scaduto.',401);
  if(p.action==='questionnaire_load')return {questionnaire:await data(admin.from('bussola_v2_questionari').select('payload,revision,updated_at').eq('partecipante_id',person.id).maybeSingle())};
  const s=p.state;
  if(!s||s.version!==3||!['question','results'].includes(s.stage)||!Number.isInteger(s.index)||s.index<0||s.index>=questions.situations.length||!s.answers||typeof s.answers!=='object'||Array.isArray(s.answers)||!Number.isInteger(p.revision)||p.revision<0)throw bad('Risposte non valide.');
  const answers={};
  for(const [key,value] of Object.entries(s.answers)){
   const q=questions.situations.find(q=>q.id===key);
   if(!q||(value!==null&&!q.options.some(o=>o.id===value)))throw bad('Risposta non disponibile.');answers[key]=value;
  }
  if(s.stage==='results'&&Object.keys(answers).length!==questions.situations.length)throw bad('Completa o salta le domande prima del risultato.');
  const payload={version:3,stage:s.stage,index:s.index,answers,_operation:uuid(p.operation)};
  const revision=await data(admin.rpc('bussola_v2_salva_questionario',{p_partecipante:person.id,p_payload:payload,p_revision:p.revision}));
  if(!revision)throw bad('Le risposte sono cambiate in un’altra finestra. La copia locale è conservata.',409);
  return {revision};
 }
 if(p.action==='monitor_login'){
  const address=(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'rete-condivisa').split(',')[0].trim();
  if(!await data(admin.rpc('bussola_v2_quota_docente',{p_fingerprint:await tokenHash('bussola-docenti:'+address)})))throw bad('Troppi tentativi. Riprova fra 15 minuti.',429);
  const password=typeof p.password==='string'?p.password:'';
  if(!password||password.length>200)throw bad('Accesso non riuscito.',401);
  const accesso=typeof p.accesso==='string'?p.accesso.trim().toLowerCase():'';
  const token=randomToken(),hash=await tokenHash(token),expires=new Date(Date.now()+6*3600000).toISOString();
  if(!accesso){
   const level=await data(admin.rpc('verifica_orientamento_accesso',{p_password:password}));
   if(!['funzione_strumentale','orientatore'].includes(level))throw bad('Usa la password della Funzione Strumentale o della Commissione Orientamento.',401);
   await data(admin.from('orientamento_sessioni').insert({token_hash:hash,expires_at:expires,access_level:level}));
  }else{
   if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(accesso))throw bad('Accesso non riuscito.',401);
   const d=await data(admin.from('bussola_v2_docenti').select('*').eq('accesso',accesso).eq('attivo',true).maybeSingle());
   // The same bounded KDF runs for an unknown name; no password/hash is returned or logged.
   const candidate=await passwordHash(password,d?.salt||'x'.repeat(43));
   if(!d||!equalHash(candidate,d.password_hash))throw bad('Accesso non riuscito.',401);
   await data(admin.from('bussola_v2_sessioni_docenti').delete().lt('expires_at',new Date().toISOString()));
   await data(admin.from('bussola_v2_sessioni_docenti').insert({token_hash:hash,docente_id:d.id,auth_version:d.auth_version,expires_at:expires}));
  }
  return {token,expires_at:expires};
 }
 const session=await teacherSession(admin,req.headers.get('x-orientamento-session'));
 if(!session)throw bad('Accedi di nuovo all’area docenti.',401);
 const requireAdmin=()=>{if(!session.admin)throw bad('Operazione riservata alla Funzione Strumentale.',403);};
 const course=p.corso||'ssas';
 if(![...COURSES,'bussola'].includes(course))throw bad('Indirizzo non disponibile.');
 if(!session.admin&&!['monitor_session','monitor_logout'].includes(p.action)&&course!=='bussola'&&!session.courses.includes(course))throw bad('Indirizzo non assegnato.',403);
 const classRows=await all(()=>{let q=admin.from('bussola_v2_classi').select('*').order('scuola').order('classe');return session.admin?q:q.in('id',session.classes.length?session.classes:['00000000-0000-4000-8000-000000000000']);});
 if(p.action==='monitor_session')return {admin:session.admin,commissione:session.shared===true,nome:session.name,corsi:session.courses,classi:classRows.map(safeClass),expires_at:session.expires_at};
 if(p.action==='monitor_logout'){
  await data(admin.from(session.admin||session.shared?'orientamento_sessioni':'bussola_v2_sessioni_docenti').delete().eq('token_hash',session.hash));return {ok:true};
 }
 if(p.action==='monitor_staff'){
  requireAdmin();return {docenti:(await data(admin.from('bussola_v2_docenti').select('id,nome,accesso,corsi,classi,attivo,updated_at').order('nome'))).map(safeTeacher)};
 }
 if(p.action==='monitor_save_staff'){
  requireAdmin();const corsi=p.corsi,classi=p.classi;
  if(!Array.isArray(corsi)||!corsi.length||corsi.length>5||new Set(corsi).size!==corsi.length||corsi.some(c=>!COURSES.includes(c))||!Array.isArray(classi)||classi.length>100||new Set(classi).size!==classi.length||classi.some(c=>!classRows.some(x=>x.id===c)))throw bad('Controlla indirizzi e classi assegnati.');
  const accesso=text(p.accesso,40,3).toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(accesso))throw bad('Usa da 3 a 40 lettere, numeri, punti o trattini per l’accesso.');
  const row={nome:text(p.nome,100,2),accesso,corsi,classi,attivo:p.attivo===true};
  const password=typeof p.password==='string'?p.password:'';
  if(password||!p.id){if(password.length<12||password.length>128)throw bad('La password deve avere da 12 a 128 caratteri.');row.salt=randomToken();row.password_hash=await passwordHash(password,row.salt);row.auth_version=crypto.randomUUID();}
  let q;if(p.id)q=admin.from('bussola_v2_docenti').update(row).eq('id',uuid(p.id)).eq('updated_at',text(p.updated_at,50));else q=admin.from('bussola_v2_docenti').insert(row);
  const reply=await q.select('id,nome,accesso,corsi,classi,attivo,updated_at').maybeSingle();
  if(reply.error?.code==='23505')throw bad('Questo nome di accesso è già in uso.',409);
  if(reply.error)throw bad('Accesso non salvato. Riprova.',503);
  if(!reply.data)throw bad('L’accesso è cambiato. Aggiorna la pagina.',409);
  return {docente:safeTeacher(reply.data)};
 }
 if(p.action==='monitor_open_class'){
  if(!session.shared)throw bad('Questa operazione è riservata alla Commissione.',403);
  const address=(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'rete-condivisa').split(',')[0].trim();
  if(!await data(admin.rpc('bussola_v2_quota_docente',{p_fingerprint:await tokenHash('apri-classe:'+address)})))throw bad('Troppi tentativi. Riprova fra 15 minuti.',429);
  const code=classCode(p.codice);if(!isShortCode(code))throw bad('Controlla il codice di sei caratteri della classe.',400);
  const found=await data(admin.rpc('bussola_v2_classe_commissione',{p_sessione:session.hash,p_codice:code,p_crea:null}));
  if(!found)throw bad('Codice non disponibile. Controllalo oppure chiedilo alla Funzione Strumentale.',404);
  return {classe:safeClass(found)};
 }
 if(p.action==='monitor_create_class'){
  if(course==='bussola')throw bad('Scegli un indirizzo per creare la classe.');
  const row={id:crypto.randomUUID(),codice:randomToken(),scuola:text(p.scuola,140,2),comune:text(p.comune,80,2),classe:text(p.classe,20).toUpperCase(),anno:text(p.anno,9),modalita:'nomi',prova:p.prova===true};
  if(!/^20\d{2}\/20\d{2}$/.test(row.anno)||Number(row.anno.slice(5))!==Number(row.anno.slice(0,4))+1)throw bad('Controlla l’anno scolastico.');
  const r=session.shared?await admin.rpc('bussola_v2_classe_commissione',{p_sessione:session.hash,p_codice:null,p_crea:row}):await admin.from('bussola_v2_classi').insert(row).select('*').single();
  if(r.error?.code==='23505')throw bad('La classe esiste già. Aprila con il codice oppure chiedilo alla Funzione Strumentale.',409);
  if(r.error)throw bad('Classe non creata. Riprova.',503);
  if(!session.admin&&!session.shared&&!await data(admin.rpc('bussola_v2_assegna_classe',{p_docente:session.id,p_classe:r.data.id})))throw bad('Classe creata; chiedi alla Funzione Strumentale di verificare l’assegnazione.',409);
  return {classe:safeClass(r.data)};
 }
 if(p.action==='monitor_feedback'){
  const id=uuid(p.id),row={id,docente_id:session.id||null,sessione_hash:session.shared?session.hash:null,corso:course,contesto:text(p.contesto,160),testo:text(p.testo,2000,2)};
  const found=await data(admin.from('bussola_v2_segnalazioni_docenti').select('id,docente_id,sessione_hash,corso,contesto,testo').eq('id',id).maybeSingle());
  if(found){if(found.docente_id!==row.docente_id||found.sessione_hash!==row.sessione_hash||found.corso!==row.corso||found.contesto!==row.contesto||found.testo!==row.testo)throw bad('Questa segnalazione è già registrata. Scrivi una nuova segnalazione per aggiungere altro.',409);return {ok:true};}
  await data(admin.from('bussola_v2_segnalazioni_docenti').insert(row));return {ok:true};
 }
 if(p.action==='monitor_feedback_list'){
  let q=admin.from('bussola_v2_segnalazioni_docenti').select('id,docente_id,corso,contesto,testo,created_at').order('created_at',{ascending:false}).limit(100);
  if(session.shared)q=q.eq('sessione_hash',session.hash);else if(!session.admin)q=q.eq('docente_id',session.id);
  return {segnalazioni:await data(q)};
 }
 const selected=p.classe_id||'';
 if(selected==='senza-classe'&&!session.admin)throw bad('Questa vista è riservata alla Funzione Strumentale.',403);
 if(selected&&selected!=='senza-classe'&&!classRows.some(c=>c.id===selected))throw bad('Classe non disponibile.',403);
 const scopedClasses=classRows.filter(c=>(!selected||selected==='senza-classe'||c.id===selected)&&(!p.scuola||c.scuola+' · '+c.comune===p.scuola)&&(p.prove===true||!c.prova));
 const rosterScope=!session.admin||Boolean(p.scuola)||Boolean(selected&&selected!=='senza-classe');
 const pupils=selected==='senza-classe'||!rosterScope?
  []:await all(()=>admin.from('bussola_v2_alunni').select('id,classe_id,nome,cognome,partecipante_id,verificato').in('classe_id',scopedClasses.length?scopedClasses.map(c=>c.id):['00000000-0000-4000-8000-000000000000']).order('cognome').order('nome'));
 async function owned(participant){
  uuid(participant);
  const a=await data(admin.from('bussola_v2_alunni').select('id,classe_id,nome,cognome,partecipante_id,verificato').eq('partecipante_id',participant).maybeSingle());
  if(!session.admin&&(!a||!session.classes.includes(a.classe_id)))throw bad('Lavoro non disponibile.',403);
  return a;
 }
 if(p.action==='monitor_detail'){
  const a=await owned(p.partecipante_id),table=course==='bussola'?'bussola_v2_questionari':'bussola_v2_progetti';
  let q=admin.from(table).select('payload,revision,updated_at').eq('partecipante_id',p.partecipante_id);if(course!=='bussola')q=q.eq('corso',course);
  const project=await data(q.maybeSingle());
  const history=await data(admin.from('bussola_v2_revisioni').select('id,revision,tipo,snapshot,created_at').eq('partecipante_id',p.partecipante_id).eq('corso',course).order('created_at',{ascending:false}).limit(30));
  const notes=course==='bussola'?[]:await data(admin.from('bussola_v2_note').select('contesto,testo,created_at,tipo').eq('partecipante_id',p.partecipante_id).eq('corso',course).order('created_at'));
  return {project,history,notes,alunno:a};
 }
 if(p.action==='monitor_list'){
  const offset=Number.isInteger(p.offset)&&p.offset>=0&&p.offset<100000?p.offset:0,size=50;
  const table=course==='bussola'?'bussola_v2_questionari':'bussola_v2_progetti';
  let projects,roster=[],more=false;
  if(rosterScope){
   roster=pupils.slice(offset,offset+size);more=pupils.length>offset+size;
   const ids=roster.map(a=>a.partecipante_id).filter(Boolean);
   let q=admin.from(table).select('partecipante_id,payload,revision,updated_at').in('partecipante_id',ids.length?ids:['00000000-0000-4000-8000-000000000000']);if(course!=='bussola')q=q.eq('corso',course);projects=await data(q);
  }else{
   let q=admin.from(table).select('partecipante_id,payload,revision,updated_at').order('updated_at',{ascending:false});if(course!=='bussola')q=q.eq('corso',course);
   const excluded=await all(()=>admin.from('bussola_v2_alunni').select('partecipante_id,classe_id').order('id'));
   const ids=excluded.filter(a=>a.partecipante_id&&(selected==='senza-classe'||!p.prove&&classRows.some(c=>c.id===a.classe_id&&c.prova))).map(a=>a.partecipante_id);
   if(ids.length)q=q.not('partecipante_id','in','('+ids.join(',')+')');
   projects=await data(q.range(offset,offset+size));more=projects.length>size;projects=projects.slice(0,size);
   const owners=projects.map(x=>x.partecipante_id);
   roster=owners.length?await data(admin.from('bussola_v2_alunni').select('id,classe_id,nome,cognome,partecipante_id,verificato').in('partecipante_id',owners)):[];
  }
  const rows=rosterScope?roster.map(a=>({alunno:a,project:projects.find(x=>x.partecipante_id===a.partecipante_id)||null,partecipante_id:a.partecipante_id,key:a.id})):projects.map(project=>({project,partecipante_id:project.partecipante_id,key:project.partecipante_id,alunno:roster.find(a=>a.partecipante_id===project.partecipante_id)||null}));
  return {rows,more,offset,classi:classRows.map(safeClass)};
 }
 throw bad('Operazione non disponibile.');
}
