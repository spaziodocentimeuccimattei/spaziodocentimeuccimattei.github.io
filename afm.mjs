import {setupExperienceNavigation} from './bussola-navigazione.mjs?v=20261018-flow';
import {classEntry,setupClass} from './bussola-classe.mjs?v=20261115-riordino';
import {setupParticipantCertificate} from './bussola-attestato-alunno.mjs?v=20261115-riordino';
import {setupStudioRemote} from './bussola-studio-remote.mjs?v=20261115-riordino';
import {restore,remoteProject} from './afm-records.mjs?v=20261115-riordino';
import {mostraIngresso} from './bussola-ingresso-comune.mjs?v=20261115-riordino';
import {mostraFinale} from './bussola-finale-comune.mjs?v=20261115-riordino';
import {scintilla} from './bussola-effetti.mjs?v=20261115-riordino';
import {iniziaMenu} from './bussola-menu.mjs?v=20261115-riordino';
const COURSE='afm';
import {STORE as BASE_STORE,LABS,OFFERS,TASKS,OBSTACLES,AGREEMENTS,AMENDMENTS,TONES,QUESTIONS,STAGES,find,createProject,offer,feature,question,economics,cashflow,ready,choose,advance,completed,posterTitle,context,addNote,validProject} from './afm-core.mjs?v=20261115-riordino';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v);
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
function startOver(){save();document.dispatchEvent(new CustomEvent('bussola-progetto-nuovo'));const u=new URL(location.href),h=new URLSearchParams(u.hash.includes('=')?u.hash.slice(1):'');h.delete('alunno');h.delete('passaggio');u.searchParams.set('progetto',crypto.randomUUID());u.hash=h.get('classe')?h.toString():'ingresso';location.assign(u.href);}
// ---------------------------------------------------------------------------------------------
// Testi che il ragazzo legge. I dati in afm-core.mjs (nomi, titoli, descrizioni) restano quelli di prima perché li
// leggono monitoraggio e attestato: qui ci sono solo i testi «da schermo». Fonti: docs/bussola/riordino-2026-11/testi-afm.md
const LAB_UI=[
 {nome:'Dai forma a una proposta',cliente:'La tua idea',legame:'impari a trasformare un’idea in un piano di attività.'},
 {nome:'Metti in ordine il lavoro',cliente:'Officina Forme',legame:'impari a pianificare attività e responsabilità.'},
 {nome:'Fai i conti',cliente:'Linea Studio',legame:'impari a leggere dati economici.'},
 {nome:'Scrivi un accordo chiaro',cliente:'La tua idea',legame:'con Diritto impari a scrivere accordi chiari.'},
 {nome:'Presenta la tua idea',cliente:'La tua idea',legame:'impari a spiegare le decisioni, anche in inglese.'}
];
const TASK_BREVE={cliente:'Cliente',risorse:'Materiali',riepilogo:'Riepilogo'};
const TASK_UI={cliente:'Ascolta il cliente',risorse:'Controlla i materiali',riepilogo:'Scrivi il riepilogo'};
const OBS_UI={
 dividi:{label:'Consegno 6 venerdì e 2 lunedì'},
 alternativa:{label:'Uso un materiale diverso'},
 nuovadata:{label:'Consegno tutto lunedì'}};
const PAY_UI={
 anticipo:{label:'Il cliente paga prima una parte',esito:'Il cliente deve essere d’accordo.'},
 dopo:{label:'Il fornitore aspetta 14 giorni',esito:'Il fornitore deve essere d’accordo.'}};
const AGR_UI={
 unica:{label:'Tutto in 7 giorni',scritto:'Entro 7 giorni.'},
 prova:{label:'Prima un esempio',scritto:'Esempio in 3 giorni, poi lavoro in 7.'},
 insieme:{label:'Una data scelta insieme',scritto:'Data scelta insieme.'}};
