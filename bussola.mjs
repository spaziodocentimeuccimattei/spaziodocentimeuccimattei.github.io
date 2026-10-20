import { courseArt, questionArt } from './bussola-visuals.mjs?v=20261010-correzioni';
import { freshState, readState, clearState, sanitizeState, summarize, suggestCourses, validateContent } from './bussola-core.mjs';
import { el, button, link, storage, persist as persistLocal, loadData, focusHeading, setJourney, contactsPanel, choice } from './bussola-ui.mjs?v=20261010-correzioni';
import {questionnaireRemote} from './bussola-questionario-remote.mjs?v=20261019-monitor';
import { openCertificate } from './bussola-attestato.mjs?v=20261020-contatti';
import { activityDestination as rawDestination } from './bussola-navigazione.mjs?v=20261019-accessi';

const intro = document.getElementById('introPanel');
const resume = document.getElementById('resumePanel');
const questions = document.getElementById('questionPanel');
const results = document.getElementById('resultPanel');
const contactsMount = document.getElementById('contactMount');
const status = document.getElementById('loadStatus');
const start = document.getElementById('startPath');
const announcements = document.getElementById('announcements');
const missionIds = ['afm', 'sia', 'turismo', 'ssas', 'cat'];
let situations, dimensions, courses, contacts, state;
let remoteQuestion=null;
function destination(...args){const u=rawDestination(...args);return remoteQuestion?remoteQuestion.destination(u):u;}
function persist(value){persistLocal(value);remoteQuestion?.changed(value);}
const skipActivities = document.getElementById('skipActivities');
skipActivities.href = destination(location.href);
const entryCourse = new URL(location.href).searchParams.get('corso')?.toLowerCase();
if (['afm','sia','turismo','ssas','cat'].includes(entryCourse)) {
  skipActivities.textContent = `Salta e vai all’attività ${entryCourse === 'turismo' ? 'Turismo' : entryCourse.toUpperCase()} →`;
  document.querySelector('.page-nav a[href^="bussola-docenti.html"]').href = `bussola-docenti.html?corso=${entryCourse}`;
}

function hidePanels() {
  for (const panel of [intro, resume, questions, results, contactsMount]) panel.hidden = true;
  skipActivities.parentElement.hidden = false;
  announcements.textContent = '';
}

function newPath() {
  clearState(storage());
  state = freshState();
  persist(state);
  renderQuestion();
}

function resetToIntro() {
  clearState(storage());
  state = freshState();
  persist(state);
  hidePanels(); intro.hidden = false;
  setJourney(0);
  focusHeading(intro);
  announcements.textContent = 'Il percorso e le risposte precedenti sono stati cancellati.';
}

function advance(answer) {
  state.answers[situations[state.index].id] = answer;
  if (state.index === situations.length - 1) state.stage = 'results';
  else state.index += 1;
  persist(state);
  if (state.stage === 'results') renderResults();
  else renderQuestion();
}

function renderQuestion() {
  state.stage = 'question';
  hidePanels(); questions.hidden = false;
  setJourney(0);
  const situation = situations[state.index];
  const progressBox = el('div', null, 'question-progress');
  const progressHeading = el('div', null, 'progress-heading');
  progressHeading.append(el('span', `Domanda ${state.index + 1} di ${situations.length}`), button('Ricomincia', resetToIntro, 'skip-button'));
  const track = el('div', null, 'progress-track');
  track.setAttribute('role', 'progressbar'); track.setAttribute('aria-label', 'Avanzamento delle situazioni');
  track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', String(situations.length)); track.setAttribute('aria-valuenow', String(state.index));
  const bar = el('span'); bar.style.width = `${state.index/situations.length*100}%`; track.append(bar);
  progressBox.append(progressHeading, track);
  const heading = el('h2', situation.title); heading.id = 'questionTitle';
  const scenario = el('p', situation.scenario, 'scenario');
  const fieldset = el('fieldset', null, 'choices');
  fieldset.append(el('legend', situation.question));
  const list = el('div', null, 'choice-list');
  const next = button(state.index === situations.length-1 ? 'Vedi il risultato' : 'Continua', () => advance(state.answers[situation.id]));
  next.disabled = !situation.options.some(o => o.id === state.answers[situation.id]);
  for (const option of situation.options) {
    list.append(choice(option, 'radio', 'scenario-choice', state.answers[situation.id] === option.id, () => {
      state.answers[situation.id] = option.id;
      persist(state); next.disabled = false;
    }));
  }
  fieldset.append(list);
  const footer = el('div', null, 'question-footer');
  const back = button('Indietro', () => {
    state.index -= 1; persist(state); renderQuestion();
  }, 'explore-button secondary');
  back.disabled = state.index === 0;
  footer.append(back, button('Non lo so ancora', () => advance(null), 'skip-button'), next);
  const exit = el('p', null, 'compass-skip');
  exit.append(link(skipActivities.textContent, skipActivities.href, 'explore-link'));
  skipActivities.parentElement.hidden = true;
  const context = el('div', null, 'question-context'); const copy = el('div');
  copy.append(el('p', situation.area, 'question-area'), heading, scenario); context.append(copy, questionArt(situation.id));
  questions.replaceChildren(progressBox, context, fieldset, footer, exit);
  focusHeading(questions);
}

