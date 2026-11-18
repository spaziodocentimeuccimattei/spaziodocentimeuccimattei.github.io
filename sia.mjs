// Percorso SIA della Bussola — riordino di novembre 2026 (agente A4).
// Una scelta per schermo. I dati non cambiano: stesse dieci tappe (p.screen 0-9), stesso formato del progetto,
// stessi identificativi delle scelte. Ogni tappa è divisa in uno o più «schermi» che il ragazzo vede uno alla volta
// (variabile `sub`, solo in memoria: alla ripresa si riparte dal primo schermo ancora da fare).
// Accanto a ogni schermo c'è l'anteprima dell'app che prende forma con le scelte.
import {setupExperienceNavigation} from './bussola-navigazione.mjs?v=20261018-flow';
import {classEntry,setupClass} from './bussola-classe.mjs?v=20261115-riordino';
import {setupParticipantCertificate} from './bussola-attestato-alunno.mjs?v=20261115-riordino';
import {setupStudioRemote} from './bussola-studio-remote.mjs?v=20261115-riordino';
import {restore,remoteProject} from './sia-records.mjs?v=20261115-riordino';
import {mostraIngresso} from './bussola-ingresso-comune.mjs?v=20261115-riordino';
import {mostraFinale} from './bussola-finale-comune.mjs?v=20261118-qr2';
import {scintilla} from './bussola-effetti.mjs?v=20261115-riordino';
import {iniziaMenu} from './bussola-menu.mjs?v=20261115-riordino';
import {STORE as BASE_STORE,LABS,PROCESS,FIELDS,BLOCKS,ROLES,find,createProject,processRun,processSignature,handoffRun,records,query,programSignature,runProgram,uiSignature,runUI,accessSignature,runAccess,currentRuns,ready,completed,advance,context,addNote,validProject,invalidate} from './sia-core.mjs?v=20261115-riordino';
const COURSE='sia';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const entry=classEntry(),entryToken=entry.alunno;
const localTest=['localhost','127.0.0.1'].includes(location.hostname)?new URLSearchParams(location.search).get('prova'):'';
const STORE=BASE_STORE+(entryToken?':alunno:'+entryToken:'')+(localTest?':prova:'+localTest:'');

let p,seenRevision=0,conflicted=false,memoryOnly=false,remote,classAccess,attestato,loadedInitial=false;
const get=k=>{try{return localStorage.getItem(k);}catch{memoryOnly=true;return null;}};
const requested=new URLSearchParams(location.search).get('progetto');
const initialKey=requested&&/^[0-9a-f-]{36}$/i.test(requested)?requested:get(`${STORE}.latest`);
const initialRaw=initialKey?get(`${STORE}.${initialKey}`):null;
try{const parsed=initialRaw?JSON.parse(initialRaw):null;if(validProject(parsed)){p=parsed;loadedInitial=true;seenRevision=p.revision||0;}else if(initialRaw)localStorage.setItem(`${STORE}.unrecognised.${Date.now()}`,initialRaw);}catch{if(initialRaw){try{localStorage.setItem(`${STORE}.unrecognised.${Date.now()}`,initialRaw);}catch{}}}
p ||= createProject(!initialRaw&&requested&&/^[0-9a-f-]{36}$/i.test(requested)?requested:undefined);
const storageId=loadedInitial?initialKey:p.id;
const navigation=setupExperienceNavigation(route=>{restoreRoute(route);render(true,false);});

// ---------------------------------------------------------------------------------------------
// Testi che il ragazzo legge. Le etichette dei dati (LABS, PROCESS, FIELDS, BLOCKS, ROLES in sia-core.mjs)
// restano quelle di prima perché le leggono monitoraggio e attestato: qui ci sono solo i nomi «da schermo».
const LAB_UI=[
 {nome:'I passi del lavoro',cliente:'Officina Ripresa',legame:'studi come lavora un’azienda.'},
 {nome:'Un archivio che risponde',cliente:'Officina Ripresa',legame:'impari a organizzare i dati di un’azienda.'},
 {nome:'Una regola che decide',cliente:'Spazio Mix',legame:'impari a scrivere programmi come questo.'},
 {nome:'La schermata dell’app',cliente:'Spazio Mix',legame:'progetti programmi facili da usare.'},
 {nome:'Chi può fare che cosa',cliente:'Officina Ripresa',legame:'impari anche a proteggere i dati.'}
];
const PASSO_UI={richiesta:'Ascolta il cliente',risorse:'Controlla i ricambi',conferma:'Dai la data'};
const PASSO_BREVE={richiesta:'Cliente',risorse:'Ricambi',conferma:'Data'};
const CAMPO_UI={status:['Stato','pronta o no'],day:['Giorno','quando è pronta'],price:['Prezzo','quanto costa']};
const BLOCCO_UI={leggi:'Leggi i posti liberi',controlla:'Controlla se bastano',rispondi:'Rispondi a chi prenota'};
const BLOCCO_BREVE={leggi:'Leggi',controlla:'Controlla',rispondi:'Rispondi'};
const RUOLO_UI={cliente:'Il cliente',tecnico:'Il tecnico',accoglienza:'Chi sta al banco'};
const RUOLO_BREVE={cliente:'Cliente',tecnico:'Tecnico',accoglienza:'Banco'};
const STILE_UI=[['viola','Viola'],['verde','Verde'],['sole','Arancio']];
const PULSANTI_UI=['Prenota un posto','Vai','Clicca qui'];
// Le tre cose del finale: fonti in docs/bussola/riordino-2026-11/testi-sia.md
const TRE_COSE=['Organizzi i dati di aziende e servizi.','Crei programmi per aziende e servizi.','Unisci informatica ed economia.'];

