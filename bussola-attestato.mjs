import { el, button } from './bussola-ui.mjs?v=20261010-correzioni';
import { firstName, certificateModel, imagePdf } from './bussola-attestato-core.mjs';

const palettes = {
  afm: ['#123c57', '#e3edf3'], sia: ['#477b00', '#edf8d9'], turismo: ['#006733', '#e0f3e8'],
  ssas: ['#c4084f', '#fce4ee'], cat: ['#006b63', '#daf2e9'],
};
const formats = { instagram: [1080, 1350], pdf: [1080, 1528] };
let assets;
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Immagine non caricata.'));
    image.src = src;
  });
}
async function artwork() {
  if (!assets) {
    assets = Promise.all([
      loadImage('assets/logo-meucci-mattei-decimomannu.jpeg'),
      loadImage('assets/qr-orientamento.svg'),
      loadImage('assets/bussola-spazio-condiviso.jpeg'),
    ]).then(([logo, qr, coverImage]) => ({ logo, qr, coverImage }));
    assets.catch(() => { assets = null; });
  }
  return assets;
}

function font(ctx, size, weight = 400) { ctx.font = `${weight} ${size}px Arial, sans-serif`; }
function lines(ctx, text, width) {
  const result = [], words = text.split(/\s+/);
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) { result.push(line); line = word; }
    else line = next;
  }
  if (line) result.push(line);
  return result;
}
function textBlock(ctx, text, x, y, width, size, weight = 400, color = '#17314a', spacing = 1.3) {
  font(ctx, size, weight); ctx.fillStyle = color;
  for (const line of lines(ctx, text, width)) { ctx.fillText(line, x, y); y += size * spacing; }
  return y;
}
function box(ctx, x, y, width, height, fill, radius = 20) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.fill();
}

function fittedLine(ctx, text, x, y, width, size, weight, color) {
  font(ctx, size, weight);
  while (ctx.measureText(text).width > width && size > 15) { size--; font(ctx, size, weight); }
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}