const AMD_UI={
 separata:{label:'Una proposta a parte',scritto:'L’immagine è una proposta a parte.'},
 piccola:{label:'Una sola immagine inclusa',scritto:'È inclusa una sola immagine.'},
 iniziale:{label:'Resta il lavoro iniziale',scritto:'L’immagine non è compresa.'}};
// Inglese del cliente: frasi corte (stesso senso dei testi in afm-core.mjs, che restano per il riepilogo dei docenti).
const DOM_UI={
 uso:{reply:'For a small group project.',tr:'Per un piccolo progetto di gruppo.'},
 tempo:{reply:'In two weeks. Is that possible?',tr:'Fra due settimane. È possibile?'},
 personale:{reply:'Yes. Can each person choose a detail?',tr:'Sì. Ognuno può scegliere un dettaglio?'}};
const RISP_UI={
 gruppo:{en:'We can develop an idea for your group.',it:'Possiamo sviluppare un’idea per il vostro gruppo.'},
 esempio:{en:'I can show you an example.',it:'Posso mostrarti un esempio.'},
 controlla:{en:'I will check the schedule and confirm the date.',it:'Controllerò il calendario e confermerò la data.'},
 spiega:{en:'Let us agree on a delivery date.',it:'Concordiamo una data di consegna.'},
 dettaglio:{en:'Let us choose the details together.',it:'Scegliamo insieme i dettagli.'},
 modello:{en:'I can prepare a sample for you.',it:'Posso prepararti un esempio.'}};
// Le tre cose del finale: fonti in docs/bussola/riordino-2026-11/testi-afm.md
const TRE_COSE=['Trasformi un’idea in un piano di attività.','Leggi i numeri e confronti costi e risorse.','Spieghi le tue decisioni a persone diverse, anche in inglese.'];

// Gli schermi di ogni tappa: titolo, frase, azione (un solo compito) e «fatto» (sblocca Avanti).
// visto: le scelte che hanno già un valore di partenza valido (la quantità) contano solo se toccate.
const visto=new Set(),viste=k=>visto.has(k)||p.done.includes(4);
const PASSI=[
 [{id:'idea',titolo:STAGES[0][0],frase:STAGES[0][1],fatto:()=>!!offer(p)}],
 [{id:'bisogno',titolo:STAGES[1][0],frase:STAGES[1][1],fatto:()=>!!feature(p)}],
 [{id:'ordine',titolo:STAGES[2][0],frase:STAGES[2][1],fatto:()=>ordine.length===3||(p.done.includes(2)&&!rifaOrdine&&ready(p,2))}],
 [{id:'imprevisto',titolo:STAGES[3][0],frase:STAGES[3][1],fatto:()=>!!find(OBSTACLES,p.choices.obstacle)}],
 [{id:'quanti',titolo:STAGES[4][0],frase:STAGES[4][1],fatto:()=>viste('quanti')}],
 [{id:'cassa',titolo:STAGES[5][0],frase:STAGES[5][1],fatto:()=>ready(p,5)}],
 [{id:'consegna',titolo:STAGES[6][0],frase:STAGES[6][1],fatto:()=>ready(p,6)}],
 [{id:'richiesta',titolo:STAGES[7][0],frase:STAGES[7][1],fatto:()=>ready(p,7)}],
 [{id:'tono',titolo:STAGES[8][0],frase:STAGES[8][1],fatto:()=>ready(p,8)}],
 [{id:'domanda',titolo:STAGES[9][0],frase:STAGES[9][1],fatto:()=>!!question(p)},
  {id:'risposta',titolo:'Il cliente ti ha risposto.',frase:'Scegli come continuare.',fatto:()=>ready(p,9)}]
];
const TOTALE=PASSI.reduce((n,l)=>n+l.length,0);
const prima=s=>PASSI.slice(0,s).reduce((n,l)=>n+l.length,0);
let sub=0,ordine=[],rifaOrdine=false,reviewing=false;
function primoDaFare(s){const l=PASSI[s]||[];const i=l.findIndex(x=>!x.fatto());return i<0?Math.max(0,l.length-1):i;}
function vaiA(s,quale='primo'){p.screen=s;sub=quale==='ultimo'?(PASSI[s]?.length||1)-1:quale==='zero'?0:primoDaFare(s);ordine=[];rifaOrdine=false;}

