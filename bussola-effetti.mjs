// Bussola · effetti comuni (riordino novembre 2026, agente A1).
// Nessuna dipendenza, nessuna chiamata di rete, nessun dato salvato.
// I colori si leggono dalle variabili di bussola-tema.css: la tavolozza resta in un punto solo.
// Guida d'uso: docs/bussola/riordino-2026-11/TEMA.md
//
// Con «riduci movimento» attivo nel dispositivo non parte alcuna animazione:
// esplosione() mostra coriandoli fermi per un attimo, premio() e scintilla() non muovono nulla.
// I suoni sono spenti a ogni apertura della pagina; si accendono solo con accendiSuoni(true)
// o con il tasto creato da interruttoreSuono().

const CORSI = ['afm', 'sia', 'turismo', 'cat', 'ssas'];
const RISERVA = {
  bussola: ['#77ce19', '#a8ec58'], afm: ['#007a3a', '#5ee3a1'], sia: ['#56b9a8', '#9be6d8'],
  turismo: ['#bf4a00', '#ffa35e'], cat: ['#77ce19', '#a8ec58'], ssas: ['#db0a5a', '#ff86b4'],
};

/** Vero se la persona ha chiesto al dispositivo di ridurre il movimento. */
export function movimentoRidotto() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

/** Colori dell'indirizzo letti dal tema: { pieno, chiaro, lime, bianco }. Corso sconosciuto = Bussola generale. */
export function coloriCorso(corso) {
  const nome = CORSI.includes(corso) ? corso : 'bussola';
  let stile = null;
  try { stile = getComputedStyle(document.documentElement); } catch { /* fuori dal browser */ }
  const leggi = (variabile, riserva) => (stile?.getPropertyValue(variabile) || '').trim() || riserva;
  const prefisso = nome === 'bussola' ? '--bt-lime' : `--bt-${nome}`;
  return {
    pieno: leggi(prefisso, RISERVA[nome][0]),
    chiaro: leggi(`${prefisso}-chiaro`, RISERVA[nome][1]),
    lime: leggi('--bt-lime', RISERVA.bussola[0]),
    bianco: '#ffffff',
  };
}

function corsoDi(elemento, corso) {
  if (CORSI.includes(corso)) return corso;
  const trovato = elemento?.closest?.('[data-corso]')?.dataset.corso;
  return CORSI.includes(trovato) ? trovato : 'bussola';
}

function centroDi(elemento) {
  const r = elemento?.getBoundingClientRect?.();
  if (!r || (!r.width && !r.height)) return { x: innerWidth / 2, y: innerHeight * 0.42, raggio: Math.min(innerWidth, innerHeight) / 4 };
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, raggio: Math.max(r.width, r.height) / 2 };
}

// La tela copre la finestra e non intercetta i tocchi. Dentro una finestra di dialogo aperta
// va messa nel dialogo stesso, altrimenti resterebbe sotto.
function creaTela(elemento) {
  const tela = document.createElement('canvas');
  tela.className = 'bt-effetti-tela';
  tela.setAttribute('aria-hidden', 'true');
  const densita = Math.min(window.devicePixelRatio || 1, 2);
  tela.width = Math.round(innerWidth * densita);
  tela.height = Math.round(innerHeight * densita);
  const ospite = elemento?.closest?.('dialog[open]') || document.body;
  ospite.append(tela);
  const penna = tela.getContext('2d');
  penna.scale(densita, densita);
  return { tela, penna };
}

function disegna(penna, p) {
  penna.save();
  penna.translate(p.x, p.y);
  penna.rotate(p.giro);
  penna.globalAlpha = Math.max(0, Math.min(1, p.vita));
  penna.fillStyle = p.colore;
  if (p.forma === 'cerchio') { penna.beginPath(); penna.arc(0, 0, p.lato / 2, 0, Math.PI * 2); penna.fill(); }
  else if (p.forma === 'stella') {
    penna.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? p.lato * 0.28 : p.lato * 0.7, a = (Math.PI / 5) * i; penna.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    penna.closePath(); penna.fill();
  } else penna.fillRect(-p.lato / 2, -p.lato * 0.3, p.lato, p.lato * 0.6);
  penna.restore();
}

function particelle(quante, centro, tavolozza, forza, forme) {
  return Array.from({ length: quante }, (_, i) => {
    const angolo = Math.random() * Math.PI * 2;
    const spinta = forza * (0.35 + Math.random() * 0.65);
    return {
      x: centro.x, y: centro.y,
      vx: Math.cos(angolo) * spinta, vy: Math.sin(angolo) * spinta - forza * 0.35,
      giro: Math.random() * Math.PI, vgiro: (Math.random() - 0.5) * 0.5,
      lato: 7 + Math.random() * 9, vita: 1,
      colore: tavolozza[i % tavolozza.length], forma: forme[i % forme.length],
    };
  });
}

