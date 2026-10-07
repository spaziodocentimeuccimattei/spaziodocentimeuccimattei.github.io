# Bussola SSAS — verifica dei cinque laboratori

7 ottobre 2026 · IIS Meucci - Mattei | Decimomannu

Nuova esperienza locale: <http://127.0.0.1:8766/bussola-ssas.html>. Si attraversano tutti e cinque i laboratori: salute, relazione, cura e autonomia, creatività e progettazione. La versione precedente è conservata in `archivio/bussola-ssas-laboratorio-creativo.html`, con i suoi moduli e il suo spazio di salvataggio. Il sito pubblico e la prima parte della Bussola non sono stati modificati.

Il [progetto](progetto-ssas-cinque-laboratori.md) documenta fonti, decisioni, limiti e testi. La [mappa delle fonti della scuola](mappa-ssas-fonti-ecosistema.md) documenta il taglio specifico dell’indirizzo.

## Verifiche tecniche eseguite

- Percorso completo nell’applicativo: cinque laboratori conclusi, cinque prodotti personali, scelta di più interessi e restituzione coerente. Nessun punteggio delle capacità.
- Salute: tre ambiti visibili, con asma, paralisi cerebrale infantile e Alzheimer; collegamento tra funzionamento del corpo, patologia, cura e partecipazione. Sono esempi introduttivi, non un catalogo delle condizioni.
- Interazioni: risposte del dialogo collegate alla domanda; sostegni visibili nell’anteprima; due sviluppi della storia; prova dell’accesso al servizio prima e dopo la modifica. Le risposte dei personaggi sono predisposte, non dati raccolti da persone reali.
- Requisiti: un tentativo incompleto mostra la consegna mancante e porta il focus al controllo interessato. I cinque laboratori sono obbligatori; si può tornare a rivedere il lavoro.
- Ripristino dopo ricaricamento: testi, scelte, versioni precedenti e note conservati. Cambio di ambito e ritorno conservano le alternative locali nel progetto.
- Supabase reale, con soli dati sintetici: lettura di controllo ha confermato tutti e cinque i laboratori conclusi, `finished: true`, due interessi e due note distinte nei contesti Relazione e Progettazione. Il ruolo dichiarato era alunno per la prima nota e docente per la seconda. Nessuna migrazione o modifica al backend in questo passaggio.
- Esportazione effettiva: scaricati SVG e JSON dal browser. SVG valido; JSON con tutti e cinque i lavori e due note separate, senza credenziale di accesso.
- Logica: controllati tutti gli esempi sanitari, le persone, i servizi e le combinazioni di obiettivo e ambientazione creativa; un lavoro incompleto non resta marcato come concluso. Il nuovo formato è conservato dall’API esistente, inclusi campi aggiuntivi.
- Accessibilità di base: controlli etichettati, indicazione dei requisiti, focus sul titolo nel cambio di fase, chiusura delle note con Escape e ritorno al pulsante. La bozza si conserva sul dispositivo. Non è una certificazione completa di accessibilità.
- Schermi: nessuno scorrimento orizzontale nei controlli a 320, 390, 768 e 1280 pixel. La barra usa due righe negli schermi più stretti. Controllo visivo di ingresso e laboratorio sanitario. Console della prova senza errori o avvisi.
- Nuovo progetto: il tentativo tecnico è conservato in un archivio locale prima di aprire un identificativo distinto. L’anteprima consegnata riparte dall’ingresso.

L’IA compare solo nella creatività: il ragazzo rivede una bozza preparata con IA durante la progettazione. Questa versione non genera risposte in tempo reale. Nomi, scuole, classi, gestione delle note altrui e attestati nominativi rimangono uno step successivo.

## Prova educativa da svolgere

L’ipotesi di **12–15 minuti** non è ancora verificata. Anche comprensione, interesse e desiderio di continuare richiedono una prova con ragazzi di terza media.

Prova proposta con un piccolo gruppo e un docente: chiedere di spiegare la consegna con parole proprie; osservare esitazioni, richieste di aiuto e tempi per laboratorio; usare le note nel punto in cui nasce la difficoltà. Alla fine chiedere quale prodotto sentono proprio, quale possibilità dell’indirizzo hanno scoperto e quale parte vorrebbero continuare. Distinguere il gradimento della grafica dalla curiosità per l’indirizzo. Non misurare attitudini o capacità attraverso errori e velocità.

Prima del test nominativo vanno definite gestione dei gruppi, visibilità dei dati, conservazione e informativa. La scadenza tecnica dell’accesso non equivale alla cancellazione dei dati. La pubblicazione della nuova versione richiede un’autorizzazione esplicita successiva.
