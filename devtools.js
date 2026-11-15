"use strict";

/* =========================================================
   NSI HUB — OUTILS DU MODE DÉVELOPPEUR
   Chargé dans le <head> de chaque page. Ne fait rien si le mode
   développeur est désactivé (Paramètres → Développement).
   - Journal des erreurs : erreurs JavaScript, promesses rejetées et
     fichiers introuvables, sur toutes les pages (clé nsiDevErreurs).
   - Barre dev : petite barre flottante en bas à gauche.
   ========================================================= */

(function () {
    const ERRORS_KEY = "nsiDevErreurs";
    const MAX_ERRORS = 60;

    function read(key) {
        try { return localStorage.getItem(key); } catch (_) { return null; }
    }

    function getErrors() {
        try {
            const list = JSON.parse(read(ERRORS_KEY) || "[]");
            return Array.isArray(list) ? list : [];
        } catch (_) {
            return [];
        }
    }

    function saveErrors(list) {
        try { localStorage.setItem(ERRORS_KEY, JSON.stringify(list.slice(0, MAX_ERRORS))); } catch (_) {}
    }

    function clearErrors() {
        try { localStorage.removeItem(ERRORS_KEY); } catch (_) {}
        updateBar();
    }

    function pageName() {
        return (location.pathname.split("/").pop() || "index.html") + location.search;
    }

    function logError(entry) {
        const list = getErrors();
        const item = {
            type: entry.type || "javascript",
            message: String(entry.message || "Erreur inconnue").slice(0, 500),
            source: entry.source ? String(entry.source).split("/").pop().slice(0, 120) : "",
            line: entry.line || null,
            col: entry.col || null,
            stack: entry.stack ? String(entry.stack).slice(0, 1500) : "",
            page: pageName(),
            at: Date.now(),
            count: 1
        };
        // Regrouper les erreurs identiques sur la même page
        const same = list.find(e => e.message === item.message && e.page === item.page && e.line === item.line && e.type === item.type);
        if (same) {
            same.count = (same.count || 1) + 1;
            same.at = item.at;
            list.splice(list.indexOf(same), 1);
            list.unshift(same);
        } else {
            list.unshift(item);
        }
        saveErrors(list);
        updateBar();
    }

    const enabled = read("nsiDevMode") === "true";

    window.nsiDev = { enabled, getErrors, clearErrors, logError };

    if (!enabled) return;

    /* ---------- Journal des erreurs ---------- */

    window.addEventListener("error", event => {
        const target = event.target;
        if (target && target !== window && (target.src || target.href)) {
            logError({ type: "ressource", message: `Fichier introuvable ou bloqué : ${target.src || target.href}`, source: target.src || target.href });
            return;
        }
        logError({
            message: event.message,
            source: event.filename,
            line: event.lineno,
            col: event.colno,
            stack: event.error && event.error.stack
        });
    }, true);

    window.addEventListener("unhandledrejection", event => {
        const reason = event.reason;
        logError({
            type: "promesse",
            message: `Promesse rejetée : ${reason && reason.message ? reason.message : String(reason)}`,
            stack: reason && reason.stack
        });
    });

    /* ---------- Barre dev ---------- */

    let bar = null;

    const LEVELS = { snt: "SNT", premiere: "Première", terminale: "Terminale", professeur: "Professeur" };
    const THEMES = { sombre: "Sombre", clair: "Clair", auto: "Auto" };

    function storageSize() {
        let chars = 0;
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith("nsi")) chars += key.length + (localStorage.getItem(key) || "").length;
            });
        } catch (_) {}
        return chars < 1024 * 1024 ? `${Math.round(chars / 1024)} Ko` : `${(chars / 1024 / 1024).toFixed(2).replace(".", ",")} Mo`;
    }

    function updateBar() {
        if (!bar) return;
        const count = getErrors().length;
        const badge = bar.querySelector(".nsi-devbar-errors");
        badge.textContent = String(count);
        badge.hidden = count === 0;
        const prefs = window.nsiPreferences;
        const info = {
            version: typeof NSI_HUB_VERSION !== "undefined" ? `v${NSI_HUB_VERSION}` : "?",
            page: location.pathname.split("/").pop() || "index.html",
            theme: prefs ? `${THEMES[prefs.themeChoice()]}${prefs.themeChoice() === "auto" ? ` (${prefs.resolvedTheme()})` : ""}` : "?",
            animations: prefs && prefs.animationsDisabled() ? "coupées" : "actives",
            profil: LEVELS[read("nsiLevel")] || "aucun",
            ecran: `${window.innerWidth} × ${window.innerHeight}`,
            stockage: storageSize(),
            erreurs: count ? `${count} enregistrée${count > 1 ? "s" : ""}` : "aucune"
        };
        Object.entries(info).forEach(([key, value]) => {
            const cell = bar.querySelector(`[data-info="${key}"]`);
            if (cell) cell.textContent = value;
        });
        const profileSelect = bar.querySelector("[data-dev-profile]");
        if (profileSelect) profileSelect.value = read("nsiLevel") || "";
        bar.querySelector('[data-dev="outlines"]').classList.toggle("on", document.documentElement.classList.contains("nsi-dev-outlines"));
    }

    function buildBar() {
        if (bar || sessionStorage.getItem("nsiDevBarHidden") === "true") return;
        if (sessionStorage.getItem("nsiDevOutlines") === "true") document.documentElement.classList.add("nsi-dev-outlines");

        bar = document.createElement("div");
        bar.className = "nsi-devbar";
        bar.innerHTML = `
            <button type="button" class="nsi-devbar-toggle" aria-expanded="false" title="Outils du mode développeur">
                <i class="fa-solid fa-code"></i><span>DEV</span><b class="nsi-devbar-errors" hidden>0</b>
            </button>
            <div class="nsi-devbar-panel" hidden>
                <div class="nsi-devbar-head">
                    <strong><i class="fa-solid fa-flask"></i> Mode développeur</strong>
                    <button type="button" data-dev="hide" title="Masquer la barre jusqu'à la fermeture de l'onglet"><i class="fa-solid fa-eye-slash"></i></button>
                </div>
                <dl class="nsi-devbar-info">
                    <dt>Version</dt><dd data-info="version"></dd>
                    <dt>Page</dt><dd data-info="page"></dd>
                    <dt>Thème</dt><dd data-info="theme"></dd>
                    <dt>Animations</dt><dd data-info="animations"></dd>
                    <dt>Profil</dt><dd data-info="profil"></dd>
                    <dt>Écran</dt><dd data-info="ecran"></dd>
                    <dt>Stockage</dt><dd data-info="stockage"></dd>
                    <dt>Erreurs</dt><dd data-info="erreurs"></dd>
                </dl>
                <div class="nsi-devbar-section">Affichage</div>
                <div class="nsi-devbar-actions">
                    <button type="button" data-dev="theme"><i class="fa-solid fa-circle-half-stroke"></i> Thème suivant</button>
                    <button type="button" data-dev="animations"><i class="fa-solid fa-wand-magic-sparkles"></i> Animations</button>
                    <button type="button" data-dev="outlines"><i class="fa-regular fa-square"></i> Contours</button>
                    <label class="nsi-devbar-select"><i class="fa-solid fa-user-graduate"></i>
                        <select data-dev-profile aria-label="Profil">
                            <option value="snt">SNT</option>
                            <option value="premiere">Première</option>
                            <option value="terminale">Terminale</option>
                            <option value="professeur">Professeur</option>
                        </select>
                    </label>
                </div>
                <div class="nsi-devbar-section">Tester sur l'accueil</div>
                <div class="nsi-devbar-actions">
                    <a href="index.html?devAnnonce=derniere"><i class="fa-solid fa-bullhorn"></i> Annonce</a>
                    <a href="index.html?devWelcome=1"><i class="fa-solid fa-hand-sparkles"></i> Bienvenue</a>
                    <a href="index.html?devPopup=ent"><i class="fa-solid fa-school"></i> Popup ENT</a>
                    <a href="index.html?devPopup=share"><i class="fa-solid fa-share-nodes"></i> Popup partage</a>
                    <a href="index.html?devConfetti=1"><i class="fa-solid fa-champagne-glasses"></i> Confettis</a>
                    <a href="loading.html?preview=1"><i class="fa-solid fa-spinner"></i> Chargement</a>
                </div>
                <div class="nsi-devbar-footer">
                    <button type="button" data-dev="reload"><i class="fa-solid fa-rotate-right"></i> Recharger</button>
                    <a href="parametres.html#dev-mode-card"><i class="fa-solid fa-toolbox"></i> Tous les outils</a>
                </div>
            </div>`;
        document.body.appendChild(bar);

        const toggle = bar.querySelector(".nsi-devbar-toggle");
        const panel = bar.querySelector(".nsi-devbar-panel");
        const open = value => {
            panel.hidden = !value;
            toggle.setAttribute("aria-expanded", String(value));
            sessionStorage.setItem("nsiDevBarOpen", String(value));
            if (value) updateBar();
        };
        toggle.addEventListener("click", () => open(panel.hidden));
        if (sessionStorage.getItem("nsiDevBarOpen") === "true") open(true);

        bar.querySelector('[data-dev="hide"]').addEventListener("click", () => {
            sessionStorage.setItem("nsiDevBarHidden", "true");
            bar.remove();
            bar = null;
        });
        bar.querySelector('[data-dev="theme"]').addEventListener("click", () => {
            const order = ["sombre", "clair", "auto"];
            const current = window.nsiPreferences ? window.nsiPreferences.themeChoice() : "sombre";
            localStorage.setItem("nsiTheme", order[(order.indexOf(current) + 1) % order.length]);
            window.nsiPreferences && window.nsiPreferences.apply();
            updateBar();
        });
        bar.querySelector('[data-dev="animations"]').addEventListener("click", () => {
            const off = read("nsiAnimations") === "false";
            localStorage.setItem("nsiAnimations", off ? "true" : "false");
            window.nsiPreferences && window.nsiPreferences.apply();
            updateBar();
        });
        bar.querySelector('[data-dev="outlines"]').addEventListener("click", () => {
            const on = document.documentElement.classList.toggle("nsi-dev-outlines");
            sessionStorage.setItem("nsiDevOutlines", String(on));
            updateBar();
        });
        bar.querySelector("[data-dev-profile]").addEventListener("change", event => {
            localStorage.setItem("nsiLevel", event.target.value);
            location.reload();
        });
        bar.querySelector('[data-dev="reload"]').addEventListener("click", () => location.reload());
        window.addEventListener("resize", updateBar);
        window.addEventListener("storage", updateBar);
        updateBar();
    }

    // La version (version.js) n'est pas chargée sur toutes les pages : on la charge au besoin
    function ensureVersion() {
        if (typeof NSI_HUB_VERSION !== "undefined" || document.querySelector('script[src="version.js"]')) return;
        const script = document.createElement("script");
        script.src = "version.js";
        script.onload = updateBar;
        document.head.appendChild(script);
    }

    function start() {
        ensureVersion();
        buildBar();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
})();
