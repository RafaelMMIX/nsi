(function () {
    const KEY = "nsiLocalStatistics";
    const labels = {
        "index.html": "Accueil", "outils.html": "Outils", "dico.html": "Dictionnaire",
        "notebooks.html": "Notebooks", "notebook.html": "Notebook", "parametres.html": "Paramètres",
        "about.html": "À propos", "annonces.html": "Annonces", "changelog.html": "Nouveautés",
        "prompt.html": "Prompts", "selection.html": "Sélection", "felicitation.html": "Félicitations",
        "loading.html": "Chargement", "statistiques.html": "Statistiques"
    };
    const localDay = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const today = localDay(new Date());
    const empty = () => ({ views: 0, pages: {}, seconds: 0, days: {}, resources: {}, recentResources: [], searches: 0, tools: {}, sessions: 0, firstVisit: null, lastVisit: null, notebookCreates: 0, cellsCreated: 0, pythonCells: 0, markdownCells: 0, pythonRuns: 0, runSuccess: 0, runErrors: 0, notebookUses: {}, favoriteCategories: {}, favoriteAdded: [] });
    function read() {
        try {
            const data = { ...empty(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
            ["pages", "days", "resources", "tools", "notebookUses", "favoriteCategories"].forEach(key => {
                if (!data[key] || typeof data[key] !== "object" || Array.isArray(data[key])) data[key] = {};
            });
            ["recentResources", "favoriteAdded"].forEach(key => { if (!Array.isArray(data[key])) data[key] = []; });
            return data;
        } catch (_) { return empty(); }
    }
    function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
    function ensureDay(data, day = localDay(new Date())) { data.days[day] ||= { seconds: 0, actions: 0, hours: {}, weekdays: {} }; return data.days[day]; }
    function track(action, detail = {}) {
        const data = read(); const day = ensureDay(data);
        day.actions++;
        if (action === "resource") {
            const id = detail.id || detail.title || "Ressource";
            data.resources[id] ||= { title: detail.title || id, category: detail.category || "Autres", count: 0, lastUsed: Date.now() };
            data.resources[id].count++; data.resources[id].lastUsed = Date.now();
            data.recentResources.unshift({ title: data.resources[id].title, category: data.resources[id].category, at: Date.now() });
            data.recentResources = data.recentResources.slice(0, 8);
        } else if (action === "search") data.searches++;
        else if (action === "tool") { const name = detail.name || "Outil"; data.tools[name] = (data.tools[name] || 0) + 1; }
        else if (action === "notebookCreated") data.notebookCreates++;
        else if (action === "cellCreated") { data.cellsCreated++; detail.type === "markdown" ? data.markdownCells++ : data.pythonCells++; }
        else if (action === "pythonRun") data.pythonRuns++;
        else if (action === "pythonSuccess") data.runSuccess++;
        else if (action === "pythonError") data.runErrors++;
        else if (action === "notebookUse") { const name = detail.name || "Notebook"; data.notebookUses[name] = (data.notebookUses[name] || 0) + 1; }
        else if (action === "favoriteAdded") {
            const category = detail.category || "Autres"; data.favoriteCategories[category] = (data.favoriteCategories[category] || 0) + 1;
            data.favoriteAdded.unshift({ title: detail.title || "Ressource", at: Date.now() }); data.favoriteAdded = data.favoriteAdded.slice(0, 8);
        }
        save(data);
    }
    window.nsiTrack = track;

    const file = location.pathname.split("/").pop() || "index.html";
    const data = read();
    data.views++; data.pages[file] = (data.pages[file] || 0) + 1;
    data.firstVisit ||= Date.now(); data.lastVisit = Date.now();
    data.days[today] ||= { seconds: 0, actions: 0, hours: {}, weekdays: {} };
    if (!sessionStorage.getItem("nsiStatsSessionActive")) { data.sessions++; sessionStorage.setItem("nsiStatsSessionActive", "true"); }
    data.days[today].actions++;
    save(data);

    if (file === "notebook.html") {
        const id = new URLSearchParams(location.search).get("id");
        let notebooks = []; try { notebooks = JSON.parse(localStorage.getItem("nsiNotebooks")) || []; } catch (_) {}
        const notebook = notebooks.find(item => item.id === id);
        track("notebookUse", { name: notebook?.name || "Notebook" });
    }

    document.querySelectorAll(".card[href]").forEach(card => card.addEventListener("click", event => {
        if (event.target.closest(".favorite-button")) return;
        const category = card.closest(".category")?.querySelector("h2")?.textContent.trim() || "Autres";
        track("resource", { id: card.querySelector(".favorite-button")?.dataset.id || card.href, title: card.querySelector("h3")?.textContent.trim() || card.dataset.name, category });
    }));
    document.getElementById("search")?.addEventListener("input", event => {
        clearTimeout(window.nsiSearchTimer);
        if (event.target.value.trim()) window.nsiSearchTimer = setTimeout(() => track("search"), 800);
    });
    document.addEventListener("click", event => {
        const favorite = event.target.closest(".favorite-button");
        if (favorite) {
            setTimeout(() => {
                let ids = []; try { ids = JSON.parse(localStorage.getItem("nsiFavorites")) || []; } catch (_) {}
                if (ids.includes(favorite.dataset.id)) track("favoriteAdded", { title: favorite.closest(".card")?.querySelector("h3")?.textContent.trim(), category: favorite.closest(".category")?.querySelector("h2")?.textContent.trim() });
            }, 0);
        }
        const tool = event.target.closest(".tool");
        if (tool && !tool.dataset.statsUsed) { tool.dataset.statsUsed = "true"; track("tool", { name: tool.querySelector("h2")?.textContent.trim() || "Outil" }); }
    });
    document.querySelectorAll("#outils-page input, .tool input, .tool textarea").forEach(input => input.addEventListener("input", () => {
        const tool = input.closest(".tool"); if (tool && !tool.dataset.statsUsed) { tool.dataset.statsUsed = "true"; track("tool", { name: tool.querySelector("h2")?.textContent.trim() || "Outil" }); }
    }, { once: true }));

    let lastTick = Date.now();
    setInterval(() => {
        const now = Date.now(); const elapsed = Math.min(Math.floor((now - lastTick) / 1000), 20); lastTick = now;
        if (document.visibilityState !== "visible" || elapsed <= 0) return;
        const latest = read(); const day = ensureDay(latest);
        latest.seconds += elapsed; day.seconds += elapsed;
        const hour = String(new Date().getHours()).padStart(2, "0"); day.hours[hour] = (day.hours[hour] || 0) + elapsed;
        const weekday = String(new Date().getDay()); day.weekdays[weekday] = (day.weekdays[weekday] || 0) + elapsed;
        save(latest);
    }, 10000);

    if (file !== "statistiques.html") return;
    renderDashboard();
    function renderDashboard() {
        const current = read();
        const put = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
        const fmtTime = seconds => { const minutes = Math.round(seconds / 60); return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`; };
        const dayDates = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return localDay(d); });
        const activeDates = Object.keys(current.days).filter(key => current.days[key].seconds > 0 || current.days[key].actions > 0).sort();
        const streak = () => { let d = new Date(); let count = 0; if (!activeDates.includes(localDay(d))) d.setDate(d.getDate() - 1); while (activeDates.includes(localDay(d))) { count++; d.setDate(d.getDate() - 1); } return count; };
        const weekDates = dayDates.slice(-7); const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        const calendarWeek = []; for (let date = new Date(monday); date <= new Date(); date.setDate(date.getDate() + 1)) calendarWeek.push(localDay(date));
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0); const calendarMonth = [];
        for (let date = new Date(monthStart); date <= new Date(); date.setDate(date.getDate() + 1)) calendarMonth.push(localDay(date));
        const weeklySecs = calendarWeek.reduce((n, key) => n + (current.days[key]?.seconds || 0), 0);
        const monthSecs = calendarMonth.reduce((n, key) => n + (current.days[key]?.seconds || 0), 0);
        const todayData = current.days[today] || { seconds: 0, actions: 0, hours: {}, weekdays: {} };
        put("stat-resources", Object.values(current.resources).reduce((n, item) => n + item.count, 0)); put("stat-views", current.views);
        let gameProgress = {}; try { gameProgress = JSON.parse(localStorage.getItem("nsiGamesProgress")) || {}; } catch (_) {}
        const gameEntries = Object.values(gameProgress);
        const gamePercent = gameEntries.length ? Math.round(gameEntries.reduce((sum, item) => sum + (Number(item.percent) || 0), 0) / gameEntries.length) : 0;
        put("stat-games", gameEntries.length);
        put("games-progress-summary", gameEntries.length ? `${gameEntries.length} activités terminées · réussite moyenne : ${gamePercent} %. Tes meilleurs scores sont enregistrés sur cet appareil.` : "Tes activités Quiz & Jeux terminées apparaîtront ici.");
        const classroomSection = document.getElementById("classroom-stats");
        if (classroomSection && localStorage.getItem("nsiLevel") === "professeur") {
            classroomSection.hidden = false;
            let sessions = []; try { sessions = JSON.parse(localStorage.getItem("nsiClassroomHistory")) || []; } catch (_) {}
            const playerRows = sessions.flatMap(session => session.rankings || []);
            put("classroom-games", sessions.length);
            put("classroom-questions", sessions.reduce((sum, session) => sum + (session.questions || 0), 0));
            put("classroom-players", sessions.reduce((sum, session) => sum + (session.players || 0), 0));
            put("classroom-best", playerRows.length ? Math.max(...playerRows.map(player => player.score || 0)) : "—");
            put("classroom-wins", sessions.reduce((sum, session) => sum + (session.rankings?.length ? 1 : 0), 0));
            put("classroom-average", playerRows.length ? Math.round(playerRows.reduce((sum, player) => sum + (player.score || 0), 0) / playerRows.length) : "—");
            const bestResponse = playerRows.map(player => player.bestTimeMs).filter(value => Number.isFinite(value));
            put("classroom-best-time", bestResponse.length ? `${(Math.min(...bestResponse) / 1000).toFixed(2)} s` : "—");
            const totalOpportunities = sessions.reduce((sum, session) => sum + (session.questions || 0) * (session.players || 0), 0);
            const totalCorrect = playerRows.reduce((sum, player) => sum + (player.correct || 0), 0);
            put("classroom-success", totalOpportunities ? `${Math.round(totalCorrect / totalOpportunities * 100)} %` : "—");
            const historyRoot = document.getElementById("classroom-history"); historyRoot.replaceChildren();
            if (!sessions.length) historyRoot.textContent = "Aucune partie terminée.";
            sessions.slice(0, 10).forEach(session => { const row = document.createElement("div"); row.className = "ranked-row"; const title = document.createElement("span"); title.textContent = `${session.quizTitle} · ${session.code} · ${new Date(session.date).toLocaleDateString("fr-FR")} · ${session.players} joueur(s)`; const winner = document.createElement("strong"); winner.textContent = session.rankings?.[0] ? `${session.rankings[0].nickname} (${session.rankings[0].score} pts)` : "—"; row.append(title, winner); historyRoot.append(row); });
        }
        let favorites = []; let notebooks = []; try { favorites = JSON.parse(localStorage.getItem("nsiFavorites")) || []; } catch (_) {} try { notebooks = JSON.parse(localStorage.getItem("nsiNotebooks")) || []; } catch (_) {}
        put("stat-favorites", favorites.length); put("stat-notebooks", notebooks.length); put("stat-notebooks-created", current.notebookCreates); put("notebook-count", notebooks.length); put("stat-searches", current.searches);
        put("stat-tools", Object.values(current.tools).reduce((n, v) => n + v, 0)); put("stat-runs", current.pythonRuns); put("stat-success", current.runSuccess); put("stat-errors", current.runErrors);
        put("time-total", fmtTime(current.seconds)); put("time-today", fmtTime(todayData.seconds)); put("time-week", fmtTime(weeklySecs)); put("time-month", fmtTime(monthSecs));
        put("active-days", activeDates.length); put("streak-days", streak()); put("actions-today", todayData.actions);
        put("cell-count", current.cellsCreated); put("python-cells", current.pythonCells); put("markdown-cells", current.markdownCells);
        const resourceRows = Object.entries(current.resources).sort((a, b) => b[1].count - a[1].count);
        put("resource-unique", resourceRows.length); put("resource-favorite", resourceRows[0]?.[1].title || "—");
        const catCounts = {}; resourceRows.forEach(([, item]) => catCounts[item.category] = (catCounts[item.category] || 0) + item.count);
        put("category-favorite", Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—");
        put("notebook-used", Object.entries(current.notebookUses).sort((a, b) => b[1] - a[1])[0]?.[0] || "—");
        const weekdays = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]; const weekdayCounts = {};
        Object.values(current.days).forEach(day => Object.entries(day.weekdays || {}).forEach(([key, seconds]) => weekdayCounts[key] = (weekdayCounts[key] || 0) + seconds));
        put("best-weekday", weekdays[Number(Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0]?.[0])] || "—");
        const hourCounts = {}; Object.values(current.days).forEach(day => Object.entries(day.hours || {}).forEach(([key, seconds]) => hourCounts[key] = (hourCounts[key] || 0) + seconds));
        const activeHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0]; put("best-hour", activeHour ? `${activeHour} h` : "—");
        const meaningfulViews = Math.max(0, current.views - (current.pages["statistiques.html"] || 0));
        const hasTrackedActivity = meaningfulViews > 0 || resourceRows.length > 0 || current.searches > 0 || current.pythonRuns > 0 || current.notebookCreates > 0;
        const summary = hasTrackedActivity ? `Tu as visité ${meaningfulViews} page${meaningfulViews === 1 ? "" : "s"} et passé ${fmtTime(current.seconds)} sur NSI Hub. Continue comme ça !` : "Aucune activité enregistrée pour le moment. Explore le site pour commencer à construire tes statistiques.";
        put("activity-summary", summary);
        const top = document.getElementById("resource-top"); const recent = document.getElementById("resource-recent");
        const renderList = (el, rows) => { el.replaceChildren(); if (!rows.length) { el.textContent = "Pas encore de données."; return; } rows.forEach(([name, value]) => { const row = document.createElement("div"); row.className = "ranked-row"; const title = document.createElement("span"); title.textContent = name; const count = document.createElement("strong"); count.textContent = value; row.append(title, count); el.appendChild(row); }); };
        renderList(top, resourceRows.slice(0, 5).map(([, item]) => [item.title, item.count])); renderList(recent, current.recentResources.slice(0, 6).map(item => [item.title, new Date(item.at).toLocaleDateString("fr-FR")]));
        renderList(document.getElementById("favorite-categories"), Object.entries(current.favoriteCategories).sort((a, b) => b[1] - a[1]));
        renderList(document.getElementById("favorite-recent"), current.favoriteAdded.slice(0, 6).map(item => [item.title, new Date(item.at).toLocaleDateString("fr-FR")]));
        const favoriteResource = resourceRows.find(([id]) => favorites.includes(id)); put("favorite-most-used", favoriteResource?.[1].title || "—");
        renderActivity("activity-7", weekDates, current.days, false); renderActivity("activity-30", dayDates, current.days, true);
        const profile = document.getElementById("profile-info"); profile.replaceChildren();
        const level = localStorage.getItem("nsiLevel") || "Non défini";
        [["Niveau", level], ["Première utilisation", current.firstVisit ? new Date(current.firstVisit).toLocaleDateString("fr-FR") : "—"], ["Dernière visite", current.lastVisit ? new Date(current.lastVisit).toLocaleString("fr-FR") : "—"], ["Sessions", current.sessions], ["Série actuelle", `${streak()} jour(s)`]].forEach(([label, value]) => { const item = document.createElement("div"); item.className = "profile-item"; item.innerHTML = `<span>${label}</span><strong></strong>`; item.querySelector("strong").textContent = value; profile.appendChild(item); });
    }
    function renderActivity(id, dates, days, dense) {
        const root = document.getElementById(id); root.replaceChildren(); const values = dates.map(key => days[key]?.actions || 0); const max = Math.max(1, ...values);
        dates.forEach((key, index) => { const bar = document.createElement("div"); bar.className = "activity-bar"; const value = values[index]; bar.style.setProperty("--bar-height", `${Math.max(value ? 8 : 2, value / max * 100)}%`); bar.title = `${key} : ${value} action(s)`; const fill = document.createElement("span"); fill.style.height = "var(--bar-height)"; const label = document.createElement("small"); label.textContent = dense ? (index % 5 === 0 ? key.slice(8) : "") : new Date(`${key}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short" }); bar.append(fill, label); root.appendChild(bar); });
    }
    setInterval(renderDashboard, 10000);
    document.getElementById("export-stats").addEventListener("click", () => {
        const backup = { format: "nsi-hub-statistics", version: 1, exportedAt: new Date().toISOString(), data: read() };
        const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = `nsi-hub-statistiques-${today}.json`; a.click(); URL.revokeObjectURL(url); document.getElementById("stats-status").textContent = "Statistiques exportées.";
    });
    const importFile = document.getElementById("import-stats-file"); document.getElementById("import-stats-button").addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", async () => { const file = importFile.files[0]; if (!file) return; try { const backup = JSON.parse(await file.text()); if (backup.format !== "nsi-hub-statistics" || !backup.data || typeof backup.data !== "object") throw new Error("Fichier de statistiques invalide."); if (!confirm("Importer ces statistiques et remplacer celles de cet appareil ?")) return; save({ ...empty(), ...backup.data }); location.reload(); } catch (error) { document.getElementById("stats-status").textContent = error.message; } finally { importFile.value = ""; } });
    document.getElementById("reset-stats").addEventListener("click", () => { if (!confirm("Réinitialiser uniquement les statistiques ? Les favoris et notebooks seront conservés.")) return; localStorage.removeItem(KEY); sessionStorage.removeItem("nsiStatsSessionActive"); location.reload(); });
    document.getElementById("delete-local-data").addEventListener("click", () => { if (!confirm("Supprimer toutes les données locales de NSI Hub sur cet appareil ? Cette action est irréversible.")) return; localStorage.clear(); sessionStorage.clear(); location.href = "selection.html"; });
})();
