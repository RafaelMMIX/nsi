// ==============================
// MESSAGE DE BIENVENUE
// Affiché au plus une fois toutes les 20 minutes, si un prénom est enregistré.
// Le message change à chaque fois et dépend du moment de la journée.
// ==============================

(() => {
    const welcomeName = document.getElementById("welcome-name");
    if (!welcomeName) return;

    // Mode développeur : ?devWelcome=1 force le message (même sans prénom ni délai)
    const forced = localStorage.getItem("nsiDevMode") === "true" &&
        new URLSearchParams(window.location.search).get("devWelcome") === "1";
    const firstName = (localStorage.getItem("nsiFirstName") || "").trim() || (forced ? "Développeur" : "");
    const lastWelcome = Number(localStorage.getItem("nsiLastWelcome"));
    const now = Date.now();
    const cooldown = 20 * 60 * 1000; // 20 minutes

    if (!firstName || (!forced && lastWelcome && now - lastWelcome < cooldown)) return;

    const hour = new Date().getHours();
    const day = new Date().getDay(); // 0 = dimanche, 6 = samedi

    // Messages valables à toute heure
    const messages = [
        p => `Bienvenue à nouveau, ${p} ! 👋`,
        p => `Content de te revoir, ${p} ! 😄`,
        p => `${p} est de retour ! 🎉`,
        p => `Prêt à coder, ${p} ? 💻`,
        p => `On révise quoi aujourd'hui, ${p} ? 📚`,
        p => `Salut ${p}, un peu de NSI ? 🧠`,
        p => `Re-bonjour ${p} ! 🚀`,
        p => `Hello ${p} ! print("Bienvenue") 🐍`,
        p => `Ravi de te voir, ${p} ! ✨`,
        p => `${p}, le terminal t'attendait ! ⌨️`
    ];

    // Messages selon le moment de la journée
    if (hour >= 5 && hour < 12) {
        messages.push(p => `Bonjour ${p} ! ☀️`, p => `Bien réveillé, ${p} ? ☕`);
    } else if (hour >= 12 && hour < 18) {
        messages.push(p => `Bon après-midi, ${p} ! 🌤️`);
    } else if (hour >= 18 && hour < 23) {
        messages.push(p => `Bonsoir ${p} ! 🌙`, p => `Une petite session du soir, ${p} ? 🌆`);
    } else {
        messages.push(p => `Encore debout, ${p} ? 🦉`, p => `Session de nuit, ${p} ? 🌙`);
    }

    if (day === 0 || day === 6) {
        messages.push(p => `Même le week-end, ${p} ? Respect ! 💪`);
    } else if (day === 5 && hour >= 12) {
        messages.push(p => `Bientôt le week-end, ${p} ! 🎈`);
    }

    // Éviter de répéter le même message deux fois de suite
    const last = localStorage.getItem("nsiLastWelcomeMessage");
    let text;
    for (let i = 0; i < 5; i++) {
        text = messages[Math.floor(Math.random() * messages.length)](firstName);
        if (text !== last) break;
    }

    welcomeName.textContent = text;
    localStorage.setItem("nsiLastWelcome", String(now));
    localStorage.setItem("nsiLastWelcomeMessage", text);
})();
