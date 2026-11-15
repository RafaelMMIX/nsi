"use strict";

/* =========================================================
   NSI HUB — PAGE 404
   Terminal, easter eggs, chasse aux bugs, anecdotes et blagues.
   Les easter eggs trouvés sont gardés dans nsiEasterEggs.
   ========================================================= */

(() => {
    const $ = id => document.getElementById(id);
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const reduced = () => (window.nsiPreferences ? window.nsiPreferences.reducedMotion() : false);
    const storage = {
        get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; } },
        set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
    };

    const requested = decodeURIComponent(location.pathname.replace(/^\/nsi\//, "/")) || "/";

    /* =====================================================
       CONTENUS
       ===================================================== */

    const SUBTITLES = [
        "Cette page est partie en récursion sans cas de base.",
        "IndexError : page index out of range.",
        "Le ramasse-miettes est passé par là : cette page n'est plus référencée.",
        "Même avec une recherche dichotomique, impossible de la trouver.",
        "Quelqu'un a lancé DELETE FROM pages; … sans WHERE.",
        "Le paquet s'est perdu quelque part entre deux routeurs.",
        "Cette page a pris un aller simple vers /dev/null.",
        "Même l'algorithme de Dijkstra ne trouve aucun chemin vers cette page.",
        "Erreur 404 : page introuvable. Erreur 405 : excuse introuvable.",
        "Cette page existe peut-être dans un univers parallèle. Pas dans celui-ci.",
        "On a cherché dans la pile, dans la file et même dans l'arbre. Rien.",
        "NoneType object has no attribute 'page'."
    ];

    const FACTS = [
        "Le code 404 vient du protocole HTTP : les codes en 4xx désignent une erreur côté client, et 404 signifie « ressource introuvable ».",
        "Une légende raconte que le nom 404 viendrait d'un bureau 404 du CERN où se trouvait le premier serveur web. C'est un mythe : les codes HTTP ont simplement été numérotés par catégories.",
        "Le code 418 « I'm a teapot » (« je suis une théière ») vient d'un poisson d'avril de 1998 : la RFC 2324, qui décrit un protocole pour piloter des cafetières.",
        "En 1947, l'équipe de Grace Hopper a trouvé un papillon de nuit coincé dans l'ordinateur Harvard Mark II. Il a été collé dans le journal de bord comme « premier vrai cas de bug trouvé ».",
        "Ada Lovelace a écrit en 1843 ce que l'on considère comme le premier programme informatique, pour la machine analytique de Charles Babbage, qui n'a jamais été construite.",
        "Le tout premier site web, mis en ligne par Tim Berners-Lee au CERN en 1991, est toujours accessible à l'adresse info.cern.ch.",
        "Le langage Python ne doit pas son nom au serpent mais aux Monty Python, une troupe d'humoristes britanniques.",
        "Le premier courriel a été envoyé en 1971 par Ray Tomlinson. C'est lui qui a choisi le symbole @ pour séparer le nom de l'ordinateur.",
        "Le mot « robot » vient de la pièce de théâtre R.U.R. de l'écrivain tchèque Karel Čapek, en 1920.",
        "Le code HTTP 451 signifie « indisponible pour raisons légales ». Son numéro est un clin d'œil au roman Fahrenheit 451 de Ray Bradbury.",
        "404 s'écrit 110010100 en binaire, 0x194 en hexadécimal et 624 en octal.",
        "Alan Turing a proposé en 1950 un test pour savoir si une machine peut se faire passer pour un humain dans une conversation : le test de Turing."
    ];

    const JOKES = [
        "Il y a 10 sortes de personnes : celles qui comprennent le binaire et les autres.",
        "Pourquoi les informaticiens confondent Halloween et Noël ? Parce que OCT 31 = DEC 25.",
        "Une requête SQL entre dans un bar, s'approche de deux tables et demande : « Je peux vous joindre ? »",
        "— Ça marche sur ma machine.\n— Très bien, alors on livre ta machine.",
        "Combien faut-il de programmeurs pour changer une ampoule ? Aucun : c'est un problème matériel.",
        "Pour comprendre la récursivité, il faut d'abord comprendre la récursivité.",
        "Mon code ne marche pas et je ne sais pas pourquoi. Mon code marche et je ne sais pas pourquoi non plus.",
        "Un octet rencontre un bit : « Ça va ? Tu as l'air un peu à 0. »",
        "Il y a deux choses difficiles en informatique : nommer les choses, invalider le cache et les erreurs de décalage d'un."
    ];

    const PAGES = [
        { href: "index.html", label: "Accueil", icon: "fa-solid fa-house", words: "accueil index home maison" },
        { href: "notebooks.html", label: "Notebooks", icon: "fa-solid fa-book-open", words: "notebook notebooks python sql jupyter cahier" },
        { href: "jeux.html", label: "Quiz & Jeux", icon: "fa-solid fa-gamepad", words: "jeux jeu quiz qcm game" },
        { href: "dico.html", label: "Dictionnaire", icon: "fa-solid fa-book", words: "dico dictionnaire definition lexique" },
        { href: "outils.html", label: "Outils", icon: "fa-solid fa-screwdriver-wrench", words: "outils outil convertisseur binaire ascii tools" },
        { href: "prompt.html", label: "Prompts", icon: "fa-solid fa-robot", words: "prompt prompts ia chatgpt claude" },
        { href: "statistiques.html", label: "Statistiques", icon: "fa-solid fa-chart-pie", words: "statistiques stats stat" },
        { href: "parametres.html", label: "Paramètres", icon: "fa-solid fa-gear", words: "parametres reglages settings options" },
        { href: "changelog.html", label: "Nouveautés", icon: "fa-solid fa-clock-rotate-left", words: "changelog nouveautes versions" },
        { href: "annonces.html", label: "Annonces", icon: "fa-solid fa-bullhorn", words: "annonces annonce news" },
        { href: "about.html", label: "À propos", icon: "fa-solid fa-circle-info", words: "about apropos propos projet" }
    ];

    const EGGS = [
        { id: "konami", name: "Code secret", hint: "↑ ↑ ↓ ↓ ← → ← → B A" },
        { id: "sudo", name: "Super-utilisateur", hint: "Demande les pleins pouvoirs dans le terminal." },
        { id: "rm", name: "Apprenti destructeur", hint: "La commande la plus dangereuse d'un terminal Linux…" },
        { id: "teapot", name: "Je suis une théière", hint: "Commande une boisson chaude." },
        { id: "matrix", name: "Pilule rouge", hint: "Il paraît qu'il pleut des 0 et des 1." },
        { id: "42", name: "La grande question", hint: "La réponse à la vie, l'univers et le reste." },
        { id: "binaire", name: "Changement de base", hint: "Le 404 n'aime pas qu'on clique sur lui trop souvent." },
        { id: "bugs", name: "Exterminateur", hint: "Écrase au moins 15 bugs en une partie." },
        { id: "console", name: "Fouineur", hint: "Les développeurs regardent toujours dans la console." },
        { id: "hello", name: "Premier programme", hint: "Le programme que tout le monde écrit en premier." },
        { id: "ping", name: "Pong", hint: "Vérifie si une machine répond." },
        { id: "nuit", name: "Noctambule", hint: "Visite cette page au milieu de la nuit." }
    ];

    /* =====================================================
       EASTER EGGS
       ===================================================== */

    const found = new Set(storage.get("nsiEasterEggs", []));

    function renderEggs() {
        $("e404-egg-count").textContent = `${found.size} / ${EGGS.length}`;
        $("e404-egg-bar").style.width = `${found.size / EGGS.length * 100}%`;
        $("e404-eggs").innerHTML = EGGS.map(egg => found.has(egg.id)
            ? `<li class="found"><i class="fa-solid fa-circle-check"></i> ${escapeHTML(egg.name)}</li>`
            : `<li tabindex="0" title="${escapeHTML(egg.hint)}"><i class="fa-solid fa-lock"></i> ??? <span>${escapeHTML(egg.hint)}</span></li>`).join("");
    }

    let toastTimer = null;
    function toast(html) {
        const box = $("e404-toast");
        box.innerHTML = html;
        box.classList.add("visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => box.classList.remove("visible"), 3500);
    }

    function unlock(id) {
        if (found.has(id)) return;
        const egg = EGGS.find(e => e.id === id);
        if (!egg) return;
        found.add(id);
        storage.set("nsiEasterEggs", [...found]);
        renderEggs();
        toast(`<i class="fa-solid fa-egg"></i> Easter egg trouvé : <strong>${escapeHTML(egg.name)}</strong> (${found.size} / ${EGGS.length})${found.size === EGGS.length ? " 🏆 Tu les as tous trouvés !" : ""}`);
        if (found.size === EGGS.length) confetti();
    }

    /* =====================================================
       HAUT DE PAGE
       ===================================================== */

    $("e404-subtitle").textContent = pick(SUBTITLES);
    $("e404-back").addEventListener("click", () => {
        if (history.length > 1) history.back();
        else location.href = "index.html";
    });

    // Traceback façon Python, avec l'adresse demandée
    $("e404-traceback").innerHTML = [
        '<span class="t-muted">Traceback (most recent call last):</span>',
        `  File <span class="t-string">"nsi-hub/routeur.py"</span>, line <span class="t-number">404</span>, in <span class="t-func">afficher_page</span>`,
        `    page = site.pages[<span class="t-string">${escapeHTML(JSON.stringify(requested))}</span>]`,
        `<span class="t-error">PageIntrouvableError</span>: la page ${escapeHTML(JSON.stringify(requested))} n'existe pas (ou plus).`,
        '<span class="t-muted"># Astuce : vérifie l\'adresse, ou utilise les liens ci-dessous.</span>'
    ].join("\n");

    // Clics sur le 404 : changement de base
    const code = $("e404-code");
    const bases = ["404", "0x194", "0o624", "110010100", "CDIV", "404"];
    let clicks = 0;
    code.addEventListener("click", () => {
        clicks += 1;
        code.classList.remove("pop");
        void code.offsetWidth;
        code.classList.add("pop");
        if (clicks >= 7) {
            const value = bases[(clicks - 7) % bases.length];
            code.textContent = value;
            code.dataset.text = value;
            code.classList.toggle("small", value.length > 5);
            unlock("binaire");
        }
    });

    /* =====================================================
       SUGGESTIONS DE PAGES
       ===================================================== */

    function distance(a, b) {
        const row = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            let previous = row[0];
            row[0] = i;
            for (let j = 1; j <= b.length; j++) {
                const temp = row[j];
                row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
                previous = temp;
            }
        }
        return row[b.length];
    }

    function suggestions() {
        const word = requested.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
            .split("/").filter(Boolean).pop()?.replace(/\.(html?|php)$/, "") || "";
        if (!word) return PAGES.slice(0, 4);
        const scored = PAGES.map(page => {
            const candidates = [page.href.replace(".html", ""), ...page.words.split(" ")];
            const best = Math.min(...candidates.map(c => c.includes(word) || word.includes(c) ? 0 : distance(word, c) / Math.max(word.length, c.length)));
            return { page, best };
        }).sort((a, b) => a.best - b.best);
        const good = scored.filter(s => s.best <= 0.45).map(s => s.page);
        return [...good, ...PAGES.filter(p => !good.includes(p))].slice(0, 4);
    }

    $("e404-links").innerHTML = suggestions().map(page =>
        `<a href="${page.href}" class="e404-link"><i class="${page.icon}"></i><span>${escapeHTML(page.label)}</span></a>`).join("");

    /* =====================================================
       ANECDOTES
       ===================================================== */

    let factIndex = Math.floor(Math.random() * FACTS.length);
    const showFact = () => { $("e404-fact").textContent = FACTS[factIndex]; };
    $("e404-next-fact").addEventListener("click", () => {
        factIndex = (factIndex + 1) % FACTS.length;
        showFact();
    });
    showFact();

    /* =====================================================
       TERMINAL
       ===================================================== */

    const output = $("e404-term-output");
    const input = $("e404-term-input");
    const commandHistory = [];
    let historyIndex = 0;

    function print(text, className = "") {
        const line = document.createElement("div");
        line.className = `t-line ${className}`;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
        return line;
    }

    function printHTML(html, className = "") {
        const line = document.createElement("div");
        line.className = `t-line ${className}`;
        line.innerHTML = html;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    const COMMANDS = {
        help: "affiche cette aide",
        ls: "liste les fichiers",
        cd: "change de dossier (essaie : cd accueil)",
        pwd: "affiche le dossier courant",
        whoami: "qui es-tu ?",
        date: "date et heure",
        echo: "répète un texte",
        cat: "affiche un fichier",
        blague: "une blague d'informaticien",
        anecdote: "une anecdote d'histoire de l'informatique",
        jeu: "lance la chasse aux bugs",
        eggs: "easter eggs trouvés",
        version: "version de NSI Hub",
        history: "commandes déjà tapées",
        clear: "efface le terminal",
        accueil: "retourne à l'accueil"
    };

    const FILES = {
        "accueil.html": "<!-- La page d'accueil. Tape « cd accueil » pour y aller. -->",
        "secret.txt": "Bien essayé ! Le vrai secret se trouve… dans la console de ton navigateur (F12). 😉",
        "page-introuvable.html": "cat: page-introuvable.html: Aucun fichier ou dossier de ce type (erreur 404)",
        "readme.md": "# NSI Hub\nTout ce qu'il te faut pour la NSI.\nTape « help » pour la liste des commandes."
    };

    function run(raw) {
        const line = raw.trim();
        printHTML(`<span class="e404-prompt">invite@nsi-hub:~$</span> ${escapeHTML(line)}`, "t-command");
        if (!line) return;
        commandHistory.push(line);
        historyIndex = commandHistory.length;

        const lower = line.toLowerCase();
        const [command, ...args] = lower.split(/\s+/);
        const rest = line.slice(line.indexOf(" ") + 1);

        // Easter eggs reconnus quelle que soit la syntaxe exacte
        if (/^sudo\b/.test(lower)) {
            print("[sudo] mot de passe pour invite : ********", "t-muted");
            print("invite n'apparaît pas dans le fichier sudoers. Cet incident sera signalé. 🚨", "t-error");
            print("(Bon, en vrai, personne ne sera prévenu.)", "t-muted");
            unlock("sudo");
            return;
        }
        if (/^rm\s+-(rf|fr)\b/.test(lower)) {
            unlock("rm");
            fakeDelete();
            return;
        }
        if (/^(coffee|cafe|café|the|thé|tea|make coffee)(\s|$)/.test(lower)) {
            print("HTTP/1.1 418 I'm a teapot", "t-error");
            print("Je suis une théière : impossible de préparer du café. ☕🫖", "t-muted");
            unlock("teapot");
            return;
        }
        if (lower === "42" || /grande question|sens de la vie/.test(lower)) {
            print("42. C'est la réponse à la grande question sur la vie, l'univers et le reste.", "t-success");
            print("Le problème, c'est que personne ne se souvient de la question.", "t-muted");
            unlock("42");
            return;
        }
        if (/^print\s*\(\s*["']hello,? world!?["']\s*\)$/i.test(line) || lower === "hello world" || lower === "python") {
            if (lower === "python") print("Python 3.12 (NSI Hub) — tape print(\"Hello World\") pour tester.", "t-muted");
            else {
                print("Hello World", "t-success");
                print("Ton tout premier programme… sur une page 404. Ça compte quand même !", "t-muted");
                unlock("hello");
            }
            return;
        }

        switch (command) {
            case "help":
            case "aide":
                print("Commandes disponibles :");
                Object.entries(COMMANDS).forEach(([name, description]) => print(`  ${name.padEnd(10)} ${description}`, "t-muted"));
                print("Il existe aussi des commandes cachées… 👀", "t-muted");
                break;
            case "ls":
            case "dir":
                print("accueil.html   notebooks/   quiz/   dico/   readme.md   secret.txt   page-introuvable.html");
                break;
            case "pwd":
                print(`/home/invite${requested}`);
                break;
            case "cd": {
                const target = (args[0] || "").replace(/\/$/, "");
                const page = PAGES.find(p => p.words.split(" ").includes(target) || p.href.replace(".html", "") === target);
                if (!target || target === "~") print("Tu es déjà dans ton dossier personnel… perdu, mais chez toi.");
                else if (target === "..") { print("Retour en arrière…", "t-muted"); setTimeout(() => $("e404-back").click(), 500); }
                else if (page) { print(`Direction ${page.label}…`, "t-success"); setTimeout(() => { location.href = page.href; }, 500); }
                else print(`cd: ${args[0]}: dossier introuvable (décidément, c'est une manie ici)`, "t-error");
                break;
            }
            case "whoami": {
                const name = localStorage.getItem("nsiFirstName");
                const levels = { snt: "élève de SNT", premiere: "élève de Première NSI", terminale: "élève de Terminale NSI", professeur: "professeur" };
                const level = levels[localStorage.getItem("nsiLevel")];
                print(name ? `${name}${level ? `, ${level}` : ""}. Et visiblement un peu perdu.` : `invite${level ? ` (${level})` : ""}. Ajoute ton prénom dans les Paramètres !`);
                break;
            }
            case "date":
                print(new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "medium" }));
                break;
            case "echo":
                print(args.length ? rest : "");
                break;
            case "cat": {
                const file = (args[0] || "").toLowerCase();
                if (!file) print("cat: il manque le nom du fichier (essaie : cat readme.md)", "t-error");
                else if (FILES[file]) FILES[file].split("\n").forEach(l => print(l, file === "page-introuvable.html" ? "t-error" : ""));
                else print(`cat: ${args[0]}: fichier introuvable`, "t-error");
                break;
            }
            case "blague":
            case "joke":
                pick(JOKES).split("\n").forEach(l => print(l));
                break;
            case "anecdote":
            case "fact":
                print(pick(FACTS));
                break;
            case "jeu":
            case "game":
            case "bugs":
                print("Lancement de la chasse aux bugs… 🐛", "t-success");
                setTimeout(startGame, 400);
                break;
            case "eggs":
            case "oeufs":
                print(`Easter eggs trouvés : ${found.size} / ${EGGS.length}`);
                EGGS.forEach(egg => print(`  ${found.has(egg.id) ? "✔" : "·"} ${found.has(egg.id) ? egg.name : "???"}`, found.has(egg.id) ? "t-success" : "t-muted"));
                break;
            case "version":
                print(`NSI Hub v${typeof NSI_HUB_VERSION !== "undefined" ? NSI_HUB_VERSION : "?"}`);
                break;
            case "history":
                commandHistory.forEach((c, i) => print(`  ${String(i + 1).padStart(3)}  ${c}`, "t-muted"));
                break;
            case "clear":
            case "cls":
                output.innerHTML = "";
                break;
            case "accueil":
            case "home":
                print("Retour à l'accueil…", "t-success");
                setTimeout(() => { location.href = "index.html"; }, 500);
                break;
            case "matrix":
                print("Réveille-toi… 🐇", "t-success");
                unlock("matrix");
                setTimeout(startMatrix, 300);
                break;
            case "ping": {
                const host = args[0] || "page-introuvable.nsi";
                print(`PING ${host} : 56 octets de données`);
                let sent = 0;
                const timer = setInterval(() => {
                    sent += 1;
                    if (sent < 4) print(`64 octets de ${host} : icmp_seq=${sent} temps=${(Math.random() * 40 + 4).toFixed(1)} ms`, "t-muted");
                    else {
                        clearInterval(timer);
                        print("icmp_seq=4 : paquet perdu… sans doute parti chercher la page 404. 🏓", "t-error");
                        print("--- 4 paquets envoyés, 3 reçus, 25 % de perte ---");
                        unlock("ping");
                    }
                }, 350);
                break;
            }
            case "konami":
                print("Il faut le taper avec les flèches du clavier, pas dans le terminal : ↑ ↑ ↓ ↓ ← → ← → B A", "t-muted");
                break;
            case "exit":
            case "quit":
                print("Il n'y a pas de sortie… sauf la commande « accueil ». 🚪", "t-muted");
                break;
            case "vim":
            case "nano":
            case "emacs":
                print(`${command} : on ne t'a pas appris comment en sortir ? Mieux vaut ne pas l'ouvrir. 😅`, "t-muted");
                break;
            default: {
                const known = [...Object.keys(COMMANDS), "matrix", "ping"];
                const close = known.map(k => [k, distance(command, k)]).sort((a, b) => a[1] - b[1])[0];
                print(`${command} : commande introuvable${close && close[1] <= 2 ? `. Tu voulais dire « ${close[0]} » ?` : ". Tape « help » pour la liste des commandes."}`, "t-error");
            }
        }
    }

    function fakeDelete() {
        const steps = ["Suppression de /bin…", "Suppression de /home/invite/devoirs…", "Suppression de /nsi-hub/notebooks…", "Suppression de l'univers…"];
        input.disabled = true;
        steps.forEach((step, i) => setTimeout(() => print(step, "t-error"), 350 * (i + 1)));
        setTimeout(() => {
            print("…", "t-muted");
            print("Rien n'a été supprimé, ouf ! Ne tape JAMAIS ça sur un vrai ordinateur. 😱", "t-success");
            input.disabled = false;
            input.focus();
        }, 350 * (steps.length + 2));
    }

    $("e404-term-form").addEventListener("submit", event => {
        event.preventDefault();
        run(input.value);
        input.value = "";
    });

    input.addEventListener("keydown", event => {
        if (event.key === "ArrowUp" && commandHistory.length) {
            event.preventDefault();
            historyIndex = Math.max(0, historyIndex - 1);
            input.value = commandHistory[historyIndex] || "";
        } else if (event.key === "ArrowDown" && commandHistory.length) {
            event.preventDefault();
            historyIndex = Math.min(commandHistory.length, historyIndex + 1);
            input.value = commandHistory[historyIndex] || "";
        } else if (event.key === "Tab") {
            event.preventDefault();
            const match = Object.keys(COMMANDS).find(c => c.startsWith(input.value.toLowerCase()) && input.value);
            if (match) input.value = match + " ";
        }
    });

    output.parentElement.addEventListener("click", () => { if (!window.getSelection().toString()) input.focus(); });

    print("NSI Hub — terminal de secours v4.0.4");
    print(`Erreur 404 : « ${requested} » est introuvable.`, "t-error");
    print("Tape « help » pour voir les commandes. Certaines sont cachées…", "t-muted");

    /* =====================================================
       CODE KONAMI
       ===================================================== */

    const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    let konamiStep = 0;
    document.addEventListener("keydown", event => {
        const key = event.key.toLowerCase();
        konamiStep = key === KONAMI[konamiStep] ? konamiStep + 1 : (key === KONAMI[0] ? 1 : 0);
        if (konamiStep === KONAMI.length) {
            konamiStep = 0;
            document.body.classList.toggle("e404-retro");
            toast(document.body.classList.contains("e404-retro") ? "🕹️ Mode rétro activé ! (refais le code pour le désactiver)" : "Mode rétro désactivé.");
            unlock("konami");
        }
    });

    /* =====================================================
       PLUIE DE 0 ET DE 1
       ===================================================== */

    function startMatrix() {
        const canvas = $("e404-matrix");
        const ctx = canvas.getContext("2d");
        canvas.hidden = false;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const size = 18;
        const columns = Math.ceil(canvas.width / size);
        const drops = Array.from({ length: columns }, () => Math.random() * -50);
        const chars = "01NSIHUB404<>{}()=;";
        const end = Date.now() + 7000;
        let frame;
        const stop = () => {
            cancelAnimationFrame(frame);
            canvas.hidden = true;
            document.removeEventListener("keydown", onKey);
            canvas.removeEventListener("click", stop);
        };
        const onKey = event => { if (event.key === "Escape") stop(); };
        document.addEventListener("keydown", onKey);
        canvas.addEventListener("click", stop);
        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${size}px monospace`;
            drops.forEach((y, i) => {
                ctx.fillStyle = Math.random() > 0.97 ? "#d1fae5" : "#22c55e";
                ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
                drops[i] = y * size > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
            });
            if (Date.now() < end) frame = requestAnimationFrame(draw);
            else stop();
        };
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        draw();
    }

    /* =====================================================
       CHASSE AUX BUGS
       ===================================================== */

    const arena = $("e404-arena");
    let record = Number(localStorage.getItem("nsiBugHuntRecord")) || 0;
    $("e404-record").textContent = record;
    let game = null;

    function spawnBug() {
        if (!game) return;
        const bug = document.createElement("button");
        bug.type = "button";
        bug.className = "e404-bug";
        bug.setAttribute("aria-label", "Écraser le bug");
        bug.textContent = pick(["🐛", "🐞", "🪲", "🦗"]);
        const margin = 60;
        bug.style.left = `${margin + Math.random() * (window.innerWidth - margin * 2)}px`;
        bug.style.top = `${margin + 50 + Math.random() * (window.innerHeight - margin * 2 - 50)}px`;
        const life = Math.max(700, 1700 - game.score * 40);
        bug.style.setProperty("--dx", `${(Math.random() - 0.5) * 160}px`);
        bug.style.setProperty("--dy", `${(Math.random() - 0.5) * 160}px`);
        bug.style.setProperty("--life", `${life}ms`);
        bug.addEventListener("pointerdown", () => {
            if (!game || bug.classList.contains("squashed")) return;
            game.score += 1;
            $("e404-score").textContent = game.score;
            bug.classList.add("squashed");
            bug.textContent = "💥";
            setTimeout(() => bug.remove(), 250);
        });
        arena.appendChild(bug);
        setTimeout(() => { if (!bug.classList.contains("squashed")) bug.remove(); }, life);
    }

    function startGame() {
        if (game) return;
        arena.hidden = false;
        arena.querySelectorAll(".e404-bug, .e404-result").forEach(el => el.remove());
        game = { score: 0, time: 20 };
        $("e404-score").textContent = "0";
        $("e404-time").textContent = "20";
        game.spawner = setInterval(spawnBug, 520);
        game.clock = setInterval(() => {
            game.time -= 1;
            $("e404-time").textContent = game.time;
            if (game.time <= 0) endGame();
        }, 1000);
        spawnBug();
    }

    function endGame(quit = false) {
        if (!game) return;
        clearInterval(game.spawner);
        clearInterval(game.clock);
        const score = game.score;
        game = null;
        arena.querySelectorAll(".e404-bug").forEach(el => el.remove());
        if (quit) { arena.hidden = true; return; }
        const newRecord = score > record;
        if (newRecord) {
            record = score;
            localStorage.setItem("nsiBugHuntRecord", String(record));
            $("e404-record").textContent = record;
        }
        if (score >= 15) unlock("bugs");
        const result = document.createElement("div");
        result.className = "e404-result";
        result.innerHTML = `
            <h2>${score >= 25 ? "Débogueur légendaire 🏆" : score >= 15 ? "Exterminateur de bugs 💪" : score >= 8 ? "Pas mal du tout ! 👍" : "Les bugs ont gagné… cette fois. 🐛"}</h2>
            <p><strong>${score}</strong> bug${score > 1 ? "s" : ""} écrasé${score > 1 ? "s" : ""}${newRecord ? " · nouveau record !" : ` · record : ${record}`}</p>
            <div class="e404-actions">
                <button type="button" class="e404-button primary" data-again><i class="fa-solid fa-rotate-right"></i> Rejouer</button>
                <button type="button" class="e404-button" data-close><i class="fa-solid fa-xmark"></i> Fermer</button>
            </div>`;
        result.querySelector("[data-again]").addEventListener("click", startGame);
        result.querySelector("[data-close]").addEventListener("click", () => { arena.hidden = true; result.remove(); });
        arena.appendChild(result);
    }

    $("e404-play").addEventListener("click", startGame);
    $("e404-quit").addEventListener("click", () => {
        if (game) endGame(true);
        else arena.hidden = true;
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !arena.hidden) $("e404-quit").click();
    });

    /* =====================================================
       CONFETTIS (tous les easter eggs trouvés)
       ===================================================== */

    function confetti() {
        if (reduced()) return;
        const colors = ["#6366f1", "#22c55e", "#eab308", "#ec4899", "#06b6d4", "#f97316"];
        for (let i = 0; i < 120; i++) {
            const piece = document.createElement("span");
            piece.className = "e404-confetti";
            piece.style.left = `${Math.random() * 100}vw`;
            piece.style.background = pick(colors);
            piece.style.animationDelay = `${Math.random() * 0.6}s`;
            piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 200}px`);
            document.body.appendChild(piece);
            setTimeout(() => piece.remove(), 3500);
        }
    }

    /* =====================================================
       CONSOLE ET HEURE
       ===================================================== */

    window.nsiHub = {
        secret() {
            unlock("console");
            return "🔓 Bien joué, fouineur ! Easter egg « Fouineur » débloqué. Retourne voir la page 😉";
        }
    };
    console.log("%c 404 ", "background:#6366f1;color:#fff;font-size:28px;font-weight:800;border-radius:6px;padding:4px 10px");
    console.log("%cTu fouilles dans la console ? Tu as l'âme d'un développeur.\nTape  nsiHub.secret()  pour débloquer un easter egg.", "color:#22c55e;font-size:13px");

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) {
        setTimeout(() => unlock("nuit"), 1500);
    }

    renderEggs();
})();