const corsa=(list,sig)=>currentRuns(list,sig).at(-1);

// Gli schermi di ogni tappa: titolo, frase, azione (un solo compito) e «fatto» (sblocca Avanti).
const PASSI=[
 [{id:'ordine',titolo:'In che ordine lavora l’officina?',frase:'Tocca i tre passi.',fatto:()=>ready(p,0)}],
 [{id:'scheda',titolo:'Che cosa scrivi al tecnico?',frase:'Deve riparare il controller.',fatto:()=>ready(p,1)}],
 [{id:'colonne',titolo:'Che cosa salvi di ogni riparazione?',frase:'Tocca le informazioni per l’archivio.',fatto:()=>ready(p,2)}],
 [{id:'doppio',titolo:'Il controller è scritto due volte.',frase:'Tienine uno solo.',fatto:()=>p.data.merged},
  {id:'giorno',titolo:'Alle seconde cuffie manca il giorno.',frase:'Scegli tu.',fatto:()=>!!p.data.missingDay},
  {id:'cerca',titolo:'Cerca le riparazioni pronte.',frase:'Scegli il giorno.',fatto:()=>ready(p,3)}],
 [{id:'blocchi',titolo:'Un programma è una fila di comandi.',frase:'Toccali nell’ordine che vuoi.',fatto:()=>ready(p,4)},
  {id:'regola',titolo:'E se i posti non bastano?',frase:'Scegli tu.',fatto:()=>ready(p,4)}],
 [{id:'prova',titolo:'Prova il tuo programma.',frase:'Con 2 posti liberi e con 0.',fatto:()=>ready(p,5)}],
 [{id:'colore',titolo:'Ora disegni la tua app.',frase:'Scegli il colore.',fatto:()=>true},
  {id:'pulsante',titolo:'Che cosa scrivi sul pulsante?',frase:'Deve dire che cosa succede.',fatto:()=>ready(p,6)}],
 [{id:'usa',titolo:'Prova la tua app.',frase:'Scegli e tocca il tuo pulsante.',fatto:()=>ready(p,7)}],
 [{id:'permessi',titolo:'Chi può cambiare il prezzo?',frase:'✓ vuol dire: può cambiarlo.',fatto:()=>ready(p,8)}],
 [{id:'prova',titolo:'Prova a cambiare il prezzo.',frase:'Ci provano il cliente e chi sta al banco.',fatto:()=>ready(p,9)}]
];
const TOTALE=PASSI.reduce((n,l)=>n+l.length,0);
const prima=s=>PASSI.slice(0,s).reduce((n,l)=>n+l.length,0);
let sub=0,ordine=[],rifaOrdine=false,app={activity:'animazione',requested:1},reviewing=false;
function primoDaFare(s){const l=PASSI[s]||[];const i=l.findIndex(x=>!x.fatto());return i<0?Math.max(0,l.length-1):i;}
function vaiA(s,quale='primo'){p.screen=s;sub=quale==='ultimo'?(PASSI[s]?.length||1)-1:quale==='zero'?0:primoDaFare(s);ordine=[];rifaOrdine=false;}

function restoreRoute(route){
 const n=route==='conclusione'?10:Number(route.match(/^passaggio-(\d+)$/)?.[1])-1;
 if(p.started&&Number.isInteger(n)&&n>=0&&(n<=p.unlocked||n===10&&(p.screen===10||completed(p)))){navigation.enter();vaiA(n);}
 else navigation.showIntro();
}

const fingerprint=value=>{const {revision,updatedAt,...rest}=value;return JSON.stringify(rest);};
let savedFingerprint=seenRevision?fingerprint(p):null;
function openConflict(){if(!$('conflictDialog').open)$('conflictDialog').showModal();$('saveStatus').textContent='Le modifiche di questa finestra attendono la tua scelta.';}
function save(notify=true){if(conflicted)return false;try{const stored=JSON.parse(get(`${STORE}.${storageId}`)||'null');if(stored&&(stored.revision||0)!==seenRevision){conflicted=true;openConflict();return false;}const current=fingerprint(p),updated=!stored||current!==savedFingerprint;if(updated){p.revision=seenRevision+1;p.updatedAt=new Date().toISOString();localStorage.setItem(`${STORE}.${storageId}`,JSON.stringify(p));seenRevision=p.revision;savedFingerprint=current;}localStorage.setItem(`${STORE}.latest`,storageId);memoryOnly=false;if(!remote)$('saveStatus').textContent='Salvato su questo dispositivo.';$('noteCount').textContent=p.notes.length;if(notify&&updated&&remote&&(p.started||p.notes.some(n=>n.pending)))remote.changed();return true;}catch{memoryOnly=true;$('saveStatus').textContent='Il salvataggio non è disponibile. Il lavoro resta in questa pagina.';$('noteCount').textContent=p.notes.length;if(notify&&remote)remote.changed();return false;}}
window.addEventListener('storage',e=>{if(e.key!==`${STORE}.${storageId}`||!e.newValue)return;try{const other=JSON.parse(e.newValue);if(validProject(other)&&(other.revision||0)>seenRevision){conflicted=true;openConflict();}}catch{}});
$('conflictDialog').addEventListener('cancel',e=>e.preventDefault());
// «Inizia da capo»: sullo stesso dispositivo si alternano persone diverse. Conserva il lavoro presente,
// dimentica il codice personale di chi c'era prima e apre un lavoro nuovo dall'ingresso.
function startOver(senzaClasse=false){save();document.dispatchEvent(new CustomEvent('bussola-progetto-nuovo'));const u=new URL(location.href),h=new URLSearchParams(u.hash.includes('=')?u.hash.slice(1):'');h.delete('alunno');h.delete('passaggio');if(senzaClasse===true)h.delete('classe');u.searchParams.set('progetto',crypto.randomUUID());u.hash=h.get('classe')?h.toString():'ingresso';location.assign(u.href);}

