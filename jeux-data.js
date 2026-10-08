(() => {
    "use strict";
    const question = (prompt, options, answer, explanation, code = "") => ({ prompt, options, answer, explanation, code });
    const make = (id, type, level, category, difficulty, title, description, questions, icon) => ({ id, type, level, category, difficulty, title, description, questions, icon });
    const activities = [
        // Première : notions fondamentales du programme
        make("QUIZ-PREM-001", "quiz", "premiere", "Python", "Facile", "Les bases de Python", "Variables, types et instructions pour bien démarrer.", [
            question("Quel type renvoie `type(3.5)` ?", ["int", "float", "str", "bool"], 1, "3.5 est un nombre décimal : son type est float."),
            question("Que vaut `7 // 2` en Python ?", ["3", "3.5", "4", "1"], 0, "L'opérateur // effectue une division entière."),
            question("Quel mot-clé définit une fonction ?", ["function", "def", "func", "define"], 1, "En Python, une fonction commence par le mot-clé def.")
        ], "fa-code"),
        make("QUIZ-PREM-002", "quiz", "premiere", "Conditions et boucles", "Facile", "Conditions et répétitions", "Teste les structures de contrôle de base.", [
            question("Quelle boucle parcourt directement les éléments d'une liste ?", ["repeat", "foreach", "for", "loop"], 2, "`for element in liste` parcourt chaque élément."),
            question("Quand le bloc d'un `if` est-il exécuté ?", ["Toujours", "Quand la condition est vraie", "Quand la condition est fausse", "Une seule fois au démarrage"], 1, "Le bloc if s'exécute lorsque son expression est vraie."),
            question("Combien de fois `range(4)` fournit-il une valeur ?", ["3", "4", "5", "0"], 1, "range(4) produit 0, 1, 2 et 3 : quatre valeurs.")
        ], "fa-arrows-rotate"),
        make("QUIZ-PREM-003", "quiz", "premiere", "Données", "Moyen", "Données et algorithmes", "Listes, chaînes, recherche et représentation de l'information.", [
            question("Quel est le premier indice d'une liste Python ?", ["0", "1", "-1", "Cela dépend"], 0, "L'indexation des listes Python commence à zéro."),
            question("Quel est le résultat de `" + "'NSI'[1]" + "` ?", ["N", "S", "I", "NS"], 1, "L'indice 1 désigne le deuxième caractère."),
            question("Combien de bits composent un octet ?", ["4", "8", "16", "32"], 1, "Un octet contient huit bits.")
        ], "fa-database"),
        make("QUIZ-PREM-004", "quiz", "premiere", "Fonctions", "Facile", "Fonctions et paramètres", "Entraîne-toi à lire des fonctions Python et leurs paramètres.", [
            question("Que renvoie cette fonction pour `double(6)` ?", ["6", "12", "36", "Erreur"], 1, "La fonction renvoie 2 * 6, soit 12.", "def double(n):\n    return 2 * n"),
            question("À quoi sert un paramètre dans une fonction ?", ["À fournir une valeur utilisée par la fonction", "À arrêter une boucle", "À afficher automatiquement le résultat", "À créer une liste"], 0, "Le paramètre reçoit une valeur au moment de l'appel."),
            question("Que renvoie `carre(3)` ?", ["6", "9", "3", "Aucune valeur"], 1, "La fonction renvoie 3 * 3, donc 9.", "def carre(x):\n    return x * x")
        ], "fa-code"),
        make("QUIZ-PREM-005", "quiz", "premiere", "Représentation des données", "Moyen", "Représenter les données", "Bits, entiers et encodage des caractères en Première NSI.", [
            question("Combien de valeurs différentes peut-on coder avec 4 bits ?", ["4", "8", "16", "32"], 2, "Avec n bits, on code 2ⁿ possibilités : 2⁴ = 16."),
            question("Quelle est la valeur décimale du binaire `1010` ?", ["8", "9", "10", "12"], 2, "1010₂ = 1×8 + 0×4 + 1×2 + 0×1 = 10."),
            question("Quel est le rôle d'un encodage de caractères comme Unicode ?", ["Associer des nombres aux caractères", "Compresser toutes les images", "Trier les fichiers", "Chiffrer les mots de passe"], 0, "Un encodage associe des valeurs numériques à des caractères.")
        ], "fa-microchip"),
        make("QUIZ-PREM-006", "quiz", "premiere", "Algorithmique", "Moyen", "Recherche et parcours", "Choisis une méthode adaptée aux listes et comprends son résultat.", [
            question("Dans une recherche séquentielle, que fait-on généralement ?", ["On examine les éléments un à un", "On divise toujours la liste en deux", "On échange tous les voisins", "On inverse la liste"], 0, "La recherche séquentielle teste chaque élément jusqu'à trouver la valeur ou atteindre la fin."),
            question("Quel est l'intérêt d'une recherche dichotomique ?", ["Elle fonctionne sur une liste non triée sans condition", "Elle réduit la zone de recherche de moitié dans une liste triée", "Elle trie la liste en une seule comparaison", "Elle supprime les doublons"], 1, "La liste doit être triée ; chaque étape élimine environ la moitié des éléments."),
            question("Quel résultat indique qu'une valeur n'a pas été trouvée dans une fonction de recherche ?", ["Une valeur sentinelle comme -1 ou None", "Toujours 0", "La longueur de la liste", "La première valeur"], 0, "Une fonction peut renvoyer une valeur convenue, par exemple -1 ou None, pour signaler l'absence.")
        ], "fa-magnifying-glass"),

        // SNT : culture numérique et thèmes du programme
        make("QUIZ-SNT-001", "quiz", "snt", "Internet", "Facile", "Internet et le Web", "Distingue Internet, Web, navigateur et adresse IP.", [
            question("Quelle affirmation distingue correctement Internet et le Web ?", ["Ce sont deux noms pour le même service", "Internet est un réseau ; le Web est un service qui l'utilise", "Le Web est le matériel qui relie les ordinateurs", "Internet ne transporte que des pages web"], 1, "Internet est une infrastructure de réseaux ; le Web est l'un des services qui s'appuient dessus."),
            question("À quoi sert principalement un navigateur web ?", ["À afficher et parcourir des pages web", "À attribuer une adresse IP à chaque appareil", "À fabriquer les câbles réseau", "À remplacer un moteur de recherche"], 0, "Le navigateur demande des ressources web et les présente à l'utilisateur."),
            question("Quel service aide à retrouver l'adresse IP associée à un nom de domaine ?", ["DNS", "HTML", "GPS", "Bluetooth"], 0, "Le DNS associe notamment les noms de domaine aux adresses IP.")
        ], "fa-globe"),
        make("QUIZ-SNT-002", "quiz", "snt", "Réseaux sociaux", "Facile", "Réseaux sociaux et données", "Comprends les traces numériques, les recommandations et les paramètres de visibilité.", [
            question("Que peut être une trace numérique ?", ["Une information laissée lors d'une activité en ligne", "Uniquement un fichier téléchargé", "Un câble reliant deux serveurs", "Un mot de passe toujours public"], 0, "Une publication, une recherche ou une interaction peut constituer une trace numérique."),
            question("Pourquoi un réseau social recommande-t-il parfois certains contenus ?", ["Des algorithmes peuvent exploiter des signaux d'activité", "Tous les contenus sont choisis au hasard", "Le navigateur lit les pensées", "Les recommandations sont toujours identiques pour tous"], 0, "Les systèmes de recommandation utilisent souvent des données d'activité et des critères de classement."),
            question("Quel réflexe aide à mieux maîtriser la visibilité d'une publication ?", ["Vérifier les paramètres d'audience avant de publier", "Partager systématiquement en public", "Utiliser le même mot de passe partout", "Désactiver les mises à jour"], 0, "Il faut vérifier qui pourra voir le contenu et réfléchir avant de publier.")
        ], "fa-users"),
        make("QUIZ-SNT-003", "quiz", "snt", "Données structurées", "Moyen", "Données et tableur", "Lis des données tabulaires et comprends leurs usages.", [
            question("Dans une table de données, que représente généralement une ligne ?", ["Un individu ou un enregistrement", "Une formule de calcul uniquement", "Un type de fichier", "Une colonne"], 0, "Chaque ligne décrit généralement un enregistrement ou un individu étudié."),
            question("Pourquoi choisir des unités cohérentes dans un jeu de données ?", ["Pour comparer et interpréter correctement les valeurs", "Pour augmenter le nombre de lignes", "Pour cacher les valeurs manquantes", "Pour transformer les nombres en images"], 0, "Des unités cohérentes rendent les comparaisons pertinentes."),
            question("Dans un tableur, que calcule souvent une formule commençant par `=MOYENNE(...)` ?", ["La moyenne des cellules indiquées", "Le nombre de colonnes", "Le texte le plus long", "La valeur maximale uniquement"], 0, "La fonction MOYENNE calcule la moyenne arithmétique des valeurs sélectionnées.")
        ], "fa-table"),
        make("VF-PREM-001", "truefalse", "premiere", "Python", "Facile", "Vrai ou faux : Python", "Quelques affirmations sur les premières notions Python.", [
            question("Une liste Python commence à l'indice 1.", ["Vrai", "Faux"], 1, "Faux : le premier élément est à l'indice 0."),
            question("Une chaîne de caractères peut être parcourue avec une boucle for.", ["Vrai", "Faux"], 0, "Vrai : une chaîne est une séquence de caractères.")
        ], "fa-circle-check"),
        make("VF-PREM-002", "truefalse", "premiere", "Algorithmique", "Facile", "Vrai ou faux : algorithmes", "Vérifie les propriétés de quelques algorithmes simples.", [
            question("Une recherche séquentielle peut examiner tous les éléments d'une liste.", ["Vrai", "Faux"], 0, "Vrai : dans le pire cas, elle parcourt toute la liste."),
            question("Une fonction peut renvoyer une valeur avec `return`.", ["Vrai", "Faux"], 0, "Vrai : return transmet un résultat à l'appelant.")
        ], "fa-circle-question"),
        make("SORTIE-PREM-001", "output", "premiere", "Python", "Facile", "Devine la sortie : calcul", "Lis le code puis choisis ce qui sera affiché.", [
            question("Que va afficher ce programme ?", ["5", "7", "2", "Erreur"], 1, "x vaut 5, puis reçoit 5 + 2 : print affiche 7.", "x = 5\nx = x + 2\nprint(x)"),
            question("Que va afficher ce programme ?", ["0 1 2", "1 2 3", "0 1 2 3", "Erreur"], 0, "range(3) fournit 0, 1 et 2.", "for i in range(3):\n    print(i, end=' ')"),
            question("Que va afficher ce programme ?", ["8", "9", "10", "Erreur"], 1, "La boucle ajoute 0, 1, 2 et 3 : total 6, puis 3 + 6 vaut 9.", "total = 3\nfor i in range(4):\n    total += i\nprint(total)")
        ], "fa-terminal"),
        make("SORTIE-PREM-002", "output", "premiere", "Listes", "Moyen", "Devine la sortie : listes", "Anticipe les effets d'accès et de modification d'une liste.", [
            question("Que vaut `nombres[1]` ?", ["4", "8", "12", "Erreur"], 1, "Les indices commencent à 0 : l'indice 1 contient 8.", "nombres = [4, 8, 12]\nprint(nombres[1])"),
            question("Qu'affiche le programme ?", ["[1, 2]", "[1, 2, 3]", "[3, 2, 1]", "Erreur"], 1, "append ajoute 3 à la fin de la liste.", "nombres = [1, 2]\nnombres.append(3)\nprint(nombres)"),
            question("Que vaut `len(mot)` ?", ["3", "4", "5", "6"], 1, "La chaîne contient quatre caractères, espace compris.", "mot = 'NSI !'\nprint(len(mot))")
        ], "fa-terminal"),
        make("BUG-PREM-001", "bug", "premiere", "Python", "Facile", "Trouve le bug : syntaxe", "Repère l'erreur qui empêche ce code de s'exécuter.", [
            question("Quel est le problème ?", ["Il manque les deux-points après range(5)", "print doit être en majuscules", "range ne peut pas prendre 5", "Aucun problème"], 0, "Une instruction for doit se terminer par deux-points.", "for i in range(5)\n    print(i)"),
            question("Quelle correction faut-il apporter ?", ["Remplacer `=` par `==`", "Ajouter un `:` après if", "Retirer les parenthèses", "Aucune correction"], 1, "L'en-tête d'un if se termine par deux-points.", "if age >= 15\n    print('NSI')")
        ], "fa-bug"),
        make("BUG-PREM-002", "bug", "premiere", "Listes", "Moyen", "Trouve le bug : indices", "Détecte les erreurs courantes avec les listes.", [
            question("Pourquoi cette ligne provoque-t-elle une erreur ?", ["Une liste ne peut pas avoir 3 éléments", "Le dernier indice est 2, pas 3", "print ne prend pas de liste", "Il faut utiliser des accolades"], 1, "Pour trois éléments, les indices valides sont 0, 1 et 2.", "notes = [12, 15, 9]\nprint(notes[3])"),
            question("Comment corriger le calcul de moyenne ?", ["Diviser par len(notes)", "Multiplier par len(notes)", "Utiliser notes[0] uniquement", "Le code est correct"], 0, "On divise la somme par le nombre de notes.", "notes = [10, 14, 16]\nmoyenne = sum(notes) / 2")
        ], "fa-bug"),
        make("ALGO-PREM-001", "algorithm", "premiere", "Algorithmes", "Moyen", "Quel algorithme ?", "Reconnais le principe d'un algorithme de tri.", [
            question("Cet algorithme compare des voisins et les échange s'ils sont dans le mauvais ordre. Lequel ?", ["Tri à bulles", "Tri par insertion", "Recherche dichotomique", "Parcours en largeur"], 0, "Le tri à bulles effectue des comparaisons et échanges entre voisins."),
            question("Quel algorithme cherche un élément en divisant par deux une liste triée ?", ["Recherche séquentielle", "Recherche dichotomique", "Tri à bulles", "Parcours en profondeur"], 1, "La recherche dichotomique élimine la moitié des possibilités à chaque étape.")
        ], "fa-diagram-project"),

        // Terminale : structures, SQL, graphes et complexité
        make("QUIZ-TERM-001", "quiz", "terminale", "Structures de données", "Moyen", "Structures de données", "Piles, files, arbres et graphes au programme de Terminale.", [
            question("Dans une pile, quel élément sort en premier ?", ["Le premier ajouté", "Le dernier ajouté", "L'élément du milieu", "Cela dépend de sa valeur"], 1, "Une pile suit LIFO : dernier entré, premier sorti."),
            question("Quel parcours d'arbre visite d'abord la racine puis ses enfants ?", ["Parcours en largeur", "Parcours infixe", "Tri par insertion", "Recherche dichotomique"], 0, "Le parcours en largeur explore niveau par niveau depuis la racine."),
            question("Une arête dans un graphe représente généralement…", ["Un sommet", "Un lien entre deux sommets", "Une liste triée", "Une fonction"], 1, "Les sommets sont reliés par des arêtes.")
        ], "fa-diagram-project"),
        make("QUIZ-TERM-002", "quiz", "terminale", "SQL", "Moyen", "Bases de données et SQL", "Interroge les requêtes et le modèle relationnel.", [
            question("Quelle clause filtre les lignes d'une requête SQL ?", ["ORDER BY", "WHERE", "SELECT", "JOIN"], 1, "WHERE sélectionne les lignes répondant à une condition."),
            question("À quoi sert une clé primaire ?", ["À trier les lignes", "À identifier une ligne de façon unique", "À chiffrer une table", "À compter les colonnes"], 1, "La clé primaire identifie chaque enregistrement de manière unique."),
            question("Quelle commande récupère des données ?", ["SELECT", "UPDATE", "DELETE", "CREATE"], 0, "SELECT permet de lire des données dans une ou plusieurs tables.")
        ], "fa-database"),
        make("QUIZ-TERM-003", "quiz", "terminale", "Réseaux et complexité", "Difficile", "Réseaux et algorithmique", "Routage, protocoles, récursivité et coût des algorithmes.", [
            question("Dans un réseau, quel appareil achemine des paquets entre réseaux ?", ["Commutateur", "Routeur", "Serveur DNS", "Carte graphique"], 1, "Un routeur choisit une route pour transmettre les paquets entre réseaux."),
            question("Un algorithme en O(n²) voit son coût…", ["Doubler quand n double", "Être approximativement multiplié par 4 quand n double", "Rester constant", "Être divisé par 2"], 1, "Le terme dominant devient (2n)² = 4n²."),
            question("Quel protocole associe un nom de domaine à une adresse IP ?", ["HTTP", "DNS", "TCP", "SSH"], 1, "Le DNS permet notamment de retrouver l'adresse IP associée à un nom.")
        ], "fa-network-wired"),
        make("VF-TERM-001", "truefalse", "terminale", "Structures de données", "Moyen", "Vrai ou faux : structures", "Valide tes repères sur les structures de données.", [
            question("Une file suit le principe FIFO.", ["Vrai", "Faux"], 0, "Vrai : premier entré, premier sorti."),
            question("Dans un arbre binaire, chaque nœud a exactement deux enfants.", ["Vrai", "Faux"], 1, "Faux : un nœud peut avoir zéro, un ou deux enfants."),
            question("Un graphe peut contenir des cycles.", ["Vrai", "Faux"], 0, "Vrai : certains chemins reviennent à leur sommet de départ.")
        ], "fa-circle-check"),
        make("VF-TERM-002", "truefalse", "terminale", "SQL", "Moyen", "Vrai ou faux : données et réseaux", "Quelques repères sur SQL et les communications réseau.", [
            question("La clause ORDER BY peut trier les résultats d'une requête.", ["Vrai", "Faux"], 0, "Vrai : ORDER BY ordonne les lignes selon une ou plusieurs colonnes."),
            question("TCP garantit un ordre de livraison des données reçues.", ["Vrai", "Faux"], 0, "TCP fournit un flux fiable et ordonné entre les applications.")
        ], "fa-circle-question"),
        make("SORTIE-TERM-001", "output", "terminale", "Récursivité", "Moyen", "Devine la sortie : récursivité", "Suis les appels récursifs pour trouver le résultat.", [
            question("Que renvoie cet appel ?", ["1", "6", "24", "Erreur"], 2, "La fonction calcule 4 × 3 × 2 × 1 = 24.", "def fact(n):\n    if n == 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(4))"),
            question("Que va afficher ce code ?", ["0", "1", "2", "3"], 2, "L'appel récursif ajoute 1 jusqu'à atteindre le cas de base n == 0.", "def compte(n):\n    if n == 0:\n        return 0\n    return 1 + compte(n - 1)\n\nprint(compte(2))")
        ], "fa-terminal"),
        make("SORTIE-TERM-002", "output", "terminale", "SQL", "Moyen", "Devine le résultat : SQL", "Interprète une requête sur une table simple.", [
            question("Combien de lignes sont sélectionnées ?", ["1", "2", "3", "0"], 1, "Les âges 18 et 20 sont supérieurs ou égaux à 18.", "Élèves(age) : 16, 18, 20\nSELECT age FROM Élèves WHERE age >= 18;"),
            question("Quel ordre produit cette requête ?", ["Croissant", "Décroissant", "Ordre d'insertion", "Aucun résultat"], 1, "DESC demande un ordre décroissant.", "SELECT nom FROM Élèves ORDER BY nom DESC;")
        ], "fa-terminal"),
        make("BUG-TERM-001", "bug", "terminale", "Récursivité", "Moyen", "Trouve le bug : récursivité", "Un cas de base manquant peut empêcher la fonction de s'arrêter.", [
            question("Quel est le défaut de cette fonction ?", ["Elle n'a pas de cas de base", "n ne peut pas être un entier", "return est interdit", "Elle trie la liste"], 0, "Sans condition d'arrêt, les appels se poursuivent jusqu'à une erreur de récursion.", "def somme(n):\n    return n + somme(n - 1)"),
            question("Pourquoi l'appel peut-il ne jamais atteindre le cas de base ?", ["n diminue de 1", "n augmente de 1", "print est absent", "La fonction n'a pas de nom"], 1, "Pour atteindre n == 0 à partir d'un entier positif, il faut diminuer n.", "def descente(n):\n    if n == 0:\n        return\n    descente(n + 1)")
        ], "fa-bug"),
        make("BUG-TERM-002", "bug", "terminale", "SQL", "Moyen", "Trouve le bug : SQL", "Repère les erreurs de syntaxe et de logique dans une requête.", [
            question("Quelle clause manque pour filtrer les lignes ?", ["WHERE", "VALUES", "INTO", "SET"], 0, "La condition de sélection des lignes s'écrit avec WHERE.", "SELECT nom FROM Élèves age > 17;"),
            question("Quel est le problème avec cette requête ?", ["Une virgule manque après nom", "La table doit être une clé primaire", "Il faut enlever SELECT", "Aucun problème"], 0, "Les colonnes projetées sont séparées par une virgule.", "SELECT nom age FROM Élèves;")
        ], "fa-bug"),
        make("ALGO-TERM-001", "algorithm", "terminale", "Graphes", "Moyen", "Quel algorithme de graphe ?", "Reconnais un parcours classique de graphe.", [
            question("Quel parcours explore d'abord tous les voisins proches avant de s'éloigner ?", ["Parcours en largeur (BFS)", "Parcours en profondeur (DFS)", "Tri à bulles", "Recherche dichotomique"], 0, "Le parcours en largeur progresse par couches de distance."),
            question("Quel outil est couramment utilisé pour un parcours en largeur ?", ["Une file", "Une pile uniquement", "Une table SQL", "Un arbre binaire de recherche"], 0, "La file conserve l'ordre de découverte des sommets pour BFS.")
        ], "fa-diagram-project"),

        // Ressources d'animation et d'évaluation à destination des enseignants
        make("PROF-QUIZ-001", "quiz", "professeur", "Pédagogie", "Ressource", "Construire un quiz formatif", "Repères pour créer une activité courte qui aide à ajuster l'enseignement.", [
            question("Quel est l'objectif principal d'une évaluation formative ?", ["Classer définitivement les élèves", "Repérer les acquis et difficultés pour adapter l'apprentissage", "Remplacer tous les cours", "Évaluer uniquement la vitesse"], 1, "Elle fournit des informations utiles pour guider les apprentissages."),
            question("Un bon distracteur de QCM est…", ["Une réponse absurde", "Une erreur plausible liée à une confusion fréquente", "Toujours plus long que la bonne réponse", "Une deuxième bonne réponse"], 1, "Les distracteurs diagnostiques rendent les conceptions des élèves visibles.")
        ], "fa-chalkboard-user"),
        make("PROF-OUTIL-001", "quiz", "professeur", "Différenciation", "Ressource", "Différencier un exercice", "Choisir des aides progressives sans changer la notion visée.", [
            question("Quel aménagement soutient une démarche de différenciation ?", ["Donner une aide graduée que l'élève peut solliciter", "Retirer l'objectif d'apprentissage", "Donner la solution immédiatement à tous", "Évaluer une notion différente"], 0, "Des indices gradués soutiennent l'autonomie tout en gardant la même cible."),
            question("Une consigne efficace précise surtout…", ["Le résultat attendu et les contraintes utiles", "La méthode unique à recopier", "Le barème uniquement", "Le vocabulaire le plus technique possible"], 0, "Une consigne explicite clarifie la production attendue et les contraintes.")
        ], "fa-people-group"),
        make("PROF-SEQ-001", "quiz", "professeur", "Progression pédagogique", "Ressource", "Préparer une séance de NSI", "Quelques repères pour structurer une séance autour d'un objectif clair.", [
            question("Quel élément aide à vérifier l'alignement d'une séance ?", ["Relier objectif, activité et évaluation", "Multiplier les notions sans lien", "Évaluer avant de définir l'objectif", "Supprimer les retours aux élèves"], 0, "La cohérence entre objectif, activité et évaluation rend les apprentissages lisibles."),
            question("Pourquoi prévoir une mise en commun après une activité ?", ["Pour comparer les démarches et expliciter les notions", "Pour éviter toute question", "Pour remplacer la pratique", "Pour réduire le temps de réflexion"], 0, "La mise en commun permet de verbaliser et de stabiliser les apprentissages.")
        ], "fa-person-chalkboard")
    ];
    window.nsiQuizActivities = activities;
    window.nsiClassroomQuizzes = activities.filter(item => item.type === "quiz").map(item => ({
        id: item.id, level: item.level, title: item.title,
        questions: item.questions.map((q, index) => ({
            id: `${item.id}-Q${String(index + 1).padStart(2, "0")}`,
            question: q.prompt, answers: q.options, correctAnswer: q.answer, explanation: q.explanation, code: q.code
        }))
    }));
})();

