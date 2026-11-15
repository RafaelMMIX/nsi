const changelog = [
    {
        version: "1.6.2.0",
        date: "15 novembre 2026",
        changes: [
            {
                type: "new",
                title: "Mes cours de NSI",
                description: "Dans les Paramètres, indique tes créneaux de NSI : jour, horaires, salle, et même semaine A ou B. NSI Hub te montre quand a lieu ton prochain cours."
            },
            {
                type: "new",
                title: "Rappels avant les cours",
                description: "Choisis quand être prévenu : la veille à 19 h (ou à l'heure de ton choix), 1 h, 30 min, 15 min, 10 min ou 5 min avant. Les rappels sont coupés pendant les vacances de ta zone et les jours fériés."
            },
            {
                type: "new",
                title: "Dans l'agenda de ton téléphone",
                description: "Un bouton ajoute tes cours et tes rappels à l'agenda de ton téléphone : les rappels arrivent même quand NSI Hub est fermé. Tu peux aussi activer les notifications du site, qui marchent quand NSI Hub est ouvert."
            }
        ]
    },
    {
        version: "1.6.1.0",
        date: "15 novembre 2026",
        changes: [
            {
                type: "new",
                title: "Une vraie page 404",
                description: "Une adresse qui n'existe pas affiche maintenant une page 404 aux couleurs de NSI Hub, au lieu de la page grise de GitHub : message d'erreur façon Python, liens vers les pages qui ressemblent le plus à ce que tu cherchais et retour à l'accueil."
            },
            {
                type: "new",
                title: "Un terminal pour se perdre avec style",
                description: "La page 404 contient un petit terminal : help, ls, cd, cat, whoami, des blagues d'informaticien, des anecdotes sur l'histoire de l'informatique… et plusieurs commandes cachées."
            },
            {
                type: "new",
                title: "12 easter eggs et une chasse aux bugs",
                description: "Retrouve les 12 easter eggs cachés dans la page (ta progression est gardée), et écrase un maximum de bugs en 20 secondes pour battre ton record."
            }
        ]
    },
    {
        version: "1.6.0",
        date: "15 novembre 2026",
        changes: [
            {
                type: "new",
                title: "31 prompts au lieu de 4",
                description: "La page Prompts propose maintenant 31 prompts rangés en 8 thèmes : comprendre, coder et déboguer, s'entraîner et réviser, SQL, web, projets, bac et oral, et une partie pour les profs. La plupart demandent à l'IA de te guider plutôt que de te donner la réponse."
            },
            {
                type: "new",
                title: "Prompts à compléter",
                description: "Clique sur « Utiliser » : remplis les cases (ton code, ton erreur, la notion…) et elles sont insérées dans le prompt, avec un aperçu avant de copier. Ton niveau est prérempli selon ton profil."
            },
            {
                type: "new",
                title: "Recherche, thèmes et favoris",
                description: "Recherche un prompt, filtre par thème et ajoute tes prompts préférés en favoris pour les retrouver en un clic. Un encadré rappelle aussi comment bien utiliser l'IA."
            }
        ]
    },
    {
        version: "1.5.1",
        date: "15 novembre 2026",
        changes: [
            {
                type: "improved",
                title: "Mails momentanément indisponibles",
                description: "La messagerie du lycée ne fonctionne toujours pas : la carte Mails est grisée et marquée « Indisponible ». Un clic affiche un message au lieu d'ouvrir une page qui ne répond pas. Elle reviendra dès que le service sera rétabli."
            }
        ]
    },
    {
        version: "1.5.0",
        date: "15 novembre 2026",
        changes: [
            {
                type: "new",
                title: "Barre DEV sur chaque page",
                description: "En mode développeur, une barre en bas à gauche affiche la version, la page, le thème, le profil, la taille de l'écran, le stockage et le nombre d'erreurs. Elle permet de changer de thème, de couper les animations, de changer de profil, d'afficher le contour de tous les éléments et de lancer les tests de l'accueil."
            },
            {
                type: "new",
                title: "Journal des erreurs",
                description: "Les erreurs JavaScript, les promesses rejetées et les fichiers introuvables de toutes les pages sont enregistrés et listés dans les Paramètres, avec la page, la ligne et la pile d'appels. Le journal se copie en un clic pour signaler un bug."
            },
            {
                type: "new",
                title: "Inspecteur du stockage",
                description: "Toutes les données de NSI Hub enregistrées dans le navigateur, avec leur type et leur taille. Chaque valeur peut être consultée, modifiée (le JSON est vérifié avant l'enregistrement), copiée ou supprimée."
            },
            {
                type: "new",
                title: "Plus de tests",
                description: "Changer de profil en un clic, prévisualiser n'importe quelle annonce (sans la marquer comme vue), forcer le message de bienvenue, ouvrir le rappel ENT ou la popup de partage, provoquer une erreur de test, et générer des données de démo (notebooks, favoris, statistiques) qui se suppriment sans rien abîmer."
            }
        ]
    },
    {
        version: "1.4.1",
        date: "15 novembre 2026",
        changes: [
            {
                type: "improved",
                title: "Messages de bienvenue variés",
                description: "Le message de bienvenue avec ton prénom change à chaque fois : une vingtaine de variantes, selon le moment de la journée et le jour de la semaine, sans jamais répéter le même deux fois de suite."
            },
            {
                type: "improved",
                title: "L'annonce ne s'affiche plus à chaque visite",
                description: "Une annonce s'ouvre une seule fois. Après l'avoir fermée, elle reste accessible avec l'onglet « Info importante », et ne revient d'elle-même qu'à la publication d'une nouvelle annonce. Elle se ferme aussi avec Échap ou en cliquant à côté."
            },
            {
                type: "new",
                title: "Annonce des versions 1.3 et 1.4",
                description: "L'annonce de l'accueil présente les nouveautés des versions 1.3 (notebooks Python, SQL et texte) et 1.4 (thème clair, paramètres)."
            }
        ]
    },
    {
        version: "1.4.0",
        date: "15 novembre 2026",
        changes: [
            {
                type: "new",
                title: "Thème clair",
                description: "NSI Hub existe maintenant en clair. Dans Paramètres, choisis Sombre, Clair ou Auto (le site suit alors le réglage de ton appareil). Le choix s'applique tout de suite sur toutes les pages, même dans les autres onglets."
            },
            {
                type: "bug",
                title: "« Effacer les données » ne touche plus aux autres sites",
                description: "Le bouton vidait tout le stockage du navigateur, y compris celui des autres sites hébergés à la même adresse, comme Booster perso. Il ne supprime plus que les données de NSI Hub."
            },
            {
                type: "bug",
                title: "L'interrupteur Animations fonctionne",
                description: "Il enregistrait le choix sans l'appliquer. Désactivé, il coupe maintenant les transitions, les effets, les confettis et raccourcit l'écran de chargement sur tout le site."
            },
            {
                type: "new",
                title: "Espace utilisé",
                description: "Les Paramètres montrent la place occupée par NSI Hub (notebooks, bases SQL, statistiques…) et par les autres sites, avec le détail par notebook et un bouton pour remettre la base d'un notebook à son état d'origine."
            },
            {
                type: "improved",
                title: "Même menu sur toutes les pages",
                description: "Paramètres, Outils, Prompts, Dico, Statistiques, Changelog et À propos utilisent maintenant le même en-tête et le même menu que le reste du site."
            },
            {
                type: "improved",
                title: "Petites améliorations",
                description: "La touche Entrée enregistre le prénom, et la carte Prénom ne se chevauche plus sur téléphone."
            }
        ]
    },
    {
        version: "1.3.1",
        date: "14 novembre 2026",
        changes: [
            {
                type: "new",
                title: "Nouveaux liens sur l'accueil",
                description: "Recherche : Ecosia, Lilo et Wikipédia. Apprendre : CodEx (exercices Python et SQL corrigés), la documentation Python en français, MDN Web Docs, VisuAlgo et les annales du bac NSI. Développement : Basthon et draw.io. Cours & Lycée : Capytale."
            },
            {
                type: "bug",
                title: "Favoris affichés tout de suite",
                description: "Une ressource ajoutée aux favoris n'apparaissait dans « Mes favoris » qu'après avoir rechargé la page. Elle s'affiche maintenant immédiatement."
            }
        ]
    },
    {
        version: "1.3.0",
        date: "14 novembre 2026",
        changes: [
            {
                type: "new",
                title: "Notebooks SQL",
                description: "Les notebooks accueillent maintenant des cellules SQL, exécutées dans le navigateur avec SQLite. Chaque notebook a sa propre base de données : la base d'exemple Lycée (élèves, classes, matières, professeurs, notes), une base vide ou un fichier .db / .sqlite importé. Les modifications sont enregistrées et un bouton permet de revenir à la base d'origine."
            },
            {
                type: "new",
                title: "Panneau Base de données",
                description: "Un panneau affiche les tables, leurs colonnes, les clés primaires et étrangères, et le nombre de lignes. On peut ajouter une table depuis un fichier .csv et télécharger la base."
            },
            {
                type: "new",
                title: "Python et SQL ensemble",
                description: "Depuis Python, requete() renvoie le résultat d'une requête et tableau() l'affiche. Le module sqlite3 fonctionne aussi sur la base du notebook."
            },
            {
                type: "new",
                title: "Un vrai éditeur de code",
                description: "Coloration syntaxique, numéros de ligne, indentation automatique, complétion (Ctrl + Espace) et raccourcis : Ctrl + Entrée pour exécuter, Maj + Entrée pour passer à la cellule suivante."
            },
            {
                type: "new",
                title: "Erreurs expliquées en français",
                description: "Les erreurs Python et SQL les plus courantes sont expliquées avec une piste pour les corriger, et la ligne concernée est surlignée."
            },
            {
                type: "improved",
                title: "input() fonctionne",
                description: "Les programmes Python peuvent demander des valeurs avec input(). La dernière valeur d'une cellule s'affiche automatiquement, comme dans Jupyter."
            },
            {
                type: "new",
                title: "Tutos prêts à l'emploi",
                description: "À la création d'un notebook, on peut partir d'un modèle : Découvrir les notebooks, Premiers pas en SQL, Jointures et agrégats, Modifier une base, Python + SQL. Les exercices ont leur solution."
            },
            {
                type: "improved",
                title: "Mes notebooks",
                description: "Import de fichiers Jupyter (.ipynb), recherche, renommage et duplication. Export en .ipynb, .py, .sql et .db. Les pages notebooks utilisent maintenant le même menu que le reste du site."
            }
        ]
    },
    {
        version: "1.2.6.2",
        date: "14 novembre 2026",
        changes: [
            {
                type: "cancelled",
                title: "Quiz en classe retiré",
                description: "Le Quiz en classe (parties en direct avec Supabase) ne fonctionnait pas et a été retiré, ainsi que ses liens dans la navigation, le mode présentation et les statistiques. Les quiz de l'espace Quiz & Jeux restent disponibles."
            },
            {
                type: "bug",
                title: "Recherche de l'accueil réparée",
                description: "La recherche plantait à cause des cartes Mails et Qwant, qui n'avaient pas de mots-clés."
            },
            {
                type: "bug",
                title: "Corrections diverses",
                description: "Les icônes s'affichent à nouveau sur les pages Outils et Prompts, le convertisseur gère les grands nombres et vide les champs quand la saisie est invalide, et la bonne réponse d'une question de Quiz & Jeux sur len() a été corrigée."
            },
            {
                type: "bug",
                title: "Le mémo garde enfin tes notes",
                description: "Le mémo de l'accueil affichait « Enregistré automatiquement » sans rien enregistrer. Tes notes sont maintenant conservées dans le navigateur, et le bouton « Effacer » fonctionne."
            },
            {
                type: "bug",
                title: "Favoris NSI Première et Pixees séparés",
                description: "Ajouter NSI Première aux favoris ajoutait aussi Pixees (et inversement). Chaque carte a désormais son propre favori."
            },
            {
                type: "improved",
                title: "Page des annonces accessible",
                description: "Un lien « Voir toutes les annonces » a été ajouté à la fenêtre d'annonce de l'accueil. La page affiche maintenant la bonne version, une horloge qui fonctionne et une navigation à jour."
            },
            {
                type: "improved",
                title: "Chargement plus rapide",
                description: "L'écran de chargement dure maintenant 1,5 seconde au lieu de 3,2."
            },
            {
                type: "improved",
                title: "README à jour",
                description: "La présentation du projet sur GitHub décrit maintenant les notebooks, les outils, Quiz & Jeux, le dictionnaire, les statistiques, les profils et le mode présentation."
            }
        ]
    },
    {
        version: "1.2.6.1",
        date: "16 octobre 2026",
        changes: [
            {
                type: "bug",
                title: "Page changelog de nouveau disponible",
                description: "Suite a un incident mineur (oublie d'un caractère), la page changelog a été indisponible."
            },
            {
                type: "improved",
                title: "Versionnement plus précis",
                description: "Le système de version adopte désormais un quatrième numéro (ex. : 1.2.5.1) pour identifier plus précisément les petites mises à jour et les corrections de bugs."
            },
            {
                type:"cancelled",
                title: "J'ai voulu faire un truc moi même",
                description: "Bah enfait j'annule le projet, trop dur... Jvais demander a codex de me faire ça mdrrrrrrr, ou va sur le github, pour m'aider un peu (va sur la page about.html, et va sur le github)."
            }
        ]
    },
    {
        version: "1.2.6",
        date: "16 octobre 2026",
        changes: [
            {
                type: "new",
                title: "Ajout de PIX",
                description: "Un accès direct à PIX est désormais disponible dans la section « Cours & Lycée » pour accéder à la plateforme d'évaluation et de certification des compétences numériques."
            }
        ]
    },
    {
        version: "1.2.5",
        date: "08 octobre 2026",
        changes: [
            {
                type: "new",
                title: "Quiz en classe",
                description: "Le professeur crée une partie à partir des quiz existants et partage un QR code. Les élèves rejoignent avec un pseudo, répondent depuis leur appareil et voient les classements calculés selon la justesse et la rapidité. Les résultats alimentent l'historique local et les statistiques du professeur."
            },
            {
                type: "improved",
                title: "Annonces visibles par les professeurs",
                description: "Les annonces importantes de l'accueil sont désormais également accessibles avec le profil professeur."
            },
            {
                type: "new",
                title: "Mode présentation",
                description: "Ajout d'un espace réservé au profil professeur pour les cours projetés : horloge, plein écran, raccourcis clavier, réglage de la taille du texte et accès rapide aux ressources, outils, notebooks et Quiz en classe."
            },
            {
                type: "improved",
                title: "Quiz partagés avec Quiz & Jeux",
                description: "Les quiz en classe réutilisent le catalogue existant avec des identifiants de questions stables. La navigation professeur et les statistiques incluent désormais les parties, les scores, les participations et les temps de réponse."
            },
            {
                type: "new",
                title: "Espace Quiz & Jeux",
                description: "Une nouvelle page propose des quiz, du vrai ou faux, des sorties de code à deviner, des bugs à trouver et des défis d'algorithmique adaptés aux profils SNT, Première, Terminale ou Professeur. Les scores et la progression sont enregistrés localement, et chaque activité dispose d'un identifiant ainsi que d'un lien de signalement."
            }
        ]
    },
    {
        version: "1.2.4",
        date: "08 octobre 2026",
        changes: [
            {
                type: "improved",
                title: "Profils personnalisés",
                description: "Les profils SNT, Première, Terminale et Professeur sont maintenant sélectionnables. L’accueil propose des raccourcis et met en évidence les ressources adaptées au profil choisi, qui est aussi affiché dans les paramètres."
            },
            {
                type: "bug",
                title: "Les notebooks sont de retour",
                description: "Les notebooks fonctionnent à nouveau : chaque document retrouve ses propres cellules, qui s'enregistrent automatiquement. Python peut être exécuté dans le navigateur et les notebooks peuvent être exportés aux formats Jupyter (.ipynb) et Python (.py)."
            },
            {
                type: "new",
                title: "Page Statistiques personnelles",
                description: "Une nouvelle page regroupe les visites, le temps d’utilisation, les ressources ouvertes, les recherches, les favoris et l’activité des notebooks. Des graphiques d’activité, un export et un import des statistiques sont disponibles ; les données restent stockées localement sur l’appareil. Les quiz, exercices et notions maîtrisées ne sont pas encore suivis."
            },
            {
                type: "new",
                title: "Dictionnaire NSI",
                description: "Création d'un dictionnaire informatique avec plus de 370 mots et définitions autour de la NSI, de la programmation, des réseaux et du web."
            },
            {
                type: "improved",
                title: "Recherche et filtres du dictionnaire",
                description: "La recherche porte sur les termes et leurs définitions. Des filtres permettent d'afficher les notions JavaScript, HTML, CSS, Python, algorithmes, réseaux ou bases de données."
            },
            {
                type: "new",
                title: "Ressources pour approfondir les définitions",
                description: "Chaque entrée du dictionnaire propose un lien pour en savoir plus : MDN pour les technologies web, la documentation Python ou Wikipédia pour les autres notions."
            },
            {
                type: "improved",
                title: "Page À propos enrichie",
                description: "La page présente désormais les statistiques du projet, son parcours, les technologies utilisées, les choix de vie privée, les pistes d’évolution, les remerciements et des moyens de contribuer. Des compteurs animés et un petit secret complètent la page."
            },
            {
                type: "improved",
                title: "Accueil et page de félicitations",
                description: "L’accueil et la page de félicitations ont été retravaillés pour rendre leur présentation plus claire et leurs animations plus soignées."
            },
            {
                type: "improved",
                title: "Écran de chargement animé",
                description: "L’écran de chargement bénéficie d’une animation plus complète, d’une progression visible, de conseils, d’un bouton pour passer l’animation et d’une durée légèrement prolongée."
            },
            {
                type: "improved",
                title: "Mode développeur",
                description: "Le mode développeur propose des raccourcis pour prévisualiser le chargement, tester les confettis et réinitialiser les états de test. Son activation est mémorisée et ses effets sont indiqués dans l’interface."
            },
            {
                type: "improved",
                title: "Favicon sur toutes les pages",
                description: "Le favicon du site est maintenant référencé sur l’ensemble des pages HTML."
            }
        ]
    },
    {
        version: "1.2.3",
        date: "07 octobre 2026",
        changes: [
            {
                type: "improved",
                title: "Connexion ENT",
                description: "Ajout d'un rappel quotidien pour se connecter à l'ENT avant d'accéder à certaines ressources."
            },
            {
                type: "improved",
                title: "Écran de chargement",
                description: "Un nouvel écran de chargement fait désormais son apparition lors de l'accès à NSI Hub."
            },
            {
                type: "new",
                title: "Le prof de la NSIT a approuvé le site !",
                description: "Ajout d'une page de célébration spéciale pour annoncer l'approbation de NSI Hub par le professeur, avec confettis et animations."
            },
            {
                type: "new",
                title: "Célébrations aléatoires",
                description: "Des confettis peuvent désormais apparaître aléatoirement sur l'accueil pour célébrer l'approbation du site."
            }
        ]
    },
    {
        version: "1.2.2",
        date: "30 septembre 2026",
        changes: [
            {
                type: "new",
                title: "Annonces importantes",
                description: "Ajout d'une pop-up qui s'affiche pour toutes les informations importantes qui peuvent être realative au lycée."
            },
            {
                type: "new",
                title: "Messagerie de l'ENT",
                description: "Ajout de la messagerie de l'ENT en tant que bouton dans la catégorie \"Cours & Lycée\"."
            },
            {
                type: "improved",
                title: "Ajout d'un niveau",
                description: "Ajout de \"professeur\" dans la selection de profil, ça n'a pour l'instant aucune conéquence sur l'affichage du site."
            },
            {
                type: "accepted",
                title: "Vraie selection de profil",
                description: "Pour le moment, la selection de profil ne change rien, faut changer ça."
            },
            {
                type: "new",
                title: "Ajout d'un chargement",
                description: "Ajout d'un écran de chargement a la selection du profil."
            }
        ]
    },
    {
        version: "1.2.1",
        date: "29 septembre 2026",
        changes: [
            {
                type: "new",
                title: "Favicon temporaire",
                description: "Ajout d'un favicon non personnalisé (un simple émojis) en attendant un vrai favicon, qui sera dans la semaine a suivre."
            },
            {
                type: "removed",
                title: "Easter Egg retiré",
                description: "Un Easter Egg (oeuf de pâques) à été retiré."
            },
            {
                type: "new",
                title: "Qwant",
                description: "Ajout d'une section pour les moteurs de recherche, où il n'y a que Qwant, arrêtez d'utiliser google il nous faut notre souveraineté numérique"
            }
        ]
    },
    {
        version: "1.2.0",
        date: "26 septembre 2026",
        changes: [
            {
                type: "new",
                title: "Bandeau d'informations",
                description: "Ajout d'un bandeau défilant en haut du site."
            },
            {
                type: "new",
                title: "Page À propos",
                description: "Ajout d'une page présentant NSI Hub et son fonctionnement."
            },
            {
                type: "improved",
                title: "Contributions",
                description: "Il est maintenant possible de proposer une idée ou signaler une erreur."
            },
            {
                type: "removed",
                title: "Notebook retiré pour le moment",
                description: "Le notebook à pour l'instant été retiré pour pouvoir l'améliorer, veuillez utiliser celui du prof pour le moment."
            },
            {
                type: "accepted",
                title: "index.html différent pour les différents niveaux (première et terminale)",
                description: "Cette idée a été acceptée et sera mise en place dans une prochaine version."
            }
        ]
    },

    {
        version: "1.1.0",
        date: "25 septembre 2026",
        changes: [
            {
                type: "new",
                title: "Paramètres",
                description: "Ajout d'une page de paramètres."
            },
            {
                type: "new",
                title: "Bienvenue personnalisé",
                description: "Ajout d'un message de bienvenue avec le prénom."
            }
        ]
    }
];

