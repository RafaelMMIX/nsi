"use strict";

/* =========================================================
   NSI HUB — LISTE DES NOTEBOOKS
   ========================================================= */

const STORAGE_KEY = "nsiNotebooks";
const DB_PREFIX = "nsiNotebookDb:";
const DB_ORIGIN_PREFIX = "nsiNotebookDbOrigine:";

const notebooksList = document.getElementById("notebooks-list");
const dialog = document.getElementById("new-dialog");
const nameInput = document.getElementById("new-name");
const templateGrid = document.getElementById("template-grid");
const searchInput = document.getElementById("notebook-search");
const templates = Array.isArray(window.NSI_MODELES) && window.NSI_MODELES.length
    ? window.NSI_MODELES
    : [{ id: "vide", titre: "Notebook vide", description: "", icone: "fa-regular fa-file", base: "lycee", cellules: [{ type: "markdown", content: "# Mon notebook\n\nCommence à écrire ici." }, { type: "python", content: "print('Bonjour NSI !')" }] }];
let selectedTemplate = templates[0].id;

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function newId() {
    return globalThis.crypto?.randomUUID ? crypto.randomUUID() : `notebook-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getNotebooks() {
    try {
        const notebooks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(notebooks) ? notebooks : [];
    } catch (error) {
        console.error("Impossible de charger les notebooks :", error);
        return [];
    }
}

function saveNotebooks(notebooks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
        return true;
    } catch (error) {
        alert("Impossible d'enregistrer : le stockage du navigateur est plein. Supprime ou exporte d'anciens notebooks.");
        return false;
    }
}

function addNotebook(notebook) {
    const notebooks = getNotebooks();
    notebooks.push(notebook);
    if (!saveNotebooks(notebooks)) return false;
    window.nsiTrack?.("notebookCreated");
    return true;
}

function openNotebook(id) {
    window.location.href = `notebook.html?id=${encodeURIComponent(id)}`;
}

/* ---------- Création ---------- */

function renderTemplates() {
    templateGrid.innerHTML = "";
    templates.forEach(template => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "nbl-template";
        option.setAttribute("role", "radio");
        option.dataset.id = template.id;
        option.innerHTML = `
            <i class="${escapeHTML(template.icone || "fa-solid fa-book")}"></i>
            <span class="nbl-template-title">${escapeHTML(template.titre)}</span>
            <span class="nbl-template-desc">${escapeHTML(template.description || "")}</span>`;
        option.addEventListener("click", () => selectTemplate(template.id));
        option.addEventListener("dblclick", () => { selectTemplate(template.id); createFromDialog(); });
        templateGrid.appendChild(option);
    });
    selectTemplate(selectedTemplate);
}

function selectTemplate(id) {
    const previous = templates.find(t => t.id === selectedTemplate);
    selectedTemplate = id;
    templateGrid.querySelectorAll(".nbl-template").forEach(option => {
        const active = option.dataset.id === id;
        option.classList.toggle("selected", active);
        option.setAttribute("aria-checked", String(active));
    });
    const template = templates.find(t => t.id === id);
    // Propose le titre du modèle si le nom n'a pas été personnalisé
    if (template && (!nameInput.value.trim() || nameInput.value === previous?.titre || nameInput.value === "Mon notebook")) {
        nameInput.value = template.id === "vide" ? "" : template.titre;
    }
}

function openDialog() {
    nameInput.value = "";
    selectedTemplate = templates[0].id;
    renderTemplates();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    nameInput.focus();
}

function closeDialog() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
}

function createFromDialog() {
    const template = templates.find(t => t.id === selectedTemplate) || templates[0];
    const name = nameInput.value.trim() || (template.id === "vide" ? "Mon notebook" : template.titre);
    const notebook = {
        id: newId(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        template: template.id,
        database: { source: template.base || "lycee" },
        cells: template.cellules.map(cell => ({ type: cell.type, content: cell.content }))
    };
    if (!addNotebook(notebook)) return;
    closeDialog();
    openNotebook(notebook.id);
}

/* ---------- Import .ipynb ---------- */

function cellSource(source) {
    return Array.isArray(source) ? source.join("") : String(source || "");
}

function notebookFromIpynb(data, fileName) {
    if (!data || !Array.isArray(data.cells)) throw new Error("ce fichier ne ressemble pas à un notebook Jupyter.");
    const cells = data.cells.map(cell => {
        const content = cellSource(cell.source).replace(/\s+$/, "");
        if (cell.cell_type === "markdown" || cell.cell_type === "raw") return { type: "markdown", content };
        const sqlMagic = content.match(/^%%sql[^\n]*\n?/);
        if (sqlMagic) return { type: "sql", content: content.slice(sqlMagic[0].length) };
        return { type: "python", content };
    }).filter(cell => cell.content.trim() || cell.type !== "markdown");
    const name = String(fileName || "Notebook importé").replace(/\.ipynb$/i, "").trim() || "Notebook importé";
    const database = data.metadata?.nsihub?.database;
    return {
        id: newId(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        database: database && ["lycee", "vide"].includes(database.source) ? { source: database.source } : { source: "lycee" },
        cells: cells.length ? cells : [{ type: "python", content: "" }]
    };
}

async function importFiles(files) {
    let lastId = null;
    let imported = 0;
    for (const file of files) {
        try {
            const notebook = notebookFromIpynb(JSON.parse(await file.text()), file.name);
            if (addNotebook(notebook)) { lastId = notebook.id; imported++; }
        } catch (error) {
            alert(`Impossible d'importer « ${file.name} » : ${error.message}`);
        }
    }
    if (imported === 1) openNotebook(lastId);
    else if (imported > 1) renderNotebooks();
}

