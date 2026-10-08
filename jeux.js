(() => {
    "use strict";

    const activities = window.nsiQuizActivities || [];

    const labels = { snt: "SNT", premiere: "Première", terminale: "Terminale", professeur: "Professeur" };
    const types = { quiz: "Quiz", truefalse: "Vrai ou faux", output: "Devine la sortie", bug: "Trouve le bug", algorithm: "Quel algorithme ?" };
    const level = localStorage.getItem("nsiLevel");
    if (!labels[level]) { window.location.replace("selection.html"); return; }
    const isTeacher = level === "professeur";
    if (isTeacher) document.getElementById("classroom-nav-link")?.removeAttribute("hidden");
    const progressKey = "nsiGamesProgress";
    const readProgress = () => { try { return JSON.parse(localStorage.getItem(progressKey)) || {}; } catch (_) { return {}; } };
    let progress = readProgress();
    let visibleActivities = activities.filter(item => item.level === level);
    let current = null;
    let questionIndex = 0;
    let score = 0;
    let answered = false;
    let startedAt = 0;

    const list = document.getElementById("activity-list");
    const panel = document.getElementById("play-panel");
    const addText = (parent, tag, text, className) => { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; parent.append(node); return node; };
    const label = item => labels[item.level] || item.level;
    const updateSummary = () => {
        const entries = Object.values(progress);
        document.getElementById("games-done").textContent = String(entries.length);
        const best = entries.length ? Math.max(...entries.map(entry => entry.percent)) : null;
        document.getElementById("games-best").textContent = best === null ? "—" : `${best} %`;
        const average = entries.length ? Math.round(entries.reduce((sum, entry) => sum + entry.percent, 0) / entries.length) : 0;
        document.getElementById("games-rate").textContent = `${average} %`;
    };
    const reportLink = item => {
        const body = `Bonjour,\n\nJe souhaite signaler un problème concernant une activité de NSI Hub.\n\nIdentifiant : ${item.id}\nTitre : ${item.title}\nNiveau actuel : ${label(item)}\nType : ${types[item.type]}\nCatégorie : ${item.category}\nDifficulté : ${item.difficulty}\nURL : ${location.href}\n\nProblème :\n[À compléter]\n\nMerci !`;
        return `mailto:perso@rafael.click?subject=${encodeURIComponent(`[NSI Hub] Niveau incorrect - ${item.id}`)}&body=${encodeURIComponent(body)}`;
    };
    const renderCards = () => {
        list.replaceChildren();
        visibleActivities.forEach(item => {
            const card = document.createElement("article"); card.className = "activity-card";
            const top = document.createElement("div"); top.className = "activity-card-top";
            const icon = document.createElement("span"); icon.className = "activity-icon";
            const iconNode = document.createElement("i"); iconNode.className = `fa-solid ${item.icon}`; iconNode.setAttribute("aria-hidden", "true"); icon.append(iconNode);
            top.append(icon, addText(document.createElement("span"), "span", types[item.type], "game-tag")); card.append(top);
            addText(card, "h3", item.title);
            addText(card, "p", item.description);
            const meta = document.createElement("div"); meta.className = "activity-meta";
            addText(meta, "span", label(item)); addText(meta, "span", `• ${item.category}`); addText(meta, "span", `• ${item.difficulty}`); card.append(meta);
            addText(card, "span", `ID : ${item.id}`, "activity-id");
            const play = addText(card, "button", "Jouer →", "game-button"); play.type = "button"; play.setAttribute("aria-label", `Jouer : ${item.title}`); play.addEventListener("click", () => start(item)); card.append(play);
            list.append(card);
        });
        if (!visibleActivities.length) addText(list, "p", "Aucune activité pour ce filtre.");
    };
    const start = item => { current = item; questionIndex = 0; score = 0; startedAt = Date.now(); list.hidden = true; panel.hidden = false; renderQuestion(); panel.scrollIntoView({ behavior: "smooth", block: "start" }); };
    const renderQuestion = () => {
        panel.replaceChildren(); answered = false;
        const q = current.questions[questionIndex];
        const top = document.createElement("div"); top.className = "play-top";
        addText(top, "span", `${types[current.type]} · ${current.title}`);
        addText(top, "span", `${questionIndex + 1} / ${current.questions.length}`); panel.append(top);
        const track = document.createElement("div"); track.className = "progress-track"; track.setAttribute("role", "progressbar"); track.setAttribute("aria-valuenow", String(questionIndex + 1)); track.setAttribute("aria-valuemin", "1"); track.setAttribute("aria-valuemax", String(current.questions.length));
        const fill = document.createElement("div"); fill.className = "progress-fill"; fill.style.width = `${((questionIndex + 1) / current.questions.length) * 100}%`; track.append(fill); panel.append(track);
        if (q.code) { const code = addText(panel, "pre", q.code, "question-code"); code.setAttribute("aria-label", "Code Python"); }
        addText(panel, "h2", q.prompt, "question-text");
        const answers = document.createElement("div"); answers.className = "answer-list"; answers.setAttribute("role", "group"); answers.setAttribute("aria-label", "Choisis une réponse");
        q.options.forEach((option, index) => { const button = addText(answers, "button", option, "answer-button"); button.type = "button"; button.addEventListener("click", () => choose(index, answers)); });
        panel.append(answers);
        const feedback = addText(panel, "p", "", "answer-feedback"); feedback.setAttribute("aria-live", "polite"); feedback.id = "answer-feedback";
        const actions = document.createElement("div"); actions.className = "play-actions";
        const next = addText(actions, "button", questionIndex === current.questions.length - 1 ? "Voir le résultat" : "Question suivante →", "game-button"); next.type = "button"; next.disabled = true; next.addEventListener("click", () => { if (questionIndex < current.questions.length - 1) { questionIndex++; renderQuestion(); } else finish(); });
        const exit = addText(actions, "button", "Quitter", "secondary-button"); exit.type = "button"; exit.addEventListener("click", closeActivity);
        const report = document.createElement("a"); report.className = "report-link"; report.href = reportLink(current); report.textContent = "Le niveau semble incorrect ? Signaler ce problème"; actions.append(report);
        panel.append(actions);
    };
    const choose = (selected, answers) => {
        if (answered) return; answered = true;
        const q = current.questions[questionIndex];
        [...answers.children].forEach((button, index) => { button.disabled = true; if (index === q.answer) button.classList.add("is-correct"); else if (index === selected) button.classList.add("is-wrong"); });
        const feedback = document.getElementById("answer-feedback");
        if (selected === q.answer) { score++; feedback.textContent = `Bonne réponse ! ${q.explanation}`; }
        else feedback.textContent = `Pas tout à fait. ${q.explanation}`;
        panel.querySelector(".game-button").disabled = false;
    };
    const finish = () => {
        const total = current.questions.length; const percent = Math.round(score / total * 100);
        const old = progress[current.id];
        progress[current.id] = { percent: Math.max(percent, old?.percent || 0), lastPercent: percent, plays: (old?.plays || 0) + 1, bestSeconds: old?.bestSeconds ? Math.min(old.bestSeconds, Math.round((Date.now() - startedAt) / 1000)) : Math.round((Date.now() - startedAt) / 1000) };
        localStorage.setItem(progressKey, JSON.stringify(progress)); updateSummary();
        panel.replaceChildren();
        addText(panel, "span", "Activité terminée", "eyebrow");
        addText(panel, "h2", `${score} / ${total}`, "result-score");
        addText(panel, "p", `${percent} % de réussite · ${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} · ${total - score} mauvaise${total - score > 1 ? "s" : ""} réponse${total - score > 1 ? "s" : ""}.`);
        addText(panel, "p", `ID : ${current.id}`, "activity-id");
        const actions = document.createElement("div"); actions.className = "play-actions";
        const retry = addText(actions, "button", "Recommencer", "game-button"); retry.type = "button"; retry.addEventListener("click", () => start(current));
        const back = addText(actions, "button", "Retour aux activités", "secondary-button"); back.type = "button"; back.addEventListener("click", closeActivity);
        const report = document.createElement("a"); report.className = "report-link"; report.href = reportLink(current); report.textContent = "Le niveau semble incorrect ? Signaler ce problème"; actions.append(report); panel.append(actions);
        if (typeof window.nsiTrack === "function") window.nsiTrack("gameCompleted", { id: current.id, score, total, percent });
    };
    const closeActivity = () => { panel.hidden = true; list.hidden = false; current = null; list.scrollIntoView({ behavior: "smooth", block: "start" }); };

    document.getElementById("games-title").textContent = isTeacher ? "Mode Professeur" : "À toi de jouer !";
    document.getElementById("games-description").textContent = isTeacher ? "Des activités et repères pédagogiques pour préparer tes séances." : level === "snt" ? "Des quiz pour comprendre Internet, les réseaux sociaux et les données." : "Des activités choisies pour ton niveau.";
    document.getElementById("level-pill").textContent = `Niveau : ${labels[level]}`;
    if (isTeacher) {
        document.getElementById("teacher-panel").hidden = false;
        document.getElementById("level-filter").addEventListener("change", event => { visibleActivities = activities.filter(item => event.target.value === "all" || item.level === event.target.value); renderCards(); });
    }
    updateSummary(); renderCards();
})();
