"use strict";

// Explications en français des erreurs Python et SQL les plus courantes.
// Chaque règle : un motif sur le message d'origine et une fonction qui renvoie
// { titre, explication, astuce }. Les groupes capturés du motif sont passés en paramètres.

(function () {
    const code = value => `<code>${String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])}</code>`;

    const PYTHON = [
        // ---------- Syntaxe et indentation ----------
        [/^IndentationError: expected an indented block/, () => ({
            titre: "Bloc non indenté",
            explication: "Après une ligne qui se termine par <code>:</code> (<code>if</code>, <code>for</code>, <code>while</code>, <code>def</code>…), Python attend des lignes décalées vers la droite.",
            astuce: "Ajoute 4 espaces (ou appuie sur Tab) au début des lignes qui font partie du bloc."
        })],
        [/^IndentationError: unexpected indent/, () => ({
            titre: "Indentation inattendue",
            explication: "Cette ligne est décalée vers la droite alors qu'elle n'est dans aucun bloc.",
            astuce: "Supprime les espaces en trop au début de la ligne."
        })],
        [/^IndentationError: unindent does not match/, () => ({
            titre: "Indentation incohérente",
            explication: "Cette ligne n'est alignée avec aucun des blocs au-dessus.",
            astuce: "Aligne-la exactement avec le bloc auquel elle appartient (même nombre d'espaces)."
        })],
        [/^TabError/, () => ({
            titre: "Tabulations et espaces mélangés",
            explication: "Le bloc mélange des tabulations et des espaces pour l'indentation.",
            astuce: "Utilise uniquement des espaces (4 par niveau)."
        })],
        [/^SyntaxError: unterminated (?:triple-quoted )?string literal/, () => ({
            titre: "Guillemet non fermé",
            explication: "Une chaîne de caractères commence par un guillemet mais n'est jamais refermée.",
            astuce: "Vérifie que chaque <code>\"</code> ou <code>'</code> a son guillemet de fin sur la même ligne."
        })],
        [/^SyntaxError: '(.)' was never closed/, (_, ouvrant) => ({
            titre: "Parenthèse ou crochet non fermé",
            explication: `Le symbole ${code(ouvrant)} est ouvert mais jamais refermé.`,
            astuce: "Compte les parenthèses, crochets et accolades : il en manque une fermante."
        })],
        [/^SyntaxError: unmatched '(.)'/, (_, fermant) => ({
            titre: "Symbole fermant en trop",
            explication: `Il y a un ${code(fermant)} qui ne correspond à aucune ouverture.`,
            astuce: "Supprime le symbole en trop ou ajoute celui qui manque avant."
        })],
        [/^SyntaxError: closing parenthesis '(.)' does not match opening parenthesis '(.)'/, (_, fermant, ouvrant) => ({
            titre: "Parenthèses mal assorties",
            explication: `Un ${code(ouvrant)} est refermé par un ${code(fermant)}.`,
            astuce: "Chaque ( se ferme avec ), chaque [ avec ] et chaque { avec }."
        })],
        [/^SyntaxError: expected ':'/, () => ({
            titre: "Deux-points manquants",
            explication: "Les lignes <code>if</code>, <code>elif</code>, <code>else</code>, <code>for</code>, <code>while</code>, <code>def</code> et <code>class</code> doivent se terminer par <code>:</code>.",
            astuce: "Ajoute <code>:</code> à la fin de la ligne indiquée."
        })],
        [/^SyntaxError: .*Maybe you meant '==' or ':=' instead of '='/, () => ({
            titre: "= au lieu de ==",
            explication: "<code>=</code> sert à affecter une valeur. Pour comparer deux valeurs, il faut <code>==</code>.",
            astuce: "Dans une condition, écris par exemple <code>if x == 3:</code>."
        })],
        [/^SyntaxError: invalid syntax\. Perhaps you forgot a comma\?/, () => ({
            titre: "Virgule oubliée",
            explication: "Python a trouvé deux valeurs côte à côte sans rien entre elles.",
            astuce: "Sépare les éléments d'une liste ou les arguments d'une fonction par des virgules."
        })],
        [/^SyntaxError: Missing parentheses in call to 'print'/, () => ({
            titre: "print sans parenthèses",
            explication: "En Python 3, <code>print</code> est une fonction.",
            astuce: "Écris <code>print(\"Bonjour\")</code> et non <code>print \"Bonjour\"</code>."
        })],
        [/^SyntaxError: cannot assign to (.+?)(?: here)?\.?(?: Maybe.*)?$/, (_, cible) => ({
            titre: "Affectation impossible",
            explication: `On ne peut pas mettre une valeur dans ${code(cible)}. À gauche du <code>=</code>, il faut un nom de variable.`,
            astuce: "Si tu voulais comparer, utilise <code>==</code>."
        })],
        [/^SyntaxError: invalid character '(.)'/, (_, car) => ({
            titre: "Caractère interdit",
            explication: `Le caractère ${code(car)} n'est pas autorisé dans du code Python (souvent un guillemet typographique copié-collé).`,
            astuce: "Remplace-le par son équivalent simple : <code>\"</code>, <code>'</code> ou <code>-</code>."
        })],
        [/^SyntaxError: 'return' outside function/, () => ({
            titre: "return hors d'une fonction",
            explication: "<code>return</code> ne peut s'utiliser qu'à l'intérieur d'une fonction (<code>def</code>).",
            astuce: "Vérifie l'indentation : la ligne doit être décalée sous le <code>def</code>."
        })],
        [/^SyntaxError: 'break' outside loop/, () => ({
            titre: "break hors d'une boucle",
            explication: "<code>break</code> sert à sortir d'une boucle <code>for</code> ou <code>while</code>.",
            astuce: "Vérifie que la ligne est bien indentée dans la boucle."
        })],
        [/^SyntaxError: (?:invalid syntax|.*)/, () => ({
            titre: "Erreur de syntaxe",
            explication: "Python ne comprend pas la façon dont la ligne indiquée est écrite.",
            astuce: "Cherche un symbole manquant ou en trop (<code>:</code>, parenthèse, guillemet, virgule) sur cette ligne ou juste au-dessus."
        })],

        // ---------- Noms et variables ----------
        [/^NameError: name '(.+?)' is not defined/, (_, nom) => ({
            titre: "Nom inconnu",
            explication: `Python ne connaît pas ${code(nom)}.`,
            astuce: `Vérifie l'orthographe (majuscules comprises). Si ${code(nom)} est défini dans une autre cellule, exécute-la d'abord. Si c'est du texte, mets-le entre guillemets.`
        })],
        [/^UnboundLocalError: .*'(.+?)'/, (_, nom) => ({
            titre: "Variable locale utilisée trop tôt",
            explication: `Dans la fonction, ${code(nom)} est modifiée, donc Python la considère comme locale… mais elle est lue avant d'avoir reçu une valeur.`,
            astuce: "Donne-lui une valeur au début de la fonction, ou passe-la en paramètre."
        })],

        // ---------- Types ----------
        [/^TypeError: can only concatenate str \(not "(.+?)"\) to str/, (_, type) => ({
            titre: "Texte + nombre",
            explication: `On ne peut pas coller un ${code(type)} à du texte avec <code>+</code>.`,
            astuce: "Convertis le nombre avec <code>str(...)</code>, ou utilise une f-string : <code>f\"Score : {score}\"</code>."
        })],
        [/^TypeError: unsupported operand type\(s\) for (.+?): '(.+?)' and '(.+?)'/, (_, op, a, b) => ({
            titre: "Opération impossible",
            explication: `L'opération ${code(op)} n'est pas possible entre un ${code(a)} et un ${code(b)}.`,
            astuce: (a === "str" || b === "str")
                ? "Une valeur est du texte. Si elle vient de <code>input()</code>, convertis-la avec <code>int(...)</code> ou <code>float(...)</code>."
                : (a === "NoneType" || b === "NoneType")
                    ? "Une valeur vaut <code>None</code> : une fonction a sûrement oublié son <code>return</code>."
                    : "Vérifie le type des deux valeurs avec <code>type(...)</code>."
        })],
        [/^TypeError: '(.+?)' not supported between instances of '(.+?)' and '(.+?)'/, (_, op, a, b) => ({
            titre: "Comparaison impossible",
            explication: `On ne peut pas comparer un ${code(a)} et un ${code(b)} avec ${code(op)}.`,
            astuce: "Convertis les deux valeurs dans le même type (souvent <code>int(...)</code> pour une saisie)."
        })],
        [/^TypeError: '(.+?)' object is not subscriptable/, (_, type) => ({
            titre: "Crochets impossibles",
            explication: `On ne peut pas utiliser <code>[...]</code> sur un ${code(type)}.`,
            astuce: type === "NoneType"
                ? "La valeur vaut <code>None</code> : une fonction a sûrement oublié son <code>return</code>."
                : "Les crochets fonctionnent sur les listes, tuples, chaînes et dictionnaires."
        })],
        [/^TypeError: '(.+?)' object is not callable/, (_, type) => ({
            titre: "Ce n'est pas une fonction",
            explication: `Tu appelles avec des parenthèses quelque chose qui est un ${code(type)}, pas une fonction.`,
            astuce: "Une variable porte peut-être le même nom qu'une fonction (ex. <code>list = [...]</code> puis <code>list(...)</code>). Renomme-la."
        })],
        [/^TypeError: '(.+?)' object is not iterable/, (_, type) => ({
            titre: "Impossible de parcourir",
            explication: `On ne peut pas faire de boucle <code>for</code> sur un ${code(type)}.`,
            astuce: type === "int" ? "Pour répéter n fois, écris <code>for i in range(n):</code>." : "Vérifie que tu parcours bien une liste, une chaîne ou un <code>range</code>."
        })],
        [/^TypeError: '(.+?)' object does not support item assignment/, (_, type) => ({
            titre: "Modification impossible",
            explication: `Un ${code(type)} ne peut pas être modifié case par case.`,
            astuce: type === "str" ? "Les chaînes ne sont pas modifiables : construis une nouvelle chaîne, ou passe par une liste." : "Les tuples ne sont pas modifiables : utilise une liste."
        })],
        [/^TypeError: (.+?)\(\) missing (\d+) required positional arguments?: (.+)/, (_, f, n, args) => ({
            titre: "Argument manquant",
            explication: `La fonction ${code(f + "()")} attend encore ${n} argument(s) : ${args}.`,
            astuce: "Ajoute les valeurs manquantes entre les parenthèses lors de l'appel."
        })],
        [/^TypeError: (.+?)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/, (_, f, attendu, donne) => ({
            titre: "Trop d'arguments",
            explication: `La fonction ${code(f + "()")} attend ${attendu} argument(s) mais en reçoit ${donne}.`,
            astuce: "Vérifie l'appel, et la définition de la fonction (<code>def</code>)."
        })],
        [/^TypeError: object of type '(.+?)' has no len\(\)/, (_, type) => ({
            titre: "len() impossible",
            explication: `<code>len()</code> ne fonctionne pas sur un ${code(type)}.`,
            astuce: "<code>len()</code> fonctionne sur les listes, chaînes, tuples et dictionnaires."
        })],
        [/^TypeError: list indices must be integers or slices, not (.+)/, (_, type) => ({
            titre: "Indice invalide",
            explication: `L'indice d'une liste doit être un entier, pas un ${code(type)}.`,
            astuce: "Si l'indice vient d'une division, utilise <code>//</code> au lieu de <code>/</code>."
        })],
        [/^TypeError: (?:int|float)\(\) argument must be/, () => ({
            titre: "Conversion impossible",
            explication: "<code>int()</code> et <code>float()</code> attendent un nombre ou un texte.",
            astuce: "Vérifie ce que tu essaies de convertir avec <code>print(type(...))</code>."
        })],

        // ---------- Valeurs ----------
        [/^ValueError: invalid literal for int\(\) with base 10: (.+)/, (_, valeur) => ({
            titre: "Ce n'est pas un nombre entier",
            explication: `<code>int()</code> ne peut pas convertir ${code(valeur)} en entier.`,
            astuce: "Vérifie la saisie : pas de lettres, pas d'espaces. Pour un nombre à virgule, utilise <code>float()</code> (avec un point : <code>3.5</code>)."
        })],
        [/^ValueError: could not convert string to float: (.+)/, (_, valeur) => ({
            titre: "Ce n'est pas un nombre",
            explication: `<code>float()</code> ne peut pas convertir ${code(valeur)}.`,
            astuce: "En Python, les nombres à virgule s'écrivent avec un point : <code>3.5</code> et non <code>3,5</code>."
        })],
        [/^ValueError: (.+?) is not in list/, (_, valeur) => ({
            titre: "Valeur absente de la liste",
            explication: `${code(valeur)} n'est pas dans la liste, donc <code>.index()</code> ou <code>.remove()</code> échoue.`,
            astuce: "Teste d'abord avec <code>if valeur in liste:</code>."
        })],
        [/^ValueError: too many values to unpack|^ValueError: not enough values to unpack/, () => ({
            titre: "Nombre de variables incorrect",
            explication: "Le nombre de variables à gauche du <code>=</code> ne correspond pas au nombre de valeurs à droite.",
            astuce: "Exemple correct : <code>a, b = 1, 2</code>."
        })],
        [/^ZeroDivisionError/, () => ({
            titre: "Division par zéro",
            explication: "Le programme essaie de diviser par 0, ce qui est impossible.",
            astuce: "Vérifie que le diviseur n'est pas nul avant de diviser (ex. une liste vide pour une moyenne)."
        })],
        [/^OverflowError/, () => ({
            titre: "Nombre trop grand",
            explication: "Le résultat dépasse ce que Python sait représenter avec des nombres à virgule.",
            astuce: "Travaille avec des entiers si possible, ou réduis la taille des calculs."
        })],

        // ---------- Conteneurs ----------
        [/^IndexError: (list|string|tuple) index out of range/, (_, type) => ({
            titre: "Indice hors limites",
            explication: `L'indice demandé n'existe pas dans ${type === "list" ? "la liste" : type === "string" ? "la chaîne" : "le tuple"}.`,
            astuce: "Les indices vont de <code>0</code> à <code>len(...) - 1</code>. Attention aux boucles qui vont un cran trop loin."
        })],
        [/^IndexError: pop from empty list/, () => ({
            titre: "Liste vide",
            explication: "<code>pop()</code> ne peut rien retirer d'une liste vide.",
            astuce: "Teste d'abord <code>if liste:</code> ou <code>if len(liste) > 0:</code>."
        })],
        [/^KeyError: (.+)/, (_, cle) => ({
            titre: "Clé absente du dictionnaire",
            explication: `La clé ${code(cle)} n'existe pas dans le dictionnaire.`,
            astuce: "Vérifie l'orthographe de la clé, ou utilise <code>dico.get(cle)</code> qui renvoie <code>None</code> si elle n'existe pas."
        })],
        [/^AttributeError: '(.+?)' object has no attribute '(.+?)'/, (_, type, attr) => ({
            titre: "Méthode ou attribut inexistant",
            explication: `Un ${code(type)} n'a pas de ${code(attr)}.`,
            astuce: type === "NoneType"
                ? "La valeur vaut <code>None</code> : une fonction a sûrement oublié son <code>return</code>, ou une méthode comme <code>.sort()</code> ne renvoie rien."
                : `Vérifie l'orthographe, ou affiche les possibilités avec <code>dir(...)</code>.`
        })],

        // ---------- Divers ----------
        [/^RecursionError/, () => ({
            titre: "Récursion infinie",
            explication: "La fonction s'appelle elle-même trop de fois sans jamais s'arrêter.",
            astuce: "Vérifie le cas de base, et que chaque appel se rapproche de ce cas de base."
        })],
        [/^ModuleNotFoundError: No module named '(.+?)'/, (_, module) => ({
            titre: "Module introuvable",
            explication: `Le module ${code(module)} n'existe pas ou n'est pas disponible dans le navigateur.`,
            astuce: "Les modules de la bibliothèque standard (math, random, sqlite3…) fonctionnent. Vérifie l'orthographe du nom."
        })],
        [/^ImportError: cannot import name '(.+?)'/, (_, nom) => ({
            titre: "Import impossible",
            explication: `${code(nom)} n'existe pas dans ce module.`,
            astuce: "Vérifie l'orthographe (majuscules comprises)."
        })],
        [/^AssertionError/, () => ({
            titre: "Assertion fausse",
            explication: "Une condition vérifiée par <code>assert</code> est fausse : un test n'est pas passé.",
            astuce: "Affiche les valeurs avec <code>print</code> pour comprendre ce qui diffère du résultat attendu."
        })],
        [/^EOFError/, () => ({
            titre: "Saisie annulée",
            explication: "<code>input()</code> n'a reçu aucune réponse (la fenêtre de saisie a été fermée ou annulée).",
            astuce: "Exécute la cellule à nouveau et réponds dans la fenêtre qui s'ouvre."
        })],
        [/^FileNotFoundError: .*'(.+?)'/, (_, fichier) => ({
            titre: "Fichier introuvable",
            explication: `Le fichier ${code(fichier)} n'existe pas ici. Le notebook ne peut pas lire les fichiers de ton ordinateur.`,
            astuce: "Pour une base de données, utilise le fichier de la base du notebook (voir le panneau « Base de données »)."
        })],
        [/^sqlite3\.OperationalError: (.+)/, (_, message) => {
            const sql = explainSql(message);
            return sql ? { ...sql, titre: `SQL : ${sql.titre}` } : null;
        }],
        [/^sqlite3\.IntegrityError: (.+)/, (_, message) => {
            const sql = explainSql(message);
            return sql ? { ...sql, titre: `SQL : ${sql.titre}` } : null;
        }],
        [/^ErreurSQL: (.+)/, (_, message) => {
            const sql = explainSql(message);
            return sql ? { ...sql, titre: `SQL : ${sql.titre}` } : null;
        }]
    ];

    const SQL = [
        [/^no such table: (.+)/, (_, table) => ({
            titre: "Table inexistante",
            explication: `La table ${code(table)} n'existe pas dans la base.`,
            astuce: "Regarde le panneau « Base de données » pour la liste des tables et vérifie l'orthographe."
        })],
        [/^no such column: (.+)/, (_, colonne) => ({
            titre: "Colonne inexistante",
            explication: `La colonne ${code(colonne)} n'existe pas.`,
            astuce: `Vérifie l'orthographe dans le panneau « Base de données ». Si ${code(colonne)} est une valeur et pas une colonne, mets-la entre apostrophes : <code>WHERE ville = 'Tours'</code>.`
        })],
        [/^ambiguous column name: (.+)/, (_, colonne) => ({
            titre: "Colonne ambiguë",
            explication: `Plusieurs tables de la requête ont une colonne ${code(colonne)}.`,
            astuce: `Précise la table devant : <code>eleves.${colonne.split(".").pop()}</code>, ou avec un alias <code>e.${colonne.split(".").pop()}</code>.`
        })],
        [/^near "(.+?)": syntax error/, (_, mot) => ({
            titre: "Erreur de syntaxe",
            explication: `SQLite ne comprend pas la requête à partir de ${code(mot)}.`,
            astuce: "Vérifie l'ordre des mots-clés (SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT), les virgules entre les colonnes et les apostrophes autour du texte."
        })],
        [/^incomplete input/, () => ({
            titre: "Requête incomplète",
            explication: "La requête s'arrête avant la fin : une parenthèse ou une apostrophe n'est pas refermée, ou il manque une partie.",
            astuce: "Vérifie les <code>'</code> et les <code>( )</code>."
        })],
        [/^unrecognized token: "(.+?)"/, (_, jeton) => ({
            titre: "Symbole non reconnu",
            explication: `${code(jeton)} n'est pas compris par SQLite (souvent une apostrophe non fermée).`,
            astuce: "Le texte s'écrit entre apostrophes simples : <code>'Tours'</code>. Pour une apostrophe dans le texte, double-la : <code>'l''école'</code>."
        })],
        [/^UNIQUE constraint failed: (.+)/, (_, colonne) => ({
            titre: "Valeur déjà utilisée",
            explication: `La colonne ${code(colonne)} doit être unique, et cette valeur existe déjà (souvent une clé primaire).`,
            astuce: "Choisis une autre valeur, ou ne précise pas la clé primaire : SQLite la choisira tout seul."
        })],
        [/^NOT NULL constraint failed: (.+)/, (_, colonne) => ({
            titre: "Valeur obligatoire manquante",
            explication: `La colonne ${code(colonne)} ne peut pas être vide (NULL).`,
            astuce: "Ajoute une valeur pour cette colonne dans ton INSERT."
        })],
        [/^FOREIGN KEY constraint failed/, () => ({
            titre: "Clé étrangère invalide",
            explication: "La valeur ne correspond à aucune ligne de la table liée, ou tu supprimes une ligne encore utilisée ailleurs.",
            astuce: "Vérifie que l'identifiant existe dans l'autre table (ex. <code>id_classe</code> dans <code>classes</code>). Pour supprimer, retire d'abord les lignes qui y font référence."
        })],
        [/^CHECK constraint failed: (.+)/, (_, regle) => ({
            titre: "Valeur refusée",
            explication: `La valeur ne respecte pas la règle ${code(regle)} définie sur la table.`,
            astuce: "Regarde le schéma de la table pour connaître les valeurs autorisées (ex. une note entre 0 et 20)."
        })],
        [/^misuse of aggregate(?: function)?:? ?(.*)/, (_, fonction) => ({
            titre: "Fonction d'agrégat mal placée",
            explication: `${fonction ? code(fonction) : "Une fonction comme COUNT, AVG, SUM, MIN ou MAX"} ne peut pas s'utiliser dans un WHERE.`,
            astuce: "Pour filtrer sur un agrégat, utilise <code>GROUP BY</code> puis <code>HAVING</code> : <code>… GROUP BY ville HAVING COUNT(*) > 5</code>."
        })],
        [/^a GROUP BY clause is required before HAVING/, () => ({
            titre: "HAVING sans GROUP BY",
            explication: "<code>HAVING</code> filtre des groupes : il faut d'abord les créer avec <code>GROUP BY</code>.",
            astuce: "Pour filtrer des lignes simples, utilise <code>WHERE</code>."
        })],
        [/^table (.+?) already exists/, (_, table) => ({
            titre: "Table déjà existante",
            explication: `La table ${code(table)} existe déjà.`,
            astuce: "Utilise <code>CREATE TABLE IF NOT EXISTS</code>, supprime-la avec <code>DROP TABLE</code>, ou réinitialise la base."
        })],
        [/^(?:table )?(.+?) has (\d+) columns but (\d+) values were supplied/, (_, table, colonnes, valeurs) => ({
            titre: "Nombre de valeurs incorrect",
            explication: `La table ${code(table)} a ${colonnes} colonnes mais ${valeurs} valeurs sont données.`,
            astuce: "Précise les colonnes remplies : <code>INSERT INTO table (col1, col2) VALUES (…, …)</code>."
        })],
        [/^(\d+) values for (\d+) columns/, (_, valeurs, colonnes) => ({
            titre: "Nombre de valeurs incorrect",
            explication: `${valeurs} valeurs sont données pour ${colonnes} colonnes.`,
            astuce: "Il faut autant de valeurs dans VALUES que de colonnes listées."
        })],
        [/^datatype mismatch/, () => ({
            titre: "Type incorrect",
            explication: "La valeur n'a pas le bon type pour cette colonne (par exemple du texte dans une clé primaire entière).",
            astuce: "Vérifie le type des colonnes dans le panneau « Base de données »."
        })],
        [/^no tables specified/, () => ({
            titre: "Table manquante",
            explication: "<code>SELECT *</code> a besoin d'une table.",
            astuce: "Ajoute <code>FROM nom_de_la_table</code>."
        })],
        [/^no such function: (.+)/, (_, fonction) => ({
            titre: "Fonction inconnue",
            explication: `SQLite ne connaît pas la fonction ${code(fonction)}.`,
            astuce: "Fonctions disponibles : COUNT, SUM, AVG, MIN, MAX, ROUND, LENGTH, UPPER, LOWER, SUBSTR…"
        })],
        [/^(?:1st|2nd|3rd|\d+th) ORDER BY term out of range/, () => ({
            titre: "Numéro de colonne invalide",
            explication: "Le numéro utilisé dans <code>ORDER BY</code> dépasse le nombre de colonnes du SELECT.",
            astuce: "Utilise plutôt le nom de la colonne : <code>ORDER BY nom</code>."
        })],
        [/^cannot commit - no transaction is active|^cannot start a transaction within a transaction/, () => ({
            titre: "Transaction",
            explication: "Les commandes BEGIN / COMMIT ne sont pas dans le bon ordre.",
            astuce: "Chaque <code>BEGIN</code> doit être suivi d'un seul <code>COMMIT</code> ou <code>ROLLBACK</code>."
        })]
    ];

    function apply(rules, message) {
        for (const [pattern, build] of rules) {
            const match = pattern.exec(message);
            if (match) {
                const result = build(...match);
                if (result) return result;
            }
        }
        return null;
    }

    function explainSql(message) {
        return apply(SQL, String(message).trim());
    }

    function explainPython(lastLine) {
        return apply(PYTHON, String(lastLine).trim());
    }

    window.NSI_ERREURS = { explainPython, explainSql };
})();
