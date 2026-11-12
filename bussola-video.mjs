// Comandi del video nella prima pagina della Bussola: avvio con un pulsante grande, pausa, schermo intero.
const video = document.getElementById('bussolaVideo');
const play = document.getElementById('bussolaVideoPlay');
const pause = document.getElementById('bussolaVideoPause');
const full = document.getElementById('bussolaVideoFull');
if (video && play && pause && full) {
  const aggiorna = () => { play.hidden = !video.paused; pause.hidden = video.paused; };
  const avvia = () => { const p = video.play(); if (p && p.catch) p.catch(() => { video.controls = true; }); };
  play.addEventListener('click', avvia);
  pause.addEventListener('click', () => video.pause());
  video.addEventListener('click', () => { if (video.controls) return; if (video.paused) avvia(); else video.pause(); });
  for (const evento of ['play', 'playing', 'pause', 'ended']) video.addEventListener(evento, aggiorna);
  full.addEventListener('click', () => {
    if (video.paused) avvia();
    if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone
  });
  aggiorna();
}
