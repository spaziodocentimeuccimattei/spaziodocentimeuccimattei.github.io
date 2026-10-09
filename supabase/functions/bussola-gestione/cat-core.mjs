export const FORMAT='bussola-cat-proposta-1';
export const STORE='bussola.cat.v1';
export const LABS=[
 {id:'rilievo',label:'Rilievo',product:'La tua tavola',client:'Spazio Live',subjects:'Rappresentazione grafica · Topografia · Matematica'},
 {id:'spazi',label:'Spazi',product:'Il tuo progetto',client:'Spazio Live',subjects:'Progettazione, Costruzioni e Impianti'},
 {id:'materiali',label:'Materiali',product:'La tua soluzione costruttiva',client:'Spazio Live',subjects:'Progettazione, Costruzioni e Impianti · Geopedologia'},
 {id:'tracce',label:'Archeodesign',product:'La tua documentazione',client:'Traccia T1',subjects:'Topografia · Rappresentazione grafica · Storia'},
 {id:'risorse',label:'Risorse',product:'Il tuo piano di lavoro',client:'Spazio Live',subjects:'Economia ed Estimo · Gestione del Cantiere e Sicurezza'}
];
export const STAGES=[
 ['Dal luogo al disegno','Per Spazio Live progetti un cortile per musica e video. Scegli un’area e apri le tre misure.','Apri larghezza, profondità e ingresso.','Componi la tavola'],
 ['Come mostri il tuo rilievo?','Scegli almeno due viste. Ognuna mostra un aspetto dello stesso spazio.','Scegli due viste e componi la tavola.','Progetta le attività'],
 ['Dove si crea, si suona e si monta?','Scegli un’attività, poi una casella nella pianta. Colloca tutte e tre le attività.','Colloca Suono, Video e Montaggio in tre caselle diverse.','Prova i passaggi'],
 ['Si passa fra le attività?','Scegli un percorso e provalo. Puoi spostare le attività per cambiare il risultato.','Prova il passaggio con la disposizione attuale.','Scegli i materiali'],
 ['Una copertura, un suolo','Componi la soluzione per il cortile: scegli copertura, suolo e superficie coperta.','Scegli una copertura e un suolo.','Prova sole e pioggia'],
 ['Che cosa cambia con il tempo?','Prova sole e pioggia. Osserva la sezione; puoi cambiare i materiali e riprovare.','Prova sole e pioggia con i materiali attuali.','Apri Traccia T1'],
 ['Quali tracce puoi documentare?','Nuovo incarico: Traccia T1. Apri le tre schede e raccogli ciò che sappiamo.','Apri tutte e tre le schede.','Componi la documentazione'],
 ['Dove finisce il dato, dove inizia l’ipotesi?','Scegli che cosa rappresentare. Confronta la tua tavola con le tracce osservate.','Scegli una rappresentazione e confrontala con le tracce.','Torna a Spazio Live'],
 ['Quanto serve per il tuo progetto?','Le misure e i materiali scelti diventano quantità e costi. Calcola la stima.','Calcola la stima del progetto attuale.','Organizza le fasi'],
 ['Hai 900 euro: che cosa realizzi ora?','Organizza il lavoro in una o due fasi. Ricalcola e osserva che cosa resta da finanziare.','Scegli le fasi e ricalcola con il budget di prova.','Raccogli i tuoi elaborati']
];
export const AREAS=[{id:'raccolta',label:'Area raccolta',width:8,depth:6},{id:'ampia',label:'Area ampia',width:10,depth:6}];
export const VIEWS=[{id:'pianta',label:'Pianta',desc:'Lo spazio visto dall’alto.'},{id:'sezione',label:'Sezione',desc:'Un taglio per vedere le altezze.'},{id:'modello',label:'Modello spaziale',desc:'Una vista semplificata in volume.'}];
export const ZONES=[{id:'suono',label:'Suono',symbol:'♪',color:'#bfdce3'},{id:'video',label:'Video',symbol:'▷',color:'#f0d5a6'},{id:'montaggio',label:'Montaggio',symbol:'▤',color:'#cfe1ce'}];
export const ROOFS=[{id:'opaca',label:'Copertura opaca',price:28,desc:'Nel modello ripara dalla pioggia e crea una zona d’ombra.'},{id:'filtrante',label:'Copertura filtrante',price:40,desc:'Nel modello ripara dalla pioggia e lascia passare luce diffusa.'}];
export const FLOORS=[{id:'compatto',label:'Suolo compatto',price:12,desc:'Nel modello l’acqua scorre sulla superficie: serve uno scarico da progettare.'},{id:'drenante',label:'Suolo drenante',price:18,desc:'Nel modello l’acqua attraversa il suolo. Nella realtà vanno verificati terreno e strati.'}];
export const OBSERVATIONS=[{id:'frammenti',label:'Le parti conservate',text:'Due appoggi e alcuni frammenti. La parte superiore non è conservata.'},{id:'misura',label:'La misura disponibile',text:'L’apertura fra gli appoggi misura 2,4 m. Il dato è fornito per questa simulazione.'},{id:'mancante',label:'Quello che manca',text:'Non sappiamo se la chiusura fosse ad arco o con un elemento orizzontale.'}];
export const HYPOTHESES=[{id:'nessuna',label:'Solo l’esistente',desc:'Mostra soltanto le parti documentate.'},{id:'arco',label:'Una possibile chiusura ad arco',desc:'Aggiungi un’ipotesi, distinta dai frammenti.'},{id:'architrave',label:'Un possibile architrave',desc:'Aggiungi un elemento orizzontale ipotetico.'}];
export const PHASES=[{id:'insieme',label:'Tutto insieme',desc:'Suolo e copertura nella prima fase.'},{id:'suolo',label:'Prima il suolo',desc:'La copertura resta da finanziare nella seconda fase.'},{id:'copertura',label:'Prima la copertura',desc:'Il suolo resta da finanziare nella seconda fase.'}];
export const find=(a,id)=>a.find(v=>v.id===id);
export const clone=p=>JSON.parse(JSON.stringify(p));
const stamp=()=>new Date().toISOString();
const uuid=()=>crypto.randomUUID();
export function createProject(id=uuid()){return {format:FORMAT,version:1,course:'cat',id,started:false,identity:null,screen:-1,unlocked:0,done:[],notes:[],interests:[],revision:0,updatedAt:null,title:'I miei progetti CAT',survey:{area:'raccolta',measures:[],views:[],title:'Rilievo di Spazio Live',runs:[]},layout:{zones:{suono:null,video:null,montaggio:null},route:'bordo',runs:[]},build:{roof:null,floor:null,cover:8,runs:[]},heritage:{observations:[],hypothesis:null,encoding:'tratto',title:'Traccia T1 · Documentazione',runs:[]},plan:{phase:null,runs:[]}};}
export function dimensions(p){return find(AREAS,p.survey.area);}
export function grid(p){const a=dimensions(p);return {cols:a.width/2,rows:a.depth/2};}
export function inBounds(p,pos){const g=grid(p);return !!pos&&Number.isInteger(pos.x)&&Number.isInteger(pos.y)&&pos.x>=0&&pos.x<g.cols&&pos.y>=0&&pos.y<g.rows;}
export function layoutValid(p){const pos=ZONES.map(z=>p.layout.zones[z.id]);return pos.every(v=>inBounds(p,v))&&new Set(pos.map(v=>`${v.x}:${v.y}`)).size===3;}
export function place(p,zone,x,y){if(!find(ZONES,zone)||!inBounds(p,{x,y}))return false;const other=ZONES.find(z=>z.id!==zone&&p.layout.zones[z.id]?.x===x&&p.layout.zones[z.id]?.y===y);if(other)return false;p.layout.zones[zone]={x,y};invalidate(p);return true;}
export function surveySignature(p){return JSON.stringify([p.survey.area,p.survey.measures,p.survey.views,p.survey.title]);}
export function composeSurvey(p){const r={id:uuid(),signature:surveySignature(p),area:p.survey.area,views:[...p.survey.views],title:p.survey.title,at:stamp()};p.survey.runs.push(r);return r;}
export function routeCells(p){const {cols,rows}=grid(p),cells=[];for(let x=0;x<cols;x++)cells.push({x,y:p.layout.route==='bordo'?0:rows-1});const col=p.layout.route==='bordo'?0:Math.floor(cols/2);for(let y=0;y<rows;y++)cells.push({x:col,y});if(p.layout.route==='bordo')for(let y=0;y<rows;y++)cells.push({x:0,y});return cells.filter((v,i,a)=>a.findIndex(c=>c.x===v.x&&c.y===v.y)===i);}
export function layoutSignature(p){return JSON.stringify([p.survey.area,p.layout.zones,p.layout.route]);}
export function inspectLayout(p){const route=routeCells(p);const conflicts=ZONES.filter(z=>{const v=p.layout.zones[z.id];return v&&route.some(c=>c.x===v.x&&c.y===v.y)}).map(z=>z.label);const a=p.layout.zones.suono,b=p.layout.zones.video;const near=!!a&&!!b&&Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;return {conflicts,near,route,valid:layoutValid(p),messages:[conflicts.length?`${conflicts.join(' e ')} ${conflicts.length>1?'occupano':'occupa'} una casella del passaggio. Puoi spostare le attività o provare l’altro percorso.`:'Il percorso disegnato non attraversa le tre zone. Questo controllo riguarda soltanto la nostra griglia.',...(near?['Suono e Video sono vicini: per registrare l’audio potrebbe servire una separazione da studiare.']:[])]};}
export function testLayout(p){const r={id:uuid(),signature:layoutSignature(p),...inspectLayout(p),zones:clone(p.layout.zones),area:p.survey.area,routeType:p.layout.route,at:stamp()};p.layout.runs.push(r);return r;}
export function buildSignature(p){return JSON.stringify([p.survey.area,p.build.roof,p.build.floor,p.build.cover]);}
export function testWeather(p,weather){if(!['sole','pioggia'].includes(weather)||!p.build.roof||!p.build.floor)return null;const text=weather==='sole'?(p.build.roof==='opaca'?`La copertura crea ombra su ${p.build.cover} m². Il resto del cortile rimane esposto.`:`La copertura lascia passare luce diffusa su ${p.build.cover} m². Il modello non misura il calore.`):(p.build.floor==='drenante'?'L’acqua attraversa il suolo drenante nel modello. In un progetto reale servono verifiche sul terreno e sugli strati.':'L’acqua scorre sul suolo compatto. Il modello mette in evidenza la necessità di progettare raccolta e scarico.');const r={id:uuid(),signature:buildSignature(p),weather,text,roof:p.build.roof,floor:p.build.floor,cover:p.build.cover,at:stamp()};p.build.runs.push(r);return r;}
export function heritageSignature(p){return JSON.stringify([p.heritage.observations,p.heritage.hypothesis,p.heritage.encoding,p.heritage.title]);}
export function compareHeritage(p){if(!find(HYPOTHESES,p.heritage.hypothesis))return null;const r={id:uuid(),signature:heritageSignature(p),hypothesis:p.heritage.hypothesis,encoding:p.heritage.encoding,text:p.heritage.hypothesis==='nessuna'?'La tavola conserva soltanto i frammenti documentati. La forma della parte superiore rimane sconosciuta.':'La parte aggiunta è una possibilità: le tracce fornite non permettono di stabilire questa forma. La legenda la indica come ipotesi.',at:stamp()};p.heritage.runs.push(r);return r;}
export function estimate(p){const a=dimensions(p),roof=find(ROOFS,p.build.roof),floor=find(FLOORS,p.build.floor),surface=a.width*a.depth;return {surface,roofArea:p.build.cover,roofPrice:roof?.price??null,floorPrice:floor?.price??null,roofCost:roof?p.build.cover*roof.price:null,floorCost:floor?surface*floor.price:null,setup:140,total:roof&&floor?surface*floor.price+p.build.cover*roof.price+140:null};}
export function planSignature(p,kind='budget'){return JSON.stringify([buildSignature(p),kind,kind==='budget'?p.plan.phase:null]);}
export function planResult(p,kind='budget'){const e=estimate(p),budget=kind==='base'?1200:900,phase=kind==='base'?'insieme':p.plan.phase,now=phase==='suolo'?e.floorCost+e.setup:phase==='copertura'?e.roofCost+e.setup:e.total;return {...e,budget,phase,now,later:e.total===null?null:e.total-now,gap:now===null?null:Math.max(0,now-budget),remaining:now===null?null:Math.max(0,budget-now)};}
export function testPlan(p,kind){if(!['base','budget'].includes(kind)||estimate(p).total===null||(kind==='budget'&&!find(PHASES,p.plan.phase)))return null;const r={id:uuid(),signature:planSignature(p,kind),kind,...planResult(p,kind),at:stamp()};p.plan.runs.push(r);return r;}
export function latest(runs,signature){return runs.findLast(r=>r.signature===signature)||null;}
export function ready(p,s=p.screen){if(!p.started)return false;const obs=p.heritage.observations,meas=p.survey.measures;return [
 ['larghezza','profondita','ingresso'].every(id=>meas.includes(id)),
 p.survey.views.length>=2&&!!latest(p.survey.runs,surveySignature(p)),
 layoutValid(p),
 layoutValid(p)&&!!latest(p.layout.runs,layoutSignature(p)),
 !!find(ROOFS,p.build.roof)&&!!find(FLOORS,p.build.floor),
 ['sole','pioggia'].every(w=>p.build.runs.some(r=>r.signature===buildSignature(p)&&r.weather===w)),
 OBSERVATIONS.every(o=>obs.includes(o.id)),
 !!latest(p.heritage.runs,heritageSignature(p)),
 !!latest(p.plan.runs,planSignature(p,'base')),
 !!latest(p.plan.runs,planSignature(p,'budget'))
 ][s]||false;}
