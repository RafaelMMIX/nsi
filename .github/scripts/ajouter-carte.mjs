// Ajoute à cartes-publiques.json la carte contenue dans une issue approuvée.
// Lancé par .github/workflows/cartes-publiques.yml. Le contenu de l'issue est
// lu depuis le fichier d'événement GitHub : il n'est jamais exécuté.

import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const FICHIER = "cartes-publiques.json";
const RARETES = ["commune", "rare", "epique", "legendaire", "superlegendaire", "mythique", "perdue"];
const TYPES = ["neutre", "feu", "eau", "nature", "ombre", "lumiere"];
const IMAGE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]*$/;
const TAILLE_MAX = 120000;

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

function decoder(code) {
    const m = code.match(/^TCG([01])-([A-Za-z0-9_-]+)$/);

    if (!m) {
        throw new Error("le code ne commence pas par TCG1- ou TCG0-");
    }

    let octets = Buffer.from(m[2].replace(/-/g, "+").replace(/_/g, "/"), "base64");

    if (m[1] === "1") {
        octets = inflateRawSync(octets, { maxOutputLength: 400000 });
    }

    const donnees = JSON.parse(octets.toString("utf8"));

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
    if (typeof desc !== "string" || desc.length > 160) {
        throw new Error("description invalide ou trop longue");
    }
    if (img !== "" && img != null && !(typeof img === "string" && IMAGE.test(img))) {
        throw new Error("image invalide");
    }
    if (type !== undefined && !TYPES.includes(type)) {
        throw new Error("type inconnu");
    }

    return { nom, rar };
}

const evenement = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const issue = evenement.issue;
const corps = String(issue.body || "");

const brut = section(corps, "Code de la carte") || corps;
const code = (brut.replace(/\s+/g, "").match(/TCG[01]-[A-Za-z0-9_-]+/) || [])[0];

if (!code) {
    echec("Aucun code de carte trouvé dans la demande.");
}
if (code.length > TAILLE_MAX) {
    echec("Le code est trop long (image trop lourde).");
}

let carte;
try {
    carte = decoder(code);
} catch (e) {
    echec(`Code invalide : ${e.message}.`);
}

const pseudo = section(corps, "Pseudo")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>`*_[\]#\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24) || "Communauté";

let liste = [];
try {
    liste = JSON.parse(readFileSync(FICHIER, "utf8"));
    if (!Array.isArray(liste)) liste = [];
} catch {
    liste = [];
}

if (liste.some(c => c.code === code)) {
    sortie("message", `ℹ️ « ${carte.nom} » est déjà dans la galerie.`);
    sortie("ajoutee", "non");
    process.exit(0);
}

liste.push({
    createur: pseudo,
    code,
    issue: issue.number,
    date: new Date().toISOString().slice(0, 10)
});

// Une carte par ligne : plus lisible dans les diffs
writeFileSync(FICHIER, "[\n" + liste.map(c => "  " + JSON.stringify(c)).join(",\n") + "\n]\n");

sortie("nom", carte.nom);
sortie("ajoutee", "oui");
sortie("message", `✅ « ${carte.nom} » (créée par ${pseudo}) a été ajoutée aux cartes communautaires de NSI Hub. Elle apparaîtra d'ici quelques minutes.`);
console.log(`Carte ajoutée : ${carte.nom} (${carte.rar}) par ${pseudo}`);
