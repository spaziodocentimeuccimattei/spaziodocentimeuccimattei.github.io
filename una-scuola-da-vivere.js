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
const newEntries = document.getElementById('newEntries');
const newEntryList = document.getElementById('newEntryList');
const CODE_KEY = 'orientamento-codice-personale';
const SESSION_KEY = 'orientamento-sessione-commissione';
const LEVEL_KEY = 'orientamento-livello-commissione';
const LEVEL_NAMES = {funzione_strumentale:'Funzione Strumentale', orientatore:'Commissione Orientamento'};
const ENTRY_STATES = {ricevuta:'In attesa di assegnazione', assegnata:'Assegnata dalla Funzione Strumentale'};
const longDate = new Intl.DateTimeFormat('it-IT', {weekday:'short', day:'numeric', month:'long', year:'numeric', timeZone:'UTC'});
const draftNotes = new Map();
const draftDates = new Map();
const upcomingVisits = document.getElementById('upcomingVisits');
const pastVisits = document.getElementById('pastVisits');
const calendarMessage = document.getElementById('calendarMessage');
const dateLabel = new Intl.DateTimeFormat('it-IT', {month:'long', year:'numeric', timeZone:'UTC'});
const choiceGroups = new Map();
const schoolOptions = new Map();

let schoolStates = new Map();
let schoolNames = new Map();
let currentOverview;
let appointmentsBySchool = new Map();
// Chi sta modificando: il docente con il suo codice oppure la Commissione con la sessione e il docente scelto.
let teacherCode = storage(localStorage, CODE_KEY);
let commissionToken = storage(sessionStorage, SESSION_KEY);
let commissionLevel = storage(sessionStorage, LEVEL_KEY);
let commissionTeacher = '';
let teacherData = null;
let calendarDay;
let overviewError = false;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function storage(area, key, value) {
  try {
    if (value === undefined) return area.getItem(key) || '';
    if (value) area.setItem(key, value); else area.removeItem(key);
  } catch {}
  return value || '';
}

