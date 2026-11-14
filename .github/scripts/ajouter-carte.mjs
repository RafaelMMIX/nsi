// Ajoute à NSI Hub la carte ou le booster contenu dans une issue approuvée.
// Lancé par .github/workflows/cartes-publiques.yml. Le contenu de l'issue est
// lu depuis le fichier d'événement GitHub : il n'est jamais exécuté.
//
//  - code TCG1-/TCG0- : carte  -> cartes-publiques.json
//  - code BST1-/BST0- : booster -> boosters-publics.json
//    (toutes ses cartes doivent déjà être publiques)

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";

const CARTES = "cartes-publiques.json";
const BOOSTERS = "boosters-publics.json";
const CARTES_JS = "cartes.js";
const RARETES = ["commune", "rare", "epique", "legendaire", "superlegendaire", "mythique", "perdue"];
const NOMS_RARETES = {
    commune: "Commune", rare: "Rare", epique: "Épique", legendaire: "Légendaire",
    superlegendaire: "Super légendaire", mythique: "Mythique", perdue: "Perdue"
};
const TYPES = ["neutre", "feu", "eau", "nature", "ombre", "lumiere"];
const IMAGE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]*$/;
const TAILLE_MAX = 120000;
const MIN_CARTES_BOOSTER = 10;

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
    writeFileSync(fichier, "[\n" + liste.map(x => "  " + JSON.stringify(x)).join(",\n") + "\n]\n");
}

