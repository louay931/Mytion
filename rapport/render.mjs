// Rendu HTML -> PDF avec Chromium (Playwright). Usage : node render.mjs entree.html sortie.pdf
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  const { execSync } = require("child_process");
  const root = execSync("npm root -g").toString().trim();
  playwright = require(path.join(root, "playwright"));
}

const [, , src, out] = process.argv;
const browser = await playwright.chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve(src)).href, { waitUntil: "networkidle" });
await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate:
    '<div style="width:100%;font-size:8px;font-family:DejaVu Sans,sans-serif;color:#888;padding:0 18mm;display:flex;justify-content:space-between">' +
    "<span>Capteurs de navigation aéronautiques</span>" +
    '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
});
await browser.close();
