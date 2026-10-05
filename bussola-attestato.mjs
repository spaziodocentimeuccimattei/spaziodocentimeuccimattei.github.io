import { el, button } from './bussola-ui.mjs';
import { courseArt } from './bussola-visuals.mjs';
import { firstName, certificateModel, imagePdf } from './bussola-attestato-core.mjs';

const palettes = {
  afm: ['#006b63', '#daf2e9'], sia: ['#477b00', '#edf8d9'], turismo: ['#b30b47', '#fce5ed'],
  ssas: ['#7a397d', '#f3e6f5'], cat: ['#12667e', '#e1f2f7'],
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
async function artwork(id) {
  if (!assets) {
    assets = Promise.all([loadImage('assets/decimomannu-cresce-qui-contesto.png'), loadImage('assets/qr-orientamento.svg')]);
    assets.catch(() => { assets = null; });
  }
  const svg = courseArt(id), [color, fill] = palettes[id];
  svg.setAttribute('width', '310'); svg.setAttribute('height', '220');
  const group = svg.querySelector('g');
  group.setAttribute('fill', fill); group.setAttribute('stroke', color);
  const source = new XMLSerializer().serializeToString(svg);
  const [logo, qr, icon] = await Promise.all([
    assets.then(images => images[0]), assets.then(images => images[1]),
    loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`),
  ]);
  return { logo, qr, icon };
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

export function drawCertificate(canvas, model, name, format, images, scale = 1) {
  const [width, height] = formats[format];
  canvas.width = width * scale; canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Anteprima non disponibile.');
  ctx.scale(scale, scale); ctx.textBaseline = 'alphabetic';
  const [color, fill] = palettes[model.course.id];
  ctx.fillStyle = '#f7f9f6'; ctx.fillRect(0, 0, width, height);
  box(ctx, 32, 28, 1016, height - 56, '#ffffff', 28);
  box(ctx, 52, 48, 976, 126, '#123c57', 16);
  // Same unchanged logo crop as the site header (610 x 150 inside the campaign artwork).
  ctx.drawImage(images.logo, 220, 0, 610, 150, 64, 53, 472, 116);
  textBlock(ctx, 'LA TUA BUSSOLA', 680, 100, 300, 22, 700, '#ffffff');
  textBlock(ctx, 'IIS Meucci - Mattei', 680, 133, 300, 20, 400, '#d7ece9');
  textBlock(ctx, 'ATTESTATO DI ESPLORAZIONE', 64, 226, 940, 23, 700, color);
  textBlock(ctx, 'La mia Bussola', 60, 307, 960, 76, 700);
  const greeting = firstName(name) ? `Il percorso di ${firstName(name)}` : 'Un punto di partenza per il mio futuro.';
  let nameSize = 30;
  font(ctx, nameSize);
  while (ctx.measureText(greeting).width > 940 && nameSize > 21) { nameSize--; font(ctx, nameSize); }
  textBlock(ctx, greeting, 64, 350, 940, nameSize);
  box(ctx, 52, 387, 976, 187, fill, 22);
  textBlock(ctx, 'UNA DIREZIONE DA ESPLORARE', 80, 414, 710, 18, 700, color);
  textBlock(ctx, model.course.code === 'TUR' ? 'TURISMO' : model.course.code, 80, 468, 680, 47, 700, color);
  let courseSize = 35;
  font(ctx, courseSize, 700);
  while (lines(ctx, model.course.name, 710).length > 2 && courseSize > 28) { courseSize--; font(ctx, courseSize, 700); }
  textBlock(ctx, model.course.name, 80, 513, 710, courseSize, 700, '#17314a', 1.16);
  ctx.drawImage(images.icon, 808, 412, 192, 136);
  let y = 621;
  y = textBlock(ctx, 'Le scelte che mi raccontano', 64, y, 940, 29, 700) + 11;
  for (const trace of model.traces) {
    y = textBlock(ctx, `“${trace.label}”`, 64, y, 940, 25, 700, color, 1.2);
    y = textBlock(ctx, trace.reason, 64, y + 3, 940, 24, 400, '#17314a', 1.26) + 17;
  }
  y += 2;
  y = textBlock(ctx, 'Materie da scoprire', 64, y, 940, 27, 700) + 3;
  y = textBlock(ctx, model.course.subjects.join(' · '), 64, y, 940, 24, 400, '#17314a', 1.3) + 17;
  if (model.others.length) y = textBlock(ctx, `Altre direzioni emerse: ${model.others.join(', ')}.`, 64, y, 940, 21, 700, '#566d78', 1.2) + 8;
  y = textBlock(ctx, model.context, 64, y, 940, 21, 400, '#566d78', 1.2);
  const footerY = height - 237;
  if (y > footerY - 13) throw new Error('Il testo dell’attestato supera lo spazio disponibile.');
  box(ctx, 52, footerY, 976, 167, '#123c57', 20);
  textBlock(ctx, model.invitation, 78, footerY + 43, 728, 31, 700, '#ffffff', 1.12);
  textBlock(ctx, model.school, 78, footerY + 80, 728, 24, 700, '#c9f981');
  textBlock(ctx, model.nextStep, 78, footerY + 113, 728, 22, 400, '#ffffff');
  textBlock(ctx, model.email, 78, footerY + 145, 728, 23, 700, '#ffffff');
  box(ctx, 844, footerY + 13, 140, 140, '#ffffff', 8);
  ctx.drawImage(images.qr, 850, footerY + 19, 128, 128);
  textBlock(ctx, model.disclaimer, 64, height - 40, 940, 19, 400, '#566d78');
  const description = [greeting, model.course.name, ...model.traces.map(t => `${t.label}. ${t.reason}`),
    model.course.subjects.join(', '), model.others.length ? `Altre direzioni: ${model.others.join(', ')}.` : '',
    model.context, model.invitation, model.school, model.nextStep, model.email, model.disclaimer].filter(Boolean).join(' ');
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
  const pngOption = el('option', 'Immagine per Instagram · 1080 × 1350'); pngOption.value = 'instagram';
  const pdfOption = el('option', 'PDF A4 · da conservare o stampare'); pdfOption.value = 'pdf';
  select.append(pngOption, pdfOption);
  const status = el('p', 'Caricamento dell’anteprima…', 'certificate-status'); status.setAttribute('role', 'status');
  const canvas = el('canvas', 'Anteprima dell’attestato.', 'certificate-preview'); canvas.setAttribute('role', 'img');
  let images, failed = false;
  const redraw = () => {
    if (!images || !dialog.isConnected) return;
    try { drawCertificate(canvas, model, name.value, select.value, images); failed = false; download.disabled = false; status.textContent = ''; }
    catch { failed = true; download.disabled = true; status.textContent = 'Anteprima non disponibile. Chiudi e riprova.'; }
  };
  const download = button('Scarica immagine', async () => {
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
      status.textContent = format === 'pdf' ? 'PDF pronto. Aprilo per stamparlo.' : 'Immagine pronta. Puoi caricarla su Instagram dal tuo dispositivo.';
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
  artwork(model.course.id).then(loaded => { images = loaded; redraw(); }).catch(() => {
    if (dialog.isConnected) status.textContent = 'Le immagini non si sono caricate. Controlla la connessione, chiudi e riprova.';
  });
}
