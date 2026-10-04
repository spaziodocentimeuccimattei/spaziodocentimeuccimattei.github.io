// Editorial connections are independent of the browser. They do not measure abilities.
export const SESSION_KEY = 'mattei-bussola-v1';
export const CONTENT_VERSION = 3;

export function freshState() {
  return { version: CONTENT_VERSION, stage: 'question', index: 0, answers: {}, missions: {} };
}

export function sanitizeState(value, situations, missionIds = []) {
  if (!value || ![2, CONTENT_VERSION].includes(value.version) || !['question', 'results'].includes(value.stage)) return null;
  if (!Number.isInteger(value.index) || value.index < 0 || value.index >= situations.length) return null;
  if (!value.answers || typeof value.answers !== 'object' || Array.isArray(value.answers)) return null;
  const state = freshState();
  state.stage = value.stage;
  state.index = value.index;
  for (const situation of situations) {
    const answer = value.answers[situation.id];
    if (answer === null || situation.options.some(option => option.id === answer)) state.answers[situation.id] = answer;
  }
  const missing = situations.findIndex(s => !Object.hasOwn(state.answers, s.id));
  if (state.stage === 'results' && missing !== -1) {
    state.stage = 'question';
    state.index = missing;
  }
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
  if (situations.length !== 12) errors.push('Occorrono dodici situazioni.');
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
      if (!o.courseLinks || !Object.values(o.courseLinks).some(link => link.weight === 2)) errors.push(`${o.id}: collegamento diretto a un indirizzo mancante.`);
      for (const [id, link] of Object.entries(o.courseLinks || {})) {
        if (!courses.some(c => c.id === id) || ![1, 2].includes(link.weight) || !link.reason) errors.push(`${o.id}: collegamento a indirizzo non valido.`);
      }
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

export function suggestCourses(situations, courses, answers) {
  const answered = situations.filter(s => s.options.some(o => o.id === answers[s.id]));
  const items = courses.map(course => {
    let raw = 0, expected = 0, variance = 0;
    const evidence = [];
    for (const situation of answered) {
      const values = situation.options.map(o => o.courseLinks?.[course.id]?.weight || 0);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      expected += mean;
      variance += values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
      const option = situation.options.find(o => o.id === answers[situation.id]);
      const connection = option.courseLinks?.[course.id];
      raw += connection?.weight || 0;
      if (connection?.weight === 2) evidence.push({
        situationId: situation.id, title: situation.title, area: situation.area,
        action: option.text, reason: connection.reason
      });
    }
    // Correct for unequal opportunities in the answered questions, including skips.
    const score = variance > 0 ? (raw - expected) / Math.sqrt(variance) : 0;
    return { course, score, support: evidence.length, evidence };
  });
  if (answered.length < 4) return { selected: [], reason: 'few', answeredCount: answered.length, items };
  const supported = items.filter(item => item.support >= 2).sort((a, b) => b.score - a.score);
  if (!supported.length) return { selected: [], reason: 'mixed', answeredCount: answered.length, items };
  const selected = supported.filter(item => item.score >= supported[0].score - 0.75);
  // Keep every near tie. Editorial order inside this group avoids a false podium.
  selected.sort((a, b) => courses.indexOf(a.course) - courses.indexOf(b.course));
  const reason = selected.length >= 4 || supported[0].score <= 0.35 ? 'mixed' : answered.length < 6 ? 'tentative' : 'suggested';
  return { selected, reason, answeredCount: answered.length, items };
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
