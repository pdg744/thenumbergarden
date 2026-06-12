import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

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
const libraryPath = path.resolve(args.get("library") ?? "specs/reel-families/library.json");
const library = JSON.parse(await readFile(libraryPath, "utf8"));
const render = args.get("render") === "true";
const limitPerFamily = args.get("limit-per-family");
const keepFrames = args.get("keep-frames") === "true";
const outputRoot = path.resolve(library.outputRoot ?? "media/reel-families");

const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "family";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const buildSharedContactSheet = ({ library, families, generatedAt }) => {
  const totalRendered = families.reduce((sum, family) =>
    sum + family.jobs.filter((job) => job.videoFile).length, 0);
  const totalShown = families.reduce((sum, family) => sum + family.jobs.length, 0);
  const totalPrepared = families.reduce((sum, family) => sum + family.totalCount, 0);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(library.name ?? "Reel Library")}</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        background: #faf6ec;
        color: #1f2a1f;
        font: 16px/1.45 Avenir Next, Arial, sans-serif;
      }

      header {
        display: grid;
        gap: 10px;
        margin-bottom: 26px;
      }

      h1,
      h2 {
        margin: 0;
        font-family: Georgia, serif;
        line-height: 1;
      }

      h1 {
        font-size: clamp(32px, 5vw, 58px);
      }

      h2 {
        font-size: 26px;
      }

      p {
        max-width: 76ch;
        margin: 0;
        color: #536151;
      }

      .stats {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 6px;
      }

      .stat {
        padding: 7px 10px;
        border: 1px solid rgba(54, 84, 59, 0.16);
        border-radius: 8px;
        background: #fffaf2;
        font-weight: 800;
      }

      section {
        display: grid;
        gap: 14px;
        margin-top: 28px;
      }

      .family-heading {
        display: flex;
        flex-wrap: wrap;
        align-items: end;
        justify-content: space-between;
        gap: 10px;
      }

      a {
        color: #36543b;
        font-weight: 800;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
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
        aspect-ratio: 9 / 16;
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
    <header>
      <h1>${escapeHtml(library.name ?? "Reel Library")}</h1>
      <p>${escapeHtml(library.description ?? "Generated reel families.")}</p>
      <div class="stats">
        <span class="stat">${families.length} families</span>
        <span class="stat">${totalShown} shown</span>
        <span class="stat">${totalRendered} rendered MP4s</span>
        <span class="stat">${totalPrepared} prepared points</span>
      </div>
      <p>Generated ${escapeHtml(generatedAt)}. Regenerate with <code>npm run reel:library -- --render</code>.</p>
    </header>

    ${families.map((family) => `
      <section>
        <div class="family-heading">
          <div>
            <h2>${escapeHtml(family.name)}</h2>
            <p>${family.count} shown of ${family.totalCount} prepared points.</p>
          </div>
          <a href="${family.slug}/contact-sheet.html">Family sheet</a>
        </div>
        <div class="grid">
          ${family.jobs.map((job) => `
            <figure>
              ${job.videoFile
                ? `<video src="${family.slug}/${job.videoFile}" poster="${family.slug}/${job.posterFile}" controls muted playsinline preload="metadata"></video>`
                : `<img src="${family.slug}/${job.posterFile}" alt="${escapeHtml(`${family.name} ${job.id}`)}">`}
              <figcaption>
                <strong>${escapeHtml(family.slug)} / ${escapeHtml(job.id)}</strong>
                <code>${escapeHtml(JSON.stringify(job.axisValues))}</code>
              </figcaption>
            </figure>
          `).join("")}
        </div>
      </section>
    `).join("")}
  </body>
</html>
`;
};

const familyManifests = [];

for (const family of library.families ?? []) {
  const specPath = path.resolve(path.dirname(libraryPath), family.spec);
  const spec = JSON.parse(await readFile(specPath, "utf8"));
  const familySlug = slugify(spec.name ?? family.name ?? family.spec);
  const command = [
    "scripts/export-reel-family.mjs",
    `--spec=${specPath}`,
    render ? "--render" : "",
    limitPerFamily ? `--limit=${limitPerFamily}` : "",
    keepFrames ? "--keep-frames" : "",
  ].filter(Boolean);

  console.log(`\n== ${family.name ?? family.spec} ==`);
  const result = spawnSync("node", command, { stdio: "inherit" });

  if (result.error || result.status !== 0) {
    throw new Error(`Library export failed for ${family.spec}.`);
  }

  const manifest = JSON.parse(await readFile(path.join(outputRoot, familySlug, "manifest.json"), "utf8"));
  familyManifests.push({
    ...manifest,
    slug: familySlug,
    libraryName: family.name ?? manifest.name,
  });
}

const generatedAt = new Date().toISOString();
const libraryManifest = {
  name: library.name,
  description: library.description,
  generatedAt,
  sourceLibrary: libraryPath,
  outputRoot,
  families: familyManifests.map((family) => ({
    name: family.name,
    slug: family.slug,
    count: family.count,
    totalCount: family.totalCount,
    renderedCount: family.jobs.filter((job) => job.videoFile).length,
    manifestFile: `${family.slug}/manifest.json`,
    contactSheetFile: `${family.slug}/contact-sheet.html`,
  })),
};

await mkdir(outputRoot, { recursive: true });
await writeFile(
  path.join(outputRoot, "manifest.json"),
  `${JSON.stringify(libraryManifest, null, 2)}\n`,
  "utf8"
);
await writeFile(
  path.join(outputRoot, "index.html"),
  buildSharedContactSheet({ library, families: familyManifests, generatedAt }),
  "utf8"
);

console.log(`\nWrote shared library contact sheet to ${path.join(outputRoot, "index.html")}`);
