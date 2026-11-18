// Interruttori della seconda uscita della Bussola (riordino novembre 2026).
// EMAIL_ATTIVA resta spento finché non ci sono: l'informativa privacy approvata dalla Dirigente (INFORMATIVA_URL),
// la tabella e l'azione del server (supabase/sql/bussola-richieste-attestato.sql e funzione bussola-esperienze).
// CODICE_BREVE_ATTIVO resta spento finché la funzione e la tabella dei codici brevi non sono attive sul server.
// Spenti, non compare nulla di ciò che dipende da loro e non parte alcuna richiesta.
// Solo in prova locale (127.0.0.1 con ?prova=…&email=1) il campo email si vede, per le anteprime.
const provaEmail = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('prova') && new URLSearchParams(location.search).has('email');
export const EMAIL_ATTIVA = false || provaEmail;
export const CODICE_BREVE_ATTIVO = false;
// Pagina dell'informativa (vuota finché non è approvata) e sua versione, registrata con ogni consenso.
export const INFORMATIVA_URL = '';
export const INFORMATIVA_VERSIONE = 'bozza-2026-11-18';
