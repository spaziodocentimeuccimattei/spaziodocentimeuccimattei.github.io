import {setupExperienceNavigation} from './bussola-navigazione.mjs?v=20261018-flow';
import {classEntry,setupClass} from './bussola-classe.mjs?v=20261115-riordino';
import {setupParticipantCertificate} from './bussola-attestato-alunno.mjs?v=20261115-riordino';
import {setupTourismRemote} from './turismo-remote.mjs?v=20261115-riordino';
import {rememberParticipant} from './bussola-identita.mjs?v=20261019-monitor';
import {mostraIngresso} from './bussola-ingresso-comune.mjs?v=20261115-riordino';
import {mostraFinale} from './bussola-finale-comune.mjs?v=20261118-qr2';
import {scintilla} from './bussola-effetti.mjs?v=20261115-riordino';
import {iniziaMenu} from './bussola-menu.mjs?v=20261115-riordino';
import {KEY as BASE_KEY,LABS,PLACES,QUESTIONS,WELCOMES,PLANS,RAIN,SERVICES,TERMS,TONES,createProject,restore,choose,canAdvance,next,complete,costs} from './turismo-core.mjs?v=20261115-riordino';
const COURSE='turismo';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localTest=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('prova');
const entryAlumno=classEntry().alunno,KEY=BASE_KEY+(entryAlumno?':alunno:'+entryAlumno:'')+(localTest?':prova:'+localTest:'');
const recoveryKey=KEY+':conservati';
let storageOK=true,p,remote,classAccess,attestato;
const requested=new URL(location.href).searchParams.get('progetto');
try {const id=requested||localStorage.getItem(KEY+'.active');p=id?restore(JSON.parse(localStorage.getItem(KEY+'.'+id)||'null')):null;}catch{storageOK=false;}
p??=createProject();if(!requested){const personal=new URL(location.href);personal.searchParams.set('progetto',p.id);window.history.replaceState(null,'',personal.href);}const storageId=requested||p.id;let mode='intro',maxSeen=Math.max(p.screen,Math.min(10,Number(p.choices.maxSeen)||0)),context='Ingresso',reviewing=false;
function keep(){p.updatedAt=new Date().toISOString();p.choices.maxSeen=maxSeen;try{localStorage.setItem(KEY+'.'+storageId,JSON.stringify(p));localStorage.setItem(KEY+'.active',storageId);storageOK=true;}catch{storageOK=false;} $('noteCount').textContent=p.notes.length;}
function save(){keep();remote?.changed();}
const navigation=setupExperienceNavigation(route=>{restoreRoute(route);render();});
function restoreRoute(route){const n=route==='conclusione'?10:Number(route.match(/^passaggio-(\d+)$/)?.[1])-1;if(p.started&&Number.isInteger(n)&&n>=0&&n<=maxSeen){mode='work';p.screen=n;navigation.enter();}else{mode='intro';navigation.showIntro();}}
function loaded(project){p=project;maxSeen=Math.max(p.screen,p.choices.maxSeen||0);restoreRoute(navigation.route());keep();render();}
function savedActivities(){
 const saved=JSON.parse(localStorage.getItem(recoveryKey)||'[]');
 if(!Array.isArray(saved))throw new Error('Elenco delle attività non riconosciuto.');
 return saved;
}
function showSavedActivities(){
 const box=$('savedActivities');box.replaceChildren();
 try{
  const entries=savedActivities();if(!entries.length)return;
  const heading=document.createElement('h3'),list=document.createElement('ul');heading.textContent='Attività conservate';
  for(const entry of entries){
   const url=new URL(entry.url,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname)continue;
   const item=document.createElement('li'),link=document.createElement('a');link.href=url.href;link.textContent=`Apri l’attività del ${new Date(entry.date).toLocaleString('it-IT')}`;item.append(link);list.append(item);
  }
  box.append(heading,list);
 }catch{box.textContent='L’elenco delle attività conservate non è disponibile. I lavori restano sul dispositivo.';}
}
function newActivity(){
 keep();
 try{
  // Archive the existing URL before changing capability; the original storage and owner stay intact.
  if(!storageOK)throw new Error();
  const entries=savedActivities(),oldURL=new URL(location.href);
  if(oldURL.hash.includes('=')){const params=new URLSearchParams(oldURL.hash.slice(1));params.set('passaggio','ingresso');oldURL.hash=params.toString();}else oldURL.hash='ingresso';
  const archive=p.started||p.notes.length?[{url:oldURL.href,date:p.updatedAt},...entries.filter(x=>x.url!==oldURL.href)]:entries;
  const token=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  // Carry recovery links into this new activity only, never into “Cambia partecipante”.
  localStorage.setItem(BASE_KEY+':alunno:'+token+(localTest?':prova:'+localTest:'')+':conservati',JSON.stringify(archive));
  const url=new URL(location.href),params=new URLSearchParams({alunno:token}),entry=classEntry();if(entry.classe)params.set('classe',entry.classe);
  url.searchParams.set('progetto',crypto.randomUUID());url.hash=params.toString();rememberParticipant(token,entry.classe);location.assign(url.href);
 }catch{$('saved').textContent='Non riesco a conservare il lavoro precedente. Resta in questa attività e riprova.';}
}
// «Inizia da capo»: sullo stesso dispositivo si alternano persone diverse. Conserva il lavoro presente,
// dimentica il codice personale di chi c'era prima e apre un lavoro nuovo dall'ingresso.
function startOver(senzaClasse=false){save();document.dispatchEvent(new CustomEvent('bussola-progetto-nuovo'));const u=new URL(location.href),h=new URLSearchParams(u.hash.includes('=')?u.hash.slice(1):'');h.delete('alunno');h.delete('passaggio');if(senzaClasse===true)h.delete('classe');u.searchParams.set('progetto',crypto.randomUUID());u.hash=h.get('classe')?h.toString():'ingresso';location.assign(u.href);}

