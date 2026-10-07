const changelog = [
    {
        version: "1.2.3",
        date: "07 octobre 2026",
        changes: [
            {
                type: "improved",
                title: "Connexion ENT",
                description: "Ajout d'un rappel quotidien pour se connecter à l'ENT avant d'accéder à certaines ressources."
            }
        ]
    },
    {
        version: "1.2.2",
        date: "30 septembre 2026",
        changes: [
            {
                type: "new",
                title: "Annonces importantes",
                description: "Ajout d'une pop-up qui s'affiche pour toutes les informations importantes qui peuvent être realative au lycée."
            },
            {
                type: "new",
                title: "Messagerie de l'ENT",
                description: "Ajout de la messagerie de l'ENT en tant que bouton dans la catégorie \"Cours & Lycée\"."
            },
            {
                type: "improved",
                title: "Ajout d'un niveau",
                description: "Ajout de \"professeur\" dans la selection de profil, ça n'a pour l'instant aucune conéquence sur l'affichage du site."
            },
            {
                type: "accepted",
                title: "Vraie selection de profil",
                description: "Pour le moment, la selection de profil ne change rien, faut changer ça."
            },
            {
                type: "new",
                title: "Ajout d'un chargement",
                description: "Ajout d'un écran de chargement a la selection du profil."
            }
        ]
    },
    {
        version: "1.2.1",
        date: "29 septembre 2026",
        changes: [
            {
                type: "new",
                title: "Favicon temporaire",
                description: "Ajout d'un favicon non personnalisé (un simple émojis) en attendant un vrai favicon, qui sera dans la semaine a suivre."
            },
            {
                type: "removed",
                title: "Easter Egg retiré",
                description: "Un Easter Egg (oeuf de pâques) à été retiré."
            },
            {
                type: "new",
                title: "Qwant",
                description: "Ajout d'une section pour les moteurs de recherche, où il n'y a que Qwant, arrêtez d'utiliser google il nous faut notre souveraineté numérique"
            }
        ]
    },
    {
        version: "1.2.0",
        date: "26 septembre 2026",
        changes: [
            {
                type: "new",
                title: "Bandeau d'informations",
                description: "Ajout d'un bandeau défilant en haut du site."
            },
            {
                type: "new",
                title: "Page À propos",
                description: "Ajout d'une page présentant NSI Hub et son fonctionnement."
            },
            {
                type: "improved",
                title: "Contributions",
                description: "Il est maintenant possible de proposer une idée ou signaler une erreur."
            },
            {
                type: "removed",
                title: "Notebook retiré pour le moment",
                description: "Le notebook à pour l'instant été retiré pour pouvoir l'améliorer, veuillez utiliser celui du prof pour le moment."
            },
            {
                type: "accepted",
                title: "index.html différent pour les différents niveaux (première et terminale)",
                description: "Cette idée a été acceptée et sera mise en place dans une prochaine version."
            }
        ]
    },

    {
        version: "1.1.0",
        date: "25 septembre 2026",
        changes: [
            {
                type: "new",
                title: "Paramètres",
                description: "Ajout d'une page de paramètres."
            },
            {
                type: "new",
                title: "Bienvenue personnalisé",
                description: "Ajout d'un message de bienvenue avec le prénom."
            }
        ]
    }
];

const changelogContainer =
    document.getElementById("changelog");


const icons = {
    new: "fa-plus",
    improved: "fa-wand-magic-sparkles",
    fixed: "fa-bug",
    removed: "fa-trash",
    accepted: "fa-lightbulb"
};


const labels = {
    new: "Nouveau",
    improved: "Amélioration",
    fixed: "Correction",
    removed: "Suppression",
    accepted: "Idée à venir"
};


changelog.forEach((release) => {

    const versionBlock =
        document.createElement("section");

    versionBlock.className = "version-block";


    versionBlock.innerHTML = `
        <div class="version-header">

            <span class="version-number">
                v${release.version}
            </span>

            <span class="version-date">
                ${release.date}
            </span>

        </div>

        <div class="change-list"></div>
    `;


    const changeList =
        versionBlock.querySelector(".change-list");


    release.changes.forEach((change) => {

        const changeElement =
            document.createElement("div");

        changeElement.className =
            `change-group ${change.type}`;

        changeElement.innerHTML = `
            <div class="change-icon">
                <i class="fa-solid ${icons[change.type]}"></i>
            </div>

            <div class="change-content">

                <span class="change-type">
                    ${labels[change.type]}
                </span>

                <h3>${change.title}</h3>

                <p>${change.description}</p>

            </div>
        `;

        changeList.appendChild(changeElement);

    });


    changelogContainer.appendChild(versionBlock);

});
