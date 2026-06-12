import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { renderEventCoverSvg } from "../src/creative/social/eventCoverSvg.js";
import { socialAssetPresets } from "../src/creative/social/presets.js";
import { socialEvents } from "../src/content/social/events.js";

const args = new Map(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const [key, value = "true"] = arg.slice(2).split("=");
      return [key, value];
    }),
);

const outputRoot = args.get("output") ?? "public/generated/social/events";
const presetFilter = args.get("preset") ?? "facebook-event-cover";
const selectedPresets = socialAssetPresets.filter((preset) => preset.id === presetFilter);

if (selectedPresets.length === 0) {
  throw new Error(`Unknown social preset: ${presetFilter}`);
}

const logoMarkBody = async () => {
  const mark = await readFile("public/brand/logo-mark.svg", "utf8");
  return mark
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title[\s\S]*?<\/title>\s*/, "")
    .replace(/<desc[\s\S]*?<\/desc>\s*/, "");
};

const renderPng = async ({ svg, outputPath, width, height }) =>
  sharp(Buffer.from(svg), { density: 144, limitInputPixels: false })
    .resize(width, height, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

await mkdir(outputRoot, { recursive: true });

const markBody = await logoMarkBody();
const batchManifest = {
  generatedAt: new Date().toISOString(),
  assetType: "event-social",
  events: [],
};

for (const event of socialEvents) {
  const eventDir = `${outputRoot}/${event.id}`;
  await mkdir(eventDir, { recursive: true });

  const eventManifest = {
    id: event.id,
    campaign: event.campaign,
    kind: event.kind,
    title: event.title,
    subtitle: event.subtitle,
    date: event.date,
    schedule: event.schedule,
    audience: event.audience,
    sessions: event.sessions,
    location: event.location,
    tagline: event.tagline,
    landingPath: event.landingPath,
    assets: [],
  };

  for (const preset of selectedPresets) {
    const svg = renderEventCoverSvg({ event, preset, markBody });
    const svgPath = `${eventDir}/${preset.id}.svg`;
    const pngPath = `${eventDir}/${preset.id}.png`;
    await writeFile(svgPath, svg, "utf8");
    await renderPng({ svg, outputPath: pngPath, width: preset.width, height: preset.height });

    eventManifest.assets.push({
      preset: preset.id,
      label: preset.label,
      platform: preset.platform,
      width: preset.width,
      height: preset.height,
      svg: `${preset.id}.svg`,
      png: `${preset.id}.png`,
    });
  }

  await writeFile(`${eventDir}/manifest.json`, `${JSON.stringify(eventManifest, null, 2)}\n`, "utf8");
  batchManifest.events.push({
    id: event.id,
    campaign: event.campaign,
    directory: eventDir,
    assetCount: eventManifest.assets.length,
  });
}

await writeFile(`${outputRoot}/manifest.json`, `${JSON.stringify(batchManifest, null, 2)}\n`, "utf8");

console.log(`Wrote ${socialEvents.length} event social asset set(s) to ${outputRoot}`);
