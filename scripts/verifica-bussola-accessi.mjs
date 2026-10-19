import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {activityDestination} from '../bussola-navigazione.mjs';

// A class starts from the Bussola; skipping must preserve its identity and project.
const courses=['afm','sia','turismo','ssas','cat'];
const source=readFileSync(new URL('../bussola-gestione.mjs',import.meta.url),'utf8');
const linkFunction=source.slice(source.indexOf('function link('),source.indexOf('\nasync function copyText'));
let checks=0;
for(const origin of ['https://spaziodocentimeuccimattei.github.io','http://127.0.0.1:8884']) {
  for(const corso of courses) {
    for(const testing of [false,true]) {
      const context={URL,URLSearchParams,corso,testing,location:new URL(origin+'/gestione.html?corso='+corso+'#bussola')};
      const classroom={codice_breve:'TEST26',codice:'C'.repeat(43)};
      const personal={codice:'A'.repeat(43)};
      const classLink=vm.runInNewContext(linkFunction+'\nlink('+JSON.stringify(classroom)+')',context);
      const entry=new URL(classLink);
      assert.equal(entry.pathname,'/bussola.html');
      assert.equal(entry.searchParams.get('corso'),corso);
      assert.equal(new URLSearchParams(entry.hash.slice(1)).get('classe'),'TEST26');
      const activity=new URL(activityDestination(classLink));
      assert.equal(activity.pathname,`/bussola-${corso}.html`);
      assert.equal(activity.hash,entry.hash);
      assert.equal(activity.searchParams.has('corso'),false);
      assert.equal(activity.searchParams.get('prova'),testing?'classe-locale':null);
      const individual=new URL(vm.runInNewContext(linkFunction+'\nlink('+JSON.stringify(classroom)+','+JSON.stringify(personal)+')',context));
      assert.equal(individual.pathname,`/bussola-${corso}.html`);
      assert.equal(new URLSearchParams(individual.hash.slice(1)).get('alunno'),personal.codice);
      checks++;
    }
    const original=new URL(origin+'/bussola.html?corso='+corso.toUpperCase()+'&progetto=fittizio&prova=test#classe=TEST26&alunno='+'A'.repeat(43));
    const all=new URL(activityDestination(original.href,''));
    assert.equal(all.pathname,'/missioni.html');
    assert.equal(all.searchParams.get('progetto'),'fittizio');
    assert.equal(all.hash,original.hash);
    for(const target of courses) {
      const chosen=new URL(activityDestination(original.href,target));
      assert.equal(chosen.pathname,`/bussola-${target}.html`);
      assert.equal(chosen.searchParams.get('progetto'),'fittizio');
      assert.equal(chosen.hash,original.hash);
      checks++;
    }
  }
}
assert.equal(new URL(activityDestination('https://example.org/bussola.html?corso=inesistente#main')).pathname,'/missioni.html');
console.log(`${checks} combinazioni: primo approdo alla Bussola, salto contestuale, classe, link personale, progetto e isolamento locale conservati.`);
