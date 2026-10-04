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
