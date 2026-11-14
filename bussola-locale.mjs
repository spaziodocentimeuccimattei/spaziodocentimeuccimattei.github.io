// Dati che restano SOLO su questo dispositivo (localStorage): nome e cognome di chi entra senza classe,
// elenco degli indirizzi conclusi (distintivi) e costruzione del link di ritorno da casa.
// Nome e cognome non fanno parte del progetto salvato e quindi non viaggiano verso il server
// (il progetto viene sincronizzato per intero: vedi docs/bussola/riordino-2026-11/INGRESSO-FINALE.md).
export const CORSI = ['afm', 'sia', 'turismo', 'ssas', 'cat'];
export const NOMI_BREVI = { afm: 'AFM', sia: 'SIA', turismo: 'Turismo', ssas: 'SSAS', cat: 'CAT' };
export const NOMI_CORSI = {
  afm: 'Amministrazione, Finanza e Marketing', sia: 'Sistemi Informativi Aziendali', turismo: 'Turismo',
  ssas: 'Servizi per la Sanità e l’Assistenza Sociale', cat: 'Costruzioni, Ambiente e Territorio',
};
export const CHIAVE_OSPITE = 'bussola-ospite';
export const CHIAVE_DISTINTIVI = 'bussola-distintivi';
const TOKEN = /^[A-Za-z0-9_-]{43}$/;

const memoria = typeof localStorage === 'undefined' ? null : localStorage;
function leggi(chiave) { try { return JSON.parse(memoria?.getItem(chiave) ?? 'null'); } catch { return null; } }
function scrivi(chiave, valore) { try { memoria?.setItem(chiave, JSON.stringify(valore)); return true; } catch { return false; } }

/** Pulisce un nome o un cognome: spazi singoli, NFC, massimo 80 caratteri. Stringa vuota se non valido. */
export function pulisciNome(valore) {
  const testo = typeof valore === 'string' ? valore.trim().replace(/\s+/gu, ' ').normalize('NFC') : '';
  return !testo || testo.length > 80 || /[\u0000-\u001f<>]/u.test(testo) ? '' : testo;
}

/** {nome, cognome} salvato su questo dispositivo, oppure null. */
export function nomeOspite() {
  const v = leggi(CHIAVE_OSPITE), nome = pulisciNome(v?.nome), cognome = pulisciNome(v?.cognome);
  return nome && cognome ? { nome, cognome } : null;
}
export function salvaNomeOspite(nome, cognome) {
  const n = pulisciNome(nome), c = pulisciNome(cognome);
  return n && c ? scrivi(CHIAVE_OSPITE, { nome: n, cognome: c }) : false;
}
export const nomeCompleto = persona => (persona ? `${persona.nome} ${persona.cognome}` : '');

/** Indirizzi conclusi su questo dispositivo, nell'ordine dei cinque indirizzi. */
export function distintivi() {
  const v = leggi(CHIAVE_DISTINTIVI);
  return CORSI.filter(c => Array.isArray(v) && v.includes(c));
}
export function aggiungiDistintivo(corso) {
  if (!CORSI.includes(corso)) return distintivi();
  const nuovi = CORSI.filter(c => c === corso || distintivi().includes(c));
  scrivi(CHIAVE_DISTINTIVI, nuovi);
  return nuovi;
}
/** Una persona nuova usa lo stesso dispositivo: via nome e distintivi della precedente. */
export function azzeraLavoroLocale() {
  try { memoria?.removeItem(CHIAVE_OSPITE); memoria?.removeItem(CHIAVE_DISTINTIVI); } catch { /* niente */ }
}
if (typeof document !== 'undefined') document.addEventListener('bussola-progetto-nuovo', azzeraLavoroLocale);

/**
 * Link di ritorno da casa. Tutto ciò che sta dopo «#» non viene mai inviato al server dal browser:
 * per questo nome, cognome e distintivi possono viaggiare lì. Il nome NON è la chiave: la chiave è il
 * codice personale lungo (`alunno`), lo stesso del link personale già previsto dal sistema.
 */
export function linkRitorno({ token, corso, persona = null, conclusi = [], base = typeof location === 'undefined' ? '' : location.href }) {
  if (!TOKEN.test(token || '') || !CORSI.includes(corso)) return '';
  const url = new URL('bussola.html', base);
  url.search = '';
  const p = new URLSearchParams({ bentornato: '1', alunno: token, corso });
  if (persona) p.set('n', nomeCompleto(persona));
  if (conclusi.length) p.set('d', conclusi.join('.'));
  url.hash = p.toString();
  return url.href;
}
/** Legge un link di ritorno (o il suo #): {token, corso, nome, conclusi} oppure null. */
export function leggiRitorno(testo) {
  let parte = String(testo ?? '').trim();
  if (/^https?:\/\//i.test(parte)) { try { parte = new URL(parte).hash; } catch { return null; } }
  const p = new URLSearchParams(parte.replace(/^#/, ''));
  const token = p.get('alunno') || '';
  if (!TOKEN.test(token)) return null;
  const corso = CORSI.includes(p.get('corso')) ? p.get('corso') : '';
  const [nome = '', ...resto] = (p.get('n') || '').trim().split(/\s+/u);
  return {
    token, corso, nome: pulisciNome(nome), cognome: pulisciNome(resto.join(' ')),
    conclusi: CORSI.filter(c => (p.get('d') || '').split('.').includes(c)), esplicito: p.has('bentornato'),
  };
}