// ---------------------------------------------------------------------------------------------
// Anteprima: il telefono con l'app che prende forma.
const tel=(testa,corpo,extra='')=>`<div class="sia-tel ${extra}" id="siaTel"><div class="sia-tel__barra"><span>${esc(testa)}</span><span aria-hidden="true">●●●</span></div><div class="sia-tel__schermo">${corpo}</div></div>`;
const stileApp=()=>p.ui.style==='verde'?'sia-app--verde':p.ui.style==='sole'?'sia-app--sole':'sia-app--viola';
function appSpazioMix({attiva=false,risultato=null,demo=false}={}){
 const r=risultato,act=attiva?app.activity:(r?.activity||'animazione');
 const scelte=attiva?`<div class="sia-app__riga" role="group" aria-label="Attività"><button type="button" class="sia-app__opz" data-app-activity="animazione" aria-pressed="${act==='animazione'}">Animazione<small>2 posti</small></button><button type="button" class="sia-app__opz" data-app-activity="foto" aria-pressed="${act==='foto'}">Fotografia<small>1 posto</small></button></div><div class="sia-app__riga" role="group" aria-label="Posti da chiedere"><button type="button" class="sia-app__opz" data-app-posti="1" aria-pressed="${app.requested===1}">1 posto</button><button type="button" class="sia-app__opz" data-app-posti="2" aria-pressed="${app.requested===2}">2 posti</button></div>`
  :'';
 const esito=r?`<p class="sia-app__esito sia-app__esito--${r.output==='conferma'&&r.remaining>=0?'si':r.output==='attesa'?'attesa':'no'}" role="status">${r.output==='problema'?'Il programma si è fermato.':r.output==='attesa'?'Sei in lista d’attesa.':'Prenotazione confermata ✓'}</p>`:demo?'<p class="sia-app__esito sia-app__esito--si sia-demo__toast">Prenotazione confermata ✓</p>':'';
 const titolo=demo?'Crea con Spazio Mix':p.ui.title;
 const pulsante=demo?'Prenota un posto':p.ui.button;
 return `<div class="sia-app ${demo?'sia-app--viola':stileApp()}"><div class="sia-app__arte" aria-hidden="true"><span>✦</span><span>▧</span><span>▷</span></div><p class="sia-app__titolo" data-app-titolo>${esc(titolo)}</p>${scelte}<button type="button" class="sia-app__pulsante" ${attiva?'id="appSubmit"':'tabindex="-1" aria-hidden="true"'} data-app-pulsante>${esc(pulsante)}</button>${esito}</div>`;
}
function righeArchivio({evidenzia=()=>false,colonne=p.data.fields}={}){
 const nomi=colonne;const lista=records(p);
 return `<ul class="sia-archivio">${lista.map((r,i)=>{
  const chip=f=>f==='status'?`<span class="sia-chip ${r.status==='Pronto'?'sia-chip--si':''}">${r.status==='Pronto'?'Pronta':'In lavoro'}</span>`:f==='day'?`<span class="sia-chip ${r.day?'':'sia-chip--manca'}">${r.day?esc(r.day):'Giorno ?'}</span>`:`<span class="sia-chip">${money(r.price)}</span>`;
  return `<li class="${evidenzia(r,i)?'sia-archivio--luce':''}"><strong>${esc(r.object)}</strong><span class="sia-archivio__chip">${FIELDS.filter(f=>nomi.includes(f.id)).map(f=>chip(f.id)).join('')}</span></li>`;}).join('')}</ul>`;
}
function programma(){
 const b=p.program.blocks;
 return `<ol class="sia-blocchi">${[0,1,2].map(i=>b[i]?`<li class="sia-blocco sia-blocco--${b[i]}">${esc(BLOCCO_BREVE[b[i]])}</li>`:'<li class="sia-blocco sia-blocco--vuoto"></li>').join('')}</ol>`;
}
function regola(){return `<p class="sia-regola"><b>SE</b> bastano → conferma<br><b>ALTRIMENTI</b> → ${p.program.no==='attesa'?'attesa':'conferma'}</p>`;}
function esitoCorsa(r){if(!r)return '';if(r.problem&&r.output==='problema')return 'Fermo';if(r.remaining<0)return 'Confermata senza posto!';return r.output==='conferma'?'Confermata':'In attesa';}
function prezzoCuffie(){
 const r=corsa(p.access.runs,accessSignature(p));
 return `<div class="sia-prezzo"><span>Cuffie</span><strong>${money(r&&r.allowed?r.after:18)}</strong></div>`;
}
function anteprima(s,id){
 if(s===0){
  const r=rifaOrdine?null:corsa(p.process.runs,processSignature(p));const seq=r?p.process.order:ordine;
  const brutti=new Set(['Manca ancora la richiesta','Una promessa da verificare']);
  const righe=[0,1,2].map(i=>{const x=seq[i],t=r?.trace[i];return `<li class="${x?'':'sia-vuoto'}"><span class="sia-num">${t?(brutti.has(t.label)?'!':'✓'):i+1}</span>${x?esc(PASSO_BREVE[x]):''}</li>`;}).join('');
  const msg=r?`<p class="sia-fumetto">«Pronto ${r.warning?'venerdì':'lunedì'}»</p>`:'';
  return tel('Officina Ripresa',`<ol class="sia-passi">${righe}</ol>${msg}`);
 }
 if(s===1){
  const h=p.process.handoff,ricca=h==='completa',v=t=>h?t:'?';
  const r=corsa(p.process.handoffRuns,h);
  return tel('Officina Ripresa',`<dl class="sia-scheda"><div><dt>Oggetto</dt><dd>Controller</dd></div><div><dt>Problema</dt><dd>${v(ricca?'Tasto bloccato':'—')}</dd></div><div><dt>Ricambio</dt><dd>${v(ricca?'Lunedì':'—')}</dd></div></dl>${r?`<p class="sia-fumetto">«${ricca?'Chiaro, comincio!':'Che cosa non va?'}»</p>`:''}`);
 }
 if(s===2)return tel('Officina Ripresa',righeArchivio());
 if(s===3){
  const q=query(p);
  const luce=id==='doppio'?(r,i)=>!p.data.merged&&r.object==='Controller':id==='giorno'?r=>r.id==='R04':id==='cerca'&&p.data.searched&&q.known?r=>r.status==='Pronto'&&r.day===p.data.filter:()=>false;
  const banner=id==='cerca'&&p.data.searched&&q.known?`<p class="sia-fumetto">${q.count===1?'1 pronta':`${q.count} pronte`}${q.total!==null?` · ${money(q.total)}`:''}</p>`:'';
  const colonne=id==='doppio'?[]:id==='giorno'?['day']:p.data.fields.filter(f=>f!=='price');
  return tel('Officina Ripresa',righeArchivio({evidenzia:luce,colonne})+banner);
 }
 if(s===4)return tel('Spazio Mix',programma()+(id==='regola'?regola():''));
 if(s===5){
  const runs=currentRuns(p.program.runs,programSignature(p));const r1=runs.filter(r=>r.caseId==='libero').at(-1),r2=runs.filter(r=>r.caseId==='pieno').at(-1);
  return tel('Spazio Mix',programma()+`<ul class="sia-prove"><li><span>2 posti</span><strong>${r1?esc(esitoCorsa(r1)):''}</strong></li><li><span>0 posti</span><strong>${r2?esc(esitoCorsa(r2)):''}</strong></li></ul>`);
 }
 if(s===6)return tel('Spazio Mix',appSpazioMix(),'sia-tel--app');
 if(s===7)return tel('Spazio Mix',appSpazioMix({attiva:true,risultato:corsa(p.ui.runs,uiSignature(p))}),'sia-tel--app');
 if(s===8){
  const chi=ROLES.filter(x=>p.access.permissions[x.id].edit);
  return tel('Officina Ripresa',`${prezzoCuffie()}<ul class="sia-ruoli">${chi.length?chi.map(x=>`<li><span aria-hidden="true">🔓</span>${esc(RUOLO_BREVE[x.id])}</li>`).join(''):'<li><span aria-hidden="true">🔒</span>Nessuno</li>'}</ul>`);
 }
 if(s===9){
  const prove=currentRuns(p.access.runs,accessSignature(p)),ultima=id=>prove.filter(x=>x.role===id).at(-1);
  const righe=['cliente','accoglienza'].map(id=>{const t=ultima(id);return t?`<li class="${t.allowed?'':'sia-no'}"><span aria-hidden="true">${t.allowed?'🔓':'🔒'}</span>${esc(RUOLO_BREVE[id])}<small>${t.allowed?money(t.after):'bloccato'}</small></li>`:'';}).join('');
  return tel('Officina Ripresa',`${prezzoCuffie()}<ul class="sia-ruoli">${righe}</ul>`);
 }
 return '';
}

