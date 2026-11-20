// Ajoute à NSI Hub la carte ou le booster contenu dans une issue approuvée.
// Lancé par .github/workflows/cartes-publiques.yml. Le contenu de l'issue est
// lu depuis le fichier d'événement GitHub : il n'est jamais exécuté.
//
//  - code TCG1-/TCG0- : carte  -> cartes-publiques.json
//    - sans ID dans la demande : nouvelle carte (ou, si une carte au contenu identique
//      existe déjà et que le code contient des attaques, mise à jour de ses attaques
//      dans cartes-attaques.json)
//    - avec l'ID d'une carte publiée : cette carte est remplacée par la nouvelle version
//      (nom, rareté, image, description, type, attaques) ; son ID ne change pas, et les
//      boosters qui la contiennent sont mis à jour
//  - code BST1-/BST0- : booster -> boosters-publics.json
//    (toutes ses cartes doivent déjà être publiques)

import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";

const CARTES = "cartes-publiques.json";
const BOOSTERS = "boosters-publics.json";
const ATTAQUES = "cartes-attaques.json";
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

// Attaques : 2 à 3 par carte, puissance limitée selon la rareté
// (les mêmes valeurs que dans Booster perso et tcg-share.js)
const ATK_RANGE = {
    commune: [10, 30], rare: [20, 50], epique: [30, 70], legendaire: [50, 100],
    superlegendaire: [70, 130], mythique: [90, 160], perdue: [120, 200]
};
const ATK_MIN = 2;
const ATK_MAX = 3;

// Renvoie une liste propre [[nom, puissance], …] (puissance ramenée dans la fourchette) ou undefined
function nettoyerAttaques(liste, rar) {
    if (!Array.isArray(liste) || !ATK_RANGE[rar]) {
        return undefined;
    }

    const [lo, hi] = ATK_RANGE[rar];

    const out = liste.slice(0, ATK_MAX).map(a => {
        const n = String((Array.isArray(a) ? a[0] : a && a.n) || "").trim().slice(0, 20);
        const v = Math.round(+(Array.isArray(a) ? a[1] : a && a.d));

        return [n, Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo))];
    }).filter(a => a[0]);

    return out.length >= ATK_MIN ? out : undefined;
}

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

    if (!Array.isArray(donnees) || donnees.length < 4 || donnees.length > 6) {
        throw new Error("données de carte invalides");
    }

    const [nom, rar, desc, img, type, atk] = donnees;

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

    let attaques;

    if (atk != null) {
        attaques = nettoyerAttaques(atk, rar);

        if (!attaques) {
            throw new Error(`attaques invalides (${ATK_MIN} à ${ATK_MAX} attendues, avec un nom)`);
        }
    }

    return { nom, rar, desc: desc || "", img: img || "", type: type || "neutre", ...(attaques ? { atk: attaques } : {}) };
}

// Identifiant du CONTENU d'une carte : le même que dans Booster perso et cartes.js.
// Il dépend du nom, de la rareté, de la description, de l'image et du type, mais PAS des
// attaques. C'est celui qu'utilisent les boosters. L'ID affiché sur NSI Hub (champ « id »)
// est celui du contenu à la première publication ; il ne change plus ensuite, même si
// la carte est mise à jour.
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

// ID de la carte à mettre à jour (champ facultatif du formulaire) ; chaîne vide s'il n'y en a pas
function idDemande(corps) {
    const brut = section(corps, "ID de la carte à mettre à jour (facultatif)");

    if (!brut || /^_no response_$/i.test(brut)) {
        return "";
    }

    const m = brut.toLowerCase().match(/(?<![0-9a-f])[0-9a-f]{16}(?![0-9a-f])/);

    if (!m) {
        echec("L'ID de la carte à mettre à jour est invalide : il doit contenir 16 caractères (chiffres et lettres de a à f).");
    }

    return m[0];
}

// ------------------------------------------------------------
// Carte
// ------------------------------------------------------------

// Toutes les cartes de cartes-publiques.json, avec leur ID stable (champ « id »)
// et l'identifiant de leur contenu actuel (« cid », celui qu'utilisent les boosters)
function entreesJson(liste) {
    return liste.map(entry => {
        try {
            const card = decoderCarte(entry.code);
            const cid = idCarte(card);

            return { entry, card, cid, id: entry.id || cid };
        } catch {
            return null;
        }
    }).filter(Boolean);
}

