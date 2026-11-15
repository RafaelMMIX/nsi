"use strict";

/* =========================================================
   PARAMÈTRES — OUTILS DU MODE DÉVELOPPEUR
   Tests, données de démo, journal des erreurs, inspecteur du stockage.
   ========================================================= */

(() => {
    const $ = id => document.getElementById(id);
    if (!$("dev-mode-tools")) return;

    const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const size = chars => chars < 1024 ? `${chars} o` : chars < 1024 * 1024 ? `${(chars / 1024).toFixed(1).replace(".", ",")} Ko` : `${(chars / 1024 / 1024).toFixed(2).replace(".", ",")} Mo`;
    const status = text => { $("dev-test-status").textContent = text; };

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_) {
            const area = document.createElement("textarea");
            area.value = text;
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand("copy");
            area.remove();
            return ok;
        }
    }

    // Activer / désactiver le mode recharge la page pour lancer (ou arrêter) la barre et le journal
    $("dev-mode-toggle")?.addEventListener("change", () => setTimeout(() => location.reload(), 250));

    /* ---------- Profil en un clic ---------- */

    const profiles = document.querySelectorAll("#dev-profiles [data-level]");
    function showProfile() {
        const level = localStorage.getItem("nsiLevel");
        profiles.forEach(button => {
            const active = button.dataset.level === level;
            button.classList.toggle("active", active);
            button.setAttribute("aria-checked", String(active));
        });
    }
    profiles.forEach(button => button.addEventListener("click", () => {
        localStorage.setItem("nsiLevel", button.dataset.level);
        showProfile();
        if (typeof displayLevel === "function") displayLevel();
        status(`Profil changé : ${button.textContent}.`);
    }));
    showProfile();

    /* ---------- Annonces ---------- */

    const select = $("dev-announcement");
    const preview = $("dev-announcement-preview");
    const list = typeof announcements !== "undefined" ? announcements : [];
    [...list].reverse().forEach((item, index) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${index === 0 ? "★ " : ""}${item.title} (${item.date})`;
        select.appendChild(option);
    });
    const updatePreview = () => { preview.href = `index.html?devAnnonce=${encodeURIComponent(select.value || "derniere")}`; };
    select.addEventListener("change", updatePreview);
    updatePreview();

    /* ---------- Erreur de test ---------- */

    $("dev-throw").addEventListener("click", () => {
        setTimeout(() => { throw new Error("Erreur de test du mode développeur"); }, 0);
        setTimeout(renderErrors, 150);
        status("Une erreur de test a été provoquée : elle apparaît dans le journal ci-dessous.");
    });

    /* ---------- Données de démo ---------- */

    const DEMO_KEY = "nsiDevDemo";
    const STATS_KEY = "nsiLocalStatistics";
    const DEMO_FAVORITES = ["qwant", "codex", "python_tutor", "france_ioi", "basthon"];

    function readJSON(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
    }

    function demoStats() {
        const days = {};
        const pages = { "index.html": 0, "notebooks.html": 0, "notebook.html": 0, "jeux.html": 0, "dico.html": 0, "outils.html": 0, "statistiques.html": 0 };
        const today = new Date();
        let views = 0;
        for (let i = 0; i < 21; i++) {
            if (i % 4 === 3) continue; // quelques jours sans activité
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const seconds = 300 + Math.round(Math.random() * 2400);
            const hour = 14 + Math.floor(Math.random() * 7);
            days[key] = { seconds, actions: 5 + Math.round(Math.random() * 30), hours: { [hour]: seconds }, weekdays: { [date.getDay()]: seconds } };
            Object.keys(pages).forEach(page => { const n = Math.round(Math.random() * 4); pages[page] += n; views += n; });
        }
        const resources = {
            "Python Tutor": { title: "Python Tutor", category: "Apprendre", count: 14, lastUsed: Date.now() - 3600e3 },
            "CodEx": { title: "CodEx", category: "Apprendre", count: 9, lastUsed: Date.now() - 7200e3 },
            "ENT": { title: "ENT", category: "Cours & Lycée", count: 21, lastUsed: Date.now() - 600e3 },
            "Qwant": { title: "Qwant", category: "Recherche", count: 6, lastUsed: Date.now() - 86400e3 },
            "GitHub": { title: "GitHub", category: "Développement", count: 4, lastUsed: Date.now() - 2 * 86400e3 }
        };
        return {
            views, pages, seconds: Object.values(days).reduce((a, d) => a + d.seconds, 0), days, resources,
            recentResources: Object.values(resources).map(r => ({ title: r.title, category: r.category, at: r.lastUsed })),
            searches: 37, tools: { "Convertisseur": 12, "Table ASCII": 5 }, sessions: 24,
            firstVisit: Date.now() - 21 * 86400e3, lastVisit: Date.now(),
            notebookCreates: 4, cellsCreated: 48, pythonCells: 26, markdownCells: 12, sqlCells: 10,
            sqlRuns: 64, sqlSuccess: 51, sqlErrors: 13, pythonRuns: 120, runSuccess: 97, runErrors: 23,
            notebookUses: { "Démo — Python": 8, "Démo — SQL": 5 },
            favoriteCategories: { "Apprendre": 3, "Recherche": 1, "Développement": 1 },
            favoriteAdded: [{ title: "CodEx", at: Date.now() - 86400e3 }, { title: "Qwant", at: Date.now() - 3 * 86400e3 }]
        };
    }

    function showDemoState() {
        const demo = readJSON(DEMO_KEY, null);
        $("dev-demo-remove").disabled = !demo;
        $("dev-demo-create").disabled = !!demo;
        if (demo) $("dev-demo-status").textContent = `Données de démo actives depuis le ${new Date(demo.createdAt).toLocaleString("fr-FR")}. « Supprimer » remet tout comme avant.`;
        else $("dev-demo-status").textContent = "Ajoute des notebooks, des favoris et des statistiques fictives pour tester les pages. « Supprimer » remet tout comme avant.";
    }

    $("dev-demo-create").addEventListener("click", () => {
        if (readJSON(DEMO_KEY, null)) return;
        const notebooks = readJSON("nsiNotebooks", []);
        const demoNotebooks = [
            { id: "demo-python", name: "Démo — Python", createdAt: Date.now(), updatedAt: Date.now(), database: { source: "lycee" }, cells: [
                { type: "markdown", content: "# Notebook de démo\n\nGénéré par le mode développeur." },
                { type: "python", content: "notes = [12, 15, 9, 17]\nprint('Moyenne :', sum(notes) / len(notes))" },
                { type: "python", content: "prenom = input('Ton prénom ? ')\nprint(f'Salut {prenom} !')" }
            ] },
            { id: "demo-sql", name: "Démo — SQL", createdAt: Date.now() - 1000, updatedAt: Date.now() - 1000, database: { source: "lycee" }, cells: [
                { type: "markdown", content: "# Requêtes de démo" },
                { type: "sql", content: "SELECT c.nom, COUNT(*) AS effectif\nFROM eleves e JOIN classes c ON e.id_classe = c.id_classe\nGROUP BY c.nom;" },
                { type: "sql", content: "SELECT * FROM table_qui_nexiste_pas;" }
            ] }
        ].filter(nb => !notebooks.some(existing => existing.id === nb.id));
        const favorites = readJSON("nsiFavorites", []);
        const addedFavorites = DEMO_FAVORITES.filter(id => !favorites.includes(id));
        const demo = {
            createdAt: Date.now(),
            notebooks: demoNotebooks.map(nb => nb.id),
            favorites: addedFavorites,
            stats: localStorage.getItem(STATS_KEY)
        };
        try {
            localStorage.setItem("nsiNotebooks", JSON.stringify([...notebooks, ...demoNotebooks]));
            localStorage.setItem("nsiFavorites", JSON.stringify([...favorites, ...addedFavorites]));
            localStorage.setItem(STATS_KEY, JSON.stringify(demoStats()));
            localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
        } catch (error) {
            status("Impossible de générer les données de démo : stockage plein.");
            return;
        }
        status(`Données de démo générées : ${demoNotebooks.length} notebooks, ${addedFavorites.length} favoris et des statistiques fictives.`);
        showDemoState();
        renderStorage();
        if (typeof displayStorage === "function") displayStorage();
    });

    $("dev-demo-remove").addEventListener("click", () => {
        const demo = readJSON(DEMO_KEY, null);
        if (!demo) return;
        if (!confirm("Supprimer les données de démo ? Les notebooks et favoris de démo sont retirés et les statistiques reviennent à leur état d'avant (l'activité faite entre-temps est perdue).")) return;
        localStorage.setItem("nsiNotebooks", JSON.stringify(readJSON("nsiNotebooks", []).filter(nb => !demo.notebooks.includes(nb.id))));
        demo.notebooks.forEach(id => { localStorage.removeItem(`nsiNotebookDb:${id}`); localStorage.removeItem(`nsiNotebookDbOrigine:${id}`); });
        localStorage.setItem("nsiFavorites", JSON.stringify(readJSON("nsiFavorites", []).filter(id => !demo.favorites.includes(id))));
        if (demo.stats) localStorage.setItem(STATS_KEY, demo.stats);
        else localStorage.removeItem(STATS_KEY);
        localStorage.removeItem(DEMO_KEY);
        status("Données de démo supprimées.");
        showDemoState();
        renderStorage();
        if (typeof displayStorage === "function") displayStorage();
    });

    showDemoState();

    /* ---------- Journal des erreurs ---------- */

    const TYPES = { javascript: "JavaScript", promesse: "Promesse", ressource: "Fichier" };

    function errors() {
        return window.nsiDev ? window.nsiDev.getErrors() : [];
    }

    function renderErrors() {
        const items = errors();
        $("dev-errors-count").textContent = String(items.length);
        $("dev-errors-count").classList.toggle("has-errors", items.length > 0);
        const host = $("dev-errors-list");
        host.innerHTML = "";
        if (!items.length) {
            host.innerHTML = '<li class="dev-empty"><i class="fa-solid fa-circle-check"></i> Aucune erreur enregistrée.</li>';
            return;
        }
        items.forEach(error => {
            const li = document.createElement("li");
            const where = [error.source, error.line ? `ligne ${error.line}${error.col ? `:${error.col}` : ""}` : ""].filter(Boolean).join(" · ");
            li.innerHTML = `
                <div class="dev-error-top">
                    <span class="dev-error-type ${escapeHTML(error.type)}">${escapeHTML(TYPES[error.type] || error.type)}</span>
                    <span class="dev-error-page">${escapeHTML(error.page)}</span>
                    <span class="dev-error-time">${new Date(error.at).toLocaleString("fr-FR")}${error.count > 1 ? ` · ×${error.count}` : ""}</span>
                </div>
                <p class="dev-error-message">${escapeHTML(error.message)}</p>
                ${where ? `<p class="dev-error-where">${escapeHTML(where)}</p>` : ""}
                ${error.stack ? `<details><summary>Pile d'appels</summary><pre>${escapeHTML(error.stack)}</pre></details>` : ""}`;
            host.appendChild(li);
        });
    }

    $("dev-errors-clear").addEventListener("click", () => {
        window.nsiDev?.clearErrors();
        renderErrors();
        status("Journal des erreurs vidé.");
    });

    $("dev-errors-copy").addEventListener("click", async () => {
        const items = errors();
        if (!items.length) { status("Le journal est vide : rien à copier."); return; }
        const report = [
            `Journal des erreurs NSI Hub v${typeof NSI_HUB_VERSION !== "undefined" ? NSI_HUB_VERSION : "?"} — ${new Date().toLocaleString("fr-FR")}`,
            `Navigateur : ${navigator.userAgent}`,
            "",
            ...items.map(e => `[${new Date(e.at).toLocaleString("fr-FR")}] ${TYPES[e.type] || e.type} sur ${e.page}${e.count > 1 ? ` (×${e.count})` : ""}\n  ${e.message}${e.source ? `\n  ${e.source}${e.line ? `:${e.line}:${e.col || 0}` : ""}` : ""}`)
        ].join("\n");
        status(await copyText(report) ? "Journal copié dans le presse-papiers." : "Copie impossible.");
    });

    /* ---------- Inspecteur du stockage ---------- */

    const MAX_EDIT = 60000;

    function parseJSON(text) {
        try { return { ok: true, value: JSON.parse(text) }; } catch (_) { return { ok: false }; }
    }

    function renderStorage() {
        const query = $("dev-storage-search").value.trim().toLowerCase();
        const keys = Object.keys(localStorage).filter(key => key.startsWith("nsi")).sort();
        const shown = keys.filter(key => key.toLowerCase().includes(query));
        const total = keys.reduce((sum, key) => sum + key.length + (localStorage.getItem(key) || "").length, 0);
        $("dev-storage-count").textContent = `${keys.length} · ${size(total)}`;
        const host = $("dev-storage-list");
        const opened = new Set([...host.querySelectorAll("details[open]")].map(d => d.dataset.key));
        host.innerHTML = "";
        if (!shown.length) {
            host.innerHTML = `<p class="dev-empty">${keys.length ? "Aucune clé ne correspond." : "Aucune donnée enregistrée."}</p>`;
            return;
        }
        shown.forEach(key => {
            const value = localStorage.getItem(key) || "";
            const json = parseJSON(value);
            const kind = json.ok ? (Array.isArray(json.value) ? `tableau (${json.value.length})` : typeof json.value === "object" && json.value !== null ? "objet" : typeof json.value) : "texte";
            const details = document.createElement("details");
            details.className = "dev-key";
            details.dataset.key = key;
            details.innerHTML = `
                <summary>
                    <code class="dev-key-name">${escapeHTML(key)}</code>
                    <span class="dev-key-kind">${escapeHTML(kind)}</span>
                    <span class="dev-key-size">${size(key.length + value.length)}</span>
                    <span class="dev-key-preview">${escapeHTML(value.slice(0, 80))}</span>
                </summary>
                <div class="dev-key-body"></div>`;
            details.addEventListener("toggle", () => { if (details.open) fillEditor(details, key); });
            host.appendChild(details);
            if (opened.has(key)) details.open = true;
        });
    }

    function updateSummary(details, key) {
        const value = localStorage.getItem(key) || "";
        details.querySelector(".dev-key-size").textContent = size(key.length + value.length);
        details.querySelector(".dev-key-preview").textContent = value.slice(0, 80);
        const keys = Object.keys(localStorage).filter(k => k.startsWith("nsi"));
        const total = keys.reduce((sum, k) => sum + k.length + (localStorage.getItem(k) || "").length, 0);
        $("dev-storage-count").textContent = `${keys.length} · ${size(total)}`;
        if (typeof displayStorage === "function") displayStorage();
    }

    function fillEditor(details, key) {
        const body = details.querySelector(".dev-key-body");
        const value = localStorage.getItem(key);
        if (value === null) { renderStorage(); return; }
        const json = parseJSON(value);
        body.innerHTML = "";
        if (value.length > MAX_EDIT) {
            body.innerHTML = `<p class="dev-hint">Valeur trop grande (${size(value.length)}) pour être modifiée ici.</p>`;
        } else {
            const area = document.createElement("textarea");
            area.className = "dev-key-editor";
            area.spellcheck = false;
            area.value = json.ok && typeof json.value === "object" && json.value !== null ? JSON.stringify(json.value, null, 2) : value;
            area.rows = Math.min(18, Math.max(3, area.value.split("\n").length));
            body.appendChild(area);
        }
        const actions = document.createElement("div");
        actions.className = "dev-key-actions";
        actions.innerHTML = `
            ${value.length <= MAX_EDIT ? '<button type="button" class="setting-button small" data-act="save"><i class="fa-solid fa-floppy-disk"></i> Enregistrer</button>' : ""}
            <button type="button" class="setting-button small" data-act="copy"><i class="fa-regular fa-copy"></i> Copier</button>
            <button type="button" class="setting-button small danger" data-act="delete"><i class="fa-solid fa-trash"></i> Supprimer</button>
            <span class="dev-key-message" role="status"></span>`;
        body.appendChild(actions);
        const message = actions.querySelector(".dev-key-message");

        actions.querySelector('[data-act="save"]')?.addEventListener("click", () => {
            let text = body.querySelector("textarea").value;
            if (json.ok) {
                const parsed = parseJSON(text);
                if (!parsed.ok) { message.textContent = "JSON invalide : corrige la valeur avant d'enregistrer."; message.className = "dev-key-message error"; return; }
                text = JSON.stringify(parsed.value);
            }
            try {
                localStorage.setItem(key, text);
                message.textContent = "Enregistré.";
                message.className = "dev-key-message ok";
                updateSummary(details, key);
            } catch (_) {
                message.textContent = "Stockage plein.";
                message.className = "dev-key-message error";
            }
        });
        actions.querySelector('[data-act="copy"]').addEventListener("click", async () => {
            message.textContent = await copyText(localStorage.getItem(key) || "") ? "Copié." : "Copie impossible.";
            message.className = "dev-key-message ok";
        });
        actions.querySelector('[data-act="delete"]').addEventListener("click", () => {
            if (!confirm(`Supprimer la clé « ${key} » ?`)) return;
            localStorage.removeItem(key);
            status(`Clé « ${key} » supprimée.`);
            renderStorage();
            if (typeof displayStorage === "function") displayStorage();
        });
    }

    $("dev-storage-search").addEventListener("input", renderStorage);
    window.addEventListener("storage", () => { renderStorage(); renderErrors(); });

    renderErrors();
    renderStorage();

    if (location.hash === "#dev-mode-card" || location.hash === "#dev-errors") {
        setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
})();
