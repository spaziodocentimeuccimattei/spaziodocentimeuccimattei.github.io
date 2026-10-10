# Cinque esperienze della Bussola — rilascio del 10 ottobre 2026

SSAS, AFM, SIA, Turismo e CAT Archeodesign ora hanno percorsi specifici in cinque laboratori e un raccordo comune con classi, salvataggio, note e attestati. La prima Bussola conserva le proprie attività; i pulsanti delle esperienze portano alle pagine complete. Il rilascio è autorizzato da Salvatore nella chat: «finisci dopo i controlli pubblica», con la richiesta di uno stesso alto livello di qualità per tutti i percorsi.

## Che cosa è cambiato

- SSAS: lo studio visivo, i cinque prodotti che prendono forma, i passaggi guidati e la raccolta finale del restyling approvato. Conservati i cinque filoni e tutti i quindici passaggi, le alternative e i testi personali.
- AFM: integrazione dello studio d’impresa già progettato, con idee, organizzazione, dati e finanza, accordi, marketing e lingue. Conservati integralmente il nucleo e gli stili della proposta; ingresso dimostrativo sostituito dal codice classe reale.
- SIA: integrazione dello studio di soluzioni digitali, con processi, archivio, programmi, interfaccia e responsabilità. Conservato integralmente il nucleo della proposta. Il ripristino mantiene l’ordine delle chiavi della matrice dei permessi prima di verificare le prove: jsonb può riordinarle, rendendo altrimenti non riconoscibile una prova svolta.
- Turismo e CAT: conservati contenuti e modelli delle attività già pubblicate. Aggiornati i riferimenti ai moduli comuni degli attestati. In CAT la copia di un conflitto aperto dal link personale si conserva nello spazio locale corrispondente al nuovo link, così può essere ritrovata.
- Gestione: filtri e collegamenti di tutti e cinque i corsi, completamento verificato sul server, restituzione del lavoro e snapshot degli attestati per corso. Nessuna modifica a ruoli, RLS, tabelle, credenziali o autenticazione.

AFM e SIA usano adattatori distinti dal nucleo: validazione esplicita del corso e del formato, conservazione dei campi futuri compatibili, revisioni e conflitti. Le note si salvano una per riga e con il punto del percorso; il ruolo dichiarato non concede privilegi. Le note delle anteprime precedenti non vengono importate automaticamente fra quelle degli alunni.

## Criterio comune

Per tutti: consegna operativa visibile; cinque ambiti riconoscibili dell’indirizzo; risultato personale modificabile; conseguenze visibili; note accessibili durante il percorso; ingresso con codice breve e nominativo; lavoro riprendibile; attestato finale visualizzabile, stampabile A4 e scaricabile PDF. Le interazioni rimangono diverse perché rappresentano attività diverse: non si impone lo stesso esercizio ai cinque corsi.

Le curiosità sono dichiarate dall’alunno e non derivano da un voto o da una misura delle capacità. Le simulazioni esplicitano dati e personaggi inventati. Le durate e la comprensibilità a 13 anni restano ipotesi da verificare in classe.

## Verifiche

- AFM: 94 asserzioni su scelte, conti, pagamenti, varianti, note e recupero. SIA: 91 asserzioni su processo, archivio, esecuzione, dipendenze, interfaccia, permessi e note.
- Regressioni SSAS laboratori/guida, Turismo, attestato personale e prima Bussola superate. Regresse anche le funzioni CAT e Turismo con il backend aggiornato, nel database isolato.
- Integrazione AFM/SIA nel database isolato: codice classe, identità distinte, isolamento partecipanti/corsi, revisioni concorrenti, note idempotenti/separate, payload scambiati respinti, conservazione dei campi futuri, completamento dai campi, attestati personali e della Gestione, storico immutabile.
- Nel browser: tutti i dieci passaggi AFM e tutti i dieci SIA; testi personali, prove e revisione, note, ripresa dopo ricaricamento e attestati nominativi. PDF scaricati: una pagina A4, 595,28 × 841,89 punti, per entrambi.
- Confronto visivo e di larghezza: cinque laboratori AFM e cinque SIA a 320/390/768/1280 pixel; ingressi e primo laboratorio SSAS/CAT/Turismo alle stesse larghezze. Nessuno scorrimento orizzontale. Corrette le etichette AFM/SIA inferiori a 13 pixel; le piccole didascalie dei prodotti hanno ora dimensioni leggibili. La verifica completa precedente di SSAS resta conservata.
- Database remoto letto solo per confermare CHECK dei cinque corsi e RLS. Prima del deploy i sorgenti delle due funzioni attive coincidono con la base GitHub. Nessuna prova fittizia scritta nel database di produzione.

La prova educativa con alunni, lettori di schermo e dispositivi scolastici fisici resta distinta dai controlli tecnici. L’obiettivo da osservare è comprendere la consegna, creare qualcosa di proprio e desiderare di approfondire un aspetto dell’indirizzo.

## Conservazione

Copie integrali del sito di partenza e delle proposte AFM/SIA/SSAS conservate fuori dalla radice pubblica. Una nuova copia privata su Mac contiene soltanto campi espliciti delle risposte e note autorizzate, senza nominativi, credenziali, classi o attestati. Nessun dato degli alunni entra nel repository o nella memoria condivisa.

Evidenze locali: `outputs/cinque-percorsi-rilascio/`. Lo stato del rilascio effettivo, il commit, le versioni delle funzioni e la verifica live vengono registrati dopo la distribuzione.
