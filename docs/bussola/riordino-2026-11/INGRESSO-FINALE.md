# Ingresso e finale comuni — guida per i percorsi (agente A3)

Moduli, tutti nella radice del sito: `bussola-ingresso-comune.mjs`, `bussola-finale-comune.mjs`, `bussola-locale.mjs` (nome e distintivi sul dispositivo), `bussola-interruttori.mjs` (EMAIL_ATTIVA, CODICE_BREVE_ATTIVO, entrambi `false`), `bussola-qr.mjs`, `bussola-bentornato.mjs`, foglio `bussola-ingresso-finale.css` (da caricare dopo `bussola-tema.css`). Esempio funzionante: `afm.mjs` + `bussola-afm.html`.

## Firme

```js
mostraIngresso({ corso, contenitore, classe, onInizia, onIndietro })   // Promise
// classe: il valore di setupClass(...) (con ctx.ingressoComune:true). onInizia(nome, cognome): può essere async.
// onIndietro (facoltativa): se c'è compare «Indietro».

mostraFinale({ corso, contenitore, nome, treCose, apriAttestato, rivediLavoro, token, salvato })
// treCose: tre stringhe brevi (se mancano il primo schermo si salta)
// apriAttestato: () => Promise<{canvas, file:{url,name}, name}>  → di solito () => attestato.prepara()
// rivediLavoro: () => apre il riepilogo del lavoro (link «Rivedi il tuo lavoro»)
// token: codice personale lungo (default: quello condiviso del dispositivo, sharedParticipant())
// salvato: () => bool|Promise<bool>  vero se il lavoro è già salvato online (serve al QR)
// email: il blocco «Vuoi riceverlo via email?» è in bussola-email-attestato.mjs (EMAIL_ATTIVA); niente Scarica né Stampa dal 18/11/2026
```

`setupParticipantCertificate(ctx)` ora restituisce anche `prepara()`; se nella pagina non c'è `#certificateDialog` restituisce solo `prepara` (la finestra non serve più). `studio-remote` espone `saved()`.

## Esempio completo (da `afm.mjs`)

```js
import {mostraIngresso} from './bussola-ingresso-comune.mjs?v=20261114-a3';
import {mostraFinale}   from './bussola-finale-comune.mjs?v=20261114-a3';

const startNow = async () => { try { await remote.ensure(); } catch {} navigation.enter(); p.started = true; p.screen = Math.max(0, p.screen); render(true); };
classAccess = setupClass({ key: STORE + '.' + storageId, token: () => remote.token(), ensure: () => remote.ensure(),
  isIntro: () => navigation.isIntro() || p.screen < 0, start: startNow,
  ingressoComune: true,                                   // la finestra «Come vuoi iniziare?» non si apre più
  apriIngresso: () => mostraIngresso({ corso: COURSE, contenitore: $('stage'), classe: classAccess, onInizia: startNow, onIndietro: () => render(true) }) });
attestato = setupParticipantCertificate({ project: () => p, journey: () => p, save, identity: () => classAccess.identity(),
  participant: () => remote.participant(), revision: () => remote.revision() });

function showFinale() { mostraFinale({ corso: COURSE, contenitore: $('stage'), treCose: TRE_COSE, apriAttestato: () => attestato.prepara(),
  rivediLavoro: () => { reviewing = true; render(true); }, token: () => remote.token(), salvato: async () => { await remote.sync(); return remote.saved(); } }); }
// in render(): se il percorso è concluso e non si sta rivedendo → svuota #stage e chiama showFinale()
```
Il pulsante «Inizia» esistente continua a chiamare `classAccess.begin(b)`: con `ingressoComune` apre l'ingresso comune.

## Che cosa deve fare ogni agente di percorso

1. Caricare `bussola-ingresso-finale.css` dopo il tema; importare i due moduli (versione `?v=20261114-a3`).
2. Passare `ingressoComune:true` e `apriIngresso` a `setupClass`; chiamare `mostraFinale` a percorso concluso.
3. Scrivere le tre cose (`treCose`): tre voci brevi.
4. **Togliere**: il markup della finestra «Come vuoi iniziare?» (`classGuestBox`, `classGuest`, «oppure, con la tua classe»; la finestra «La mia classe» resta per chi vuole collegare il lavoro dopo); il vecchio blocco contatti (`data-next-step`, `nextStep(...)`) e i video del finale (`data-course-videos`); il blocco «Che cosa ti ha incuriosito?»/«Quale parte vorresti approfondire?»; il pulsante «Visualizza il tuo attestato» e, se il percorso non lo usa più, `#certificateDialog`.
5. Il riepilogo di oggi resta, dietro `rivediLavoro`, con un pulsante «Torna al finale».
6. Non scrivere il nome nel progetto: l'ingresso lo tiene nella chiave locale `bussola-ospite` e l'attestato lo legge da lì o dalla classe.
7. Distintivi: li aggiunge `mostraFinale` (chiave `bussola-distintivi`). Si azzerano con `clearState` (Inizia / Inizia una nuova / Ricomincia, una riga in `bussola-core.mjs`) e con l'evento `bussola-progetto-nuovo` («Inizia da capo»).
8. Il finale nasconde da solo (CSS `:has`) intestazione, riga di stato e barra dei laboratori.

## Segnalazioni ai percorsi

- **Turismo**: `turismo-core.mjs` riga 55, `complete(p)` richiede `p.interests.length>0`; stessa condizione alla riga 70 (`p.finished=…&&p.interests.length>0`, ripristino) e nella copia `supabase/functions/*/turismo-core.mjs`. Senza la scelta l'attestato non si sblocca: va tolta da tutte le copie, e `completion()` di `bussola-records-core.mjs` (ramo TUR_FORMAT) usa `p.finished`.
- **SSAS**: `ssas-labs-core.mjs` riga 72 (`j.finished=…&&j.done.length===5&&j.interests.length>0`) e riga 82 (`add(j.interests.length,'Indica almeno una parte…','interest-salute')`). Stesso discorso. Etichette SSAS dell'area docenti non allineate (blocco 5c non fatto).
- AFM, SIA, CAT: nessuna condizione sugli interessi nel nucleo (verificato con grep); AFM già collegato.

## Limiti noti

- Il link del QR vale finché esiste il partecipante sul server: `bussola_v2_partecipanti.expires_at` è 30 giorni dalla creazione e non viene rinnovato (`supabase/sql/bussola-esperienze-v2.sql`, riga 6). Per l'Open Day del 16/01 chi ha fatto la prova a novembre troverà «non più disponibile».
- `bussola.html` (questionario) con `#alunno=` in pagina chiama `start`, che crea un partecipante anche per un token inventato: comportamento già presente, non toccato.