export function advance(p){if(!ready(p))return false;if(!p.done.includes(p.screen))p.done.push(p.screen);p.screen=Math.min(10,p.screen+1);p.unlocked=Math.max(p.unlocked,p.screen);return true;}
export function invalidate(p){p.done=p.done.filter(s=>ready(p,s));return p;}
export function completed(p){return p.started&&Array.from({length:10},(_,i)=>p.done.includes(i)&&ready(p,i)).every(Boolean);}
export function context(p){const n=p.screen;return {course:'cat',lab:n<0?'ingresso':n===10?'conclusione':LABS[Math.floor(n/2)].id,screen:n,version:FORMAT,label:n<0?'Ingresso':n===10?'Conclusione':`${LABS[Math.floor(n/2)].label} · ${n%2+1}/2 · ${STAGES[n][0]}`};}
export function addNote(p,{role,kind,text}){text=String(text||'').trim().slice(0,2000);if(text.length<2)return null;const n={id:uuid(),projectId:p.id,...context(p),role:role==='docente'?'docente':'alunno',kind:['chiarezza','problema','idea','piaciuto'].includes(kind)?kind:'idea',text,createdAt:stamp()};p.notes.push(n);return n;}
export function validProject(p){const ids=(v,a)=>Array.isArray(v)&&new Set(v).size===v.length&&v.every(id=>a.includes(id));const runs=v=>Array.isArray(v)&&v.every(r=>r&&typeof r.signature==='string'&&typeof r.id==='string');return !!p&&p.format===FORMAT&&p.course==='cat'&&typeof p.started==='boolean'&&Number.isInteger(p.revision)&&p.revision>=0&&/^[0-9a-f-]{36}$/i.test(p.id)&&Number.isInteger(p.screen)&&p.screen>=-1&&p.screen<=10&&Number.isInteger(p.unlocked)&&p.unlocked>=0&&p.unlocked<=10&&ids(p.done,Array.from({length:10},(_,i)=>i))&&ids(p.interests,LABS.map(l=>l.id))&&typeof p.title==='string'&&Array.isArray(p.notes)&&p.notes.every(n=>n&&typeof n.id==='string'&&typeof n.label==='string'&&typeof n.text==='string')&&p.survey&&!!dimensions(p)&&ids(p.survey.measures,['larghezza','profondita','ingresso'])&&ids(p.survey.views,VIEWS.map(v=>v.id))&&typeof p.survey.title==='string'&&runs(p.survey.runs)&&p.layout&&['bordo','centre'].includes(p.layout.route)&&ZONES.every(z=>{const v=p.layout.zones?.[z.id];return v===null||!!v&&Number.isInteger(v.x)&&Number.isInteger(v.y)&&v.x>=0&&v.x<5&&v.y>=0&&v.y<3;})&&runs(p.layout.runs)&&p.layout.runs.every(r=>Array.isArray(r.conflicts)&&r.conflicts.every(v=>typeof v==='string')&&Array.isArray(r.messages)&&r.messages.every(v=>typeof v==='string'))&&p.build&&[null,...ROOFS.map(r=>r.id)].includes(p.build.roof)&&[null,...FLOORS.map(r=>r.id)].includes(p.build.floor)&&[4,8,12].includes(p.build.cover)&&runs(p.build.runs)&&p.build.runs.every(r=>['sole','pioggia'].includes(r.weather)&&typeof r.text==='string')&&p.heritage&&ids(p.heritage.observations,OBSERVATIONS.map(o=>o.id))&&[null,...HYPOTHESES.map(h=>h.id)].includes(p.heritage.hypothesis)&&['tratto','campitura'].includes(p.heritage.encoding)&&typeof p.heritage.title==='string'&&runs(p.heritage.runs)&&p.heritage.runs.every(r=>typeof r.text==='string')&&p.plan&&[null,...PHASES.map(v=>v.id)].includes(p.plan.phase)&&runs(p.plan.runs)&&p.plan.runs.every(r=>['base','budget'].includes(r.kind)&&['budget','total','now','later','gap','remaining'].every(k=>Number.isFinite(r[k])&&r[k]>=0));}