// ---------------------------------------------------------------------------------------------
// L'azione dello schermo (una sola) e il suo esito.
const scelta=(attr,val,testo,premuto,extra='')=>`<button type="button" class="bt-scelta" id="sia-${attr}-${esc(val).replace(/\W+/g,'')}" data-${attr}="${esc(val)}" aria-pressed="${premuto}" ${extra}><span class="sia-scelta__testo">${testo}</span></button>`;
function azione(s,id){
 if(s===0){
  const seq=ready(p,0)&&!rifaOrdine?p.process.order:ordine;
  const bottoni=PROCESS.map(x=>{const i=seq.indexOf(x.id);return `<button type="button" class="bt-scelta sia-ordine" id="sia-passo-${x.id}" data-passo="${x.id}" aria-pressed="${i>=0}" ${i>=0?'disabled':''}><span class="sia-num">${i>=0?i+1:''}</span>${esc(PASSO_UI[x.id])}</button>`;}).join('');
  return `<div class="bt-scelte">${bottoni}</div>${seq.length&&!(rifaOrdine&&seq.length<3)?'<button type="button" class="bt-link" id="ordineDaCapo">Cambia l’ordine</button>':''}`;
 }
 if(s===1)return `<div class="bt-scelte">${scelta('handoff','completa','Oggetto, problema, ricambio',p.process.handoff==='completa')}${scelta('handoff','essenziale','Solo l’oggetto',p.process.handoff==='essenziale')}</div>`;
 if(s===2)return `<div class="bt-scelte">${FIELDS.map(f=>scelta('field',f.id,CAMPO_UI[f.id][0],p.data.fields.includes(f.id))).join('')}</div>`;
 if(s===3&&id==='doppio')return `<div class="bt-scelte">${p.data.merged?'<button type="button" class="bt-scelta" aria-pressed="true" disabled>Unito ✓</button>':'<button type="button" class="bt-scelta" id="merge"><span class="sia-play" aria-hidden="true">⇄</span>Unisci</button>'}</div>`;
 if(s===3&&id==='giorno')return `<div class="bt-scelte bt-scelte--due">${['Venerdì','Lunedì'].map(d=>scelta('missing-day',d,d,p.data.missingDay===d)).join('')}</div>`;
 if(s===3&&id==='cerca'){
  if(!(p.data.fields.includes('status')&&p.data.fields.includes('day')))return `<div class="bt-scelte"><button type="button" class="bt-scelta" id="aggiungiColonne">Aggiungili</button></div>`;
  return `<div class="bt-scelte bt-scelte--due">${['Venerdì','Lunedì'].map(d=>scelta('filter',d,d,p.data.searched&&p.data.filter===d)).join('')}</div>`;
 }
 if(s===4&&id==='blocchi'){
  const b=p.program.blocks;
  return `<div class="bt-scelte">${BLOCKS.map(x=>{const i=b.indexOf(x.id);return `<button type="button" class="bt-scelta sia-ordine" id="sia-blocco-${x.id}" data-add-block="${x.id}" aria-pressed="${i>=0}" ${i>=0?'disabled':''}><span class="sia-num">${i>=0?i+1:''}</span>${esc(BLOCCO_UI[x.id])}</button>`;}).join('')}</div>${b.length?'<button type="button" class="bt-link" id="blocchiDaCapo">Cambia l’ordine</button>':''}`;
 }
 if(s===4&&id==='regola')return `<div class="bt-scelte">${scelta('regola','attesa','Lista d’attesa',p.program.no==='attesa')}${scelta('regola','conferma','Conferma lo stesso',p.program.no==='conferma')}</div>`;
 if(s===5)return `<div class="bt-scelte"><button type="button" class="bt-scelta" id="siaAvvia" data-run="tutte"><span class="sia-play" aria-hidden="true">▶</span>Avvia</button></div>`;
 if(s===6&&id==='colore')return `<div class="bt-scelte">${STILE_UI.map(([v,t])=>scelta('style',v,`<span class="sia-campione sia-app--${v}" aria-hidden="true"></span>${t}`,p.ui.style===v)).join('')}</div>`;
 if(s===6&&id==='nome')return `<label class="bt-campo sia-campo">Nome dell’app<input id="uiTitle" name="uiTitle" maxlength="64" value="${esc(p.ui.title)}" autocomplete="off"></label>`;
 if(s===6&&id==='pulsante'){const lista=PULSANTI_UI.includes(p.ui.button)?PULSANTI_UI:[...PULSANTI_UI,p.ui.button];return `<div class="bt-scelte">${lista.map(t=>scelta('bottone',t,esc(t),p.ui.button===t)).join('')}</div>`;}
 if(s===7)return '';
 if(s===8)return `<div class="bt-scelte">${ROLES.map(r=>scelta('perm',r.id,esc(RUOLO_UI[r.id]),p.access.permissions[r.id].edit)).join('')}</div>`;
 if(s===9)return `<div class="bt-scelte"><button type="button" class="bt-scelta" id="siaProvaPermessi" data-access="tutti"><span class="sia-play" aria-hidden="true">▶</span>Prova</button></div>`;
 return '';
}
function esito(s,id){
 if(s===0){const r=rifaOrdine?null:corsa(p.process.runs,processSignature(p));return r?.warning?'Data promessa senza controllare i ricambi.':'';}
 if(s===5){const runs=currentRuns(p.program.runs,programSignature(p));if(!runs.length)return '';
  if(runs.some(r=>r.output==='problema'))return 'Si è fermato: un comando è fuori posto. <button type="button" class="bt-link" data-rifai="0">Cambia l’ordine</button>';
  if(runs.some(r=>r.remaining<0))return 'Ha confermato senza posti! <button type="button" class="bt-link" data-rifai="1">Cambia la regola</button>';
  return '';}
 if(s===6&&id==='pulsante')return p.ui.button==='Vai'||p.ui.button==='Clicca qui'?'Vai dove? Chi lo tocca non lo sa.':'';
 if(s===7){const r=corsa(p.ui.runs,uiSignature(p));return r?(r.output==='problema'?'Si è fermato: rivedi i comandi.':r.output==='conferma'&&r.remaining>=0?'':r.output==='conferma'?'Ha confermato senza posti!':''):'';}
 return '';
}

