import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { certificateModel, firstName, imagePdf } from '../bussola-attestato-core.mjs';
import { suggestCourses, freshState, sanitizeState } from '../bussola-core.mjs';

const read = async name => JSON.parse(await readFile(new URL(`../data/${name}.json`, import.meta.url)));
const [{ situations }, { courses }, contacts] = await Promise.all(['bussola', 'indirizzi', 'contatti'].map(read));
for (const course of courses) {
  const answers = Object.fromEntries(situations.map(s => [s.id, s.options.find(o => o.courseLinks[course.id]?.weight === 2)?.id || null]));
  const direction = suggestCourses(situations, courses, answers);
  const model = certificateModel(direction.selected[0], direction, situations, contacts);
  assert.equal(model.course.id, course.id);
  assert.equal(model.traces.length, 2);
  assert.equal(model.others.length, 0);
  assert.equal(model.subjects.length, 2);
  assert.ok(model.subjects.every(subject => course.subjects.some(actual =>
    actual === subject || actual.startsWith(subject + ' '))));
  assert.ok(model.traces.every(trace => situations.some(s => s.options.some(option =>
    option.id === answers[s.id] && option.label === trace.label && option.courseLinks[course.id]?.reason === trace.reason))));
  assert.equal('name' in model, false);
  assert.equal('firstName' in model, false);
  assert.throws(() => certificateModel(direction.items.find(item => item.course.id !== course.id), direction, situations, contacts));
}
const answers = Object.fromEntries(situations.map(s => [s.id, null]));
for (const [id, course] of [['materie', 'afm'], ['predisposizioni', 'sia'], ['sogni', 'afm'], ['aspirazioni', 'sia']])
  answers[id] = situations.find(s => s.id === id).options.find(o => o.courseLinks[course]?.weight === 2).id;
const mixed = suggestCourses(situations, courses, answers);
assert.deepEqual(mixed.selected.map(item => item.course.id), ['afm', 'sia']);
for (const item of mixed.selected) {
  const model = certificateModel(item, mixed, situations, contacts);
  assert.match(model.context, /4 domande su 12/);
  assert.equal(model.others.length, 1);
  assert.match(model.shortContext, /4\/12 risposte/);
  assert.ok(model.shortContext.includes(model.others[0]));
}
assert.throws(() => certificateModel(mixed.items[0], { ...mixed, selected: [] }, situations, contacts));
assert.equal(firstName('  Sofia  Maria  '), 'Sofia Maria');
assert.equal(firstName('E\u0301léonore'), 'Éléonore');
assert.equal(firstName("Jean-Luc D’"), "Jean-Luc D’");
assert.equal(firstName('123<>'), '');
assert.equal(firstName('A'.repeat(100)).length, 40);
const clean = sanitizeState({ ...freshState(), name: 'Nome fittizio', answers }, situations, courses.map(c => c.id));
assert.equal('name' in clean, false);
assert.throws(() => imagePdf(new Uint8Array([1, 2, 3]), 1080, 1350));
assert.throws(() => imagePdf(new Uint8Array([255, 216, 255, 217]), -1, 1350));
console.log('Attestati: cinque indirizzi, motivazioni da risposte reali, esiti misti/preliminari e nome escluso dallo stato verificati.');
