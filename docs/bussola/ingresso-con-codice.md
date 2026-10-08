# Ingresso con codice della classe

La Gestione assegna a ogni classe un codice condiviso di sei caratteri. Le classi già create ricevono il codice senza cambiare identificativo, link originale, nominativi, lavori, note o attestati.

Nella Bussola SSAS, prima dei laboratori, l’alunno inserisce il codice, il nome e il cognome. Scuola e classe vengono riconosciute dal server. «Inizia il percorso» associa il lavoro e apre il primo laboratorio. Un codice errato o una classe chiusa impediscono l’associazione. Chi apre il QR trova già la classe e compila solo i nominativi. La prova senza classe rimane disponibile all’ingresso generico; i lavori già iniziati riprendono dal passaggio conservato.

In Gestione, per le classi con inserimento dei nominativi, sono disponibili «Copia codice» e «Mostra codice e QR». Le classi con elenco preparato mantengono gli accessi individuali. Il codice condiviso è un invito a entrare: non apre lavori, nominativi o note di altri alunni. L’accesso al proprio lavoro mantiene il token personale distinto e la Gestione mantiene la propria autenticazione.

## Aggiornamento

1. Applicare `supabase/sql/bussola-codice-classe.sql` come migrazione additiva.
2. Pubblicare `bussola-gestione` con tutti i suoi moduli, compreso `bussola-codice.mjs`. L’autenticazione personalizzata esistente resta attiva; `verify_jwt` resta nella configurazione precedente.
3. Pubblicare i file della pagina e della Gestione. La prima parte della Bussola, il calendario e il registro restano quelli della versione precedente.

La migrazione mantiene gli accessi precedenti. Una collisione dei codici arresta tutta la migrazione; nella creazione delle nuove classi il server riprova fino a tre volte. La ricerca dei codici brevi usa una quota distinta nella tabella privata già esistente. Le nuove funzioni SQL sono eseguibili solo dal ruolo di servizio, con `search_path` fisso.

## Verifiche

La prova locale integra pagina, API e database isolato: codice corretto ed errato, riconoscimento della classe, primo laboratorio, ricaricamento del lavoro, nominativo nella Gestione, apertura con QR e finestra mobile di 390 pixel senza scorrimento orizzontale. Le verifiche del database coprono conservazione dei vecchi link, omonimi distinti, classi chiuse, accessi individuali, quota, permessi e attestati già esistenti. Non è stata svolta una prova con alunni reali, né una scansione del QR con telefono.

Il QR è generato sul dispositivo, senza servizio esterno. La libreria vendorizzata è `qrcode-generator` 2.0.4, fonte npm ufficiale, integrità SHA-512 verificata, licenza MIT conservata in `assets/vendor/qrcode-generator-LICENSE.txt`.

Le evidenze della pubblicazione e le immagini sono conservate fuori dal sito in `outputs/ingresso-con-codice`. Le copie private dei dati restano fuori dal repository pubblico e da Google Drive.
