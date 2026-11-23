# Calendario completo delle scuole

Gestione e pagina docenti usano `scuole-calendario.mjs` e `scuole-calendario.css`. Il catalogo e le API rimangono quelli esistenti; il componente produce una vista, senza scrivere dati.

La vista iniziale comprende tutte le scuole. Mostra tre mesi dal mese corrente; cambiando periodo, tutte le scuole rimangono e gli appuntamenti esterni ai mesi scelti sono indicati esplicitamente. Il periodo visualizzato non assegna date alle scuole. Le date previste e confermate mantengono lo stato salvato. Le date trascorse non sono automaticamente dichiarate visite svolte.

## Conferma delle attività svolte

La conferma di una data nel calendario indica l'accordo con la scuola. L'assegnazione di un docente e la sua segnalazione di un'attività restano `da_confermare`, anche quando la data passa. Soltanto l'azione `confirm_activity`, con l'accesso ordinario `funzione_strumentale`, conferma lo svolgimento di un'attività con data fino a oggi in Europe/Rome. I ruoli `supporter` e `orientatore` e le richieste senza sessione non possono confermare. Il modulo pubblico ignora eventuali stati o campi di conferma inviati dal client.

Ogni modifica di data, scuola, docente o altri dati di un'attività richiede una nuova conferma. Il database usa `da_confermare` anche per i nuovi inserimenti che omettono lo stato; lo script `supabase/sql/orientamento-conferma-esplicita.sql` cambia solo questo valore predefinito e conserva tutte le righe esistenti. Gli agenti devono lasciare le attività in attesa, salvo istruzione esplicita di Salvatore che ne confermi lo svolgimento. Il CSV per la Dirigente comprende soltanto attività confermate con data fino a oggi.

Per il rilascio: applicare lo script SQL, distribuire la funzione `orientamento`, poi pubblicare le pagine. Nessuna migrazione delle righe già salvate è prevista.

Il pubblico usa solo `overview` e gli avvisi pubblici del catalogo; le note interne degli appuntamenti compaiono soltanto nella Gestione, dopo l'accesso ordinario tramite `list_contributions`. Nessun cambiamento a sessioni, RLS, schema o funzioni Supabase.

Le attività da verificare si possono annullare sia dalla scheda sia dal modulo di modifica. La richiesta di annullamento appare dentro la pagina e permette di mantenere la registrazione senza scrivere dati. L'annullamento usa `archive_activity`: rimuove la voce dalla verifica e dal registro senza cancellarla fisicamente e senza confermarne lo svolgimento. Un errore lascia disponibile il tentativo successivo; una modifica ad altre registrazioni già in compilazione resta conservata.

Dalla Gestione si apre il modulo esistente della scuola o dell'appuntamento. Una bozza non salvata blocca l'apertura di un altro appuntamento: occorre salvarla o annullarla esplicitamente. I salvataggi, gli identificativi, gli export e le altre aree mantengono la logica precedente. Dalla pagina docenti il comando di disponibilità conserva le altre scelte e il limite di cinque scuole; non invia il modulo.

Gli script delle due pagine sono moduli ES. I pulsanti di invio si attivano dopo il collegamento dei gestori, per impedire invii nativi del modulo durante il caricamento. Se l'API non risponde, il calendario conserva l'ultima vista già caricata oppure indica chiaramente che le date non sono disponibili: non converte un errore in zero appuntamenti.

Verifica della logica e della protezione della bozza:

```sh
node scripts/verifica-calendario-scuole.mjs
node scripts/verifica-conferma-visite.mjs
node --experimental-vm-modules scripts/verifica-annullamento-attivita.mjs
node scripts/verifica-modifica-invii.mjs
```

La prova delle conferme esegue lo stesso handler Edge con database e accessi fittizi in memoria, senza rete o dati reali. Verifica i ruoli, gli stati inviati dal modulo pubblico, la conferma FS esplicita, il blocco delle date future, il passare del tempo senza conferma automatica, la riconferma dopo una modifica e il giorno italiano.

## Cruscotto della Gestione (22 ottobre 2026)

Dopo l'accesso FS la Gestione mostra in alto i riquadri colorati (date definite, da confermare con la scuola, scuole senza data, attività da verificare, disponibilità, proposte, scuole visitate, registro): ogni riquadro apre la sezione in cui si agisce. Sotto, nove tasti aprono una sezione alla volta; ogni sezione ha un indirizzo (`#calendario-scuole`, `#date`, `#da-verificare`, `#disponibilita`, `#mattinee`, `#scuole-visite`, `#registro`, `#classi-bussola`, `#excel`). L'indirizzo storico `gestione#bussola` continua a portare all'Area docenti Bussola.

Nel calendario della Gestione ci sono anche i filtri «Date definite» (confermate dalla scuola, da oggi), «Da confermare con la scuola» e «Scuole senza data». «Inserisci la data» compare solo per le scuole senza una data in arrivo; le date presenti si cambiano con «Modifica questa data» e si confermano con «Segna come definita». La pagina docenti mantiene i due soli filtri «Tutte le scuole» e «Date prenotabili».

«Scarica Excel» produce file .xlsx nel browser (`gestione-excel.mjs`, nessuna libreria esterna): date e scuole, elenco per la Dirigente, tutto l'orientamento. Le note interne sono comprese. I CSV precedenti restano.

Con la password della Commissione la Gestione resta chiusa e indica le pagine aperte alla Commissione: calendario delle date, territori e dati Istat, Area docenti Bussola, area della Commissione.

Prova locale con dati finti: aprire `gestione.html?prova` su `localhost` o `127.0.0.1` con un server che risponda a `/__test/orientamento` e `/__test/bussola-gestione`.

## Cruscotto a colpo d'occhio e ingresso unico (23 novembre 2026)

Problema segnalato da Salvatore: entrando da `orientamento.html` («Commissione Orientamento») con la password della Funzione Strumentale si vedevano solo i documenti, senza un collegamento alla Gestione. Nella Gestione, poi, il conteggio delle scuole era chiuso dentro «Visite confermate» e «Aggiungi data» stava in fondo.

- `orientamento.html`: con la password FS, dopo l'accesso si va dritti a `gestione.html`; la sessione passa in `sessionStorage` (`mattei-gestione-session`) e non si rifà l'accesso. Tornando ai documenti compare il pulsante «Gestione orientamento». Le altre password restano come prima.
- `gestione.html`, in cima alla panoramica:
  - **Le scuole medie del territorio**: «X scuole fatte su N», la barra e quattro colonne (Fatte · Da verificare · In programma · Da fare). «Fatta» richiede una visita confermata dalla FS; una data passata senza conferma va in «Da verificare» (stessa regola delle conferme). Ogni scuola è un pulsante: «Da fare» apre l'inserimento della data con la scuola già scelta, «In programma» apre la modifica della data, «Da verificare» porta alle visite da completare.
  - I pulsanti **Inserisci la data di un incontro** e **Registra un'attività**.
  - **Attività registrate dai docenti**: la tabella di tutte le attività (da confermare e confermate) con data, scuola o Mattinée, docente, stato e i pulsanti «Conferma» e «Modifica»; filtri Tutte / Da confermare / Confermate.
- Nessun cambiamento alla funzione Supabase, allo schema o ai permessi: il cruscotto usa i dati di `list_contributions`.
