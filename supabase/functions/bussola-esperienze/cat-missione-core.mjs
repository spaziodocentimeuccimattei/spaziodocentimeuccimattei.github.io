// Missione autonoma. I tre momenti narrativi producono cinque elaborati CAT.
export const MISSION_JOURNEY='cat-4plus2-missione';
export const isMission=p=>p?.journey===MISSION_JOURNEY;
export const MISSION_LABS=[
 {id:'rilievo',label:'Rilievo aereo',product:'Le tue quattro riprese',subjects:'Rilievo e Geomatica'},
 {id:'termografia',label:'Termografia',product:'Le tue osservazioni termiche',subjects:'Fisica · Costruzioni e Impianti'},
 {id:'materiali',label:'Materiali',product:'Le tue scelte per la riqualificazione',subjects:'Costruzioni · Sostenibilità'},
 {id:'energia',label:'Progetto energetico',product:'Il tuo confronto fra prestazioni e costi',subjects:'Impianti · Matematica · Estimo'},
 {id:'trasformazione',label:'Trasformazione',product:'Il tuo edificio prima e dopo',subjects:'Progettazione · Ambiente e Territorio'}
];
export const MISSION_PHASES=[
 {id:'rilievo',label:'Rilievo aereo',title:'Decolla. Cerca i punti deboli.',intro:'Sei in un gruppo di giovani progettisti: la tua missione è riqualificare l’edificio Aurora, che richiede molta energia per il riscaldamento. Gira intorno al fabbricato, scatta le quattro facciate e attiva la termocamera.'},
 {id:'materiali',label:'Riqualificazione',title:'Le tue scelte cambiano l’edificio.',intro:'Ora entra nel laboratorio dei materiali. Combina isolamento, infissi e finitura. Osserva il modello, prova il progetto e confronta energia e costi: hai 23.000 €.'},
 {id:'trasformazione',label:'Prima e dopo',title:'Dai forma alla tua proposta.',intro:'Applica il progetto al modello e fai scorrere il confronto: quali problemi hai affrontato? Quali rimangono? Puoi tornare ai materiali e provare un’altra combinazione.'}
];
export const FACADES=[{id:'sud',label:'Sud'},{id:'est',label:'Est'},{id:'nord',label:'Nord'},{id:'ovest',label:'Ovest'}];
export const HOTSPOTS=[
 {id:'parete',label:'Parete',temperature:9,text:'La parete esterna è a 9 °C. Usa questo dato come riferimento per confrontare telaio e finestre.'},
 {id:'telaio',label:'Pilastri e travi',temperature:13,text:'Il telaio è a 13 °C, più caldo della parete. Con interno caldo ed esterno freddo, è un indizio di un possibile ponte termico: il calore attraversa più facilmente questa zona.'},
 {id:'infissi',label:'Contorno degli infissi',temperature:12,text:'Il contorno degli infissi è a 12 °C. I collegamenti e la tenuta meritano un controllo. Il vetro può riflettere altre sorgenti: il colore da solo non basta.'}
];
// Catalogo inventato: valori assegnati ai componenti completi della simulazione,
// non proprietà universali dei materiali o preventivi utilizzabili in un cantiere.
export const INSULATIONS=[
 {id:'isolamento-assente',label:'Mantieni le pareti attuali',desc:'Pareti e telaio restano senza isolamento esterno.',u:1.5,cost:0,temperature:[9,13],color:'#c5b498'},
 {id:'isolamento-minerale',label:'Cappotto in lana minerale',desc:'Uno strato continuo avvolge anche pilastri e travi. Dossier: U = 0,30 W/m²K.',u:.30,cost:11000,temperature:[7,8],color:'#e8dec7'},
 {id:'isolamento-sughero',label:'Cappotto in sughero',desc:'Uno strato continuo di materiale di origine vegetale. Dossier: U = 0,32 W/m²K.',u:.32,cost:14000,temperature:[7,8],color:'#d9bd8d'}
];
export const WINDOWS=[
 {id:'infissi-attuali',label:'Mantieni gli infissi',desc:'Conservi i serramenti vecchi. Dossier: U = 4,0 W/m²K.',u:4,cost:0,temperature:12},
 {id:'infissi-doppi',label:'Nuovi infissi con doppi vetri',desc:'Sostituisci gli infissi e studi i raccordi con la parete. Dossier: U = 1,4 W/m²K.',u:1.4,cost:7800,temperature:8},
 {id:'infissi-tripli',label:'Nuovi infissi con tripli vetri',desc:'Nel dossier isolano di più, con un costo maggiore. U = 1,0 W/m²K.',u:1,cost:11000,temperature:7}
];
export const FINISHES=[
 {id:'finitura-base',label:'Finitura standard',desc:'Il dossier indica 30 g/L di composti organici volatili (VOC).',cost:1800,voc:30,color:'#dfd3b8'},
 {id:'finitura-bassovoc',label:'Finitura a basse emissioni',desc:'Il dossier indica 2 g/L di VOC. Cambia questo aspetto ambientale, senza ridurre le dispersioni termiche.',cost:2400,voc:2,color:'#e9e3ce'}
];
export const MISSION_BUDGET=23000;
export const MISSION_ASSUMPTIONS={walls:200,windows:40,otherUA:80,deltaT:15,hours:1800,efficiency:.85,setup:1000};
const choice=(a,id)=>a.find(v=>v.id===id),copy=v=>JSON.parse(JSON.stringify(v));
export function newMission(){return {position:0,camera:'visibile',captures:[],thermalUsed:false,observations:[],lastSpot:null,insulation:null,windows:null,finish:null,runs:[],applications:[],compare:50};}
export const missionSignature=m=>JSON.stringify([m.insulation,m.windows,m.finish]);
export function missionResult(m){
 const insulation=choice(INSULATIONS,m.insulation),windows=choice(WINDOWS,m.windows),finish=choice(FINISHES,m.finish);if(!insulation||!windows||!finish)return null;
 const a=MISSION_ASSUMPTIONS,ua=insulation.u*a.walls+windows.u*a.windows+a.otherUA,baseUA=1.5*a.walls+4*a.windows+a.otherUA;
 const before=Math.round(baseUA*a.deltaT*a.hours/a.efficiency/1000),after=Math.round(ua*a.deltaT*a.hours/a.efficiency/1000),total=insulation.cost+windows.cost+finish.cost+a.setup;
 return {insulation:insulation.id,windows:windows.id,finish:finish.id,before,after,saved:before-after,reduction:Math.round((baseUA-ua)/baseUA*100),total,budget:MISSION_BUDGET,gap:Math.max(0,total-MISSION_BUDGET),remaining:Math.max(0,MISSION_BUDGET-total),voc:finish.voc,temperatures:[...insulation.temperature,windows.temperature]};
}
export const latestMissionRun=m=>m.runs.findLast(r=>r.signature===missionSignature(m))||null;
export const latestApplication=m=>m.applications.findLast(r=>r.signature===missionSignature(m))||null;
export function moveDrone(m,direction){if(![-1,1].includes(direction))return false;m.position=(m.position+direction+4)%4;return true;}
export function captureFacade(m){const id=FACADES[m.position].id;if(!m.captures.includes(id))m.captures.push(id);return id;}
export function observeSpot(m,id){if(m.camera!=='termica'||!choice(HOTSPOTS,id))return false;m.thermalUsed=true;m.lastSpot=id;if(!m.observations.includes(id))m.observations.push(id);return true;}
export function chooseMission(m,field,id){const source={insulation:INSULATIONS,windows:WINDOWS,finish:FINISHES}[field];if(!source||!choice(source,id))return false;m[field]=id;return true;}
export function testMission(m){const r=missionResult(m);if(!r)return null;const row={id:crypto.randomUUID(),signature:missionSignature(m),...r,at:new Date().toISOString()};m.runs.push(row);return row;}
export function applyMission(m){const r=latestMissionRun(m);if(!r||r.gap||r.saved<=0)return null;const row={id:crypto.randomUUID(),signature:r.signature,at:new Date().toISOString()};m.applications.push(row);return row;}
export function missionLabReady(p,index){const m=p.mission,run=latestMissionRun(m);return !![
 m.captures.length===4,
 m.thermalUsed&&m.observations.length===3,
 missionResult(m),
 run&&!run.gap&&run.saved>0,
 latestApplication(m)&&run&&!run.gap&&run.saved>0
 ][index];}
