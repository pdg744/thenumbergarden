import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { logoIntroConfig } from "../src/config/brand.js";
import {
  buildLogoIntroFrameSvg,
  getLogoIntroDuration,
  getLogoIntroPreset,
  getLogoIntroSettings,
} from "../src/lib/video/logoIntroRenderer.js";

const defaultSpec = {
  name: "logo-intro-cross-section",
  preset: "reels-9x16",
  fps: 30,
  outputRoot: "media/reel-families",
  fixed: {
    showWordmark: true,
    startGuideOpacity: 0.68,
    guideOpacity: 0,
  },
  axes: [
    {
      name: "transitionDuration",
      values: [2.2, 2.88, 3.6],
    },
    {
      name: "startRingTwist",
      values: [-24, 0, 24],
    },
  ],
};

const parseArgs = () => {
  const args = new Map();

  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith("--")) {
      continue;
    }

    const [key, value = "true"] = arg.slice(2).split("=");
    args.set(key, value);
  }

  return args;
};

const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "family";

const encodeSettings = (settings) =>
  Buffer.from(JSON.stringify(settings), "utf8").toString("base64url");

const readSpec = async (specPath) => {
  if (!specPath) {
    return { spec: defaultSpec, specPath: null };
  }

  const resolvedSpecPath = path.resolve(specPath);
  return {
    spec: JSON.parse(await readFile(resolvedSpecPath, "utf8")),
    specPath: resolvedSpecPath,
  };
};

const cartesian = (axes, index = 0, point = {}) => {
  if (index >= axes.length) {
    return [point];
  }

  const axis = axes[index];
  return axis.values.flatMap((value) =>
    cartesian(axes, index + 1, {
      ...point,
      [axis.name]: value,
    })
  );
};

const writeJson = (filePath, data) =>
  writeFile(`${filePath}.json`, `${JSON.stringify(data, null, 2)}\n`, "utf8");

const fileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const buildFamilyReadme = ({ familyName, manifest, regenerateCommand }) => `# ${familyName}

Generated reel family from the logo intro surface.

## Regenerate

\`\`\`sh
${regenerateCommand}
\`\`\`

## Contents

- \`spec.json\`: copied source spec for this family
- \`manifest.json\`: generated family index with every point and render command
- \`contact-sheet.html\`: visual comparison sheet
- \`reel-*/point.json\`: exact settings for each reel point
- \`reel-*/*.mp4\`: rendered videos when generated with \`--render\`

This run produced ${manifest.count} of ${manifest.totalCount} possible point(s).
`;

const buildContactSheet = ({ familyName, jobs, preset }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${familyName}</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        background: #faf6ec;
        color: #1f2a1f;
        font: 16px/1.45 Avenir Next, Arial, sans-serif;
      }

      h1 {
        margin: 0 0 16px;
        font: 700 32px/1 Georgia, serif;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
      }

      figure {
        margin: 0;
        padding: 10px;
        border: 1px solid rgba(54, 84, 59, 0.16);
        border-radius: 8px;
        background: #fffaf2;
      }

      img,
      video {
        display: block;
        width: 100%;
        aspect-ratio: ${preset.width} / ${preset.height};
        object-fit: contain;
        background: #faf6ec;
      }

      figcaption {
        display: grid;
        gap: 4px;
        margin-top: 8px;
        font-size: 12px;
      }

      code {
        overflow-wrap: anywhere;
      }
    </style>
  </head>
  <body>
    <h1>${familyName}</h1>
    <div class="grid">
      ${jobs.map((job) => `
        <figure>
          ${job.videoFile
            ? `<video src="${job.videoFile}" poster="${job.posterFile}" controls muted playsinline preload="metadata"></video>`
            : `<img src="${job.posterFile}" alt="${job.id}">`}
          <figcaption>
            <strong>${job.id}</strong>
            <code>${JSON.stringify(job.axisValues)}</code>
          </figcaption>
        </figure>
      `).join("")}
    </div>
  </body>