/* ---------- Actions sur un notebook ---------- */

function renameNotebook(id) {
    const notebooks = getNotebooks();
    const notebook = notebooks.find(item => item.id === id);
    if (!notebook) return;
    const name = prompt("Nouveau nom du notebook :", notebook.name);
    if (!name || !name.trim()) return;
    notebook.name = name.trim().slice(0, 80);
    notebook.updatedAt = Date.now();
    saveNotebooks(notebooks);
    renderNotebooks();
}

function duplicateNotebook(id) {
    const notebooks = getNotebooks();
    const notebook = notebooks.find(item => item.id === id);
    if (!notebook) return;
    const copy = JSON.parse(JSON.stringify(notebook));
    copy.id = newId();
    copy.name = `${notebook.name} (copie)`;
    copy.createdAt = copy.updatedAt = Date.now();
    notebooks.push(copy);
    if (!saveNotebooks(notebooks)) return;
    try {
        const db = localStorage.getItem(DB_PREFIX + id);
        if (db) localStorage.setItem(DB_PREFIX + copy.id, db);
        const origin = localStorage.getItem(DB_ORIGIN_PREFIX + id);
        if (origin) localStorage.setItem(DB_ORIGIN_PREFIX + copy.id, origin);
    } catch (error) {
        alert("Le notebook a été copié, mais pas sa base de données (stockage plein). La copie repartira de la base d'origine.");
    }
    window.nsiTrack?.("notebookCreated");
    renderNotebooks();
}

function deleteNotebook(id) {
    const notebooks = getNotebooks();
    const notebook = notebooks.find(item => item.id === id);
    if (!notebook) return;
    if (!confirm(`Supprimer « ${notebook.name} » ? Cette action est définitive.`)) return;
    saveNotebooks(notebooks.filter(item => item.id !== id));
    try {
        localStorage.removeItem(DB_PREFIX + id);
        localStorage.removeItem(DB_ORIGIN_PREFIX + id);
    } catch (_) {}
    renderNotebooks();
}

/* ---------- Affichage ---------- */

