import { brandPalette } from "../../config/brand.js";

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
    const candidateWidth = estimateTextWidth(candidate, fontSize);
    const shouldPhraseBreak =
      line &&
      /[,:;]$/.test(line) &&
      estimateTextWidth(candidate, fontSize) > maxWidth * 0.82;

    if (line && (candidateWidth > maxWidth || shouldPhraseBreak)) {
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

const byHeight = (height, values) => {
  if (height < 800) return values.landscape;
  if (height > 1500) return values.story;
  return values.standard;
};

const defaultLayoutForPreset = ({ width, height }) => ({
  marginRatio: byHeight(height, { landscape: 0.07, standard: 0.085, story: 0.09 }),
  quoteFontSize: byHeight(height, { landscape: 44, standard: 66, story: 78 }),
  headlineFontSize: byHeight(height, { landscape: 24, standard: 30, story: 30 }),
  metaFontSize: byHeight(height, { landscape: 22, standard: 27, story: 27 }),
  smallFontSize: byHeight(height, { landscape: 17, standard: 22, story: 22 }),
  quoteMaxWidthRatio: height < width * 0.7 ? 0.72 : 1,
  headlineMaxWidthRatio: height < width * 0.7 ? 0.6 : 1,
  markWidthRatio: height < width * 0.7 ? 0.11 : height > width * 1.55 ? 0.12 : 0.13,
  markTopRatioOfMargin: 0.78,
  quoteYRatio: height < width * 0.7 ? 0.31 : height > width * 1.55 ? 0.27 : 0.31,
  metaGap: 28,
});

const quoteCardLayouts = {
  "instagram-feed-4x5": {
    marginRatio: 0.085,
    quoteFontSize: 66,
    headlineFontSize: 34,
    metaFontSize: 27,
    smallFontSize: 25,
    quoteMaxWidthRatio: 0.86,
    headlineMaxWidthRatio: 1,
    markWidthRatio: 0.14,
    markTopRatioOfMargin: 0.78,
    quoteYRatio: 0.31,
    metaGap: 28,
    footerRuleOpacity: 0.28,
    footerRuleOffset: 50,
  },
};

export const renderQuoteCardSvg = ({ post, preset, markBody }) => {
  const { width, height } = preset;
  const layout = quoteCardLayouts[preset.id] ?? defaultLayoutForPreset({ width, height });
  const margin = Math.round(width * layout.marginRatio);
  const safeWidth = width - margin * 2;
  const fontScale = width / 1080;

  const quoteFontSize = Math.round(layout.quoteFontSize * fontScale);
  const quoteLineHeight = Math.round(quoteFontSize * 1.16);
  const headlineFontSize = Math.round(layout.headlineFontSize * fontScale);
  const metaFontSize = Math.round(layout.metaFontSize * fontScale);
  const smallFontSize = Math.round(layout.smallFontSize * fontScale);
  const quoteMaxWidth = Math.round(safeWidth * layout.quoteMaxWidthRatio);
  const quoteLines = wrapText(`“${post.quote.text}”`, quoteMaxWidth, quoteFontSize);
  const headlineLines = wrapText(post.headline, Math.round(safeWidth * layout.headlineMaxWidthRatio), headlineFontSize);
  const sourceParts = [post.quote.work, post.quote.year].filter(Boolean);
  const sourceLine = sourceParts.length ? sourceParts.join(", ") : post.quote.sourceLabel;

  const markSize = Math.round(width * layout.markWidthRatio);
  const markX = width - margin - markSize;
  const markY = margin * layout.markTopRatioOfMargin;
  const markScale = markSize / 198;
  const quoteY = Math.round(height * layout.quoteYRatio);
  const metaY = quoteY + quoteLines.length * quoteLineHeight + Math.round(layout.metaGap * fontScale);
  const footerY = height - margin;
  const footerRuleOpacity = layout.footerRuleOpacity ?? 0.18;
  const footerRuleOffset = layout.footerRuleOffset ?? 44;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(post.headline)}</title>
  <desc id="desc">A quote card from The Number Garden featuring ${escapeXml(post.quote.author)}.</desc>
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

  ${textBlock({
    lines: headlineLines,
    x: margin,
    y: margin + Math.round(24 * fontScale),
    fontSize: headlineFontSize,
    lineHeight: Math.round(headlineFontSize * 1.15),
    fill: brandPalette.clay.toUpperCase(),
    family: "Avenir Next, Manrope, Arial, sans-serif",
    weight: 800,
  })}

  ${textBlock({
    lines: quoteLines,
    x: margin,
    y: quoteY,
    fontSize: quoteFontSize,
    lineHeight: quoteLineHeight,
    fill: brandPalette.ink.toUpperCase(),
    family: "Fraunces, Georgia, serif",
    weight: 600,
  })}

  <text x="${margin}" y="${metaY}" fill="${brandPalette.moss.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="${metaFontSize}" font-weight="800">${escapeXml(post.quote.author)}</text>
  <text x="${margin}" y="${metaY + Math.round(metaFontSize * 1.35)}" fill="${brandPalette.muted.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="${smallFontSize}" font-weight="600">${escapeXml(sourceLine ?? "The Number Garden")}</text>

  <line x1="${margin}" y1="${footerY - Math.round(footerRuleOffset * fontScale)}" x2="${width - margin}" y2="${footerY - Math.round(footerRuleOffset * fontScale)}" stroke="${brandPalette.moss.toUpperCase()}" stroke-opacity="${footerRuleOpacity}" stroke-width="${Math.max(2, Math.round(width / 540))}" />
  <text x="${margin}" y="${footerY}" fill="${brandPalette.ink.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="${smallFontSize}" font-weight="800">The Number Garden</text>
  <text x="${width - margin}" y="${footerY}" text-anchor="end" fill="${brandPalette.muted.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="${smallFontSize}" font-weight="700">thenumbergarden.com</text>
</svg>
`;
};
