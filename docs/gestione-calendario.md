# Calendario completo delle scuole

Gestione e pagina docenti usano `scuole-calendario.mjs` e `scuole-calendario.css`. Il catalogo e le API rimangono quelli esistenti; il componente produce una vista, senza scrivere dati.

La vista iniziale comprende tutte le scuole. Mostra tre mesi dal mese corrente; cambiando periodo, tutte le scuole rimangono e gli appuntamenti esterni ai mesi scelti sono indicati esplicitamente. Il periodo visualizzato non assegna date alle scuole. Le date previste e confermate mantengono lo stato salvato. Le date trascorse non sono automaticamente dichiarate visite svolte.

Il pubblico usa solo `overview` e gli avvisi pubblici del catalogo; le note interne degli appuntamenti compaiono soltanto nella Gestione, dopo l'accesso ordinario tramite `list_contributions`. Nessun cambiamento a sessioni, RLS, schema o funzioni Supabase.

Dalla Gestione si apre il modulo esistente della scuola o dell'appuntamento. Una bozza non salvata blocca l'apertura di un altro appuntamento: occorre salvarla o annullarla esplicitamente. I salvataggi, gli identificativi, gli export e le altre aree mantengono la logica precedente. Dalla pagina docenti il comando di disponibilità conserva le altre scelte e il limite di cinque scuole; non invia il modulo.

Gli script delle due pagine sono moduli ES. I pulsanti di invio si attivano dopo il collegamento dei gestori, per impedire invii nativi del modulo durante il caricamento. Se l'API non risponde, il calendario conserva l'ultima vista già caricata oppure indica chiaramente che le date non sono disponibili: non converte un errore in zero appuntamenti.

Verifica della logica e della protezione della bozza:

```sh
node scripts/verifica-calendario-scuole.mjs
```
