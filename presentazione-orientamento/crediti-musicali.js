addEventListener('DOMContentLoaded',()=>{
  document.getElementById('music-track').addEventListener('change',event=>Sottofondo.setTrack(event.target.value).catch(()=>{}));
  const button=document.createElement('button');button.className='closing-credits';button.dataset.musicCredits='';button.textContent='Crediti musicali';document.querySelector('#contatti .btn-row').append(button);
  document.addEventListener('click',event=>{if(!event.target.closest('[data-music-credits]'))return;
    document.getElementById('sound-panel').hidden=true;document.getElementById('music-button').setAttribute('aria-expanded','false');
    document.getElementById('viewer-content').innerHTML='<article class="local-information music-credits"><h2>Musiche</h2><section><h3>Adventure</h3><p>Music by Bensound.com<br>License code: <code>NWL9FEBKWR0HPH0O</code><br>Artist: Benjamin Tissot</p></section><section><h3>Going Higher</h3><p>Music by Bensound.com/royalty-free-music<br>License code: <code>BPNQQTZD9YDFTPOS</code><br>Artist: Benjamin Tissot</p></section><section><p>Suono d’apertura e base alternativa originale realizzati per questa presentazione.</p></section></article>';
    document.querySelectorAll('video').forEach(v=>v.pause());const viewer=document.getElementById('viewer');if(!viewer.open)viewer.showModal();
  });
});
