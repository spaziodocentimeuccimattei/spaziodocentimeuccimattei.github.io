import { freshState, readState, clearState, sanitizeState, suggestCourses, validateContent } from './bussola-core.mjs?v=20261115-riordino';
import { el, button, link, storage, persist as persistLocal, loadData, focusHeading } from './bussola-ui.mjs?v=20261115-riordino';
import {questionnaireRemote} from './bussola-questionario-remote.mjs?v=20261112';
import { activityDestination as rawDestination } from './bussola-navigazione.mjs?v=20261019-accessi';
import { openDayCard } from './bussola-prossimo-passo.mjs?v=20261115-riordino';
import { esplosione, scintilla } from './bussola-effetti.mjs?v=20261115-riordino';

// Riordino del 14/11/2026: un titolo, una frase, un'azione per schermo.
// Apertura → 12 domande (una per schermo) → risultato che «esplode» → «Perché?» a richiesta.
const intro = document.getElementById('introPanel');
const extra = document.getElementById('introExtra');
const resume = document.getElementById('resumePanel');
const resumePath = document.getElementById('resumePath');
const questions = document.getElementById('questionPanel');
const results = document.getElementById('resultPanel');
const why = document.getElementById('whyPanel');
const openDay = document.getElementById('open-day');
openDay.append(openDayCard());
const status = document.getElementById('loadStatus');
const start = document.getElementById('startPath');
const announcements = document.getElementById('announcements');
const missionIds = ['afm', 'sia', 'turismo', 'ssas', 'cat'];
// Illustrazioni degli indirizzi (le stesse degli attestati). CAT: quella della Missione Aurora.
const ART = { afm: 'afm', sia: 'sia', turismo: 'turismo', ssas: 'ssas', cat: 'cat-edificio' };
let situations, courses, state;
let remoteQuestion=null;
function destination(...args){const u=rawDestination(...args);return remoteQuestion?remoteQuestion.destination(u):u;}
function persist(value){persistLocal(value);remoteQuestion?.changed(value);}
const skipActivities = document.getElementById('skipActivities');
skipActivities.href = destination(location.href);
const entryCourse = new URL(location.href).searchParams.get('corso')?.toLowerCase();
if (missionIds.includes(entryCourse)) {
  skipActivities.textContent = `Vai subito all’attività ${entryCourse === 'turismo' ? 'Turismo' : entryCourse.toUpperCase()}`;
  document.querySelector('.page-nav a[href^="bussola-docenti.html"]').href = `bussola-docenti.html?corso=${entryCourse}`;
}

const shortName = course => course.code === 'TUR' ? 'Turismo' : course.code;
const fullName = course => course.name.replace(/\s*·\s*4\+2$/, '');

function hidePanels() {
  for (const panel of [intro, extra, resume, questions, results, why]) panel.hidden = true;
  document.getElementById('bussolaVideo')?.pause(); // il video della prima pagina si ferma quando si esce dall'apertura
  announcements.textContent = '';
}

function showIntro() {
  hidePanels(); intro.hidden = false; extra.hidden = false;
}

function showSavedPath() {
  const finished = state.stage === 'results';
  document.getElementById('resumeTitle').textContent = finished ? 'Il tuo risultato è pronto' : 'La tua Bussola è salvata';
  document.getElementById('resumeText').textContent = finished ? 'Puoi rivederlo o ricominciare.' : 'Riprendi da dove eri rimasto.';
  resumePath.textContent = finished ? 'Rivedi il risultato' : 'Riprendi';
  hidePanels();
  resume.hidden = false; extra.hidden = false;
}

// Sullo stesso dispositivo si alternano persone diverse: «Inizia» deve partire da zero.
// Chi inizia una nuova Bussola non eredita il codice personale di chi c'era prima (e quindi i suoi percorsi
// negli indirizzi e le sue risposte nel monitoraggio). Fanno eccezione gli alunni entrati con il codice della classe,
// che restano legati al proprio registro. La pagina si ricarica per ripartire pulita.
const NEW_START = 'bussola-avvio-nuovo';
function restartAsNewPerson(next) {
  try {
    const hash = new URLSearchParams(location.hash.slice(1));
    const saved = JSON.parse(localStorage.getItem('bussola-partecipante') || 'null');
    if (hash.get('classe') || saved?.classe) return false;
    if (!hash.get('alunno') && !saved?.token) return false;
    clearState(storage());
    document.dispatchEvent(new CustomEvent('bussola-progetto-nuovo'));
    sessionStorage.setItem(NEW_START, next);
    hash.delete('alunno');
    const url = new URL(location.href); url.hash = hash.toString();
    history.replaceState(null, '', url.href);
    location.reload();
    return true;
  } catch { return false; }
}

