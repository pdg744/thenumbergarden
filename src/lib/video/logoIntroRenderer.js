const pentagonMidpointRatio = Math.cos(Math.PI / 5);

export const logoIntroAspectPresets = [
  {
    id: "youtube-16x9",
    label: "YouTube",
    shortLabel: "16:9",
    width: 1920,
    height: 1080,
  },
  {
    id: "reels-9x16",
    label: "Shorts / Reels",
    shortLabel: "9:16",
    width: 1080,
    height: 1920,
  },
  {
    id: "feed-4x5",
    label: "Feed",
    shortLabel: "4:5",
    width: 1080,
    height: 1350,
  },
  {
    id: "square-1x1",
    label: "Square",
    shortLabel: "1:1",
    width: 1080,
    height: 1080,
  },
];

export const getLogoIntroPreset = (presetId = "youtube-16x9") =>
  logoIntroAspectPresets.find((preset) => preset.id === presetId) ?? logoIntroAspectPresets[0];

export const getLogoIntroSettings = (introConfig, overrides = {}) => ({
  transitionDuration: introConfig.animation.transitionDuration,
  startGuideOpacity: introConfig.animation.startGuideOpacity,
  startOuterRadius: introConfig.initialGeometry.outerRadius,
  startCircleRadius: introConfig.initialGeometry.circleRadius,
  startRotation: introConfig.initialGeometry.rotation,
  startRingTwist: introConfig.initialGeometry.ringTwist,
  finalFirstRadius: introConfig.finalGeometry.firstRadius,
  finalSpacing: introConfig.finalGeometry.spacing,
  finalOuterSpacing: introConfig.finalGeometry.outerSpacing,
  finalCircleRadius: introConfig.finalGeometry.circleRadius,
  finalMiddleCircleRadius: introConfig.finalGeometry.middleCircleRadius,
  finalOuterCircleRadius: introConfig.finalGeometry.outerCircleRadius,
  overshootScale: introConfig.animation.overshootScale,
  guideOpacity: introConfig.animation.guideOpacity,
  showWordmark: introConfig.text.showWordmark,
  ...overrides,
});

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const easeOutCubic = (amount) => 1 - (1 - amount) ** 3;

const point = (radius, angle) => [Math.cos(angle) * radius, Math.sin(angle) * radius];

const linearRadii = (geometry) => {
  const radii = [geometry.firstRadius];

  for (let ring = 2; ring <= geometry.rings; ring += 1) {
    const step = ring === geometry.rings
      ? geometry.outerSpacing ?? geometry.spacing
      : geometry.spacing;
    radii.push(radii.at(-1) + step);
  }

  return radii;
};

const resolveGeometry = (geometry) => {
  if (geometry.construction !== "inscribed" && geometry.construction !== "linear") {
    return {
      ...geometry,
      radii: linearRadii(geometry),
    };
  }

  return {
    ...geometry,
    radii: Array.from({ length: geometry.rings }, (_, index) =>
      geometry.construction === "inscribed"
        ? geometry.outerRadius * pentagonMidpointRatio ** (geometry.rings - index - 1)
        : geometry.outerRadius * ((index + 1) / geometry.rings)
    ),
  };
};

const resolvedRingRadius = (ring, geometry) =>
  geometry.radii ? geometry.radii[ring - 1] : geometry.firstRadius + (ring - 1) * geometry.spacing;

const pentagon = (ring, geometry) => {
  const rotation = ((geometry.rotation + (ring - 1) * geometry.ringTwist) * Math.PI) / 180;
  const radius = resolvedRingRadius(ring, geometry);
  return Array.from({ length: 5 }, (_, index) => point(radius, rotation + (index * Math.PI * 2) / 5));
};

const ringPoints = (ring, geometry) => {
  const vertices = pentagon(ring, geometry);
  return vertices.flatMap((start, index) => {
    const end = vertices[(index + 1) % vertices.length];
    return Array.from({ length: ring }, (_, step) => {
      const amount = step / ring;
      return [
        start[0] + (end[0] - start[0]) * amount,
        start[1] + (end[1] - start[1]) * amount,
      ];
    });
  });
};

