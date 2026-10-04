import { courseArt, questionArt } from './bussola-visuals.mjs';
import { freshState, readState, clearState, summarize, validateContent } from './bussola-core.mjs';
import { el, button, link, storage, persist, loadData, focusHeading, setJourney, contactsPanel, choice } from './bussola-ui.mjs';

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

function hidePanels() {
  for (const panel of [intro, resume, questions, results, contactsMount]) panel.hidden = true;
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
  const next = button(state.index === situations.length-1 ? 'Scopri gli indirizzi dell’IIS Meucci - Mattei di Decimomannu' : 'Continua', () => advance(state.answers[situation.id]));
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
  footer.append(back, button('Passo questa domanda', () => advance(null), 'skip-button'), next);
  const context = el('div', null, 'question-context'); const copy = el('div'); copy.append(heading, scenario); context.append(copy, questionArt(situation.id));
  questions.replaceChildren(progressBox, context, el('p', 'Scegli ciò che ti interessa di più in questo momento. Puoi cambiare idea.', 'plain-note'), fieldset, footer);
  focusHeading(questions);
}

function renderResults() {
  hidePanels(); results.hidden = false; contactsMount.hidden = false;
  setJourney(1);
  const summary = summarize(situations, dimensions, state.answers);
  const title = el('h2', 'Dalle tue curiosità agli indirizzi dell’IIS Meucci - Mattei di Decimomannu'); title.id = 'resultTitle';
  results.replaceChildren(el('p', 'Scopri che cosa potresti imparare', 'explore-kicker'), title,
    el('p', 'Le tue scelte sono un punto di partenza per conoscere la scuola. Una stessa curiosità può trovare spazio in corsi diversi: guarda che cosa si studia in ciascuno e prova un’attività.'));
  if (summary.selected.length) {
    const grid = el('div', null, 'result-grid');
    for (const item of summary.selected) {
      const card = el('article', null, 'result-card');
      card.append(el('p', 'Ti ha incuriosito…', 'plain-note'), el('h3', item.action));
      const evidence = el('ul');
      for (const trace of item.evidence.filter(trace => trace.weight === 2).slice(0,2)) {
        const li = el('li'); li.append(el('strong', trace.title), el('span', trace.action)); evidence.append(li);
      }
      card.append(evidence); grid.append(card);
    }
    results.append(grid);
  } else {
    results.append(el('p', summary.reason === 'few'
      ? 'Con queste scelte non raccogliamo abbastanza elementi per mettere in evidenza alcuni temi. Puoi comunque rileggere le azioni che hai scelto ed esplorare tutti i percorsi.'
      : 'Le tue scelte aprono più direzioni, senza un piccolo gruppo di temi che si distingua chiaramente. Puoi partire dalle azioni che vuoi approfondire.'));
  }
  const recap = el('details', null, 'choice-recap');
  recap.append(el('summary', 'Rileggi tutte le tue scelte'));
  const list = el('ol');
  for (const situation of situations) {
    const selected = situation.options.find(o => o.id === state.answers[situation.id]);
    const li = el('li'); li.append(el('strong', situation.title), el('span', selected?.text || 'Hai passato questa situazione.')); list.append(li);
  }
  recap.append(list); results.append(recap);
  const relevant={persone:['ssas','turismo'],organizzazione:['afm','sia','turismo'],risorse:['afm','cat'],dati:['sia','afm','cat'],progetto:['cat','sia'],comunicazione:['turismo','ssas','afm'],territorio:['turismo','cat','ssas']};
  const bridges=el('div',null,'interest-bridges');
  for (const theme of summary.selected) {
    const bridge=el('article',null,'interest-bridge');
    bridge.append(el('h3',theme.name),el('p','Ecco dove puoi approfondire questa curiosità.'));
    const connections=el('div',null,'bridge-courses');
    for (const id of relevant[theme.id]) {
      const course=courses.find(c=>c.id===id); const box=el('div');
      box.append(link(course.code,`indirizzi.html#${id}`,'bridge-link'),el('p',course.lenses[theme.id])); connections.append(box);
    }
    bridge.append(connections); bridges.append(bridge);
  }
  if (summary.selected.length) results.insertBefore(bridges,results.children[3]||null);
  const courseHeading = el('h3', 'Cinque indirizzi, diversi modi di imparare');
  const curiosityStart = results.querySelector('.result-grid') || recap;
  const courseGrid = el('div', null, 'discovery-courses');
  for (const course of courses) {
    const card = el('article', null, 'discovery-course');
    card.dataset.course=course.id; card.append(courseArt(course.id));
    card.append(el('p', course.code, 'explore-kicker'), el('h3', course.name),
      el('p', course.face), el('h4', 'Che cosa si studia'), el('p', course.learn));
    if (summary.selected.length) {
      const connections=el('details',null,'course-connections');
      connections.append(el('summary', 'Collegamenti con le tue curiosità'));
      const links = el('ul');
      for (const theme of summary.selected) links.append(el('li', course.lenses[theme.id]));
      connections.append(links); card.append(connections);
    }
    const actions = el('div', null, 'action-row');
    actions.append(link('Conosci questo indirizzo', `indirizzi.html#${course.id}`),
      link('Prova un’attività di questo corso', `missioni.html?corso=${course.id}`, 'explore-button secondary'));
    card.append(actions); courseGrid.append(card);
  }
  results.insertBefore(courseHeading, curiosityStart);
  results.insertBefore(courseGrid, curiosityStart);
  results.insertBefore(el('p', 'Puoi partire dal corso che ti incuriosisce di più e poi confrontarlo con gli altri. La Bussola non sceglie al posto tuo.', 'plain-note'), curiosityStart);
  if (summary.selected.length) results.insertBefore(el('h3', 'Le curiosità da cui sei partito'), curiosityStart);
  const row = el('div', null, 'action-row');
  row.append(button('Rivedi le domande', () => { state.index = 0; state.stage = 'question'; persist(state); renderQuestion(); }, 'explore-button secondary'), button('Ricomincia', resetToIntro, 'explore-button secondary'));
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
    status.textContent = 'Le scelte restano in questa scheda del browser. Non chiediamo nome, scuola, e-mail o account.';
    start.disabled = false;
    if (state && Object.keys(state.answers).length) { intro.hidden = true; resume.hidden = false; }
    else state = freshState();
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
