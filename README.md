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

## Promo materials

The print-ready promo layouts live in `print/`.

```sh
cd print
make
```

That generates `print/build/promo-printables.pdf` plus page preview PNGs for a quick visual check before printing.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow in `.github/workflows/deploy.yml`.
The site is configured for the custom domain `thenumbergarden.com`.
