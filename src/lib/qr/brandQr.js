import { readFileSync } from "node:fs";
import QRCode from "qrcode";
import jsQR from "jsqr";

const BRAND = {
  ink: "#1F2A1F",
  moss: "#36543B",
  leaf: "#6C8A53",
  sun: "#F4C96B",
  clay: "#C86D4B",
  grid: "#DFE8D1",
  cream: "#FAF6EC",
  creamBright: "#FFFAF2",
  paperTop: "#FDF8EF",
  paperBottom: "#F4EFDE",
};

export const DEFAULT_QR_DATA = "https://thenumbergarden.com/family-visit/";

const QUIET_ZONE = 4;
const SVG_MODULE_SIZE = 12;
const PNG_MODULE_SIZE = 12;
const LOGO_MARK = loadLogoMark();

const PRESETS = [
  {
    id: "print-card",
    name: "Print Card",
    stance: "Print-safe",
    summary: "Branded high-contrast modules, orthodox structure, and a tiny center mark for small-format printed cards.",
    moduleStyle: "square",
    background: BRAND.creamBright,
    dark: BRAND.ink,
    accent: BRAND.ink,
    finderOuter: BRAND.ink,
    finderInner: BRAND.creamBright,
    finderCore: BRAND.ink,
    alignmentOuter: BRAND.ink,
    alignmentInner: BRAND.creamBright,
    alignmentCore: BRAND.ink,
    badgeRadius: 2.8,
    badgeLogoScale: 1.7,
    moduleInset: 0.02,
    cornerRadius: 0.04,
    accentEvery: 0,
    errorCorrectionLevel: "Q",
  },
  {
    id: "print-card-color",
    name: "Print Card Color",
    stance: "Print-risky",
    summary: "A more visibly branded print-card QR with deep green modules while preserving finder contrast.",
    moduleStyle: "square",
    background: BRAND.creamBright,
    dark: BRAND.moss,
    accent: BRAND.moss,
    finderOuter: BRAND.moss,
    finderInner: BRAND.creamBright,
    finderCore: BRAND.moss,
    alignmentOuter: BRAND.moss,
    alignmentInner: BRAND.creamBright,
    alignmentCore: BRAND.moss,
    badgeRadius: 2.8,
    badgeLogoScale: 1.7,
    moduleInset: 0.02,
    cornerRadius: 0.04,
    accentEvery: 0,
    errorCorrectionLevel: "Q",
  },
  {
    id: "conservatory",
    name: "Conservatory",
    stance: "Safe",
    summary: "Square modules, no center cutout, and finder frames that stay very close to orthodox QR geometry.",
    moduleStyle: "square",
    background: BRAND.cream,
    dark: BRAND.moss,
    accent: BRAND.sun,
    finderOuter: BRAND.moss,
    finderInner: BRAND.creamBright,
    finderCore: BRAND.sun,
    alignmentOuter: BRAND.moss,
    alignmentInner: BRAND.creamBright,
    alignmentCore: BRAND.sun,
    badgeRadius: 0,
    moduleInset: 0.08,
    cornerRadius: 0.14,
    accentEvery: 0,
  },
  {
    id: "seedbed",
    name: "Seedbed",
    stance: "Expressive",
    summary: "Seed-like circular modules with the Number Garden mark featured directly in a quiet center clearing.",
    moduleStyle: "circle",
    background: BRAND.paperTop,
    dark: BRAND.moss,
    accent: BRAND.leaf,
    finderOuter: BRAND.clay,
    finderInner: BRAND.creamBright,
    finderCore: BRAND.moss,
    alignmentOuter: BRAND.leaf,
    alignmentInner: BRAND.creamBright,
    alignmentCore: BRAND.moss,
    badgeRadius: 0,
    badgeFill: BRAND.creamBright,
    badgeStroke: BRAND.sun,
    badgeStrokeWidth: 0.22,
    badgeLogoScale: 1.9,
    moduleInset: 0.2,
    cornerRadius: 0.2,
    accentEvery: 5,
  },
  {
    id: "trellis",
    name: "Trellis",
    stance: "Experimental",
    summary: "Connected capsule modules push the visual language harder while giving the Number Garden mark more visual ownership.",
    moduleStyle: "capsule",
    background: BRAND.paperBottom,
    dark: BRAND.ink,
    accent: BRAND.leaf,
    finderOuter: BRAND.ink,
    finderInner: BRAND.creamBright,
    finderCore: BRAND.sun,
    alignmentOuter: BRAND.ink,
    alignmentInner: BRAND.creamBright,
    alignmentCore: BRAND.leaf,
    badgeRadius: 4.4,
    badgeFill: BRAND.creamBright,
    badgeStroke: BRAND.clay,
    badgeStrokeWidth: 0.24,
    badgeLogoScale: 1.96,
    moduleInset: 0.18,
    cornerRadius: 0.26,
    accentEvery: 4,
  },
];

