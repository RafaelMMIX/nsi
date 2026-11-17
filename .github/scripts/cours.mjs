// Cours proposés par les professeurs (notebooks tout faits).
// Lancé par .github/workflows/cours-publics.yml. Le contenu de l'issue est lu
// depuis le fichier d'événement GitHub : il n'est jamais exécuté.
//
//   node cours.mjs apercu   -> écrit apercu.md (aperçu du cours pour la relecture)
//   node cours.mjs ajouter  -> ajoute le cours à cours-publics.json
//
// Code du notebook : NBK1-<JSON compressé (deflate brut) en base64url>
//                    NBK0-<JSON en base64url>
// JSON : { v: 1, n: nom, b: "lycee" | "vide", c: [[type, contenu], …] }

import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";

const COURS = "cours-publics.json";
const APERCU = "apercu.md";
const TYPES = { python: "Python", sql: "SQL", markdown: "Texte", mindmap: "Carte mentale" };
const NIVEAUX = { "snt": "snt", "première nsi": "premiere", "premiere nsi": "premiere", "terminale nsi": "terminale", "tous niveaux": "tous" };
const NOMS_NIVEAUX = { snt: "SNT", premiere: "Première NSI", terminale: "Terminale NSI", tous: "Tous niveaux" };
const TAILLE_CODE_MAX = 60000;
const TAILLE_JSON_MAX = 600000;
const CELLULES_MAX = 300;
const CELLULE_MAX = 60000;

