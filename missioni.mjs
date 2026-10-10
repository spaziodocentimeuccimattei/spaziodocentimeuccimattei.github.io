import { readState, freshState, totals, clearState } from './bussola-core.mjs';
import { el, button, link, choice, storage, persist, loadData, focusHeading, setJourney, contactsPanel, showError } from './bussola-ui.mjs?v=20261010-correzioni';

import { courseArt, amountVisual, routeVisual, dataFlow, observationVisual, itineraryMap } from './bussola-visuals.mjs?v=20261010-correzioni';

const catalog = document.getElementById('missionCatalog');
const cards = document.getElementById('catalogCards');
const panel = document.getElementById('missionPanel');
const contactsMount = document.getElementById('contactMount');
let missions, courses, situations, contacts, current, step = 0;
let selected = [], followup = '', firstSelection = [];

function openCatalog(updateUrl = true) {
  if (updateUrl) history.replaceState(null, '', 'missioni.html');
  panel.hidden = true; catalog.hidden = false; contactsMount.hidden = false;
  current = null; setJourney(2); focusHeading(catalog);
}

function openMission(id, updateUrl = true) {
  if (id === 'afm') { window.location.assign('bussola-afm.html'); return; }
  if (id === 'sia') { window.location.assign('bussola-sia.html'); return; }
  if (id === 'cat') { window.location.assign('bussola-cat.html'); return; }
  if (id === 'turismo') { window.location.assign('bussola-turismo.html'); return; }
  if (id === 'ssas') { window.location.assign('bussola-ssas.html'); return; }
  current = missions.find(m => m.id === id);
  if (!current) return openCatalog(updateUrl);
  if (updateUrl) history.replaceState(null, '', `missioni.html?corso=${encodeURIComponent(id)}`);
  step = 0; selected = []; followup = ''; firstSelection = [];
  catalog.hidden = true; contactsMount.hidden = true; panel.hidden = false;
  setJourney(2); renderMission();
}

function planSvg(layout, suffix) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox','0 0 440 360'); svg.setAttribute('class','room-plan');
  svg.setAttribute('role','img'); svg.setAttribute('aria-labelledby',`planTitle-${suffix} planDesc-${suffix}`);
  function node(tag, attrs, text) {
    const n = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k,String(v)));
    if (text) n.textContent = text; svg.append(n); return n;
  }
  node('title',{id:`planTitle-${suffix}`},layout.label);
  node('desc',{id:`planDesc-${suffix}`},`Stanza 4 per 3 metri. ${layout.description}`);
  node('rect',{x:20,y:35,width:400,height:300,fill:'#fff',stroke:'#123c57','stroke-width':3});
  node('text',{x:180,y:22},'4 metri'); node('text',{x:22,y:354},'3 metri · pianta semplificata');
  for (const [key,color,label] of [['table','#d9e9e6','Tavolo'],['shelf','#c9d8e0','Scaffale']]) {
    const [x,y,w,h] = layout[key];
    node('rect',{x:20+x*100,y:35+y*100,width:w*100,height:h*100,fill:color,stroke:'#006b63','stroke-width':2});
    node('text',{x:20+(x+w/2)*100,y:35+(y+h/2)*100,'text-anchor':'middle','dominant-baseline':'middle',...(w < .8 ? {transform:`rotate(-90 ${20+(x+w/2)*100} ${35+(y+h/2)*100})`} : {})},label);
  }
  node('path',{d:'M 350 35 L 420 35',stroke:'#fff','stroke-width':5});
  node('path',{d:'M 420 35 L 420 105 M 350 35 A 70 70 0 0 0 420 105',fill:'none',stroke:'#862742','stroke-width':2,'stroke-dasharray':'4 3'});
  node('text',{x:335,y:125},'Porta');
  return svg;
}

