import assert from 'node:assert/strict';
import {experienceRoute,setupExperienceNavigation} from '../bussola-navigazione.mjs';

function browser(href){
 let stack=[new URL(href)],index=0;const events={};
 const b={get location(){return stack[index];},addEventListener:(name,fn)=>events[name]=fn};
 b.history={
  replaceState:(_,__,href)=>{stack[index]=new URL(href);},
  pushState:(_,__,href)=>{stack=stack.slice(0,index+1);stack.push(new URL(href));index++;},
  back:()=>{if(index){index--;events.popstate();}},
  forward:()=>{if(index<stack.length-1){index++;events.popstate();}}
 };
 return b;
}
let checks=0;
for(const course of ['afm','sia','turismo','ssas','cat']){
 for(const hash of ['', '#ingresso', '#classe=TEST26&alunno='+ 'A'.repeat(43)]){
  for(const saved of [{screen:4,finished:false,answer:'Risposta conservata'},{screen:10,finished:true,answer:'Lavoro concluso'}]){
   const snapshot=JSON.stringify(saved),b=browser(`https://scuola.example/bussola-${course}.html?progetto=prova${hash}`);
   const visits=[];let nav;
   nav=setupExperienceNavigation(route=>{visits.push(route);nav.write(route);},b);
   assert.equal(nav.isIntro(),true,'Il lavoro salvato non deve saltare la presentazione');
   nav.write('ingresso');assert.equal(JSON.stringify(saved),snapshot);
   nav.enter();nav.write('passaggio-5');assert.equal(nav.isIntro(),false);
   b.history.back();assert.equal(nav.isIntro(),true);
   assert.equal(experienceRoute(b.location.hash),'ingresso');
   b.history.forward();assert.equal(nav.isIntro(),false);
   assert.deepEqual(visits,['ingresso','passaggio-5']);
   assert.equal(b.location.searchParams.get('progetto'),'prova');
   if(hash.includes('classe=')){
    const params=new URLSearchParams(b.location.hash.slice(1));
    assert.equal(params.get('classe'),'TEST26');assert.equal(params.get('alunno'),'A'.repeat(43));
   }
   const reload=setupExperienceNavigation(()=>{},b);assert.equal(reload.isIntro(),false);
   assert.equal(JSON.stringify(saved),snapshot);checks++;
  }
 }
}
for(const hash of ['#passaggio-1','#passaggio-10','#laboratorio-2-3','#conclusione','#classe=TEST26&passaggio=passaggio-4'])assert.notEqual(experienceRoute(hash),'ingresso');
for(const hash of ['#vecchio','#passaggio-999','#classe=TEST26','#'])assert.equal(experienceRoute(hash),'ingresso');
console.log(`${checks} scenari: ingresso con lavoro iniziato o concluso, link classe/personale, cronologia avanti/indietro, ricaricamento e conservazione dei dati.`);
