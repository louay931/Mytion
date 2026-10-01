# Capteurs de navigation aéronautiques

Projet d'approfondissement (sujet libre) : **comment un avion sait-il où il est et à quelle vitesse il vole ?**
Sondes Pitot, altimètres, centrales inertielles (MEMS, gyrolaser), GNSS, fusion de données et cas de l'AF447.

## Contenu

| Chemin | Description |
| --- | --- |
| `rapport/rapport.pdf` | Rapport écrit (19 pages, A4), suivant la trame du projet bibliographique |
| `rapport/rapport.html` | Source du rapport (à modifier, puis reconstruire le PDF) |
| `rapport/gen_figures.py` | Calcul des courbes théoriques/simulées (ISA, Bernoulli, dérive, Schuler, Kalman) |
| `rapport/build.py`, `rapport/render.mjs` | Génération du PDF (Chromium via Playwright) et numéros de page du sommaire |
| `montage/mini_centrale/mini_centrale.ino` | Programme Arduino de la mini-centrale (MPU6050, BMP280, MPXV7002DP, GPS NEO-6M en option) |
| `montage/tracer_mesures.py` | Tracé des mesures CSV enregistrées par le montage |

## Reconstruire le PDF

```bash
pip install matplotlib numpy pypdf
npm install -g playwright   # Chromium nécessaire
cd rapport && python3 build.py
```

## À faire par le binôme

- Remplir les champs surlignés en jaune (noms, professeur, date) et compléter l'encadré « Usage de l'IA ».
- Réaliser le montage, ajouter **vos propres mesures** et courbes dans la partie 4.4.
- Vérifier la bibliographie (dates de consultation).
- La présentation PowerPoint doit être faite par vous-mêmes, sans IA (consigne du projet).
