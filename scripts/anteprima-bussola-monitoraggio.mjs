import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {isolatedBussola} from './bussola-test-db.mjs';
import {teacherSession} from '../supabase/functions/bussola-gestione/monitor-auth.mjs';
const env=await isolatedBussola(),root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const server=createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://127.0.0.1:8766');
  if(u.pathname.startsWith('/__test/')){
   if(u.pathname==='/__test/overview'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({projects:(await env.db.query('select count(*) as n from bussola_v2_progetti')).rows[0].n}));return;}
   let body='';for await(const chunk of req){body+=chunk;if(body.length>100000){res.writeHead(413);res.end();return;}}
   const headers={...req.headers,origin:'http://127.0.0.1:8766'},request=new Request('http://127.0.0.1:8766'+u.pathname,{method:req.method,headers,body:req.method==='POST'?body:undefined});
   if(u.pathname==='/__test/orientamento'){
    const p=JSON.parse(body||'{}'),session=await teacherSession(env.admin,req.headers['x-orientamento-session']);let result,status=200;
    if(!session){status=401;result={error:'Accedi di nuovo.'};}
    else if(p.action==='session')result={ok:true,access_level:session.admin?'funzione_strumentale':'orientatore'};
    else if(!session.admin){status=403;result={error:'Accesso riservato alla Funzione Strumentale.'};}
    else if(p.action==='list_contributions')result={scuole:[],disponibilita:[],proposte:[],attivita:[],da_confermare:[],appuntamenti:[],focus:[]};
    else if(p.action==='logout'){await env.admin.from('orientamento_sessioni').delete().eq('token_hash',session.hash);result={ok:true};}
    else{status=400;result={error:'Operazione non simulata.'};}
    res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(result));return;
   }
   const reply=await (u.pathname==='/__test/bussola-esperienze'?env.experiences:env.handler)(request);res.writeHead(reply.status,Object.fromEntries(reply.headers));res.end(await reply.text());return;
  }
  let path=resolve(root,'.'+decodeURIComponent(u.pathname));if(!path.startsWith(root+sep)&&path!==root){res.writeHead(403);res.end();return;}
  if((await stat(path)).isDirectory())path=resolve(path,'index.html');
  let content=await readFile(path);if(['.js','.mjs'].includes(extname(path)))content=Buffer.from(content.toString().replaceAll('https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/','/__test/'));res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(content);
 }catch{res.writeHead(404);res.end('Non trovato');}
});
server.listen(8885,'127.0.0.1',()=>console.log('Anteprima isolata: http://127.0.0.1:8885/bussola-docenti.html?prova=monitoraggio\nFS: nome vuoto, password ANTEPRIMA\nCommissione: nome vuoto, password ORIENTATORE; accessi personali facoltativi: collega.ssas / PROVA-docente-2026\nTutti i dati sono fittizi; il database vive soltanto in memoria.'));