// ---------------------------------------------------------------------------------------------
// Testi che il ragazzo legge. I dati in turismo-core.mjs (nomi, descrizioni, frasi) restano quelli di prima, perché li leggono
// monitoraggio, attestato e riepilogo dei docenti: qui ci sono solo i testi «da schermo». Elenco prima → dopo:
// docs/bussola/riordino-2026-11/testi-turismo.md
const LAB_UI=[
 {nome:'Racconta un luogo',chi:'Cala delle Trame',legame:'impari a valorizzare i luoghi.'},
 {nome:'Accogli due visitatori',chi:'Sam e Jo',legame:'usi le lingue per incontrare culture diverse.'},
 {nome:'Progetta la visita',chi:'Gruppo di ragazzi',legame:'impari a organizzare tappe e tempi.'},
 {nome:'Fai il prezzo',chi:'Il tuo studio',legame:'impari a confrontare costi e risorse.'},
 {nome:'Scrivi l’invito',chi:'Il tuo studio',legame:'impari a comunicare e verificare le informazioni.'}
];
// Le tre cose del finale: fonti in docs/bussola/riordino-2026-11/testi-turismo.md
const TRE_COSE=['Fai conoscere un luogo e il suo patrimonio.','Organizzi un’esperienza e ne confronti i costi.','Parli con persone di culture diverse, anche in inglese.'];
const ANGOLO_UI={
 gesto:'Si vede come un’idea prende forma nell’argilla.',
 incontro:'La ceramista racconta il suo lavoro e risponde alle domande.',
 dettaglio:'Un piccolo dettaglio può cambiare un intero oggetto.',
 oggetto:'Un oggetto racconta i luoghi e le persone che ha incontrato.',
 voci:'La stessa partenza raccontata da persone diverse.',
 mappa:'Una mappa collega persone, incontri e storie.',
 luce:'I riflessi cambiano durante il giorno.',
 equilibrio:'Si segue il sentiero e gli animali si guardano da lontano.',
 stagioni:'Acqua, piante e animali cambiano con le stagioni.'};
const PIOGGIA_UI={
 coperto:'Se piove: alternativa al coperto.',
 rinvio:'Se piove: nuova data o rimborso.',
 rimborso:'Se piove: annulliamo e rimborsiamo.'};
const DOMANDA_UI={fare:'Volete guardare o creare?',tempo:'Quanto tempo avete?',interesse:'Che cosa vi incuriosisce?'};
const LUOGO_UI={bottega:'La bottega',museo:'Il museo',laguna:'La laguna'};
const find=(list,id)=>list.find(x=>x.id===id);
const money=n=>{const v=Number(n);return (Number.isInteger(v)?String(v):v.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}))+' €';};
const costo=s=>[s.fixed?(s.perPerson?`${s.fixed} €`:`${s.fixed} € a gruppo`):'',s.perPerson?`${s.perPerson} € a persona`:''].filter(Boolean).join(' + ');
const place=()=>find(PLACES,p.choices.place),angle=()=>place()?.angles.find(a=>a[0]===p.choices.angle);
const question=()=>find(QUESTIONS,p.choices.question),welcome=()=>WELCOMES[p.choices.question]?.find(w=>w[0]===p.choices.welcome);
const titoloStoria=()=>p.choices.storyTitle||angle()?.[1]||'';
const titoloInvito=()=>p.choices.posterTitle||find(TONES,p.choices.tone)?.headline||'';

