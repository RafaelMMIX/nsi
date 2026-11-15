const currentLevel =
    document.getElementById("current-level");

const changeLevelButton =
    document.getElementById("change-level");

const animationsToggle =
    document.getElementById("animations-toggle");

const clearDataButton =
    document.getElementById("clear-data");

const firstNameInput =
    document.getElementById("first-name");

const saveNameButton =
    document.getElementById("save-name");

// ==============================
// SAUVEGARDE / RESTAURATION
// ==============================
const exportDataButton = document.getElementById("export-data");
const importDataButton = document.getElementById("import-data-button");
const importDataFile = document.getElementById("import-data-file");
const backupStatus = document.getElementById("backup-status");

exportDataButton?.addEventListener("click", () => {
    const data = Object.fromEntries(
        Object.keys(localStorage).filter(key => key.startsWith("nsi")).map(key => [key, localStorage.getItem(key)])
    );
    const blob = new Blob([JSON.stringify({ format: "nsi-hub-backup", version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nsi-hub-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    backupStatus.textContent = "Sauvegarde téléchargée.";
});

importDataButton?.addEventListener("click", () => importDataFile.click());
importDataFile?.addEventListener("change", async () => {
    const file = importDataFile.files?.[0];
    if (!file) return;
    try {
        const backup = JSON.parse(await file.text());
        if (backup.format !== "nsi-hub-backup" || !backup.data || typeof backup.data !== "object" || Array.isArray(backup.data)) {
            throw new Error("Format de sauvegarde invalide.");
        }
        if (!confirm("Restaurer cette sauvegarde ? Les données NSI Hub actuelles seront remplacées.")) return;
        Object.keys(localStorage).filter(key => key.startsWith("nsi")).forEach(key => localStorage.removeItem(key));
        Object.entries(backup.data).forEach(([key, value]) => {
            if (key.startsWith("nsi") && typeof value === "string") localStorage.setItem(key, value);
        });
        backupStatus.textContent = "Données restaurées. La page va se recharger.";
        setTimeout(() => location.reload(), 700);
    } catch (error) {
        backupStatus.textContent = error.message || "Impossible de lire cette sauvegarde.";
    } finally {
        importDataFile.value = "";
    }
});

// ==============================
// NIVEAU
// ==============================

function displayLevel() {
    const level = localStorage.getItem("nsiLevel");
    const labels = { snt: "SNT", premiere: "Première", terminale: "Terminale", professeur: "Professeur" };
    currentLevel.textContent = labels[level] || "Non défini";
}


changeLevelButton.addEventListener(
    "click",
    () => {

        const confirmation = confirm(
            "Changer de niveau ?"
        );


        if (!confirmation) {
            return;
        }


        localStorage.removeItem(
            "nsiLevel"
        );


        window.location.href =
            "selection.html";

    }
);


// ==============================
// ANIMATIONS
// ==============================

const animationsEnabled =
    localStorage.getItem("nsiAnimations");


if (animationsEnabled === "false") {

    animationsToggle.checked = false;

}


animationsToggle.addEventListener(
    "change",
    () => {

        localStorage.setItem(
            "nsiAnimations",
            animationsToggle.checked
        );

        window.nsiPreferences?.apply();
        updateAnimationsDescription();

    }
);

function updateAnimationsDescription() {
    const description = document.getElementById("animations-description");
    if (!description) return;
    const systemReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    description.textContent = !animationsToggle.checked
        ? "Désactivées sur tout le site"
        : systemReduced
            ? "Ton appareil demande moins d'animations : les effets restent réduits"
            : "Transitions, effets et confettis de l'interface";
}

updateAnimationsDescription();

// ==============================
// THÈME
// ==============================

const themeButtons = document.querySelectorAll(".theme-choice [data-theme]");
const themeDescription = document.getElementById("theme-description");

function displayTheme() {
    const choice = window.nsiPreferences?.themeChoice() || localStorage.getItem("nsiTheme") || "sombre";
    themeButtons.forEach(button => {
        const active = button.dataset.theme === choice;
        button.classList.toggle("active", active);
        button.setAttribute("aria-checked", String(active));
    });
    const resolved = window.nsiPreferences?.resolvedTheme() === "clair" ? "clair" : "sombre";
    themeDescription.textContent = choice === "auto"
        ? `Suit le réglage de ton appareil (actuellement ${resolved})`
        : choice === "clair" ? "Clair" : "Sombre";
}

themeButtons.forEach(button => button.addEventListener("click", () => {
    localStorage.setItem("nsiTheme", button.dataset.theme);
    window.nsiPreferences?.apply();
    displayTheme();
}));

window.matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", displayTheme);
displayTheme();

// ==============================
// MODE DEV
// ==============================

const devModeToggle = document.getElementById("dev-mode-toggle");
const devModeInfo = document.getElementById("dev-mode-info");
const devModeCard = document.getElementById("dev-mode-card");
const devModeTools = document.getElementById("dev-mode-tools");
const resetDevTestsButton = document.getElementById("dev-reset-tests");
const devTestStatus = document.getElementById("dev-test-status");

function updateDevModeInterface(enabled) {
    devModeToggle.checked = enabled;
    devModeInfo.style.display = enabled ? "flex" : "none";
    devModeTools.hidden = !enabled;
    devModeCard.classList.toggle("active", enabled);
    document.body.classList.toggle("dev-mode-enabled", enabled);
}

if (devModeToggle) {

    const devMode =
        localStorage.getItem("nsiDevMode") === "true";

    updateDevModeInterface(devMode);


    devModeToggle.addEventListener("change", () => {

        const enabled = devModeToggle.checked;

        localStorage.setItem("nsiDevMode", String(enabled));
        updateDevModeInterface(enabled);

    });

    window.addEventListener("storage", event => {
        if (event.key === "nsiDevMode") {
            updateDevModeInterface(event.newValue === "true");
        }
    });

}

resetDevTestsButton?.addEventListener("click", () => {
    [
        "nsiEntPopupDate",
        "nsiSharePopupDate",
        "nsiLastWelcome"
    ].forEach(key => localStorage.removeItem(key));

    devTestStatus.textContent =
        "Les rappels ont été réinitialisés. Tu peux rejouer les écrans de test.";
});

// ==============================
// EFFACER LES DONNÉES
// ==============================

clearDataButton.addEventListener(
    "click",
    () => {

        const confirmation = confirm(
            "Cette action supprimera toutes les données de NSI Hub enregistrées dans ce navigateur (favoris, notebooks, statistiques, préférences…). Les autres sites, comme Booster perso, ne sont pas touchés. Continuer ?"
        );


        if (!confirmation) {
            return;
        }


        // Le stockage est partagé avec les autres pages de rafaelmmix.github.io :
        // on ne supprime que les clés de NSI Hub (elles commencent toutes par « nsi »).
        [localStorage, sessionStorage].forEach(storage => {
            Object.keys(storage)
                .filter(key => key.startsWith("nsi"))
                .forEach(key => storage.removeItem(key));
        });


        alert(
            "Les données de NSI Hub ont été supprimées."
        );


        window.location.href =
            "selection.html";

    }
);

// ==============================
// PRÉNOM
// ==============================

const savedName =
    localStorage.getItem("nsiFirstName");

if (savedName) {
    firstNameInput.value = savedName;
}


firstNameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        saveNameButton.click();
    }
});

saveNameButton.addEventListener(
    "click",
    () => {

        const name =
            firstNameInput.value.trim();

        if (!name) {

            localStorage.removeItem(
                "nsiFirstName"
            );

            saveNameButton.textContent =
                "Enregistrer";

            return;
        }


        localStorage.setItem(
            "nsiFirstName",
            name
        );


        saveNameButton.textContent =
            "Enregistré ✓";


        setTimeout(() => {

            saveNameButton.textContent =
                "Enregistrer";

        }, 1500);

    }
);

// ==============================
// ESPACE UTILISÉ
// ==============================

const STORAGE_LIMIT = 5 * 1024 * 1024; // environ 5 Mo (en caractères) par site
const STORAGE_GROUPS = [
    { id: "notebooks", label: "Notebooks", color: "var(--blue)", test: key => key === "nsiNotebooks" || key === "nsiNotebook" },
    { id: "bases", label: "Bases SQL des notebooks", color: "var(--cyan)", test: key => key.startsWith("nsiNotebookDb") },
    { id: "stats", label: "Statistiques", color: "var(--purple)", test: key => key === "nsiLocalStatistics" },
    { id: "autres", label: "Autres données NSI Hub", color: "var(--green)", test: key => key.startsWith("nsi") },
    { id: "externe", label: "Autres sites (ex. Booster perso)", color: "var(--orange)", test: () => true }
];

function formatSize(chars) {
    if (chars < 1024) return `${chars} o`;
    if (chars < 1024 * 1024) return `${(chars / 1024).toFixed(chars < 10240 ? 1 : 0).replace(".", ",")} Ko`;
    return `${(chars / 1024 / 1024).toFixed(2).replace(".", ",")} Mo`;
}

function itemSize(key) {
    const value = localStorage.getItem(key);
    return key.length + (value ? value.length : 0);
}

function displayStorage() {
    const totals = Object.fromEntries(STORAGE_GROUPS.map(group => [group.id, 0]));
    Object.keys(localStorage).forEach(key => {
        const group = STORAGE_GROUPS.find(g => g.test(key));
        totals[group.id] += itemSize(key);
    });
    const used = Object.values(totals).reduce((a, b) => a + b, 0);
    const nsiUsed = used - totals.externe;
    const percent = Math.min(100, used / STORAGE_LIMIT * 100);

    document.getElementById("storage-summary").textContent =
        `${formatSize(used)} utilisés sur environ 5 Mo (${percent < 1 && used ? "< 1" : Math.round(percent)} %), dont ${formatSize(nsiUsed)} pour NSI Hub.`;

    const bar = document.getElementById("storage-bar");
    bar.innerHTML = "";
    bar.classList.toggle("warning", percent >= 80);
    STORAGE_GROUPS.forEach(group => {
        if (!totals[group.id]) return;
        const segment = document.createElement("span");
        segment.style.width = `${Math.max(0.6, totals[group.id] / STORAGE_LIMIT * 100)}%`;
        segment.style.background = group.color;
        segment.title = `${group.label} : ${formatSize(totals[group.id])}`;
        bar.appendChild(segment);
    });

    const legend = document.getElementById("storage-legend");
    legend.innerHTML = "";
    STORAGE_GROUPS.forEach(group => {
        if (!totals[group.id]) return;
        const item = document.createElement("li");
        const dot = document.createElement("span");
        dot.className = "storage-dot";
        dot.style.background = group.color;
        item.append(dot, `${group.label} `);
        const size = document.createElement("strong");
        size.textContent = formatSize(totals[group.id]);
        item.appendChild(size);
        legend.appendChild(item);
    });
    if (!legend.children.length) legend.innerHTML = "<li>Aucune donnée enregistrée.</li>";

    displayNotebookStorage();
}

function displayNotebookStorage() {
    const list = document.getElementById("storage-notebooks");
    const details = document.getElementById("storage-details");
    let notebooks = [];
    try { notebooks = JSON.parse(localStorage.getItem("nsiNotebooks") || "[]"); } catch (_) {}
    list.innerHTML = "";
    details.hidden = !notebooks.length;

    notebooks
        .map(notebook => ({
            notebook,
            cells: JSON.stringify(notebook.cells || []).length,
            base: itemSize(`nsiNotebookDb:${notebook.id}`) - `nsiNotebookDb:${notebook.id}`.length,
            origin: itemSize(`nsiNotebookDbOrigine:${notebook.id}`) - `nsiNotebookDbOrigine:${notebook.id}`.length
        }))
        .sort((a, b) => (b.cells + b.base + b.origin) - (a.cells + a.base + a.origin))
        .forEach(({ notebook, cells, base, origin }) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = `notebook.html?id=${encodeURIComponent(notebook.id)}`;
            link.textContent = notebook.name || "Notebook sans nom";
            const info = document.createElement("span");
            info.className = "storage-notebook-info";
            info.textContent = `${formatSize(cells + base + origin)} · cellules ${formatSize(cells)}${base > 0 ? ` · base ${formatSize(base)}` : ""}${origin > 0 ? ` · fichier importé ${formatSize(origin)}` : ""}`;
            item.append(link, info);
            if (base > 0) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "setting-button small";
                button.textContent = "Remettre la base d'origine";
                button.title = "Supprime la base modifiée enregistrée : le notebook repartira de sa base d'origine";
                button.addEventListener("click", () => {
                    if (!confirm(`Remettre la base de « ${notebook.name} » dans son état d'origine ? Les modifications faites dans la base (ajouts, suppressions, tables créées) seront perdues.`)) return;
                    localStorage.removeItem(`nsiNotebookDb:${notebook.id}`);
                    displayStorage();
                });
                item.appendChild(button);
            }
            list.appendChild(item);
        });
}

window.addEventListener("storage", displayStorage);

// ==============================
// INITIALISATION
// ==============================

displayLevel();
displayStorage();
