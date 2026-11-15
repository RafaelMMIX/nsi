document.addEventListener("DOMContentLoaded", () => {

    const popup = document.getElementById("ent-popup");
    const closeButton = document.getElementById("ent-popup-close");
    const continueButton = document.getElementById("ent-popup-continue");

    const protectedLinks = document.querySelectorAll(".ent-protected-link");

    if (!popup || !closeButton || !continueButton) {
        return;
    }

    let pendingLink = null;

    const today = new Date().toISOString().split("T")[0];
    const lastPopupDate = localStorage.getItem("nsiEntPopupDate");
    const devMode = localStorage.getItem("nsiDevMode") === "true";

    function closePopup() {
        popup.classList.remove("visible");

        localStorage.setItem("nsiEntPopupDate", today);

        if (pendingLink) {
            window.open(
                pendingLink.href,
                pendingLink.target === "_blank" ? "_blank" : "_self"
            );

            pendingLink = null;
        }
    }

    protectedLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            if (lastPopupDate === today && !devMode) {
                return;
            }

            event.preventDefault();

            pendingLink = link;

            popup.classList.add("visible");
        });

    });


    closeButton.addEventListener("click", () => {
    popup.classList.remove("visible");
    pendingLink = null;

    localStorage.setItem("nsiEntPopupDate", today);
    });

    popup.addEventListener("click", (event) => {

    if (event.target === popup) {
        popup.classList.remove("visible");
        pendingLink = null;

        localStorage.setItem("nsiEntPopupDate", today);
    }

    });


    continueButton.addEventListener("click", () => {
        closePopup();
    });


    // Mode développeur : ?devPopup=ent ouvre le rappel ENT directement
    if (devMode && new URLSearchParams(window.location.search).get("devPopup") === "ent") {
        setTimeout(() => popup.classList.add("visible"), 300);
    }


    popup.addEventListener("click", (event) => {

        if (event.target === popup) {
            closePopup();
        }

    });

});
