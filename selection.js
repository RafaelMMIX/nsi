const levelCards =
    document.querySelectorAll(".level-card");


levelCards.forEach(card => {

    card.addEventListener("click", () => {

        const level =
            card.dataset.level;


        // Sauvegarde du niveau
        localStorage.setItem(
            "nsiLevel",
            level
        );


        // Direction vers l'accueil
        window.location.href =
            "index.html";

    });

});