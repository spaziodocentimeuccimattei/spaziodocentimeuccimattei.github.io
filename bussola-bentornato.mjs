// «Bentornato»: lo schermo di chi torna da casa (riordino novembre 2026, agente A3).
// Si apre da solo con il link del QR (bussola.html#alunno=…&corso=…) e dal link «Ho un codice» della prima pagina.
// Ritorno in due passi: (1) QR = link personale già previsto dal sistema, senza modifiche al server;
// (2) codice breve da scrivere: nascosto finché CODICE_BREVE_ATTIVO è falso (vedi bussola-interruttori.mjs).
import {CORSI, NOMI_BREVI, NOMI_CORSI, leggiRitorno, pulisciNome, nomeCompleto} from './bussola-locale.mjs?v=20261115-riordino';
import {CODICE_BREVE_ATTIVO} from './bussola-interruttori.mjs?v=20261118-email';
import {bloccoEmailAttestato} from './bussola-email-attestato.mjs?v=20261118-email';
import {OPEN_DAY, OPEN_DAY_LUOGO} from './bussola-prossimo-passo.mjs?v=20261115-riordino';
import {personalDestination} from './bussola-identita.mjs?v=20261019-monitor';
import {classCode} from './bussola-codice.mjs?v=20261008-codice';

const prova = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('prova');
const API_ESPERIENZE = prova ? '/__test/bussola-esperienze' : 'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-esperienze';
const API_GESTIONE = prova ? '/__test/bussola-gestione' : 'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-gestione';

function el(tag, attributi = {}, ...figli) {
  const nodo = document.createElement(tag);
  for (const [k, v] of Object.entries(attributi)) { if (v === true) nodo.setAttribute(k, ''); else if (v !== false && v != null) nodo.setAttribute(k, v); }
  nodo.append(...figli.flat().filter(f => f != null));
  return nodo;
}
async function chiama(url, token, corpo) {
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json', 'x-bussola-token': token || ''}, body: JSON.stringify(corpo), signal: ctrl.signal});
    const dati = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(dati.error || 'Non riesco a collegarmi. Riprova.'), {stato: r.status});
    return dati;
  } finally { clearTimeout(timer); }
}