// ---------------------------------------------------------------------------------------------
// Il prodotto che prende forma accanto a ogni schermo: un foglio con la barra del colore dell'indirizzo.
const CROP={book:'52 10 136 136',bag:'66 14 128 128',cards:'46 10 150 150'};
function icon(kind,quadrata=false){
 const vb=quadrata?(CROP[kind]||CROP.book):'0 0 260 160';
 const begin=`<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="${quadrata?'afm-ico':'afm-arte'}">`;const end='</svg>';
 if(kind==='bag')return begin+'<ellipse cx="130" cy="144" rx="76" ry="8" fill="#17354b" opacity=".12"/><path d="M110 28v-7c0-13 40-13 40 0v7" fill="none" stroke="#17354b" stroke-width="6"/><rect x="81" y="29" width="98" height="104" rx="26" fill="#214f99" stroke="#17354b" stroke-width="3"/><rect x="96" y="79" width="67" height="41" rx="10" fill="#b9d4e7" stroke="#17354b" stroke-width="3"/><path d="M103 89h54" stroke="#17354b" stroke-width="3"/><circle cx="132" cy="55" r="17" fill="#f3c45d"/><path d="M132 44v22m-11-11h22" stroke="#17354b" stroke-width="3"/><path d="M190 89l15-11m-15 23h20" stroke="#17645c" stroke-width="4"/>'+end;
 if(kind==='cards')return begin+'<g transform="rotate(-16 130 80)"><rect x="51" y="22" width="87" height="118" rx="9" fill="#ea957d" stroke="#17354b" stroke-width="3"/><circle cx="93" cy="66" r="22" fill="#fff8e7"/></g><g transform="rotate(12 130 80)"><rect x="104" y="22" width="87" height="118" rx="9" fill="#bdd4e5" stroke="#17354b" stroke-width="3"/><path d="M125 82l22-40 24 40z" fill="#214f99"/><path d="M122 104h50" stroke="#17354b" stroke-width="3"/></g><circle cx="215" cy="38" r="11" fill="#f3c45d"/>'+end;
 return begin+'<ellipse cx="131" cy="139" rx="84" ry="10" fill="#17354b" opacity=".12"/><g transform="rotate(-8 120 80)"><rect x="60" y="18" width="119" height="119" rx="9" fill="#f3c45d" stroke="#17354b" stroke-width="3"/><path d="M78 18v119" stroke="#17354b" stroke-width="3"/><rect x="94" y="39" width="66" height="35" rx="4" fill="#fffdf8"/><path d="M106 93l18-14 18 16-16 17z" fill="#214f99"/><circle cx="157" cy="104" r="11" fill="#ea957d"/></g><path d="M191 34l7 7 12-16" fill="none" stroke="#17645c" stroke-width="5"/>'+end;
}
const foglio=(testa,corpo,extra='')=>`<div class="afm-foglio ${extra}" id="afmFoglio"><div class="afm-foglio__barra"><span>${esc(testa)}</span><span aria-hidden="true">●●●</span></div><div class="afm-foglio__corpo">${corpo}</div></div>`;
const vuoto=t=>`<p class="afm-vuoto">${esc(t)}</p>`;
const cifra=(nome,valore,extra='')=>`<div class="afm-cifra ${extra}"><span>${esc(nome)}</span><strong>${valore}</strong></div>`;
const ordineVisibile=()=>p.done.includes(2)&&!rifaOrdine?p.choices.order:ordine;
function fumetto(chi,en,it,io=false){return `<div class="afm-fumetto ${io?'afm-fumetto--io':''}" role="group" aria-label="${esc(chi)}"><p>${esc(en)}</p>${it?`<small>${esc(it)}</small>`:''}</div>`;}
function manifesto(){
 const o=offer(p),t=find(TONES,p.choices.tone);
 if(!t)return foglio('Manifesto',vuoto('Il manifesto compare qui.'));
 return foglio('Manifesto',`<div class="afm-poster afm-poster--${t.colour}" id="poster"><span class="afm-poster__kicker">${esc(t.kicker)}</span><p class="afm-poster__tit" id="posterHeading">${esc(posterTitle(p))}</p>${icon(o?.icon)}<p class="afm-poster__marca">${esc(o?.name)}</p><p class="afm-poster__piede">Parliamone insieme.</p></div>`);
}
function anteprima(s,id){
 const c=p.choices,o=offer(p),f=feature(p);
 if(s===0||s===1){
  if(!o)return foglio('La tua idea',vuoto('Qui prende forma la tua idea.'));
  return foglio('La tua idea',`<div class="afm-idea">${icon(o.icon)}<p class="afm-idea__nome">${esc(o.name)}</p></div>${f?fumetto('Il cliente',f.need):s===1?vuoto('Che cosa chiede il cliente?'):''}`);
 }
 if(s===2){
  const seq=ordineVisibile();
  return foglio('Officina Forme',`<ol class="afm-passi">${[0,1,2].map(i=>seq[i]?`<li><span class="afm-num">${i+1}</span>${esc(TASK_BREVE[seq[i]])}</li>`:`<li class="afm-passi__vuoto"><span class="afm-num">${i+1}</span></li>`).join('')}</ol>`);
 }
 if(s===3){
  const b=find(OBSTACLES,c.obstacle);
  return foglio('Officina Forme',`<p class="afm-grande">8 lavori per venerdì</p>${b?`<ul class="afm-tempo">${b.slots.map(x=>{const [giorno,cosa]=x.split(' · ');return `<li><b>${esc(giorno)}</b>${esc(cosa)}</li>`;}).join('')}</ul>`:vuoto('La tua proposta compare qui.')}`);
 }
 if(s===4){
  const q=viste('quanti'),m=economics(p);
  const resta=m.difference<0?cifra('Mancano',money(-m.difference),'afm-cifra--no'):cifra('Restano',money(m.difference),'afm-cifra--si');
  return foglio('Linea Studio',`${cifra('Escono',q?money(m.cost):'?')}<p class="afm-piccolo">${q?`Preparazione 60 € + ${m.quantity} × 7 €`:'Preparazione 60 € + 7 € a kit'}</p>${cifra('Entrano',q?money(m.revenue):'?')}${q?`<div class="afm-barre" aria-hidden="true"><i class="afm-barre__su" style="width:${m.revenue/540*100}%"></i><i class="afm-barre__giu" style="width:${m.cost/540*100}%"></i></div>${resta}`:''}`);
 }
 if(s===5){
  const m=cashflow(p),scelto=!!PAY_UI[c.payment];
  if(!scelto)return foglio('Linea Studio',`${cifra('In cassa',money(80))}${cifra('Da pagare oggi',money(m.cost))}${cifra('Mancano',money(m.cost-80),'afm-cifra--no')}`);
    return foglio('Linea Studio',`<div class="afm-giorno"><p class="afm-giorno__nome">Oggi</p><p class="afm-giorno__cifra">${money(m.todayBalance)}</p></div><div class="afm-giorno"><p class="afm-giorno__nome">Fra 14 giorni</p><p class="afm-giorno__cifra">${money(m.finalBalance)}</p></div>`);
 }
 if(s===6){
  const a=AGR_UI[c.agreement];
  return foglio('Preventivo',`<p class="afm-carta__tit">${esc(o?.name||'La tua idea')}</p><dl class="afm-carta"><div><dt>Consegna</dt><dd class="${a?'':'afm-carta__manca'}">${a?esc(a.scritto):'Da scegliere'}</dd></div></dl>`);
 }
 if(s===7){
  const a=AMD_UI[c.amendment];
  return foglio('Preventivo',`${fumetto('Il cliente','Puoi aggiungere anche un’immagine per i social?')}${a?`<dl class="afm-carta"><div><dt>Nel preventivo</dt><dd>${esc(a.scritto)}</dd></div></dl>`:vuoto('La tua risposta compare qui.')}`);
 }
 if(s===8)return manifesto();
 if(s===9){
  const q=question(p),r=find(q?.responses||[],c.response),d=DOM_UI[q?.id]||{reply:'',tr:''};
  if(id==='risposta')return foglio('Cliente inglese',`${fumetto('Il cliente',d.reply,d.tr)}${r?fumetto('Tu',RISP_UI[r.id].en,'',true):''}`);
  return foglio('Cliente inglese',`${fumetto('Il cliente','Hello! I’d like to know more about your idea.')}${q?fumetto('Tu',q.en,q.it,true):''}`);
 }
 return '';
}

