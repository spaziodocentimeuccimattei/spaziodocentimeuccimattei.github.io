import {calendarModel, compareAppointments, italyToday, timeRange} from './scuole-calendario.mjs?v=20261116-visite';
const ORIENTATION_API = 'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/orientamento';
const MAX_SCHOOLS = 5;
const previewCatalog = document.getElementById('school-preview-data');

const supporterForm = document.getElementById('supporterForm');
const proposalForm = document.getElementById('proposalForm');
const reportForm = document.getElementById('reportForm');
const reportType = document.getElementById('reportType');
const reportSchool = document.getElementById('reportSchool');
const schoolChoices = document.getElementById('schoolChoices');
const schoolSearch = document.getElementById('schoolSearch');
const schoolSearchEmpty = document.getElementById('schoolSearchEmpty');
const schoolError = document.getElementById('schoolError');
const schoolCounter = document.getElementById('schoolCounter');
const selectedSchoolNames = document.getElementById('selectedSchoolNames');
const upcomingVisits = document.getElementById('upcomingVisits');
const pastVisits = document.getElementById('pastVisits');
const reachedSchools = document.getElementById('reachedSchools');
const calendarMessage = document.getElementById('calendarMessage');
const refreshCalendarButton = document.getElementById('refreshSchoolCalendar');
const dateLabel = new Intl.DateTimeFormat('it-IT', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'});
const choiceGroups = new Map();
const schoolOptions = new Map();

let schoolStates = new Map();
let schoolNames = new Map();
let currentOverview;
let calendarDay;
let overviewError = false;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function chooseSchool(school) {
  openActionPanel('#scuole');
  schoolSearch.value = '';
  filterSchoolChoices();
  const option = schoolOptions.get(school.id);
  const input = option.querySelector('input');
  option.closest('details.school-group')?.setAttribute('open', '');
  if (!input.checked && selectedSchools().length < MAX_SCHOOLS) {
    input.checked = true;
    input.dispatchEvent(new Event('change', {bubbles:true}));
  }
  supporterForm.scrollIntoView({block:'start',behavior:'instant'});
  if (input.checked) supporterForm.elements.nome.focus({preventScroll:true});
  else setMessage('supporterMessage', 'Hai già selezionato cinque scuole. Togli una scelta prima di aggiungerne un’altra.');
}

function setMessage(id, message, kind = '') {
  const element = document.getElementById(id);
  element.textContent = message;
  element.className = `form-message ${kind}`;
  if (message) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
  }
}

