# Una scuola da vivere

Il modulo raccoglie due tipi di contributo dei docenti, senza password e senza calendario:

1. disponibilità ad affiancare la Commissione Orientamento in una o più scuole;
2. proposte di laboratori, lezioni aperte e altre attività per le Mattinée diffuse.

La pagina `una-scuola-da-vivere.html` è accessibile senza password. Nome, cognome,
scuole scelte e proposte sono inviati alla funzione Edge `orientamento`, che li
salva in tabelle con RLS attivo e nessun accesso diretto per `anon` o
`authenticated`. Solo una sessione `funzione_strumentale` (password personale della Funzione
Strumentale) può leggere i contributi e aggiornarne lo stato in `gestione.html` (area di gestione separata dall’area documenti). I livelli `orientatore` e `supporter`
dell’area riservata non leggono questi dati.

Eccezione decisa da Salvatore l’8/11/2026: chi dà disponibilità deve vedere chi l’ha
già data. L’azione pubblica `overview` restituisce per ogni scuola `docenti`, l’elenco
dei colleghi con disponibilità non archiviata, in ordine di invio, nella forma «M. Rossi»
(iniziale del nome e cognome). Note, date di invio e nomi completi restano riservati.
La pagina lo dichiara sotto il modulo e mostra i nomi sotto ciascuna scuola, nel
calendario e nell’elenco delle caselle.

L’elenco delle 24 scuole/sedi in 23 comuni deriva dal DOCX operativo la cui
ultima modifica interna è del 23 luglio 2026. Le denominazioni vanno confermate
prima della pubblicazione. Il catalogo pubblico `scuole-orientamento.json` e il
seed SQL hanno gli stessi identificativi. Il catalogo non contiene nomi o
recapiti dei referenti. Il nome del coordinatore compare senza numero o email.

Le richieste inviate sono `ricevuta`, non assegnazioni automatiche. La
Commissione può segnare un supporter come `assegnata` e una proposta come
`in_valutazione` o `approvata`. Date e orari saranno aggiunti soltanto quando
verranno definiti.

(Superato dal 17/11/2026, vedi «Codice personale dei docenti».) Chi invia senza password non può più correggere il proprio invio. Dal 9/11/2026 la
Funzione Strumentale corregge tutto dalla Gestione, con «Modifica o aggiungi una nota»
sulla scheda: nella disponibilità nome, cognome, scuole (da una a cinque) e nota; nella
proposta tutti i campi del modulo. Azioni `edit_supporter` ed `edit_proposal`, riservate
alla sessione `funzione_strumentale`, con gli stessi controlli del modulo pubblico. Stato,
codice e data di invio non cambiano. La nota resta visibile solo nella Gestione. Se si
corregge nome o cognome, le attività già registrate a nome di prima vanno corrette nel
Registro. Prova: `node scripts/verifica-modifica-invii.mjs`.

## Ordine di pubblicazione

1. Verificare e correggere le denominazioni delle scuole e sedi nel catalogo e nel seed SQL.
2. Applicare `supabase/sql/una-scuola-da-vivere.sql` al progetto Supabase.
3. Distribuire la versione aggiornata della funzione Edge `orientamento`, mantenendo `verify_jwt = false` e la verifica di sessione applicativa già in uso.
4. Pubblicare i file statici del repository GitHub Pages.
5. Sostituire la presentazione HTML nel bucket privato con la versione che associa le scuole alla mappa.
6. Verificare dal vivo: una richiesta di prova per ciascun percorso, comparsa nella vista `orientatore`, assenza di accesso con il livello `supporter`, assenza di dati dei referenti nei file pubblici.

Gli invii anonimi hanno un limite giornaliero per indirizzo di rete e un campo
trappola per gli invii automatici. Nome e cognome sono autodichiarati: ogni
assegnazione richiede verifica umana della Commissione.

## Classifica a punti