function courseCard(item, highlighted = false, direction = null) {
  const course = item.course;
  const card = el('article', null, highlighted ? 'direction-card' : 'discovery-course');
  card.dataset.course = course.id;
  const head = el('div', null, 'direction-heading');
  const copy = el('div');
  copy.append(el('p', course.code, 'course-tag'), el('h3', course.name));
  head.append(copy, courseArt(course.id)); card.append(head);
  if (highlighted) {
    card.append(el('h4', 'Che cosa ti collega'));
    const traces = el('ul', null, 'direction-evidence');
    // Include interests and a different viewpoint, rather than repeating three similar curiosities.
    const evidence = [...item.evidence].sort((a, b) =>
      Number(['materie','predisposizioni','sogni','aspirazioni'].includes(b.situationId)) -
      Number(['materie','predisposizioni','sogni','aspirazioni'].includes(a.situationId)));
    const chosen = evidence.slice(0, 2);
    const interest = item.evidence.find(e => !['materie','predisposizioni','sogni','aspirazioni'].includes(e.situationId));
    if (interest && !chosen.includes(interest)) chosen.push(interest);
    for (const trace of chosen) {
      const li = el('li');
      // Nella scheda compare il titolo breve della risposta scelta: la frase intera resta in «Rileggi tutte le tue scelte».
      const picked = situations.find(s => s.id === trace.situationId)?.options.find(o => o.text === trace.action);
      li.append(el('span', trace.area, 'evidence-area'), el('q', picked?.label || trace.action), el('p', trace.reason));
      traces.append(li);
    }
    card.append(traces);
  } else card.append(el('p', course.face));
  card.append(el('h4', 'Materie da conoscere'));
  const subjects = el('ul', null, 'subject-chips');
  for (const subject of course.subjects) subjects.append(el('li', subject));
  card.append(subjects);
  const actions = el('div', null, 'action-row');
  actions.append(link(`Prova ${course.code === 'TUR' ? 'Turismo' : course.code}`, destination(location.href, course.id)),
    link('Materie e percorso di studio', `indirizzi.html#${course.id}`, 'explore-link'));
  card.append(actions);
  if (highlighted) {
    const exportRow = el('div', null, 'certificate-action');
    const exportButton = button('Crea il tuo attestato', () => openCertificate(item, direction, situations, contacts, exportButton), 'explore-button secondary');
    exportButton.setAttribute('aria-label', `Crea il tuo attestato: ${course.name}`);
    exportRow.append(exportButton, el('p', 'Lo puoi salvare in PDF o come immagine.'));
    card.append(exportRow);
  }
  return card;
}

