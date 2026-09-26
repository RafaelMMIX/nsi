const changelog = [
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