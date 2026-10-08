"use strict";

const STORAGE_KEY = "nsiNotebooks";
const LEGACY_STORAGE_KEY = "nsiNotebook";
const params = new URLSearchParams(window.location.search);
const notebookId = params.get("id");
const cellsContainer = document.getElementById("cells");
const runAllButton = document.getElementById("run-all");
const saveStatus = document.getElementById("save-status");
let pyodide = null;
let pythonLoading = null;

function getNotebooks() {
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(value) ? value : [];
    } catch (error) {
        console.error("Impossible de lire les notebooks :", error);
        return [];
    }
}

function currentNotebook() {
    return getNotebooks().find(item => item.id === notebookId) || null;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

function readCells() {
    return [...cellsContainer.querySelectorAll(".notebook-cell")].map(cell => ({
        type: cell.dataset.type,
        content: cell.querySelector(".cell-editor").value
    }));
}

function saveNotebook() {
    const notebooks = getNotebooks();
    const index = notebooks.findIndex(item => item.id === notebookId);
    if (index < 0) return;
    notebooks[index].cells = readCells();
    notebooks[index].updatedAt = Date.now();
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks));
        saveStatus.innerHTML = '<i class="fa-solid fa-check"></i> Enregistré';
    } catch (error) {
        console.error("Impossible d'enregistrer le notebook :", error);
        saveStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Enregistrement impossible';
    }
}

function setSavePending() {
    saveStatus.innerHTML = '<i class="fa-solid fa-pen"></i> Modifications non enregistrées';
    saveNotebook();
}

async function loadPython() {
    if (pyodide) return pyodide;
    if (pythonLoading) return pythonLoading;
    if (typeof window.loadPyodide !== "function") {
        throw new Error("Python ne s'est pas chargé. Vérifie ta connexion puis recharge la page.");
    }
    runAllButton.disabled = true;
    runAllButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Chargement de Python…';
    pythonLoading = window.loadPyodide().then(runtime => {
        pyodide = runtime;
        return runtime;
    }).finally(() => {
        pythonLoading = null;
        runAllButton.disabled = false;
        runAllButton.innerHTML = '<i class="fa-solid fa-play"></i> Tout exécuter';
    });
    return pythonLoading;
}

function createCell(type = "python", content = "") {
    const cell = document.createElement("section");
    cell.className = "notebook-cell";
    cell.dataset.type = type === "markdown" ? "markdown" : "python";
    const title = cell.dataset.type === "python" ? '<i class="fa-brands fa-python"></i> Python' : '<i class="fa-solid fa-heading"></i> Markdown';
    cell.innerHTML = `<div class="cell-header"><span>${title}</span><div class="cell-actions">
        <button type="button" class="run-cell" title="Exécuter" aria-label="Exécuter"><i class="fa-solid fa-play"></i></button>
        <button type="button" class="move-up" title="Monter" aria-label="Monter"><i class="fa-solid fa-arrow-up"></i></button>
        <button type="button" class="move-down" title="Descendre" aria-label="Descendre"><i class="fa-solid fa-arrow-down"></i></button>
        <button type="button" class="delete-cell" title="Supprimer" aria-label="Supprimer"><i class="fa-solid fa-trash"></i></button>
    </div></div><textarea class="cell-editor" spellcheck="false"></textarea><div class="cell-output" hidden></div>`;
    const editor = cell.querySelector(".cell-editor");
    editor.placeholder = cell.dataset.type === "python" ? "Écris ton code Python ici…" : "Écris ton Markdown ici…";
    editor.value = content;
    cell.querySelector(".run-cell").addEventListener("click", () => cell.dataset.type === "python" ? runPythonCell(cell) : renderMarkdown(cell));
    cell.querySelector(".delete-cell").addEventListener("click", () => { cell.remove(); setSavePending(); });
    cell.querySelector(".move-up").addEventListener("click", () => {
        if (cell.previousElementSibling) cellsContainer.insertBefore(cell, cell.previousElementSibling);
        setSavePending();
    });
    cell.querySelector(".move-down").addEventListener("click", () => {
        if (cell.nextElementSibling) cellsContainer.insertBefore(cell.nextElementSibling, cell);
        setSavePending();
    });
    editor.addEventListener("input", setSavePending);
    cellsContainer.appendChild(cell);
    return cell;
}

