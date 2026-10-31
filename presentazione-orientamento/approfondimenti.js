/* Le informazioni restano nella presentazione. Il QR Bussola è per l’uso successivo. */
window.InformazioniScuola=(()=>{
  const common='<p class="local-help">Per parlare con la sede: <strong>070 4657043</strong><br><strong>orientamattei@gmail.com</strong></p>';
  const pages={
    orari:{title:'La settimana a scuola',body:`<p>Orario attuale 2026/27, in vigore dal 19 ottobre 2026.</p><table class="hours-table"><thead><tr><th>Giorno</th><th>Ingresso</th><th>Uscita</th></tr></thead><tbody>${['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'].map((day,i)=>`<tr><td>${day}</td><td>8:30</td><td>${i===1||i===3?'14:30':'13:30'}</td></tr>`).join('')}</tbody></table><p>Ricreazione: lunedì, mercoledì, venerdì e sabato 10:20–10:40. Martedì e giovedì 10:20–10:35 e 12:20–12:35.</p>`},
    famiglie:{title:'Accompagnare una scelta',body:'<div class="local-steps"><p><b>Ascoltare.</b> Quali attività incuriosiscono vostro figlio? Che cosa vorrebbe imparare?</p><p><b>Confrontare.</b> Guardate insieme cosa si studia e cosa si fa nei cinque percorsi.</p><p><b>Fare esperienza.</b> La Bussola e le attività aiutano a formulare domande, non decidono al posto dei ragazzi.</p><p><b>Incontrarsi.</b> Open Day, visite e confronto con i docenti permettono di conoscere la scuola da vicino.</p></div>'},
    iscrizione:{title:'Come iscriversi alla classe prima',body:'<ol class="local-steps"><li><b>Identità digitale del genitore.</b> Preparare SPID o CIE.</li><li><b>Unica, sezione Iscrizioni.</b> La domanda si compila online nel periodo fissato annualmente dal Ministero.</li><li><b>Scuola e percorso.</b> Cercare la sede di Decimomannu e verificare con la scuola il codice corretto dell’indirizzo. Per SIA, in prima si sceglie AFM.</li><li><b>Compilare e inoltrare.</b> Inserire i dati richiesti, controllarli e completare l’inoltro: salvare una bozza non equivale a inviare la domanda.</li><li><b>Seguire lo stato.</b> Controllare gli aggiornamenti su Unica e per email. Dopo l’esame di terza media si perfeziona l’iscrizione con i documenti indicati dalla segreteria.</li></ol><p>Le date e i codici dell’anno di ingresso vanno confermati prima dell’inoltro. Ti aiutiamo a individuare il percorso corretto.</p>'},
    mappa:{title:'Come raggiungere la sede',body:'<div class="local-location"><strong>Via Ugo Foscolo, 48</strong><span>09033 Decimomannu · Sede Mattei</span></div><div class="local-steps"><p><b>In treno · Trenitalia.</b> La destinazione è la stazione di Decimomannu; dalla stazione si prosegue verso via Ugo Foscolo.</p><p><b>In autobus · ARST o CTM.</b> Le fermate sono nel centro abitato. La linea e la coincidenza dipendono dal paese di partenza.</p><p><b>Prima del viaggio.</b> Verifica gli orari utili per ingresso alle 8:30 e uscita alle 13:30 o 14:30.</p></div>'},
    bussola:{title:'Come funziona la Bussola',body:'<div class="local-steps"><p><b>1. Le curiosità.</b> Dodici domande su interessi, materie, modi di lavorare e aspirazioni. Puoi saltare una domanda e cambiare idea.</p><p><b>2. Gli indirizzi.</b> Trovi percorsi da approfondire e le ragioni collegate alle tue risposte.</p><p><b>3. Le attività.</b> Puoi provare il modo di lavorare dei cinque indirizzi.</p><p><b>4. Il confronto.</b> Ne parli con la famiglia e con i docenti. La scelta resta tua.</p></div><div class="local-qr"><img src="assets/qr-bussola.svg" alt="QR della Bussola"><p>Il QR ti permette di conservarla e usarla con calma dopo l’incontro.</p></div>'},
    domande:{title:'Le domande più frequenti',body:'<div class="local-steps"><p><b>SIA si sceglie già in prima?</b> In prima ci si iscrive ad AFM. L’articolazione SIA si sceglie dal terzo anno.</p><p><b>Il +2 del CAT è obbligatorio?</b> No. Dopo il diploma quadriennale il biennio ITS è facoltativo; sono aperte anche università e lavoro secondo i requisiti previsti.</p><p><b>Come conosco meglio un indirizzo?</b> Qui puoi aprire le schede “Cosa studi” e “Dopo il diploma”, esplorare le foto e usare la dimostrazione della Bussola.</p><p><b>Come chiedo una visita o un confronto?</b> Segna il telefono e l’email della sede e contattaci: possiamo approfondire le domande sul percorso e sull’accoglienza.</p></div>'}
  };
  function open(key){
    const p=pages[key]||pages.domande,viewer=document.getElementById('viewer');
    document.querySelectorAll('video').forEach(v=>v.pause());
    document.getElementById('viewer-content').innerHTML=`<article class="local-information"><h2>${p.title}</h2>${p.body}${common}</article>`;
    if(!viewer.open)viewer.showModal();Sottofondo.duck(false);
  }
  function localize(root=document){
    root.querySelectorAll('a[href^="https://"]').forEach(a=>{
      const url=a.getAttribute('href');let key='domande',label='Domande sulla scuola';
      if(url.includes('orario-lezioni')){key='orari';label='La settimana e le ricreazioni'}
      else if(url.includes('#iscrizione')){key='iscrizione';label='Come iscriversi'}
      else if(url.includes('famiglie.html')){key='famiglie';label='Accompagnare la scelta'}
      else if(url.includes('bussola.html')){key='bussola';label=a.closest('.demo-modal')?'Come funziona la Bussola':'Come funziona'}
      else if(url.includes('google.com/maps')){key='mappa';label='Le indicazioni per arrivare'}
      const button=document.createElement('button');button.className=a.className;button.textContent=label+' →';button.dataset.localInfo=key;a.replaceWith(button);
    });
  }
  document.addEventListener('click',event=>{const b=event.target.closest('[data-local-info]');if(b)open(b.dataset.localInfo)});
  return {localize,open};
})();
