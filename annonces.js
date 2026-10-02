document.addEventListener("DOMContentLoaded", () => {

    const currentContainer =
        document.getElementById("current-announcement");

    const oldContainer =
        document.getElementById("old-announcements");


    if (!currentContainer || !oldContainer) {
        return;
    }


    if (!announcements || announcements.length === 0) {

        currentContainer.innerHTML = `
            <div class="no-announcements">
                <i class="fa-regular fa-bell-slash"></i>
                <p>Aucune annonce pour le moment.</p>
            </div>
        `;

        return;
    }


    // ==============================
    // ANNONCE ACTUELLE
    // ==============================

    const current = announcements[0];

    currentContainer.innerHTML = `

        <article class="current-announcement">

            <div class="current-announcement-icon">
                <i class="fa-solid fa-bullhorn"></i>
            </div>

            <div class="current-announcement-content">

                <span class="announcement-label">
                    INFORMATION
                </span>

                <h2>${current.title}</h2>

                <p>${current.message}</p>

                <div class="announcement-meta">
                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${current.date}
                    </span>
                </div>

                ${
                    current.buttonText
                        ? `
                            <a
                                href="${current.buttonUrl}"
                                class="announcement-page-button"
                            >
                                ${current.buttonText}
                                <i class="fa-solid fa-arrow-right"></i>
                            </a>
                        `
                        : ""
                }

            </div>

        </article>

    `;


    // ==============================
    // ANCIENNES ANNONCES
    // ==============================

    const oldAnnouncements = announcements.slice(1);


    if (oldAnnouncements.length === 0) {

        oldContainer.innerHTML = `
            <div class="no-old-announcements">
                Aucune ancienne annonce.
            </div>
        `;

        return;
    }


    oldAnnouncements.forEach((announcement) => {

        const article = document.createElement("article");

        article.className = "old-announcement";

        article.innerHTML = `

            <div class="old-announcement-icon">
                <i class="fa-solid fa-bullhorn"></i>
            </div>

            <div class="old-announcement-content">

                <h3>${announcement.title}</h3>

                <p>${announcement.message}</p>

                <span class="old-announcement-date">
                    <i class="fa-regular fa-calendar"></i>
                    ${announcement.date}
                </span>

            </div>

        `;

        oldContainer.appendChild(article);

    });

});
