// Content and scoring are independent of the browser and shared with development checks.
export const SESSION_KEY = 'mattei-bussola-v1';
export const CONTENT_VERSION = 1;

export function freshState() {
  return { version: CONTENT_VERSION, stage: 'question', index: 0, answers: {}, missions: {} };
}

export function sanitizeState(value, situations, missionIds = []) {
  if (!value || value.version !== CONTENT_VERSION || !['question', 'results'].includes(value.stage)) return null;
  if (!Number.isInteger(value.index) || value.index < 0 || value.index >= situations.length) return null;
  if (!value.answers || typeof value.answers !== 'object' || Array.isArray(value.answers)) return null;
  const state = freshState();
  state.stage = value.stage;
  state.index = value.index;
  for (const situation of situations) {
    const answer = value.answers[situation.id];
    if (answer === null || situation.options.some(option => option.id === answer)) state.answers[situation.id] = answer;
  }
  if (state.stage === 'results' && situations.some(s => !Object.hasOwn(state.answers, s.id))) state.stage = 'question';
  for (const id of missionIds) {
    const mission = value.missions?.[id];
    if (mission?.completed === true) state.missions[id] = { completed: true };
  }
  return state;
}

export function readState(storage, situations, missionIds = []) {
  try { return sanitizeState(JSON.parse(storage.getItem(SESSION_KEY)), situations, missionIds); }
  catch { return null; }
}

export function saveState(storage, state) {
  try { storage.setItem(SESSION_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}

export function clearState(storage) {
  // Never clear the Commission's independent session or any other application data.
  try { storage.removeItem(SESSION_KEY); return true; }
  catch { return false; }
}

export function validateContent(situations, dimensions, courses, missions) {
  const errors = [];
  const ids = new Set(dimensions.map(d => d.id));
  if (dimensions.length !== 7 || ids.size !== 7) errors.push('Occorrono sette dimensioni con ID univoci.');
  if (situations.length !== 8) errors.push('Occorrono otto situazioni.');
  if (new Set(situations.map(s => s.id)).size !== situations.length) errors.push('ID situazioni duplicati.');
  const allOptions = new Set();
  const coverage = Object.fromEntries([...ids].map(id => [id, []]));
  for (const s of situations) {
    if (s.options.length < 3 || s.options.length > 5) errors.push(`${s.id}: numero di azioni non valido.`);
    if (!s.title || !s.scenario || !s.question) errors.push(`${s.id}: testo incompleto.`);
    for (const o of s.options) {
      if (allOptions.has(o.id)) errors.push(`${o.id}: ID azione duplicato.`);
      allOptions.add(o.id);
      if (Object.keys(o.weights).length < 2) errors.push(`${o.id}: azione collegata a una sola dimensione.`);
      for (const [id, weight] of Object.entries(o.weights)) {
        if (!ids.has(id) || !Number.isFinite(weight) || weight <= 0) errors.push(`${o.id}: peso non valido.`);
      }
      if (!o.text) errors.push(`${o.id}: testo mancante.`);
    }
    for (const id of ids) if (s.options.some(o => o.weights[id])) coverage[id].push(s.id);
  }
  for (const id of ids) if (coverage[id].length < 3) errors.push(`${id}: copertura inferiore a tre situazioni.`);
  const courseIds = ['afm', 'sia', 'turismo', 'ssas', 'cat'];
  if (courses.length !== 5 || courseIds.some(id => !courses.some(c => c.id === id))) errors.push('Catalogo dei cinque corsi incompleto.');
  for (const c of courses) for (const id of ids) if (!c.lenses?.[id]) errors.push(`${c.id}: collegamento ${id} mancante.`);
  if (new Set(missions.map(m => m.id)).size !== missions.length || courseIds.some(id => !missions.some(m => m.id === id))) errors.push('Micro-missioni incomplete o duplicate.');
  return { errors, coverage };
}

export function summarize(situations, dimensions, answers) {
  const answered = situations.filter(s => s.options.some(o => o.id === answers[s.id]));
  const items = dimensions.map(d => {
    let raw = 0, expected = 0, variance = 0, primary = 0;
    const evidence = [];
    for (const s of answered) {
      const chosen = s.options.find(o => o.id === answers[s.id]);
      const values = s.options.map(o => o.weights[d.id] || 0);
      const mean = values.reduce((a,b) => a+b, 0) / values.length;
      expected += mean;
      variance += values.reduce((sum,v) => sum + (v-mean)**2, 0) / values.length;
      const weight = chosen.weights[d.id] || 0;
      raw += weight;
      if (weight === 2) primary += 1;
      if (weight) evidence.push({ situationId: s.id, title: s.title, action: chosen.text, weight });
    }
    // Equalize opportunities and dispersion under random choices, not student abilities.
    const score = variance > 0 ? (raw - expected) / Math.sqrt(variance) : 0;
    evidence.sort((a,b) => b.weight-a.weight);
    return { ...d, score, primary, support: evidence.length, evidence };
  });
  const ranked = items.filter(i => i.support >= 3 && i.primary >= 1).sort((a,b) => b.score-a.score);
  let selected = [];
  let reason = 'few';
  if (answered.length >= 4 && ranked.length >= 3) {
    reason = 'selected';
    const closeToThird = ranked.filter(i => i.score >= ranked[2].score - 0.12);
    if (closeToThird.length > 4 || ranked[0].score-ranked.at(-1).score < 0.35) reason = 'open';
    else selected = closeToThird.slice(0,4);
  }
  // Restore editorial order: the student never sees a ranking or score.
  selected.sort((a,b) => dimensions.findIndex(d => d.id===a.id)-dimensions.findIndex(d => d.id===b.id));
  return { selected, reason, answeredCount: answered.length, items, ranked };
}

export function totals(options, selected, field) {
  return options.filter(o => selected.includes(o.id)).reduce((sum,o) => sum + o[field], 0);
}
