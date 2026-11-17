"use strict";

/* =========================================================
   NSI HUB — NOTEBOOK (Python, SQL et texte)
   - Python : Pyodide (chargé à la première exécution)
   - SQL    : SQLite via sql.js, une base par notebook
   - Texte  : Markdown (marked + DOMPurify)
   - Carte mentale : éditeur visuel (notebook-mindmap.js), JSON dans la cellule
   Tout est enregistré dans le localStorage du navigateur.
   ========================================================= */

const STORAGE_KEY = "nsiNotebooks";
const LEGACY_STORAGE_KEY = "nsiNotebook";
const DB_PREFIX = "nsiNotebookDb:";            // base actuelle (modifiée par l'élève)
const DB_ORIGIN_PREFIX = "nsiNotebookDbOrigine:"; // fichier importé d'origine (pour Réinitialiser)
const SQLJS_URL = "https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/";
const MAX_ROWS = 500;
const MAX_IMPORT_BYTES = 3 * 1024 * 1024;
const CELL_TYPES = {
    python: { label: "Python", icon: "fa-brands fa-python", mode: "python", placeholder: "Écris ton code Python ici…" },
    sql: { label: "SQL", icon: "fa-solid fa-database", mode: "text/x-sqlite", placeholder: "Écris ta requête SQL ici… (ex. SELECT * FROM eleves;)" },
    markdown: { label: "Texte", icon: "fa-solid fa-paragraph", mode: "markdown", placeholder: "Écris ton texte ici (Markdown : # Titre, **gras**, *italique*, `code`, - liste)…" },
    mindmap: { label: "Carte mentale", icon: "fa-solid fa-diagram-project", mode: null, placeholder: "" }
};

// Cellules qui ne s'exécutent pas (pas de numéro d'exécution)
const isStatic = type => type === "markdown" || type === "mindmap";

const notebookId = new URLSearchParams(window.location.search).get("id");
const $ = selector => document.querySelector(selector);
const cellsContainer = $("#cells");
const saveStatus = $("#save-status");

const state = {
    notebook: null,
    cells: [],
    activeCell: null,
    executionCount: 0,
    queue: Promise.resolve(),
    saveTimer: null,
    // Python
    pyodide: null,
    pyLoading: null,
    pyNamespace: null,
    pyOutput: null,          // fonction d'écriture vers la cellule en cours
    pyLine: "",              // ligne en cours (pour afficher la question de input())
    pyFileVersion: -1,       // version de la base copiée dans le système de fichiers Python
    pyFileBytes: null,       // contenu copié (pour détecter les modifications faites par sqlite3)
    // SQL
    SQL: null,
    sqlLoading: null,
    db: null,
    dbVersion: 0,
    dbSaveTimer: null,
    tables: {}
};

/* =========================================================
   OUTILS
   ========================================================= */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
}

function toast(message, kind = "info") {
    const box = el("div", `nb-toast ${kind}`, message);
    $("#nb-toasts").appendChild(box);
    setTimeout(() => box.classList.add("leaving"), 3200);
    setTimeout(() => box.remove(), 3700);
}

function downloadFile(filename, content, type) {
    const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(binary);
}

function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function safeFileName(name, fallback = "notebook") {
    return String(name || "").replace(/[<>:"/\\|?*\x00-\x1F]/g, "-").trim() || fallback;
}

function setPill(id, text, kind = "") {
    const pill = document.getElementById(id);
    if (!pill) return;
    pill.className = `nb-pill ${kind}`;
    pill.innerHTML = pill.innerHTML.replace(/<\/i>.*$/s, `</i> ${escapeHTML(text)}`);
}

/* =========================================================
   STOCKAGE DES NOTEBOOKS
   ========================================================= */

function getNotebooks() {
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(value) ? value : [];
    } catch (error) {
        console.error("Impossible de lire les notebooks :", error);
        return [];
    }
}

function serializeCells() {
    return state.cells.map(cell => ({ type: cell.type, content: cell.getValue() }));
}

function saveNow() {
    clearTimeout(state.saveTimer);
    if (!state.notebook) return;
    const notebooks = getNotebooks();
    const index = notebooks.findIndex(item => item.id === notebookId);
    if (index < 0) return;
    notebooks[index].cells = serializeCells();
    notebooks[index].name = state.notebook.name;
    notebooks[index].database = state.notebook.database;
    notebooks[index].updatedAt = Date.now();
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
        saveStatus.innerHTML = '<i class="fa-solid fa-check"></i> Enregistré';
        saveStatus.classList.remove("error");
    } catch (error) {
        console.error("Impossible d'enregistrer le notebook :", error);
        saveStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Enregistrement impossible (stockage plein)';
        saveStatus.classList.add("error");
    }
}

function scheduleSave() {
    saveStatus.innerHTML = '<i class="fa-solid fa-pen"></i> Modification…';
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(saveNow, 500);
}

/* =========================================================
   CELLULES
   ========================================================= */

function createEditor(cell, host, content) {
    const type = CELL_TYPES[cell.type];
    if (cell.type === "mindmap" && window.NsiMindMap) {
        return window.NsiMindMap.create(host, content, {
            onChange: scheduleSave,
            onFocus: () => setActive(cell)
        });
    }
    const runKeys = {
        "Ctrl-Enter": () => runCell(cell),
        "Cmd-Enter": () => runCell(cell),
        "Shift-Enter": () => runCell(cell, { next: true }),
        "Alt-Enter": () => runCell(cell, { insert: true }),
        "Ctrl-S": () => { saveNow(); toast("Notebook enregistré."); },
        "Cmd-S": () => { saveNow(); toast("Notebook enregistré."); }
    };

    if (window.CodeMirror && type.mode) {
        const editor = window.CodeMirror(host, {
            value: content,
            mode: type.mode,
            theme: "nsi",
            lineNumbers: cell.type !== "markdown",
            lineWrapping: cell.type === "markdown",
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            matchBrackets: true,
            autoCloseBrackets: cell.type !== "markdown",
            viewportMargin: Infinity,
            placeholder: type.placeholder,
            extraKeys: {
                ...runKeys,
                "Ctrl-Space": "autocomplete",
                "Ctrl-/": "toggleComment",
                "Cmd-/": "toggleComment",
                Tab: cm => cm.somethingSelected() ? cm.indentSelection("add") : cm.replaceSelection(" ".repeat(cm.getOption("indentUnit")), "end"),
                "Shift-Tab": cm => cm.indentSelection("subtract")
            },
            hintOptions: cell.type === "sql" ? { tables: state.tables, completeSingle: false } : { completeSingle: false }
        });
        if (cell.type === "python") editor.setOption("hintOptions", { hint: window.CodeMirror.hint.anyword, completeSingle: false });
        editor.on("change", () => { clearErrorLine(cell); scheduleSave(); });
        editor.on("focus", () => setActive(cell));
        return {
            getValue: () => editor.getValue(),
            setValue: value => editor.setValue(value),
            focus: () => { editor.focus(); editor.setCursor(editor.lineCount(), 0); },
            refresh: () => editor.refresh(),
            markLine: line => { if (line >= 1 && line <= editor.lineCount()) cell.errorLine = editor.addLineClass(line - 1, "background", "nb-line-error"); },
            unmarkLine: handle => editor.removeLineClass(handle, "background", "nb-line-error"),
            raw: editor
        };
    }

    // Repli sans CodeMirror (CDN inaccessible) : zone de texte simple
    const area = el("textarea", "nb-fallback-editor");
    area.value = content;
    area.placeholder = type.placeholder;
    area.spellcheck = false;
    area.rows = Math.max(3, content.split("\n").length);
    area.addEventListener("input", () => { area.rows = Math.max(3, area.value.split("\n").length); scheduleSave(); });
    area.addEventListener("focus", () => setActive(cell));
    area.addEventListener("keydown", event => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); runCell(cell); }
        else if (event.key === "Enter" && event.shiftKey) { event.preventDefault(); runCell(cell, { next: true }); }
        else if (event.key === "Enter" && event.altKey) { event.preventDefault(); runCell(cell, { insert: true }); }
        else if (event.key === "Tab") {
            event.preventDefault();
            const { selectionStart: s, selectionEnd: e } = area;
            area.setRangeText("    ", s, e, "end");
        }
    });
    host.appendChild(area);
    return {
        getValue: () => area.value,
        setValue: value => { area.value = value; },
        focus: () => area.focus(),
        refresh: () => {},
        markLine: () => {},
        unmarkLine: () => {},
        raw: null
    };
}

