import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { quoteSocialPosts } from "../src/content/social/quote-posts.js";
import { renderQuoteCardSvg } from "../src/creative/social/quoteCardSvg.js";
import { socialAssetPresets } from "../src/creative/social/presets.js";

const args = new Map(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const [key, value = "true"] = arg.slice(2).split("=");
      return [key, value];
    }),
);

const presetFilter = args.get("preset");
const outputRoot = args.get("output") ?? "public/generated/social/quotes";
const selectedPresets = presetFilter
  ? socialAssetPresets.filter((preset) => preset.id === presetFilter)
  : socialAssetPresets;

if (presetFilter && selectedPresets.length === 0) {
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
  assetType: "quote-social",
  posts: [],
};

for (const post of quoteSocialPosts) {
  const postDir = `${outputRoot}/${post.id}`;
  await mkdir(postDir, { recursive: true });

  const postManifest = {
    id: post.id,
    campaign: post.campaign,
    kind: post.kind,
    headline: post.headline,
    caption: post.caption,
    cta: post.cta,
    landingPath: post.landingPath,
    quote: {
      id: post.quote.id,
      text: post.quote.text,
      author: post.quote.author,
      work: post.quote.work,
      year: post.quote.year,
      sourceUrl: post.quote.sourceUrl,
      verificationStatus: post.quote.verificationStatus,
    },
    assets: [],
  };

  for (const preset of selectedPresets) {
    const svg = renderQuoteCardSvg({ post, preset, markBody });
    const svgPath = `${postDir}/${preset.id}.svg`;
    const pngPath = `${postDir}/${preset.id}.png`;
    await writeFile(svgPath, svg, "utf8");
    await renderPng({ svg, outputPath: pngPath, width: preset.width, height: preset.height });

    postManifest.assets.push({
      preset: preset.id,
      label: preset.label,
      platform: preset.platform,
      width: preset.width,
      height: preset.height,
      svg: `${preset.id}.svg`,
      png: `${preset.id}.png`,
    });
  }

  await writeFile(`${postDir}/manifest.json`, `${JSON.stringify(postManifest, null, 2)}\n`, "utf8");
  batchManifest.posts.push({
    id: post.id,
    campaign: post.campaign,
    directory: postDir,
    assetCount: postManifest.assets.length,
  });
}

await writeFile(`${outputRoot}/manifest.json`, `${JSON.stringify(batchManifest, null, 2)}\n`, "utf8");

console.log(`Wrote ${quoteSocialPosts.length} quote social asset set(s) to ${outputRoot}`);
