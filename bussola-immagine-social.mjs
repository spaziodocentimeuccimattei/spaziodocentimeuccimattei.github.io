// Immagine da condividere (storie di Instagram, 1080×1920) per chi finisce una prova della Bussola (18 novembre 2026).
// Non è l'attestato: è una cartolina «Ho provato …» nei colori dell'indirizzo, con il logo della scuola.
// Riservatezza: solo il nome di battesimo (mai il cognome), nessun QR personale, nessun link al lavoro.
// I contenuti si tengono nella fascia centrale, fuori dalle parti coperte dai comandi delle storie.
import {NOMI_CORSI} from './bussola-locale.mjs?v=20261115-riordino';

const W = 1080, H = 1920;
const CARATTERE = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
// Gli stessi colori di bussola-tema.css (pieno, chiaro, fondo scuro e fondo meno scuro).
const COLORI = {
  afm: {pieno: '#006949', chiaro: '#5ee3a1', fondo: '#02181c', fondo2: '#07372e'},
  sia: {pieno: '#0ea7a5', chiaro: '#7fe3e0', fondo: '#061f25', fondo2: '#0f4046'},
  turismo: {pieno: '#d89e18', chiaro: '#ffd166', fondo: '#17140c', fondo2: '#3a2e12'},
  cat: {pieno: '#85c140', chiaro: '#b4e86e', fondo: '#0c211a', fondo2: '#1e4423'},
  ssas: {pieno: '#db0a5a', chiaro: '#ff86b4', fondo: '#170e1e', fondo2: '#3d1436'},
};
const LIME = '#a8ec58';

const immagine = src => new Promise(resolve => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => resolve(null); i.src = src; });

