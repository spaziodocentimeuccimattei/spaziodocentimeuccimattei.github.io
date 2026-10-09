# Turismo: integrazione del 9 ottobre 2026

La pagina `bussola-turismo.html` realizza i cinque laboratori approvati: territorio, lingue e accoglienza, esperienze, impresa e servizi, comunicazione. L’attività precedente resta recuperabile dalla cronologia Git e dalla copia integra precedente al rilascio. La prima Bussola mantiene contenuti e logica; cambiano i collegamenti all’esperienza Turismo.

## Collegamenti reali

- Codice breve, scuola e classe riconosciute prima dell’attività; nessuna password per gli alunni. La credenziale personale del progetto resta separata dal codice della classe.
- Supabase usa la chiave partecipante–corso: Turismo non sostituisce SSAS. Ripresa personale e controllo della revisione impediscono di sovrascrivere un lavoro cambiato in un’altra finestra.
- Note autonome per punto del percorso, ruolo dichiarato e tipo. La dichiarazione «docente» non concede accesso alla Gestione.
- Attestato personale disponibile alla fine: visualizzazione, stampa A4 e PDF scaricabile. La Gestione filtra il corso e genera gli attestati dei nominativi verificati, con snapshot immutabile, PDF per scuola/classe e CSV. Nessun invio automatico.
- Le tabelle e le autorizzazioni esistenti sono conservate. Nessuna migrazione SQL necessaria; le funzioni `bussola-esperienze` e `bussola-gestione` sono adattate. La funzione `orientamento` e il calendario restano invariati.

## Verifiche eseguite

Nel database PostgreSQL isolato: classe e nominativo fittizi, completamento effettivo dei cinque laboratori, payload di altro corso rifiutati, note separate e idempotenti, conservazione di SSAS, accessi e ruoli, conflitto di revisione, attestati personali, emissione riservata e storico immutabile. Sono stati ripetuti i controlli della guida SSAS, dei suoi laboratori, degli attestati e del percorso introduttivo.

Nel browser: tutti i dieci passaggi, nota e ripresa dopo ricaricamento, recupero dal link personale in uno spazio di salvataggio distinto, nominativo in Gestione, filtro Turismo, verifica del nome ed emissione, preparazione dello ZIP e del CSV. Il PDF personale è stato scaricato, verificato come pagina A4 e controllato visivamente. Il pulsante di stampa usa la stampa del browser con il foglio dedicato A4; non è stata effettuata una stampa su carta.

La pagina e il dialogo classe sono stati controllati a 320 pixel senza scorrimento orizzontale. Le dieci attività dell’anteprima approvata erano già state verificate a 320, 390, 768 e 1280 pixel. La versione corretta non produce errori nella console durante il controllo.

Il backend online è verificato per rifiuto degli accessi non validi, gestione protetta e riconoscimento della classe esistente. La prova completa di salvataggio e attestati è svolta nell’ambiente isolato; non sono creati alunni o lavori fittizi nel database reale.

## Prova educativa da effettuare

La durata di 12–18 minuti resta un’ipotesi. Servono ancora prove con alunni, dispositivi fisici e lettori di schermo: comprensione delle consegne, interesse, autonomia nei passaggi e desiderio di continuare. I controlli tecnici non dimostrano questi risultati educativi.
