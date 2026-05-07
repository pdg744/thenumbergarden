import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getQrLabEntries } from "../src/lib/qr/brandQr.js";

const outputDir = path.resolve("public/qr-lab");
const entries = getQrLabEntries();

await mkdir(outputDir, { recursive: true });

const manifest = [];

for (const entry of entries) {
  await writeFile(path.join(outputDir, `${entry.id}.svg`), entry.svg, "utf8");
  manifest.push({
    id: entry.id,
    name: entry.name,
    stance: entry.stance,
    validation: entry.validation.ok,
    suppressedModules: entry.metrics.suppressedModules,
    path: `/qr-lab/${entry.id}.svg`,
  });
}

await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
