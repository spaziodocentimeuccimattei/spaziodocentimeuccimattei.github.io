# Tema comune della Bussola — guida d'uso

Questa guida basta da sola: chi lavora sulle pagine della Bussola usa **solo** le variabili, le classi e le funzioni elencate qui. I file sono due, nella radice del sito:

- `bussola-tema.css` — colori, fondi e componenti (le classi cominciano tutte con `bt-`);
- `bussola-effetti.mjs` — esplosione, premio, scintilla e suoni (un modulo JavaScript senza dipendenze).

Per vedere tutto dal vivo: `python3 -m http.server 8767 --bind 127.0.0.1` dalla radice, poi `http://127.0.0.1:8767/docs/bussola/riordino-2026-11/demo-tema.html` (si può aggiungere `?corso=afm`, `sia`, `turismo`, `cat`, `ssas`). La pagina dimostrativa usa solo dati finti e non chiama nessun servizio.

Il modello grafico è il video `assets/video/bussola-orientamento.mp4`: fondo scuro tinto del colore dell'indirizzo, disco di colore pieno, testo bianco in grassetto, parola chiave e pulsante a pillola in lime, riflessi e aloni.

---

## 1. Come si accende il tema

Nella pagina, dopo i fogli di stile esistenti:

```html
<html lang="it" class="bt-tema bt-pagina-prova" data-corso="afm">
…
<link rel="stylesheet" href="bussola-tema.css?v=20261114-tema">
```

| Sulla radice `<html>` | Che cosa fa |
|---|---|
| `class="bt-tema"` | Accende il palco: fondo scuro con raggi di luce dietro tutta la pagina. |
| `class="bt-pagina-prova"` | Pagine `bussola-<corso>.html`: aggiunge il grande disco colorato in basso a destra e mette il contenuto di `<main>` su una scheda chiara (vedi 6.2). |
| `class="bt-pagina-bussola"` | `bussola.html` e `missioni.html`: veste intestazione, riquadri e pulsanti esistenti. |
| `data-corso="…"` | Sceglie il colore corrente: `afm`, `sia`, `turismo`, `cat`, `ssas`, oppure `bussola` (lime su blu petrolio). |

`data-corso` funziona **su qualunque elemento**, non solo sulla radice: tutto ciò che sta dentro prende quel colore. Serve per mostrare più indirizzi nello stesso schermo.

```html
<a class="bt-pulsante" data-corso="turismo" href="bussola-turismo.html">Prova</a>
<a class="bt-pulsante" data-corso="ssas" href="bussola-ssas.html">Prova</a>
```

Le sette pagine (`bussola.html`, `missioni.html`, `bussola-afm.html`, `bussola-sia.html`, `bussola-turismo.html`, `bussola-ssas.html`, `bussola-cat.html`) sono già collegate.

---

## 2. Colori

Tutti i colori stanno nella prima sezione di `bussola-tema.css` («1. Tavolozza»). **Si cambiano solo lì.** Nel proprio codice non si scrivono mai colori a mano: si usano le variabili.

### 2.1 Colori dei cinque indirizzi (presi dal video)

| Indirizzo | Pieno `--bt-<corso>` | Chiaro `--bt-<corso>-chiaro` | Scuro `--bt-<corso>-scuro` | Testo sul pieno `--bt-<corso>-su` | Fondo `--bt-<corso>-fondo` | Fondo chiaro `--bt-<corso>-fondo-chiaro` |
|---|---|---|---|---|---|---|
| AFM · verde scuro del logo | `#006949` | `#5ee3a1` | `#004a33` | bianco | `#02181c` | `#07372e` |
| SIA · turchese del logo | `#0ea7a5` | `#7fe3e0` | `#0a6665` | scuro `#03252a` | `#061f25` | `#0f4046` |
| Turismo · oro dello stemma del logo | `#d89e18` | `#ffd166` | `#7d5800` | scuro `#1f1500` | `#17140c` | `#3a2e12` |
| CAT · verde chiaro del logo | `#85c140` | `#b4e86e` | `#3c7410` | scuro `#0a2a14` | `#0c211a` | `#1e4423` |
| SSAS · magenta | `#db0a5a` | `#ff86b4` | `#9c0540` | bianco | `#170e1e` | `#3d1436` |

