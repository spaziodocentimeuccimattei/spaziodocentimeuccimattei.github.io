import { SESSION_KEY, saveState, clearState } from './bussola-core.mjs';

export function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function link(text, href, className = 'explore-button') {
  const node = el('a', text, className);
  node.href = href;
  return node;
}

export function button(text, action, className = 'explore-button') {
  const node = el('button', text, className);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

export function storage() {
  try { return window.sessionStorage; }
  catch { return { getItem: () => null, setItem: () => { throw new Error('Storage unavailable'); }, removeItem: () => {} }; }
}

export function persist(state) {
  if (!saveState(storage(), state)) {
    const note = document.getElementById('storageNotice');
    if (note) { note.hidden = false; note.textContent = 'Puoi continuare. Su questo dispositivo il percorso non si conserva se ricarichi la pagina.'; }
  }
}

export function focusHeading(container) {
  const heading = container.querySelector('h1, h2');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  container.scrollIntoView({ block: 'start', behavior: 'instant' });
}

export async function loadData(names) {
  return Promise.all(names.map(async name => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`data/${name}.json`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Unable to load ${name}`);
      return await response.json();
    } finally { clearTimeout(timer); }
  }));
}

export function setJourney(stage) {
  document.querySelectorAll('.journey li').forEach((item, index) => {
    item.classList.toggle('current', index === stage);
    if (index === stage) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}

export function contactsPanel(contacts, onReset) {
  const section = el('section', null, 'contacts-panel');
  section.id = 'contatti';
  const title = el('h2', 'Non perdere il filo');
  title.id = 'contactTitle';
  section.setAttribute('aria-labelledby', title.id);
  section.append(el('p', 'Resta in contatto', 'explore-kicker'), title,
    el('p', 'Non devi decidere tutto oggi. Puoi tornare a conoscere i percorsi, fare domande e provare altre attività.'));
  const grid = el('div', null, 'contact-grid');
  const address = el('address');
  address.append(el('h3', contacts.name));
  const email = el('p'); email.append('Orientamento: ', link(contacts.orientationEmail, `mailto:${contacts.orientationEmail}?subject=Orientamento`, ''));
  const office = el('p'); office.append('Segreteria: ', link(contacts.email, `mailto:${contacts.email}`, ''));
  const phone = el('p'); phone.append('Sede di Decimomannu: ', link(contacts.phone, `tel:+39${contacts.phone}`, ''));
  address.append(email, office, phone, el('p', contacts.address));
  const figure = el('figure', null, 'qr-card');
  const qr = el('img'); qr.src = 'assets/qr-orientamento.svg'; qr.alt = 'QR code per aprire lo spazio di orientamento sul tuo dispositivo'; qr.width = 132; qr.height = 132;
  figure.append(qr, el('figcaption', 'Ritrova questo spazio'));
  grid.append(address, figure);
  section.append(grid);
  const photo = el('img', null, 'contact-school-photo'); photo.src = 'assets/sede-decimomannu-900.webp'; photo.alt = 'La sede di Decimomannu dell’IIS Meucci - Mattei'; photo.width = 900; photo.height = 300; photo.loading = 'lazy'; section.append(photo);
  const actions = el('div', null, 'action-row');
  const vcard = link('Salva i contatti', 'documenti/contatti-mattei.vcf'); vcard.download = 'contatti-mattei.vcf';
  actions.append(vcard, link('Scrivici', `mailto:${contacts.orientationEmail}?subject=Orientamento`, 'explore-button secondary'), link('Visita il sito ufficiale', contacts.website, 'explore-button secondary'), link('Tutti gli indirizzi', 'indirizzi.html#diurni', 'explore-button secondary'), link('Chiedi dei prossimi incontri', `mailto:${contacts.orientationEmail}?subject=Incontri%20di%20orientamento`, 'explore-button secondary'));
  section.append(actions,
    el('p', 'Salvare il contatto o aprire il QR non invia le risposte della Bussola alla scuola. Se scegli di scrivere una e-mail, invierai il messaggio e il tuo indirizzo al destinatario.', 'plain-note'));
  const resets = el('div', null, 'contact-reset');
  resets.append(button('Lascia il dispositivo al prossimo studente', () => {
    clearState(storage());
    if (onReset) onReset();
    else window.location.assign('bussola.html');
  }, 'explore-button secondary'));
  section.append(resets);
  return section;
}

export function choice(option, type, name, checked, onChange) {
  const label = el('label', null, 'choice');
  const input = el('input');
  input.type = type; input.name = name; input.value = option.id; input.id = `${name}-${option.id}`; input.checked = checked;
  input.addEventListener('change', onChange);
  const text = el('span');
  if (option.label) text.append(el('strong', option.label));
  else text.append(el('span', option.text));
  if (option.detail) text.append(el('small', option.detail));
  label.append(input, text);
  return label;
}

export function showError(target, retry) {
  target.replaceChildren(el('h2', 'Il percorso non si è caricato'), el('p', 'Controlla la connessione e riprova. Puoi comunque continuare a conoscere gli indirizzi.'));
  const row = el('div', null, 'action-row');
  row.append(button('Riprova', retry), link('Esplora tutti gli indirizzi', 'indirizzi.html#diurni', 'explore-button secondary'));
  target.append(row);
}
