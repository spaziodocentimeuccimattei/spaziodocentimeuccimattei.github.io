const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
export function italyToday() {
  return new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Rome'}).format(new Date());
}
export function shiftMonth(month, offset) {
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 1 + offset, 1));
  return date.toISOString().slice(0, 7);
}
export function monthTitle(month) {
  const [year, number] = month.split('-').map(Number);
  return `${MONTHS[number - 1]} ${year}`;
}
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function ordered(dates) {
  return [...dates].sort((a,b) => a.data.localeCompare(b.data) || (a.ora_inizio || '').localeCompare(b.ora_inizio || ''));
}
export function calendarModel(schools, appointments, {start = italyToday().slice(0,7), today = italyToday(), ready = true} = {}) {
  const months = [start, shiftMonth(start,1), shiftMonth(start,2)];
  const dates = appointments.filter(item => !item.archiviata && validDate(item.data));
  const rows = schools.map(school => {
    const all = ordered(dates.filter(item => item.scuola_id === school.id));
    const upcoming = all.filter(item => item.data >= today);
    const state = !ready ? 'unknown' : upcoming.some(item => item.stato === 'confermata') ? 'confirmed' : upcoming.length ? 'planned' : 'undated';
    return {school, all, upcoming, state, cells:months.map(month => all.filter(item => item.data.startsWith(month))), outside:all.filter(item => !months.includes(item.data.slice(0,7)))};
  });
  return {months, rows, counts:{all:rows.length, dated:ready ? rows.filter(row => row.upcoming.length).length : null, undated:ready ? rows.filter(row => !row.upcoming.length).length : null, planned:ready ? rows.filter(row => row.upcoming.some(item => item.stato !== 'confermata')).length : null}};
}
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function timeRange(item) {
  const start=(item.ora_inizio || '').slice(0,5), end=(item.ora_fine || '').slice(0,5);
  return start && end ? `${start}–${end}` : start ? `Dalle ${start}` : end ? `Fino alle ${end}` : 'Orario da definire';
}
function action(text, handler, className='school-calendar__action') {
  const button=node('button',text,className);button.type='button';button.addEventListener('click',handler);return button;
}

