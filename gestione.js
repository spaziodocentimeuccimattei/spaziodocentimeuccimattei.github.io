import {createSchoolCalendar,compareAppointments} from './scuole-calendario.mjs?v=20261020-ordine';
const managementParams=new URLSearchParams(location.search);
if(location.hash==='#bussola'&&managementParams.get('strumenti')!=='bussola'){
  const destination=new URL('bussola-docenti.html',location.href);
  for(const key of ['corso','prova'])if(managementParams.has(key))destination.searchParams.set(key,managementParams.get(key));
  location.replace(destination.href);
}else{
const API_URL = 'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/orientamento';
const SESSION_KEY = 'mattei-gestione-session';

const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('managePassword');
const loginPanel = document.getElementById('loginPanel');
const workspacePanel = document.getElementById('workspacePanel');
const accessMessage = document.getElementById('accessMessage');
const globalMessage = document.getElementById('globalMessage');
const refreshButton = document.getElementById('refreshButton');
const activityForm = document.getElementById('activityForm');
const activityType = document.getElementById('activityType');
const activitySchool = document.getElementById('activitySchool');
const activityMessage = document.getElementById('activityMessage');

const PROPOSAL_TYPES = { laboratorio: 'Laboratorio', lezione_aperta: 'Lezione aperta', esperienza_pratica: 'Esperienza pratica', dimostrazione: 'Dimostrazione', interdisciplinare: 'Attività interdisciplinare', altro: 'Altro' };
const SUPPORTER_STATES = { ricevuta: 'Da assegnare', assegnata: 'Assegnata', archiviata: 'Archiviata' };
const APPOINTMENT_TYPES = { aule: 'Orientamento nelle aule', stand: 'Open day con stand' };
const APPOINTMENT_STATES = { prevista: 'Prevista', confermata: 'Confermata' };
const PROPOSAL_STATES = { ricevuta: 'Da valutare', in_valutazione: 'In valutazione', approvata: 'Approvata', archiviata: 'Archiviata' };

let sessionToken = sessionStorage.getItem(SESSION_KEY) || '';
let data = null;
const filters = { candidature: 'ricevuta', proposte: 'aperte', calendarioPeriodo: 'prossime' };
const appointmentForm = document.getElementById('appointmentForm');
const appointmentSchool = document.getElementById('appointmentSchool');
const appointmentMessage = document.getElementById('appointmentMessage');
const appointmentSubmit = document.getElementById('appointmentSubmit');
const appointmentCancel = document.getElementById('appointmentCancel');
const managementTools = document.getElementById('managementTools');
const schoolCalendar = createSchoolCalendar(document.getElementById('manageSchoolCalendar'), {
  admin: true,
  onAdd: (school) => openCalendarForm(school),
  onEdit: (item) => openCalendarForm(null, item),
});
function openCalendarForm(school, item) {
  const hasDraft = [...appointmentForm.querySelectorAll('input:not([type="hidden"])')].some(input => input.value);
  managementTools.open = true;
  document.querySelector('[data-tab="calendario"]').click();
  if (hasDraft) {
    appointmentMessage.textContent = 'Hai una data non ancora salvata. Salvala oppure annulla la bozza prima di aprire un altro appuntamento.';
    appointmentCancel.hidden = false;
    appointmentCancel.textContent = 'Annulla la bozza';
    appointmentForm.scrollIntoView({block:'start',behavior:'instant'});
    return;
  }
  if (item) editAppointment(item);
  else {
    resetAppointmentForm();
    appointmentSchool.value = school.id;
    appointmentMessage.textContent = `Nuova data per ${school.comune} · ${school.etichetta}.`;
    appointmentForm.scrollIntoView({block:'start',behavior:'instant'});
    appointmentForm.elements.data.focus({preventScroll:true});
  }
}
document.querySelectorAll('.manage-tools-link').forEach(link => link.addEventListener('click', () => { managementTools.open = true; }));

// Data di oggi in Italia, nel formato delle date salvate (AAAA-MM-GG).
function today() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
}

function timeRange(item) {
  const start = (item.ora_inizio || '').slice(0, 5);
  const end = (item.ora_fine || '').slice(0, 5);
  return start && end ? `${start}–${end}` : start ? `dalle ${start}` : end ? `fino alle ${end}` : '';
}

