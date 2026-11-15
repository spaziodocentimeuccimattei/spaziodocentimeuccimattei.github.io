// Missione Aurora: gli schermi che il ragazzo vede (riordino novembre 2026, agente A6).
// I dati restano quelli di cat-missione-core.mjs (monitoraggio, attestato e riepilogo li leggono per posizione):
// qui ci sono solo testi e schermi. Le tre tappe salvate (p.screen 0, 1, 2) sono divise in schermi più piccoli,
// una scelta ciascuno; lo schermo corrente non si salva: si ricava dai dati (primoDaFare).
// Elenco prima → dopo dei testi: docs/bussola/riordino-2026-11/testi-cat.md
import * as M from './cat-missione-core.mjs?v=20261029-missione';
import {missionScene} from './cat-missione.mjs?v=20261115-a6';
import {esc} from './cat-visuals.mjs?v=20261029-missione';

const num=n=>new Intl.NumberFormat('it-IT',{useGrouping:'always'}).format(n),money=n=>num(n)+' €';
const find=(a,id)=>a.find(v=>v.id===id);

// Le tre cose del finale. Fonti: docs/bussola/riordino-2026-11/testi-cat.md
export const TRE_COSE=['Rilevi e disegni un edificio, anche con strumenti digitali.','Progetti e scegli i materiali per costruire e rinnovare.','Stimi i costi e organizzi il cantiere in sicurezza.'];

// Le frasi «In CAT…», una per elaborato (le cinque parti della missione).
export const LEGAMI=[
 'impari il rilievo: misurare e rappresentare un edificio con strumenti digitali.',
 'ti chiedi come ridurre il calore che un edificio perde, e come intervenire.',
 'studi i materiali e confronti le soluzioni per costruire.',
 'confronti interventi, costi e consumi. L’estimo stima quanto costa un lavoro.',
 'disegni e progetti spazi e costruzioni.'];
export const RESTO_DEL_CORSO='Ma CAT non è solo energia: nel corso fai anche rilievo, progetto, cantiere e stima.';

const INS_UI={'isolamento-assente':'Lasciali così','isolamento-minerale':'Cappotto di lana minerale','isolamento-sughero':'Cappotto di sughero'};
const WIN_UI={'infissi-attuali':'Tieni le finestre vecchie','infissi-doppi':'Finestre a doppi vetri','infissi-tripli':'Finestre a tripli vetri'};
const FIN_UI={'finitura-base':['Vernice normale','Rilascia più sostanze nell’aria.'],'finitura-bassovoc':['Vernice a basse emissioni','Rilascia meno sostanze nell’aria.']};
const SPOT_UI={parete:['Muro','Il muro è a 9 °C: la parte più fredda.'],telaio:['Travi e pilastri','Travi e pilastri: 13 °C. Più caldi del muro: da qui il calore scappa.'],infissi:['Finestre','Intorno alle finestre: 12 °C. Anche da qui passa il calore.']};
const FACCIA_UI={sud:'Sud',est:'Est',nord:'Nord',ovest:'Ovest'};

const latestRun=p=>M.latestMissionRun(p.mission),latestApp=p=>M.latestApplication(p.mission);
const runOk=p=>{const r=latestRun(p);return !!r&&!r.gap&&r.saved>0;};
const spesa=m=>M.MISSION_ASSUMPTIONS.setup+[[M.INSULATIONS,m.insulation],[M.WINDOWS,m.windows],[M.FINISHES,m.finish]].reduce((t,[a,id])=>t+(find(a,id)?.cost||0),0);

