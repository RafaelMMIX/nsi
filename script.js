/* ==============================
   HORLOGE
============================== */

const clock = document.getElementById("clock");

function updateClock() {

    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    clock.textContent = `${hours}:${minutes}`;
}

updateClock();

setInterval(updateClock, 1000);


/* ==============================
   RECHERCHE
============================== */

const search = document.getElementById("search");

const cards = document.querySelectorAll(".card");

const categories = document.querySelectorAll(".category");

const noResults = document.getElementById("no-results");


function searchCards() {

    const query = search.value
        .toLowerCase()
        .trim();

    let results = 0;


    cards.forEach(card => {

        const name = card.dataset.name.toLowerCase();

        if (name.includes(query)) {

            card.style.display = "flex";

            results++;

        } else {

            card.style.display = "none";

        }

    });


    /* Masquer les catégories vides */

    categories.forEach(category => {

        const visibleCards =
            category.querySelectorAll(
                ".card[style*='display: flex']"
            );

        if (query !== "" && visibleCards.length === 0) {

            category.style.display = "none";

        } else {

            category.style.display = "block";

        }

    });


    /* Message aucun résultat */

    if (query !== "" && results === 0) {

        noResults.style.display = "block";

    } else {

        noResults.style.display = "none";

    }

}


search.addEventListener("input", searchCards);


/* ==============================
   CTRL + K
============================== */

document.addEventListener("keydown", event => {

    if (
        (event.ctrlKey || event.metaKey)
        &&
        event.key.toLowerCase() === "k"
    ) {

        event.preventDefault();

        search.focus();

    }

});


/* ==============================
   ESCAPE
============================== */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        search.value = "";

        searchCards();

        search.blur();

    }

});

/* ==============================
   FAVORIS
============================== */

const favoriteButtons =
    document.querySelectorAll(".favorite-button");


/* Récupérer les favoris */

let favorites =
    JSON.parse(localStorage.getItem("nsiFavorites")) || [];


/* Mettre à jour l'affichage */

function updateFavorites() {

    favoriteButtons.forEach(button => {

        const id = button.dataset.id;

        const icon = button.querySelector("i");

        const isFavorite = favorites.includes(id);


        if (isFavorite) {

            button.classList.add("active");

            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");

            button.setAttribute(
                "aria-label",
                "Retirer des favoris"
            );

        } else {

            button.classList.remove("active");

            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");

            button.setAttribute(
                "aria-label",
                "Ajouter aux favoris"
            );

        }

    });

}


/* Cliquer sur une étoile */

favoriteButtons.forEach(button => {

    button.addEventListener("click", event => {

        /*
         Empêche le clic sur l'étoile
         d'ouvrir le site.
        */

        event.preventDefault();

        event.stopPropagation();


        const id = button.dataset.id;


        if (favorites.includes(id)) {

            favorites =
                favorites.filter(
                    favorite => favorite !== id
                );

        } else {

            favorites.push(id);

        }


        /* Sauvegarder */

        localStorage.setItem(
            "nsiFavorites",
            JSON.stringify(favorites)
        );


        updateFavorites();

    });

});


/* Affichage initial */

const favoritesSection = document.getElementById("favorites-section");
const favoritesContainer = document.getElementById("favorites-container");

function updateFavoritesSection() {
    favoritesContainer.innerHTML = "";

    if (favorites.length === 0) {
        favoritesSection.style.display = "none";
        return;
    }

    favoritesSection.style.display = "block";

    favorites.forEach(id => {
        const originalCard = document.querySelector(
            `.favorite-button[data-id="${id}"]`
        )?.closest(".card");

        if (!originalCard) return;

        const clone = originalCard.cloneNode(true);

        // Empêche les boutons du clone de créer des comportements bizarres
        const favoriteButton = clone.querySelector(".favorite-button");

        if (favoriteButton) {
            favoriteButton.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();

                favorites = favorites.filter(
                    favorite => favorite !== id
                );

                localStorage.setItem(
                    "nsiFavorites",
                    JSON.stringify(favorites)
                );

                updateFavorites();
                updateFavoritesSection();
            });
        }

        favoritesContainer.appendChild(clone);
    });
}

updateFavorites();
updateFavoritesSection();

document.addEventListener("DOMContentLoaded", () => {

    const announcement = document.getElementById("important-announcement");
    const announcementClose = document.getElementById("announcement-close");
    const announcementTab = document.getElementById("announcement-tab");

    if (!announcement || !announcementClose || !announcementTab) {
        return;
    }

    // Afficher l'annonce uniquement aux élèves
    const nsiLevel = localStorage.getItem("nsiLevel");

    if (nsiLevel === "professeur") {
        announcement.classList.add("hidden");
        announcementTab.classList.add("hidden");
        return;
    }

    // Fermer l'annonce
    announcementClose.addEventListener("click", () => {
        announcement.classList.add("hidden");
        announcementTab.classList.remove("hidden");
    });

    // Rouvrir l'annonce
    announcementTab.addEventListener("click", () => {
        announcement.classList.remove("hidden");
        announcementTab.classList.add("hidden");
    });

});

const currentAnnouncement = announcements[announcements.length - 1];

document.getElementById("announcement-title").textContent =
    currentAnnouncement.title;

document.getElementById("announcement-message").textContent =
    currentAnnouncement.message;

document.getElementById("announcement-button-text").textContent =
    currentAnnouncement.buttonText;

document.getElementById("announcement-button").href =
    currentAnnouncement.buttonUrl;

/*
 * =========================================================
 * CONFETTIS SUR L'ACCUEIL
 * =========================================================
 */

function launchIndexConfetti() {

    const canvas = document.createElement("canvas");

    canvas.className = "index-confetti-canvas";

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];

    const colors = [
        "#6366f1",
        "#8b5cf6",
        "#22c55e",
        "#facc15",
        "#f97316",
        "#ec4899",
        "#38bdf8"
    ];

    /*
     * Création des confettis
     */

    for (let i = 0; i < 100; i++) {

        particles.push({

            x:
                Math.random() *
                canvas.width,

            y:
                -20 -
                Math.random() *
                100,

            width:
                Math.random() * 6 + 3,

            height:
                Math.random() * 10 + 5,

            speedY:
                Math.random() * 3 + 2,

            speedX:
                Math.random() * 2 - 1,

            rotation:
                Math.random() *
                Math.PI *
                2,

            rotationSpeed:
                Math.random() *
                0.15 -
                0.075,

            color:
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ],

            opacity: 1

        });

    }


    function animate() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        particles.forEach((particle) => {

            particle.y +=
                particle.speedY;

            particle.x +=
                particle.speedX;

            particle.rotation +=
                particle.rotationSpeed;

            if (
                particle.y >
                canvas.height + 30
            ) {
                particle.opacity -= 0.04;
            }

            ctx.save();

            ctx.translate(
                particle.x,
                particle.y
            );

            ctx.rotate(
                particle.rotation
            );

            ctx.globalAlpha =
                particle.opacity;

            ctx.fillStyle =
                particle.color;

            ctx.fillRect(
                -particle.width / 2,
                -particle.height / 2,
                particle.width,
                particle.height
            );

            ctx.restore();

        });


        const remaining =
            particles.some(
                particle =>
                    particle.opacity > 0
            );

        if (remaining) {

            requestAnimationFrame(
                animate
            );

        } else {

            canvas.remove();

        }

    }


    animate();

}
