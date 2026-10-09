// Pagina famiglie: tasto «Copia» per codice meccanografico e dicitura.
// Finché il valore è «da confermare» (attributo data-pending) il tasto resta spento.

const status = document.querySelector(".fam-copy-status");

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

for (const button of document.querySelectorAll("[data-copy]")) {
  const value = button.previousElementSibling;
  if (!value || value.hasAttribute("data-pending")) {
    button.disabled = true;
    button.title = "Disponibile quando il dato sarà confermato";
    continue;
  }
  button.addEventListener("click", async () => {
    const text = value.textContent.trim();
    try {
      await copyText(text);
      button.textContent = "Copiato";
      if (status) status.textContent = `Copiato: ${text}`;
    } catch {
      if (status) status.textContent = "Copia non riuscita: selezionate il testo e copiatelo a mano.";
    }
    setTimeout(() => { button.textContent = "Copia"; }, 2200);
  });
}
