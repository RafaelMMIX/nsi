// =========================================================
// NSI HUB — BIBLIOTHÈQUE DE PROMPTS
// Pour ajouter un prompt : copier un bloc { ... } et l'adapter.
// - texte  : le prompt ; chaque [CHAMP] devient une case à remplir
// - champs : la description des cases (multi: true = grande zone de texte)
//   Le champ NIVEAU est prérempli avec le profil choisi sur NSI Hub.
// =========================================================

window.NSI_PROMPT_CATEGORIES = [
    { id: "comprendre", label: "Comprendre", icon: "fa-solid fa-lightbulb" },
    { id: "coder", label: "Coder et déboguer", icon: "fa-solid fa-code" },
    { id: "reviser", label: "S'entraîner et réviser", icon: "fa-solid fa-dumbbell" },
    { id: "sql", label: "SQL et bases de données", icon: "fa-solid fa-database" },
    { id: "web", label: "Web", icon: "fa-solid fa-globe" },
    { id: "projet", label: "Projets", icon: "fa-solid fa-diagram-project" },
    { id: "bac", label: "Bac et oral", icon: "fa-solid fa-graduation-cap" },
    { id: "prof", label: "Pour les profs", icon: "fa-solid fa-chalkboard-user" }
];

const CHAMP_NIVEAU = { id: "NIVEAU", label: "Ton niveau", exemple: "Terminale NSI" };
const CHAMP_CODE = { id: "CODE", label: "Ton code", multi: true, exemple: "def moyenne(notes):\n    ..." };