C'è anche `--bt-<corso>-alone`, lo stesso colore reso trasparente, per ombre luminose e raggi.

- **Pieno**: il colore del disco nel video. Si usa per pulsanti, distintivi, tessere accese.
- **Chiaro**: variante luminosa, per testo o righe colorate **sul fondo scuro** (contrasto almeno 6,9:1).
- **Scuro**: variante profonda, per il bordo basso dei pulsanti e per testo colorato **sulla carta bianca** (contrasto almeno 5:1).
- **Testo sul pieno**: bianco per AFM, Turismo e SSAS; scuro per SIA e CAT, che sono colori chiari. Non si sceglie a mano: si usa `--bt-su-colore`.

Nota (14/11/2026, decisione di Salvatore): SSAS resta com'è; gli altri quattro indirizzi usano i colori del logo della scuola (`assets/logo-meucci-mattei-decimomannu.jpeg`), non più quelli del video.

### 2.2 Colore corrente

Dentro un elemento con `data-corso` valgono queste variabili, che puntano da sole all'indirizzo giusto. Sono quelle da usare nel proprio CSS.

| Variabile | Significato |
|---|---|
| `--bt-colore` | colore pieno dell'indirizzo corrente |
| `--bt-colore-chiaro` | variante chiara (testo e righe sul fondo scuro) |
| `--bt-colore-scuro` | variante scura (bordi, testo su carta) |
| `--bt-su-colore` | colore del testo da mettere sopra `--bt-colore` |
| `--bt-alone` | alone trasparente dello stesso colore |
| `--bt-palco`, `--bt-palco-chiaro`, `--bt-palco-scuro` | i tre toni del fondo scuro dell'indirizzo |

```css
.mia-riga { border-left: 6px solid var(--bt-colore); }
.mia-etichetta { color: var(--bt-su-colore); background: var(--bt-colore); }
.mio-titolo-sul-fondo-scuro { color: var(--bt-colore-chiaro); }
```

### 2.3 Colori generali

| Variabile | Valore | Uso |
|---|---|---|
| `--bt-lime` | `#77ce19` | pillola «Provala.» e parola chiave dei titoli |
| `--bt-lime-chiaro` | `#a8ec58` | collegamenti sul fondo scuro |
| `--bt-lime-scuro` | `#3b7d00` | bordo basso dei pulsanti lime |
| `--bt-su-lime` | `#0a2a14` | testo sopra il lime |
| `--bt-fondo`, `--bt-fondo-chiaro`, `--bt-fondo-scuro` | `#06253c`, `#1d4858`, `#041929` | blu petrolio della Bussola generale |
| `--bt-fascia` | `#031624` | fascia scura con il marchio |
| `--bt-testo` | `#ffffff` | testo sul fondo scuro |
| `--bt-testo-tenue` | `#cfdde4` | testo secondario sul fondo scuro |
| `--bt-inchiostro` | `#0b2f47` | testo sulla carta |
| `--bt-inchiostro-tenue` | `#33495a` | testo secondario sulla carta |
| `--bt-carta`, `--bt-carta-tinta` | `#ffffff`, `#f1f5f6` | superfici chiare |
| `--bt-linea` | `#9fb4be` | bordi sulla carta |

### 2.4 Misure

| Variabile | Valore | Uso |
|---|---|---|
| `--bt-raggio`, `--bt-raggio-grande` | 22 px, 32 px | angoli arrotondati |
| `--bt-tocco` | 48 px | altezza minima di ciò che si tocca (la regola chiede almeno 44) |
| `--bt-carattere` | Inter e caratteri di sistema | famiglia del testo |
| `--bt-ombra`, `--bt-ombra-piccola` | — | ombre delle schede |
| `--bt-rapido`, `--bt-vivace` | 0,14 s e curva «a rimbalzo» | durata e andamento delle animazioni |

