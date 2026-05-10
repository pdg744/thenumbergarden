import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildPentagonalCircleMarkSvg } from "../src/lib/logo/pentagonalCircleMark.js";
import logoIntroConfig from "./logo-intro.config.json" with { type: "json" };

const args = new Map(
  process.argv.slice(2).flatMap((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    return match ? [[match[1], match[2]]] : [];
  })
);

const outputPath = args.get("out") ?? "public/brand/logo-mark.svg";
const finalGeometry = logoIntroConfig.finalGeometry;
const sitePalette = {
  center: "#36543b",
  inner: "#dbe8d0",
  middle: "#6c8a53",
  outer: "#36543b",
  guide: "#dbe8d0",
  background: "#faf6ec",
};
const svg = buildPentagonalCircleMarkSvg({
  rings: finalGeometry.rings,
  innerRings: finalGeometry.innerRings,
  firstRadius: finalGeometry.firstRadius,
  spacing: finalGeometry.spacing,
  outerSpacing: finalGeometry.outerSpacing,
  circleRadius: finalGeometry.circleRadius,
  middleCircleRadius: finalGeometry.middleCircleRadius,
  outerCircleRadius: finalGeometry.outerCircleRadius,
  rotation: finalGeometry.rotation,
  ringTwist: finalGeometry.ringTwist,
  padding: 24,
  showGuides: false,
  transparent: true,
  centerColor: sitePalette.center,
  innerColor: sitePalette.inner,
  middleColor: sitePalette.middle,
  outerColor: sitePalette.outer,
  guideColor: sitePalette.guide,
  backgroundColor: sitePalette.background,
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${svg}\n`, "utf8");

console.log(`Wrote ${outputPath}`);
