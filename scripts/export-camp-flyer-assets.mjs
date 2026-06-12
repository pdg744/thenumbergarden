import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { brandPalette } from "../src/config/brand.js";
import { getQrLabEntries } from "../src/lib/qr/brandQr.js";

const outputDir = "print/flyers";
const campUrl = "https://thenumbergarden.com/portland-math-camp";
const reviewSvgPath = path.join(outputDir, "august-math-camp-quarter-sheet-review.svg");
const printSvgPath = path.join(outputDir, "august-math-camp-quarter-sheet.svg");
const previewPath = path.join(outputDir, "august-math-camp-quarter-sheet-preview.png");
const qrFullSvgPath = path.join(outputDir, "camp-page-seedbed-qr.svg");
const qrTransparentSvgPath = path.join(outputDir, "camp-page-seedbed-qr-transparent.svg");
const qrPngPath = path.join(outputDir, "camp-page-seedbed-qr.png");

const trim = {
  x: 12.5,
  y: 12.5,
  width: 425,
  height: 550,
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const svgInner = (svg) =>
  svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title[\s\S]*?<\/title>\s*/g, "")
    .replace(/<desc[\s\S]*?<\/desc>\s*/g, "")
    .trim();

const stripLayoutGuides = (svg) => {
  const lines = svg.split("\n");
  const kept = [];
  let skipping = false;
  let depth = 0;

  for (const line of lines) {
    if (!skipping && line.includes('<g id="layout-guides"')) {
      skipping = true;
      depth = 1;
      continue;
    }

    if (skipping) {
      depth += (line.match(/<g\b/g) || []).length;
      depth -= (line.match(/<\/g>/g) || []).length;
      if (depth === 0) {
        skipping = false;
      }
      continue;
    }

    kept.push(line);
  }

  if (skipping) {
    throw new Error("Could not strip layout guides: unclosed layout-guides group.");
  }

  return kept.join("\n");
};

const cropQrToTransparent = (source) => {
  const viewBoxMatch = source.match(/viewBox="([^"]+)"/);

  if (!viewBoxMatch) {
    throw new Error("Could not find viewBox in generated QR SVG.");
  }

  const quietZone = 4 * 12;
  const [minX, minY, width, height] = viewBoxMatch[1].split(/\s+/).map(Number);
  const croppedViewBox = [
    minX + quietZone,
    minY + quietZone,
    width - quietZone * 2,
    height - quietZone * 2,
  ].join(" ");

  return source
    .replace(/viewBox="[^"]+"/, `viewBox="${croppedViewBox}"`)
    .replace(/<rect width="[^"]+" height="[^"]+" rx="[^"]+" fill="url\(#seedbed-bg\)"\/>/, "")
    .replace(
      /<rect x="[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" rx="[^"]+" fill="none" stroke="#DFE8D1" stroke-width="1\.5" opacity="0\.85"\/>/,
      "",
    );
};

const renderLogo = (markSvg) => {
  const markBody = svgInner(markSvg)
    .split("\n")
    .map((line) => `      ${line.trim()}`)
    .join("\n");

  return `<g transform="translate(322 39) scale(0.39)">
${markBody}
    </g>`;
};

const renderQr = (qrSvg) => {
  const viewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    throw new Error("Could not find viewBox in transparent QR SVG.");
  }

  const [minX, minY, width, height] = viewBoxMatch[1].split(/\s+/).map(Number);
  const inner = svgInner(qrSvg)
    .split("\n")
    .map((line) => `        ${line.trim()}`)
    .join("\n");

  return `<g transform="translate(302 445) scale(${98 / width}) translate(${-minX} ${-minY})">
${inner}
      </g>`;
};