export const missionReady=(p,screen)=>missionLabReady(p,Math.floor(screen/2));
export function phaseReady(p,phase=p.screen){return p.started&&[()=>missionLabReady(p,0)&&missionLabReady(p,1),()=>missionLabReady(p,2)&&missionLabReady(p,3),()=>missionLabReady(p,4)][phase]?.()||false;}
export function advanceMission(p){if(!phaseReady(p))return false;const through=[3,7,9][p.screen];for(let n=0;n<=through;n++)if(missionReady(p,n)&&!p.done.includes(n))p.done.push(n);p.screen=Math.min(3,p.screen+1);p.unlocked=Math.max(p.unlocked,p.screen);return true;}
export function validMission(m){
 const ids=(v,a)=>Array.isArray(v)&&new Set(v).size===v.length&&v.every(id=>a.includes(id));
 const option=(a,id)=>id===null||!!choice(a,id);
 const row=r=>r&&typeof r.id==='string'&&typeof r.signature==='string'&&typeof r.at==='string';
 if(!m||!Number.isInteger(m.position)||m.position<0||m.position>3||!['visibile','termica'].includes(m.camera)||!ids(m.captures,FACADES.map(v=>v.id))||typeof m.thermalUsed!=='boolean'||!ids(m.observations,HOTSPOTS.map(v=>v.id))||![null,...HOTSPOTS.map(v=>v.id)].includes(m.lastSpot)||!option(INSULATIONS,m.insulation)||!option(WINDOWS,m.windows)||!option(FINISHES,m.finish)||!Number.isFinite(m.compare)||m.compare<0||m.compare>100||!Array.isArray(m.runs)||!Array.isArray(m.applications))return false;
 if(!m.runs.every(r=>{if(!row(r))return false;const expected=missionResult(r);return expected&&r.signature===missionSignature(r)&&Object.keys(expected).every(k=>JSON.stringify(r[k])===JSON.stringify(expected[k]));}))return false;
 return m.applications.every(r=>row(r)&&m.runs.some(run=>run.signature===r.signature&&!run.gap&&run.saved>0));
}
export function missionSummary(p){const m=p.mission,r=latestMissionRun(m),i=choice(INSULATIONS,m.insulation),w=choice(WINDOWS,m.windows),f=choice(FINISHES,m.finish);return [
 {title:'Rilievo aereo',text:m.captures.length?`Riprese: ${m.captures.map(id=>choice(FACADES,id).label).join(', ')}. Drone virtuale intorno all’edificio Aurora.`:'Rilievo aereo da iniziare.'},
 {title:'Termografia',text:m.observations.length?`Osservati: ${m.observations.map(id=>choice(HOTSPOTS,id).label).join(', ')}. Vista esterna invernale: i colori indicano temperature, non una diagnosi automatica.`:'Osservazioni termiche da raccogliere.'},
 {title:'Materiali',text:[i?.label,w?.label,f?.label].filter(Boolean).join('; ')||'Materiali da scegliere.'},
 {title:'Progetto energetico',text:r?`Modello semplificato del riscaldamento: ${r.before} → ${r.after} kWh/anno (−${r.reduction}%). Costo ipotetico ${r.total} €; ${r.gap?`mancano ${r.gap} €`:`entro il budget di ${r.budget} €`}. Nessun APE.`:'Combinazione di materiali ancora da provare.'},
 {title:'Trasformazione',text:latestApplication(m)?'Proposta applicata al modello, con confronto prima e dopo. I miglioramenti riguardano il caso inventato.':'Proposta da applicare al modello.'}
 ];}
