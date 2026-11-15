// Ingresso unico dei cinque percorsi: «Come ti chiami?» (riordino novembre 2026, agente A3).
// Al posto della finestra «Come vuoi iniziare?». Firma e istruzioni: docs/bussola/riordino-2026-11/INGRESSO-FINALE.md
import {nomeOspite, salvaNomeOspite, azzeraLavoroLocale, pulisciNome, nomeCompleto, NOMI_BREVI} from './bussola-locale.mjs?v=20261115-riordino';

function el(tag, attributi = {}, ...figli) {
  const nodo = document.createElement(tag);
  for (const [k, v] of Object.entries(attributi)) { if (v === true) nodo.setAttribute(k, ''); else if (v !== false && v != null) nodo.setAttribute(k, v); }
  nodo.append(...figli.flat().filter(f => f != null));
  return nodo;
}
const campo = (etichetta, nome, extra = {}) => {
  const input = el('input', { name: nome, type: 'text', maxlength: 80, autocomplete: 'off', required: true, ...extra });
  return { riga: el('label', { class: 'bt-campo' }, etichetta, input), input };
};

/**
 * Mostra l'ingresso nel contenitore. Restituisce una promessa che si chiude quando l'ingresso è finito
 * (dopo onInizia, oppure dopo onIndietro).
 *
 * @param {object} o
 * @param {string} o.corso            'afm' | 'sia' | 'turismo' | 'ssas' | 'cat'
 * @param {Element} o.contenitore     dove disegnare lo schermo (viene svuotato)
 * @param {object|null} [o.classe]    il valore restituito da setupClass(...) di bussola-classe.mjs
 *                                    (con ctx.ingressoComune:true); se manca, niente codice classe
 * @param {(nome:string,cognome:string)=>any} o.onInizia  chiamata quando l'alunno è pronto; può essere asincrona
 * @param {()=>any} [o.onNuovo]       «Non sono <nome>»: la stessa funzione di «Inizia da capo» della prova (nome, distintivi, codice
 *                                    personale e lavoro corrente dimenticati, lavoro nuovo, fuori dalla classe di prima)
 * @param {()=>any} [o.onIndietro]    se c'è, compare «Indietro»
 */