function buildCell(type, content = "") {
    if (!CELL_TYPES[type]) type = "python";
    const info = CELL_TYPES[type];
    const cell = { type, element: null, editor: null, output: null, errorLine: null };

    const root = el("section", "nb-cell");
    root.dataset.type = type;
    root.innerHTML = `
        <div class="nb-gutter">
            <span class="nb-count" title="Ordre d'exécution">[ ]</span>
            <button type="button" class="nb-run" title="Exécuter (Ctrl+Entrée)" aria-label="Exécuter la cellule"><i class="fa-solid fa-play"></i></button>
        </div>
        <div class="nb-main">
            <div class="nb-bar">
                <label class="nb-type"><i class="${info.icon}"></i>
                    <select aria-label="Type de cellule">
                        <option value="python">Python</option>
                        <option value="sql">SQL</option>
                        <option value="markdown">Texte</option>
                        <option value="mindmap">Carte mentale</option>
                    </select>
                </label>
                <div class="nb-actions">
                    <button type="button" data-action="up" title="Monter" aria-label="Monter la cellule"><i class="fa-solid fa-arrow-up"></i></button>
                    <button type="button" data-action="down" title="Descendre" aria-label="Descendre la cellule"><i class="fa-solid fa-arrow-down"></i></button>
                    <button type="button" data-action="duplicate" title="Dupliquer" aria-label="Dupliquer la cellule"><i class="fa-regular fa-copy"></i></button>
                    <button type="button" data-action="delete" title="Supprimer" aria-label="Supprimer la cellule"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="nb-editor"></div>
            <div class="nb-rendered markdown-body" hidden></div>
            <div class="nb-output" hidden aria-live="polite"></div>
        </div>
        <div class="nb-insert" aria-label="Insérer une cellule ici">
            <button type="button" data-insert="python"><i class="fa-brands fa-python"></i> Python</button>
            <button type="button" data-insert="sql"><i class="fa-solid fa-database"></i> SQL</button>
            <button type="button" data-insert="markdown"><i class="fa-solid fa-paragraph"></i> Texte</button>
            <button type="button" data-insert="mindmap"><i class="fa-solid fa-diagram-project"></i> Carte mentale</button>
        </div>`;

    cell.element = root;
    cell.output = root.querySelector(".nb-output");
    cell.rendered = root.querySelector(".nb-rendered");
    cell.countLabel = root.querySelector(".nb-count");
    cell.editor = createEditor(cell, root.querySelector(".nb-editor"), content);
    cell.getValue = () => cell.editor.getValue();

    const select = root.querySelector(".nb-type select");
    select.value = type;
    select.addEventListener("change", () => changeType(cell, select.value));

    root.querySelector(".nb-run").addEventListener("click", () => runCell(cell));
    root.querySelector('[data-action="up"]').addEventListener("click", () => moveCell(cell, -1));
    root.querySelector('[data-action="down"]').addEventListener("click", () => moveCell(cell, 1));
    root.querySelector('[data-action="duplicate"]').addEventListener("click", () => {
        const copy = insertCell(cell.type, cell.getValue(), cell);
        if (cell.type === "markdown" && !cell.rendered.hidden) renderMarkdown(copy);
    });
    root.querySelector('[data-action="delete"]').addEventListener("click", () => deleteCell(cell));
    root.querySelectorAll("[data-insert]").forEach(button => button.addEventListener("click", () => {
        const added = insertCell(button.dataset.insert, "", cell);
        added.editor.focus();
    }));
    root.addEventListener("mousedown", () => setActive(cell));
    cell.rendered.addEventListener("dblclick", () => editMarkdown(cell));

    return cell;
}

function insertCell(type, content = "", after = null, { track = true } = {}) {
    const cell = buildCell(type, content);
    const index = after ? state.cells.indexOf(after) + 1 : state.cells.length;
    state.cells.splice(index, 0, cell);
    const reference = state.cells[index + 1]?.element || null;
    cellsContainer.insertBefore(cell.element, reference);
    cell.editor.refresh();
    if (track) {
        window.nsiTrack?.("cellCreated", { type });
        scheduleSave();
    }
    return cell;
}

function convertContent(content, from, to) {
    const map = window.NsiMindMap;
    if (!map || from === to) return content;
    if (from === "mindmap") return map.toMarkdown(content);
    if (to === "mindmap") {
        const title = state.notebook?.name || "Sujet central";
        return JSON.stringify(map.fromText(content, title));
    }
    return content;
}

function changeType(cell, type) {
    const content = convertContent(cell.getValue(), cell.type, type);
    const replacement = buildCell(type, content);
    const index = state.cells.indexOf(cell);
    state.cells[index] = replacement;
    cell.element.replaceWith(replacement.element);
    replacement.editor.refresh();
    replacement.editor.focus();
    if (type === "markdown" && cell.type === "mindmap") renderMarkdown(replacement);
    scheduleSave();
}

function moveCell(cell, direction) {
    const index = state.cells.indexOf(cell);
    const target = index + direction;
    if (target < 0 || target >= state.cells.length) return;
    state.cells.splice(index, 1);
    state.cells.splice(target, 0, cell);
    const reference = direction < 0 ? state.cells[target + 1].element : state.cells[target + 1]?.element || null;
    cellsContainer.insertBefore(cell.element, reference);
    cell.editor.refresh();
    scheduleSave();
}

function deleteCell(cell) {
    const content = cell.type === "mindmap" && window.NsiMindMap
        ? (window.NsiMindMap.normalize(cell.getValue()).root.children.length ? "carte" : "")
        : cell.getValue();
    if (content.trim() && !confirm("Supprimer cette cellule ?")) return;
    const index = state.cells.indexOf(cell);
    state.cells.splice(index, 1);
    cell.element.remove();
    if (!state.cells.length) insertCell("python");
    scheduleSave();
}

function setActive(cell) {
    if (state.activeCell === cell) return;
    state.activeCell?.element.classList.remove("active");
    state.activeCell = cell;
    cell.element.classList.add("active");
}

function clearErrorLine(cell) {
    if (cell.errorLine) {
        cell.editor.unmarkLine(cell.errorLine);
        cell.errorLine = null;
    }
}

function setCount(cell, value) {
    cell.countLabel.textContent = `[${value}]`;
}

/* =========================================================
   TEXTE (MARKDOWN)
   ========================================================= */

function markdownToHTML(source) {
    if (window.marked && window.DOMPurify) {
        const html = window.marked.parse(source, { breaks: true, gfm: true });
        return window.DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
    }
    // Repli minimal si les bibliothèques ne sont pas chargées
    return escapeHTML(source)
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");
}

