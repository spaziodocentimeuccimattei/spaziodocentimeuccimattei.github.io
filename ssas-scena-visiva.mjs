import {sceneImage} from './ssas-illustrazioni.mjs?v=20261012-scene';

// Disegni legati alle opzioni effettive di ciascuna storia, nello stesso ordine delle opzioni.
const stories = {
  dipendenze: {
    color: '#de764e', paper: '#faece2', context: ['controller', 'basket'],
    explanation: [['moon', 'basket'], ['controller', 'people']],
    opening: [['basket', 'chat'], ['controller', 'clock']],
    participation: [['basket', 'chat'], ['calendar', 'controller']],
    closing: [['calendar', 'people'], ['message', 'clock']],
    supports: ['calendar', 'message', 'person'],
    adaptation: [['schedule'], ['person', 'message']],
    goal: [['controller', 'moon'], ['door', 'chat']],
    setting: [['poster', 'controller'], ['chat', 'controller']],
    activity: [['people', 'controller'], ['person', 'chat']],
    access: [['door', 'chat'], ['privateNote']],
    check: [['person', 'chat'], ['calendar', 'clock']],
  },
  disabilita: {
    color: '#528b82', paper: '#e7f3ec', context: ['camera', 'boxes'],
    explanation: [['photo', 'boxes'], ['map', 'chat']],
    opening: [['photo', 'chat'], ['table', 'boxes']],
    participation: [['photo', 'table'], ['map', 'pencil']],
    closing: [['passage', 'table'], ['photo', 'chat']],
    supports: ['table', 'passage', 'chat'],
    adaptation: [['workTable'], ['map', 'passage']],
    goal: [['map', 'boxes'], ['people', 'photo']],
    setting: [['map', 'photo'], ['cards', 'people']],
    activity: [['table', 'map'], ['cards', 'people']],
    access: [['door', 'passage'], ['map', 'chat']],
    check: [['passage', 'people'], ['people', 'cards']],
  },
  immigrazione: {
    color: '#6c79b1', paper: '#eceffc', context: ['volley', 'guide'],
    explanation: [['guide', 'volley'], ['chat', 'people']],
    opening: [['volley', 'chat'], ['guide', 'chat']],
    participation: [['people', 'chat'], ['guide', 'volley']],
    closing: [['volley', 'people'], ['guide', 'volley']],
    supports: ['guide', 'volley', 'person'],
    adaptation: [['volley', 'person'], ['guide', 'chat']],
    goal: [['guide', 'pencil'], ['volley', 'people']],
    setting: [['guide', 'volley'], ['cards', 'people']],
    activity: [['guide', 'people'], ['volley', 'people']],
    access: [['guide', 'chat'], ['people', 'chat']],
    check: [['guide', 'volley'], ['chat', 'people']],
  },
  anziani: {
    color: '#ad7749', paper: '#f9efde', context: ['camera', 'phone'],
    explanation: [['photo', 'phone'], ['form', 'phone']],
    opening: [['photo', 'chat'], ['phone', 'form']],
    participation: [['calendar', 'photo'], ['pencil', 'calendar']],
    closing: [['phone', 'calendar'], ['pencil', 'photo']],
    supports: ['phone', 'calendar', 'people'],
    adaptation: [['camera', 'photo'], ['photo', 'people']],
    goal: [['poster', 'calendar'], ['photo', 'people']],
    setting: [['poster', 'camera'], ['cards', 'photo']],
    activity: [['people', 'photo'], ['people', 'calendar']],
    access: [['phone', 'calendar'], ['door', 'person']],
    check: [['people', 'calendar'], ['phone', 'chat']],
  },
  disagio: {
    color: '#9272a6', paper: '#f3ecf8', context: ['book', 'people'],
    explanation: [['book', 'people'], ['book', 'chat']],
    opening: [['book', 'pencil'], ['book', 'chat']],
    participation: [['clock', 'chat'], ['pencil', 'message']],
    closing: [['person', 'chat'], ['privateNote']],
    supports: ['chat', 'message', 'person'],
    adaptation: [['door', 'chat'], ['privateNote']],
    goal: [['pencil', 'chat'], ['door', 'person']],
    setting: [['poster', 'chat'], ['chat', 'people']],
    activity: [['door', 'chat'], ['people', 'pencil']],
    access: [['privateNote'], ['door', 'people']],
    check: [['calendar', 'chat'], ['pencil', 'chat']],
  },
  infanzia: {
    color: '#c26887', paper: '#f9eaf1', context: ['cards', 'emotion'],
    explanation: [['emotion', 'cards'], ['people', 'chat']],
    opening: [['cards', 'people'], ['emotion', 'chat']],
    participation: [['people', 'chat'], ['pencil', 'emotion']],
    closing: [['emotion', 'person'], ['clock', 'cards']],
    supports: ['emotion', 'clock', 'people'],
    adaptation: [['smallGame'], ['cards', 'chat']],
    goal: [['emotion', 'chat'], ['people', 'cards']],
    setting: [['book', 'cards'], ['cards', 'emotion']],
    activity: [['emotion', 'cards'], ['book', 'people']],
    access: [['photo', 'pencil'], ['people', 'cards']],
    check: [['people', 'emotion'], ['chat', 'cards']],
  },
};

