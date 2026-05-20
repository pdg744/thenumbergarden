import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const sitemapUrl = new URL("/sitemap.xml", import.meta.env.SITE);

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