</html>
`;

const args = parseArgs();
const { spec, specPath } = await readSpec(args.get("spec"));
const familyName = spec.name ?? defaultSpec.name;
const familySlug = slugify(familyName);
const preset = getLogoIntroPreset(spec.preset ?? defaultSpec.preset);
const fps = Number(spec.fps ?? defaultSpec.fps);
const outputRoot = path.resolve(spec.outputRoot ?? defaultSpec.outputRoot);
const familyDir = path.join(outputRoot, familySlug);
const renderVideos = args.get("render") === "true";
const limit = args.has("limit") ? Number(args.get("limit")) : undefined;
const cleanFrames = args.get("keep-frames") !== "true";
const axes = spec.axes ?? [];
const allPoints = axes.length > 0 ? cartesian(axes) : [{}];
const points = Number.isFinite(limit) && limit > 0 ? allPoints.slice(0, limit) : allPoints;

if (!Number.isFinite(fps) || fps <= 0) {
  throw new Error("Spec fps must be a positive number.");
}

if (points.length === 0) {
  throw new Error("Spec did not produce any points.");
}

await mkdir(familyDir, { recursive: true });

const jobs = [];

for (const [index, axisValues] of points.entries()) {
  const id = `reel-${String(index + 1).padStart(3, "0")}`;
  const jobDir = path.join(familyDir, id);
  const settings = getLogoIntroSettings(logoIntroConfig, {
    ...(spec.fixed ?? {}),
    ...axisValues,
  });
  const duration = getLogoIntroDuration(logoIntroConfig, settings);
  const posterElapsed = Math.min(settings.transitionDuration, duration);
  const posterSvg = buildLogoIntroFrameSvg({
    introConfig: logoIntroConfig,
    settings,
    preset,
    elapsed: posterElapsed,
    includeMetadata: true,
  });
  const encodedSettings = encodeSettings(settings);
  const outputName = `${familySlug}-${id}`;
  const videoFile = `${outputName}-${preset.id}.mp4`;
  const videoPath = path.join(jobDir, videoFile);
  const renderCommand = [
    "npm",
    "run",
    "video:intro:lab",
    "--",
    `--preset=${preset.id}`,
    `--fps=${fps}`,
    `--settings=${encodedSettings}`,
    `--output-root=${jobDir}`,
    `--output-name=${outputName}`,
    cleanFrames ? "--clean-frames=true" : "--clean-frames=false",
  ];

  await mkdir(jobDir, { recursive: true });
  await writeJson(path.join(jobDir, "point"), {
    id,
    axisValues,
    settings,
    preset: preset.id,
    fps,
    duration,
    renderCommand: renderCommand.join(" "),
  });
  await writeFile(path.join(jobDir, "poster.svg"), posterSvg, "utf8");

  if (renderVideos) {
    const render = spawnSync("node", [
      "scripts/export-logo-intro-lab.mjs",
      `--preset=${preset.id}`,
      `--fps=${fps}`,
      `--settings=${encodedSettings}`,
      `--output-root=${jobDir}`,
      `--output-name=${outputName}`,
      cleanFrames ? "--clean-frames=true" : "--clean-frames=false",
    ], { stdio: "inherit" });

    if (render.error || render.status !== 0) {
      throw new Error(`Render failed for ${id}.`);
    }
  }

  jobs.push({
    id,
    axisValues,
    settingsFile: `${id}/point.json`,
    posterFile: `${id}/poster.svg`,
    videoFile: renderVideos || await fileExists(videoPath) ? `${id}/${videoFile}` : null,
    renderCommand: renderCommand.join(" "),
  });
}

const manifest = {
  name: familyName,
  generatedAt: new Date().toISOString(),
  source: "logo-intro-lab",
  sourceSpec: specPath,
  preset: preset.id,
  fps,
  fixed: spec.fixed ?? {},
  axes,
  renderVideos,
  cleanFrames,
  totalCount: allPoints.length,
  count: jobs.length,
  jobs,
};
const regenerateCommand = [
  "npm",
  "run",
  "reel:family",
  "--",
  specPath ? `--spec=${path.relative(process.cwd(), specPath)}` : "",
  renderVideos ? "--render" : "",
  Number.isFinite(limit) && limit > 0 ? `--limit=${limit}` : "",
  cleanFrames ? "" : "--keep-frames",
].filter(Boolean).join(" ");

await writeJson(path.join(familyDir, "manifest"), manifest);
await writeJson(path.join(familyDir, "spec"), spec);
await writeFile(
  path.join(familyDir, "contact-sheet.html"),
  buildContactSheet({ familyName, jobs, preset }),
  "utf8"
);
await writeFile(
  path.join(familyDir, "README.md"),
  buildFamilyReadme({ familyName, manifest, regenerateCommand }),
  "utf8"
);

console.log(`Wrote ${jobs.length} reel family points to ${familyDir}`);
console.log(`Open ${path.join(familyDir, "contact-sheet.html")} to compare the cross-section.`);
