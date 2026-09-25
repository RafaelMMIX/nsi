const STORAGE_KEY = "nsiNotebooks";

const notebooksList =
    document.getElementById("notebooks-list");

const newNotebookButton =
    document.getElementById("new-notebook");


// ==============================
// RÉCUPÉRER LES NOTEBOOKS
// ==============================

function getNotebooks() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {

        console.error(
            "Impossible de charger les notebooks :",
            error
        );

        return [];
    }
}


// ==============================
// SAUVEGARDER
// ==============================

function saveNotebooks(notebooks) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notebooks)
    );

}


// ==============================
// CRÉER UN NOTEBOOK
// ==============================

function createNotebook() {

    const name = prompt(
        "Nom du notebook :"
    );

    if (!name || !name.trim()) {
        return;
    }


    const notebooks = getNotebooks();


    const notebook = {

        id: crypto.randomUUID(),

        name: name.trim(),

        createdAt: Date.now(),

        updatedAt: Date.now(),

        cells: [

            {
                type: "markdown",
                content: "# Mon notebook\n\nCommence à écrire ici."
            },

            {
                type: "python",
                content: "print('Bonjour NSI !')"
            }

        ]

    };


    notebooks.push(notebook);

    saveNotebooks(notebooks);


    openNotebook(notebook.id);
}


// ==============================
// OUVRIR
// ==============================

function openNotebook(id) {

    window.location.href =
        `notebook.html?id=${id}`;

}


// ==============================
// SUPPRIMER
// ==============================

function deleteNotebook(id) {

    const notebooks = getNotebooks();

    const notebook =
        notebooks.find(
            notebook => notebook.id === id
        );

    if (!notebook) {
        return;
    }


    const confirmation = confirm(
        `Supprimer "${notebook.name}" ?`
    );

    if (!confirmation) {
        return;
    }


    const updated =
        notebooks.filter(
            notebook => notebook.id !== id
        );


    saveNotebooks(updated);

    renderNotebooks();
}


// ==============================
// AFFICHAGE
// ==============================

function renderNotebooks() {

    const notebooks = getNotebooks();

    notebooksList.innerHTML = "";


    if (notebooks.length === 0) {

        notebooksList.innerHTML = `
            <div class="empty-notebooks">

                <i class="fa-solid fa-book-open"></i>

                <h2>Aucun notebook</h2>

                <p>
                    Crée ton premier notebook pour commencer.
                </p>

            </div>
        `;

        return;
    }


    notebooks
        .sort((a, b) =>
            b.updatedAt - a.updatedAt
        )
        .forEach(notebook => {

            const card =
                document.createElement("article");

            card.className =
                "notebook-card";


            const date =
                new Date(
                    notebook.updatedAt
                ).toLocaleDateString(
                    "fr-FR",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );


            card.innerHTML = `

                <div class="notebook-card-icon">
                    <i class="fa-solid fa-book-open"></i>
                </div>

                <div class="notebook-card-content">

                    <h2>
                        ${escapeHTML(notebook.name)}
                    </h2>

                    <p>
                        Modifié le ${date}
                    </p>

                </div>

                <div class="notebook-card-actions">

                    <button
                        class="open-notebook"
                        title="Ouvrir"
                    >
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>

                    <button
                        class="delete-notebook"
                        title="Supprimer"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>
            `;


            card
                .querySelector(".open-notebook")
                .addEventListener(
                    "click",
                    () => openNotebook(notebook.id)
                );


            card
                .querySelector(".delete-notebook")
                .addEventListener(
                    "click",
                    () => deleteNotebook(notebook.id)
                );


            notebooksList.appendChild(card);

        });

}


// ==============================
// SÉCURITÉ HTML
// ==============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==============================
// ÉVÉNEMENTS
// ==============================

newNotebookButton.addEventListener(
    "click",
    createNotebook
);


// ==============================
// INITIALISATION
// ==============================

renderNotebooks();