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

const fitFontSize = ({ text, maxWidth, preferredSize, minSize }) => {
  let size = preferredSize;
  while (size > minSize && estimateTextWidth(text, size) > maxWidth) {
    size -= 2;
  }
  return size;
};

export const renderEventCoverSvg = ({ event, preset, markBody }) => {
  const { width, height } = preset;
  const margin = Math.round(width * 0.085);
  const safeInsetX = Math.round(width * 0.115);
  const contentWidth = width - safeInsetX * 2;
  const markSize = Math.round(width * 0.155);
  const markScale = markSize / 198;
  const markX = width - safeInsetX - markSize;
  const markY = Math.round(height * 0.108);
  const titleFontSize = fitFontSize({
    text: event.title,
    maxWidth: Math.round(contentWidth * 0.72),
    preferredSize: 142,
    minSize: 108,
  });
  const subtitleFontSize = fitFontSize({
    text: event.subtitle,
    maxWidth: Math.round(contentWidth * 0.72),
    preferredSize: 104,
    minSize: 78,
  });
  const sessions = event.sessions ?? [
    {
      audience: event.audience,
      time: event.schedule,
    },
  ];
  const sessionWidth = Math.round(contentWidth * 0.305);
  const sessionGap = Math.round(height * 0.03);
  const sessionHeight = 146;
  const sessionX = width - safeInsetX - sessionWidth;
  const sessionY = Math.round(height * 0.58);
  const sessionBottom = sessionY + sessions.length * sessionHeight + (sessions.length - 1) * sessionGap;
  const sessionCards = sessions
    .map((session, index) => {
      const x = sessionX;
      const y = sessionY + index * (sessionHeight + sessionGap);
      const centerX = x + sessionWidth / 2;
      return `
  <g>
    <rect x="${x}" y="${y}" width="${sessionWidth}" height="${sessionHeight}" rx="28" fill="${brandPalette.creamBright.toUpperCase()}" fill-opacity="0.8" />
    <circle cx="${centerX - 152}" cy="${y + 33}" r="14" fill="${brandPalette.clay.toUpperCase()}" />
    <line x1="${centerX - 110}" y1="${y + 33}" x2="${centerX + 110}" y2="${y + 33}" stroke="${brandPalette.sageLively.toUpperCase()}" stroke-width="11" stroke-linecap="round" />
    <circle cx="${centerX + 152}" cy="${y + 33}" r="14" fill="${brandPalette.sun.toUpperCase()}" />
    <text x="${centerX}" y="${y + 89}" text-anchor="middle" fill="${brandPalette.moss.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="42" font-weight="800">${escapeXml(session.audience)}</text>
    <text x="${centerX}" y="${y + 123}" text-anchor="middle" fill="${brandPalette.muted.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="31" font-weight="800">${escapeXml(session.time)}</text>
  </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(event.title)} - ${escapeXml(event.subtitle)}</title>
  <desc id="desc">A Facebook event cover for ${escapeXml(event.title)} at The Number Garden.</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${brandPalette.paperTop.toUpperCase()}" />
      <stop offset="0.64" stop-color="${brandPalette.creamBright.toUpperCase()}" />
      <stop offset="1" stop-color="${brandPalette.paperBottom.toUpperCase()}" />
    </linearGradient>
    <pattern id="dot-grid" width="96" height="96" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="4" fill="${brandPalette.leaf.toUpperCase()}" opacity="0.13" />
    </pattern>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="${brandPalette.ink.toUpperCase()}" flood-opacity="0.12" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#paper)" />
  <rect width="${width}" height="${height}" fill="url(#dot-grid)" opacity="0.18" />
  <circle cx="${margin}" cy="${Math.round(height * 0.18)}" r="${Math.round(width * 0.19)}" fill="${brandPalette.sun.toUpperCase()}" opacity="0.14" />
  <circle cx="${width - margin}" cy="${height - margin}" r="${Math.round(width * 0.25)}" fill="${brandPalette.sage.toUpperCase()}" opacity="0.42" />

  <g transform="translate(${markX} ${markY}) scale(${markScale})" opacity="0.88">
${markBody}
  </g>

  <text x="${safeInsetX}" y="${Math.round(height * 0.195)}" fill="${brandPalette.clay.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="35" font-weight="800" letter-spacing="6">${escapeXml(event.date.toUpperCase())}</text>
  <text x="${safeInsetX}" y="${Math.round(height * 0.405)}" fill="${brandPalette.ink.toUpperCase()}" font-family="Fraunces, Georgia, serif" font-size="${titleFontSize}" font-weight="650">${escapeXml(event.title)}</text>
  <text x="${safeInsetX}" y="${Math.round(height * 0.575)}" fill="${brandPalette.ink.toUpperCase()}" font-family="Fraunces, Georgia, serif" font-size="${subtitleFontSize}" font-weight="650">${escapeXml(event.subtitle)}</text>

  <g filter="url(#soft-shadow)">
${sessionCards}
  </g>

  <text x="${safeInsetX}" y="${sessionBottom - 54}" fill="${brandPalette.moss.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="38" font-weight="800">${escapeXml(event.location)}</text>
  <text x="${safeInsetX}" y="${sessionBottom}" dominant-baseline="text-after-edge" fill="${brandPalette.moss.toUpperCase()}" font-family="Avenir Next, Manrope, Arial, sans-serif" font-size="38" font-weight="800">NE Portland</text>
</svg>
`;
};