export const buildLogoIntroConfig = (introConfig, settings) => ({
  outputName: introConfig.outputName,
  holdDuration: introConfig.holdDuration,
  backgroundColor: introConfig.backgroundColor,
  initialGeometry: {
    construction: "linear",
    outerRadius: settings.startOuterRadius,
    circleRadius: settings.startCircleRadius,
    rotation: settings.startRotation,
    ringTwist: settings.startRingTwist,
  },
  finalGeometry: {
    rings: introConfig.finalGeometry.rings,
    innerRings: introConfig.finalGeometry.innerRings,
    rotation: introConfig.finalGeometry.rotation,
    ringTwist: introConfig.finalGeometry.ringTwist,
    firstRadius: settings.finalFirstRadius,
    spacing: settings.finalSpacing,
    outerSpacing: settings.finalOuterSpacing,
    circleRadius: settings.finalCircleRadius,
    middleCircleRadius: settings.finalMiddleCircleRadius,
    outerCircleRadius: settings.finalOuterCircleRadius,
  },
  animation: {
    transitionDuration: settings.transitionDuration,
    overshootScale: settings.overshootScale,
    guideOpacity: settings.guideOpacity,
    startGuideOpacity: settings.startGuideOpacity,
  },
  palette: introConfig.palette,
  text: {
    showWordmark: settings.showWordmark,
    wordmark: introConfig.text.wordmark,
    tagline: introConfig.text.tagline,
    wordmarkDelay: introConfig.text.wordmarkDelay,
    taglineDelay: introConfig.text.taglineDelay,
    revealDuration: introConfig.text.revealDuration,
  },
});

const getState = (introConfig, settings) => {
  const baseGeometry = {
    rings: introConfig.finalGeometry.rings,
    innerRings: introConfig.finalGeometry.innerRings,
    rotation: introConfig.finalGeometry.rotation,
    ringTwist: introConfig.finalGeometry.ringTwist,
  };
  const initialGeometry = {
    ...baseGeometry,
    construction: "linear",
    outerRadius: settings.startOuterRadius,
    circleRadius: settings.startCircleRadius,
    rotation: settings.startRotation,
    ringTwist: settings.startRingTwist,
  };
  const finalGeometry = {
    ...baseGeometry,
    firstRadius: settings.finalFirstRadius,
    spacing: settings.finalSpacing,
    outerSpacing: settings.finalOuterSpacing,
    circleRadius: settings.finalCircleRadius,
    middleCircleRadius: settings.finalMiddleCircleRadius,
    outerCircleRadius: settings.finalOuterCircleRadius,
  };

  return {
    initialGeometry: resolveGeometry(initialGeometry),
    finalGeometry: resolveGeometry(finalGeometry),
  };
};

const buildDots = (geometry, finalGeometry, palette) => {
  const dots = [[0, 0, 0, palette.center, geometry.circleRadius]];

  for (let ring = 1; ring <= finalGeometry.rings; ring += 1) {
    const color = ring <= finalGeometry.innerRings
      ? palette.inner
      : ring === finalGeometry.rings
        ? palette.outer
        : palette.middle;
    const radius = ring === finalGeometry.rings
      ? geometry.outerCircleRadius ?? geometry.circleRadius
      : ring > finalGeometry.innerRings
        ? geometry.middleCircleRadius ?? geometry.circleRadius
        : geometry.circleRadius;

    ringPoints(ring, geometry).forEach(([x, y]) => dots.push([x, y, ring, color, radius]));
  }

  return dots;
};

const interpolateGeometry = (initialGeometry, finalGeometry, amount, settings) => ({
  ...finalGeometry,
  radii: finalGeometry.radii.map((radius, index) => lerp(initialGeometry.radii[index], radius, amount)),
  circleRadius: interpolateRadius(initialGeometry.circleRadius, finalGeometry.circleRadius, amount, settings),
  middleCircleRadius: interpolateRadius(
    initialGeometry.circleRadius,
    finalGeometry.middleCircleRadius ?? finalGeometry.circleRadius,
    amount,
    settings
  ),
  outerCircleRadius: interpolateRadius(
    initialGeometry.circleRadius,
    finalGeometry.outerCircleRadius ?? finalGeometry.circleRadius,
    amount,
    settings
  ),
  rotation: lerp(initialGeometry.rotation, finalGeometry.rotation, amount),
  ringTwist: lerp(initialGeometry.ringTwist, finalGeometry.ringTwist, amount),
});

function interpolateRadius(start, end, amount, settings) {
  const overshootAmount = settings.overshootScale <= 1
    ? amount
    : amount <= 0.72
      ? amount / 0.72
      : (1 - amount) / 0.28;
  const overshoot = (end * settings.overshootScale - end) * clamp(overshootAmount);

  return lerp(start, end, amount) + overshoot;
}

const getLogoBounds = (initialGeometry, finalGeometry) => {
  const initialRadius = resolvedRingRadius(initialGeometry.rings, initialGeometry) + initialGeometry.circleRadius;
  const finalRadius = resolvedRingRadius(finalGeometry.rings, finalGeometry) + finalGeometry.outerCircleRadius;
  return Math.max(initialRadius, finalRadius);
};