export function drawCertificate(canvas, model, name, format, images, scale = 1) {
  const [width, height] = formats[format];
  canvas.width = width * scale; canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Anteprima non disponibile.');
  ctx.scale(scale, scale); ctx.textBaseline = 'alphabetic';
  const [color, fill] = palettes[model.course.id];
  const extra = height - 1350;
  const ink = '#123c57', paper = '#faf5ea';
  ctx.fillStyle = paper; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = ink; ctx.fillRect(0, 0, width, 144);
  // Lo stesso marchio dell'intestazione del sito, intero e senza ritagli.
  box(ctx, 40, 20, 104, 104, '#ffffff', 16);
  ctx.drawImage(images.logo, 44, 24, 96, 96);
  textBlock(ctx, 'IIS Meucci - Mattei', 166, 66, 560, 34, 700, '#ffffff');
  textBlock(ctx, 'Decimomannu', 166, 104, 560, 26, 400, '#c9f981');
  textBlock(ctx, 'La mia Bussola', 760, 62, 280, 26, 700, '#ffffff');
  textBlock(ctx, 'Attestato di esplorazione', 760, 96, 280, 21, 400, '#c9f981');
  const greeting = firstName(name) || 'La mia Bussola';
  fittedLine(ctx, greeting, 48, 223 + extra * .12, 984, 58, 700, ink);
  textBlock(ctx, 'Indirizzo da approfondire', 48, 279 + extra * .24, 984, 24, 700, color);
  textBlock(ctx, model.course.code, 48, 372 + extra * .30, 260, 96, 800, color);
  let courseSize = 36; font(ctx, courseSize, 700);
  while (lines(ctx, model.course.name, 646).length > 3 && courseSize > 28) { courseSize--; font(ctx, courseSize, 700); }
  const titleRows = lines(ctx, model.course.name, 646).length;
  textBlock(ctx, model.course.name, 354, 337 + extra * .30 - (titleRows - 1) * courseSize * .58,
    646, courseSize, 700, ink, 1.16);
  // Display the supplied image without distortion, keeping the people and shared space in view.
  const photoY = 415 + extra * .35, photoHeight = 500;
  const photoScale = Math.max(width / images.coverImage.naturalWidth, photoHeight / images.coverImage.naturalHeight);
  const sourceHeight = photoHeight / photoScale;
  const sourceTop = (images.coverImage.naturalHeight - sourceHeight) * .40;
  ctx.drawImage(images.coverImage, 0, sourceTop, images.coverImage.naturalWidth, sourceHeight,
    0, photoY, width, photoHeight);
  box(ctx, 800, photoY + photoHeight - 34, 262, 26, 'rgba(18,60,87,.85)', 4);
  textBlock(ctx, 'Immagine illustrativa', 812, photoY + photoHeight - 15, 238, 17, 400, '#ffffff');
  textBlock(ctx, 'Nelle mie risposte', 48, 956 + extra * .70, 984, 22, 700, color);
  model.traces.forEach((trace, index) => {
    const x = 48 + index * 500, y = 974 + extra * .70;
    box(ctx, x, y, 484, 75, fill, 12);
    let size = 25; font(ctx, size, 700);
    while (lines(ctx, `“${trace.label}”`, 444).length > 2 && size > 18) { size--; font(ctx, size, 700); }
    const rows = lines(ctx, `“${trace.label}”`, 444).length;
    textBlock(ctx, `“${trace.label}”`, x + 20, y + (rows > 1 ? 29 : 46), 444, size, 700, color, 1.15);
  });
  fittedLine(ctx, `Da esplorare: ${model.subjects.join(' · ')}`, 48, 1085 + extra * .80, 984, 24, 400, ink);
  fittedLine(ctx, model.shortContext, 48, 1119 + extra * .84, 984, 20, 400, '#566d78');
  const footerY = height - 169;
  box(ctx, 36, footerY, 1008, 126, ink, 16);
  fittedLine(ctx, model.school, 60, footerY + 39, 820, 29, 700, '#ffffff');
  textBlock(ctx, 'Indirizzi, attività e modalità d’iscrizione', 60, footerY + 75, 820, 25, 400, '#ffffff');
  textBlock(ctx, 'Inquadra il QR per saperne di più.', 60, footerY + 105, 820, 21, 400, '#c9f981');
  box(ctx, 922, footerY + 12, 102, 102, '#ffffff', 7);
  ctx.drawImage(images.qr, 925, footerY + 15, 96, 96);
  textBlock(ctx, model.disclaimer, 48, height - 18, 984, 17, 400, '#566d78');
  const description = [greeting, 'Indirizzo da approfondire.', 'Rappresentazione illustrativa di uno spazio condiviso con ragazzi seduti ai tavoli e sui divani.',
    model.course.name, ...model.traces.map(t => t.label), model.subjects.join(', '), model.shortContext,
    model.school, 'Indirizzi, attività e modalità d’iscrizione. Inquadra il QR per saperne di più.', model.disclaimer].filter(Boolean).join(' ');
  canvas.setAttribute('aria-label', description);
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Esportazione non disponibile.')), type, quality));
}

