# 🖥️ NSI Hub

> Une plateforme simple, moderne et évolutive pour centraliser les ressources, outils et révisions de NSI au lycée.

[![Website](https://img.shields.io/badge/Website-NSI%20Hub-6366f1?style=for-the-badge&logo=google-chrome&logoColor=white)](https://rafaelmmix.github.io/nsi/)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-181717?style=for-the-badge&logo=github)](https://pages.github.com/)
[![HTML](https://img.shields.io/badge/HTML-5-e34f26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS-3-1572b6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

🌐 **[Accéder à NSI Hub](https://rafaelmmix.github.io/nsi/)**

---

## 📖 Présentation

**NSI Hub** est un projet personnel visant à créer un espace centralisé pour les élèves et professeurs de **Numérique et Sciences Informatiques (NSI)**.

L'objectif est simple :

> **Regrouper au même endroit les ressources, outils et services utiles à la NSI.**

Entre l'ENT, Éléa, Pixees, France-IOI, Python Tutor, GitHub, les assistants IA, les outils de développement et les ressources de cours, il est rapidement possible de se retrouver avec une quantité importante de liens.

NSI Hub cherche donc à proposer une interface unique, claire et rapide permettant d'accéder facilement à ces ressources.

Le projet est conçu pour évoluer progressivement en fonction des besoins des utilisateurs et des retours.

---

# 🎯 Objectifs

NSI Hub a plusieurs objectifs :

- 📚 Centraliser les ressources de NSI
- 🔎 Faciliter la recherche d'informations
- 💻 Fournir des outils utiles à la programmation
- 🧠 Aider aux révisions
- 🐍 Permettre de pratiquer Python directement dans le navigateur
- ⭐ Permettre de personnaliser son espace
- 👨‍🏫 Proposer un espace adapté aux enseignants
- 📢 Faciliter la diffusion d'informations importantes
- 🚀 Rester rapide et simple à utiliser
- 🔒 Conserver les préférences localement lorsque cela est possible
- 📈 Faire évoluer le projet grâce aux suggestions des utilisateurs

---

# ✨ Fonctionnalités

## 🏠 Accueil

L'accueil constitue le point central de NSI Hub.

Il regroupe les principales ressources du site sous différentes catégories.

### Fonctionnalités disponibles

- 🔎 Recherche rapide
- ⌨️ Raccourci `Ctrl + K`
- ⭐ Système de favoris
- 📝 Mémo personnel
- 👋 Message de bienvenue personnalisé
- 🕒 Horloge
- 📢 Informations importantes
- 📤 Partage du site
- ℹ️ Ticker d'informations
- 🎊 Animations et célébrations

---

# 🏫 Ressources du lycée

NSI Hub permet d'accéder rapidement aux différents services utilisés au lycée.

### Ressources disponibles

- 🏫 ENT
- ✉️ Messagerie
- 🖥️ Écran partagé Éléa
- 📚 Cours complet Éléa
- 🎓 PIX
- 🧪 Capytale

Certaines ressources nécessitant une authentification peuvent afficher un rappel invitant l'utilisateur à se connecter préalablement à l'ENT.

### Ressource indisponible

Pour griser une carte quand un service est en panne, ajouter l'attribut `data-indisponible` sur son `<a class="card">` avec le message à afficher :

```html
data-indisponible="La messagerie du lycée est momentanément indisponible."
```

La carte devient grise avec un badge « Indisponible », son lien est bloqué et un clic affiche le message (l'étoile des favoris reste utilisable). Il suffit de retirer l'attribut (et le `title`) quand le service revient. C'est le cas actuellement pour **Mails**.

---

# 🔎 Recherche

Une section dédiée aux moteurs de recherche permet notamment d'accéder à :

- 🇫🇷 Qwant
- 🌳 Ecosia
- 💧 Lilo
- 📖 Wikipédia

L'objectif est de proposer des alternatives européennes aux moteurs de recherche traditionnels.

---

# 📚 Ressources d'apprentissage

NSI Hub centralise plusieurs plateformes utiles :

- [Pixees](https://pixees.fr/)
- [France-IOI](https://www.france-ioi.org/)
- [Python Tutor](https://pythontutor.com/)
- [W3Schools](https://www.w3schools.com/)
- [CodEx](https://codex.forge.apps.education.fr/) : exercices Python et SQL corrigés
- [Documentation Python](https://docs.python.org/fr/3/)
- [MDN Web Docs](https://developer.mozilla.org/fr/)
- [VisuAlgo](https://visualgo.net/) : algorithmes animés
- [Annales du bac NSI](https://www.freemaths.fr/sujets-du-bac/baccalaureat-general/numerique-et-sciences-informatiques)

Ces ressources permettent notamment de travailler :

- Python
- algorithmique
- programmation
- HTML
- CSS
- JavaScript
- structures de données
- notions de NSI

---

# 💻 Développement

- [GitHub](https://github.com/)
- [Basthon](https://basthon.fr/) : Python et SQL dans le navigateur
- [draw.io](https://app.diagrams.net/) : schémas, graphes et diagrammes
- Cours NSI Première et Terminale (Pixees)

---

# 🤖 Intelligence artificielle

Une section dédiée aux assistants IA permet d'accéder rapidement à plusieurs services :

- ChatGPT
- Claude
- Mistral

Une page dédiée aux **prompts utiles** propose une trentaine de prompts pour apprendre avec une IA, rangés en 8 thèmes : comprendre, coder et déboguer, s'entraîner et réviser, SQL, web, projets, bac et oral, et une partie pour les profs. La plupart demandent à l'IA de guider l'élève plutôt que de donner la réponse.

- Recherche (sans tenir compte des accents) et filtres par thème
- Favoris (`nsiPromptFavoris`)
- Cases à remplir (code, erreur, notion…) insérées dans le prompt, avec aperçu ; le niveau est prérempli selon le profil
- Lien direct vers un prompt : `prompt.html#prompt-<id>`

Les prompts sont dans `prompts-data.js` : pour en ajouter un, copier un bloc et l'adapter (chaque `[CHAMP]` du texte devient une case à remplir).

---

# ⭐ Favoris

Chaque ressource peut être ajoutée aux favoris grâce à une étoile.

Les favoris sont sauvegardés localement dans le navigateur.

La section **Mes favoris** apparaît automatiquement lorsqu'au moins une ressource est enregistrée.

### Stockage

```text
nsiFavorites
```

---

# 📝 Mémo

Un bloc-notes sur l'accueil permet de garder ses notes importantes. Il est enregistré automatiquement dans le navigateur.

```text
nsiMemo
```

---

# 🧰 Outils

- 🔢 Convertisseur décimal / binaire / hexadécimal (grands nombres pris en charge)
- 🔤 Table ASCII : caractère, décimal, binaire et hexadécimal

---

# 📓 Notebooks

Des notebooks façon Jupyter, directement dans le navigateur, avec quatre types de cellules :

- 🐍 **Python**, exécuté avec Pyodide (`input()` pris en charge)
- 🗄️ **SQL**, exécuté avec SQLite (sql.js)
- 📝 **Texte** en Markdown
- 🧠 **Carte mentale**, avec un éditeur visuel (voir ci-dessous)

Fonctionnalités :

- Éditeur de code (CodeMirror) : coloration, numéros de ligne, complétion, raccourcis clavier
- Erreurs Python et SQL expliquées en français, ligne surlignée
- Une base de données par notebook : base d'exemple **Lycée**, base vide ou fichier `.db` importé ; ajout de tables depuis un `.csv` ; bouton de réinitialisation
- Panneau qui affiche les tables, colonnes, clés primaires et étrangères
- Pont Python ↔ SQL : `requete()`, `tableau()` et module `sqlite3`
- Modèles de départ : Découvrir les notebooks, Réviser avec une carte mentale, Premiers pas en SQL, Jointures et agrégats, Modifier une base, Python + SQL
- Import `.ipynb`, export `.ipynb`, `.py`, `.sql` et `.db`
- Sauvegarde automatique locale

Fichiers : `notebooks.html` / `notebooks.js` (liste), `notebook.html` / `notebook.js` / `notebook.css` (éditeur), `notebook-bases.js` (base Lycée), `notebook-modeles.js` (tutos), `notebook-erreurs.js` (explications des erreurs), `notebook-mindmap.js` (cartes mentales).

```text
nsiNotebooks                 liste des notebooks et de leurs cellules
nsiNotebookDb:<id>           base de données de chaque notebook
nsiNotebookDbOrigine:<id>    fichier .db importé d'origine
```

## 🧠 Cartes mentales

Une cellule « Carte mentale » contient un éditeur visuel. La carte est enregistrée en JSON dans le contenu de la cellule.

- **Créer** : <kbd>Tab</kbd> ajoute une idée, <kbd>Entrée</kbd> une idée sœur, double-clic (ou double appui) pour modifier, taper une lettre remplace le texte, <kbd>Maj</kbd> + <kbd>Entrée</kbd> va à la ligne
- **Organiser** : glisser-déposer une idée sur une autre (dedans, avant ou après), <kbd>Alt</kbd> + flèches pour changer l'ordre, réduire / développer une branche (<kbd>/</kbd>), copier / couper / coller / dupliquer des branches, relations fléchées entre deux idées avec un texte
- **Mettre en forme** : couleur (10 couleurs ou au choix), forme (arrondi, pilule, rectangle, souligné), taille, gras, italique, icône, `code`, case à cocher (avec progression dans la branche), note et lien
- **Apparence** : disposition carte, arbre vers la droite ou organigramme ; traits courbes, droits ou coudés ; thèmes Couleurs, Pastel, Sobre, Tableau noir ; s'adapte au thème clair ou sombre
- **Naviguer** : zoom (boutons, <kbd>Ctrl</kbd> + molette, pincement), déplacement en glissant le fond, recentrage, plein écran, recherche, flèches du clavier, menu clic droit
- **Réviser** : mode révision (branches cachées, révélées au clic)
- **Modèles** : fiche de révision, structures de données, bases de données, réseaux, algorithmique, Python ; import d'un plan (liste ou Markdown) ou d'un fichier `.json`, `.md`, `.txt`
- **Exports** : image `.png` et `.svg`, plan `.md`, carte `.json`, copie du plan. Dans un `.ipynb`, la carte devient une cellule Markdown (le plan) et la carte complète est gardée dans les métadonnées, pour la retrouver à l'import
- Annuler / rétablir (100 étapes). Une cellule peut passer de Texte à Carte mentale et inversement : le plan est converti
- Sur téléphone, un doigt fait défiler la page ; le plein écran permet de déplacer la carte et les idées du doigt

---

# 🎮 Quiz & Jeux

Des activités adaptées au profil choisi (SNT, Première, Terminale, Professeur) :

- ❓ Quiz
- ✅ Vrai ou faux
- 🖨️ Devine la sortie d'un programme
- 🐛 Trouve le bug
- 🧭 Quel algorithme ?

Les scores et la progression sont enregistrés localement. Chaque activité possède un identifiant et un lien de signalement.

---

# 📖 Dictionnaire NSI

Plus de 370 définitions classées par thème (Python, données, réseaux, algorithmique…) avec recherche et filtres.

---

# 📊 Statistiques

Une page récapitule son activité : temps passé, ressources ouvertes, notebooks, progression dans Quiz & Jeux…

Les statistiques restent sur l'appareil et peuvent être exportées, importées ou réinitialisées.

---

# 👤 Profils

Au premier lancement, on choisit son profil : **SNT**, **Première**, **Terminale** ou **Professeur**. L'accueil et les activités s'adaptent à ce choix, modifiable dans les paramètres.

## 👨‍🏫 Mode présentation

Réservé au profil Professeur : horloge, plein écran, raccourcis clavier, taille de texte réglable et accès rapide aux ressources pour les cours projetés.

---

# 📢 Annonces et nouveautés

- Les annonces importantes s'ouvrent une seule fois sur l'accueil (clé `nsiAnnouncementSeen`), restent accessibles avec l'onglet « Info importante », et sont toutes regroupées sur une page dédiée. Une nouvelle annonce s'ajoute à la fin de `announcements.js` avec un `id` unique.
- La page **Nouveautés** (changelog) liste les changements de chaque version.

---

## 🔢 Numéros de version

La version (dans `version.js`) s'écrit avec **4 chiffres** : `A.B.C.D`

| Chiffre | Quand l'augmenter | Exemple |
|---|---|---|
| **A** | Refonte totale du site | 1.6.0.0 → **2**.0.0.0 |
| **B** | Grande nouveauté très importante | 1.6.0.0 → 1.**7**.0.0 |
| **C** | Nouvelle fonctionnalité | 1.6.0.0 → 1.6.**1**.0 |
| **D** | Correction de bug ou petit ajustement | 1.6.0.0 → 1.6.0.**1** |

Quand un chiffre augmente, tous ceux à sa droite repartent à 0 (1.6.2.3 → 1.7.0.0). À chaque nouvelle version, ajouter une entrée en haut de `changelog.js` avec le même numéro.

Les versions jusqu'à 1.6.0 ont été numérotées avec 3 chiffres (1.6.0 = 1.6.0.0).

---

# ⚙️ Paramètres

- **Thème** : sombre, clair ou automatique (suit le réglage de l'appareil)
- **Animations** : peuvent être coupées sur tout le site (elles sont aussi réduites si l'appareil le demande)
- **Profil** : niveau et prénom
- **Mes cours de NSI** : créneaux de NSI et rappels avant les cours (voir ci-dessous)
- **Espace utilisé** : place occupée par NSI Hub (notebooks, bases SQL, statistiques…) et par les autres sites du domaine, détail par notebook
- **Sauvegarde / restauration** en JSON, et effacement des données de NSI Hub

```text
nsiTheme        sombre | clair | auto
nsiAnimations   false pour couper les animations
```

`preferences.js` est chargé dans le `<head>` de chaque page pour appliquer le thème sans clignotement.

## 📅 Mes cours de NSI

Dans Paramètres → Mes cours de NSI (`parametres.html#horaires`) :

- **Créneaux** : jour, horaires, salle, toutes les semaines ou semaine A / B
- **Vacances** : choix de la zone A, B ou C, pour couper les rappels pendant les vacances et les jours fériés
- **Rappels** : la veille à l'heure choisie, et 1 h, 30, 15, 10 ou 5 min avant le cours
- **Agenda du téléphone** (recommandé) : export `.ics`, avec les cours répétés chaque semaine jusqu'à la fin de l'année scolaire, les vacances exclues et les rappels intégrés. Les rappels arrivent même quand le site est fermé
- **Notifications de NSI Hub** : envoyées seulement quand une page du site est ouverte. Un site statique ne peut pas envoyer de notification quand il est fermé. `preferences.js` charge `horaires.js` sur chaque page quand elles sont activées, et `sw.js` (service worker, sans cache) sert à les afficher sur Android

```text
nsiHoraires          créneaux, semaine A de référence, zone, rappels, notifications
nsiHorairesEnvoyes   rappels déjà envoyés (évite les doublons entre onglets)
```

⚠️ Le calendrier des vacances est écrit dans `horaires.js` (`CALENDARS`) : il faut ajouter l'année suivante chaque année, à partir de l'arrêté publié au Journal officiel. Sans calendrier à jour, seules les vacances d'été sont coupées.

## 🧪 Mode développeur

Activable dans Paramètres → Développement (`nsiDevMode`). `devtools.js`, chargé sur chaque page, ne fait rien tant qu'il est désactivé. Une fois actif :

- **Barre DEV** en bas à gauche : infos (version, page, thème, profil, écran, stockage, erreurs), thème, animations, profil, contours des éléments, tests de l'accueil
- **Journal des erreurs** (`nsiDevErreurs`) : erreurs JavaScript, promesses rejetées, fichiers introuvables, copiable
- **Inspecteur du stockage** : voir, modifier, copier, supprimer les clés `nsi…`
- **Tests** : profil en un clic, annonces, bienvenue, popups, erreur de test, données de démo (`nsiDevDemo`)

Paramètres d'URL de l'accueil (mode développeur uniquement) : `?devAnnonce=<id>`, `?devWelcome=1`, `?devPopup=ent`, `?devPopup=share`, `?devConfetti=1`.

## 🎨 Thème clair

Le thème sombre reste la référence. `theme-light.css` est **généré** par `scripts/theme-clair.py`, qui lit toutes les feuilles de style et calcule l'équivalent clair de chaque couleur. Après une modification des couleurs dans un fichier `.css` :

```bash
pip install tinycss2
python3 scripts/theme-clair.py
```

Les retouches manuelles se font dans la section `MANUEL` du script.

---

# 🕳️ Page 404

GitHub Pages affiche `404.html` pour toute adresse introuvable, même dans un sous-dossier. La balise `<base href="/nsi/">` (remplacée par `/` en local) garde les liens et les styles fonctionnels quelle que soit l'adresse. `statistiques.js` n'y est volontairement pas chargé, pour ne pas compter de fausses pages.

- Message d'erreur façon traceback Python avec l'adresse demandée
- Suggestions des pages les plus proches (distance de Levenshtein)
- Terminal (`help` pour la liste des commandes), anecdotes, blagues
- Chasse aux bugs de 20 secondes (record dans `nsiBugHuntRecord`)
- 12 easter eggs, dont la progression est gardée dans `nsiEasterEggs`

<details>
<summary>⚠️ Spoilers : liste des easter eggs</summary>

| Easter egg | Comment le trouver |
| --- | --- |
| Code secret | Code Konami ↑ ↑ ↓ ↓ ← → ← → B A (mode rétro) |
| Super-utilisateur | `sudo …` dans le terminal |
| Apprenti destructeur | `rm -rf /` (rien n'est supprimé) |
| Je suis une théière | `café`, `coffee`, `thé` ou `tea` (HTTP 418) |
| Pilule rouge | `matrix` |
| La grande question | `42` |
| Changement de base | Cliquer 7 fois sur le « 404 » |
| Exterminateur | 15 bugs ou plus à la chasse aux bugs |
| Fouineur | `nsiHub.secret()` dans la console du navigateur |
| Premier programme | `print("Hello World")` |
| Pong | `ping` |
| Noctambule | Ouvrir la page entre minuit et 5 h |

</details>

---

# 🔒 Données

NSI Hub fonctionne entièrement dans le navigateur et est hébergé sur GitHub Pages. Les favoris, le mémo, les notebooks, la progression et les statistiques sont stockés dans le `localStorage` : rien n'est envoyé à un serveur.

Toutes les clés de NSI Hub commencent par `nsi`. Le domaine `rafaelmmix.github.io` étant partagé avec d'autres sites (comme Booster perso), NSI Hub ne touche jamais aux autres clés, même quand on efface ses données.