const ALIGNMENT_TABLE = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

export function getQrLabEntries(data = DEFAULT_QR_DATA) {
  return PRESETS.map((preset) => buildEntry(createQrModel(data, preset.errorCorrectionLevel), preset));
}

function buildEntry(model, preset) {
  const metrics = collectMetrics(model, preset);
  const svg = renderSvg(model, preset, metrics);
  const validation = validateVariant(model, preset);

  return {
    ...preset,
    data: model.data,
    errorCorrectionLevel: model.errorCorrectionLevel,
    version: model.version,
    modules: model.size,
    svg,
    metrics,
    validation,
  };
}

function createQrModel(data, errorCorrectionLevel = "H") {
  const qr = QRCode.create(data, {
    errorCorrectionLevel,
    margin: 0,
  });

  return {
    data,
    errorCorrectionLevel,
    version: qr.version,
    size: qr.modules.size,
    modules: qr.modules,
    reservedBit: qr.modules.reservedBit,
    alignmentPatterns: getAlignmentPatterns(qr.version, qr.modules.size),
    finderOrigins: [
      { x: 0, y: 0 },
      { x: qr.modules.size - 7, y: 0 },
      { x: 0, y: qr.modules.size - 7 },
    ],
  };
}

function collectMetrics(model, preset) {
  let darkModules = 0;
  let removableModules = 0;
  let suppressedModules = 0;

  for (let y = 0; y < model.size; y += 1) {
    for (let x = 0; x < model.size; x += 1) {
      if (!model.modules.get(x, y)) {
        continue;
      }

      darkModules += 1;

      if (isReservedModule(model, x, y) || isPatternModule(model, x, y)) {
        continue;
      }

      removableModules += 1;

      if (isSuppressedByBadge(model, preset, x, y)) {
        suppressedModules += 1;
      }
    }
  }

  return {
    darkModules,
    removableModules,
    suppressedModules,
    quietZone: QUIET_ZONE,
  };
}

function validateVariant(model, preset) {
  const raster = rasterizeVariant(model, preset, PNG_MODULE_SIZE);
  const result = jsQR(raster.data, raster.size, raster.size);

  return {
    ok: result?.data === model.data,
    decoded: result?.data ?? null,
  };
}

function renderSvg(model, preset, metrics) {
  const totalModules = model.size + QUIET_ZONE * 2;
  const totalSize = totalModules * SVG_MODULE_SIZE;
  const origin = QUIET_ZONE * SVG_MODULE_SIZE;
  const parts = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" role="img" aria-label="${escapeHtml(
      `${preset.name} QR code for The Number Garden`
    )}">`
  );
  parts.push("<defs>");
  parts.push(
    `<linearGradient id="${preset.id}-bg" x1="0%" y1="0%" x2="100%" y2="100%">` +
      `<stop offset="0%" stop-color="${preset.background}"/>` +
      `<stop offset="100%" stop-color="${BRAND.creamBright}"/>` +
      "</linearGradient>"
  );
  parts.push("</defs>");
  parts.push(
    `<rect width="${totalSize}" height="${totalSize}" rx="${SVG_MODULE_SIZE * 2.2}" fill="url(#${preset.id}-bg)"/>`
  );
  parts.push(
    `<rect x="${origin - SVG_MODULE_SIZE * 1.2}" y="${origin - SVG_MODULE_SIZE * 1.2}" width="${model.size * SVG_MODULE_SIZE + SVG_MODULE_SIZE * 2.4}" height="${model.size * SVG_MODULE_SIZE + SVG_MODULE_SIZE * 2.4}" rx="${SVG_MODULE_SIZE * 1.7}" fill="none" stroke="${BRAND.grid}" stroke-width="1.5" opacity="0.85"/>`
  );

  for (let y = 0; y < model.size; y += 1) {
    for (let x = 0; x < model.size; x += 1) {
      if (!shouldRenderModule(model, preset, x, y)) {
        continue;
      }

      if (isPatternModule(model, x, y)) {
        continue;
      }

      parts.push(renderModuleShape(model, preset, x, y, getModuleFill(preset, x, y), SVG_MODULE_SIZE, origin));
    }
  }

  for (const originPoint of model.finderOrigins) {
    parts.push(renderFinder(originPoint.x, originPoint.y, preset, SVG_MODULE_SIZE, origin));
  }

  for (const pattern of model.alignmentPatterns) {
    parts.push(renderAlignment(pattern.x, pattern.y, preset, SVG_MODULE_SIZE, origin));
  }

  if (preset.badgeRadius > 0 && metrics.suppressedModules > 0) {
    parts.push(renderBadge(model, preset, SVG_MODULE_SIZE, origin));
  }

  parts.push("</svg>");
  return parts.join("");
}

