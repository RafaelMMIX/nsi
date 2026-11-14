// ============================================
// TCG SHARE - Décodage et affichage des cartes
// ============================================

export const RAR = {
    commune: { l: "Commune", w: 60 },
    rare: { l: "Rare", w: 25 },
    epique: { l: "Épique", w: 11 },
    legendaire: { l: "Légendaire", w: 4 },
    superlegendaire: { l: "Super légendaire", w: 1.4 },
    mythique: { l: "Mythique", w: 0.45 },
    perdue: { l: "Perdue", w: 0.12 }
};

// Types (cadre coloré + icône à côté du nom)
export const TYPES = {
    neutre: { l: "Neutre", i: "" },
    feu: { l: "Feu", i: "🔥", c: "#e0502a" },
    eau: { l: "Eau", i: "💧", c: "#2a8fe0" },
    nature: { l: "Nature", i: "🌿", c: "#3aa24a" },
    ombre: { l: "Ombre", i: "🌙", c: "#5a4a8a" },
    lumiere: { l: "Lumière", i: "✨", c: "#d9b43a" }
};

// Base64 URL-safe
const b64 = (u) => {
    let s = "";

    for (let i = 0; i < u.length; i += 8192) {
        s += String.fromCharCode(...u.subarray(i, i + 8192));
    }

    return btoa(s)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
};

const unb64 = (s) => {
    s = s.replace(/-/g, "+").replace(/_/g, "/");

    while (s.length % 4) {
        s += "=";
    }

    return Uint8Array.from(atob(s), c => c.charCodeAt(0));
};

// Identifiant stable d'une carte (le même dans Booster perso
// et dans .github/scripts/ajouter-carte.mjs)
export async function cardId(card) {
    const text = JSON.stringify([
        card.nom,
        card.rar,
        String(card.desc || ""),
        card.img || "",
        card.type || "neutre"
    ]);

    const hash = new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
    );

    return [...hash.slice(0, 8)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// Compression / décompression
async function pipe(data, Constructor) {
    if (typeof Constructor === "undefined") {
        throw new Error("Compression non prise en charge par ce navigateur.");
    }

    const stream = new Blob([data])
        .stream()
        .pipeThrough(new Constructor("deflate-raw"));

    return new Uint8Array(
        await new Response(stream).arrayBuffer()
    );
}

// Génération d'un code de partage
export async function encode(card) {
    const raw = new TextEncoder().encode(
        JSON.stringify([
            card.nom,
            card.rar,
            card.desc,
            card.img
        ])
    );

    if (typeof CompressionStream === "undefined") {
        return "TCG0-" + b64(raw);
    }

    return "TCG1-" + b64(
        await pipe(raw, CompressionStream)
    );
}

// Décodage d'un code de partage
export async function decode(code) {
    if (typeof code !== "string") {
        throw new Error("Code invalide");
    }

    const match = code
        .trim()
        .replace(/\s+/g, "")
        .match(/^TCG([01])-([A-Za-z0-9_-]+)$/);

    if (!match) {
        throw new Error("Format de code invalide");
    }

    let data = unb64(match[2]);

    if (match[1] === "1") {
        data = await pipe(data, DecompressionStream);
    }

    const decoded = JSON.parse(
        new TextDecoder().decode(data)
    );

    // 4 champs, ou 5 quand la carte a un type
    if (!Array.isArray(decoded) || decoded.length < 4 || decoded.length > 5) {
        throw new Error("Données de carte invalides");
    }

    const [nom, rar, desc, img, type] = decoded;

    if (
        typeof nom !== "string" ||
        !nom.trim() ||
        !RAR[rar]
    ) {
        throw new Error("Carte invalide");
    }

    const validImage =
        typeof img === "string" &&
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]*$/.test(img);

    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        nom: nom.slice(0, 32),
        rar,
        desc: String(desc || "").slice(0, 160),
        img: validImage ? img : "",
        type: TYPES[type] ? type : "neutre",
        emoji: "🖼️"
    };
}

// ============================================
// STYLE ORIGINAL DES CARTES
// ============================================