async function runPythonCell(cell) {
    const output = cell.querySelector(".cell-output");
    const code = cell.querySelector(".cell-editor").value;
    if (!code.trim()) { output.hidden = true; return; }
    output.hidden = false;
    output.classList.remove("error");
    output.textContent = "Chargement de Python…";
    window.nsiTrack?.("pythonRun");
    try {
        const runtime = await loadPython();
        runtime.globals.set("_nsi_code", code);
        const result = await runtime.runPythonAsync("import io, contextlib\n_nsi_output = io.StringIO()\nwith contextlib.redirect_stdout(_nsi_output):\n    exec(compile(_nsi_code, '<notebook>', 'exec'), globals())\n_nsi_output.getvalue()");
        output.textContent = result || "(Exécution terminée sans affichage)";
        window.nsiTrack?.("pythonSuccess");
    } catch (error) {
        output.classList.add("error");
        output.textContent = error?.message || String(error);
        window.nsiTrack?.("pythonError");
    }
}

function renderMarkdown(cell) {
    const output = cell.querySelector(".cell-output");
    let html = escapeHTML(cell.querySelector(".cell-editor").value);
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");
    output.innerHTML = html;
    output.hidden = false;
}

function addCell(type) {
    createCell(type);
    setSavePending();
    window.nsiTrack?.("cellCreated", { type });
}

function loadNotebook() {
    const notebook = currentNotebook();
    if (!notebook) {
        document.querySelector(".page-header p").textContent = "Notebook introuvable. Retourne à la liste pour en créer ou ouvrir un.";
        runAllButton.disabled = true;
        document.querySelectorAll(".notebook-toolbar button, #add-cell").forEach(button => button.disabled = true);
        return;
    }
    document.title = `${notebook.name} | NSI Hub`;
    document.querySelector(".page-header h1").textContent = `📓 ${notebook.name}`;
    let cells = Array.isArray(notebook.cells) ? notebook.cells : null;
    if (!cells) {
        try {
            cells = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
        } catch { cells = null; }
    }
    if (!Array.isArray(cells) || !cells.length) cells = [
        { type: "markdown", content: "# Mon notebook\n\nCommence à écrire ici." },
        { type: "python", content: "print('Bonjour NSI !')" }
    ];
    cells.forEach(item => createCell(item.type, item.content || ""));
    saveNotebook();
}

function downloadFile(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportNotebook(format) {
    const notebook = currentNotebook();
    if (!notebook) return;
    const cells = readCells();
    saveNotebook();
    const safeName = (notebook.name || "notebook").replace(/[<>:"/\\|?*\x00-\x1F]/g, "-").trim() || "notebook";
    if (format === "python") {
        const script = cells.map(cell => cell.type === "markdown" ? `# %% [markdown]\n${cell.content.split("\n").map(line => `# ${line}`).join("\n")}` : `# %%\n${cell.content}`).join("\n\n") + "\n";
        downloadFile(`${safeName}.py`, script, "text/x-python;charset=utf-8");
        return;
    }
    const ipynb = {
        cells: cells.map(cell => cell.type === "markdown" ? {
            cell_type: "markdown", metadata: {}, source: cell.content.split(/(?<=\n)/)
        } : {
            cell_type: "code", execution_count: null, metadata: {}, outputs: [], source: cell.content.split(/(?<=\n)/)
        }),
        metadata: { kernelspec: { display_name: "Python 3", language: "python", name: "python3" }, language_info: { name: "python", version: "3" } },
        nbformat: 4, nbformat_minor: 5
    };
    downloadFile(`${safeName}.ipynb`, JSON.stringify(ipynb, null, 2), "application/x-ipynb+json;charset=utf-8");
}

document.getElementById("add-python").addEventListener("click", () => addCell("python"));
document.getElementById("add-markdown").addEventListener("click", () => addCell("markdown"));
document.getElementById("add-cell").addEventListener("click", () => addCell("python"));
runAllButton.addEventListener("click", async () => {
    runAllButton.disabled = true;
    try {
        for (const cell of [...cellsContainer.querySelectorAll(".notebook-cell")]) {
            if (cell.dataset.type === "python") await runPythonCell(cell);
            else renderMarkdown(cell);
        }
    } finally {
        runAllButton.disabled = false;
    }
});
document.getElementById("export-ipynb").addEventListener("click", () => exportNotebook("ipynb"));
document.getElementById("export-python").addEventListener("click", () => exportNotebook("python"));

loadNotebook();
