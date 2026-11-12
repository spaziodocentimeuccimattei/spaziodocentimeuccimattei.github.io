// Pagina famiglie: una schermata per volta.
// Senza JavaScript le schermate restano tutte in pagina, una sotto l'altra.

const screens = [...document.querySelectorAll("[data-screen]")];
const bar = document.querySelector(".flow-bar");
const dots = bar.querySelector(".bar-dots");
const label = bar.querySelector(".bar-label");
const prev = bar.querySelector(".bar-prev");
const next = bar.querySelector(".bar-next");
const byId = new Map(screens.map((screen) => [screen.id, screen]));
const first = screens[0];

document.documentElement.classList.add("flow-on");
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function trackOf(screen) {
  const name = screen.dataset.track;
  return name ? screens.filter((item) => item.dataset.track === name) : [];
}

function show(id, { focus = true, anchor = null } = {}) {
  const screen = byId.get(id) ?? first;
  for (const item of screens) {
    const hide = item !== screen;
    if (hide && !item.hidden) item.querySelectorAll("video").forEach((video) => video.pause());
    item.hidden = hide;
  }

  const track = trackOf(screen);
  const index = track.indexOf(screen);
  bar.hidden = screen === first;
  document.body.classList.toggle("has-bar", !bar.hidden);

  if (!bar.hidden) {
    const single = track.length < 2;
    dots.replaceChildren(...track.map((item, i) => {
      const dot = document.createElement("span");
      if (i < index) dot.className = "is-past";
      if (i === index) dot.className = "is-now";
      return dot;
    }));
    dots.hidden = single;
    bar.classList.toggle("is-single", single);
    const count = document.createElement("b");
    count.textContent = single ? "" : `${index + 1} di ${track.length}`;
    const name = document.createElement("span");
    name.textContent = single ? screen.dataset.label : ` · ${screen.dataset.label}`;
    label.replaceChildren(count, name);

    const before = track[index - 1];
    const after = track[index + 1];
    prev.hidden = !before;
    if (before) prev.href = `#${before.id}`;
    next.hidden = !after;
    if (after) next.href = `#${after.id}`;
  }

  if (anchor) anchor.scrollIntoView({ block: "start", behavior: "instant" });
  else window.scrollTo({ top: 0, behavior: "instant" });
  if (focus) (anchor ?? screen).querySelector("h1, h2")?.focus({ preventScroll: true });
}

function route({ focus = true } = {}) {
  const id = location.hash.slice(1);
  const target = document.getElementById(id);
  const anchor = target?.hasAttribute("data-flow-anchor") ? target : null;
  show(anchor?.closest("[data-screen]")?.id ?? id, { focus, anchor });
}

addEventListener("hashchange", () => route());
addEventListener("keydown", (event) => {
  if (bar.hidden || event.target.closest("summary, a, button, input, textarea")) return;
  if (event.key === "ArrowRight" && !next.hidden) next.click();
  if (event.key === "ArrowLeft" && !prev.hidden) prev.click();
});

route({ focus: false });
// Riposiziona la schermata dopo il salto del browser al frammento dell’URL.
addEventListener("load", () => route({ focus: false }));
