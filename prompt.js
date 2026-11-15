"use strict";

/* =========================================================
   NSI HUB — PAGE DES PROMPTS
   Données : prompts-data.js (NSI_PROMPTS, NSI_PROMPT_CATEGORIES)
   ========================================================= */

(() => {
    const prompts = Array.isArray(window.NSI_PROMPTS) ? window.NSI_PROMPTS : [];
    const categories = Array.isArray(window.NSI_PROMPT_CATEGORIES) ? window.NSI_PROMPT_CATEGORIES : [];
    const list = document.getElementById("prompt-list");
    const filters = document.getElementById("prompt-filters");
    const search = document.getElementById("prompt-search");
    const count = document.getElementById("prompt-count");
    if (!list) return;

    const FAVORITES_KEY = "nsiPromptFavoris";
    const LEVELS = { snt: "SNT (Seconde)", premiere: "Première NSI", terminale: "Terminale NSI" };
    const profile = localStorage.getItem("nsiLevel");
    const values = {}; // valeurs saisies, par prompt puis par champ (gardées pendant la visite)
    let activeCategory = "tous";

    const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const normalize = value => String(value).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    function getFavorites() {
        try {
            const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (_) {
            return [];
        }
    }

    function setFavorites(ids) {
        try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); } catch (_) {}
    }

    function defaultValue(prompt, field) {
        // Le niveau est prérempli avec le profil (sauf pour les prompts des profs, où il désigne les élèves)
        if (field.id === "NIVEAU" && prompt.categorie !== "prof" && LEVELS[profile]) return LEVELS[profile];
        return "";
    }

    function fieldValue(prompt, field) {
        values[prompt.id] ||= {};
        if (values[prompt.id][field.id] === undefined) values[prompt.id][field.id] = defaultValue(prompt, field);
        return values[prompt.id][field.id];
    }

    // Texte final : chaque [CHAMP] rempli est remplacé ; les champs vides restent entre crochets
    function buildText(prompt) {
        let text = prompt.texte;
        (prompt.champs || []).forEach(field => {
            const value = fieldValue(prompt, field).trim();
            if (value) text = text.split(`[${field.id}]`).join(value);
        });
        return text;
    }

    function previewHTML(prompt) {
        return escapeHTML(buildText(prompt)).replace(/\[([^\]\n]{2,40})\]/g, '<mark class="prompt-hole">[$1]</mark>');
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_) {
            const area = document.createElement("textarea");
            area.value = text;
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand("copy");
            area.remove();
            return ok;
        }
    }

    async function copyPrompt(prompt, button) {
        const ok = await copyText(buildText(prompt));
        const original = button.innerHTML;
        button.classList.add(ok ? "copied" : "failed");
        button.innerHTML = ok ? '<i class="fa-solid fa-check"></i> Copié !' : '<i class="fa-solid fa-xmark"></i> Copie impossible';
        setTimeout(() => { button.classList.remove("copied", "failed"); button.innerHTML = original; }, 1600);
        if (ok) window.nsiTrack?.("tool", { name: "Prompts" });
    }

    /* ---------- Filtres ---------- */

    function renderFilters() {
        const favorites = getFavorites();
        const items = [
            { id: "tous", label: "Tous", icon: "fa-solid fa-layer-group", total: prompts.length },
            { id: "favoris", label: "Favoris", icon: "fa-solid fa-star", total: prompts.filter(p => favorites.includes(p.id)).length },
            ...categories.map(c => ({ ...c, total: prompts.filter(p => p.categorie === c.id).length }))
        ];
        filters.innerHTML = "";
        items.forEach(item => {
            if (item.id === "favoris" && !item.total && activeCategory !== "favoris") return;
            const button = document.createElement("button");
            button.type = "button";
            button.className = `prompt-filter${item.id === activeCategory ? " active" : ""}`;
            button.setAttribute("aria-pressed", String(item.id === activeCategory));
            button.innerHTML = `<i class="${item.icon}"></i> ${escapeHTML(item.label)} <span>${item.total}</span>`;
            button.addEventListener("click", () => {
                activeCategory = item.id;
                renderFilters();
                renderList();
            });
            filters.appendChild(button);
        });
    }

    /* ---------- Liste ---------- */

    function matches(prompt, query) {
        if (!query) return true;
        const category = categories.find(c => c.id === prompt.categorie);
        const haystack = normalize([prompt.titre, prompt.description, prompt.texte, category?.label].join(" "));
        return normalize(query).split(/\s+/).every(word => haystack.includes(word));
    }

    function renderList() {
        const favorites = getFavorites();
        const query = search.value.trim();
        const shown = prompts.filter(prompt =>
            (activeCategory === "tous" || (activeCategory === "favoris" ? favorites.includes(prompt.id) : prompt.categorie === activeCategory)) &&
            matches(prompt, query)
        );
        count.textContent = `${shown.length} prompt${shown.length > 1 ? "s" : ""}`;
        list.innerHTML = "";

        if (!shown.length) {
            list.innerHTML = `<div class="prompt-empty"><i class="fa-regular fa-face-meh"></i><p>${activeCategory === "favoris" && !query ? "Aucun favori pour l'instant : clique sur l'étoile d'un prompt pour le retrouver ici." : "Aucun prompt ne correspond à ta recherche."}</p></div>`;
            return;
        }

        shown.forEach(prompt => list.appendChild(renderCard(prompt, favorites.includes(prompt.id))));
    }

    function renderCard(prompt, favorite) {
        const category = categories.find(c => c.id === prompt.categorie);
        const card = document.createElement("article");
        card.className = "prompt-card";
        card.id = `prompt-${prompt.id}`;
        card.innerHTML = `
            <div class="prompt-card-header">
                <div class="prompt-card-title">
                    <h2><span class="prompt-emoji" aria-hidden="true">${prompt.emoji || "💬"}</span> ${escapeHTML(prompt.titre)}</h2>
                    <p>${escapeHTML(prompt.description)}</p>
                    ${category ? `<span class="prompt-tag"><i class="${category.icon}"></i> ${escapeHTML(category.label)}</span>` : ""}
                </div>
                <div class="prompt-card-actions">
                    <button type="button" class="prompt-icon-button prompt-favorite${favorite ? " active" : ""}" aria-pressed="${favorite}" aria-label="${favorite ? "Retirer des favoris" : "Ajouter aux favoris"}" title="${favorite ? "Retirer des favoris" : "Ajouter aux favoris"}">
                        <i class="${favorite ? "fa-solid" : "fa-regular"} fa-star"></i>
                    </button>
                    <button type="button" class="prompt-open" aria-expanded="false">
                        <i class="fa-solid fa-pen-to-square"></i> Utiliser
                    </button>
                    <button type="button" class="copy-button" title="Copier le prompt tel quel">
                        <i class="fa-regular fa-copy"></i> Copier
                    </button>
                </div>
            </div>
            <div class="prompt-body" hidden></div>`;

        const body = card.querySelector(".prompt-body");
        const open = card.querySelector(".prompt-open");

        card.querySelector(".copy-button").addEventListener("click", event => copyPrompt(prompt, event.currentTarget));

        card.querySelector(".prompt-favorite").addEventListener("click", event => {
            const button = event.currentTarget;
            const favorites = getFavorites();
            const nowFavorite = !favorites.includes(prompt.id);
            setFavorites(nowFavorite ? [...favorites, prompt.id] : favorites.filter(id => id !== prompt.id));
            button.classList.toggle("active", nowFavorite);
            button.setAttribute("aria-pressed", String(nowFavorite));
            button.title = button.ariaLabel = nowFavorite ? "Retirer des favoris" : "Ajouter aux favoris";
            button.querySelector("i").className = `${nowFavorite ? "fa-solid" : "fa-regular"} fa-star`;
            renderFilters();
            if (activeCategory === "favoris" && !nowFavorite) renderList();
        });

        open.addEventListener("click", () => {
            const expanded = body.hidden;
            body.hidden = !expanded;
            open.setAttribute("aria-expanded", String(expanded));
            card.classList.toggle("open", expanded);
            open.innerHTML = expanded ? '<i class="fa-solid fa-chevron-up"></i> Fermer' : '<i class="fa-solid fa-pen-to-square"></i> Utiliser';
            if (expanded && !body.childElementCount) fillBody(prompt, body);
            if (expanded) body.querySelector("input, textarea")?.focus();
        });

        return card;
    }

    function fillBody(prompt, body) {
        const fields = prompt.champs || [];
        body.innerHTML = `
            ${fields.length ? '<p class="prompt-help">Remplis les cases : elles sont insérées dans le prompt. Tu peux aussi les laisser vides et compléter directement dans la conversation avec l\'IA.</p><div class="prompt-fields"></div>' : ""}
            <div class="prompt-preview-head">
                <span>Aperçu du prompt</span>
                <button type="button" class="copy-button primary"><i class="fa-regular fa-copy"></i> Copier le prompt</button>
            </div>
            <pre class="prompt-preview"></pre>`;
        const preview = body.querySelector(".prompt-preview");
        const host = body.querySelector(".prompt-fields");
        const refresh = () => { preview.innerHTML = previewHTML(prompt); };

        fields.forEach(field => {
            const label = document.createElement("label");
            label.className = `prompt-field${field.multi ? " wide" : ""}`;
            const name = document.createElement("span");
            name.textContent = field.label;
            const input = document.createElement(field.multi ? "textarea" : "input");
            if (field.multi) { input.rows = 4; input.spellcheck = false; }
            else input.type = "text";
            input.value = fieldValue(prompt, field);
            input.placeholder = field.exemple ? `Ex. : ${field.exemple}` : "";
            input.addEventListener("input", () => {
                values[prompt.id][field.id] = input.value;
                refresh();
            });
            label.append(name, input);
            host.appendChild(label);
        });

        body.querySelector(".copy-button.primary").addEventListener("click", event => copyPrompt(prompt, event.currentTarget));
        refresh();
    }

    search.addEventListener("input", renderList);
    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            search.focus();
        }
    });

    renderFilters();
    renderList();

    // Lien direct vers un prompt : prompt.html#prompt-<id>
    function openFromHash() {
        if (!location.hash.startsWith("#prompt-")) return;
        let card = document.getElementById(location.hash.slice(1));
        if (!card && (activeCategory !== "tous" || search.value)) {
            activeCategory = "tous";
            search.value = "";
            renderFilters();
            renderList();
            card = document.getElementById(location.hash.slice(1));
        }
        if (!card) return;
        const open = card.querySelector(".prompt-open");
        if (open && open.getAttribute("aria-expanded") !== "true") open.click();
        setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }

    window.addEventListener("hashchange", openFromHash);
    openFromHash();
})();
