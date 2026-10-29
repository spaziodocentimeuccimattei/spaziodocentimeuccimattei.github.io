import {pagesPDF,zipFiles,certificatePath,certificateCSV} from './bussola-attestati-files.mjs?v=20261029-missione';
import {safeName,COURSE_NAMES} from './bussola-records-core.mjs?v=20261029-missione';
import {loadContacts,phoneLabel} from './bussola-prossimo-passo.mjs?v=20261020-contatti';
let imagePromise,qrPromise;
function logo(){return imagePromise??=new Promise((resolve,reject)=>{const loaded=document.querySelector('img[src="assets/logo-meucci-mattei-decimomannu.jpeg"]');if(loaded?.complete&&loaded.naturalWidth){resolve(loaded);return;}const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{imagePromise=null;reject(new Error('Il logo della scuola non si è caricato. Riprova.'));};img.src='assets/logo-meucci-mattei-decimomannu.jpeg';});}
// Illustrazione originale e colore di ciascun indirizzo (assets/attestati).
const ACCENT={afm:'#123c57',sia:'#477b00',turismo:'#006733',ssas:'#c4084f',cat:'#006b63','cat-4plus2':'#006b63','cat-edificio':'#006b63'},illustrations={};
function illustration(course){if(!ACCENT[course])return Promise.resolve(null);return illustrations[course]??=new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{delete illustrations[course];resolve(null);};img.src=`assets/attestati/${course}.svg?v=20261020-illustrazioni`;});}
function qr(){return qrPromise??=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{qrPromise=null;reject(new Error('QR non caricato.'));};img.src='assets/qr-orientamento.svg';});}
// Fascia «Il prossimo passo»: chi conserva o stampa l'attestato ritrova subito la scuola.
async function contactBand(){try{const [c,code]=await Promise.all([loadContacts(),qr()]);return {c,code};}catch{return null;}}
function fit(ctx,text,size,weight,maxWidth){do{ctx.font=`${weight} ${size}px Arial`;}while(ctx.measureText(text).width>maxWidth&&--size>14);}
function drawBand(ctx,{c,code}){ctx.save();ctx.textAlign='left';ctx.fillStyle='#294f40';ctx.beginPath();ctx.roundRect(90,1496,1060,112,14);ctx.fill();
 ctx.fillStyle='#ffffff';fit(ctx,'Il prossimo passo: vieni a conoscerci di persona',26,600,900);ctx.fillText('Il prossimo passo: vieni a conoscerci di persona',122,1536);
 const reach=`${c.orientationEmail} · Tel. ${phoneLabel(c.phone)}`;fit(ctx,reach,24,400,900);ctx.fillText(reach,122,1569);
 const where=`${c.address} · Inquadra il QR per indirizzi e iscrizione`;ctx.fillStyle='#d9e6c8';fit(ctx,where,19,400,900);ctx.fillText(where,122,1596);
 ctx.fillStyle='#ffffff';ctx.fillRect(1044,1506,94,94);ctx.drawImage(code,1047,1509,88,88);ctx.restore();}
