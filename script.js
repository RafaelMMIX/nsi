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