// Gli schermi: per ogni tappa salvata, l'elenco degli schermi. «lab» è l'elaborato (0-4) a cui appartiene lo schermo.
export const PASSI=[
 [{id:'volo',lab:0,titolo:'Fai volare il drone.',frase:'Scatta una foto per ogni lato dell’edificio.',fatto:p=>p.mission.captures.length===4},
  {id:'caldo',lab:1,titolo:'Guarda dove scappa il caldo.',frase:'La termocamera mostra il caldo in rosso e il freddo in blu.',fatto:p=>p.mission.thermalUsed&&p.mission.observations.length===3}],
 [{id:'muri',lab:2,titolo:'Come proteggi i muri?',frase:'Uno strato isolante fuori dal muro tiene il caldo dentro.',fatto:p=>!!p.mission.insulation},
  {id:'finestre',lab:2,titolo:'Che finestre metti?',frase:'Le finestre vecchie lasciano passare molto calore.',fatto:p=>!!p.mission.windows},
  {id:'vernice',lab:2,titolo:'Che vernice scegli?',frase:'Cambia l’aria dentro casa, non il calore che scappa.',fatto:p=>!!p.mission.finish},
  {id:'prova',lab:3,titolo:'Prova il tuo progetto.',frase:'Quanta energia risparmi? I soldi bastano?',fatto:runOk}],
 [{id:'dopo',lab:4,titolo:'Trasforma l’edificio.',frase:'Applica il progetto e muovi la barra: prima e dopo.',fatto:p=>!!latestApp(p)&&runOk(p)}]
];
export const TOTALE=PASSI.reduce((n,l)=>n+l.length,0);
export const prima=s=>PASSI.slice(0,s).reduce((n,l)=>n+l.length,0);
export function primoDaFare(p,s){const l=PASSI[s]||[];const i=l.findIndex(x=>!x.fatto(p));return i<0?Math.max(0,l.length-1):i;}

// ---------------------------------------------------------------------------------------------
const droneSvg=(cls='')=>`<svg class="cat-drone ${cls}" viewBox="0 0 120 60" aria-hidden="true"><g class="cat-drone__eliche"><ellipse cx="22" cy="12" rx="20" ry="4" fill="#cde4e6" opacity=".85"/><ellipse cx="98" cy="12" rx="20" ry="4" fill="#cde4e6" opacity=".85"/></g><path d="M22 14 50 34M98 14 70 34" stroke="#0c211a" stroke-width="5" stroke-linecap="round"/><rect x="40" y="28" width="40" height="16" rx="8" fill="#85c140" stroke="#0c211a" stroke-width="4"/><circle cx="60" cy="50" r="7" fill="#0c211a"/><circle cx="60" cy="50" r="3" fill="#b4e86e"/></svg>`;
const scena=(m,o={})=>`<div class="cat-scena">${missionScene(m,{decorative:false,sobrio:true,...o})}${o.drone===false?'':droneSvg('cat-drone--lato'+m.position)}</div>`;
const budget=m=>{const s=spesa(m),over=s>M.MISSION_BUDGET;return `<div class="cat-budget ${over?'cat-budget--oltre':''}"><div class="cat-budget__riga"><span>Hai ${money(M.MISSION_BUDGET)}</span><b>Spesi ${money(s)}</b></div><div class="cat-budget__barra" role="img" aria-label="Spesi ${money(s)} su ${money(M.MISSION_BUDGET)}"><i style="width:${Math.min(100,Math.round(s/M.MISSION_BUDGET*100))}%"></i></div><small>Con ${money(M.MISSION_ASSUMPTIONS.setup)} di progetto.</small></div>`;};
const scelta=(campo,item,testo,nota,m)=>`<button id="mission-${item.id}" class="bt-scelta" type="button" data-mission-field="${campo}" data-mission-choice="${item.id}" aria-pressed="${m[campo]===item.id}"><span class="cat-scelta__testo">${esc(testo)}${nota?`<small>${esc(nota)}</small>`:''}</span><span class="cat-prezzo">${item.cost?money(item.cost):'0 €'}</span></button>`;
function barre(r){const ratio=Math.round(r.after/r.before*100);return `<div class="cat-barre"><p><span>Prima</span><b>100%</b></p><div class="cat-barra"><i style="width:100%"></i></div><p><span>Con il tuo progetto</span><b>${ratio}%</b></p><div class="cat-barra cat-barra--dopo"><i style="width:${ratio}%"></i></div></div>`;}
function confronto(m){return `<div class="mission-compare cat-confronto" style="--reveal:${m.compare}%"><div>${missionScene(m,{after:true,decorative:true,sobrio:true})}</div><div class="mission-before">${missionScene(m,{after:false,decorative:true,sobrio:true})}</div><div class="mission-divider" aria-hidden="true"></div><span class="mission-before-label">Prima</span><span class="mission-after-label">Dopo</span></div><label class="cat-cursore"><span class="bt-nascosto-visivamente">Quanto vedi dell’edificio prima</span><input id="missionCompare" type="range" min="0" max="100" value="${m.compare}" aria-label="Porzione dell’edificio prima dell’intervento"></label>`;}

