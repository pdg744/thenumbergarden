const DEFAULT_SETTINGS = {
  rings: 4,
  innerRings: 2,
  firstRadius: 18,
  spacing: 14.2,
  circleRadius: 13.1,
  rotation: -54,
  ringTwist: -36,
  padding: 24,
  guideOpacity: 0.9,
  guideStroke: 1.5,
  showGuides: true,
  transparent: true,
  centerColor: "#36543b",
  innerColor: "#dbe8d0",
  middleColor: "#6c8a53",
  outerColor: "#36543b",
  guideColor: "#dbe8d0",
  backgroundColor: "#faf6ec",
};

const polarPoint = (center, radius, angle) => ({
  x: center + Math.cos(angle) * radius,
  y: center + Math.sin(angle) * radius,
});

export const getDefaultPentagonalCircleMarkSettings = () => ({ ...DEFAULT_SETTINGS });

export const getRingRadius = (ring, firstRadius, spacing) => firstRadius + (ring - 1) * spacing;

export const getPentagonalRingPoints = (ring, center, firstRadius, spacing, rotation) => {
  const vertices = Array.from({ length: 5 }, (_, index) =>
      polarPoint(
        center,
        getRingRadius(ring, firstRadius, spacing),
        rotation + (index * Math.PI * 2) / 5
      )
  );

  return vertices.flatMap((start, index) => {
    const end = vertices[(index + 1) % vertices.length];

    return Array.from({ length: ring }, (_, step) => {
      const amount = step / ring;

      return {
        x: start.x + (end.x - start.x) * amount,
        y: start.y + (end.y - start.y) * amount,
      };
    });
  });
};

export const buildPentagonalCircleMarkSvg = (inputSettings = {}) => {
  const settings = { ...DEFAULT_SETTINGS, ...inputSettings };
  const maxRadius = getRingRadius(settings.rings, settings.firstRadius, settings.spacing);
  const center = maxRadius + settings.circleRadius + settings.padding;
  const size = center * 2;
  const rotation = (settings.rotation * Math.PI) / 180;
  const ringTwist = (settings.ringTwist * Math.PI) / 180;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.toFixed(2)} ${size.toFixed(2)}" role="img" aria-labelledby="title desc">`,
    "  <title id=\"title\">The Number Garden pentagonal circle mark</title>",
    "  <desc id=\"desc\">Overlapping circles arranged on pentagonal-number rings.</desc>",
  ];

  if (!settings.transparent) {
    parts.push(
      `  <rect width="${size.toFixed(2)}" height="${size.toFixed(2)}" fill="${settings.backgroundColor}" />`
    );
  }

  if (settings.showGuides && settings.guideOpacity > 0) {
    for (let ring = 1; ring <= settings.rings; ring += 1) {
      const points = getPentagonalRingPoints(
        ring,
        center,
        settings.firstRadius,
        settings.spacing,
        rotation + (ring - 1) * ringTwist
      )
        .filter((_, index) => index % ring === 0)
        .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
        .join(" ");

      parts.push(
        `  <polygon points="${points}" fill="none" stroke="${settings.guideColor}" stroke-width="${settings.guideStroke}" stroke-linejoin="round" opacity="${settings.guideOpacity}" />`
      );
    }
  }

  parts.push(
    `  <circle cx="${center.toFixed(2)}" cy="${center.toFixed(2)}" r="${settings.circleRadius}" fill="${settings.centerColor}" />`
  );

  for (let ring = 1; ring <= settings.rings; ring += 1) {
    const innerRings = Math.min(settings.innerRings, settings.rings);
    const fill =
      ring <= innerRings
        ? settings.innerColor
        : ring === settings.rings
          ? settings.outerColor
          : settings.middleColor;

    for (const point of getPentagonalRingPoints(
      ring,
      center,
      settings.firstRadius,
      settings.spacing,
      rotation + (ring - 1) * ringTwist
    )) {
      parts.push(
        `  <circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${settings.circleRadius}" fill="${fill}" />`
      );
    }
  }

  parts.push("</svg>");

  return parts.join("\n");
};
