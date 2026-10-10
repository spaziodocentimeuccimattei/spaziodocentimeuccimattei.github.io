export const FORMAT='bussola-afm-proposta-1';
export const STORE='bussola.afm.anteprima.v1';
export const LABS=[
 {id:'idee',label:'Idee e impresa',verb:'Dai forma a una proposta',subject:'Economia aziendale · Economia politica'},
 {id:'organizzazione',label:'Persone e organizzazione',verb:'Metti in ordine il lavoro',subject:'Economia aziendale · Informatica'},
 {id:'numeri',label:'Dati e finanza',verb:'Fai parlare i numeri',subject:'Economia aziendale · Matematica · Informatica'},
 {id:'accordi',label:'Regole e accordi',verb:'Costruisci un accordo chiaro',subject:'Diritto · Economia aziendale'},
 {id:'comunicazione',label:'Marketing e lingue',verb:'Fai incontrare idee e persone',subject:'Economia aziendale · Lingua inglese · Strumenti digitali'}
];
export const OFFERS=[
 {id:'segno',name:'Segno',title:'Quaderni con una storia',type:'Prodotto',desc:'Copertine personalizzate: un oggetto quotidiano diventa qualcosa di tuo.',icon:'book',features:[
  {id:'regalo',title:'Un regalo personale',need:'«Vorrei regalare qualcosa che racconti una persona.»',text:'Una copertina con un dettaglio scelto da chi fa il regalo.',headline:'Una storia da portare con te.'},
  {id:'gruppo',title:'Un gruppo, tante voci',need:'«Vorremmo riconoscerci come gruppo, senza avere tutto uguale.»',text:'Un segno comune e un dettaglio diverso per ogni persona.',headline:'Un segno ci unisce. Il resto è tuo.'},
  {id:'riuso',title:'Una seconda vita',need:'«Ho un quaderno da finire: vorrei cambiare solo la copertina.»',text:'Una copertina nuova per un quaderno già posseduto.',headline:'Le pagine continuano. La storia cambia.'}
 ]},
 {id:'riparti',name:'Riparti',title:'Rimetti in uso quello che hai',type:'Servizio',desc:'Piccole riparazioni e personalizzazioni di zaini e astucci.',icon:'bag',features:[
  {id:'ripara',title:'Tornare a usarlo',need:'«Mi piace il mio zaino, ma una parte si è rovinata.»',text:'Si controlla il danno e si propone una piccola riparazione possibile.',headline:'Un oggetto a cui tieni. Ancora con te.'},
  {id:'stile',title:'Cambiare stile',need:'«Funziona ancora, ma vorrei che mi rappresentasse di più.»',text:'Un dettaglio personalizzato su un oggetto già posseduto.',headline:'Quello che hai. Con il tuo stile.'},
  {id:'gruppo',title:'Riconoscersi',need:'«Abbiamo oggetti simili: vorremmo distinguerli.»',text:'Segni coordinati, diversi per ciascun componente del gruppo.',headline:'Insieme, con un segno personale.'}
 ]},
 {id:'creakit',name:'CreaKit',title:'Un kit per inventare storie',type:'Prodotto e servizio',desc:'Carte e materiali per creare racconti per immagini, con una breve guida.',icon:'cards',features:[
  {id:'inizio',title:'Un primo slancio',need:'«Mi piace inventare, ma davanti al foglio vuoto mi blocco.»',text:'Carte con personaggi, luoghi e imprevisti da combinare liberamente.',headline:'Una carta. Mille inizi possibili.'},
  {id:'insieme',title:'Creare insieme',need:'«Cerchiamo un’attività in cui ognuno aggiunga qualcosa.»',text:'Un racconto che passa da una persona all’altra e cambia a ogni turno.',headline:'La storia cresce con ogni voce.'},
  {id:'immagini',title:'Pensare per immagini',need:'«Vorrei raccontare senza partire da un testo lungo.»',text:'Scene da comporre con forme e immagini; le parole arrivano dopo.',headline:'Prima le immagini. Poi la tua storia.'}
 ]}
];
export const TASKS=[
 {id:'cliente',name:'Ascolta il cliente',role:'Relazioni commerciali',detail:'Che cosa serve e per quando? Raccogli la richiesta.'},
 {id:'risorse',name:'Controlla le risorse',role:'Organizzazione',detail:'Verifica materiali, persone e tempi disponibili.'},
 {id:'riepilogo',name:'Prepara il riepilogo',role:'Amministrazione',detail:'Metti per iscritto quantità, data e accordi.'}
];
export const OBSTACLES=[
 {id:'dividi',title:'Due consegne concordate',desc:'Consegni 6 lavori venerdì e gli ultimi 2 lunedì, se il cliente accetta.',slots:['Venerdì · 6 lavori','Lunedì · 2 lavori'],feedback:'I primi lavori arrivano in tempo. Il cliente deve poter scegliere se accettare due consegne.'},
 {id:'alternativa',title:'Un materiale alternativo',desc:'Il cliente approva un materiale disponibile: puoi consegnare tutti gli 8 lavori venerdì.',slots:['Oggi · conferma del materiale','Venerdì · 8 lavori'],feedback:'Mantieni la data, ma cambia un dettaglio del lavoro. Lo comunichi prima, non dopo la consegna.'},
 {id:'nuovadata',title:'Una nuova data per tutti',desc:'Proponi lunedì per tutti gli 8 lavori e chiedi conferma al cliente.',slots:['Oggi · accordo sulla data','Lunedì · 8 lavori'],feedback:'Mantieni il materiale iniziale e una sola consegna. Il cliente deve poter valutare l’attesa.'}
];
export const AGREEMENTS=[
 {id:'unica',title:'Una consegna completa',desc:'Consegni il lavoro entro 7 giorni dalla conferma del progetto.',delivery:'Entro 7 giorni dalla conferma del progetto.',feedback:'Una data chiara. Prima di confermare, entrambe le parti sanno quando è previsto il lavoro.'},
 {id:'prova',title:'Prima una prova',desc:'Mostri un esempio entro 3 giorni; il lavoro completo arriva entro 7 giorni dalla sua approvazione.',delivery:'Esempio entro 3 giorni; lavoro entro 7 giorni dall’approvazione dell’esempio.',feedback:'Il cliente vede un esempio prima. L’approvazione sposta il momento da cui si contano i 7 giorni.'},
 {id:'insieme',title:'Data concordata insieme',desc:'Prima della conferma scegliete insieme una data e la scrivete nella proposta.',delivery:'Data da concordare e scrivere prima della conferma.',feedback:'Lasci spazio alle esigenze di entrambe le parti. La data deve essere completata prima di confermare davvero.'}
];
export const AMENDMENTS=[
 {id:'separata',title:'Una proposta aggiuntiva',desc:'Chiarisci che l’immagine è un lavoro nuovo e prepari una proposta separata.',clause:'L’immagine per i social sarà oggetto di una proposta aggiuntiva da confermare.',reply:'Va bene. Prima di decidere vorrei capire che cosa comprende e quanto costa.',feedback:'Distingui il lavoro già concordato dalla richiesta nuova. Il cliente può decidere prima di impegnarsi.'},
 {id:'piccola',title:'Un adattamento limitato',desc:'Includi una sola immagine ricavata dal progetto, chiarendo che non comprende una campagna completa.',clause:'È inclusa una sola immagine adattata dal progetto; ulteriori immagini richiedono un nuovo accordo.',reply:'Perfetto: mi basta una sola immagine tratta dal progetto.',feedback:'Rendi concreta la parola “incluso”: un’immagine, con limiti comprensibili.'},
 {id:'iniziale',title:'Mantieni il lavoro concordato',desc:'Spieghi che per ora puoi realizzare il progetto iniziale, senza aggiungere l’immagine.',clause:'La proposta riguarda il progetto iniziale. L’immagine per i social non è compresa.',reply:'Grazie per averlo chiarito. Procediamo con il progetto iniziale.',feedback:'Anche porre un limite può essere corretto: lo comunichi con chiarezza e il cliente sceglie se procedere.'}
];
export const TONES=[
 {id:'storia',title:'Racconta il valore',desc:'Metti al centro ciò che la proposta può significare per chi la usa.',kicker:'UN’IDEA CHE TI SOMIGLIA',colour:'gold'},
 {id:'chiaro',title:'Mostra come funziona',desc:'Fai capire subito che cosa offri e come si comincia.',kicker:'IDEA CHIARA, PASSI CONCRETI',colour:'blue'},
 {id:'incontro',title:'Apri una conversazione',desc:'Invita le persone a spiegare che cosa vorrebbero creare o cambiare.',kicker:'LA PROSSIMA IDEA INIZIA DA TE',colour:'coral'}
];
export const QUESTIONS=[
 {id:'uso',en:'What would you like to use it for?',it:'Per che cosa vorresti usarlo?',reply:'For a small group project. We want everyone to add something.',translation:'Per un piccolo progetto di gruppo. Vogliamo che ognuno aggiunga qualcosa.',responses:[
  {id:'gruppo',en:'We can develop an idea for your group. Tell me what you have in mind.',it:'Possiamo sviluppare un’idea per il vostro gruppo. Raccontami che cosa avete in mente.',why:'Usi ciò che il cliente ha detto per continuare il progetto.'},
  {id:'esempio',en:'I can show you an example. Then we can discuss what to change.',it:'Posso mostrarti un esempio. Poi possiamo discutere che cosa cambiare.',why:'Rendi visibile la proposta prima di definirla.'}
 ]},
 {id:'tempo',en:'When would you need it?',it:'Per quando ti servirebbe?',reply:'In two weeks. Is that possible?',translation:'Fra due settimane. È possibile?',responses:[
  {id:'controlla',en:'I will check the schedule and confirm the date before we start.',it:'Controllerò il calendario e confermerò la data prima di iniziare.',why:'La data diventa un impegno dopo aver verificato il lavoro.'},
  {id:'spiega',en:'Let us check the steps together and agree on a delivery date.',it:'Controlliamo insieme i passaggi e concordiamo una data di consegna.',why:'Organizzazione e comunicazione lavorano insieme.'}
 ]},
 {id:'personale',en:'Would you like a personalised version?',it:'Vorresti una versione personalizzata?',reply:'Yes. Could we include a detail chosen by each person?',translation:'Sì. Potremmo includere un dettaglio scelto da ogni persona?',responses:[
  {id:'dettaglio',en:'Let us choose the details together before confirming the proposal.',it:'Scegliamo insieme i dettagli prima di confermare la proposta.',why:'Raccogli una richiesta concreta senza promettere qualcosa ancora da verificare.'},
  {id:'modello',en:'I can prepare a sample so you can see how it would look.',it:'Posso preparare un esempio, così puoi vedere come verrebbe.',why:'Un esempio aiuta entrambe le parti a capire la richiesta.'}
 ]}
];
export const STAGES=[
 ['Quale idea vuoi far crescere?','Scegli una proposta su cui lavorare. Il tuo studio comincia da qui.','Scegli una proposta per continuare.','Dai valore alla proposta'],
 ['Che cosa può significare per qualcuno?','Scegli una richiesta. La tua proposta cambierà per rispondere a quel bisogno.','Scegli una richiesta da accogliere.','Passa all’organizzazione'],
 ['Da una richiesta a un lavoro organizzato.','Per Officina Forme, prepara l’ordine di tre incarichi. Usa le frecce per spostarli; puoi anche conservare l’ordine che vedi.','Puoi provare un altro ordine o conservare questo.','Conserva l’organizzazione'],
 ['Un imprevisto. Tre modi per affrontarlo.','Officina Forme deve consegnare 8 lavori venerdì. Il materiale per 2 arriva lunedì. Scegli che cosa proporre al cliente.','Scegli come organizzare la nuova proposta.','Passa ai dati'],
 ['I numeri cambiano il progetto.','Per Linea Studio, prova quantità e prezzo di un kit creativo. Immaginiamo di vendere tutti i kit: i conti si aggiornano da soli.','Conserva questa ipotesi o prova altri numeri.','Conserva il piano'],
 ['Il denaro arriva in tempo?','Linea Studio ha 80 € disponibili. I costi vanno pagati oggi; il cliente pagherebbe fra 14 giorni. Scegli un accordo e guarda la linea del tempo.','Scegli un accordo sui pagamenti.','Passa agli accordi'],
 ['Una proposta che si capisce.','Torna alla tua idea. Scegli come definire la consegna: il cliente deve sapere che cosa aspettarsi prima di confermare.','Scegli una condizione di consegna.','Prova una nuova richiesta'],
 ['Una richiesta in più cambia l’accordo.','Il cliente chiede anche un’immagine per i social. Scegli come rispondere e guarda che cosa cambia nella proposta.','Scegli come rispondere alla richiesta aggiuntiva.','Passa alla comunicazione'],
 ['Dai una voce alla tua idea.','Scegli che cosa mettere in primo piano. Il messaggio si compone accanto a te; puoi anche cambiare il titolo.','Scegli la direzione del messaggio.','Apri la conversazione'],
 ['Un cliente ti scrive in inglese.','Fai una domanda, leggi la risposta e scegli come continuare. Le traduzioni ti accompagnano.','Scegli una domanda e poi una risposta.','Raccogli il tuo lavoro']
];
export const find=(list,id)=>list.find(x=>x.id===id);
export function createProject(id=crypto.randomUUID()){return {format:FORMAT,version:1,course:'afm',id,started:false,identity:null,screen:-1,unlocked:0,done:[],choices:{order:TASKS.map(x=>x.id),quantity:20,price:15},variants:{},notes:[],interests:[],finished:false,updatedAt:null};}
export function offer(p){return find(OFFERS,p.choices.offer);}
export function feature(p){return find(offer(p)?.features||[],p.choices.feature);}
export function question(p){return find(QUESTIONS,p.choices.question);}
export function economics(p){const q=p.choices.quantity,price=p.choices.price;const revenue=q*price,cost=60+q*7;return {quantity:q,price,revenue,fixed:60,variable:q*7,cost,difference:revenue-cost,initial:80,withoutAgreement:80-cost};}
export function cashflow(p){const m=economics(p);const deposit=p.choices.payment==='anticipo'?m.revenue*.6:0;const todayCost=p.choices.payment==='dopo'?0:m.cost;return {...m,deposit,todayCost,todayBalance:80+deposit-todayCost,laterRevenue:m.revenue-deposit,laterCost:p.choices.payment==='dopo'?m.cost:0,finalBalance:80+m.difference};}
export function ready(p,s=p.screen){const c=p.choices;return [!!offer(p),!!feature(p),c.order?.length===3&&new Set(c.order).size===3,!!find(OBSTACLES,c.obstacle),true,['anticipo','dopo'].includes(c.payment),!!find(AGREEMENTS,c.agreement),!!find(AMENDMENTS,c.amendment),!!find(TONES,c.tone),!!find(question(p)?.responses||[],c.response)][s]||false;}
export function choose(p,key,value){
 if(key==='offer'&&value!==p.choices.offer){if(offer(p))p.variants[p.choices.offer]={feature:p.choices.feature,headline:p.choices.headline};p.choices.feature=p.variants[value]?.feature||null;p.choices.headline=p.variants[value]?.headline||'';if(!p.choices.feature)p.done=p.done.filter(i=>i!==1);}
 if(key==='question'&&value!==p.choices.question){p.variants.questions??={};if(p.choices.question)p.variants.questions[p.choices.question]=p.choices.response;p.choices.response=p.variants.questions[value]||null;if(!p.choices.response)p.done=p.done.filter(i=>i!==9);}
 p.choices[key]=value;p.finished=false;
}
export function moveTask(p,id,direction){const i=p.choices.order.indexOf(id),j=i+direction;if(i<0||j<0||j>=3)return;const a=[...p.choices.order];[a[i],a[j]]=[a[j],a[i]];p.choices.order=a;p.finished=false;}
export function advance(p){if(!ready(p))return false;if(!p.done.includes(p.screen))p.done.push(p.screen);if(p.screen<9){p.screen++;p.unlocked=Math.max(p.unlocked,p.screen);}else{const missing=Array.from({length:10},(_,i)=>i).find(i=>!ready(p,i)||!p.done.includes(i));p.screen=missing??10;p.finished=missing===undefined;}return true;}
export function completed(p){return p.done.length===10&&Array.from({length:10},(_,i)=>ready(p,i)).every(Boolean);}
export function posterTitle(p){if(p.choices.headline?.trim())return p.choices.headline.trim();const f=feature(p);if(p.choices.tone==='chiaro')return offer(p)?.title||'La tua proposta';if(p.choices.tone==='incontro')return 'La prossima idea? Facciamola insieme.';return f?.headline||'Dai valore alla tua idea.';}
export function context(p){if(p.screen<0)return {lab:'ingresso',screen:'ingresso',label:'Ingresso allo studio AFM'};if(p.screen>=10)return {lab:'conclusione',screen:'conclusione',label:'Conclusione · Il tuo studio d’impresa'};return {lab:LABS[Math.floor(p.screen/2)].id,screen:`passaggio-${p.screen+1}`,label:`${LABS[Math.floor(p.screen/2)].label} · ${p.screen%2+1}/2 · ${STAGES[p.screen][0]}`};}
export function addNote(p,{text,role='alunno',kind='chiarezza'},id=crypto.randomUUID()){if(typeof text!=='string'||text.trim().length<2)return false;p.notes.push({id,course:'afm',projectId:p.id,...context(p),text:text.trim().slice(0,2000),role:['alunno','docente'].includes(role)?role:'alunno',kind,createdAt:new Date().toISOString()});return true;}
export function validProject(p){return p&&p.format===FORMAT&&p.course==='afm'&&typeof p.id==='string'&&p.choices&&Array.isArray(p.choices.order)&&p.choices.order.length===3&&TASKS.every(t=>p.choices.order.includes(t.id))&&[10,20,30].includes(p.choices.quantity)&&[12,15,18].includes(p.choices.price)&&Array.isArray(p.done)&&p.done.every(i=>Number.isInteger(i)&&i>=0&&i<10)&&new Set(p.done).size===p.done.length&&Number.isInteger(p.screen)&&p.screen>=-1&&p.screen<=10&&Number.isInteger(p.unlocked)&&p.unlocked>=0&&p.unlocked<=9&&Array.isArray(p.notes)&&Array.isArray(p.interests)&&p.variants;}
