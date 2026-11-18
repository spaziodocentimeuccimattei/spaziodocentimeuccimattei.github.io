// Codice breve personale per il ritorno da casa (riordino novembre 2026, agente A11).
// Caricato SOLO con CODICE_BREVE_ATTIVO acceso (import dinamico da bussola-finale-comune.mjs e bussola-bentornato.mjs):
// con l'interruttore spento questo file non viene nemmeno scaricato e non parte alcuna richiesta.
// Lato server: supabase/sql/bussola-codice-ritorno.sql e azioni codice_ottieni / codice_apri di bussola-esperienze.
// Il codice è un puntatore casuale al partecipante: non contiene dati personali. Il nome resta sul dispositivo
// (o si scrive qui, senza salvarlo da nessuna parte) e il server non lo vede.
import {pulsanteImmagine, pulsanteAttestato} from './bussola-scarica.mjs?v=20261118-qr';
import {CODICE_BREVE_ATTIVO} from './bussola-interruttori.mjs?v=20261118-qr';
import {CORSI, NOMI_BREVI, nomeOspite, nomeCompleto, pulisciNome} from './bussola-locale.mjs?v=20261115-riordino';
import {OPEN_DAY, OPEN_DAY_LUOGO} from './bussola-prossimo-passo.mjs?v=20261115-riordino';

const prova = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('prova');
const API = prova ? '/__test/bussola-esperienze' : 'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-esperienze';
// Stesso alfabeto del server: senza 0/O, 1/I e L. I codici delle classi possono contenere la L, questi mai.
const PERSONALE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

/** Il testo scritto dal ragazzo, ripulito: maiuscole, senza spazi né trattini. */

export function normalizza(testo) { return typeof testo === 'string' ? testo.replace(/[\s-]/g, '').toUpperCase() : ''; }
/** Vero se può essere un codice personale (6 caratteri dell'alfabeto, senza L). */
export function eCodicePersonale(testo) { return PERSONALE.test(normalizza(testo)); }

async function chiama(token, corpo) {
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(API, {method: 'POST', headers: {'Content-Type': 'application/json', ...(token ? {'x-bussola-token': token} : {})}, body: JSON.stringify(corpo), signal: ctrl.signal});
    const dati = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(dati.error || 'Non riesco a collegarmi. Riprova.'), {stato: r.status});
    return dati;
  } finally { clearTimeout(timer); }
}

/** Chiede al server il codice del partecipante (lo crea se manca). Stringa vuota se non disponibile. */
export async function ottieniCodice(token) {
  if (!CODICE_BREVE_ATTIVO || !token) return '';
  const r = await chiama(token, {action: 'codice_ottieni', corso: 'afm'});
  return PERSONALE.test(r.codice || '') ? r.codice : '';
}

/**
 * Riapre il lavoro con il codice e mostra «Bentornato» con l'attestato.
 * `ui` arriva da bussola-bentornato.mjs: { el, mostra, nonTrovato }.
 * Lancia un Error con un messaggio per il ragazzo se il codice non funziona (resta nel campo «Ho un codice»).
 */