async function api(action, payload = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (sessionToken) headers['x-orientamento-session'] = sessionToken;
  const response = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify({ action, ...payload }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || 'Operazione non riuscita.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(value, withTime = true) {
  const options = withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' };
  return new Intl.DateTimeFormat('it-IT', options).format(new Date(value));
}

function line(label, value) {
  const p = el('p');
  p.append(el('strong', '', `${label}: `), document.createTextNode(value || '—'));
  return p;
}

function showWorkspace() {
  loginPanel.hidden = true;
  workspacePanel.hidden = false;
  document.getElementById('workspaceTitle').focus({ preventScroll: true });
}

function openRequestedManagementSection() {
  if (location.hash !== '#bussola') return;
  if (!loginPanel.hidden) {
    document.getElementById('access-title').textContent = 'Accedi per creare il codice della classe';
    return;
  }
  managementTools.open = true;
  const tab = document.querySelector('[data-tab="bussola"]');
  tab.click();
  tab.focus({preventScroll:true});
  document.getElementById('bussolaManagement').scrollIntoView({block:'start',behavior:'instant'});
}

function resetSession() {
  sessionToken = '';
  data = null;
  schoolCalendar.clear();
  sessionStorage.removeItem(SESSION_KEY);
  document.dispatchEvent(new CustomEvent('bussola-gestione-uscita'));
  workspacePanel.hidden = true;
  loginPanel.hidden = false;
}

function handleError(error, target = globalMessage) {
  target.textContent = error.message;
  if (error.status === 401 || error.status === 403) resetSession();
  if (error.status === 403) accessMessage.textContent = 'Questa password non dà accesso alla gestione orientamento.';
}

async function setState(kind, item, stato, button) {
  button.disabled = true;
  globalMessage.textContent = 'Salvataggio…';
  try {
    await api('update_contribution', { kind, id: item.id, stato });
    globalMessage.textContent = `Stato aggiornato per ${item.nome} ${item.cognome}: ${(kind === 'supporter' ? SUPPORTER_STATES : PROPOSAL_STATES)[stato]}.`;
    await load();
  } catch (error) {
    button.disabled = false;
    handleError(error);
  }
}

function actionButton(label, className, handler) {
  const button = el('button', `act ${className}`, label);
  button.type = 'button';
  button.addEventListener('click', () => handler(button));
  return button;
}

function stateTag(text, state) {
  return el('span', `state state-${state}`, text);
}

function renderSummary() {
  const summary = document.getElementById('summary');
  summary.replaceChildren();
  const pendingSupporters = data.disponibilita.filter((item) => item.stato === 'ricevuta').length;
  const pendingProposals = data.proposte.filter((item) => ['ricevuta', 'in_valutazione'].includes(item.stato)).length;
  const pendingActivities = data.da_confermare.length;
  const visited = new Set(data.attivita.filter((item) => item.tipo === 'visita' && item.data <= today()).map((item) => item.scuola_id));
  const upcoming = data.appuntamenti.filter((item) => item.data >= today());
  const toConfirm = upcoming.filter((item) => item.stato === 'prevista').length;
  document.getElementById('countCalendario').textContent = toConfirm ? String(toConfirm) : '';
  for (const [value, label, hot] of [
    [pendingActivities, 'attività da verificare', pendingActivities > 0],
    [pendingSupporters, 'disponibilità da assegnare', pendingSupporters > 0],
    [pendingProposals, 'proposte da valutare', pendingProposals > 0],
    [`${visited.size}/${data.scuole.length}`, 'scuole visitate', false],
    [upcoming.length, 'date in arrivo', false],
    [data.attivita.length, 'righe a registro', false],
  ]) {
    const box = el('div', hot ? 'hot' : '');
    box.append(el('strong', '', String(value)), el('span', '', label));
    summary.append(box);
  }
  document.getElementById('countConfermare').textContent = pendingActivities ? String(pendingActivities) : '';
  document.getElementById('countCandidature').textContent = pendingSupporters ? String(pendingSupporters) : '';
  document.getElementById('countProposte').textContent = pendingProposals ? String(pendingProposals) : '';
}

function renderSupporters(schoolNames) {
  const list = document.getElementById('supporterList');
  list.replaceChildren();
  const items = data.disponibilita.filter((item) => filters.candidature === 'tutte' || item.stato === filters.candidature);
  if (!items.length) list.append(el('p', 'empty', 'Non ci sono disponibilità in questa sezione.'));
  for (const item of items) {
    const card = el('article', 'review-card');
    const head = el('div', 'review-head');
    head.append(el('h4', '', `${item.nome} ${item.cognome}`), stateTag(SUPPORTER_STATES[item.stato], item.stato));
    card.append(head, el('small', '', `${formatDate(item.created_at)} · Codice ${item.id.slice(0, 8).toUpperCase()}`));
    if (item.nota) card.append(line('Nota', item.nota));
    // L'assegnazione resta in attesa della conferma di svolgimento, anche dopo la data scelta.
    const rows = el('div', 'school-confirm');
    for (const id of item.scuole) {
      const row = el('div', 'school-confirm-row');
      row.append(el('strong', '', schoolNames.get(id) || id));
      const booked = [...data.attivita, ...data.da_confermare].filter((visit) => visit.tipo === 'visita' && visit.scuola_id === id && personKey(visit) === personKey(item));
      if (booked.length) {
        for (const visit of [...booked].sort((a, b) => a.data.localeCompare(b.data))) {
          const confirmed = visit.stato === 'confermata';
          row.append(el('span', `state state-${confirmed ? 'assegnata' : 'ricevuta'}`, `${confirmed ? 'Svolta e confermata' : 'Da confermare dopo la visita'}: ${visit.data.split('-').reverse().join('/')}`));
        }
      } else if (item.stato !== 'archiviata') {
        const dates = data.appuntamenti.filter((date) => date.scuola_id === id && date.data >= today());
        const input = document.createElement('input');
        input.type = 'date';
        input.setAttribute('aria-label', `Data per ${schoolNames.get(id) || id}`);
        if (dates.length) input.value = dates[0].data;
        row.append(input, actionButton('Assegna la visita', 'ok', (button) => confirmSupporter(item, id, input, button)));
        if (dates.length > 1) row.append(el('small', '', `Date in calendario: ${dates.map((date) => date.data.split('-').reverse().join('/')).join(', ')}`));
        if (!dates.length) row.append(el('small', '', 'Nessuna data in calendario per questa scuola: indicala qui.'));
      }
      rows.append(row);
    }
    card.append(rows);
    const actions = el('div', 'review-actions');
    if (item.stato !== 'archiviata') actions.append(actionButton('Archivia', 'no', (b) => setState('supporter', item, 'archiviata', b)));
    if (item.stato !== 'ricevuta') actions.append(actionButton('Riporta tra quelle da assegnare', 'neutral', (b) => setState('supporter', item, 'ricevuta', b)));
    card.append(actions);
    list.append(card);
  }
}

async function confirmSupporter(item, schoolId, input, button) {
  if (!input.value) { globalMessage.textContent = 'Indica la data prima di assegnare la visita.'; input.focus(); return; }
  button.disabled = true;
  globalMessage.textContent = 'Salvataggio…';
  try {
    await api('register_activity', { nome: item.nome, cognome: item.cognome, tipo: 'visita', scuola_id: schoolId, data: input.value });
    if (item.stato !== 'assegnata') await api('update_contribution', { kind: 'supporter', id: item.id, stato: 'assegnata' });
    globalMessage.textContent = `Visita assegnata a ${item.nome} ${item.cognome} per il ${input.value.split('-').reverse().join('/')}. Resta in attesa della tua conferma di svolgimento.`;
    await load();
  } catch (error) {
    button.disabled = false;
    handleError(error);
  }
}

function renderProposals() {
  const list = document.getElementById('proposalList');
  list.replaceChildren();
  const items = data.proposte.filter((item) => filters.proposte === 'tutte' ||
    (filters.proposte === 'aperte' ? ['ricevuta', 'in_valutazione'].includes(item.stato) : item.stato === filters.proposte));
  if (!items.length) list.append(el('p', 'empty', 'Nessuna proposta in questa sezione.'));
  for (const item of items) {
    const card = el('article', 'review-card');
    const head = el('div', 'review-head');
    head.append(el('h4', '', item.titolo), stateTag(PROPOSAL_STATES[item.stato], item.stato));
    card.append(head, el('small', '', `${item.nome} ${item.cognome} · ${formatDate(item.created_at)} · Codice ${item.id.slice(0, 8).toUpperCase()}`),
      line('Area', item.area),
      line('Tipologia e durata', `${PROPOSAL_TYPES[item.tipologia] || item.tipologia} · ${item.durata_minuti} minuti`),
      line('Che cosa fanno i ragazzi', item.descrizione));
    if (item.partecipanti) card.append(line('Partecipanti indicativi', String(item.partecipanti)));
    if (item.esigenze) card.append(line('Spazi e attrezzature', item.esigenze));
    if (item.nota) card.append(line('Note', item.nota));
    const actions = el('div', 'review-actions');
    if (item.stato !== 'approvata') actions.append(actionButton('Approva proposta', 'ok', (b) => setState('proposta', item, 'approvata', b)));
    if (item.stato === 'ricevuta') actions.append(actionButton('Segna in valutazione', 'neutral', (b) => setState('proposta', item, 'in_valutazione', b)));
    if (item.stato !== 'archiviata') actions.append(actionButton('Archivia', 'no', (b) => setState('proposta', item, 'archiviata', b)));
    if (item.stato === 'archiviata' || item.stato === 'approvata') actions.append(actionButton('Riporta tra quelle da valutare', 'neutral', (b) => setState('proposta', item, 'ricevuta', b)));
    card.append(actions);
    list.append(card);
  }
}

function renderSchools() {
  const participation = new Map(data.scuole.map(school => [school.id,
    data.attivita.some(item => item.tipo === 'visita' && item.scuola_id === school.id && item.data <= today()) ? 'visitata' :
    data.disponibilita.some(item => item.stato !== 'archiviata' && item.scuole.includes(school.id)) ? 'in_arrivo' : 'libera'
  ]));
  schoolCalendar.update(data.scuole, data.appuntamenti, participation);
  const board = document.getElementById('schoolBoard');
  board.replaceChildren();
  for (const school of data.scuole) {
    const candidates = data.disponibilita.filter((item) => item.stato !== 'archiviata' && item.scuole.includes(school.id));
    const register = data.attivita.filter((item) => item.tipo === 'visita' && item.scuola_id === school.id);
    const visits = register.filter((item) => item.data <= today());
    const pending = data.da_confermare.filter((item) => item.tipo === 'visita' && item.scuola_id === school.id);
    const accepted = register.filter((item) => item.data > today());
    const card = el('article', `school-card ${visits.length ? 'visited' : accepted.length ? 'accepted' : candidates.length ? 'offered' : ''}`);
    card.append(el('h4', '', school.comune), el('small', '', school.etichetta));
    const status = visits.length ? `Visita svolta (${visits.length})` : pending.length ? `Visite da confermare (${pending.length})` : accepted.length ? `Docenti a registro (${accepted.length})` : candidates.length ? 'Disponibilità ricevute' : 'Nessuna disponibilità';
    card.append(el('p', 'school-status', status));
    const names = el('ul');
    for (const item of candidates) names.append(el('li', item.stato === 'assegnata' ? 'accepted' : '', `${item.nome} ${item.cognome}${item.stato === 'assegnata' ? ' ✓' : ''}`));
    if (candidates.length) card.append(names);
    const booked = el('ul', 'school-dates');
    for (const item of [...register, ...pending].sort((a, b) => a.data.localeCompare(b.data))) {
      booked.append(el('li', item.stato === 'confermata' ? 'accepted' : '', `${item.stato === 'confermata' ? 'Confermata' : 'Da confermare'}: ${item.cognome} ${item.nome} · ${formatDate(`${item.data}T12:00:00`, false)}`));
    }
    if (register.length || pending.length) card.append(booked);
    const dates = data.appuntamenti.filter((item) => item.scuola_id === school.id && item.data >= today());
    const calendar = el('ul', 'school-dates');
    for (const item of dates) {
      calendar.append(el('li', item.stato === 'confermata' ? 'accepted' : '',
        `${formatDate(`${item.data}T12:00:00`, false)} · ${APPOINTMENT_TYPES[item.tipo]}${item.stato === 'confermata' ? ' ✓' : ' (prevista)'}`));
    }
    card.append(dates.length ? calendar : el('p', 'school-nodate', 'Nessuna data in calendario'));
    board.append(card);
  }
}

// Stesso docente anche se scritto con maiuscole o accenti diversi.
function personKey(item) {
  return `${item.cognome} ${item.nome}`.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function byTeacher(a, b) {
  return personKey(a).localeCompare(personKey(b), 'it') || a.data.localeCompare(b.data);
}

function fillDatalist(id, values) {
  const list = document.getElementById(id);
  list.replaceChildren();
  for (const value of [...new Set(values)].sort((a, b) => a.localeCompare(b, 'it'))) {
    const option = document.createElement('option');
    option.value = value;
    list.append(option);
  }
}

function renderActivities(schoolNames) {
  const current = activitySchool.value;
  activitySchool.replaceChildren();
  for (const school of data.scuole) {
    const option = document.createElement('option');
    option.value = school.id;
    option.textContent = `${school.comune} · ${school.etichetta}`;
    activitySchool.append(option);
  }
  if (current) activitySchool.value = current;
  const people = [...data.disponibilita, ...data.proposte, ...data.attivita, ...data.da_confermare];
  fillDatalist('teacherNames', people.map((item) => item.nome));
  fillDatalist('teacherSurnames', people.map((item) => item.cognome));

  const list = document.getElementById('activityList');
  list.replaceChildren();
  if (!data.attivita.length) list.append(el('p', 'empty', 'Nessuna attività confermata.'));
  // Un blocco per docente: quando e dove è andato, dalla data più vecchia alla più recente.
  let teacher = '';
  let group = null;
  for (const item of [...data.attivita].sort(byTeacher)) {
    if (personKey(item) !== teacher) {
      teacher = personKey(item);
      const count = data.attivita.filter((other) => personKey(other) === teacher).length;
      list.append(el('h4', 'month-title teacher-title', `${item.cognome} ${item.nome} · ${count} ${count === 1 ? 'attività confermata' : 'attività confermate'}`));
      group = el('div', 'review-list');
      list.append(group);
    }
    const card = activityCard(item, schoolNames);
    const actions = el('div', 'review-actions');
    actions.append(actionButton('Annulla registrazione', 'no', () => requestActivityCancellation(item, card, actions)));
    actions.append(actionButton('Modifica dati o docente', 'neutral', () => editActivity(item)));
    card.append(actions);
    group.append(card);
  }
}

function resetAppointmentForm() {
  const school = appointmentSchool.value;
  appointmentForm.reset();
  appointmentForm.elements.id.value = '';
  appointmentSchool.value = school;
  appointmentSubmit.textContent = 'Aggiungi la data';
  appointmentCancel.hidden = true;
  appointmentCancel.textContent = 'Annulla la modifica';
}

function editAppointment(item) {
  for (const name of ['id', 'scuola_id', 'tipo', 'data', 'stato', 'luogo', 'nota']) appointmentForm.elements[name].value = item[name] || '';
  appointmentForm.elements.ora_inizio.value = (item.ora_inizio || '').slice(0, 5);
  appointmentForm.elements.ora_fine.value = (item.ora_fine || '').slice(0, 5);
  appointmentSubmit.textContent = 'Salva le modifiche';
  appointmentCancel.hidden = false;
  appointmentMessage.textContent = 'Stai modificando una data già in calendario.';
  appointmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  appointmentForm.elements.data.focus({ preventScroll: true });
}

async function appointmentAction(button, action, payload, message) {
  button.disabled = true;
  appointmentMessage.textContent = 'Salvataggio…';
  try {
    await api(action, payload);
    appointmentMessage.textContent = message;
    await load();
  } catch (error) {
    button.disabled = false;
    handleError(error, appointmentMessage);
  }
}

function renderAppointments(schoolNames) {
  const current = appointmentSchool.value;
  appointmentSchool.replaceChildren();
  for (const school of data.scuole) {
    const option = document.createElement('option');
    option.value = school.id;
    option.textContent = `${school.comune} · ${school.etichetta}`;
    appointmentSchool.append(option);
  }
  if (current) appointmentSchool.value = current;

  const list = document.getElementById('appointmentList');
  list.replaceChildren();
  const now = today();
  const items = data.appuntamenti.filter((item) =>
    filters.calendarioPeriodo === 'tutte' || (filters.calendarioPeriodo === 'prossime' ? item.data >= now : item.data < now)).sort(compareAppointments);
  if (!items.length) {
    list.append(el('p', 'empty', data.appuntamenti.length ? 'Nessuna data in questa sezione.' : 'Il calendario è vuoto: aggiungi la prima data con il modulo qui sopra.'));
    return;
  }
  let month = '';
  let group = null;
  for (const item of items) {
    const label = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(new Date(`${item.data}T12:00:00`));
    if (label !== month) {
      month = label;
      list.append(el('h4', 'month-title', label));
      group = el('div', 'review-list');
      list.append(group);
    }
    const card = el('article', `review-card appointment appointment-${item.tipo}${item.stato === 'prevista' ? ' pending' : ''}`);
    const head = el('div', 'review-head');
    const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${item.data}T12:00:00`));
    head.append(el('h4', '', weekday), stateTag(APPOINTMENT_STATES[item.stato], item.stato === 'confermata' ? 'assegnata' : 'ricevuta'));
    card.append(head, el('span', `type-tag type-${item.tipo}`, APPOINTMENT_TYPES[item.tipo]),
      line('Scuola', schoolNames.get(item.scuola_id) || item.scuola_id));
    if (timeRange(item)) card.append(line('Orario', timeRange(item)));
    if (item.luogo) card.append(line('Luogo', item.luogo));
    if (item.nota) card.append(line('Nota', item.nota));
    const actions = el('div', 'review-actions');
    const payload = { id: item.id, scuola_id: item.scuola_id, tipo: item.tipo, data: item.data, ora_inizio: item.ora_inizio, ora_fine: item.ora_fine, luogo: item.luogo, nota: item.nota };
    if (item.stato === 'prevista') actions.append(actionButton('Segna come confermata', 'ok', (b) => appointmentAction(b, 'save_appointment', { ...payload, stato: 'confermata' }, 'Data confermata.')));
    else actions.append(actionButton('Riporta a prevista', 'neutral', (b) => appointmentAction(b, 'save_appointment', { ...payload, stato: 'prevista' }, 'Data riportata a prevista.')));
    actions.append(actionButton('Modifica', 'neutral', () => editAppointment(item)));
    actions.append(actionButton('Togli dal calendario', 'no', (b) => {
      if (!window.confirm('Togliere questa data dal calendario?')) return;
      if (appointmentForm.elements.id.value === item.id) resetAppointmentForm();
      appointmentAction(b, 'archive_appointment', { id: item.id }, 'Data tolta dal calendario.');
    }));
    card.append(actions);
    group.append(card);
  }
}

// Calendario per la Commissione: stesso formato CSV dell’elenco per la Dirigente.
function exportCalendar() {
  if (!data) return;
  const schools = new Map(data.scuole.map((school) => [school.id, school]));
  const rows = data.appuntamenti.map((item) => [
    item.data.split('-').reverse().join('/'),
    (item.ora_inizio || '').slice(0, 5),
    (item.ora_fine || '').slice(0, 5),
    schools.get(item.scuola_id)?.comune || '',
    schools.get(item.scuola_id)?.etichetta || item.scuola_id,
    APPOINTMENT_TYPES[item.tipo],
    APPOINTMENT_STATES[item.stato],
    item.luogo || '',
    item.nota || '',
  ]);
  const cell = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [['Data', 'Dalle', 'Alle', 'Comune', 'Scuola', 'Tipo', 'Stato', 'Luogo', 'Note'], ...rows]
    .map((row) => row.map(cell).join(';')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  link.download = `calendario-orientamento-${today()}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  appointmentMessage.textContent = rows.length ? `Scaricato il calendario: ${rows.length} ${rows.length === 1 ? 'data' : 'date'}.` : 'Il calendario è vuoto.';
}

function resetActivityForm() {
  for (const name of ['id', 'nome', 'cognome', 'nota', 'titolo']) activityForm.elements[name].value = '';
  activityForm.querySelector('button[type="submit"]').textContent = 'Inserisci da verificare';
  document.getElementById('activityCancel').hidden = true;
  document.getElementById('activityDiscard').hidden = true;
  activityForm.querySelector('.activity-cancel-prompt')?.remove();
  activityForm.querySelector('.appointment-buttons').hidden = false;
}

function editActivity(item) {
  managementTools.open = true;
  document.querySelector('[data-tab="attivita"]').click();
  for (const name of ['id', 'nome', 'cognome', 'tipo', 'data', 'nota', 'titolo']) activityForm.elements[name].value = item[name] || '';
  syncActivityType();
  if (item.scuola_id) activitySchool.value = item.scuola_id;
  activityForm.querySelector('button[type="submit"]').textContent = 'Salva le modifiche';
  document.getElementById('activityCancel').hidden = false;
  document.getElementById('activityDiscard').hidden = false;
  activityForm.querySelector('.activity-cancel-prompt')?.remove();
  activityForm.querySelector('.appointment-buttons').hidden = false;
  activityMessage.textContent = 'Puoi cambiare data, scuola o docente. Dopo il salvataggio l’attività richiede di nuovo la tua conferma di svolgimento.';
  activityForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  activityForm.elements.nome.focus({ preventScroll: true });
}

function requestActivityCancellation(item, container, controls) {
  container.querySelector('.activity-cancel-prompt')?.remove();
  const prompt = el('div', 'activity-cancel-prompt');
  prompt.setAttribute('role', 'group');
  prompt.setAttribute('aria-label', 'Annullamento della registrazione');
  prompt.append(el('p', '', 'Annullare questa registrazione? Sarà tolta dalle attività da verificare e dal registro, senza confermarne lo svolgimento.'));
  const actions = el('div', 'review-actions');
  const message = el('p', 'global-message');
  message.setAttribute('role', 'status');
  const keep = actionButton('Mantieni la registrazione', 'neutral', () => {
    prompt.remove();
    controls.hidden = false;
    controls.querySelector('button').focus({preventScroll:true});
  });
  const cancel = actionButton('Sì, annulla registrazione', 'no', async () => {
    cancel.disabled = true;
    keep.disabled = true;
    message.textContent = 'Annullamento in corso…';
    try {
      await api('archive_activity', {id:item.id});
      data = {...data, attivita:data.attivita.filter(row => row.id !== item.id), da_confermare:data.da_confermare.filter(row => row.id !== item.id)};
      prompt.remove();
      controls.hidden = false;
      if (activityForm.elements.id.value === item.id) resetActivityForm();
      render();
      globalMessage.textContent = 'Registrazione annullata. Nessuna attività è stata confermata.';
      activityMessage.textContent = 'Registrazione annullata.';
      await load();
    } catch (error) {
      cancel.disabled = false;
      keep.disabled = false;
      cancel.textContent = 'Riprova ad annullare';
      handleError(error, message);
    }
  });
  actions.append(cancel, keep);
  prompt.append(actions, message);
  controls.hidden = true;
  container.append(prompt);
  prompt.scrollIntoView({block:'nearest',behavior:'instant'});
  cancel.focus({preventScroll:true});
}

function activityCard(item, schoolNames, className = 'review-card') {
  const card = el('article', className);
  card.dataset.activityId = item.id;
    card.append(el('h4', '', `${item.tipo === 'visita' ? 'Visita' : 'Mattinée'} · ${item.nome} ${item.cognome}`),
    el('small', '', `${item.data > today() ? 'In programma il' : item.stato === 'confermata' ? 'Svolta il' : 'Data indicata:'} ${formatDate(`${item.data}T12:00:00`, false)} · registrata il ${formatDate(item.created_at)}`));
  if (item.tipo === 'visita') card.append(line('Scuola', schoolNames.get(item.scuola_id) || item.scuola_id));
  if (item.titolo) card.append(line('Titolo', item.titolo));
  if (item.nota) card.append(line('Nota', item.nota));
  return card;
}

function renderPending(schoolNames) {
  const list = document.getElementById('pendingList');
  list.replaceChildren();
  if (!data.da_confermare.length) list.append(el('p', 'empty', 'Nessuna attività da verificare.'));
  for (const item of data.da_confermare) {
    const card = activityCard(item, schoolNames, 'review-card pending');
    const actions = el('div', 'review-actions');
    actions.append(actionButton('Annulla registrazione', 'no', () => requestActivityCancellation(item, card, actions)));
    actions.append(actionButton('Modifica dati o docente', 'neutral', () => editActivity(item)));
    const confirmButton = actionButton('Conferma che si è svolta', 'ok', async (button) => {
      button.disabled = true;
      globalMessage.textContent = 'Salvataggio…';
      try {
        await api('confirm_activity', { id: item.id });
        globalMessage.textContent = `Svolgimento dell’attività di ${item.nome} ${item.cognome} confermato. Ora entra nel registro e nel riepilogo.`;
        await load();
      } catch (error) {
        button.disabled = false;
        handleError(error);
      }
    });
    confirmButton.disabled = item.data > today();
    if (confirmButton.disabled) card.append(el('p', 'panel-help', 'Potrai confermare lo svolgimento dal giorno della visita.'));
    actions.append(confirmButton);
    card.append(actions);
    list.append(card);
  }
}

// Elenco per la Dirigente: CSV con separatore ";" e BOM, così Excel lo apre con accenti e colonne corrette.
function exportActivities() {
  if (!data) return;
  const schoolNames = new Map(data.scuole.map((school) => [school.id, `${school.comune} · ${school.etichetta}`]));
  // Tipo e orario arrivano dal calendario, quando c’è una data per la stessa scuola nello stesso giorno.
  const planned = (item) => item.tipo === 'visita' ? data.appuntamenti.filter((date) => date.scuola_id === item.scuola_id && date.data === item.data) : [];
  const rows = [...data.attivita]
    .filter((item) => item.data <= today())
    .sort(byTeacher)
    .map((item) => [
      item.cognome,
      item.nome,
      item.data.split('-').reverse().join('/'),
      item.tipo === 'visita' ? 'Visita' : 'Mattinée diffusa',
      item.tipo === 'visita' ? (schoolNames.get(item.scuola_id) || item.scuola_id) : (item.titolo || ''),
      planned(item).map((date) => APPOINTMENT_TYPES[date.tipo]).join(' + '),
      planned(item).map(timeRange).filter(Boolean).join(' + '),
      item.nota || '',
    ]);
  const cell = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [['Cognome', 'Nome', 'Data', 'Attività', 'Scuola o titolo', 'Tipo di orientamento', 'Orario in calendario', 'Note'], ...rows]
    .map((row) => row.map(cell).join(';')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
  link.download = `visite-orientamento-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  activityMessage.textContent = rows.length ? `Scaricato l’elenco: ${rows.length} ${rows.length === 1 ? 'attività confermata' : 'attività confermate'}.` : 'Nessuna attività confermata da scaricare.';
}

function render() {
  const schoolNames = new Map(data.scuole.map((school) => [school.id, `${school.comune} · ${school.etichetta}`]));
  renderSummary();
  renderPending(schoolNames);
  renderSupporters(schoolNames);
  renderProposals();
  renderSchools();
  renderActivities(schoolNames);
  renderAppointments(schoolNames);
}

async function load() {
  refreshButton.disabled = true;
  try {
    const result = await api('list_contributions');
    data = { ...result, attivita: result.attivita || [], da_confermare: result.da_confermare || [], appuntamenti: [...(result.appuntamenti || [])].sort(compareAppointments) };
    render();
    if (globalMessage.textContent === 'Caricamento…') globalMessage.textContent = '';
  } catch (error) {
    if (error.status !== 401 && error.status !== 403) schoolCalendar.setError(data?.scuole || []);
    handleError(error);
  } finally {
    refreshButton.disabled = false;
  }
}

async function enter() {
  const session = await api('session');
  if (session.access_level !== 'funzione_strumentale') {
    try { await api('logout'); } catch { /* sessione chiusa comunque */ }
    const error = new Error('Questa password non dà accesso alla gestione orientamento.');
    error.status = 403;
    throw error;
  }
  showWorkspace();
  openRequestedManagementSection();
  document.dispatchEvent(new CustomEvent('bussola-gestione-accesso'));
  globalMessage.textContent = 'Caricamento…';
  await load();
}

for (const tab of document.querySelectorAll('[role="tab"]')) {
  tab.addEventListener('click', () => {
    for (const other of document.querySelectorAll('[role="tab"]')) { other.setAttribute('aria-selected', String(other === tab)); other.tabIndex=other===tab?0:-1; }
    for (const panel of document.querySelectorAll('.tab-panel')) panel.hidden = panel.dataset.panel !== tab.dataset.tab;
  });
}

for (const group of document.querySelectorAll('.filters')) {
  group.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    for (const other of group.querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === button));
    filters[group.dataset.filterFor] = button.dataset.filter;
    if (!data) return;
    const schoolNames = new Map(data.scuole.map((s) => [s.id, `${s.comune} · ${s.etichetta}`]));
    if (group.dataset.filterFor === 'candidature') renderSupporters(schoolNames);
    else if (group.dataset.filterFor === 'proposte') renderProposals();
    else renderAppointments(schoolNames);
  });
}

function syncActivityType() {
  const isVisit = activityType.value === 'visita';
  document.getElementById('activitySchoolField').hidden = !isVisit;
  document.getElementById('activityTitleField').hidden = isVisit;
  activitySchool.required = isVisit;
}
activityType.addEventListener('change', syncActivityType);
activityForm.elements.data.value = new Date().toISOString().slice(0, 10);
syncActivityType();

activityForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!activityForm.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(activityForm).entries());
  if (payload.tipo !== 'visita') delete payload.scuola_id;
  const editing = Boolean(payload.id);
  if (!editing) delete payload.id;
  const button = activityForm.querySelector('button[type="submit"]');
  button.disabled = true;
  activityMessage.textContent = 'Registrazione in corso…';
  try {
    await api(editing ? 'update_activity' : 'register_activity', payload);
    activityMessage.textContent = `Attività ${editing ? 'aggiornata' : 'inserita'} per ${payload.nome} ${payload.cognome}. La trovi in «Da verificare»: solo la tua conferma di svolgimento la farà entrare nel registro.`;
    resetActivityForm();
    await load();
  } catch (error) {
    handleError(error, activityMessage);
  } finally {
    button.disabled = false;
  }
});

appointmentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!appointmentForm.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(appointmentForm).entries());
  if (payload.ora_inizio && payload.ora_fine && payload.ora_fine <= payload.ora_inizio) {
    appointmentMessage.textContent = 'L’orario di fine deve seguire quello di inizio.';
    return;
  }
  const editing = Boolean(payload.id);
  appointmentSubmit.disabled = true;
  appointmentMessage.textContent = 'Salvataggio…';
  try {
    await api('save_appointment', payload);
    appointmentMessage.textContent = editing ? 'Data aggiornata.' : `Data aggiunta: ${payload.data.split('-').reverse().join('/')}.`;
    resetAppointmentForm();
    await load();
  } catch (error) {
    handleError(error, appointmentMessage);
  } finally {
    appointmentSubmit.disabled = false;
  }
});
appointmentCancel.addEventListener('click', () => { resetAppointmentForm(); appointmentMessage.textContent = ''; });
document.getElementById('exportCalendarButton').addEventListener('click', exportCalendar);

passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = passwordForm.querySelector('button');
  submitButton.disabled = true;
  accessMessage.textContent = 'Verifica in corso…';
  try {
    const result = await api('login', { password: passwordInput.value });
    sessionToken = result.token;
    sessionStorage.setItem(SESSION_KEY, sessionToken);
    passwordInput.value = '';
    accessMessage.textContent = '';
    await enter();
  } catch (error) {
    resetSession();
    accessMessage.textContent = error.message;
    passwordInput.select();
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById('activityCancel').addEventListener('click', () => { resetActivityForm(); activityMessage.textContent = ''; });
document.getElementById('activityDiscard').addEventListener('click', () => {
  const item = [...data.attivita, ...data.da_confermare].find(row => row.id === activityForm.elements.id.value);
  if (item) requestActivityCancellation(item, activityForm, activityForm.querySelector('.appointment-buttons'));
});
refreshButton.addEventListener('click', load);
document.getElementById('exportButton').addEventListener('click', exportActivities);
document.getElementById('logoutButton').addEventListener('click', async () => {
  try { await api('logout'); } catch { /* la sessione locale viene chiusa comunque */ }
  resetSession();
  passwordInput.focus();
});

if (sessionToken) enter().catch(() => resetSession());

document.addEventListener('bussola-gestione-scaduta', resetSession);

for(const [i,tab] of [...document.querySelectorAll('[role="tab"]')].entries()){
 tab.id='gestione-tab-'+tab.dataset.tab;tab.tabIndex=tab.getAttribute('aria-selected')==='true'?0:-1;
 const panel=document.querySelector('[data-panel="'+tab.dataset.tab+'"]');if(panel){panel.id='gestione-panel-'+tab.dataset.tab;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);tab.setAttribute('aria-controls',panel.id);}
 tab.addEventListener('keydown',event=>{const tabs=[...document.querySelectorAll('[role="tab"]')];const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(i+1)%tabs.length:event.key==='ArrowLeft'?(i-1+tabs.length)%tabs.length:null;if(index!==null){event.preventDefault();tabs[index].click();tabs[index].focus();}});
}

// L’accesso diventa attivo solo dopo il collegamento dei gestori del modulo.
window.addEventListener('hashchange', openRequestedManagementSection);
openRequestedManagementSection();
passwordForm.querySelector('button[type="submit"]').disabled = false;
}
