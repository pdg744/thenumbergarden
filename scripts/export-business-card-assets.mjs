import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const sourceDir = "print/business-cards";
const sourceSvg = path.join(sourceDir, "business-card-source.svg");
const qrAssets = [
  "seedbed-homepage-qr.png",
  "seedbed-homepage-qr-branded.png",
  "seedbed-homepage-qr-transparent.svg",
];

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = ""] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

const now = new Date();
const pad = (value) => String(value).padStart(2, "0");
const localDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const localTime = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const exportDate = args.get("date") || localDate;
const exportTime = args.get("time") || localTime;
const format = args.get("format") || "all";

const outputDir = path.join(sourceDir, "exports", exportDate, exportTime);
const printReadyDir = path.join(outputDir, "print-ready");
const outputSvg = path.join(outputDir, "business-card-source.svg");
const outputPreview = path.join(outputDir, "business-card-source-preview.png");
const outputCombinedPdf = path.join(printReadyDir, "number-garden-business-card-combined-proof.pdf");
const outputFrontPdf = path.join(printReadyDir, "number-garden-business-card-front-review.pdf");
const outputBackPdf = path.join(printReadyDir, "number-garden-business-card-back-review.pdf");
const finalFrontSvg = path.join(printReadyDir, "number-garden-business-card-front-print-paper.svg");
const finalBackSvg = path.join(printReadyDir, "number-garden-business-card-back-print-paper.svg");
const finalFrontPreview = path.join(printReadyDir, "number-garden-business-card-front-print-paper-preview.png");
const finalBackPreview = path.join(printReadyDir, "number-garden-business-card-back-print-paper-preview.png");
const finalTwoPagePdf = path.join(printReadyDir, "number-garden-business-card-print-paper-two-page.pdf");

const printPaperPalette = {
  top: "#F8F0DD",
  middle: "#FBF2E2",
  bottom: "#F0E4C9",
};

const shouldExportReview = format === "all" || format === "review";
const shouldExportPrint = format === "all" || format === "print" || format === "final";

async function commandExists(command) {
  try {
    await execFileAsync("which", [command]);
    return true;
  } catch {
    return false;
  }
}

function stripLayoutGuides(svg) {
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
}

function extractGroup(svg, startNeedle) {
  const start = svg.indexOf(startNeedle);
  if (start === -1) {
    throw new Error(`Could not find ${startNeedle}.`);
  }

  const groupTag = /<\/?g\b[^>]*>/g;
  groupTag.lastIndex = start;
  let depth = 0;
  let foundStart = false;
  let match;

  while ((match = groupTag.exec(svg))) {
    if (match[0].startsWith("</g")) {
      depth -= 1;
    } else {
      depth += 1;
      foundStart = true;
    }

    if (foundStart && depth === 0) {
      return svg.slice(start, groupTag.lastIndex);
    }
  }

  throw new Error(`Could not extract ${startNeedle}: unclosed group.`);
}

function svgInner(svg) {
  return svg
    .replace(/<svg[^>]*>/, "")
    .replace(/<title[\s\S]*?<\/title>\s*/g, "")
    .replace(/<desc[\s\S]*?<\/desc>\s*/g, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
}

function inlineSvgImage(svg, imageHref, embeddedSvg) {
  const imagePattern = new RegExp(
    `<image href="${imageHref}" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/>`,
  );
  const imageMatch = svg.match(imagePattern);
  const viewBoxMatch = embeddedSvg.match(/viewBox="([^"]+)"/);

  if (!imageMatch || !viewBoxMatch) {
    return svg;
  }

  const [, x, y, width, height] = imageMatch.map(Number);
  const [minX, minY, viewBoxWidth, viewBoxHeight] = viewBoxMatch[1].split(/\s+/).map(Number);
  const scaleX = width / viewBoxWidth;
  const scaleY = height / viewBoxHeight;
  const inner = svgInner(embeddedSvg)
    .split("\n")
    .map((line) => `          ${line.trim()}`)
    .join("\n");
  const vectorImage = `<g transform="translate(${x} ${y}) scale(${scaleX} ${scaleY}) translate(${-minX} ${-minY})">\n${inner}\n        </g>`;

  return svg.replace(imagePattern, vectorImage);
}

function inlineBackQr(svg, qrSvg) {
  return inlineSvgImage(svg, "seedbed-homepage-qr-transparent.svg", qrSvg);
}