// Lo stesso validatore è distribuito al browser e alle funzioni. Nessun flag
// di completamento sostituisce i dieci passaggi riferiti alle scelte correnti.
export function restore(value){
 if(!validProject(value)||value.version!==1)return null;
 const p=clone(value);invalidate(p);return p;
}
export function remoteProject(value){
 const p=restore(value);if(!p)return null;
 p.notes=[];p.identity=null;return p;
}
export function summaryItems(value){
 const p=restore(value);if(!p)throw new Error('Progetto CAT non valido.');
 const e=estimate(p),r=planResult(p);
 return [
  {title:'Rilievo',text:`${p.survey.title}: ${dimensions(p).width} × 6 m; ${p.survey.views.map(id=>find(VIEWS,id).label).join(', ')}.`},
  {title:'Spazi',text:ZONES.map(z=>`${z.label}: ${p.layout.zones[z.id]?`casella ${p.layout.zones[z.id].x+1}, ${p.layout.zones[z.id].y+1}`:'da collocare'}`).join('; ')+`. Percorso ${p.layout.route==='bordo'?'lungo il bordo':'centrale'}.`},
  {title:'Materiali',text:`${find(ROOFS,p.build.roof)?.label||'Copertura da scegliere'}, ${find(FLOORS,p.build.floor)?.label||'suolo da scegliere'}, ${p.build.cover} m² coperti.`},
  {title:'Archeodesign',text:`Traccia T1: ${find(HYPOTHESES,p.heritage.hypothesis)?.label||'rappresentazione da scegliere'}. Dati e ipotesi rimangono distinti.`},
  {title:'Risorse',text:`Stima simulata: ${e.total??'da calcolare'} euro. ${find(PHASES,p.plan.phase)?.label||'Fasi da scegliere'}: ${r.now??'da calcolare'} euro ora, ${r.later??'da calcolare'} euro da finanziare dopo.`}
 ];
}
