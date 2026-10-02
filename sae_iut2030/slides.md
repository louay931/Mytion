# SAE IUT 2030 – Boîtier de salle connecté

Thématiques : Objets connectés (IoT) + Université du futur · Parcours ESE
Équipe : [Nom Prénom], [Nom Prénom], [Nom Prénom]

## Slide 1 – Titre
**Boîtier de salle connecté : émargement sécurisé, occupation des salles et détection d'intrusion**

## Slide 2 – Problématique
L'IUT ne sait pas en temps réel qui est présent, quelles salles sont vraiment utilisées, ni si des personnes non autorisées s'y trouvent.

- **Émargement** : feuille papier lente, falsifiable (on signe pour un absent), saisie manuelle.
- **Occupation** : salles réservées mais vides, salles libres introuvables, chauffage/éclairage inutiles, air mal renouvelé.
- **Intrusion** : salle utilisée hors créneau, personnes non inscrites au cours, aucune alerte aujourd'hui.

## Slide 3 – Solution technologique
Un boîtier ESP32 par salle, un serveur qui croise les données.

1. **Dans la salle** : lecteur NFC pour la carte étudiante, présence (radar mmWave ou PIR), CO2 et température, compteur de passage à la porte (2 capteurs ToF).
2. **Serveur** : données en MQTT (Wi-Fi), croisement émargement / comptage / emploi du temps, tableau de bord (salles libres/occupées, présents, qualité de l'air).
3. **Alertes intrusion** : présence hors créneau ; 25 comptés / 22 émargés → 3 non identifiés ; carte d'un étudiant hors du groupe → refusée et signalée.

Sans caméra : le système sait qu'il y a un intrus et combien, pas qui → pas de surveillance vidéo, compatible RGPD.

Version en ligne des slides : https://claude.ai/artifact/BSaCvUpMptWbn3GMSKHRrp
