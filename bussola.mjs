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
let situations, dimensions, contacts, state;

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
  setJourney(1);
  const situation = situations[state.index];
  const progressBox = el('div', null, 'question-progress');
  const progressHeading = el('div', null, 'progress-heading');
  progressHeading.append(el('span', `Situazione ${state.index + 1} di ${situations.length}`), button('Ricomincia', resetToIntro, 'skip-button'));
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
  const next = button(state.index === situations.length-1 ? 'Ritrova le tue scelte' : 'Continua', () => advance(state.answers[situation.id]));
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
  footer.append(back, button('Passo questa situazione', () => advance(null), 'skip-button'), next);
  questions.replaceChildren(progressBox, heading, scenario, el('p', 'Scegli l’azione che ti incuriosisce adesso. Puoi cambiare idea.', 'plain-note'), fieldset, footer);
  focusHeading(questions);
}

function renderResults() {
  hidePanels(); results.hidden = false; contactsMount.hidden = false;
  setJourney(2);
  const summary = summarize(situations, dimensions, state.answers);
  const title = el('h2', 'Ritrova alcune delle tue scelte'); title.id = 'resultTitle';
  results.replaceChildren(el('p', 'Una prima esplorazione', 'explore-kicker'), title,
    el('p', 'Queste parole riguardano soltanto le azioni che hai scelto nelle situazioni proposte. Non valutano le tue capacità e non dicono quale corso devi scegliere.', 'explore-note'));
  if (summary.selected.length) {
    const grid = el('div', null, 'result-grid');
    for (const item of summary.selected) {
      const card = el('article', null, 'result-card');
      card.append(el('p', 'Nel percorso hai scelto di…', 'plain-note'), el('h3', item.action));
      const evidence = el('ul');
      for (const trace of item.evidence.slice(0,2)) {
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
  results.append(el('h3', 'Ora esploriamo'), el('p', 'Una stessa azione può essere utile in corsi diversi. Scopri dove compare e prova qualche attività: puoi esplorare tutti i percorsi.'));
  const row = el('div', null, 'action-row');
  row.append(link('Esplora tutti i percorsi', 'indirizzi.html?da=bussola#diurni'), link('Prova le cinque esperienze', 'missioni.html', 'explore-button secondary'), button('Rivedi le situazioni', () => { state.index = 0; state.stage = 'question'; persist(state); renderQuestion(); }, 'explore-button secondary'), button('Ricomincia', resetToIntro, 'explore-button secondary'));
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
    situations = b.situations; dimensions = d.dimensions; contacts = contactData;
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
