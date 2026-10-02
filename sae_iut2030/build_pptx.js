// Génère SAE_IUT2030_boitier_salle.pptx : node build_pptx.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const THEME = {
  name: "Simple",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "222222", lt1: "FFFFFF", dk2: "1F3864", lt2: "F2F2F2",
    accent1: "1F3864", accent2: "4472C4", accent3: "A5A5A5", accent4: "ED7D31",
    accent5: "70AD47", accent6: "5B9BD5", hlink: "0563C1", folHlink: "954F72",
  },
};
const OUT = path.join(__dirname, "SAE_IUT2030_boitier_salle.pptx");

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625
  pres.title = "Boîtier de salle connecté – SAE IUT 2030";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "Titre",
    background: { color: C.background1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.75, y: 1.5, w: 8.5, h: 1.0, fontSize: 36, bold: true, color: C.text2, align: "center", valign: "middle" }, text: "" } },
      { placeholder: { options: { name: "subtitle", type: "body", x: 0.75, y: 2.5, w: 8.5, h: 0.8, fontSize: 20, color: C.text1, align: "center", valign: "top" }, text: "" } },
      { placeholder: { options: { name: "team", type: "body", x: 0.75, y: 4.0, w: 8.5, h: 0.9, fontSize: 16, color: C.text1, align: "center", valign: "top" }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "Contenu",
    background: { color: C.background1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.35, w: 9.0, h: 0.8, fontSize: 30, bold: true, color: C.text2, valign: "middle" }, text: "" } },
    ],
    slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 11, color: C.text1, align: "right" },
  });

  const bullets = (items, size) => items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } }));

  // ---- Slide 1
  pres.addSection({ title: "Titre" });
  let s = pres.addSlide({ masterName: "Titre", sectionTitle: "Titre" });
  s.addText("Boîtier de salle connecté", { placeholder: "title" });
  s.addText("Émargement, occupation des salles et détection d'intrusion", { placeholder: "subtitle" });
  s.addText([
    { text: "SAE – IUT 2030 – Thèmes : IoT et Université du futur", options: { breakLine: true } },
    { text: "[Nom Prénom], [Nom Prénom], [Nom Prénom]" },
  ], { placeholder: "team" });
  s.addNotes("Présenter le projet en une phrase : un boîtier par salle qui sait qui est là, si la salle est vraiment utilisée, et s'il y a des personnes non autorisées.");

  // ---- Slide 2
  pres.addSection({ title: "Problématique" });
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Problématique" });
  s.addText("Problématique", { placeholder: "title" });
  s.addText("Comment savoir en temps réel qui est présent dans une salle, si elle est vraiment utilisée et si des personnes non autorisées s'y trouvent ?",
    { isTextBox: true, x: 0.5, y: 1.3, w: 9.0, h: 0.8, fontSize: 18, italic: true, color: C.text1, valign: "top" });
  s.addText(bullets([
    "L'émargement papier est lent et on peut signer pour un absent",
    "Des salles sont réservées mais vides, et on ne trouve pas les salles libres",
    "Chauffage et lumière restent allumés dans des salles vides",
    "Des personnes peuvent utiliser une salle hors cours ou s'incruster sans être inscrites",
  ]), { isTextBox: true, x: 0.5, y: 2.25, w: 9.0, h: 2.6, fontSize: 18, color: C.text1, paraSpaceAfter: 10, valign: "top" });
  s.addNotes("Les trois problèmes ont la même cause : on n'a pas de données fiables sur ce qui se passe dans les salles. La détection d'intrusion répond à une demande de l'équipe pédagogique.");

  // ---- Slide 3
  pres.addSection({ title: "Solution" });
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Solution" });
  s.addText("Solution envisagée", { placeholder: "title" });
  s.addText([
    { text: "Un boîtier ESP32 dans chaque salle :", options: { bold: true, breakLine: true } },
    { text: "Lecteur NFC : l'étudiant badge avec sa carte étudiante", options: { bullet: true, breakLine: true } },
    { text: "Capteur de présence (PIR ou radar) et capteur de CO2", options: { bullet: true, breakLine: true } },
    { text: "Compteur d'entrées/sorties à la porte", options: { bullet: true, breakLine: true } },
    { text: "Le serveur compare avec l'emploi du temps :", options: { bold: true, breakLine: true } },
    { text: "quelqu'un dans la salle hors créneau", options: { bullet: true, breakLine: true } },
    { text: "plus de personnes comptées que d'émargés", options: { bullet: true, breakLine: true } },
    { text: "carte d'un étudiant qui n'est pas du groupe", options: { bullet: true } },
  ], { isTextBox: true, x: 0.5, y: 1.25, w: 5.95, h: 3.8, fontSize: 15, color: C.text1, paraSpaceAfter: 4, valign: "top" });

  // petit schéma
  const box = (label, y) => {
    s.addShape(pres.shapes.RECTANGLE, { objectName: label, x: 6.6, y, w: 2.8, h: 0.6, fill: { color: C.background2 }, line: { color: C.text2, width: 1 } });
    s.addText(label, { isTextBox: true, x: 6.6, y, w: 2.8, h: 0.6, fontSize: 14, color: C.text1, align: "center", valign: "middle" });
  };
  const arrow = (y) => s.addShape(pres.shapes.LINE, { objectName: "Flèche", x: 8.0, y, w: 0, h: 0.4, line: { color: C.text2, width: 1.5, endArrowType: "triangle" } });
  box("Boîtier ESP32 (salle)", 1.4); arrow(2.0);
  box("Serveur (MQTT, Wi-Fi)", 2.4); arrow(3.0);
  box("Tableau de bord + alertes", 3.4);

  s.addText("Sans caméra : on sait combien de personnes sont en trop, pas qui (RGPD)",
    { isTextBox: true, x: 6.6, y: 4.15, w: 2.8, h: 0.8, fontSize: 13, italic: true, color: C.text1, align: "center", valign: "top" });
  s.addNotes("Le cœur du projet est l'émargement par carte étudiante (lecteur NFC RC522 sur l'ESP32) ; aucune caméra, ni dans la salle ni sur les téléphones. Si quelqu'un badge pour un absent, le compteur de la porte voit qu'il y a moins de personnes que de badges. L'occupation et l'intrusion sont des extensions avec le même boîtier. Les données se vérifient entre elles : 20 émargés mais salle vide = anomalie. Seul matériel en plus pour l'intrusion : le compteur à la porte. Démo prévue : une salle équipée avec un intrus simulé.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK", OUT);
})();
