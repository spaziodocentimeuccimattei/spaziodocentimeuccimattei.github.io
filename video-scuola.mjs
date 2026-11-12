for (const player of document.querySelectorAll(".school-video-player")) {
  const video = player.querySelector("video");
  const title = document.getElementById(video.getAttribute("aria-labelledby"));
  const play = document.createElement("button");
  const icon = document.createElement("span");
  icon.textContent = "▶";
  icon.setAttribute("aria-hidden", "true");
  play.type = "button";
  play.className = "school-video-play";
  play.setAttribute("aria-label", `Guarda il video · ${title.textContent}`);
  play.append(icon, "Guarda il video");

  play.addEventListener("click", () => {
    video.controls = true;
    play.remove();
    video.focus({ preventScroll: true });
    video.play().catch(() => {}); // I comandi del player restano disponibili per riprovare.
  }, { once: true });

  video.controls = false;
  player.append(play);
}