function newPath() {
  if (restartAsNewPerson('domande')) return;
  clearState(storage());
  state = freshState();
  persist(state);
  renderQuestion();
}

function resetToIntro() {
  if (restartAsNewPerson('apertura')) return;
  clearState(storage());
  state = freshState();
  persist(state);
  showIntro();
  focusHeading(intro);
  announcements.textContent = 'Le risposte precedenti sono state cancellate.';
}

function advance(answer) {
  state.answers[situations[state.index].id] = answer;
  if (state.index === situations.length - 1) state.stage = 'results';
  else state.index += 1;
  persist(state);
  if (state.stage === 'results') renderResults();
  else renderQuestion();
}

function icon(option, className = 'bussola-icona') {
  const span = el('span', option?.icona || '•', className);
  span.setAttribute('aria-hidden', 'true');
  return span;
}

// Una domanda per schermo: titolo breve e icona per ogni risposta. La frase lunga non serve per scegliere.
function renderQuestion() {
  state.stage = 'question';
  hidePanels(); questions.hidden = false;
  const situation = situations[state.index];
  const top = el('div', null, 'bussola-domanda-testa');
  const counter = el('p', `${state.index + 1} di ${situations.length}`, 'bussola-contatore');
  const bar = el('progress', null, 'bt-avanzamento');
  bar.max = situations.length; bar.value = state.index + 1;
  bar.setAttribute('aria-label', `Domanda ${state.index + 1} di ${situations.length}`);
  top.append(counter, bar);
  const area = el('p', situation.title, 'bt-occhiello');
  const heading = el('h2', situation.question, 'bt-titolo bt-titolo--medio'); heading.id = 'questionTitle';
  const list = el('div', null, 'bt-scelte bussola-scelte');
  list.setAttribute('role', 'radiogroup'); list.setAttribute('aria-labelledby', 'questionTitle');
  const next = button('Avanti', () => advance(state.answers[situation.id]), 'bt-pulsante');
  next.disabled = !situation.options.some(o => o.id === state.answers[situation.id]);
  for (const option of situation.options) {
    const label = el('label', null, 'bt-scelta');
    const input = el('input');
    input.type = 'radio'; input.name = 'risposta'; input.value = option.id; input.id = `risposta-${option.id}`;
    input.checked = state.answers[situation.id] === option.id;
    input.addEventListener('change', () => {
      state.answers[situation.id] = option.id;
      persist(state); next.disabled = false;
      scintilla(label);
    });
    label.append(input, icon(option), el('span', option.label || option.text, 'bussola-scelta-testo'));
    list.append(label);
  }
  const footer = el('div', null, 'bt-azioni bt-azioni--estremi bussola-comandi');
  const back = button('Indietro', () => { state.index -= 1; persist(state); renderQuestion(); }, 'bt-pulsante bt-pulsante--secondario');
  back.disabled = state.index === 0;
  footer.append(back, next);
  const others = el('p', null, 'bussola-link-piccoli');
  others.append(button('Non lo so', () => advance(null), 'bt-link'), button('Ricomincia', resetToIntro, 'bt-link'));
  questions.replaceChildren(top, area, heading, list, footer, others);
  focusHeading(questions);
}

function courseArt(course) {
  const disc = el('div', null, 'bt-disco bussola-disco');
  const img = el('img'); img.src = `assets/attestati/${ART[course.id] || course.id}.svg`; img.alt = ''; img.width = 1080; img.height = 500;
  disc.append(img);
  return disc;
}

function smallLinks() {
  const row = el('p', null, 'bussola-link-piccoli bussola-fondo');
  row.append(link('Vedi gli altri indirizzi', destination(location.href, ''), 'bt-link'), button('Ricomincia', resetToIntro, 'bt-link'));
  return row;
}

