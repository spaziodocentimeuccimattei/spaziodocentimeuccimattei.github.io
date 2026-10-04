import { readState, summarize, clearState } from './bussola-core.mjs';
import { el, button, link, storage, loadData } from './bussola-ui.mjs';

async function initialize() {
  try {
    const [b, d, c] = await loadData(['bussola', 'dimensioni', 'indirizzi']);
    const state = readState(storage(), b.situations, ['afm','sia','turismo','ssas','cat']);
    const actions = document.getElementById('contextActions');
    if (!state || state.stage !== 'results') {
      actions.hidden = false;
      actions.append(link('Inizia la tua Bussola', 'bussola.html', 'explore-button secondary'));
      return;
    }
    // Do not reveal previous student's actions merely because this tab has storage.
    actions.hidden = false;
    actions.append(button('Collega i percorsi alle mie scelte', () => {
      const summary = summarize(b.situations, d.dimensions, state.answers);
      const themes = summary.selected;
      document.getElementById('exploreContext').textContent = themes.length
        ? 'Ritrova le azioni scelte in tutti e cinque i percorsi. Nessun corso è consigliato o escluso.'
        : 'Le scelte aprono più direzioni. Le cinque esperienze permettono di esplorarle senza assegnare un corso.';
      for (const course of c.courses) {
        const box = document.querySelector(`[data-course="${course.id}"]`);
        if (!box || !themes.length) continue;
        box.replaceChildren(el('h4', 'Collegamenti con le tue scelte'));
        const ul = el('ul');
        for (const theme of themes) ul.append(el('li', course.lenses[theme.id]));
        box.append(ul); box.hidden = false;
      }
      actions.firstElementChild.disabled = true;
      actions.firstElementChild.textContent = 'Collegamenti mostrati per tutti i corsi';
    }, 'explore-button secondary'), button('È un dispositivo condiviso: cancella le scelte', () => {
      clearState(storage());
      document.querySelectorAll('[data-course]').forEach(box => { box.replaceChildren(); box.hidden = true; });
      actions.replaceChildren(link('Inizia un nuovo percorso', 'bussola.html', 'explore-button secondary'));
      document.getElementById('exploreContext').textContent = 'Le risposte precedenti sono state cancellate. Puoi esplorare tutti gli indirizzi.';
    }, 'explore-button secondary'));
  } catch {
    // Static course content, missions, and existing contacts remain available.
  }
}
initialize();
