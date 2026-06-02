import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { quoteSocialPosts } from "../src/content/social/quote-posts.js";
import { renderQuoteCarouselSvgs } from "../src/creative/social/carouselSvg.js";
import { socialAssetPresets } from "../src/creative/social/presets.js";

const outputRoot = "public/generated/social/proofs/instagram-feed-4x5-carousel";
const preset = socialAssetPresets.find((item) => item.id === "instagram-feed-4x5");
const post = quoteSocialPosts.find((item) => item.id === "hardy-maker-of-patterns");

if (!preset) throw new Error("Missing instagram-feed-4x5 preset.");
if (!post) throw new Error("Missing Hardy quote post.");

const logoMarkBody = async () => {
  const mark = await readFile("public/brand/logo-mark.svg", "utf8");
  return mark
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title[\s\S]*?<\/title>\s*/, "")
    .replace(/<desc[\s\S]*?<\/desc>\s*/, "");
};

const renderPng = async ({ svg, outputPath }) =>
  sharp(Buffer.from(svg), { density: 144, limitInputPixels: false })
    .resize(preset.width, preset.height, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

await mkdir(outputRoot, { recursive: true });

const markBody = await logoMarkBody();
const slides = renderQuoteCarouselSvgs({ post, preset, markBody });

const manifest = {
  generatedAt: new Date().toISOString(),
  assetType: "quote-carousel-proof",
  preset: preset.id,
  width: preset.width,
  height: preset.height,
  post: post.id,
  slides: [],
};

for (const slide of slides) {
  const svgPath = `${outputRoot}/${slide.id}.svg`;
  const pngPath = `${outputRoot}/${slide.id}.png`;
  await writeFile(svgPath, slide.svg, "utf8");
  await renderPng({ svg: slide.svg, outputPath: pngPath });
  manifest.slides.push({
    id: slide.id,
    svg: `${slide.id}.svg`,
    png: `${slide.id}.png`,
  });
}

await writeFile(`${outputRoot}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Wrote Hardy carousel proof to ${outputRoot}`);
