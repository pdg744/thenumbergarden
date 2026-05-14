# Business Cards

Two-sided business card masters for The Number Garden.

- `business-card-front.svg`: front artwork
- `business-card-back.svg`: refined back artwork
- `business-card-back-branded.svg`: refined back artwork with stronger brand color
- `seedbed-homepage-qr.svg`: Source print-safe branded QR code pointing to `https://thenumbergarden.com/`
- `seedbed-homepage-qr.png`: High-resolution QR render embedded in the card SVGs
- `seedbed-homepage-qr-branded.svg`: Source riskier color QR code pointing to `https://thenumbergarden.com/`
- `seedbed-homepage-qr-branded.png`: High-resolution riskier color QR render embedded in `business-card-back-branded.svg`
- `print-ready/`: final PDF exports for the print shop
- `archive/generated-previews-2026-05-10/`: generated PNG previews from the print-prep pass; not source of truth

Specs:

- Finished trim: 3.5 in x 2 in
- Artwork size: 3.75 in x 2.25 in
- Bleed: 0.125 in on all sides
- Keep essential text inside the inner 3.25 in x 1.75 in safe area

The safer QR files were generated from the `print-card` preset in `src/lib/qr/brandQr.js`; the color alternate uses `print-card-color`.
