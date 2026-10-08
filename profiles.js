(() => {
    const profiles = {
        snt: {
            label: "SNT",
            intro: "Ton espace met en avant les outils numériques et les ressources utiles pour découvrir le numérique.",
            sections: ["Recherche", "Apprendre", "Intelligence artificielle"]
        },
        premiere: {
            label: "Première",
            intro: "Retrouve rapidement les cours et ressources pour découvrir les bases de la NSI.",
            sections: ["Cours & Lycée", "Apprendre", "Développement"]
        },
        terminale: {
            label: "Terminale",
            intro: "Retrouve rapidement les ressources de Terminale et les outils pour préparer le Bac.",
            sections: ["Cours & Lycée", "Apprendre", "Développement"]
        },
        professeur: {
            label: "Professeur",
            intro: "Les ressources de cours et les outils pédagogiques sont accessibles depuis cet espace.",
            sections: ["Cours & Lycée", "Apprendre", "Développement"]
        }
    };

    const profile = profiles[localStorage.getItem("nsiLevel")];
    const welcome = document.getElementById("profile-welcome");
    if (!profile || !welcome) return;

    welcome.hidden = false;
    const content = document.createElement("div");
    content.className = "profile-welcome-copy";
    const title = document.createElement("strong");
    title.textContent = `Espace ${profile.label}`;
    const intro = document.createElement("p");
    intro.textContent = profile.intro;
    content.append(title, intro);

    const links = document.createElement("div");
    links.className = "profile-shortcuts";
    document.querySelectorAll(".home-container > .category").forEach((section, index) => {
        const heading = section.querySelector(".category-title h2");
        if (!heading || !profile.sections.includes(heading.textContent.trim())) return;
        const id = `profile-section-${index}`;
        section.id = id;
        const link = document.createElement("a");
        link.href = `#${id}`;
        link.textContent = heading.textContent.trim();
        links.append(link);
        section.classList.add("profile-recommended-section");
    });

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-compass";
    icon.setAttribute("aria-hidden", "true");
    welcome.append(icon, content, links);

    document.querySelectorAll(".category .card[data-profiles]").forEach(card => {
        if (card.dataset.profiles.split(/\s+/).includes(localStorage.getItem("nsiLevel"))) {
            card.classList.add("profile-recommended");
        }
    });
})();
