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
const SUPPORTER_STATES = { ricevuta: 'Da contattare', assegnata: 'Confermata', archiviata: 'Archiviata' };
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

function resetSession() {
  sessionToken = '';
  data = null;
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
  const visited = new Set(data.attivita.filter((item) => item.tipo === 'visita').map((item) => item.scuola_id));
  const upcoming = data.appuntamenti.filter((item) => item.data >= today());
  const toConfirm = upcoming.filter((item) => item.stato === 'prevista').length;
  document.getElementById('countCalendario').textContent = toConfirm ? String(toConfirm) : '';
  for (const [value, label, hot] of [
    [pendingActivities, 'visite da confermare', pendingActivities > 0],
    [pendingSupporters, 'disponibilità da contattare', pendingSupporters > 0],
    [pendingProposals, 'proposte da valutare', pendingProposals > 0],
    [`${visited.size}/${data.scuole.length}`, 'scuole visitate', false],
    [upcoming.length, 'date in arrivo', false],
    [data.attivita.length, 'attività confermate', false],
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
    const chips = el('div', 'chips');
    for (const id of item.scuole) chips.append(el('span', '', schoolNames.get(id) || id));
    card.append(chips);
    if (item.nota) card.append(line('Nota', item.nota));
    const actions = el('div', 'review-actions');
    if (item.stato !== 'assegnata') actions.append(actionButton('Conferma disponibilità', 'ok', (b) => setState('supporter', item, 'assegnata', b)));
    if (item.stato !== 'archiviata') actions.append(actionButton('Archivia', 'no', (b) => setState('supporter', item, 'archiviata', b)));
    if (item.stato !== 'ricevuta') actions.append(actionButton('Riporta tra quelle da contattare', 'neutral', (b) => setState('supporter', item, 'ricevuta', b)));
    card.append(actions);
    list.append(card);
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
  const board = document.getElementById('schoolBoard');
  board.replaceChildren();
  for (const school of data.scuole) {
    const candidates = data.disponibilita.filter((item) => item.stato !== 'archiviata' && item.scuole.includes(school.id));
    const visits = data.attivita.filter((item) => item.tipo === 'visita' && item.scuola_id === school.id);
    const accepted = candidates.filter((item) => item.stato === 'assegnata');
    const card = el('article', `school-card ${visits.length ? 'visited' : accepted.length ? 'accepted' : candidates.length ? 'offered' : ''}`);
    card.append(el('h4', '', school.comune), el('small', '', school.etichetta));
    const status = visits.length ? `Visita svolta (${visits.length})` : accepted.length ? 'Disponibilità confermata' : candidates.length ? 'Disponibilità da contattare' : 'Nessuna disponibilità';
    card.append(el('p', 'school-status', status));
    const names = el('ul');
    for (const item of candidates) names.append(el('li', item.stato === 'assegnata' ? 'accepted' : '', `${item.nome} ${item.cognome}${item.stato === 'assegnata' ? ' ✓' : ''}`));
    if (candidates.length) card.append(names);
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
      list.append(el('h4', 'month-title teacher-title', `${item.cognome} ${item.nome} · ${count} ${count === 1 ? 'attività' : 'attività svolte'}`));
      group = el('div', 'review-list');
      list.append(group);
    }
    const card = activityCard(item, schoolNames);
    const actions = el('div', 'review-actions');
    actions.append(actionButton('Annulla registrazione', 'no', async (button) => {
      if (!window.confirm('Annullare questa registrazione? Non comparirà più nell’elenco delle attività confermate.')) return;
      button.disabled = true;
      try {
        await api('archive_activity', { id: item.id });
        activityMessage.textContent = 'Registrazione annullata.';
        await load();
      } catch (error) {
        button.disabled = false;
        handleError(error, activityMessage);
      }
    }));
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
    filters.calendarioPeriodo === 'tutte' || (filters.calendarioPeriodo === 'prossime' ? item.data >= now : item.data < now));
  if (filters.calendarioPeriodo === 'passate') items.reverse();
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

function activityCard(item, schoolNames, className = 'review-card') {
  const card = el('article', className);
    card.append(el('h4', '', `${item.tipo === 'visita' ? 'Visita' : 'Mattinée'} · ${item.nome} ${item.cognome}`),
    el('small', '', `Svolta il ${formatDate(`${item.data}T12:00:00`, false)} · registrata il ${formatDate(item.created_at)}`));
  if (item.tipo === 'visita') card.append(line('Scuola', schoolNames.get(item.scuola_id) || item.scuola_id));
  if (item.titolo) card.append(line('Titolo', item.titolo));
  if (item.nota) card.append(line('Nota', item.nota));
  return card;
}

function renderPending(schoolNames) {
  const list = document.getElementById('pendingList');
  list.replaceChildren();
  if (!data.da_confermare.length) list.append(el('p', 'empty', 'Nessuna visita da confermare.'));
  for (const item of data.da_confermare) {
    const card = activityCard(item, schoolNames, 'review-card pending');
    const actions = el('div', 'review-actions');
    actions.append(actionButton('Conferma attività', 'ok', async (button) => {
      button.disabled = true;
      globalMessage.textContent = 'Salvataggio…';
      try {
        await api('confirm_activity', { id: item.id });
        globalMessage.textContent = `Attività di ${item.nome} ${item.cognome} confermata.`;
        await load();
      } catch (error) {
        button.disabled = false;
        handleError(error);
      }
    }));
    actions.append(actionButton('Scarta registrazione', 'no', async (button) => {
      if (!window.confirm('Scartare questa registrazione? Non comparirà nell’elenco delle attività confermate.')) return;
      button.disabled = true;
      try {
        await api('archive_activity', { id: item.id });
        globalMessage.textContent = 'Registrazione scartata.';
        await load();
      } catch (error) {
        button.disabled = false;
        handleError(error);
      }
    }));
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
    data = { ...result, attivita: result.attivita || [], da_confermare: result.da_confermare || [], appuntamenti: result.appuntamenti || [] };
    render();
    if (globalMessage.textContent === 'Caricamento…') globalMessage.textContent = '';
  } catch (error) {
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
  const button = activityForm.querySelector('button[type="submit"]');
  button.disabled = true;
  activityMessage.textContent = 'Registrazione in corso…';
  try {
    await api('register_activity', payload);
    activityMessage.textContent = `Attività registrata per ${payload.nome} ${payload.cognome}.`;
    for (const name of ['nome', 'cognome', 'nota', 'titolo']) activityForm.elements[name].value = '';
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