window.NSI_PROMPTS = [

    /* ---------------- COMPRENDRE ---------------- */
    {
        id: "comprendre-cours",
        categorie: "comprendre",
        emoji: "📚",
        titre: "Comprendre un cours",
        description: "Transformer une notion compliquée en explication simple, avec un exemple et l'essentiel à retenir.",
        texte: "Je suis en [NIVEAU]. Explique-moi cette notion : [NOTION].\nCommence par une explication simple, puis donne un exemple concret de la vie courante, et enfin un exemple en Python si c'est pertinent.\nTermine par les trois choses essentielles à retenir et l'erreur la plus fréquente des élèves sur ce sujet.",
        champs: [CHAMP_NIVEAU, { id: "NOTION", label: "La notion", exemple: "la récursivité" }]
    },
    {
        id: "comprendre-12-ans",
        categorie: "comprendre",
        emoji: "🧒",
        titre: "Explique-moi comme si j'avais 12 ans",
        description: "Une analogie simple pour enfin « voir » une notion abstraite.",
        texte: "Explique-moi [NOTION] comme si j'avais 12 ans, avec une analogie de la vie de tous les jours.\nEnsuite, montre-moi où l'analogie s'arrête (ce qu'elle ne représente pas bien), puis donne la définition correcte en une phrase, au niveau [NIVEAU].",
        champs: [{ id: "NOTION", label: "La notion", exemple: "une adresse IP" }, CHAMP_NIVEAU]
    },
    {
        id: "comprendre-comparer",
        categorie: "comprendre",
        emoji: "⚖️",
        titre: "Comparer deux notions",
        description: "Un tableau clair pour ne plus confondre deux notions proches.",
        texte: "Je confonds souvent [NOTION 1] et [NOTION 2] en NSI ([NIVEAU]).\nFais un tableau comparatif (définition, à quoi ça sert, exemple en Python, avantages, inconvénients), puis donne-moi une astuce pour ne plus les confondre.\nTermine par deux petites questions pour vérifier que j'ai compris, sans donner les réponses.",
        champs: [{ id: "NOTION 1", label: "Première notion", exemple: "une pile" }, { id: "NOTION 2", label: "Deuxième notion", exemple: "une file" }, CHAMP_NIVEAU]
    },
    {
        id: "comprendre-erreur",
        categorie: "comprendre",
        emoji: "🐛",
        titre: "Comprendre une erreur",
        description: "Comprendre un message d'erreur sans obtenir directement la solution.",
        texte: "Je suis en [NIVEAU] et je rencontre cette erreur :\n[ERREUR]\n\nVoici mon code :\n[CODE]\n\nExplique-moi ce que signifie cette erreur, à quelle ligne elle se produit et pourquoi elle apparaît.\nDonne-moi des pistes pour la corriger, mais pas la solution complète : je veux trouver moi-même.",
        champs: [CHAMP_NIVEAU, { id: "ERREUR", label: "Le message d'erreur", multi: true, exemple: "TypeError: can only concatenate str (not \"int\") to str" }, CHAMP_CODE]
    },

    /* ---------------- CODER ET DÉBOGUER ---------------- */
    {
        id: "coder-guider",
        categorie: "coder",
        emoji: "🧑‍🏫",
        titre: "Me guider sans donner la réponse",
        description: "Idéal pour travailler vraiment au lieu de laisser l'IA faire l'exercice.",
        texte: "Agis comme mon professeur de NSI ([NIVEAU]). Voici mon exercice :\n[ÉNONCÉ]\n\nNe me donne pas la réponse. Aide-moi étape par étape : pose-moi une question à la fois, attends ma réponse, et donne-moi un indice seulement si je bloque.\nSi je te demande la solution, rappelle-moi que je dois la trouver moi-même et donne-moi un indice plus précis.",
        champs: [CHAMP_NIVEAU, { id: "ÉNONCÉ", label: "L'énoncé de l'exercice", multi: true, exemple: "Écrire une fonction qui renvoie le maximum d'une liste sans utiliser max()." }]
    },
    {
        id: "coder-analyser",
        categorie: "coder",
        emoji: "🔍",
        titre: "Analyser mon code",
        description: "Comprendre ce qui fonctionne ou non dans ton programme, sans qu'il soit réécrit.",
        texte: "Analyse mon code Python ci-dessous. Ne le réécris pas entièrement.\nExplique-moi ce qui fonctionne, les erreurs éventuelles, les cas qui pourraient poser problème (liste vide, valeur négative…) et les mauvaises pratiques.\nPour chaque point, indique la ligne concernée et une piste d'amélioration. Je veux comprendre mes erreurs.\n\n[CODE]",
        champs: [CHAMP_CODE]
    },
    {
        id: "coder-tests",
        categorie: "coder",
        emoji: "🧪",
        titre: "Tester ma fonction",
        description: "Trouver les cas limites et écrire des tests avec assert.",
        texte: "Voici une fonction Python que j'ai écrite :\n[CODE]\n\nElle est censée : [CE QUE DOIT FAIRE LA FONCTION].\nPropose-moi une liste de tests avec assert, en incluant les cas limites (liste vide, un seul élément, valeurs négatives, doublons…).\nNe corrige pas ma fonction : dis-moi seulement quels tests risquent d'échouer et pourquoi.",
        champs: [CHAMP_CODE, { id: "CE QUE DOIT FAIRE LA FONCTION", label: "Ce que doit faire la fonction", exemple: "renvoyer la moyenne des notes de la liste" }]
    },
    {
        id: "coder-trace",
        categorie: "coder",
        emoji: "🐢",
        titre: "Faire la trace d'un programme",
        description: "Suivre l'évolution des variables pas à pas, comme au bac.",
        texte: "Je veux m'entraîner à faire la trace d'exécution de ce programme :\n[CODE]\n\nNe fais pas la trace à ma place. Prépare un tableau vide avec une colonne par variable, puis demande-moi de remplir la première ligne.\nVérifie chaque ligne que je propose avant de passer à la suivante, et explique-moi mes erreurs.",
        champs: [CHAMP_CODE]
    },
    {
        id: "coder-lisible",
        categorie: "coder",
        emoji: "🧹",
        titre: "Rendre mon code plus lisible",
        description: "Noms de variables, docstrings, découpage en fonctions : du code propre.",
        texte: "Voici mon code Python :\n[CODE]\n\nAide-moi à le rendre plus lisible, sans changer ce qu'il fait : noms de variables et de fonctions, docstrings, commentaires utiles, découpage en fonctions, respect de la PEP 8.\nListe d'abord les améliorations possibles, explique pourquoi chacune est utile, et laisse-moi les appliquer moi-même.",
        champs: [CHAMP_CODE]
    },
    {
        id: "coder-algo-python",
        categorie: "coder",
        emoji: "🔄",
        titre: "Passer d'un algorithme à Python",
        description: "Traduire un algorithme en pseudo-code (ou en français) vers Python, en comprenant chaque ligne.",
        texte: "Voici un algorithme en pseudo-code :\n[ALGORITHME]\n\nAide-moi à le traduire en Python ([NIVEAU]). Pour chaque ligne du pseudo-code, explique-moi l'instruction Python correspondante.\nPropose-moi d'abord d'écrire la traduction moi-même, puis corrige ma version.",
        champs: [{ id: "ALGORITHME", label: "L'algorithme", multi: true, exemple: "pour i allant de 1 à n\n    si t[i] > max alors max ← t[i]" }, CHAMP_NIVEAU]
    },
    {
        id: "coder-complexite",
        categorie: "coder",
        emoji: "⏱️",
        titre: "Calculer la complexité",
        description: "Estimer le coût d'un algorithme et voir comment l'améliorer.",
        texte: "Voici mon code :\n[CODE]\n\nAide-moi à déterminer sa complexité en temps (notation O). Ne me donne pas directement le résultat : guide-moi en me faisant compter le nombre d'opérations selon la taille n des données.\nEnsuite, dis-moi s'il existe une approche plus efficace et quelle notion du programme elle utilise.",
        champs: [CHAMP_CODE]
    },

    /* ---------------- S'ENTRAÎNER ET RÉVISER ---------------- */
    {
        id: "reviser-qcm",
        categorie: "reviser",
        emoji: "📝",
        titre: "Un QCM pour m'entraîner",
        description: "10 questions sur un thème, corrigées à la fin.",
        texte: "Crée-moi un QCM de 10 questions sur [THÈME], niveau [NIVEAU], du plus facile au plus difficile.\nChaque question a 4 réponses possibles dont une seule juste. Pose les questions une par une, attends ma réponse, puis explique pourquoi elle est juste ou fausse.\nÀ la fin, donne-moi mon score et les notions à retravailler.",
        champs: [{ id: "THÈME", label: "Le thème", exemple: "les arbres binaires" }, CHAMP_NIVEAU]
    },
    {
        id: "reviser-exercices",
        categorie: "reviser",
        emoji: "🏋️",
        titre: "Exercices progressifs",
        description: "Trois exercices de plus en plus difficiles, corrigés un par un.",
        texte: "Propose-moi 3 exercices de Python sur [THÈME] ([NIVEAU]), du plus facile au plus difficile.\nDonne-moi un seul exercice à la fois. Quand je t'envoie ma réponse, corrige-la (ce qui est juste, ce qui ne va pas), puis passe à l'exercice suivant.\nNe donne la correction complète que si je l'écris explicitement « je donne ma langue au chat ».",
        champs: [{ id: "THÈME", label: "Le thème", exemple: "les dictionnaires" }, CHAMP_NIVEAU]
    },
    {
        id: "reviser-fiche",
        categorie: "reviser",
        emoji: "🃏",
        titre: "Fiche de révision",
        description: "L'essentiel d'un chapitre sur une page, avec les pièges classiques.",
        texte: "Fais-moi une fiche de révision sur [THÈME] pour le niveau [NIVEAU].\nStructure : les définitions à connaître, les points essentiels, un exemple en Python, les pièges classiques à éviter, et trois questions d'auto-évaluation (avec les réponses à la toute fin).\nLa fiche doit tenir sur une page.",
        champs: [{ id: "THÈME", label: "Le chapitre", exemple: "la programmation orientée objet" }, CHAMP_NIVEAU]
    },
    {
        id: "reviser-interroger",
        categorie: "reviser",
        emoji: "🎯",
        titre: "Interroge-moi",
        description: "Des questions de cours une par une, qui s'adaptent à tes réponses.",
        texte: "Interroge-moi sur [THÈME] ([NIVEAU]) comme le ferait un professeur à l'oral.\nPose une seule question à la fois et attends ma réponse. Si je me trompe, explique brièvement et repose une question proche plus tard. Si je réussis, augmente la difficulté.\nAprès 10 questions, fais le bilan de mes points forts et de mes points faibles.",
        champs: [{ id: "THÈME", label: "Le thème", exemple: "les protocoles réseau" }, CHAMP_NIVEAU]
    },
    {
        id: "reviser-corriger",
        categorie: "reviser",
        emoji: "✅",
        titre: "Corrige ma réponse",
        description: "Savoir si ta réponse est juste et ce qu'il manque pour avoir tous les points.",
        texte: "Voici une question de NSI ([NIVEAU]) :\n[QUESTION]\n\nEt voici ma réponse :\n[MA RÉPONSE]\n\nCorrige-moi comme le ferait un correcteur : ce qui est juste, ce qui est faux ou imprécis, ce qu'il manque pour avoir tous les points. Donne une note sur 5 avec une justification.\nNe réécris pas toute la réponse : donne-moi seulement les pistes pour l'améliorer.",
        champs: [CHAMP_NIVEAU, { id: "QUESTION", label: "La question", multi: true, exemple: "Expliquer la différence entre un protocole TCP et UDP." }, { id: "MA RÉPONSE", label: "Ta réponse", multi: true, exemple: "" }]
    },

    /* ---------------- SQL ET BASES DE DONNÉES ---------------- */
    {
        id: "sql-comprendre",
        categorie: "sql",
        emoji: "🗄️",
        titre: "Comprendre une requête SQL",
        description: "Décortiquer une requête clause par clause.",
        texte: "Explique-moi cette requête SQL clause par clause (SELECT, FROM, JOIN, WHERE, GROUP BY, ORDER BY…) :\n[REQUÊTE]\n\nPour chaque clause, dis ce qu'elle fait et dans quel ordre SQL l'exécute. Termine en résumant en une phrase ce que renvoie la requête.",
        champs: [{ id: "REQUÊTE", label: "La requête", multi: true, exemple: "SELECT c.nom, COUNT(*)\nFROM eleves e JOIN classes c ON e.id_classe = c.id_classe\nGROUP BY c.nom;" }]
    },
    {
        id: "sql-ecrire",
        categorie: "sql",
        emoji: "🧩",
        titre: "M'aider à écrire une requête",
        description: "Construire une requête étape par étape à partir du schéma de la base.",
        texte: "Voici le schéma de ma base de données :\n[SCHÉMA]\n\nJe veux obtenir : [CE QUE JE VEUX OBTENIR].\nNe me donne pas la requête. Guide-moi : quelles tables faut-il utiliser ? faut-il une jointure ? un regroupement ? Laisse-moi écrire la requête, puis corrige-la.",
        champs: [{ id: "SCHÉMA", label: "Le schéma des tables", multi: true, exemple: "eleves(id_eleve, nom, prenom, id_classe)\nclasses(id_classe, nom, niveau)\nnotes(id_note, id_eleve, valeur)" }, { id: "CE QUE JE VEUX OBTENIR", label: "Ce que tu veux obtenir", exemple: "la moyenne de chaque classe" }]
    },
    {
        id: "sql-concevoir",
        categorie: "sql",
        emoji: "🏗️",
        titre: "Concevoir une base de données",
        description: "Passer d'un sujet à un schéma relationnel avec clés primaires et étrangères.",
        texte: "Je dois concevoir une base de données pour : [SUJET].\nAide-moi à construire le schéma relationnel. Commence par me demander quelles informations doivent être stockées. Ensuite, propose-moi de découper en tables, puis vérifie mes clés primaires et mes clés étrangères.\nExplique-moi les erreurs de conception (redondance, données incohérentes) si j'en fais.",
        champs: [{ id: "SUJET", label: "Le sujet", exemple: "la gestion des emprunts d'une bibliothèque" }]
    },

    /* ---------------- WEB ---------------- */
    {
        id: "web-comprendre",
        categorie: "web",
        emoji: "🌐",
        titre: "Comprendre une page web",
        description: "Ce que fait chaque partie d'un code HTML, CSS ou JavaScript.",
        texte: "Explique-moi ce code web, bloc par bloc, au niveau [NIVEAU] :\n[CODE]\n\nPour chaque partie, dis s'il s'agit de HTML (structure), de CSS (apparence) ou de JavaScript (comportement), et ce qu'elle fait à l'écran.",
        champs: [CHAMP_NIVEAU, { id: "CODE", label: "Le code HTML / CSS / JS", multi: true, exemple: "<button id=\"btn\">Clique</button>" }]
    },
    {
        id: "web-css",
        categorie: "web",
        emoji: "🎨",
        titre: "Déboguer mon CSS",
        description: "Comprendre pourquoi la page ne s'affiche pas comme prévu.",
        texte: "Ma page web ne s'affiche pas comme je veux. Le problème : [PROBLÈME].\nVoici mon HTML et mon CSS :\n[CODE]\n\nAide-moi à trouver la cause, en m'expliquant les propriétés CSS en jeu (boîte, display, flexbox, priorité des sélecteurs…). Propose-moi des pistes à tester plutôt que du code tout fait.",
        champs: [{ id: "PROBLÈME", label: "Le problème", exemple: "mes deux blocs ne se mettent pas côte à côte" }, { id: "CODE", label: "Ton HTML et ton CSS", multi: true, exemple: "" }]
    },

    /* ---------------- PROJETS ---------------- */
    {
        id: "projet-idee",
        categorie: "projet",
        emoji: "💡",
        titre: "Trouver une idée de projet",
        description: "Des idées adaptées à tes goûts et aux notions du programme.",
        texte: "Je suis en [NIVEAU] et je cherche une idée de projet informatique. J'aime : [MES CENTRES D'INTÉRÊT]. J'ai environ [DURÉE] pour le réaliser.\nPropose-moi 5 idées réalisables, avec pour chacune : une description en deux phrases, les notions du programme utilisées, la difficulté (facile / moyen / difficile) et une fonctionnalité bonus pour aller plus loin.",
        champs: [CHAMP_NIVEAU, { id: "MES CENTRES D'INTÉRÊT", label: "Tes centres d'intérêt", exemple: "les jeux vidéo, le sport, la musique" }, { id: "DURÉE", label: "Le temps disponible", exemple: "6 semaines" }]
    },
    {
        id: "projet-etapes",
        categorie: "projet",
        emoji: "🗺️",
        titre: "Découper mon projet en étapes",
        description: "Un plan clair pour avancer sans se perdre.",
        texte: "Voici mon projet : [DESCRIPTION DU PROJET].\nAide-moi à le découper en étapes courtes et testables, de la version la plus simple qui fonctionne jusqu'à la version complète.\nPour chaque étape, indique ce qu'il faut coder, comment vérifier que ça marche, et le temps estimé. Ne code rien à ma place.",
        champs: [{ id: "DESCRIPTION DU PROJET", label: "La description du projet", multi: true, exemple: "Un jeu du pendu en Python avec un score et plusieurs niveaux." }]
    },
    {
        id: "projet-readme",
        categorie: "projet",
        emoji: "📖",
        titre: "Documenter mon projet",
        description: "Le plan d'un bon README, à compléter toi-même.",
        texte: "Je dois rédiger la documentation (README) de mon projet : [DESCRIPTION DU PROJET].\nPropose-moi un plan de README avec les sections importantes (présentation, installation, utilisation, fonctionnalités, captures, auteurs…). Pour chaque section, explique ce que je dois y écrire et pose-moi les questions qui m'aideront à la rédiger moi-même.",
        champs: [{ id: "DESCRIPTION DU PROJET", label: "La description du projet", multi: true, exemple: "Un site web de quiz sur la NSI." }]
    },

    /* ---------------- BAC ET ORAL ---------------- */
    {
        id: "bac-methode",
        categorie: "bac",
        emoji: "📄",
        titre: "Méthode pour un exercice de bac",
        description: "Analyser l'énoncé et organiser sa réponse, sans la solution.",
        texte: "Voici un exercice de bac NSI :\n[EXERCICE]\n\nNe le résous pas. Aide-moi à analyser l'énoncé : quelles notions du programme sont en jeu, quelles informations sont importantes, dans quel ordre traiter les questions et quels pièges éviter.\nEnsuite, laisse-moi répondre question par question et corrige-moi.",
        champs: [{ id: "EXERCICE", label: "L'énoncé de l'exercice", multi: true, exemple: "" }]
    },
    {
        id: "bac-grand-oral",
        categorie: "bac",
        emoji: "🎤",
        titre: "Préparer le Grand oral",
        description: "Construire son plan et s'entraîner aux questions du jury.",
        texte: "Je prépare le Grand oral. Ma question est : [MA QUESTION].\nAide-moi sans écrire mon oral à ma place : vérifie que ma question est problématisée, propose-moi des pistes de plan, puis joue le rôle du jury et pose-moi 5 questions possibles, une par une, en commentant mes réponses (clarté, vocabulaire, justification).",
        champs: [{ id: "MA QUESTION", label: "Ta question de Grand oral", exemple: "Les algorithmes de recommandation nous enferment-ils dans des bulles ?" }]
    },
    {
        id: "bac-planning",
        categorie: "bac",
        emoji: "🗓️",
        titre: "Planning de révisions",
        description: "Un planning réaliste jusqu'à l'épreuve.",
        texte: "Je dois réviser pour [ÉPREUVE] qui a lieu le [DATE]. Je peux travailler environ [TEMPS PAR JOUR] par jour.\nVoici les chapitres à réviser, avec mon niveau de maîtrise : [CHAPITRES].\nPropose-moi un planning semaine par semaine qui commence par les chapitres les moins maîtrisés, avec des séances d'exercices, des révisions espacées et des jours de repos.",
        champs: [{ id: "ÉPREUVE", label: "L'épreuve", exemple: "l'épreuve écrite de NSI" }, { id: "DATE", label: "La date", exemple: "16 juin" }, { id: "TEMPS PAR JOUR", label: "Temps par jour", exemple: "45 minutes" }, { id: "CHAPITRES", label: "Les chapitres et ton niveau", multi: true, exemple: "récursivité (moyen), graphes (faible), SQL (bon)" }]
    },

    /* ---------------- POUR LES PROFS ---------------- */
    {
        id: "prof-activite",
        categorie: "prof",
        emoji: "🧾",
        titre: "Créer une activité",
        description: "Une séance clé en main : objectifs, déroulé, exercices et corrigé.",
        texte: "Je suis professeur de NSI. Crée une activité sur [NOTION] pour des élèves de [NIVEAU], d'une durée de [DURÉE].\nIndique les objectifs, les prérequis, le déroulé minuté, une activité d'introduction, des exercices progressifs (avec corrigé séparé) et une trace écrite courte.",
        champs: [{ id: "NOTION", label: "La notion", exemple: "les algorithmes gloutons" }, { id: "NIVEAU", label: "Le niveau des élèves", exemple: "Première NSI" }, { id: "DURÉE", label: "La durée", exemple: "2 heures" }]
    },
    {
        id: "prof-differencier",
        categorie: "prof",
        emoji: "🪜",
        titre: "Exercices différenciés",
        description: "Le même exercice en trois niveaux de difficulté.",
        texte: "Je suis professeur de NSI ([NIVEAU]). Propose un exercice sur [NOTION] décliné en trois versions : une version guidée (avec aides et code à compléter), une version standard et une version d'approfondissement.\nAjoute les corrigés à la fin, séparés des énoncés.",
        champs: [{ id: "NOTION", label: "La notion", exemple: "le parcours de listes" }, { id: "NIVEAU", label: "Le niveau des élèves", exemple: "Première NSI" }]
    },
    {
        id: "prof-grille",
        categorie: "prof",
        emoji: "📊",
        titre: "Grille d'évaluation",
        description: "Des critères clairs pour évaluer un projet ou un oral.",
        texte: "Je suis professeur de NSI. Crée une grille d'évaluation pour [TRAVAIL À ÉVALUER] ([NIVEAU]).\nPropose 5 à 7 critères (fonctionnement, qualité du code, documentation, travail en équipe…), avec pour chacun 4 niveaux de maîtrise décrits précisément et un barème sur 20.",
        champs: [{ id: "TRAVAIL À ÉVALUER", label: "Le travail à évaluer", exemple: "un projet de jeu en Python réalisé en binôme" }, { id: "NIVEAU", label: "Le niveau des élèves", exemple: "Terminale NSI" }]
    },
    {
        id: "prof-idees-fausses",
        categorie: "prof",
        emoji: "🧠",
        titre: "Repérer les idées fausses",
        description: "Les erreurs fréquentes des élèves et comment les travailler.",
        texte: "Je suis professeur de NSI. Liste les idées fausses et erreurs les plus fréquentes des élèves de [NIVEAU] sur [NOTION].\nPour chacune : un exemple de production d'élève qui la révèle, l'explication de l'origine de l'erreur, et une question ou une petite activité pour la faire émerger et la corriger en classe.",
        champs: [{ id: "NOTION", label: "La notion", exemple: "les boucles while" }, { id: "NIVEAU", label: "Le niveau des élèves", exemple: "Première NSI" }]
    }
];
