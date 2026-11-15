#!/usr/bin/env python3
"""
Génère theme-light.css (thème clair de NSI Hub) à partir des feuilles de style du site.

Le thème sombre reste la référence : ce script lit chaque fichier .css, repère les
couleurs écrites en dur et produit pour chacune une règle « html.theme-light … »
avec une couleur adaptée au fond clair. Les retouches faites à la main sont dans
MANUEL (en bas de ce fichier) et sont ajoutées à la fin.

À relancer après une modification des couleurs dans un fichier .css :
    pip install tinycss2
    python3 scripts/theme-clair.py
"""

import colorsys
import re
from pathlib import Path

import tinycss2

RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / "theme-light.css"
FICHIERS = sorted(p for p in RACINE.glob("*.css") if p.name != SORTIE.name)

PROPRIETES_TEXTE = {"color", "caret-color", "fill", "stroke", "text-decoration-color", "-webkit-text-fill-color"}
PROPRIETES_FOND = {"background", "background-color", "background-image"}
PROPRIETES_BORDURE = {
    "border", "border-color", "border-top", "border-right", "border-bottom", "border-left",
    "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "outline", "outline-color", "column-rule", "border-inline", "border-block",
}
PROPRIETES_OMBRE = {"box-shadow", "text-shadow", "filter"}
PROPRIETES_COULEUR = PROPRIETES_TEXTE | PROPRIETES_FOND | PROPRIETES_BORDURE | PROPRIETES_OMBRE | {"scrollbar-color", "accent-color"}

COULEUR = re.compile(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|rgba?\(\s*[^)]*\)|\bwhite\b|\bblack\b", re.I)
VARIABLES_ACCENT = re.compile(r"var\(--(blue|purple|green|orange|yellow|cyan|pink|red|primary|accent)\b")

ENCRE = (15, 23, 42)  # couleur des voiles et ombres en thème clair (slate-900)


def lire_couleur(token):
    t = token.strip().lower()
    if t == "white":
        return 255, 255, 255, 1.0
    if t == "black":
        return 0, 0, 0, 1.0
    if t.startswith("#"):
        h = t[1:]
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return r, g, b, a
    nums = re.findall(r"[\d.]+%?", t)
    vals = []
    for n in nums[:3]:
        vals.append(round(float(n[:-1]) * 2.55) if n.endswith("%") else float(n))
    a = 1.0
    if len(nums) > 3:
        a = float(nums[3][:-1]) / 100 if nums[3].endswith("%") else float(nums[3])
    return int(vals[0]), int(vals[1]), int(vals[2]), a


def ecrire_couleur(r, g, b, a):
    r, g, b = (max(0, min(255, round(x))) for x in (r, g, b))
    if a >= 0.999:
        return f"#{r:02x}{g:02x}{b:02x}"
    return f"rgba({r}, {g}, {b}, {round(a, 3):g})"


