// Simple illustrative SVGs: they explain activities, never represent real school equipment.
import { el } from './bussola-ui.mjs';
const scenes={
 afm:'<rect x="36" y="40" width="112" height="140" rx="12"/><path d="M58 72h66M58 96h36M58 120h52"/><rect x="173" y="65" width="96" height="92" rx="12"/><path d="M190 88h58M193 112h12M221 112h12M193 136h12M221 136h12"/>',
 sia:'<rect x="28" y="34" width="250" height="146" rx="14"/><path d="M28 67h250M100 180v20M210 180v20M78 200h154"/><path d="m90 94-24 22 24 22m128-44 24 22-24 22m-58-55-17 68"/>',
 turismo:'',
 cat:'<path d="M42 180V46h105v40h121v94h-92v-45h-48v45zM42 112h86M176 86v49M147 46v40"/><path d="M36 23h236M21 43v140"/><rect x="60" y="62" width="45" height="27" rx="3"/>',
 ssas:'<circle cx="91" cy="94" r="24"/><path d="M43 170q0-42 48-42t48 42"/><circle cx="223" cy="94" r="24"/><path d="M175 170q0-42 48-42t48 42"/><rect x="110" y="26" width="86" height="38" rx="12"/><path d="m136 64-12 13M132 44h43"/>'
};
// The map uses a clear route without implying a real geographic location.
scenes.turismo='<path d="m30 53 83-23 86 28 78-25v143l-78 25-86-28-83 23zM113 30v143M199 58v143"/><path d="M67 142q40-73 92-25t77-44" stroke-dasharray="7 8"/><circle cx="67" cy="142" r="9"/><circle cx="159" cy="117" r="9"/><circle cx="236" cy="73" r="9"/>';
export function courseArt(id){
 const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 310 220');svg.setAttribute('class',`course-art art-${id}`);svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
 // Fixed local drawings only, never fetched content or user input.
 svg.innerHTML=`<g fill="var(--art-fill, #edf4f4)" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${scenes[id]||scenes.sia}</g>`;
 return svg;
}
export function amountVisual(value,limit,unit,label){
 const box=el('div',null,'amount-visual');const heading=el('p',label,'amount-label');
 const numbers=el('p',null,'amount-numbers');numbers.append(el('strong',`${value} ${unit}`),el('span',` su ${limit} ${unit}`));
 const meter=el('progress');meter.max=limit;meter.value=Math.min(value,limit);meter.setAttribute('aria-label',label);
 box.append(heading,numbers,meter,el('p',value<=limit?`Restano ${limit-value} ${unit}.`:`Hai superato il limite di ${value-limit} ${unit}.`));
 if(value>limit)box.classList.add('over-limit');return box;
}
export function routeVisual(options,selected){
 const route=el('ol',null,'route-visual');route.setAttribute('aria-label','Le tappe che hai scelto');
 options.filter(o=>selected.includes(o.id)).forEach(o=>{const li=el('li');li.append(el('strong',o.label),el('span',`${o.minutes} minuti · ${o.stairs?'con scale':'senza scale'}`));route.append(li)});return route;
}