// ---------------------------------------------------------------------------------------------
// L'azione dello schermo (una sola) e il suo esito.
const scelta=(attr,val,testo,premuto,extra='')=>`<button type="button" class="bt-scelta ${extra}" id="afm-${attr}-${esc(val)}" data-${attr}="${esc(val)}" aria-pressed="${premuto}"><span class="afm-scelta__testo">${testo}</span></button>`;
const sceltaIcona=(attr,val,icona,testo,premuto)=>`<button type="button" class="bt-scelta" id="afm-${attr}-${esc(val)}" data-${attr}="${esc(val)}" aria-pressed="${premuto}">${icona}<span class="afm-scelta__testo">${testo}</span></button>`;
function azione(s,id){
 const c=p.choices;
 if(s===0)return `<div class="bt-scelte">${OFFERS.map(x=>sceltaIcona('offer',x.id,icon(x.icon,true),esc(x.title),c.offer===x.id)).join('')}</div>`;
 if(s===1)return `<div class="bt-scelte">${(offer(p)?.features||[]).map(x=>scelta('feature',x.id,esc(x.title),c.feature===x.id)).join('')}</div>`;
 if(s===2){
  const seq=ordineVisibile();
  const bottoni=TASKS.map(x=>{const i=seq.indexOf(x.id);return `<button type="button" class="bt-scelta afm-ordine" id="afm-passo-${x.id}" data-passo="${x.id}" aria-pressed="${i>=0}" ${i>=0?'disabled':''}><span class="afm-num">${i>=0?i+1:''}</span>${esc(TASK_UI[x.id])}</button>`;}).join('');
  return `<div class="bt-scelte">${bottoni}</div>${seq.length&&!(rifaOrdine&&seq.length<3)?'<button type="button" class="bt-link" id="ordineDaCapo">Cambia l’ordine</button>':''}`;
 }
 if(s===3)return `<div class="bt-scelte">${OBSTACLES.map(x=>scelta('obstacle',x.id,esc(OBS_UI[x.id].label),c.obstacle===x.id)).join('')}</div>`;
 if(s===4&&id==='quanti')return `<div class="bt-scelte afm-tre">${[10,20,30].map(v=>scelta('qta',v,`<b class="afm-numero">${v}</b><small>kit</small>`,viste('quanti')&&c.quantity===v)).join('')}</div>`;
 if(s===5)return `<div class="bt-scelte">${['anticipo','dopo'].map(k=>scelta('pay',k,esc(PAY_UI[k].label),c.payment===k)).join('')}</div>`;
 if(s===6)return `<div class="bt-scelte">${AGREEMENTS.map(x=>scelta('accordo',x.id,esc(AGR_UI[x.id].label),c.agreement===x.id)).join('')}</div>`;
 if(s===7)return `<div class="bt-scelte">${AMENDMENTS.map(x=>scelta('richiesta',x.id,esc(AMD_UI[x.id].label),c.amendment===x.id)).join('')}</div>`;
 if(s===8)return `<div class="bt-scelte">${TONES.map(x=>scelta('tono',x.id,esc(x.title),c.tone===x.id)).join('')}</div>`;
 if(s===9&&id==='domanda')return `<div class="bt-scelte">${QUESTIONS.map(x=>scelta('domanda',x.id,esc(x.en),c.question===x.id)).join('')}</div>`;
 if(s===9&&id==='risposta')return `<div class="bt-scelte">${(question(p)?.responses||[]).map(x=>scelta('risposta',x.id,`${esc(RISP_UI[x.id].en)}<small>${esc(RISP_UI[x.id].it)}</small>`,c.response===x.id)).join('')}</div>`;
 return '';
}
function esito(s,id){
 const c=p.choices;
 if(s===5)return PAY_UI[c.payment]?.esito||'';
 return '';
}

