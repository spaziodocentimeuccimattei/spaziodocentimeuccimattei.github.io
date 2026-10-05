// Export content stays separate from the stored journey. No student identity is persisted.
export function firstName(value = '') {
  return String(value).normalize('NFC').replace(/[^\p{L}\p{M}\s’'-]/gu, '')
    .replace(/\s+/g, ' ').trim().slice(0, 40);
}

export function certificateModel(item, direction, situations, contacts) {
  if (!direction.selected.includes(item)) throw new Error('Indirizzo non suggerito.');
  // Keep two different perspectives where available: subjects, dreams, aspirations, interests.
  const priorities = ['materie', 'sogni', 'aspirazioni', 'predisposizioni'];
  const ordered = [...item.evidence].sort((a, b) => {
    const rank = e => priorities.includes(e.situationId) ? priorities.indexOf(e.situationId) : 4;
    return rank(a) - rank(b);
  });
  const traces = ordered.slice(0, 2).map(trace => {
    const option = situations.find(s => s.id === trace.situationId)?.options.find(o => o.text === trace.action);
    if (!option) throw new Error('Risposta non riconosciuta.');
    return { label: option.label || option.text, reason: trace.reason };
  });
  const others = direction.selected.filter(other => other !== item).map(other => other.course.code === 'TUR' ? 'Turismo' : other.course.code);
  const context = direction.answeredCount < 6
    ? `Esito preliminare: ho risposto a ${direction.answeredCount} domande su ${situations.length}. L’indicazione è ancora preliminare.`
    : `Esito basato su ${direction.answeredCount} risposte su ${situations.length}.`;
  const portraits = {
    afm: { subjects: ['Economia aziendale', 'Diritto'] },
    sia: { subjects: ['Informatica', 'Economia aziendale'] },
    turismo: { subjects: ['Lingue straniere', 'Geografia turistica'] },
    ssas: { subjects: ['Psicologia generale e applicata', 'Metodologie operative'] },
    cat: { subjects: ['Progettazione e Costruzioni', 'Topografia'] },
  };
  const portrait = portraits[item.course.id];
  // Short display names retain a direct link to the actual subjects in the course data.
  const subjects = portrait.subjects.filter(subject => item.course.subjects.includes(subject)).map(subject =>
    subject.replace(' generale e applicata', '').replace('Progettazione e Costruzioni', 'Progettazione'));
  const shortContext = [
    `${direction.answeredCount < 6 ? 'Esito preliminare · ' : ''}${direction.answeredCount}/${situations.length} risposte`,
    others.length ? `Anche ${others.join(' · ')}` : '',
  ].filter(Boolean).join(' · ');
  return {
    course: item.course, traces, others, context,
    subjects, shortContext,
    school: contacts.name, email: contacts.orientationEmail,
    disclaimer: 'Esito orientativo: interessi espressi, senza valutazione delle capacità.',
    answeredCount: direction.answeredCount,
  };
}

// A single A4 page contains the same local canvas seen in the preview.
// The PDF is intentionally an image, with no metadata containing the optional first name.
export function imagePdf(jpeg, width, height) {
  if (!(jpeg instanceof Uint8Array) || jpeg.length < 4 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8
    || !Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0)
    throw new Error('Immagine PDF non valida.');
  const encode = text => new TextEncoder().encode(text);
  const parts = [], offsets = [0];
  let length = 0;
  const add = value => { const bytes = typeof value === 'string' ? encode(value) : value; parts.push(bytes); length += bytes.length; };
  const object = (id, body) => { offsets[id] = length; add(`${id} 0 obj\n${body}\nendobj\n`); };
  add('%PDF-1.4\n');
  object(1, '<< /Type /Catalog /Pages 2 0 R >>');
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
  offsets[4] = length;
  add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  add(jpeg); add('\nendstream\nendobj\n');
  const stream = 'q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n';
  object(5, `<< /Length ${encode(stream).length} >>\nstream\n${stream}endstream`);
  const xref = length;
  add('xref\n0 6\n0000000000 65535 f \n');
  for (const offset of offsets.slice(1)) add(`${String(offset).padStart(10, '0')} 00000 n \n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const result = new Uint8Array(length);
  let cursor = 0;
  for (const part of parts) { result.set(part, cursor); cursor += part.length; }
  return result;
}