function righe(ctx, testo, larghezza) {
  const parole = testo.split(/\s+/), out = [];
  let riga = '';
  for (const p of parole) { const prova = riga ? riga + ' ' + p : p; if (ctx.measureText(prova).width > larghezza && riga) { out.push(riga); riga = p; } else riga = prova; }
  if (riga) out.push(riga);
  return out;
}
function rettangoloTondo(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/** Disegna la cartolina e la restituisce come canvas. */
export async function cartolinaCanvas({corso, nome = ''}) {
  const c = COLORI[corso]; if (!c) throw new Error('Indirizzo non disponibile.');
  try { await document.fonts?.ready; } catch { /* si usa il carattere disponibile */ }
  const [logo, disegno] = await Promise.all([immagine('assets/logo-meucci-mattei-decimomannu.jpeg'), immagine(`assets/attestati/${corso}.svg?v=20261020-illustrazioni`)]);
  const tela = document.createElement('canvas'); tela.width = W; tela.height = H;
  const ctx = tela.getContext('2d');

  // Fondo: sfumatura nel colore dell'indirizzo e raggi che partono dal disegno (come il finale della prova).
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c.fondo2); g.addColorStop(.55, c.fondo); g.addColorStop(1, c.fondo);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = 1130;
  ctx.save(); ctx.globalAlpha = .13; ctx.fillStyle = c.chiaro;
  for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, d = .07; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a - d) * 2200, cy + Math.sin(a - d) * 2200); ctx.lineTo(cx + Math.cos(a + d) * 2200, cy + Math.sin(a + d) * 2200); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  const alone = ctx.createRadialGradient(cx, cy, 40, cx, cy, 720); alone.addColorStop(0, c.pieno + 'aa'); alone.addColorStop(1, c.pieno + '00');
  ctx.fillStyle = alone; ctx.fillRect(0, 0, W, H);

  // In alto: logo ufficiale su tessera bianca (non deformato) e nome della scuola.
  if (logo) { rettangoloTondo(ctx, 90, 250, 128, 128, 26); ctx.fillStyle = '#fff'; ctx.fill(); ctx.drawImage(logo, 98, 258, 112, 112); }
  ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = `800 40px ${CARATTERE}`; ctx.fillText('IIS Meucci-Mattei', 248, 296);
  ctx.font = `600 34px ${CARATTERE}`; ctx.fillStyle = '#d9e6ec'; ctx.fillText('Decimomannu', 248, 342);

  // Testo: «Mario ha provato» + nome dell'indirizzo per esteso.
  const primo = (nome || '').trim().split(/\s+/)[0]?.slice(0, 24) || '';
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  let corpo = 112; ctx.font = `900 ${corpo}px ${CARATTERE}`;
  let linee = righe(ctx, NOMI_CORSI[corso], 940);
  while ((linee.length > 3 || linee.some(l => ctx.measureText(l).width > 960)) && corpo > 64) { corpo -= 6; ctx.font = `900 ${corpo}px ${CARATTERE}`; linee = righe(ctx, NOMI_CORSI[corso], 940); }
  // Altezza del blocco (frase, titolo, scheda, fascetta, firma) e posizione che lo centra fra il logo (fino a 380) e il fondo utile (1690).
  const sw = 860, sh = Math.round(sw * 500 / 1080);
  const blocco = 40 + corpo * linee.length * 1.02 + 70 + sh + 120 + 196;
  const top = Math.round(460 + Math.max(0, (1690 - 460 - blocco - 64) / 2)) + 64;
  ctx.fillStyle = c.chiaro; ctx.font = `800 64px ${CARATTERE}`;
  ctx.fillText(primo ? `${primo} ha provato` : 'Ho provato', W / 2, top);
  ctx.font = `900 ${corpo}px ${CARATTERE}`;
  ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  linee.forEach((l, i) => ctx.fillText(l, W / 2, top + 40 + corpo * (i + 1) * 1.02));
  ctx.shadowColor = 'transparent';
  const fineTesto = top + 40 + corpo * linee.length * 1.02;

  // Il disegno dell'indirizzo su una scheda bianca leggermente inclinata.
  const sy = fineTesto + 70;
  ctx.save(); ctx.translate(W / 2, sy + sh / 2); ctx.rotate(-.035);
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
  rettangoloTondo(ctx, -sw / 2 - 16, -sh / 2 - 16, sw + 32, sh + 32, 34); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.shadowColor = 'transparent';
  if (disegno) { ctx.save(); rettangoloTondo(ctx, -sw / 2, -sh / 2, sw, sh, 22); ctx.clip(); ctx.drawImage(disegno, -sw / 2, -sh / 2, sw, sh); ctx.restore(); }
  ctx.restore();

  // Fascetta «Prova completata» e firma della Bussola.
  const py = sy + sh + 120;
  ctx.font = `800 46px ${CARATTERE}`;
  const etichetta = '✓  Prova completata', lw = ctx.measureText(etichetta).width + 88;
  rettangoloTondo(ctx, W / 2 - lw / 2, py - 46, lw, 92, 46); ctx.fillStyle = LIME; ctx.fill();
  ctx.fillStyle = '#0b2a14'; ctx.textBaseline = 'middle'; ctx.fillText(etichetta, W / 2, py + 2);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff'; ctx.font = `800 52px ${CARATTERE}`; ctx.fillText('Bussola dell’orientamento', W / 2, py + 140);
  ctx.fillStyle = '#d9e6ec'; ctx.font = `600 32px ${CARATTERE}`; ctx.fillText('spaziodocentimeuccimattei.github.io/bussola', W / 2, py + 196);
  return tela;
}

/** Prepara il file da scaricare: JPEG 1080×1920, nome con indirizzo e nome di battesimo. */
export async function cartolinaFile({corso, nome = ''}) {
  const tela = await cartolinaCanvas({corso, nome});
  const blob = await new Promise((ok, no) => tela.toBlob(b => b ? ok(b) : no(new Error('Immagine non pronta.')), 'image/jpeg', .92));
  const primo = (nome || '').trim().split(/\s+/)[0]?.normalize('NFD').replace(/[^\w-]/g, '').slice(0, 24) || 'bussola';
  return {url: URL.createObjectURL(blob), name: `bussola-${corso}-${primo}.jpg`, canvas: tela};
}