const changelogContainer =
    document.getElementById("changelog");


const icons = {
    new: "fa-plus",
    improved: "fa-wand-magic-sparkles",
    fixed: "fa-bug",
    removed: "fa-trash",
    accepted: "fa-lightbulb",
    bug: "fa-bug",
    cancelled: "fa-ban",
};


const labels = {
    new: "Nouveau",
    improved: "Amélioration",
    fixed: "Correction",
    removed: "Suppression",
    accepted: "Idée à venir",
    cancelled: "Idée annulée",
    bug: "Bug résolu"
};

changelog.forEach((release) => {

    const versionBlock =
        document.createElement("section");

    versionBlock.className = "version-block";


    versionBlock.innerHTML = `
        <div class="version-header">

            <span class="version-number">
                v${release.version}
            </span>

            <span class="version-date">
                ${release.date}
            </span>

        </div>

        <div class="change-list"></div>
    `;


    const changeList =
        versionBlock.querySelector(".change-list");


    release.changes.forEach((change) => {

        const changeElement =
            document.createElement("div");

        changeElement.className =
            `change-group ${change.type}`;

        changeElement.innerHTML = `
            <div class="change-icon">
                <i class="fa-solid ${icons[change.type]}"></i>
            </div>

            <div class="change-content">

                <span class="change-type">
                    ${labels[change.type]}
                </span>

                <h3>${change.title}</h3>

                <p>${change.description}</p>

            </div>
        `;

        changeList.appendChild(changeElement);

    });


    changelogContainer.appendChild(versionBlock);

});
