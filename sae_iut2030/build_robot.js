// Génère SAE_IUT2030_robot_accueil.pptx : node build_pptx.js
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
const OUT = path.join(__dirname, "SAE_IUT2030_robot_accueil.pptx");

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625
  pres.title = "Robot d'accueil intelligent – SAE IUT 2030";
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
  s.addText("Robot d'accueil intelligent de l'IUT", { placeholder: "title" });
  s.addText("Un robot qui répond aux questions et guide les visiteurs jusqu'à la bonne salle", { placeholder: "subtitle" });
  s.addText([
    { text: "SAE – IUT 2030 – Thèmes : Robotique, IA et Université du futur", options: { breakLine: true } },
    { text: "[Nom Prénom], [Nom Prénom], [Nom Prénom]" },
  ], { placeholder: "team" });
  s.addNotes("Présenter le projet en une phrase : un robot qui accueille les nouveaux étudiants et les visiteurs, comprend leurs questions à l'oral et les accompagne jusqu'à la bonne salle.");

  // ---- Slide 2
  pres.addSection({ title: "Problématique" });
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Problématique" });
  s.addText("Problématique", { placeholder: "title" });
  s.addText("Comment accueillir et orienter chaque personne qui arrive à l'IUT, à tout moment, sans mobiliser le personnel ?",
    { isTextBox: true, x: 0.5, y: 1.3, w: 9.0, h: 0.8, fontSize: 18, italic: true, color: C.text1, valign: "top" });
  s.addText(bullets([
    "Les nouveaux étudiants se perdent les premières semaines (salles, amphis, secrétariats)",
    "Aux portes ouvertes, les visiteurs et les parents ne savent pas à qui poser leurs questions",
    "L'accueil n'est pas toujours disponible (pauses, fin de journée, files d'attente)",
    "Les étudiants étrangers ou en situation de handicap ont besoin d'un accueil adapté",
  ]), { isTextBox: true, x: 0.5, y: 2.25, w: 9.0, h: 2.6, fontSize: 18, color: C.text1, paraSpaceAfter: 10, valign: "top" });
  s.addNotes("Le besoin concerne tous les départements et tous les publics : nouveaux étudiants, visiteurs, parents, intervenants. En 2030, l'IUT doit pouvoir accueillir en continu et dans plusieurs langues.");

  // ---- Slide 3
  pres.addSection({ title: "Solution" });
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Solution" });
  s.addText("Solution envisagée", { placeholder: "title" });
  s.addText([
    { text: "Le robot :", options: { bold: true, breakLine: true } },
    { text: "Base mobile à roues + LiDAR et ultrasons pour éviter les obstacles", options: { bullet: true, breakLine: true } },
    { text: "Écran tactile, micro et haut-parleur", options: { bullet: true, breakLine: true } },
    { text: "Raspberry Pi pour l'IA, microcontrôleur pour les moteurs", options: { bullet: true, breakLine: true } },
    { text: "L'IA :", options: { bold: true, breakLine: true } },
    { text: "comprend la question à l'oral («\u00a0où est l'amphi\u00a0B\u00a0?\u00a0»)", options: { bullet: true, breakLine: true } },
    { text: "répond avec les infos de l'IUT, en plusieurs langues", options: { bullet: true, breakLine: true } },
    { text: "accompagne la personne jusqu'à la salle", options: { bullet: true } },
  ], { isTextBox: true, x: 0.5, y: 1.25, w: 5.95, h: 3.8, fontSize: 15, color: C.text1, paraSpaceAfter: 4, valign: "top" });

  // petit schéma
  const box = (label, y) => {
    s.addShape(pres.shapes.RECTANGLE, { objectName: label, x: 6.6, y, w: 2.8, h: 0.6, fill: { color: C.background2 }, line: { color: C.text2, width: 1 } });
    s.addText(label, { isTextBox: true, x: 6.6, y, w: 2.8, h: 0.6, fontSize: 14, color: C.text1, align: "center", valign: "middle" });
  };
  const arrow = (y) => s.addShape(pres.shapes.LINE, { objectName: "Flèche", x: 8.0, y, w: 0, h: 0.4, line: { color: C.text2, width: 1.5, endArrowType: "triangle" } });
  box("Question à l'oral", 1.4); arrow(2.0);
  box("IA : comprend et répond", 2.4); arrow(3.0);
  box("Réponse + guidage", 3.4);

  s.addText("Étape 1 : il répond à la voix. Étape 2 : il se déplace seul.",
    { isTextBox: true, x: 6.6, y: 4.15, w: 2.8, h: 0.8, fontSize: 13, italic: true, color: C.text1, align: "center", valign: "top" });
  s.addNotes("Périmètre réaliste sur l'année : d'abord un robot fixe qui comprend les questions et répond (reconnaissance vocale + IA), ensuite la base mobile qui navigue dans un couloir grâce au LiDAR (cartographie). Démo prévue : on pose une question au robot, il répond puis avance vers la salle demandée. Côté ESE : commande des moteurs, capteurs, alimentation sur batterie, électronique embarquée.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK", OUT);
})();
