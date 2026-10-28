// Variante autonoma: nessuna risposta dei percorsi precedenti viene reinterpretata.
export const BUILDING_JOURNEY='cat-4plus2-edificio';
export const isBuilding=p=>p?.journey===BUILDING_JOURNEY;
export const BUILDING_LABS=[
 {id:'rilievo',label:'Rilievo',product:'Il tuo percorso del drone',client:'Edificio Aurora',subjects:'Rilievo e Geomatica · Tecnologie digitali'},
 {id:'spazi',label:'Edificio',product:'La tua tavola del fabbricato',client:'Edificio Aurora',subjects:'Rappresentazione grafica · Progettazione e Costruzioni'},
 {id:'materiali',label:'Materiali',product:'La tua proposta di isolamento',client:'Edificio Aurora',subjects:'Costruzioni · Fisica · Sostenibilità'},
 {id:'energia',label:'Energia',product:'Il tuo confronto prima e dopo',client:'Edificio Aurora',subjects:'Impianti · Efficienza energetica · Matematica'},
 {id:'risorse',label:'Risorse',product:'La tua stima e le fasi',client:'Edificio Aurora',subjects:'Economia ed Estimo · Gestione del Cantiere e Sicurezza'}
];
export const BUILDING_STAGES=[
 ['Da dove riprendi il fabbricato?','Devi documentare le quattro facciate e il tetto dell’edificio Aurora. Scegli tre punti di ripresa per il drone: l’ordine dei tocchi diventa il tuo percorso.','Scegli tre punti diversi. Puoi toccarne uno selezionato per toglierlo.','Prova il percorso'],
 ['Che cosa rimane fuori dalle riprese?','Avvia la simulazione. Osserva quali parti sono visibili dai tuoi tre punti; se manca qualcosa, cambia un punto e riprova.','Prova un percorso che documenti quattro facciate e tetto.','Rappresenta l’edificio'],
 ['Come racconti lo stesso edificio?','Scegli almeno due rappresentazioni. La pianta mostra l’ingombro, il prospetto una facciata, il modello il volume.','Scegli almeno due viste.','Leggi i componenti'],
 ['Che cosa c’è dietro la facciata?','Apri i tre dati del fabbricato, poi componi la tavola. Ti serviranno per interpretare le immagini termiche.','Apri i tre dati e componi la tavola.','Osserva i materiali'],
 ['Dove cercheresti una dispersione?','La fotocamera mostra forme e colori; la termocamera mostra temperature superficiali. Apri i tre punti dell’immagine termica e confrontali.','Apri parete, telaio e finestre.','Scegli un intervento'],
 ['Come interrompi il passaggio del calore?','In questa prova vuoi ridurre le dispersioni attraverso pareti e telaio. Scegli un intervento e osserva quali parti copre.','Scegli una soluzione e verifica quali parti tratta.','Confronta prima e dopo'],
 ['Che cosa cambia nell’immagine termica?','Confronta l’edificio attuale con la soluzione che hai scelto. La scala dei colori e le condizioni della prova restano uguali.','Apri il confronto termico della soluzione attuale.','Leggi i dati energetici'],
 ['E la classe energetica?','La termografia da sola non basta. Apri anche le due schede energetiche del dossier e confronta i valori già forniti per questa simulazione.','Confronta le schede energetiche prima e dopo.','Calcola le risorse'],
 ['Quanto costa la tua proposta?','Le superfici dell’edificio e l’intervento scelto diventano quantità e costi. Calcola la stima con i prezzi della prova.','Calcola la stima della soluzione attuale.','Organizza le fasi'],
 ['Hai 12.000 euro: da dove parti?','Puoi proporre l’intervento completo oppure finanziare prima progetto e verifiche. Osserva che cosa resta da finanziare.','Scegli una fase e calcola il piano.','Raccogli i tuoi elaborati']
];
export const SHOTS=[
 {id:'A',label:'A · Sud-ovest',x:17,y:80,sees:['sud','ovest'],desc:'Ripresa obliqua: facciate sud e ovest.'},
 {id:'B',label:'B · Sud',x:50,y:88,sees:['sud'],desc:'Ripresa frontale della sola facciata sud.'},
 {id:'C',label:'C · Sud-est',x:83,y:80,sees:['sud','est'],desc:'Ripresa obliqua: facciate sud ed est.'},
 {id:'D',label:'D · Nord-est in quota',x:83,y:20,sees:['nord','est','tetto'],desc:'Ripresa più alta: facciate nord, est e tetto.'},
 {id:'E',label:'E · Nord',x:50,y:12,sees:['nord'],desc:'Ripresa frontale della sola facciata nord.'},
 {id:'F',label:'F · Nord-ovest in quota',x:17,y:20,sees:['nord','ovest','tetto'],desc:'Ripresa più alta: facciate nord, ovest e tetto.'}
];
export const SURFACES=['sud','est','nord','ovest','tetto'];
export const BUILDING_VIEWS=[{id:'pianta',label:'Pianta',desc:'Ingombro dall’alto: 12 × 8 metri.'},{id:'prospetto',label:'Prospetto',desc:'La facciata sud: 12 metri di larghezza e 6 di altezza.'},{id:'modello',label:'Modello',desc:'Un volume semplificato per collegare le facciate.'}];
export const BUILDING_FACTS=[
 {id:'dimensioni',label:'Le dimensioni',text:'La pianta misura 12 × 8 m e l’altezza è 6 m. Le quattro facciate hanno 240 m² complessivi: 40 m² di finestre e 200 m² di pareti, compreso il telaio.'},
 {id:'telaio',label:'Il telaio',text:'Pilastri e travi sono in calcestruzzo armato. In questo edificio inventato arrivano fino alla superficie esterna e non hanno isolamento continuo.'},
 {id:'tamponamenti',label:'Pareti e finestre',text:'Le pareti fra i pilastri sono in laterizio. Le finestre hanno serramenti vecchi. Materiali e collegamenti diversi possono lasciar passare il calore in modo diverso.'}
];
export const THERMAL_SPOTS=[
 {id:'parete',label:'Parete · 9 °C',text:'La superficie esterna della parete è a 9 °C. È il riferimento con cui confrontare le altre zone della facciata.'},
 {id:'telaio',label:'Pilastri e travi · 13 °C',text:'Il telaio appare più caldo della parete. Con interno caldo ed esterno freddo, è un indizio di maggiore passaggio di calore: un possibile ponte termico da verificare.'},
 {id:'finestre',label:'Contorno finestre · 12 °C',text:'Anche i contorni sono più caldi della parete. Vanno controllati collegamenti e tenuta; il vetro può riflettere altre sorgenti e richiede una lettura prudente.'}
];
// Numeri inventati, forniti dal dossier didattico. Nessuna classe deriva dal termogramma.
// Tutti i casi usano lo stesso edificio di riferimento (EPgl,nren 80 kWh/m² anno).
export const INTERVENTIONS=[
 {id:'pareti',label:'Isola solo fra i pilastri',desc:'Aggiungi isolamento alle pareti lasciando scoperti pilastri e travi.',temperatures:[7,13,12],energy:215,energyClass:'F',area:200,price:45,parts:'Pareti isolate; il telaio resta scoperto.',reason:'La parete disperde meno nel modello, ma il percorso attraverso pilastri e travi rimane. Il ponte termico non è risolto.'},
 {id:'continuo',label:'Isolamento esterno continuo',desc:'Avvolgi pareti, pilastri e travi con uno strato isolante continuo.',temperatures:[7,8,12],energy:140,energyClass:'D',area:200,price:65,parts:'Pareti e telaio coperti dallo strato isolante.',reason:'Lo strato continuo tratta anche il telaio. Restano da studiare raccordi con finestre, balconi e copertura; il progetto reale richiede altre verifiche.'},
 {id:'serramenti',label:'Sostituisci i serramenti',desc:'Intervieni sulle finestre e sui loro collegamenti, lasciando pareti e telaio come sono.',temperatures:[9,13,8],energy:240,energyClass:'F',area:40,price:400,parts:'Finestre trattate; pareti e telaio invariati.',reason:'Migliori le finestre, ma non intervieni sul percorso del calore attraverso pareti e telaio. È un altro problema da affrontare.'}
];
export const BASE_ENERGY={energy:320,energyClass:'G',temperatures:[9,13,12]};
export const BUILDING_PHASES=[{id:'completo',label:'Intervento completo',desc:'Proponi ora progetto, verifiche e realizzazione. Se il budget non basta, evidenzia la somma mancante.'},{id:'progetto',label:'Prima progetto e verifiche',desc:'Destini ora 1.000 € alla preparazione. Tutti i lavori restano nella fase da finanziare.'}];
const uuid=()=>crypto.randomUUID(),stamp=()=>new Date().toISOString();
const last=(runs,signature)=>runs.findLast(r=>r.signature===signature)||null;
const record=(runs,signature,result={})=>{const r={id:uuid(),signature,...result,at:stamp()};runs.push(r);return r;};
export function newBuilding(){return {points:[],surveyRuns:[],views:[],facts:[],modelRuns:[],thermal:[],intervention:null,materialRuns:[],comparisonRuns:[],energyRuns:[],estimateRuns:[],phase:null,planRuns:[]};}
export function shotResult(b){const covered=SURFACES.filter(s=>b.points.some(id=>SHOTS.find(p=>p.id===id)?.sees.includes(s))),missing=SURFACES.filter(s=>!covered.includes(s));return {covered,missing,complete:b.points.length===3&&!missing.length};}
export const shotSignature=b=>JSON.stringify(b.points);
export const modelSignature=b=>JSON.stringify([b.views,b.facts]);
export const materialSignature=b=>JSON.stringify([b.thermal,b.intervention]);
export const comparisonSignature=b=>JSON.stringify([materialSignature(b),'termico']);
export const energyBuildingSignature=b=>JSON.stringify([materialSignature(b),'energia']);
export const estimateSignature=b=>JSON.stringify([b.intervention,'stima']);
export const buildingPlanSignature=b=>JSON.stringify([estimateSignature(b),b.phase]);
export function intervention(b){return INTERVENTIONS.find(i=>i.id===b.intervention)||null;}
export function toggleShot(b,id){if(!SHOTS.some(p=>p.id===id))return false;if(b.points.includes(id)){b.points=b.points.filter(p=>p!==id);return true;}if(b.points.length===3)return false;b.points.push(id);return true;}
export function testShots(b){return b.points.length===3?record(b.surveyRuns,shotSignature(b),shotResult(b)):null;}
export function composeBuilding(b){return b.views.length>=2&&b.facts.length===3?record(b.modelRuns,modelSignature(b),{views:[...b.views]}):null;}
export function testMaterial(b){const i=intervention(b);return i&&b.thermal.length===3?record(b.materialRuns,materialSignature(b),{intervention:i.id,parts:i.parts}):null;}
export function compareBuilding(b){const i=intervention(b);return i&&last(b.materialRuns,materialSignature(b))?record(b.comparisonRuns,comparisonSignature(b),{intervention:i.id,before:[...BASE_ENERGY.temperatures],after:[...i.temperatures]}):null;}
export function buildingEnergy(b){const i=intervention(b);return i?{intervention:i.id,before:BASE_ENERGY.energy,after:i.energy,beforeClass:BASE_ENERGY.energyClass,afterClass:i.energyClass}:null;}
export function compareBuildingEnergy(b){const r=buildingEnergy(b);return r&&last(b.comparisonRuns,comparisonSignature(b))?record(b.energyRuns,energyBuildingSignature(b),r):null;}
export function buildingEstimate(b){const i=intervention(b);return i?{intervention:i.id,area:i.area,price:i.price,works:i.area*i.price,setup:1000,total:i.area*i.price+1000}:null;}
export function testBuildingEstimate(b){const r=buildingEstimate(b);return r?record(b.estimateRuns,estimateSignature(b),r):null;}
export function buildingPlan(b){const e=buildingEstimate(b);if(!e||!BUILDING_PHASES.some(p=>p.id===b.phase))return null;const now=b.phase==='progetto'?e.setup:e.total;return {...e,phase:b.phase,budget:12000,now,later:e.total-now,gap:Math.max(0,now-12000),remaining:Math.max(0,12000-now)};}
export function testBuildingPlan(b){const r=buildingPlan(b);return r?record(b.planRuns,buildingPlanSignature(b),r):null;}
export function buildingReady(p,s){const b=p.building;return !![
 b.points.length===3,
 shotResult(b).complete&&last(b.surveyRuns,shotSignature(b)),
 b.views.length>=2,
 b.views.length>=2&&b.facts.length===3&&last(b.modelRuns,modelSignature(b)),
 b.thermal.length===3,
 last(b.materialRuns,materialSignature(b)),
 last(b.comparisonRuns,comparisonSignature(b)),
 last(b.energyRuns,energyBuildingSignature(b)),
 last(b.estimateRuns,estimateSignature(b)),
 last(b.planRuns,buildingPlanSignature(b))
 ][s];}
