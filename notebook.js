let pyodide = null;

const cellsContainer = document.getElementById("cells");

const addPythonButton = document.getElementById("add-python");
const addMarkdownButton = document.getElementById("add-markdown");
const addCellButton = document.getElementById("add-cell");
const runAllButton = document.getElementById("run-all");


// ==============================
// PYTHON
// ==============================

async function loadPython() {

    if (pyodide) {
        return;
    }

    runAllButton.disabled = true;
    runAllButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Chargement de Python...
    `;

    pyodide = await loadPyodide();

    runAllButton.disabled = false;

    runAllButton.innerHTML = `
        <i class="fa-solid fa-play"></i>
        Tout exécuter
    `;
}


// ==============================
// CRÉATION DES CELLULES
// ==============================

function createCell(type = "python") {

    const cell = document.createElement("div");

    cell.className = "notebook-cell";
    cell.dataset.type = type;


    // HEADER

    const header = document.createElement("div");

    header.className = "cell-header";

    const title = document.createElement("span");

    title.innerHTML = type === "python"
        ? `<i class="fa-brands fa-python"></i> Python`
        : `<i class="fa-solid fa-heading"></i> Markdown`;


    // ACTIONS

    const actions = document.createElement("div");

    actions.className = "cell-actions";


    const runButton = document.createElement("button");

    runButton.innerHTML = `<i class="fa-solid fa-play"></i>`;

    runButton.title = "Exécuter";


    const deleteButton = document.createElement("button");

    deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;

    deleteButton.title = "Supprimer";


    const upButton = document.createElement("button");

    upButton.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`;

    upButton.title = "Monter";


    const downButton = document.createElement("button");

    downButton.innerHTML = `<i class="fa-solid fa-arrow-down"></i>`;

    downButton.title = "Descendre";


    actions.append(
        runButton,
        upButton,
        downButton,
        deleteButton
    );


    header.append(title, actions);


    // ÉDITEUR

    const textarea = document.createElement("textarea");

    textarea.className = "cell-editor";

    textarea.placeholder = type === "python"
        ? "Écris ton code Python ici..."
        : "Écris ton Markdown ici...";


    // SORTIE

    const output = document.createElement("div");

    output.className = "cell-output";

    output.style.display = "none";


    cell.append(
        header,
        textarea,
        output
    );


    cellsContainer.appendChild(cell);


    // ==============================
    // BOUTON EXÉCUTER
    // ==============================

    runButton.addEventListener("click", () => {

        if (type === "python") {
            runPythonCell(cell);
        } else {
            renderMarkdown(cell);
        }

    });


    // ==============================
    // SUPPRIMER
    // ==============================

    deleteButton.addEventListener("click", () => {

        cell.remove();

    });


    // ==============================
    // MONTER
    // ==============================

    upButton.addEventListener("click", () => {

        const previous = cell.previousElementSibling;

        if (previous) {
            cellsContainer.insertBefore(cell, previous);
        }

    });


    // ==============================
    // DESCENDRE
    // ==============================

    downButton.addEventListener("click", () => {

        const next = cell.nextElementSibling;

        if (next) {
            cellsContainer.insertBefore(next, cell);
        }

    });


    return cell;
}


// ==============================
// EXÉCUTER PYTHON
// ==============================

async function runPythonCell(cell) {

    await loadPython();

    const textarea = cell.querySelector(".cell-editor");
    const output = cell.querySelector(".cell-output");

    const code = textarea.value;

    if (!code.trim()) {
        output.style.display = "none";
        return;
    }

    output.style.display = "block";
    output.classList.remove("error");

    output.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Exécution...
    `;

    try {

        const wrappedCode = `
import io
import contextlib

_output = io.StringIO()

with contextlib.redirect_stdout(_output):
    exec(${JSON.stringify(code)})

_output.getvalue()
`;

        const result = await pyodide.runPythonAsync(wrappedCode);

        output.textContent = result || "";

    } catch (error) {

        output.classList.add("error");

        output.textContent = error.message || error;

    }
}


// ==============================
// MARKDOWN
// ==============================

function renderMarkdown(cell) {

    const textarea = cell.querySelector(".cell-editor");

    const output = cell.querySelector(".cell-output");

    const markdown = textarea.value;


    output.style.display = "block";


    // Version très simple pour commencer
    const html = markdown
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/gim, "<em>$1</em>")
        .replace(/\n/g, "<br>");


    output.innerHTML = html;

}


// ==============================
// AJOUTER CELLULES
// ==============================

addPythonButton.addEventListener("click", () => {

    createCell("python");

});


addMarkdownButton.addEventListener("click", () => {

    createCell("markdown");

});


addCellButton.addEventListener("click", () => {

    createCell("python");

});


// ==============================
// TOUT EXÉCUTER
// ==============================

runAllButton.addEventListener("click", async () => {

    const cells = document.querySelectorAll(".notebook-cell");

    for (const cell of cells) {

        const type = cell.dataset.type;

        if (type === "python") {
            await runPythonCell(cell);
        } else {
            renderMarkdown(cell);
        }

    }

});


// ==============================
// SAUVEGARDE LOCALE
// ==============================

const SAVE_KEY = "nsiNotebook";

const saveStatus = document.getElementById("save-status");

function saveNotebook() {

    const cells = [];

    document.querySelectorAll(".notebook-cell").forEach(cell => {

        const textarea = cell.querySelector(".cell-editor");

        cells.push({
            type: cell.dataset.type,
            content: textarea.value
        });

    });

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(cells)
    );

    if (saveStatus) {
        saveStatus.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Sauvegardé
        `;
    }
}


// ==============================
// CHARGER LE NOTEBOOK
// ==============================

function loadNotebook() {

    const saved = localStorage.getItem(SAVE_KEY);

    // Aucun notebook sauvegardé
    if (!saved) {

        createCell("markdown");
        createCell("python");

        return;
    }

    try {

        const cells = JSON.parse(saved);

        // On vide le conteneur
        cellsContainer.innerHTML = "";

        // On recrée chaque cellule
        cells.forEach(savedCell => {

            const cell = createCell(savedCell.type);

            const textarea =
                cell.querySelector(".cell-editor");

            textarea.value = savedCell.content;

        });

    } catch (error) {

        console.error(
            "Erreur lors du chargement du notebook :",
            error
        );

        // Si la sauvegarde est corrompue
        localStorage.removeItem(SAVE_KEY);

        createCell("markdown");
        createCell("python");
    }
}


// ==============================
// SAUVEGARDE AUTOMATIQUE
// ==============================

document.addEventListener("input", event => {

    if (
        event.target.classList.contains("cell-editor")
    ) {
        saveNotebook();
    }

});


// ==============================
// CHARGEMENT INITIAL
// ==============================

loadNotebook();