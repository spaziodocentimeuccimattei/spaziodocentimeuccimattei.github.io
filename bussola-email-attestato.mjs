// Richiesta dell'attestato via email (novembre 2026). Usata dal finale delle prove e da «Bentornato».
// Compare solo con EMAIL_ATTIVA (bussola-interruttori.mjs): si accende dopo l'informativa privacy approvata
// dalla Dirigente e dopo l'applicazione al server di supabase/sql/bussola-richieste-attestato.sql.
// Regole: email di un genitore (sotto i 14 anni il consenso lo dà chi ha la responsabilità genitoriale,
// art. 8 GDPR e art. 2-quinquies del Codice privacy); la scuola la usa solo per mandare l'attestato;
// il server registra email, consenso, data e ora, versione dell'informativa. L'invio lo fa la scuola a mano
// dall'area docenti: nessun servizio di posta automatico.
import {EMAIL_ATTIVA, INFORMATIVA_URL, INFORMATIVA_VERSIONE} from './bussola-interruttori.mjs?v=20261118-qr';
import {sharedParticipant} from './bussola-identita.mjs?v=20261019-monitor';

const prova = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('prova');
const API = prova ? '/__test/bussola-esperienze' : 'https://ruplzgcnheddmqqdephp.supabase.co/functions/v1/bussola-esperienze';
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

function el(tag, attributi = {}, ...figli) {
  const nodo = document.createElement(tag);
  for (const [k, v] of Object.entries(attributi)) { if (v === true) nodo.setAttribute(k, ''); else if (v !== false && v != null) nodo.setAttribute(k, v); }
  nodo.append(...figli.flat().filter(f => f != null));
  return nodo;
}

async function invia({token, corso, nome, email}) {
  const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(API, {method: 'POST', signal: ctrl.signal, headers: {'Content-Type': 'application/json', 'x-bussola-token': token},
      body: JSON.stringify({action: 'attestato_email', corso, nome, email, consenso: true, informativa: INFORMATIVA_VERSIONE})});
    let d = {}; try { d = await r.json(); } catch { /* risposta vuota */ }
    if (!r.ok) throw new Error(d.error || 'Non riesco a salvare la richiesta. Riprova.');
    return d;
  } finally { clearTimeout(t); }
}

/**
 * Blocco «Vuoi riceverlo via email?». Chiuso all'inizio: si apre con un tocco, così lo schermo resta con un'azione principale.
 * @param {{corso:string, nome:string|(()=>string), token?:string|(()=>string)}} o
 * @returns {HTMLElement|null}  null quando EMAIL_ATTIVA è falso
 */
export function bloccoEmailAttestato({corso, nome, token}) {
  if (!EMAIL_ATTIVA) return null;
  const apri = el('button', {class: 'bt-link bt-email__apri', type: 'button', 'aria-expanded': 'false'}, 'Vuoi riceverlo via email?');
  const email = el('input', {type: 'email', name: 'email', autocomplete: 'email', inputmode: 'email', placeholder: 'nome@esempio.it', maxlength: 160, required: true});
  const consenso = el('input', {type: 'checkbox', name: 'consenso', required: true});
  const stato = el('p', {class: 'bt-nota', role: 'status'});
  const conferma = el('button', {class: 'bt-pulsante bt-pulsante--secondario', type: 'submit'}, 'Mandatemelo');
  const informativa = INFORMATIVA_URL
    ? el('a', {class: 'bt-link', href: INFORMATIVA_URL, target: '_blank', rel: 'noopener'}, 'informativa privacy')
    : el('span', {}, 'informativa privacy');
  const forma = el('form', {class: 'bt-email', novalidate: true, hidden: true},
    el('label', {class: 'bt-campo'}, 'Email di un genitore', email),
    el('label', {class: 'bt-email__consenso'}, consenso,
      el('span', {}, 'Sono il genitore e sono d’accordo: la scuola userà questa email solo per mandare l’attestato (', informativa, ').')),
    conferma, stato);
  apri.addEventListener('click', () => { forma.hidden = false; apri.hidden = true; apri.setAttribute('aria-expanded', 'true'); email.focus(); });
  forma.addEventListener('submit', async e => {
    e.preventDefault();
    const indirizzo = email.value.trim();
    if (!EMAIL.test(indirizzo)) { stato.textContent = 'Controlla l’indirizzo email.'; email.focus(); return; }
    if (!consenso.checked) { stato.textContent = 'Serve la spunta del genitore.'; consenso.focus(); return; }
    const tok = (typeof token === 'function' ? token() : token) || sharedParticipant();
    if (!tok) { stato.textContent = 'Il lavoro non è ancora salvato online. Riprova fra poco.'; return; }
    conferma.disabled = true; stato.textContent = 'Invio la richiesta…';
    try {
      await invia({token: tok, corso, nome: (typeof nome === 'function' ? nome() : nome) || '', email: indirizzo});
      forma.replaceChildren(el('p', {class: 'bt-frase', role: 'status'}, 'Fatto. La scuola manderà l’attestato a ', el('strong', {}, indirizzo), '.'));
    } catch (x) {
      conferma.disabled = false;
      stato.textContent = x?.name === 'AbortError' ? 'Non riesco a collegarmi. Riprova.' : (x?.message || 'Non riesco a salvare la richiesta. Riprova.');
    }
  });
  return el('div', {class: 'bt-email-blocco'}, apri, forma);
}