async function send(action, data) {
  if (previewCatalog) throw new Error('Questa è un’anteprima: gli invii saranno attivi dopo la pubblicazione.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(ORIENTATION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Non è stato possibile inviare i dati. Riprova.');
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

function selectedSchools() {
  return [...schoolChoices.querySelectorAll('input:checked')].map((input) => input.value);
}

function updateSchoolCounter() {
  const selected = selectedSchools();
  const count = selected.length;
  schoolCounter.textContent = `${count} di ${MAX_SCHOOLS} scelte`;
  schoolCounter.classList.toggle('full', count === MAX_SCHOOLS);
  selectedSchoolNames.hidden = count === 0;
  selectedSchoolNames.textContent = count ? `Scelte: ${selected.map(id => schoolOptions.get(id).dataset.label).join(' · ')}` : '';
}

function applySchoolStates(rows) {
  for (const row of rows) {
    const id = row.school.id;
    const option = schoolOptions.get(id);
    const state = schoolStates.get(id) || 'libera';
    option.dataset.state = state;
    const tag = option.querySelector('.school-tag');
    const who = schoolNames.get(id) || [];
    tag.textContent = [
      state === 'visitata' ? 'Visita confermata' : '',
      row.all.some(item => item.data < calendarDay) && !row.upcoming.length ? 'Data trascorsa' : '',
      who.length ? `Disponibilità di ${who.join(', ')}` : state === 'in_arrivo' ? 'Disponibilità presente' : '',
    ].filter(Boolean).join(' · ');
    tag.hidden = !tag.textContent;
    const key = row.upcoming.length ? 'upcoming' : row.all.length || state === 'visitata' ? 'history' : 'other';
    const grid = choiceGroups.get(key).grid;
    if (option.parentElement !== grid) {
      if (option.querySelector('input').checked && key !== 'upcoming') grid.parentElement.open = true;
      grid.append(option);
    }
  }
  filterSchoolChoices();
}

function filterSchoolChoices() {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const query = normalize(schoolSearch.value.trim());
  let matches = 0;
  for (const group of choiceGroups.values()) {
    const {section, grid, count} = group;
    const options = [...grid.children];
    for (const option of options) option.hidden = !normalize(option.dataset.label).includes(query);
    const visible = options.filter(option => !option.hidden).length;
    matches += visible;
    section.hidden = !visible;
    if (count) {
      count.textContent = String(visible);
      if (query) {
        group.wasOpen ??= section.open;
        if (visible) section.open = true;
      } else if (group.wasOpen != null) {
        section.open = group.wasOpen || Boolean(grid.querySelector('input:checked'));
        group.wasOpen = undefined;
      }
    }
  }
  schoolSearchEmpty.hidden = !query || matches > 0;
}

function renderSchools(schools) {
  schoolChoices.replaceChildren();
  for (const [key, title] of [
    ['upcoming', 'Visite in programma'],
    ['other', 'Altre scuole'],
    ['history', 'Date trascorse e visite confermate'],
  ]) {
    const primary = key === 'upcoming';
    const section = element(primary ? 'section' : 'details', null, 'school-group calendar-disclosure');
    const heading = element(primary ? 'h3' : 'summary', title);
    const count = primary ? null : element('span', null, 'group-count');
    if (count) heading.append(' ', count);
    const grid = element('div', null, 'school-grid');
    section.append(heading, grid);
    choiceGroups.set(key, {section, grid, count});
    schoolChoices.append(section);
  }
  for (const school of schools) {
    const label = element('label', null, 'school-option');
    label.dataset.school = school.id;
    label.dataset.label = `${school.comune} – ${school.etichetta}`;
    const input = element('input');
    input.type = 'checkbox';
    input.name = 'scuole';
    input.value = school.id;
    const copy = element('span');
    copy.append(element('strong', school.comune), element('small', school.etichetta), element('em', null, 'school-tag'));
    label.append(input, copy);
    schoolOptions.set(school.id, label);
  }
  applySchoolStates(calendarModel(schools, []).rows);
  schoolChoices.addEventListener('change', (event) => {
    if (selectedSchools().length > MAX_SCHOOLS) event.target.checked = false;
    schoolError.hidden = selectedSchools().length > 0;
    updateSchoolCounter();
  });
}

function fillReportSchools(schools) {
  for (const school of schools) {
    const option = document.createElement('option');
    option.value = school.id;
    option.textContent = `${school.comune} · ${school.etichetta}`;
    reportSchool.append(option);
  }
}

function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function syncReportType() {
  const isVisit = reportType.value === 'visita';
  document.getElementById('reportSchoolField').hidden = !isVisit;
  document.getElementById('reportTitleField').hidden = isVisit;
  reportSchool.required = isVisit;
}

function resetReportForm() {
  const today = localToday();
  reportForm.elements.data.max = today;
  reportForm.elements.data.value = today;
  syncReportType();
}

async function loadSchools() {
  try {
    let schools;
    if (previewCatalog) {
      schools = JSON.parse(previewCatalog.textContent);
    } else {
      const response = await fetch('scuole-orientamento.json?v=20261116-visite', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      schools = await response.json();
    }
    if (!Array.isArray(schools) || !schools.length) throw new Error();
    renderSchools(schools);
    fillReportSchools(schools);
    supporterForm.querySelector('button[type="submit"]').disabled = false;
    return schools;
  } catch {
    schoolChoices.textContent = 'L’elenco delle scuole non è disponibile. Riprova più tardi.';
    supporterForm.querySelector('button[type="submit"]').disabled = true;
    return [];
  }
}

function setStat(name, value) {
  for (const element of document.querySelectorAll(`[data-stat="${name}"]`)) element.textContent = String(value);
}

function renderMission(schools, total, visited) {
  const progress = document.getElementById('missionProgress');
  progress.max = total || 1;
  progress.value = visited;
  progress.hidden = !total;
  document.getElementById('missionCount').textContent = `${visited} di ${total}`;
  const reached = schools.filter(school => schoolStates.get(school.id) === 'visitata');
  reachedSchools.hidden = reached.length === 0;
  reachedSchools.querySelector('ul').replaceChildren(...reached.map(school => element('li', `${school.comune} · ${school.etichetta}`)));
}

function renderVisit({school, appointment}, upcoming) {
  const row = element('li', null, 'visit-row');
  row.dataset.school = school.id;
  const timing = element('div', null, 'visit-timing');
  const date = element('time', dateLabel.format(new Date(`${appointment.data}T12:00:00Z`)));
  date.dateTime = appointment.data;
  timing.append(date, element('span', timeRange(appointment)));
  const copy = element('div', null, 'visit-copy');
  copy.append(element('strong', school.comune), element('span', school.etichetta));
  const type = appointment.tipo === 'stand' ? 'Open Day con stand' : 'Orientamento nelle aule';
  if (upcoming) {
    copy.append(element('span', appointment.luogo ? `${type} · ${appointment.luogo}` : type));
    if (appointment.stato !== 'confermata') copy.append(element('span', 'Data da confermare con la scuola', 'visit-pending'));
    if (school.avviso && (!school.avviso.fino_al || appointment.data <= school.avviso.fino_al)) {
      const notice = element('details', null, 'visit-notice');
      notice.append(element('summary', 'Indicazioni della scuola'), element('strong', school.avviso.titolo));
      for (const text of school.avviso.indicazioni || []) notice.append(element('p', text));
      copy.append(notice);
    }
    const choose = element('button', 'Dai disponibilità', 'calendar-action');
    choose.type = 'button';
    choose.setAttribute('aria-label', `Dai disponibilità per ${school.comune} · ${school.etichetta}`);
    choose.addEventListener('click', () => chooseSchool(school));
    row.append(timing, copy, choose);
  } else {
    copy.append(element('span', type));
    row.append(timing, copy);
  }
  return row;
}

function renderOverview(schools, today = italyToday()) {
  if (!currentOverview) return;
  calendarDay = today;
  const {totali, appuntamenti = [], appuntamenti_trascorsi = []} = currentOverview;
  const {rows} = calendarModel(schools, [...appuntamenti, ...appuntamenti_trascorsi], {today});
  const visits = rows.flatMap(row => row.all.map(appointment => ({school:row.school, appointment})))
    .sort((a, b) => compareAppointments(a.appointment, b.appointment));
  const upcoming = visits.filter(visit => visit.appointment.data >= today);
  const past = visits.filter(visit => visit.appointment.data < today);
  upcomingVisits.replaceChildren(...upcoming.map(visit => renderVisit(visit, true)));
  pastVisits.hidden = !past.length;
  pastVisits.querySelector('.group-count').textContent = String(past.length);
  pastVisits.querySelector('ul').replaceChildren(...past.map(visit => renderVisit(visit, false)));
  calendarMessage.textContent = overviewError ? 'Aggiornamento non riuscito. Vedi le ultime date caricate.' : upcoming.length ? '' : 'Nessuna visita in programma.';
  renderMission(schools, totali.scuole, totali.scuole_visitate);
  applySchoolStates(rows);
}

function refreshCalendarDay() {
  const today = italyToday();
  if (today !== calendarDay) renderOverview(currentSchools, today);
}

async function loadOverview(schools) {
  try {
    const data = await send('overview', {});
    schoolStates = new Map(data.scuole.map((school) => [school.id, school.stato]));
    schoolNames = new Map(data.scuole.map((school) => [school.id, Array.isArray(school.docenti) ? school.docenti : []]));
    for (const [key, value] of Object.entries(data.totali)) setStat(key, value);
    currentOverview = data;
    overviewError = false;
    renderOverview(schools);
  } catch {
    overviewError = true;
    calendarMessage.textContent = currentOverview
      ? 'Aggiornamento non riuscito. Vedi le ultime date caricate.'
      : 'Calendario non disponibile. Riprova con «Aggiorna calendario».';
  }
}

function fields(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function submitForm(event, action, messageId) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = fields(form);
  if (action === 'submit_supporter') {
    data.scuole = selectedSchools();
    if (data.scuole.length < 1 || data.scuole.length > MAX_SCHOOLS) {
      schoolError.hidden = false;
      schoolChoices.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
  } else if (action === 'report_activity') {
    if (data.tipo !== 'visita') delete data.scuola_id;
  } else {
    data.durata_minuti = Number(data.durata_minuti);
    data.partecipanti = data.partecipanti ? Number(data.partecipanti) : null;
  }
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  setMessage(messageId, 'Invio in corso…');
  try {
    const result = await send(action, data);
    form.reset();
    schoolError.hidden = true;
    updateSchoolCounter();
    filterSchoolChoices();
    if (action === 'report_activity') resetReportForm();
    const text = {
      submit_supporter: `Disponibilità inviata. Codice: ${result.codice}. La Funzione Strumentale ti contatterà per concordare scuola, data e orario.`,
      submit_proposal: `Proposta inviata. Codice: ${result.codice}. La Commissione la valuterà e ti comunicherà l’esito.`,
      report_activity: `Attività registrata. Codice: ${result.codice}. Dopo la verifica della Funzione Strumentale entrerà nel riepilogo destinato alla Dirigente.`,
    }[action];
    setMessage(messageId, text, 'success');
    loadOverview(currentSchools);
  } catch (error) {
    setMessage(messageId, error.name === 'AbortError' ? 'La richiesta non ha ricevuto risposta. Prima di riprovare, verifica se la registrazione è già stata acquisita.' : error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

function openActionPanel(hash = window.location.hash) {
  if (!hash) return;
  const panel = document.getElementById(hash.slice(1));
  if (panel instanceof HTMLDetailsElement && panel.classList.contains('action-panel')) panel.open = true;
}

let currentSchools = [];
async function refreshCalendar() {
  refreshCalendarButton.disabled = true;
  try {
    if (!currentSchools.length) currentSchools = await loadSchools();
    if (currentSchools.length) await loadOverview(currentSchools);
    else calendarMessage.textContent = 'Elenco delle scuole non disponibile. Riprova con «Aggiorna calendario».';
  } finally {
    refreshCalendarButton.disabled = false;
  }
}
refreshCalendarButton.addEventListener('click', refreshCalendar);
schoolSearch.addEventListener('input', filterSchoolChoices);
supporterForm.addEventListener('submit', (event) => submitForm(event, 'submit_supporter', 'supporterMessage'));
proposalForm.addEventListener('submit', (event) => submitForm(event, 'submit_proposal', 'proposalMessage'));
reportForm.addEventListener('submit', (event) => submitForm(event, 'report_activity', 'reportMessage'));
reportType.addEventListener('change', syncReportType);
for (const panel of document.querySelectorAll('.action-panel')) {
  const label = panel.querySelector('.summary-action span');
  const syncLabel = () => { label.textContent = panel.open ? 'Chiudi il modulo' : 'Apri il modulo'; };
  panel.addEventListener('toggle', syncLabel);
  syncLabel();
}
for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', () => openActionPanel(link.getAttribute('href')));
}
window.addEventListener('hashchange', () => openActionPanel());
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshCalendarDay();
});
setInterval(refreshCalendarDay, 60000);
for (const form of [supporterForm, proposalForm, reportForm]) form.querySelector('button[type="submit"]').disabled = false;
resetReportForm();
refreshCalendar();
openActionPanel();