function renderModuleShape(model, preset, x, y, fill, moduleSize, origin) {
  const px = origin + x * moduleSize;
  const py = origin + y * moduleSize;

  if (preset.moduleStyle === "circle" && !isReservedModule(model, x, y)) {
    const radius = moduleSize * (0.5 - preset.moduleInset);
    return circleEl(px + moduleSize / 2, py + moduleSize / 2, radius, fill);
  }

  if (preset.moduleStyle === "capsule" && !isReservedModule(model, x, y)) {
    return renderCapsule(model, preset, x, y, px, py, moduleSize, fill);
  }

  const inset = moduleSize * preset.moduleInset;
  return rectEl(px + inset, py + inset, moduleSize - inset * 2, moduleSize - inset * 2, moduleSize * preset.cornerRadius, fill);
}

function renderCapsule(model, preset, x, y, px, py, moduleSize, fill) {
  const neighbors = getDrawableNeighbors(model, preset, x, y);
  const shortSide = moduleSize * 0.56;
  const longSide = moduleSize * 1.68;
  const centerX = px + moduleSize / 2;
  const centerY = py + moduleSize / 2;

  if ((neighbors.left || neighbors.right) && !neighbors.up && !neighbors.down) {
    return rectEl(centerX - longSide / 2, centerY - shortSide / 2, longSide, shortSide, shortSide / 2, fill);
  }

  if ((neighbors.up || neighbors.down) && !neighbors.left && !neighbors.right) {
    return rectEl(centerX - shortSide / 2, centerY - longSide / 2, shortSide, longSide, shortSide / 2, fill);
  }

  const inset = moduleSize * preset.moduleInset;
  return rectEl(px + inset, py + inset, moduleSize - inset * 2, moduleSize - inset * 2, moduleSize * 0.32, fill);
}

function renderFinder(x, y, preset, moduleSize, origin) {
  const px = origin + x * moduleSize;
  const py = origin + y * moduleSize;

  return [
    rectEl(px, py, moduleSize * 7, moduleSize * 7, moduleSize * 1.5, preset.finderOuter),
    rectEl(px + moduleSize, py + moduleSize, moduleSize * 5, moduleSize * 5, moduleSize * 1.1, preset.finderInner),
    rectEl(px + moduleSize * 2, py + moduleSize * 2, moduleSize * 3, moduleSize * 3, moduleSize * 0.72, preset.finderCore),
  ].join("");
}

function renderAlignment(x, y, preset, moduleSize, origin) {
  const px = origin + (x - 2) * moduleSize;
  const py = origin + (y - 2) * moduleSize;

  return [
    rectEl(px, py, moduleSize * 5, moduleSize * 5, moduleSize * 1.05, preset.alignmentOuter),
    rectEl(px + moduleSize, py + moduleSize, moduleSize * 3, moduleSize * 3, moduleSize * 0.68, preset.alignmentInner),
    rectEl(px + moduleSize * 2, py + moduleSize * 2, moduleSize, moduleSize, moduleSize * 0.24, preset.alignmentCore),
  ].join("");
}