// Gli schermi: un titolo, una frase, una scelta. «fatto» sblocca Avanti (stessa regola di canAdvance nel nucleo).
const SAM={bottega:['la bottega di ceramica','the pottery studio'],museo:['il museo dei viaggi','the travel museum'],laguna:['la laguna','the lagoon']};
const PASSI=[
 {id:'luogo',titolo:'Che luogo fai scoprire?',frase:'Scegli un posto di Cala delle Trame.'},
 {id:'storia',titolo:'Che storia racconti?',frase:'Scegli il punto di partenza.'},
 {id:'domanda',titolo:'Che cosa chiedi a Sam e Jo?',frase:()=>`Vogliono visitare ${(SAM[p.choices.place]||SAM.bottega)[0]}.`},
 {id:'risposta',titolo:'Come rispondi a Sam e Jo?',frase:()=>question()?.need||'Scegli la tua risposta.'},
 {id:'esperienza',titolo:'Che cosa fa il gruppo?',frase:()=>`${costs(p.choices.service,p.choices.people).count} ragazzi, 90 minuti, nessun gradino.`},
 {id:'pioggia',titolo:'Piove: che cosa cambi?',frase:'La laguna è chiusa.'},
 {id:'servizio',titolo:'Che cosa aggiungi alla visita?',frase:'Guarda il prezzo a persona.'},
 {id:'condizione',titolo:'Che cosa dici se piove?',frase:'Chi prenota deve saperlo prima.'},
 {id:'invito',titolo:'Come inviti i visitatori?',frase:'Scegli la voce dell’invito.'},
 {id:'bozza',titolo:'Controlla la bozza dell’intelligenza artificiale.',frase:'L’IA ha scritto l’invito: due promesse sono sbagliate.'}
];
const TOTALE=PASSI.length;