// Oggetti disegnati in 80 × 80. La scena li accosta a materiali, persone e spazi.
const objects = {
  controller: `<path d="M22 25h36c10 0 16 13 17 30 1 10-9 13-16 5l-9-10H30L20 60C12 68 4 65 5 55 6 38 12 25 22 25Z" fill="#b4a3d6"/><path d="M20 37h16m-8-8v16"/><circle cx="54" cy="36" r="3" fill="#fff"/><circle cx="62" cy="44" r="3" fill="#f5ac83"/><path d="M35 25v-7l9-6"/>`,
  basket: `<circle cx="40" cy="40" r="28" fill="#f4a373"/><path d="M13 32c18 1 30 13 33 35M21 20c18 12 32 12 46 6M34 13c-3 18-13 29-21 37m53-9c-14 2-24 9-28 26"/>`,
  volley: `<circle cx="40" cy="40" r="28" fill="#ffdb80"/><path d="M36 12c13 13 14 27 5 40m26-24c-14 3-22 10-26 24m-28-4c12-7 20-5 28 4m-5-40c-5 10-12 18-23 23m54 5c-9 4-15 11-18 26m-8-14 9 13" stroke="#344e73"/>`,
  moon: `<path d="M53 62A26 26 0 0 1 32 16a27 27 0 0 0 30 37Z" fill="#f4c96b"/><path d="M55 16v13m-6-7h12m4 8v8m-4-4h8"/>`,
  clock: `<circle cx="40" cy="40" r="26" fill="#f7d68f"/><circle cx="40" cy="40" r="20" fill="#fff8e7"/><path d="M40 27v14l10 6"/><circle cx="40" cy="40" r="2.5" fill="#243e56"/>`,
  calendar: `<rect x="12" y="18" width="56" height="49" rx="8" fill="#fffaf0"/><path d="M13 32h54V24q0-6-6-6H19q-6 0-6 6Z" fill="#a9cbc0"/><path d="M25 13v12m30-12v12m-32 18h8m8 0h8m8 0h4m-36 12h8m8 0h8"/><rect x="52" y="50" width="9" height="9" rx="2" fill="#ecaa80"/>`,
  person: `<path d="M18 65c2-18 12-25 22-25s20 7 22 25Z" fill="#83b8a7"/><circle cx="40" cy="29" r="15" fill="#d89f77"/><path d="M25 28q-1-15 15-15 15 0 15 13-9 0-16-6-3 6-14 8Z" fill="#4a4254"/><path d="M37 34q3 2 6 0"/>`,
  people: `<path d="M4 65c1-15 8-23 18-23s16 8 17 23Zm37 0c1-15 8-23 17-23s17 8 18 23Z" fill="#9dcac1"/><path d="M25 65c1-18 8-26 15-26s14 8 15 26Z" fill="#cc9fc1"/><circle cx="21" cy="34" r="10" fill="#9c6c58"/><circle cx="59" cy="34" r="10" fill="#e0b08c"/><circle cx="40" cy="28" r="11" fill="#c18768"/><path d="M31 26q9 1 15-6m-31 13q6 1 11-4m27 2q6 2 11-3"/>`,
  chat: `<path d="M30 39h35q6 0 6 6v12q0 6-6 6h-4v9l-13-9H30q-6 0-6-6V45q0-6 6-6Z" fill="#b4c8ec"/><path d="M12 15h34q8 0 8 8v15q0 7-8 7H28l-13 9v-9h-3q-7 0-7-7V23q0-8 7-8Z" fill="#fff9ee"/><path d="M16 29h24m-24 7h14m15 13h15m-11 7h11"/>`,
  message: `<rect x="11" y="26" width="58" height="40" rx="7" fill="#eab29e"/><path d="m13 30 27 21 27-21M13 62l17-15m37 15L50 47"/><path d="M22 24v-9h35v10" fill="#fff9eb"/><path d="M29 19h20"/>`,
  door: `<path d="M20 67V15h40v52M12 67h56" fill="none" stroke-width="4"/><path d="M23 19l27 7v41H23Z" fill="#a7cbb9"/><path d="M56 36v20m-6-9 6 7 7-7" stroke="#466d5c"/><circle cx="42" cy="47" r="2" fill="#243e56"/>`,
  camera: `<rect x="8" y="25" width="64" height="39" rx="9" fill="#9dbfb6"/><path d="m22 25 6-10h24l6 10" fill="#f8cd7f"/><circle cx="41" cy="44" r="13" fill="#fef9ef"/><circle cx="41" cy="44" r="7" fill="#8aaad1"/><path d="M60 34h4"/>`,
  photo: `<g transform="rotate(-8 40 40)"><rect x="13" y="15" width="54" height="55" rx="5" fill="#fffaf2"/><rect x="20" y="22" width="40" height="34" rx="2" fill="#bed9df"/><circle cx="49" cy="32" r="5" fill="#f5c77c"/><path d="m20 52 12-13 9 9 7-5 12 10" fill="#8bb59f"/><path d="M30 62h22"/></g>`,
  boxes: `<path d="M8 38h37v29H8Z" fill="#dbad86"/><path d="M12 38l5-9h24l4 9m-29 10h20"/><path d="M39 28h33v39H39Z" fill="#f4d5a8"/><path d="M39 28l6-9h21l6 9m-21 12h9"/>`,
  map: `<path d="m8 20 20-5 23 7 21-6v46l-21 5-23-7-20 5Z" fill="#fdf6e6"/><path d="M28 16v44m23-38v44" stroke="#a7bdb8"/><path d="M16 48h17V35h28" stroke="#588f81" stroke-width="4" stroke-dasharray="4 6"/><circle cx="61" cy="35" r="5" fill="#eaa98d"/>`,
  table: `<path d="M14 45v23m49-23v23" stroke-width="4"/><path d="M8 41h64v7H8Z" fill="#a8c8b9"/><rect x="29" y="26" width="28" height="15" rx="3" fill="#fffaf0"/><path d="m33 37 7-6 6 4 4-3 4 5" stroke="#689785"/>`,
  passage: `<path d="M27 68V15m26 53V15" stroke="#a0c6b9" stroke-dasharray="4 5"/><path d="M40 62V20m-8 10 8-10 8 10" stroke="#477f70" stroke-width="3"/><g class="tm-action-left"><rect x="4" y="42" width="19" height="17" rx="2" fill="#d6a982"/><path d="M8 47h10"/></g><g class="tm-action-right"><rect x="58" y="24" width="18" height="17" rx="2" fill="#e7c29c"/><path d="M62 29h10"/></g>`,
  guide: `<rect x="7" y="17" width="66" height="46" rx="7" fill="#fffaf1"/><rect x="15" y="26" width="20" height="16" rx="3" fill="#b4c8ec"/><path d="m17 39 6-7 5 4 5-3m9-5h22m-22 8h16m-42 15h48m-48 5h32"/>`,
  phone: `<rect x="23" y="9" width="34" height="62" rx="8" fill="#aac8bf"/><rect x="28" y="17" width="24" height="43" rx="4" fill="#fff8ec"/><path d="M34 32q0 13 12 15l3-4-5-4-3 2q-3-2-3-5l2-2-3-5Z" fill="#77ac9a"/><path d="M37 65h6"/>`,
  form: `<rect x="16" y="11" width="48" height="58" rx="7" fill="#fffaee"/><path d="M25 21h20m-20 13h30m-30 9h30"/><rect x="24" y="52" width="30" height="8" rx="3" fill="#e5b992"/>`,
  pencil: `<path d="M12 64l5-16L52 13q5-4 10 1l4 4q5 5 0 10L31 63Z" fill="#edbd7a"/><path d="m48 17 15 15m-46 16 14 15m-19 1 9-2-6-6" fill="#fff8e9"/><path d="M17 70h44" stroke="#ae8ba7"/>`,
  poster: `<path d="M12 14h56v52H12Z" fill="#fff9e9"/><path d="M12 14h56v14H12Z" fill="#dd9bac"/><path d="M21 42h15m-15 7h17m-17 8h29"/><path d="m49 37 3 5 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1Z" fill="#f0c36e"/>`,
  book: `<path d="M8 19q19-6 32 5 14-11 32-5v44q-19-6-32 3-13-9-32-3Z" fill="#fff9e9"/><path d="M40 24v42M15 30q10-2 18 4m-18 7q10-2 18 3m14-10q8-6 18-4m-18 14q8-5 18-3"/>`,
  cards: `<g transform="rotate(-13 29 43)"><rect x="11" y="18" width="34" height="48" rx="6" fill="#b0c7e9"/><circle cx="28" cy="42" r="8" fill="#fff7e4"/></g><g transform="rotate(12 54 40)"><rect x="38" y="14" width="33" height="48" rx="6" fill="#ecb6c4"/><path d="m55 30 8 11-8 10-8-10Z" fill="#fff7e4"/></g>`,
  emotion: `<circle cx="29" cy="39" r="20" fill="#f1be86"/><circle cx="55" cy="46" r="17" fill="#e8abc0"/><path d="m17 35 7 2m5 0 7-2m-15 13q6-6 13 0m16 4q5 5 10 0"/><circle cx="50" cy="44" r="1.5" fill="#243e56"/><circle cx="60" cy="44" r="1.5" fill="#243e56"/>`,
};

