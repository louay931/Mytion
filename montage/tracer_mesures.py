"""Trace les mesures enregistrées par mini_centrale.ino.

Usage : python3 tracer_mesures.py mesures.csv
Produit mesures_derive.png, mesures_attitude.png et mesures_pitot_alt.png.
Les lignes commençant par '#' (messages du programme) sont ignorées.
"""
import csv
import sys
from pathlib import Path

import matplotlib.pyplot as plt


def lire(chemin):
    with open(chemin, newline="", encoding="utf-8") as f:
        lignes = [l for l in f if l.strip() and not l.startswith("#")]
    lecteur = csv.DictReader(lignes)
    data = {}
    for ligne in lecteur:
        try:
            valeurs = {k: float(v) for k, v in ligne.items()}
        except (TypeError, ValueError):
            continue  # ligne tronquée
        for k, v in valeurs.items():
            data.setdefault(k, []).append(v)
    return data


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    d = lire(src)
    t = d["t_s"]
    base = src.with_suffix("")

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(7, 6), sharex=True)
    ax1.plot(t, d["x_m"], label="position x (double intégration)")
    ax1.plot(t, d["vx_ms"], label="vitesse vx (simple intégration)")
    ax1.set_ylabel("m ou m/s")
    ax1.set_title("Dérive inertielle — capteur immobile")
    ax1.legend()
    ax2.plot(t, d["roulis_gyro_deg"], label="roulis, gyromètre seul")
    ax2.plot(t, d["roulis_deg"], label="roulis, filtre complémentaire")
    ax2.set_xlabel("temps (s)")
    ax2.set_ylabel("angle (°)")
    ax2.legend()
    fig.tight_layout()
    fig.savefig(f"{base}_derive.png", dpi=150)

    fig, ax = plt.subplots(figsize=(7, 3.5))
    ax.plot(t, d["roulis_deg"], label="roulis")
    ax.plot(t, d["tangage_deg"], label="tangage")
    ax.set_xlabel("temps (s)")
    ax.set_ylabel("angle (°)")
    ax.legend()
    fig.tight_layout()
    fig.savefig(f"{base}_attitude.png", dpi=150)

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(7, 6), sharex=True)
    ax1.plot(t, d["v_pitot_ms"])
    ax1.set_ylabel("vitesse Pitot (m/s)")
    ax2.plot(t, d["alt_m"])
    ax2.set_ylabel("altitude relative (m)")
    ax2.set_xlabel("temps (s)")
    fig.tight_layout()
    fig.savefig(f"{base}_pitot_alt.png", dpi=150)
    print("Figures écrites à côté de", src)


if __name__ == "__main__":
    main()
