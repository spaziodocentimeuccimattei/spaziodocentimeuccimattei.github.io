const encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export const tokenHash=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
export const randomToken=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
export async function passwordHash(password,salt){
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:310000,hash:'SHA-256'},key,256));
}
export function equalHash(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
export async function teacherSession(admin,token){
 if(!/^[A-Za-z0-9_-]{43}$/.test(token||''))return null;
 const hash=await tokenHash(token),now=new Date().toISOString();
 const fs=await admin.from('orientamento_sessioni').select('access_level,expires_at').eq('token_hash',hash).gt('expires_at',now).maybeSingle();
 if(fs.error)throw new Error('Accesso non disponibile.');
 if(fs.data?.access_level==='funzione_strumentale')return {admin:true,name:'Funzione Strumentale',courses:['ssas','afm','sia','turismo','cat'],classes:[],hash,expires_at:fs.data.expires_at};
 if(fs.data?.access_level==='orientatore'){
  const scope=await admin.from('bussola_v2_classi_sessione').select('classe_id').eq('token_hash',hash);
  if(scope.error)throw new Error('Accesso alle classi non disponibile.');
  return {admin:false,shared:true,name:'Commissione Orientamento',courses:['ssas','afm','sia','turismo','cat'],classes:scope.data.map(c=>c.classe_id),hash,expires_at:fs.data.expires_at};
 }
 const session=await admin.from('bussola_v2_sessioni_docenti').select('docente_id,auth_version,expires_at').eq('token_hash',hash).gt('expires_at',now).maybeSingle();
 if(session.error)throw new Error('Accesso non disponibile.');
 if(!session.data)return null;
 const staff=await admin.from('bussola_v2_docenti').select('id,nome,corsi,classi,attivo,auth_version').eq('id',session.data.docente_id).eq('attivo',true).maybeSingle();
 if(staff.error)throw new Error('Accesso non disponibile.');
 const d=staff.data;if(!d||d.auth_version!==session.data.auth_version)return null;
 return {admin:false,id:d.id,name:d.nome,courses:d.corsi,classes:d.classi,hash,expires_at:session.data.expires_at};
}