// ---------------------------------------------------------------------------------------------
// Illustrazioni (contenuto, non interfaccia).
function art(type='map',pin=''){
 const sede=PLACES.find(x=>x.id===pin),cx=sede?Math.round(sede.x*5.6):0,cy=sede?Math.round(sede.y*3.2):0;
 const alt=type==='clay'?'Illustrazione di ceramiche e motivi geometrici':type==='camera'?'Illustrazione di un racconto per immagini':'Mappa illustrata di un territorio immaginario';
 const base=`<svg viewBox="0 0 560 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${alt}" xmlns="http://www.w3.org/2000/svg">`;
 if(type==='clay')return base+`<rect width="560" height="320" fill="#dddac5"/><circle cx="400" cy="70" r="115" fill="#bdd4c1"/><path d="M0 265Q180 240 560 278V320H0" fill="#c9b899"/><ellipse cx="265" cy="260" rx="145" ry="25" fill="#778a6a" opacity=".2"/><path d="M210 80h88l-5 48q80 105 17 130h-133q-55-25 27-130z" fill="#bc744b"/><path d="M190 185h123M196 201h112M205 220h89" stroke="#f6e5c9" stroke-width="5"/><path d="M220 159l15 18 15-18 15 18 15-18 15 18" fill="none" stroke="#f6e5c9" stroke-width="5"/><ellipse cx="256" cy="81" rx="43" ry="10" fill="#634634"/><path d="M360 210q38 65 94 0z" fill="#ecb37b"/><path d="M63 211h75v51H63z" fill="#eef0dd"/><path d="M77 216l12 17 12-17 12 17 12-17" fill="none" stroke="#548074" stroke-width="4"/><circle cx="416" cy="137" r="26" fill="none" stroke="#3d7065" stroke-width="4"/><path d="M404 137h24m-12-12v24" stroke="#3d7065" stroke-width="3"/></svg>`;
 if(type==='camera')return base+`<rect width="560" height="320" fill="#d6e1d5"/><rect x="55" y="42" width="175" height="215" rx="7" transform="rotate(-8 142 150)" fill="#fffdf3"/><path d="M73 202l33-62 44 36 34-75 35 95" fill="#9eb9a0"/><circle cx="121" cy="92" r="24" fill="#d59c65"/><rect x="292" y="83" width="196" height="148" rx="18" fill="#244f49"/><path d="M332 83l15-23h76l13 23" fill="#244f49"/><circle cx="390" cy="154" r="47" fill="#dbe4d5"/><circle cx="390" cy="154" r="30" fill="#629488"/><circle cx="452" cy="104" r="7" fill="#e8be85"/><path d="M271 264h203" stroke="#bfa473" stroke-width="5"/><circle cx="286" cy="50" r="18" fill="none" stroke="#558074" stroke-width="3"/></svg>`;
 return base+`<rect width="560" height="320" fill="#d8e5d7"/><path d="M367-10q-65 92 3 157t-43 185h233V-10z" fill="#96c6bd"/><path d="M391 0q-65 70 8 140t-32 187" fill="none" stroke="#b6dcd1" stroke-width="13"/><path d="M20 230Q140 146 225 212T375 246" fill="none" stroke="#f8f5dc" stroke-width="22"/><path d="M125 21Q178 125 127 219" fill="none" stroke="#f8f5dc" stroke-width="16"/><path d="M118 99Q214 123 246 188" fill="none" stroke="#f8f5dc" stroke-width="15"/><path d="M137 98L250 190l170-91" fill="none" stroke="#537c60" stroke-width="2" stroke-dasharray="5 6"/><rect x="79" y="65" width="96" height="58" rx="7" fill="#fff9e6"/><path d="M77 65l50-30 50 30" fill="#cb8c60"/><path d="M99 79v26m26-26v26m26-26v26" stroke="#42746b" stroke-width="7"/><rect x="215" y="166" width="84" height="64" rx="5" fill="#e9c497"/><path d="M208 166l47-27 49 27" fill="#bc7750"/><rect x="231" y="188" width="19" height="42" fill="#45736b"/><rect x="269" y="184" width="17" height="17" fill="#f5efd8"/><path d="M404 92q15-21 30 0m-34 25q15-21 30 0" fill="none" stroke="#f0f6e4" stroke-width="4"/><path d="M66 278v-21m-6 7l6-10 6 10M302 69V48m-6 7l6-10 6 10" stroke="#628465" stroke-width="4"/><circle cx="139" cy="121" r="7" fill="#174b46"/><circle cx="255" cy="231" r="7" fill="#174b46"/><circle cx="420" cy="122" r="7" fill="#174b46"/>${sede?`<g class="tur-pin"><circle class="tur-pin__anello" cx="${cx}" cy="${cy}" r="30"/><circle class="tur-pin__punto" cx="${cx}" cy="${cy}" r="13"/></g>`:''}</svg>`;
}
function laguna(stagione){return `<svg viewBox="0 0 240 110" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione della laguna in ${stagione==='estate'?'estate, acqua più bassa e sole alto':'inverno, acqua più alta e cielo nuvoloso'}"><rect width="240" height="110" fill="${stagione==='estate'?'#eee5c8':'#c9dcd7'}"/><circle cx="185" cy="25" r="16" fill="${stagione==='estate'?'#d29b58':'#e8eee6'}"/><path d="M0 70q60-23 124-2t116-14v56H0z" fill="#729778"/><path d="M0 ${stagione==='estate'?88:69}q65-10 123 5t117-7v43H0z" fill="#86bfb6"/><path d="M44 73v-23m-8 8l8-12 8 12" fill="none" stroke="#416c54" stroke-width="3"/><path d="M83 96q15-6 30 0m48-7q14-6 27 0" fill="none" stroke="#cee8dd" stroke-width="2"/></svg>`;}
const ICONE={
 bottega:'<svg viewBox="0 0 56 56" class="tur-ico" aria-hidden="true"><path d="M20 10h16l-2 9c9 9 8 24-6 24s-15-15-6-24z" fill="#bc744b" stroke="#0b2f47" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 30h18M20 36h16" stroke="#f6e5c9" stroke-width="2.5"/></svg>',
 museo:'<svg viewBox="0 0 56 56" class="tur-ico" aria-hidden="true"><path d="M8 22 28 9l20 13z" fill="#7fe3e0" stroke="#0b2f47" stroke-width="2.5" stroke-linejoin="round"/><path d="M13 26v16m10-16v16m10-16v16m10-16v16" stroke="#0b2f47" stroke-width="3.5" stroke-linecap="round"/><path d="M8 46h40" stroke="#0b2f47" stroke-width="3.5" stroke-linecap="round"/></svg>',
 laguna:'<svg viewBox="0 0 56 56" class="tur-ico" aria-hidden="true"><circle cx="39" cy="17" r="8" fill="#ffd166" stroke="#0b2f47" stroke-width="2.5"/><path d="M6 33q5.5-6 11 0t11 0t11 0t11 0M6 44q5.5-6 11 0t11 0t11 0t11 0" fill="none" stroke="#0e8d8b" stroke-width="3.5" stroke-linecap="round"/></svg>'};
const arteLuogo=()=>{const id=p.choices.place;return id==='bottega'?art('clay'):id==='museo'?art('camera'):id==='laguna'?laguna('estate'):art('map');};

