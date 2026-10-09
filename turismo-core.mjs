export const FORMAT='bussola-turismo-laboratori-1';
export const KEY='bussola.turismo.laboratori.v1';
export const LABS=[
 {id:'territorio',label:'Territorio',role:'Dai voce a un luogo',subject:'Arte e territorio · Geografia turistica'},
 {id:'lingue',label:'Lingue e accoglienza',role:'Apri una conversazione',subject:'Lingua inglese · Seconda e terza lingua comunitaria'},
 {id:'esperienze',label:'Esperienze',role:'Progetta per le persone',subject:'Discipline turistiche e aziendali · Geografia turistica'},
 {id:'servizi',label:'Impresa e servizi',role:'Fai funzionare la proposta',subject:'Discipline turistiche e aziendali · Diritto e legislazione turistica'},
 {id:'comunicazione',label:'Comunicazione',role:'Crea un invito credibile',subject:'Discipline turistiche e aziendali · Lingue · Arte e territorio'}
];
export const PLACES=[
 {id:'bottega',name:'La bottega delle trame',tag:'Saperi e persone',x:45,y:60,short:'Una ceramista trasforma l’argilla in oggetti di oggi.',fact:'La bottega espone ceramiche con motivi geometrici. La ceramista mostra come nascono e spiega perché sceglie quei colori.',detail:'Visita e laboratorio al chiuso. Ingresso senza gradini.',angles:[['gesto','Un gesto che diventa una storia','Dietro ogni motivo c’è una scelta. Qui puoi vedere come un’idea prende forma nell’argilla.'],['incontro','Incontra chi crea','La ceramista racconta il suo lavoro: tradizioni, tentativi e oggetti nuovi. Puoi farle una domanda.'],['dettaglio','Guarda da vicino','Linee, colori e forme: un dettaglio piccolo può cambiare tutto un oggetto. Quale noteresti per primo?']]},
 {id:'museo',name:'Il museo dei viaggi',tag:'Patrimonio e culture',x:24,y:29,short:'Oggetti e testimonianze raccontano incontri tra culture.',fact:'Una raccolta di mappe, fotografie e oggetti documenta partenze e arrivi. Le storie sono accompagnate dalle parole delle persone che le hanno vissute.',detail:'Sale al chiuso. Percorso senza gradini.',angles:[['oggetto','Un oggetto, molti viaggi','Un oggetto può attraversare luoghi e generazioni. Al museo scopri chi lo ha portato qui e che cosa racconta.'],['voci','Ascolta un’altra prospettiva','Una stessa partenza può essere raccontata in modi diversi. Fotografie e testimonianze ti aiutano a confrontarli.'],['mappa','Segui le tracce','Una mappa non mostra solo distanze: qui collega persone, incontri e storie. Scegli una traccia da seguire.']]},
 {id:'laguna',name:'La laguna dei riflessi',tag:'Paesaggio e sostenibilità',x:77,y:31,short:'Un paesaggio cambia con l’acqua, la luce e le stagioni.',fact:'Un percorso segnato conduce a punti di osservazione. Gli animali si osservano a distanza: non si dà loro cibo e non si esce dai sentieri.',detail:'All’aperto. Il sentiero principale è pianeggiante; con pioggia intensa l’attività viene spostata al museo.',angles:[['luce','Lo stesso luogo, un’altra luce','I riflessi cambiano durante il giorno. Osserva come acqua e luce trasformano il paesaggio.'],['equilibrio','Entra con rispetto','Visitare significa anche scegliere come muoversi. Qui si segue il sentiero e si osservano gli animali a distanza.'],['stagioni','Scopri che cosa cambia','Acqua, piante e presenze non sono sempre uguali. Confronta le immagini delle diverse stagioni.']]}
];
export const QUESTIONS=[
 {id:'fare',it:'Preferite guardare o provare a creare?',en:'Would you like to watch or make something?',reply:'We’d love to make something. Is there a short workshop?',translation:'Ci piacerebbe creare qualcosa. C’è un laboratorio breve?',need:'Vogliono provare a creare.'},
 {id:'tempo',it:'Quanto tempo volete dedicare alla visita?',en:'How much time would you like to spend here?',reply:'About an hour. We have a bus to catch at four.',translation:'Circa un’ora. Alle quattro dobbiamo prendere un autobus.',need:'Hanno circa un’ora e un autobus da prendere.'},
 {id:'interesse',it:'Che cosa vi incuriosisce di questo posto?',en:'What interests you about this place?',reply:'We’d like to meet someone who works with clay.',translation:'Vorremmo incontrare qualcuno che lavora con l’argilla.',need:'Vogliono conoscere chi lavora nella bottega.'}
];
export const WELCOMES={
 fare:[['prova','Proponi un laboratorio','You can try a short pottery workshop. I’ll show you where it starts.','Potete provare un breve laboratorio di ceramica. Vi mostro dove inizia.','Una proposta concreta per chi vuole creare.'],['spiega','Spiega come funziona','First, you watch the potter. Then you can make a small clay pattern.','Prima osservate la ceramista. Poi potete creare un piccolo motivo nell’argilla.','Anticipi i due momenti, così possono scegliere.'],['chiedi','Lascia spazio a una domanda','There is a short workshop. What would you like to make?','C’è un laboratorio breve. Che cosa vi piacerebbe creare?','La conversazione continua e fa emergere un’idea.']],
 tempo:[['breve','Proponi una visita breve','There is a thirty-minute visit. You’ll have time to catch your bus.','C’è una visita di trenta minuti. Avrete tempo per prendere l’autobus.','La proposta tiene conto del tempo disponibile.'],['mostra','Aiutali a orientarsi','The short visit ends here. The bus stop is a ten-minute walk away.','La visita breve finisce qui. La fermata dell’autobus è a dieci minuti a piedi.','Rendi visibili durata e spostamento.'],['scegli','Offri una scelta','You can choose a short visit or a quick demonstration. Both take thirty minutes.','Potete scegliere una visita breve o una dimostrazione. Entrambe durano trenta minuti.','Due alternative compatibili con la stessa esigenza.']],
 interesse:[['incontra','Proponi un incontro','You can meet the potter and ask about her work.','Potete incontrare la ceramista e chiederle del suo lavoro.','L’accoglienza mette in relazione visitatori e persone del territorio.'],['osserva','Invitali a osservare','You can watch the potter at work. She can explain how she uses clay.','Potete osservare la ceramista al lavoro. Può spiegare come usa l’argilla.','Colleghi ciò che vedono a una spiegazione.'],['domanda','Apri uno scambio','The potter can tell you about her work. What would you like to ask her?','La ceramista può raccontarvi il suo lavoro. Che cosa vorreste chiederle?','I visitatori partecipano alla conversazione.']]
};
export const PLANS=[
 {id:'crea',name:'Mani e storie',desc:'Incontra una persona del territorio e crea un piccolo oggetto.',slots:[['Accoglienza',10],['Bottega: incontro e creazione',40],['Laguna: osserva i riflessi',25],['Spostamento e saluti',15]],outdoor:'Osservazione alla laguna',visual:'clay'},
 {id:'indaga',name:'Tracce da collegare',desc:'Confronta testimonianze e cerca un legame tra paesaggio e persone.',slots:[['Accoglienza',10],['Museo: due testimonianze a confronto',30],['Laguna: cerca le tracce nel paesaggio',35],['Spostamento e saluti',15]],outdoor:'Ricerca alla laguna',visual:'map'},
 {id:'racconta',name:'Uno sguardo diverso',desc:'Raccogli dettagli e costruisci un racconto per immagini.',slots:[['Accoglienza',10],['Bottega: dettagli da fotografare',35],['Laguna: un racconto per immagini',30],['Spostamento e saluti',15]],outdoor:'Fotografie alla laguna',visual:'camera'}
];
export const RAIN=[
 {id:'museo',name:'Storie al museo',desc:'Sostituisci la parte alla laguna con immagini e testimonianze del paesaggio.',outcome:'Tutto al chiuso. Il gruppo confronta il paesaggio di oggi con le sue trasformazioni.',label:'Museo: immagini e testimonianze'},
 {id:'bottega',name:'Un incontro in bottega',desc:'Usa quel tempo per intervistare la ceramista e documentare il suo lavoro.',outcome:'Tutto al chiuso. Il gruppo scopre le scelte e i tentativi dietro un oggetto.',label:'Bottega: intervista e documentazione'},
 {id:'studio',name:'Studio fotografico al museo',desc:'Lavora su dettagli degli oggetti e una serie di immagini già disponibili.',outcome:'Tutto al chiuso. Il gruppo crea un racconto visivo senza uscire sotto la pioggia.',label:'Museo: racconto fotografico'}
];
export const SERVICES=[
 {id:'lingue',name:'Un incontro in due lingue',desc:'Un mediatore linguistico facilita domande e scambi in italiano e inglese.',fixed:48,perPerson:0},
 {id:'kit',name:'Materiali per creare',desc:'Ogni partecipante riceve un piccolo kit da usare durante l’attività.',fixed:0,perPerson:4},
 {id:'entrambi',name:'Lingue e materiali',desc:'Combini lo scambio in due lingue con un kit personale.',fixed:48,perPerson:4}
];
export const TERMS=[
 {id:'coperto',name:'Alternativa al coperto confermata',text:'Se piove, si svolge l’alternativa al chiuso del progetto. Stessa durata e stesso prezzo.',feedback:'Il visitatore sa che cosa succede e non deve decidere all’ultimo momento.'},
 {id:'rinvio',name:'Nuova data concordata',text:'Se piove, proponiamo una nuova data. Se non puoi partecipare, la quota viene restituita.',feedback:'Conservi l’esperienza all’aperto e chiarisci anche l’opzione per chi non può tornare.'},
 {id:'rimborso',name:'Annullamento con rimborso',text:'Se la pioggia impedisce l’attività, annulliamo e restituiamo la quota. Ti avvisiamo prima dell’arrivo.',feedback:'La promessa è trasparente; quella giornata non avrà un’attività sostitutiva.'}
];
export const TONES=[
 {id:'scoperta',name:'Fai nascere curiosità',headline:'Un luogo. Molte storie da scoprire.',lead:'Osserva dettagli, incontra persone e guarda il territorio da un’altra prospettiva.'},
 {id:'incontro',name:'Metti al centro le persone',headline:'Le storie iniziano da un incontro.',lead:'Conosci chi vive e lavora qui. Le tue domande diventano parte dell’esperienza.'},
 {id:'azione',name:'Invita a partecipare',headline:'Entra nella storia. Aggiungi la tua idea.',lead:'Prova, crea, confronta. Porta il tuo sguardo in un’esperienza fatta anche da te.'}
];
export function createProject(id=crypto.randomUUID()) {return {version:1,format:FORMAT,course:'tur',id,started:false,identity:null,screen:0,done:[],choices:{},notes:[],interests:[],finished:false,updatedAt:null};}
export function canAdvance(p,screen=p.screen){const c=p.choices;return [!!c.place,!!c.angle,!!c.question,!!c.welcome,!!c.plan,!!c.rain,!!c.service,!!c.terms,!!c.tone,!!c.repair][screen]||false;}
export function costs(service,count=12){const n=Math.max(8,Math.min(20,Number(count)||12)),s=SERVICES.find(x=>x.id===service);const base=96+2*n,extra=s?s.fixed+s.perPerson*n:0;return {count:n,guide:72,space:24,materials:2*n,extra,total:base+extra,each:(base+extra)/n};}
export function choose(p,key,value){if(p.choices[key]===value)return p;p.choices[key]=value;if(key==='place'){delete p.choices.angle;}if(key==='question'){delete p.choices.welcome;}if(key==='tone'){delete p.choices.repair;}const affected={place:0,angle:0,question:1,welcome:1,plan:2,rain:2,service:3,terms:3,tone:4,repair:4}[key];if(affected!==undefined)p.done=p.done.filter(i=>i!==affected);p.finished=false;return p;}
export function next(p){if(!canAdvance(p))return false;if(p.screen%2===1&&!p.done.includes(Math.floor(p.screen/2)))p.done.push(Math.floor(p.screen/2));p.screen=Math.min(10,p.screen+1);return true;}
export function complete(p){const ready=p.done.length===5&&Array.from({length:10},(_,i)=>canAdvance(p,i)).every(Boolean)&&p.interests.length>0;p.finished=ready;return ready;}
export function restore(raw){
 if(!raw||raw.format!==FORMAT||raw.course!=='tur'||!/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(raw.id))return null;
 const p=createProject(raw.id);p.version=1;p.started=raw.started===true;p.screen=Number.isInteger(raw.screen)?Math.max(0,Math.min(10,raw.screen)):0;
 const c=raw.choices&&typeof raw.choices==='object'&&!Array.isArray(raw.choices)?raw.choices:{};
 const allowed={place:PLACES.map(x=>x.id),question:QUESTIONS.map(x=>x.id),plan:PLANS.map(x=>x.id),rain:RAIN.map(x=>x.id),service:SERVICES.map(x=>x.id),terms:TERMS.map(x=>x.id),tone:TONES.map(x=>x.id),repair:['dati']};
 for(const [key,values] of Object.entries(allowed))if(values.includes(c[key]))p.choices[key]=c[key];
 const place=PLACES.find(x=>x.id===p.choices.place);if(place?.angles.some(x=>x[0]===c.angle))p.choices.angle=c.angle;
 if(WELCOMES[p.choices.question]?.some(x=>x[0]===c.welcome))p.choices.welcome=c.welcome;
 for(const key of ['storyTitle','posterTitle'])if(typeof c[key]==='string')p.choices[key]=c[key].replace(/[\u0000-\u001f]/g,'').slice(0,85);
 p.choices.people=Number.isInteger(c.people)?Math.max(8,Math.min(20,c.people)):12;
 p.choices.maxSeen=Number.isInteger(c.maxSeen)?Math.max(p.screen,Math.min(10,c.maxSeen)):p.screen;
 p.done=Array.isArray(raw.done)?[...new Set(raw.done)].filter(i=>Number.isInteger(i)&&i>=0&&i<5&&canAdvance(p,i*2)&&canAdvance(p,i*2+1)):[];
 p.notes=Array.isArray(raw.notes)?raw.notes.filter(n=>n&&typeof n.text==='string'&&typeof n.context==='string'):[];
 p.interests=Array.isArray(raw.interests)?[...new Set(raw.interests)].filter(id=>LABS.some(l=>l.id===id)):[];
 p.finished=raw.finished===true&&p.done.length===5&&p.interests.length>0;
 p.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:null;
 if(raw.attestato&&typeof raw.attestato==='object')p.attestato={id:raw.attestato.id,date:raw.attestato.date,name:typeof raw.attestato.name==='string'?raw.attestato.name.slice(0,161):''};
 if(typeof raw._save_operation==='string'&&/^[0-9a-f-]{36}$/i.test(raw._save_operation))p._save_operation=raw._save_operation;
 return p;
}
export function remoteProject(raw){const p=restore(raw);if(!p)return null;p.identity=null;p.notes=[];return p;}
export function summaryItems(p){const c=p.choices,place=PLACES.find(x=>x.id===c.place),angle=place?.angles.find(x=>x[0]===c.angle),q=QUESTIONS.find(x=>x.id===c.question),w=WELCOMES[c.question]?.find(x=>x[0]===c.welcome),plan=PLANS.find(x=>x.id===c.plan),rain=RAIN.find(x=>x.id===c.rain),service=SERVICES.find(x=>x.id===c.service),terms=TERMS.find(x=>x.id===c.terms),tone=TONES.find(x=>x.id===c.tone),price=costs(c.service,c.people);return [
 {title:'Territorio',text:`${place?.name||''}: ${c.storyTitle||angle?.[1]||''}. ${angle?.[2]||''}`},
 {title:'Lingue e accoglienza',text:`${q?.en||''} ${w?.[2]||''} (${w?.[3]||''})`},
 {title:'Esperienze',text:`${plan?.name||''} · 90 minuti. Variante: ${rain?.name||''}.`},
 {title:'Impresa e servizi',text:`${service?.name||''} · ${price.count} partecipanti · quota simulata ${price.each.toFixed(2).replace('.',',')} euro a persona. ${terms?.text||''} Pasti e trasporto esclusi.`},
 {title:'Comunicazione',text:`${c.posterTitle||tone?.headline||''} · Invito corretto confrontando la bozza IA simulata con i dati della propria offerta.`}
 ];}