export function anteprima(p,s,id){
 const m=p.mission;
 if(id==='volo')return `<div class="cat-foglio" id="catFoglio">${scena(m,{thermal:false})}<div class="cat-lati" aria-label="Lati fotografati">${M.FACADES.map(f=>`<span class="${m.captures.includes(f.id)?'cat-lato--fatto':''}">${m.captures.includes(f.id)?'✓':'○'} ${FACCIA_UI[f.id]}</span>`).join('')}</div></div>`;
 if(id==='caldo'){const t=m.camera==='termica';return `<div class="cat-foglio" id="catFoglio">${scena(m,{thermal:t})}${t?'<div class="thermal-legend cat-legenda"><span>5 °C · freddo</span><i aria-hidden="true"></i><span>15 °C · caldo</span></div>':''}</div>`;}
 if(['muri','finestre','vernice'].includes(id))return `<div class="cat-foglio" id="catFoglio">${scena(m,{after:true,thermal:false,drone:false})}${budget(m)}</div>`;
 if(id==='prova'){const r=latestRun(p);return `<div class="cat-foglio" id="catFoglio">${scena(m,{after:true,thermal:false,drone:false})}${budget(m)}${r?barre(r):''}</div>`;}
 if(id==='dopo'){const a=latestApp(p);return `<div class="cat-foglio" id="catFoglio">${a?confronto(m):scena(m,{after:false,thermal:false,drone:false})}</div>`;}
 return '';
}

export function azione(p,s,id){
 const m=p.mission;
 if(id==='volo'){const here=M.FACADES[m.position];return `<div class="cat-pilota"><button id="mission-left" class="bt-pulsante bt-pulsante--secondario" type="button" data-mission-move="-1" aria-label="Ruota il drone a sinistra">←</button><button id="mission-capture" class="bt-pulsante bt-pulsante--grande" type="button" ${m.captures.length===4?'disabled':''}>${m.captures.includes(here.id)?'Già fotografato':'Scatta: lato '+FACCIA_UI[here.id]}</button><button id="mission-right" class="bt-pulsante bt-pulsante--secondario" type="button" data-mission-move="1" aria-label="Ruota il drone a destra">→</button></div>`;}
 if(id==='caldo'){
  if(m.camera!=='termica')return `<button id="mission-camera-termica" class="bt-pulsante bt-pulsante--grande bt-pulsa" type="button" data-mission-camera="termica">Accendi la termocamera</button>`;
  return `<div class="bt-scelte">${M.HOTSPOTS.map((h,n)=>`<button id="mission-spot-${h.id}" class="bt-scelta" type="button" data-mission-spot="${h.id}" aria-pressed="${m.observations.includes(h.id)}"><span class="cat-num">${n+1}</span><span class="cat-scelta__testo">${esc(SPOT_UI[h.id][0])}</span><span class="cat-prezzo">${m.observations.includes(h.id)?h.temperature+' °C':'Tocca'}</span></button>`).join('')}</div>`;}
 if(id==='muri')return `<div class="bt-scelte">${M.INSULATIONS.map(i=>scelta('insulation',i,INS_UI[i.id],'',m)).join('')}</div>`;
 if(id==='finestre')return `<div class="bt-scelte">${M.WINDOWS.map(i=>scelta('windows',i,WIN_UI[i.id],'',m)).join('')}</div>`;
 if(id==='vernice')return `<div class="bt-scelte">${M.FINISHES.map(i=>scelta('finish',i,FIN_UI[i.id][0],FIN_UI[i.id][1],m)).join('')}</div>`;
 if(id==='prova')return `<button id="mission-test" class="bt-pulsante bt-pulsante--grande" type="button" ${M.missionResult(m)?'':'disabled'}>Prova</button>`;
 if(id==='dopo'){
  if(!latestApp(p))return `<button id="mission-apply" class="bt-pulsante bt-pulsante--grande bt-pulsa" type="button">Applica il progetto</button>`;
  return `<button id="mission-camera-${m.camera==='termica'?'visibile':'termica'}" class="bt-pulsante bt-pulsante--secondario" type="button" data-mission-camera="${m.camera==='termica'?'visibile':'termica'}">${m.camera==='termica'?'Torna alla fotocamera':'Guarda il calore'}</button>`;}
 return '';
}