// ---------------------------------------------------------------------------------------------
// Il prodotto che prende forma accanto a ogni schermo: un foglio con la barra del colore dell'indirizzo.
const foglio=(testa,corpo,extra='')=>`<div class="tur-foglio ${extra}" id="turFoglio"><div class="tur-foglio__barra"><span>${esc(testa)}</span><span aria-hidden="true">●●●</span></div><div class="tur-foglio__corpo">${corpo}</div></div>`;
const vuoto=t=>`<p class="tur-vuoto">${esc(t)}</p>`;
const fumetto=(en,it,io=false)=>`<div class="tur-fumetto ${io?'tur-fumetto--io':''}"><p>${esc(en)}</p>${it?`<small>${esc(it)}</small>`:''}</div>`;
const riga=(nome,valore,extra='')=>`<div class="tur-cifra ${extra}"><span>${esc(nome)}</span><strong>${esc(valore)}</strong></div>`;
function chat(s){
 const q=question(),w=welcome();
 if(s===3)return (q?fumetto(q.reply,''):'')+(w?fumetto(w[2],'',true):'');
 return fumetto(`Hello! We’d like to visit ${(SAM[p.choices.place]||SAM.bottega)[1]}.`,'')+(q?fumetto(q.en,'',true)+fumetto(q.reply,''):'');
}
function programma(piano,pioggia,daCambiare=false){
 return `<ul class="tur-programma">${piano.slots.map(([nome,min],i)=>`<li class="${i===2?(pioggia?'tur-programma__cambia':daCambiare?'tur-programma__da-cambiare':''):''}"><b>${min}′</b><span>${esc(i===2&&pioggia?pioggia.label:nome)}</span></li>`).join('')}</ul>`;
}
function invito(conDati){
 const t=find(TONES,p.choices.tone),piano=find(PLANS,p.choices.plan),c=costs(p.choices.service,p.choices.people);
 return `<div class="tur-poster tur-poster--${esc(t?.id||'scoperta')}" id="poster"><p class="tur-poster__marca">Cala delle Trame</p><div class="tur-arte tur-arte--basso">${art(piano?.visual||'map')}</div><p class="tur-poster__tit" id="posterHeading">${esc(titoloInvito()||'Il tuo invito compare qui.')}</p><p class="tur-poster__riga"><b>${esc(piano?.name)}</b> · ${conDati?`90 minuti · ${money(c.each)} a persona`:'90 minuti'}</p><span class="tur-poster__cta">Chiedi informazioni</span></div>`;
}
function anteprima(s){
 const c=p.choices,pl=place(),an=angle(),q=question(),w=welcome(),piano=find(PLANS,c.plan),pioggia=find(RAIN,c.rain),sv=find(SERVICES,c.service),cond=find(TERMS,c.terms),t=find(TONES,c.tone),cs=costs(c.service,c.people);
 if(s===0)return foglio('La mappa',`<div class="tur-arte">${art('map',c.place)}</div>${pl?`<p class="tur-nome">${esc(pl.short)}</p>`:vuoto('Il luogo compare qui.')}`);
 if(s===1){
  const quadro=pl?.id==='laguna'&&c.angle==='stagioni'?`<div class="tur-stagioni"><figure>${laguna('estate')}<figcaption>Estate</figcaption></figure><figure>${laguna('inverno')}<figcaption>Inverno</figcaption></figure></div>`:`<div class="tur-arte">${arteLuogo()}</div>`;
  return foglio('La tua storia',`${quadro}${an?`<p class="tur-nome">${esc(ANGOLO_UI[an[0]])}</p>`:vuoto('La tua storia compare qui.')}`);
 }
 if(s===2||s===3)return foglio('Chat',chat(s)+(s===2&&!q?vuoto('La tua domanda compare qui.'):s===3&&!w?vuoto('La tua risposta compare qui.'):''));
 if(s===4)return foglio('Programma',piano?programma(piano,null):vuoto('Il programma compare qui.'));
 if(s===5)return foglio('Programma',piano?programma(piano,pioggia,true):vuoto('Prima scegli il programma.'));
 if(s===6){
  const scelto=!!sv;
  return foglio('Prezzo',`${riga('Costi base',money(cs.guide+cs.space+cs.materials))}${scelto?riga('Servizio in più',money(cs.extra)):`<p class="tur-vuoto tur-vuoto--basso">Il servizio compare qui.</p>`}${riga('A persona',scelto?money(cs.each):'?','tur-cifra--grande')}`);
 }
 if(s===7)return foglio('Offerta',`<p class="tur-nome">${money(cs.each)} a persona · 90 minuti</p>${cond?`<p class="tur-condizione">${esc(PIOGGIA_UI[cond.id])}</p>`:vuoto('La condizione compare qui.')}`);
 if(s===8)return foglio('Invito',t?invito(false):vuoto('L’invito compare qui.'));
 if(s===9){
  const pioggiaTesto=PIOGGIA_UI[cond?.id]||'';
  const corpo=c.repair
   ?`<div class="tur-bozza tur-bozza--giusta"><p class="tur-bozza__testo">“Trasporto e pasti esclusi. ${esc(pioggiaTesto)}”</p><p class="tur-bozza__esito">Ora l’invito corrisponde alla tua offerta.</p></div>`
   :`<div class="tur-bozza"><p class="tur-bozza__testo">“<span class="tur-sbagliato">Trasporto incluso</span> e attività <span class="tur-sbagliato">sempre all’aperto</span>”</p></div><div class="tur-dati"><b>La tua offerta</b><p>Trasporto e pasti esclusi. ${esc(pioggiaTesto)}</p></div>`;
  return foglio('Bozza IA',corpo);
 }
 return '';
}

