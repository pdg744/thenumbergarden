import type { APIRoute } from "astro";

const pages = [
  "/",
  "/about/",
  "/about/diffy-squares/",
  "/about/diffy-squares/app/",
  "/contact/",
  "/family-visit/",
  "/founder/",
  "/portland-math-camp/",
  "/portland-math-tutor/",
  "/resources/",
];

export const GET: APIRoute = () => {
  const urls = pages
    .map((path) => {
      const loc = new URL(path, import.meta.env.SITE);

      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
};
