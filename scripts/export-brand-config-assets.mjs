import { mkdir, writeFile } from "node:fs/promises";
import { logoIntroConfig, publicPalette } from "../src/config/brand.js";

const writeJson = async (path, value) => {
  await mkdir(new URL(".", new URL(`../${path}`, import.meta.url)), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path}`);
};

await writeJson("scripts/logo-intro.config.json", logoIntroConfig);
await writeJson("public/brand/palette.json", publicPalette);