function renderResults() {
  hidePanels(); results.hidden = false; contactsMount.hidden = false;
  setJourney(1);
  const summary = summarize(situations, dimensions, state.answers);
  const direction = suggestCourses(situations, courses, state.answers);
  const title = el('h2', 'Da dove potresti partire'); title.id = 'resultTitle';
  const hero = el('div', null, 'direction-intro');
  hero.append(el('p', 'Il tuo punto di partenza', 'explore-kicker'), title);
  const names = direction.selected.map(item => item.course.code === 'TUR' ? 'Turismo' : item.course.code);
  const joined = names.length > 1 ? `${names.slice(0,-1).join(', ')} e ${names.at(-1)}` : names[0];
  let message;
  if (!names.length) message = direction.reason === 'few'
    ? 'Le risposte sono ancora poche per indicare un punto di partenza. Puoi rispondere ad altre domande oppure guardare tutti gli indirizzi.'
    : 'Le tue scelte toccano interessi diversi e nessun indirizzo ritorna più degli altri. Confronta le materie e prova le attività per capire che cosa vuoi approfondire.';
  else if (direction.reason === 'tentative') message = `Per ora c’è un primo indizio verso ${joined}. Con altre risposte puoi vedere se ritorna.`;
  else if (direction.reason === 'mixed') message = `Le tue scelte vanno in più direzioni: ${joined}. Mettile a confronto partendo dalle ragioni e dalle materie.`;
  else message = names.length === 1
    ? `Dalle tue risposte emerge soprattutto ${joined}. Ecco le scelte che lo fanno emergere.`
    : `Dalle tue risposte emergono ${joined}. Ecco che cosa ti collega a ciascuno.`;
  hero.append(el('p', message, 'direction-lead'),
    el('p', `Hai risposto a ${direction.answeredCount} domande su ${situations.length}.`, 'plain-note'),
    el('p', names.length
      ? 'È un punto di partenza, non un voto: racconta gli interessi che hai espresso oggi e non misura le tue capacità. Puoi cambiare idea e scegliere anche un altro percorso.'
      : 'Puoi iniziare dalle materie o da un’attività che ti incuriosisce. Gli interessi possono cambiare con nuove esperienze e le capacità si possono sviluppare.', 'direction-note'));
  results.replaceChildren(hero);
  if (direction.selected.length) {
    const grid = el('div', null, 'direction-grid');
    if (direction.selected.length === 1) grid.classList.add('single-direction');
    for (const item of direction.selected) grid.append(courseCard(item, true, direction));
    results.append(grid);
  }
  const other = direction.items.filter(item => !direction.selected.includes(item));
  if (other.length) {
    const catalog = el('details', null, 'other-directions');
    catalog.open = !direction.selected.length;
    catalog.append(el('summary', direction.selected.length ? 'Confronta anche gli altri indirizzi' : 'Esplora i cinque indirizzi'));
    catalog.append(el('p', names.length
      ? 'Qui trovi anche gli indirizzi che nelle tue risposte sono comparsi meno.'
      : 'Confronta che cosa si studia in ogni percorso e scegli un’attività da provare.'));
    const grid = el('div', null, 'discovery-courses');
    for (const item of other) grid.append(courseCard(item));
    catalog.append(grid); results.append(catalog);
  }
  if (summary.selected.length) {
    const themes = el('details', null, 'choice-recap');
    themes.append(el('summary', 'Le curiosità che ritornano nelle tue scelte'));
    const list = el('ul');
    for (const item of summary.selected) list.append(el('li', item.name));
    themes.append(list); results.append(themes);
  }
  const recap = el('details', null, 'choice-recap');
  recap.append(el('summary', 'Rileggi tutte le tue scelte'));
  const list = el('ol');
  for (const situation of situations) {
    const selected = situation.options.find(o => o.id === state.answers[situation.id]);
    const li = el('li'); li.append(el('strong', situation.title), el('span', selected?.text || 'Hai passato questa situazione.')); list.append(li);
  }
  recap.append(list); results.append(recap);
  results.append(el('p', 'Ora scegli un’attività da provare. Potrai esplorare anche gli altri indirizzi.', 'next-step'));
  const row = el('div', null, 'action-row');
  row.append(link('Tutte le attività', destination(location.href, ''), 'explore-link'), button('Rivedi le domande', () => { state.index = 0; state.stage = 'question'; persist(state); renderQuestion(); }, 'explore-button secondary'), button('Ricomincia', resetToIntro, 'explore-button secondary'));
  results.append(row);
  contactsMount.replaceChildren(contactsPanel(contacts, resetToIntro));
  focusHeading(results);
}

async function initialize() {
  start.disabled = true;
  try {
    const [b, d, c, m, contactData] = await loadData(['bussola', 'dimensioni', 'indirizzi', 'missioni', 'contatti']);
    const check = validateContent(b.situations, d.dimensions, c.courses, m.missions);
    if (check.errors.length) throw new Error(check.errors.join(' '));
    situations = b.situations; dimensions = d.dimensions; courses = c.courses; contacts = contactData;
    state = readState(storage(), situations, missionIds);
    const syncText=el('span','Le risposte si salvano mentre procedi. Nell’area docenti possono consultarle solo le persone autorizzate.');
    const retry=button('Riprova il salvataggio',()=>remoteQuestion?.retry(),'explore-link'),copy=button('Scarica la bozza',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(remoteQuestion.copy(),null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download='bussola-risposte.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);},'explore-link'),online=button('Apri la versione online',async()=>{try{await remoteQuestion.reload();}catch(e){syncText.textContent=e.message;}},'explore-link');retry.hidden=copy.hidden=online.hidden=true;status.replaceChildren(syncText,document.createTextNode(' '),retry,document.createTextNode(' '),copy,document.createTextNode(' '),online);
    remoteQuestion=questionnaireRemote({status:(message,error=false,details={})=>{syncText.textContent=message;retry.hidden=!error||details.conflict;copy.hidden=!error;online.hidden=!details.conflict;},loaded:value=>{const next=sanitizeState({...value,missions:{...state?.missions,...value.missions}},situations,missionIds);if(next){state=next;persistLocal(state);if(!questions.hidden){if(state.stage==='results')renderResults();else renderQuestion();}else if(!results.hidden)renderResults();}},links:personal=>{for(const a of document.querySelectorAll('a[href]')){const u=new URL(a.href);if(u.origin===location.origin&&/(?:missioni|bussola-(?:afm|sia|turismo|ssas|cat))\.html$/.test(u.pathname))a.href=personal(a.href);}}});
    start.disabled = false;
    if (state && Object.keys(state.answers).length) { intro.hidden = true; resume.hidden = false; }
    else state = freshState();
    remoteQuestion.init().then(()=>{if((!intro.hidden||!resume.hidden)&&state&&Object.keys(state.answers).length){intro.hidden=true;resume.hidden=false;}});
  } catch {
    status.replaceChildren(el('span', 'Le situazioni non si sono caricate. Controlla la connessione. '), button('Riprova', initialize, 'explore-link'));
  }
}

start.addEventListener('click', newPath);
document.getElementById('newPath').addEventListener('click', newPath);
document.getElementById('resumePath').addEventListener('click', () => {
  if (state.stage === 'results') renderResults(); else renderQuestion();
});
initialize();