export function esito(p,s,id){
 const m=p.mission,r=latestRun(p);
 if(id==='volo')return m.captures.length===4?'Hai fotografato tutti i lati.':`${m.captures.length} lati su 4.`;
 if(id==='caldo'){if(m.lastSpot)return SPOT_UI[m.lastSpot][1];return m.camera==='termica'?'Tocca i tre punti numerati.':'';}
 if(id==='prova'){
  if(!r)return 'Premi «Prova» per vedere il risultato.';
  if(r.gap)return `Mancano ${money(r.gap)}: i soldi non bastano. Torna indietro e cambia una scelta.`;
  if(!r.saved)return 'L’energia non cala: la vernice cambia solo l’aspetto. Torna indietro e cambia muri o finestre.';
  return `Funziona: energia −${r.reduction}%. Spendi ${money(r.total)}, ne restano ${money(r.remaining)}. ${m.insulation==='isolamento-assente'?'Travi e pilastri restano scoperti: da lì scappa ancora calore.':''}`;}
 if(id==='dopo')return latestApp(p)?'Muovi la barra: a sinistra l’edificio prima, a destra dopo.':'';
 return '';
}

export function passo(p,s,sub){
 const l=PASSI[s],st=l[sub],fatto=st.fatto(p),pos=prima(s)+sub+1;
 const ultimoLab=l[sub+1]?.lab!==st.lab;
 const legame=fatto&&ultimoLab?`<p class="cat-legame bt-entra"><b>In CAT</b> ${esc(LEGAMI[st.lab])}</p>${st.id==='dopo'?`<p class="cat-legame cat-legame--resto bt-entra">${esc(RESTO_DEL_CORSO)}</p>`:''}`:'';
 const t=esito(p,s,st.id);
 return `<section class="bt-schermo bt-schermo--sinistra cat-schermo" data-corso="cat" data-passo="${s}-${st.id}">
  <div class="cat-testa"><progress class="bt-avanzamento" value="${pos}" max="${TOTALE}" aria-label="Schermo ${pos} di ${TOTALE}"></progress></div>
  <div class="cat-griglia">
   <h1 class="bt-titolo bt-titolo--medio cat-titolo" id="stageTitle" tabindex="-1">${esc(st.titolo)}</h1>
   <p class="bt-frase cat-frase">${esc(st.frase)}</p>
   <div class="cat-anteprima" aria-label="Quello che stai costruendo">${anteprima(p,s,st.id)}</div>
   <div class="cat-azione">${azione(p,s,st.id)}</div>
   <div class="cat-esito" role="status" aria-live="polite">${t?`<p>${esc(t)}</p>`:''}${legame}</div>
  </div>
  <div class="bt-azioni bt-azioni--estremi cat-nav"><button id="previous" type="button" class="bt-pulsante bt-pulsante--secondario">Indietro</button><button id="next" type="button" class="bt-pulsante" ${fatto?'':'disabled'}>Avanti</button></div>
 </section>`;
}

// Apertura. Per chi ha un lavoro di una variante precedente: «Riprendi» resta (id start), la missione è il pulsante principale.
export function intro(p,{mission,completed}){
 const started=p.started,hasPrevious=!mission&&started;
 const label=mission&&started?(completed?'Rivedi':'Riprendi'):'Inizia';
 const missionBtn=`<button id="${mission?'start':'startMission'}" class="bt-pulsante bt-pulsante--grande bt-pulsa" type="button">${hasPrevious?'Inizia la missione':label}</button>`;
 const previousBtn=hasPrevious?`<button id="start" class="bt-pulsante bt-pulsante--secondario" type="button">Riprendi l’attività precedente</button>`:'';
 const m=M.newMission();
 return `<section class="bt-schermo cat-intro" data-corso="cat">
  <div class="cat-intro__testo">
   <p class="bt-occhiello bt-occhiello--corso">CAT 4+2 · Costruzioni, Ambiente e Territorio</p>
   <h1 class="bt-titolo" id="stageTitle" tabindex="-1">Pilota il drone. Cambia l’<em>edificio</em>.</h1>
   <p class="bt-frase">Trova dove l’edificio perde calore, poi scegli come sistemarlo.</p>
   <p class="bt-nota cat-quattropiudue">4+2: diploma in 4 anni, poi 2 anni facoltativi di ITS Academy.</p>
  </div>
  <div class="cat-intro__demo" aria-hidden="true"><div class="cat-foglio cat-demo"><div class="cat-foglio__barra"><span>Missione Aurora</span><span>●●●</span></div><div class="cat-scena cat-scena--demo">${missionScene(m,{decorative:true,sobrio:true})}${droneSvg('cat-drone--demo')}</div></div><span class="cat-bollino">Tocca a te!</span></div>
  <div class="bt-azioni cat-intro__azioni">${missionBtn}${previousBtn}${started?'<button id="startOver" class="bt-link" type="button">Inizia da capo</button>':''}</div>
 </section>`;
}