### 2.5 Regola del contrasto (da rispettare sempre)

| Dove | Testo |
|---|---|
| Sul fondo scuro (palco, `.bt-schermo`, `.bt-esplosione`, `.bt-scheda--scura`) | bianco `--bt-testo`; secondario `--bt-testo-tenue`; parola chiave `--bt-lime`; colore dell'indirizzo solo come `--bt-colore-chiaro` |
| Sopra il colore pieno (pulsanti, tessere, distintivi) | solo `--bt-su-colore` |
| Sopra il lime | solo `--bt-su-lime` |
| Sulla carta (`.bt-scheda`, `.bt-biglietto`) | `--bt-inchiostro`; secondario `--bt-inchiostro-tenue`; colore dell'indirizzo solo come `--bt-colore-scuro` |

Con queste coppie il contrasto è sempre almeno 4,5:1 (valori misurati nel resoconto di A1). **Non usare mai** `--bt-colore` come colore del testo: sul fondo scuro e sulla carta non è abbastanza leggibile per tutti gli indirizzi.

---

## 3. Superfici: scuro o chiaro

I pulsanti secondari, i collegamenti e il contorno della messa a fuoco cambiano aspetto secondo la superficie su cui poggiano. Lo capiscono da soli dentro i componenti del tema. Se si costruisce un contenitore proprio, lo si dichiara:

| Classe | Quando |
|---|---|
| `bt-su-scuro` | il contenitore ha fondo scuro (è il caso normale: il palco) |
| `bt-su-chiaro` | il contenitore ha fondo chiaro |

```html
<div class="mio-riquadro-bianco bt-su-chiaro">
  <button class="bt-pulsante bt-pulsante--secondario" type="button">Indietro</button>
</div>
```

---

## 4. Componenti

### 4.1 Schermo — «un titolo, una frase, un'azione»

`bt-schermo` è la colonna centrata che riempie lo schermo: è la forma di ogni schermo nuovo. Testo bianco, da usare sul palco.

```html
<section class="bt-schermo">
  <h1 class="bt-titolo">Come ti <em>chiami</em>?</h1>
  <p class="bt-frase">Il tuo nome va sull'attestato.</p>
  <button class="bt-pulsante bt-pulsante--grande" type="button">Inizia</button>
  <button class="bt-link" type="button">Ho un codice classe</button>
</section>
```

- `bt-schermo--sinistra`: allinea a sinistra invece che al centro.

### 4.2 Titoli e testi grandi

| Classe | Uso |
|---|---|
| `bt-titolo` | titolo grande, bianco, in grassetto |
| `bt-titolo--enorme` | ancora più grande (una o due parole) |
| `bt-titolo--medio` | titolo di una scheda o nome lungo di un indirizzo |
| `bt-chiave` oppure `<em>` dentro `bt-titolo` | la parola chiave in lime |
| `bt-chiave--corso` | la parola chiave nel colore chiaro dell'indirizzo |
| `bt-frase` | la frase sotto il titolo (una sola) |
| `bt-nota` | l'unica riga discreta in fondo |
| `bt-barretta` | titolo con la barretta verticale colorata a sinistra, come i nomi degli indirizzi nel video |
| `bt-occhiello` | etichetta a pillola lime sopra il titolo |
| `bt-occhiello--corso` | la stessa etichetta nel colore dell'indirizzo |

```html
<p class="bt-occhiello bt-occhiello--corso">Turismo</p>
<h2 class="bt-titolo bt-titolo--medio bt-barretta">Costruzioni, Ambiente e Territorio</h2>
<h1 class="bt-titolo bt-titolo--enorme">Prova <span class="bt-chiave">prima</span> di scegliere.</h1>
<p class="bt-nota">Luoghi e persone sono inventati.</p>
```

