# Calendario completo delle scuole

Gestione e pagina docenti usano `scuole-calendario.mjs` e `scuole-calendario.css`. Il catalogo e le API rimangono quelli esistenti; il componente produce una vista, senza scrivere dati.

La vista iniziale comprende tutte le scuole. Mostra tre mesi dal mese corrente; cambiando periodo, tutte le scuole rimangono e gli appuntamenti esterni ai mesi scelti sono indicati esplicitamente. Il periodo visualizzato non assegna date alle scuole. Le date previste e confermate mantengono lo stato salvato. Le date trascorse non sono automaticamente dichiarate visite svolte.

## Conferma delle attività svolte

La conferma di una data nel calendario indica l'accordo con la scuola. L'assegnazione di un docente e la sua segnalazione di un'attività restano `da_confermare`, anche quando la data passa. Soltanto l'azione `confirm_activity`, con l'accesso ordinario `funzione_strumentale`, conferma lo svolgimento di un'attività con data fino a oggi in Europe/Rome. I ruoli `supporter` e `orientatore` e le richieste senza sessione non possono confermare. Il modulo pubblico ignora eventuali stati o campi di conferma inviati dal client.

Ogni modifica di data, scuola, docente o altri dati di un'attività richiede una nuova conferma. Il database usa `da_confermare` anche per i nuovi inserimenti che omettono lo stato; lo script `supabase/sql/orientamento-conferma-esplicita.sql` cambia solo questo valore predefinito e conserva tutte le righe esistenti. Gli agenti devono lasciare le attività in attesa, salvo istruzione esplicita di Salvatore che ne confermi lo svolgimento. Il CSV per la Dirigente comprende soltanto attività confermate con data fino a oggi.

Per il rilascio: applicare lo script SQL, distribuire la funzione `orientamento`, poi pubblicare le pagine. Nessuna migrazione delle righe già salvate è prevista.

Il pubblico usa solo `overview` e gli avvisi pubblici del catalogo; le note interne degli appuntamenti compaiono soltanto nella Gestione, dopo l'accesso ordinario tramite `list_contributions`. Nessun cambiamento a sessioni, RLS, schema o funzioni Supabase.

Dalla Gestione si apre il modulo esistente della scuola o dell'appuntamento. Una bozza non salvata blocca l'apertura di un altro appuntamento: occorre salvarla o annullarla esplicitamente. I salvataggi, gli identificativi, gli export e le altre aree mantengono la logica precedente. Dalla pagina docenti il comando di disponibilità conserva le altre scelte e il limite di cinque scuole; non invia il modulo.

Gli script delle due pagine sono moduli ES. I pulsanti di invio si attivano dopo il collegamento dei gestori, per impedire invii nativi del modulo durante il caricamento. Se l'API non risponde, il calendario conserva l'ultima vista già caricata oppure indica chiaramente che le date non sono disponibili: non converte un errore in zero appuntamenti.

Verifica della logica e della protezione della bozza:

```sh
node scripts/verifica-calendario-scuole.mjs
node scripts/verifica-conferma-visite.mjs
```

La prova delle conferme esegue lo stesso handler Edge con database e accessi fittizi in memoria, senza rete o dati reali. Verifica i ruoli, gli stati inviati dal modulo pubblico, la conferma FS esplicita, il blocco delle date future, il passare del tempo senza conferma automatica, la riconferma dopo una modifica e il giorno italiano.
