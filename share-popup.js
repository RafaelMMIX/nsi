document.addEventListener("DOMContentLoaded", () => {

    const popup = document.getElementById("share-popup");
    const closeButton = document.getElementById("share-popup-close");
    const copyButton = document.getElementById("share-copy");

    if (!popup || !closeButton || !copyButton) {
        return;
    }

    const devMode =
        localStorage.getItem("nsiDevMode") === "true";

    const today = new Date().toISOString().split("T")[0];

    const lastSharePopup =
        localStorage.getItem("nsiSharePopupDate");


    /*
     * En mode normal :
     * - 35 % de chance d'apparaître
     * - maximum une fois par jour
     *
     * En mode développeur :
     * - apparaît à chaque chargement
     */

    const shouldShow =
        devMode ||
        (
            lastSharePopup !== today &&
            Math.random() < 0.35
        );


    if (!shouldShow) {
        return;
    }


    // Petit délai pour éviter l'apparition instantanée
    setTimeout(() => {

        popup.classList.add("visible");

        localStorage.setItem(
            "nsiSharePopupDate",
            today
        );

    }, devMode ? 1000 : 8000);


    // Fermer
    closeButton.addEventListener("click", () => {
        popup.classList.remove("visible");
    });


    // Fermer en cliquant dehors
    popup.addEventListener("click", (event) => {

        if (event.target === popup) {
            popup.classList.remove("visible");
        }

    });


    // Copier le lien
    copyButton.addEventListener("click", async () => {

        try {

            await navigator.clipboard.writeText(
                window.location.href
            );

            copyButton.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Lien copié !
            `;

            setTimeout(() => {

                copyButton.innerHTML = `
                    <i class="fa-solid fa-link"></i>
                    Copier le lien
                `;

            }, 1800);

        } catch (error) {

            copyButton.innerHTML = `
                <i class="fa-solid fa-xmark"></i>
                Impossible de copier
            `;

        }

    });


    // Partage Discord
    const discordButton =
        document.querySelector('[data-share="discord"]');

    discordButton?.addEventListener("click", async (event) => {

        event.preventDefault();

        try {

            await navigator.clipboard.writeText(
                window.location.href
            );

            window.open(
                "https://discord.com/channels/@me",
                "_blank",
                "noopener,noreferrer"
            );

        } catch (error) {

            window.open(
                "https://discord.com/channels/@me",
                "_blank",
                "noopener,noreferrer"
            );

        }

    });


    // WhatsApp
    const whatsappButton =
        document.querySelector('[data-share="whatsapp"]');

    whatsappButton?.setAttribute(
        "href",
        `https://wa.me/?text=${encodeURIComponent(
            "Découvre NSI Hub : " + window.location.href
        )}`
    );


    // X
    const xButton =
        document.querySelector('[data-share="x"]');

    xButton?.setAttribute(
        "href",
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            "Découvrez NSI Hub !"
        )}&url=${encodeURIComponent(
            window.location.href
        )}`
    );

});
