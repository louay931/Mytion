"""Construit rapport.pdf à partir de rapport.html.

1. Régénère les figures (gen_figures.py).
2. Premier rendu PDF, puis recherche de la page de chaque titre.
3. Inscrit les numéros de page dans le sommaire et refait le rendu.

Prérequis : python3 + matplotlib + numpy + pypdf, node + playwright (Chromium).
Usage : python3 build.py
"""
import re
import subprocess
import sys
from pathlib import Path

from pypdf import PdfReader

ICI = Path(__file__).resolve().parent
SRC = ICI / "rapport.html"
TMP = ICI / "_rapport_build.html"
OUT = ICI / "rapport.pdf"


def norm(s):
    s = s.replace("\ufb01", "fi").replace("\ufb02", "fl")
    return re.sub(r"\s+", " ", s).strip().lower()


def render(html):
    TMP.write_text(html, encoding="utf-8")
    subprocess.run(["node", str(ICI / "render.mjs"), str(TMP), str(OUT)], check=True)


def main():
    subprocess.run([sys.executable, str(ICI / "gen_figures.py")], check=True)
    html = SRC.read_text(encoding="utf-8")

    # Entrées du sommaire : <li><a href="#id">Texte</a>
    entrees = re.findall(r'<li><a href="#([\w-]+)">([^<]+)</a>', html)

    def avec_numeros(pages):
        def rempl(m):
            ident, texte = m.group(1), m.group(2)
            num = pages.get(ident, "")
            return (f'<li><a href="#{ident}"><span>{texte}</span>'
                    f'<span class="pts"></span><span>{num}</span></a>')
        return re.sub(r'<li><a href="#([\w-]+)">([^<]+)</a>', rempl, html)

    render(avec_numeros({e[0]: "00" for e in entrees}))
    textes = [norm(p.extract_text() or "") for p in PdfReader(str(OUT)).pages]

    pages = {}
    debut = 2  # on ignore la couverture et le sommaire
    for ident, texte in entrees:
        cle = norm(texte.replace("&nbsp;", " ").replace("&#39;", "'"))[:28]
        if ident == "ia":
            pages[ident] = 2
            continue
        for i in range(debut, len(textes)):
            if cle in textes[i]:
                pages[ident] = i + 1
                debut = i
                break
        else:
            print("  titre introuvable dans le PDF :", texte)

    render(avec_numeros(pages))
    TMP.unlink()
    n = len(PdfReader(str(OUT)).pages)
    print(f"{OUT.name} : {n} pages")
    for ident, texte in entrees:
        print(f"  p.{pages.get(ident, '?'):>3}  {texte}")
    if n > 20:
        print("ATTENTION : plus de 20 pages (consigne : 20 max).")


if __name__ == "__main__":
    main()