function cellSummary(cells = []) {
    const counts = { python: 0, sql: 0, markdown: 0 };
    cells.forEach(cell => { if (counts[cell.type] !== undefined) counts[cell.type]++; });
    return [
        counts.python ? `<span class="nbl-badge python"><i class="fa-brands fa-python"></i> ${counts.python}</span>` : "",
        counts.sql ? `<span class="nbl-badge sql"><i class="fa-solid fa-database"></i> ${counts.sql}</span>` : "",
        counts.markdown ? `<span class="nbl-badge markdown"><i class="fa-solid fa-paragraph"></i> ${counts.markdown}</span>` : ""
    ].join("");
}

function renderNotebooks() {
    const query = searchInput.value.trim().toLowerCase();
    const notebooks = getNotebooks().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const shown = notebooks.filter(notebook => !query || String(notebook.name).toLowerCase().includes(query));
    notebooksList.innerHTML = "";

    if (!notebooks.length) {
        notebooksList.innerHTML = `
            <div class="nb-empty">
                <i class="fa-solid fa-book-open"></i>
                <h2>Aucun notebook</h2>
                <p>Crée ton premier notebook : choisis « Découvrir les notebooks » pour faire le tour en 5 minutes.</p>
                <button type="button" class="nb-btn primary" id="empty-create"><i class="fa-solid fa-plus"></i> Nouveau notebook</button>
            </div>`;
        document.getElementById("empty-create").addEventListener("click", openDialog);
        return;
    }
    if (!shown.length) {
        notebooksList.innerHTML = '<p class="nb-muted">Aucun notebook ne correspond à ta recherche.</p>';
        return;
    }

    shown.forEach(notebook => {
        const card = document.createElement("article");
        card.className = "nbl-card";
        const date = new Date(notebook.updatedAt || notebook.createdAt || Date.now()).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
        card.innerHTML = `
            <a class="nbl-card-main" href="notebook.html?id=${encodeURIComponent(notebook.id)}">
                <span class="nbl-card-icon"><i class="fa-solid fa-book-open"></i></span>
                <span class="nbl-card-text">
                    <strong>${escapeHTML(notebook.name)}</strong>
                    <span class="nbl-card-meta">Modifié le ${date}</span>
                    <span class="nbl-badges">${cellSummary(notebook.cells)}</span>
                </span>
            </a>
            <div class="nbl-card-actions">
                <button type="button" data-action="rename" title="Renommer" aria-label="Renommer ${escapeHTML(notebook.name)}"><i class="fa-solid fa-pen"></i></button>
                <button type="button" data-action="duplicate" title="Dupliquer" aria-label="Dupliquer ${escapeHTML(notebook.name)}"><i class="fa-regular fa-copy"></i></button>
                <button type="button" data-action="delete" title="Supprimer" aria-label="Supprimer ${escapeHTML(notebook.name)}"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        card.querySelector('[data-action="rename"]').addEventListener("click", () => renameNotebook(notebook.id));
        card.querySelector('[data-action="duplicate"]').addEventListener("click", () => duplicateNotebook(notebook.id));
        card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteNotebook(notebook.id));
        notebooksList.appendChild(card);
    });
}

/* ---------- Événements ---------- */

document.getElementById("new-notebook").addEventListener("click", openDialog);
document.getElementById("import-ipynb").addEventListener("click", () => document.getElementById("ipynb-file").click());
document.getElementById("ipynb-file").addEventListener("change", event => {
    importFiles([...event.target.files]);
    event.target.value = "";
});
document.getElementById("new-form").addEventListener("submit", event => {
    event.preventDefault();
    createFromDialog();
});
dialog.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", closeDialog));
dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
searchInput.addEventListener("input", renderNotebooks);

// Glisser-déposer un .ipynb sur la page
document.addEventListener("dragover", event => { if ([...event.dataTransfer.items].some(item => item.kind === "file")) event.preventDefault(); });
document.addEventListener("drop", event => {
    const files = [...event.dataTransfer.files].filter(file => /\.ipynb$/i.test(file.name));
    if (!files.length) return;
    event.preventDefault();
    importFiles(files);
});

renderNotebooks();