function anima(tela, penna, lista, durata, raggi) {
  return new Promise(fine => {
    const inizio = performance.now();
    let prima = inizio;
    function passo(ora) {
      const trascorso = ora - inizio, dt = Math.min(34, ora - prima) / 16.7;
      prima = ora;
      penna.clearRect(0, 0, innerWidth, innerHeight);
      if (raggi && trascorso < 520) {
        const avanzamento = trascorso / 520;
        penna.save();
        penna.translate(raggi.x, raggi.y);
        penna.globalAlpha = (1 - avanzamento) * 0.55;
        penna.strokeStyle = raggi.colore;
        penna.lineCap = 'round';
        penna.lineWidth = 6;
        for (let i = 0; i < 16; i++) {
          const a = (Math.PI * 2 / 16) * i, da = raggi.raggio * (0.6 + avanzamento * 1.6), fino = da + 40 + avanzamento * 90;
          penna.beginPath(); penna.moveTo(Math.cos(a) * da, Math.sin(a) * da); penna.lineTo(Math.cos(a) * fino, Math.sin(a) * fino); penna.stroke();
        }
        penna.restore();
      }
      for (const p of lista) {
        p.vy += 0.42 * dt; p.vx *= 0.992; p.x += p.vx * dt; p.y += p.vy * dt; p.giro += p.vgiro * dt;
        p.vita = 1 - Math.max(0, (trascorso - durata * 0.55) / (durata * 0.45));
        disegna(penna, p);
      }
      if (trascorso < durata) requestAnimationFrame(passo);
      else { tela.remove(); fine(); }
    }
    requestAnimationFrame(passo);
  });
}

/**
 * Momento «esplosivo»: raggi e coriandoli nel colore dell'indirizzo, a partire dal centro dell'elemento.
 * Da usare sul risultato della Bussola e sull'attestato. Non tocca il contenuto dell'elemento.
 * @param {Element|null} elemento  da dove parte (se manca: centro dello schermo)
 * @param {string} [corso]         'afm' | 'sia' | 'turismo' | 'cat' | 'ssas'; se manca si legge data-corso
 * @param {{quanti?: number, durata?: number}} [opzioni]
 * @returns {Promise<void>} si risolve quando l'effetto è finito
 */
export function esplosione(elemento, corso, opzioni = {}) {
  if (typeof document === 'undefined') return Promise.resolve();
  const colori = coloriCorso(corsoDi(elemento, corso));
  const tavolozza = [colori.pieno, colori.chiaro, colori.lime, colori.bianco, colori.pieno];
  const centro = centroDi(elemento);
  const piccolo = innerWidth < 600;
  const quanti = opzioni.quanti ?? (piccolo ? 90 : 150);
  suono('esplosione');
  const { tela, penna } = creaTela(elemento);
  if (movimentoRidotto()) {
    // niente movimento: coriandoli fermi attorno al centro, poi spariscono
    const fermi = particelle(Math.round(quanti / 2), centro, tavolozza, 0, ['rettangolo', 'cerchio', 'stella']);
    for (const p of fermi) {
      const a = Math.random() * Math.PI * 2, d = Math.max(centro.raggio, 90) * (1.3 + Math.random() * 1.5);
      p.x = centro.x + Math.cos(a) * d; p.y = centro.y + Math.sin(a) * d * 0.7; disegna(penna, p);
    }
    return new Promise(fine => setTimeout(() => { tela.remove(); fine(); }, 1400));
  }
  const forza = piccolo ? 13 : 18;
  const lista = particelle(quanti, centro, tavolozza, forza, ['rettangolo', 'rettangolo', 'cerchio', 'stella']);
  return anima(tela, penna, lista, opzioni.durata ?? 2200, { ...centro, colore: colori.chiaro });
}

/**
 * Premio al completamento: l'elemento «salta fuori» e si accende di scintille. Per il distintivo
 * dell'indirizzo a fine prova. Nessun punteggio: si premia l'aver finito, non la risposta.
 * @param {Element} elemento
 * @param {string} [corso]
 * @returns {Promise<void>}
 */
