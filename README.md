# The Number Garden

Marketing site for The Number Garden, built with Astro and deployed via GitHub Pages.

## Local development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Brand assets

The final logo geometry is driven by `scripts/logo-intro.config.json`.

```sh
npm run brand:export
```

That regenerates the site mark, favicon SVG/PNG/ICO files, Apple touch icon,
social preview, and print logo PDF from the same source.

## Promo materials

The print-ready promo layouts live in `print/`.

```sh
cd print
make
```

That generates `print/build/promo-printables.pdf` plus page preview PNGs for a quick visual check before printing.

## Video intro

The YouTube logo intro is a Manim scene driven by `scripts/logo-intro.config.json`.

```sh
brew install ffmpeg cairo pango
python3 -m venv .venv
source .venv/bin/activate
python -m pip install manim
npm run video:intro:preview
```

Use `npm run video:intro` for the high-quality render. Manim writes rendered video files to `media/`.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow in `.github/workflows/deploy.yml`.
The site is configured for the custom domain `thenumbergarden.com`.
