(() => {
  "use strict";
  if (localStorage.getItem("nsiLevel") !== "professeur") return;
  const $ = id => document.getElementById(id);
  const setup = $("setup-panel"), panel = $("game-panel"), notice = $("service-notice");
  const quizzes = window.nsiClassroomQuizzes || [];
  const levels = { premiere: "Première", terminale: "Terminale" };
  let currentQuiz = null, currentCode = "", teacherSecret = "", unsubscribe = null, refreshBusy = false, clockTimer = null, historySaved = false, lastRenderKey = "";
  const text = (tag, value, className) => { const el = document.createElement(tag); el.textContent = value; if (className) el.className = className; return el; };
  const report = (el, message) => { el.hidden = !message; el.textContent = message || ""; };
  const selectedQuizzes = () => quizzes.filter(item => item.level === $("quiz-level").value);
  function populateQuizzes() {
    const select = $("quiz-select"), previous = select.value;
    select.replaceChildren();
    selectedQuizzes().forEach(item => { const option = document.createElement("option"); option.value = item.id; option.textContent = `${item.title} · ${item.questions.length} questions`; select.append(option); });
    if (selectedQuizzes().some(item => item.id === previous)) select.value = previous;
    updateSummary();
  }
  function updateSummary() {
    const quiz = selectedQuizzes().find(item => item.id === $("quiz-select").value);
    $("quiz-summary").textContent = quiz ? `${quiz.questions.length} questions · ${levels[quiz.level]} · ID ${quiz.id}` : "Aucun quiz disponible pour ce niveau.";
  }
  $("quiz-level").addEventListener("change", populateQuizzes); $("quiz-select").addEventListener("change", updateSummary); populateQuizzes();
  function readHistory() { try { return JSON.parse(localStorage.getItem("nsiClassroomHistory")) || []; } catch (_) { return []; } }
  function renderHistory() {
    const list = $("history-list"), items = readHistory(); list.replaceChildren();
    if (!items.length) { list.append(text("p", "Aucune partie terminée pour le moment.")); return; }
    items.slice(0, 8).forEach(item => { const row = document.createElement("article"); row.className = "history-item"; row.append(text("strong", `${item.quizTitle} · ${item.code}`), text("span", `${new Date(item.date).toLocaleString("fr-FR")} · ${item.players} joueurs · ${item.questions} questions`)); list.append(row); });
  }
  renderHistory();
  function makeButton(label, action, kind = "") { const b = text("button", label, `classroom-button ${kind}`); b.type = "button"; b.addEventListener("click", action); return b; }
  function startRealtime() { if (unsubscribe) unsubscribe(); unsubscribe = window.nsiClassroom.subscribe(currentCode, refresh); refresh(); }
  async function refresh() {
    if (refreshBusy || !currentCode) return; refreshBusy = true;
    try { const state = await window.nsiClassroom.rpc("classroom_state", { p_code: currentCode, p_player_secret: "" }); renderState(state); }
    catch (error) {
      report(notice, error.message);
      if (error.message.includes("Partie introuvable") && unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    }
    finally { refreshBusy = false; }
  }
  async function teacherAction(action) { try { await window.nsiClassroom.rpc("classroom_teacher_action", { p_code: currentCode, p_secret: teacherSecret, p_action: action }); await refresh(); } catch (error) { report(notice, error.message); } }
  function renderState(state) {
    const renderKey = JSON.stringify(state); if (renderKey === lastRenderKey) return; lastRenderKey = renderKey;
    if (clockTimer) clearInterval(clockTimer); panel.replaceChildren(); report(notice, "");
    const heading = text("div", "", "game-heading"); heading.append(text("span", `${state.quiz.title} · ${levels[state.quiz.level] || state.quiz.level}`, "eyebrow"), text("h2", `Partie ${state.code}`));
    const stats = document.createElement("div"); stats.className = "live-stats"; stats.append(text("strong", `${state.players} joueurs`), text("span", `${state.answersReceived || 0} / ${state.players} réponses`)); panel.append(heading, stats);
    if (state.status === "waiting") {
      const waiting = document.createElement("div"); waiting.className = "waiting-layout";
      const qr = document.createElement("div"); qr.className = "qr-target";
      const joinUrl = new URL("rejoindre.html", location.href); joinUrl.searchParams.set("game", state.code);
      if (window.QRCode) new QRCode(qr, { text: joinUrl.href, width: 300, height: 300, correctLevel: QRCode.CorrectLevel.M }); else qr.append(text("p", "QR indisponible"));
      const instructions = document.createElement("div"); instructions.className = "join-instructions"; instructions.append(text("h2", "Rejoins la partie"), text("p", "Scanne le QR code ou ouvre le lien et saisis le code."), text("div", state.code, "room-code"), text("p", joinUrl.href, "join-url"));
      waiting.append(qr, instructions); panel.append(waiting);
      const roster = document.createElement("div"); roster.className = "roster"; roster.append(text("h3", `Joueurs connectés · ${state.players}`)); const names = document.createElement("div"); names.className = "roster-list"; (state.roster || []).forEach(name => names.append(text("span", name, "player-chip"))); if (!state.players) names.append(text("span", "Les joueurs apparaîtront ici.")); roster.append(names); panel.append(roster);
      const actions = document.createElement("div"); actions.className = "game-actions"; actions.append(makeButton("Démarrer le quiz", () => teacherAction("start"), "primary"), makeButton("Annuler la partie", () => teacherAction("cancel"), "danger")); panel.append(actions);
    } else if (state.status === "playing") {
      const q = state.question, ix = state.questionIndex + 1;
      panel.append(text("p", `QUESTION ${ix} / ${state.quiz.questionCount}`, "eyebrow"), text("h1", q.question, "projected-question"));
      const answers = document.createElement("div"); answers.className = "teacher-answers"; (q.answers || []).forEach((answer, index) => answers.append(text("div", `${String.fromCharCode(65 + index)} · ${answer}`, `teacher-answer color-${index}`))); panel.append(answers);
      const timer = text("strong", state.duration ? "— s" : "Sans limite", "big-timer"); panel.append(timer);
      const tick = () => { if (!state.endsAt) { timer.textContent = "Sans limite"; return; } const left = Math.max(0, Math.ceil((new Date(state.endsAt).getTime() - Date.now()) / 1000)); timer.textContent = `${left} s`; timer.classList.toggle("time-low", left <= 5); };
      tick(); clockTimer = setInterval(tick, 250);
      if (state.players > 0 && state.answersReceived >= state.players) panel.append(text("p", "Tout le monde a répondu.", "all-answered"));
      panel.append(makeButton("Afficher les résultats", () => teacherAction("results"), "primary"));
    } else if (state.status === "results" || state.status === "finished") {
      const final = state.status === "finished";
      panel.append(text("h1", final ? "Quiz terminé !" : "Classement", "ranking-title"));
      const sourceQuiz = currentQuiz || quizzes.find(item => item.id === state.quiz.id);
      const correctQuestion = sourceQuiz?.questions[state.questionIndex];
      if (correctQuestion) panel.append(text("p", `Bonne réponse : ${String.fromCharCode(65 + correctQuestion.correctAnswer)} · ${correctQuestion.answers[correctQuestion.correctAnswer]}`, "correct-answer-note"));
      const list = document.createElement("ol"); list.className = "ranking-list";
      (state.rankings || []).forEach((player, index) => { const row = document.createElement("li"); row.append(text("span", `${index + 1}. ${player.nickname}`), text("strong", `${player.roundPoints ?? 0} pts`), text("strong", `${player.score ?? 0} au total`)); list.append(row); }); panel.append(list);
      if (final) {
        if (!historySaved) { historySaved = true; const items = readHistory(); items.unshift({ code: state.code, quizId: state.quiz.id, quizTitle: state.quiz.title, date: new Date().toISOString(), players: state.players, questions: state.quiz.questionCount, rankings: state.rankings }); localStorage.setItem("nsiClassroomHistory", JSON.stringify(items.slice(0, 100))); renderHistory(); }
        const note = text("p", "Les résultats sont enregistrés dans l’historique local de cet appareil.", "local-note"); panel.append(note, makeButton("Nouveau quiz", () => { if (unsubscribe) unsubscribe(); setup.hidden = false; panel.hidden = true; currentCode = ""; populateQuizzes(); }, "primary"), makeButton("Retour aux quiz", () => location.href = "jeux.html"));
      } else panel.append(makeButton("Question suivante", () => teacherAction("next"), "primary"));
    } else { panel.append(text("h2", state.status === "cancelled" ? "Partie annulée" : "Partie terminée."), makeButton("Créer une autre partie", () => { setup.hidden = false; panel.hidden = true; }, "primary")); }
  }
  $("create-game").addEventListener("click", async event => {
    const btn = event.currentTarget; btn.disabled = true;
    try {
      currentQuiz = selectedQuizzes().find(item => item.id === $("quiz-select").value);
      if (!currentQuiz) throw new Error("Choisis un quiz.");
      const secretBytes = new Uint8Array(32); crypto.getRandomValues(secretBytes); teacherSecret = Array.from(secretBytes, value => value.toString(16).padStart(2, "0")).join("");
      const result = await window.nsiClassroom.rpc("classroom_create", { p_quiz: currentQuiz, p_duration: Number($("duration").value), p_teacher_secret: teacherSecret });
      currentCode = result.code; localStorage.setItem(`nsiClassroomTeacher:${currentCode}`, teacherSecret); historySaved = false; setup.hidden = true; panel.hidden = false; startRealtime();
    } catch (error) { report(notice, error.message); }
    finally { btn.disabled = false; }
  });
  if (!window.nsiClassroom.configured) report(notice, "Service temps réel non configuré. Renseigne supabase-config.js puis exécute supabase/quiz-en-classe.sql dans le projet Supabase.");
})();