function activity(){
 const s=p.screen,lab=Math.floor(s/2),L=LAB_UI[lab];
 sub=Math.max(0,Math.min(sub,PASSI[s].length-1));
 const step=PASSI[s][sub],fatto=step.fatto();
 const pos=prima(s)+sub+1;
 const ultimo=sub===PASSI[s].length-1&&s%2===1;
 const legame=ultimo&&fatto&&ready(p,lab*2)&&ready(p,lab*2+1)?`<p class="afm-legame bt-entra"><b>In AFM</b> ${esc(L.legame)}</p>`:'';
 const testo=esito(s,step.id);
 return `<section class="bt-schermo bt-schermo--sinistra afm-schermo" data-corso="afm" data-passo="${s}-${step.id}">
  <div class="afm-testa"><progress class="bt-avanzamento" value="${pos}" max="${TOTALE}" aria-label="Schermo ${pos} di ${TOTALE}"></progress></div>
  <div class="afm-griglia">
   <h1 class="bt-titolo bt-titolo--medio afm-titolo" id="stageTitle" tabindex="-1">${esc(step.titolo)}</h1>
   <p class="bt-frase afm-frase">${esc(step.frase)}</p>
   <div class="afm-anteprima" aria-label="Quello che stai costruendo">${anteprima(s,step.id)}</div>
   <div class="afm-azione">${azione(s,step.id)}</div>
   <div class="afm-esito" role="status" aria-live="polite">${testo?`<p>${esc(testo)}</p>`:''}${legame}</div>
  </div>
  <div class="bt-azioni bt-azioni--estremi afm-nav"><button id="previous" type="button" class="bt-pulsante bt-pulsante--secondario">Indietro</button><button id="next" type="button" class="bt-pulsante" ${fatto?'':'disabled'}>Avanti</button></div>
 </section>`;
}