function firstFeedback(target, alteredBudget = false) {
  target.replaceChildren();
  if (current.type === 'budget') target.append(amountVisual(totals(current.options, selected, 'cost'), alteredBudget ? current.newBudget : current.budget, '€', 'La tua spesa'));
  if (current.type === 'itinerary') target.append(amountVisual(totals(current.options, selected, 'minutes'), current.limit, 'min', 'Il tempo della visita'), itineraryMap(current.options,selected), routeVisual(current.options,selected));
  if (current.type === 'records') {
    target.append(dataFlow());
    const codes = current.records.filter(r => selected.includes(r.id)).map(r => r.code);
    panel.querySelectorAll('.records-grid .choice').forEach(label => {
      const record = current.records.find(r => r.id === label.querySelector('input').value);
      label.classList.toggle('related-record', codes.includes(record.code) && current.records.filter(r => r.code === record.code).length > 1);
    });
  }
  if (current.type === 'observations') target.append(observationVisual(current.options,selected));
  if (!selected.length) {
    target.append(el('p', 'Scegli almeno una carta per osservare che cosa cambia.'));
    return;
  }
  if (current.type === 'budget') {
    const budget = alteredBudget ? current.newBudget : current.budget;
    const cost = totals(current.options, selected, 'cost');
    target.append(el('p', cost <= budget ? 'Che cosa sarebbe utile verificare prima di spendere?' : 'Quale acquisto potresti rimandare per restare nel budget?', cost > budget ? 'constraint-note' : ''));
    if (selected.includes('custodia') && selected.includes('zaino')) target.append(el('p', 'Hai scelto sia la custodia sia lo zaino. Ti servono entrambi o vuoi confrontarli?', 'constraint-note'));
  } else if (current.type === 'itinerary') {
    const minutes = totals(current.options, selected, 'minutes');
    if (minutes > current.limit) target.append(el('p', 'Quale tappa potresti togliere per rispettare il tempo disponibile?', 'constraint-note'));
    if (current.options.some(o => selected.includes(o.id) && o.stairs)) target.append(el('p', 'La torre richiede una scala. Per rispettare la richiesta della visitatrice occorre cambiare tappa o verificare un accesso alternativo.', 'constraint-note'));
    else target.append(el('p', 'Le descrizioni delle tappe scelte indicano accessi senza scale. Prima di una visita reale le condizioni vanno verificate.'));
  } else if (current.type === 'records') {
    const rows = current.records.filter(o => selected.includes(o.id));
    for (const row of rows) {
      const same = current.records.filter(r => r.code === row.code);
      target.append(el('p', same.length > 1 ? `${row.item}: il codice ${row.code} compare anche per un altro oggetto. Occorre verificare quale informazione correggere.`
        : row.status === 'Stato mancante' ? `${row.item}: senza lo stato non sappiamo se l’oggetto è disponibile.`
        : `${row.item}: la riga ha un codice e uno stato. È utile anche sapere quando è stata aggiornata.`));
    }
    target.append(el('p', 'Puoi selezionare altre righe e confrontare gli indizi.'));
  } else if (current.type === 'layout') {
    const layout = current.layouts.find(o => selected.includes(o.id));
    if (layout) target.append(el('p', layout.feedback), planSvg(layout, 'selected'));
  } else {
    for (const item of current.options.filter(o => selected.includes(o.id))) target.append(el('p', `${item.label} ${item.detail}`));
  }
}

function firstStep(alteredBudget = false) {
  panel.append(el('p', alteredBudget ? current.followup : current.intro, 'scenario'));
  const fieldset = el('fieldset', null, 'choices');
  fieldset.append(el('legend', alteredBudget ? 'Rivedi le scelte con 90 euro disponibili.' : current.prompt));
  const list = el('div', null, current.type === 'records' ? 'records-grid' : 'choice-list');
  const feedback = el('div', null, 'mission-feedback'); feedback.setAttribute('aria-live','polite'); feedback.setAttribute('aria-atomic','true');
  const options = current.type === 'records'
    ? current.records.map(r => ({id:r.id,label:`${r.code} · ${r.item}`,detail:r.status}))
    : current.type === 'layout' ? current.layouts.map(l => ({id:l.id,label:l.label,detail:l.description}))
    : current.options.map(o => ({...o, detail: current.type === 'budget' ? `${o.cost} euro. ${o.detail}` : current.type === 'itinerary' ? `${o.minutes} minuti. ${o.detail}` : undefined}));
  const next = button(alteredBudget ? 'Osserva il percorso' : 'Continua', () => {
    if (!alteredBudget) firstSelection = [...selected];
    step += 1; renderMission();
  });
  next.disabled = !selected.length;
  for (const option of options) {
    const type = current.type === 'layout' ? 'radio' : 'checkbox';
    const item = choice(option, type, 'mission-choice', selected.includes(option.id), event => {
      if (type === 'radio') selected = [option.id];
      else selected = event.target.checked ? [...selected,option.id] : selected.filter(id => id!==option.id);
      firstFeedback(feedback, alteredBudget); next.disabled = !selected.length;
    });
    if (current.type === 'layout') item.append(planSvg(current.layouts.find(l=>l.id===option.id), `option-${option.id}`));
    list.append(item);
  }
  fieldset.append(list);
  const activity = el('div',null,`activity-workspace workspace-${current.type}`);
  activity.append(fieldset,feedback); panel.append(activity);
  firstFeedback(feedback, alteredBudget);
  footer(next);
}

function followupStep() {
  panel.append(el('p', 'Prova a fare un passo in più.', 'scenario'));
  const fieldset = el('fieldset', null, 'choices'); fieldset.append(el('legend', current.followup));
  const list = el('div', null, 'choice-list');
  const feedback = el('div', null, 'mission-feedback'); feedback.setAttribute('aria-live','polite');
  const next = button('Osserva il percorso', () => { step = 2; renderMission(); }); next.disabled = !followup;
  for (const option of current.choices) list.append(choice(option,'radio','mission-followup',followup===option.id, () => {
    followup = option.id; feedback.replaceChildren(el('p',option.feedback)); next.disabled = false;
  }));
  if (followup) feedback.append(el('p',current.choices.find(o=>o.id===followup).feedback));
  fieldset.append(list); panel.append(fieldset,feedback); footer(next);
}

