export const VERSION = 1;
export const STEPS = ['Ascolta', 'Inventa', 'Prepara', 'Adatta', 'Presenta'];
export const PEOPLE = [
  {id:'nora',name:'Nora',color:'#658984',wants:'Vorrei provare a montare immagini del quartiere e inventare una piccola storia.',help:'Mi aiuterebbe avere una sedia vicino al tavolo: vorrei creare insieme agli altri, seduta.',avoid:'Preferisco sapere prima che cosa faremo, così posso scegliere come partecipare.'},
  {id:'amir',name:'Amir',color:'#ad763c',wants:'Mi piace costruire. Vorrei trasformare cartone e piccoli oggetti in qualcosa di nuovo.',help:'Mi aiuterebbe vedere i materiali e fare una prova prima di cominciare.',avoid:'Vorrei poter cambiare idea se la prima creazione non mi convince.'},
  {id:'giulia',name:'Giulia',color:'#986578',wants:'Vorrei raccontare una storia del mio quartiere, anche con un oggetto o poche parole.',help:'Mi aiuterebbe scegliere io che cosa condividere con il gruppo.',avoid:'Voglio partecipare, ma non voglio che venga pubblicata una foto del mio volto.'}
];
export const FORMATS = [
  {id:'album',name:'Un album di quartiere',description:'Immagini, oggetti disegnati e piccole storie in un libro comune.',icon:'album'},
  {id:'mostra',name:'Una mostra di oggetti',description:'Oggetti trasformati, cartellini e storie da scoprire.',icon:'objects'},
  {id:'storia',name:'Una storia con immagini',description:'Scene, parole e creazioni che raccontano qualcosa insieme.',icon:'story'}
];
export const MOMENTS = {
  start:[{id:'immagini',label:'Partiamo da un’immagine',minutes:10},{id:'oggetto',label:'Presentiamo un oggetto',minutes:5},{id:'domanda',label:'Una domanda per conoscerci',minutes:5}],
  create:[{id:'collage',label:'Componiamo immagini e parole',minutes:25},{id:'oggetti',label:'Costruiamo piccoli oggetti',minutes:25},{id:'insieme',label:'Uniamo oggetti, immagini e storie',minutes:30}],
  share:[{id:'galleria',label:'Una galleria da esplorare',minutes:15},{id:'cerchio',label:'Un racconto in cerchio',minutes:10},{id:'libero',label:'Ognuno sceglie che cosa mostrare',minutes:10}]
};
export const CARE = [
  {id:'sedute',label:'Sedute vicino al tavolo',detail:'Nora può creare insieme al gruppo, da seduta.'},
  {id:'pausa',label:'Una pausa breve',detail:'Cinque minuti per fermarsi e cambiare posizione.'},
  {id:'ordine',label:'Materiali pronti e ordinati',detail:'Tutti vedono che cosa possono usare e dove riporlo.'},
  {id:'pulizia',label:'Mani e tavolo puliti',detail:'All’inizio si pulisce il piano; alla fine si riordinano i materiali.'},
  {id:'passaggi',label:'Passaggi liberi',detail:'Borse e scatole restano fuori dal percorso.'},
  {id:'calma',label:'Un angolo tranquillo',detail:'Un posto per creare o ascoltare con meno rumore.'}
];
export const NETWORK = [
  {id:'biblioteca',name:'Biblioteca',offer:'Presta libri illustrati e immagini utilizzabili nel laboratorio.',material:'Immagini e libri in prestito'},
  {id:'associazione',name:'Associazione creativa',offer:'Porta cartone di recupero e mostra come riutilizzarlo.',material:'Cartone e materiali di recupero'},
  {id:'centro',name:'Responsabile del centro',offer:'Aiuta a organizzare sedute, tavoli e uso degli spazi.',material:'Spazi e sedute organizzati'}
];
export const SHARING = [
  {id:'foto',label:'Una foto del gruppo',detail:'Richiede l’accordo delle persone fotografate.'},
  {id:'opere',label:'Le creazioni, senza volti',detail:'Ognuno sceglie quale lavoro mostrare.'},
  {id:'audio',label:'Storie registrate',detail:'Si registra soltanto chi vuole e concorda l’uso della voce.'},
  {id:'interno',label:'Tutto rimane nel gruppo',detail:'Si condivide durante l’incontro, senza pubblicare.'}
];
export const REVISIONS = [
  {id:'oggetto',label:'Un oggetto e due righe',detail:'Giulia sceglie un oggetto o un’immagine e scrive un cartellino. Nessuna registrazione.'},
  {id:'lettura',label:'Una storia letta con il suo accordo',detail:'Giulia sceglie il testo e a chi affidare la lettura, durante l’incontro. Nessuna registrazione.'},
  {id:'riservato',label:'Il racconto rimane nel gruppo',detail:'Giulia partecipa al laboratorio. Il suo racconto non entra nella pubblicazione.'}
];
export const CURIOSITIES = [
  {id:'ascolto',label:'Ascoltare e fare domande',subject:'Scienze umane e sociali · Psicologia generale e applicata',bridge:'Hai raccolto desideri e preferenze dichiarate, senza dedurre il carattere delle persone.'},
  {id:'progetto',label:'Inventare e organizzare un’attività',subject:'Metodologie operative',bridge:'Hai collegato un’idea, tre momenti, modi di partecipare e una domanda per rivedere il progetto.'},
  {id:'benessere',label:'Preparare condizioni di benessere',subject:'Igiene e cultura medico-sanitaria',bridge:'Hai pensato a sedute, pausa, pulizia e spazi. Nell’indirizzo il tema della salute si approfondisce molto di più.'},
  {id:'scelte',label:'Rispettare le scelte delle persone',subject:'Diritto e legislazione sociosanitaria',bridge:'Hai rivisto la condivisione del progetto a partire dalla scelta di Giulia.'},
  {id:'rete',label:'Trovare risorse e collaborazioni',subject:'Economia sociale',bridge:'Hai scelto un supporto utile per il laboratorio, collegando risorse del centro e del territorio.'}
];
export function freshProject() {
  return {version:VERSION,step:0,visited:0,heard:[],format:'',title:'',invite:'Porta una tua idea. Crea come preferisci. Scegli che cosa condividere.',palette:'corallo',start:'',create:'',share:'',sharing:'',care:[],network:'',revision:'',quiet:false,question:'',curiosities:[],nextIdea:'',before:null,completed:false};
}
const validId=(arr,id)=>arr.some(x=>x.id===id);
export function restoreProject(raw) {
  if (!raw || typeof raw!=='object' || raw.version!==VERSION) return freshProject();
  const p={...raw,...freshProject()}; // Unknown top-level fields are retained for future versions.
  for (const [key,max] of Object.entries({title:48,invite:140,question:180,nextIdea:180})) p[key]=typeof raw[key]==='string'?raw[key].slice(0,max):'';
  for (const [key,arr] of Object.entries({format:FORMATS,sharing:SHARING,network:NETWORK,revision:REVISIONS,...MOMENTS})) p[key]=validId(arr,raw[key])?raw[key]:'';
  p.palette=['corallo','salvia','viola'].includes(raw.palette)?raw.palette:'corallo';
  p.care=CARE.filter(x=>raw.care?.includes?.(x.id)).map(x=>x.id);
  p.heard=PEOPLE.flatMap(x=>['wants','help','avoid'].filter(k=>raw.heard?.includes?.(`${x.id}:${k}`)).map(k=>`${x.id}:${k}`));
  p.curiosities=CURIOSITIES.filter(x=>raw.curiosities?.includes?.(x.id)).map(x=>x.id);
  p.quiet=raw.quiet===true;
  p.step=Number.isInteger(raw.step)&&raw.step>=0&&raw.step<=5?raw.step:0;
  p.visited=Number.isInteger(raw.visited)?Math.max(p.step,Math.min(5,raw.visited)):p.step;
  p.before=raw.before&&typeof raw.before==='object'?{sharing:validId(SHARING,raw.before.sharing)?raw.before.sharing:'',care:CARE.filter(x=>raw.before.care?.includes?.(x.id)).map(x=>x.id),share:validId(MOMENTS.share,raw.before.share)?raw.before.share:''}:null;
  p.completed=raw.completed===true&&issues(p,5).length===0;
  return p;
}
export function minutes(p) {return ['start','create','share'].reduce((n,k)=>n+(MOMENTS[k].find(x=>x.id===p[k])?.minutes||0),0)+10;}
export function issues(p,step) {
  const result=[];
  if(step>=1 && PEOPLE.some(x=>!['wants','help'].every(k=>p.heard.includes(`${x.id}:${k}`)))) result.push('Ascolta che cosa vorrebbero fare e che cosa aiuterebbe tutte e tre le persone.');
  if(step>=2){
    if(!p.format) result.push('Scegli che cosa creare insieme.');
    if(!p.title.trim()) result.push('Dai un titolo al tuo laboratorio.');
    if(!p.start||!p.create||!p.share) result.push('Componi tutti e tre i momenti del laboratorio.');
    if(minutes(p)>60) result.push(`Il programma dura ${minutes(p)} minuti: il centro ha a disposizione un’ora. Rivedi uno dei momenti.`);
    if(!p.sharing) result.push('Scegli come raccontare il laboratorio.');
  }
  if(step>=3){
    for(const id of ['sedute','pausa','pulizia','passaggi']) if(!p.care.includes(id)) result.push(CARE.find(x=>x.id===id).detail);
    if(!p.network) result.push('Scegli un supporto da coinvolgere.');
  }
  if(step>=4){
    if(!p.revision) result.push('Scegli con quale proposta ripartire con Giulia.');
    if(!p.quiet&&!p.care.includes('calma')) result.push('Prepara anche il posto tranquillo richiesto da Giulia.');
    if(!['opere','interno'].includes(p.sharing)) result.push('La nuova richiesta esclude foto del volto e registrazioni: rivedi la condivisione.');
  }
  if(step>=5){
    if(!p.question.trim()) result.push('Aggiungi una domanda che faresti dopo il laboratorio.');
    if(!p.curiosities.length) result.push('Indica almeno una parte che vorresti approfondire.');
  }
  return result;
}
export function differences(p) {
  if(!p.before) return [];
  const changes=[];
  if(p.before.sharing!==p.sharing) changes.push({before:SHARING.find(x=>x.id===p.before.sharing)?.label||'Da scegliere',after:SHARING.find(x=>x.id===p.sharing)?.label||'Da scegliere'});
  if(!p.before.care.includes('calma')&&(p.quiet||p.care.includes('calma'))) changes.push({before:'Un unico spazio per creare',after:'Anche un posto tranquillo per ascoltare e creare'});
  if(p.before.share!==p.share) changes.push({before:MOMENTS.share.find(x=>x.id===p.before.share)?.label,after:MOMENTS.share.find(x=>x.id===p.share)?.label});
  return changes;
}
export const xml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