Su una scheda chiara il titolo va reso scuro: `style` non serve, basta metterlo dentro `.bt-scheda` e usare un proprio selettore con `color: var(--bt-inchiostro)`.

### 4.3 Pulsanti

| Classe | Uso |
|---|---|
| `bt-pulsante` | **primario**: pieno, lucido, nel colore dell'indirizzo. Uno solo per schermo. |
| `bt-pulsante--lime` | la pillola lime del video, qualunque sia l'indirizzo |
| `bt-pulsante--secondario` | secondario: vetro sul fondo scuro, bianco sulla carta («Indietro», «Perché?») |
| `bt-pulsante--grande` | più grande, per l'azione dello schermo |
| `bt-pulsante--piccolo` | più basso (48 px) |
| `bt-pulsante--largo` | largo quanto il contenitore |
| `bt-link` | collegamento discreto sottolineato («Ho un codice», «Rivedi il tuo lavoro») |
| `bt-azioni` | riga che contiene i pulsanti; va a capo da sola sul telefono |
| `bt-azioni--estremi` | «Indietro» a sinistra e «Avanti» a destra |

Funzionano su `<button>` e su `<a>`. Lo stato spento si ottiene con l'attributo `disabled` (o `aria-disabled="true"` sui collegamenti).

```html
<div class="bt-azioni bt-azioni--estremi">
  <button class="bt-pulsante bt-pulsante--secondario" type="button">Indietro</button>
  <button class="bt-pulsante" type="button">Avanti</button>
</div>
<a class="bt-pulsante bt-pulsante--lime bt-pulsante--grande" href="missioni.html">Prova</a>
<button class="bt-pulsante" type="button" disabled>Avanti</button>
```

### 4.4 Scheda

| Classe | Uso |
|---|---|
| `bt-scheda` | scheda chiara con angoli arrotondati e ombra; testo scuro |
| `bt-scheda--colore` | aggiunge il bordo alto nel colore dell'indirizzo |
| `bt-scheda--scura` | scheda di vetro scuro, testo bianco: sta sul palco senza spegnerlo |
| `bt-disco` | il cerchio pieno del video; l'immagine o la scheda al suo interno si appoggia sopra, leggermente ruotata |
| `bt-palco` | un riquadro scuro autonomo con raggi, da usare dentro una pagina chiara |
| `bt-raggi` | aggiunge solo i raggi di luce a un contenitore scuro |

```html
<article class="bt-scheda bt-scheda--colore" data-corso="sia">
  <h3>Sistemi Informativi Aziendali</h3>
  <a class="bt-pulsante bt-pulsante--largo" href="bussola-sia.html">Prova</a>
</article>

<div class="bt-disco" data-corso="ssas"><img src="assets/attestati/ssas.svg" alt=""></div>

<div class="bt-scheda bt-scheda--scura"><p class="bt-frase">In questo indirizzo fai tre cose.</p></div>
```

### 4.5 Barra di avanzamento

Due forme. La prima è l'elemento standard `<progress>`: è la più semplice e funziona anche nella pagina Turismo, che vieta gli stili scritti nell'HTML.

```html
<progress class="bt-avanzamento" value="5" max="12" aria-label="Domanda 5 di 12"></progress>
```

La seconda è una barra a tappe, un segmento per tappa: `bt-fatto` per le tappe concluse, `aria-current="step"` per quella in corso.

```html
<ol class="bt-passi" aria-label="Tappa 3 di 5">
  <li class="bt-fatto">1</li><li class="bt-fatto">2</li><li aria-current="step">3</li><li>4</li><li>5</li>
</ol>
```

Esiste anche la forma `<div class="bt-avanzamento"><span></span></div>`: la larghezza si dà da JavaScript con `barra.style.setProperty('--bt-valore', 0.4)` (un numero da 0 a 1).