const CARD_CSS = `
:host {
    display: inline-block;
    width: 220px;
    --c-commune: #8a90a0;
    --c-rare: #2f7fe0;
    --c-epique: #9a45e0;
    --c-legendaire: #e0a21a;
    --serif: "Cinzel", Georgia, serif;
    --sans: "Nunito", system-ui, sans-serif;
    font-family: var(--sans);
}

* {
    box-sizing: border-box;
}

.card {
    width: 100%;
    aspect-ratio: 5 / 7;
    border-radius: 14px;
    padding: 8px;
    color: #161a2a;
    position: relative;
    overflow: hidden;
    background: linear-gradient(
        145deg,
        var(--rc),
        color-mix(in srgb, var(--rc) 55%, #fff)
    );
    box-shadow: 0 6px 18px rgba(0,0,0,.25);
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.card[data-r="commune"] {
    --rc: var(--c-commune);
}

.card[data-r="rare"] {
    --rc: var(--c-rare);
}

.card[data-r="epique"] {
    --rc: var(--c-epique);
}

.card[data-r="legendaire"] {
    --rc: var(--c-legendaire);
}

.card[data-r="superlegendaire"] { --rc: #e8304f; }
.card[data-r="mythique"] { --rc: #28c7de; }
.card[data-r="perdue"] { --rc: #57e6c9; }

.card[data-t] {
    border: 3px solid var(--tc);
    box-shadow: inset 0 0 0 2px #fff8, 0 6px 18px rgba(0,0,0,.25);
}

.card[data-t] .art { border-color: var(--tc); }
.card .ty { font-size: .9rem; }

/* Super légendaire : rubis incandescent */
.card[data-r="superlegendaire"] { animation: tcg-ember 1.8s ease-in-out infinite; }
@keyframes tcg-ember {
    50% { box-shadow: 0 6px 18px rgba(0,0,0,.25), 0 0 26px 4px #e8304f99; }
}

/* Mythique : reflet holographique arc-en-ciel */
.card[data-r="mythique"]::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: overlay;
    opacity: .85;
    background: linear-gradient(115deg, #ff6ec7, #ffd86e, #6effc4, #6ec7ff, #c76eff, #ff6ec7);
    background-size: 320% 100%;
    animation: tcg-holo 4.5s linear infinite;
}
@keyframes tcg-holo { to { background-position: 320% 0; } }

/* Perdue : carte spectrale */
.card[data-r="perdue"] {
    background: radial-gradient(ellipse at 50% 115%, #1d5a4b66, transparent 60%),
        linear-gradient(150deg, #16222c, #090e16 55%, #122028);
    box-shadow: 0 6px 22px rgba(0,0,0,.5), 0 0 22px #57e6c933, inset 0 0 0 1px #57e6c966, inset 0 0 34px #57e6c91f;
    animation: tcg-ghost 4s ease-in-out infinite;
}
.card[data-r="perdue"] .rar {
    background: linear-gradient(90deg, #081210, #1d4a40, #081210);
    color: #aef7e4;
    text-shadow: 0 0 8px #57e6c9;
}
.card[data-r="perdue"] .art { border-color: #57e6c9aa; }
@keyframes tcg-ghost { 50% { filter: brightness(1.18) saturate(1.2); } }

.card .top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 6px;
    background: #fffc;
    border-radius: 8px;
    padding: 4px 8px;
}

.card .nom {
    font: 800 .88rem var(--serif);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card .art {
    flex: 0 0 46%;
    border-radius: 8px;
    background: #0003 center / cover no-repeat;
    display: grid;
    place-items: center;
    font-size: 2.6rem;
    border: 2px solid #fffa;
}

.card .rar {
    font: 700 .68rem var(--sans);
    text-align: center;
    background: #161a2a;
    color: #fff;
    border-radius: 6px;
    padding: 2px 0;
}

.card .desc {
    flex: 1;
    min-height: 0;
    background: #fffd;
    border-radius: 8px;
    padding: 6px 8px;
    font-size: .78rem;
    line-height: 1.35;
    overflow: auto;
}

.card[data-r="legendaire"]::after,
.card[data-r="epique"]::after,
.card[data-r="superlegendaire"]::after,
.card[data-r="perdue"]::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
        115deg,
        transparent 35%,
        #fff7 50%,
        transparent 65%
    );
    background-size: 250% 100%;
    animation: tcg-shine 3.2s linear infinite;
}

@keyframes tcg-shine {
    from { background-position: 150% 0; }
    to { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
    .card,
    .card::after {
        animation: none !important;
    }
}

@media (max-width: 480px) {
    :host {
        width: 100%;
        max-width: 220px;
    }
}
`;

// Construction de l'élément visuel d'une carte
function cardElement(card) {
    if (!card || !RAR[card.rar]) {
        throw new Error("Carte invalide");
    }

    const element = document.createElement("div");
    element.className = "card";
    element.dataset.r = card.rar;

    const top = document.createElement("div");
    top.className = "top";

    const name = document.createElement("span");
    name.className = "nom";
    name.textContent = card.nom || "Sans nom";

    top.append(name);

    if (card.type && TYPES[card.type] && card.type !== "neutre") {
        element.dataset.t = card.type;
        element.style.setProperty("--tc", TYPES[card.type].c);

        const icon = document.createElement("span");
        icon.className = "ty";
        icon.textContent = TYPES[card.type].i;
        icon.title = TYPES[card.type].l;

        top.append(icon);
    }

    const art = document.createElement("div");
    art.className = "art";

    if (card.img) {
        art.style.backgroundImage = `url("${card.img}")`;
    } else {
        art.textContent = card.emoji || "❔";
    }

    const rarity = document.createElement("div");
    rarity.className = "rar";
    rarity.textContent = RAR[card.rar].l;

    const description = document.createElement("div");
    description.className = "desc";
    description.textContent = card.desc || "";

    element.append(top, art, rarity, description);

    return element;
}

// ============================================
// COMPOSANT HTML <tcg-card>
// ============================================

class TcgCard extends HTMLElement {
    static get observedAttributes() {
        return ["code"];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.render();
        }
    }

    set card(value) {
        this._card = value;

        if (this.isConnected) {
            this.render();
        }
    }

    async render() {
        const root = this.shadowRoot ||
            this.attachShadow({ mode: "open" });

        root.replaceChildren();

        const style = document.createElement("style");
        style.textContent = CARD_CSS;
        root.append(style);

        try {
            const card = this._card ||
                await decode(this.getAttribute("code") || "");

            root.append(cardElement(card));
        } catch (error) {
            const message = document.createElement("p");
            message.textContent = "Impossible d'afficher cette carte.";
            message.style.cssText =
                "color:#f87171;font:14px system-ui;padding:12px;";

            root.append(message);
        }
    }
}

if (!customElements.get("tcg-card")) {
    customElements.define("tcg-card", TcgCard);
}