// Risultato: solo il nome dell'indirizzo (fino a tre a pari merito) che «esplode», con «Prova» e «Perché?».
function renderResults() {
  hidePanels(); results.hidden = false;
  const direction = suggestCourses(situations, courses, state.answers);
  const selected = direction.selected.length <= 3 ? direction.selected : [];
  if (!selected.length) {
    const screen = el('div', null, 'bt-schermo');
    const few = direction.reason === 'few';
    const title = el('h2', few ? 'Servono più risposte' : 'Ti piacciono tante cose', 'bt-titolo'); title.id = 'resultTitle';
    screen.append(title,
      el('p', few ? 'Con meno di quattro risposte la Bussola non sceglie. Prova gli indirizzi!' : 'Nessun indirizzo vince sugli altri. Provali e scopri quale ti piace.', 'bt-frase'),
      link('Vedi gli indirizzi', destination(location.href, ''), 'bt-pulsante bt-pulsante--lime bt-pulsante--grande'));
    const row = el('p', null, 'bussola-link-piccoli');
    if (few) row.append(button('Rispondi alle domande', () => {
      const missing = situations.findIndex(s => !s.options.some(o => o.id === state.answers[s.id]));
      state.index = Math.max(0, missing); state.stage = 'question'; persist(state); renderQuestion();
    }, 'bt-link'));
    row.append(button('Ricomincia', resetToIntro, 'bt-link'));
    screen.append(row);
    results.replaceChildren(screen);
    focusHeading(results);
    return;
  }
  const title = el('h2', selected.length > 1 ? 'I tuoi indirizzi' : 'Il tuo indirizzo', 'bt-occhiello bussola-risultato-titolo'); title.id = 'resultTitle';
  // Poche risposte o segnali deboli (tentative/mixed di bussola-core): una riga onesta, senza togliere l'esplosione.
  const primoIndizio = direction.reason !== 'suggested';
  const grid = el('div', null, `bussola-esiti bussola-esiti--${selected.length}`);
  const cards = [];
  for (const item of selected) {
    const course = item.course;
    const card = el('article', null, 'bt-esplosione bussola-esito');
    card.dataset.corso = course.id;
    const name = el('h3', shortName(course), 'bt-titolo');
    const full = el('p', fullName(course), 'bussola-nome-intero');
    const actions = el('div', null, 'bt-azioni');
    const prova = link('Prova', destination(location.href, course.id), 'bt-pulsante bt-pulsante--grande');
    prova.setAttribute('aria-label', `Prova ${fullName(course)}`);
    const perche = button('Perché?', () => renderWhy(selected, course.id), 'bt-pulsante bt-pulsante--secondario');
    perche.setAttribute('aria-label', `Perché ${shortName(course)}?`);
    actions.append(prova, perche);
    card.append(name);
    if (fullName(course) !== shortName(course)) card.append(full);
    if (primoIndizio && selected.length === 1) card.append(el('p', 'È un primo indizio: provalo e vedi.', 'bussola-indizio'));
    card.append(courseArt(course), actions);
    grid.append(card); cards.push([card, course.id]);
  }
  const multi = primoIndizio && selected.length > 1 ? [el('p', 'Sono primi indizi: provali e vedi.', 'bussola-indizio bussola-indizio--insieme')] : [];
  results.replaceChildren(title, ...multi, grid, smallLinks());
  focusHeading(results);
  for (const [card, id] of cards) esplosione(card, id, selected.length > 1 ? { quanti: 90 } : undefined);
}