function ajouterCarte(code, pseudo, issue, maj) {
    if (code.length > TAILLE_MAX) {
        echec("Le code est trop long (image trop lourde).");
    }

    let carte;
    try {
        carte = decoderCarte(code);
    } catch (e) {
        echec(`Code invalide : ${e.message}.`);
    }

    const date = new Date().toISOString().slice(0, 10);
    const liste = lireJson(CARTES);
    const entrees = entreesJson(liste);
    const attaques = lireJson(ATTAQUES);
    const cid = idCarte(carte);
    const index = indexPublic();

    // --------------------------------------------------------
    // Mise à jour d'une carte existante, repérée par son ID
    // --------------------------------------------------------
    if (maj) {
        const cible = entrees.find(e => e.id === maj);

        if (!cible) {
            echec(`Aucune carte publiée n'a l'ID ${maj}. Vérifie l'ID affiché sous la carte sur NSI Hub, ou laisse ce champ vide pour publier une nouvelle carte.`);
        }

        if (cible.entry.code === code) {
            sortie("message", `ℹ️ « ${carte.nom} » (ID ${maj}) est déjà à jour.`);
            sortie("ajoutee", "non");
            return;
        }

        // Le nouveau contenu ne doit pas être celui d'une autre carte
        const autre = entrees.find(e => e.id !== maj && e.cid === cid);

        if (autre || (index.has(cid) && cid !== cible.cid && !entrees.some(e => e.cid === cid))) {
            echec(`Une autre carte identique existe déjà${autre ? ` (ID ${autre.id})` : ""}.`);
        }

        const ancien = cible.card;
        const ancienCid = cible.cid;
        const createurOrigine = cible.entry.createur || "Communauté";

        cible.entry.id = maj;
        cible.entry.code = code;
        cible.entry.modif = date;
        cible.entry.issueModif = issue.number;
        ecrireJson(CARTES, liste);

        // Le contenu a changé : les boosters qui contenaient l'ancienne version pointent vers la nouvelle
        let boostersMaj = 0;

        if (ancienCid !== cid) {
            const boosters = lireJson(BOOSTERS);

            for (const b of boosters) {
                const i = Array.isArray(b.cartes) ? b.cartes.indexOf(ancienCid) : -1;

                if (i !== -1) {
                    if (b.cartes.includes(cid)) {
                        b.cartes.splice(i, 1);
                    } else {
                        b.cartes[i] = cid;
                    }

                    boostersMaj++;
                }
            }

            if (boostersMaj) {
                ecrireJson(BOOSTERS, boosters);
            }
        }

        // Si le nouveau code contient des attaques, elles remplacent une ancienne mise à jour d'attaques
        if (carte.atk && attaques.some(a => a.id === maj)) {
            ecrireJson(ATTAQUES, attaques.filter(a => a.id !== maj));
        }

        const changements = [];
        if (ancien.nom !== carte.nom) changements.push("nom");
        if (ancien.rar !== carte.rar) changements.push("rareté");
        if (ancien.desc !== carte.desc) changements.push("description");
        if (ancien.img !== carte.img) changements.push("image");
        if (ancien.type !== carte.type) changements.push("type");
        if (JSON.stringify(ancien.atk || null) !== JSON.stringify(carte.atk || null)) changements.push("attaques");

        const alerte = pseudo !== createurOrigine
            ? `\n\n⚠️ Le pseudo de cette demande (${pseudo}) est différent du créateur d'origine (${createurOrigine}).`
            : "";

        sortie("nom", `mise à jour de ${carte.nom}`);
        sortie("ajoutee", "oui");
        sortie("message", `✅ La carte « ${carte.nom} » (ID ${maj}) a été mise à jour${changements.length ? ` (${changements.join(", ")})` : ""}${boostersMaj ? `, ainsi que ${boostersMaj} booster${boostersMaj > 1 ? "s" : ""}` : ""}. Les changements apparaîtront d'ici quelques minutes.${alerte}`);
        console.log(`Carte mise à jour : ${carte.nom} (${maj})`);
        return;
    }

    // --------------------------------------------------------
    // Sans ID : nouvelle carte, ou attaques d'une carte au contenu identique
    // --------------------------------------------------------
    if (liste.some(c => c.code === code) || index.has(cid)) {
        const ex = entrees.find(e => e.cid === cid);
        const idEx = ex ? ex.id : cid;
        const existante = index.get(cid);
        const actuelles = (attaques.find(a => a.id === idEx) || {}).atk || (existante && existante.atk);

        if (carte.atk && JSON.stringify(actuelles || null) !== JSON.stringify(carte.atk)) {
            const entree = { id: idEx, atk: carte.atk, issue: issue.number, date };
            const i = attaques.findIndex(a => a.id === idEx);

            if (i === -1) {
                attaques.push(entree);
            } else {
                attaques[i] = entree;
            }

            ecrireJson(ATTAQUES, attaques);

            sortie("nom", `attaques de ${carte.nom}`);
            sortie("ajoutee", "oui");
            sortie("message", `✅ Les attaques de « ${carte.nom} » (ID ${idEx}) ont été ${actuelles ? "mises à jour" : "ajoutées"}. Elles apparaîtront d'ici quelques minutes.`);
            console.log(`Attaques ${actuelles ? "mises à jour" : "ajoutées"} : ${carte.nom} (${idEx})`);
            return;
        }

        sortie("message", `ℹ️ « ${carte.nom} » est déjà dans la galerie${carte.atk ? " avec ces attaques" : ""} (ID ${idEx}).`);
        sortie("ajoutee", "non");
        return;
    }

    liste.push({ id: cid, createur: pseudo, code, issue: issue.number, date });
    ecrireJson(CARTES, liste);

    sortie("nom", carte.nom);
    sortie("ajoutee", "oui");
    sortie("message", `✅ « ${carte.nom} » (ID ${cid}, créée par ${pseudo}) a été ajoutée aux cartes communautaires de NSI Hub. Elle apparaîtra d'ici quelques minutes. Pour la mettre à jour plus tard, renseigne cet ID dans le formulaire de publication.`);
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

    ajouterCarte(code, pseudo, issue, idDemande(corps));
}