def hls(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return h, l, s


def depuis_hls(h, l, s, a):
    r, g, b = colorsys.hls_to_rgb(h, max(0, min(1, l)), max(0, min(1, s)))
    return ecrire_couleur(r * 255, g * 255, b * 255, a)


def neutre(r, g, b):
    # Gris et gris-bleus du thème (slate) : peu d'écart entre les composantes
    return max(r, g, b) - min(r, g, b) < 52


def convertir(token, propriete, fond_accent):
    r, g, b, a = lire_couleur(token)
    h, l, s = hls(r, g, b)
    gris = neutre(r, g, b)

    if propriete in PROPRIETES_OMBRE:
        if l < 0.25:  # ombres noires : beaucoup plus légères sur fond clair
            return ecrire_couleur(*ENCRE, a * 0.3)
        if l > 0.85 and gris:  # reflets blancs : invisibles sur blanc, on les assombrit légèrement
            return ecrire_couleur(*ENCRE, a * 0.5)
        return None

    if propriete in PROPRIETES_TEXTE:
        if l > 0.93 and gris and fond_accent:
            return None  # texte blanc sur bouton coloré : on le garde
        if gris:
            if l > 0.6:
                return depuis_hls(h, max(0.12, 1.06 - l), min(s, 0.35), a)
            return None
        if l > 0.62:  # couleurs pastel (lisibles sur fond sombre) → version foncée
            jaune = 0.09 <= h <= 0.2
            return depuis_hls(h, 0.3 if jaune else 0.42, max(s, 0.55), a)
        return None

    if propriete in PROPRIETES_FOND:
        if gris:
            if l < 0.32:  # fonds sombres → fonds clairs
                return depuis_hls(h, 1 - l * 0.42, min(s, 0.3), a)
            if l > 0.85 and a < 1:  # voiles blancs → voiles foncés
                return ecrire_couleur(*ENCRE, min(1, a * 0.9))
            return None
        if l < 0.22 and a > 0.5:  # fonds teintés très sombres → teinte pâle
            return depuis_hls(h, 0.94, s, a)
        return None

    if propriete in PROPRIETES_BORDURE:
        if gris:
            if l < 0.35:
                return depuis_hls(h, 0.86, min(s, 0.25), a)
            if l > 0.85 and a < 1:
                return ecrire_couleur(*ENCRE, min(1, a * 1.25))
            return None
        if l < 0.22:
            return depuis_hls(h, 0.82, s, a)
        return None

    if propriete == "scrollbar-color":
        if gris and l < 0.35:
            return depuis_hls(h, 0.82, min(s, 0.25), a)
    return None


def a_fond_accent(declarations):
    for decl in declarations:
        if decl.lower_name not in PROPRIETES_FOND:
            continue
        valeur = tinycss2.serialize(decl.value)
        if VARIABLES_ACCENT.search(valeur):
            return True
        for m in COULEUR.finditer(valeur):
            r, g, b, a = lire_couleur(m.group(0))
            h, l, s = hls(r, g, b)
            if s > 0.35 and 0.25 < l < 0.75 and a > 0.6:
                return True
    return False


def portee(selecteur):
    sel = selecteur.strip()
    if sel == ":root":
        return "html.theme-light"
    if sel.startswith("html"):
        reste = sel[4:]
        return "html.theme-light" + reste
    return "html.theme-light " + sel


def traiter_regle(regle, sortie, indentation=""):
    prelude = tinycss2.serialize(regle.prelude).strip()
    contenu = tinycss2.parse_blocks_contents(regle.content, skip_whitespace=True, skip_comments=True)
    declarations = [d for d in contenu if d.type == "declaration"]
    fond_accent = a_fond_accent(declarations)
    lignes = []
    for decl in declarations:
        nom = decl.lower_name
        if nom.startswith("--") or nom not in PROPRIETES_COULEUR:
            continue
        valeur = tinycss2.serialize(decl.value).strip()
        change = False

        def remplacer(m):
            nonlocal change
            nouveau = convertir(m.group(0), nom, fond_accent)
            if nouveau is None:
                return m.group(0)
            change = True
            return nouveau

        nouvelle = COULEUR.sub(remplacer, valeur)
        if change:
            lignes.append(f"{indentation}    {nom}: {nouvelle}{' !important' if decl.important else ''};")
    # Sur un fond coloré plein, le texte reste blanc (en sombre il héritait de --text, qui était blanc)
    couleurs_texte = [tinycss2.serialize(d.value).strip() for d in declarations if d.lower_name == "color"]
    if fond_accent and (not couleurs_texte or any("var(--text)" in c for c in couleurs_texte)):
        lignes.append(f"{indentation}    color: #fff;")
    if lignes:
        selecteurs = ",\n".join(indentation + portee(s) for s in prelude.split(",") if s.strip())
        sortie.append(f"{selecteurs} {{\n" + "\n".join(lignes) + f"\n{indentation}}}\n")


def traiter(regles, sortie, indentation=""):
    for regle in regles:
        if regle.type == "qualified-rule":
            traiter_regle(regle, sortie, indentation)
        elif regle.type == "at-rule" and regle.lower_at_keyword in ("media", "supports") and regle.content:
            interne = []
            enfants = tinycss2.parse_rule_list(regle.content, skip_whitespace=True, skip_comments=True)
            traiter(enfants, interne, indentation + "    ")
            if interne:
                sortie.append(f"@{regle.lower_at_keyword} {tinycss2.serialize(regle.prelude).strip()} {{\n" + "\n".join(interne) + "}\n")


MANUEL = """
/* ==============================
   RETOUCHES MANUELLES
============================== */

html.theme-light {
    --background: #f4f6fb;
    --surface: #ffffff;
    --surface-light: #eef2f7;
    --border: rgba(15, 23, 42, 0.11);
    --text: #0f172a;
    --text-secondary: #475569;
}

html.theme-light ::selection {
    background: rgba(99, 102, 241, 0.25);
}
"""


def main():
    morceaux = [
        "/* =========================================================\n"
        "   NSI HUB — THÈME CLAIR\n"
        "   Fichier généré par scripts/theme-clair.py : ne pas modifier à la main,\n"
        "   modifier le script (section MANUEL) puis le relancer.\n"
        "   ========================================================= */\n"
    ]
    for fichier in FICHIERS:
        regles = tinycss2.parse_stylesheet(fichier.read_text(encoding="utf-8"), skip_whitespace=True, skip_comments=True)
        sortie = []
        traiter(regles, sortie)
        if sortie:
            morceaux.append(f"\n/* ---------- {fichier.name} ---------- */\n\n" + "\n".join(sortie))
    morceaux.append(MANUEL)
    SORTIE.write_text("".join(morceaux), encoding="utf-8")
    print(f"{SORTIE.name} : {sum(m.count('{') for m in morceaux)} règles")


if __name__ == "__main__":
    main()