// «Perché?»: le 12 risposte come tessere, accese quelle che portano all'indirizzo.
function renderWhy(selected, courseId) {
  hidePanels(); why.hidden = false;
  const item = selected.find(i => i.course.id === courseId) || selected[0];
  const course = item.course;
  why.dataset.corso = course.id;
  const parts = [];
  if (selected.length > 1) {
    const switcher = el('div', null, 'bt-azioni bussola-scegli-corso');
    switcher.setAttribute('aria-label', 'Di quale indirizzo vuoi vedere il perché?');
    for (const other of selected) {
      const b = button(shortName(other.course), () => renderWhy(selected, other.course.id), 'bt-pulsante bt-pulsante--piccolo bt-pulsante--secondario');
      b.dataset.corso = other.course.id;
      b.setAttribute('aria-pressed', String(other.course.id === course.id));
      switcher.append(b);
    }
    parts.push(switcher);
  }
  const heading = el('h2', null, 'bt-titolo bt-titolo--medio'); heading.id = 'whyTitle';
  heading.append('Perché ', el('span', shortName(course), 'bt-chiave--corso'), '?');
  parts.push(heading, el('p', 'Hai risposto a queste. Tocca una risposta accesa.', 'bt-frase'));
  const lit = [], off = [];
  for (const situation of situations) {
    const option = situation.options.find(o => o.id === state.answers[situation.id]);
    const connection = option?.courseLinks?.[course.id];
    (connection ? lit : off).push({ situation, option, connection });
  }
  const reason = el('p', null, 'bussola-ragione');
  reason.setAttribute('aria-live', 'polite'); reason.hidden = true;
  const tiles = el('ul', null, 'bt-tessere bussola-tessere');
  tiles.setAttribute('aria-label', `Risposte che portano a ${shortName(course)}`);
  for (const { option, connection } of lit) {
    const li = el('li');
    const b = el('button', null, 'bt-tessera bt-tessera--accesa'); b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.append(icon(option, 'bussola-icona bussola-icona--tessera'), el('span', option.label || option.text));
    b.addEventListener('click', () => {
      tiles.querySelectorAll('[aria-pressed="true"]').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      reason.hidden = false; reason.textContent = connection.reason;
      scintilla(b);
    });
    li.append(b); tiles.append(li);
  }
  if (lit.length) parts.push(tiles, reason);
  else parts.push(el('p', 'Nessuna risposta porta qui da sola.', 'bt-frase'));
  if (off.length) {
    const others = el('ul', null, 'bt-tessere bussola-tessere bussola-tessere--spente');
    others.setAttribute('aria-label', 'Risposte che portano altrove');
    for (const { option } of off) {
      const li = el('li');
      const t = el('span', null, 'bt-tessera bt-tessera--spenta');
      t.append(icon(option, 'bussola-icona bussola-icona--tessera'), el('span', option ? (option.label || option.text) : 'Non lo so'));
      li.append(t); others.append(li);
    }
    parts.push(el('p', 'Meno a queste', 'bt-nota bussola-meno'), others);
  }
  const actions = el('div', null, 'bt-azioni');
  actions.append(button('Indietro', renderResults, 'bt-pulsante bt-pulsante--secondario'),
    link('Prova', destination(location.href, course.id), 'bt-pulsante'));
  parts.push(actions);
  why.replaceChildren(...parts);
  focusHeading(why);
}

async function initialize() {
  start.disabled = true;
  try {
    const [b, d, c, m] = await loadData(['bussola', 'dimensioni', 'indirizzi', 'missioni']);
    const check = validateContent(b.situations, d.dimensions, c.courses, m.missions);
    if (check.errors.length) throw new Error(check.errors.join(' '));
    situations = b.situations; courses = c.courses;
    state = readState(storage(), situations, missionIds);
    status.replaceChildren(); status.hidden = true;
    remoteQuestion=questionnaireRemote({status:()=>{},loaded:value=>{const next=sanitizeState({...value,missions:{...state?.missions,...value.missions}},situations,missionIds);if(next){state=next;persistLocal(state);if(!questions.hidden){if(state.stage==='results')renderResults();else renderQuestion();}else if(!results.hidden)renderResults();}},links:personal=>{for(const a of document.querySelectorAll('a[href]')){const u=new URL(a.href);if(u.origin===location.origin&&/(?:missioni|bussola-(?:afm|sia|turismo|ssas|cat))\.html$/.test(u.pathname))a.href=personal(a.href);}}});
    start.disabled = false;
    let newStart = null; try { newStart = sessionStorage.getItem(NEW_START); sessionStorage.removeItem(NEW_START); } catch {}
    if (newStart) { state = freshState(); if (newStart === 'domande') { persist(state); renderQuestion(); } }
    else if (state && Object.keys(state.answers).length) showSavedPath();
    else state = freshState();
    remoteQuestion.init().then(() => {
      if ((!intro.hidden || !resume.hidden) && state && Object.keys(state.answers).length) showSavedPath();
    });
  } catch {
    status.hidden = false;
    status.replaceChildren(el('span', 'Le domande non si sono caricate. Controlla la connessione. '), button('Riprova', initialize, 'bt-link'));
  }
}

start.addEventListener('click', newPath);
document.getElementById('newPath').addEventListener('click', newPath);
resumePath.addEventListener('click', () => {
  if (state.stage === 'results') renderResults(); else renderQuestion();
});
initialize();