### 4.6 Scelta — la risposta grande da toccare

Per la regola «una scelta per schermo». Lo stato scelto si indica in uno di questi modi: `aria-pressed="true"`, `aria-checked="true"`, la classe `bt-scelta--scelta`, oppure un `<input>` selezionato dentro l'etichetta.

```html
<div class="bt-scelte bt-scelte--due">
  <button class="bt-scelta" type="button" aria-pressed="false">Persone e benessere</button>
  <button class="bt-scelta" type="button" aria-pressed="true">Spazi da immaginare</button>
</div>

<label class="bt-scelta"><input type="radio" name="idea" value="a"> Quaderni con una storia</label>
```

- `bt-scelte`: la griglia che le contiene (una colonna); `bt-scelte--due`: due colonne dal tablet in su.
- Dentro una `bt-scelta` si può mettere un'illustrazione (`<img>` o `<svg>`): viene resa 56×56 px.

### 4.7 Tessera accesa o spenta

Per il «Perché?» del risultato: le dodici risposte come tessere, accese quelle che portano all'indirizzo.

```html
<ul class="bt-tessere" data-corso="ssas">
  <li><button type="button" class="bt-tessera bt-tessera--accesa">Curiosità</button></li>
  <li><span class="bt-tessera bt-tessera--spenta">Video</span></li>
</ul>
```

- `bt-tessera--accesa`: piena, nel colore dell'indirizzo; se è un `<button>` si può toccare.
- `bt-tessera--spenta`: contorno tratteggiato, testo tenue.

### 4.8 Distintivo dell'indirizzo

Il premio al completamento. Dentro va la sigla breve oppure un'icona (`<img>`, `<svg>`).

```html
<ul class="bt-distintivi">
  <li><span class="bt-distintivo" data-corso="afm">AFM</span></li>
  <li><span class="bt-distintivo bt-distintivo--spento" data-corso="sia">SIA</span></li>
</ul>
```

- `bt-distintivo--spento`: non ancora ottenuto. `bt-distintivo--piccolo` (64 px), `bt-distintivo--grande` (168 px).
- `bt-distintivi`: la riga che li contiene.

### 4.9 Schermo «esplosione»

Lo schermo del risultato e dell'attestato: fondo scuro con raggi che partono dal centro, alone colorato, titolo enorme che «scoppia» in ingresso. I coriandoli si aggiungono con la funzione `esplosione()` (capitolo 5).

```html
<section class="bt-esplosione" data-corso="ssas" id="risultato">
  <p class="bt-occhiello bt-occhiello--corso">Il tuo indirizzo</p>
  <h2 class="bt-titolo">SSAS</h2>
  <div class="bt-disco"><img src="assets/attestati/ssas.svg" alt=""></div>
  <div class="bt-azioni">
    <a class="bt-pulsante bt-pulsante--grande" href="bussola-ssas.html">Prova</a>
    <button class="bt-pulsante bt-pulsante--secondario" type="button">Perché?</button>
  </div>
</section>
```

- Il titolo dentro `bt-esplosione` è molto grande: va bene per nomi brevi (SSAS, Turismo). Per un nome lungo aggiungere `bt-titolo--medio`.
- Se il titolo non può avere la classe `bt-titolo`, usare `bt-esplosione__titolo`.

### 4.10 Biglietto — codice personale e QR

Solo l'aspetto: il codice e l'immagine del QR li fornisce chi realizza il «ritorno da casa». Il codice è scritto grande, a caratteri distanziati; il riquadro del QR accetta un `<img>`, un `<svg>` o un `<canvas>`.

```html
<div class="bt-biglietto" data-corso="afm">
  <p class="bt-biglietto__etichetta">Il tuo codice</p>
  <p class="bt-biglietto__codice">K7M4QX</p>
  <p class="bt-biglietto__frase">A casa, con i tuoi genitori, torna qui: scarichi l'attestato e scopri di più.</p>
  <div class="bt-biglietto__qr"><img src="…" alt="Codice QR per tornare qui"></div>
</div>
```

