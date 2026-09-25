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