La pagina pubblica mostra una sfida di squadra (scuole “accese” sul totale),
il regolamento a punti e la classifica dei docenti. I punti sono calcolati solo
dalla funzione Edge (azione pubblica `leaderboard`):

| Azione | Punti |
| --- | --- |
| Disponibilità per le scuole (una volta per docente) | 5 |
| Proposta di Mattinée (non archiviata) | 10, +10 se approvata |
| Visita svolta in una scuola | 20 |
| Mattinée realizzata | 30 |
| Primo docente a visitare una scuola (Apripista) | 10 |

Le visite e le Mattinée realizzate sono registrate dai docenti nel modulo pubblico
“Ho svolto una visita” (azione `report_activity`, stato `da_confermare`): contano per
punti, mappa ed elenco solo dopo la conferma della Funzione Strumentale nella scheda
“Visite da confermare” di `gestione.html`, da cui si scarica anche l’elenco CSV per la
Dirigente. La Funzione Strumentale può anche registrarle direttamente in
`gestione.html` (password `funzione_strumentale`, sezione “Registra visite”) e finiscono nella tabella `orientamento_attivita`. Una registrazione
errata si annulla dalla stessa sezione. I contributi dello stesso docente si
sommano confrontando nome e cognome senza accenti e maiuscole.

In classifica pubblica compaiono solo iniziale e cognome dei docenti che hanno
spuntato il consenso (`in_classifica`), in almeno un invio o nella
registrazione della Commissione. Gli altri contano soltanto nei totali di squadra.

Per attivarla: applicare `supabase/sql/una-scuola-da-vivere-classifica.sql`,
poi distribuire la funzione `orientamento` aggiornata. Finché la funzione non è
aggiornata la pagina mostra la classifica vuota e i moduli continuano a
funzionare.

## Calendario dell’orientamento nelle scuole medie

Nella scheda «Calendario» di `gestione.html` la Funzione Strumentale inserisce le date
dell’orientamento in ciascuna scuola secondaria di primo grado. I tipi sono due: orientamento
nelle aule con gli studenti (`aule`) e open day della scuola media, dove il Mattei ha un
proprio stand in un locale grande come aula magna o palestra (`stand`). Ogni data è
`prevista` finché la scuola non la conferma; orario, luogo e nota sono facoltativi.

I docenti vedono le date da oggi in poi in `una-scuola-da-vivere.html`, sotto ciascuna
scuola dell’elenco, con tipo, orario, luogo e stato (azione pubblica `overview`). La nota
resta riservata e non va usata per nomi o recapiti dei referenti.

I dati stanno nella tabella `orientamento_appuntamenti` e si scrivono con le azioni
`save_appointment` e `archive_appointment` della funzione Edge `orientamento`, riservate
al livello `funzione_strumentale`.

Per attivarla: applicare `supabase/sql/orientamento-calendario.sql`, **poi** distribuire la
funzione `orientamento` aggiornata (senza la tabella la funzione non carica più i dati),
infine pubblicare i file statici.

## Dalla disponibilità al registro

In «Disponibilità docenti» la Funzione Strumentale conferma ogni docente scuola per scuola,
scegliendo la data (proposta dal calendario): la conferma crea una riga nel registro
(`orientamento_attivita`, stato `confermata`), anche con data futura. Nella stessa scuola si
possono confermare più docenti. Una visita a registro conta come svolta solo dal suo giorno.
Se il docente non va, la riga si corregge o si sostituisce il docente con «Modifica o
sostituisci» (azione `update_activity`) oppure si annulla. Il registro, ordinato per
docente, è l’elenco che si consegna alla Dirigente.

## Codice personale dei docenti (dal 17/11/2026)

Decisione di Salvatore: ogni docente dà la disponibilità **scuola per scuola**, con una nota
per ciascuna scuola e, se vuole, la data precisa (in programma o già trascorsa), e può
modificarla. Nelle note si scrivono anche le attività svolte oltre l’orario di servizio,
che servono al riconoscimento.