export function openCertificate(item, direction, situations, contacts, trigger) {
  const model = certificateModel(item, direction, situations, contacts);
  const dialog = el('dialog', null, 'certificate-dialog');
  dialog.setAttribute('aria-labelledby', 'certificateTitle');
  const header = el('div', null, 'certificate-dialog-header');
  const title = el('h2', 'Il tuo attestato'); title.id = 'certificateTitle';
  header.append(title, button('Chiudi', () => dialog.close(), 'explore-button secondary'));
  const layout = el('div', null, 'certificate-layout');
  const form = el('div', null, 'certificate-controls');
  form.append(el('p', `Una direzione da esplorare: ${model.course.name}.`, 'certificate-course'));
  const label = el('label', 'Solo il tuo nome, senza cognome'); label.htmlFor = 'certificateName';
  const name = el('input'); name.id = 'certificateName'; name.type = 'text'; name.maxLength = 40;
  name.autocomplete = 'off'; name.placeholder = 'Facoltativo'; name.setAttribute('aria-describedby', 'certificatePrivacy');
  const privacy = el('p', 'Il nome viene aggiunto solo al file. Non viene salvato dalla Bussola né inviato alla scuola.', 'plain-note'); privacy.id = 'certificatePrivacy';
  const formatLabel = el('label', 'Formato'); formatLabel.htmlFor = 'certificateFormat';
  const select = el('select'); select.id = 'certificateFormat';
  const pngOption = el('option', 'Immagine · 1080 × 1350'); pngOption.value = 'instagram';
  const pdfOption = el('option', 'PDF A4 · da conservare o stampare'); pdfOption.value = 'pdf';
  select.append(pdfOption, pngOption);
  const status = el('p', 'Caricamento dell’anteprima…', 'certificate-status'); status.setAttribute('role', 'status');
  const canvas = el('canvas', 'Anteprima dell’attestato.', 'certificate-preview'); canvas.setAttribute('role', 'img');
  let images, failed = false;
  const redraw = () => {
    if (!images || !dialog.isConnected) return;
    try { drawCertificate(canvas, model, name.value, select.value, images); failed = false; download.disabled = false; status.textContent = ''; }
    catch { failed = true; download.disabled = true; status.textContent = 'Anteprima non disponibile. Chiudi e riprova.'; }
  };
  const download = button('Scarica PDF A4', async () => {
    if (failed || !images) return;
    download.disabled = true; name.disabled = true; select.disabled = true;
    status.textContent = 'Preparazione del file…';
    try {
      const format = select.value;
      const exported = document.createElement('canvas');
      drawCertificate(exported, model, name.value, format, images, format === 'pdf' ? 1.5 : 1);
      let blob;
      if (format === 'pdf') {
        const jpeg = await toBlob(exported, 'image/jpeg', .94);
        blob = new Blob([imagePdf(new Uint8Array(await jpeg.arrayBuffer()), exported.width, exported.height)], { type: 'application/pdf' });
      } else blob = await toBlob(exported, 'image/png');
      exported.width = exported.height = 0;
      if (!dialog.isConnected) return;
      const url = URL.createObjectURL(blob);
      const anchor = el('a'); anchor.href = url; anchor.download = `la-mia-bussola-${model.course.id}.${format === 'pdf' ? 'pdf' : 'png'}`;
      dialog.append(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      status.textContent = format === 'pdf' ? 'PDF pronto. Aprilo per stamparlo.' : 'Immagine pronta: la trovi tra i file scaricati.';
    } catch { status.textContent = 'Il file non si è creato. Riprova o scegli l’altro formato.'; }
    finally { if (dialog.isConnected) { download.disabled = false; name.disabled = false; select.disabled = false; } }
  });
  download.disabled = true;
  name.addEventListener('input', redraw);
  select.addEventListener('change', () => { download.textContent = select.value === 'pdf' ? 'Scarica PDF A4' : 'Scarica immagine'; redraw(); });
  form.append(label, name, privacy, formatLabel, select, download,
    el('p', 'Puoi scaricarlo anche senza nome. Apri il PDF per stamparlo; conserva l’immagine o condividila se vuoi.', 'plain-note'), status);
  const preview = el('figure', null, 'certificate-preview-wrap');
  preview.append(canvas, el('figcaption', 'Anteprima del file che scaricherai.'));
  layout.append(form, preview); dialog.append(header, layout); document.body.append(dialog);
  dialog.addEventListener('close', () => {
    name.value = ''; canvas.width = canvas.height = 0; dialog.remove();
    document.body.classList.remove('certificate-open'); trigger?.focus({ preventScroll: true });
  }, { once: true });
  document.body.classList.add('certificate-open'); dialog.showModal();
  artwork().then(loaded => { images = loaded; redraw(); }).catch(() => {
    if (dialog.isConnected) status.textContent = 'Le immagini non si sono caricate. Controlla la connessione, chiudi e riprova.';
  });
}