// ---------------------------------------------------------------------------------------------
// L'azione dello schermo (una sola).
const scelta=(attr,val,testo,premuto,icona='')=>`<button type="button" class="bt-scelta" id="tur-${attr}-${esc(val)}" data-key="${attr}" data-value="${esc(val)}" aria-pressed="${premuto}">${icona}<span class="tur-scelta__testo">${testo}</span></button>`;
function azione(s){
 const c=p.choices;
 if(s===0)return `<div class="bt-scelte">${PLACES.map(x=>scelta('place',x.id,esc(LUOGO_UI[x.id]),c.place===x.id,ICONE[x.id])).join('')}</div>`;
 if(s===1)return `<div class="bt-scelte">${(place()?.angles||[]).map(a=>scelta('angle',a[0],esc(a[1]),c.angle===a[0])).join('')}</div>`;
 if(s===2)return `<div class="bt-scelte">${QUESTIONS.map(x=>scelta('question',x.id,esc(DOMANDA_UI[x.id]),c.question===x.id)).join('')}</div>`;
 if(s===3)return `<div class="bt-scelte">${(WELCOMES[c.question]||[]).map(w=>scelta('welcome',w[0],esc(w[1]),c.welcome===w[0])).join('')}</div>`;
 if(s===4)return `<div class="bt-scelte">${PLANS.map(x=>scelta('plan',x.id,esc(x.name),c.plan===x.id)).join('')}</div>`;
 if(s===5)return `<div class="bt-scelte">${RAIN.map(x=>scelta('rain',x.id,esc(x.name),c.rain===x.id)).join('')}</div>`;
 if(s===6)return `<div class="bt-scelte">${SERVICES.map(x=>scelta('service',x.id,`${esc(x.name)}<small>${esc(costo(x))}</small>`,c.service===x.id)).join('')}</div>`;
 if(s===7)return `<div class="bt-scelte">${TERMS.map(x=>scelta('terms',x.id,esc(x.name),c.terms===x.id)).join('')}</div>`;
 if(s===8)return `<div class="bt-scelte">${TONES.map(x=>scelta('tone',x.id,esc(x.name),c.tone===x.id)).join('')}</div>`;
 if(s===9)return `<div class="bt-scelte">${scelta('repair','dati','Correggi con i dati dell’offerta',c.repair==='dati')}</div>`;
 return '';
}

function activity(){
 const s=p.screen,lab=Math.floor(s/2),L=LAB_UI[lab],passo=PASSI[s],fatto=canAdvance(p,s),pos=s+1;
 const frase=typeof passo.frase==='function'?passo.frase():passo.frase;
 context=`${lab+1}. ${LABS[lab].label} · ${s%2+1}/2 · ${passo.titolo}`;
 const legame=s%2===1&&fatto&&canAdvance(p,s-1)?`<p class="tur-legame bt-entra"><b>In Turismo</b> ${esc(L.legame)}</p>`:'';
 return `<section class="bt-schermo bt-schermo--sinistra tur-schermo" data-corso="turismo" data-passo="${s}-${passo.id}">
  <div class="tur-testa"><progress class="bt-avanzamento" value="${pos}" max="${TOTALE}" aria-label="Schermo ${pos} di ${TOTALE}"></progress></div>
  <div class="tur-griglia">
   <h1 class="bt-titolo bt-titolo--medio tur-titolo" id="stageTitle" tabindex="-1">${esc(passo.titolo)}</h1>
   <p class="bt-frase tur-frase">${esc(frase)}</p>
   <div class="tur-anteprima" aria-label="Quello che stai costruendo">${anteprima(s)}</div>
   <div class="tur-azione">${azione(s)}</div>
   <div class="tur-esito" role="status" aria-live="polite">${legame}</div>
  </div>
  <div class="bt-azioni bt-azioni--estremi tur-nav"><button id="previous" type="button" class="bt-pulsante bt-pulsante--secondario">Indietro</button><button id="next" type="button" class="bt-pulsante" ${fatto?'':'disabled'}>Avanti</button></div>
 </section>`;
}

