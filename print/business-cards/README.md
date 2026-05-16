# Business Cards

Two-sided business card masters for The Number Garden.

Source of truth:

- `business-card-source.svg`: editable front/back business card source. Make layout, type, color, stroke, and guide edits here.
- `../../scripts/export-business-card-assets.mjs`: small export helper that copies/converts the source SVG into dated proof batches.

Generated assets:

- `exports/YYYY-MM-DD/HH-MM-SS/`: dated and time-batched SVG and PNG preview exports
- `exports/YYYY-MM-DD/HH-MM-SS/print-ready/`: PDFs generated for the print shop when PDF tooling is available
- Generated proof folders are local artifacts and are ignored by git.

Naming notes:

- `source-paper`: the editable SVG paper background using `#FFFAF2`, `#FDF8EF`, and `#F4EFDE`
- `paper-overlay`: the subtle yellow/green radial overlay on top of the paper gradient
- `print-paper`: the adjusted print-output paper palette using `#F8F0DD`, `#FBF2E2`, and `#F0E4C9`
- Avoid using `warm` in asset names; reserve it for brand voice and prose.

Legacy hand-authored assets:

- `business-card-front.svg`: original front artwork
- `business-card-back.svg`: original/refined back artwork
- `business-card-back-branded.svg`: refined back artwork with stronger brand color
- `seedbed-homepage-qr.svg`: Source print-safe branded QR code pointing to `https://thenumbergarden.com/`
- `seedbed-homepage-qr.png`: High-resolution QR render embedded in the card SVGs
- `seedbed-homepage-qr-branded.svg`: Source riskier color QR code pointing to `https://thenumbergarden.com/`
- `seedbed-homepage-qr-branded.png`: High-resolution riskier color QR render embedded in `business-card-back-branded.svg`
- `archive/generated-previews-2026-05-10/`: generated PNG previews from the print-prep pass; not source of truth

Export a proof batch:

```sh
npm run cards:export
```

The exporter copies `business-card-source.svg` into `exports/<today>/<current-time>/`, creates a PNG preview, and, if `rsvg-convert` is installed, writes a vector PDF into that batch's `print-ready/` folder.

For quick SVG-only export:

```sh
npm run cards:export -- --format=svg
```

To recreate or revise a specific batch:

```sh
npm run cards:export -- --date=2026-05-14 --time=16-47-00
```

Specs:

- Finished trim: 3.5 in x 2 in
- Artwork size: 3.75 in x 2.25 in
- Bleed: 0.125 in on all sides
- Keep essential text inside the inner 3.25 in x 1.75 in safe area

The safer QR files were generated from the `print-card` preset in `src/lib/qr/brandQr.js`; the color alternate uses `print-card-color`.
