// ============================================
// CARTES COMMUNAUTAIRES - NSI HUB
// ============================================

import { decode, encode, cardId, cleanAtk, RAR } from "./tcg-share.js";

const TCG_URL = "https://rafaelmmix.github.io/custom-tcg/tcg-cartes.html";

// ============================================
// BASE DE DONNÉES DES CARTES
// ============================================

// Les cartes sont dans cartes-publiques.json (ajoutées automatiquement après validation
// d'une demande GitHub). Ce tableau sert aux cartes ajoutées à la main :
//
// createur  : nom du créateur
// code      : code complet TCG1- ou TCG0-
//
// Chaque carte a un ID stable (champ « id » de cartes-publiques.json, affiché sous la carte).
// Pour mettre une carte à jour, il suffit de renseigner son ID dans le formulaire de
// publication : la carte est remplacée, elle ne change pas d'ID. Les cartes de ce tableau
// n'ont pas d'ID enregistré et ne peuvent pas être mises à jour ainsi.
//
// La rareté et le véritable nom de la carte
// sont récupérés automatiquement depuis son code.

const cartes = [

    // Ajoute tes cartes ci-dessous.

];

// ============================================
// ÉLÉMENTS HTML
// ============================================

const grid = document.getElementById("cardsGrid");
const searchInput = document.getElementById("cardSearch");
const rarityFilter = document.getElementById("rarityFilter");
const cardsCount = document.getElementById("cardsCount");
const cardsEmpty = document.getElementById("cardsEmpty");
const copyToast = document.getElementById("copyToast");
const boostersSection = document.getElementById("boostersSection");
const boostersGrid = document.getElementById("boostersGrid");
const boostersCount = document.getElementById("boostersCount");
const boosterFilter = document.getElementById("boosterFilter");
const boosterFilterText = document.getElementById("boosterFilterText");
const RARITY_ORDER = Object.keys(RAR);

let publicBoosters = [];
let activeBooster = null;

// ============================================
// DONNÉES DÉCODÉES
// ============================================

let decodedCards = [];

// Cartes publiées depuis Booster perso (ajoutées automatiquement
// par .github/workflows/cartes-publiques.yml après validation).
async function loadPublicCards() {
    try {
        const response = await fetch(`cartes-publiques.json?v=${Date.now()}`);

        if (!response.ok) {
            return [];
        }

        const list = await response.json();

        return Array.isArray(list)
            ? list.filter(entry => entry && typeof entry.code === "string")
            : [];

    } catch (error) {
        console.error("Impossible de charger les cartes publiques :", error);
        return [];
    }
}

// Attaques mises à jour après la publication (une entrée par carte, repérée par son id).
// Elles remplacent celles qui se trouvent éventuellement dans le code de la carte.
async function loadAttacks() {
    try {
        const response = await fetch(`cartes-attaques.json?v=${Date.now()}`);

        if (!response.ok) {
            return new Map();
        }

        const list = await response.json();

        return new Map(
            (Array.isArray(list) ? list : [])
                .filter(entry => entry && typeof entry.id === "string" && Array.isArray(entry.atk))
                .map(entry => [entry.id, entry.atk])
        );

    } catch (error) {
        console.error("Impossible de charger les attaques :", error);
        return new Map();
    }
}

async function loadCards() {
    decodedCards = [];

    const publicCards = await loadPublicCards();
    const attacks = await loadAttacks();
    // Une même carte (même code) n'est affichée qu'une seule fois
    const knownCodes = new Set();
    const allCards = [...cartes, ...publicCards].filter(entry => {
        if (knownCodes.has(entry.code)) {
            return false;
        }

        knownCodes.add(entry.code);
        return true;
    });

    for (const [index, entry] of allCards.entries()) {
        try {
            const card = await decode(entry.code);

            // cid : identifiant du contenu (utilisé par les boosters) ; id : ID stable de la carte
            const cid = await cardId(card);
            const id = entry.id || cid;
            const atk = cleanAtk(attacks.get(id), card.rar) || card.atk;

            decodedCards.push({
                ...card,
                atk,
                cid,
                id,
                createur: entry.createur || "Communauté",
                code: entry.code,
                index
            });

        } catch (error) {
            console.error(
                `Impossible de charger la carte n°${index + 1} :`,
                error
            );
        }
    }

    publicBoosters = await loadPublicBoosters();
    renderBoosters();
    renderCards();
}