function renderMarkdown(cell) {
    const source = cell.getValue();
    cell.rendered.innerHTML = source.trim()
        ? markdownToHTML(source)
        : '<p class="nb-muted">Cellule de texte vide. Double-clique pour écrire.</p>';
    cell.rendered.querySelectorAll("a[href]").forEach(link => { link.target = "_blank"; link.rel = "noopener"; });
    cell.rendered.hidden = false;
    cell.element.classList.add("rendered");
}

function editMarkdown(cell) {
    cell.rendered.hidden = true;
    cell.element.classList.remove("rendered");
    cell.editor.refresh();
    cell.editor.focus();
}

/* =========================================================
   EXÉCUTION
   ========================================================= */

function runCell(cell, { next = false, insert = false } = {}) {
    if (!state.cells.includes(cell)) return Promise.resolve(true);
    if (!isStatic(cell.type)) setCount(cell, "*");
    const job = state.queue.then(() => executeCell(cell));
    state.queue = job.catch(() => false);

    if (next || insert) {
        const index = state.cells.indexOf(cell);
        let target = state.cells[index + 1];
        if (insert || !target) target = insertCell(isStatic(cell.type) ? "python" : cell.type, "", cell);
        if (target.type === "markdown" && !target.rendered.hidden) setActive(target);
        else target.editor.focus();
        setActive(target);
    }
    return job;
}

async function executeCell(cell) {
    if (!state.cells.includes(cell)) return true;
    if (cell.type === "markdown") { renderMarkdown(cell); return true; }
    if (cell.type === "mindmap") return true;
    clearErrorLine(cell);
    cell.element.classList.add("running");
    try {
        return cell.type === "sql" ? await runSql(cell) : await runPython(cell);
    } finally {
        cell.element.classList.remove("running");
    }
}

async function runAll() {
    const button = $("#run-all");
    button.disabled = true;
    try {
        for (const cell of [...state.cells]) {
            const ok = await runCell(cell);
            if (ok === false) {
                cell.element.scrollIntoView({ behavior: "smooth", block: "center" });
                toast("Exécution arrêtée : une cellule contient une erreur.", "error");
                break;
            }
        }
    } finally {
        button.disabled = false;
    }
}

function resetOutput(cell) {
    cell.output.innerHTML = "";
    cell.output.hidden = true;
}

function showOutput(cell) {
    cell.output.hidden = false;
}

function renderError(cell, { titre, explication, astuce, ligne, original, kind }) {
    const box = el("div", "nb-error");
    box.innerHTML = `
        <div class="nb-error-title"><i class="fa-solid fa-circle-exclamation"></i> ${escapeHTML(titre)}${ligne ? ` <span class="nb-error-line">ligne ${ligne}</span>` : ""}</div>
        ${explication ? `<p>${explication}</p>` : ""}
        ${astuce ? `<p class="nb-error-tip"><i class="fa-regular fa-lightbulb"></i> ${astuce}</p>` : ""}
        ${original ? `<details><summary>Message d'origine (${escapeHTML(kind)})</summary><pre>${escapeHTML(original)}</pre></details>` : ""}`;
    cell.output.appendChild(box);
    showOutput(cell);
    if (ligne) cell.editor.markLine(ligne);
}

/* =========================================================
   PYTHON
   ========================================================= */

const PYTHON_HELPERS = `
import js as _nsi_js

class ErreurSQL(Exception):
    """Erreur renvoyée par la base de données du notebook."""

def requete(sql, *parametres):
    """Exécute une requête SQL sur la base du notebook.
    Renvoie la liste des lignes (des tuples). Exemple :
        requete("SELECT nom, prenom FROM eleves WHERE ville = ?", "Tours")
    """
    resultat = _nsi_js.nsiPythonSql(sql, list(parametres)).to_py()
    if resultat["erreur"]:
        raise ErreurSQL(resultat["erreur"])
    return [tuple(ligne) for ligne in resultat["lignes"]]

def tableau(sql, *parametres):
    """Exécute une requête SQL et affiche le résultat sous forme de tableau."""
    resultat = _nsi_js.nsiPythonSql(sql, list(parametres), True).to_py()
    if resultat["erreur"]:
        raise ErreurSQL(resultat["erreur"])
`;

function createNamespace() {
    const py = state.pyodide;
    const namespace = py.globals.get("dict")();
    namespace.set("__name__", "__main__");
    py.runPython(PYTHON_HELPERS, { globals: namespace });
    state.pyNamespace = namespace;
}

async function loadPython() {
    if (state.pyodide) return state.pyodide;
    if (state.pyLoading) return state.pyLoading;
    if (typeof window.loadPyodide !== "function") {
        setPill("python-status", "Python : indisponible", "error");
        throw new Error("Python n'a pas pu être chargé. Vérifie ta connexion à Internet puis recharge la page.");
    }
    setPill("python-status", "Python : chargement…", "loading");
    state.pyLoading = window.loadPyodide().then(py => {
        state.pyodide = py;
        const outDecoder = new TextDecoder();
        const errDecoder = new TextDecoder();
        py.setStdout({ write: buffer => { writePython(outDecoder.decode(buffer, { stream: true }), "stdout"); return buffer.length; } });
        py.setStderr({ write: buffer => { writePython(errDecoder.decode(buffer, { stream: true }), "stderr"); return buffer.length; } });
        py.setStdin({ stdin: readPythonInput });
        createNamespace();
        setPill("python-status", "Python : prêt", "ready");
        return py;
    }).catch(error => {
        setPill("python-status", "Python : erreur", "error");
        throw error;
    }).finally(() => { state.pyLoading = null; });
    return state.pyLoading;
}

function writePython(text, stream) {
    if (!text) return;
    const lastNewline = text.lastIndexOf("\n");
    state.pyLine = lastNewline >= 0 ? text.slice(lastNewline + 1) : state.pyLine + text;
    state.pyOutput?.(text, stream);
}

function readPythonInput() {
    const question = state.pyLine.trim();
    const answer = window.prompt(question || "input() : écris ta réponse", "");
    if (answer === null) return null; // annulé → EOFError
    state.pyOutput?.(answer + "\n", "stdin");
    state.pyLine = "";
    return answer + "\n";
}

function makeStreamWriter(cell) {
    // Un seul bloc de texte (comme une console) ; la saisie et les erreurs ont leur propre couleur
    let block = null;
    let span = null;
    let currentStream = null;
    return (text, stream) => {
        showOutput(cell);
        if (!block || block !== cell.output.lastElementChild) {
            block = el("pre", "nb-stream");
            cell.output.appendChild(block);
            span = null;
        }
        if (!span || currentStream !== stream) {
            span = el("span", stream);
            currentStream = stream;
            block.appendChild(span);
        }
        span.textContent += text;
    };
}

function parsePythonError(message) {
    const text = String(message || "").replace(/\s+$/, "");
    const lines = text.split("\n");
    // On ne garde que les lignes qui concernent le code de l'élève (pas l'interne de Pyodide)
    const kept = [];
    let skip = false;
    for (const line of lines) {
        const frame = line.match(/^\s*File "(.+?)", line (\d+)/);
        if (frame) skip = frame[1] !== "<cellule>";
        if (!skip || !frame && !/^\s/.test(line)) kept.push(line);
    }
    let ligne = null;
    for (const match of text.matchAll(/File "<cellule>", line (\d+)/g)) ligne = Number(match[1]);
    const lastLine = lines.filter(Boolean).pop() || text;
    return { original: kept.join("\n"), lastLine, ligne };
}

