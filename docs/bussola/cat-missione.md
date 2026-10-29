# CAT 4+2 · Missione Aurora

Revisione del 29 ottobre 2026 richiesta da Salvatore, che ha trasmesso la proposta di sostituire l’attività con una missione di rilievo e riqualificazione. Le tre fasi sostituiscono la sequenza di dieci schermate per i nuovi lavori; producono ancora cinque elaborati riconoscibili nel quaderno docente e nell’attestato.

## Esperienza

1. **Rilievo aereo.** Il ragazzo gira intorno al fabbricato con i comandi del drone virtuale, raccoglie quattro riprese, attiva la termocamera e osserva parete, telaio e contorno degli infissi. La scena, il fronte osservato e la posizione del drone rispondono ai comandi. Non è una ricostruzione fotogrammetrica o un pianificatore di volo.
2. **Riqualificazione.** Catalogo con tre opzioni per le pareti, tre per gli infissi e due finiture; anteprima del fabbricato, costo e confronto energetico. Le 18 combinazioni si possono provare e conservare. Per proseguire serve una proposta che riduca l’energia richiesta nel modello e rientri nel budget inventato di 23.000 €. Il riscontro spiega il problema, senza voti o valutazioni delle capacità.
3. **Trasformazione.** Applicazione della proposta al modello e confronto prima/dopo con cursore, anche in vista termica. Conclusione con cinque elaborati, interessi espressi e attestato.

## Correzioni tecniche alla proposta

Il blu non indica automaticamente una dispersione. Nella vista esterna invernale adottata, con interno 20 °C ed esterno 5 °C e senza sole diretto, le zone più calde possono suggerire un maggiore passaggio di calore dall’interno. La termografia misura temperature superficiali: i colori richiedono il contesto e ulteriori verifiche. Il vetro può riflettere altre sorgenti.

Il confronto dei consumi usa un modello separato dalle immagini: (U pareti × 200 m² + U infissi × 40 m² + 80 W/K di altre dispersioni) × 15 K × 1.800 ore equivalenti ÷ 0,85 di rendimento ÷ 1.000. Restano fisse le condizioni e l’impianto. Catalogo, valori U, VOC, costi e ore sono dati didattici inventati; non proprietà universali dei materiali, prezzi di mercato o previsione della bolletta. Non si calcola una classe APE.

Situazione iniziale: circa 17.153 kWh/anno. Esempio con cappotto in lana minerale, doppi vetri e finitura a basse emissioni: circa 6.226 kWh/anno (−64%) e 22.200 €. Altre combinazioni danno risultati diversi. La sola finitura non fa diminuire le dispersioni o i consumi. Il dato VOC riguarda un aspetto ambientale specifico e non attesta la sostenibilità complessiva del prodotto.

Fonti di contesto: [ENEA Trisaia, caratterizzazione dei materiali e termografia](https://www.trisaia.enea.it/attivita-di-ricerca/tecnologie-energetiche/applicazioni-energetiche/attivita-applicazioni-energetiche/caratterizzazione-materiali.html) e [ENEA, significato dell’APE](https://www.apecalabria.enea.it/conoscere-ape). La presentazione del diploma quadriennale e degli sbocchi rimane quella documentata nel precedente rilascio.

## Lavori precedenti

Il discriminante nuovo è `journey: cat-4plus2-missione`; `mission` contiene le interazioni, le scelte, le prove e le applicazioni. Le varianti precedenti (Archeodesign, cortile/luci, fabbricato in dieci passaggi) restano leggibili senza tradurre le vecchie risposte.

Un vecchio salvataggio prima riportava il visitatore al percorso precedente, anche dopo l’aggiornamento della presentazione. Ora la pagina offre **Inizia la missione** e **Riprendi la mia attività precedente**. Il cambio di attività conserva una copia completa nel campo additivo `_cat_archives`, con identificativi, risposte, note, completamenti e campi sconosciuti. Lo stesso partecipante e la stessa classe mantengono l’accesso; non si genera un’identità estranea per aggirare il salvataggio remoto. Il cambio funziona anche dopo la ripresa su un altro dispositivo. Le attività precedenti si possono riaprire dal piè di pagina e dal quaderno del docente. La nuova missione riceve un proprio identificativo/data di attestato; quello precedente resta nell’archivio.

Non occorrono migrazioni o modifiche a ruoli, password e autenticazione. Le funzioni ricevono il medesimo validatore del client. Le prove usano PostgreSQL isolato e dati fittizi.

## Verifiche

- `verifica-cat-missione.mjs`: 188 controlli sul modello, sulle 18 combinazioni, sui vincoli, sulle dipendenze delle scelte, sul recupero dei lavori, su monitoraggio/attestati/CSV e sull’handler con database isolato.
- `verifica-cat-missione-dom.mjs`: percorso completo nel DOM simulato con i veri moduli e il vero handler, da un partecipante di classe già esistente; riprese, termocamera, costi, correzione del budget, cursore, dossier, interessi, nota, ripresa remota e ritorno al lavoro storico.
- Regressioni delle tre attività CAT precedenti, monitoraggio, interfaccia e collegamenti condivisi.
- Scene SVG prima/dopo e termica renderizzate e controllate come immagini.

Il collegamento al browser non era disponibile durante la preparazione: DOM simulato e rendering SVG non certificano il layout o l’esperienza su un dispositivo fisico. L’efficacia orientativa va verificata con ragazzi reali; i controlli tecnici non la dimostrano. Lo stato di pubblicazione e le eventuali verifiche ulteriori sono registrati nel verbale `work/verifica-missione-finale.json` della chat e nello stato istituzionale condiviso.
