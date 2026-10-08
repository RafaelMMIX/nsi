(() => {
  "use strict";
  const $ = id => document.getElementById(id), codeInput = $("game-code"), joinPanel = $("join-panel"), namePanel = $("nickname-panel"), playerPanel = $("player-panel"), notice = $("player-notice");
  const params = new URLSearchParams(location.search); codeInput.value = (params.get("game") || "").toUpperCase();
  let code = "", secret = "", nickname = "", unsubscribe = null, busy = false, countdown = null, heartbeat = null, lastRenderKey = "";
  const text = (tag, value, className) => { const el = document.createElement(tag); el.textContent = value; if (className) el.className = className; return el; };
  const showNotice = message => { notice.hidden = !message; notice.textContent = message || ""; };
  async function checkGame() {
    code = codeInput.value.trim().toUpperCase(); if (!code) return showNotice("Saisis le code affiché par le professeur.");
    try { const state = await window.nsiClassroom.rpc("classroom_state", { p_code: code, p_player_secret: "" }); if (state.status !== "waiting" && !localStorage.getItem(`nsiClassroomPlayer:${code}`)) throw new Error("Cette partie a déjà commencé ou est terminée."); namePanel.hidden = false; joinPanel.hidden = true; $("player-name").value = localStorage.getItem("nsiPlayerName") || ""; $("saved-name").textContent = $("player-name").value ? `Ton pseudo enregistré : ${$("player-name").value}` : "Choisis un pseudo visible par la classe."; $("player-name").focus(); }
    catch (error) { showNotice(error.message); }
  }
  $("check-game").addEventListener("click", checkGame); codeInput.addEventListener("keydown", event => { if (event.key === "Enter") checkGame(); });
  async function joinGame() {
    nickname = $("player-name").value.trim(); if (!nickname) return showNotice("Saisis un pseudo.");
    secret = window.nsiClassroom.token(`nsiClassroomPlayer:${code}`);
    try { const state = await window.nsiClassroom.rpc("classroom_join", { p_code: code, p_nickname: nickname, p_player_secret: secret }); nickname = state.myNickname || nickname; localStorage.setItem("nsiPlayerName", nickname); namePanel.hidden = true; playerPanel.hidden = false; showNotice(""); startRealtime(); renderState(state); }
    catch (error) { showNotice(error.message); }
  }
  $("join-game").addEventListener("click", joinGame); $("player-name").addEventListener("keydown", event => { if (event.key === "Enter") joinGame(); });
  function startRealtime() { if (unsubscribe) unsubscribe(); if (heartbeat) clearInterval(heartbeat); unsubscribe = window.nsiClassroom.subscribe(code, refresh); heartbeat = setInterval(() => window.nsiClassroom.rpc("classroom_ping", { p_code: code, p_player_secret: secret }).catch(() => {}), 10000); }
  async function refresh() { if (busy) return; busy = true; try { const state = await window.nsiClassroom.rpc("classroom_state", { p_code: code, p_player_secret: secret }); renderState(state); } catch (error) { showNotice(error.message); } finally { busy = false; } }
  async function submit(index, button) { if (button.disabled) return; document.querySelectorAll(".choice-button").forEach(item => item.disabled = true); try { await window.nsiClassroom.rpc("classroom_submit", { p_code: code, p_player_secret: secret, p_answer: index }); await refresh(); } catch (error) { showNotice(error.message); document.querySelectorAll(".choice-button").forEach(item => item.disabled = false); } }
  function renderState(state) {
    const renderKey = JSON.stringify(state); if (renderKey === lastRenderKey) return; lastRenderKey = renderKey;
    if (countdown) clearInterval(countdown); playerPanel.replaceChildren(); showNotice("");
    if (state.status === "waiting") { playerPanel.append(text("h1", "Tu es prêt !"), text("p", `Pseudo : ${state.myNickname || nickname}`, "player-welcome"), text("p", `Partie : ${state.code}`), text("p", `${state.players} joueurs connectés`), text("p", "En attente du professeur…", "waiting-message")); return; }
    if (state.status === "playing") {
      const q = state.question; playerPanel.append(text("p", `QUESTION ${state.questionIndex + 1} / ${state.quiz.questionCount}`, "eyebrow"), text("h1", q.question, "player-question"));
      if (q.code) playerPanel.append(text("pre", q.code, "question-code"));
      const choices = document.createElement("div"); choices.className = "choice-grid"; (q.answers || []).forEach((answer, index) => { const button = document.createElement("button"); button.type = "button"; button.className = `choice-button color-${index}`; button.disabled = state.myAnswer !== null && state.myAnswer !== undefined; button.append(text("b", String.fromCharCode(65 + index)), text("span", answer)); button.addEventListener("click", () => submit(index, button)); choices.append(button); }); playerPanel.append(choices);
      if (state.myAnswer !== null && state.myAnswer !== undefined) playerPanel.append(text("p", "Réponse enregistrée !", "answer-saved"));
      if (state.endsAt) { const timer = text("strong", "", "player-timer"); playerPanel.prepend(timer); const tick = () => { const n = Math.max(0, Math.ceil((new Date(state.endsAt).getTime() - Date.now()) / 1000)); timer.textContent = `${n} s`; timer.classList.toggle("time-low", n <= 5); if (n === 0) document.querySelectorAll(".choice-button").forEach(button => button.disabled = true); }; tick(); countdown = setInterval(tick, 250); }
      return;
    }
    if (state.status === "results" || state.status === "finished") {
      const final = state.status === "finished";
      playerPanel.append(text("h1", final ? "Quiz terminé !" : "Classement", "ranking-title"));
      const board = document.createElement("ol"); board.className = "ranking-list";
      let mine = null;
      (state.rankings || []).forEach((entry, i) => { const row = document.createElement("li"); row.append(text("span", `${i + 1}. ${entry.nickname}`), text("strong", `${entry.roundPoints || 0} pts`), text("strong", `${entry.score || 0} total`)); if (entry.nickname === state.myNickname) { mine = { position: i + 1, points: entry.roundPoints || 0, score: entry.score || 0 }; row.classList.add("my-rank"); } board.append(row); });
      if (mine) playerPanel.append(text("p", `Tu es ${mine.position}${mine.position === 1 ? "er" : "e"} · +${mine.points} points · ${mine.score} au total`, "my-score")); playerPanel.append(board);
      if (!final) playerPanel.append(text("p", "En attente de la prochaine question…", "waiting-message")); else { playerPanel.append(text("p", "Merci d’avoir joué !")); if (unsubscribe) unsubscribe(); if (heartbeat) clearInterval(heartbeat); }
      return;
    }
    playerPanel.append(text("h1", state.status === "cancelled" ? "La partie a été annulée." : "Cette partie est terminée.")); if (unsubscribe) unsubscribe(); if (heartbeat) clearInterval(heartbeat);
  }
  if (!window.nsiClassroom.configured) showNotice("Le service temps réel n’est pas configuré pour ce site.");
  else if (codeInput.value) checkGame();
})();