function intro(){
 const finished=p.started&&p.screen===10&&completed(p);
 const label=p.started?'Riprendi':'Inizia';
 return `<section class="bt-schermo afm-intro" data-corso="afm">
  <div class="afm-intro__testo">
   <p class="bt-occhiello bt-occhiello--corso">AFM · Amministrazione, Finanza e Marketing</p>
   <h1 class="bt-titolo" id="stageTitle" tabindex="-1">Lancia la tua <em>idea</em>.</h1>
   <p class="bt-frase">In AFM impari a trasformare un’idea in un piano di attività.</p>
  </div>
  <div class="afm-intro__demo" aria-hidden="true"><div class="afm-foglio afm-demo"><div class="afm-foglio__barra"><span>La tua idea</span><span>●●●</span></div><div class="afm-foglio__corpo"><div class="afm-idea">${icon('book')}<p class="afm-idea__nome">Segno</p><p>Quaderni con una storia</p></div><p class="afm-demo__si">Il cliente dice sì ✓</p></div></div><span class="afm-bollino">La lanci tu!</span></div>
  <div class="bt-azioni afm-intro__azioni"><button id="start" class="bt-pulsante bt-pulsante--grande bt-pulsa" type="button">${finished?'Riprendi':label}</button>${p.started?'<button id="startOver" class="bt-link" type="button">Inizia da capo</button>':''}</div>
 </section>`;
}

