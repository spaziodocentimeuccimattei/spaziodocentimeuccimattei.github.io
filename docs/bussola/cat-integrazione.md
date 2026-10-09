# CAT Archeodesign: raccordo con la Bussola

9 ottobre 2026. Integrazione autorizzata insieme alla pubblicazione nella chat di progetto. Il prototipo iniziale è conservato integro; il rilascio usa `bussola-cat.html` e i moduli CAT separati. AFM e SIA restano fuori da questo raccordo.

## Codice della classe e identità

Il docente crea o seleziona la classe nella Gestione: riceve un codice breve di sei caratteri, comune alla classe. Non è una password individuale né un codice fisso dell’indirizzo. Il codice già creato per SSAS o Turismo può riconoscere la stessa classe anche in CAT. **SPAZ26 era soltanto il codice inventato dell’anteprima archiviata.**

Ogni partecipante conserva una credenziale tecnica distinta. Nome e cognome servono all’attestato e non concedono accesso ai lavori. Identità e scuola/classe si salvano nelle tabelle dedicate, separatamente dal progetto CAT. Il link individuale permette di riprendere il proprio lavoro su un altro dispositivo: va conservato personalmente.

## Lavori e note

- Corso remoto `cat`; parser CAT esplicito, senza ripristino SSAS implicito per formati sconosciuti.
- Chiave locale `bussola.cat.v1`, con un identificativo per ogni progetto. I formati del prototipo e i campi compatibili sconosciuti vengono conservati.
- Progetto remoto privo di nomi e note: queste ultime sono righe autonome, con UUID, punto del percorso e ruolo dichiarato da chi scrive. Il ruolo dichiarato in una nota non dà privilegi riservati.
- Revisioni attese sul server e controllo locale delle scritture concorrenti. Una copia riceve un nuovo identificativo; non sovrascrive l’originale. Errori di rete mantengono il lavoro locale e mostrano il comando per riprovare.
- Prima parte della Bussola conservata. I collegamenti delle esperienze CAT conducono al percorso nuovo; le altre esperienze mantengono i propri formati e chiavi.

## Attestati

Alla conclusione dei dieci passaggi, la versione corrente dei cinque elaborati abilita «Visualizza il tuo attestato»: vista, stampa A4 e download PDF sul dispositivo. Le curiosità finali possono essere multiple e non costituiscono una valutazione di capacità.

Nella Gestione riservata sono disponibili filtro CAT, scuola/classe, verifica del nominativo, selezione dei percorsi conclusi ed emissione. Lo ZIP contiene un PDF per alunno nelle cartelle di scuola e classe e un CSV di raccordo. Gli attestati emessi conservano lo snapshot del lavoro: una successiva modifica non riscrive quello già emesso.

## Supabase e conservazione

Schema remoto controllato: i vincoli delle tabelle interessate comprendono già CAT e le tabelle mantengono RLS. Non occorrono migrazioni. Il rilascio aggiunge CAT alle sole funzioni `bussola-esperienze` e `bussola-gestione`, mantenendo autenticazione individuale, sessioni della Funzione Strumentale e impostazioni di accesso preesistenti.

Prima del rilascio: sorgenti delle funzioni precedenti archiviati, copia Git della base, esportazione privata delle sole risposte e note già autorizzate. Questa esportazione esclude credenziali, nominativi, classi e attestati e resta fuori da GitHub e Drive. Il lavoro parallelo di Claude su home e sezioni viene mantenuto mediante integrazione sulla versione corrente di GitHub, senza push forzati.

Le prove tecniche e i limiti sono in [cat-verifica.md](cat-verifica.md). Il controllo protetto completo è stato eseguito in un database isolato con dati fittizi: non viene presentato come prova con alunni reali o accesso personale alla Gestione di produzione.
