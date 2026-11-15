"use strict";

/* =========================================================
   NSI HUB — PRÉFÉRENCES D'AFFICHAGE
   Chargé dans le <head> de chaque page, avant l'affichage,
   pour appliquer le thème et les animations sans clignotement.
   - nsiTheme      : "sombre" (par défaut), "clair" ou "auto"
   - nsiAnimations : "false" pour couper les animations
   Charge aussi horaires.js (rappels de cours) si les notifications sont activées.
   ========================================================= */

(function () {
    const root = document.documentElement;
    const systemLight = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
    const systemReduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

    function read(key) {
        try { return localStorage.getItem(key); } catch (_) { return null; }
    }

    function themeChoice() {
        const value = read("nsiTheme");
        return value === "clair" || value === "auto" ? value : "sombre";
    }

    function resolvedTheme() {
        const choice = themeChoice();
        if (choice === "auto") return systemLight && systemLight.matches ? "clair" : "sombre";
        return choice;
    }

    function animationsDisabled() {
        return read("nsiAnimations") === "false";
    }

    function apply() {
        const light = resolvedTheme() === "clair";
        root.classList.toggle("theme-light", light);
        root.style.colorScheme = light ? "light" : "dark";
        root.classList.toggle("no-animations", animationsDisabled());
    }

    apply();

    // Suivre le thème du système en mode automatique
    if (systemLight) {
        const onChange = () => { if (themeChoice() === "auto") apply(); };
        if (systemLight.addEventListener) systemLight.addEventListener("change", onChange);
        else if (systemLight.addListener) systemLight.addListener(onChange);
    }

    // Appliquer immédiatement un changement fait dans un autre onglet
    window.addEventListener("storage", event => {
        if (event.key === "nsiTheme" || event.key === "nsiAnimations" || event.key === null) apply();
    });

    // Rappels de cours de NSI : chargés sur chaque page quand les notifications sont activées
    try {
        const horaires = JSON.parse(read("nsiHoraires"));
        if (horaires && horaires.notifications === true) {
            const script = document.createElement("script");
            script.src = "horaires.js";
            document.head.appendChild(script);
        }
    } catch (_) {}

    window.nsiPreferences = {
        apply,
        themeChoice,
        resolvedTheme,
        animationsDisabled,
        // Vrai si les animations doivent être évitées (réglage du site ou du système)
        reducedMotion: () => animationsDisabled() || !!(systemReduced && systemReduced.matches)
    };
})();
