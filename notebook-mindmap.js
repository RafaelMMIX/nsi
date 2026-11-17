"use strict";

/* =========================================================
   NSI HUB — CARTES MENTALES (cellules de notebook)
   Une carte est enregistrée en JSON dans le contenu de la cellule :
   { v, root: { id, text, children, ...style }, links, layout, lineStyle, theme }

   window.NsiMindMap.create(hôte, contenu, { onChange, onFocus })
   renvoie un éditeur avec la même interface que les autres cellules
   (getValue, setValue, focus, refresh…).
   ========================================================= */

(() => {
    const ICONS = ["💡", "⭐", "❓", "❗", "⚠️", "✅", "❌", "📌", "🎯", "🔑", "📚", "📝", "🧠", "🔁", "⏱️", "🐍", "🗄️", "🌐", "🔒", "🧮", "🌳", "📊", "🚀", "❤️"];
    const SHAPES = { auto: "Automatique", arrondi: "Arrondi", pilule: "Pilule", rectangle: "Rectangle", souligne: "Souligné" };
    const SIZES = { s: { label: "Petite", scale: 0.86 }, m: { label: "Normale", scale: 1 }, l: { label: "Grande", scale: 1.25 }, xl: { label: "Très grande", scale: 1.55 } };
    const LAYOUTS = {
        map: { label: "Carte (des deux côtés)", icon: "fa-solid fa-diagram-project" },
        right: { label: "Arbre vers la droite", icon: "fa-solid fa-arrow-right-long" },
        down: { label: "Organigramme (vers le bas)", icon: "fa-solid fa-sitemap" }
    };
    const LINES = { curve: "Traits courbes", straight: "Traits droits", elbow: "Traits coudés" };
    const THEMES = {
        couleurs: { label: "Couleurs", palette: ["#6366f1", "#ec4899", "#f97316", "#22c55e", "#06b6d4", "#eab308", "#8b5cf6", "#ef4444", "#14b8a6", "#84cc16"], root: "#6366f1" },
        pastel: { label: "Pastel", palette: ["#a5b4fc", "#f9a8d4", "#fdba74", "#86efac", "#67e8f9", "#fde047", "#c4b5fd", "#fca5a5"], root: "#c7d2fe" },
        sobre: { label: "Sobre", palette: ["#64748b"], root: "#334155" },
        craie: { label: "Tableau noir", palette: ["#f8fafc", "#fde68a", "#bbf7d0", "#bae6fd", "#fbcfe8", "#fed7aa"], root: "#f8fafc", board: true }
    };
    const SWATCHES = ["#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#64748b"];
    const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
    const CHALK_FONT = '"Segoe Print", "Bradley Hand", "Comic Sans MS", "Chalkboard SE", cursive';
    const BOARD_BG = "#1d3b2a";
    const MAX_HISTORY = 100;
    const MAX_NODES = 600;

    const TEMPLATES = [
        { id: "vide", label: "Carte vide", icon: "fa-regular fa-file", md: "# Sujet central" },
        {
            id: "revision", label: "Fiche de révision", icon: "fa-solid fa-graduation-cap", md: `# 📚 Notion à réviser
## Définition
- En une phrase
## Exemple
- Un exemple simple
- Un contre-exemple
## À retenir
- Propriété ou formule clé
## ⚠️ Pièges
- Erreur classique
## Exercices
- [ ] Exercice 1
- [ ] Exercice 2`
        },
        {
            id: "donnees", label: "Structures de données", icon: "fa-solid fa-layer-group", md: `# 🌳 Structures de données
## Pile
- LIFO : dernier entré, premier sorti
- empiler / dépiler
- Exemple : le bouton « retour » du navigateur
## File
- FIFO : premier entré, premier sorti
- enfiler / défiler
- Exemple : une file d'impression
## Liste chaînée
- Chaque élément pointe vers le suivant
- Ajout en tête en temps constant
## Arbre binaire
- Racine, nœuds, feuilles
- Taille et hauteur
- Parcours
  - Préfixe
  - Infixe
  - Suffixe
  - En largeur
## Arbre binaire de recherche
- Gauche < nœud < droite
- Recherche en O(hauteur)
## Graphe
- Sommets et arêtes
- Orienté ou non orienté
- Matrice ou liste d'adjacence
- Parcours en profondeur et en largeur
## Dictionnaire
- Associe une clé à une valeur
- Accès rapide par la clé`
        },
        {
            id: "bdd", label: "Bases de données", icon: "fa-solid fa-database", md: `# 🗄️ Bases de données
## Modèle relationnel
- Relation (table)
- Attribut et domaine
- Clé primaire : identifie chaque ligne
- Clé étrangère : fait référence à une autre table
## SQL
- SELECT … FROM … WHERE
- ORDER BY, DISTINCT
- JOIN … ON
- COUNT, SUM, AVG, MIN, MAX
- INSERT, UPDATE, DELETE
## Contraintes d'intégrité
- De domaine
- De relation (clé primaire)
- De référence (clé étrangère)
## SGBD
- Accès concurrents
- Sécurité et droits
- Persistance des données`
        },
        {
            id: "reseaux", label: "Réseaux", icon: "fa-solid fa-network-wired", md: `# 🌐 Réseaux
## Modèle TCP/IP
- Application : HTTP, DNS
- Transport : TCP, UDP
- Internet : IP
- Accès réseau : Ethernet, Wi-Fi
## Adressage
- Adresse IP et masque de sous-réseau
- Adresse MAC
## Routage
- Table de routage
- RIP : minimise le nombre de sauts
- OSPF : minimise le coût (lié au débit)
## Fiabilité
- Protocole du bit alterné
- Accusés de réception`
        },
        {
            id: "algo", label: "Algorithmique", icon: "fa-solid fa-calculator", md: `# 🧮 Algorithmique
## Tris
- Par sélection : O(n²)
- Par insertion : O(n²)
- Fusion : O(n log n)
## Recherche
- Séquentielle : O(n)
- Dichotomique : O(log n), tableau trié
## Méthodes
- Diviser pour régner
- Algorithme glouton
- Programmation dynamique
## Récursivité
- Cas de base
- Appel récursif
- Pile d'appels
## Preuves
- Terminaison : variant
- Correction : invariant`
        },
        {
            id: "python", label: "Python : les bases", icon: "fa-brands fa-python", md: `# 🐍 Python
## Types
- int, float, bool, str
- list, tuple, dict
## Structures de contrôle
- if / elif / else
- for … in range(…)
- while
## Fonctions
- def, paramètres, return
- Docstring et assert
## Programmation objet
- Classe et instance
- __init__ et self
- Attributs et méthodes`
        }
    ];

    /* =====================================================
       DONNÉES
       ===================================================== */

    const uid = () => Math.random().toString(36).slice(2, 10);
    const clone = value => JSON.parse(JSON.stringify(value));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

    function makeNode(text, children = [], extra = {}) {
        return Object.assign({ id: uid(), text, children }, extra);
    }

    function defaultData(title = "Sujet central") {
        return { v: 1, root: makeNode(title), links: [], layout: "map", lineStyle: "curve", theme: "couleurs" };
    }

    function walk(node, fn, parent = null, depth = 0) {
        if (fn(node, parent, depth) === false) return false;
        for (const child of node.children) if (walk(child, fn, node, depth + 1) === false) return false;
        return true;
    }

    function countNodes(node) {
        let count = 0;
        walk(node, () => { count += 1; });
        return count;
    }

    function safeLink(value) {
        let url = String(value || "").trim();
        if (!url) return null;
        if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = `https://${url}`;
        try {
            const parsed = new URL(url);
            return ["http:", "https:", "mailto:"].includes(parsed.protocol) ? parsed.href : null;
        } catch (_) {
            return null;
        }
    }

    // Reconstruit des données sûres à partir de n'importe quoi (JSON abîmé, ancienne version…)
    function normalize(raw) {
        let data = raw;
        if (typeof raw === "string") { try { data = JSON.parse(raw); } catch (_) { data = null; } }
        if (!data || typeof data !== "object" || !data.root || typeof data.root !== "object") return defaultData();
        const seen = new Set();
        let total = 0;
        const fix = (node, depth) => {
            if (!node || typeof node !== "object" || total >= MAX_NODES) return null;
            total += 1;
            const id = typeof node.id === "string" && node.id && !seen.has(node.id) ? node.id : uid();
            seen.add(id);
            const out = { id, text: typeof node.text === "string" ? node.text.slice(0, 2000) : "", children: [] };
            if (node.collapsed === true) out.collapsed = true;
            if (typeof node.color === "string" && /^#[0-9a-f]{6}$/i.test(node.color)) out.color = node.color.toLowerCase();
            if (SHAPES[node.shape] && node.shape !== "auto") out.shape = node.shape;
            if (SIZES[node.size] && node.size !== "m") out.size = node.size;
            if (node.bold === true) out.bold = true;
            if (node.italic === true) out.italic = true;
            if (typeof node.icon === "string" && node.icon && node.icon.length <= 8) out.icon = node.icon;
            if (typeof node.done === "boolean") out.done = node.done;
            if (typeof node.note === "string" && node.note.trim()) out.note = node.note.slice(0, 5000);
            if (typeof node.link === "string" && safeLink(node.link)) out.link = safeLink(node.link);
            if (depth < 40 && Array.isArray(node.children)) out.children = node.children.map(child => fix(child, depth + 1)).filter(Boolean);
            return out;
        };
        const root = fix(data.root, 0);
        const ids = new Set();
        walk(root, node => { ids.add(node.id); });
        const links = Array.isArray(data.links) ? data.links
            .filter(link => link && ids.has(link.from) && ids.has(link.to) && link.from !== link.to)
            .map(link => ({ id: typeof link.id === "string" && link.id ? link.id : uid(), from: link.from, to: link.to, label: typeof link.label === "string" ? link.label.slice(0, 200) : "" }))
            : [];
        return {
            v: 1,
            root,
            links,
            layout: LAYOUTS[data.layout] ? data.layout : "map",
            lineStyle: LINES[data.lineStyle] ? data.lineStyle : "curve",
            theme: THEMES[data.theme] ? data.theme : "couleurs"
        };
    }

    /* ---------- Conversion texte <-> carte ---------- */

    function nodeLabel(node) {
        return `${node.icon ? `${node.icon} ` : ""}${node.text.replace(/\s*\n\s*/g, " ").trim() || "…"}`;
    }

    function branchToMarkdown(node, depth = 0, lines = []) {
        node.children.forEach(child => {
            const box = typeof child.done === "boolean" ? (child.done ? "[x] " : "[ ] ") : "";
            lines.push(`${"  ".repeat(depth)}- ${box}${nodeLabel(child)}`);
            if (child.note) lines.push(`${"  ".repeat(depth + 1)}> ${child.note.replace(/\s*\n\s*/g, " ")}`);
            if (child.link) lines.push(`${"  ".repeat(depth + 1)}> ${child.link}`);
            branchToMarkdown(child, depth + 1, lines);
        });
        return lines;
    }

    function toMarkdown(raw) {
        const data = normalize(raw);
        const lines = [`# ${nodeLabel(data.root)}`];
        if (data.root.note) lines.push(`> ${data.root.note.replace(/\s*\n\s*/g, " ")}`);
        lines.push("");
        branchToMarkdown(data.root, 0, lines);
        if (data.links.length) {
            const names = new Map();
            walk(data.root, node => { names.set(node.id, nodeLabel(node)); });
            lines.push("", "Relations :");
            data.links.forEach(link => lines.push(`- ${names.get(link.from)} → ${names.get(link.to)}${link.label ? ` (${link.label})` : ""}`));
        }
        return `${lines.join("\n").trim()}\n`;
    }

    // Plan Markdown ou texte indenté -> carte
    function fromText(text, title = "Sujet central") {
        const rawLines = String(text || "").replace(/\t/g, "    ").split(/\r?\n/);
        const indents = rawLines.filter(line => line.trim()).map(line => line.match(/^ */)[0].length).filter(n => n > 0);
        const unit = indents.length ? Math.max(1, Math.min(...indents)) : 2;
        const items = [];
        let headingLevel = 0;
        let inCode = false;

        for (const line of rawLines) {
            const trimmed = line.trim();
            if (/^(```|~~~)/.test(trimmed)) { inCode = !inCode; continue; }
            if (!trimmed || inCode || /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed) || /^relations\s*:$/i.test(trimmed)) continue;
            if (items.length >= MAX_NODES) break;
            const indent = Math.floor(line.match(/^ */)[0].length / unit);
            let match = trimmed.match(/^(#{1,6})\s+(.*)$/);
            if (match) {
                headingLevel = match[1].length;
                items.push({ level: headingLevel - 1, text: match[2] });
                continue;
            }
            match = trimmed.match(/^>\s?(.*)$/);
            if (match) {
                const last = items[items.length - 1];
                if (last && match[1].trim()) {
                    if (/^https?:\/\/\S+$/.test(match[1].trim()) && !last.link) last.link = match[1].trim();
                    else last.note = last.note ? `${last.note}\n${match[1]}` : match[1];
                }
                continue;
            }
            const bullet = trimmed.match(/^(?:[-*+•]|\d+[.)])\s+(.*)$/);
            let content = bullet ? bullet[1] : trimmed;
            let done;
            const box = content.match(/^\[( |x|X)\]\s*(.*)$/);
            if (box) { done = box[1] !== " "; content = box[2]; }
            items.push({ level: headingLevel + indent, text: content, done });
        }

        const data = defaultData(title);
        if (!items.length) return data;
        const clean = value => value
            .replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1")
            .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1$2")
            .trim();
        const build = item => {
            let label = clean(item.text) || "…";
            const node = makeNode("");
            const icon = ICONS.find(i => label.startsWith(`${i} `));
            if (icon) { node.icon = icon; label = label.slice(icon.length).trim(); }
            node.text = label.slice(0, 2000);
            if (typeof item.done === "boolean") node.done = item.done;
            if (item.note) node.note = item.note.slice(0, 5000);
            if (item.link && safeLink(item.link)) node.link = safeLink(item.link);
            return node;
        };

        const minLevel = Math.min(...items.map(item => item.level));
        const tops = items.filter(item => item.level === minLevel).length;
        let rest = items;
        let baseLevel = minLevel - 1;
        if (tops === 1 && items[0].level === minLevel) {
            data.root = build(items[0]);
            rest = items.slice(1);
            baseLevel = minLevel;
        }
        const stack = [{ level: baseLevel, node: data.root }];
        rest.forEach(item => {
            const node = build(item);
            while (stack.length > 1 && stack[stack.length - 1].level >= item.level) stack.pop();
            stack[stack.length - 1].node.children.push(node);
            stack.push({ level: item.level, node });
        });
        return data;
    }

    /* ---------- Couleurs ---------- */

    function luminance(hex) {
        const value = hex.replace("#", "");
        const channels = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16) / 255)
            .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }

    function readableOn(hex) {
        if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#ffffff";
        const l = luminance(hex);
        const white = 1.05 / (l + 0.05);
        const dark = (l + 0.05) / (luminance("#0f172a") + 0.05);
        return white >= dark ? "#ffffff" : "#0f172a";
    }

    /* ---------- Texte ---------- */

    const measureCanvas = document.createElement("canvas").getContext("2d");

    function wrapLines(text, font, maxWidth) {
        measureCanvas.font = font;
        const lines = [];
        String(text).split("\n").forEach(paragraph => {
            const words = paragraph.split(/(\s+)/);
            let current = "";
            words.forEach(word => {
                const attempt = current + word;
                if (measureCanvas.measureText(attempt).width <= maxWidth || !current.trim()) {
                    current = attempt;
                } else {
                    lines.push(current.trimEnd());
                    current = word.trimStart();
                }
                // Mot plus long que la largeur : coupe au caractère
                while (measureCanvas.measureText(current).width > maxWidth && current.length > 1) {
                    let cut = current.length - 1;
                    while (cut > 1 && measureCanvas.measureText(current.slice(0, cut)).width > maxWidth) cut -= 1;
                    lines.push(current.slice(0, cut));
                    current = current.slice(cut);
                }
            });
            lines.push(current.trimEnd());
        });
        return lines.length ? lines : [""];
    }

    function inlineHTML(text) {
        if (!text.trim()) return '<span class="mm-empty">…</span>';
        return escapeHTML(text).replace(/`([^`\n]+)`/g, "<code>$1</code>");
    }

    function downloadBlob(filename, blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    const fileName = text => (String(text || "").replace(/[<>:"/\\|?*\x00-\x1F]/g, "-").replace(/\s+/g, " ").trim().slice(0, 60) || "carte-mentale");

    /* =====================================================
       ÉDITEUR
       ===================================================== */

    let instances = 0;
    let clipboard = null; // { node, text } : dernière branche copiée (toutes les cartes de la page)

    function create(host, content, options = {}) {
        const instance = ++instances;
        const onChange = options.onChange || (() => {});
        const onFocus = options.onFocus || (() => {});
        const coarse = window.matchMedia("(pointer: coarse)").matches;

        let data = normalize(content);
        let selected = null;          // id de l'idée sélectionnée
        let selectedLink = null;      // id de la relation sélectionnée
        let undoStack = [];
        let redoStack = [];
        let zoom = 1;
        let pan = { x: 0, y: 0 };
        let fitted = false;
        let dirty = true;
        let boxes = new Map();        // id -> position et style calculés au dernier rendu
        let parents = new Map();      // id -> parent
        let editing = null;           // { id | linkId, textarea, isNew }
        let linking = null;           // id de départ d'une relation en cours de création
        let revision = false;
        let revealed = new Set();
        let search = { open: false, query: "", matches: [], index: -1 };
        let panelMode = null;         // "note" | "import"
        let fullscreen = false;

        /* ---------- Structure HTML ---------- */

        const root = document.createElement("div");
        root.className = "mm";
        root.innerHTML = `
            <div class="mm-toolbar" role="toolbar" aria-label="Outils de la carte mentale">
                <div class="mm-group">
                    <button type="button" class="mm-btn" data-mm="child" title="Ajouter une idée (Tab)"><i class="fa-solid fa-plus"></i><span>Idée</span></button>
                    <button type="button" class="mm-btn" data-mm="sibling" title="Ajouter une idée sœur (Entrée)"><i class="fa-solid fa-grip-lines"></i><span>Sœur</span></button>
                    <button type="button" class="mm-btn" data-mm="link" title="Relier deux idées par une flèche"><i class="fa-solid fa-share-nodes"></i><span>Relier</span></button>
                    <button type="button" class="mm-btn icon" data-mm="delete" title="Supprimer (Suppr)" aria-label="Supprimer"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="mm-group">
                    <button type="button" class="mm-btn icon" data-mm="undo" title="Annuler (Ctrl+Z)" aria-label="Annuler"><i class="fa-solid fa-rotate-left"></i></button>
                    <button type="button" class="mm-btn icon" data-mm="redo" title="Rétablir (Ctrl+Y)" aria-label="Rétablir"><i class="fa-solid fa-rotate-right"></i></button>
                </div>
                <div class="mm-group">
                    <details class="nb-menu mm-menu">
                        <summary class="mm-btn" title="Disposition, traits et thème"><i class="fa-solid fa-palette"></i><span>Apparence</span></summary>
                        <div class="nb-menu-list mm-menu-list">
                            <p class="mm-menu-title">Disposition</p>
                            ${Object.entries(LAYOUTS).map(([id, layout]) => `<button type="button" data-layout="${id}"><i class="${layout.icon}"></i> ${layout.label}</button>`).join("")}
                            <p class="mm-menu-title">Traits</p>
                            ${Object.entries(LINES).map(([id, label]) => `<button type="button" data-line="${id}"><i class="fa-solid fa-bezier-curve"></i> ${label}</button>`).join("")}
                            <p class="mm-menu-title">Thème</p>
                            ${Object.entries(THEMES).map(([id, theme]) => `<button type="button" data-theme="${id}"><span class="mm-theme-dots">${theme.palette.slice(0, 4).map(c => `<i style="background:${c}"></i>`).join("")}</span> ${theme.label}</button>`).join("")}
                        </div>
                    </details>
                    <details class="nb-menu mm-menu">
                        <summary class="mm-btn" title="Affichage des branches"><i class="fa-solid fa-eye"></i><span>Affichage</span></summary>
                        <div class="nb-menu-list mm-menu-list">
                            <button type="button" data-mm="expand-all"><i class="fa-solid fa-up-right-and-down-left-from-center"></i> Tout développer</button>
                            <button type="button" data-mm="collapse-all"><i class="fa-solid fa-down-left-and-up-right-to-center"></i> Tout réduire (garder le 1er niveau)</button>
                            <button type="button" data-mm="revision"><i class="fa-solid fa-graduation-cap"></i> Mode révision</button>
                            <button type="button" data-mm="search"><i class="fa-solid fa-magnifying-glass"></i> Rechercher (Ctrl+F)</button>
                        </div>
                    </details>
                    <details class="nb-menu mm-menu">
                        <summary class="mm-btn" title="Modèles et import"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Modèles</span></summary>
                        <div class="nb-menu-list mm-menu-list">
                            <p class="mm-menu-title">Partir d'un modèle</p>
                            ${TEMPLATES.map(t => `<button type="button" data-template="${t.id}"><i class="${t.icon}"></i> ${t.label}</button>`).join("")}
                            <p class="mm-menu-title">Importer</p>
                            <button type="button" data-mm="import-text"><i class="fa-solid fa-list-ul"></i> Coller un plan (liste, Markdown)</button>
                            <button type="button" data-mm="import-file"><i class="fa-solid fa-file-import"></i> Ouvrir un fichier (.json, .md, .txt)</button>
                        </div>
                    </details>
                    <details class="nb-menu mm-menu">
                        <summary class="mm-btn" title="Exporter la carte"><i class="fa-solid fa-download"></i><span>Exporter</span></summary>
                        <div class="nb-menu-list mm-menu-list">
                            <button type="button" data-export="png"><i class="fa-regular fa-image"></i> Image (.png)</button>
                            <button type="button" data-export="svg"><i class="fa-solid fa-bezier-curve"></i> Image vectorielle (.svg)</button>
                            <button type="button" data-export="md"><i class="fa-brands fa-markdown"></i> Plan (.md)</button>
                            <button type="button" data-export="json"><i class="fa-solid fa-file-code"></i> Carte NSI Hub (.json)</button>
                            <button type="button" data-export="copy"><i class="fa-regular fa-copy"></i> Copier le plan</button>
                        </div>
                    </details>
                </div>
                <div class="mm-group mm-group-end">
                    <button type="button" class="mm-btn icon" data-mm="zoom-out" title="Dézoomer" aria-label="Dézoomer"><i class="fa-solid fa-minus"></i></button>
                    <button type="button" class="mm-btn mm-zoom" data-mm="zoom-reset" title="Zoom à 100 %">100 %</button>
                    <button type="button" class="mm-btn icon" data-mm="zoom-in" title="Zoomer" aria-label="Zoomer"><i class="fa-solid fa-plus"></i></button>
                    <button type="button" class="mm-btn icon" data-mm="fit" title="Recentrer (Origine)" aria-label="Recentrer"><i class="fa-solid fa-crosshairs"></i></button>
                    <button type="button" class="mm-btn icon" data-mm="fullscreen" title="Plein écran" aria-label="Plein écran"><i class="fa-solid fa-expand"></i></button>
                    <details class="nb-menu mm-menu mm-menu-right">
                        <summary class="mm-btn icon" title="Raccourcis clavier" aria-label="Raccourcis clavier"><i class="fa-solid fa-keyboard"></i></summary>
                        <div class="nb-menu-list mm-menu-list mm-shortcuts">
                            <p><kbd>Tab</kbd> Ajouter une idée</p>
                            <p><kbd>Entrée</kbd> Idée sœur (<kbd>Maj</kbd> : au-dessus)</p>
                            <p><kbd>Espace</kbd> / <kbd>F2</kbd> / double-clic : modifier</p>
                            <p>Taper une lettre : remplacer le texte</p>
                            <p><kbd>Maj</kbd> + <kbd>Entrée</kbd> pendant l'écriture : retour à la ligne</p>
                            <p><kbd>Suppr</kbd> Supprimer</p>
                            <p><kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> Se déplacer</p>
                            <p><kbd>Alt</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> Changer l'ordre</p>
                            <p><kbd>/</kbd> Réduire / développer</p>
                            <p><kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>X</kbd> / <kbd>V</kbd> Copier, couper, coller</p>
                            <p><kbd>Ctrl</kbd> + <kbd>D</kbd> Dupliquer la branche</p>
                            <p><kbd>Ctrl</kbd> + <kbd>B</kbd> / <kbd>I</kbd> Gras, italique</p>
                            <p><kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Y</kbd> Annuler, rétablir</p>
                            <p><kbd>Ctrl</kbd> + molette Zoomer · glisser le fond : déplacer</p>
                            <p>Glisser une idée sur une autre pour la déplacer</p>
                        </div>
                    </details>
                </div>
            </div>

            <div class="mm-format" hidden>
                <div class="mm-group mm-swatches" role="group" aria-label="Couleur">
                    <button type="button" class="mm-swatch auto" data-color="" title="Couleur automatique" aria-label="Couleur automatique"></button>
                    ${SWATCHES.map(c => `<button type="button" class="mm-swatch" data-color="${c}" style="--c:${c}" title="${c}" aria-label="Couleur ${c}"></button>`).join("")}
                    <label class="mm-swatch custom" title="Autre couleur"><input type="color" data-field="color-custom" aria-label="Autre couleur"><i class="fa-solid fa-eye-dropper"></i></label>
                </div>
                <div class="mm-group">
                    <select class="mm-select" data-field="shape" aria-label="Forme">${Object.entries(SHAPES).map(([id, label]) => `<option value="${id}">${label}</option>`).join("")}</select>
                    <select class="mm-select" data-field="size" aria-label="Taille du texte">${Object.entries(SIZES).map(([id, size]) => `<option value="${id}">${size.label}</option>`).join("")}</select>
                    <button type="button" class="mm-btn icon" data-mm="bold" title="Gras (Ctrl+B)" aria-label="Gras"><i class="fa-solid fa-bold"></i></button>
                    <button type="button" class="mm-btn icon" data-mm="italic" title="Italique (Ctrl+I)" aria-label="Italique"><i class="fa-solid fa-italic"></i></button>
                    <details class="nb-menu mm-menu">
                        <summary class="mm-btn icon" title="Icône" aria-label="Icône"><i class="fa-regular fa-face-smile"></i></summary>
                        <div class="nb-menu-list mm-menu-list mm-icons">
                            ${ICONS.map(icon => `<button type="button" data-icon="${icon}" aria-label="Icône ${icon}">${icon}</button>`).join("")}
                            <button type="button" data-icon="" class="mm-icon-none">Aucune</button>
                        </div>
                    </details>
                    <button type="button" class="mm-btn icon" data-mm="task" title="Case à cocher" aria-label="Case à cocher"><i class="fa-regular fa-square-check"></i></button>
                    <button type="button" class="mm-btn icon" data-mm="note" title="Note et lien" aria-label="Note et lien"><i class="fa-regular fa-note-sticky"></i></button>
                </div>
                <div class="mm-group">
                    <button type="button" class="mm-btn icon" data-mm="up" title="Monter (Alt+↑)" aria-label="Monter"><i class="fa-solid fa-arrow-up"></i></button>
                    <button type="button" class="mm-btn icon" data-mm="down" title="Descendre (Alt+↓)" aria-label="Descendre"><i class="fa-solid fa-arrow-down"></i></button>
                    <button type="button" class="mm-btn icon" data-mm="duplicate" title="Dupliquer la branche (Ctrl+D)" aria-label="Dupliquer"><i class="fa-regular fa-clone"></i></button>
                    <button type="button" class="mm-btn icon" data-mm="toggle" title="Réduire / développer (/)" aria-label="Réduire ou développer"><i class="fa-solid fa-compress"></i></button>
                </div>
            </div>

            <div class="mm-linkbar" hidden>
                <span><i class="fa-solid fa-share-nodes"></i> Relation</span>
                <button type="button" class="mm-btn" data-mm="link-label"><i class="fa-solid fa-font"></i><span>Texte</span></button>
                <button type="button" class="mm-btn" data-mm="link-reverse"><i class="fa-solid fa-right-left"></i><span>Inverser</span></button>
                <button type="button" class="mm-btn" data-mm="delete"><i class="fa-solid fa-trash"></i><span>Supprimer</span></button>
            </div>

            <div class="mm-banner mm-search" hidden>
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="search" class="mm-search-input" placeholder="Rechercher une idée…" aria-label="Rechercher dans la carte">
                <span class="mm-search-count"></span>
                <button type="button" class="mm-btn icon" data-mm="search-prev" aria-label="Résultat précédent"><i class="fa-solid fa-chevron-up"></i></button>
                <button type="button" class="mm-btn icon" data-mm="search-next" aria-label="Résultat suivant"><i class="fa-solid fa-chevron-down"></i></button>
                <button type="button" class="mm-btn icon" data-mm="search-close" aria-label="Fermer la recherche"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="mm-banner mm-revision" hidden>
                <i class="fa-solid fa-graduation-cap"></i>
                <span>Mode révision : essaie de te souvenir de la suite, puis clique sur une idée pour révéler ses branches.</span>
                <button type="button" class="mm-btn" data-mm="reveal-all">Tout révéler</button>
                <button type="button" class="mm-btn" data-mm="hide-all">Tout cacher</button>
                <button type="button" class="mm-btn primary" data-mm="revision">Quitter</button>
            </div>

            <div class="mm-banner mm-linking" hidden>
                <i class="fa-solid fa-share-nodes"></i>
                <span>Clique sur l'idée à relier (Échap pour annuler).</span>
                <button type="button" class="mm-btn" data-mm="link-cancel">Annuler</button>
            </div>

            <div class="mm-viewport" tabindex="0" role="application" aria-label="Carte mentale. Tab pour ajouter une idée, Entrée pour une idée sœur, flèches pour se déplacer.">
                <div class="mm-world">
                    <svg class="mm-links" aria-hidden="true">
                        <defs>
                            <marker id="mm-arrow-${instance}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" class="mm-arrow-head"></path>
                            </marker>
                        </defs>
                        <g class="mm-branch-links"></g>
                        <g class="mm-relations"></g>
                    </svg>
                    <div class="mm-nodes"></div>
                </div>
                ${coarse ? '<p class="mm-touch-hint">Astuce : passe en plein écran <i class="fa-solid fa-expand"></i> pour déplacer la carte et les idées du doigt.</p>' : ""}
                <div class="mm-context" hidden role="menu"></div>
            </div>

            <div class="mm-panel" hidden></div>

            <div class="mm-footer">
                <span class="mm-stats"></span>
                <span class="mm-hint">Double-clic pour modifier · <kbd>Tab</kbd> nouvelle idée · <kbd>Entrée</kbd> idée sœur</span>
            </div>
            <input type="file" class="mm-file" accept=".json,.md,.markdown,.txt,application/json,text/plain,text/markdown" hidden>`;
        host.appendChild(root);

        const $ = selector => root.querySelector(selector);
        const viewport = $(".mm-viewport");
        const world = $(".mm-world");
        const svg = $(".mm-links");
        const branchLayer = $(".mm-branch-links");
        const relationLayer = $(".mm-relations");
        const nodeLayer = $(".mm-nodes");
        const formatBar = $(".mm-format");
        const linkBar = $(".mm-linkbar");
        const panel = $(".mm-panel");
        const contextMenu = $(".mm-context");

        /* ---------- Outils sur les données ---------- */

        function find(id) {
            let result = null;
            walk(data.root, (node, parent, depth) => {
                if (node.id === id) { result = { node, parent, depth }; return false; }
                return true;
            });
            return result;
        }

        const selectedInfo = () => (selected ? find(selected) : null);

        function isInside(id, ancestorId) {
            const ancestor = find(ancestorId);
            if (!ancestor) return false;
            let inside = false;
            walk(ancestor.node, node => { if (node.id === id) { inside = true; return false; } return true; });
            return inside;
        }

        function freshIds(node) {
            const copy = clone(node);
            walk(copy, item => { item.id = uid(); });
            return copy;
        }

        function emit() {
            onChange();
        }

        function pushHistory() {
            undoStack.push(JSON.stringify(data));
            if (undoStack.length > MAX_HISTORY) undoStack.shift();
            redoStack = [];
        }

        // Toute modification passe par ici (historique + rendu + enregistrement)
        function change(fn, { history = true } = {}) {
            if (history) pushHistory();
            fn();
            render();
            emit();
        }

        function restore(snapshot) {
            data = normalize(snapshot);
            if (selected && !find(selected)) selected = null;
            if (selectedLink && !data.links.some(l => l.id === selectedLink)) selectedLink = null;
            render();
            emit();
        }

        function undo() {
            finishEdit();
            if (!undoStack.length) return;
            redoStack.push(JSON.stringify(data));
            restore(undoStack.pop());
        }

        function redo() {
            finishEdit();
            if (!redoStack.length) return;
            undoStack.push(JSON.stringify(data));
            restore(redoStack.pop());
        }

        function visibleChildren(node) {
            if (revision) return revealed.has(node.id) ? node.children : [];
            return node.collapsed ? [] : node.children;
        }

        function expandTo(id) {
            let changed = false;
            let parent = find(id)?.parent;
            while (parent) {
                if (parent.collapsed) { delete parent.collapsed; changed = true; }
                if (revision) revealed.add(parent.id);
                parent = find(parent.id)?.parent;
            }
            return changed;
        }

        /* ---------- Couleurs du site ---------- */

        function siteColors() {
            const styles = getComputedStyle(root);
            const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
            return {
                surface: read("--surface", "#111827"),
                surfaceLight: read("--surface-light", "#182235"),
                text: read("--text", "#f8fafc"),
                muted: read("--text-secondary", "#94a3b8")
            };
        }

        function nodeStyle(node, depth, color, colors) {
            const theme = THEMES[data.theme];
            const scale = SIZES[node.size || "m"].scale;
            let shape = node.shape || (depth === 0 ? "pilule" : theme.board && depth >= 2 ? "souligne" : "arrondi");
            let fill;
            let stroke = color;
            let text;
            let strokeWidth;
            if (theme.board) {
                fill = "transparent";
                text = color;
                strokeWidth = depth <= 1 ? 2.2 : 1.6;
            } else if (depth <= 1) {
                fill = color;
                text = readableOn(color);
                strokeWidth = 0;
            } else {
                fill = colors.surfaceLight;
                text = colors.text;
                strokeWidth = 1.6;
            }
            if (shape === "souligne") {
                fill = "transparent";
                if (!theme.board) text = colors.text;
                strokeWidth = depth <= 1 ? 3 : 2.2;
            }
            const base = depth === 0 ? 19 : depth === 1 ? 15.5 : 14;
            const padding = shape === "souligne" ? [4, 4] : depth === 0 ? [12, 22] : depth === 1 ? [8, 15] : [6, 11];
            return {
                shape,
                fill,
                stroke,
                text,
                strokeWidth,
                radius: { arrondi: depth === 0 ? 14 : 9, pilule: 999, rectangle: 3, souligne: 0 }[shape],
                fontSize: Math.round(base * scale * 10) / 10,
                fontWeight: node.bold ? 700 : depth === 0 ? 700 : depth === 1 ? 600 : 500,
                fontStyle: node.italic ? "italic" : "normal",
                fontFamily: theme.board ? CHALK_FONT : FONT,
                padding,
                maxWidth: Math.round((depth === 0 ? 300 : 240) * Math.max(1, scale))
            };
        }

        function taskProgress(node) {
            let total = 0;
            let done = 0;
            node.children.forEach(child => walk(child, item => {
                if (typeof item.done === "boolean") { total += 1; if (item.done) done += 1; }
            }));
            return total ? { total, done } : null;
        }

        /* ---------- Rendu ---------- */

        function render() {
            if (!root.isConnected || !viewport.clientWidth) { dirty = true; return; }
            dirty = false;
            const theme = THEMES[data.theme];
            const colors = siteColors();
            root.classList.toggle("mm-board", !!theme.board);
            root.classList.toggle("mm-revising", revision);
            root.classList.toggle("mm-is-linking", !!linking);

            // 1. Idées visibles, avec leur couleur de branche
            const items = [];
            parents = new Map();
            const visit = (node, parent, depth, inherited, index) => {
                let color;
                if (depth === 0) color = node.color || theme.root;
                else if (depth === 1) color = node.color || theme.palette[index % theme.palette.length];
                else color = node.color || inherited;
                items.push({ node, parent, depth, color, style: nodeStyle(node, depth, color, colors) });
                if (parent) parents.set(node.id, parent);
                visibleChildren(node).forEach((child, i) => visit(child, node, depth + 1, color, i));
            };
            visit(data.root, null, 0, theme.root, 0);

            // 2. Création des éléments, puis mesure de leur taille
            const matches = new Set(search.matches);
            nodeLayer.innerHTML = "";
            const elements = new Map();
            items.forEach(item => {
                const { node, style, depth } = item;
                const element = document.createElement("div");
                element.className = `mm-node depth-${Math.min(depth, 3)} shape-${style.shape}`;
                if (node.id === selected) element.classList.add("selected");
                if (matches.has(node.id)) element.classList.add("match");
                if (search.matches[search.index] === node.id) element.classList.add("current-match");
                if (node.done === true) element.classList.add("done");
                if (linking === node.id) element.classList.add("link-source");
                element.dataset.id = node.id;
                element.style.cssText = [
                    `font: ${style.fontStyle} ${style.fontWeight} ${style.fontSize}px/1.35 ${style.fontFamily}`,
                    `padding: ${style.padding[0]}px ${style.padding[1]}px`,
                    `max-width: ${style.maxWidth}px`,
                    `color: ${style.text}`,
                    `background: ${style.fill}`,
                    `border-radius: ${style.radius}px`,
                    style.shape === "souligne"
                        ? `border: 0; border-bottom: ${style.strokeWidth}px solid ${style.stroke}`
                        : `border: ${style.strokeWidth}px solid ${style.strokeWidth ? style.stroke : "transparent"}`,
                    `--mm-color: ${item.color}`
                ].join(";");
                const progress = taskProgress(node);
                element.innerHTML = [
                    typeof node.done === "boolean" ? `<button type="button" class="mm-check" aria-label="${node.done ? "Décocher" : "Cocher"}" aria-pressed="${node.done}">${node.done ? '<i class="fa-solid fa-square-check"></i>' : '<i class="fa-regular fa-square"></i>'}</button>` : "",
                    node.icon ? `<span class="mm-icon">${escapeHTML(node.icon)}</span>` : "",
                    `<span class="mm-text">${inlineHTML(node.text)}</span>`,
                    progress ? `<span class="mm-progress" title="Cases cochées dans cette branche">${progress.done}/${progress.total}</span>` : "",
                    node.note ? `<span class="mm-badge" title="${escapeHTML(node.note)}"><i class="fa-regular fa-note-sticky"></i></span>` : "",
                    node.link ? `<a class="mm-badge mm-link" href="${escapeHTML(node.link)}" target="_blank" rel="noopener noreferrer" title="Ouvrir ${escapeHTML(node.link)}"><i class="fa-solid fa-link"></i></a>` : ""
                ].join("");
                nodeLayer.appendChild(element);
                elements.set(node.id, element);
            });
            const sizes = new Map();
            elements.forEach((element, id) => sizes.set(id, { w: element.offsetWidth, h: element.offsetHeight }));

            // 3. Positions
            const layout = computeLayout(sizes);
            boxes = new Map();
            items.forEach(item => {
                const box = Object.assign(layout.get(item.node.id), { node: item.node, depth: item.depth, color: item.color, style: item.style });
                boxes.set(item.node.id, box);
                const element = elements.get(item.node.id);
                element.style.left = `${box.left}px`;
                element.style.top = `${box.top}px`;
            });

            // 4. Boutons réduire / développer
            items.forEach(item => {
                const { node } = item;
                if (!node.children.length) return;
                const box = boxes.get(node.id);
                const hidden = !visibleChildren(node).length;
                const toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = `mm-toggle${hidden ? " collapsed" : ""}`;
                toggle.dataset.toggle = node.id;
                toggle.style.setProperty("--mm-color", item.color);
                const count = countNodes(node) - 1;
                toggle.textContent = hidden ? (revision ? "?" : String(count)) : "−";
                toggle.title = hidden ? (revision ? "Révéler" : `Développer (${count} idée${count > 1 ? "s" : ""})`) : "Réduire";
                toggle.setAttribute("aria-label", toggle.title);
                const anchor = edgeAnchor(box, 1);
                toggle.style.left = `${anchor.x}px`;
                toggle.style.top = `${anchor.y}px`;
                nodeLayer.appendChild(toggle);
            });

            // 5. Traits entre les idées
            let paths = "";
            items.forEach(item => {
                if (!item.parent) return;
                const parentBox = boxes.get(item.parent.id);
                const box = boxes.get(item.node.id);
                const width = item.depth === 1 ? 3 : item.depth === 2 ? 2.2 : 1.7;
                paths += `<path d="${branchPath(parentBox, box)}" stroke="${item.color}" stroke-width="${width}" fill="none" stroke-linecap="round"${theme.board ? ' stroke-opacity="0.85"' : ""}></path>`;
            });
            branchLayer.innerHTML = paths;

            // 6. Relations
            let relations = "";
            const relationColor = theme.board ? "#f8fafc" : colors.muted;
            svg.querySelector(".mm-arrow-head").setAttribute("fill", relationColor);
            data.links.forEach(link => {
                const a = boxes.get(link.from);
                const b = boxes.get(link.to);
                if (!a || !b) return;
                const geometry = relationGeometry(a, b);
                const active = link.id === selectedLink;
                relations += `<path d="${geometry.d}" class="mm-relation${active ? " selected" : ""}" stroke="${active ? "#6366f1" : relationColor}" stroke-width="${active ? 2.4 : 1.8}" stroke-dasharray="6 5" fill="none" marker-end="url(#mm-arrow-${instance})"></path>`;
                relations += `<path d="${geometry.d}" class="mm-relation-hit" data-link="${link.id}" stroke="transparent" stroke-width="16" fill="none"></path>`;
                if (link.label || active) {
                    const label = document.createElement("div");
                    label.className = `mm-relation-label${active ? " selected" : ""}${link.label ? "" : " empty"}`;
                    label.dataset.link = link.id;
                    label.textContent = link.label || "Double-clic : texte";
                    label.style.left = `${geometry.mid.x}px`;
                    label.style.top = `${geometry.mid.y}px`;
                    nodeLayer.appendChild(label);
                }
            });
            relationLayer.innerHTML = relations;

            // 7. Taille de la zone SVG
            const bounds = contentBounds(40);
            svg.setAttribute("viewBox", `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`);
            Object.assign(svg.style, { left: `${bounds.minX}px`, top: `${bounds.minY}px`, width: `${bounds.width}px`, height: `${bounds.height}px` });

            if (editing) positionEditor();
            applyTransform();
            updateChrome();
        }

        function computeLayout(sizes) {
            const result = new Map();
            const H_GAP = depth => (depth === 0 ? 58 : 36);
            const V_GAP = depth => (depth === 0 ? 22 : 12);
            const kids = node => visibleChildren(node);
            const size = node => sizes.get(node.id);

            if (data.layout === "down") {
                // Organigramme : les grandes branches côte à côte, la suite en listes indentées
                const GAP_X = 26;
                const INDENT = 24;
                const LIST_GAP = 8;
                const widths = new Map();
                const heights = new Map();
                const measureList = node => {
                    const { w, h } = size(node);
                    let width = w;
                    let height = h;
                    kids(node).forEach(child => {
                        measureList(child);
                        height += LIST_GAP + heights.get(child.id);
                        width = Math.max(width, INDENT + widths.get(child.id));
                    });
                    widths.set(node.id, width);
                    heights.set(node.id, height);
                };
                const placeList = (node, left, top) => {
                    const { w, h } = size(node);
                    result.set(node.id, { left, top, w, h, side: 0 });
                    let y = top + h + LIST_GAP;
                    kids(node).forEach(child => {
                        placeList(child, left + INDENT, y);
                        y += heights.get(child.id) + LIST_GAP;
                    });
                };
                const rootSize = size(data.root);
                const rootBox = { left: -rootSize.w / 2, top: -rootSize.h / 2, w: rootSize.w, h: rootSize.h, side: 0 };
                result.set(data.root.id, rootBox);
                const branches = kids(data.root);
                branches.forEach(measureList);
                const total = branches.reduce((sum, child, i) => sum + widths.get(child.id) + (i ? GAP_X : 0), 0);
                let x = -total / 2;
                branches.forEach(child => {
                    placeList(child, x, rootBox.top + rootSize.h + 56);
                    x += widths.get(child.id) + GAP_X;
                });
                return result;
            }

            const heights = new Map();
            const measure = (node, depth) => {
                const children = kids(node);
                const total = children.reduce((sum, child, i) => sum + measure(child, depth + 1) + (i ? V_GAP(depth) : 0), 0);
                const height = Math.max(size(node).h, total);
                heights.set(node.id, height);
                return height;
            };
            const place = (node, depth, anchorX, top, side) => {
                const { w, h } = size(node);
                const height = heights.get(node.id);
                const left = side > 0 ? anchorX : anchorX - w;
                result.set(node.id, { left, top: top + (height - h) / 2, w, h, side });
                const children = kids(node);
                const total = children.reduce((sum, child, i) => sum + heights.get(child.id) + (i ? V_GAP(depth) : 0), 0);
                let y = top + (height - total) / 2;
                const childAnchor = side > 0 ? left + w + H_GAP(depth) : left - H_GAP(depth);
                children.forEach(child => {
                    place(child, depth + 1, childAnchor, y, side);
                    y += heights.get(child.id) + V_GAP(depth);
                });
            };

            const rootSize = size(data.root);
            if (data.layout === "right") {
                measure(data.root, 0);
                place(data.root, 0, 0, -heights.get(data.root.id) / 2, 1);
                return result;
            }

            // Carte : les branches sont réparties à droite puis à gauche, en équilibrant les hauteurs
            const children = kids(data.root);
            children.forEach(child => measure(child, 1));
            const blockHeight = list => list.reduce((sum, child, i) => sum + heights.get(child.id) + (i ? V_GAP(0) : 0), 0);
            let split = children.length;
            if (children.length > 1) {
                let best = Infinity;
                for (let k = Math.ceil(children.length / 2) - 1; k <= children.length; k++) {
                    if (k < 1) continue;
                    const diff = Math.abs(blockHeight(children.slice(0, k)) - blockHeight(children.slice(k)));
                    if (diff < best) { best = diff; split = k; }
                }
            }
            const rootLeft = -rootSize.w / 2;
            result.set(data.root.id, { left: rootLeft, top: -rootSize.h / 2, w: rootSize.w, h: rootSize.h, side: 0 });
            const placeSide = (list, side) => {
                let y = -blockHeight(list) / 2;
                const anchor = side > 0 ? rootLeft + rootSize.w + H_GAP(0) : rootLeft - H_GAP(0);
                list.forEach(child => {
                    place(child, 1, anchor, y, side);
                    y += heights.get(child.id) + V_GAP(0);
                });
            };
            placeSide(children.slice(0, split), 1);
            placeSide(children.slice(split), -1);
            return result;
        }

        // Point de sortie des traits vers les enfants (côté 1) ou d'arrivée depuis le parent (côté -1)
        function edgeAnchor(box, direction) {
            const underline = box.style.shape === "souligne";
            if (data.layout === "down") {
                if (direction > 0) return box.depth >= 1 ? { x: box.left + 12, y: box.top + box.h } : { x: box.left + box.w / 2, y: box.top + box.h };
                return { x: box.left + box.w / 2, y: box.top };
            }
            let side = box.side || 1;
            if (box.depth === 0 && data.layout === "map") side = 1;
            const y = underline ? box.top + box.h : box.top + box.h / 2;
            if (direction > 0) return { x: side > 0 ? box.left + box.w : box.left, y };
            return { x: side > 0 ? box.left : box.left + box.w, y };
        }

        function branchPath(parentBox, box) {
            let start;
            if (data.layout === "down") start = edgeAnchor(parentBox, 1);
            else {
                const underline = parentBox.style.shape === "souligne";
                const y = underline ? parentBox.top + parentBox.h : parentBox.top + parentBox.h / 2;
                start = { x: box.side > 0 ? parentBox.left + parentBox.w : parentBox.left, y };
            }
            const r = n => Math.round(n * 10) / 10;
            if (data.layout === "down" && parentBox.depth >= 1) {
                // Liste indentée : trait vertical puis horizontal
                const sx = parentBox.left + 12;
                const sy = parentBox.top + parentBox.h;
                const ex = box.left;
                const ey = box.style.shape === "souligne" ? box.top + box.h : box.top + box.h / 2;
                if (data.lineStyle === "straight") return `M ${r(sx)} ${r(sy)} L ${r(ex)} ${r(ey)}`;
                if (data.lineStyle === "elbow") return `M ${r(sx)} ${r(sy)} V ${r(ey)} H ${r(ex)}`;
                const radius = Math.min(10, ey - sy, ex - sx);
                return `M ${r(sx)} ${r(sy)} V ${r(ey - radius)} Q ${r(sx)} ${r(ey)} ${r(sx + radius)} ${r(ey)} H ${r(ex)}`;
            }
            const end = edgeAnchor(box, -1);
            if (data.lineStyle === "straight") return `M ${r(start.x)} ${r(start.y)} L ${r(end.x)} ${r(end.y)}`;
            if (data.layout === "down") {
                const midY = start.y + (end.y - start.y) / 2;
                if (data.lineStyle === "elbow") return `M ${r(start.x)} ${r(start.y)} V ${r(midY)} H ${r(end.x)} V ${r(end.y)}`;
                return `M ${r(start.x)} ${r(start.y)} C ${r(start.x)} ${r(midY)}, ${r(end.x)} ${r(midY)}, ${r(end.x)} ${r(end.y)}`;
            }
            const midX = start.x + (end.x - start.x) / 2;
            if (data.lineStyle === "elbow") return `M ${r(start.x)} ${r(start.y)} H ${r(midX)} V ${r(end.y)} H ${r(end.x)}`;
            return `M ${r(start.x)} ${r(start.y)} C ${r(midX)} ${r(start.y)}, ${r(midX)} ${r(end.y)}, ${r(end.x)} ${r(end.y)}`;
        }

        function relationGeometry(a, b) {
            const center = box => ({ x: box.left + box.w / 2, y: box.top + box.h / 2 });
            const ca = center(a);
            const cb = center(b);
            const edge = (box, from, to) => {
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                if (!dx && !dy) return from;
                const t = Math.min(dx ? (box.w / 2 + 4) / Math.abs(dx) : Infinity, dy ? (box.h / 2 + 4) / Math.abs(dy) : Infinity);
                return { x: from.x + dx * t, y: from.y + dy * t };
            };
            const p0 = edge(a, ca, cb);
            const p2 = edge(b, cb, ca);
            const dist = Math.hypot(p2.x - p0.x, p2.y - p0.y) || 1;
            const bend = Math.min(90, dist * 0.3);
            const control = { x: (p0.x + p2.x) / 2 - ((p2.y - p0.y) / dist) * bend, y: (p0.y + p2.y) / 2 + ((p2.x - p0.x) / dist) * bend };
            const mid = { x: 0.25 * p0.x + 0.5 * control.x + 0.25 * p2.x, y: 0.25 * p0.y + 0.5 * control.y + 0.25 * p2.y };
            const r = n => Math.round(n * 10) / 10;
            return { d: `M ${r(p0.x)} ${r(p0.y)} Q ${r(control.x)} ${r(control.y)} ${r(p2.x)} ${r(p2.y)}`, mid, control, p0, p2 };
        }

        function contentBounds(margin = 0) {
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;
            boxes.forEach(box => {
                minX = Math.min(minX, box.left);
                minY = Math.min(minY, box.top);
                maxX = Math.max(maxX, box.left + box.w);
                maxY = Math.max(maxY, box.top + box.h);
            });
            data.links.forEach(link => {
                const a = boxes.get(link.from);
                const b = boxes.get(link.to);
                if (!a || !b) return;
                const { control } = relationGeometry(a, b);
                minX = Math.min(minX, control.x);
                minY = Math.min(minY, control.y);
                maxX = Math.max(maxX, control.x);
                maxY = Math.max(maxY, control.y);
            });
            if (!Number.isFinite(minX)) { minX = 0; minY = 0; maxX = 1; maxY = 1; }
            return { minX: minX - margin, minY: minY - margin, width: maxX - minX + margin * 2, height: maxY - minY + margin * 2 };
        }

        /* ---------- Vue (zoom et déplacement) ---------- */

        function applyTransform() {
            world.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
            $(".mm-zoom").textContent = `${Math.round(zoom * 100)} %`;
        }

        function zoomAt(newZoom, point) {
            const z = clamp(newZoom, 0.2, 3);
            const p = point || { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
            pan = { x: p.x - (p.x - pan.x) * (z / zoom), y: p.y - (p.y - pan.y) * (z / zoom) };
            zoom = z;
            applyTransform();
        }

        function fit({ maxZoom = 1 } = {}) {
            if (!boxes.size || !viewport.clientWidth) return;
            const bounds = contentBounds(24);
            let z = clamp(Math.min(viewport.clientWidth / bounds.width, viewport.clientHeight / bounds.height, maxZoom), 0.2, 3);
            fitted = true;
            // Petit écran : au moins 45 % pour pouvoir lire, centré sur le sujet
            if (z < 0.45 && viewport.clientWidth < 600) {
                zoom = 0.45;
                centerOn(data.root.id);
                return;
            }
            zoom = z;
            pan = {
                x: viewport.clientWidth / 2 - (bounds.minX + bounds.width / 2) * z,
                y: viewport.clientHeight / 2 - (bounds.minY + bounds.height / 2) * z
            };
            applyTransform();
        }

        function reveal(id) {
            const box = boxes.get(id);
            if (!box) return;
            const margin = 30;
            const left = pan.x + box.left * zoom;
            const top = pan.y + box.top * zoom;
            const right = left + box.w * zoom;
            const bottom = top + box.h * zoom;
            if (left < margin) pan.x += margin - left;
            else if (right > viewport.clientWidth - margin) pan.x -= right - (viewport.clientWidth - margin);
            if (top < margin) pan.y += margin - top;
            else if (bottom > viewport.clientHeight - margin) pan.y -= bottom - (viewport.clientHeight - margin);
            applyTransform();
        }

        function centerOn(id) {
            const box = boxes.get(id);
            if (!box) return;
            pan = { x: viewport.clientWidth / 2 - (box.left + box.w / 2) * zoom, y: viewport.clientHeight / 2 - (box.top + box.h / 2) * zoom };
            applyTransform();
        }

        /* ---------- Barres d'outils ---------- */

        function updateChrome() {
            const info = selectedInfo();
            const node = info?.node;
            const button = name => root.querySelectorAll(`[data-mm="${name}"]`);
            const disable = (name, value) => button(name).forEach(b => { b.disabled = value; });

            disable("undo", !undoStack.length);
            disable("redo", !redoStack.length);
            disable("child", revision || (!node && selected !== null));
            disable("sibling", revision || !node);
            disable("link", revision || !node);
            disable("delete", revision || (!selectedLink && (!node || node === data.root)));

            formatBar.hidden = !node || revision;
            linkBar.hidden = !selectedLink || revision;
            if (node && !revision) {
                formatBar.querySelectorAll(".mm-swatch[data-color]").forEach(s => s.classList.toggle("active", (node.color || "") === s.dataset.color));
                formatBar.querySelector('[data-field="shape"]').value = node.shape || "auto";
                formatBar.querySelector('[data-field="size"]').value = node.size || "m";
                button("bold").forEach(b => b.classList.toggle("active", !!node.bold));
                button("italic").forEach(b => b.classList.toggle("active", !!node.italic));
                button("task").forEach(b => b.classList.toggle("active", typeof node.done === "boolean"));
                button("note").forEach(b => b.classList.toggle("active", !!(node.note || node.link)));
                const siblings = info.parent ? info.parent.children : [];
                const index = siblings.indexOf(node);
                disable("up", !info.parent || index <= 0);
                disable("down", !info.parent || index >= siblings.length - 1);
                disable("duplicate", !info.parent);
                disable("toggle", !node.children.length);
                button("toggle").forEach(b => { b.innerHTML = node.collapsed ? '<i class="fa-solid fa-expand"></i>' : '<i class="fa-solid fa-compress"></i>'; });
            }

            root.querySelectorAll("[data-layout]").forEach(b => b.classList.toggle("active", b.dataset.layout === data.layout));
            root.querySelectorAll("[data-line]").forEach(b => b.classList.toggle("active", b.dataset.line === data.lineStyle));
            root.querySelectorAll("[data-theme]").forEach(b => b.classList.toggle("active", b.dataset.theme === data.theme));

            $(".mm-revision").hidden = !revision;
            $(".mm-linking").hidden = !linking;
            $(".mm-search").hidden = !search.open;
            button("revision").forEach(b => b.classList.toggle("active", revision));
            button("fullscreen").forEach(b => { b.innerHTML = fullscreen ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>'; b.title = fullscreen ? "Quitter le plein écran (Échap)" : "Plein écran"; });

            let total = 0;
            let maxDepth = 0;
            let tasks = 0;
            let tasksDone = 0;
            walk(data.root, (item, parent, depth) => {
                total += 1;
                maxDepth = Math.max(maxDepth, depth);
                if (typeof item.done === "boolean") { tasks += 1; if (item.done) tasksDone += 1; }
            });
            $(".mm-stats").textContent = `${total} idée${total > 1 ? "s" : ""} · ${maxDepth} niveau${maxDepth > 1 ? "x" : ""}${data.links.length ? ` · ${data.links.length} relation${data.links.length > 1 ? "s" : ""}` : ""}${tasks ? ` · ${tasksDone}/${tasks} cochée${tasksDone > 1 ? "s" : ""}` : ""}`;

            if (panelMode === "note") renderNotePanel(false);
        }

        /* ---------- Sélection ---------- */

        function select(id) {
            const hadLink = !!selectedLink;
            const changed = selected !== id;
            selectedLink = null;
            if (changed) {
                selected = id;
                nodeLayer.querySelectorAll(".mm-node.selected").forEach(n => n.classList.remove("selected"));
                if (id) nodeLayer.querySelector(`.mm-node[data-id="${id}"]`)?.classList.add("selected");
            }
            // Pas de nouveau rendu complet : le double-clic doit retrouver le même élément
            if (hadLink) render();
            else updateChrome();
            if (id) reveal(id);
            if (changed && panelMode === "note") renderNotePanel(true);
        }

        function selectLink(id) {
            finishEdit();
            selected = null;
            selectedLink = id;
            render();
        }

        /* ---------- Actions ---------- */

        function addChild(parentId = selected || data.root.id) {
            if (revision) return;
            finishEdit();
            const target = find(parentId);
            if (!target) return;
            if (countNodes(data.root) >= MAX_NODES) { flash(`Une carte peut contenir au plus ${MAX_NODES} idées.`); return; }
            const node = makeNode("");
            change(() => {
                target.node.children.push(node);
                delete target.node.collapsed;
            });
            selected = node.id;
            render();
            startEdit(node.id, { isNew: true });
        }

        function addSibling(before = false) {
            if (revision) return;
            const info = selectedInfo();
            if (!info) return;
            if (!info.parent) { addChild(info.node.id); return; }
            finishEdit();
            if (countNodes(data.root) >= MAX_NODES) { flash(`Une carte peut contenir au plus ${MAX_NODES} idées.`); return; }
            const node = makeNode("");
            const fresh = find(info.node.id);
            change(() => {
                const index = fresh.parent.children.indexOf(fresh.node);
                fresh.parent.children.splice(before ? index : index + 1, 0, node);
            });
            selected = node.id;
            render();
            startEdit(node.id, { isNew: true });
        }

        function removeSelected() {
            if (revision) return;
            finishEdit();
            if (selectedLink) {
                const id = selectedLink;
                selectedLink = null;
                change(() => { data.links = data.links.filter(link => link.id !== id); });
                return;
            }
            const info = selectedInfo();
            if (!info || !info.parent) return;
            const removed = new Set();
            walk(info.node, node => { removed.add(node.id); });
            const siblings = info.parent.children;
            const index = siblings.indexOf(info.node);
            const next = siblings[index + 1] || siblings[index - 1] || info.parent;
            change(() => {
                siblings.splice(index, 1);
                data.links = data.links.filter(link => !removed.has(link.from) && !removed.has(link.to));
            });
            select(next.id);
        }

        function moveSibling(direction) {
            const info = selectedInfo();
            if (!info || !info.parent || revision) return;
            const siblings = info.parent.children;
            const index = siblings.indexOf(info.node);
            const target = index + direction;
            if (target < 0 || target >= siblings.length) return;
            change(() => {
                siblings.splice(index, 1);
                siblings.splice(target, 0, info.node);
            });
            reveal(info.node.id);
        }

        function moveNode(id, targetId, position) {
            if (id === targetId || id === data.root.id || isInside(targetId, id)) return false;
            const source = find(id);
            const target = find(targetId);
            if (!source || !target) return false;
            if (position !== "inside" && !target.parent) position = "inside";
            change(() => {
                source.parent.children.splice(source.parent.children.indexOf(source.node), 1);
                if (position === "inside") {
                    target.node.children.push(source.node);
                    delete target.node.collapsed;
                } else {
                    const siblings = target.parent.children;
                    const index = siblings.indexOf(target.node);
                    siblings.splice(position === "before" ? index : index + 1, 0, source.node);
                }
            });
            select(id);
            return true;
        }

        function duplicate() {
            const info = selectedInfo();
            if (!info || !info.parent || revision) return;
            const copy = freshIds(info.node);
            change(() => {
                info.parent.children.splice(info.parent.children.indexOf(info.node) + 1, 0, copy);
            });
            select(copy.id);
        }

        function toggleCollapse(id = selected) {
            const info = id ? find(id) : null;
            if (!info || !info.node.children.length) return;
            if (revision) {
                if (revealed.has(id)) walk(info.node, node => { revealed.delete(node.id); });
                else revealed.add(id);
                render();
                return;
            }
            change(() => {
                if (info.node.collapsed) delete info.node.collapsed;
                else info.node.collapsed = true;
            });
        }

        function setAllCollapsed(collapsed) {
            change(() => {
                walk(data.root, (node, parent, depth) => {
                    if (collapsed && depth >= 1 && node.children.length) node.collapsed = true;
                    else delete node.collapsed;
                });
            });
            if (selected && !boxes.has(selected)) selected = null;
            render();
            fit();
        }

        function updateNode(patch, { history = true } = {}) {
            const info = selectedInfo();
            if (!info) return;
            change(() => {
                Object.entries(patch).forEach(([key, value]) => {
                    if (value === undefined || value === null || value === "" || value === false) delete info.node[key];
                    else info.node[key] = value;
                });
            }, { history });
        }

        function toggleTask(id) {
            const info = find(id);
            if (!info) return;
            change(() => { info.node.done = !info.node.done; });
        }

        function setLayout(layout) {
            change(() => { data.layout = layout; });
            fit();
        }

        function applyTemplate(id) {
            const template = TEMPLATES.find(t => t.id === id);
            if (!template) return;
            if (countNodes(data.root) > 1 && !confirm("Remplacer la carte actuelle par ce modèle ? (Ctrl+Z pour revenir en arrière)")) return;
            const fresh = fromText(template.md);
            change(() => {
                data.root = fresh.root;
                data.links = [];
            });
            selected = null;
            render();
            fit();
        }

        function startLinking() {
            if (!selected || revision) return;
            finishEdit();
            linking = selected;
            render();
            viewport.focus({ preventScroll: true });
        }

        function finishLinking(targetId) {
            const from = linking;
            linking = null;
            if (!targetId || targetId === from) { render(); return; }
            if (data.links.some(link => link.from === from && link.to === targetId)) { flash("Ces deux idées sont déjà reliées."); render(); return; }
            const link = { id: uid(), from, to: targetId, label: "" };
            change(() => { data.links.push(link); });
            selected = null;
            selectLink(link.id);
        }

        function reverseLink() {
            const link = data.links.find(l => l.id === selectedLink);
            if (!link) return;
            change(() => { [link.from, link.to] = [link.to, link.from]; });
        }

        function toggleRevision() {
            finishEdit();
            closePanel();
            revision = !revision;
            revealed = new Set();
            linking = null;
            selected = null;
            selectedLink = null;
            render();
            fit();
        }

        let flashTimer = null;
        function flash(message) {
            const stats = $(".mm-stats");
            stats.textContent = message;
            stats.classList.add("flash");
            clearTimeout(flashTimer);
            flashTimer = setTimeout(() => { stats.classList.remove("flash"); updateChrome(); }, 2600);
        }

        /* ---------- Modifier le texte ---------- */

        function startEdit(id, { isNew = false, replace = null } = {}) {
            if (revision) return;
            finishEdit();
            if (expandTo(id)) render();
            const info = find(id);
            const box = boxes.get(id);
            if (!info || !box) return;
            const textarea = document.createElement("textarea");
            textarea.className = "mm-editor";
            textarea.value = replace !== null ? replace : info.node.text;
            textarea.rows = 1;
            textarea.spellcheck = true;
            textarea.setAttribute("aria-label", "Texte de l'idée");
            world.appendChild(textarea);
            editing = { id, textarea, isNew, original: info.node.text };
            nodeLayer.querySelector(`.mm-node[data-id="${id}"]`)?.classList.add("editing");
            positionEditor();
            textarea.focus({ preventScroll: true });
            if (replace !== null) textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            else textarea.select();

            textarea.addEventListener("input", positionEditor);
            textarea.addEventListener("keydown", event => {
                event.stopPropagation();
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    finishEdit();
                    viewport.focus({ preventScroll: true });
                } else if (event.key === "Tab") {
                    event.preventDefault();
                    finishEdit();
                    if (find(id)) addChild(id);
                } else if (event.key === "Escape") {
                    event.preventDefault();
                    finishEdit({ cancel: true });
                    viewport.focus({ preventScroll: true });
                }
            });
            textarea.addEventListener("blur", () => { if (editing && editing.textarea === textarea) finishEdit(); });
            reveal(id);
        }

        function startEditLink(id) {
            if (revision) return;
            finishEdit();
            const link = data.links.find(l => l.id === id);
            const a = link && boxes.get(link.from);
            const b = link && boxes.get(link.to);
            if (!a || !b) return;
            const { mid } = relationGeometry(a, b);
            const textarea = document.createElement("textarea");
            textarea.className = "mm-editor mm-editor-link";
            textarea.value = link.label;
            textarea.rows = 1;
            textarea.placeholder = "Texte de la relation";
            textarea.setAttribute("aria-label", "Texte de la relation");
            textarea.style.left = `${mid.x - 80}px`;
            textarea.style.top = `${mid.y - 16}px`;
            world.appendChild(textarea);
            editing = { linkId: id, textarea };
            textarea.focus({ preventScroll: true });
            textarea.select();
            textarea.addEventListener("keydown", event => {
                event.stopPropagation();
                if (event.key === "Enter" || event.key === "Escape") {
                    event.preventDefault();
                    finishEdit({ cancel: event.key === "Escape" });
                    viewport.focus({ preventScroll: true });
                }
            });
            textarea.addEventListener("blur", () => { if (editing && editing.textarea === textarea) finishEdit(); });
        }

        function positionEditor() {
            if (!editing || !editing.id) return;
            const box = boxes.get(editing.id);
            const textarea = editing.textarea;
            if (!box) return;
            const style = box.style;
            const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
            measureCanvas.font = font;
            const longest = Math.max(...textarea.value.split("\n").map(line => measureCanvas.measureText(line || " ").width));
            const width = clamp(longest + style.padding[1] * 2 + 18, Math.max(box.w, 120), style.maxWidth + 60);
            Object.assign(textarea.style, {
                left: `${box.left}px`,
                top: `${box.top}px`,
                width: `${width}px`,
                font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px/1.35 ${style.fontFamily}`,
                padding: `${style.padding[0]}px ${style.padding[1]}px`,
                borderRadius: `${Math.min(style.radius, 14)}px`
            });
            if (box.side < 0 && data.layout !== "down") textarea.style.left = `${box.left + box.w - width}px`;
            textarea.style.height = "auto";
            textarea.style.height = `${Math.max(textarea.scrollHeight, box.h)}px`;
        }

        function finishEdit({ cancel = false } = {}) {
            if (!editing) return;
            const current = editing;
            editing = null;
            current.textarea.remove();
            if (current.linkId) {
                const link = data.links.find(l => l.id === current.linkId);
                const label = current.textarea.value.replace(/\s+/g, " ").trim().slice(0, 200);
                if (!cancel && link && label !== link.label) change(() => { link.label = label; });
                else render();
                return;
            }
            const info = find(current.id);
            if (!info) { render(); return; }
            const text = current.textarea.value.replace(/\s+$/, "").replace(/^\s+/, "").slice(0, 2000);
            if (current.isNew && (cancel || !text)) {
                // Nouvelle idée abandonnée : on revient à l'état d'avant sa création
                const parent = info.parent;
                if (undoStack.length) data = normalize(undoStack.pop());
                selected = parent && find(parent.id) ? parent.id : null;
                render();
                emit();
                return;
            }
            if (cancel || text === info.node.text) { render(); return; }
            // Une nouvelle idée a déjà son étape d'historique (sa création)
            change(() => { info.node.text = text; }, { history: !current.isNew });
        }

        /* ---------- Panneau : note, lien, import ---------- */

        function closePanel() {
            panelMode = null;
            panel.hidden = true;
            panel.innerHTML = "";
        }

        function renderNotePanel(rebuild = true) {
            const info = selectedInfo();
            if (!info || revision) { closePanel(); return; }
            if (!rebuild && panel.dataset.node === info.node.id) return;
            panel.dataset.node = info.node.id;
            panel.hidden = false;
            panel.innerHTML = `
                <div class="mm-panel-head">
                    <strong><i class="fa-regular fa-note-sticky"></i> Note et lien de « ${escapeHTML(nodeLabel(info.node).slice(0, 50))} »</strong>
                    <button type="button" class="mm-btn icon" data-panel="close" aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <label class="mm-field">
                    <span>Note (affichée au survol de l'icône <i class="fa-regular fa-note-sticky"></i>)</span>
                    <textarea rows="3" data-panel="note" placeholder="Une explication, un exemple, une source…">${escapeHTML(info.node.note || "")}</textarea>
                </label>
                <label class="mm-field">
                    <span>Lien (page web, vidéo, cours…)</span>
                    <span class="mm-field-row">
                        <input type="url" data-panel="link" placeholder="https://…" value="${escapeHTML(info.node.link || "")}">
                        ${info.node.link ? `<a class="mm-btn" href="${escapeHTML(info.node.link)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i><span>Ouvrir</span></a>` : ""}
                    </span>
                    <small class="mm-field-error" hidden>Adresse invalide : elle doit commencer par https:// (ou http://).</small>
                </label>`;
            const note = panel.querySelector('[data-panel="note"]');
            const link = panel.querySelector('[data-panel="link"]');
            let noteHistory = false;
            note.addEventListener("focus", () => { noteHistory = false; });
            note.addEventListener("input", () => {
                const target = find(panel.dataset.node);
                if (!target) return;
                if (!noteHistory) { pushHistory(); noteHistory = true; }
                if (note.value.trim()) target.node.note = note.value.slice(0, 5000);
                else delete target.node.note;
                render();
                emit();
            });
            link.addEventListener("change", () => {
                const target = find(panel.dataset.node);
                if (!target) return;
                const value = link.value.trim();
                const valid = value ? safeLink(value) : "";
                panel.querySelector(".mm-field-error").hidden = valid !== null;
                if (valid === null) return;
                change(() => {
                    if (valid) target.node.link = valid;
                    else delete target.node.link;
                });
                renderNotePanel(true);
            });
            panel.querySelector('[data-panel="close"]').addEventListener("click", closePanel);
        }

        function openNotePanel() {
            if (!selected) return;
            if (panelMode === "note") { closePanel(); return; }
            panelMode = "note";
            renderNotePanel(true);
            panel.querySelector('[data-panel="note"]')?.focus();
        }

        function openImportPanel() {
            finishEdit();
            panelMode = "import";
            panel.hidden = false;
            panel.dataset.node = "";
            panel.innerHTML = `
                <div class="mm-panel-head">
                    <strong><i class="fa-solid fa-list-ul"></i> Coller un plan</strong>
                    <button type="button" class="mm-btn icon" data-panel="close" aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <p class="mm-panel-help">Une idée par ligne. Les titres Markdown (#, ##) et les retraits (espaces ou tirets) créent les sous-branches. Exemple :</p>
                <pre class="mm-panel-example"># Réseaux\n- Protocoles\n  - TCP\n  - UDP\n- Routage</pre>
                <textarea rows="7" data-panel="text" placeholder="Colle ou écris ton plan ici…"></textarea>
                <div class="mm-panel-actions">
                    <button type="button" class="mm-btn primary" data-panel="replace"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Remplacer la carte</span></button>
                    <button type="button" class="mm-btn" data-panel="append"><i class="fa-solid fa-plus"></i><span>Ajouter sous l'idée sélectionnée</span></button>
                </div>`;
            const area = panel.querySelector('[data-panel="text"]');
            area.focus();
            panel.querySelector('[data-panel="close"]').addEventListener("click", closePanel);
            panel.querySelector('[data-panel="replace"]').addEventListener("click", () => {
                if (!area.value.trim()) { area.focus(); return; }
                importText(area.value, "replace");
                closePanel();
            });
            panel.querySelector('[data-panel="append"]').addEventListener("click", () => {
                if (!area.value.trim()) { area.focus(); return; }
                importText(area.value, "append");
                closePanel();
            });
        }

        function importText(text, mode) {
            const parsed = fromText(text, "__plan__");
            if (mode === "replace") {
                change(() => {
                    data.root = parsed.root.text === "__plan__" ? Object.assign(parsed.root, { text: "Sujet central" }) : parsed.root;
                    data.links = [];
                });
                selected = null;
                render();
                fit();
                return;
            }
            const target = find(selected || data.root.id);
            const additions = parsed.root.text === "__plan__" ? parsed.root.children : [parsed.root];
            if (countNodes(data.root) + additions.reduce((sum, n) => sum + countNodes(n), 0) > MAX_NODES) { flash(`Une carte peut contenir au plus ${MAX_NODES} idées.`); return; }
            change(() => {
                target.node.children.push(...additions);
                delete target.node.collapsed;
            });
            if (additions[0]) select(additions[0].id);
        }

        function importFile(file) {
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) { flash("Fichier trop gros (2 Mo maximum)."); return; }
            file.text().then(text => {
                let parsed = null;
                if (/\.json$/i.test(file.name) || /^\s*\{/.test(text)) {
                    try {
                        const json = JSON.parse(text);
                        if (json && json.root) parsed = normalize(json);
                    } catch (_) {}
                    if (!parsed) { flash("Ce fichier JSON n'est pas une carte mentale NSI Hub."); return; }
                }
                if (countNodes(data.root) > 1 && !confirm("Remplacer la carte actuelle par le contenu du fichier ? (Ctrl+Z pour revenir en arrière)")) return;
                if (parsed) {
                    change(() => { data = parsed; });
                    selected = null;
                    render();
                    fit();
                } else {
                    importText(text, "replace");
                }
            });
        }

        /* ---------- Exports ---------- */

        function buildSVG() {
            if (dirty) render();
            const colors = siteColors();
            const theme = THEMES[data.theme];
            const bounds = contentBounds(36);
            const background = theme.board ? BOARD_BG : colors.surface;
            const relationColor = theme.board ? "#f8fafc" : colors.muted;
            const out = [];
            out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(bounds.width)}" height="${Math.ceil(bounds.height)}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">`);
            out.push(`<defs><marker id="fleche" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${relationColor}"/></marker></defs>`);
            out.push(`<rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="${background}"/>`);
            boxes.forEach(box => {
                const parent = parents.get(box.node.id);
                if (!parent) return;
                const width = box.depth === 1 ? 3 : box.depth === 2 ? 2.2 : 1.7;
                out.push(`<path d="${branchPath(boxes.get(parent.id), box)}" stroke="${box.color}" stroke-width="${width}" fill="none" stroke-linecap="round"/>`);
            });
            data.links.forEach(link => {
                const a = boxes.get(link.from);
                const b = boxes.get(link.to);
                if (!a || !b) return;
                const geometry = relationGeometry(a, b);
                out.push(`<path d="${geometry.d}" stroke="${relationColor}" stroke-width="1.8" stroke-dasharray="6 5" fill="none" marker-end="url(#fleche)"/>`);
                if (link.label) {
                    out.push(`<text x="${geometry.mid.x}" y="${geometry.mid.y}" font-family='${FONT}' font-size="12" fill="${relationColor}" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="${background}" stroke-width="4">${escapeHTML(link.label)}</text>`);
                }
            });
            boxes.forEach(box => {
                const { style, node } = box;
                if (style.shape === "souligne") {
                    out.push(`<line x1="${box.left}" y1="${box.top + box.h - style.strokeWidth / 2}" x2="${box.left + box.w}" y2="${box.top + box.h - style.strokeWidth / 2}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}" stroke-linecap="round"/>`);
                } else {
                    const inset = style.strokeWidth / 2;
                    const radius = Math.min(style.radius, (box.h - style.strokeWidth) / 2);
                    out.push(`<rect x="${box.left + inset}" y="${box.top + inset}" width="${box.w - style.strokeWidth}" height="${box.h - style.strokeWidth}" rx="${radius}" fill="${style.fill === "transparent" ? "none" : style.fill}"${style.strokeWidth ? ` stroke="${style.stroke}" stroke-width="${style.strokeWidth}"` : ""}/>`);
                }
                const prefix = `${typeof node.done === "boolean" ? (node.done ? "☑ " : "☐ ") : ""}${node.icon ? `${node.icon} ` : ""}`;
                const label = `${prefix}${node.text.replace(/`([^`\n]+)`/g, "$1") || "…"}${node.link ? " 🔗" : ""}`;
                const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;
                const lines = wrapLines(label, font, Math.max(20, box.w - style.padding[1] * 2 - style.strokeWidth * 2 + 2));
                const lineHeight = style.fontSize * 1.35;
                const top = box.top + (box.h - lines.length * lineHeight) / 2;
                lines.forEach((line, i) => {
                    out.push(`<text x="${box.left + box.w / 2}" y="${top + lineHeight * (i + 0.5)}" font-family='${style.fontFamily}' font-size="${style.fontSize}" font-weight="${style.fontWeight}" font-style="${style.fontStyle}" fill="${style.text}" text-anchor="middle" dominant-baseline="central"${node.done === true ? ' text-decoration="line-through"' : ""}>${escapeHTML(line)}</text>`);
                });
            });
            out.push("</svg>");
            return { svg: out.join("\n"), width: bounds.width, height: bounds.height };
        }

        function exportAs(format) {
            finishEdit();
            const name = fileName(data.root.text);
            if (format === "md") {
                downloadBlob(`${name}.md`, new Blob([toMarkdown(data)], { type: "text/markdown;charset=utf-8" }));
            } else if (format === "json") {
                downloadBlob(`${name}.json`, new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" }));
            } else if (format === "copy") {
                const text = toMarkdown(data);
                const done = () => flash("Plan copié dans le presse-papiers.");
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text) && done());
                else if (fallbackCopy(text)) done();
            } else if (format === "svg") {
                downloadBlob(`${name}.svg`, new Blob([buildSVG().svg], { type: "image/svg+xml;charset=utf-8" }));
            } else if (format === "png") {
                const { svg: source, width, height } = buildSVG();
                const scale = Math.min(2, 8000 / Math.max(width, height));
                const image = new Image();
                const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.ceil(width * scale);
                    canvas.height = Math.ceil(height * scale);
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    URL.revokeObjectURL(url);
                    canvas.toBlob(blob => {
                        if (blob) downloadBlob(`${name}.png`, blob);
                        else flash("Impossible de créer l'image.");
                    }, "image/png");
                };
                image.onerror = () => { URL.revokeObjectURL(url); flash("Impossible de créer l'image."); };
                image.src = url;
            }
        }

        function fallbackCopy(text) {
            const area = document.createElement("textarea");
            area.value = text;
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            let ok = false;
            try { ok = document.execCommand("copy"); } catch (_) {}
            area.remove();
            viewport.focus({ preventScroll: true });
            return ok;
        }

        /* ---------- Copier / coller des branches ---------- */

        function copyBranch(cut = false) {
            const info = selectedInfo();
            if (!info) return;
            const text = [nodeLabel(info.node), ...branchToMarkdown(info.node, 1)].join("\n");
            clipboard = { node: clone(info.node), text: text.trim() };
            if (navigator.clipboard?.writeText) navigator.clipboard.writeText(clipboard.text).catch(() => {});
            if (cut && info.parent) removeSelected();
            flash(cut ? "Branche coupée." : "Branche copiée.");
        }

        function pasteBranch(text) {
            if (revision) return;
            const target = find(selected || data.root.id);
            if (!target) return;
            let additions;
            if (clipboard && (!text || text.trim() === clipboard.text)) additions = [freshIds(clipboard.node)];
            else if (text && text.trim()) {
                const parsed = fromText(text, "__plan__");
                additions = parsed.root.text === "__plan__" ? parsed.root.children : [parsed.root];
            } else return;
            if (countNodes(data.root) + additions.reduce((sum, n) => sum + countNodes(n), 0) > MAX_NODES) { flash(`Une carte peut contenir au plus ${MAX_NODES} idées.`); return; }
            change(() => {
                target.node.children.push(...additions);
                delete target.node.collapsed;
            });
            if (additions[0]) select(additions[0].id);
        }

        /* ---------- Recherche ---------- */

        const simplify = value => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

        function runSearch(query) {
            search.query = query;
            const needle = simplify(query.trim());
            search.matches = [];
            if (needle) walk(data.root, node => { if (simplify(`${node.text} ${node.note || ""}`).includes(needle)) search.matches.push(node.id); });
            search.index = search.matches.length ? 0 : -1;
            $(".mm-search-count").textContent = needle ? (search.matches.length ? `1 / ${search.matches.length}` : "Aucun résultat") : "";
            if (search.index >= 0) goToMatch(0);
            else render();
        }

        function goToMatch(step) {
            if (!search.matches.length) return;
            search.index = (search.index + step + search.matches.length) % search.matches.length;
            const id = search.matches[search.index];
            if (expandTo(id)) emit();
            selected = id;
            selectedLink = null;
            render();
            centerOn(id);
            $(".mm-search-count").textContent = `${search.index + 1} / ${search.matches.length}`;
        }

        function openSearch() {
            search.open = true;
            updateChrome();
            const input = $(".mm-search-input");
            input.focus();
            input.select();
        }

        function closeSearch() {
            search = { open: false, query: "", matches: [], index: -1 };
            $(".mm-search-input").value = "";
            $(".mm-search-count").textContent = "";
            render();
            viewport.focus({ preventScroll: true });
        }

        /* ---------- Plein écran ---------- */

        function toggleFullscreen(force) {
            fullscreen = typeof force === "boolean" ? force : !fullscreen;
            root.classList.toggle("mm-fullscreen", fullscreen);
            document.documentElement.classList.toggle("mm-no-scroll", !!document.querySelector(".mm-fullscreen"));
            requestAnimationFrame(() => {
                render();
                fit({ maxZoom: fullscreen ? 1.3 : 1 });
                viewport.focus({ preventScroll: true });
            });
        }

        /* ---------- Menu contextuel ---------- */

        function openContextMenu(x, y) {
            const info = selectedInfo();
            if (!info || revision) return;
            const items = [
                ["child", "fa-solid fa-plus", "Ajouter une idée", "Tab"],
                info.parent ? ["sibling", "fa-solid fa-grip-lines", "Ajouter une idée sœur", "Entrée"] : null,
                ["edit", "fa-solid fa-pen", "Modifier le texte", "F2"],
                ["link", "fa-solid fa-share-nodes", "Relier à une autre idée", ""],
                ["note", "fa-regular fa-note-sticky", "Note et lien", ""],
                info.node.children.length ? ["toggle", info.node.collapsed ? "fa-solid fa-expand" : "fa-solid fa-compress", info.node.collapsed ? "Développer" : "Réduire", "/"] : null,
                ["copy", "fa-regular fa-copy", "Copier la branche", "Ctrl+C"],
                info.parent ? ["cut", "fa-solid fa-scissors", "Couper la branche", "Ctrl+X"] : null,
                clipboard ? ["paste", "fa-solid fa-paste", "Coller dans cette idée", "Ctrl+V"] : null,
                info.parent ? ["duplicate", "fa-regular fa-clone", "Dupliquer", "Ctrl+D"] : null,
                info.parent ? ["delete", "fa-solid fa-trash", "Supprimer", "Suppr"] : null
            ].filter(Boolean);
            contextMenu.innerHTML = items.map(([action, icon, label, key]) => `<button type="button" role="menuitem" data-context="${action}"><i class="${icon}"></i><span>${label}</span>${key ? `<kbd>${key}</kbd>` : ""}</button>`).join("");
            contextMenu.hidden = false;
            const rect = viewport.getBoundingClientRect();
            const width = contextMenu.offsetWidth;
            const height = contextMenu.offsetHeight;
            contextMenu.style.left = `${clamp(x - rect.left, 4, rect.width - width - 4)}px`;
            contextMenu.style.top = `${clamp(y - rect.top, 4, rect.height - height - 4)}px`;
            contextMenu.querySelector("button")?.focus();
        }

        function closeContextMenu() {
            contextMenu.hidden = true;
        }

        contextMenu.addEventListener("click", event => {
            const button = event.target.closest("[data-context]");
            if (!button) return;
            closeContextMenu();
            const action = button.dataset.context;
            if (action === "edit") startEdit(selected);
            else if (action === "copy") copyBranch(false);
            else if (action === "cut") copyBranch(true);
            else if (action === "paste") pasteBranch(null);
            else runAction(action);
            if (!editing) viewport.focus({ preventScroll: true });
        });

        /* ---------- Boutons ---------- */

        function runAction(action) {
            switch (action) {
                case "child": addChild(); break;
                case "sibling": addSibling(); break;
                case "delete": removeSelected(); break;
                case "undo": undo(); break;
                case "redo": redo(); break;
                case "link": startLinking(); break;
                case "link-cancel": linking = null; render(); break;
                case "link-label": if (selectedLink) startEditLink(selectedLink); break;
                case "link-reverse": reverseLink(); break;
                case "expand-all": setAllCollapsed(false); break;
                case "collapse-all": setAllCollapsed(true); break;
                case "revision": toggleRevision(); break;
                case "reveal-all": walk(data.root, node => { revealed.add(node.id); }); render(); fit(); break;
                case "hide-all": revealed = new Set(); render(); fit(); break;
                case "search": openSearch(); break;
                case "search-next": goToMatch(1); break;
                case "search-prev": goToMatch(-1); break;
                case "search-close": closeSearch(); break;
                case "import-text": openImportPanel(); break;
                case "import-file": $(".mm-file").click(); break;
                case "zoom-in": zoomAt(zoom * 1.2); break;
                case "zoom-out": zoomAt(zoom / 1.2); break;
                case "zoom-reset": zoomAt(1); break;
                case "fit": fit({ maxZoom: fullscreen ? 1.3 : 1 }); break;
                case "fullscreen": toggleFullscreen(); break;
                case "bold": updateNode({ bold: !selectedInfo()?.node.bold }); break;
                case "italic": updateNode({ italic: !selectedInfo()?.node.italic }); break;
                case "task": {
                    const node = selectedInfo()?.node;
                    if (node) change(() => { if (typeof node.done === "boolean") delete node.done; else node.done = false; });
                    break;
                }
                case "note": openNotePanel(); break;
                case "up": moveSibling(-1); break;
                case "down": moveSibling(1); break;
                case "duplicate": duplicate(); break;
                case "toggle": toggleCollapse(); break;
                default: break;
            }
        }

        root.addEventListener("click", event => {
            const closeMenu = () => event.target.closest("details")?.removeAttribute("open");
            const actionButton = event.target.closest("[data-mm]");
            if (actionButton && !actionButton.disabled && root.contains(actionButton) && !contextMenu.contains(actionButton)) {
                closeMenu();
                runAction(actionButton.dataset.mm);
                return;
            }
            const layout = event.target.closest("[data-layout]");
            if (layout) { closeMenu(); setLayout(layout.dataset.layout); return; }
            const line = event.target.closest("[data-line]");
            if (line) { closeMenu(); change(() => { data.lineStyle = line.dataset.line; }); return; }
            const theme = event.target.closest("[data-theme]");
            if (theme) { closeMenu(); change(() => { data.theme = theme.dataset.theme; }); return; }
            const template = event.target.closest("[data-template]");
            if (template) { closeMenu(); applyTemplate(template.dataset.template); return; }
            const exportButton = event.target.closest("[data-export]");
            if (exportButton) { closeMenu(); exportAs(exportButton.dataset.export); return; }
            const swatch = event.target.closest(".mm-swatch[data-color]");
            if (swatch) { updateNode({ color: swatch.dataset.color }); return; }
            const icon = event.target.closest("[data-icon]");
            if (icon) { closeMenu(); updateNode({ icon: icon.dataset.icon }); }
        });

        formatBar.querySelector('[data-field="shape"]').addEventListener("change", event => updateNode({ shape: event.target.value === "auto" ? "" : event.target.value }));
        formatBar.querySelector('[data-field="size"]').addEventListener("change", event => updateNode({ size: event.target.value === "m" ? "" : event.target.value }));
        formatBar.querySelector('[data-field="color-custom"]').addEventListener("change", event => updateNode({ color: event.target.value }));
        $(".mm-file").addEventListener("change", event => { importFile(event.target.files[0]); event.target.value = ""; });

        const searchInput = $(".mm-search-input");
        searchInput.addEventListener("input", () => runSearch(searchInput.value));
        searchInput.addEventListener("keydown", event => {
            event.stopPropagation();
            if (event.key === "Enter") { event.preventDefault(); goToMatch(event.shiftKey ? -1 : 1); }
            else if (event.key === "Escape") { event.preventDefault(); closeSearch(); }
        });

        /* ---------- Souris, doigts et stylet ---------- */

        const pointers = new Map();
        let gesture = null;   // { type: "pan" | "drag" | "pinch", ... }
        let lastTap = { id: null, time: 0 };
        let pendingEdit = null;

        function localPoint(event) {
            const rect = viewport.getBoundingClientRect();
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        }

        function clearDropMarks() {
            nodeLayer.querySelectorAll(".drop-inside, .drop-before, .drop-after").forEach(n => n.classList.remove("drop-inside", "drop-before", "drop-after"));
        }

        viewport.addEventListener("pointerdown", event => {
            if (event.target.closest(".mm-editor, .mm-context, .mm-link, .mm-check, .mm-toggle")) return;
            if (event.button !== undefined && event.button > 0) return;
            closeContextMenu();
            pendingEdit = null;
            if (editing) finishEdit();
            onFocus();
            viewport.focus({ preventScroll: true });
            pointers.set(event.pointerId, localPoint(event));

            if (pointers.size === 2) {
                const [a, b] = [...pointers.values()];
                gesture = { type: "pinch", distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom, pan: { ...pan }, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
                clearDropMarks();
                return;
            }
            if (pointers.size > 2) return;

            const point = localPoint(event);
            const linkHit = event.target.closest("[data-link]");
            const nodeElement = event.target.closest(".mm-node");

            if (linkHit && !linking) { selectLink(linkHit.dataset.link); gesture = null; return; }

            if (nodeElement) {
                const id = nodeElement.dataset.id;
                if (linking) { finishLinking(id); gesture = null; return; }
                if (revision) { toggleCollapse(id); gesture = null; return; }
                select(id);
                const canDrag = id !== data.root.id && (event.pointerType !== "touch" || fullscreen);
                gesture = canDrag ? { type: "drag", id, start: point, active: false, pointerId: event.pointerId } : { type: "pan", start: point, pan: { ...pan }, moved: false, onNode: id };
                if (event.pointerType === "touch") {
                    const now = Date.now();
                    // Double appui : l'édition commence au « click », une fois que le navigateur a fini de déplacer le focus
                    if (lastTap.id === id && now - lastTap.time < 400) { gesture = null; lastTap = { id: null, time: 0 }; pendingEdit = id; return; }
                    lastTap = { id, time: now };
                }
            } else {
                if (linking) { linking = null; render(); return; }
                gesture = { type: "pan", start: point, pan: { ...pan }, moved: false };
            }
            try { viewport.setPointerCapture(event.pointerId); } catch (_) {}
        });

        viewport.addEventListener("pointermove", event => {
            if (!pointers.has(event.pointerId)) return;
            const point = localPoint(event);
            pointers.set(event.pointerId, point);
            if (!gesture) return;

            if (gesture.type === "pinch" && pointers.size >= 2) {
                const [a, b] = [...pointers.values()];
                const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
                const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
                const z = clamp(gesture.zoom * (distance / gesture.distance), 0.2, 3);
                const worldPoint = { x: (gesture.mid.x - gesture.pan.x) / gesture.zoom, y: (gesture.mid.y - gesture.pan.y) / gesture.zoom };
                zoom = z;
                pan = { x: mid.x - worldPoint.x * z, y: mid.y - worldPoint.y * z };
                applyTransform();
                return;
            }

            const dx = point.x - gesture.start.x;
            const dy = point.y - gesture.start.y;

            if (gesture.type === "pan") {
                if (!gesture.moved && Math.hypot(dx, dy) < 4) return;
                gesture.moved = true;
                viewport.classList.add("panning");
                pan = { x: gesture.pan.x + dx, y: gesture.pan.y + dy };
                applyTransform();
                return;
            }

            if (gesture.type === "drag") {
                if (!gesture.active && Math.hypot(dx, dy) < 6) return;
                const element = nodeLayer.querySelector(`.mm-node[data-id="${gesture.id}"]`);
                if (!element) return;
                if (!gesture.active) {
                    gesture.active = true;
                    element.classList.add("dragging");
                    viewport.classList.add("dragging-node");
                }
                element.style.transform = `translate(${dx / zoom}px, ${dy / zoom}px)`;
                clearDropMarks();
                gesture.target = null;
                const under = document.elementFromPoint(event.clientX, event.clientY)?.closest(".mm-node");
                if (under && under.dataset.id !== gesture.id && !isInside(under.dataset.id, gesture.id)) {
                    const rect = under.getBoundingClientRect();
                    const sideBySide = data.layout === "down" && boxes.get(under.dataset.id)?.depth === 1;
                    const ratio = sideBySide ? (event.clientX - rect.left) / rect.width : (event.clientY - rect.top) / rect.height;
                    let position = ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside";
                    if (under.dataset.id === data.root.id) position = "inside";
                    under.classList.add(`drop-${position}`);
                    gesture.target = { id: under.dataset.id, position };
                }
            }
        });

        function endPointer(event) {
            if (!pointers.has(event.pointerId)) return;
            pointers.delete(event.pointerId);
            viewport.classList.remove("panning", "dragging-node");
            if (!gesture) return;
            if (gesture.type === "pinch") {
                if (pointers.size === 0) gesture = null;
                else {
                    const [remaining] = [...pointers.values()];
                    gesture = { type: "pan", start: remaining, pan: { ...pan }, moved: true };
                }
                return;
            }
            if (gesture.type === "drag") {
                const drag = gesture;
                gesture = null;
                clearDropMarks();
                if (drag.active) {
                    const moved = event.type === "pointerup" && drag.target && moveNode(drag.id, drag.target.id, drag.target.position);
                    if (!moved) render();
                }
                return;
            }
            if (gesture.type === "pan" && !gesture.moved && !gesture.onNode && event.type === "pointerup") {
                // Clic sur le fond : désélectionne
                if (selected || selectedLink) { selected = null; selectedLink = null; render(); if (panelMode === "note") closePanel(); }
            }
            gesture = null;
        }

        viewport.addEventListener("pointerup", endPointer);
        viewport.addEventListener("pointercancel", endPointer);

        viewport.addEventListener("dblclick", event => {
            if (event.target.closest(".mm-editor, .mm-link, .mm-check, .mm-toggle")) return;
            const label = event.target.closest(".mm-relation-label, .mm-relation-hit");
            if (label) { startEditLink(label.dataset.link); return; }
            const nodeElement = event.target.closest(".mm-node");
            if (nodeElement && !revision) startEdit(nodeElement.dataset.id);
        });

        viewport.addEventListener("click", event => {
            if (pendingEdit) {
                const id = pendingEdit;
                pendingEdit = null;
                setTimeout(() => startEdit(id), 0);
                return;
            }
            const check = event.target.closest(".mm-check");
            if (check) { const id = check.closest(".mm-node").dataset.id; select(id); toggleTask(id); return; }
            const toggle = event.target.closest(".mm-toggle");
            if (toggle) {
                event.stopPropagation();
                toggleCollapse(toggle.dataset.toggle);
            }
        });

        viewport.addEventListener("contextmenu", event => {
            const nodeElement = event.target.closest(".mm-node");
            if (!nodeElement || revision) return;
            event.preventDefault();
            finishEdit();
            select(nodeElement.dataset.id);
            openContextMenu(event.clientX, event.clientY);
        });

        viewport.addEventListener("wheel", event => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                zoomAt(zoom * Math.exp(-event.deltaY * 0.0022), localPoint(event));
            } else if (fullscreen) {
                event.preventDefault();
                pan = { x: pan.x - event.deltaX, y: pan.y - event.deltaY };
                applyTransform();
            }
        }, { passive: false });

        /* ---------- Clavier ---------- */

        // Déplacement logique : vers le parent, les enfants ou les idées sœurs selon la disposition
        function logicalTarget(key) {
            const info = selectedInfo();
            const box = boxes.get(selected);
            if (!info || !box) return null;
            const shown = list => list.filter(child => boxes.has(child.id));
            const kids = shown(visibleChildren(info.node));
            const parent = info.parent;
            const sameSide = list => list.filter(child => (boxes.get(child.id).side || 0) === (box.side || 0));
            const siblings = parent ? (data.layout === "map" && info.depth === 1 ? sameSide(shown(parent.children)) : shown(parent.children)) : [];
            const index = siblings.indexOf(info.node);
            const previous = siblings[index - 1];
            const next = siblings[index + 1];

            if (data.layout === "down") {
                if (info.depth === 0) return key === "ArrowDown" ? kids[0] : null;
                if (info.depth === 1) {
                    return { ArrowUp: parent, ArrowDown: kids[0], ArrowLeft: previous, ArrowRight: next }[key] || null;
                }
                return { ArrowLeft: parent, ArrowRight: kids[0], ArrowUp: previous || parent, ArrowDown: next }[key] || null;
            }
            if (info.depth === 0) {
                if (key === "ArrowRight") return kids.find(child => boxes.get(child.id).side > 0) || null;
                if (key === "ArrowLeft") return kids.find(child => boxes.get(child.id).side < 0) || null;
                return null;
            }
            const outward = box.side < 0 ? "ArrowLeft" : "ArrowRight";
            const inward = box.side < 0 ? "ArrowRight" : "ArrowLeft";
            if (key === outward) return kids[0] || null;
            if (key === inward) return parent;
            return key === "ArrowUp" ? previous || null : next || null;
        }

        function navigate(key) {
            const current = boxes.get(selected);
            if (!current) { select(data.root.id); return; }
            const logical = logicalTarget(key);
            if (logical) { select(logical.id); return; }
            const cx = current.left + current.w / 2;
            const cy = current.top + current.h / 2;
            let best = null;
            let bestScore = Infinity;
            boxes.forEach((box, id) => {
                if (id === selected) return;
                const dx = box.left + box.w / 2 - cx;
                const dy = box.top + box.h / 2 - cy;
                let main;
                let cross;
                if (key === "ArrowRight") { main = dx; cross = dy; }
                else if (key === "ArrowLeft") { main = -dx; cross = dy; }
                else if (key === "ArrowDown") { main = dy; cross = dx; }
                else { main = -dy; cross = dx; }
                if (main <= 2) return;
                const score = main + Math.abs(cross) * 2.5;
                if (score < bestScore) { bestScore = score; best = id; }
            });
            if (best) select(best);
        }

        viewport.addEventListener("keydown", event => {
            if (event.target !== viewport) return;
            const key = event.key;
            const ctrl = event.ctrlKey || event.metaKey;
            const lower = key.toLowerCase();

            if (key === "Escape") {
                if (!contextMenu.hidden) closeContextMenu();
                else if (linking) { linking = null; render(); }
                else if (search.open) closeSearch();
                else if (fullscreen) toggleFullscreen(false);
                else if (panelMode) closePanel();
                else if (selected || selectedLink) { selected = null; selectedLink = null; render(); }
                event.preventDefault();
                return;
            }
            if (ctrl && lower === "z" && !event.shiftKey) { event.preventDefault(); undo(); return; }
            if (ctrl && (lower === "y" || (lower === "z" && event.shiftKey))) { event.preventDefault(); redo(); return; }
            if (ctrl && lower === "f") { event.preventDefault(); openSearch(); return; }
            if (revision) {
                if (key === " " || key === "Enter") { event.preventDefault(); if (selected) toggleCollapse(selected); }
                else if (key.startsWith("Arrow")) { event.preventDefault(); navigate(key); }
                return;
            }
            if (ctrl && lower === "c") { if (selected) { event.preventDefault(); copyBranch(false); } return; }
            if (ctrl && lower === "x") { if (selected) { event.preventDefault(); copyBranch(true); } return; }
            if (ctrl && lower === "v") {
                // L'évènement « paste » fournit le texte ; repli sur la branche copiée s'il ne vient pas
                pasteHandled = false;
                setTimeout(() => { if (!pasteHandled && clipboard) pasteBranch(null); }, 80);
                return;
            }
            if (ctrl && lower === "d") { event.preventDefault(); duplicate(); return; }
            if (ctrl && lower === "b") { event.preventDefault(); runAction("bold"); return; }
            if (ctrl && lower === "i") { event.preventDefault(); runAction("italic"); return; }
            if (ctrl || event.altKey && !key.startsWith("Arrow")) return;

            if (event.altKey && (key === "ArrowUp" || key === "ArrowDown")) { event.preventDefault(); moveSibling(key === "ArrowUp" ? -1 : 1); return; }
            if (key === "Tab" || key === "Insert") { event.preventDefault(); addChild(); return; }
            if (key === "Enter") { event.preventDefault(); if (selected) addSibling(event.shiftKey); else select(data.root.id); return; }
            if (key === "Delete" || key === "Backspace") { event.preventDefault(); removeSelected(); return; }
            if (key === "F2" || key === " ") { event.preventDefault(); if (selected) startEdit(selected); else select(data.root.id); return; }
            if (key === "/") { event.preventDefault(); toggleCollapse(); return; }
            if (key === "Home") { event.preventDefault(); fit({ maxZoom: fullscreen ? 1.3 : 1 }); return; }
            if (key.startsWith("Arrow")) { event.preventDefault(); navigate(key); return; }
            if (key === "ContextMenu" && selected) {
                event.preventDefault();
                const element = nodeLayer.querySelector(`.mm-node[data-id="${selected}"]`);
                const rect = element?.getBoundingClientRect();
                if (rect) openContextMenu(rect.left + rect.width / 2, rect.bottom);
                return;
            }
            if (key.length === 1 && selected) {
                // Taper directement remplace le texte (comme dans un tableur)
                event.preventDefault();
                startEdit(selected, { replace: key });
            }
        });

        let pasteHandled = false;
        viewport.addEventListener("paste", event => {
            if (event.target !== viewport) return;
            pasteHandled = true;
            event.preventDefault();
            pasteBranch(event.clipboardData?.getData("text/plain") || null);
        });

        viewport.addEventListener("focus", () => onFocus());
        root.addEventListener("focusin", () => onFocus());

        document.addEventListener("pointerdown", event => {
            if (!contextMenu.hidden && !contextMenu.contains(event.target)) closeContextMenu();
        });

        if ("ResizeObserver" in window) {
            new ResizeObserver(() => {
                if (!root.isConnected) return;
                if (dirty) render();
                if (!fitted && boxes.size) fit();
            }).observe(viewport);
        }

        /* ---------- Interface pour le notebook ---------- */

        return {
            getValue: () => JSON.stringify(data),
            setValue: value => {
                data = normalize(value);
                undoStack = [];
                redoStack = [];
                selected = null;
                selectedLink = null;
                render();
                fit();
            },
            focus: () => {
                viewport.focus({ preventScroll: true });
                if (!selected) select(data.root.id);
            },
            refresh: () => {
                render();
                if (!fitted) fit();
            },
            markLine: () => {},
            unmarkLine: () => {},
            raw: null,
            // Pour les tests et le mode développeur
            api: {
                get data() { return data; },
                select, addChild, addSibling, removeSelected, undo, redo, setLayout, applyTemplate, exportAs, buildSVG, fit, toggleRevision, startEdit, finishEdit,
                get selected() { return selected; },
                get zoom() { return zoom; }
            }
        };
    }

    window.NsiMindMap = { create, normalize, toMarkdown, fromText, defaultData, TEMPLATES };
})();