export async function mostraIngresso({corso, contenitore, classe = null, onInizia, onNuovo = null, onIndietro = null}) {
  const principale = contenitore.closest('main');
  const chiudi = () => principale?.classList.remove('bt-scuro');
  principale?.classList.add('bt-scuro');

  // 1. Chi arriva con link di classe o personale ed è già riconosciuto non rivede lo schermo.
  if (classe) {
    contenitore.replaceChildren(el('section', {class: 'bt-schermo', 'data-corso': corso}, el('p', {class: 'bt-frase', role: 'status'}, 'Un attimo…')));
    let riconosciuto = null;
    try { await classe.ready; riconosciuto = await classe.identity(); } catch { /* si prosegue con lo schermo */ }
    if (riconosciuto?.alunno) {
      salvaNomeOspite(riconosciuto.alunno.nome, riconosciuto.alunno.cognome);
      try { await onInizia(riconosciuto.alunno.nome, riconosciuto.alunno.cognome); } finally { chiudi(); }
      return;
    }
  }

  return new Promise(fine => {
    const conclusione = () => { chiudi(); fine(); };
    const stato = classe?.stato?.() ?? {classe: '', info: null};
    const salvato = nomeOspite();
    let conCodice = !!stato.classe && !!stato.info;      // link di classe già riconosciuto: il codice è già lì
    const cod = campo('Codice della classe', 'codice', {autocapitalize: 'characters', spellcheck: 'false', maxlength: 120, placeholder: 'Per esempio LUNA24'});
    cod.input.required = false;
    cod.input.value = stato.classe && stato.classe.length === 6 ? stato.classe : '';
    const infoClasse = el('p', {class: 'bt-nota', role: 'status'}, stato.info ? `Classe: ${stato.info.scuola} · ${stato.info.classe}` : '');
    const blocco = el('div', {class: 'bt-ingresso__codice', hidden: !conCodice}, cod.riga, infoClasse);
    const errore = el('p', {class: 'bt-errore', role: 'alert'});
    const nota = el('p', {class: 'bt-nota'});
    const vai = el('button', {class: 'bt-pulsante bt-pulsante--grande', type: 'submit'}, 'Inizia');
    const interruttore = el('button', {class: 'bt-link', type: 'button'}, 'Ho un codice classe');
    const forma = el('form', {class: 'bt-modulo', novalidate: true});

    let nome, cognome, titolo, frase, nonSono = null;
    if (salvato) {
      // Stesso dispositivo, nome già noto (per esempio dopo il primo indirizzo): conferma con un tocco.
      titolo = el('h1', {class: 'bt-titolo', id: 'stageTitle', tabindex: '-1'}, 'Ciao ', el('em', {}, salvato.nome), '!');
      frase = el('p', {class: 'bt-frase'}, 'Continuiamo con il tuo nome.');
      nonSono = el('button', {class: 'bt-link', type: 'button'}, `Non sono ${salvato.nome}`);
      forma.append(vai);
    } else {
      titolo = el('h1', {class: 'bt-titolo', id: 'stageTitle', tabindex: '-1'}, 'Come ti ', el('em', {}, 'chiami'), '?');
      frase = el('p', {class: 'bt-frase'}, 'Il tuo nome va sull’attestato.');
      nome = campo('Nome', 'nome', {autocomplete: 'given-name', placeholder: 'Il tuo nome'});
      cognome = campo('Cognome', 'cognome', {autocomplete: 'family-name', placeholder: 'Il tuo cognome'});
      forma.append(nome.riga, cognome.riga, blocco, errore, vai);
    }

    const aggiornaNota = () => {
      nota.textContent = conCodice
        ? 'Con il codice, nome e cognome arrivano al tuo docente.'
        : 'Nome e cognome restano su questo dispositivo.';
      interruttore.textContent = conCodice ? 'Non ho un codice' : 'Ho un codice classe';
      blocco.hidden = !conCodice;
    };
    aggiornaNota();
    interruttore.addEventListener('click', () => {
      conCodice = !conCodice; errore.textContent = ''; aggiornaNota();
      if (conCodice) (cod.input.value ? vai : cod.input).focus();
    });

    // Il codice viene controllato quando si esce dal campo, come nella finestra «La mia classe».
    cod.input.addEventListener('blur', async () => {
      if (!classe || !cod.input.value.trim()) return;
      try { const info = await classe.anteprima(cod.input.value); infoClasse.textContent = `Classe: ${info.scuola} · ${info.classe}`; errore.textContent = ''; }
      catch (e) { infoClasse.textContent = ''; errore.textContent = e.message; }
    });
    cod.input.addEventListener('input', () => { infoClasse.textContent = ''; errore.textContent = ''; });

    forma.addEventListener('submit', async evento => {
      evento.preventDefault();
      errore.textContent = '';
      let n = salvato?.nome, c = salvato?.cognome;
      if (!salvato) {
        n = pulisciNome(nome.input.value); c = pulisciNome(cognome.input.value);
        nome.input.setAttribute('aria-invalid', String(!n)); cognome.input.setAttribute('aria-invalid', String(!c));
        if (!n || !c) { errore.textContent = 'Scrivi il tuo nome e il tuo cognome.'; (!n ? nome : cognome).input.focus(); return; }
      }
      vai.disabled = true;
      try {
        if (conCodice && !salvato) {
          if (!cod.input.value.trim()) { errore.textContent = 'Scrivi il codice della classe, oppure tocca «Non ho un codice».'; cod.input.focus(); return; }
          const identita = await classe.iscrivi(cod.input.value, n, c);
          if (identita?.alunno) { n = identita.alunno.nome; c = identita.alunno.cognome; }
        }
        salvaNomeOspite(n, c);
        await onInizia(n, c);
        conclusione();
      } catch (e) {
        errore.textContent = e?.message || 'Non riesco a iniziare. Riprova.';
      } finally { vai.disabled = false; }
    });

    nonSono?.addEventListener('click', () => {
      if (onNuovo) { nonSono.disabled = true; Promise.resolve(onNuovo()).then(fine, () => { nonSono.disabled = false; }); return; }
      azzeraLavoroLocale();
      document.dispatchEvent(new CustomEvent('bussola-progetto-nuovo'));
      mostraIngresso({corso, contenitore, classe, onInizia, onNuovo, onIndietro}).then(fine);
    });

    const piede = el('div', {class: 'bt-ingresso__piede'}, salvato ? nonSono : interruttore);
    if (onIndietro) {
      const indietro = el('button', {class: 'bt-link', type: 'button'}, 'Indietro');
      indietro.addEventListener('click', () => { Promise.resolve(onIndietro()).finally(conclusione); });
      piede.append(indietro);
    }
    const schermo = el('section', {class: 'bt-schermo bt-ingresso', 'data-corso': corso, 'aria-label': `Ingresso ${NOMI_BREVI[corso] ?? ''}`.trim()}, titolo, frase, forma, nota, piede);
    contenitore.replaceChildren(schermo);
    (salvato ? vai : nome.input).focus({preventScroll: true});
  });
}