const draw = (id, x, y, size = 80) =>
  `<g transform="translate(${x} ${y}) scale(${size / 80})" data-oggetto="${id}" stroke="#243e56" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">${objects[id]}</g>`;
const moving = (art, delay = 0) => `<g class="tm-action-arrive" style="--arrival-delay:${delay}ms">${art}</g>`;

const compositions = {
  schedule: () => `<rect x="48" y="19" width="264" height="106" rx="16" fill="#fff8eb" stroke="#d3bda5"/>
    <path d="M99 27v90m-39-44h240" stroke="#d3bda5" stroke-width="2"/>
    ${draw('clock', 59, 33, 36)}${draw('moon', 59, 78, 36)}
    ${draw('basket', 145, 23, 55)}
    <g class="tm-action-time">${draw('controller', 215, 74, 61)}</g>
    <path d="M253 44q15 7 8 22m-5-4 4 6 7-3" fill="none" stroke="#995536" stroke-width="2.5" stroke-linecap="round"/>`,
  workTable: () => `<ellipse cx="182" cy="119" rx="129" ry="9" fill="#b1cfc2"/>
    <path d="M113 88v29m133-29v29" stroke="#386e66" stroke-width="5" stroke-linecap="round"/>
    <g class="tm-action-table"><rect x="97" y="79" width="165" height="11" rx="5" fill="#6caa96" stroke="#243e56" stroke-width="2"/>
    ${draw('photo', 129, 36, 50)}${draw('camera', 180, 40, 54)}</g>
    ${draw('person', 33, 39, 69)}${draw('people', 254, 31, 75)}
    <circle cx="73" cy="109" r="15" fill="#dfeee9" stroke="#243e56" stroke-width="3"/>
    <path d="M73 99v20m-10-10h20" stroke="#5c9f8a" stroke-width="1.5"/>`,
  smallGame: () => `<ellipse cx="180" cy="91" rx="141" ry="47" fill="#e6c0b0"/>
    <path d="M56 98q124 32 249-3" fill="none" stroke="#cf9e90" stroke-width="3" stroke-linecap="round"/>
    ${moving(draw('cards', 96, 37, 92), 0)}${moving(draw('cards', 172, 42, 86), 90)}
    <g class="tm-action-right"><rect x="266" y="60" width="38" height="28" rx="5" fill="#f8e9ed" stroke="#987286" stroke-width="2"/><path d="M270 54h30v28h-30Z" fill="#deb3ca" stroke="#987286" stroke-width="2"/></g>`,
  privateNote: () => `<rect x="104" y="51" width="152" height="74" rx="13" fill="#e8b2c0" stroke="#243e56" stroke-width="2.5"/>
    <g class="tm-action-note"><rect x="130" y="22" width="100" height="73" rx="8" fill="#fff9ef" stroke="#243e56" stroke-width="2.5"/>
    <path d="M148 41h57m-57 12h43m-43 12h47" fill="none" stroke="#957296" stroke-width="3" stroke-linecap="round"/></g>
    <path d="m105 58 75 45 75-45v52q0 15-15 15H120q-15 0-15-15Z" fill="#d89eb1" stroke="#243e56" stroke-width="2.5" stroke-linejoin="round"/>`,
};

