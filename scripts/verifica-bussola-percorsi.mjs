import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Old shared URLs must keep their class, participant and project through the redirect.
const source = readFileSync(new URL('../missioni.mjs', import.meta.url), 'utf8');
const redirect = source.slice(source.indexOf('function openMission('), source.indexOf('\nfunction planSvg('));
const courses = ['afm', 'sia', 'turismo', 'ssas', 'cat'];
let checked = 0;
for (const course of courses) {
  for (const id of [course, course.toUpperCase()]) {
    for (const origin of ['https://spaziodocentimeuccimattei.github.io', 'http://127.0.0.1:8880']) {
      const entry = new URL(`${origin}/missioni.html?corso=${id}&progetto=progetto-fittizio&prova=percorsi#classe=LUNA24&alunno=${'A'.repeat(43)}`);
      let result;
      const context = {URL, location: entry, window: {location: {
        replace: target => {result = new URL(target);},
        assign: () => assert.fail('Il catalogo non deve aggiungere un rimbalzo nella cronologia.')
      }}};
      vm.runInNewContext(`${redirect}\nopenMission(${JSON.stringify(id)}, false);`, context);
      assert.equal(result.origin, origin);
      assert.equal(result.pathname, `/bussola-${course}.html`);
      assert.equal(result.searchParams.has('corso'), false);
      assert.equal(result.searchParams.get('progetto'), 'progetto-fittizio');
      assert.equal(result.searchParams.get('prova'), 'percorsi');
      assert.equal(result.hash, entry.hash);
      checked++;
    }
  }
  const html = readFileSync(new URL(`../bussola-${course}.html`, import.meta.url), 'utf8');
  assert.match(html, /<nav class="experience-path"[^>]*><a href="missioni\.html">← Prova gli indirizzi<\/a>/);
  assert.doesNotMatch(html, /href="bussola\.html"/);
}
let fallback = false;
vm.runInNewContext(`${redirect}\nopenMission('inesistente', false);`, {
  missions: [], openCatalog: () => {fallback = true;}
});
assert.equal(fallback, true);
console.log(`${checked} vecchi link verificati: cinque indirizzi, maiuscole, origine locale e pubblica, progetto e codici conservati. Ritorno unico al catalogo e corso inesistente verificati.`);