function renderBadge(model, preset, moduleSize, origin) {
  const center = origin + (model.size * moduleSize) / 2;
  const radius = preset.badgeRadius * moduleSize;
  const logo = renderLogoMark(center, center, radius * (preset.badgeLogoScale ?? 1.84));

  return logo;
}

function rasterizeVariant(model, preset, moduleSize) {
  const totalModules = model.size + QUIET_ZONE * 2;
  const size = totalModules * moduleSize;
  const data = new Uint8ClampedArray(size * size * 4);
  const origin = QUIET_ZONE * moduleSize;

  fillRaster(data, size, 255);

  for (let y = 0; y < model.size; y += 1) {
    for (let x = 0; x < model.size; x += 1) {
      if (!shouldRenderModule(model, preset, x, y)) {
        continue;
      }

      if (isPatternModule(model, x, y)) {
        continue;
      }

      paintModule(data, size, model, preset, x, y, moduleSize, origin);
    }
  }

  for (const originPoint of model.finderOrigins) {
    paintFinder(data, size, originPoint.x, originPoint.y, moduleSize, origin);
  }

  for (const pattern of model.alignmentPatterns) {
    paintAlignment(data, size, pattern.x, pattern.y, moduleSize, origin);
  }

  if (preset.badgeRadius > 0) {
    paintBadge(data, size, model, preset, moduleSize, origin);
  }

  return { data, size };
}

function paintModule(data, imageSize, model, preset, x, y, moduleSize, origin) {
  const px = origin + x * moduleSize;
  const py = origin + y * moduleSize;

  if (preset.moduleStyle === "circle" && !isReservedModule(model, x, y)) {
    paintCircle(data, imageSize, px + moduleSize / 2, py + moduleSize / 2, moduleSize * (0.5 - preset.moduleInset));
    return;
  }

  if (preset.moduleStyle === "capsule" && !isReservedModule(model, x, y)) {
    const neighbors = getDrawableNeighbors(model, preset, x, y);
    const shortSide = moduleSize * 0.56;
    const longSide = moduleSize * 1.68;
    const centerX = px + moduleSize / 2;
    const centerY = py + moduleSize / 2;

    if ((neighbors.left || neighbors.right) && !neighbors.up && !neighbors.down) {
      paintRoundedRect(
        data,
        imageSize,
        centerX - longSide / 2,
        centerY - shortSide / 2,
        longSide,
        shortSide,
        shortSide / 2
      );
      return;
    }

    if ((neighbors.up || neighbors.down) && !neighbors.left && !neighbors.right) {
      paintRoundedRect(
        data,
        imageSize,
        centerX - shortSide / 2,
        centerY - longSide / 2,
        shortSide,
        longSide,
        shortSide / 2
      );
      return;
    }
  }

  const inset = moduleSize * preset.moduleInset;
  paintRoundedRect(
    data,
    imageSize,
    px + inset,
    py + inset,
    moduleSize - inset * 2,
    moduleSize - inset * 2,
    moduleSize * preset.cornerRadius
  );
}

function paintFinder(data, imageSize, x, y, moduleSize, origin) {
  const px = origin + x * moduleSize;
  const py = origin + y * moduleSize;

  paintRoundedRect(data, imageSize, px, py, moduleSize * 7, moduleSize * 7, moduleSize * 1.5);
  clearRoundedRect(data, imageSize, px + moduleSize, py + moduleSize, moduleSize * 5, moduleSize * 5, moduleSize * 1.1);
  paintRoundedRect(data, imageSize, px + moduleSize * 2, py + moduleSize * 2, moduleSize * 3, moduleSize * 3, moduleSize * 0.72);
}

function paintAlignment(data, imageSize, x, y, moduleSize, origin) {
  const px = origin + (x - 2) * moduleSize;
  const py = origin + (y - 2) * moduleSize;

  paintRoundedRect(data, imageSize, px, py, moduleSize * 5, moduleSize * 5, moduleSize * 1.05);
  clearRoundedRect(data, imageSize, px + moduleSize, py + moduleSize, moduleSize * 3, moduleSize * 3, moduleSize * 0.68);
  paintRoundedRect(data, imageSize, px + moduleSize * 2, py + moduleSize * 2, moduleSize, moduleSize, moduleSize * 0.24);
}