function spread(ids) {
  if (ids.length === 1 && compositions[ids[0]]) return compositions[ids[0]]();
  const gap = ids.length === 3 ? 102 : 126;
  const size = ids.length === 3 ? 77 : 93;
  const first = 180 - gap * (ids.length - 1) / 2;
  return ids.map((id, index) => {
    const x = first + index * gap;
    const card = `<ellipse cx="${x}" cy="106" rx="${size * .48}" ry="11" fill="var(--scene-color)" opacity=".17"/>
      <circle cx="${x}" cy="70" r="${size * .52}" fill="#fffcf3" opacity=".88"/>
      ${draw(id, x - size / 2, 69 - size / 2, size)}`;
    return moving(card, index * 70);
  }).join('');
}

export function scenePanel(id) {
  const panel = document.createElement('figure');
  panel.className = 'tm-scene-panel';
  panel.setAttribute('aria-hidden', 'true');
  const image = sceneImage(id, {decorative: true, className: 'tm-scene-context'});
  const art = document.createElement('div');
  art.className = 'tm-scene-drawing';
  panel.append(image, art);
  return panel;
}

export function paintScene(panel, id, key, selected, animate = false, format = -1) {
  const story = stories[id];
  const drawing = panel.querySelector('.tm-scene-drawing');
  const signature = [id, key, ...selected, format].join('/');
  if (drawing.dataset.scene === signature) return;
  drawing.dataset.scene = signature;
  panel.dataset.context = String(key === 'explanation' && !selected.length);

  const selection = selected[0];
  const [motif, detail] = story.context;
  const beforeChoice = {
    explanation: [motif, detail], opening: [motif, 'chat'], participation: ['person', 'chat'],
    closing: ['chat', motif], supports: ['person', motif], adaptation: [detail, 'chat'],
    goal: [motif, 'pencil'], setting: ['book', motif], activity: ['people', motif],
    access: ['door', motif], check: ['pencil', 'chat'],
  };
  let objectsToDraw = beforeChoice[key] || story.context;
  if (key === 'handoff') objectsToDraw = ['chat', story.supports[0]];
  else if (key === 'ending') {
    const material = story.setting[format] || story.setting[0];
    objectsToDraw = selection === 'proprio' ? ['pencil', material[0]] : selection === 0 ? [material[0], 'chat'] : selection === 1 ? [material[0], 'people'] : material;
  } else if (key === 'supports' && selected.length) objectsToDraw = selected.map(index => story.supports[index]);
  else if (story[key]?.[selection]) objectsToDraw = story[key][selection];
  else if (selection === 'proprio') objectsToDraw = [story.context[0], 'pencil'];

  drawing.innerHTML = `<svg viewBox="0 0 360 145" xmlns="http://www.w3.org/2000/svg" focusable="false"
      class="${animate ? 'tm-action-animated' : ''}" style="--scene-color:${story.color};--scene-paper:${story.paper}">
    <rect width="360" height="145" fill="var(--scene-paper)"/>
    <path d="M0 104C64 88 109 126 176 116S274 87 360 110V145H0Z" fill="var(--scene-color)" opacity=".12"/>
    ${spread(objectsToDraw)}
  </svg>`;
}