// ============================================
// BOOSTERS DE LA COMMUNAUTÉ
// ============================================

async function loadPublicBoosters() {
    try {
        const response = await fetch(`boosters-publics.json?v=${Date.now()}`);

        if (!response.ok) {
            return [];
        }

        const list = await response.json();

        return Array.isArray(list)
            ? list.filter(b => b && typeof b.nom === "string" && Array.isArray(b.cartes))
            : [];

    } catch (error) {
        console.error("Impossible de charger les boosters :", error);
        return [];
    }
}

function boosterCards(booster) {
    const ids = new Set(booster.cartes);
    return decodedCards.filter(card => ids.has(card.cid));
}

function renderBoosters() {
    boostersGrid.replaceChildren();
    boostersSection.hidden = publicBoosters.length === 0;

    boostersCount.textContent =
        `${publicBoosters.length} booster${publicBoosters.length > 1 ? "s" : ""} à ouvrir`;

    for (const booster of publicBoosters) {
        boostersGrid.appendChild(createBoosterItem(booster));
    }
}

function createBoosterItem(booster) {
    const cardsInBooster = boosterCards(booster);
    const color = /^#[0-9a-f]{6}$/i.test(booster.couleur) ? booster.couleur : "#3b4cca";

    const item = document.createElement("article");
    item.className = "booster-item";
    item.style.setProperty("--pc", color);

    // Visuel du booster
    const pack = document.createElement("div");
    pack.className = "nsi-pack";
    pack.setAttribute("aria-hidden", "true");

    const emoji = document.createElement("span");
    emoji.className = "nsi-pack-emoji";
    emoji.textContent = booster.emoji || "🃏";

    const packName = document.createElement("span");
    packName.className = "nsi-pack-name";
    packName.textContent = booster.nom;

    pack.append(emoji, packName);

    // Informations
    const info = document.createElement("div");
    info.className = "booster-info";

    const name = document.createElement("h3");
    name.textContent = booster.nom;

    const author = document.createElement("p");
    author.className = "community-card-author";
    author.textContent =
        `Créé par ${booster.createur || "Communauté"} · ${cardsInBooster.length} carte${cardsInBooster.length > 1 ? "s" : ""}`;

    const dots = document.createElement("div");
    dots.className = "booster-dots";

    const present = new Set(cardsInBooster.map(card => card.rar));

    for (const rarity of RARITY_ORDER) {
        const dot = document.createElement("span");
        dot.className = "booster-dot" + (present.has(rarity) ? " on" : "");
        dot.dataset.rarity = rarity;
        dot.title = RAR[rarity].l;
        dots.appendChild(dot);
    }

    const actions = document.createElement("div");
    actions.className = "booster-actions";

    const open = document.createElement("a");
    open.className = "copy-card-button";
    open.href = `${TCG_URL}#booster=${encodeURIComponent(booster.issue)}`;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.innerHTML = '<i class="fa-solid fa-box-open" aria-hidden="true"></i><span>OUVRIR LE BOOSTER</span>';

    const see = document.createElement("button");
    see.type = "button";
    see.className = "booster-see";
    see.innerHTML = '<i class="fa-solid fa-eye" aria-hidden="true"></i><span>Voir les cartes</span>';
    see.addEventListener("click", () => {
        activeBooster = booster;
        renderCards();
        document.querySelector(".cards-results").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    actions.append(open, see);
    info.append(name, author, dots, actions);
    item.append(pack, info);

    return item;
}

document.getElementById("boosterFilterClear").addEventListener("click", () => {
    activeBooster = null;
    renderCards();
});

// ============================================
// NORMALISATION DE LA RECHERCHE
// ============================================

function normalizeText(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// ============================================
// AFFICHAGE DES CARTES
// ============================================

function renderCards() {
    const search = normalizeText(searchInput.value);
    const rarity = rarityFilter.value;

    const filteredCards = decodedCards.filter(card => {
        const matchesSearch =
            normalizeText(card.nom).includes(search) ||
            normalizeText(card.desc).includes(search) ||
            normalizeText(card.createur).includes(search) ||
            normalizeText(card.id).includes(search) ||
            normalizeText(card.cid).includes(search);

        const matchesRarity =
            rarity === "all" || card.rar === rarity;

        const matchesBooster =
            !activeBooster || activeBooster.cartes.includes(card.cid);

        return matchesSearch && matchesRarity && matchesBooster;
    });

    boosterFilter.hidden = !activeBooster;

    if (activeBooster) {
        boosterFilterText.textContent =
            `${activeBooster.emoji || "🃏"} Cartes du booster « ${activeBooster.nom} »`;
    }

    grid.replaceChildren();

    cardsCount.textContent =
        `${filteredCards.length} carte${filteredCards.length > 1 ? "s" : ""} disponible${filteredCards.length > 1 ? "s" : ""}`;

    cardsEmpty.hidden = filteredCards.length !== 0;

    for (const card of filteredCards) {
        grid.appendChild(createCardItem(card));
    }
}

// ============================================
// CRÉATION D'UNE CARTE DANS LA BIBLIOTHÈQUE
// ============================================

function createCardItem(card) {
    const container = document.createElement("article");
    container.className = "community-card";

    // Aperçu de la carte
    const preview = document.createElement("div");
    preview.className = "community-card-preview";

    const visualCard = document.createElement("tcg-card");
    visualCard.card = card;

    preview.appendChild(visualCard);

    // Informations
    const info = document.createElement("div");
    info.className = "community-card-info";

    const name = document.createElement("h3");
    name.textContent = card.nom;

    const author = document.createElement("p");
    author.className = "community-card-author";
    author.textContent = `Créée par ${card.createur}`;

    // Identifiant de la carte (sélectionnable d'un clic, pour le copier)
    const idLine = document.createElement("p");
    idLine.className = "community-card-id";
    idLine.textContent = `ID : ${card.id}`;
    idLine.title = "Identifiant de la carte";

    const rarity = document.createElement("span");
    rarity.className = "community-card-rarity";
    rarity.dataset.rarity = card.rar;
    rarity.textContent = RAR[card.rar].l;

    // Bouton de copie
    const copyButton = document.createElement("button");
    copyButton.className = "copy-card-button";
    copyButton.type = "button";

    const copyIcon = document.createElement("i");
    copyIcon.className = "fa-solid fa-copy";

    const copyText = document.createElement("span");
    copyText.textContent = "COPIER LA CARTE";

    copyButton.append(copyIcon, copyText);

    copyButton.addEventListener("click", async () => {
        // Avec des attaques, on régénère le code pour qu'elles soient incluses
        await copyCard(card.atk ? await encode(card) : card.code, copyButton);
    });

    info.append(
        name,
        author,
        idLine,
        rarity,
        copyButton
    );

    container.append(preview, info);

    return container;
}

// ============================================
// COPIE DU CODE DE PARTAGE
// ============================================

async function copyCard(code, button) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(code);
        } else {
            // Solution de secours pour les navigateurs
            // qui ne prennent pas en charge Clipboard API.
            const textarea = document.createElement("textarea");

            textarea.value = code;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            const successful = document.execCommand("copy");

            textarea.remove();

            if (!successful) {
                throw new Error("Copie impossible");
            }
        }

        showToast("Carte copiée !");

        button.classList.add("copied");

        const originalText = button.querySelector("span").textContent;

        button.querySelector("span").textContent = "CARTE COPIÉE !";
        button.querySelector("i").className = "fa-solid fa-check";

        setTimeout(() => {
            button.classList.remove("copied");
            button.querySelector("span").textContent = originalText;
            button.querySelector("i").className = "fa-solid fa-copy";
        }, 1800);

    } catch (error) {
        console.error("Erreur de copie :", error);
        showToast("Impossible de copier la carte.");
    }
}

// ============================================
// NOTIFICATION
// ============================================

let toastTimeout;

function showToast(message) {
    copyToast.querySelector("span").textContent = message;

    copyToast.classList.add("visible");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        copyToast.classList.remove("visible");
    }, 2500);
}

// ============================================
// RECHERCHE ET FILTRES
// ============================================

searchInput.addEventListener("input", renderCards);
rarityFilter.addEventListener("change", renderCards);

// ============================================
// INITIALISATION
// ============================================

loadCards();