function intro(){
 context='Ingresso · presentazione';
 const label=p.started?'Riprendi':'Inizia';
 return `<section class="bt-schermo tur-intro" data-corso="turismo">
  <div class="tur-intro__testo">
   <p class="bt-occhiello bt-occhiello--corso">TUR · Turismo</p>
   <h1 class="bt-titolo" id="stageTitle" tabindex="-1">Crea una visita da <em>ricordare</em>.</h1>
   <p class="bt-frase">In Turismo impari a progettare visite per persone diverse.</p>
  </div>
  <div class="tur-intro__demo" aria-hidden="true"><div class="tur-foglio tur-demo"><div class="tur-foglio__barra"><span>La tua visita</span><span>●●●</span></div><div class="tur-foglio__corpo"><div class="tur-arte tur-arte--basso">${art('clay')}</div><p class="tur-nome">Mani e storie</p><p class="tur-demo__si">Il gruppo prenota ✓</p></div></div><span class="tur-bollino">La crei tu!</span></div>
  <div class="bt-azioni tur-intro__azioni"><button id="enter" class="bt-pulsante bt-pulsante--grande bt-pulsa" type="button">${label}</button>${p.started?'<button id="startOver" class="bt-link" type="button">Inizia da capo</button>':''}</div>
 </section>`;
}

// Riepilogo del lavoro: dietro «Rivedi il tuo lavoro» del finale, o se il lavoro non è ancora completo.
function end(){
 context='Il tuo lavoro';
 const pl=place(),an=angle(),q=question(),w=welcome(),piano=find(PLANS,p.choices.plan),pioggia=find(RAIN,p.choices.rain),sv=find(SERVICES,p.choices.service),cond=find(TERMS,p.choices.terms),cs=costs(p.choices.service,p.choices.people);
 const testi=[
  `${esc(pl?.name)}: ${esc(titoloStoria())}.`,
  `${esc(q?.en)} ${esc(w?.[2])}`,
  `${esc(piano?.name)} · 90 minuti. Se piove: ${esc(pioggia?.name)}.`,
  `${esc(sv?.name)} · ${cs.count} persone · ${esc(money(cs.each))} a persona. ${esc(PIOGGIA_UI[cond?.id]||'')}`,
  `«${esc(titoloInvito())}»`
 ];
 const manca=LAB_UI.map((l,i)=>i).filter(i=>![i*2,i*2+1].every(n=>canAdvance(p,n))||!p.done.includes(i));
 return `<section class="bt-schermo tur-rivedi" data-corso="turismo">
  <h1 class="bt-titolo bt-titolo--medio" id="stageTitle" tabindex="-1">Il tuo <em>lavoro</em></h1>
  ${manca.length?`<p class="bt-frase">Per finire, rifai: ${manca.map(i=>esc(LAB_UI[i].nome)).join(', ')}.</p>`:''}
  <ol class="tur-rivedi__lista">${LAB_UI.map((l,i)=>`<li class="bt-scheda bt-scheda--scura"><p class="tur-occhiello">${i+1} · ${esc(l.chi)}</p><h2>${esc(l.nome)}</h2><p>${testi[i]}</p><button class="bt-pulsante bt-pulsante--secondario bt-pulsante--piccolo" type="button" data-goto="${i*2}">Rivedi</button></li>`).join('')}</ol>
  ${complete(p)?'<div class="bt-azioni"><button class="bt-pulsante bt-pulsante--grande" type="button" id="backToFinale">Torna al finale</button></div>':''}
 </section>`;
}