function paintBadge(data, imageSize, model, preset, moduleSize, origin) {
  const center = origin + (model.size * moduleSize) / 2;
  const radius = preset.badgeRadius * moduleSize;

  paintCircleValue(data, imageSize, center, center, radius, 255);
  paintLogoMark(data, imageSize, center, center, radius * (preset.badgeLogoScale ?? 1.84));
}

function getDrawableNeighbors(model, preset, x, y) {
  return {
    left: isDarkDrawableModule(model, preset, x - 1, y),
    right: isDarkDrawableModule(model, preset, x + 1, y),
    up: isDarkDrawableModule(model, preset, x, y - 1),
    down: isDarkDrawableModule(model, preset, x, y + 1),
  };
}

function isDarkDrawableModule(model, preset, x, y) {
  if (x < 0 || y < 0 || x >= model.size || y >= model.size) {
    return false;
  }

  return shouldRenderModule(model, preset, x, y) && !isPatternModule(model, x, y);
}

function shouldRenderModule(model, preset, x, y) {
  if (!model.modules.get(x, y)) {
    return false;
  }

  if (isSuppressedByBadge(model, preset, x, y) && !isReservedModule(model, x, y)) {
    return false;
  }

  return true;
}

function isSuppressedByBadge(model, preset, x, y) {
  if (!preset.badgeRadius) {
    return false;
  }

  const center = (model.size - 1) / 2;
  return Math.hypot(x - center, y - center) <= preset.badgeRadius;
}

function isReservedModule(model, x, y) {
  return Boolean(model.reservedBit[y * model.size + x]);
}

function isPatternModule(model, x, y) {
  return isFinderModule(model, x, y) || isAlignmentModule(model, x, y);
}

function isFinderModule(model, x, y) {
  return model.finderOrigins.some((origin) => withinBox(x, y, origin.x, origin.y, 7, 7));
}

function isAlignmentModule(model, x, y) {
  return model.alignmentPatterns.some((pattern) => withinBox(x, y, pattern.x - 2, pattern.y - 2, 5, 5));
}

function getAlignmentPatterns(version, size) {
  const row = ALIGNMENT_TABLE[version - 1] ?? [];
  const patterns = [];

  for (const y of row) {
    for (const x of row) {
      if (isNearFinder(size, x, y)) {
        continue;
      }

      patterns.push({ x, y });
    }
  }

  return patterns;
}

function isNearFinder(size, x, y) {
  const finderCenters = [
    { x: 3, y: 3 },
    { x: size - 4, y: 3 },
    { x: 3, y: size - 4 },
  ];

  return finderCenters.some((finder) => Math.abs(x - finder.x) <= 4 && Math.abs(y - finder.y) <= 4);
}

function getModuleFill(preset, x, y) {
  if (!preset.accentEvery) {
    return preset.dark;
  }

  return (x + y) % preset.accentEvery === 0 ? preset.accent : preset.dark;
}

function rectEl(x, y, width, height, radius, fill) {
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(width)}" height="${round(height)}" rx="${round(radius)}" fill="${fill}"/>`;
}

function circleEl(cx, cy, radius, fill) {
  return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(radius)}" fill="${fill}"/>`;
}

function fillRaster(data, size, value) {
  for (let i = 0; i < size * size; i += 1) {
    const offset = i * 4;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = 255;
  }
}

function paintRoundedRect(data, imageSize, x, y, width, height, radius) {
  const minX = clamp(Math.floor(x), 0, imageSize);
  const minY = clamp(Math.floor(y), 0, imageSize);
  const maxX = clamp(Math.ceil(x + width), 0, imageSize);
  const maxY = clamp(Math.ceil(y + height), 0, imageSize);

  for (let py = minY; py < maxY; py += 1) {
    for (let px = minX; px < maxX; px += 1) {
      if (!insideRoundedRect(px + 0.5, py + 0.5, x, y, width, height, radius)) {
        continue;
      }

      setPixel(data, imageSize, px, py, 0);
    }
  }
}