// Riepilogo del lavoro: dietro «Rivedi il tuo lavoro» del finale, o se il lavoro non è ancora completo.
function end(){
 const o=offer(p),f=feature(p),b=find(OBSTACLES,p.choices.obstacle),m=economics(p),a=AGR_UI[p.choices.agreement],ch=AMD_UI[p.choices.amendment],q=question(p),r=find(q?.responses||[],p.choices.response);
 const testi=[
  `${o?esc(o.name)+' · '+esc(o.title):'Idea da scegliere'}. ${esc(f?.text||'')}`,
  `${p.choices.order.map(id=>TASK_UI[id]).join(' → ')}. ${esc(b?OBS_UI[b.id].label:'Imprevisto da affrontare')}.`,
  `${m.quantity} kit a ${m.price} €: entrano ${money(m.revenue)}, escono ${money(m.cost)}. ${p.choices.payment==='anticipo'?'Il cliente paga prima una parte.':'Il fornitore aspetta 14 giorni.'}`,
  `${esc(a?.scritto||'Consegna da scegliere')} ${esc(ch?.scritto||'')}`,
  `«${esc(posterTitle(p))}» ${esc(q?.en||'')} ${esc(r?RISP_UI[r.id].en:'')}`
 ];
 const manca=LAB_UI.map((l,i)=>i).filter(i=>![i*2,i*2+1].every(s=>ready(p,s)&&p.done.includes(s)));
 return `<section class="bt-schermo afm-rivedi" data-corso="afm">
  <h1 class="bt-titolo bt-titolo--medio" id="stageTitle" tabindex="-1">Il tuo <em>lavoro</em></h1>
  ${manca.length?`<p class="bt-frase">Per finire, rifai: ${manca.map(i=>esc(LAB_UI[i].nome)).join(', ')}.</p>`:''}
  <ol class="afm-rivedi__lista">${LAB_UI.map((l,i)=>`<li class="bt-scheda bt-scheda--scura"><p class="afm-occhiello">${i+1} · ${esc(l.cliente)}</p><h2>${esc(l.nome)}</h2><p>${testi[i]}</p><button class="bt-pulsante bt-pulsante--secondario bt-pulsante--piccolo" type="button" data-goto="${i*2}">Rivedi</button></li>`).join('')}</ol>
  ${completed(p)?'<div class="bt-azioni"><button class="bt-pulsante bt-pulsante--grande" type="button" id="backToFinale">Torna al finale</button></div>':''}
 </section>`;
}