function lines(ctx,text,maxWidth){const out=[];let line='';for(const word of String(text).split(/\s+/)){if(ctx.measureText(word).width>maxWidth){if(line){out.push(line);line='';}let part='';for(const c of word){if(ctx.measureText(part+c).width>maxWidth){out.push(part);part=c;}else part+=c;}line=part;continue;}if(line&&ctx.measureText(line+' '+word).width>maxWidth){out.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)out.push(line);return out;}
export async function certificateCanvas(record){
 const s=record.snapshot;if(s?.format!=='bussola-attestato-partecipazione-1')throw new Error('Formato attestato non riconosciuto.');
 const courseName=s.corso==='cat'?COURSE_NAMES.cat+(['cat-4plus2','cat-4plus2-edificio','cat-4plus2-missione'].includes(s.percorso)?' · 4+2':' · Archeodesign'):COURSE_NAMES[s.corso]||s.corso;
 const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;const ctx=canvas.getContext('2d'),[brand,band,art]=await Promise.all([logo(),contactBand(),illustration(['cat-4plus2-edificio','cat-4plus2-missione'].includes(s.percorso)?'cat-edificio':['cat-4plus2','cat-4plus2-edificio','cat-4plus2-missione'].includes(s.percorso)?'cat-4plus2':s.corso)]),accent=ACCENT[s.corso]||'#294f40';
 ctx.fillStyle='#fcfaf2';ctx.fillRect(0,0,1240,1754);ctx.fillStyle=accent;ctx.fillRect(0,0,1240,32);ctx.strokeStyle='#b5c4aa';ctx.lineWidth=2;ctx.strokeRect(48,65,1144,1610);
 ctx.drawImage(brand,90,115,104,104);ctx.fillStyle='#294f40';ctx.font='600 27px Arial';ctx.fillText('IIS Meucci - Mattei | Decimomannu',218,157);ctx.font='23px Arial';ctx.fillText('Bussola per l’orientamento',218,198);
 ctx.textAlign='center';ctx.font='600 19px Arial';ctx.fillStyle='#93602a';ctx.fillText('UN PERCORSO DI SCOPERTA',620,270);
 ctx.fillStyle='#294f40';ctx.font='58px Georgia';ctx.fillText('Attestato di partecipazione',620,352);
 ctx.font='25px Arial';ctx.fillText('Si attesta che',620,420);
 let nameFont=46;ctx.font=`600 ${nameFont}px Arial`;let nameLines=lines(ctx,s.nome+' '+s.cognome,1000);while(nameLines.length>3&&nameFont>24){nameFont-=2;ctx.font=`600 ${nameFont}px Arial`;nameLines=lines(ctx,s.nome+' '+s.cognome,1000);}const nameHeight=Math.ceil(nameFont*1.2);nameLines.forEach((t,i)=>ctx.fillText(t,620,482+i*nameHeight));
 let y=482+nameLines.length*nameHeight+25,schoolFont=24;const schoolText=[s.scuola,s.comune].filter(Boolean).join(' · ');ctx.font=`${schoolFont}px Arial`;let schoolLines=lines(ctx,schoolText,1000);while(schoolLines.length>4&&schoolFont>18){schoolFont-=2;ctx.font=`${schoolFont}px Arial`;schoolLines=lines(ctx,schoolText,1000);}for(const t of schoolLines){ctx.fillText(t,620,y);y+=Math.ceil(schoolFont*1.3);}ctx.font='25px Arial';ctx.fillText([s.classe&&`Classe ${s.classe}`,s.anno&&`Anno scolastico ${s.anno}`].filter(Boolean).join(' · '),620,y+12);
 const artTop=y+40;y=Math.max(930,y+65);
 // L'illustrazione dell'indirizzo riempie lo spazio sotto il nome; con nomi o scuole molto lunghi si riduce o si omette.
 const room=y-48-artTop,artHeight=Math.min(260,room);if(art&&artHeight>=120){const w=artHeight*2.16,x=620-w/2,top=artTop+(room-artHeight)/2;ctx.save();ctx.beginPath();ctx.roundRect(x,top,w,artHeight,18);ctx.clip();ctx.drawImage(art,x,top,w,artHeight);ctx.restore();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(x,top,w,artHeight,18);ctx.stroke();}
 ctx.fillStyle='#294f40';ctx.font='25px Arial';ctx.fillText('ha completato i cinque laboratori di esplorazione dell’indirizzo',620,y);let courseFont=37;ctx.font=`${courseFont}px Georgia`;while(ctx.measureText(courseName).width>1000&&courseFont>25){ctx.font=`${--courseFont}px Georgia`;}ctx.fillStyle=accent;ctx.fillText(courseName,620,y+58);
 const colors=['#aa4c48','#456d80','#507354','#79568b','#93602a'];ctx.textAlign='left';ctx.font='600 25px Arial';s.laboratori.forEach((lab,i)=>{const top=y+108+i*50;ctx.fillStyle='#e8eddf';ctx.fillRect(170,top-29,900,42);ctx.fillStyle=colors[i];ctx.fillText(`${i+1}`,198,top+3);ctx.fillStyle='#294f40';ctx.fillText(lab,247,top+3);});
 y+=400;ctx.textAlign='center';ctx.font='600 23px Arial';ctx.fillText(s.curiosita.length?'Ha espresso curiosità per':'Ha esplorato diverse possibilità dell’indirizzo',620,y);let curiosityFont=26;ctx.font='26px Arial';while(lines(ctx,s.curiosita.join(' · '),1000).length>2&&curiosityFont>18)ctx.font=`${--curiosityFont}px Arial`;lines(ctx,s.curiosita.join(' · '),1000).forEach((t,i)=>ctx.fillText(t,620,y+44+i*37));
 ctx.font='22px Arial';ctx.fillStyle='#4f6156';ctx.fillText(new Intl.DateTimeFormat('it-IT',{dateStyle:'long'}).format(new Date(record.created_at)),620,band?1468:1505);if(band)drawBand(ctx,band);ctx.fillStyle='#4f6156';ctx.font='17px Arial';ctx.fillText('Attestato di partecipazione: non è una valutazione delle capacità.',620,band?1638:1568);ctx.font='15px Arial';ctx.fillText(`Identificativo: ${record.id}${record.origine==='percorso_alunno'?'':` · Versione del lavoro: ${s.revision}`}`,620,band?1660:1622);
 if(['localhost','127.0.0.1'].includes(location.hostname)){ctx.fillStyle='#ad093e';ctx.font='bold 34px Arial';ctx.fillText('ANTEPRIMA LOCALE · NON EMESSO',620,1720);}
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