const questionScenes={
 materie:scenes.afm,
 predisposizioni:'<path d="M44 172h222M62 149l42-43 42 30 86-91M190 45h42v42"/><circle cx="104" cy="106" r="9"/><circle cx="146" cy="136" r="9"/>',
 sogni:'<path d="m155 26 26 56 62 8-46 43 12 63-54-30-54 30 12-63-46-43 62-8z"/>',
 aspirazioni:'<path d="M155 205V30M155 30l98 25-98 29M51 194h38v-33h40v-34h40v-34"/>',
 curiosita:'<path d="M75 141q-38-55 6-87t80 12q37-48 73-13t-5 81l-69 54z"/><path d="M143 76q33-21 38 7t-25 31v12"/><circle cx="156" cy="149" r="3"/>',
 video:'<rect x="37" y="38" width="236" height="145" rx="17"/><path d="m127 75 56 35-56 35zM63 162h184"/>',
 imparare:'<path d="M34 51q64-22 121 5 57-27 121-5v128q-64-22-121 5-57-27-121-5zM155 56v128M55 82h66M55 106h66M189 82h60M189 106h60"/>',
 domande:'<circle cx="133" cy="92" r="59"/><path d="m175 135 70 63M114 73q25-21 38 3t-20 32v8"/><circle cx="132" cy="137" r="3"/>',
 'visita-interessi':'<path d="m34 54 77-22 88 27 75-24v142l-75 23-88-27-77 21zM111 32v141M199 59v141"/><circle cx="153" cy="87" r="14"/><path d="m142 97 11 29 11-29"/>',
 computer:'<rect x="41" y="35" width="228" height="135" rx="12"/><path d="M155 170v28M103 198h104"/><rect x="63" y="58" width="48" height="36" rx="4"/><path d="M135 68h111M135 89h72M64 119h182M64 141h132"/>',
 libro:'<path d="M42 41h180q40 0 40 29v125H69q-27 0-27-26zM42 169q0-22 27-22h193M77 63h133M77 88h133M77 112h82"/>',
 futuro:'<path d="M155 28v177M55 46h164l38 28-38 28H55zM257 121H89l-36 28 36 28h168z"/>'
};
export function questionArt(id){
 const svg=courseArt('sia');svg.setAttribute('class','question-art');
 svg.innerHTML=`<g fill="#e7f3f1" stroke="#123c57" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${questionScenes[id]||questionScenes.curiosita}</g>`;
 return svg;
}
export function dataFlow(){
 const flow=el('ol',null,'data-flow');flow.setAttribute('aria-label','Come rendere utile un elenco');
 for(const text of ['Leggi i dati','Controlla codici e informazioni','Aggiorna l’elenco'])flow.append(el('li',text));
 return flow;
}
export function observationVisual(options,selected){
 const grid=el('div',null,'observation-visual');
 for(const [kind,title,hint] of [['observation','Quello che vedi','Un fatto da cui partire.'],['interpretation','Quello che immagini','Un’ipotesi da verificare.'],['question','Quello che puoi chiedere','Una domanda per capire meglio.']]){
  const box=el('section',null,`observation-kind kind-${kind}`);box.append(el('h3',title),el('p',hint));
  const list=el('ul');for(const option of options.filter(o=>selected.includes(o.id)&&o.kind===kind))list.append(el('li',option.label));
  if(list.children.length)box.append(list);else box.append(el('p','Nessuna carta scelta qui.','plain-note'));grid.append(box);
 }
 return grid;
}
export function itineraryMap(options,selected){
 const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 440 240');svg.setAttribute('class','itinerary-map');svg.setAttribute('role','img');svg.setAttribute('aria-label','Schema del paese immaginario. Le tappe selezionate sono indicate anche nella lista.');
 const positions=[[78,65],[330,65],[78,175],[330,175]];
 const node=(tag,attrs,text)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(text)n.textContent=text;svg.append(n);return n;};
 node('rect',{x:8,y:8,width:424,height:224,rx:20,fill:'#fff'});node('path',{d:'M78 65H330V175H78V65',fill:'none',stroke:'#c4d2d6','stroke-width':8,'stroke-dasharray':'8 10'});
 options.forEach((o,i)=>{const [x,y]=positions[i];const picked=selected.includes(o.id);node('circle',{cx:x,cy:y,r:20,fill:picked?'#006733':'#edf2f3',stroke:'#006733','stroke-width':2});node('text',{x,y:y+6,'text-anchor':'middle',fill:picked?'#fff':'#123c57','font-size':18,'font-weight':700},picked?'✓':String(i+1));node('text',{x,y:y+39,'text-anchor':'middle',fill:'#123c57','font-size':15},['Piazza','Museo','Torre · scale','Giardino'][i]);});
 return svg;
}
