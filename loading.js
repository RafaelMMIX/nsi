const level = localStorage.getItem("nsiLevel");

const loadingStatus = document.getElementById("loading-status");
const loadingTip = document.getElementById("loading-tip");
const progressBar = document.getElementById("loading-progress-bar");

const tips = {
    premiere: [
        "Python utilise l'indentation pour définir les blocs de code.",
        "Une liste Python peut contenir plusieurs types de données.",
        "Une fonction permet d'éviter de répéter du code.",
        "Git permet de conserver l'historique de tes modifications.",
        "Un algorithme décrit une méthode pour résoudre un problème."
    ],

    terminale: [
        "Une base de données relationnelle organise les données en tables.",
        "SQL permet d'interroger et de modifier une base de données.",
        "La récursivité permet à une fonction de s'appeler elle-même.",
        "Un protocole définit des règles de communication entre machines.",
        "Un arbre est une structure de données composée de nœuds."
    ],

    professeur: [
        "NSI Hub centralise les ressources utiles pour l'enseignement de NSI.",
        "Les annonces importantes peuvent être diffusées directement aux élèves.",
        "Les données locales du site restent stockées dans le navigateur.",
        "Le contenu de NSI Hub évolue régulièrement.",
        "Vous pouvez proposer une idée ou signaler un problème depuis le site."
    ]
};

const statusMessages = {
    premiere: [
        "Préparation de ton espace de Première...",
        "Chargement des ressources...",
        "Préparation des outils...",
        "Presque prêt..."
    ],

    terminale: [
        "Préparation de ton espace de Terminale...",
        "Chargement des ressources...",
        "Préparation des outils...",
        "Presque prêt..."
    ],

    professeur: [
        "Préparation de l'espace professeur...",
        "Chargement des ressources pédagogiques...",
        "Préparation des outils...",
        "Presque prêt..."
    ]
};

const selectedTips = tips[level] || tips.premiere;
const selectedStatuses = statusMessages[level] || statusMessages.premiere;

// Tip aléatoire
loadingTip.textContent =
    selectedTips[Math.floor(Math.random() * selectedTips.length)];

let progress = 0;
let statusIndex = 0;

const interval = setInterval(() => {

    progress += Math.floor(Math.random() * 8) + 3;

    if (progress > 100) {
        progress = 100;
    }

    progressBar.style.width = `${progress}%`;

    // Change le texte à différents moments
    if (progress >= 25 && statusIndex === 0) {
        statusIndex = 1;
        loadingStatus.textContent = selectedStatuses[1];
    }

    if (progress >= 55 && statusIndex === 1) {
        statusIndex = 2;
        loadingStatus.textContent = selectedStatuses[2];
    }

    if (progress >= 80 && statusIndex === 2) {
        statusIndex = 3;
        loadingStatus.textContent = selectedStatuses[3];
    }

    if (progress >= 100) {
        clearInterval(interval);

        setTimeout(() => {
            window.location.replace("index.html");
        }, 500);
    }

}, 120);
