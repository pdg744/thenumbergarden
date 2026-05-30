import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { logoMarkSettings } from "../src/config/brand.js";
import { buildPentagonalCircleMarkSvg } from "../src/lib/logo/pentagonalCircleMark.js";

const args = new Map(
  process.argv.slice(2).flatMap((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    return match ? [[match[1], match[2]]] : [];
  })
);

const outputPath = args.get("out") ?? "public/brand/logo-mark.svg";
const svg = buildPentagonalCircleMarkSvg({
  ...logoMarkSettings,
  showGuides: false,
  transparent: true,
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${svg}\n`, "utf8");

console.log(`Wrote ${outputPath}`);
