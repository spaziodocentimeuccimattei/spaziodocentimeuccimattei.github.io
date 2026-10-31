/* Audio originali locali. Riproduzione soltanto dopo un gesto esplicito. */
window.Sottofondo = (() => {
  const tracks={going:'assets/bensound-goinghigher.mp3',adventure:'assets/bensound-adventure.mp3',original:'assets/sottofondo.mp3'};
  let track='going';
  const music=new Audio(tracks[track]),impact=new Audio('assets/apertura-crescendo.wav');
  music.loop=true;music.preload='auto';impact.preload='auto';impact.volume=.9;
  let enabled=false,mode='talk',volume=.55,ducked=false,introPlaying=false,fade;
  const target=()=>enabled&&!introPlaying?Math.min(1,volume*(mode==='talk'?.40:.95)*(ducked?.05:1)):0;
  function update(){
    clearInterval(fade);const from=music.volume,to=target(),start=performance.now();
    fade=setInterval(()=>{const t=Math.min(1,(performance.now()-start)/600);music.volume=from+(to-from)*t;if(t===1){clearInterval(fade);if(!enabled)music.pause()}},30);
  }
  async function setEnabled(value){
    if(value){music.volume=0;await music.play();enabled=true}else enabled=false;
    update();return enabled;
  }
  async function intro(){
    impact.pause();impact.currentTime=0;impact.volume=.85;introPlaying=true;
    clearInterval(fade);music.volume=0;
    try{await impact.play()}catch(error){introPlaying=false;update();throw error}
  }
  function stopIntro(){impact.pause();impact.currentTime=0;introPlaying=false;update()}
  impact.addEventListener('ended',()=>{introPlaying=false;update()});
  impact.addEventListener('error',()=>{introPlaying=false;update()});
  async function setTrack(value){if(!tracks[value]||value===track)return;track=value;music.pause();music.src=tracks[track];music.currentTime=0;music.load();if(enabled)await music.play();update()}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)music.pause();else if(enabled)music.play().catch(()=>{})});
  return {setEnabled,setTrack,intro,stopIntro,setMode(value){mode=value;update()},setVolume(value){volume=value;update()},duck(value){ducked=value;update()},get enabled(){return enabled},get mode(){return mode},get track(){return track},get introPlaying(){return introPlaying},get state(){return enabled&&!music.paused?'running':'inactive'},get media(){return music},get impact(){return impact}};
})();
