import { mkdir, readFile, writeFile } from "node:fs/promises";
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

const profileBackgrounds = {
  "flat-cream": {
    rect: '<rect width="{size}" height="{size}" fill="#FAF6EC"/>',
  },
  "source-paper": {
    rect: `<defs>
      <linearGradient id="paper" x1="0" y1="0" x2="{size}" y2="{size}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFAF2"/>
        <stop offset="0.58" stop-color="#FDF8EF"/>
        <stop offset="1" stop-color="#F4EFDE"/>
      </linearGradient>
      <radialGradient id="paper-overlay" cx="50%" cy="36%" r="68%">
        <stop offset="0" stop-color="#F4C96B" stop-opacity="0.18"/>
        <stop offset="0.58" stop-color="#DBE8D0" stop-opacity="0.12"/>
        <stop offset="1" stop-color="#FFFAF2" stop-opacity="0"/>
      </radialGradient>
      <pattern id="seed-grid" width="{grid}" height="{grid}" patternUnits="userSpaceOnUse">
        <circle cx="{dotPos}" cy="{dotPos}" r="{dot}" fill="#6C8A53" opacity="0.12"/>
      </pattern>
    </defs>
    <rect width="{size}" height="{size}" fill="url(#paper)"/>
    <rect width="{size}" height="{size}" fill="url(#paper-overlay)"/>
    <rect width="{size}" height="{size}" fill="url(#seed-grid)" opacity="0.18"/>`,
  },
  "print-paper": {
    rect: `<defs>
      <linearGradient id="paper" x1="0" y1="0" x2="{size}" y2="{size}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F8F0DD"/>
        <stop offset="0.58" stop-color="#FBF2E2"/>
        <stop offset="1" stop-color="#F0E4C9"/>
      </linearGradient>
      <radialGradient id="paper-overlay" cx="50%" cy="36%" r="68%">
        <stop offset="0" stop-color="#F4C96B" stop-opacity="0.18"/>
        <stop offset="0.58" stop-color="#DBE8D0" stop-opacity="0.12"/>
        <stop offset="1" stop-color="#F8F0DD" stop-opacity="0"/>
      </radialGradient>
      <pattern id="seed-grid" width="{grid}" height="{grid}" patternUnits="userSpaceOnUse">
        <circle cx="{dotPos}" cy="{dotPos}" r="{dot}" fill="#6C8A53" opacity="0.12"/>
      </pattern>
    </defs>
    <rect width="{size}" height="{size}" fill="url(#paper)"/>
    <rect width="{size}" height="{size}" fill="url(#paper-overlay)"/>
    <rect width="{size}" height="{size}" fill="url(#seed-grid)" opacity="0.18"/>`,
  },
};

const logoMarkBody = async () => {
  const mark = await readFile("public/brand/logo-mark.svg", "utf8");
  return mark
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title[\s\S]*?<\/title>\s*/, "")
    .replace(/<desc[\s\S]*?<\/desc>\s*/, "");
};

const logoMarkVisualBounds = {
  minX: 28.6,
  minY: 25.6,
  maxX: 169.4,
  maxY: 161.4,
};

const logoMarkCircleBounds = {
  cx: 99,
  cy: 99,
  radius: 73.4,
};

const markTransform = ({ size, markScale, fit = "viewBox" }) => {
  if (fit === "circle") {
    const scale = (size * markScale) / (logoMarkCircleBounds.radius * 2);
    return {
      scale,
      x: size / 2 - logoMarkCircleBounds.cx * scale,
      y: size / 2 - logoMarkCircleBounds.cy * scale,
    };
  }

  const bounds = fit === "visual" ? logoMarkVisualBounds : { minX: 0, minY: 0, maxX: 198, maxY: 198 };
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;
  const scale = (size * markScale) / Math.max(boundsWidth, boundsHeight);
  return {
    scale,
    x: (size - boundsWidth * scale) / 2 - bounds.minX * scale,
    y: (size - boundsHeight * scale) / 2 - bounds.minY * scale,
  };
};

const renderProfilePng = async ({ markBody, platform, backgroundName, size, markScale, fit = "viewBox" }) => {
  const { x, y, scale } = markTransform({ size, markScale, fit });
  const grid = size / 16;
  const dot = Math.max(0.85, size * 0.0021);
  const dotPos = grid * 0.125;
  const background = profileBackgrounds[backgroundName].rect
    .replaceAll("{size}", size)
    .replaceAll("{grid}", grid)
    .replaceAll("{dot}", dot)
    .replaceAll("{dotPos}", dotPos);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${background}
    <g transform="translate(${x} ${y}) scale(${scale})">
${markBody}
    </g>
  </svg>`;

  return sharp(Buffer.from(svg), { limitInputPixels: false })
    .resize(size, size, { fit: "fill" })
    .png()
    .toFile(`public/brand/logo-mark-${platform}-${backgroundName}-${size}.png`);
};

await mkdir("public", { recursive: true });

await renderPng("public/favicon.svg", "public/favicon-32x32.png", 32);
await renderPng("public/favicon.svg", "public/favicon-512.png", 512);
await renderPng("public/favicon.svg", "public/apple-touch-icon.png", 180);
await renderPng("public/brand/social-card.svg", "public/social-preview.png", 1200, 630);

const markBody = await logoMarkBody();
for (const backgroundName of Object.keys(profileBackgrounds)) {
  await renderProfilePng({ markBody, platform: "twitter", backgroundName, size: 400, markScale: 0.75 });
  await renderProfilePng({ markBody, platform: "twitter", backgroundName, size: 800, markScale: 0.75 });
  await renderProfilePng({
    markBody,
    platform: "instagram",
    backgroundName,
    size: 320,
    markScale: 0.8,
    fit: "circle",
  });
  await renderProfilePng({
    markBody,
    platform: "instagram",
    backgroundName,
    size: 1080,
    markScale: 0.8,
    fit: "circle",
  });
}

const icoPng = await sharp("public/favicon.svg", { density: 384, limitInputPixels: false })
  .resize(32, 32, { fit: "fill" })
  .png()
  .toBuffer();
await writeFile("public/favicon.ico", pngToIco(icoPng));

console.log("Wrote public/favicon-32x32.png");
console.log("Wrote public/favicon-512.png");
console.log("Wrote public/apple-touch-icon.png");
console.log("Wrote public/social-preview.png");
console.log("Wrote public/brand/logo-mark-twitter-flat-cream-{400,800}.png");
console.log("Wrote public/brand/logo-mark-twitter-source-paper-{400,800}.png");
console.log("Wrote public/brand/logo-mark-twitter-print-paper-{400,800}.png");
console.log("Wrote public/brand/logo-mark-instagram-flat-cream-{320,1080}.png");
console.log("Wrote public/brand/logo-mark-instagram-source-paper-{320,1080}.png");
console.log("Wrote public/brand/logo-mark-instagram-print-paper-{320,1080}.png");
console.log("Wrote public/favicon.ico");
