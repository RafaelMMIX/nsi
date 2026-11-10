// ============================================
// CARTES COMMUNAUTAIRES - NSI HUB
// ============================================

import { decode, RAR } from "./tcg-share.js";

// ============================================
// BASE DE DONNÉES DES CARTES
// ============================================

// Pour ajouter une carte, ajoute simplement un objet ici.
//
// Propriétés :
// nom       : nom affiché dans la bibliothèque
// createur  : nom du créateur
// code      : code complet TCG1- ou TCG0-
//
// La rareté et le véritable nom de la carte
// sont récupérés automatiquement depuis son code.

const cartes = [

    /*
    {
        createur: "Rafael",
        code: "TCG1-COLLE_ICI_LE_CODE_COMPLET"
    },
    */

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

// ============================================
// DONNÉES DÉCODÉES
// ============================================

let decodedCards = [];

async function loadCards() {
    decodedCards = [];

    for (const [index, entry] of cartes.entries()) {
        try {
            const card = await decode(entry.code);

            decodedCards.push({
                ...card,
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

    renderCards();
}

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
            normalizeText(card.createur).includes(search);

        const matchesRarity =
            rarity === "all" || card.rar === rarity;

        return matchesSearch && matchesRarity;
    });

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
        await copyCard(card.code, copyButton);
    });

    info.append(
        name,
        author,
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