const formatPoints = (points, centerX, centerY, scale) =>
  points.map(([x, y]) => `${(centerX + x * scale).toFixed(2)},${(centerY + y * scale).toFixed(2)}`).join(" ");

const textOpacity = (elapsed, delay, duration) => easeOutCubic(clamp((elapsed - delay) / duration));

export const getLogoIntroDuration = (introConfig, settings = getLogoIntroSettings(introConfig)) => {
  const revealDuration = introConfig.text.revealDuration ?? 0.65;
  const textEnd = settings.showWordmark
    ? Math.max(
      introConfig.text.wordmarkDelay + revealDuration,
      introConfig.text.taglineDelay + revealDuration
    )
    : settings.transitionDuration;

  return Math.max(settings.transitionDuration, textEnd) + introConfig.holdDuration;
};

export const buildLogoIntroFrameSvg = ({
  introConfig,
  settings = getLogoIntroSettings(introConfig),
  preset = logoIntroAspectPresets[0],
  elapsed = 0,
  includeMetadata = false,
}) => {
  const { initialGeometry, finalGeometry } = getState(introConfig, settings);
  const transitionAmount = clamp(elapsed / settings.transitionDuration);
  const geometry = interpolateGeometry(initialGeometry, finalGeometry, transitionAmount, settings);
  const palette = {
    ...introConfig.palette,
    background: introConfig.backgroundColor,
  };
  const width = preset.width;
  const height = preset.height;
  const logoBounds = getLogoBounds(initialGeometry, finalGeometry);
  const shortSide = Math.min(width, height);
  const wordmarkSpace = settings.showWordmark ? shortSide * 0.2 : 0;
  const scale = ((shortSide - wordmarkSpace) * 0.37) / logoBounds;
  const centerX = width / 2;
  const centerY = settings.showWordmark ? height * (height > width ? 0.42 : 0.39) : height / 2;
  const guideOpacity = lerp(settings.startGuideOpacity, settings.guideOpacity, transitionAmount);

  const guides = Array.from({ length: finalGeometry.rings }, (_, index) =>
    `<polygon class="guide" points="${formatPoints(pentagon(index + 1, geometry), centerX, centerY, scale)}" />`
  ).join("");

  const dots = buildDots(geometry, finalGeometry, palette).map(([x, y, , color, radius]) =>
    `<circle class="dot" cx="${(centerX + x * scale).toFixed(2)}" cy="${(centerY + y * scale).toFixed(2)}" r="${(radius * scale).toFixed(2)}" fill="${color}" />`
  ).join("");

  const wordmarkOpacity = settings.showWordmark
    ? textOpacity(elapsed, introConfig.text.wordmarkDelay, introConfig.text.revealDuration ?? 0.65)
    : 0;
  const taglineOpacity = settings.showWordmark
    ? textOpacity(elapsed, introConfig.text.taglineDelay, introConfig.text.revealDuration ?? 0.65)
    : 0;
  const wordmarkY = centerY + logoBounds * scale + shortSide * 0.12;
  const taglineY = wordmarkY + shortSide * 0.083;
  const wordmark = settings.showWordmark
    ? `<text class="wordmark" x="${centerX}" y="${wordmarkY.toFixed(2)}" opacity="${wordmarkOpacity.toFixed(3)}" text-anchor="middle">${introConfig.text.wordmark}</text>
      <text class="tagline" x="${centerX}" y="${taglineY.toFixed(2)}" opacity="${taglineOpacity.toFixed(3)}" text-anchor="middle">${introConfig.text.tagline}</text>`
    : "";
  const metadata = includeMetadata
    ? `<metadata>${JSON.stringify({ preset: preset.id, elapsed })}</metadata>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="The Number Garden logo intro frame">
    ${metadata}
    <rect width="${width}" height="${height}" fill="${palette.background}" />
    <style>
      .dot { opacity: 1; }
      .guide {
        fill: none;
        stroke: ${palette.guide};
        stroke-width: ${Math.max(1.5, shortSide * 0.002)};
        stroke-linejoin: round;
        opacity: ${guideOpacity.toFixed(3)};
      }
      .wordmark {
        fill: ${palette.wordmark};
        font: 700 ${shortSide * 0.068}px Georgia, serif;
      }
      .tagline {
        fill: ${palette.tagline};
        font: 600 ${shortSide * 0.04}px Avenir Next, Arial, sans-serif;
        letter-spacing: 0.03em;
      }
    </style>
    ${guides}
    ${dots}
    ${wordmark}
  </svg>`;
};
