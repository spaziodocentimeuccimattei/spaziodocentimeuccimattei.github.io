// Finale unico dei cinque percorsi: quattro schermi in fila, ciascuno con un solo «Avanti» (riordino novembre 2026, agente A3).
//  1. «In questo indirizzo fai tre cose»   2. l'attestato che esplode (+ QR per il ritorno da casa)
//  3. il video dell'indirizzo               4. «Prova un altro indirizzo»
// Firma e istruzioni: docs/bussola/riordino-2026-11/INGRESSO-FINALE.md
import {esplosione, premio} from './bussola-effetti.mjs?v=20261114-tema';
import {OPEN_DAY} from './bussola-prossimo-passo.mjs?v=20261114-a3';
import {sharedParticipant, personalDestination} from './bussola-identita.mjs?v=20261019-monitor';
import {CORSI, NOMI_BREVI, NOMI_CORSI, nomeOspite, nomeCompleto, salvaNomeOspite, pulisciNome, distintivi, aggiungiDistintivo, linkRitorno} from './bussola-locale.mjs?v=20261114-a3';
import {qrElemento} from './bussola-qr.mjs?v=20261114-a3';
import {EMAIL_ATTIVA, CODICE_BREVE_ATTIVO} from './bussola-interruttori.mjs?v=20261114-a3';

function el(tag, attributi = {}, ...figli) {
  const nodo = document.createElement(tag);
  for (const [k, v] of Object.entries(attributi)) { if (v === true) nodo.setAttribute(k, ''); else if (v !== false && v != null) nodo.setAttribute(k, v); }
  nodo.append(...figli.flat().filter(f => f != null));
  return nodo;
}
const SIGLA_VIDEO = corso => `presentazione-orientamento/assets/video/${corso}`;

/** Stampa l'attestato (un'immagine dal canvas) senza dipendere dalla finestra dell'attestato di ogni percorso. */
async function stampaCanvas(canvas) {
  const img = el('img', {alt: 'Attestato', src: canvas.toDataURL('image/jpeg', 0.92)});
  const foglio = el('div', {class: 'bt-stampa'}, img);
  document.body.append(foglio);
  document.body.classList.add('bt-stampa-attiva');
  const pulisci = () => { document.body.classList.remove('bt-stampa-attiva'); foglio.remove(); window.removeEventListener('afterprint', pulisci); };
  window.addEventListener('afterprint', pulisci);
  try { await img.decode(); } catch { /* si stampa comunque */ }
  window.print();
}

/** Biglietto per il ritorno da casa: QR (link personale) e, quando sarà attivo sul server, il codice breve. */
export function biglietto({corso, token, persona = null, conclusi = [], salvato = () => true, codiceBreve = ''}) {
  const scheda = el('div', {class: 'bt-biglietto', 'data-corso': corso});
  const qr = el('div', {class: 'bt-biglietto__qr'});
  const frase = el('p', {class: 'bt-biglietto__frase'}, 'A casa, con i tuoi genitori, torna qui: scarichi l’attestato e scopri di più.');
  const etichetta = el('p', {class: 'bt-biglietto__etichetta'}, 'Per tornare da casa');
  scheda.append(etichetta);
  // Codice breve: compare solo con CODICE_BREVE_ATTIVO, dopo che il server lo ha dato. Spento, qui non cambia nulla.
  const codice = CODICE_BREVE_ATTIVO ? el('p', {class: 'bt-biglietto__codice', hidden: true, 'aria-label': 'Il tuo codice personale'}) : null;
  const mostraCodice = c => { codice.textContent = c; codice.hidden = false; etichetta.textContent = 'Il tuo codice'; frase.textContent = 'Scrivilo: a casa, con i tuoi genitori, torna qui.'; };
  if (codice) { scheda.append(codice); if (codiceBreve) mostraCodice(codiceBreve); }
  scheda.append(frase, qr);
  const copia = el('button', {class: 'bt-link bt-ritorno__copia', type: 'button', hidden: true}, 'Copia il link');
  scheda.append(copia);

  const disegna = async () => {
    qr.replaceChildren(el('span', {}, '…'));
    let pronto = true;
    try { pronto = await salvato(); } catch { pronto = false; }
    const link = pronto ? linkRitorno({token, corso, persona, conclusi}) : '';
    if (!link) {
      const riprova = el('button', {class: 'bt-link', type: 'button'}, 'Riprova');
      riprova.addEventListener('click', disegna);
      qr.replaceChildren(el('span', {}, 'Il QR sarà pronto quando il lavoro è salvato online. '), riprova);
      copia.hidden = true;
      return;
    }
    qr.replaceChildren(qrElemento(link, 'Codice QR: inquadralo con il telefono per tornare qui da casa'));
    qr.dataset.link = link;
    if (codice && codice.hidden) import('./bussola-ritorno-codice.mjs?v=20261115-a11').then(m => m.ottieniCodice(token)).then(c => { if (c) mostraCodice(c); }).catch(() => { /* il QR basta */ });
    copia.hidden = !navigator.clipboard?.writeText;
    copia.onclick = async () => { try { await navigator.clipboard.writeText(link); copia.textContent = 'Link copiato'; } catch { copia.textContent = 'Non riesco a copiare'; } };
  };
  disegna();
  return scheda;
}