function showFinale(){mostraFinale({corso:COURSE,contenitore:$('stage'),treCose:TRE_COSE,apriAttestato:()=>attestato.prepara(),rivediLavoro:()=>{reviewing=true;render(true);},token:()=>remote.token(),salvato:async()=>{await remote.sync();return remote.saved();}});}
function render(focus=false,notify=true){
 const active=document.activeElement?.id;
 $('journey').innerHTML='';
 if(p.screen<10)reviewing=false;
 const isIntro=navigation.isIntro()||p.screen<0;
 if(p.screen>=10&&!isIntro&&completed(p)&&!reviewing){$('stage').replaceChildren();showFinale();}
 else{$('main').classList.add('bt-scuro');$('stage').innerHTML=isIntro?intro():p.screen>=10?end():activity();}
 navigation.write(isIntro?'ingresso':p.screen>=10?'conclusione':`passaggio-${p.screen+1}`,!notify,storageId);
 save(notify);updateRecovery();
 if(focus){$('stageTitle')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 else if(active&&$(active)){let el=$(active);if(el.disabled)el=$('stage').querySelector('.afm-azione button:not(:disabled)')||$('next');el?.focus({preventScroll:true});}
}
// Effetto a ogni scelta: scintilla sul pulsante toccato e il foglio che «risponde».
function effetto(id){const b=id&&$(id);if(b)scintilla(b,'afm');const t=$('afmFoglio');if(t){t.classList.remove('afm-foglio--cambia');void t.offsetWidth;t.classList.add('afm-foglio--cambia');}}
// Dopo la scelta che completa lo schermo, «Avanti» entra nella vista (sul telefono può stare più in basso).
function scegli(id,fn){const prima=PASSI[p.screen]?.[sub]?.fatto();fn();render();effetto(id);const n=$('next');if(!prima&&n&&!n.disabled)n.scrollIntoView?.({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}

function updateRecovery(){let entries=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(`${STORE}.`)&&!k.includes('latest')&&!k.includes('unrecognised')){try{const x=JSON.parse(localStorage.getItem(k));if(validProject(x))entries.push(x);}catch{}}}}catch{}entries.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));$('previousProjects').innerHTML=entries.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(offer(x)?.name||'Nuova prova')} · ${new Date(x.updatedAt||Date.now()).toLocaleString('it-IT')} ${x.id===p.id?'· attuale':''}</option>`).join('');}
function renderNotes(){$('noteContext').value=navigation.isIntro()?'Ingresso · presentazione':context(p).label;$('notesList').innerHTML=p.notes.length?p.notes.map(n=>`<article class="saved-note"><small>${esc(n.role==='docente'?'Docente':'Alunno')} · ${esc(n.kind)} · ${new Date(n.createdAt).toLocaleString('it-IT')}</small><strong>${esc(n.label)}</strong><p>${esc(n.text)}</p></article>`).join(''):'<p class="helper">Non hai ancora scritto note.</p>';}
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
 // Tappa 3: i tre compiti toccati in fila; al terzo tocco l'ordine è fatto.
 if(b.dataset.passo){const id=b.id,v=b.dataset.passo;scegli(id,()=>{if(!ordine.includes(v))ordine.push(v);if(ordine.length===3){choose(p,'order',[...ordine]);rifaOrdine=false;}});return;}
 if(b.id==='ordineDaCapo'){ordine=[];rifaOrdine=true;render();$('stage').querySelector('[data-passo]')?.focus();return;}
 if(b.dataset.offer){const id=b.id;scegli(id,()=>choose(p,'offer',b.dataset.offer));return;}
 if(b.dataset.feature){const id=b.id;scegli(id,()=>choose(p,'feature',b.dataset.feature));return;}
 if(b.dataset.obstacle){const id=b.id;scegli(id,()=>choose(p,'obstacle',b.dataset.obstacle));return;}
 if(b.dataset.qta){const id=b.id;scegli(id,()=>{visto.add('quanti');choose(p,'quantity',Number(b.dataset.qta));});return;}
 if(b.dataset.pay){const id=b.id;scegli(id,()=>choose(p,'payment',b.dataset.pay));return;}
 if(b.dataset.accordo){const id=b.id;scegli(id,()=>choose(p,'agreement',b.dataset.accordo));return;}
 if(b.dataset.richiesta){const id=b.id;scegli(id,()=>choose(p,'amendment',b.dataset.richiesta));return;}
 if(b.dataset.tono){const id=b.id;scegli(id,()=>choose(p,'tone',b.dataset.tono));return;}
 if(b.dataset.domanda){const id=b.id;scegli(id,()=>choose(p,'question',b.dataset.domanda));return;}
 if(b.dataset.risposta){const id=b.id;scegli(id,()=>choose(p,'response',b.dataset.risposta));return;}
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
 ingressoComune:true,apriIngresso:()=>mostraIngresso({corso:COURSE,contenitore:$('stage'),classe:classAccess,onInizia:startNow,onIndietro:()=>render(true)})});
attestato=setupParticipantCertificate({project:()=>p,journey:()=>p,save,identity:()=>classAccess.identity(),participant:()=>remote.participant(),revision:()=>remote.revision()});
$('retrySave').addEventListener('click',()=>remote.sync());
window.addEventListener('online',()=>remote.sync());
iniziaMenu();
restoreRoute(navigation.route());render(false,false);if(remote.token())remote.sync();