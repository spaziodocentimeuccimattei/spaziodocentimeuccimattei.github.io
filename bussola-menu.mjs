// Menu unico in testa alle prove: note, la mia classe, area docenti, salvataggio, riprendere un lavoro, suoni.
// Una sola riga sottile: ← Indirizzi · sigla · Menu. Tutto il resto sta dietro il pulsante Menu.
import {interruttoreSuono} from './bussola-effetti.mjs?v=20261115-riordino';

/** Collega il pulsante #menuToggle al pannello #pageMenu e aggiunge l'interruttore dei suoni. Restituisce {apri, chiudi}. */
export function iniziaMenu(doc = document) {
  const tasto = doc.getElementById('menuToggle'), pannello = doc.getElementById('pageMenu');
  if (!tasto || !pannello) return null;
  const apri = (si = true, fuoco = true) => {
    pannello.hidden = !si;
    tasto.setAttribute('aria-expanded', String(si));
    if (si && fuoco) pannello.querySelector('button:not([hidden]),a')?.focus();
  };
  tasto.addEventListener('click', () => apri(pannello.hidden));
  doc.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !pannello.hidden && !doc.querySelector('dialog[open]')) { apri(false); tasto.focus(); }
  });
  doc.addEventListener('click', e => {
    if (!pannello.hidden && !pannello.contains(e.target) && !tasto.contains(e.target)) apri(false);
  });
  // Toccare una voce chiude il pannello (il riquadro «Riprendere un lavoro» e «Riprova» restano aperti).
  pannello.addEventListener('click', e => {
    const voce = e.target.closest('button,a');
    if (voce && voce.id !== 'retrySave' && !voce.closest('details')) apri(false);
  });
  // Dopo una finestra di dialogo il fuoco torna al pulsante Menu.
  for (const d of doc.querySelectorAll('dialog')) {
    d.addEventListener('close', () => setTimeout(() => {
      if (doc.activeElement === doc.body || !doc.activeElement?.offsetParent) tasto.focus({preventScroll: true});
    }));
  }
  // Un segno discreto sul pulsante solo quando il salvataggio ha bisogno di una mano («Riprova»).
  const riprova = doc.getElementById('retrySave');
  if (riprova && typeof MutationObserver !== 'undefined') {
    const segna = () => { tasto.dataset.alert = String(!riprova.hidden); };
    new MutationObserver(segna).observe(riprova, {attributes: true, attributeFilter: ['hidden']});
    segna();
  }
  interruttoreSuono(pannello);
  return {apri, chiudi: () => apri(false, false)};
}
