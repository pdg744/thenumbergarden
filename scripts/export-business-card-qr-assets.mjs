import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const sourcePath = "public/qr-lab/seedbed.svg";
const outputSvgPath = "print/business-cards/seedbed-homepage-qr-transparent.svg";
const outputFullSvgPath = "print/business-cards/seedbed-homepage-qr.svg";
const outputPngPath = "print/business-cards/seedbed-homepage-qr.png";

const quietZoneModules = 4;
const moduleSize = 12;
const quietZone = quietZoneModules * moduleSize;
const pngSize = 3000;

const source = await readFile(sourcePath, "utf8");
const viewBoxMatch = source.match(/viewBox="([^"]+)"/);

if (!viewBoxMatch) {
  throw new Error(`Could not find viewBox in ${sourcePath}.`);
}

const [minX, minY, width, height] = viewBoxMatch[1].split(/\s+/).map(Number);
const croppedViewBox = [
  minX + quietZone,
  minY + quietZone,
  width - quietZone * 2,
  height - quietZone * 2,
].join(" ");

const transparent = source
  .replace(/viewBox="[^"]+"/, `viewBox="${croppedViewBox}"`)
  .replace(
    /<rect width="[^"]+" height="[^"]+" rx="[^"]+" fill="url\(#seedbed-bg\)"\/>/,
    "",
  )
  .replace(
    /<rect x="[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" rx="[^"]+" fill="none" stroke="#DFE8D1" stroke-width="1\.5" opacity="0\.85"\/>/,
    "",
  );

await writeFile(outputFullSvgPath, source, "utf8");
await writeFile(outputSvgPath, transparent, "utf8");
await sharp(Buffer.from(transparent), { density: 600, limitInputPixels: false })
  .resize(pngSize, pngSize, { fit: "contain" })
  .png()
  .toFile(outputPngPath);
