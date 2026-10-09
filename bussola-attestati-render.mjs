import {pagesPDF,zipFiles,certificatePath,certificateCSV} from './bussola-attestati-files.mjs?v=20261009-turismo';
import {safeName,COURSE_NAMES} from './bussola-records-core.mjs?v=20261009-turismo';
let imagePromise;
function logo(){return imagePromise??=new Promise((resolve,reject)=>{const loaded=document.querySelector('img[src="assets/logo-meucci-mattei-decimomannu.jpeg"]');if(loaded?.complete&&loaded.naturalWidth){resolve(loaded);return;}const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{imagePromise=null;reject(new Error('Il logo della scuola non si è caricato. Riprova.'));};img.src='assets/logo-meucci-mattei-decimomannu.jpeg';});}
function lines(ctx,text,maxWidth){const out=[];let line='';for(const word of String(text).split(/\s+/)){if(ctx.measureText(word).width>maxWidth){if(line){out.push(line);line='';}let part='';for(const c of word){if(ctx.measureText(part+c).width>maxWidth){out.push(part);part=c;}else part+=c;}line=part;continue;}if(line&&ctx.measureText(line+' '+word).width>maxWidth){out.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)out.push(line);return out;}
export async function certificateCanvas(record){
 const s=record.snapshot;if(s?.format!=='bussola-attestato-partecipazione-1')throw new Error('Formato attestato non riconosciuto.');
 const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;const ctx=canvas.getContext('2d'),brand=await logo();
 ctx.fillStyle='#fcfaf2';ctx.fillRect(0,0,1240,1754);ctx.fillStyle='#294f40';ctx.fillRect(0,0,1240,32);ctx.strokeStyle='#b5c4aa';ctx.lineWidth=2;ctx.strokeRect(48,65,1144,1610);
 ctx.drawImage(brand,90,115,104,104);ctx.fillStyle='#294f40';ctx.font='600 27px Arial';ctx.fillText('IIS Meucci - Mattei | Decimomannu',218,157);ctx.font='23px Arial';ctx.fillText('Bussola per l’orientamento',218,198);
 ctx.textAlign='center';ctx.font='600 19px Arial';ctx.fillStyle='#93602a';ctx.fillText('UN PERCORSO DI SCOPERTA',620,304);
 ctx.fillStyle='#294f40';ctx.font='58px Georgia';ctx.fillText('Attestato di partecipazione',620,394);
 ctx.font='25px Arial';ctx.fillText('Si attesta che',620,473);
 let nameFont=46;ctx.font=`600 ${nameFont}px Arial`;let nameLines=lines(ctx,s.nome+' '+s.cognome,1000);while(nameLines.length>3&&nameFont>24){nameFont-=2;ctx.font=`600 ${nameFont}px Arial`;nameLines=lines(ctx,s.nome+' '+s.cognome,1000);}const nameHeight=Math.ceil(nameFont*1.2);nameLines.forEach((t,i)=>ctx.fillText(t,620,540+i*nameHeight));
 let y=540+nameLines.length*nameHeight+25,schoolFont=24;const schoolText=[s.scuola,s.comune].filter(Boolean).join(' · ');ctx.font=`${schoolFont}px Arial`;let schoolLines=lines(ctx,schoolText,1000);while(schoolLines.length>4&&schoolFont>18){schoolFont-=2;ctx.font=`${schoolFont}px Arial`;schoolLines=lines(ctx,schoolText,1000);}for(const t of schoolLines){ctx.fillText(t,620,y);y+=Math.ceil(schoolFont*1.3);}ctx.font='25px Arial';ctx.fillText([s.classe&&`Classe ${s.classe}`,s.anno&&`Anno scolastico ${s.anno}`].filter(Boolean).join(' · '),620,y+12);
 y=Math.max(900,y+65);ctx.font='25px Arial';ctx.fillText('ha completato i cinque laboratori di esplorazione dell’indirizzo',620,y);ctx.font='37px Georgia';ctx.fillText(COURSE_NAMES[s.corso]||s.corso,620,y+58);
 const colors=['#aa4c48','#456d80','#507354','#79568b','#93602a'];ctx.textAlign='left';ctx.font='600 25px Arial';s.laboratori.forEach((lab,i)=>{const top=y+112+i*54;ctx.fillStyle='#e8eddf';ctx.fillRect(170,top-30,900,45);ctx.fillStyle=colors[i];ctx.fillText(`${i+1}`,198,top+3);ctx.fillStyle='#294f40';ctx.fillText(lab,247,top+3);});
 y+=430;ctx.textAlign='center';ctx.font='600 23px Arial';ctx.fillText('Ha espresso curiosità per',620,y);ctx.font='26px Arial';lines(ctx,s.curiosita.join(' · '),1000).forEach((t,i)=>ctx.fillText(t,620,y+44+i*37));
 ctx.font='22px Arial';ctx.fillStyle='#4f6156';ctx.fillText(new Intl.DateTimeFormat('it-IT',{dateStyle:'long'}).format(new Date(record.created_at)),620,1505);ctx.font='17px Arial';ctx.fillText('Attestato di partecipazione: non è una valutazione delle capacità.',620,1568);ctx.font='15px Arial';ctx.fillText(`Identificativo: ${record.id}${record.origine==='percorso_alunno'?'':` · Versione del lavoro: ${s.revision}`}`,620,1622);
 return canvas;
}
async function jpeg(record){const canvas=await certificateCanvas(record),blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));return {width:canvas.width,height:canvas.height,bytes:new Uint8Array(await blob.arrayBuffer())};}
async function download(bytes,type,name){
 let url;const test=['127.0.0.1','localhost'].includes(location.hostname)&&new URLSearchParams(location.search).has('prova');
 if(test){try{const testName=name.startsWith('attestato-')?'attestati-bussola.pdf':name;const response=await fetch('/__test/export?name='+encodeURIComponent(testName),{method:'POST',headers:{'Content-Type':type},body:bytes});if(response.ok)url=(await response.json()).url;}catch{}}
 if(!url)url=URL.createObjectURL(new Blob([bytes],{type}));
 return {url,name};
}
export async function downloadCertificates(records,mode='zip',onProgress=()=>{}){
 const images=[],files=[];for(let i=0;i<records.length;i++){onProgress(i+1,records.length);const image=await jpeg(records[i]);if(mode==='pdf')images.push(image);else files.push({name:certificatePath(records[i]),bytes:pagesPDF([image])});await new Promise(r=>setTimeout(r,0));}
 if(mode==='pdf')return download(pagesPDF(images),'application/pdf','attestati-bussola.pdf');
 else{files.push({name:'elenco-attestati.csv',bytes:new TextEncoder().encode(certificateCSV(records))});return download(zipFiles(files),'application/zip','attestati-bussola-per-classe.zip');}
}
export async function downloadCertificate(record){
 const image=await jpeg(record),s=record.snapshot;
 return download(pagesPDF([image]),'application/pdf',`attestato-${safeName(s.corso)}-${safeName(s.nome+' '+s.cognome)}-${safeName(record.id).slice(0,8)}.pdf`);
}
