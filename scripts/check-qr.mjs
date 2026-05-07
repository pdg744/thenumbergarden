import { getQrLabEntries } from "../src/lib/qr/brandQr.js";

const entries = getQrLabEntries();

for (const entry of entries) {
  const status = entry.validation.ok ? "PASS" : "FAIL";
  console.log(
    `${status} ${entry.name}: decoded=${entry.validation.decoded ?? "null"} suppressed=${entry.metrics.suppressedModules}`
  );
}