function activity(){
 const s=p.screen,lab=Math.floor(s/2),L=LAB_UI[lab];
 sub=Math.max(0,Math.min(sub,PASSI[s].length-1));
 const step=PASSI[s][sub],fatto=step.fatto();
 const pos=prima(s)+sub+1;
 const ultimo=sub===PASSI[s].length-1&&s%2===1;
 const legame=ultimo&&ready(p,lab*2)&&ready(p,lab*2+1)?`<p class="sia-legame bt-entra"><b>In SIA</b> ${esc(L.legame)}</p>`:'';
 const testo=esito(s,step.id);
 return `<section class="bt-schermo bt-schermo--sinistra sia-schermo" data-corso="sia" data-passo="${s}-${step.id}">
  <div class="sia-testa"><progress class="bt-avanzamento" value="${pos}" max="${TOTALE}" aria-label="Schermo ${pos} di ${TOTALE}"></progress></div>
  <div class="sia-griglia">
   <h1 class="bt-titolo bt-titolo--medio sia-titolo" id="stageTitle" tabindex="-1">${esc(step.titolo)}</h1>
   <p class="bt-frase sia-frase">${s===3&&step.id==='cerca'&&!(p.data.fields.includes('status')&&p.data.fields.includes('day'))?'Servono Stato e Giorno.':esc(step.frase)}</p>
   <div class="sia-anteprima" aria-label="La tua app">${anteprima(s,step.id)}</div>
   <div class="sia-azione">${azione(s,step.id)}</div>
   <div class="sia-esito" role="status" aria-live="polite">${testo?`<p>${testo}</p>`:''}${legame}</div>
  </div>
  <div class="bt-azioni bt-azioni--estremi sia-nav"><button id="previous" type="button" class="bt-pulsante bt-pulsante--secondario">Indietro</button><button id="next" type="button" class="bt-pulsante" ${fatto?'':'disabled'}>Avanti</button></div>
 </section>`;
}

