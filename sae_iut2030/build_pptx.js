// Génère SAE_IUT2030_boitier_salle.pptx : node build_pptx.js
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const THEME = {
  name: "Boitier de salle",
  headFontFace: "Arial",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "13223A", lt1: "FFFFFF", dk2: "3E4A5C", lt2: "EEF1F5",
    accent1: "E8863A", accent2: "B4561B", accent3: "2F6FA7", accent4: "C9D3E0",
    accent5: "5B8C5A", accent6: "8A5A9E", hlink: "2F6FA7", folHlink: "8A5A9E",
  },
};
const OUT = path.join(__dirname, "SAE_IUT2030_boitier_salle.pptx");

async function icon(Comp, hex) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625
  pres.title = "Boîtier de salle connecté – SAE IUT 2030";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "Titre",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "eyebrow", type: "body", x: 0.6, y: 0.55, w: 8.8, h: 0.35, fontSize: 13, bold: true, color: C.accent1, charSpacing: 3, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.35, w: 8.8, h: 0.9, fontSize: 44, bold: true, color: C.background1, align: "left", margin: 0, valign: "top" }, text: "" } },
      { placeholder: { options: { name: "subtitle", type: "body", x: 0.6, y: 2.3, w: 8.8, h: 0.8, fontSize: 20, color: C.accent4, margin: 0, valign: "top" }, text: "" } },
      { placeholder: { options: { name: "team", type: "body", x: 5.4, y: 4.35, w: 4.0, h: 0.7, fontSize: 13, color: C.accent4, align: "right", margin: 0, valign: "bottom" }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "Contenu",
    background: { color: C.background2 },
    objects: [
      { placeholder: { options: { name: "eyebrow", type: "body", x: 0.5, y: 0.4, w: 9.0, h: 0.3, fontSize: 12, bold: true, color: C.accent2, charSpacing: 3, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.75, w: 9.0, h: 0.85, fontSize: 22, bold: true, color: C.text1, align: "left", margin: 0, valign: "top" }, text: "" } },
      { text: { text: "SAE IUT 2030 · Boîtier de salle connecté", options: { x: 0.5, y: 5.22, w: 6, h: 0.25, fontSize: 10, color: C.text2, margin: 0 } } },
    ],
    slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.25, fontSize: 10, color: C.text2, align: "right", margin: 0 },
  });

  const DARK = THEME.colors.dk1, ORANGE = THEME.colors.accent1;
  const shadow = () => ({ type: "outer", color: "13223A", opacity: 0.12, blur: 6, offset: 2, angle: 90 });
  const bullets = (items) => items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } }));

  // ---- Slide 1 : titre
  pres.addSection({ title: "Titre" });
  let s = pres.addSlide({ masterName: "Titre", sectionTitle: "Titre" });
  s.addText("SAE · IUT 2030 · PARCOURS ESE", { placeholder: "eyebrow" });
  s.addText("Boîtier de salle connecté", { placeholder: "title" });
  s.addText("Émargement sécurisé, occupation des salles et détection d'intrusion", { placeholder: "subtitle" });
  s.addText([{ text: "Équipe : [Nom Prénom]", options: { breakLine: true } }, { text: "[Nom Prénom] · [Nom Prénom]" }], { placeholder: "team" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "Pastille IoT", x: 0.6, y: 4.6, w: 2.6, h: 0.45, rectRadius: 0.22, fill: { color: C.accent1 } });
  s.addText("Objets connectés (IoT)", { isTextBox: true, x: 0.6, y: 4.6, w: 2.6, h: 0.45, fontSize: 13, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "Pastille Université", x: 3.35, y: 4.6, w: 2.4, h: 0.45, rectRadius: 0.22, fill: { type: "none" }, line: { color: C.accent1, width: 1.5 } });
  s.addText("Université du futur", { isTextBox: true, x: 3.35, y: 4.6, w: 2.4, h: 0.45, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0 });
  s.addNotes("Présenter le projet en une phrase : un boîtier par salle qui sait qui est là, si la salle est vraiment utilisée, et s'il y a des personnes non autorisées. Deux thématiques couvertes : IoT et Université du futur.");

  // ---- Slide 2 : problématique
  pres.addSection({ title: "Problématique" });
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Problématique" });
  s.addText("LA PROBLÉMATIQUE", { placeholder: "eyebrow" });
  s.addText("L'IUT ne sait pas en temps réel qui est présent, quelles salles sont vraiment utilisées, ni si des personnes non autorisées s'y trouvent.", { placeholder: "title" });
  const probs = [
    { t: "Émargement", ic: fa.FaClipboardList, c: DARK, items: ["Feuille papier lente à faire circuler", "Falsifiable : on signe pour un absent", "Saisie manuelle après le cours"] },
    { t: "Occupation", ic: fa.FaDoorOpen, c: DARK, items: ["Salles réservées mais vides", "Salles libres introuvables", "Chauffage et éclairage inutiles, air mal renouvelé"] },
    { t: "Intrusion", ic: fa.FaUserSecret, c: ORANGE, items: ["Salle utilisée hors créneau", "Personnes non inscrites au cours", "Aucune alerte aujourd'hui"] },
  ];
  for (let i = 0; i < 3; i++) {
    const p = probs[i], x = 0.5 + i * 3.1, y = 2.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "Carte " + p.t, x, y, w: 2.8, h: 2.85, rectRadius: 0.1, fill: { color: C.background1 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { objectName: "Cercle " + p.t, x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.6, fill: { color: p.c === ORANGE ? C.accent1 : C.text1 } });
    s.addImage({ data: await icon(p.ic, p.c === ORANGE ? DARK : "FFFFFF"), x: x + 0.4, y: y + 0.4, w: 0.3, h: 0.3, altText: p.t });
    s.addText(p.t, { isTextBox: true, x: x + 1.0, y: y + 0.25, w: 1.65, h: 0.6, fontSize: 18, bold: true, color: C.text1, fontFace: "+mj-lt", valign: "middle", margin: 0 });
    s.addText(bullets(p.items), { isTextBox: true, x: x + 0.25, y: y + 1.1, w: 2.35, h: 1.8, fontSize: 13, color: C.text2, paraSpaceAfter: 4, valign: "top", margin: 0 });
  }
  s.addNotes("Trois problèmes concrets, qui ont une cause commune : aucune donnée fiable sur ce qui se passe dans les salles. Insister sur le fait que l'intrusion est une demande de l'équipe pédagogique.");

  // ---- Slide 3 : solution
  pres.addSection({ title: "Solution" });
  s = pres.addSlide({ masterName: "Contenu", sectionTitle: "Solution" });
  s.addText("LA SOLUTION TECHNOLOGIQUE", { placeholder: "eyebrow" });
  s.addText("Un boîtier ESP32 par salle, un serveur qui croise les données", { placeholder: "title" });
  const steps = [
    { t: "Dans la salle", ic: fa.FaMicrochip, dark: false, items: ["QR code dynamique (5\u00a0s) + BLE", "Présence : radar mmWave ou PIR", "CO2 et température", "Compteur de passage (2 ToF)"] },
    { t: "Serveur", ic: fa.FaServer, dark: false, items: ["Données reçues en MQTT (Wi-Fi)", "Croise émargement, comptage et emploi du temps", "Tableau de bord : salles, présents, qualité de l'air"] },
    { t: "Alertes intrusion", ic: fa.FaBell, dark: true, items: ["Présence détectée hors créneau", "25 comptés, 22 émargés : 3 non identifiés", "Scan hors du groupe : refusé et signalé"] },
  ];
  const W = 2.65, GAP = 0.525;
  for (let i = 0; i < 3; i++) {
    const st = steps[i], x = 0.5 + i * (W + GAP), y = 1.65;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "Étape " + st.t, x, y, w: W, h: 2.65, rectRadius: 0.1, fill: { color: st.dark ? C.text1 : C.background1 }, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { objectName: "Cercle " + st.t, x: x + 0.2, y: y + 0.2, w: 0.5, h: 0.5, fill: { color: st.dark ? C.accent1 : C.text1 } });
    s.addImage({ data: await icon(st.ic, st.dark ? DARK : "FFFFFF"), x: x + 0.325, y: y + 0.325, w: 0.25, h: 0.25, altText: st.t });
    s.addText((i + 1) + " · " + st.t, { isTextBox: true, x: x + 0.8, y: y + 0.2, w: W - 0.95, h: 0.5, fontSize: 15, bold: true, color: st.dark ? C.accent1 : C.text1, fontFace: "+mj-lt", valign: "middle", margin: 0 });
    s.addText(bullets(st.items), { isTextBox: true, x: x + 0.2, y: y + 0.85, w: W - 0.35, h: 1.7, fontSize: 12, color: st.dark ? C.accent4 : C.text2, paraSpaceAfter: 4, valign: "top", margin: 0 });
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { objectName: "Flèche " + (i + 1), x: x + W + 0.1, y: y + 1.15, w: 0.325, h: 0.35, fill: { color: C.accent1 } });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: "Encadré RGPD", x: 0.5, y: 4.48, w: 9.0, h: 0.58, rectRadius: 0.08, fill: { color: C.background1 }, shadow: shadow() });
  s.addImage({ data: await icon(fa.FaLock, THEME.colors.accent2), x: 0.72, y: 4.62, w: 0.3, h: 0.3, altText: "Cadenas" });
  s.addText([{ text: "Sans caméra : ", options: { bold: true, color: C.text1 } }, { text: "le système sait qu'il y a un intrus et combien, pas qui. Pas de surveillance vidéo, compatible RGPD." }],
    { isTextBox: true, x: 1.2, y: 4.48, w: 8.1, h: 0.58, fontSize: 13, color: C.text2, valign: "middle", margin: 0 });
  s.addNotes("Le cœur du projet est l'émargement (QR dynamique + BLE) ; l'occupation et la détection d'intrusion sont des extensions qui réutilisent le même boîtier. Si le temps manque dans l'année, on a quand même un projet fini. Les données se valident mutuellement : 20 émargés mais salle détectée vide = anomalie. Seul ajout matériel pour l'intrusion : le compteur de passage à la porte ; le reste est du traitement côté serveur. Démonstration prévue : une salle de l'IUT équipée, avec un intrus simulé.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("OK", OUT);
})();
