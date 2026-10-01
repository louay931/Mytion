"""Génère les courbes théoriques / simulées du rapport (figures/*.svg).

Toutes les courbes sont calculées à partir des modèles physiques décrits dans
le rapport (atmosphère standard ISA, Bernoulli, intégration inertielle).
Ce ne sont PAS des mesures : les mesures du montage sont à ajouter par le binôme.

Usage : python3 gen_figures.py
"""
import os

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

OUT = os.path.join(os.path.dirname(__file__), "figures")
os.makedirs(OUT, exist_ok=True)

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 10,
    "axes.grid": True,
    "grid.alpha": 0.3,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "svg.fonttype": "none",
})
C1, C2, C3, C4 = "#1f5fa8", "#d1495b", "#2a9d8f", "#6c757d"

# --- Constantes ISA (ISO 2533) ---
P0, T0, RHO0 = 101325.0, 288.15, 1.225
L, R, G = 0.0065, 287.053, 9.80665


def isa(h):
    """Pression (Pa), température (K), masse volumique (kg/m3) en troposphère."""
    T = T0 - L * h
    P = P0 * (T / T0) ** (G / (R * L))
    return P, T, P / (R * T)


def save(fig, name):
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, name), format="svg", bbox_inches="tight")
    plt.close(fig)


# 1. Altitude en fonction de la pression -----------------------------------
h = np.linspace(0, 11000, 300)
P, _, _ = isa(h)
fig, ax = plt.subplots(figsize=(6.4, 3.6))
ax.plot(P / 100, h / 1000, color=C1, lw=2, label="Atmosphère standard ISA")
ax.plot(P / 100, (P0 - P) / (RHO0 * G) / 1000, "--", color=C2, lw=1.5,
        label="Approximation linéaire (ρ constante)")
for hp, txt in [(0, "1013 hPa"), (5500, "≈ 505 hPa"), (11000, "≈ 226 hPa")]:
    pp, _, _ = isa(hp)
    ax.plot(pp / 100, hp / 1000, "o", color=C1)
    ax.annotate(txt, (pp / 100, hp / 1000), textcoords="offset points",
                xytext=(8, 4), fontsize=9)
ax.set_xlabel("Pression statique (hPa)")
ax.set_ylabel("Altitude (km)")
ax.set_ylim(0, 12)
ax.invert_xaxis()
ax.legend(loc="lower right", fontsize=9)
save(fig, "altitude_pression.svg")

# 2. Vitesse en fonction de la pression dynamique --------------------------
q = np.linspace(0, 2000, 300)
fig, ax = plt.subplots(figsize=(6.4, 3.6))
_, _, rho11 = isa(11000)
ax.plot(q, np.sqrt(2 * q / RHO0) * 3.6, color=C1, lw=2,
        label=f"Niveau de la mer (ρ = {RHO0:.3f} kg/m³)")
ax.plot(q, np.sqrt(2 * q / rho11) * 3.6, color=C2, lw=2,
        label=f"11 000 m (ρ = {rho11:.3f} kg/m³)")
ax.axvspan(0, 2000, color=C3, alpha=0.06)
ax.text(1000, 40, "Plage du capteur MPXV7002DP (0 à 2 kPa)",
        ha="center", fontsize=8.5, color=C3)
ax.set_xlabel("Pression dynamique q = Pt − Ps (Pa)")
ax.set_ylabel("Vitesse (km/h)")
ax.legend(loc="upper left", fontsize=9)
save(fig, "vitesse_pression.svg")

# 3. Dérive inertielle à court terme (double intégration d'un biais) -------
t = np.linspace(0, 120, 300)
fig, ax = plt.subplots(figsize=(6.4, 3.4))
for b, c, lab in [(0.05, C2, "MEMS grand public calibré (b ≈ 0,05 m/s²)"),
                  (0.01, C1, "MEMS haut de gamme (b ≈ 0,01 m/s²)"),
                  (0.001, C3, "Classe navigation (b ≈ 0,001 m/s²)")]:
    ax.plot(t, 0.5 * b * t ** 2, color=c, lw=2, label=lab)