Sul telefono stretto il QR scende sotto il codice.

### 4.11 Fascia con il marchio

```html
<div class="bt-fascia"><span>Prova la Bussola qui</span><span>IIS Meucci-Mattei · Decimomannu</span></div>
```

### 4.12 Classi di servizio

| Classe | Uso |
|---|---|
| `bt-entra` | l'elemento entra salendo (un'animazione breve, una volta) |
| `bt-pulsa` | l'elemento pulsa piano per attirare l'attenzione (usare su una cosa sola) |
| `bt-nascosto-visivamente` | testo letto dai lettori di schermo ma non visibile |
| `bt-suono` | il tasto dei suoni: lo crea `interruttoreSuono()`, non va scritto a mano |
| `bt-premiato`, `bt-toccato`, `bt-effetti-tela` | usate dal modulo degli effetti: non vanno scritte a mano |

---

## 5. Effetti — `bussola-effetti.mjs`

```js
import { esplosione, premio, scintilla, suono, interruttoreSuono } from './bussola-effetti.mjs?v=20261114-tema';
```

Il modulo non ha dipendenze, non chiama la rete e non salva nulla. Legge i colori dalle variabili del tema. Funziona anche con le regole di sicurezza delle pagine delle prove (compresa Turismo).

| Funzione | Che cosa fa | Esempio |
|---|---|---|
| `esplosione(elemento, corso?, opzioni?)` | Raggi e coriandoli nel colore dell'indirizzo, dal centro dell'elemento. Per il risultato e l'attestato. Restituisce una promessa che si chiude a effetto finito (circa 2 secondi). | `esplosione(document.getElementById('risultato'), 'ssas')` |
| `premio(elemento, corso?)` | L'elemento «salta fuori» e si accende di scintille. Per il distintivo a fine prova. | `premio(distintivo)` |
| `scintilla(elemento, corso?)` | Piccolo effetto a ogni scelta: l'elemento risponde al tocco e lascia qualche scintilla. | `scintilla(evento.currentTarget)` |
| `suono(nome)` | Suona un effetto breve, **solo se i suoni sono accesi**. Nomi: `'tocco'`, `'avanti'`, `'premio'`, `'esplosione'`. Restituisce vero se è partito. | `suono('avanti')` |
| `interruttoreSuono(contenitore?)` | Crea il tasto «Suoni spenti / Suoni accesi» e lo aggiunge al contenitore. | `interruttoreSuono(document.querySelector('header'))` |
| `accendiSuoni(valore)` | Accende (`true`) o spegne (`false`) i suoni da codice. Va chiamata da un tocco della persona. | `accendiSuoni(false)` |
| `suoniAccesi()` | Vero se i suoni sono accesi. | `if (suoniAccesi()) …` |
| `movimentoRidotto()` | Vero se la persona ha chiesto al dispositivo di ridurre il movimento. | `if (!movimentoRidotto()) …` |
| `coloriCorso(corso)` | I colori dell'indirizzo letti dal tema: `{ pieno, chiaro, lime, bianco }`. | `coloriCorso('cat').pieno` |

Dettagli utili:

- **Corso**: se non lo si passa, la funzione lo legge dal `data-corso` più vicino all'elemento. Se non c'è, usa il lime della Bussola.
- **Opzioni di `esplosione`**: `{ quanti: 150, durata: 2200 }` (numero di coriandoli, millisecondi). Di solito non servono.
- **Suoni**: sono spenti a ogni apertura di pagina e non vengono ricordati da una pagina all'altra. `esplosione`, `premio` e `scintilla` suonano da sole, se i suoni sono accesi: non serve chiamare `suono()` insieme.
- **Movimento ridotto**: con l'impostazione «riduci movimento» del dispositivo, `esplosione` mostra coriandoli fermi per un attimo, `premio` e `scintilla` non muovono nulla. Anche le animazioni del foglio di stile si fermano. Non serve fare altro.
- **Finestre di dialogo**: se l'elemento sta dentro un `<dialog>` aperto, l'effetto compare sopra la finestra.
- **Nessun punteggio**: `premio` si usa quando la prova è finita, non per una risposta «giusta».

