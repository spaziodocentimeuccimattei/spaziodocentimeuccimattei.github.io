// Codice QR generato nel browser, senza servizi né librerie remote.
// Usa la libreria locale già presente nel sito (assets/vendor/qrcode-generator-2.0.4.mjs, MIT, Kazuhiko Arase),
// la stessa dei codici delle classi nell'area docenti. Correzione degli errori livello M.
import qrcode from './assets/vendor/qrcode-generator-2.0.4.mjs';

function crea(testo) {
  const q = qrcode(0, 'M');
  q.addData(String(testo), 'Byte');
  q.make();
  return q;
}

/** Testo SVG del QR, scalabile (viewBox), con margine bianco di 4 moduli. */
export function qrSvg(testo) {
  return crea(testo).createSvgTag({ cellSize: 4, margin: 16, scalable: true });
}

/** Elemento <svg> pronto da inserire nel riquadro `.bt-biglietto__qr`. */
export function qrElemento(testo, etichetta = 'Codice QR') {
  const doc = new DOMParser().parseFromString(qrSvg(testo), 'image/svg+xml');
  const svg = document.importNode(doc.documentElement, true);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', etichetta);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  return svg;
}

/** Matrice di moduli (true = scuro): serve alle verifiche. */
export function qrMatrice(testo) {
  const q = crea(testo), n = q.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => q.isDark(r, c)));
}