function chooseSchool(school, appointment) {
  openActionPanel('#scuole');
  setAdding(true);
  renderTeacher();
  if (appointment?.id) draftDates.set(school.id, appointment.id);
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
  updateSchoolCounter();
  if (input.checked) (teacherCode ? newEntryList.querySelector(`[data-school="${school.id}"] textarea`) : supporterForm.elements.nome)?.focus({preventScroll:true});
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

async function send(action, data, token = '') {
  if (previewCatalog) throw new Error('Questa è un’anteprima: gli invii saranno attivi dopo la pubblicazione.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(ORIENTATION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? {'x-orientamento-session': token} : {}) },
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
  renderNewEntries(selected);
}

function schoolLabel(id) {
  const school = currentSchools.find(item => item.id === id);
  return school ? `${school.comune} · ${school.etichetta}` : id;
}

function appointmentLabel(item, today = italyToday()) {
  const type = item.tipo === 'stand' ? 'Open Day con stand' : 'Orientamento nelle aule';
  return `${longDate.format(new Date(`${item.data}T12:00:00Z`))} · ${type}${item.data < today ? ' · trascorsa' : ''}`;
}

// Elenco delle date di una scuola, in ordine, per scegliere a quale visita si riferisce la voce.
function dateSelect(schoolId, value) {
  const select = element('select');
  select.name = 'appuntamento_id';
  select.append(new Option('Nessuna data precisa', ''));
  const dates = appointmentsBySchool.get(schoolId) || [];
  for (const item of dates) select.append(new Option(appointmentLabel(item), item.id));
  if (value && !dates.some(item => item.id === value)) select.append(new Option('Data non più in calendario', value));
  select.value = value || '';
  return select;
}

function field(text, control, optional) {
  const label = element('label');
  const title = element('span', text);
  if (optional) title.append(' ', element('span', optional, 'optional'));
  label.append(title, control);
  return label;
}

function noteArea(value, placeholder) {
  const area = element('textarea');
  area.name = 'nota';
  area.rows = 3;
  area.maxLength = 600;
  area.value = value || '';
  area.placeholder = placeholder;
  return area;
}

function renderNewEntries(selected) {
  newEntries.hidden = selected.length === 0;
  newEntryList.replaceChildren(...selected.map(id => {
    const item = element('li', null, 'entry-card');
    item.dataset.school = id;
    item.append(element('strong', schoolLabel(id), 'entry-school'));
    const select = dateSelect(id, draftDates.get(id));
    select.addEventListener('change', () => draftDates.set(id, select.value));
    const area = noteArea(draftNotes.get(id), 'Per esempio: posso dalle 10, conosco questa scuola, vado con un collega.');
    area.addEventListener('input', () => draftNotes.set(id, area.value));
    item.append(field('Data della visita', select, 'facoltativa'), field('Nota per questa scuola', area, 'facoltativa'));
    return item;
  }));
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
    ['history', 'Storico delle visite'],
  ]) {
    const primary = key === 'upcoming';
    const section = element(primary ? 'section' : 'details', null, primary ? 'school-group school-group--upcoming' : 'school-group calendar-disclosure');
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

function reportVisit(school, appointment) {
  // Se la visita è già nel tuo storico si corregge la sua nota, senza registrarla due volte.
  const existing = teacherData?.attivita?.find(item => item.tipo === 'visita' && item.scuola_id === school.id && item.data === appointment.data);
  const card = existing && activityList.querySelector(`[data-activity="${existing.id}"]`);
  if (card) {
    openActionPanel('#scuole');
    card.scrollIntoView({block:'center', behavior:'instant'});
    card.querySelector('textarea').focus({preventScroll:true});
    cardMessage(card, 'Questa visita è già nel tuo storico: aggiungi qui la nota.');
    return;
  }
  openActionPanel('#visita');
  reportType.value = 'visita';
  syncReportType();
  reportSchool.value = school.id;
  reportForm.elements.data.value = appointment.data;
  reportForm.scrollIntoView({block:'start', behavior:'instant'});
  (teacherCode ? reportForm.elements.nota : reportForm.elements.nome).focus({preventScroll:true});
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

function renderMission(total, visited) {
  const progress = document.getElementById('missionProgress');
  progress.max = total || 1;
  progress.value = visited;
  progress.hidden = !total;
  document.getElementById('missionCount').textContent = `${visited} su ${total}`;
}

// Controllo: con la password FS o della Commissione ogni visita dice chi va (o chi è andato), con stato e nota;
// per gli altri restano iniziale e cognome di chi ha dato disponibilità, mai le note.
function controlMode() { return Boolean(commissionToken) && staff.length > 0; }

function visitPeople(school, appointment, upcoming) {
  const box = element('div', null, 'visit-people');
  if (!controlMode()) {
    const names = schoolNames.get(school.id) || [];
    box.append(names.length ? element('span', `Disponibili: ${names.join(', ')}`, 'visit-who')
      : element('span', upcoming ? 'Nessun docente ha ancora dato disponibilità' : 'Nessun docente indicato', 'visit-alert'));
    return box;
  }
  const lines = [];
  for (const person of staff) {
    const name = `${person.docente.nome.charAt(0)}. ${person.docente.cognome}`;
    if (upcoming) {
      const {fulfilled} = fulfilledEntries(person);
      for (const entry of person.voci) {
        if (entry.scuola_id !== school.id || fulfilled.has(entry.id) || (entry.appuntamento_id && entry.appuntamento_id !== appointment.id)) continue;
        const assigned = entry.stato === 'assegnata';
        lines.push([name, assigned ? 'assegnato' : 'disponibile', assigned ? 'is-confirmed' : 'is-pending', entry.nota]);
      }
    } else {
      for (const activity of person.attivita) {
        if (activity.tipo !== 'visita' || activity.scuola_id !== school.id || activity.data !== appointment.data) continue;
        const confirmed = activity.stato === 'confermata';
        lines.push([name, confirmed ? 'confermata' : 'da confermare', confirmed ? 'is-confirmed' : 'is-pending', activity.nota]);
      }
    }
  }
  if (!lines.length) {
    box.append(element('span', upcoming ? 'Scoperta: nessun docente' : 'Nessuno ha registrato questa visita', 'visit-alert'));
    return box;
  }
  const list = element('ul', null, 'visit-people-list');
  for (const [name, state, stateClass, note] of lines) {
    const item = element('li');
    item.append(element('strong', name), element('span', state, `entry-state ${stateClass}`));
    if (note) item.append(element('small', note));
    list.append(item);
  }
  box.append(list);
  return box;
}

function renderVisit({school, appointment}, upcoming) {
  const row = element('li', null, 'visit-row');
  row.dataset.school = school.id;
  const timing = element('div', null, 'visit-timing');
  const date = element('time', null, 'visit-date');
  date.dateTime = appointment.data;
  date.append(
    element('strong', String(Number(appointment.data.slice(-2)))),
    ' ',
    element('span', dateLabel.format(new Date(`${appointment.data}T12:00:00Z`))),
  );
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
    copy.append(visitPeople(school, appointment, true));
    row.append(timing, copy);
    if (!controlMode()) {
      const choose = element('button', 'Dai disponibilità', 'calendar-action');
      choose.type = 'button';
      choose.setAttribute('aria-label', `Dai disponibilità per ${school.comune} · ${school.etichetta}`);
      choose.addEventListener('click', () => chooseSchool(school, appointment));
      row.append(choose);
    }
  } else {
    // Una scuola conta come raggiunta solo dopo la conferma della Funzione Strumentale.
    const reached = schoolStates.get(school.id) === 'visitata';
    copy.append(element('span', type));
    if (!controlMode()) copy.append(element('span', reached ? 'Scuola raggiunta' : 'In attesa di conferma', `entry-state ${reached ? 'is-confirmed' : 'is-pending'}`));
    // Storico: chi c'era registra la propria presenza con la nota per le attività oltre il servizio.
    copy.append(visitPeople(school, appointment, false));
    row.append(timing, copy);
    if (!controlMode()) {
      const report = element('button', 'Registra la tua presenza', 'calendar-action');
      report.type = 'button';
      report.setAttribute('aria-label', `Registra la tua presenza a ${school.comune} · ${school.etichetta}, ${appointment.data}`);
      report.addEventListener('click', () => reportVisit(school, appointment));
      row.append(report);
    }
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
  // Una sola lista: le date trascorse, più le scuole raggiunte senza una data in calendario.
  const pastSchools = new Set(past.map(visit => visit.school.id));
  const extra = schools.filter(school => schoolStates.get(school.id) === 'visitata' && !pastSchools.has(school.id))
    .map(school => element('li', `${school.comune} · ${school.etichetta} · Scuola raggiunta`, 'visit-extra'));
  pastVisits.hidden = !past.length && !extra.length;
  pastVisits.querySelector('ul').replaceChildren(...past.map(visit => renderVisit(visit, false)), ...extra);
  calendarMessage.textContent = overviewError ? 'Aggiornamento non riuscito. Vedi le ultime date caricate.' : upcoming.length ? '' : 'Nessuna visita in programma.';
  renderMission(totali.scuole, totali.scuole_visitate);
  applySchoolStates(rows);
}

function refreshCalendarDay() {
  const today = italyToday();
  if (today !== calendarDay) renderOverview(currentSchools, today);
}

async function loadOverview(schools) {
  try {
    const data = await send('overview', {});
    appointmentsBySchool = new Map();
    for (const item of [...(data.appuntamenti || []), ...(data.appuntamenti_trascorsi || [])].sort(compareAppointments)) {
      if (!item.id) continue;
      if (!appointmentsBySchool.has(item.scuola_id)) appointmentsBySchool.set(item.scuola_id, []);
      appointmentsBySchool.get(item.scuola_id).push(item);
    }
    schoolStates = new Map(data.scuole.map((school) => [school.id, school.stato]));
    schoolNames = new Map(data.scuole.map((school) => [school.id, Array.isArray(school.docenti) ? school.docenti : []]));
    for (const [key, value] of Object.entries(data.totali)) setStat(key, value);
    currentOverview = data;
    overviewError = false;
    renderOverview(schools);
    updateSchoolCounter();
    renderTeacher();
  } catch {
    overviewError = true;
    calendarMessage.textContent = currentOverview
      ? 'Aggiornamento non riuscito. Vedi le ultime date caricate.'
      : 'Calendario non disponibile. Ricarica la pagina tra poco.';
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
    const selected = selectedSchools();
    if (selected.length < 1 || selected.length > MAX_SCHOOLS) {
      schoolError.hidden = false;
      schoolChoices.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    delete data.nota;
    delete data.appuntamento_id;
    data.voci = selected.map(id => ({scuola_id:id, appuntamento_id:draftDates.get(id) || null, nota:draftNotes.get(id) || ''}));
    if (teacherCode) data.codice = teacherCode;
    // La Commissione aggiunge le voci al docente scelto, una per scuola.
    if (commissionToken && commissionTeacher) return submitForCommission(form, data.voci);
  } else if (action === 'report_activity') {
    if (data.tipo !== 'visita') delete data.scuola_id;
    if (teacherCode && !commissionToken) data.codice = teacherCode;
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
    if (action === 'submit_supporter') {
      draftNotes.clear();
      draftDates.clear();
      setAdding(false);
      if (result.codice_personale) {
        teacherCode = storage(localStorage, CODE_KEY, result.codice_personale);
        loadTeacher();
      } else if (teacherCode) loadTeacher();
    }
    schoolError.hidden = true;
    updateSchoolCounter();
    filterSchoolChoices();
    if (action === 'report_activity') { resetReportForm(); setReporting(false); renderTeacher(); if (teacherCode) loadTeacher(); }
    const text = {
      submit_supporter: result.codice_personale
        ? `Disponibilità inviata. Il tuo codice personale è ${result.codice_personale}: annotalo. Su questo dispositivo resta salvato; altrove ti serve per modificare scuole, date e note.`
        : result.gia_registrato
          ? 'Disponibilità aggiunta al tuo nome. Per vederla e modificarla inserisci il tuo codice personale in «Le tue voci»; se non lo hai, chiedilo alla Funzione Strumentale.'
          : 'Disponibilità aggiunta. La trovi qui sopra, in «Disponibilità per le visite».',
      submit_proposal: `Proposta inviata. Codice: ${result.codice}. La Commissione la valuterà e ti comunicherà l’esito.`,
      report_activity: teacherCode ? 'Visita registrata: la trovi nel tuo storico qui sopra, in attesa di conferma.' : 'Visita registrata: resta in attesa di conferma della Funzione Strumentale.',
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
  // La registrazione delle visite sta dentro la sezione 01: #visita apre quella sezione e il suo modulo.
  if (hash === '#visita') {
    document.getElementById('scuole').open = true;
    if (!commissionToken) { setReporting(true); renderTeacher(); }
    return;
  }
  const panel = document.getElementById(hash.slice(1));
  if (panel instanceof HTMLDetailsElement && panel.classList.contains('action-panel')) panel.open = true;
}

// --- Le voci del docente: disponibilità per scuola e storico delle visite ---
const teacherArea = document.getElementById('teacherArea');
const accessEntry = document.getElementById('accessEntry');
const commissionArea = document.getElementById('commissionArea');
const entryList = document.getElementById('entryList');
const activityList = document.getElementById('activityList');
const renameForm = document.getElementById('renameForm');
const renameToggle = document.getElementById('renameToggle');

function editorPayload(extra = {}) {
  return commissionToken && commissionTeacher ? {...extra, docente_id:commissionTeacher} : {...extra, codice:teacherCode};
}

function editorSend(action, extra) {
  return send(action, editorPayload(extra), commissionToken && commissionTeacher ? commissionToken : '');
}

function cardMessage(card, text, kind = '') {
  const message = card.querySelector('.form-message');
  message.textContent = text;
  message.className = `form-message ${kind}`;
}

function cardButton(text, handler, className = 'calendar-action') {
  const button = element('button', text, className);
  button.type = 'button';
  button.addEventListener('click', handler);
  return button;
}

async function runCard(card, button, work) {
  button.disabled = true;
  cardMessage(card, 'Salvataggio in corso…');
  try {
    await work();
  } catch (error) {
    cardMessage(card, error.name === 'AbortError' ? 'Nessuna risposta: aggiorna la pagina e controlla prima di riprovare.' : error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

function entryCard(entry) {
  const card = element('li', null, 'entry-card');
  card.dataset.entry = entry.id;
  const head = element('div', null, 'entry-head');
  head.append(element('strong', schoolLabel(entry.scuola_id), 'entry-school'), element('span', ENTRY_STATES[entry.stato] || entry.stato, `entry-state is-${entry.stato}`));
  const select = dateSelect(entry.scuola_id, entry.appuntamento_id);
  const area = noteArea(entry.nota, 'Per esempio: posso dalle 10, conosco questa scuola, vado con un collega.');
  const actions = element('div', null, 'entry-actions');
  const save = cardButton('Salva le modifiche', () => runCard(card, save, async () => {
    await editorSend('save_entry', {id:entry.id, nota:area.value, appuntamento_id:select.value || null});
    cardMessage(card, 'Modifiche salvate.', 'success');
    loadOverview(currentSchools);
  }), 'calendar-action is-primary');
  const remove = cardButton('Togli questa disponibilità', () => {
    if (!window.confirm(`Togliere la disponibilità per ${schoolLabel(entry.scuola_id)}?`)) return;
    runCard(card, remove, async () => {
      await editorSend('remove_entry', {id:entry.id});
      await loadTeacher();
      loadOverview(currentSchools);
    });
  });
  actions.append(save, remove);
  card.append(head, field('Data della visita', select, 'facoltativa'), field('Nota', area, 'facoltativa'), actions, element('p', null, 'form-message'));
  card.querySelector('.form-message').setAttribute('role', 'status');
  return card;
}

// Una disponibilità diventata visita nel registro (stessa scuola, visita non precedente all'invio e, se indicata,
// nella stessa data) non si ripete: resta solo la scheda dello storico, che ne riporta la nota.
function appointmentDates() {
  return new Map([...appointmentsBySchool.values()].flat().map(item => [item.id, item.data]));
}

function fulfilledEntries(data = teacherData) {
  const byActivity = new Map();
  const fulfilled = new Set();
  const dates = appointmentDates();
  for (const entry of data.voci) {
    const sent = entry.created_at.slice(0, 10);
    const chosen = entry.appuntamento_id ? dates.get(entry.appuntamento_id) : null;
    const visit = data.attivita.find(item => item.tipo === 'visita' && item.scuola_id === entry.scuola_id
      && (chosen ? item.data === chosen : item.data >= sent));
    if (!visit) continue;
    fulfilled.add(entry.id);
    if (!byActivity.has(visit.id)) byActivity.set(visit.id, []);
    byActivity.get(visit.id).push(entry);
  }
  return {fulfilled, byActivity};
}

function activityCard(activity, entries = []) {
  const card = element('li', null, 'entry-card is-history');
  card.dataset.activity = activity.id;
  const head = element('div', null, 'entry-head');
  const where = activity.tipo === 'visita' ? schoolLabel(activity.scuola_id) : `Mattinée · ${activity.titolo || 'senza titolo'}`;
  const date = element('time', longDate.format(new Date(`${activity.data}T12:00:00Z`)), 'entry-date');
  date.dateTime = activity.data;
  const confirmed = activity.stato === 'confermata';
  head.append(element('strong', where, 'entry-school'), date,
    element('span', confirmed ? 'Confermata dalla Funzione Strumentale' : activity.modificata_dal_docente_at ? 'Nota cambiata: in attesa di nuova conferma' : 'In attesa di conferma', `entry-state ${confirmed ? 'is-confirmed' : 'is-pending'}`));
  const area = noteArea(activity.nota, 'Per esempio: fuori orario di servizio 11.30–13.30 (2 ore).');
  const save = cardButton('Salva la nota', () => {
    if (confirmed && area.value.trim() !== activity.nota && !(commissionToken && commissionTeacher && teacherData?.accesso === 'funzione_strumentale')
      && !window.confirm('La visita è già confermata: se cambi la nota tornerà da confermare. Continuare?')) return;
    runCard(card, save, async () => {
      const result = await editorSend('save_activity_note', {id:activity.id, nota:area.value});
      await loadTeacher();
      const fresh = activityList.querySelector(`[data-activity="${activity.id}"]`);
      if (fresh) cardMessage(fresh, result.da_riconfermare ? 'Nota salvata. La visita torna da confermare.' : 'Nota salvata.', 'success');
    });
  }, 'calendar-action is-primary');
  const actions = element('div', null, 'entry-actions');
  actions.append(save);
  card.append(head);
  for (const entry of entries.filter(item => item.nota)) card.append(element('p', `Nota della disponibilità: «${entry.nota}»`, 'entry-origin'));
  card.append(field('Nota per il riconoscimento', area, 'attività oltre il servizio'), actions, element('p', null, 'form-message'));
  card.querySelector('.form-message').setAttribute('role', 'status');
  return card;
}

const addEntryToggle = document.getElementById('addEntryToggle');
const reportToggle = document.getElementById('reportToggle');
const reportBlock = document.getElementById('visita');
const staffList = document.getElementById('staffList');
let staff = [];

function renderTeacher() {
  const commission = Boolean(commissionToken);
  const picked = commission && Boolean(commissionTeacher);
  document.body.classList.toggle('is-signed-in', commission || Boolean(teacherCode));
  accessEntry.hidden = Boolean(teacherCode) || commission;
  commissionArea.hidden = !commission;
  document.getElementById('staffPanel').hidden = picked;
  document.getElementById('staffBack').hidden = !picked;
  document.getElementById('roleName').textContent = LEVEL_NAMES[commissionLevel] || 'Commissione Orientamento';
  document.getElementById('gestioneLink').hidden = commissionLevel !== 'funzione_strumentale';
  teacherArea.hidden = !teacherData || (commission && !picked);
  document.getElementById('teacherRole').textContent = picked ? 'Stai modificando le voci di' : 'Stai lavorando come docente, con il tuo codice personale';
  const names = document.getElementById('supporterNames');
  const as = document.getElementById('supporterAs');
  const reportNames = document.getElementById('reportNames');
  const reportAs = document.getElementById('reportAs');
  const known = Boolean(teacherData && (commission ? picked : teacherCode));
  // Chi ha già le sue voci aggiunge disponibilità con il pulsante; chi non è ancora registrato vede subito il modulo.
  // Un modulo alla volta, solo quando serve: disponibilità oppure visita svolta.
  const adding = addEntryToggle.getAttribute('aria-expanded') === 'true';
  const reporting = reportToggle.getAttribute('aria-expanded') === 'true';
  document.getElementById('entryChoices').hidden = commission && !picked;
  reportToggle.hidden = commission;
  supporterForm.hidden = (commission && !picked) || !adding;
  reportBlock.hidden = commission || !reporting;
  addEntryToggle.textContent = adding ? 'Chiudi il modulo' : known ? '+ Aggiungi una disponibilità' : 'Dai la disponibilità';
  reportToggle.textContent = reporting ? 'Chiudi il modulo' : 'Registra una visita svolta';
  names.hidden = known;
  for (const input of names.querySelectorAll('input')) input.required = !known;
  as.hidden = !known;
  document.getElementById('supporterTitle').textContent = known ? 'Aggiungi una disponibilità' : 'Dai la disponibilità';
  const reportKnown = Boolean(teacherData && teacherCode && !commission);
  reportNames.hidden = reportKnown;
  for (const input of reportNames.querySelectorAll('input')) input.required = !reportKnown;
  reportAs.hidden = !reportKnown;
  if (!teacherData) return;
  const {docente} = teacherData;
  const fullName = `${docente.nome} ${docente.cognome}`;
  as.textContent = `Le nuove voci vanno a ${fullName}.`;
  reportAs.textContent = `Registri come ${fullName}.`;
  document.getElementById('teacherName').textContent = fullName;
  document.getElementById('teacherCode').textContent = docente.codice ? `Codice personale: ${docente.codice}` : '';
  document.getElementById('teacherLogout').hidden = commission;
  renameForm.elements.nome.value = docente.nome;
  renameForm.elements.cognome.value = docente.cognome;
  const {fulfilled, byActivity} = fulfilledEntries();
  const open = teacherData.voci.filter(entry => !fulfilled.has(entry.id));
  entryList.replaceChildren(...(open.length ? open.map(entryCard) : [element('li', fulfilled.size ? 'Nessuna disponibilità in sospeso: le visite già svolte sono nello storico qui sotto.' : 'Nessuna disponibilità per ora.', 'entry-empty')]));
  activityList.replaceChildren(...(teacherData.attivita.length ? teacherData.attivita.map(item => activityCard(item, byActivity.get(item.id))) : [element('li', 'Nessuna visita nel registro.', 'entry-empty')]));
}

async function loadTeacher() {
  if (commissionToken ? !commissionTeacher : !teacherCode) { teacherData = null; renderTeacher(); return; }
  try {
    teacherData = await editorSend('teacher_entries', {});
  } catch (error) {
    teacherData = null;
    if (!commissionToken && /Codice non riconosciuto/.test(error.message)) {
      teacherCode = storage(localStorage, CODE_KEY, '');
      setMessage('codeMessage', 'Il codice salvato su questo dispositivo non è più valido. Inseriscilo di nuovo o chiedilo alla Funzione Strumentale.', 'error');
    } else if (commissionToken && /Sessione scaduta/.test(error.message)) {
      leaveCommission();
      setMessage('commissionMessage', 'Sessione scaduta: entra di nuovo con la password.', 'error');
    } else {
      setMessage(commissionToken ? 'commissionMessage' : 'codeMessage', error.message, 'error');
    }
  }
  renderTeacher();
}

const shortDate = new Intl.DateTimeFormat('it-IT', {day:'numeric', month:'short', timeZone:'UTC'});
function dayLabel(iso) { return iso ? shortDate.format(new Date(`${iso}T12:00:00Z`)) : 'data da fissare'; }

function staffLine(where, when, state, stateClass, note) {
  const li = element('li', null, 'staff-line');
  const head = element('div', null, 'staff-line-head');
  head.append(element('strong', where), element('span', when, 'staff-when'), element('span', state, `entry-state ${stateClass}`));
  li.append(head);
  if (note) li.append(element('p', note, 'staff-note'));
  return li;
}

function staffCard(person) {
  const card = element('article', null, 'staff-card');
  const head = element('header', null, 'staff-head');
  const title = element('h5', `${person.docente.cognome} ${person.docente.nome}`);
  const open = cardButton('Apri e modifica', () => pickTeacher(person.docente.id), 'calendar-action is-primary');
  head.append(title);
  if (person.docente.codice) head.append(element('span', `Codice ${person.docente.codice}`, 'staff-code'));
  head.append(open);
  const {fulfilled, byActivity} = fulfilledEntries(person);
  const dates = appointmentDates();
  const entries = person.voci.filter(entry => !fulfilled.has(entry.id));
  const columns = element('div', null, 'staff-columns');
  const available = element('section');
  available.append(element('h6', `Disponibilità per le visite · ${entries.length}`));
  const list = element('ul');
  list.append(...(entries.length ? entries.map(entry => staffLine(schoolLabel(entry.scuola_id), dayLabel(dates.get(entry.appuntamento_id)),
    entry.stato === 'assegnata' ? 'Assegnata' : 'Da assegnare', `is-${entry.stato}`, entry.nota)) : [element('li', 'Nessuna in sospeso', 'staff-empty')]));
  available.append(list);
  const done = element('section');
  done.append(element('h6', `Visite svolte · ${person.attivita.length}`));
  const history = element('ul');
  history.append(...(person.attivita.length ? person.attivita.map(activity => {
    const where = activity.tipo === 'visita' ? schoolLabel(activity.scuola_id) : `Mattinée · ${activity.titolo || 'senza titolo'}`;
    const confirmed = activity.stato === 'confermata';
    const origin = (byActivity.get(activity.id) || []).map(entry => entry.nota).filter(Boolean);
    const note = [activity.nota, ...origin.map(text => `Disponibilità: ${text}`)].filter(Boolean).join(' · ');
    return staffLine(where, dayLabel(activity.data), confirmed ? 'Confermata' : 'Da confermare', confirmed ? 'is-confirmed' : 'is-pending', note || 'Nessuna nota');
  }) : [element('li', 'Nessuna visita', 'staff-empty')]));
  done.append(history);
  columns.append(available, done);
  card.append(head, columns);
  return card;
}

function renderStaff() {
  const people = [...staff].sort((a, b) => `${a.docente.cognome} ${a.docente.nome}`.localeCompare(`${b.docente.cognome} ${b.docente.nome}`, 'it'));
  const pending = people.reduce((sum, person) => sum + person.attivita.filter(item => item.stato !== 'confermata').length, 0);
  const open = people.reduce((sum, person) => sum + person.voci.length - fulfilledEntries(person).fulfilled.size, 0);
  document.getElementById('staffTotals').textContent = `${people.length} docenti · ${open} disponibilità in sospeso · ${pending} visite da confermare`;
  staffList.replaceChildren(...people.map(staffCard));
}

async function loadTeacherList() {
  document.getElementById('staffTotals').textContent = 'Caricamento dei docenti…';
  try {
    const result = await send('list_teachers', {}, commissionToken);
    if (result.accesso) commissionLevel = storage(sessionStorage, LEVEL_KEY, result.accesso);
    renderTeacher();
    staff = await Promise.all(result.docenti.map(item => send('teacher_entries', {docente_id:item.id}, commissionToken)));
    renderStaff();
    if (currentOverview) { renderOverview(currentSchools); pastVisits.open = true; }
  } catch (error) {
    leaveCommission();
    setMessage('commissionMessage', error.message, 'error');
    renderTeacher();
  }
}

function pickTeacher(id) {
  commissionTeacher = id;
  teacherData = staff.find(person => person.docente.id === id) || null;
  setAdding(false);
  renderTeacher();
  loadTeacher();
  document.getElementById('scuole').scrollIntoView({behavior:'smooth'});
}

function leaveCommission() {
  commissionToken = storage(sessionStorage, SESSION_KEY, '');
  commissionLevel = storage(sessionStorage, LEVEL_KEY, '');
  commissionTeacher = '';
  staff = [];
  teacherData = null;
}

function setAdding(value) {
  addEntryToggle.setAttribute('aria-expanded', String(value));
  if (value) reportToggle.setAttribute('aria-expanded', 'false');
}

function setReporting(value) {
  reportToggle.setAttribute('aria-expanded', String(value));
  if (value) addEntryToggle.setAttribute('aria-expanded', 'false');
}

async function submitForCommission(form, voci) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  setMessage('supporterMessage', 'Invio in corso…');
  try {
    for (const voce of voci) await editorSend('save_entry', voce);
    form.reset();
    draftNotes.clear();
    draftDates.clear();
    updateSchoolCounter();
    setAdding(false);
    setMessage('supporterMessage', 'Disponibilità aggiunte al docente scelto.', 'success');
    await loadTeacher();
    loadOverview(currentSchools);
  } catch (error) {
    setMessage('supporterMessage', error.message, 'error');
    loadTeacher();
  } finally {
    button.disabled = false;
  }
}

document.getElementById('codeForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const value = form.elements.codice.value.trim();
  if (!value) { setMessage('codeMessage', 'Scrivi il codice personale.', 'error'); return; }
  setMessage('codeMessage', 'Verifica del codice…');
  try {
    teacherData = await send('teacher_entries', {codice:value});
    teacherCode = storage(localStorage, CODE_KEY, teacherData.docente.codice);
    form.reset();
    setMessage('codeMessage', '');
    renderTeacher();
  } catch (error) {
    setMessage('codeMessage', error.message, 'error');
  }
});

document.getElementById('commissionForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  setMessage('commissionMessage', 'Accesso in corso…');
  try {
    const result = await send('login', {password:form.elements.password.value});
    if (result.access_level === 'supporter') throw new Error('Questa password consente soltanto la consultazione.');
    commissionToken = storage(sessionStorage, SESSION_KEY, result.token);
    commissionLevel = storage(sessionStorage, LEVEL_KEY, result.access_level);
    commissionTeacher = '';
    teacherData = null;
    form.reset();
    setMessage('commissionMessage', '');
    renderTeacher();
    loadTeacherList();
  } catch (error) {
    setMessage('commissionMessage', error.message, 'error');
  }
});

document.getElementById('staffBack').addEventListener('click', () => {
  commissionTeacher = '';
  teacherData = null;
  setAdding(false);
  renderTeacher();
  loadTeacherList();
});

reportToggle.addEventListener('click', () => {
  setReporting(reportToggle.getAttribute('aria-expanded') !== 'true');
  renderTeacher();
  if (!reportBlock.hidden) reportBlock.scrollIntoView({behavior:'smooth', block:'start'});
});

addEntryToggle.addEventListener('click', () => {
  setAdding(addEntryToggle.getAttribute('aria-expanded') !== 'true');
  renderTeacher();
  if (!supporterForm.hidden) supporterForm.scrollIntoView({behavior:'smooth', block:'start'});
});

document.getElementById('commissionLogout').addEventListener('click', () => {
  if (commissionToken) send('logout', {}, commissionToken).catch(() => {});
  leaveCommission();
  if (currentOverview) renderOverview(currentSchools);
  loadTeacher();
});

document.getElementById('teacherLogout').addEventListener('click', () => {
  if (!window.confirm('Togliere il codice da questo dispositivo? Per rientrare dovrai scriverlo di nuovo.')) return;
  teacherCode = storage(localStorage, CODE_KEY, '');
  teacherData = null;
  renderTeacher();
});

renameToggle.addEventListener('click', () => {
  renameForm.hidden = !renameForm.hidden;
  renameToggle.setAttribute('aria-expanded', String(!renameForm.hidden));
  if (!renameForm.hidden) renameForm.elements.nome.focus();
});

renameForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!renameForm.reportValidity()) return;
  const button = renameForm.querySelector('button[type="submit"]');
  button.disabled = true;
  setMessage('renameMessage', 'Salvataggio in corso…');
  try {
    await editorSend('rename_teacher', {nome:renameForm.elements.nome.value, cognome:renameForm.elements.cognome.value});
    await loadTeacher();
    loadOverview(currentSchools);
    setMessage('renameMessage', 'Nome e cognome aggiornati in tutte le tue voci.', 'success');
  } catch (error) {
    setMessage('renameMessage', error.message, 'error');
  } finally {
    button.disabled = false;
  }
});

let currentSchools = [];
async function refreshCalendar() {
  if (!currentSchools.length) currentSchools = await loadSchools();
  if (currentSchools.length) await loadOverview(currentSchools);
  else calendarMessage.textContent = 'Elenco delle scuole non disponibile. Ricarica la pagina tra poco.';
}
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
if (teacherCode || commissionToken) document.getElementById('scuole').open = true;
renderTeacher();
refreshCalendar().then(() => {
  if (commissionToken) loadTeacherList();
  loadTeacher();
});
openActionPanel();
