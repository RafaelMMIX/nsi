(() => {
  "use strict";
  if (localStorage.getItem("nsiLevel") !== "professeur") { window.location.replace("index.html"); return; }
  const $ = (id) => document.getElementById(id);
  const clock = $("clock"), date = $("date"), toolbar = $("presentation-toolbar"), toast = $("toast");
  const updateClock = () => { const now = new Date(); clock.textContent = now.toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"}); date.textContent = new Intl.DateTimeFormat("fr-FR", {weekday:"long", day:"numeric", month:"long", year:"numeric"}).format(now); };
  updateClock(); setInterval(updateClock, 1000);
  const scaleNames = ["normal", "large", "xlarge"];
  const applyScale = (scale) => { const value = scaleNames.includes(scale) ? scale : "normal"; document.documentElement.dataset.scale = value; document.documentElement.style.setProperty("--pres-scale", value === "large" ? "1.2" : value === "xlarge" ? "1.4" : "1"); localStorage.setItem("nsiPresentationScale", value); document.querySelectorAll("[data-scale]").forEach(button => { const active = button.dataset.scale === value; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); }); };
  applyScale(localStorage.getItem("nsiPresentationScale"));
  let toastTimer;
  const showMessage = (message) => { toast.textContent = message; toast.classList.add("visible"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200); };
  const fullscreenButton = $("fullscreen-toggle");
  const updateFullscreenButton = () => { const full = Boolean(document.fullscreenElement); fullscreenButton.innerHTML = full ? '<i class="fa-solid fa-compress"></i><span>Quitter le plein écran</span>' : '<i class="fa-solid fa-expand"></i><span>Passer en plein écran</span>'; };
  const toggleFullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else showMessage("Le plein écran n’est pas pris en charge par ce navigateur."); } catch { showMessage("Le navigateur a refusé le plein écran. Essayez à nouveau depuis le bouton."); } updateFullscreenButton(); };
  fullscreenButton.addEventListener("click", toggleFullscreen); document.addEventListener("fullscreenchange", updateFullscreenButton);
  const dialog = $("shortcuts-dialog"), openDialog = () => { if (dialog.showModal) dialog.showModal(); else showMessage("Les raccourcis : F plein écran, H accueil, R ressources, O outils, Q quiz, N notebook."); };
  $("shortcuts-open").addEventListener("click", openDialog); $("toolbar-shortcuts").addEventListener("click", openDialog); $("shortcuts-close").addEventListener("click", () => dialog.close()); dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  const go = (href) => { window.location.href = href; };
  document.addEventListener("keydown", (event) => { const target = event.target; if (target && (target.matches("input,textarea,select") || target.isContentEditable)) return; if (event.key.toLowerCase() === "f" && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); toggleFullscreen(); } else if (event.key.toLowerCase() === "h") go("index.html"); else if (event.key.toLowerCase() === "r") go("index.html#resources"); else if (event.key.toLowerCase() === "o") go("outils.html"); else if (event.key.toLowerCase() === "q") go("jeux.html"); else if (event.key.toLowerCase() === "n") go("notebooks.html"); else if (event.key === "?") openDialog(); });
  document.querySelectorAll("[data-scale]").forEach(button => button.addEventListener("click", () => applyScale(button.dataset.scale)));
  let hideTimer;
  const revealToolbar = () => { toolbar.classList.remove("is-hidden"); clearTimeout(hideTimer); if (document.fullscreenElement && !dialog.open) hideTimer = setTimeout(() => toolbar.classList.add("is-hidden"), 4500); };
  ["mousemove", "pointerdown", "keydown", "touchstart"].forEach(type => document.addEventListener(type, revealToolbar, {passive:true}));
  document.addEventListener("fullscreenchange", revealToolbar);
})();
