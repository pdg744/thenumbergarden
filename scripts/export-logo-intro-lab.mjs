import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { logoIntroConfig } from "../src/config/brand.js";
import {
  buildLogoIntroFrameSvg,
  getLogoIntroDuration,
  getLogoIntroPreset,
  getLogoIntroSettings,
  logoIntroAspectPresets,
} from "../src/lib/video/logoIntroRenderer.js";

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

const args = parseArgs();
const presetId = args.get("preset") ?? "youtube-16x9";
const fps = Number(args.get("fps") ?? 30);
const preset = getLogoIntroPreset(presetId);
const outputName = args.get("output-name") ?? logoIntroConfig.outputName;
const decodeSettings = (value) => {
  if (!value) {
    return {};
  }

  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
};
const settings = getLogoIntroSettings(logoIntroConfig, decodeSettings(args.get("settings")));
const duration = Number(args.get("duration") ?? getLogoIntroDuration(logoIntroConfig, settings));
const frameCount = Math.ceil(duration * fps) + 1;
const outputRoot = path.resolve(args.get("output-root") ?? "media/logo-intro-lab");
const frameDir = path.join(outputRoot, `${outputName}-${preset.id}-${fps}fps-frames`);
const outputPath = path.join(outputRoot, `${outputName}-${preset.id}.mp4`);
const cleanFrames = args.get("clean-frames") === "true";

if (!Number.isFinite(fps) || fps <= 0) {
  throw new Error("--fps must be a positive number.");
}

if (!logoIntroAspectPresets.some((candidate) => candidate.id === presetId)) {
  throw new Error(`Unknown preset "${presetId}".`);
}

await mkdir(frameDir, { recursive: true });

for (let frame = 0; frame < frameCount; frame += 1) {
  const elapsed = Math.min(frame / fps, duration);
  const svg = buildLogoIntroFrameSvg({
    introConfig: logoIntroConfig,
    settings,
    preset,
    elapsed,
    includeMetadata: frame === 0,
  });
  const framePath = path.join(frameDir, `${String(frame + 1).padStart(6, "0")}.png`);

  await sharp(Buffer.from(svg), { density: 72, limitInputPixels: false })
    .png()
    .toFile(framePath);
}

const ffmpeg = spawnSync("ffmpeg", [
  "-y",
  "-framerate",
  String(fps),
  "-i",
  path.join(frameDir, "%06d.png"),
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  outputPath,
], { stdio: "inherit" });

if (ffmpeg.error || ffmpeg.status !== 0) {
  await writeFile(
    path.join(outputRoot, "README.txt"),
    [
      "Logo intro frames were rendered successfully.",
      "",
      `Frames: ${frameDir}`,
      `Preset: ${preset.label} (${preset.width}x${preset.height})`,
      "",
      "Install ffmpeg or run this command to encode manually:",
      `ffmpeg -y -framerate ${fps} -i "${path.join(frameDir, "%06d.png")}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${outputPath}"`,
      "",
    ].join("\n"),
    "utf8"
  );

  throw new Error(`Rendered ${frameCount} frames, but ffmpeg did not produce an MP4.`);
}

console.log(`Rendered ${frameCount} frames at ${preset.width}x${preset.height}.`);
console.log(`Wrote ${outputPath}`);

if (cleanFrames) {
  await rm(frameDir, { recursive: true, force: true });
  console.log(`Removed ${frameDir}`);
}