export function premio(elemento, corso) {
  if (typeof document === 'undefined' || !elemento) return Promise.resolve();
  suono('premio');
  if (movimentoRidotto()) return Promise.resolve();
  elemento.classList.remove('bt-premiato');
  void elemento.offsetWidth; // fa ripartire l'animazione se il premio viene ripetuto
  elemento.classList.add('bt-premiato');
  const colori = coloriCorso(corsoDi(elemento, corso));
  const centro = centroDi(elemento);
  const { tela, penna } = creaTela(elemento);
  const lista = particelle(36, centro, [colori.chiaro, colori.bianco, colori.lime, colori.pieno], 8, ['stella', 'cerchio']);
  return anima(tela, penna, lista, 1100, { ...centro, colore: colori.bianco });
}

/**
 * Piccolo effetto a ogni scelta: l'elemento toccato «risponde» e lascia qualche scintilla.
 * @param {Element} elemento  la risposta o il pulsante appena scelto
 * @param {string} [corso]
 * @returns {Promise<void>}
 */
export function scintilla(elemento, corso) {
  if (typeof document === 'undefined' || !elemento) return Promise.resolve();
  suono('tocco');
  if (movimentoRidotto()) return Promise.resolve();
  elemento.classList.remove('bt-toccato');
  void elemento.offsetWidth;
  elemento.classList.add('bt-toccato');
  const colori = coloriCorso(corsoDi(elemento, corso));
  const centro = centroDi(elemento);
  const { tela, penna } = creaTela(elemento);
  const lista = particelle(12, { x: centro.x, y: centro.y }, [colori.chiaro, colori.bianco, colori.lime], 5, ['cerchio', 'stella']);
  return anima(tela, penna, lista, 600, null);
}

// --- Suoni: sintetizzati nel browser, nessun file. Spenti a ogni apertura della pagina. ---
let accesi = false;
let audio = null;
const NOTE = {
  tocco: [[660, 0, 0.07]],
  avanti: [[523, 0, 0.08], [784, 0.07, 0.1]],
  premio: [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.1], [1047, 0.27, 0.22]],
  esplosione: [[392, 0, 0.09], [523, 0.08, 0.09], [659, 0.16, 0.09], [784, 0.24, 0.09], [1047, 0.32, 0.3]],
};

/** Vero se i suoni sono accesi in questa pagina. All'apertura sono sempre spenti. */
export function suoniAccesi() { return accesi; }

/** Accende o spegne i suoni. Va chiamata da un tocco della persona (i browser lo richiedono). */
export function accendiSuoni(valore = true) {
  accesi = Boolean(valore);
  if (accesi && !audio) {
    try { const Motore = window.AudioContext || window.webkitAudioContext; audio = Motore ? new Motore() : null; } catch { audio = null; }
  }
  if (accesi) audio?.resume?.().catch(() => {});
  for (const tasto of document.querySelectorAll('.bt-suono')) aggiornaTasto(tasto);
  return accesi;
}

/**
 * Suona un breve effetto, solo se i suoni sono accesi.
 * @param {'tocco'|'avanti'|'premio'|'esplosione'} nome
 * @returns {boolean} vero se il suono è partito
 */
export function suono(nome) {
  const note = NOTE[nome];
  if (!accesi || !audio || !note) return false;
  try {
    const ora = audio.currentTime;
    for (const [frequenza, quando, durata] of note) {
      const oscillatore = audio.createOscillator(), volume = audio.createGain();
      oscillatore.type = 'triangle';
      oscillatore.frequency.value = frequenza;
      volume.gain.setValueAtTime(0.0001, ora + quando);
      volume.gain.exponentialRampToValueAtTime(0.16, ora + quando + 0.015);
      volume.gain.exponentialRampToValueAtTime(0.0001, ora + quando + durata);
      oscillatore.connect(volume).connect(audio.destination);
      oscillatore.start(ora + quando);
      oscillatore.stop(ora + quando + durata + 0.03);
    }
    return true;
  } catch { return false; }
}

function aggiornaTasto(tasto) {
  tasto.setAttribute('aria-pressed', String(accesi));
  tasto.textContent = accesi ? 'Suoni accesi' : 'Suoni spenti';
}

/**
 * Crea il tasto «Suoni spenti / Suoni accesi» e lo aggiunge al contenitore.
 * @param {Element} [contenitore]  dove metterlo; se manca, il tasto viene solo restituito
 * @returns {HTMLButtonElement}
 */
export function interruttoreSuono(contenitore) {
  const tasto = document.createElement('button');
  tasto.type = 'button';
  tasto.className = 'bt-suono';
  aggiornaTasto(tasto);
  tasto.addEventListener('click', () => { accendiSuoni(!accesi); if (accesi) suono('avanti'); });
  contenitore?.append(tasto);
  return tasto;
}
