import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const pngToIco = (png) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, png]);
};

const renderPng = (input, output, width, height = width) =>
  sharp(input, { density: 384, limitInputPixels: false })
    .resize(width, height, { fit: "fill" })
    .png()
    .toFile(output);

await mkdir("public", { recursive: true });

await renderPng("public/favicon.svg", "public/favicon-32x32.png", 32);
await renderPng("public/favicon.svg", "public/favicon-512.png", 512);
await renderPng("public/favicon.svg", "public/apple-touch-icon.png", 180);
await renderPng("public/brand/social-card.svg", "public/social-preview.png", 1200, 630);

const icoPng = await sharp("public/favicon.svg", { density: 384, limitInputPixels: false })
  .resize(32, 32, { fit: "fill" })
  .png()
  .toBuffer();
await writeFile("public/favicon.ico", pngToIco(icoPng));

console.log("Wrote public/favicon-32x32.png");
console.log("Wrote public/favicon-512.png");
console.log("Wrote public/apple-touch-icon.png");
console.log("Wrote public/social-preview.png");
console.log("Wrote public/favicon.ico");