function applyPrintPaperBackground(svg) {
  return svg
    .replaceAll('stop-color="#FFFAF2"', `stop-color="${printPaperPalette.top}"`)
    .replaceAll('stop-color="#FDF8EF"', `stop-color="${printPaperPalette.middle}"`)
    .replaceAll('stop-color="#F4EFDE"', `stop-color="${printPaperPalette.bottom}"`);
}

function standaloneCardSvg({ title, desc, defs, group }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="3.75in" height="2.25in" viewBox="0 0 375 225" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">${desc}</desc>
${defs}
${group}
</svg>
`;
}

async function writePrintPaperSvgs() {
  const source = await readFile(sourceSvg, "utf8");
  const qr = await readFile(path.join(sourceDir, "seedbed-homepage-qr-transparent.svg"), "utf8");
  const printSvg = applyPrintPaperBackground(inlineBackQr(stripLayoutGuides(source), qr));
  const defs = printSvg.match(/  <defs>[\s\S]*?  <\/defs>/)?.[0];

  if (!defs) {
    throw new Error("Could not find SVG defs for print export.");
  }

  const front = extractGroup(printSvg, '  <g id="front">');
  const back = extractGroup(printSvg, '  <g id="back"').replace(
    '  <g id="back" transform="translate(375 0)">',
    '  <g id="back">',
  );

  await writeFile(
    finalFrontSvg,
    standaloneCardSvg({
      title: "The Number Garden business card front print paper",
      desc: "Front artwork with print paper background and no print guide overlays.",
      defs,
      group: front,
    }),
  );
  await writeFile(
    finalBackSvg,
    standaloneCardSvg({
      title: "The Number Garden business card back print paper",
      desc: "Back artwork with print paper background, inline vector logo, and no print guide overlays.",
      defs,
      group: back,
    }),
  );
}

await mkdir(outputDir, { recursive: true });
await copyFile(sourceSvg, outputSvg);

for (const asset of qrAssets) {
  await copyFile(path.join(sourceDir, asset), path.join(outputDir, asset));
}

console.log(`Wrote SVG export to ${outputSvg}`);

if (format === "svg") {
  process.exit(0);
}

await sharp(outputSvg, { density: 384, limitInputPixels: false })
  .resize(3000)
  .png()
  .toFile(outputPreview);

console.log(`Wrote PNG preview to ${outputPreview}`);

if (await commandExists("rsvg-convert")) {
  await mkdir(printReadyDir, { recursive: true });

  if (shouldExportReview) {
    await execFileAsync("rsvg-convert", ["-f", "pdf", "-o", outputCombinedPdf, outputSvg]);
    await execFileAsync("rsvg-convert", [
      "-f",
      "pdf",
      "--export-id",
      "front",
      "--page-width",
      "3.75in",
      "--page-height",
      "2.25in",
      "-o",
      outputFrontPdf,
      outputSvg,
    ]);
    await execFileAsync("rsvg-convert", [
      "-f",
      "pdf",
      "--export-id",
      "back",
      "--page-width",
      "3.75in",
      "--page-height",
      "2.25in",
      "-o",
      outputBackPdf,
      outputSvg,
    ]);
    console.log(`Wrote combined proof PDF to ${outputCombinedPdf}`);
    console.log(`Wrote front review PDF to ${outputFrontPdf}`);
    console.log(`Wrote back review PDF to ${outputBackPdf}`);
  }

  if (shouldExportPrint) {
    await writePrintPaperSvgs();
    for (const asset of qrAssets) {
      await copyFile(path.join(sourceDir, asset), path.join(printReadyDir, asset));
    }
    await sharp(finalFrontSvg, { density: 384, limitInputPixels: false })
      .resize(1500)
      .png()
      .toFile(finalFrontPreview);
    await sharp(finalBackSvg, { density: 384, limitInputPixels: false })
      .resize(1500)
      .png()
      .toFile(finalBackPreview);
    await execFileAsync("rsvg-convert", [
      "-f",
      "pdf",
      "-o",
      finalTwoPagePdf,
      finalFrontSvg,
      finalBackSvg,
    ]);
    console.log(`Wrote print paper two-page PDF to ${finalTwoPagePdf}`);
    console.log(`Wrote print paper front preview to ${finalFrontPreview}`);
    console.log(`Wrote print paper back preview to ${finalBackPreview}`);
  }
} else {
  console.warn("Skipped PDF export because rsvg-convert is not installed.");
}