function intro(){
 const finished=p.screen===10&&completed(p);
 const label=p.started?'Riprendi':'Inizia';
 return `<section class="bt-schermo sia-intro" data-corso="sia">
  <div class="sia-intro__testo">
   <p class="bt-occhiello bt-occhiello--corso">SIA · Sistemi Informativi Aziendali</p>
   <h1 class="bt-titolo" id="stageTitle" tabindex="-1">Costruisci un’app che <em>funziona</em>.</h1>
   <p class="bt-frase">In SIA impari a creare programmi per aziende e servizi.</p>
  </div>
  <div class="sia-intro__app" aria-hidden="true"><div class="sia-tel sia-tel--app sia-demo"><div class="sia-tel__barra"><span>Spazio Mix</span><span>●●●</span></div><div class="sia-tel__schermo">${appSpazioMix({demo:true})}</div></div><span class="sia-bollino">La costruisci tu!</span></div>
  <div class="bt-azioni sia-intro__azioni"><button id="start" class="bt-pulsante bt-pulsante--grande bt-pulsa" type="button">${finished?'Riprendi':label}</button>${p.started?'<button id="startOver" class="bt-link" type="button">Inizia da capo</button>':''}</div>
  <p class="bt-nota sia-intro__nota">SIA si sceglie dal terzo anno: in prima ti iscrivi ad AFM.</p>
 </section>`;
}

// Riepilogo del lavoro: dietro «Rivedi il tuo lavoro» del finale, o se il lavoro non è ancora completo.
function end(){
 const q=query(p),ui=corsa(p.ui.runs,uiSignature(p));
 const testi=[
  `${p.process.order.map(id=>PASSO_UI[id]).join(' → ')}. Al tecnico: scheda ${p.process.handoff==='completa'?'completa':'corta'}.`,
  `Archivio con ${p.data.fields.length+1} colonne. ${q.known&&p.data.searched?`Pronte ${p.data.filter.toLowerCase()}: ${q.count}.`:'Ricerca da rifare.'}`,
  `${p.program.blocks.map(id=>BLOCCO_UI[id]).join(' → ')||'Comandi da scegliere'}. Se i posti non bastano: ${p.program.no==='attesa'?'lista d’attesa':'conferma lo stesso'}.`,
  `«${p.ui.title}», pulsante «${p.ui.button}». ${ui?'L’hai provata.':'Da provare.'}`,
  `Possono cambiare il prezzo: ${ROLES.filter(r=>p.access.permissions[r.id].edit).map(r=>RUOLO_UI[r.id].toLowerCase()).join(', ')||'nessuno'}.`
 ];
 const manca=LABS.map((l,i)=>i).filter(i=>![i*2,i*2+1].every(s=>ready(p,s)&&p.done.includes(s)));
 return `<section class="bt-schermo sia-rivedi" data-corso="sia">
  <h1 class="bt-titolo bt-titolo--medio" id="stageTitle" tabindex="-1">Il tuo <em>lavoro</em></h1>
  ${manca.length?`<p class="bt-frase">Per finire, rifai: ${manca.map(i=>esc(LAB_UI[i].nome)).join(', ')}.</p>`:''}
  <ol class="sia-rivedi__lista">${LAB_UI.map((l,i)=>`<li class="bt-scheda bt-scheda--scura"><p class="sia-occhiello">${i+1} · ${esc(l.cliente)}</p><h2>${esc(l.nome)}</h2><p>${esc(testi[i])}</p><button class="bt-pulsante bt-pulsante--secondario bt-pulsante--piccolo" type="button" data-goto="${i*2}">Rivedi</button></li>`).join('')}</ol>
  ${completed(p)?'<div class="bt-azioni"><button class="bt-pulsante bt-pulsante--grande" type="button" id="backToFinale">Torna al finale</button></div>':''}
 </section>`;
}

