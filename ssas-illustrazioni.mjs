// Illustrazioni originali in SVG: nessun servizio esterno, nessuna modifica ai dati.
const ROOT = 'assets/ssas-illustrazioni/';
const VERSION = '?v=20261012-scene';
const descriptions = {
 dipendenze: 'Luca tiene un controller nel suo spazio di gioco. Vicino alla porta un coetaneo ha un pallone da basket: entrambe le attività fanno parte della sua giornata.',
 disabilita: 'Irene, in carrozzina, indica una fotografia e confronta le sue scelte con una compagna nello spazio della mostra.',
 immigrazione: 'Sara tiene un pallone da pallavolo e parla con due coetanei. Un disegno del gioco aiuta a comunicare.',
 anziani: 'Rosa, con la macchina fotografica, mostra una foto a una persona più giovane su una panchina tra alberi e fiori.',
 disagio: 'Tommaso tiene un piccolo foglio mentre un’adulta lo ascolta, seduta alla sua altezza, in uno spazio tranquillo.',
 infanzia: 'Nico e Lia sono a un tavolo con un disegno, matite e forme da gioco. Un’educatrice è vicina e alcune carte mostrano emozioni diverse.'
};
export function sceneImage(id, {decorative = false, className = 'case-art-image'} = {}) {
 if (!Object.hasOwn(descriptions, id)) return null;
 const img = document.createElement('img');
 img.src = ROOT + id + '.svg' + VERSION;
 img.width = 480;
 img.height = 300;
 img.alt = decorative ? '' : descriptions[id];
 img.decoding = 'async';
 img.loading = decorative ? 'lazy' : 'eager';
 img.className = className;
 if (decorative) img.setAttribute('aria-hidden', 'true');
 return img;
}
export function sceneFigure(id) {
 const img = sceneImage(id);
 if (!img) return null;
 const figure = document.createElement('figure');
 figure.className = 'case-art';
 figure.dataset.case = id;
 figure.append(img);
 return figure;
}
export function sceneCardArt(id) {
 const img = sceneImage(id, {decorative: true, className: 'case-option-art'});
 if (!img) return null;
 const picture = document.createElement('picture');
 picture.className = 'case-option-picture';
 picture.setAttribute('aria-hidden', 'true');
 const source = document.createElement('source');
 source.media = '(max-width: 560px)';
 source.srcset = ROOT + id + '-mobile.svg' + VERSION;
 source.width = 240;
 source.height = 330;
 picture.append(source, img);
 return picture;
}
export function entranceImage() {
 const img = document.createElement('img');
 img.src = ROOT + 'ingresso.svg' + VERSION;
 img.width = 720;
 img.height = 490;
 img.alt = 'Sei finestre sulle storie di Luca, Irene, Sara, Rosa, Tommaso, Nico e Lia: gioco, fotografia, sport, ascolto ed emozioni.';
 img.decoding = 'async';
 img.className = 'entrance-art';
 return img;
}
