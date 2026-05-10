import { readFile, writeFile } from "node:fs/promises";

const mark = await readFile("public/brand/logo-mark.svg", "utf8");
const markBody = mark
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<title[\s\S]*?<\/title>\s*/, "")
  .replace(/<desc[\s\S]*?<\/desc>\s*/, "");

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="title desc">
  <title id="title">The Number Garden favicon</title>
  <desc id="desc">The Number Garden pentagonal circle mark on a cream rounded square.</desc>
  <rect width="64" height="64" rx="16" fill="#FAF6EC" />
  <g transform="translate(8 8) scale(${(48 / 198).toFixed(8)})">
${markBody}
  </g>
</svg>
`;

const socialCardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">The Number Garden social preview</title>
  <desc id="desc">The Number Garden logo mark with wordmark and tagline on a warm cream background.</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FDF8EF" />
      <stop offset="100%" stop-color="#F4EFDE" />
    </linearGradient>
    <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 120) rotate(27) scale(260 220)">
      <stop offset="0%" stop-color="#F4C96B" stop-opacity="0.26" />
      <stop offset="100%" stop-color="#F4C96B" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1040 120) rotate(12) scale(280 220)">
      <stop offset="0%" stop-color="#6C8A53" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#6C8A53" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#1F2A1F" flood-opacity="0.16" />
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#paper)" />
  <rect width="1200" height="630" fill="url(#glowA)" />
  <rect width="1200" height="630" fill="url(#glowB)" />

  <g filter="url(#shadow)">
    <rect x="76" y="92" width="318" height="386" rx="34" fill="#FFFAF2" fill-opacity="0.9" />
  </g>

  <g transform="translate(110 150) scale(1.28)">
${markBody}
  </g>

  <text x="450" y="172" fill="#C86D4B" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="5.8">PORTLAND MATH STUDIO</text>
  <text x="450" y="286" fill="#1F2A1F" font-family="Fraunces, Georgia, serif" font-size="64" font-weight="600" letter-spacing="-1.9">The Number Garden</text>
  <text x="450" y="382" fill="#536151" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="34" font-weight="600">Joyful mathematics for curious minds</text>
</svg>
`;

await writeFile("public/favicon.svg", faviconSvg, "utf8");
await writeFile("public/brand/social-card.svg", socialCardSvg, "utf8");

console.log("Wrote public/favicon.svg");
console.log("Wrote public/brand/social-card.svg");
