const level = localStorage.getItem("nsiLevel");

const loadingText = document.getElementById("loading-text");

if (level === "premiere") {
    loadingText.textContent = "Préparation de ton espace de Première...";
} else if (level === "terminale") {
    loadingText.textContent = "Préparation de ton espace de Terminale...";
} else if (level === "professeur") {
    loadingText.textContent = "Préparation de l'espace professeur...";
}

setTimeout(() => {
    window.location.replace("index.html");
}, 1200);
