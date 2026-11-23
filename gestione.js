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
const activityEditorContext = document.getElementById('activityEditorContext');
const otherTools = document.getElementById('otherTools');
const visitDate = new Intl.DateTimeFormat('it-IT', {weekday:'long', day:'numeric', month:'long', year:'numeric',timeZone:'UTC'});

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
const SECTION_HASHES = { panoramica: 'calendario-scuole', calendario: 'date', confermare: 'da-verificare', candidature: 'disponibilita', proposte: 'mattinee', scuole: 'scuole-visite', attivita: 'registro', bussola: 'classi-bussola', excel: 'excel', datePassate: 'date-passate' };
function sectionFromHash() {
  const hash = location.hash.slice(1);
  if (hash === 'bussola') return 'bussola';
  return Object.keys(SECTION_HASHES).find((key) => SECTION_HASHES[key] === hash) || '';
}

function showSection(key, { focus = false, scroll = true } = {}) {
  const overview = ['panoramica', 'confermare', 'attivita'].includes(key);
  const selected = document.querySelector(`[data-panel="${overview ? 'panoramica' : key}"]`);
  if (!selected) return;
  for (const panel of document.querySelectorAll('.tab-panel')) panel.hidden = panel !== selected;
  document.querySelector('[data-tab="panoramica"]').hidden = overview;
  otherTools.open = false;
  const completed = document.getElementById('completedVisits');
  if (key === 'attivita') completed.open = true;
  const target = key === 'confermare' ? document.getElementById('pendingSection') : key === 'attivita' ? completed.querySelector('summary') : selected;
  if (!workspacePanel.hidden) history.replaceState(null, '', `#${SECTION_HASHES[key]}`);
  if (focus) target.focus({preventScroll:true});
  if (scroll) target.scrollIntoView({block:'start',behavior:'instant'});
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
  renderCockpit();
  renderRegistry(new Map());
  renderVisits(new Map());
  resetActivityForm();
  if (activityEditor.open) activityEditor.close();
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
        // La data scelta dal docente, anche se già trascorsa, ha la precedenza sulla prima in calendario.
        const chosen = data.appuntamenti.find((date) => date.id === item.appuntamento_id);
        const input = document.createElement('input');
        input.type = 'date';
        input.setAttribute('aria-label', `Data per ${schoolNames.get(id) || id}`);
        if (chosen) input.value = chosen.data;
        else if (dates.length) input.value = dates[0].data;
        if (chosen) row.append(el('small', '', `Data indicata dal docente: ${chosen.data.split('-').reverse().join('/')}`));
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

// Codici personali: visibili solo alla Funzione Strumentale, da consegnare a ciascun docente.
function renderTeacherCodes() {
  const list = document.getElementById('teacherCodeList');
  const teachers = [...(data.docenti || [])].sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`, 'it'));
  list.replaceChildren(...(teachers.length ? teachers.map((teacher) => {
    const item = el('li', 'teacher-code');
    item.append(el('span', 'teacher-code-name', `${teacher.cognome} ${teacher.nome}`), el('code', '', teacher.codice));
    item.append(actionButton('Nuovo codice', 'neutral', async (button) => {
      if (!window.confirm(`Creare un nuovo codice per ${teacher.nome} ${teacher.cognome}? Quello attuale smetterà di funzionare.`)) return;
      button.disabled = true;
      try {
        const result = await api('new_code', { docente_id: teacher.id });
        globalMessage.textContent = `Nuovo codice di ${teacher.nome} ${teacher.cognome}: ${result.codice}.`;
        await load();
      } catch (error) {
        button.disabled = false;
        handleError(error);
      }
    }));
    return item;
  }) : [el('li', 'empty', 'Nessun docente registrato.')]));
}

async function confirmSupporter(item, schoolId, input, button) {
  if (!input.value) { globalMessage.textContent = 'Indica la data prima di assegnare la visita.'; input.focus(); return; }
  button.disabled = true;
  globalMessage.textContent = 'Salvataggio…';
  try {
    await api('register_activity', { nome: item.nome, cognome: item.cognome, tipo: 'visita', scuola_id: schoolId, data: input.value, nota: item.nota || '' });
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
    card.append(el('h4', '', `${school.comune} – ${school.etichetta}`));
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
        `${visitDate.format(new Date(`${item.data}T12:00:00Z`))} · ${timeRange(item) || 'Orario non indicato'}${item.stato === 'confermata' ? '' : ' · Data da concordare'}`));
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

function renderActivityFields() {
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

function visitHeading(item, label, appointments) {
  const school = el('strong', 'visit-school', label);
  const date = el('time', 'visit-day', visitDate.format(new Date(`${item.data}T12:00:00Z`)));
  date.dateTime = item.data;
  const slots = [...new Set(appointments.map(timeRange).filter(Boolean))];
  const row = el('li', 'visit-row');
  const name = el('div', 'visit-heading');
  const timing = el('div', 'visit-timing');
  timing.append(date);
  if (slots.length) timing.append(el('strong', 'visit-hour', slots.join(' · ')));
  else if (item.tipo!=='mattinee') timing.append(el('span', 'visit-place', 'Orario non indicato'));
  name.append(school, timing);
  if (item.scuola_id) row.dataset.school = item.scuola_id;
  row.append(name);
  return {row, name};
}

function renderAgenda(schoolNames) {
  const upcoming = document.getElementById('upcomingAppointments');
  const past = document.getElementById('pastAppointments');
  upcoming.replaceChildren();
  past.replaceChildren();
  const now = today();
  document.getElementById('addAppointment').disabled = !data;
  for (const item of data?.appuntamenti || []) {
    const label = schoolNames.get(item.scuola_id) || item.scuola_id;
    const {row, name} = visitHeading(item, label, [item]);
    if (item.luogo) name.append(el('span', 'visit-place', item.luogo));
    else if (item.tipo === 'stand') name.append(el('span', 'visit-place', 'Open day con stand'));
    if (item.stato !== 'confermata') name.append(el('span', 'agenda-pending', 'Data da concordare'));
    const edit = actionButton('Modifica data', 'agenda-edit', () => openCalendarForm(null, item));
    edit.setAttribute('aria-label', `Modifica la data di ${label} del ${item.data.split('-').reverse().join('/')}`);
    row.append(edit);
    (item.data >= now ? upcoming : past).append(row);
  }
  document.getElementById('agendaMessage').textContent = data && !upcoming.children.length ? 'Nessuna visita in programma.' : '';
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
  activityEditorContext.hidden = true;
  activityEditorContext.replaceChildren();
  for (const id of ['activityTypeField','activityDateField','activityNoteField']) document.getElementById(id).hidden = false;
  for (const name of ['id', 'nome', 'cognome', 'nota', 'titolo']) activityForm.elements[name].value = '';
  activityType.value = 'visita';
  activityForm.elements.data.value = today();
  syncActivityType();
  activityForm.querySelector('button[type="submit"]').textContent = 'Salva attività';
  document.getElementById('activityDiscard').hidden = true;
  activityForm.querySelector('.activity-cancel-prompt')?.remove();
  activityForm.querySelector('.appointment-buttons').hidden = false;
  activityMessage.textContent = '';
}

function openActivityEditor(title) {
  activityEditorTitle.textContent = title;
  if (!activityEditor.open) activityEditor.showModal();
  activityForm.elements.nome.focus();
  otherTools.open = false;
}

function editActivity(item) {
  resetActivityForm();
  for (const name of ['id', 'nome', 'cognome', 'tipo', 'data', 'nota', 'titolo']) activityForm.elements[name].value = item[name] || '';
  syncActivityType();
  if (item.scuola_id) activitySchool.value = item.scuola_id;
  activityForm.querySelector('button[type="submit"]').textContent = 'Salva modifiche';
  document.getElementById('activityDiscard').hidden = false;
  openActivityEditor('Modifica attività');
}

function prepareVisitRegistration(item, label, appointments) {
  resetActivityForm();
  activitySchool.value = item.scuola_id;
  activityForm.elements.data.value = item.data;
  for (const id of ['activityTypeField','activitySchoolField','activityDateField','activityNoteField']) document.getElementById(id).hidden = true;
  activityEditorContext.append(visitHeading(item, label, appointments).name);
  activityEditorContext.hidden = false;
  activityForm.querySelector('button[type="submit"]').textContent = 'Salva docente';
  openActivityEditor('Aggiungi il docente');
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
      if (activityForm.elements.id.value === item.id) {
        resetActivityForm();
        activityEditor.close();
      }
      render();
      globalMessage.textContent = 'Registrazione annullata.';
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

function visitKey(item) {
  return JSON.stringify([item.tipo==='mattinee'?'mattinee':'visita',item.scuola_id || item.titolo,item.data]);
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

function renderTeacher(item, confirmed, canConfirm) {
  const teacher = el('div', 'visit-teacher');
  teacher.dataset.activityId = item.id;
  teacher.append(el('span', 'visit-teacher-name', `${item.nome} ${item.cognome}`));
  if (item.nota) teacher.append(el('small', 'visit-place', item.nota));
  // Nota cambiata dal docente o dalla Commissione dopo la conferma: si vede che cosa è cambiato prima di riconfermare.
  if (!confirmed && item.modificata_dal_docente_at) {
    teacher.append(el('small', 'visit-note-changed', `Nota cambiata il ${formatDate(item.modificata_dal_docente_at)}. Prima: «${item.nota_precedente || 'nessuna nota'}»`));
  }
  const actions = el('div', 'visit-actions');
  if (confirmed) actions.append(el('span', 'visit-complete', 'Confermata'));
  if (canConfirm) {
    actions.append(actionButton(item.tipo==='visita'?'Conferma visita':'Conferma attività', 'ok', async button => {
      button.disabled = true;
      globalMessage.textContent = 'Salvataggio…';
      try {
        await api('confirm_activity', {id:item.id});
        globalMessage.textContent = item.tipo==='visita'?'Visita confermata.':'Attività confermata.';
        await load();
      } catch (error) {
        button.disabled = false;
        handleError(error);
      }
    }));
  }
  actions.append(registrationOptions(item, teacher, actions));
  teacher.append(actions);
  return teacher;
}

function renderVisits(schoolNames) {
  const pending = document.getElementById('pendingList');
  const completed = document.getElementById('activityList');
  const future = document.getElementById('futureActivities');
  const futureList = future.querySelector('ul');
  document.getElementById('newActivity').disabled = !data;
  for (const list of [pending,completed,futureList]) list.replaceChildren();

  const now = today();
  const groups = new Map();
  const dates = new Map();
  const reported = data?.da_confermare || [];
  const confirmed = data?.attivita || [];
  for (const [records,kind] of [[reported,'reported'],[confirmed,'confirmed']]) {
    for (const item of records) {
      const key = visitKey(item);
      if (!groups.has(key)) groups.set(key,{item,reported:[],confirmed:[]});
      groups.get(key)[kind].push(item);
    }
  }
  for (const item of data?.appuntamenti || []) {
    const key = visitKey(item);
    if (!dates.has(key)) dates.set(key,[]);
    dates.get(key).push(item);
    if (item.data < now && item.stato==='confermata' && !groups.has(key)) {
      groups.set(key,{item,reported:[],confirmed:[]});
    }
  }
  let needsTeacher = false;
  const chronologically = [...groups].sort(([firstKey, first], [secondKey, second]) =>
    compareAppointments(dates.get(firstKey)?.[0] || first.item, dates.get(secondKey)?.[0] || second.item));
  for (const [key,group] of chronologically) {
    const {item} = group;
    const appointments = dates.get(key) || [];
    const label = item.tipo==='mattinee' ? item.titolo : schoolNames.get(item.scuola_id) || item.scuola_id;
    const {row, name} = visitHeading(item,label,appointments);
    const list = item.data>now ? futureList : group.reported.length || !group.confirmed.length ? pending : completed;
    if (!group.reported.length && !group.confirmed.length) {
      needsTeacher = true;
      const add = actionButton('Aggiungi docente', 'ok', () => prepareVisitRegistration(item,label,appointments));
      add.setAttribute('aria-label', `Aggiungi docente per ${label}`);
      row.append(add);
    } else {
      const people = el('div', 'visit-teachers');
      for (const teacher of group.reported) people.append(renderTeacher(teacher,false,item.data<=now));
      for (const teacher of group.confirmed) people.append(renderTeacher(teacher,list!==completed,false));
      if (list===completed) {
        const details = el('details','visit-people');
        const summary = el('summary');
        summary.append(name);
        details.append(summary,people);
        row.replaceChildren(details);
        row.classList.add('visit-history-row');
      } else row.append(people);
    }
    list.append(row);
  }
  const schoolsReached = new Set(confirmed.filter(item => item.tipo==='visita' && item.data<=now).map(item => item.scuola_id));
  document.getElementById('schoolProgress').textContent = data ? `${schoolsReached.size} di ${data.scuole.length} scuole raggiunte` : '';
  document.getElementById('visitHelp').hidden = !needsTeacher;
  document.getElementById('pendingTitle').hidden = !pending.children.length;
  document.getElementById('pendingEmpty').hidden = !data || pending.children.length>0;
  document.getElementById('confirmedEmpty').hidden = !data || completed.children.length>0;
  future.hidden = !futureList.children.length;
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

// Cruscotto (23/11/2026): a colpo d'occhio le scuole fatte, da verificare, in programma e ancora da fare.
// «Fatta» vale solo con una visita confermata dalla FS: una data passata non basta (vedi docs/gestione-calendario.md).
const COCKPIT_GROUPS = [
  ['fatta', 'Fatte', 'Visita svolta e confermata'],
  ['verificare', 'Da verificare', 'Data passata o visita segnalata: conferma o aggiungi chi è andato'],
  ['programma', 'In programma', 'Data fissata, incontro ancora da fare'],
  ['dafare', 'Da fare', 'Nessuna data: premi la scuola per inserirla'],
];
const shortDay = new Intl.DateTimeFormat('it-IT', {day:'numeric', month:'short', timeZone:'UTC'});
const dayLabel = (value) => shortDay.format(new Date(`${value}T12:00:00Z`));

function schoolStatus(school, now) {
  const visits = (data.attivita || []).filter((item) => item.tipo === 'visita' && item.scuola_id === school.id);
  const reported = (data.da_confermare || []).filter((item) => item.tipo === 'visita' && item.scuola_id === school.id);
  const dates = (data.appuntamenti || []).filter((item) => item.scuola_id === school.id);
  const done = visits.filter((item) => item.data <= now).sort((a, b) => b.data.localeCompare(a.data));
  const next = dates.filter((item) => item.data >= now).sort(compareAppointments)[0];
  const pastDates = dates.filter((item) => item.data < now).sort((a, b) => b.data.localeCompare(a.data));
  const pastReports = reported.filter((item) => item.data <= now).sort((a, b) => b.data.localeCompare(a.data));
  if (done.length) return {key: 'fatta', note: `Svolta il ${dayLabel(done[0].data)}${next ? ` · prossima ${dayLabel(next.data)}` : ''}`, appointment: next};
  if (pastReports.length || pastDates.length) {
    const when = (pastReports[0] || pastDates[0]).data;
    return {key: 'verificare', note: `Incontro del ${dayLabel(when)}${pastReports.length ? ' · segnalato da un docente' : ''}`};
  }
  if (next) return {key: 'programma', note: `${dayLabel(next.data)}${timeRange(next) ? ` · ${timeRange(next)}` : ''}${next.stato === 'confermata' ? '' : ' · da concordare'}`, appointment: next};
  return {key: 'dafare', note: 'Nessuna data'};
}

function renderCockpit() {
  const groups = document.getElementById('cockpitGroups');
  const bar = document.getElementById('cockpitBar');
  const count = document.getElementById('cockpitCount');
  document.getElementById('cockpitAddDate').disabled = !data;
  document.getElementById('cockpitAddActivity').disabled = !data;
  groups.replaceChildren();
  bar.replaceChildren();
  if (!data) { count.textContent = ''; return; }
  const now = today();
  const buckets = new Map(COCKPIT_GROUPS.map(([key]) => [key, []]));
  for (const school of data.scuole) {
    const status = schoolStatus(school, now);
    buckets.get(status.key).push({school, ...status});
  }
  const total = data.scuole.length;
  const n = (key) => buckets.get(key).length;
  count.textContent = `${n('fatta')} scuole fatte su ${total} · ${n('verificare')} da verificare · ${n('programma')} in programma · ${n('dafare')} ancora senza data`;
  for (const [key, title, help] of COCKPIT_GROUPS) {
    if (n(key)) {
      const part = el('span', `cockpit-bar-part is-${key}`);
      part.style.flexGrow = String(n(key));
      part.title = `${title}: ${n(key)}`;
      bar.append(part);
    }
    const column = el('section', `cockpit-group is-${key}`);
    const head = el('h3', '', title);
    head.append(el('span', 'cockpit-number', String(n(key))));
    column.append(head, el('p', 'cockpit-help', help));
    const list = el('ul', 'cockpit-list');
    for (const item of buckets.get(key)) {
      const button = el('button', 'cockpit-school');
      button.type = 'button';
      button.append(el('strong', '', item.school.comune), el('span', 'cockpit-label', item.school.etichetta), el('span', 'cockpit-note', item.note));
      button.addEventListener('click', () => {
        if (key === 'dafare') openCalendarForm(item.school);
        else if (key === 'programma') openCalendarForm(null, item.appointment);
        else if (item.appointment) openCalendarForm(null, item.appointment);
        else if (key === 'verificare') showSection('confermare', {focus: true});
        else showSection('scuole', {focus: true});
      });
      const action = key === 'dafare' ? 'inserisci la data' : item.appointment ? 'modifica la prossima data' : key === 'verificare' ? 'vai alle visite da verificare' : 'apri la scheda delle scuole';
      button.setAttribute('aria-label', `${item.school.comune}, ${item.school.etichetta}: ${item.note}. Premi per ${action}.`);
      const li = el('li');
      li.append(button);
      list.append(li);
    }
    if (!n(key)) list.append(el('li', 'cockpit-empty', 'Nessuna'));
    column.append(list);
    groups.append(column);
  }
}

let registryFilter = 'tutte';
function renderRegistry(schoolNames) {
  const body = document.getElementById('registryBody');
  body.replaceChildren();
  if (!data) return;
  const now = today();
  const rows = [
    ...data.da_confermare.map((item) => ({item, confirmed: false})),
    ...data.attivita.map((item) => ({item, confirmed: true})),
  ].filter(({confirmed}) => registryFilter === 'tutte' || (registryFilter === 'confermata') === confirmed)
    .sort((a, b) => b.item.data.localeCompare(a.item.data) || Number(a.confirmed) - Number(b.confirmed));
  for (const {item, confirmed} of rows) {
    const tr = el('tr', confirmed ? 'is-confirmed' : 'is-pending');
    const date = el('td', 'registry-date');
    const time = el('time', '', item.data.split('-').reverse().join('/'));
    time.dateTime = item.data;
    date.append(time);
    const what = el('td');
    what.append(el('strong', '', item.tipo === 'mattinee' ? (item.titolo || 'Mattinée') : (schoolNames.get(item.scuola_id) || item.scuola_id)));
    what.append(el('small', '', item.tipo === 'mattinee' ? 'Mattinée' : 'Visita nella scuola'));
    if (item.nota) what.append(el('small', 'registry-note', item.nota));
    const who = el('td', '', `${item.nome} ${item.cognome}`);
    const state = el('td');
    state.append(el('span', `state ${confirmed ? 'state-assegnata' : 'state-ricevuta'}`, confirmed ? 'Confermata' : item.data > now ? 'In programma' : 'Da confermare'));
    const actions = el('td', 'registry-actions');
    if (!confirmed && item.data <= now) {
      actions.append(actionButton('Conferma', 'ok', async (button) => {
        button.disabled = true;
        globalMessage.textContent = 'Salvataggio…';
        try {
          await api('confirm_activity', {id: item.id});
          globalMessage.textContent = item.tipo === 'visita' ? 'Visita confermata.' : 'Attività confermata.';
          await load();
        } catch (error) {
          button.disabled = false;
          handleError(error);
        }
      }));
    }
    actions.append(actionButton('Modifica', 'neutral', () => editActivity(item)));
    tr.append(date, what, who, state, actions);
    body.append(tr);
  }
  document.getElementById('registryEmpty').hidden = rows.length > 0;
}

function render() {
  const schoolNames = new Map(data.scuole.map((school) => [school.id, `${school.comune} – ${school.etichetta}`]));
  renderVisits(schoolNames);
  renderSupporters(schoolNames);
  renderTeacherCodes();
  renderProposals();
  renderSchools();
  renderActivityFields();
  renderAppointmentSchools();
  renderAgenda(schoolNames);
  renderCockpit();
  renderRegistry(schoolNames);
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
document.getElementById('cockpitAddDate').addEventListener('click', () => openCalendarForm());
document.getElementById('cockpitAddActivity').addEventListener('click', () => {
  resetActivityForm();
  openActivityEditor('Registra un’attività');
});
document.getElementById('registryFilters').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-registry]');
  if (!button) return;
  registryFilter = button.dataset.registry;
  for (const other of event.currentTarget.querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === button));
  if (data) renderRegistry(new Map(data.scuole.map((school) => [school.id, `${school.comune} – ${school.etichetta}`])));
});
document.getElementById('newActivity').addEventListener('click', () => {
  resetActivityForm();
  openActivityEditor('Aggiungi un’attività');
});
const excelMessage = document.getElementById('excelMessage');
document.getElementById('exportCalendarXlsx').addEventListener('click', () => exportExcel('calendario', excelMessage));
document.getElementById('exportActivitiesXlsx').addEventListener('click', () => exportExcel('dirigente', excelMessage));
document.getElementById('exportAllXlsx').addEventListener('click', () => exportExcel('tutto', excelMessage));

for (const group of document.querySelectorAll('.filters[data-filter-for]')) {
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
activityForm.elements.data.value = today();
syncActivityType();

activityEditor.addEventListener('cancel', event => {
  if (activityDraftDirty || activityForm.querySelector('button[type="submit"]').disabled) {
    event.preventDefault();
    activityMessage.textContent = 'Premi Annulla per chiudere il modulo.';
  } else resetActivityForm();
});
activityForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!activityForm.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(activityForm).entries());
  if (payload.tipo !== 'visita') delete payload.scuola_id;
  const editing = Boolean(payload.id);
  if (!editing) delete payload.id;
  const button = activityForm.querySelector('button[type="submit"]');
  if (button.disabled) return;
  const cancel = document.getElementById('activityCancel');
  button.disabled = true;
  cancel.disabled = true;
  activityMessage.textContent = 'Registrazione in corso…';
  try {
    const result = await api(editing ? 'update_activity' : 'register_activity', payload);
    resetActivityForm();
    activityEditor.close();
    globalMessage.textContent = payload.data <= today()
      ? (payload.tipo==='visita'?'Docente salvato. Ora puoi confermare la visita.':'Attività salvata. Ora puoi confermarla.')
      : 'Docente aggiunto all’attività in programma.';
    await load();
    if (!workspacePanel.hidden) {
      showSection('panoramica', {scroll:false});
      const card = [...document.querySelectorAll('#pendingList [data-activity-id]')].find(item => item.dataset.activityId === (result.id || payload.id));
      const confirm = card?.querySelector('.act.ok');
      if (confirm) {
        confirm.scrollIntoView({block:'nearest'});
        confirm.focus({preventScroll:true});
      }
    }
  } catch (error) {
    handleError(error, activityMessage);
  } finally {
    button.disabled = false;
    cancel.disabled = false;
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
    // Stessa sessione per i documenti della Commissione (orientamento.html): niente secondo accesso.
    if (result.access_level === 'funzione_strumentale') sessionStorage.setItem('mattei-orientamento-session', sessionToken);
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

document.getElementById('activityCancel').addEventListener('click', () => {
  resetActivityForm();
  activityEditor.close();
});
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
