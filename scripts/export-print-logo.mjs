import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const tempDir = await mkdtemp(path.join(tmpdir(), "number-garden-logo-"));
const tempPng = path.join(tempDir, "logo-mark-print.png");

await sharp("public/brand/logo-mark.svg", { density: 1024, limitInputPixels: false })
  .resize(2048, 2048, { fit: "contain" })
  .png()
  .toFile(tempPng);

await execFileAsync("sips", [
  "-s",
  "format",
  "pdf",
  tempPng,
  "--out",
  "print/assets/logo-mark.pdf",
]);

console.log("Wrote print/assets/logo-mark.pdf");
