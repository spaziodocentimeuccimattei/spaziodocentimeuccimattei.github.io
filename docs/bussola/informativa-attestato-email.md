# Informativa per l'invio dell'attestato della Bussola via email — BOZZA

Bozza del 18 novembre 2026, da far approvare alla Dirigente (titolare del trattamento è l'istituto) e da far rivedere al Responsabile della protezione dei dati (RPD) della scuola. **Non è pubblicata.** Finché non è approvata, l'interruttore `EMAIL_ATTIVA` in `bussola-interruttori.mjs` resta spento e il campo email non compare. Le parti tra parentesi quadre vanno completate con i dati ufficiali: qui non sono stati inventati.

Versione che si registra con ogni consenso: `bozza-2026-11-18` (costante `INFORMATIVA_VERSIONE`). All'approvazione si cambia la versione e si scrive l'indirizzo della pagina in `INFORMATIVA_URL`.

## Testo breve, accanto alla casella (già nel sito, spento)

> Sono il genitore e sono d'accordo: la scuola userà questa email solo per mandare l'attestato. Informativa privacy.

## Informativa (art. 13 del Regolamento UE 2016/679, GDPR)

**Chi tratta i dati.** Titolare del trattamento è l'IIS «A. Meucci – E. Mattei», [sede legale, codice fiscale], nella persona della Dirigente scolastica. Responsabile della protezione dei dati: [nome o società, email].

**Quali dati.** L'indirizzo email di un genitore (o di chi esercita la responsabilità genitoriale), il nome che compare sull'attestato, l'indirizzo di studio provato nella Bussola, la data e l'ora del consenso e la versione di questa informativa.

**Perché.** Solo per mandare via email l'attestato di partecipazione alla prova della Bussola dell'orientamento. L'indirizzo non si usa per altre comunicazioni, newsletter o pubblicità e non si dà ad altri.

**Base giuridica.** Il consenso del genitore (art. 6, paragrafo 1, lettera a, GDPR). Per i ragazzi con meno di 14 anni il consenso lo dà chi esercita la responsabilità genitoriale (art. 8 GDPR e art. 2-quinquies del Codice in materia di protezione dei dati personali, d.lgs. 196/2003). Dare l'email è facoltativo: senza, la prova e l'attestato a schermo restano disponibili.

**Come.** Il dato si salva nello spazio online della Bussola (servizio Supabase, [regione dei server da verificare]), accessibile solo alla Funzione Strumentale per l'orientamento dall'area riservata. L'attestato si manda a mano dall'indirizzo email istituzionale della scuola.

**Per quanto tempo.** Fino all'invio dell'attestato, e comunque non oltre [data di fine iscrizioni 2027/28, la stessa della scadenza dei lavori]: alla scadenza la richiesta si cancella insieme al lavoro.

**Diritti.** Si possono chiedere accesso, rettifica, cancellazione, limitazione; si può ritirare il consenso in qualsiasi momento scrivendo a [email istituzionale della scuola], senza effetti sul trattamento già fatto. Si può presentare reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).

## Spiegazione per i ragazzi (linguaggio chiaro, art. 2-quinquies, comma 2)

> Se vuoi l'attestato per email, chiedi a un tuo genitore di scrivere la sua email e di mettere la spunta. La scuola userà quell'email solo per mandarti l'attestato, poi la cancella. Se non vuoi, va bene lo stesso: l'attestato lo vedi già qui.

## Note per chi decide (non vanno nella pagina)

- **Allo stand il genitore spesso non c'è.** Una spunta messa da un tredicenne non è il consenso del genitore. Per questo il campo è chiuso dietro «Vuoi riceverlo via email?» e la frase è in prima persona del genitore; è al posto giusto all'Open Day (genitori presenti) e nello schermo «Bentornato» del ritorno da casa con il QR.
- **Base giuridica alternativa.** Una scuola pubblica tratta di regola i dati per compiti di interesse pubblico (art. 6, paragrafo 1, lettera e). Se l'RPD ritiene che l'orientamento rientri lì, il consenso resta comunque utile perché il servizio è facoltativo: va deciso con l'RPD, non qui.
- **Ritorno con il codice breve** (quando sarà attivo): lo schermo «Bentornato» aperto con il codice di 6 caratteri non mostra il campo email, perché la richiesta richiede il codice personale lungo del lavoro. Con il QR il campo c'è.
- Fonti consultate il 18/11/2026: [Garante, «Minori»](https://www.garanteprivacy.it/temi/minori) (soglia italiana di 14 anni, art. 8 GDPR solo se la base è il consenso); [Garante, «Scuola»](https://www.garanteprivacy.it/it/temi/scuola); testo dell'art. 2-quinquies riportato da [Brocardi](https://brocardi.it/codice-della-privacy/parte-i/titolo-i/capo-ii/art2quinquies.html) (da verificare sul testo ufficiale in Normattiva prima di citarlo in un atto).