function sortie(nom, valeur) {
    if (process.env.GITHUB_OUTPUT) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${nom}<<FIN_SORTIE\n${valeur}\nFIN_SORTIE\n`);
    }
}

function echec(message) {
    console.error(message);
    sortie("message", `❌ ${message}`);
    process.exit(1);
}

function lireJson(fichier) {
    try {
        const v = JSON.parse(readFileSync(fichier, "utf8"));
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
}

// Une entrée par ligne : plus lisible dans les diffs
function ecrireJson(fichier, liste) {
    writeFileSync(fichier, liste.length ? "[\n" + liste.map(x => "  " + JSON.stringify(x)).join(",\n") + "\n]\n" : "[]\n");
}

// Texte sous un titre « ### … » du formulaire d'issue
function section(corps, titre) {
    const lignes = corps.split(/\r?\n/);
    const debut = lignes.findIndex(l => l.trim().toLowerCase() === `### ${titre}`.toLowerCase());
    if (debut === -1) return "";
    const fin = lignes.findIndex((l, i) => i > debut && /^###\s/.test(l));
    const texte = lignes.slice(debut + 1, fin === -1 ? undefined : fin).join("\n").trim();
    return texte === "_No response_" ? "" : texte;
}

// Texte affiché tel quel sur le site : sans HTML ni Markdown, longueur limitée
function nettoyer(texte, max) {
    return String(texte || "")
        .replace(/<[^>]*>/g, "")
        .replace(/[<>`*[\]#\\|]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}

function decoderCode(code) {
    const m = code.match(/^NBK([01])-([A-Za-z0-9_-]+)$/);
    if (!m) throw new Error("le code ne commence pas par NBK1- ou NBK0-");
    let octets = Buffer.from(m[2], "base64url");
    if (m[1] === "1") octets = inflateRawSync(octets, { maxOutputLength: TAILLE_JSON_MAX });
    if (octets.length > TAILLE_JSON_MAX) throw new Error("notebook trop gros");
    return JSON.parse(octets.toString("utf8"));
}

// Vérifie et normalise le notebook contenu dans le code
function verifierNotebook(donnees) {
    if (!donnees || typeof donnees !== "object" || Array.isArray(donnees)) throw new Error("données de notebook invalides");
    if (!Array.isArray(donnees.c) || !donnees.c.length) throw new Error("le notebook ne contient aucune cellule");
    if (donnees.c.length > CELLULES_MAX) throw new Error(`trop de cellules (${CELLULES_MAX} au maximum)`);

    const cellules = donnees.c.map((cellule, i) => {
        if (!Array.isArray(cellule) || cellule.length !== 2) throw new Error(`cellule ${i + 1} invalide`);
        const [type, contenu] = cellule;
        if (!TYPES[type]) throw new Error(`cellule ${i + 1} : type inconnu (${String(type).slice(0, 20)})`);
        if (typeof contenu !== "string") throw new Error(`cellule ${i + 1} : contenu invalide`);
        if (contenu.length > CELLULE_MAX) throw new Error(`cellule ${i + 1} trop longue`);
        if (type === "mindmap") {
            let carte;
            try { carte = JSON.parse(contenu); } catch { throw new Error(`cellule ${i + 1} : carte mentale illisible`); }
            if (!carte || typeof carte !== "object" || !carte.root || typeof carte.root !== "object") throw new Error(`cellule ${i + 1} : carte mentale invalide`);
        }
        return { type, content: contenu };
    });

    // Pas de cours vide
    if (!cellules.some(c => c.content.trim())) throw new Error("toutes les cellules sont vides");

    return {
        nom: nettoyer(donnees.n, 80),
        base: donnees.b === "vide" ? "vide" : "lycee",
        cellules
    };
}

function empreinte(cellules) {
    return createHash("sha256").update(JSON.stringify(cellules), "utf8").digest("hex").slice(0, 16);
}

function lireDemande() {
    const evenement = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
    const issue = evenement.issue;
    const corps = String(issue.body || "");
    const brut = section(corps, "Code du notebook") || corps;
    const code = (brut.replace(/\s+/g, "").match(/NBK[01]-[A-Za-z0-9_-]+/) || [])[0];
    if (!code) echec("Aucun code de notebook trouvé dans la demande (il commence par NBK1- ou NBK0-).");
    if (code.length > TAILLE_CODE_MAX) echec("Le code est trop long : allège le notebook (moins de cellules ou des cellules plus courtes).");

    let notebook;
    try {
        notebook = verifierNotebook(decoderCode(code));
    } catch (e) {
        echec(`Code invalide : ${e.message}.`);
    }

    const niveau = NIVEAUX[section(corps, "Niveau").trim().toLowerCase()] || "tous";
    const titre = nettoyer(section(corps, "Titre du cours"), 80) || notebook.nom || "Cours";
    return {
        issue,
        notebook,
        infos: {
            titre,
            description: nettoyer(section(corps, "Description"), 300),
            auteur: nettoyer(section(corps, "Nom affiché"), 40) || "Un professeur",
            niveau,
            theme: nettoyer(section(corps, "Thème"), 40)
        }
    };
}

/* ---------- Aperçu pour la relecture ---------- */

// Barrière de code plus longue que toutes celles du contenu
function bloc(contenu, langage) {
    const plusLongue = Math.max(2, ...(contenu.match(/~+/g) || []).map(s => s.length));
    const barriere = "~".repeat(plusLongue + 1);
    return `${barriere}${langage}\n${contenu}\n${barriere}`;
}

function planCarte(contenu) {
    try {
        const carte = JSON.parse(contenu);
        const lignes = [];
        const parcours = (noeud, profondeur) => {
            if (!noeud || typeof noeud !== "object") return;
            lignes.push(`${"  ".repeat(profondeur)}- ${String(noeud.icon ? `${noeud.icon} ` : "")}${String(noeud.text || "…").replace(/\s+/g, " ")}`);
            (Array.isArray(noeud.children) ? noeud.children : []).forEach(enfant => parcours(enfant, profondeur + 1));
        };
        parcours(carte.root, 0);
        return lignes.join("\n");
    } catch {
        return contenu;
    }
}

const A_VERIFIER = [
    [/\bimport\s+js\b|\bfrom\s+js\b/, "module `js` (accès direct au navigateur)"],
    [/\bpyodide\b/, "`pyodide` (accès au moteur Python du navigateur)"],
    [/localStorage|sessionStorage|document\.cookie/, "accès aux données enregistrées du navigateur"],
    [/\bfetch\s*\(|XMLHttpRequest|open_url|pyfetch|urllib|requests\b|http\.client|socket/, "accès à internet"],
    [/\beval\s*\(|\bexec\s*\(|__import__/, "`eval`, `exec` ou `__import__`"],
    [/<script|javascript:|<iframe|on\w+\s*=/i, "HTML ou JavaScript dans le texte (il sera nettoyé à l'affichage, mais vérifie)"]
];

function apercu() {
    const { issue, notebook, infos } = lireDemande();
    const compte = {};
    notebook.cellules.forEach(c => { compte[c.type] = (compte[c.type] || 0) + 1; });
    const resume = Object.entries(compte).map(([type, n]) => `${n} ${TYPES[type]}`).join(" · ");

    const alertes = new Set();
    notebook.cellules.forEach(c => A_VERIFIER.forEach(([motif, texte]) => { if (motif.test(c.content)) alertes.add(texte); }));

    const doublon = lireJson(COURS).some(cours => cours.empreinte === empreinte(notebook.cellules));
    const parties = [
        `## 📚 Aperçu du cours « ${infos.titre} »`,
        "",
        "| | |",
        "|---|---|",
        `| Professeur | ${infos.auteur} |`,
        `| Niveau | ${NOMS_NIVEAUX[infos.niveau]} |`,
        infos.theme ? `| Thème | ${infos.theme} |` : null,
        `| Base de données | ${notebook.base === "vide" ? "Base vide" : "Lycée"} |`,
        `| Cellules | ${resume} |`,
        "",
        infos.description ? `> ${infos.description}` : null,
        "",
        doublon ? "ℹ️ **Ce notebook est déjà publié** (mêmes cellules).\n" : null,
        alertes.size
            ? `### ⚠️ Points à vérifier\n${[...alertes].map(a => `- ${a}`).join("\n")}\n`
            : "✅ Rien de suspect repéré automatiquement.\n",
        "**Avant d'ajouter l'étiquette `cours-approuve`**, lis le contenu ci-dessous : le code Python s'exécutera dans le navigateur des élèves qui cliqueront sur ▶.",
        ""
    ].filter(ligne => ligne !== null);

    notebook.cellules.forEach((cellule, i) => {
        const langage = { python: "python", sql: "sql", markdown: "markdown", mindmap: "markdown" }[cellule.type];
        const contenu = cellule.type === "mindmap" ? planCarte(cellule.content) : cellule.content;
        parties.push(`<details${i < 3 ? " open" : ""}><summary>Cellule ${i + 1} · ${TYPES[cellule.type]}</summary>\n\n${bloc(contenu || "(vide)", langage)}\n\n</details>\n`);
    });

    let texte = parties.join("\n");
    if (texte.length > 60000) texte = `${texte.slice(0, 59000)}\n\n…\n\n_Aperçu coupé : le notebook est trop long pour un seul commentaire._`;
    writeFileSync(APERCU, texte);
    console.log(`Aperçu écrit pour l'issue #${issue.number} (${notebook.cellules.length} cellules)`);
}

/* ---------- Publication ---------- */

function ajouter() {
    const { issue, notebook, infos } = lireDemande();
    const liste = lireJson(COURS);
    const cle = empreinte(notebook.cellules);

    if (liste.some(cours => cours.empreinte === cle)) {
        sortie("message", `ℹ️ Ce notebook est déjà publié dans les cours de NSI Hub.`);
        sortie("ajoute", "non");
        return;
    }

    liste.push({
        id: `cours-${issue.number}`,
        titre: infos.titre,
        description: infos.description,
        auteur: infos.auteur,
        niveau: infos.niveau,
        theme: infos.theme,
        base: notebook.base,
        cellules: notebook.cellules,
        empreinte: cle,
        issue: issue.number,
        date: new Date().toISOString().slice(0, 10)
    });
    ecrireJson(COURS, liste);

    sortie("nom", infos.titre);
    sortie("ajoute", "oui");
    sortie("message", `✅ Le cours « ${infos.titre} » (proposé par ${infos.auteur}, ${NOMS_NIVEAUX[infos.niveau]}) a été ajouté à la section Cours des notebooks de NSI Hub. Il apparaîtra d'ici quelques minutes. Merci !`);
    console.log(`Cours ajouté : ${infos.titre} par ${infos.auteur}`);
}

const mode = process.argv[2];
if (mode === "apercu") apercu();
else if (mode === "ajouter") ajouter();
else echec("Mode inconnu (apercu ou ajouter).");
