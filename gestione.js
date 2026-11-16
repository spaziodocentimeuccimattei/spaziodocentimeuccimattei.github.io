import {compareAppointments,italyToday as today} from './scuole-calendario.mjs?v=20261116-agenda';
const managementParams=new URLSearchParams(location.search);
if(location.hash==='#bussola'&&managementParams.get('strumenti')!=='bussola'){
  const destination=new URL('bussola-docenti.html',location.href);
  for(const key of ['corso','prova'])if(managementParams.has(key))destination.searchParams.set(key,managementParams.get(key));
  location.replace(destination.href);
}else{
// Prova in locale con dati finti: http://localhost:…/gestione.html?prova (nessuna chiamata al servizio vero).
const testing = ['localhost', '127.0.0.1'].includes(location.hostname) && managementParams.has('prova');
if (testing) document.body.dataset.bussolaTest = 'true';
const API_URL = testing ? '/__test/orientamento' : 'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/orientamento';
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
let activityDraftDirty = false;
let appointmentDraftDirty = false;
const filters = { candidature: 'ricevuta', proposte: 'aperte' };
const appointmentForm = document.getElementById('appointmentForm');
const appointmentSchool = document.getElementById('appointmentSchool');
const appointmentMessage = document.getElementById('appointmentMessage');
const appointmentSubmit = document.getElementById('appointmentSubmit');
const appointmentCancel = document.getElementById('appointmentCancel');
const appointmentOptions = document.getElementById('appointmentOptions');
const appointmentArchive = document.getElementById('archiveAppointment');
const appointmentTitle = document.getElementById('appointmentTitle');
const activityEditor = document.getElementById('activityEditor');
const activityEditorTitle = document.getElementById('activityEditorTitle');

function openCalendarForm(school, item) {
  showSection('calendario', {scroll:false});
  if (appointmentDraftDirty) {
    appointmentMessage.textContent = 'Hai una data non ancora salvata. Salvala oppure annulla la bozza prima di aprire un altro appuntamento.';
    appointmentCancel.hidden = false;
    appointmentCancel.textContent = 'Annulla la bozza';
    appointmentForm.scrollIntoView({block:'start',behavior:'instant'});
    return;
  }
  if (item) editAppointment(item);
  else {
    resetAppointmentForm();
    if (school) appointmentSchool.value = school.id;
    appointmentMessage.textContent = '';
    appointmentForm.scrollIntoView({block:'start',behavior:'instant'});
    appointmentForm.elements.data.focus({preventScroll:true});
  }
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

// Ogni sezione ha il suo indirizzo, così si può tenere nei preferiti (#bussola resta quello storico).
const SECTION_HASHES = { panoramica: 'calendario-scuole', calendario: 'date', confermare: 'da-verificare', candidature: 'disponibilita', proposte: 'mattinee', scuole: 'scuole-visite', attivita: 'registro', bussola: 'classi-bussola', excel: 'excel' };
function sectionFromHash() {
  const hash = location.hash.slice(1);
  if (hash === 'bussola') return 'bussola';
  return Object.keys(SECTION_HASHES).find((key) => SECTION_HASHES[key] === hash) || '';
}

function showSection(key, { focus = false, scroll = true } = {}) {
  const selected = document.querySelector(`[data-panel="${key}"]`);
  if (!selected) return;
  for (const panel of document.querySelectorAll('.tab-panel')) panel.hidden = panel !== selected;
  for (const button of document.querySelectorAll('[data-tab]')) {
    if (button.dataset.tab === key || (key === 'calendario' && button.dataset.tab === 'panoramica')) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
  document.getElementById('otherTools').open = false;
  if (!workspacePanel.hidden) history.replaceState(null, '', `#${SECTION_HASHES[key]}`);
  if (focus) selected.focus({preventScroll:true});
  if (scroll) selected.scrollIntoView({block:'start',behavior:'instant'});
}

function openRequestedManagementSection() {
  const key = sectionFromHash();
  if (!key) return;
  if (!loginPanel.hidden) {
    if (key === 'bussola') document.getElementById('access-title').textContent = 'Accedi per creare il codice della classe';
    return;
  }
  showSection(key, { focus: true });
}

function resetSession() {
  sessionToken = '';
  data = null;
  renderAgenda(new Map());
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

function renderCounts() {
  const now = today();
  const pendingActivities = data.da_confermare.filter(item => item.data <= now).length;
  const visited = new Set(data.attivita.filter((item) => item.tipo === 'visita' && item.data <= now).map((item) => item.scuola_id));
  const count = document.getElementById('countConfermare');
  count.hidden = pendingActivities === 0;
  count.textContent = pendingActivities ? String(pendingActivities) : '';
  document.getElementById('schoolProgress').textContent = `${visited.size} di ${data.scuole.length} scuole raggiunte`;
}

function schoolLabel(id) {
  const school = data?.scuole.find((item) => item.id === id);
  return school ? `${school.comune} · ${school.etichetta}` : id;
}

// Chi invia senza password non può più correggere: la Funzione Strumentale corregge tutto dalla scheda (9/11/2026).
// Stato, codice e data di invio non cambiano; la nota resta visibile solo qui.
function editorField(label, name, value, {type = 'text', min, max, required = true, multiline = false, wide = false, hint = '', options = null, optional = 'facoltativo'} = {}) {
  const field = el('label', wide ? 'submission-wide' : '');
  const title = el('span', 'editor-label', label);
  if (!required) title.append(el('span', '', ` ${optional}`));
  field.append(title);
  let input;
  if (options) {
    input = document.createElement('select');
    for (const [key, text] of options) { const option = el('option', '', text); option.value = key; input.append(option); }
  } else if (multiline) {
    input = document.createElement('textarea');
    input.rows = 4;
  } else {
    input = document.createElement('input');
    input.type = type;
  }
  input.name = name;
  input.value = value ?? '';
  input.required = required;
  if (type === 'number') { if (min !== undefined) input.min = String(min); if (max !== undefined) input.max = String(max); }
  else { if (min) input.minLength = min; if (max) input.maxLength = max; }
  field.append(input);
  if (hint) field.append(el('small', '', hint));
  return field;
}

function openSubmissionEditor(card, item, kind) {
  const original = [...card.childNodes];
  const form = el('form', 'activity-form submission-editor');
  const message = el('p', 'global-message submission-wide');
  message.setAttribute('role', 'status');
  form.append(el('h4', 'submission-wide', kind === 'supporter' ? `Modifica la disponibilità di ${item.nome} ${item.cognome}` : `Modifica la proposta «${item.titolo}»`));
  form.append(editorField('Nome', 'nome', item.nome, {min: 2, max: 80}), editorField('Cognome', 'cognome', item.cognome, {min: 2, max: 80}));
  if (kind === 'supporter') {
    const box = el('fieldset', 'submission-wide submission-schools');
    box.append(el('legend', '', 'Scuole (da una a cinque)'));
    for (const school of data.scuole) {
      const option = el('label', 'submission-school');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'scuole';
      input.value = school.id;
      input.checked = item.scuole.includes(school.id);
      option.append(input, document.createTextNode(` ${school.comune} · ${school.etichetta}`));
      box.append(option);
    }
    box.addEventListener('change', (event) => {
      if (box.querySelectorAll('input:checked').length > 5) { event.target.checked = false; message.textContent = 'Al massimo cinque scuole.'; }
    });
    form.append(box);
  } else {
    form.append(
      editorField('Titolo', 'titolo', item.titolo, {min: 3, max: 160, wide: true}),
      editorField('Indirizzo o area', 'area', item.area, {min: 2, max: 120}),
      editorField('Tipologia', 'tipologia', item.tipologia, {options: Object.entries(PROPOSAL_TYPES)}),
      editorField('Durata', 'durata_minuti', String(item.durata_minuti), {options: [30, 45, 60, 90].map((n) => [String(n), `${n} minuti`])}),
      editorField('Partecipanti indicativi', 'partecipanti', item.partecipanti ?? '', {type: 'number', min: 1, max: 200, required: false}),
      editorField('Che cosa fanno i ragazzi', 'descrizione', item.descrizione, {min: 10, max: 1200, multiline: true, wide: true}),
      editorField('Spazi e attrezzature', 'esigenze', item.esigenze, {max: 600, multiline: true, required: false, wide: true, optional: 'facoltativi'}));
  }
  form.append(editorField('Nota', 'nota', item.nota, {max: 600, multiline: true, required: false, wide: true, optional: 'facoltativa',
    hint: 'Visibile solo nella Gestione: non compare nella pagina dei docenti. Massimo 600 caratteri.'}));
  const buttons = el('div', 'submission-wide editor-buttons');
  const save = el('button', 'act ok', 'Salva le modifiche');
  save.type = 'submit';
  const cancel = el('button', 'act neutral', 'Annulla');
  cancel.type = 'button';
  buttons.append(save, cancel);
  form.append(buttons, message);
  form.addEventListener('input', () => { form.dataset.dirty = 'true'; });
  form.addEventListener('change', () => { form.dataset.dirty = 'true'; });
  cancel.addEventListener('click', () => { card.replaceChildren(...original); card.querySelector('.act.edit')?.focus({preventScroll: true}); });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = {...values, id: item.id};
    if (kind === 'supporter') {
      payload.scuole = [...form.querySelectorAll('input[name="scuole"]:checked')].map((input) => input.value);
      if (payload.scuole.length < 1 || payload.scuole.length > 5) { message.textContent = 'Scegli da una a cinque scuole.'; return; }
    } else {
      payload.durata_minuti = Number(values.durata_minuti);
      payload.partecipanti = values.partecipanti ? Number(values.partecipanti) : null;
    }
    const renamed = personKey(payload) !== personKey(item);
    const linked = renamed && [...data.attivita, ...data.da_confermare].some((visit) => personKey(visit) === personKey(item));
    save.disabled = true;
    cancel.disabled = true;
    message.textContent = 'Salvataggio…';
    try {
      await api(kind === 'supporter' ? 'edit_supporter' : 'edit_proposal', payload);
      delete form.dataset.dirty;
      globalMessage.textContent = `Modifiche salvate per ${payload.nome} ${payload.cognome}.${linked ? ` Le attività già registrate a nome di ${item.nome} ${item.cognome} restano con il nome di prima: correggile in «Registro».` : ''}`;
      await load();
    } catch (error) {
      save.disabled = false;
      cancel.disabled = false;
      handleError(error, message);
    }
  });
  card.replaceChildren(form);
  form.elements.nome.focus({preventScroll: true});
  form.scrollIntoView({block: 'nearest', behavior: 'instant'});
}

function unsavedEditor() {
  return document.querySelector('.submission-editor[data-dirty]');
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
    actions.append(actionButton(item.nota ? 'Modifica' : 'Modifica o aggiungi una nota', 'neutral edit', () => openSubmissionEditor(card, item, 'supporter')));
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
    actions.append(actionButton(item.nota ? 'Modifica' : 'Modifica o aggiungi una nota', 'neutral edit', () => openSubmissionEditor(card, item, 'proposta')));
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
    actions.append(registrationOptions(item, card, actions));
    card.append(actions);
    group.append(card);
  }
}

function resetAppointmentForm() {
  appointmentDraftDirty = false;
  const school = appointmentSchool.value;
  appointmentForm.reset();
  appointmentForm.elements.id.value = '';
  appointmentSchool.value = school;
  appointmentSubmit.textContent = 'Aggiungi la data';
  appointmentCancel.hidden = true;
  appointmentCancel.textContent = 'Annulla';
  appointmentTitle.textContent = 'Aggiungi data';
  appointmentOptions.open = false;
  appointmentOptions.hidden = true;
}

function editAppointment(item) {
  for (const name of ['id', 'scuola_id', 'tipo', 'data', 'stato', 'luogo', 'nota']) appointmentForm.elements[name].value = item[name] || '';
  appointmentForm.elements.ora_inizio.value = (item.ora_inizio || '').slice(0, 5);
  appointmentForm.elements.ora_fine.value = (item.ora_fine || '').slice(0, 5);
  appointmentSubmit.textContent = 'Salva le modifiche';
  appointmentCancel.hidden = false;
  appointmentTitle.textContent = 'Modifica data';
  appointmentOptions.open = false;
  appointmentOptions.hidden = false;
  appointmentMessage.textContent = '';
  appointmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  appointmentForm.elements.data.focus({ preventScroll: true });
}

function renderAppointmentSchools() {
  const current = appointmentSchool.value;
  appointmentSchool.replaceChildren();
  for (const school of data.scuole) {
    const option = el('option', '', `${school.comune} · ${school.etichetta}`);
    option.value = school.id;
    appointmentSchool.append(option);
  }
  if (current) appointmentSchool.value = current;
}

function renderAgenda(schoolNames) {
  const upcoming = document.getElementById('upcomingAppointments');
  const past = document.getElementById('pastAppointments');
  const undated = document.getElementById('undatedSchools');
  const historyList = past.querySelector('ul');
  const undatedList = undated.querySelector('ul');
  const message = document.getElementById('agendaMessage');
  document.getElementById('addAppointment').disabled = !data;
  upcoming.replaceChildren();
  historyList.replaceChildren();
  undatedList.replaceChildren();
  const now = today();
  const dated = new Set();
  for (const item of data?.appuntamenti || []) {
    const label = schoolNames.get(item.scuola_id) || item.scuola_id;
    const date = el('time', '', formatDate(`${item.data}T12:00:00`, false));
    date.dateTime = item.data;
    const when = el('div', 'agenda-when');
    when.append(date);
    if (timeRange(item)) when.append(el('span', '', timeRange(item)));
    const details = el('div', 'agenda-copy');
    details.append(el('strong', '', label));
    details.append(el('span', '', [APPOINTMENT_TYPES[item.tipo], item.luogo].filter(Boolean).join(' · ')));
    if (item.stato !== 'confermata') details.append(el('span', 'agenda-pending', 'Data da concordare'));
    const edit = actionButton('Modifica', 'agenda-edit', () => openCalendarForm(null, item));
    edit.setAttribute('aria-label', `Modifica la data di ${label} del ${date.textContent}`);
    const row = el('li');
    row.dataset.school = item.scuola_id;
    row.append(when, details, edit);
    if (item.data >= now) {
      upcoming.append(row);
      dated.add(item.scuola_id);
    } else historyList.append(row);
  }
  for (const school of data?.scuole || []) {
    if (!dated.has(school.id)) {
      const row = el('li', '', schoolNames.get(school.id));
      row.dataset.school = school.id;
      undatedList.append(row);
    }
  }
  past.hidden = !historyList.children.length;
  undated.hidden = !undatedList.children.length;
  past.querySelector('.manage-disclosure-count').textContent = String(historyList.children.length);
  message.textContent = data && !upcoming.children.length ? 'Nessuna visita in programma.' : '';
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
  document.getElementById('excelMessage').textContent = rows.length ? `Scaricato il calendario: ${rows.length} ${rows.length === 1 ? 'data' : 'date'}.` : 'Il calendario è vuoto.';
}

function resetActivityForm() {
  activityDraftDirty = false;
  activityEditorTitle.textContent = 'Registra un’attività';
  for (const name of ['id', 'nome', 'cognome', 'nota', 'titolo']) activityForm.elements[name].value = '';
  activityForm.querySelector('button[type="submit"]').textContent = 'Inserisci da verificare';
  document.getElementById('activityCancel').hidden = true;
  document.getElementById('activityDiscard').hidden = true;
  activityForm.querySelector('.activity-cancel-prompt')?.remove();
  activityForm.querySelector('.appointment-buttons').hidden = false;
}

function editActivity(item) {
  showSection('attivita', {scroll:false});
  activityEditor.open = true;
  if (activityDraftDirty) {
    document.getElementById('activityCancel').hidden = false;
    activityMessage.textContent = 'Salva o annulla la registrazione in corso.';
    activityForm.scrollIntoView({block:'start',behavior:'instant'});
    return;
  }
  activityEditorTitle.textContent = 'Modifica registrazione';
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

function prepareVisitRegistration(item) {
  showSection('attivita', {scroll:false});
  activityEditor.open = true;
  activityForm.scrollIntoView({behavior:'instant', block:'start'});
  if (activityDraftDirty || activityForm.elements.id.value) {
    document.getElementById('activityCancel').hidden = false;
    activityMessage.textContent = 'Salva o annulla la registrazione in corso prima di aprire un’altra visita.';
    return;
  }
  resetActivityForm();
  activityType.value = 'visita';
  syncActivityType();
  activitySchool.value = item.scuola_id;
  activityForm.elements.data.value = item.data;
  document.getElementById('activityCancel').hidden = false;
  activityMessage.textContent = 'Completa il modulo con il docente che ha svolto la visita.';
  activityForm.elements.nome.focus({preventScroll:true});
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

function registrationOptions(item, card, actions) {
  const options = el('details', 'registration-options');
  options.append(el('summary', '', 'Altre azioni'));
  const secondary = el('div', 'review-actions');
  secondary.append(
    actionButton('Modifica registrazione', 'neutral', () => editActivity(item)),
    actionButton('Annulla registrazione', 'no', () => requestActivityCancellation(item, card, actions)),
  );
  options.append(secondary);
  return options;
}

function renderPending(schoolNames) {
  const list = document.getElementById('pendingList');
  const future = document.getElementById('futureActivities');
  const futureList = future.querySelector('.review-list');
  list.replaceChildren();
  futureList.replaceChildren();
  const now = today();
  const ordered = [...data.da_confermare].sort((a, b) => a.data.localeCompare(b.data));
  for (const item of ordered) {
    const card = activityCard(item, schoolNames, 'review-card pending');
    const actions = el('div', 'review-actions');
    const canConfirm = item.data <= now;
    if (canConfirm) {
      actions.append(actionButton('Conferma svolgimento', 'ok', async (button) => {
        button.disabled = true;
        globalMessage.textContent = 'Salvataggio…';
        try {
          await api('confirm_activity', { id: item.id });
          globalMessage.textContent = 'Attività confermata e aggiunta al registro.';
          await load();
        } catch (error) {
          button.disabled = false;
          handleError(error);
        }
      }));
    }
    actions.append(registrationOptions(item, card, actions));
    card.append(actions);
    (canConfirm ? list : futureList).append(card);
  }
  if (!list.children.length) list.append(el('p', 'empty', 'Nessuna attività da verificare.'));
  future.hidden = !futureList.children.length;
  future.querySelector('.manage-disclosure-count').textContent = String(futureList.children.length);

  const unregistered = document.getElementById('unregisteredVisits');
  const missingList = unregistered.querySelector('ul');
  missingList.replaceChildren();
  const key = item => `${item.scuola_id}/${item.data}`;
  const datesWithVisit = new Set([...data.attivita, ...data.da_confermare].filter(item => item.tipo === 'visita').map(key));
  for (const item of data.appuntamenti) {
    if (item.data >= now || datesWithVisit.has(key(item))) continue;
    datesWithVisit.add(key(item));
    const row = el('li');
    const copy = el('div');
    copy.append(el('strong', '', schoolNames.get(item.scuola_id) || item.scuola_id), el('span', '', formatDate(`${item.data}T12:00:00`, false)));
    row.append(copy, actionButton('Apri il modulo', 'neutral', () => prepareVisitRegistration(item)));
    missingList.append(row);
  }
  unregistered.hidden = !missingList.children.length;
  unregistered.querySelector('.manage-disclosure-count').textContent = String(missingList.children.length);
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
  document.getElementById('excelMessage').textContent = rows.length ? `Scaricato l’elenco: ${rows.length} ${rows.length === 1 ? 'attività confermata' : 'attività confermate'}.` : 'Nessuna attività confermata da scaricare.';
}

// File Excel: le stesse informazioni della pagina, note interne comprese, con righe colorate per stato.
const romeDay = (value) => value ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date(value)) : '';
const shortDate = (value) => value.split('-').reverse().join('/');
const weekday = (value) => new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(new Date(`${value}T12:00:00`));

function assignedTeachers(date) {
  return [...data.attivita, ...data.da_confermare]
    .filter((item) => item.tipo === 'visita' && item.scuola_id === date.scuola_id && item.data === date.data)
    .map((item) => `${item.cognome} ${item.nome} (${item.stato === 'confermata' ? 'svolta' : 'da confermare'})`).join(', ');
}

function datesSheet() {
  const now = today();
  const schools = new Map(data.scuole.map((school) => [school.id, school]));
  return { name: 'Date', title: `Calendario dell’orientamento · aggiornato al ${shortDate(now)}`,
    columns: [{ header: 'Data', type: 'date', width: 12 }, { header: 'Giorno', width: 11 }, { header: 'Dalle', width: 8 }, { header: 'Alle', width: 8 }, { header: 'Comune', width: 16 }, { header: 'Scuola', width: 24 }, { header: 'Tipo', width: 24 }, { header: 'Stato', width: 26 }, { header: 'Luogo', width: 24 }, { header: 'Nota interna', width: 40 }, { header: 'Docenti assegnati', width: 34 }, { header: 'Quando', width: 11 }],
    rows: [...data.appuntamenti].sort(compareAppointments).map((item) => ({
      tone: item.data < now ? 'grey' : item.stato === 'confermata' ? 'green' : 'amber',
      cells: [item.data, weekday(item.data), (item.ora_inizio || '').slice(0, 5), (item.ora_fine || '').slice(0, 5), schools.get(item.scuola_id)?.comune || '', schools.get(item.scuola_id)?.etichetta || item.scuola_id, APPOINTMENT_TYPES[item.tipo] || item.tipo, item.stato === 'confermata' ? 'Definita con la scuola' : 'Da confermare con la scuola', item.luogo || '', item.nota || '', assignedTeachers(item), item.data < now ? 'Passata' : 'In arrivo'],
    })) };
}

function schoolsSheet() {
  const now = today();
  return { name: 'Scuole', title: `Le ${data.scuole.length} scuole e la loro situazione`,
    columns: [{ header: 'Comune', width: 16 }, { header: 'Scuola', width: 24 }, { header: 'Situazione', width: 26 }, { header: 'Prossima data', type: 'date', width: 13 }, { header: 'Orario', width: 12 }, { header: 'Date in arrivo', width: 40 }, { header: 'Date passate', width: 28 }, { header: 'Docenti disponibili', width: 34 }, { header: 'Visite confermate', type: 'number', width: 12 }],
    rows: data.scuole.map((school) => {
      const dates = data.appuntamenti.filter((item) => item.scuola_id === school.id).sort(compareAppointments);
      const upcoming = dates.filter((item) => item.data >= now);
      const defined = upcoming.some((item) => item.stato === 'confermata');
      const describe = (item) => `${shortDate(item.data)}${timeRange(item) ? ` ${timeRange(item)}` : ''} (${item.stato === 'confermata' ? 'definita' : 'da confermare'})`;
      return { tone: defined ? 'green' : upcoming.length ? 'amber' : 'grey', cells: [school.comune, school.etichetta,
        defined ? 'Data definita' : upcoming.length ? 'Da confermare con la scuola' : 'Senza data in arrivo',
        upcoming[0]?.data || '', upcoming[0] ? timeRange(upcoming[0]) : '', upcoming.map(describe).join('; '), dates.filter((item) => item.data < now).map(describe).join('; '),
        data.disponibilita.filter((item) => item.stato !== 'archiviata' && item.scuole.includes(school.id)).map((item) => `${item.cognome} ${item.nome}`).join(', '),
        data.attivita.filter((item) => item.tipo === 'visita' && item.scuola_id === school.id && item.data <= now).length] };
    }) };
}

function activitiesSheet(items, name, title, tone) {
  const planned = (item) => item.tipo === 'visita' ? data.appuntamenti.filter((date) => date.scuola_id === item.scuola_id && date.data === item.data) : [];
  return { name, title,
    columns: [{ header: 'Cognome', width: 16 }, { header: 'Nome', width: 14 }, { header: 'Data', type: 'date', width: 12 }, { header: 'Attività', width: 16 }, { header: 'Scuola o titolo', width: 32 }, { header: 'Tipo di orientamento', width: 24 }, { header: 'Orario in calendario', width: 16 }, { header: 'Note', width: 36 }, { header: 'Registrata il', type: 'date', width: 13 }],
    rows: [...items].sort(byTeacher).map((item) => ({ tone, cells: [item.cognome, item.nome, item.data, item.tipo === 'visita' ? 'Visita' : 'Mattinée diffusa',
      item.tipo === 'visita' ? schoolLabel(item.scuola_id) : (item.titolo || ''), planned(item).map((date) => APPOINTMENT_TYPES[date.tipo]).join(' + '), planned(item).map(timeRange).filter(Boolean).join(' + '), item.nota || '', romeDay(item.created_at)] })) };
}

function dirigenteSheet() {
  return activitiesSheet(data.attivita.filter((item) => item.data <= today()), 'Elenco per la Dirigente', `Attività di orientamento confermate fino al ${shortDate(today())}`, 'green');
}

function supportersSheet() {
  return { name: 'Disponibilità', title: 'Disponibilità dei docenti',
    columns: [{ header: 'Cognome', width: 16 }, { header: 'Nome', width: 14 }, { header: 'Stato', width: 14 }, { header: 'Scuole indicate', width: 50 }, { header: 'Nota', width: 36 }, { header: 'Ricevuta il', type: 'date', width: 13 }],
    rows: data.disponibilita.map((item) => ({ tone: item.stato === 'assegnata' ? 'green' : item.stato === 'archiviata' ? 'grey' : 'blue',
      cells: [item.cognome, item.nome, SUPPORTER_STATES[item.stato] || item.stato, item.scuole.map(schoolLabel).join('; '), item.nota || '', romeDay(item.created_at)] })) };
}

function proposalsSheet() {
  return { name: 'Mattinée', title: 'Proposte di Mattinée',
    columns: [{ header: 'Titolo', width: 30 }, { header: 'Docente', width: 22 }, { header: 'Area', width: 18 }, { header: 'Tipologia', width: 18 }, { header: 'Durata (minuti)', type: 'number', width: 10 }, { header: 'Partecipanti', type: 'number', width: 11 }, { header: 'Che cosa fanno i ragazzi', width: 50 }, { header: 'Spazi e attrezzature', width: 30 }, { header: 'Note', width: 30 }, { header: 'Stato', width: 14 }, { header: 'Ricevuta il', type: 'date', width: 13 }],
    rows: data.proposte.map((item) => ({ tone: item.stato === 'approvata' ? 'green' : item.stato === 'archiviata' ? 'grey' : 'violet',
      cells: [item.titolo, `${item.cognome} ${item.nome}`, item.area, PROPOSAL_TYPES[item.tipologia] || item.tipologia, item.durata_minuti, item.partecipanti ?? '', item.descrizione, item.esigenze || '', item.nota || '', PROPOSAL_STATES[item.stato] || item.stato, romeDay(item.created_at)] })) };
}

// Il modulo Excel si carica solo quando serve.
async function exportExcel(kind, target) {
  if (!data) { target.textContent = 'Carica prima i dati con «Aggiorna dati».'; return; }
  try {
    const { downloadWorkbook } = await import('./gestione-excel.mjs?v=20261115-riordino');
    const files = {
      calendario: [[datesSheet(), schoolsSheet()], `calendario-orientamento-${today()}.xlsx`, 'il calendario con date e scuole'],
      dirigente: [[dirigenteSheet()], `elenco-dirigente-orientamento-${today()}.xlsx`, 'l’elenco per la Dirigente'],
      tutto: [[datesSheet(), schoolsSheet(), activitiesSheet(data.da_confermare, 'Da verificare', 'Attività in attesa della tua conferma di svolgimento', 'pink'), activitiesSheet(data.attivita, 'Registro confermate', 'Registro delle attività confermate', 'green'), supportersSheet(), proposalsSheet()], `orientamento-completo-${today()}.xlsx`, 'il file con tutto l’orientamento'],
    };
    const [sheets, filename, label] = files[kind];
    downloadWorkbook(sheets, filename);
    target.textContent = `Scaricato ${label}: ${filename}.`;
  } catch (error) {
    target.textContent = `Il file Excel non è stato creato: ${error.message}`;
  }
}

function render() {
  const schoolNames = new Map(data.scuole.map((school) => [school.id, `${school.comune} · ${school.etichetta}`]));
  renderCounts();
  renderPending(schoolNames);
  renderSupporters(schoolNames);
  renderProposals();
  renderSchools();
  renderActivities(schoolNames);
  renderAppointmentSchools();
  renderAgenda(schoolNames);
}

async function load() {
  refreshButton.disabled = true;
  try {
    const result = await api('list_contributions');
    data = { ...result, attivita: result.attivita || [], da_confermare: result.da_confermare || [], appuntamenti: [...(result.appuntamenti || [])].sort(compareAppointments) };
    render();
    document.getElementById('lastUpdate').textContent = `Dati aggiornati alle ${new Intl.DateTimeFormat('it-IT', { timeStyle: 'short' }).format(new Date())}`;
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
    // Ai colleghi della Commissione si indicano le pagine a loro aperte, senza gli strumenti della FS.
    document.getElementById('commissionLinks').hidden = false;
    const error = new Error('Con questa password la Gestione non si apre: è riservata alla Funzione Strumentale. Qui sotto trovi le pagine aperte alla Commissione.');
    error.status = 403;
    throw error;
  }
  document.getElementById('commissionLinks').hidden = true;
  showWorkspace();
  openRequestedManagementSection();
  document.dispatchEvent(new CustomEvent('bussola-gestione-accesso'));
  globalMessage.textContent = 'Caricamento…';
  await load();
}

for (const button of document.querySelectorAll('[data-tab]')) {
  button.addEventListener('click', () => showSection(button.dataset.tab, {focus:true,scroll:false}));
}
document.getElementById('addAppointment').addEventListener('click', () => openCalendarForm());
const excelMessage = document.getElementById('excelMessage');
document.getElementById('exportCalendarXlsx').addEventListener('click', () => exportExcel('calendario', excelMessage));
document.getElementById('exportActivitiesXlsx').addEventListener('click', () => exportExcel('dirigente', excelMessage));
document.getElementById('exportAllXlsx').addEventListener('click', () => exportExcel('tutto', excelMessage));

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
  });
}

