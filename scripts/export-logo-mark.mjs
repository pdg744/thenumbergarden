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
const palette = logoIntroConfig.palette;
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
  centerColor: palette.center,
  innerColor: palette.inner,
  middleColor: palette.middle,
  outerColor: palette.outer,
  guideColor: palette.guide,
  backgroundColor: logoIntroConfig.backgroundColor,
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${svg}\n`, "utf8");

console.log(`Wrote ${outputPath}`);