Esempio completo: effetto a ogni scelta e distintivo a fine prova.

```js
import { scintilla, premio, esplosione } from './bussola-effetti.mjs?v=20261114-tema';

contenitore.addEventListener('click', evento => {
  const scelta = evento.target.closest('.bt-scelta');
  if (scelta) scintilla(scelta);
});

async function fineProva(schermoAttestato, distintivo) {
  await esplosione(schermoAttestato);   // legge data-corso dalla pagina
  premio(distintivo);
}
```

---

## 6. Le pagine di oggi: che cosa fa già il tema

L'ultima parte di `bussola-tema.css` («5. Adattamento delle pagine esistenti») veste le pagine attuali senza toccarne testi, struttura, identificativi e logica. È **provvisoria**: man mano che uno schermo viene riscritto con le classi `bt-`, quelle regole non servono più per quello schermo.

### 6.1 `bussola.html` e `missioni.html`

Intestazione e piè di pagina scuri; riquadri blu trasformati in vetro sul palco; pulsanti `.explore-button` pieni e lucidi (lime, oppure il colore dell'indirizzo dentro le schede con `data-course`); `.explore-button.secondary` secondari; risposte `.choice` come tessere bianche con bordo lime quando sono scelte; barra delle domande in lime.

### 6.2 Pagine delle prove

- Striscia alta, testata, riga di stato e piè di pagina poggiano sul palco scuro, con testo bianco.
- `<main>` diventa una grande scheda chiara con il bordo alto nel colore dell'indirizzo: dentro, i colori originali dei laboratori restano quelli di prima e quindi restano leggibili.
- `.primary`, `.tm-start`, `.tm-next`, `.class-guest-button` diventano pulsanti pieni e lucidi nel colore dell'indirizzo; `.quiet`, `.secondary`, `.plain-button` diventano secondari.

**Schermi scuri a tutta pagina dentro una prova** (ingresso, finale, attestato): quando `<main>` contiene un `bt-schermo` o un `bt-esplosione`, la scheda chiara si toglie da sola e resta il palco. Sui browser più vecchi questo automatismo può mancare: per sicurezza aggiungere a `<main>` la classe `bt-scuro` mentre lo schermo scuro è visibile e toglierla dopo.

```js
const principale = document.querySelector('main');
principale.classList.add('bt-scuro');      // entra lo schermo «Come ti chiami?»
// …
principale.classList.remove('bt-scuro');   // si torna ai laboratori su scheda chiara
```

### 6.3 Vincoli tecnici da ricordare

- `bussola-turismo.html` vieta gli stili scritti nell'HTML (attributo `style` e blocchi `<style>`): usare solo classi. Impostare uno stile da JavaScript con `elemento.style.…` è permesso.
- Bersagli di tocco: i componenti del tema sono alti almeno 48 px. Non ridurli.
- Stampa: fondi scuri, tasto dei suoni ed effetti non vengono stampati.

---

## 7. Che cosa non fare

- Non scrivere colori a mano: solo variabili `--bt-…`.
- Non usare `--bt-colore` come colore del testo (vedi 2.5).
- Non mettere due `bt-pulsante` primari nello stesso schermo: il secondo è `bt-pulsante--secondario` o `bt-link`.
- Non aggiungere punteggi, stelle o «bravo»: gli effetti premiano l'aver finito.
- Non aggiungere animazioni proprie senza la regola `@media (prefers-reduced-motion: reduce)` che le ferma.
- Non modificare `bussola-tema.css` e `bussola-effetti.mjs` per un solo percorso: se manca qualcosa, scriverlo nel resoconto.
