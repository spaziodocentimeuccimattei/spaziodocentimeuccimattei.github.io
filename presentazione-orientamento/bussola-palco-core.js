/* Funzione suggestCourses dalla Bussola pubblica, invariata.
Fonte: https://spaziodocentimeuccimattei.github.io/bussola-core.mjs
SHA-256 sorgente: f7eb8f7dd47b61808f0034fdc015331d2987009857e0ef56360d76b35cb5f0e2
*/
window.BussolaPalcoCore=(()=>{
function suggestCourses(situations, courses, answers) {
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
return {suggestCourses};
})();