function recovery(){let items=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k?.startsWith(`${STORE}.`)||k.includes('latest')||k.includes('unrecognised'))continue;try{const x=JSON.parse(localStorage.getItem(k));if(validProject(x))items.push(x);}catch{}}}catch{}items.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));$('previousProjects').innerHTML=items.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.title||'Nuova prova')} · ${new Date(x.updatedAt||Date.now()).toLocaleString('it-IT')} ${x.id===p.id?'· attuale':''}</option>`).join('');}
function showFinale(){mostraFinale({corso:COURSE,contenitore:$('stage'),treCose:TRE_COSE,apriAttestato:()=>attestato.prepara(),rivediLavoro:()=>{reviewing=true;render(true);},token:()=>remote.token(),salvato:async()=>{await remote.sync();return remote.saved();}});}
function render(focus=false,notify=true){
 const active=document.activeElement?.id;
 $('journey').innerHTML='';
 if(p.screen<10)reviewing=false;
 const isIntro=navigation.isIntro()||p.screen<0;
 if(p.screen>=10&&!isIntro&&completed(p)&&!reviewing){$('stage').replaceChildren();showFinale();}
 else{$('main').classList.add('bt-scuro');$('stage').innerHTML=isIntro?intro():p.screen>=10?end():activity();}
 navigation.write(isIntro?'ingresso':p.screen>=10?'conclusione':`passaggio-${p.screen+1}`,!notify,storageId);
 save(notify);recovery();
 if(focus){$('stageTitle')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 else if(active&&$(active)){let el=$(active);if(el.disabled)el=$('stage').querySelector('.sia-azione button:not(:disabled)')||$('next');el?.focus({preventScroll:true});}
}
// Effetto a ogni scelta: scintilla sul pulsante toccato e l'anteprima che «risponde».
function effetto(id){const b=id&&$(id);if(b)scintilla(b,'sia');const t=$('siaTel');if(t){t.classList.remove('sia-tel--cambia');void t.offsetWidth;t.classList.add('sia-tel--cambia');}}
// Dopo la scelta che completa lo schermo, «Avanti» entra nella vista (sul telefono può stare più in basso).
function scegli(id,fn){const prima=PASSI[p.screen]?.[sub]?.fatto();fn();render();effetto(id);const n=$('next');if(!prima&&n&&!n.disabled)n.scrollIntoView?.({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}

function renderNotes(){$('noteContext').value=navigation.isIntro()?'Ingresso · presentazione':context(p).label;$('notesList').innerHTML=p.notes.length?p.notes.map(n=>`<article class="saved-note"><small>${n.role==='docente'?'Docente':'Alunno'} · ${esc(n.kind)} · ${new Date(n.createdAt).toLocaleString('it-IT')}</small><strong>${esc(n.label)}</strong><p>${esc(n.text)}</p></article>`).join(''):'<p class="helper">Non hai ancora scritto note.</p>';}
document.addEventListener('input',e=>{const t=e.target;if(conflicted)return;if(t.id==='uiTitle'){p.ui.title=t.value;invalidate(p,3);document.querySelectorAll('[data-app-titolo]').forEach(x=>x.textContent=t.value);if($('next'))$('next').disabled=!PASSI[p.screen][sub].fatto();save();}});
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.close){$(b.dataset.close).close();return;}
 if(b.id==='reloadConflict'){
  if(remote.hasConflict()){try{await remote.reload();conflicted=false;$('conflictDialog').close();render(true);}catch{$('saveStatus').textContent='La versione recente non è disponibile. La tua copia è conservata.';}return;}
  const other=JSON.parse(get(`${STORE}.${storageId}`)||'null');if(validProject(other)){p=other;seenRevision=p.revision||0;savedFingerprint=fingerprint(p);conflicted=false;$('conflictDialog').close();render(true);}return;
 }
 if(b.id==='copyConflict'){
  const copy=JSON.parse(JSON.stringify(p));copy.id=crypto.randomUUID();copy.identity=null;copy.notes=copy.notes.map(n=>({...n,id:crypto.randomUUID(),copiedFrom:n.id,projectId:copy.id,pending:true}));copy.title=((copy.title||'Il mio lavoro')+' · copia').slice(0,80);copy.revision=1;
  try{const copyStore=BASE_STORE+(localTest?':prova:'+localTest:'');localStorage.setItem(`${copyStore}.${copy.id}`,JSON.stringify(copy));const u=new URL(location.href);u.searchParams.set('progetto',copy.id);u.hash='ingresso';location.assign(u.href);}catch{$('saveStatus').textContent='Il dispositivo non permette di conservare la copia. Tieni aperta questa finestra.';}return;
 }
 if(conflicted)return;
 if(b.dataset.goto!==undefined){const s=Number(b.dataset.goto);if(s<=p.unlocked){navigation.enter();vaiA(s,'zero');render(true);}return;}
 if(b.dataset.rifai!==undefined){vaiA(4,'zero');sub=Number(b.dataset.rifai);render(true);return;}
 // Tappa 1: i tre passi toccati in fila; al terzo tocco il processo si prova da solo.
 if(b.dataset.passo){const id=b.id;if(!ordine.includes(b.dataset.passo))ordine.push(b.dataset.passo);scegli(id,()=>{if(ordine.length===3){p.process.order=[...ordine];invalidate(p,0);processRun(p);ordine=[];rifaOrdine=false;}});return;}
 if(b.id==='ordineDaCapo'){ordine=[];rifaOrdine=true;render();$('stage').querySelector('[data-passo]')?.focus();return;}
 if(b.dataset.handoff){const id=b.id;scegli(id,()=>{p.process.handoff=b.dataset.handoff;invalidate(p,0);handoffRun(p);});return;}
 if(b.dataset.field){const id=b.id,f=b.dataset.field;scegli(id,()=>{p.data.fields=p.data.fields.includes(f)?p.data.fields.filter(x=>x!==f):[...p.data.fields,f];p.data.searched=false;invalidate(p,1);});return;}
 if(b.id==='merge'){scegli('merge',()=>{p.data.merged=true;p.data.searched=false;invalidate(p,1);});$('next')?.focus();return;}
 if(b.dataset.missingDay){const id=b.id;scegli(id,()=>{p.data.missingDay=b.dataset.missingDay;p.data.searched=false;invalidate(p,1);});return;}
 if(b.id==='aggiungiColonne'){scegli('',()=>{p.data.fields=[...new Set([...p.data.fields,'status','day'])];p.data.searched=false;invalidate(p,1);});$('stage').querySelector('[data-filter]')?.focus();return;}
 if(b.dataset.filter){const id=b.id;scegli(id,()=>{p.data.filter=b.dataset.filter;p.data.searched=true;invalidate(p,1);});return;}
 if(b.dataset.addBlock){const id=b.id;scegli(id,()=>{if(!p.program.blocks.includes(b.dataset.addBlock))p.program.blocks.push(b.dataset.addBlock);invalidate(p,2);});return;}
 if(b.id==='blocchiDaCapo'){p.program.blocks=[];invalidate(p,2);render();$('stage').querySelector('[data-add-block]')?.focus();return;}
 if(b.dataset.regola){const id=b.id;scegli(id,()=>{p.program.no=b.dataset.regola;invalidate(p,2);});return;}
 if(b.dataset.run){const id=b.id;scegli(id,()=>{runProgram(p,'libero');runProgram(p,'pieno');});return;}
 if(b.dataset.style){const id=b.id;scegli(id,()=>{p.ui.style=b.dataset.style;invalidate(p,3);});return;}
 if(b.dataset.bottone){const id=b.id;scegli(id,()=>{p.ui.button=b.dataset.bottone;invalidate(p,3);});return;}
 if(b.dataset.appActivity){app.activity=b.dataset.appActivity;if(app.activity==='foto')app.requested=1;render();return;}
 if(b.dataset.appPosti){app.requested=Number(b.dataset.appPosti);render();return;}
 if(b.id==='appSubmit'){scegli('appSubmit',()=>runUI(p,app.activity,app.requested));return;}
 if(b.dataset.perm){const id=b.id,r=b.dataset.perm;scegli(id,()=>{p.access.permissions[r].edit=!p.access.permissions[r].edit;invalidate(p,4);});return;}
 if(b.dataset.access){const id=b.id;scegli(id,()=>{runAccess(p,'cliente',10);runAccess(p,'accoglienza',22);});return;}
 if(b.id==='start'){if(p.started){navigation.enter();vaiA(Math.max(0,p.screen));render(true);}else classAccess.begin(b);return;}
 if(b.id==='previous'){if(sub>0){sub--;ordine=[];rifaOrdine=false;}else if(p.screen===0)navigation.showIntro();else vaiA(p.screen-1,'ultimo');render(true);return;}
 if(b.id==='next'){const n=PASSI[p.screen]?.length||1;if(sub<n-1){if(PASSI[p.screen][sub].fatto()){sub++;ordine=[];rifaOrdine=false;render(true);}return;}if(advance(p)){vaiA(p.screen,'zero');render(true);}return;}
 if(b.id==='notesOpen'){renderNotes();$('noteStatus').textContent='';$('notesDialog').showModal();return;}
 if(b.id==='startOver'){startOver();return;}
 if(b.id==='backToFinale'){reviewing=false;render(true);return;}
 if(b.id==='newProject'){save();const u=new URL(location.href);u.searchParams.set('progetto',crypto.randomUUID());u.hash='ingresso';location.assign(u.href);return;}
 if(b.id==='recover'){const id=$('previousProjects').value,other=JSON.parse(get(`${STORE}.${id}`)||'null');if(validProject(other)){save();const u=new URL(location.href);u.searchParams.set('progetto',id);u.hash='ingresso';location.assign(u.href);}return;}
});
$('noteForm').addEventListener('submit',e=>{e.preventDefault();if(conflicted)return;const data=Object.fromEntries(new FormData(e.target)),before=p.notes.length;if(addNote(navigation.isIntro()?{...p,screen:-1}:p,data)){p.notes[before].pending=true;const ok=save();renderNotes();e.target.elements.text.value='';$('noteStatus').textContent=ok?'Nota conservata; aggiornamento online in corso.':'La nota resta in questa pagina: il browser non permette il salvataggio.';}});
function loaded(value){p=value;p.revision=seenRevision;restoreRoute(navigation.route());render(false,false);}
remote=setupStudioRemote({course:COURSE,restore,remoteProject,key:STORE+'.remote.'+storageId,entryToken,project:()=>p,keep:()=>save(false),loaded,localOK:()=>!memoryOnly,status:(text,retry)=>{$('saveStatus').textContent=text;$('retrySave').hidden=!retry;},notesChanged:()=>{$('noteCount').textContent=p.notes.length;if($('notesDialog').open)renderNotes();},conflict:()=>{conflicted=true;openConflict();}});
const startNow=async()=>{try{await remote.ensure();}catch{}navigation.enter();p.started=true;vaiA(Math.max(0,p.screen));render(true);};
classAccess=setupClass({key:STORE+'.'+storageId,token:()=>remote.token(),ensure:()=>remote.ensure(),isIntro:()=>navigation.isIntro()||p.screen<0,start:startNow,
 ingressoComune:true,apriIngresso:()=>mostraIngresso({corso:COURSE,contenitore:$('stage'),classe:classAccess,onInizia:startNow,onNuovo:()=>startOver(true),onIndietro:()=>render(true)})});
attestato=setupParticipantCertificate({project:()=>p,journey:()=>p,save,identity:()=>classAccess.identity(),participant:()=>remote.participant(),revision:()=>remote.revision()});
$('retrySave').addEventListener('click',()=>remote.sync());
window.addEventListener('online',()=>remote.sync());
iniziaMenu();
restoreRoute(navigation.route());render(false,false);if(remote.token())remote.sync();
