// Modèles proposés à la création d'un notebook (fichier généré).
window.NSI_MODELES = [
 {
  "id": "vide",
  "titre": "Notebook vide",
  "description": "Une page blanche avec une cellule de texte et une cellule Python.",
  "icone": "fa-regular fa-file",
  "base": "lycee",
  "cellules": [
   {
    "type": "markdown",
    "content": "# Mon notebook\n\nCommence à écrire ici."
   },
   {
    "type": "python",
    "content": "print('Bonjour NSI !')"
   }
  ]
 },
 {
  "id": "decouvrir",
  "titre": "Découvrir les notebooks",
  "description": "Le tour du propriétaire : cellules, exécution, input(), erreurs, SQL et texte.",
  "icone": "fa-solid fa-compass",
  "base": "lycee",
  "cellules": [
   {
    "type": "markdown",
    "content": "# Découvrir les notebooks 👋\n\nUn notebook est une suite de **cellules**. Il en existe trois sortes :\n\n- 🐍 **Python** : du code Python, exécuté directement dans ton navigateur ;\n- 🗄️ **SQL** : des requêtes sur une base de données SQLite ;\n- ¶ **Texte** : des explications mises en forme (comme celle-ci).\n\nPour exécuter une cellule, clique sur ▶ à sa gauche ou appuie sur **Ctrl + Entrée**.\n**Maj + Entrée** exécute la cellule puis passe à la suivante.\n\nTout est enregistré automatiquement dans ton navigateur."
   },
   {
    "type": "markdown",
    "content": "## 1. Python\n\nExécute la cellule ci-dessous. La première exécution prend quelques secondes, le temps de charger Python."
   },
   {
    "type": "python",
    "content": "prenom = \"Ada\"\nannee = 1815\nprint(\"Bonjour\", prenom, \"!\")\n2026 - annee"
   },
   {
    "type": "markdown",
    "content": "Le `print` affiche du texte. La **dernière ligne** d'une cellule, si c'est une valeur, est affichée automatiquement (ici `2026 - annee`).\n\nLes variables sont **partagées entre les cellules** : la cellule suivante connaît `prenom`."
   },
   {
    "type": "python",
    "content": "print(prenom.upper())\nprint(len(prenom), \"lettres\")"
   },
   {
    "type": "markdown",
    "content": "## 2. Demander une valeur avec `input()`\n\n`input()` ouvre une petite fenêtre pour écrire ta réponse. Attention : `input()` renvoie toujours **du texte**. Pour un nombre, il faut le convertir avec `int()` ou `float()`."
   },
   {
    "type": "python",
    "content": "nom = input(\"Comment t'appelles-tu ? \")\nage = int(input(\"Quel âge as-tu ? \"))\nprint(f\"Enchanté {nom} ! Dans 10 ans tu auras {age + 10} ans.\")"
   },
   {
    "type": "markdown",
    "content": "## 3. Les erreurs sont expliquées\n\nLa cellule suivante contient **volontairement** une erreur. Exécute-la : le notebook t'explique le problème en français, surligne la ligne concernée et te donne une piste. Corrige-la ensuite !"
   },
   {
    "type": "python",
    "content": "notes = [12, 15, 9]\nfor note in notes\n    print(note)"
   },
   {
    "type": "markdown",
    "content": "## 4. SQL\n\nChaque notebook possède sa propre **base de données**. Celle-ci contient les élèves, les classes, les matières, les professeurs et les notes d'un lycée fictif.\n\nClique sur **Base de données** dans la barre d'outils pour voir les tables et leurs colonnes. Puis exécute la requête :"
   },
   {
    "type": "sql",
    "content": "SELECT nom, niveau, salle\nFROM classes;"
   },
   {
    "type": "markdown",
    "content": "## 5. Le texte (Markdown)\n\n**Double-clique** sur une cellule de texte pour la modifier, puis **Ctrl + Entrée** pour l'afficher.\n\n| Tu écris | Tu obtiens |\n|---|---|\n| `# Titre` | un grand titre |\n| `**gras**` | **gras** |\n| `*italique*` | *italique* |\n| `` `code` `` | `code` |\n| `- élément` | une liste à puces |\n\n## 6. Bon à savoir\n\n- Le bouton **+** qui apparaît sous une cellule permet d'en insérer une nouvelle à cet endroit.\n- **Redémarrer Python** efface toutes les variables.\n- Une boucle infinie (`while True:` sans `break`) bloque l'onglet : recharge alors la page, ton code est enregistré.\n- **Exporter** permet de télécharger ton travail au format Jupyter (`.ipynb`), en script Python (`.py`), en requêtes (`.sql`) ou de récupérer la base (`.db`)."
   }
  ]
 },
 {
  "id": "sql-bases",
  "titre": "Premiers pas en SQL",
  "description": "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, LIKE et NULL sur la base Lycée.",
  "icone": "fa-solid fa-magnifying-glass",
  "base": "lycee",
  "cellules": [
   {
    "type": "markdown",
    "content": "# Premiers pas en SQL\n\n**SQL** (*Structured Query Language*) est le langage pour interroger une base de données relationnelle.\n\nOuvre le panneau **Base de données** : la base contient 5 tables (`eleves`, `classes`, `matieres`, `professeurs`, `notes`). Chaque table a des colonnes, et chaque ligne est un enregistrement.\n\nExécute les exemples un par un (**Maj + Entrée**), puis fais les exercices dans les cellules vides."
   },
   {
    "type": "markdown",
    "content": "## 1. Tout afficher\n\n`SELECT *` signifie « toutes les colonnes ». `FROM` indique la table."
   },
   {
    "type": "sql",
    "content": "SELECT * FROM matieres;"
   },
   {
    "type": "markdown",
    "content": "## 2. Choisir les colonnes\n\nOn liste les colonnes voulues, séparées par des virgules."
   },
   {
    "type": "sql",
    "content": "SELECT prenom, nom, ville FROM eleves;"
   },
   {
    "type": "markdown",
    "content": "## 3. Filtrer avec `WHERE`\n\nLe texte s'écrit entre **apostrophes**. Opérateurs : `=`, `<>` (différent), `<`, `>`, `<=`, `>=`, et on combine avec `AND`, `OR`, `NOT`."
   },
   {
    "type": "sql",
    "content": "SELECT prenom, nom FROM eleves\nWHERE ville = 'Tours';"
   },
   {
    "type": "sql",
    "content": "SELECT nom, coefficient FROM matieres\nWHERE coefficient >= 2 AND nom <> 'SVT';"
   },
   {
    "type": "markdown",
    "content": "## 4. Trier avec `ORDER BY` et limiter avec `LIMIT`\n\n`ASC` = croissant (par défaut), `DESC` = décroissant."
   },
   {
    "type": "sql",
    "content": "SELECT prenom, nom, date_naissance FROM eleves\nORDER BY date_naissance DESC\nLIMIT 5;"
   },
   {
    "type": "markdown",
    "content": "## 5. Éviter les doublons avec `DISTINCT`"
   },
   {
    "type": "sql",
    "content": "SELECT DISTINCT ville FROM eleves\nORDER BY ville;"
   },
   {
    "type": "markdown",
    "content": "## 6. Chercher un motif avec `LIKE`\n\n`%` remplace n'importe quelle suite de caractères, `_` un seul caractère."
   },
   {
    "type": "sql",
    "content": "SELECT prenom, nom FROM eleves\nWHERE prenom LIKE 'L%';"
   },
   {
    "type": "markdown",
    "content": "## 7. Les valeurs manquantes : `NULL`\n\nCertains élèves n'ont pas d'adresse e-mail. On teste avec `IS NULL` (et jamais `= NULL`)."
   },
   {
    "type": "sql",
    "content": "SELECT prenom, nom FROM eleves\nWHERE email IS NULL;"
   },
   {
    "type": "markdown",
    "content": "## 8. Compter avec `COUNT`"
   },
   {
    "type": "sql",
    "content": "SELECT COUNT(*) AS nombre_eleves FROM eleves;"
   },
   {
    "type": "markdown",
    "content": "---\n\n# Exercices ✍️\n\n**Exercice 1.** Affiche le nom et la salle de toutes les classes de Terminale.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT nom, salle FROM classes\nWHERE niveau = 'Terminale';\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 1"
   },
   {
    "type": "markdown",
    "content": "**Exercice 2.** Affiche les 10 meilleures notes (valeur et date), de la plus haute à la plus basse.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT valeur, date_eval FROM notes\nORDER BY valeur DESC\nLIMIT 10;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 2"
   },
   {
    "type": "markdown",
    "content": "**Exercice 3.** Affiche les élèves nés en 2010 (la date est au format `AAAA-MM-JJ`).\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT prenom, nom, date_naissance FROM eleves\nWHERE date_naissance LIKE '2010-%';\n\n-- ou bien :\n-- WHERE date_naissance BETWEEN '2010-01-01' AND '2010-12-31'\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 3"
   },
   {
    "type": "markdown",
    "content": "**Exercice 4.** Combien y a-t-il de notes de type `'Oral'` ?\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT COUNT(*) FROM notes\nWHERE type = 'Oral';\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 4"
   },
   {
    "type": "markdown",
    "content": "**Exercice 5.** Affiche les élèves qui habitent à Blois **ou** à Bourges et qui ont une adresse e-mail, triés par nom.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT prenom, nom, ville, email FROM eleves\nWHERE (ville = 'Blois' OR ville = 'Bourges')\n  AND email IS NOT NULL\nORDER BY nom;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 5"
   }
  ]
 },
 {
  "id": "sql-jointures",
  "titre": "Jointures et agrégats",
  "description": "JOIN, alias, COUNT, AVG, MIN, MAX, GROUP BY, HAVING et LEFT JOIN.",
  "icone": "fa-solid fa-diagram-project",
  "base": "lycee",
  "cellules": [
   {
    "type": "markdown",
    "content": "# Jointures et agrégats\n\nLes informations sont réparties dans plusieurs tables reliées par des **clés étrangères**. Par exemple, `eleves.id_classe` fait référence à `classes.id_classe` (repère 🔗 dans le panneau **Base de données**)."
   },
   {
    "type": "markdown",
    "content": "## 1. La jointure `JOIN … ON …`\n\nPour afficher chaque élève avec le nom de sa classe, on relie les deux tables sur la colonne commune. On donne des **alias** courts aux tables (`e`, `c`) pour écrire moins."
   },
   {
    "type": "sql",
    "content": "SELECT e.prenom, e.nom, c.nom AS classe\nFROM eleves AS e\nJOIN classes AS c ON e.id_classe = c.id_classe\nORDER BY classe, e.nom;"
   },
   {
    "type": "markdown",
    "content": "## 2. Plusieurs jointures\n\nChaque note avec l'élève et la matière :"
   },
   {
    "type": "sql",
    "content": "SELECT e.prenom, e.nom, m.nom AS matiere, n.valeur\nFROM notes AS n\nJOIN eleves AS e ON n.id_eleve = e.id_eleve\nJOIN matieres AS m ON n.id_matiere = m.id_matiere\nORDER BY n.date_eval DESC\nLIMIT 15;"
   },
   {
    "type": "markdown",
    "content": "## 3. Les fonctions d'agrégat\n\n`COUNT`, `SUM`, `AVG` (moyenne), `MIN`, `MAX` calculent **une seule valeur** à partir de plusieurs lignes. `ROUND(x, 2)` arrondit à 2 chiffres."
   },
   {
    "type": "sql",
    "content": "SELECT COUNT(*) AS nb_notes,\n       ROUND(AVG(valeur), 2) AS moyenne,\n       MIN(valeur) AS pire,\n       MAX(valeur) AS meilleure\nFROM notes;"
   },
   {
    "type": "markdown",
    "content": "## 4. Regrouper avec `GROUP BY`\n\nL'agrégat est calculé **pour chaque groupe** :"
   },
   {
    "type": "sql",
    "content": "SELECT m.nom AS matiere, ROUND(AVG(n.valeur), 2) AS moyenne, COUNT(*) AS nb_notes\nFROM notes AS n\nJOIN matieres AS m ON n.id_matiere = m.id_matiere\nGROUP BY m.nom\nORDER BY moyenne DESC;"
   },
   {
    "type": "markdown",
    "content": "## 5. Filtrer les groupes avec `HAVING`\n\n`WHERE` filtre les **lignes** avant le regroupement, `HAVING` filtre les **groupes** après. On ne peut pas écrire `WHERE COUNT(*) > 6`."
   },
   {
    "type": "sql",
    "content": "SELECT ville, COUNT(*) AS nb_eleves\nFROM eleves\nGROUP BY ville\nHAVING COUNT(*) >= 6\nORDER BY nb_eleves DESC;"
   },
   {
    "type": "markdown",
    "content": "## 6. `LEFT JOIN` : garder aussi les lignes sans correspondance\n\nUn élève vient d'arriver et n'a encore aucune note. Avec `JOIN`, il disparaît ; avec `LEFT JOIN`, il reste, avec des `NULL` à la place des notes."
   },
   {
    "type": "sql",
    "content": "SELECT e.prenom, e.nom, COUNT(n.id_note) AS nb_notes\nFROM eleves AS e\nLEFT JOIN notes AS n ON n.id_eleve = e.id_eleve\nGROUP BY e.id_eleve\nORDER BY nb_notes\nLIMIT 5;"
   },
   {
    "type": "markdown",
    "content": "---\n\n# Exercices ✍️\n\n**Exercice 1.** Affiche chaque classe avec le prénom et le nom de son professeur principal.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT c.nom AS classe, p.prenom, p.nom\nFROM classes AS c\nJOIN professeurs AS p ON c.id_prof_principal = p.id_prof;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 1"
   },
   {
    "type": "markdown",
    "content": "**Exercice 2.** Affiche le nombre d'élèves par classe.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT c.nom AS classe, COUNT(*) AS effectif\nFROM eleves AS e\nJOIN classes AS c ON e.id_classe = c.id_classe\nGROUP BY c.nom;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 2"
   },
   {
    "type": "markdown",
    "content": "**Exercice 3.** Affiche les 3 élèves qui ont la meilleure moyenne générale (toutes matières confondues, sans coefficient).\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT e.prenom, e.nom, ROUND(AVG(n.valeur), 2) AS moyenne\nFROM eleves AS e\nJOIN notes AS n ON n.id_eleve = e.id_eleve\nGROUP BY e.id_eleve\nORDER BY moyenne DESC\nLIMIT 3;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 3"
   },
   {
    "type": "markdown",
    "content": "**Exercice 4.** Affiche la moyenne en NSI de chaque classe qui suit cet enseignement.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT c.nom AS classe, ROUND(AVG(n.valeur), 2) AS moyenne_nsi\nFROM notes AS n\nJOIN eleves AS e ON n.id_eleve = e.id_eleve\nJOIN classes AS c ON e.id_classe = c.id_classe\nJOIN matieres AS m ON n.id_matiere = m.id_matiere\nWHERE m.nom = 'NSI'\nGROUP BY c.nom;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 4"
   },
   {
    "type": "markdown",
    "content": "**Exercice 5.** Affiche les élèves qui ont au moins 3 notes strictement inférieures à 8, avec ce nombre.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nSELECT e.prenom, e.nom, COUNT(*) AS nb_notes_basses\nFROM eleves AS e\nJOIN notes AS n ON n.id_eleve = e.id_eleve\nWHERE n.valeur < 8\nGROUP BY e.id_eleve\nHAVING COUNT(*) >= 3\nORDER BY nb_notes_basses DESC;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 5"
   }
  ]
 },
 {
  "id": "sql-modifier",
  "titre": "Modifier une base",
  "description": "INSERT, UPDATE, DELETE, CREATE TABLE et contraintes d'intégrité.",
  "icone": "fa-solid fa-pen-to-square",
  "base": "lycee",
  "cellules": [
   {
    "type": "markdown",
    "content": "# Modifier une base\n\nLes requêtes de cette page **modifient** la base du notebook. Les changements sont enregistrés.\n\n> 💡 Pas de panique : le bouton **Réinitialiser** du panneau **Base de données** remet la base dans son état d'origine."
   },
   {
    "type": "markdown",
    "content": "## 1. Ajouter une ligne : `INSERT INTO`\n\nOn précise les colonnes remplies. L'identifiant (`id_eleve`) est choisi automatiquement par SQLite."
   },
   {
    "type": "sql",
    "content": "INSERT INTO eleves (nom, prenom, date_naissance, ville, id_classe)\nVALUES ('Lovelace', 'Ada', '2009-12-10', 'Tours', 5);\n\nSELECT * FROM eleves WHERE nom = 'Lovelace';"
   },
   {
    "type": "markdown",
    "content": "## 2. Modifier : `UPDATE … SET … WHERE …`\n\n⚠️ Sans `WHERE`, **toutes** les lignes sont modifiées !"
   },
   {
    "type": "sql",
    "content": "UPDATE eleves\nSET email = 'ada.lovelace@lycee-nsi.fr'\nWHERE nom = 'Lovelace' AND prenom = 'Ada';\n\nSELECT prenom, nom, email FROM eleves WHERE nom = 'Lovelace';"
   },
   {
    "type": "markdown",
    "content": "## 3. Supprimer : `DELETE FROM … WHERE …`\n\n⚠️ Là aussi, sans `WHERE`, toute la table est vidée."
   },
   {
    "type": "sql",
    "content": "DELETE FROM eleves\nWHERE nom = 'Lovelace';\n\nSELECT COUNT(*) FROM eleves WHERE nom = 'Lovelace';"
   },
   {
    "type": "markdown",
    "content": "## 4. Les contraintes d'intégrité\n\nLa base refuse les données incohérentes. Exécute les trois cellules suivantes : chacune provoque **volontairement** une erreur, expliquée par le notebook.\n\n**Contrainte de clé primaire** : deux matières ne peuvent pas avoir le même identifiant."
   },
   {
    "type": "sql",
    "content": "INSERT INTO matieres (id_matiere, nom, coefficient)\nVALUES (1, 'Latin', 1);"
   },
   {
    "type": "markdown",
    "content": "**Contrainte de clé étrangère** : la classe n°42 n'existe pas."
   },
   {
    "type": "sql",
    "content": "INSERT INTO eleves (nom, prenom, id_classe)\nVALUES ('Turing', 'Alan', 42);"
   },
   {
    "type": "markdown",
    "content": "**Contrainte de domaine** (`CHECK`) : une note est comprise entre 0 et 20."
   },
   {
    "type": "sql",
    "content": "INSERT INTO notes (id_eleve, id_matiere, valeur, date_eval, type)\nVALUES (1, 8, 25, '2026-11-14', 'DS');"
   },
   {
    "type": "markdown",
    "content": "## 5. Créer une table : `CREATE TABLE`\n\nOn indique le nom, le type de chaque colonne et les contraintes. Ici, une table des clubs du lycée et une table d'association pour les inscriptions."
   },
   {
    "type": "sql",
    "content": "CREATE TABLE IF NOT EXISTS clubs (\n  id_club INTEGER PRIMARY KEY,\n  nom TEXT NOT NULL UNIQUE,\n  jour TEXT\n);\n\nCREATE TABLE IF NOT EXISTS inscriptions (\n  id_eleve INTEGER REFERENCES eleves(id_eleve),\n  id_club INTEGER REFERENCES clubs(id_club),\n  PRIMARY KEY (id_eleve, id_club)\n);\n\nINSERT INTO clubs (nom, jour) VALUES ('Robotique', 'mardi'), ('Échecs', 'jeudi'), ('Théâtre', 'vendredi');\nINSERT INTO inscriptions VALUES (1, 1), (2, 1), (3, 2), (1, 3);"
   },
   {
    "type": "sql",
    "content": "SELECT c.nom AS club, e.prenom, e.nom\nFROM inscriptions AS i\nJOIN clubs AS c ON i.id_club = c.id_club\nJOIN eleves AS e ON i.id_eleve = e.id_eleve\nORDER BY club;"
   },
   {
    "type": "markdown",
    "content": "---\n\n# Exercices ✍️\n\n**Exercice 1.** Ajoute la matière « Philosophie » avec un coefficient de 2, puis affiche toutes les matières.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nINSERT INTO matieres (nom, coefficient) VALUES ('Philosophie', 2);\nSELECT * FROM matieres;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 1"
   },
   {
    "type": "markdown",
    "content": "**Exercice 2.** La salle de la classe « Tle G1 » devient D305. Fais la modification.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nUPDATE classes SET salle = 'D305' WHERE nom = 'Tle G1';\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 2"
   },
   {
    "type": "markdown",
    "content": "**Exercice 3.** Supprime toutes les notes de type `'DM'` inférieures à 5, puis vérifie qu'il n'en reste plus.\n\n<details><summary>Voir une solution</summary>\n\n```sql\nDELETE FROM notes WHERE type = 'DM' AND valeur < 5;\nSELECT COUNT(*) FROM notes WHERE type = 'DM' AND valeur < 5;\n```\n\n</details>"
   },
   {
    "type": "sql",
    "content": "-- Exercice 3"
   }
  ]
 },
 {
  "id": "python-sql",
  "titre": "Python + SQL",
  "description": "Interroger la base depuis Python avec requete(), tableau() et le module sqlite3.",
  "icone": "fa-solid fa-link",
  "base": "lycee",
  "cellules": [
   {
    "type": "markdown",
    "content": "# Python + SQL\n\nDepuis une cellule Python, deux fonctions donnent accès à la base du notebook :\n\n- `requete(\"SELECT …\")` renvoie les lignes sous forme de **liste de tuples** ;\n- `tableau(\"SELECT …\")` affiche directement le résultat sous forme de tableau.\n\nLe module standard `sqlite3` fonctionne aussi (voir la fin)."
   },
   {
    "type": "python",
    "content": "lignes = requete(\"SELECT prenom, nom, ville FROM eleves ORDER BY nom LIMIT 5\")\nprint(lignes)\nprint(\"Premier élève :\", lignes[0][0], lignes[0][1])"
   },
   {
    "type": "markdown",
    "content": "On peut parcourir le résultat avec une boucle `for`, en « dépaquetant » chaque tuple :"
   },
   {
    "type": "python",
    "content": "for prenom, nom, ville in requete(\"SELECT prenom, nom, ville FROM eleves WHERE ville = 'Blois'\"):\n    print(f\"{prenom} {nom.upper()} habite à {ville}\")"
   },
   {
    "type": "markdown",
    "content": "## Les paramètres `?`\n\nQuand une valeur vient d'une variable (ou d'un `input()`), on ne la colle **jamais** dans la chaîne SQL : on met un `?` et on passe la valeur en paramètre. Cela évite les erreurs d'apostrophes… et les **injections SQL**."
   },
   {
    "type": "python",
    "content": "ville = \"Tours\"\neleves = requete(\"SELECT prenom, nom FROM eleves WHERE ville = ? ORDER BY nom\", ville)\nprint(len(eleves), \"élève(s) à\", ville)\ntableau(\"SELECT prenom, nom, date_naissance FROM eleves WHERE ville = ? ORDER BY nom\", ville)"
   },
   {
    "type": "markdown",
    "content": "## Faire des calculs en Python\n\nSQL calcule une moyenne simple, mais la **moyenne pondérée** par les coefficients est plus facile à écrire en Python."
   },
   {
    "type": "python",
    "content": "def moyenne_ponderee(id_eleve):\n    lignes = requete(\"\"\"\n        SELECT n.valeur, m.coefficient\n        FROM notes AS n JOIN matieres AS m ON n.id_matiere = m.id_matiere\n        WHERE n.id_eleve = ?\"\"\", id_eleve)\n    if not lignes:\n        return None\n    total = sum(valeur * coef for valeur, coef in lignes)\n    poids = sum(coef for _, coef in lignes)\n    return round(total / poids, 2)\n\nfor id_eleve, prenom, nom in requete(\"SELECT id_eleve, prenom, nom FROM eleves WHERE id_classe = 5\"):\n    print(f\"{prenom} {nom} : {moyenne_ponderee(id_eleve)}\")"
   },
   {
    "type": "markdown",
    "content": "**À toi :** écris une fonction `meilleur_eleve(id_classe)` qui renvoie le prénom et le nom de l'élève qui a la meilleure moyenne pondérée de la classe.\n\n<details><summary>Voir une solution</summary>\n\n```python\ndef meilleur_eleve(id_classe):\n    meilleur, record = None, -1\n    for id_eleve, prenom, nom in requete(\"SELECT id_eleve, prenom, nom FROM eleves WHERE id_classe = ?\", id_classe):\n        moyenne = moyenne_ponderee(id_eleve)\n        if moyenne is not None and moyenne > record:\n            meilleur, record = (prenom, nom), moyenne\n    return meilleur\n\nmeilleur_eleve(5)\n```\n\n</details>"
   },
   {
    "type": "python",
    "content": "# À toi"
   },
   {
    "type": "markdown",
    "content": "## Avec le module `sqlite3`\n\nC'est la méthode utilisée dans la plupart des exercices de NSI. La base du notebook est disponible dans le fichier `lycee.db`. Les modifications validées avec `commit()` sont reportées dans la base du notebook."
   },
   {
    "type": "python",
    "content": "import sqlite3\n\nconnexion = sqlite3.connect(\"lycee.db\")\ncurseur = connexion.cursor()\n\ncurseur.execute(\"SELECT nom, coefficient FROM matieres WHERE coefficient = ?\", (3,))\nfor nom, coefficient in curseur.fetchall():\n    print(nom, \"→ coefficient\", coefficient)\n\nconnexion.close()"
   }
  ]
 }
];