let dialogo = null;
function contenitore() {
  if (dialogo) return dialogo;
  dialogo = el('dialog', {class: 'bt-bentornato bt-su-scuro', 'aria-label': 'Bentornato'});
  const chiudi = el('button', {class: 'bt-link bt-bentornato__chiudi', type: 'button'}, 'Chiudi');
  chiudi.addEventListener('click', () => dialogo.close());
  dialogo.append(chiudi, el('div', {class: 'bt-bentornato__corpo'}));
  dialogo.addEventListener('close', () => { if (/[#&]alunno=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); });
  document.body.append(dialogo);
  return dialogo;
}
function mostra(schermo, corso = 'bussola') {
  const d = contenitore();
  d.dataset.corso = corso;
  d.querySelector('.bt-bentornato__corpo').replaceChildren(schermo);
  if (!d.open) d.showModal();
  d.querySelector('[autofocus], h1')?.focus?.({preventScroll: true});
}

// ---- 1. «Ho un codice» ---------------------------------------------------------------------------
export function apriCodice() {
  const campo = el('input', {name: 'codice', type: 'text', maxlength: 400, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', placeholder: 'Codice o link', autofocus: true, required: true});
  const errore = el('p', {class: 'bt-errore', role: 'alert'});
  const vai = el('button', {class: 'bt-pulsante bt-pulsante--grande', type: 'submit'}, 'Continua');
  const forma = el('form', {class: 'bt-modulo', novalidate: true}, el('label', {class: 'bt-campo'}, 'Il tuo codice', campo), errore, vai);
  forma.addEventListener('submit', async e => {
    e.preventDefault(); errore.textContent = '';
    const testo = campo.value.trim();
    if (!testo) { errore.textContent = 'Scrivi il codice, oppure incolla il link.'; campo.focus(); return; }
    vai.disabled = true;
    try { await risolvi(testo); } catch (x) { errore.textContent = x?.message || 'Il codice non funziona. Controllalo e riprova.'; } finally { vai.disabled = false; }
  });
  const schermo = el('section', {class: 'bt-schermo'},
    el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Hai un ', el('em', {}, 'codice'), '?'),
    el('p', {class: 'bt-frase'}, 'Con il QR è più facile: inquadralo con la fotocamera del telefono e ti porta qui.'),
    forma,
    el('p', {class: 'bt-nota'}, CODICE_BREVE_ATTIVO ? 'Scrivi il codice di 6 caratteri, oppure il codice della tua classe.' : 'Puoi scrivere il codice della tua classe o incollare il link personale.'));
  mostra(schermo);
}

// Capisce che cosa è stato scritto: link/QR personale, oppure codice della classe.
async function risolvi(testo) {
  const ritorno = leggiRitorno(testo);
  if (ritorno) return apriBentornato(ritorno);
  const classe = classCode(testo);
  if (classe) {
    let nonClasse = null;
    try { const d = await chiama(API_GESTIONE, '', {action: 'class_info', classe}); return classeRiconosciuta(classe, d.classe); }
    catch (e) { nonClasse = e; }
    // Con CODICE_BREVE_ATTIVO un codice che non è di una classe può essere un codice personale di ritorno (stesso formato, senza L).
    if (CODICE_BREVE_ATTIVO && nonClasse.stato === 404) {
      const m = await import('./bussola-ritorno-codice.mjs?v=20261118-email');
      if (m.eCodicePersonale(classe)) return m.apriConCodice(classe, {el, mostra, nonTrovato});
    }
    throw nonClasse;
  }
  throw new Error(CODICE_BREVE_ATTIVO ? 'Il codice non è valido. Controlla di averlo scritto bene.' : 'Non riconosco questo codice. Se hai il QR, inquadralo con la fotocamera del telefono.');
}

function classeRiconosciuta(codice, info) {
  const inizia = el('button', {class: 'bt-pulsante bt-pulsante--grande', type: 'button'}, 'Inizia con la classe');
  inizia.addEventListener('click', () => { const u = new URL(location.href); u.hash = new URLSearchParams({classe: codice}).toString(); history.replaceState(null, '', u.href); location.reload(); });
  mostra(el('section', {class: 'bt-schermo'},
    el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Classe ', el('em', {}, 'riconosciuta')),
    el('p', {class: 'bt-frase'}, `${info.scuola} · ${info.classe}`),
    inizia,
    el('p', {class: 'bt-nota'}, 'Per riprendere un lavoro già fatto usa il QR o il link personale che hai salvato.')));
}

/** «Scarica l'immagine»: prepara al tocco la cartolina da condividere (JPEG 1080×1920, non l'attestato) e la scarica. */
function pulsanteImmagine(el, {corso, nome, id}) {
  const b = el('button', {class: 'bt-link bt-attestato__scarica', type: 'button', id}, 'Scarica l’immagine da condividere');
  b.addEventListener('click', async () => {
    const testo = b.textContent; b.disabled = true; b.textContent = 'Preparo l’immagine…';
    try {
      const {cartolinaFile} = await import('./bussola-immagine-social.mjs?v=20261118-social');
      const f = await cartolinaFile({corso, nome: typeof nome === 'function' ? nome() : nome});
      const a = document.createElement('a'); a.href = f.url; a.download = f.name; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(f.url), 60000);
      b.textContent = testo;
    } catch { b.textContent = 'Non riesco a preparare l’immagine. Riprova.'; }
    finally { b.disabled = false; }
  });
  return b;
}

// ---- 2. «Bentornato» -------------------------------------------------------------------------------
export async function apriBentornato(ritorno) {
  const {token, corso} = ritorno;
  mostra(el('section', {class: 'bt-schermo'}, el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Bentornato!'), el('p', {class: 'bt-frase', role: 'status'}, 'Cerco il tuo lavoro…')), corso);
  let carico;
  try {
    carico = await chiama(API_ESPERIENZE, token, {action: 'load', corso});
  } catch (e) {
    return nonTrovato(e.stato === 401
      ? 'Questa prova non è più disponibile: le prove si conservano per un tempo limitato. Puoi rifarla quando vuoi.'
      : 'Non riesco a collegarmi. Controlla la connessione e riprova.');
  }
  if (!carico.project?.payload) return nonTrovato('Non trovo il lavoro di questo indirizzo. Puoi rifare la prova quando vuoi.');

  // Moduli pesanti caricati solo qui: la prima pagina della Bussola resta leggera.
  const [{completion, courseDetails}, {participantCertificate}, {certificateCanvas}] = await Promise.all([
    import('./bussola-records-core.mjs?v=20261115-riordino'),
    import('./bussola-attestato-alunno-core.mjs?v=20261115-riordino'),
    import('./bussola-attestati-render.mjs?v=20261115-riordino'),
  ]);
  const payload = carico.project.payload;
  let finito = false;
  try { finito = completion({payload}).completed; } catch { /* formato non riconosciuto */ }
  if (!finito) return nonConcluso(ritorno);

  let identita = null;
  try { const i = await chiama(API_GESTIONE, token, {action: 'identity'}); if (i.alunno) identita = i; } catch { /* senza classe: nome dal link */ }
  const nome = identita?.alunno ? `${identita.alunno.nome} ${identita.alunno.cognome}` : nomeCompleto(ritorno.nome && ritorno.cognome ? ritorno : null);

  const attestatoEsistente = courseDetails(payload).journey?.attestato;
  const valido = /^[0-9a-f-]{36}$/i.test(attestatoEsistente?.id) && Number.isFinite(Date.parse(attestatoEsistente?.date));
  const id = valido ? attestatoEsistente.id : crypto.randomUUID(), data = valido ? attestatoEsistente.date : new Date().toISOString();

  async function schermoAttestato(nomeFinale) {
    const record = participantCertificate(payload, {identity: identita, name: nomeFinale, participant: carico.participant, revision: carico.project.revision, id, date: data});
    const canvas = await certificateCanvas(record);
    disegna(nomeFinale, canvas);
  }
  function disegna(nomeFinale, canvas) {
    const conclusi = [...new Set([...ritorno.conclusi, corso])];
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', `Attestato di ${nomeFinale}`);
    const giorni = OPEN_DAY.map(g => `${g.giorno.toLowerCase()} ${g.testo}, ${g.orario.charAt(0).toLowerCase()}${g.orario.slice(1)}`);
    const schermo = el('section', {class: 'bt-schermo'},
      el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Bentornato, ', el('em', {}, nomeFinale.split(' ')[0]), '!'),
      el('p', {class: 'bt-frase'}, `Ecco il tuo attestato di ${NOMI_BREVI[corso]}.`),
      el('figure', {class: 'bt-attestato__foglio'}, canvas),
      pulsanteImmagine(el, {corso, nome: nomeFinale, id: 'bentornatoScarica'}),
      // L'attestato si guarda a schermo; a casa il genitore c'è davvero: qui la richiesta via email è al posto giusto.
      bloccoEmailAttestato({corso, nome: nomeFinale, token}),
      el('ul', {class: 'bt-distintivi', 'aria-label': 'I distintivi ottenuti'}, conclusi.map(c => el('li', {}, el('span', {class: 'bt-distintivo bt-distintivo--piccolo', 'data-corso': c, 'aria-label': `${NOMI_BREVI[c]}: ottenuto`}, NOMI_BREVI[c])))),
      el('div', {class: 'bt-bentornato__azioni'},
        el('a', {class: 'bt-pulsante bt-pulsante--secondario', href: personalDestination('missioni.html', token), id: 'bentornatoAltro'}, 'Prova un altro indirizzo'),
        el('a', {class: 'bt-pulsante bt-pulsante--secondario', href: 'famiglie.html#iscrizione', id: 'bentornatoIscrizione'}, 'Come ci si iscrive')),
      el('p', {class: 'bt-finale__opendays'}, el('strong', {}, 'Open Day a Decimomannu: '), giorni.join(' · '), ` · ${OPEN_DAY_LUOGO}`),
      );
    mostra(schermo, corso);
  }

  if (nome) { try { return await schermoAttestato(nome); } catch (e) { return nonTrovato(e?.message || 'L’attestato non è pronto.'); } }
  // Il link non portava il nome: si chiede qui, senza salvarlo da nessuna parte.
  const n = el('input', {name: 'nome', type: 'text', maxlength: 80, autocomplete: 'given-name', required: true});
  const c = el('input', {name: 'cognome', type: 'text', maxlength: 80, autocomplete: 'family-name', required: true});
  const err = el('p', {class: 'bt-errore', role: 'alert'});
  const forma = el('form', {class: 'bt-modulo', novalidate: true}, el('label', {class: 'bt-campo'}, 'Nome', n), el('label', {class: 'bt-campo'}, 'Cognome', c), err,
    el('button', {class: 'bt-pulsante bt-pulsante--grande', type: 'submit'}, 'Vedi l’attestato'));
  forma.addEventListener('submit', async e => {
    e.preventDefault();
    const a = pulisciNome(n.value), b = pulisciNome(c.value);
    if (!a || !b) { err.textContent = 'Scrivi il tuo nome e il tuo cognome.'; return; }
    try { await schermoAttestato(`${a} ${b}`); } catch (x) { err.textContent = x?.message || 'L’attestato non è pronto.'; }
  });
  mostra(el('section', {class: 'bt-schermo'}, el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Bentornato! ', el('em', {}, 'Come ti chiami?')), el('p', {class: 'bt-frase'}, 'Il nome va sull’attestato.'), forma), corso);
}

function nonTrovato(messaggio) {
  const inizia = el('button', {class: 'bt-pulsante bt-pulsante--grande', type: 'button'}, 'Chiudi');
  inizia.addEventListener('click', () => dialogo.close());
  mostra(el('section', {class: 'bt-schermo'}, el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Non lo trovo'), el('p', {class: 'bt-frase', role: 'alert'}, messaggio), inizia));
}
function nonConcluso({token, corso}) {
  const riprendi = el('a', {class: 'bt-pulsante bt-pulsante--grande', href: personalDestination(`bussola-${corso}.html`, token)}, 'Riprendi la prova');
  mostra(el('section', {class: 'bt-schermo'}, el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'La prova ', el('em', {}, 'non è finita')), el('p', {class: 'bt-frase'}, `Riprendi ${NOMI_BREVI[corso]} da dove eri rimasto: l’attestato arriva alla fine.`), riprendi), corso);
}

// ---- collegamenti della prima pagina -------------------------------------------------------------------
function avvia() {
  const link = document.getElementById('linkCodice');
  link?.addEventListener('click', e => { e.preventDefault(); apriCodice(); });
  const ritorno = leggiRitorno(location.hash);
  if (ritorno) apriBentornato(ritorno);
  else if (location.hash === '#codice') apriCodice();
  // Un link di ritorno aperto mentre la pagina è già aperta (stessa pagina, solo la parte dopo «#» cambia).
  window.addEventListener('hashchange', () => { const r = leggiRitorno(location.hash); if (r) apriBentornato(r); });
}
if (typeof document !== 'undefined' && document.getElementById('linkCodice')) avvia();
