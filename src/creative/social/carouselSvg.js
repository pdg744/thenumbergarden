import { brandPalette } from "../../config/brand.js";
import { renderQuoteCardSvg } from "./quoteCardSvg.js";

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const estimateTextWidth = (text, fontSize) => {
  let width = 0;
  for (const char of text) {
    if (char === " ") width += 0.28;
    else if ("il.,'".includes(char)) width += 0.24;
    else if ("mwMW".includes(char)) width += 0.88;
    else if (char === char.toUpperCase() && /[A-Z]/.test(char)) width += 0.68;
    else width += 0.52;
  }
  return width * fontSize;
};

const wrapText = (text, maxWidth, fontSize) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && estimateTextWidth(candidate, fontSize) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
};

const textBlock = ({ lines, x, y, fontSize, lineHeight, fill, family, weight = 500 }) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${fontSize}" font-weight="${weight}">
${lines
  .map((line, index) => `    <tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
  .join("\n")}
  </text>`;

const baseFrame = ({ width, height, title, desc, body, markBody, page }) => {
  const margin = Math.round(width * 0.085);
  const markSize = Math.round(width * 0.12);
  const markX = width - margin - markSize;
  const markY = Math.round(margin * 0.85);
  const footerY = height - margin;
  const markScale = markSize / 198;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(desc)}</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${brandPalette.paperTop.toUpperCase()}" />
      <stop offset="1" stop-color="${brandPalette.paperBottom.toUpperCase()}" />
    </linearGradient>
    <pattern id="dot-grid" width="${Math.round(width / 18)}" height="${Math.round(width / 18)}" patternUnits="userSpaceOnUse">
      <circle cx="${Math.round(width / 180)}" cy="${Math.round(width / 180)}" r="${Math.max(1.3, width / 540)}" fill="${brandPalette.leaf.toUpperCase()}" opacity="0.16" />
    </pattern>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#paper)" />
  <rect width="${width}" height="${height}" fill="url(#dot-grid)" opacity="0.24" />
  <circle cx="${margin}" cy="${margin}" r="${Math.round(width * 0.2)}" fill="${brandPalette.sun.toUpperCase()}" opacity="0.12" />
  <circle cx="${width - margin}" cy="${height - margin}" r="${Math.round(width * 0.24)}" fill="${brandPalette.sage.toUpperCase()}" opacity="0.38" />

  <g transform="translate(${markX} ${markY}) scale(${markScale})" opacity="0.92">
${markBody}
  </g>

${body}

  <line x1="${margin}" y1="${footerY - 50}" x2="${width - margin}" y2="${footerY - 50}" stroke="${brandPalette.moss.toUpperCase()}" stroke-opacity="0.28" stroke-width="2" />
  <text x="${margin}" y="${footerY}" fill="${brandPalette.ink.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="25" font-weight="800">The Number Garden</text>
  <text x="${width - margin}" y="${footerY}" text-anchor="end" fill="${brandPalette.muted.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="25" font-weight="700">${page}</text>
</svg>
`;
};

const renderHookSlide = ({ post, preset, markBody }) => {
  const { width, height } = preset;
  const margin = Math.round(width * 0.085);
  const hookLines = wrapText(post.hook, width - margin * 2.2, 86);
  const kickerLines = wrapText(post.headline, width - margin * 2, 34);
  const body = `
  ${textBlock({
    lines: kickerLines,
    x: margin,
    y: Math.round(height * 0.18),
    fontSize: 34,
    lineHeight: 40,
    fill: brandPalette.clay.toUpperCase(),
    family: "Avenir Next, Manrope, Arial, sans-serif",
    weight: 800,
  })}
  ${textBlock({
    lines: hookLines,
    x: margin,
    y: Math.round(height * 0.39),
    fontSize: 86,
    lineHeight: 96,
    fill: brandPalette.ink.toUpperCase(),
    family: "Fraunces, Georgia, serif",
    weight: 650,
  })}
  <text x="${margin}" y="${Math.round(height * 0.68)}" fill="${brandPalette.muted.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="30" font-weight="700">Swipe for the old version of this idea.</text>`;

  return baseFrame({
    width,
    height,
    title: post.hook,
    desc: `Opening slide for a carousel from The Number Garden.`,
    body,
    markBody,
    page: "1/4",
  });
};

const renderReflectionSlide = ({ post, preset, markBody }) => {
  const { width, height } = preset;
  const margin = Math.round(width * 0.085);
  const reflectionLines = wrapText(post.reflection, width - margin * 2.2, 66);
  const body = `
  <text x="${margin}" y="${Math.round(height * 0.18)}" fill="${brandPalette.clay.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="34" font-weight="800">The studio version:</text>
  ${textBlock({
    lines: reflectionLines,
    x: margin,
    y: Math.round(height * 0.36),
    fontSize: 66,
    lineHeight: 78,
    fill: brandPalette.ink.toUpperCase(),
    family: "Fraunces, Georgia, serif",
    weight: 600,
  })}`;

  return baseFrame({
    width,
    height,
    title: post.reflection,
    desc: `Reflection slide for a carousel from The Number Garden.`,
    body,
    markBody,
    page: "3/4",
  });
};

const renderCtaSlide = ({ post, preset, markBody }) => {
  const { width, height } = preset;
  const margin = Math.round(width * 0.085);
  const questionLines = wrapText(post.question, width - margin * 2.2, 74);
  const body = `
  ${textBlock({
    lines: questionLines,
    x: margin,
    y: Math.round(height * 0.31),
    fontSize: 74,
    lineHeight: 86,
    fill: brandPalette.ink.toUpperCase(),
    family: "Fraunces, Georgia, serif",
    weight: 650,
  })}
  <text x="${margin}" y="${Math.round(height * 0.63)}" fill="${brandPalette.moss.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="34" font-weight="800">Joyful mathematics for curious minds.</text>
  <text x="${margin}" y="${Math.round(height * 0.7)}" fill="${brandPalette.muted.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="30" font-weight="700">Math enrichment in Portland.</text>`;

  return baseFrame({
    width,
    height,
    title: post.question,
    desc: `Closing slide for a carousel from The Number Garden.`,
    body,
    markBody,
    page: "4/4",
  });
};

export const renderQuoteCarouselSvgs = ({ post, preset, markBody }) => [
  {
    id: "slide-01-hook",
    svg: renderHookSlide({ post, preset, markBody }),
  },
  {
    id: "slide-02-quote",
    svg: renderQuoteCardSvg({ post, preset, markBody }).replace("thenumbergarden.com", "2/4"),
  },
  {
    id: "slide-03-reflection",
    svg: renderReflectionSlide({ post, preset, markBody }),
  },
  {
    id: "slide-04-cta",
    svg: renderCtaSlide({ post, preset, markBody }),
  },
];