/** Campo facoltativo per l'email di un genitore. Compare solo con EMAIL_ATTIVA. */
function bloccoEmail(salvaEmail) {
  if (!EMAIL_ATTIVA) return null;
  const email = el('input', {type: 'email', name: 'email', autocomplete: 'email', placeholder: 'nome@esempio.it', maxlength: 160});
  const consenso = el('input', {type: 'checkbox', name: 'consenso'});
  const stato = el('p', {class: 'bt-nota', role: 'status'});
  const invia = el('button', {class: 'bt-pulsante bt-pulsante--secondario bt-pulsante--piccolo', type: 'button'}, 'Conferma');
  invia.addEventListener('click', async () => {
    if (!email.value.trim()) { stato.textContent = ''; return; }
    if (!email.validity.valid) { stato.textContent = 'Controlla l’indirizzo email.'; return; }
    if (!consenso.checked) { stato.textContent = 'Serve la spunta del genitore.'; return; }
    try { await salvaEmail?.({email: email.value.trim(), consenso: true}); stato.textContent = 'Fatto. Grazie!'; } catch (e) { stato.textContent = e?.message || 'Non riesco a salvare.'; }
  });
  return el('div', {class: 'bt-email'},
    el('label', {class: 'bt-campo'}, 'Email di un genitore: te lo mandiamo lì', email),
    el('label', {class: 'bt-email__consenso'}, consenso, el('span', {}, 'Un genitore è d’accordo: la scuola userà questa email solo per mandare l’attestato.')),
    invia, stato);
}

/**
 * Mostra il finale nel contenitore.
 * @param {object} o
 * @param {string} o.corso
 * @param {Element} o.contenitore
 * @param {string} [o.nome]           nome e cognome da mostrare (se manca si usa quello salvato sul dispositivo)
 * @param {string[]} o.treCose        tre voci brevi: che cosa si fa in questo indirizzo (se mancano, il primo schermo si salta)
 * @param {()=>Promise<{canvas:HTMLCanvasElement,file:{url:string,name:string}}>} o.apriAttestato
 *        prepara l'attestato (di solito `()=>attestato.prepara()` di setupParticipantCertificate)
 * @param {()=>any} [o.rivediLavoro]  apre il riepilogo del lavoro (link discreto «Rivedi il tuo lavoro»)
 * @param {string|(()=>string)} [o.token]  codice personale lungo (se manca: quello condiviso del dispositivo)
 * @param {()=>boolean|Promise<boolean>} [o.salvato]  vero se il lavoro è già salvato online (serve al QR)
 * @param {(dati:{email:string,consenso:boolean})=>any} [o.salvaEmail]  usata solo con EMAIL_ATTIVA
 */
