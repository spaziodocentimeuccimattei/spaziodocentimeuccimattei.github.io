// Pulsanti per scaricare: l'immagine da condividere (cartolina 1080×1920) e l'attestato come immagine JPEG.
// Usati dal finale delle prove e dai due schermi «Bentornato» (ritorno da casa con il QR o con il codice).
/** «Scarica l'immagine»: prepara al tocco la cartolina da condividere (JPEG 1080×1920, non l'attestato) e la scarica. */
export function pulsanteImmagine(el, {corso, nome, id}) {
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

/** «Scarica l'attestato»: l'attestato così com'è a schermo, come immagine JPEG (dal telefono, dopo il QR). */
export function pulsanteAttestato(el, {canvas, corso, nome, id}) {
  const b = el('button', {class: 'bt-pulsante bt-pulsante--grande', type: 'button', id}, 'Scarica l’attestato');
  b.addEventListener('click', () => canvas.toBlob(blob => {
    if (!blob) { b.textContent = 'Non riesco a preparare l’immagine. Riprova.'; return; }
    const primo = (nome || '').trim().split(/\s+/)[0]?.normalize('NFD').replace(/[^\w-]/g, '').slice(0, 24) || 'bussola';
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `attestato-${corso}-${primo}.jpg`;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  }, 'image/jpeg', .92));
  return b;
}
