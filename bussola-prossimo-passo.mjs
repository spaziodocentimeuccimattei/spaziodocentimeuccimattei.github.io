// «Il prossimo passo»: alla fine di ogni percorso la scuola resta raggiungibile.
// I recapiti arrivano soltanto da data/contatti.json; nulla del lavoro viene inviato.
const NAMES = {
  afm: 'Amministrazione, Finanza e Marketing', sia: 'Sistemi Informativi Aziendali',
  turismo: 'Turismo', ssas: 'Servizi per la Sanità e l’Assistenza Sociale',
  cat: 'Costruzioni, Ambiente e Territorio',
};
let contactsPromise;

export function loadContacts() {
  contactsPromise ??= fetch('data/contatti.json', { cache: 'no-cache' })
    .then(response => { if (!response.ok) throw new Error('Contatti non disponibili.'); return response.json(); })
    .catch(error => { contactsPromise = null; throw error; });
  return contactsPromise;
}

export function phoneLabel(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits.startsWith('070') ? `070 ${digits.slice(3)}` : digits;
}

export function mailHref(contacts, course) {
  const subject = NAMES[course] ? `Orientamento ${NAMES[course]}` : 'Orientamento';
  return `mailto:${contacts.orientationEmail}?subject=${encodeURIComponent(subject)}`;
}

function node(tag, text, className) {
  const item = document.createElement(tag);
  if (text) item.textContent = text;
  if (className) item.className = className;
  return item;
}
function anchor(text, href, className) { const a = node('a', text, className); a.href = href; return a; }

function fill(section, contacts, course, compact) {
  const mail = anchor('Scrivi all’orientamento', mailHref(contacts, course), 'next-step-action primary-action');
  const phone = anchor(`Chiama ${phoneLabel(contacts.phone)}`, `tel:+39${String(contacts.phone).replace(/\D/g, '')}`, 'next-step-action');
  if (compact) {
    const text = node('p');
    text.append(node('strong', 'Il prossimo passo: vieni a conoscerci. '), 'Scrivi a ',
      anchor(contacts.orientationEmail, mailHref(contacts, course)), ' o chiama ',
      anchor(phoneLabel(contacts.phone), phone.href), '.');
    section.replaceChildren(text);
    return;
  }
  const title = node('h2', 'Vieni a conoscerci di persona');
  const courseName = NAMES[course];
  const intro = node('p', `${courseName ? `Hai provato alcune attività di ${courseName}. ` : ''}A scuola puoi vedere i laboratori, parlare con studenti e docenti e fare tutte le domande che vuoi, anche insieme alla tua famiglia.`);
  const actions = node('div', null, 'next-step-actions');
  const enrol = anchor('Come ci si iscrive', 'famiglie.html#iscrizione', 'next-step-action');
  const card = anchor('Salva i contatti', 'documenti/contatti-mattei.vcf', 'next-step-action'); card.download = 'contatti-mattei.vcf';
  actions.append(mail, phone, enrol, card);
  const address = node('address');
  const nb = text => text.replace(/ /g, '\u00a0');
  address.append(node('span', `${contacts.name} · ${contacts.address}`), node('span', `${contacts.orientationEmail} · ${nb(`Tel. ${phoneLabel(contacts.phone)}`)}`));
  const note = node('p', 'Scrivere o chiamare non invia alla scuola i tuoi lavori: decidi tu che cosa raccontare.', 'next-step-note');
  section.replaceChildren(node('p', 'Il prossimo passo', 'next-step-kicker'), title, intro, actions, address, note);
  title.id = `nextStepTitle-${course || 'bussola'}`;
  section.setAttribute('aria-labelledby', title.id);
}

// Restituisce subito la sezione e la completa quando i recapiti sono disponibili.
export function nextStep(course, { compact = false } = {}) {
  const section = node(compact ? 'div' : 'section', null, `bussola-next-step${compact ? ' compact' : ''}`);
  section.hidden = true;
  loadContacts().then(contacts => { fill(section, contacts, course, compact); section.hidden = false; }).catch(() => {});
  return section;
}

// Per le pagine costruite con modelli di testo: <div data-next-step="afm"></div>.
export function mountNextStep(root) {
  root?.querySelectorAll('[data-next-step]').forEach(slot => slot.replaceWith(nextStep(slot.dataset.nextStep)));
}