export function createSchoolCalendar(root, {admin=false, onAdd, onEdit, onChoose} = {}) {
  let schools=[], appointments=[], states=new Map(), ready=false, start=italyToday().slice(0,7), filter='all', term='';
  root.classList.add('school-calendar');
  const heading=node('div',null,'school-calendar__heading');
  const copy=node('div');copy.append(node('p','Orientamento · tutte le scuole','school-calendar__eyebrow'),node('h2','Scuole e calendario'),node('p','Date, orari e luoghi per ciascuna scuola. Le scuole senza appuntamenti restano nell’elenco.','school-calendar__lead'));
  heading.append(copy);root.append(heading);
  const toolbar=node('div',null,'school-calendar__toolbar');
  const period=node('div',null,'school-calendar__period');
  const label=node('label','Periodo dal mese');const month=node('input');month.type='month';month.value=start;month.id=`${root.id}-month`;label.htmlFor=month.id;label.append(month);
  const previous=action('←',()=>changePeriod(-3));previous.setAttribute('aria-label','Mostra i tre mesi precedenti');
  const next=action('→',()=>changePeriod(3));next.setAttribute('aria-label','Mostra i tre mesi successivi');
  period.append(previous,label,next);
  const searchLabel=node('label','Cerca una scuola');const search=node('input');search.type='search';search.placeholder='Comune o scuola';search.id=`${root.id}-search`;searchLabel.htmlFor=search.id;searchLabel.append(search);
  toolbar.append(period,searchLabel);root.append(toolbar);
  const filters=node('div',null,'school-calendar__filters');filters.setAttribute('aria-label','Scuole da mostrare');
  const buttons=new Map();
  for (const [key,title] of [['all','Tutte le scuole'],['dated','Con date in arrivo'],['undated','Senza date in arrivo'],['planned','Date da confermare']]) {
    const button=action('',()=>{filter=key;render();},'school-calendar__filter');button.dataset.calendarFilter=key;button.dataset.title=title;buttons.set(key,button);filters.append(button);
  }
  root.append(filters);
  const message=node('p',null,'school-calendar__message');message.setAttribute('role','status');message.setAttribute('aria-live','polite');root.append(message);
  const periodHeading=node('h3',null,'school-calendar__period-title');root.append(periodHeading);
  const result=node('p',null,'school-calendar__result');result.setAttribute('aria-live','polite');root.append(result);
  const wrap=node('div',null,'school-calendar__table-wrap');root.append(wrap);
  const legend=node('p','Confermata dalla scuola · Prevista, da confermare · Senza data in arrivo','school-calendar__legend');root.append(legend);
  search.addEventListener('input',()=>{term=normalize(search.value.trim());render();});
  month.addEventListener('change',()=>{if(/^\d{4}-\d{2}$/.test(month.value)){start=month.value;render();}});
  function changePeriod(offset) {start=shiftMonth(start,offset);month.value=start;render();}
  function eventCard(item) {
    const card=node('article',null,`school-calendar__event ${item.stato==='confermata'?'is-confirmed':'is-planned'}`);
    const date=node('time',null,'school-calendar__date');date.dateTime=item.data;
    const number=node('strong',String(Number(item.data.slice(8))));
    const dateCopy=node('span');dateCopy.append(node('b',monthTitle(item.data.slice(0,7))),node('span',new Intl.DateTimeFormat('it-IT',{weekday:'long'}).format(new Date(`${item.data}T12:00:00`))));date.append(number,dateCopy);card.append(date);
    card.append(node('p',timeRange(item),'school-calendar__time'));
    card.append(node('p',item.stato==='confermata'?'Confermata dalla scuola':'Prevista · da confermare','school-calendar__badge'));
    if(item.data<italyToday()) card.append(node('p','Data trascorsa','school-calendar__past'));
    card.append(node('p',item.tipo==='stand'?'Open day con stand':'Orientamento nelle aule','school-calendar__type'));
    card.append(node('p',item.luogo || 'Luogo da definire','school-calendar__place'));
    if(admin && item.nota) {const note=node('div',null,'school-calendar__note');note.append(node('strong','Nota interna'),node('p',item.nota));card.append(note);}
    if(admin && onEdit && item.id) card.append(action('Modifica questa data',()=>onEdit(item), 'school-calendar__action'));
    return card;
  }
  function schoolHeader(row) {
    const th=node('th',null,'school-calendar__school');th.scope='row';
    th.append(node('strong',row.school.comune),node('span',row.school.etichetta));
    const labels={confirmed:'Con date confermate',planned:'Date da confermare',undated:'Senza data in arrivo',unknown:'Date non disponibili'};
    th.append(node('span',labels[row.state],`school-calendar__school-state is-${row.state}`));
    const participation=states.get(row.school.id);
    if(participation==='visitata')th.append(node('small','Visita già registrata','school-calendar__participation'));
    else if(participation==='in_arrivo')th.append(node('small','Disponibilità docente presente','school-calendar__participation'));
    if(row.school.avviso) {
      const detail=node('details',null,'school-calendar__notice');detail.append(node('summary','Indicazioni della scuola'));
      detail.append(node('strong',row.school.avviso.titolo));
      for(const text of row.school.avviso.indicazioni || [])detail.append(node('p',text));th.append(detail);
    }
    if(admin && onAdd)th.append(action('Aggiungi una data',()=>onAdd(row.school)));
    if(!admin && onChoose)th.append(action('Dai disponibilità',()=>onChoose(row.school)));
    return th;
  }
  function render() {
    const model=calendarModel(schools,appointments,{start,ready});
    for(const [key,button] of buttons) {button.replaceChildren(node('span',button.dataset.title),node('b',model.counts[key] ?? '—'));button.setAttribute('aria-pressed',String(filter===key));button.disabled=!ready&&key!=='all';}
    const visible=model.rows.filter(row=> (!term||normalize(`${row.school.comune} ${row.school.etichetta}`).includes(term)) && (filter==='all'||filter==='dated'&&row.upcoming.length||filter==='undated'&&!row.upcoming.length||filter==='planned'&&row.upcoming.some(item=>item.stato!=='confermata')));
    periodHeading.textContent=`${monthTitle(model.months[0])} — ${monthTitle(model.months[2])}`;
    result.textContent=`${visible.length} di ${schools.length} scuole visibili${filter==='all'&&!term?' · elenco completo':''}`;
    wrap.replaceChildren();
    if(!schools.length) {wrap.append(node('p','Caricamento dell’elenco delle scuole…','school-calendar__empty'));return;}
    if(!visible.length) {wrap.append(node('p','Nessuna scuola corrisponde a questa ricerca.','school-calendar__empty'),action('Mostra tutte le scuole',()=>{filter='all';term='';search.value='';render();}));return;}
    const table=node('table');const caption=node('caption','Calendario delle scuole: gli appuntamenti sono collocati nel loro mese.','school-calendar__sr-only');table.append(caption);
    const thead=node('thead'),head=node('tr');const schoolColumn=node('th','Scuola');schoolColumn.scope='col';head.append(schoolColumn);
    for(const key of model.months){const th=node('th',monthTitle(key));th.scope='col';head.append(th);}thead.append(head);table.append(thead);
    const tbody=node('tbody');
    for(const row of visible) {
      const tr=node('tr');tr.dataset.school=row.school.id;tr.dataset.calendarState=row.state;tr.append(schoolHeader(row));
      if(!ready || !row.all.length || !row.cells.some(cell=>cell.length)) {
        const td=node('td',null,'school-calendar__gap');td.colSpan=3;
        if(!ready)td.append(node('strong','Le date non sono ancora disponibili'),node('p','Aggiorna la pagina per ricaricare il calendario.'));
        else if(!row.all.length) {td.append(node('strong',states.get(row.school.id)==='visitata'?'Visita già registrata':'Data da concordare'),node('p',states.get(row.school.id)==='visitata'?'Nessun nuovo appuntamento in arrivo.':'Appuntamento e orario non ancora inseriti.'));}
        else {td.append(node('strong','Appuntamenti fuori dal periodo visualizzato'));for(const item of row.outside)td.append(eventCard(item));}
        tr.append(td);
      } else {
        row.cells.forEach((items,index)=>{const td=node('td',null,items.length?'school-calendar__month has-events':'school-calendar__month is-empty');td.dataset.month=monthTitle(model.months[index]);for(const item of items)td.append(eventCard(item));tr.append(td);});
      }
      tbody.append(tr);
      if(row.outside.length && row.cells.some(cell=>cell.length)) {
        const extra=node('tr',null,'school-calendar__outside');const td=node('td');td.colSpan=4;td.append(node('strong',`Altre date · ${row.school.comune} · ${row.school.etichetta}`));for(const item of row.outside)td.append(eventCard(item));extra.append(td);tbody.append(extra);
      }
    }
    table.append(tbody);wrap.append(table);
  }
  render();
  return {
    update(nextSchools,nextAppointments,nextStates=new Map()) {schools=nextSchools;appointments=nextAppointments;states=nextStates;ready=true;message.textContent='';message.classList.remove('is-error');render();},
    setError(nextSchools=schools) {schools=nextSchools;message.textContent=ready?'Impossibile aggiornare il calendario. Sono ancora visibili le ultime date caricate.':'Le date non sono disponibili: non è possibile stabilire quali scuole abbiano un appuntamento. Riprova con Aggiorna calendario.';message.classList.add('is-error');render();},
    clear() {schools=[];appointments=[];states=new Map();ready=false;message.textContent='';render();},
  };
}