const renderFlyerSvg = ({ markSvg, qrSvg }) => {
  const logo = renderLogo(markSvg);
  const qr = renderQr(qrSvg);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="4.5in" height="5.75in" viewBox="0 0 450 575" role="img" aria-labelledby="title desc">
  <title id="title">The Number Garden August Math Camp quarter-sheet flyer</title>
  <desc id="desc">Quarter-sheet flyer for August math camp sessions for ages 8 to 10 and ages 11 to 15.</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="450" y2="575" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${brandPalette.printPaperTop.toUpperCase()}"/>
      <stop offset="0.58" stop-color="${brandPalette.printPaperMiddle.toUpperCase()}"/>
      <stop offset="1" stop-color="${brandPalette.printPaperBottom.toUpperCase()}"/>
    </linearGradient>
    <radialGradient id="paper-overlay" cx="50%" cy="31%" r="72%">
      <stop offset="0" stop-color="${brandPalette.sun.toUpperCase()}" stop-opacity="0.15"/>
      <stop offset="0.58" stop-color="${brandPalette.sage.toUpperCase()}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${brandPalette.creamBright.toUpperCase()}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="seed-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="0.85" fill="${brandPalette.leaf.toUpperCase()}" opacity="0.11"/>
    </pattern>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="${brandPalette.ink.toUpperCase()}" flood-opacity="0.10"/>
    </filter>
  </defs>

  <rect width="450" height="575" fill="url(#paper)"/>
  <rect width="450" height="575" fill="url(#paper-overlay)"/>
  <rect width="450" height="575" fill="url(#seed-grid)" opacity="0.18"/>
  <circle cx="42" cy="68" r="118" fill="${brandPalette.sun.toUpperCase()}" opacity="0.10"/>
  <circle cx="424" cy="520" r="158" fill="${brandPalette.sage.toUpperCase()}" opacity="0.34"/>

${logo}

  <g font-family="Avenir Next, Helvetica, Arial, sans-serif">
    <text x="42" y="61" fill="${brandPalette.clay.toUpperCase()}" font-size="12" font-weight="800" letter-spacing="2.1">AUGUST 10-14, 2026</text>
    <text x="42" y="113" fill="${brandPalette.ink.toUpperCase()}" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700">Math Camp</text>
    <text x="42" y="153" fill="${brandPalette.ink.toUpperCase()}" font-family="Georgia, 'Times New Roman', serif" font-size="31" font-weight="700">Games &amp; Puzzles</text>
    <text x="42" y="187" fill="${brandPalette.muted.toUpperCase()}" font-size="15" font-weight="650">A small Portland camp for curious kids who like</text>
    <text x="42" y="207" fill="${brandPalette.muted.toUpperCase()}" font-size="15" font-weight="650">strategy, patterns, beautiful questions, and play.</text>

    <g filter="url(#soft-shadow)">
      <rect x="42" y="239" width="366" height="82" rx="12" fill="${brandPalette.creamBright.toUpperCase()}" fill-opacity="0.84"/>
      <rect x="42" y="337" width="366" height="82" rx="12" fill="${brandPalette.creamBright.toUpperCase()}" fill-opacity="0.84"/>
    </g>

    <circle cx="66" cy="268" r="5.5" fill="${brandPalette.clay.toUpperCase()}"/>
    <path d="M82 268H155" stroke="${brandPalette.leaf.toUpperCase()}" stroke-width="3" stroke-linecap="round" opacity="0.62"/>
    <circle cx="171" cy="268" r="5.5" fill="${brandPalette.sun.toUpperCase()}"/>
    <text x="66" y="293" fill="${brandPalette.ink.toUpperCase()}" font-size="21" font-weight="800">Ages 8 to 10</text>
    <text x="66" y="311" fill="${brandPalette.moss.toUpperCase()}" font-size="13.5" font-weight="750">9-11am, Monday-Friday</text>

    <circle cx="66" cy="366" r="5.5" fill="${brandPalette.clay.toUpperCase()}"/>
    <path d="M82 366H155" stroke="${brandPalette.leaf.toUpperCase()}" stroke-width="3" stroke-linecap="round" opacity="0.62"/>
    <circle cx="171" cy="366" r="5.5" fill="${brandPalette.sun.toUpperCase()}"/>
    <text x="66" y="391" fill="${brandPalette.ink.toUpperCase()}" font-size="21" font-weight="800">Ages 11 to 15</text>
    <text x="66" y="409" fill="${brandPalette.moss.toUpperCase()}" font-size="13.5" font-weight="750">1-3:30pm, Monday-Friday</text>

    <text x="42" y="458" fill="${brandPalette.ink.toUpperCase()}" font-size="16" font-weight="800">The Number Garden</text>
    <text x="42" y="480" fill="${brandPalette.muted.toUpperCase()}" font-size="13.5" font-weight="650">Hollywood District</text>
    <text x="42" y="502" fill="${brandPalette.muted.toUpperCase()}" font-size="13.5" font-weight="650">thenumbergarden.com</text>

    <text x="302" y="433" fill="${brandPalette.moss.toUpperCase()}" font-size="12.5" font-weight="800">Scan to register</text>
  </g>

${qr}

  <g id="layout-guides" fill="none" pointer-events="none">
    <rect x="0.5" y="0.5" width="449" height="574" stroke="#2F80ED" stroke-width="0.9" stroke-dasharray="4 3" opacity="0.95"/>
    <rect x="${trim.x}" y="${trim.y}" width="${trim.width}" height="${trim.height}" stroke="#D0021B" stroke-width="1.1" opacity="0.95"/>
    <g font-family="Avenir Next, Helvetica, Arial, sans-serif" font-size="5.8" font-weight="700">
      <text x="16" y="9.5" fill="#D0021B">trim / bleed line: 0.125 in</text>
    </g>
  </g>
</svg>
`;
};

await mkdir(outputDir, { recursive: true });

const seedbedQr = getQrLabEntries(campUrl).find((entry) => entry.id === "seedbed");
if (!seedbedQr) {
  throw new Error("Could not generate Seedbed QR.");
}

if (!seedbedQr.validation.ok) {
  throw new Error(`Generated QR did not validate. Decoded: ${seedbedQr.validation.decoded}`);
}

const qrTransparentSvg = cropQrToTransparent(seedbedQr.svg);
const markSvg = await readFile("public/brand/logo-mark.svg", "utf8");
const reviewSvg = renderFlyerSvg({ markSvg, qrSvg: qrTransparentSvg });
const printSvg = stripLayoutGuides(reviewSvg);

await writeFile(qrFullSvgPath, seedbedQr.svg, "utf8");
await writeFile(qrTransparentSvgPath, qrTransparentSvg, "utf8");
await writeFile(reviewSvgPath, reviewSvg, "utf8");
await writeFile(printSvgPath, printSvg, "utf8");

await sharp(Buffer.from(qrTransparentSvg), { density: 600, limitInputPixels: false })
  .resize(3000, 3000, { fit: "contain" })
  .png()
  .toFile(qrPngPath);

await sharp(Buffer.from(printSvg), { density: 384, limitInputPixels: false })
  .resize(1800)
  .png()
  .toFile(previewPath);

console.log(`Wrote ${printSvgPath}`);
console.log(`Wrote ${reviewSvgPath}`);
console.log(`Wrote ${previewPath}`);
console.log(`Wrote ${qrTransparentSvgPath}`);
console.log(`QR validation: ${seedbedQr.validation.decoded}`);