function clearRoundedRect(data, imageSize, x, y, width, height, radius) {
  const minX = clamp(Math.floor(x), 0, imageSize);
  const minY = clamp(Math.floor(y), 0, imageSize);
  const maxX = clamp(Math.ceil(x + width), 0, imageSize);
  const maxY = clamp(Math.ceil(y + height), 0, imageSize);

  for (let py = minY; py < maxY; py += 1) {
    for (let px = minX; px < maxX; px += 1) {
      if (!insideRoundedRect(px + 0.5, py + 0.5, x, y, width, height, radius)) {
        continue;
      }

      setPixel(data, imageSize, px, py, 255);
    }
  }
}

function paintCircle(data, imageSize, cx, cy, radius) {
  paintCircleValue(data, imageSize, cx, cy, radius, 0);
}

function paintCircleValue(data, imageSize, cx, cy, radius, value) {
  const minX = clamp(Math.floor(cx - radius), 0, imageSize);
  const minY = clamp(Math.floor(cy - radius), 0, imageSize);
  const maxX = clamp(Math.ceil(cx + radius), 0, imageSize);
  const maxY = clamp(Math.ceil(cy + radius), 0, imageSize);
  const radiusSq = radius * radius;

  for (let py = minY; py < maxY; py += 1) {
    for (let px = minX; px < maxX; px += 1) {
      const dx = px + 0.5 - cx;
      const dy = py + 0.5 - cy;

      if (dx * dx + dy * dy > radiusSq) {
        continue;
      }

      setPixel(data, imageSize, px, py, value);
    }
  }
}

function renderLogoMark(cx, cy, targetSize) {
  if (!LOGO_MARK) {
    return "";
  }

  const { minX, minY, width, height, innerSvg } = LOGO_MARK;
  const scale = targetSize / Math.max(width, height);
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  return `<g transform="translate(${round(cx)} ${round(cy)}) scale(${round(scale)}) translate(${round(-centerX)} ${round(-centerY)})">${innerSvg}</g>`;
}

function paintLogoMark(data, imageSize, cx, cy, targetSize) {
  if (!LOGO_MARK) {
    return;
  }

  const { minX, minY, width, height, circles } = LOGO_MARK;
  const scale = targetSize / Math.max(width, height);
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  for (const circle of circles) {
    const paintValue = isDarkHex(circle.fill) ? 0 : 255;
    const px = cx + (circle.cx - centerX) * scale;
    const py = cy + (circle.cy - centerY) * scale;
    paintCircleValue(data, imageSize, px, py, circle.r * scale, paintValue);
  }
}

function setPixel(data, imageSize, x, y, value) {
  const offset = (y * imageSize + x) * 4;
  data[offset] = value;
  data[offset + 1] = value;
  data[offset + 2] = value;
  data[offset + 3] = 255;
}

function insideRoundedRect(px, py, x, y, width, height, radius) {
  const boundedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  const nearestX = clamp(px, x + boundedRadius, x + width - boundedRadius);
  const nearestY = clamp(py, y + boundedRadius, y + height - boundedRadius);
  const dx = px - nearestX;
  const dy = py - nearestY;
  return dx * dx + dy * dy <= boundedRadius * boundedRadius;
}

function withinBox(x, y, left, top, width, height) {
  return x >= left && y >= top && x < left + width && y < top + height;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Number(value.toFixed(2));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadLogoMark() {
  try {
    const svgPath = new URL("../../../public/brand/logo-mark.svg", import.meta.url);
    const raw = readFileSync(svgPath, "utf8");
    const viewBoxMatch = raw.match(/viewBox="([^"]+)"/);

    if (!viewBoxMatch) {
      return null;
    }

    const [minX, minY, width, height] = viewBoxMatch[1].split(/\s+/).map(Number);
    const innerSvg = raw
      .replace(/^[\s\S]*?<svg[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/<title[\s\S]*?<\/title>/, "")
      .replace(/<desc[\s\S]*?<\/desc>/, "")
      .trim();

    const circles = [...raw.matchAll(/<circle\s+cx="([^"]+)"\s+cy="([^"]+)"\s+r="([^"]+)"\s+fill="([^"]+)"/g)].map(
      (match) => ({
        cx: Number(match[1]),
        cy: Number(match[2]),
        r: Number(match[3]),
        fill: match[4],
      })
    );

    return {
      minX,
      minY,
      width,
      height,
      innerSvg,
      circles,
    };
  } catch {
    return null;
  }
}

function isDarkHex(hex) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((char) => `${char}${char}`).join("") : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance < 170;
}