ax.set_xlabel("Temps (s)")
ax.set_ylabel("Erreur de position (m)")
ax.legend(loc="upper left", fontsize=9)
save(fig, "derive_court_terme.svg")

# 4. Oscillation de Schuler vs modèle naïf en t² --------------------------
Rt = 6.371e6
ws = np.sqrt(G / Rt)
t = np.linspace(0, 7200, 600)
b = 0.001
fig, ax = plt.subplots(figsize=(6.4, 3.4))
ax.plot(t / 60, 0.5 * b * t ** 2 / 1000, "--", color=C4, lw=1.5,
        label="Modèle naïf ½·b·t² (Terre plate)")
ax.plot(t / 60, b / ws ** 2 * (1 - np.cos(ws * t)) / 1000, color=C1, lw=2,
        label="Avec la boucle de Schuler (période 84,4 min)")
ax.set_ylim(0, 6)
ax.set_xlabel("Temps (min)")
ax.set_ylabel("Erreur de position (km)")
ax.legend(loc="upper left", fontsize=9)
save(fig, "schuler.svg")

# 5. Fusion inertie + GPS (simulation 1D, filtre de Kalman) ---------------
rng = np.random.default_rng(7)
dt, N = 0.1, 1200            # 120 s à 10 Hz
tt = np.arange(N) * dt
a_true = 0.3 * np.sin(2 * np.pi * tt / 60)
v_true = np.cumsum(a_true) * dt + 5
x_true = np.cumsum(v_true) * dt
a_meas = a_true + 0.05 + rng.normal(0, 0.05, N)   # biais + bruit
x_gps = x_true + rng.normal(0, 3.0, N)            # GPS : sigma 3 m, 1 Hz

x_ins = np.zeros(N); v_ins = np.zeros(N)
x_ins[0], v_ins[0] = 0, 5
X = np.array([0.0, 5.0]); Pk = np.eye(2)
F = np.array([[1, dt], [0, 1]]); B = np.array([0.5 * dt ** 2, dt])
Q = np.diag([1e-4, 4e-3]); Hm = np.array([[1.0, 0.0]]); Rm = 9.0
x_kf = np.zeros(N)
for k in range(1, N):
    v_ins[k] = v_ins[k - 1] + a_meas[k] * dt
    x_ins[k] = x_ins[k - 1] + v_ins[k] * dt
    X = F @ X + B * a_meas[k]
    Pk = F @ Pk @ F.T + Q
    if k % 10 == 0:                               # mise à jour GPS à 1 Hz
        S = Hm @ Pk @ Hm.T + Rm
        K = Pk @ Hm.T / S
        X = X + (K * (x_gps[k] - X[0])).ravel()
        Pk = (np.eye(2) - K @ Hm) @ Pk
    x_kf[k] = X[0]

fig, ax = plt.subplots(figsize=(6.4, 3.6))
sel = np.arange(0, N, 10)
ax.plot(tt[sel], x_gps[sel] - x_true[sel], ".", color=C4, ms=4,
        label="GPS seul (bruité, 1 Hz)")
ax.plot(tt, x_ins - x_true, color=C2, lw=2, label="Centrale inertielle seule (dérive)")
ax.plot(tt, x_kf - x_true, color=C1, lw=2, label="Fusion par filtre de Kalman")
ax.axhline(0, color="black", lw=0.8)
ax.set_ylim(-15, 60)
ax.set_xlabel("Temps (s)")
ax.set_ylabel("Erreur de position (m)")
ax.legend(loc="upper left", fontsize=9)
save(fig, "fusion_kalman.svg")

print("Figures générées dans", OUT)
for hh in (0, 1000, 3000, 5500, 11000):
    p, T, rho = isa(hh)
    print(f"h={hh:6d} m  P={p/100:7.1f} hPa  T={T-273.15:6.1f} °C  rho={rho:.3f}")
print("Rapport TAS/EAS à 11 km :", round(np.sqrt(RHO0 / isa(11000)[2]), 3))
print("q à 250 km/h (Pa) :", round(0.5 * RHO0 * (250 / 3.6) ** 2))
print("Période de Schuler (min) :", round(2 * np.pi / ws / 60, 1))