function footer(next) {
  const row = el('div',null,'question-footer');
  const back = button('Indietro', () => { step -= 1; renderMission(); },'explore-button secondary'); back.disabled = step===0;
  row.append(back,button('Tutte le esperienze',()=>openCatalog(),'skip-button'),next); panel.append(row);
}

function conclusion() {
  const choices = current.type==='records' ? current.records.map(r=>({id:r.id,label:`${r.code} · ${r.item}`})) : current.type==='layout' ? current.layouts : current.options;
  panel.append(el('p','Hai provato un piccolo modo di osservare e affrontare una situazione. Puoi rivedere le scelte o provare un altro contesto.'));
  const recap = el('div',null,'mission-feedback');
  recap.append(el('h3','Le azioni che hai provato'));
  if (current.type==='budget') {
    recap.append(el('p',`Prima: ${totals(current.options,firstSelection,'cost')} euro su ${current.budget}. Dopo il cambiamento: ${totals(current.options,selected,'cost')} euro su ${current.newBudget}.`));
  }
  const ul = el('ul');
  for (const item of choices.filter(o=>selected.includes(o.id))) ul.append(el('li',item.label || item.item));
  recap.append(ul);
  if (followup) recap.append(el('p',current.choices.find(o=>o.id===followup).feedback));
  panel.append(recap,el('h3','Che cosa puoi osservare'),el('p',current.reflection),el('h3','In quale materia ritrovi questa attività?'),el('p',current.bridge));
  const course=courses.find(c=>c.id===current.id);
  const row=el('div',null,'action-row');
  row.append(link(`Esplora ${course.code}`,`indirizzi.html#${course.id}`),button('Prova un’altra esperienza',()=>openCatalog(),'explore-button secondary'),button('Riprova questa esperienza',()=>openMission(current.id),'explore-button secondary'),link('Tutti gli indirizzi','indirizzi.html#diurni','explore-button secondary'));
  panel.append(row);
  const state=readState(storage(),situations,missions.map(m=>m.id)) || freshState();
  state.missions[current.id]={completed:true}; persist(state);
  contactsMount.hidden=false;
}

function renderMission() {
  const course=courses.find(c=>c.id===current.id);
  const progress=el('p',`${course.code} · ${step+1} di 3 passaggi`,'explore-kicker');
  const title=el('h2',current.title); title.id='missionTitle';
  panel.dataset.course=current.id;
  const heading=el('div',null,'activity-heading'); const copy=el('div');
  copy.append(progress,title,el('p',course.name,'activity-course-name')); heading.append(copy,courseArt(current.id));
  panel.replaceChildren(heading);
  if (step===0) firstStep();
  else if (step===1) current.type==='budget' ? firstStep(true) : followupStep();
  else conclusion();
  focusHeading(panel);
}

async function initialize() {
  try {
    const [m,c,b,contactData]=await loadData(['missioni','indirizzi','bussola','contatti']);
    missions=m.missions; courses=c.courses; situations=b.situations; contacts=contactData;
    cards.replaceChildren();
    for (const course of courses) {
      const mission=missions.find(m=>m.id===course.id);
      const card=el('article',null,'mission-card'); card.dataset.course=course.id; card.append(courseArt(course.id));
      const isAFM=course.id==='afm',isSIA=course.id==='sia';const isSSAS=course.id==='ssas',isTur=course.id==='turismo',isCat=course.id==='cat';
      card.append(el('p',course.code,'explore-kicker'),el('h2',isSSAS||isTur||isCat||isAFM||isSIA?'Cinque laboratori, un percorso personale':mission.title),el('p',course.name,'activity-course-name'),el('p',isAFM?'Idee e impresa, organizzazione, dati e finanza, accordi, marketing e lingue':isSIA?'Processi, dati, programmazione, interfacce e responsabilità':isSSAS?'Salute, relazione, cura e autonomia, creatività e progettazione':isCat?'Rilievo, spazi, materiali, Archeodesign e risorse':isTur?'Territorio, lingue e accoglienza, esperienze, impresa e servizi, comunicazione':mission.subject),isSSAS||isTur||isCat||isAFM||isSIA?link(`Prova ${course.code}`,isAFM?'bussola-afm.html':isSIA?'bussola-sia.html':isCat?'bussola-cat.html':isTur?'bussola-turismo.html':'bussola-ssas.html'):button(`Prova ${course.code}`,()=>openMission(course.id)));
      cards.append(card);
    }
    contactsMount.replaceChildren(contactsPanel(contacts,()=>{
      clearState(storage()); current=null; selected=[]; followup=''; firstSelection=[]; openCatalog();
      document.getElementById('announcements').textContent='Le risposte della Bussola e lo stato delle esperienze sono stati cancellati.';
    }));
    const id=new URLSearchParams(location.search).get('corso');
    if (id && missions.some(m=>m.id===id)) openMission(id,false);
    else setJourney(2);
  } catch { showError(cards,initialize); }
}
window.addEventListener('popstate',()=>{
  if (!missions) return;
  const id=new URLSearchParams(location.search).get('corso');
  if (id) openMission(id,false); else openCatalog(false);
});
initialize();
