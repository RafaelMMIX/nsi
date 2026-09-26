const modal = document.getElementById("contribution-modal");
const overlay = document.getElementById("contribution-overlay");
const closeButton = document.getElementById("contribution-close");

const ideaButton = document.getElementById("idea-button");
const bugButton = document.getElementById("bug-button");

const form = document.getElementById("contribution-form");
const messageInput = document.getElementById("contribution-message");

const title = document.getElementById("contribution-title");
const description = document.getElementById("contribution-description");
const label = document.getElementById("contribution-label");
const icon = document.getElementById("contribution-icon");

const characterCount =
    document.getElementById("character-count");

let contributionType = "idea";


/* Ouvrir la fenêtre */

function openContribution(type) {

    contributionType = type;

    if (type === "idea") {

        title.textContent = "Proposer une idée";

        description.textContent =
            "Une idée pour améliorer NSI Hub ?";

        label.textContent = "Ton idée";

        messageInput.placeholder =
            "Écris ta suggestion ici...";

        icon.innerHTML =
            '<i class="fa-solid fa-lightbulb"></i>';

    } else {

        title.textContent = "Signaler une erreur";

        description.textContent =
            "Tu as trouvé quelque chose qui ne fonctionne pas ?";

        label.textContent = "Description du problème";

        messageInput.placeholder =
            "Décris le problème que tu as rencontré...";

        icon.innerHTML =
            '<i class="fa-solid fa-bug"></i>';
    }

    messageInput.value = "";
    characterCount.textContent = "0";

    modal.classList.add("active");

    setTimeout(() => {
        messageInput.focus();
    }, 100);
}


/* Fermer */

function closeContribution() {
    modal.classList.remove("active");
}


/* Boutons */

ideaButton.addEventListener("click", () => {
    openContribution("idea");
});

bugButton.addEventListener("click", () => {
    openContribution("bug");
});

closeButton.addEventListener("click", closeContribution);
overlay.addEventListener("click", closeContribution);


/* Échap */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        modal.classList.contains("active")
    ) {
        closeContribution();
    }

});


/* Compteur */

messageInput.addEventListener("input", () => {

    characterCount.textContent =
        messageInput.value.length;

});


/* Envoi */

form.addEventListener("submit", (event) => {

    event.preventDefault();

    const message =
        messageInput.value.trim();

    if (!message) {
        messageInput.focus();
        return;
    }

    let subject;
    let body;

    if (contributionType === "idea") {

        subject =
            "[NSI Hub] Proposition d'idée";

        body =
`Bonjour,

Je souhaite proposer une idée pour NSI Hub :

${message}

Merci !`;

    } else {

        subject =
            "[NSI Hub] Signalement d'une erreur";

        body =
`Bonjour,

J'ai trouvé une erreur sur NSI Hub :

${message}

Merci !`;
    }

    const email =
        "perso@rafael.click";

    const mailto =
        `mailto:${email}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

});