const LABS_VAI=[0,0,1,1,2];
export function rivedi(p,completo){
 const m=p.mission,r=latestRun(p);
 const testi=[
  m.captures.length?`Lati fotografati: ${m.captures.map(id=>FACCIA_UI[id]).join(', ')}.`:'Da fare.',
  m.observations.length?`Hai guardato: ${m.observations.map(id=>SPOT_UI[id][0].toLowerCase()).join(', ')}.`:'Da fare.',
  [INS_UI[m.insulation],WIN_UI[m.windows],m.finish&&FIN_UI[m.finish][0]].filter(Boolean).join(' · ')||'Da scegliere.',
  r?`Energia per scaldare −${r.reduction}%. Costo ${money(r.total)} su ${money(r.budget)}.`:'Da provare.',
  latestApp(p)?'Hai confrontato l’edificio prima e dopo.':'Da fare.'];
 const nomi=['Fotografa l’edificio','Guarda il caldo','Scegli i materiali','Prova il progetto','Prima e dopo'];
 const manca=M.MISSION_LABS.map((l,i)=>i).filter(i=>!(M.missionLabReady(p,i)));
 return `<section class="bt-schermo cat-rivedi" data-corso="cat">
  <h1 class="bt-titolo bt-titolo--medio" id="stageTitle" tabindex="-1">Il tuo <em>lavoro</em></h1>
  ${manca.length?`<p class="bt-frase">Per finire, rifai: ${manca.map(i=>esc(nomi[i].toLowerCase())).join(', ')}.</p>`:''}
  <ol class="cat-rivedi__lista">${nomi.map((n,i)=>`<li class="bt-scheda bt-scheda--scura"><p class="cat-occhiello">${i+1} · Missione Aurora</p><h2>${esc(n)}</h2><p>${esc(testi[i])}</p><button class="bt-pulsante bt-pulsante--secondario bt-pulsante--piccolo" type="button" data-cat-vai="${LABS_VAI[i]}">Rivedi</button></li>`).join('')}</ol>
  ${completo?'<div class="bt-azioni"><button class="bt-pulsante bt-pulsante--grande" type="button" id="backToFinale">Torna al finale</button></div>':''}
 </section>`;
}

// Un tocco sullo schermo. Restituisce vero se ha cambiato qualcosa. Il drone, dopo uno scatto, passa al lato ancora da fotografare.
export function azioneMissione(p,b){
 const m=p.mission,d=b.dataset;
 if(d.missionMove){M.moveDrone(m,Number(d.missionMove));return true;}
 if(b.id==='mission-capture'){M.captureFacade(m);for(let i=1;i<=4&&m.captures.length<4;i++){const next=(m.position+i)%4;if(!m.captures.includes(M.FACADES[next].id)){m.position=next;break;}}return true;}
 if(d.missionCamera){m.camera=d.missionCamera;if(m.camera==='termica')m.thermalUsed=true;return true;}
 if(d.missionSpot){M.observeSpot(m,d.missionSpot);return true;}
 if(d.missionField){M.chooseMission(m,d.missionField,d.missionChoice);return true;}
 if(b.id==='mission-test'){M.testMission(m);return true;}
 if(b.id==='mission-apply'){M.applyMission(m);return true;}
 return false;
}