// Récupère le texte sous un titre « ### … » du formulaire d'issue
function section(corps, titre) {
    const lignes = corps.split(/\r?\n/);
    const debut = lignes.findIndex(l => l.trim().toLowerCase() === `### ${titre}`.toLowerCase());

    if (debut === -1) {
        return "";
    }

    const fin = lignes.findIndex((l, i) => i > debut && /^###\s/.test(l));

    return lignes.slice(debut + 1, fin === -1 ? undefined : fin).join("\n").trim();
}

function octetsDuCode(code, prefixe) {
    const m = code.match(new RegExp(`^${prefixe}([01])-([A-Za-z0-9_-]+)$`));

    if (!m) {
        throw new Error(`le code ne commence pas par ${prefixe}1- ou ${prefixe}0-`);
    }

    let octets = Buffer.from(m[2].replace(/-/g, "+").replace(/_/g, "/"), "base64");

    if (m[1] === "1") {
        octets = inflateRawSync(octets, { maxOutputLength: 400000 });
    }

    return JSON.parse(octets.toString("utf8"));
}

// Décode et vérifie une carte ; renvoie ses champs normalisés
function decoderCarte(code) {
    const donnees = octetsDuCode(code, "TCG");

    if (!Array.isArray(donnees) || donnees.length < 4 || donnees.length > 5) {
        throw new Error("données de carte invalides");
    }

    const [nom, rar, desc, img, type] = donnees;

    if (typeof nom !== "string" || !nom.trim() || nom.length > 32) {
        throw new Error("nom manquant ou trop long");
    }
    if (!RARETES.includes(rar)) {
        throw new Error(`rareté inconnue (${String(rar).slice(0, 20)})`);
    }
    if (desc != null && (typeof desc !== "string" || desc.length > 160)) {
        throw new Error("description invalide ou trop longue");
    }
    if (img !== "" && img != null && !(typeof img === "string" && IMAGE.test(img))) {
        throw new Error("image invalide");
    }
    if (type != null && !TYPES.includes(type)) {
        throw new Error("type inconnu");
    }

    return { nom, rar, desc: desc || "", img: img || "", type: type || "neutre" };
}

// Identifiant stable d'une carte : le même que dans Booster perso et cartes.js
function idCarte(c) {
    const texte = JSON.stringify([c.nom, c.rar, String(c.desc || ""), c.img || "", c.type || "neutre"]);
    return createHash("sha256").update(texte, "utf8").digest("hex").slice(0, 16);
}

// Toutes les cartes publiques (ajoutées à la main dans cartes.js ou publiées)
function indexPublic() {
    const codes = new Set(lireJson(CARTES).map(c => c && c.code).filter(Boolean));

    if (existsSync(CARTES_JS)) {
        for (const code of readFileSync(CARTES_JS, "utf8").match(/TCG[01]-[A-Za-z0-9_-]+/g) || []) {
            codes.add(code);
        }
    }

    const index = new Map();

    for (const code of codes) {
        try {
            const carte = decoderCarte(code);
            index.set(idCarte(carte), carte);
        } catch {
            // carte illisible : ignorée
        }
    }

    return index;
}

function nettoyerPseudo(texte) {
    return texte
        .replace(/<[^>]*>/g, "")
        .replace(/[<>`*_[\]#\\]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 24) || "Communauté";
}

// ------------------------------------------------------------
// Carte
// ------------------------------------------------------------
function ajouterCarte(code, pseudo, issue) {
    if (code.length > TAILLE_MAX) {
        echec("Le code est trop long (image trop lourde).");
    }

    let carte;
    try {
        carte = decoderCarte(code);
    } catch (e) {
        echec(`Code invalide : ${e.message}.`);
    }

    const liste = lireJson(CARTES);

    if (liste.some(c => c.code === code) || indexPublic().has(idCarte(carte))) {
        sortie("message", `ℹ️ « ${carte.nom} » est déjà dans la galerie.`);
        sortie("ajoutee", "non");
        return;
    }

    liste.push({ createur: pseudo, code, issue: issue.number, date: new Date().toISOString().slice(0, 10) });
    ecrireJson(CARTES, liste);

    sortie("nom", carte.nom);
    sortie("ajoutee", "oui");
    sortie("message", `✅ « ${carte.nom} » (créée par ${pseudo}) a été ajoutée aux cartes communautaires de NSI Hub. Elle apparaîtra d'ici quelques minutes.`);
    console.log(`Carte ajoutée : ${carte.nom} (${carte.rar}) par ${pseudo}`);
}

// ------------------------------------------------------------
// Booster
// ------------------------------------------------------------
function ajouterBooster(code, pseudo, issue) {
    if (code.length > 20000) {
        echec("Le code du booster est trop long.");
    }

    let b;
    try {
        b = octetsDuCode(code, "BST");
    } catch (e) {
        echec(`Code de booster invalide : ${e.message}.`);
    }

    if (!b || typeof b !== "object" || Array.isArray(b)) {
        echec("Code de booster invalide.");
    }

    const nom = typeof b.n === "string" ? b.n.replace(/\s+/g, " ").trim() : "";
    const emoji = typeof b.e === "string" && b.e.trim() && b.e.length <= 16 ? b.e.trim() : "🃏";
    const couleur = /^#[0-9a-f]{6}$/i.test(b.c) ? b.c.toLowerCase() : "#3b4cca";
    const ids = Array.isArray(b.k) ? [...new Set(b.k)] : [];

    if (!nom || nom.length > 32) {
        echec("Nom du booster manquant ou trop long.");
    }
    if (ids.length < MIN_CARTES_BOOSTER || ids.length > 500 || !ids.every(k => typeof k === "string" && /^[0-9a-f]{16}$/.test(k))) {
        echec(`Un booster doit contenir au moins ${MIN_CARTES_BOOSTER} cartes.`);
    }

    const index = indexPublic();
    const manquantes = ids.filter(k => !index.has(k));

    if (manquantes.length) {
        echec(`${manquantes.length} carte(s) de ce booster ne sont pas encore publiques. Publie-les d'abord, puis renvoie le booster.`);
    }

    const presentes = new Set(ids.map(k => index.get(k).rar));
    const raretesManquantes = RARETES.filter(r => !presentes.has(r));

    if (raretesManquantes.length) {
        echec(`Il manque au moins une carte de ces raretés : ${raretesManquantes.map(r => NOMS_RARETES[r]).join(", ")}.`);
    }

    const liste = lireJson(BOOSTERS);
    const cle = [...ids].sort().join();

    if (liste.some(x => Array.isArray(x.cartes) && [...x.cartes].sort().join() === cle)) {
        sortie("message", `ℹ️ Un booster avec exactement ces cartes est déjà publié.`);
        sortie("ajoutee", "non");
        return;
    }

    liste.push({
        nom,
        emoji,
        couleur,
        createur: pseudo,
        cartes: ids,
        issue: issue.number,
        date: new Date().toISOString().slice(0, 10)
    });
    ecrireJson(BOOSTERS, liste);

    sortie("nom", `booster ${nom}`);
    sortie("ajoutee", "oui");
    sortie("message", `✅ Le booster « ${nom} » (${ids.length} cartes, créé par ${pseudo}) a été ajouté à NSI Hub. Il apparaîtra d'ici quelques minutes.`);
    console.log(`Booster ajouté : ${nom} (${ids.length} cartes) par ${pseudo}`);
}

// ------------------------------------------------------------
const evenement = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const issue = evenement.issue;
const corps = String(issue.body || "");
const pseudo = nettoyerPseudo(section(corps, "Pseudo"));

const brutBooster = section(corps, "Code du booster");
const codeBooster = (brutBooster.replace(/\s+/g, "").match(/BST[01]-[A-Za-z0-9_-]+/) || [])[0];

if (codeBooster) {
    ajouterBooster(codeBooster, pseudo, issue);
} else {
    const brut = section(corps, "Code de la carte") || corps;
    const code = (brut.replace(/\s+/g, "").match(/TCG[01]-[A-Za-z0-9_-]+/) || [])[0];

    if (!code) {
        echec("Aucun code de carte ou de booster trouvé dans la demande.");
    }

    ajouterCarte(code, pseudo, issue);
}