export async function apriConCodice(testo, ui) {
  if (!CODICE_BREVE_ATTIVO) throw new Error('Non riconosco questo codice.');
  const codice = normalizza(testo);
  let dati;
  try { dati = await chiama('', {action: 'codice_apri', corso: 'afm', codice}); }
  catch (e) {
    throw new Error(e.stato === 404 ? 'Il codice non è valido. Controlla di averlo scritto bene.' : e.stato === 429 ? 'Troppi tentativi. Aspetta qualche minuto e riprova.' : 'Non riesco a collegarmi. Controlla la connessione e riprova.');
  }
  const {el, mostra} = ui;
  const [{completion, courseDetails}, {participantCertificate}, {certificateCanvas}] = await Promise.all([
    import('./bussola-records-core.mjs?v=20261115-riordino'),
    import('./bussola-attestato-alunno-core.mjs?v=20261115-riordino'),
    import('./bussola-attestati-render.mjs?v=20261115-riordino'),
  ]);
  // Gli indirizzi conclusi: il più recente per primo.
  const conclusi = (dati.projects || []).filter(p => CORSI.includes(p.corso) && p.payload).filter(p => { try { return completion({payload: p.payload}).completed; } catch { return false; } })
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  if (!conclusi.length) {
    mostra(el('section', {class: 'bt-schermo'},
      el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Bentornato!'),
      el('p', {class: 'bt-frase'}, 'La prova non è ancora finita: l’attestato arriva alla fine. Riprendila dal dispositivo dove l’hai iniziata.'),
      el('a', {class: 'bt-pulsante bt-pulsante--grande', href: 'missioni.html'}, 'Vai alle prove')));
    return;
  }
  const mostrati = new Set(conclusi.map(p => p.corso));

  async function schermoAttestato(progetto, nome) {
    const attestato = courseDetails(progetto.payload).journey?.attestato;
    const valido = /^[0-9a-f-]{36}$/i.test(attestato?.id) && Number.isFinite(Date.parse(attestato?.date));
    const record = participantCertificate(progetto.payload, {identity: null, name: nome, participant: dati.participant, revision: progetto.revision, id: valido ? attestato.id : crypto.randomUUID(), date: valido ? attestato.date : new Date().toISOString()});
    const canvas = await certificateCanvas(record);
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', `Attestato di ${nome}`);
    const giorni = OPEN_DAY.map(g => `${g.giorno.toLowerCase()} ${g.testo}, ${g.orario.charAt(0).toLowerCase()}${g.orario.slice(1)}`);
    const altri = conclusi.filter(p => p.corso !== progetto.corso).map(p => {
      const b = el('button', {class: 'bt-link', type: 'button', 'data-corso': p.corso}, `Attestato di ${NOMI_BREVI[p.corso]}`);
      b.addEventListener('click', () => schermoAttestato(p, nome).catch(() => {}));
      return b;
    });
    mostra(el('section', {class: 'bt-schermo'},
      el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Bentornato, ', el('em', {}, nome.split(' ')[0]), '!'),
      el('p', {class: 'bt-frase'}, `Ecco il tuo attestato di ${NOMI_BREVI[progetto.corso]}.`),
      el('figure', {class: 'bt-attestato__foglio'}, canvas),
      el('div', {class: 'bt-bentornato__azioni'}, pulsanteAttestato(el, {canvas, corso: progetto.corso, nome, id: 'bentornatoAttestato'})),
      pulsanteImmagine(el, {corso: progetto.corso, nome, id: 'bentornatoScarica'}),
      altri.length ? el('p', {class: 'bt-nota'}, ...altri) : null,
      el('ul', {class: 'bt-distintivi', 'aria-label': 'I distintivi ottenuti'}, [...mostrati].map(c => el('li', {}, el('span', {class: 'bt-distintivo bt-distintivo--piccolo', 'data-corso': c, 'aria-label': `${NOMI_BREVI[c]}: ottenuto`}, NOMI_BREVI[c])))),
      el('div', {class: 'bt-bentornato__azioni'},
        el('a', {class: 'bt-pulsante bt-pulsante--secondario', href: 'missioni.html', id: 'bentornatoAltro'}, 'Prova un altro indirizzo'),
        el('a', {class: 'bt-pulsante bt-pulsante--secondario', href: 'famiglie.html#iscrizione', id: 'bentornatoIscrizione'}, 'Come ci si iscrive')),
      el('p', {class: 'bt-finale__opendays'}, el('strong', {}, 'Open Day a Decimomannu: '), giorni.join(' · '), ` · ${OPEN_DAY_LUOGO}`)), progetto.corso);
  }

  // Il server non conosce il nome: se questo dispositivo lo ricorda lo usa, altrimenti lo chiede qui (senza salvarlo).
  const noto = nomeCompleto(nomeOspite());
  if (noto) return schermoAttestato(conclusi[0], noto);
  const n = el('input', {name: 'nome', type: 'text', maxlength: 80, autocomplete: 'given-name', required: true});
  const c = el('input', {name: 'cognome', type: 'text', maxlength: 80, autocomplete: 'family-name', required: true});
  const err = el('p', {class: 'bt-errore', role: 'alert'});
  const forma = el('form', {class: 'bt-modulo', novalidate: true}, el('label', {class: 'bt-campo'}, 'Nome', n), el('label', {class: 'bt-campo'}, 'Cognome', c), err,
    el('button', {class: 'bt-pulsante bt-pulsante--grande', type: 'submit'}, 'Vedi l’attestato'));
  forma.addEventListener('submit', async e => {
    e.preventDefault();
    const a = pulisciNome(n.value), b = pulisciNome(c.value);
    if (!a || !b) { err.textContent = 'Scrivi il tuo nome e il tuo cognome.'; return; }
    try { await schermoAttestato(conclusi[0], `${a} ${b}`); } catch (x) { err.textContent = x?.message || 'L’attestato non è pronto.'; }
  });
  mostra(el('section', {class: 'bt-schermo'}, el('h1', {class: 'bt-titolo', id: 'bentornatoTitolo', tabindex: '-1'}, 'Bentornato! ', el('em', {}, 'Come ti chiami?')), el('p', {class: 'bt-frase'}, 'Il nome va sull’attestato. Resta solo su questo schermo.'), forma), conclusi[0].corso);
}