- Tabella `orientamento_docenti` (nome, cognome, codice di 8 caratteri senza I, O, 0, 1).
  Ogni voce di `orientamento_disponibilita` ha una sola scuola, `docente_id` e
  `appuntamento_id` facoltativo; le righe del registro hanno `docente_id`.
- Al primo invio il docente riceve il **codice personale**, salvato anche nel browser. Chi è
  già registrato e invia senza codice aggiunge le voci al proprio nome, ma il codice non gli
  viene mostrato. Con il codice, nella sezione 01 della pagina, il docente vede e modifica
  solo le proprie voci: data e nota delle disponibilità, nota delle visite del registro
  (storico), nome e cognome (cambiano in tutte le sue voci e nel registro, senza toccare
  le conferme).
- Con la **password della Commissione** (orientatore) o della **FS** si vedono tutti i docenti
  e, con «Apri e modifica», si cambiano le voci di uno; i codici li vede solo la FS. La
  password di consultazione (supporter) non modifica.
- La **Funzione Strumentale** vede i codici in Gestione → Disponibilità → «Codici personali
  dei docenti» e con «Nuovo codice» sostituisce un codice perso (il vecchio non vale più).
- Se il docente o la Commissione cambia la nota di una visita già confermata, la visita torna
  `da_confermare`; la nota precedente resta in `nota_precedente` e la Gestione mostra
  «Nota cambiata il … Prima: «…»». La conferma della FS toglie l’avviso.
- Le note non compaiono mai nella pagina pubblica (`overview`), né i codici.

Azioni della funzione `orientamento`: `teacher_entries`, `save_entry`, `remove_entry`,
`save_activity_note`, `rename_teacher` (codice oppure sessione orientatore/FS con
`docente_id`), `list_teachers` (sessione), `new_code` (solo FS). `submit_supporter` accetta
`voci` (una per scuola) e, per le copie vecchie della pagina, ancora `scuole` + `nota`.

Attivazione: `supabase/sql/orientamento-codice-docenti.sql`, poi, una tantum,
`supabase/sql/orientamento-codice-docenti-dati.sql` (divide i vecchi invii per scuola con la
stessa nota, assegna i codici ai docenti già presenti, collega il registro), poi la funzione,
infine i file statici. Prova: `node scripts/verifica-codice-docenti.mjs`.

## Pagina come strumento di controllo (dal 17/11/2026)

Richiesta di Salvatore: la pagina serve soprattutto a controllare chi va dove e che cosa è
stato fatto, senza doppioni.

- **Calendario.** Ogni visita mostra i docenti: per tutti iniziale e cognome di chi ha dato
  disponibilità (o «Nessun docente ha ancora dato disponibilità»); con la password FS o
  della Commissione, per le date future chi è assegnato o disponibile, per quelle passate
  chi ha registrato la visita, lo stato e la nota («Scoperta: nessun docente» se manca).
  In quella vista spariscono i pulsanti per i docenti.
- **Visite svolte.** Un solo blocco con «N su 24 scuole raggiunte» e le date trascorse: sono
  stati tolti l’elenco separato delle scuole raggiunte, «Aggiorna calendario» e il conteggio
  delle proposte Mattinée nell’apertura.
- **Sezione 01 «Disponibilità e visite svolte».** La vecchia sezione 03 «Registra
  un’attività» non c’è più: il suo modulo (stesso `reportForm`, ancora raggiungibile con
  `#visita`) sta nella 01. Due pulsanti, «Dai la disponibilità» e «Registra una visita
  svolta», aprono un modulo alla volta. In alto si legge sempre con quale ruolo si lavora:
  «Stai lavorando come Funzione Strumentale / Commissione Orientamento» oppure «come
  docente, con il tuo codice personale».
- Chi è già entrato (codice o password) trova la sezione aperta e non vede i riquadri
  «Conosci il territorio» e «Come funziona».