export function mostraFinale({corso, contenitore, nome = '', treCose = [], apriAttestato, rivediLavoro, token, salvato, salvaEmail}) {
  const principale = contenitore.closest('main');
  principale?.classList.add('bt-scuro');
  const conclusi = aggiungiDistintivo(corso);            // il distintivo si ottiene a fine prova
  const voci = (treCose || []).filter(t => typeof t === 'string' && t.trim()).slice(0, 3);
  const passi = [...(voci.length === 3 ? ['cose'] : []), 'attestato', 'video', 'altri'];
  let indice = 0, attestatoPronto = null, esploso = false, nomeMostrato = nome;
  const radice = el('div', {class: 'bt-finale', 'data-corso': corso});
  contenitore.replaceChildren(radice);

  const vai = n => { indice = Math.max(0, Math.min(passi.length - 1, n)); disegna(); radice.scrollIntoView?.({block: 'start'}); };
  const barra = () => {
    const lista = el('ol', {class: 'bt-passi bt-finale__passi', 'aria-label': `Schermo ${indice + 1} di ${passi.length}`});
    passi.forEach((_, i) => lista.append(el('li', {class: i < indice ? 'bt-fatto' : '', 'aria-current': i === indice ? 'step' : null}, el('span', {class: 'bt-nascosto-visivamente'}, String(i + 1)))));
    return lista;
  };
  const avanti = (testo = 'Avanti', classe = 'bt-pulsante bt-pulsante--grande') => {
    const b = el('button', {class: classe, type: 'button', id: 'finaleAvanti'}, testo);
    b.addEventListener('click', () => vai(indice + 1));
    return b;
  };
  const piede = () => {
    const nodo = el('div', {class: 'bt-finale__piede'});
    if (indice > 0) { const b = el('button', {class: 'bt-link', type: 'button'}, 'Indietro'); b.addEventListener('click', () => vai(indice - 1)); nodo.append(b); }
    if (typeof rivediLavoro === 'function') { const b = el('button', {class: 'bt-link', type: 'button', id: 'finaleRivedi'}, 'Rivedi il tuo lavoro'); b.addEventListener('click', () => rivediLavoro()); nodo.append(b); }
    return nodo;
  };

  // ---- schermi ----------------------------------------------------------------------------------
  function schermoCose() {
    return el('section', {class: 'bt-schermo', 'aria-labelledby': 'finaleTitolo'},
      barra(),
      el('h1', {class: 'bt-titolo', id: 'finaleTitolo', tabindex: '-1'}, 'In questo indirizzo ', el('em', {}, 'fai tre cose')),
      el('ol', {class: 'bt-trecose'}, voci.map(v => el('li', {}, v))),
      avanti(), piede());
  }

  function schermoAttestato() {
    const sezione = el('section', {class: 'bt-esplosione bt-attestato', 'aria-labelledby': 'finaleTitolo'});
    sezione.append(barra());
    const persona = nomeOspite();
    const mostrato = nomeMostrato || nomeCompleto(persona);
    const titolo = el('h1', {class: `bt-titolo bt-attestato__nome${mostrato.length > 14 ? ' bt-titolo--medio' : ''}`, id: 'finaleTitolo', tabindex: '-1'}, mostrato || 'Il tuo attestato');
    const zona = el('div', {class: 'bt-attestato__attendi'}, el('p', {class: 'bt-frase', role: 'status'}, 'Preparo il tuo attestato…'));
    sezione.append(el('p', {class: 'bt-occhiello bt-occhiello--corso'}, `Hai finito ${NOMI_BREVI[corso]}`), titolo);
    const dopo = el('div', {class: 'bt-azioni'});
    const coda = el('div', {class: 'bt-attestato__azioni'});
    const corpo = el('div', {class: 'bt-attestato__corpo'}, zona, coda);
    sezione.append(corpo, piede());
    if (!esploso) { esploso = true; queueMicrotask(() => esplosione(sezione, corso)); }

    const chiediNome = (messaggio = '') => {
      const n = el('input', {name: 'nome', type: 'text', maxlength: 80, autocomplete: 'given-name', required: true});
      const c = el('input', {name: 'cognome', type: 'text', maxlength: 80, autocomplete: 'family-name', required: true});
      const err = el('p', {class: 'bt-errore', role: 'alert'}, messaggio);
      const forma = el('form', {class: 'bt-modulo', novalidate: true},
        el('label', {class: 'bt-campo'}, 'Nome', n), el('label', {class: 'bt-campo'}, 'Cognome', c), err,
        el('button', {class: 'bt-pulsante bt-pulsante--grande', type: 'submit'}, 'Vedi l’attestato'));
      forma.addEventListener('submit', e => {
        e.preventDefault();
        if (!pulisciNome(n.value) || !pulisciNome(c.value)) { err.textContent = 'Scrivi il tuo nome e il tuo cognome.'; return; }
        salvaNomeOspite(n.value, c.value); nomeMostrato = ''; attestatoPronto = null; disegna();
      });
      zona.replaceChildren(el('p', {class: 'bt-frase'}, 'Come ti chiami? Il nome va sull’attestato.'), forma);
      n.focus({preventScroll: true});
    };

    (attestatoPronto ??= Promise.resolve().then(apriAttestato)).then(r => {
      if (!sezione.isConnected) return;
      const nomeAtt = r?.name || mostrato;
      if (nomeAtt && titolo.textContent !== nomeAtt) { titolo.textContent = nomeAtt; titolo.classList.toggle('bt-titolo--medio', nomeAtt.length > 14); }
      const foglio = el('figure', {class: 'bt-attestato__foglio'});
      if (r?.canvas) { r.canvas.setAttribute('role', 'img'); r.canvas.setAttribute('aria-label', `Attestato di ${nomeAtt}`); foglio.append(r.canvas); }
      zona.replaceChildren(foglio);
      const scarica = el('a', {class: 'bt-pulsante', href: r.file.url, download: r.file.name, id: 'finaleScarica'}, 'Scarica');
      const stampa = el('button', {class: 'bt-pulsante bt-pulsante--secondario', type: 'button', id: 'finaleStampa'}, 'Stampa');
      stampa.addEventListener('click', () => stampaCanvas(r.canvas));
      dopo.append(scarica, stampa);
      const tok = typeof token === 'function' ? token() : token || sharedParticipant();
      const bigl = tok ? biglietto({corso, token: tok, persona: nomeOspite(), conclusi, salvato}) : null;
      coda.append(...[dopo, bigl, bloccoEmail(salvaEmail), avanti('Avanti', 'bt-pulsante bt-pulsante--secondario bt-pulsante--grande')].filter(Boolean));
    }).catch(e => {
      attestatoPronto = null;
      if (!sezione.isConnected) return;
      if (/nome/i.test(e?.message || '')) { chiediNome(); return; }
      const riprova = el('button', {class: 'bt-pulsante', type: 'button'}, 'Riprova');
      riprova.addEventListener('click', disegna);
      zona.replaceChildren(el('p', {class: 'bt-frase', role: 'alert'}, 'L’attestato non è pronto.'), riprova);
      coda.append(avanti('Avanti', 'bt-pulsante bt-pulsante--secondario bt-pulsante--grande'));
    });
    return sezione;
  }

  function schermoVideo() {
    const base = SIGLA_VIDEO(corso);
    const video = el('video', {preload: 'none', playsinline: true, poster: `${base}-copertina.jpg`, width: 1280, height: 720, 'aria-label': `Video dell’indirizzo ${NOMI_BREVI[corso]}`},
      el('source', {src: `${base}.mp4`, type: 'video/mp4'}));
    const parti = el('button', {class: 'bt-pulsante bt-pulsante--lime bt-pulsante--grande bt-pulsa', type: 'button', id: 'finaleVideo'}, '▶ Guarda il video');
    const velo = el('div', {class: 'bt-video__avvia'}, parti);
    const prosegui = avanti('Avanti', 'bt-pulsante bt-pulsante--secondario bt-pulsante--grande');
    parti.addEventListener('click', () => { video.controls = true; velo.hidden = true; const p = video.play(); p?.catch?.(() => { velo.hidden = false; }); });
    video.addEventListener('ended', () => { prosegui.className = 'bt-pulsante bt-pulsante--grande bt-pulsa'; });
    return el('section', {class: 'bt-schermo', 'aria-labelledby': 'finaleTitolo'},
      barra(),
      el('h1', {class: 'bt-titolo bt-titolo--medio', id: 'finaleTitolo', tabindex: '-1'}, 'Guarda come si vive ', el('em', {}, NOMI_BREVI[corso])),
      el('div', {class: 'bt-video'}, video, velo),
      prosegui, piede());
  }

  function schermoAltri() {
    const altri = CORSI.filter(c => c !== corso);
    const fatti = distintivi();
    const lista = el('ul', {class: 'bt-distintivi', 'aria-label': 'I tuoi distintivi'},
      CORSI.map(c => el('li', {}, el('span', {class: `bt-distintivo bt-distintivo--piccolo${fatti.includes(c) ? '' : ' bt-distintivo--spento'}`, 'data-corso': c, 'aria-label': `${NOMI_BREVI[c]}: ${fatti.includes(c) ? 'ottenuto' : 'da provare'}`}, NOMI_BREVI[c]))));
    const bottoni = el('ul', {class: 'bt-altri'}, altri.map(c => el('li', {},
      el('a', {class: 'bt-pulsante', 'data-corso': c, 'data-fatto': fatti.includes(c) ? '' : null, href: personalDestination(`bussola-${c}.html`)}, el('strong', {}, NOMI_BREVI[c]), el('small', {}, NOMI_BREVI[c] === NOMI_CORSI[c] ? '' : NOMI_CORSI[c])))));
    const video = el('p', {class: 'bt-finale__video'}, el('span', {}, 'Guarda gli altri video:'),
      ...altri.map(c => el('a', {class: 'bt-link', href: `indirizzi.html#video-${c}`}, NOMI_BREVI[c])),
      el('a', {class: 'bt-link', href: 'index.html#video-scuola'}, 'La storia del Mattei'));
    const giorni = OPEN_DAY.map(g => `${g.giorno.toLowerCase()} ${g.testo}, ${g.orario.charAt(0).toLowerCase()}${g.orario.slice(1)}`);
    const open = el('p', {class: 'bt-finale__opendays'}, el('strong', {}, 'Open Day a Decimomannu: '), giorni.join(' · '));
    const schermo = el('section', {class: 'bt-schermo', 'aria-labelledby': 'finaleTitolo'},
      barra(), lista,
      el('h1', {class: 'bt-titolo', id: 'finaleTitolo', tabindex: '-1'}, 'Prova un ', el('em', {}, 'altro indirizzo')),
      el('p', {class: 'bt-frase'}, 'Ogni indirizzo ha la sua prova, di pochi minuti.'),
      bottoni, el('div', {class: 'bt-finale__piccolo'}, video, open), piede());
    queueMicrotask(() => premio(schermo.querySelector(`.bt-distintivo[data-corso="${corso}"]`), corso));
    return schermo;
  }

  function disegna() {
    const costruttori = {cose: schermoCose, attestato: schermoAttestato, video: schermoVideo, altri: schermoAltri};
    radice.replaceChildren(costruttori[passi[indice]]());
    radice.querySelector('#finaleTitolo')?.focus({preventScroll: true});
  }
  disegna();
  return {vai, schermo: () => passi[indice]};
}