export function missionContext(p){const phase=Math.max(0,p.screen),n=[0,4,8,10][phase]??10;return {course:'cat',lab:p.screen<0?'ingresso':phase===3?'conclusione':MISSION_PHASES[phase].id,screen:p.screen<0?-1:n,version:MISSION_JOURNEY,label:p.screen<0?'Ingresso':phase===3?'Conclusione · Missione Aurora':`Missione Aurora · ${MISSION_PHASES[phase].label}`};}

// La stessa identità conserva le diverse esperienze senza sovrascriverne i contenuti.
// Gli archivi sono additivi; campi futuri e note mantengono i loro identificativi.
const allArchives=p=>Array.isArray(p?._cat_archives)?p._cat_archives:[];
export function savedCatProjects(p){return allArchives(p).filter(a=>a&&typeof a.key==='string'&&a.project&&typeof a.project==='object');}
export function archiveActive(p){const snapshot=copy(p);delete snapshot._cat_archives;return {key:crypto.randomUUID(),archivedAt:new Date().toISOString(),project:snapshot};}
export function startNewMission(current,fresh){const archives=[...allArchives(current)];if(current.started||current.notes?.length)archives.push(archiveActive(current));return {...current,...fresh,id:current.id,revision:current.revision,notes:copy(current.notes),identity:copy(current.identity??null),_cat_archives:archives,...(current.attestato?{attestato:{name:current.attestato.name||''}}:{})};}
export function restoreCatArchive(current,key){const selected=savedCatProjects(current).find(a=>a.key===key);if(!selected)return null;const archives=allArchives(current).filter(a=>a?.key!==key);if(current.started||current.notes?.length)archives.push(archiveActive(current));const notes=[...new Map([...(selected.project.notes||[]),...(current.notes||[])].map(n=>[n.id,n])).values()];return {...copy(selected.project),id:current.id,revision:current.revision,notes,_cat_archives:archives};}