function sameBytes(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

async function syncDatabaseToPython(py, code) {
    // Le module sqlite3 lit un vrai fichier : on y copie la base du notebook
    // (dès qu'une cellule utilise sqlite3, puis à chaque exécution Python).
    if (!/\bsqlite3\b/.test(code) && !state.pyFileBytes) return null;
    const db = await ensureDb();
    const file = currentDbFileName();
    if (state.pyFileVersion !== state.dbVersion || state.pyFileName !== file) {
        const bytes = db.export();
        restoreDbPragmas();
        py.FS.writeFile(file, bytes);
        state.pyFileBytes = bytes;
        state.pyFileName = file;
        state.pyFileVersion = state.dbVersion;
    }
    return { file };
}

function syncDatabaseFromPython(py, sync) {
    if (!sync) return;
    try {
        const bytes = py.FS.readFile(sync.file);
        if (sameBytes(bytes, state.pyFileBytes)) return;
        replaceDatabase(new state.SQL.Database(bytes));
        state.pyFileBytes = bytes;
        state.pyFileVersion = state.dbVersion;
    } catch (error) {
        console.warn("Synchronisation de la base depuis Python impossible :", error);
    }
}

async function runPython(cell) {
    const code = cell.getValue();
    resetOutput(cell);
    if (!code.trim()) { setCount(cell, " "); return true; }
    window.nsiTrack?.("pythonRun");

    let py;
    try {
        if (!state.pyodide) {
            showOutput(cell);
            cell.output.innerHTML = '<p class="nb-muted nb-loading"><i class="fa-solid fa-spinner fa-spin"></i> Chargement de Python… (quelques secondes la première fois)</p>';
        }
        py = await loadPython();
        resetOutput(cell);
        await py.loadPackagesFromImports(code, { messageCallback: () => {}, errorCallback: () => {} });
    } catch (error) {
        resetOutput(cell);
        renderError(cell, { titre: "Python indisponible", explication: escapeHTML(error.message || String(error)) });
        setCount(cell, "!");
        window.nsiTrack?.("pythonError");
        return false;
    }

    state.executionCount += 1;
    const count = state.executionCount;
    state.pyOutput = makeStreamWriter(cell);
    state.pyLine = "";
    state.currentPythonCell = cell;
    let sync = null;
    try {
        if (/\b(requete|tableau)\s*\(/.test(code)) await ensureDb();
        sync = await syncDatabaseToPython(py, code);
        state.pyNamespace.set("_nsi_source", code);
        const result = await py.runPythonAsync(
            "from pyodide.code import eval_code_async as _nsi_eval\n" +
            "_nsi_resultat = await _nsi_eval(_nsi_source, globals(), filename='<cellule>')\n" +
            "None if _nsi_resultat is None else repr(_nsi_resultat)",
            { globals: state.pyNamespace }
        );
        if (typeof result === "string") {
            showOutput(cell);
            cell.output.appendChild(el("pre", "nb-result", escapeHTML(result)));
        }
        window.nsiTrack?.("pythonSuccess");
        return true;
    } catch (error) {
        const { original, lastLine, ligne } = parsePythonError(error.message);
        const explained = window.NSI_ERREURS?.explainPython(lastLine);
        renderError(cell, {
            titre: explained?.titre || lastLine.split(":")[0] || "Erreur",
            explication: explained?.explication || escapeHTML(lastLine),
            astuce: explained?.astuce,
            ligne,
            original,
            kind: lastLine.split(":")[0]
        });
        window.nsiTrack?.("pythonError");
        return false;
    } finally {
        try { py.runPython("__import__('sys').stdout.flush(); __import__('sys').stderr.flush()", { globals: state.pyNamespace }); } catch (_) {}
        state.pyOutput = null;
        state.currentPythonCell = null;
        syncDatabaseFromPython(py, sync);
        setCount(cell, count);
    }
}

async function restartPython() {
    if (!state.pyodide) { toast("Python n'est pas encore lancé."); return; }
    await state.queue;
    state.pyNamespace?.destroy?.();
    createNamespace();
    state.executionCount = 0;
    state.cells.forEach(cell => { if (cell.type !== "markdown") setCount(cell, " "); });
    toast("Python redémarré : toutes les variables ont été effacées.");
}

/* =========================================================
   SQL
   ========================================================= */

function databaseInfo() {
    const info = state.notebook?.database || { source: "lycee" };
    if (info.source === "vide") return { source: "vide", nom: "Base vide", fichier: "base.db", description: "Une base vide : crée tes propres tables avec CREATE TABLE." };
    if (info.source === "import") return { source: "import", nom: info.nom || "Base importée", fichier: info.fichier || "base.db", description: "Base ouverte depuis un fichier." };
    const base = window.NSI_BASES?.lycee;
    return { source: "lycee", nom: base?.nom || "Lycée", fichier: base?.fichier || "lycee.db", description: base?.description || "" };
}

function currentDbFileName() {
    return databaseInfo().fichier.replace(/[^\w.-]/g, "_");
}

async function loadSqlEngine() {
    if (state.SQL) return state.SQL;
    if (state.sqlLoading) return state.sqlLoading;
    if (typeof window.initSqlJs !== "function") {
        setPill("sql-status", "SQL : indisponible", "error");
        throw new Error("Le moteur SQL n'a pas pu être chargé. Vérifie ta connexion à Internet puis recharge la page.");
    }
    setPill("sql-status", "SQL : chargement…", "loading");
    state.sqlLoading = window.initSqlJs({ locateFile: file => SQLJS_URL + file }).then(SQL => {
        state.SQL = SQL;
        setPill("sql-status", "SQL : prêt", "ready");
        return SQL;
    }).catch(error => {
        setPill("sql-status", "SQL : erreur", "error");
        throw error;
    }).finally(() => { state.sqlLoading = null; });
    return state.sqlLoading;
}

function createOriginalDatabase(SQL) {
    const info = databaseInfo();
    if (info.source === "import") {
        try {
            const stored = localStorage.getItem(DB_ORIGIN_PREFIX + notebookId);
            if (stored) return new SQL.Database(base64ToBytes(stored));
        } catch (error) { console.warn(error); }
        toast("Le fichier d'origine de la base est introuvable : base vide créée.", "error");
        return new SQL.Database();
    }
    const db = new SQL.Database();
    if (info.source === "lycee" && window.NSI_BASES?.lycee) db.exec(window.NSI_BASES.lycee.sql);
    return db;
}

async function ensureDb() {
    if (state.db) return state.db;
    const SQL = await loadSqlEngine();
    if (state.db) return state.db;
    let db = null;
    try {
        const saved = localStorage.getItem(DB_PREFIX + notebookId);
        if (saved) db = new SQL.Database(base64ToBytes(saved));
    } catch (error) {
        console.warn("Base enregistrée illisible, retour à la base d'origine :", error);
    }
    state.db = db || createOriginalDatabase(SQL);
    restoreDbPragmas();
    refreshSchema();
    return state.db;
}

function restoreDbPragmas() {
    try { state.db?.exec("PRAGMA foreign_keys = ON;"); } catch (_) {}
}

function replaceDatabase(db) {
    try { state.db?.close(); } catch (_) {}
    state.db = db;
    restoreDbPragmas();
    markDbChanged();
}

function markDbChanged() {
    state.dbVersion += 1;
    clearTimeout(state.dbSaveTimer);
    state.dbSaveTimer = setTimeout(saveDatabase, 300);
    refreshSchema();
}

function saveDatabase() {
    clearTimeout(state.dbSaveTimer);
    if (!state.db) return;
    try {
        const bytes = state.db.export();
        restoreDbPragmas();
        localStorage.setItem(DB_PREFIX + notebookId, bytesToBase64(bytes));
    } catch (error) {
        console.error("Impossible d'enregistrer la base :", error);
        toast("La base est trop grosse pour être enregistrée dans le navigateur. Télécharge-la (Exporter → .db) pour la garder.", "error");
    }
}

function statementKind(sql) {
    const first = sql.replace(/^(\s|--[^\n]*\n|\/\*[\s\S]*?\*\/)+/, "").split(/\s+/)[0]?.toUpperCase() || "";
    return first;
}

function describeChange(kind, sql, changes) {
    const plural = changes > 1 ? "s" : "";
    const target = (sql.match(/^\s*(?:CREATE|DROP|ALTER)\s+(?:TEMP\w*\s+)?(TABLE|VIEW|INDEX|TRIGGER)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?["`[]?([\w-]+)/i) || []);
    const objet = { TABLE: "Table", VIEW: "Vue", INDEX: "Index", TRIGGER: "Déclencheur" }[target[1]?.toUpperCase()] || "Objet";
    switch (kind) {
        case "INSERT": case "REPLACE": return `${changes} ligne${plural} ajoutée${plural}`;
        case "UPDATE": return `${changes} ligne${plural} modifiée${plural}`;
        case "DELETE": return `${changes} ligne${plural} supprimée${plural}`;
        case "CREATE": return `${objet} ${target[2] ? `« ${target[2]} » ` : ""}créé${objet === "Table" || objet === "Vue" ? "e" : ""}`;
        case "DROP": return `${objet} ${target[2] ? `« ${target[2]} » ` : ""}supprimé${objet === "Table" || objet === "Vue" ? "e" : ""}`;
        case "ALTER": return `Table ${target[2] ? `« ${target[2]} » ` : ""}modifiée`;
        default: return "Commande exécutée";
    }
}

function renderTable(container, columns, rows, total) {
    const wrap = el("div", "nb-table-wrap");
    const table = el("table", "nb-table");
    const head = el("thead");
    head.appendChild(el("tr", "", columns.map(name => `<th>${escapeHTML(name)}</th>`).join("")));
    const body = el("tbody");
    for (const row of rows) {
        const tr = el("tr");
        for (const value of row) {
            const td = el("td");
            if (value === null || value === undefined) { td.className = "null"; td.textContent = "NULL"; }
            else if (value instanceof Uint8Array) { td.className = "null"; td.textContent = `(données binaires, ${value.length} octets)`; }
            else {
                if (typeof value === "number") td.className = "num";
                td.textContent = String(value);
            }
            tr.appendChild(td);
        }
        body.appendChild(tr);
    }
    table.append(head, body);
    wrap.appendChild(table);
    container.appendChild(wrap);
    const caption = total === 0 ? "Aucune ligne" : `${total} ligne${total > 1 ? "s" : ""}${total > rows.length ? ` (${rows.length} premières affichées)` : ""}`;
    container.appendChild(el("p", "nb-table-caption", caption));
}

function executeSql(db, sql, params = null) {
    // Exécute une ou plusieurs requêtes. Renvoie la liste des résultats.
    const results = [];
    let changed = false;
    let index = 0;
    if (params && params.length) {
        const stmt = db.prepare(sql);
        try {
            stmt.bind(params);
            const columns = stmt.getColumnNames();
            const rows = [];
            while (stmt.step()) rows.push(stmt.get());
            const kind = statementKind(sql);
            if (columns.length) results.push({ columns, rows, total: rows.length, sql });
            else { changed = true; results.push({ message: describeChange(kind, sql, db.getRowsModified()), sql }); }
        } finally { stmt.free(); }
        return { results, changed };
    }
    for (const stmt of db.iterateStatements(sql)) {
        index += 1;
        const text = stmt.getSQL();
        try {
            const columns = stmt.getColumnNames();
            if (columns.length) {
                const rows = [];
                let total = 0;
                while (stmt.step()) {
                    total += 1;
                    if (rows.length < MAX_ROWS) rows.push(stmt.get());
                }
                results.push({ columns, rows, total, sql: text });
            } else {
                stmt.step();
                const kind = statementKind(text);
                if (!["SELECT", "WITH", "EXPLAIN"].includes(kind)) changed = true;
                results.push({ message: describeChange(kind, text, db.getRowsModified()), sql: text });
            }
        } catch (error) {
            error.statementIndex = index;
            error.statementSql = text;
            error.partial = { results, changed };
            throw error;
        } finally {
            stmt.free();
        }
    }
    return { results, changed };
}

function renderSqlResults(container, results) {
    const onlyMessages = results.every(result => result.message);
    for (const result of results) {
        if (result.message) {
            container.appendChild(el("p", "nb-info", `<i class="fa-solid fa-check"></i> ${escapeHTML(result.message)}`));
        } else {
            if (results.length > 1 && !onlyMessages) container.appendChild(el("p", "nb-sql-label", `<code>${escapeHTML(result.sql.trim().split("\n")[0].slice(0, 90))}</code>`));
            renderTable(container, result.columns, result.rows, result.total);
        }
    }
}

async function runSql(cell) {
    const sql = cell.getValue();
    resetOutput(cell);
    if (!sql.trim()) { setCount(cell, " "); return true; }
    window.nsiTrack?.("sqlRun");
    let db;
    try {
        db = await ensureDb();
    } catch (error) {
        renderError(cell, { titre: "SQL indisponible", explication: escapeHTML(error.message || String(error)) });
        setCount(cell, "!");
        return false;
    }
    state.executionCount += 1;
    setCount(cell, state.executionCount);
    showOutput(cell);
    try {
        const { results, changed } = executeSql(db, sql);
        if (!results.length) cell.output.appendChild(el("p", "nb-muted", "Aucune requête à exécuter."));
        renderSqlResults(cell.output, results);
        if (changed) markDbChanged();
        window.nsiTrack?.("sqlSuccess");
        return true;
    } catch (error) {
        if (error.partial) {
            renderSqlResults(cell.output, error.partial.results);
            if (error.partial.changed) markDbChanged();
        }
        const explained = window.NSI_ERREURS?.explainSql(error.message);
        const several = (sql.match(/;/g) || []).length > 1;
        renderError(cell, {
            titre: explained?.titre || "Erreur SQL",
            explication: (several && error.statementIndex ? `<strong>Requête n°${error.statementIndex}.</strong> ` : "") + (explained?.explication || escapeHTML(error.message)),
            astuce: explained?.astuce,
            original: error.message,
            kind: "SQLite"
        });
        window.nsiTrack?.("sqlError");
        return false;
    }
}

// Pont utilisé par requete() et tableau() côté Python
window.nsiPythonSql = (sql, params, display = false) => {
    const values = params?.toJs ? params.toJs() : (params || []);
    if (!state.db) return { erreur: "La base de données n'est pas encore chargée. Exécute d'abord une cellule SQL, ou ouvre le panneau « Base de données ».", lignes: [] };
    try {
        const { results, changed } = executeSql(state.db, String(sql), Array.from(values));
        if (changed) markDbChanged();
        const last = [...results].reverse().find(result => result.columns) || null;
        if (display && state.currentPythonCell) {
            const cell = state.currentPythonCell;
            showOutput(cell);
            renderSqlResults(cell.output, results);
        }
        return { erreur: null, lignes: last ? last.rows : [] };
    } catch (error) {
        return { erreur: error.message, lignes: [] };
    }
};

/* =========================================================
   PANNEAU « BASE DE DONNÉES »
   ========================================================= */

function readSchema(db) {
    const tables = [];
    const list = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid");
    for (const [name] of list[0]?.values || []) {
        const quoted = `"${String(name).replace(/"/g, '""')}"`;
        const columns = (db.exec(`PRAGMA table_info(${quoted})`)[0]?.values || [])
            .map(([, colName, type, notnull, , pk]) => ({ name: colName, type, notnull: !!notnull, pk: !!pk }));
        const fks = db.exec(`PRAGMA foreign_key_list(${quoted})`)[0]?.values || [];
        for (const [, , table, from, to] of fks) {
            const column = columns.find(col => col.name === from);
            if (column) column.fk = { table, column: to || "" };
        }
        let count = "?";
        try { count = db.exec(`SELECT COUNT(*) FROM ${quoted}`)[0].values[0][0]; } catch (_) {}
        tables.push({ name, columns, count });
    }
    return tables;
}

function refreshSchema() {
    if (!state.db) return;
    let tables = [];
    try { tables = readSchema(state.db); } catch (error) { console.warn(error); }

    // Complétion automatique des noms de tables et colonnes dans les cellules SQL
    Object.keys(state.tables).forEach(key => delete state.tables[key]);
    tables.forEach(table => { state.tables[table.name] = table.columns.map(col => col.name); });

    const info = databaseInfo();
    $("#schema-name").textContent = info.nom;
    $("#schema-description").textContent = info.description;
    $("#schema-sqlite").textContent = `sqlite3.connect("${currentDbFileName()}")`;

    const host = $("#schema-tables");
    host.innerHTML = "";
    if (!tables.length) {
        host.innerHTML = '<p class="nb-muted">Aucune table pour l\'instant. Crée-en une avec <code>CREATE TABLE</code> ou importe un fichier .csv.</p>';
        return;
    }
    for (const table of tables) {
        const card = el("article", "nb-schema-table");
        card.dataset.table = table.name;
        card.innerHTML = `
            <header>
                <span class="nb-schema-table-name"><i class="fa-solid fa-table"></i> ${escapeHTML(table.name)}</span>
                <span class="nb-schema-count">${table.count} ligne${table.count > 1 ? "s" : ""}</span>
            </header>
            <ul>${table.columns.map(col => `
                <li class="${col.pk ? "pk" : ""}${col.fk ? " fk" : ""}" ${col.fk ? `data-target="${escapeHTML(col.fk.table)}"` : ""}>
                    <span class="nb-col-icon">${col.pk ? '<i class="fa-solid fa-key" title="Clé primaire"></i>' : col.fk ? '<i class="fa-solid fa-link" title="Clé étrangère"></i>' : ""}</span>
                    <span class="nb-col-name">${escapeHTML(col.name)}</span>
                    <span class="nb-col-type">${escapeHTML(col.type || "")}${col.notnull && !col.pk ? " · obligatoire" : ""}</span>
                    ${col.fk ? `<span class="nb-col-ref">→ ${escapeHTML(col.fk.table)}${col.fk.column ? "." + escapeHTML(col.fk.column) : ""}</span>` : ""}
                </li>`).join("")}
            </ul>
            <button type="button" class="nb-preview"><i class="fa-solid fa-eye"></i> Aperçu</button>`;
        card.querySelector(".nb-preview").addEventListener("click", () => {
            const quoted = /^[A-Za-z_][\w]*$/.test(table.name) ? table.name : `"${table.name.replace(/"/g, '""')}"`;
            const cell = insertCell("sql", `SELECT * FROM ${quoted} LIMIT 10;`, state.activeCell || state.cells[state.cells.length - 1]);
            cell.element.scrollIntoView({ behavior: "smooth", block: "center" });
            runCell(cell);
            setActive(cell);
        });
        card.querySelectorAll("li.fk").forEach(item => {
            const target = () => host.querySelector(`[data-table="${CSS.escape(item.dataset.target)}"]`);
            item.addEventListener("mouseenter", () => target()?.classList.add("highlight"));
            item.addEventListener("mouseleave", () => target()?.classList.remove("highlight"));
        });
        host.appendChild(card);
    }
}

async function toggleSchema(force) {
    const panel = $("#nb-schema");
    const open = force ?? panel.hidden;
    panel.hidden = !open;
    document.body.classList.toggle("schema-open", open);
    $("#toggle-schema").setAttribute("aria-expanded", String(open));
    $("#toggle-schema").classList.toggle("active", open);
    if (open) {
        try { await ensureDb(); refreshSchema(); }
        catch (error) { $("#schema-tables").innerHTML = `<p class="nb-error-inline">${escapeHTML(error.message)}</p>`; }
    }
    state.cells.forEach(cell => cell.editor.refresh());
}

async function resetDatabase() {
    if (!confirm(`Remettre la base « ${databaseInfo().nom} » dans son état d'origine ? Toutes les modifications (ajouts, suppressions, tables créées) seront perdues.`)) return;
    const SQL = await loadSqlEngine();
    replaceDatabase(createOriginalDatabase(SQL));
    saveDatabase();
    toast("Base réinitialisée.");
}

async function switchBase(source) {
    if (source === "import-db") { $("#file-db").click(); return; }
    if (source === "import-csv") { await ensureDb(); $("#file-csv").click(); return; }
    const current = databaseInfo().source;
    if (source === current && !confirm("C'est déjà la base de ce notebook. La remettre à zéro ?")) return;
    if (source !== current && !confirm("Changer de base ? La base actuelle de ce notebook et ses modifications seront remplacées.")) return;
    const SQL = await loadSqlEngine();
    state.notebook.database = { source };
    try { localStorage.removeItem(DB_ORIGIN_PREFIX + notebookId); } catch (_) {}
    replaceDatabase(createOriginalDatabase(SQL));
    saveDatabase();
    saveNow();
    toast(source === "vide" ? "Nouvelle base vide créée." : "Base Lycée chargée.");
}

async function importDatabaseFile(file) {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) { toast("Fichier trop gros (3 Mo maximum) pour être gardé dans le navigateur.", "error"); return; }
    const SQL = await loadSqlEngine();
    const bytes = new Uint8Array(await file.arrayBuffer());
    let db;
    try {
        db = new SQL.Database(bytes);
        db.exec("SELECT name FROM sqlite_master LIMIT 1");
    } catch (error) {
        toast("Ce fichier n'est pas une base SQLite valide.", "error");
        return;
    }
    if (!confirm(`Remplacer la base de ce notebook par « ${file.name} » ?`)) { db.close(); return; }
    try {
        localStorage.setItem(DB_ORIGIN_PREFIX + notebookId, bytesToBase64(bytes));
    } catch (error) {
        toast("Fichier trop gros pour être gardé dans le navigateur.", "error");
        db.close();
        return;
    }
    state.notebook.database = { source: "import", nom: file.name.replace(/\.(db|sqlite3?|db3)$/i, ""), fichier: safeFileName(file.name, "base.db") };
    replaceDatabase(db);
    saveDatabase();
    saveNow();
    toggleSchema(true);
    toast(`Base « ${escapeHTML(file.name)} » ouverte.`);
}

function parseCsv(text) {
    text = text.replace(/^﻿/, "");
    const firstLine = text.split(/\r?\n/, 1)[0];
    const delimiter = [";", ",", "\t"].map(d => [d, firstLine.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quoted) {
            if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (char === '"') quoted = false;
            else field += char;
        } else if (char === '"') quoted = true;
        else if (char === delimiter) { row.push(field); field = ""; }
        else if (char === "\n" || char === "\r") {
            if (char === "\r" && text[i + 1] === "\n") i++;
            row.push(field); field = "";
            if (row.some(value => value !== "")) rows.push(row);
            row = [];
        } else field += char;
    }
    row.push(field);
    if (row.some(value => value !== "")) rows.push(row);
    return rows;
}

function sqlIdentifier(name, fallback) {
    const cleaned = String(name || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
        .trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
    const result = cleaned || fallback;
    return /^[0-9]/.test(result) ? `_${result}` : result;
}

async function importCsvFile(file) {
    if (!file) return;
    const db = await ensureDb();
    const rows = parseCsv(await file.text());
    if (rows.length < 2) { toast("Le fichier CSV doit contenir une ligne d'en-têtes et au moins une ligne de données.", "error"); return; }
    const used = new Set();
    const headers = rows[0].map((header, index) => {
        let name = sqlIdentifier(header, `colonne_${index + 1}`);
        while (used.has(name)) name += "_bis";
        used.add(name);
        return name;
    });
    const data = rows.slice(1).map(row => headers.map((_, index) => (row[index] ?? "").trim()));
    const types = headers.map((_, index) => {
        const values = data.map(row => row[index]).filter(value => value !== "");
        if (values.length && values.every(value => /^-?\d+$/.test(value))) return "INTEGER";
        if (values.length && values.every(value => /^-?\d+([.,]\d+)?$/.test(value))) return "REAL";
        return "TEXT";
    });
    let table = sqlIdentifier(file.name.replace(/\.csv$/i, ""), "donnees");
    const exists = name => db.exec(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='${name}'`).length > 0;
    if (exists(table)) {
        if (confirm(`La table « ${table} » existe déjà. La remplacer ? (Annuler = créer une nouvelle table)`)) db.exec(`DROP TABLE "${table}"`);
        else { let n = 2; while (exists(`${table}_${n}`)) n++; table = `${table}_${n}`; }
    }
    try {
        db.exec("BEGIN");
        db.exec(`CREATE TABLE "${table}" (${headers.map((h, i) => `"${h}" ${types[i]}`).join(", ")})`);
        const stmt = db.prepare(`INSERT INTO "${table}" VALUES (${headers.map(() => "?").join(", ")})`);
        for (const row of data) {
            stmt.run(row.map((value, i) => value === "" ? null : types[i] === "INTEGER" ? parseInt(value, 10) : types[i] === "REAL" ? parseFloat(value.replace(",", ".")) : value));
        }
        stmt.free();
        db.exec("COMMIT");
    } catch (error) {
        try { db.exec("ROLLBACK"); } catch (_) {}
        toast(`Import impossible : ${escapeHTML(error.message)}`, "error");
        return;
    }
    markDbChanged();
    toggleSchema(true);
    toast(`Table « ${table} » créée avec ${data.length} ligne${data.length > 1 ? "s" : ""}.`);
}

/* =========================================================
   EXPORTS
   ========================================================= */

function mindmapOutline(content) {
    return window.NsiMindMap ? `<!-- Carte mentale NSI Hub -->\n${window.NsiMindMap.toMarkdown(content)}` : content;
}

/* ---------- Proposer comme cours (professeurs) ---------- */

const COURSE_ISSUE_URL = "https://github.com/RafaelMMIX/nsi/issues/new";
const COURSE_MAX_CODE = 60000;

function toBase64Url(bytes) {
    return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// NBK1- : JSON compressé (deflate brut) ; NBK0- : JSON simple si le navigateur ne sait pas compresser
async function encodeCourse() {
    const base = state.notebook?.database?.source === "vide" ? "vide" : "lycee";
    const payload = { v: 1, n: state.notebook?.name || "Cours", b: base, c: serializeCells().map(cell => [cell.type, cell.content]) };
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    if (window.CompressionStream) {
        try {
            const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
            return `NBK1-${toBase64Url(new Uint8Array(await new Response(stream).arrayBuffer()))}`;
        } catch (_) {}
    }
    return `NBK0-${toBase64Url(bytes)}`;
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (_) {
        const area = $("#course-code");
        area.focus();
        area.select();
        try { return document.execCommand("copy"); } catch (__) { return false; }
    }
}

async function openCourseDialog() {
    saveNow();
    const dialog = $("#course-dialog");
    const code = await encodeCourse();
    const warning = $("#course-warning");
    const notes = [];
    const source = state.notebook?.database?.source || "lycee";
    if (source === "import") notes.push("La base de données importée ne peut pas être envoyée : le cours utilisera la base Lycée. Si tes requêtes ont besoin d'autres tables, crée-les avec des cellules SQL (CREATE TABLE, INSERT) au début du notebook.");
    else if (state.cells.some(cell => cell.type === "sql")) notes.push(`Les élèves partiront de la base ${source === "vide" ? "vide" : "Lycée"} d'origine : les modifications faites à ta base (tables ajoutées, CSV importés) ne sont pas envoyées.`);
    const tooBig = code.length > COURSE_MAX_CODE;
    if (tooBig) notes.unshift(`Ce notebook est trop gros pour être envoyé (${code.length.toLocaleString("fr-FR")} caractères, ${COURSE_MAX_CODE.toLocaleString("fr-FR")} au maximum). Retire ou raccourcis les plus grosses cellules.`);
    warning.innerHTML = notes.map(note => `<i class="fa-solid fa-triangle-exclamation"></i> ${escapeHTML(note)}`).join("<br>");
    warning.hidden = !notes.length;
    warning.classList.toggle("error", tooBig);

    $("#course-code").value = code;
    $("#course-size").textContent = `(${code.length.toLocaleString("fr-FR")} caractères)`;

    const params = new URLSearchParams({ template: "cours-public.yml", title: `Cours : ${state.notebook?.name || ""}`, titre: state.notebook?.name || "" });
    const level = { snt: "SNT", premiere: "Première NSI", terminale: "Terminale NSI" }[localStorage.getItem("nsiLevel")];
    if (level) params.set("niveau", level);
    // Le code est pré-rempli seulement si l'adresse reste raisonnable (sinon on le colle)
    const withCode = new URLSearchParams(params);
    withCode.set("code", code);
    const url = `${COURSE_ISSUE_URL}?${withCode}`.length < 7500 ? `${COURSE_ISSUE_URL}?${withCode}` : `${COURSE_ISSUE_URL}?${params}`;
    const open = $("#course-open");
    open.href = url;
    open.classList.toggle("disabled", tooBig);
    open.setAttribute("aria-disabled", String(tooBig));
    $("#course-copy").disabled = tooBig;

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
}

function bindCourseDialog() {
    const dialog = $("#course-dialog");
    if (!dialog) return;
    const close = () => (typeof dialog.close === "function" ? dialog.close() : dialog.removeAttribute("open"));
    dialog.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", close));
    dialog.addEventListener("click", event => { if (event.target === dialog) close(); });
    $("#course-copy").addEventListener("click", async () => {
        toast(await copyText($("#course-code").value) ? "Code copié." : "Copie impossible : sélectionne le code et copie-le à la main.", "info");
    });
    $("#course-open").addEventListener("click", event => {
        if (event.currentTarget.classList.contains("disabled")) { event.preventDefault(); return; }
        copyText($("#course-code").value);
    });
    // Visible pour les professeurs (et en mode développeur)
    const teacher = localStorage.getItem("nsiLevel") === "professeur" || localStorage.getItem("nsiDevMode") === "true";
    $("#export-cours").hidden = !teacher;
}

function showCourseBanner() {
    const course = state.notebook?.cours;
    const banner = $("#nb-course-banner");
    if (!course || !banner) return;
    const levels = { snt: "SNT", premiere: "Première NSI", terminale: "Terminale NSI", tous: "Tous niveaux" };
    banner.innerHTML = `<i class="fa-solid fa-chalkboard-user"></i> Cours proposé par <strong>${escapeHTML(course.auteur || "un professeur")}</strong>${course.niveau ? ` · ${escapeHTML(levels[course.niveau] || "")}` : ""}. Tu travailles sur ta propre copie : tes modifications restent dans ton navigateur.`;
    banner.hidden = false;
}

function splitSource(text) {
    return text.split(/(?<=\n)/);
}

async function exportNotebook(format) {
    saveNow();
    const name = safeFileName(state.notebook?.name);
    const cells = serializeCells();
    if (format === "ipynb") {
        const ipynb = {
            cells: cells.map(cell => cell.type === "mindmap"
                // Jupyter ne connaît pas les cartes : plan en Markdown + carte complète dans les métadonnées
                ? { cell_type: "markdown", metadata: { nsihub: { type: "mindmap", data: window.NsiMindMap ? window.NsiMindMap.normalize(cell.content) : null } }, source: splitSource(mindmapOutline(cell.content)) }
                : cell.type === "markdown"
                    ? { cell_type: "markdown", metadata: {}, source: splitSource(cell.content) }
                    : { cell_type: "code", execution_count: null, metadata: {}, outputs: [], source: splitSource(cell.type === "sql" ? `%%sql\n${cell.content}` : cell.content) }),
            metadata: {
                kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
                language_info: { name: "python", version: "3" },
                nsihub: { database: state.notebook?.database || { source: "lycee" } }
            },
            nbformat: 4,
            nbformat_minor: 5
        };
        downloadFile(`${name}.ipynb`, JSON.stringify(ipynb, null, 1), "application/x-ipynb+json;charset=utf-8");
    } else if (format === "py") {
        const comment = text => text.split("\n").map(line => `# ${line}`.trimEnd()).join("\n");
        const script = cells.map(cell => cell.type === "markdown" || cell.type === "mindmap"
            ? `# %% [markdown]\n${comment(cell.type === "mindmap" ? mindmapOutline(cell.content) : cell.content)}`
            : cell.type === "sql" ? `# %% [sql] (requête à exécuter sur ${currentDbFileName()})\n${comment(cell.content)}` : `# %%\n${cell.content}`).join("\n\n") + "\n";
        downloadFile(`${name}.py`, script, "text/x-python;charset=utf-8");
    } else if (format === "sql") {
        const sqlCells = cells.filter(cell => cell.type === "sql" && cell.content.trim());
        if (!sqlCells.length) { toast("Ce notebook ne contient aucune cellule SQL."); return; }
        const script = `-- ${state.notebook?.name} (base : ${databaseInfo().nom})\n\n` + sqlCells.map((cell, i) => `-- Cellule SQL ${i + 1}\n${cell.content.trim()}`).join("\n\n") + "\n";
        downloadFile(`${name}.sql`, script, "application/sql;charset=utf-8");
    } else if (format === "cours") {
        document.querySelectorAll(".nb-menu[open]").forEach(menu => menu.removeAttribute("open"));
        openCourseDialog();
        return;
    } else if (format === "db") {
        try {
            const db = await ensureDb();
            const bytes = db.export();
            restoreDbPragmas();
            downloadFile(currentDbFileName(), new Blob([bytes], { type: "application/vnd.sqlite3" }));
        } catch (error) {
            toast(escapeHTML(error.message), "error");
        }
    }
    document.querySelectorAll(".nb-menu[open]").forEach(menu => menu.removeAttribute("open"));
}

/* =========================================================
   CHARGEMENT
   ========================================================= */

function loadNotebook() {
    const notebooks = getNotebooks();
    const notebook = notebooks.find(item => item.id === notebookId);
    if (!notebook) {
        cellsContainer.innerHTML = `<div class="nb-empty"><i class="fa-solid fa-book-open"></i><h2>Notebook introuvable</h2><p>Il a peut-être été supprimé, ou il a été créé sur un autre navigateur.</p><a class="nb-btn primary" href="notebooks.html">Mes notebooks</a></div>`;
        document.querySelectorAll(".nb-toolbar button, .nb-toolbar summary, #nb-title").forEach(item => { item.disabled = true; item.style.pointerEvents = "none"; });
        return false;
    }
    state.notebook = notebook;
    if (!notebook.database) notebook.database = { source: "lycee" };
    document.title = `${notebook.name} | NSI Hub`;
    $("#nb-title").value = notebook.name;

    let cells = Array.isArray(notebook.cells) ? notebook.cells : null;
    if (!cells) {
        try { cells = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "null"); } catch (_) { cells = null; }
    }
    if (!Array.isArray(cells) || !cells.length) cells = [
        { type: "markdown", content: "# Mon notebook\n\nCommence à écrire ici." },
        { type: "python", content: "print('Bonjour NSI !')" }
    ];
    cells.forEach(item => {
        const cell = insertCell(item.type, item.content || "", null, { track: false });
        if (cell.type === "markdown" && cell.getValue().trim()) renderMarkdown(cell);
    });
    if (state.cells[0]) setActive(state.cells[0]);
    saveNow();
    return true;
}

function bindToolbar() {
    document.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => {
        const cell = insertCell(button.dataset.add, "", state.activeCell);
        cell.element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        cell.editor.focus();
        setActive(cell);
    }));
    $("#run-all").addEventListener("click", runAll);
    $("#restart-python").addEventListener("click", restartPython);
    $("#clear-outputs").addEventListener("click", () => {
        state.cells.forEach(cell => { resetOutput(cell); clearErrorLine(cell); if (!isStatic(cell.type)) setCount(cell, " "); });
    });
    $("#toggle-schema").addEventListener("click", () => toggleSchema());
    $("#close-schema").addEventListener("click", () => toggleSchema(false));
    $("#reset-db").addEventListener("click", resetDatabase);
    document.querySelectorAll("[data-base]").forEach(button => button.addEventListener("click", () => {
        button.closest("details")?.removeAttribute("open");
        switchBase(button.dataset.base);
    }));
    document.querySelectorAll("[data-export]").forEach(button => button.addEventListener("click", () => exportNotebook(button.dataset.export)));
    $("#file-db").addEventListener("change", event => { importDatabaseFile(event.target.files[0]); event.target.value = ""; });
    $("#file-csv").addEventListener("change", event => { importCsvFile(event.target.files[0]); event.target.value = ""; });

    const title = $("#nb-title");
    title.addEventListener("input", () => {
        state.notebook.name = title.value.trim() || "Notebook sans nom";
        document.title = `${state.notebook.name} | NSI Hub`;
        scheduleSave();
    });
    title.addEventListener("keydown", event => { if (event.key === "Enter") title.blur(); });

    // Fermer les menus en cliquant ailleurs
    document.addEventListener("click", event => {
        document.querySelectorAll(".nb-menu[open]").forEach(menu => { if (!menu.contains(event.target)) menu.removeAttribute("open"); });
    });
    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); saveNow(); toast("Notebook enregistré."); }
    });
    window.addEventListener("beforeunload", () => { saveNow(); if (state.dbSaveTimer) saveDatabase(); });
}

function warmUp() {
    // Précharge les moteurs utiles en arrière-plan pour que la première exécution soit rapide
    const idle = window.requestIdleCallback || (fn => setTimeout(fn, 800));
    const types = new Set(state.cells.map(cell => cell.type));
    idle(() => {
        if (types.has("sql")) ensureDb().catch(() => {});
        if (types.has("python")) loadPython().catch(() => {});
    });
    if (types.has("sql") && window.matchMedia("(min-width: 1180px)").matches) toggleSchema(true);
}

if (loadNotebook()) {
    bindToolbar();
    bindCourseDialog();
    showCourseBanner();
    warmUp();
}