export function validBuilding(b){
 const ids=(v,a,max=a.length)=>Array.isArray(v)&&v.length<=max&&new Set(v).size===v.length&&v.every(id=>a.includes(id));
 const runs=(v,check=()=>true)=>Array.isArray(v)&&v.every(r=>r&&typeof r.id==='string'&&typeof r.signature==='string'&&check(r));
 const same=(r,o,keys=Object.keys(o||{}))=>!!o&&keys.every(k=>JSON.stringify(r[k])===JSON.stringify(o[k]));
 return !!b&&ids(b.points,SHOTS.map(p=>p.id),3)&&ids(b.views,BUILDING_VIEWS.map(p=>p.id))&&ids(b.facts,BUILDING_FACTS.map(p=>p.id))&&ids(b.thermal,THERMAL_SPOTS.map(p=>p.id))&&[null,...INTERVENTIONS.map(i=>i.id)].includes(b.intervention)&&[null,...BUILDING_PHASES.map(p=>p.id)].includes(b.phase)
 &&runs(b.surveyRuns,r=>ids(r.covered,SURFACES)&&ids(r.missing,SURFACES)&&typeof r.complete==='boolean')&&runs(b.modelRuns,r=>ids(r.views,BUILDING_VIEWS.map(v=>v.id)))
 &&runs(b.materialRuns,r=>INTERVENTIONS.some(i=>i.id===r.intervention&&i.parts===r.parts))
 &&runs(b.comparisonRuns,r=>INTERVENTIONS.some(i=>i.id===r.intervention&&same(r,{before:BASE_ENERGY.temperatures,after:i.temperatures})))
 &&runs(b.energyRuns,r=>same(r,buildingEnergy({intervention:r.intervention})))
 &&runs(b.estimateRuns,r=>same(r,buildingEstimate({intervention:r.intervention})))
 &&runs(b.planRuns,r=>same(r,buildingPlan({intervention:r.intervention,phase:r.phase})));
}
export function buildingSummary(p){const b=p.building,i=intervention(b),e=buildingEstimate(b),plan=buildingPlan(b);return [
 {title:'Rilievo',text:b.points.length?`Punti ${b.points.join(' → ')}. ${shotResult(b).missing.length?'Da documentare: '+shotResult(b).missing.join(', '):'Quattro facciate e tetto documentati nel modello'}.`:'Percorso del drone da preparare.'},
 {title:'Edificio',text:`Edificio Aurora: 12 × 8 m, altezza 6 m. ${b.views.length?b.views.map(id=>BUILDING_VIEWS.find(v=>v.id===id).label).join(', '):'Tavola da comporre'}.`},
 {title:'Materiali',text:i?`${i.label}. ${i.parts}`:'Intervento da scegliere dopo le osservazioni termiche.'},
 {title:'Energia',text:i?`Dossier didattico: classe G → ${i.energyClass}; indice di energia primaria non rinnovabile 320 → ${i.energy} kWh/m² anno. Dati inventati, non un APE.`:'Confronto prima e dopo da preparare.'},
 {title:'Risorse',text:e?`Stima ipotetica ${e.total} euro. ${plan?`${BUILDING_PHASES.find(p=>p.id===b.phase).label}: ${plan.now} euro ora, ${plan.later} euro dopo; ${plan.gap} euro mancanti nella prima fase.`:'Fasi da scegliere.'}`:'Stima da calcolare.'}
 ];}
