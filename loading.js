const level = localStorage.getItem("nsiLevel");

const loadingStatus = document.getElementById("loading-status");
const loadingTip = document.getElementById("loading-tip");
const progressBar = document.getElementById("loading-progress-bar");
const progressTrack = document.querySelector(".loading-progress");
const progressLabel = document.getElementById("loading-percent");
const loadingScreen = document.querySelector(".loading-screen");
const skipButton = document.getElementById("loading-skip");
const steps = [...document.querySelectorAll(".loading-step")];

const tips = {
    snt: ["Le Web repose sur des pages reliées par des liens.", "Un réseau relie des appareils pour échanger des informations.", "Les données personnelles doivent être protégées."],
    premiere: [
        "Python utilise l'indentation pour définir les blocs de code.",
        "Une liste Python peut contenir plusieurs types de données.",
        "Une fonction permet d'éviter de répéter du code.",
        "Git permet de conserver l'historique de tes modifications.",
        "Un algorithme décrit une méthode pour résoudre un problème.",
        "Une variable permet de stocker une valeur pour la réutiliser.",
        "Une boucle permet de répéter des instructions plusieurs fois.",
        "Une condition permet d'exécuter du code seulement si une situation est vraie.",
        "En Python, les indices d'une liste commencent à 0.",
        "Le débogage consiste à rechercher et corriger les erreurs d'un programme."
    ],

    terminale: [
        "Une base de données relationnelle organise les données en tables.",
        "SQL permet d'interroger et de modifier une base de données.",
        "La récursivité permet à une fonction de s'appeler elle-même.",
        "Un protocole définit des règles de communication entre machines.",
        "Un arbre est une structure de données composée de nœuds.",
        "Une clé primaire permet d'identifier chaque ligne de manière unique dans une table.",
        "Une requête SQL peut permettre de sélectionner, ajouter, modifier ou supprimer des données.",
        "Une pile fonctionne selon le principe LIFO : le dernier élément ajouté est le premier retiré.",
        "Une file fonctionne selon le principe FIFO : le premier élément ajouté est le premier retiré.",
        "Le routage permet de déterminer par quel chemin les données doivent circuler sur un réseau.",
        "Le chiffrement permet de rendre des données illisibles sans la clé appropriée.",
        "Une adresse IP permet d'identifier une interface sur un réseau.",
        "Un graphe est constitué de sommets reliés entre eux par des arêtes.",
        "La complexité d'un algorithme permet d'étudier l'évolution de son coût lorsque la taille des données augmente."
    ],

    professeur: [
        "NSI Hub centralise les ressources utiles pour l'enseignement de NSI.",
        "Les annonces importantes peuvent être diffusées directement aux élèves.",
        "Les données locales du site restent stockées dans le navigateur.",
        "Le contenu de NSI Hub évolue régulièrement.",
        "Vous pouvez proposer une idée ou signaler un problème depuis le site.",
        "Les ressources peuvent être organisées par niveau pour faciliter leur accès.",
        "Un écran de chargement permet de préparer l'espace correspondant au profil sélectionné.",
        "Les favoris permettent aux élèves de retrouver rapidement leurs ressources les plus utilisées.",
        "Le site fonctionne principalement côté client, directement dans le navigateur.",
        "Les paramètres et préférences de NSI Hub peuvent être conservés localement sur l'appareil.",
        "Le mode développeur permet de tester plus facilement certaines fonctionnalités du site.",
        "Une bonne ressource pédagogique doit rester accessible, claire et facilement identifiable."
    ]
};

const statusMessages = {
    snt: ["Préparation de ton espace SNT...", "Chargement des ressources...", "Préparation des outils...", "Organisation de ton espace...", "Vérification des ressources...", "Mise en place des outils numériques...", "Finalisation de ton espace...", "Presque prêt..."],
    premiere: [
        "Préparation de ton espace de Première...",
        "Chargement des ressources...",
        "Préparation des outils...",
        "Organisation de ton espace...",
        "Vérification des ressources...",
        "Mise en place des outils NSI...",
        "Finalisation de ton espace...",
        "Presque prêt..."
    ],

    terminale: [
        "Préparation de ton espace de Terminale...",
        "Chargement des ressources...",
        "Préparation des outils...",
        "Organisation des ressources de Terminale...",
        "Vérification des outils...",
        "Préparation des ressources NSI...",
        "Finalisation de ton espace...",
        "Presque prêt..."
    ],

    professeur: [
        "Préparation de l'espace professeur...",
        "Chargement des ressources pédagogiques...",
        "Préparation des outils...",
        "Organisation de l'espace enseignant...",
        "Vérification des ressources pédagogiques...",
        "Préparation des fonctionnalités...",
        "Finalisation de l'espace professeur...",
        "Presque prêt..."
    ]
};

const selectedTips = tips[level] || tips.premiere;
const selectedStatuses = statusMessages[level] || statusMessages.premiere;

// Tip aléatoire
loadingTip.textContent = selectedTips[Math.floor(Math.random() * selectedTips.length)];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const duration = prefersReducedMotion ? 700 : 3200;
const statusMilestones = [22, 48, 74, 92];
const statusIndexes = [1, 2, 4, 6];
let currentStatus = 0;
let animationFrame;
let hasRedirected = false;

function redirectToHome() {
    if (hasRedirected) return;
    hasRedirected = true;
    cancelAnimationFrame(animationFrame);
    window.location.replace("index.html");
}

function updateStatus(message) {
    loadingStatus.classList.remove("is-changing");
    void loadingStatus.offsetWidth;
    loadingStatus.textContent = message;
    loadingStatus.classList.add("is-changing");
}

function updateProgress(value) {
    const progress = Math.min(100, Math.floor(value));
    progressBar.style.width = `${progress}%`;
    progressTrack.setAttribute("aria-valuenow", String(progress));
    progressLabel.textContent = `${progress} %`;

    const activeStep = Math.min(2, Math.floor(progress / 34));
    steps.forEach((step, index) => {
        step.classList.toggle("active", index === activeStep && progress < 100);
        step.classList.toggle("done", index < activeStep || progress === 100);
    });
}

function completeLoading() {
    updateProgress(100);
    updateStatus("Ton espace est prêt !");
    loadingScreen.classList.add("is-complete");
    document.querySelector(".loading-core i").className = "fa-solid fa-check";
    skipButton.hidden = true;
    window.setTimeout(redirectToHome, prefersReducedMotion ? 100 : 400);
}

function animateLoading(startTime) {
    if (hasRedirected) return;

    const elapsed = performance.now() - startTime;
    const progress = Math.min(100, (elapsed / duration) * 100);
    updateProgress(progress);

    while (currentStatus < statusMilestones.length && progress >= statusMilestones[currentStatus]) {
        updateStatus(selectedStatuses[statusIndexes[currentStatus]]);
        currentStatus += 1;
    }

    if (progress >= 100) {
        completeLoading();
        return;
    }

    animationFrame = requestAnimationFrame(() => animateLoading(startTime));
}

skipButton.addEventListener("click", redirectToHome);
animationFrame = requestAnimationFrame(animateLoading.bind(null, performance.now()));