function showFinale(){mostraFinale({corso:COURSE,contenitore:$('stage'),treCose:TRE_COSE,apriAttestato:()=>attestato.prepara(),rivediLavoro:()=>{reviewing=true;render(true);},token:()=>remote.token(),salvato:async()=>{await remote.sync();return remote.saved();}});}
function historyRoute(){navigation.write(mode==='work'?p.screen===10?'conclusione':`passaggio-${p.screen+1}`:'ingresso');}
function go(screen,history=true){p.screen=screen;mode='work';navigation.enter();maxSeen=Math.max(maxSeen,screen);if(screen===10)complete(p);save();if(history)historyRoute();render(true);}
function render(focus=false){
 const active=document.activeElement?.id;
 historyRoute();$('journey').replaceChildren();
 if(p.screen<10)reviewing=false;
 if(mode==='work'&&p.screen===10&&!reviewing&&complete(p)){$('stage').replaceChildren();showFinale();}
 else{$('main').classList.add('bt-scuro');$('stage').innerHTML=mode==='intro'?intro():p.screen===10?end():activity();}
 $('noteCount').textContent=p.notes.length;
 if(focus){$('stageTitle')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
 else if(active&&$(active)){let el=$(active);if(el.disabled)el=$('stage').querySelector('.tur-azione button:not(:disabled)')||$('next');el?.focus({preventScroll:true});}
}
// Effetto a ogni scelta: scintilla sul pulsante toccato e il foglio che «risponde».
function effetto(id){const b=id&&$(id);if(b)scintilla(b,COURSE);const t=$('turFoglio');if(t){t.classList.remove('tur-foglio--cambia');void t.offsetWidth;t.classList.add('tur-foglio--cambia');}}
// Dopo la scelta che completa lo schermo, «Avanti» entra nella vista (sul telefono può stare più in basso).
function scegli(id,fn){const prima=canAdvance(p);fn();render();effetto(id);const n=$('next');if(!prima&&n&&!n.disabled)n.scrollIntoView?.({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.key){const id=b.id;scegli(id,()=>{choose(p,b.dataset.key,b.dataset.value);save();});}
 else if(b.dataset.goto!==undefined){const n=Number(b.dataset.goto);if(n<=maxSeen)go(n);}
 else if(b.id==='enter'){if(p.started){go(p.screen);}else classAccess.begin(b);}
 else if(b.id==='previous'){if(p.screen===0){mode='intro';navigation.showIntro();historyRoute();render(true);}else go(p.screen-1);}
 else if(b.id==='next'){if(next(p))go(p.screen);}
 else if(b.id==='backToFinale'){reviewing=false;render(true);}
 else if(b.id==='notesOpen'){openNotes();}
 else if(b.id==='notesClose')$('notes').close();
 else if(b.id==='startOver')startOver();
 else if(b.id==='newDemo')newActivity();
});
function openNotes(){$('noteContext').textContent=context;$('noteMessage').textContent='';$('noteForm').reset();showNotes();$('notes').showModal();}
function showNotes(){$('noteList').innerHTML=p.notes.length?p.notes.map(n=>`<article class="note-item"><b>${esc(n.context)}</b><br><small>${esc(n.role)} · ${esc(n.kind)} · ${new Date(n.date).toLocaleString('it-IT')}</small><p>${esc(n.text)}</p><small>${n.pending?'Salvataggio online da completare':'Nota salvata nello spazio riservato'}</small></article>`).join(''):'<p class="subtle">Non ci sono ancora note in questa prova.</p>';}
$('noteForm').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.target),text=String(d.get('text')).trim();if(text.length<2){$('noteMessage').textContent='Scrivi almeno due caratteri prima di salvare.';return;}p.notes.push({id:crypto.randomUUID(),course:'tur',projectId:p.id,step:mode==='work'?p.screen:-1,context,role:String(d.get('role')),kind:String(d.get('kind')),text:text.slice(0,2000),date:new Date().toISOString(),pending:true});save();showNotes();e.target.elements.text.value='';$('noteMessage').textContent=storageOK?'Nota conservata sul dispositivo. Il salvataggio online è in corso.':'La nota resta aperta qui: attendi la conferma del salvataggio online.';});
remote=setupTourismRemote({key:KEY+'.remote.'+storageId,entryToken:entryAlumno,project:()=>p,keep,loaded,notesChanged:()=>{if($('notes').open){showNotes();if(p.notes.length&&!p.notes.some(n=>n.pending))$('noteMessage').textContent='Note salvate, ciascuna separatamente. Puoi chiudere e continuare.';}},status:(message,error)=>{$('saved').textContent=localTest?message.replaceAll('Supabase','database di prova')+' · Prova locale':message;$('retrySave').hidden=!error;},localOK:()=>storageOK});
const startNow=async()=>{try{await remote.ensure();}catch{}p.started=true;go(p.screen);};
classAccess=setupClass({key:KEY,token:()=>remote.token(),ensure:()=>remote.ensure(),isIntro:()=>mode==='intro',start:startNow,
 ingressoComune:true,apriIngresso:()=>mostraIngresso({corso:COURSE,contenitore:$('stage'),classe:classAccess,onInizia:startNow,onNuovo:()=>startOver(true),onIndietro:()=>render(true)})});
attestato=setupParticipantCertificate({project:()=>p,journey:()=>p,save,identity:()=>classAccess.identity(),participant:()=>remote.participant(),revision:()=>remote.revision()});
$('retrySave').addEventListener('click',()=>remote.sync());
window.addEventListener('online',()=>remote.sync());
iniziaMenu();
restoreRoute(navigation.route());keep();render();showSavedActivities();if(remote.token())remote.sync();
