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

    const level =
        localStorage.getItem("nsiLevel");


    if (level === "premiere") {

        currentLevel.textContent =
            "Première";

    } else if (level === "terminale") {

        currentLevel.textContent =
            "Terminale";

    } else {

        currentLevel.textContent =
            "Non défini";

    }

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

    }
);

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
        "nsiLastWelcome",
        "nsiTeacherApproved"
    ].forEach(key => localStorage.removeItem(key));

    devTestStatus.textContent =
        "Les rappels et l'approbation ont été réinitialisés. Tu peux rejouer les écrans de test.";
});

// ==============================
// EFFACER LES DONNÉES
// ==============================

clearDataButton.addEventListener(
    "click",
    () => {

        const confirmation = confirm(
            "Cette action supprimera toutes les données locales de NSI Hub. Continuer ?"
        );


        if (!confirmation) {
            return;
        }


        localStorage.clear();


        alert(
            "Les données locales ont été supprimées."
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
// INITIALISATION
// ==============================

displayLevel();