function syncActivityType() {
  const isVisit = activityType.value === 'visita';
  document.getElementById('activitySchoolField').hidden = !isVisit;
  document.getElementById('activityTitleField').hidden = isVisit;
  activitySchool.required = isVisit;
}
activityType.addEventListener('change', syncActivityType);
activityForm.addEventListener('input', () => { activityDraftDirty = true; });
activityForm.addEventListener('change', () => { activityDraftDirty = true; });
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
  if (appointmentSubmit.disabled || appointmentArchive.disabled || !appointmentForm.reportValidity()) return;
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
    globalMessage.textContent = editing ? 'Data aggiornata.' : 'Data aggiunta al calendario.';
    resetAppointmentForm();
    appointmentMessage.textContent = '';
    await load();
    if (!workspacePanel.hidden) showSection('panoramica', {focus:true});
  } catch (error) {
    handleError(error, appointmentMessage);
  } finally {
    appointmentSubmit.disabled = false;
  }
});
appointmentForm.addEventListener('input', () => { appointmentDraftDirty = true; });
appointmentForm.addEventListener('change', () => { appointmentDraftDirty = true; });
appointmentCancel.addEventListener('click', () => {
  resetAppointmentForm();
  appointmentMessage.textContent = '';
  showSection('panoramica', {focus:true});
});
appointmentArchive.addEventListener('click', async () => {
  const id = appointmentForm.elements.id.value;
  if (!id || appointmentSubmit.disabled || appointmentArchive.disabled) return;
  if (!window.confirm('Togliere questa data dal calendario?')) return;
  appointmentArchive.disabled = true;
  appointmentMessage.textContent = 'Salvataggio…';
  try {
    await api('archive_appointment', {id});
    resetAppointmentForm();
    appointmentMessage.textContent = '';
    globalMessage.textContent = 'Data tolta dal calendario.';
    await load();
    if (!workspacePanel.hidden) showSection('panoramica', {focus:true});
  } catch (error) {
    handleError(error, appointmentMessage);
  } finally {
    appointmentArchive.disabled = false;
  }
});
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
// Aggiornare la pagina chiuderebbe una modifica non salvata: prima si salva o si annulla.
refreshButton.addEventListener('click', () => {
  const draft = unsavedEditor();
  if (draft) { globalMessage.textContent = 'Hai una modifica non salvata: salvala o annullala prima di aggiornare.'; draft.scrollIntoView({block: 'nearest', behavior: 'instant'}); return; }
  load();
});
document.getElementById('exportButton').addEventListener('click', exportActivities);
document.getElementById('logoutButton').addEventListener('click', async () => {
  try { await api('logout'); } catch { /* la sessione locale viene chiusa comunque */ }
  resetSession();
  passwordInput.focus();
});

if (sessionToken) enter().catch(() => resetSession());

document.addEventListener('bussola-gestione-scaduta', resetSession);

// L’accesso diventa attivo solo dopo il collegamento dei gestori del modulo.
window.addEventListener('hashchange', openRequestedManagementSection);
openRequestedManagementSection();
passwordForm.querySelector('button[type="submit"]').disabled = false;
}
