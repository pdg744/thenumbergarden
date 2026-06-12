# Reel Family Harness

The MVP harness treats the logo intro lab as a surface: a settings object is one point, and a spec file describes a cross-section through that surface.

Run the default dry export:

```sh
npm run reel:family
```

Run from an explicit spec:

```sh
npm run reel:family -- --spec=scripts/reel-family.example.json
```

Run from the tracked library specs:

```sh
npm run reel:library
```

The dry export writes:

- `manifest.json` for the family
- one `point.json` per reel
- one `poster.svg` per reel
- `contact-sheet.html` for quick comparison

Render actual MP4s for every point:

```sh
npm run reel:family -- --spec=scripts/reel-family.example.json --render
```

Render only the first few points:

```sh
npm run reel:family -- --spec=scripts/reel-family.example.json --render --limit=3
```

Render a preview slice from every tracked family:

```sh
npm run reel:library -- --render --limit-per-family=3
```

Render the full tracked library:

```sh
npm run reel:library -- --render
```

Rendered family folders include a copied `spec.json`, a `manifest.json`, a `README.md` with the regenerate command, and a `contact-sheet.html`. Frame PNGs are cleaned after each MP4 by default; pass `--keep-frames` when debugging the renderer.

Spec shape:

```json
{
  "name": "logo-intro-twist-speed-study",
  "preset": "reels-9x16",
  "fps": 30,
  "fixed": {
    "showWordmark": true
  },
  "axes": [
    {
      "name": "transitionDuration",
      "values": [2.2, 2.88, 3.6]
    }
  ]
}
```

`fixed` values are held constant. `axes` values are crossed into a grid, so two axes with three values each produce nine reel points.
