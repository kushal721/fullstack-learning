import { Router } from "express";
import { sitemapPaths } from "../lib/page-meta.js";
import { siteOrigin } from "../lib/site-origin.js";

export const seoRouter = Router();

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// GET /sitemap.xml: every page from the content registries (sections,
// topics, concepts, build steps, flows and exercises), so search engines
// find pages that are only reachable by clicking around.
seoRouter.get("/sitemap.xml", (req, res) => {
  const origin = siteOrigin(req);
  const urls = sitemapPaths()
    .map((path) => `  <url><loc>${escapeXml(origin + path)}</loc></url>`)
    .join("\n");
  res
    .type("application/xml")
    .set("Cache-Control", "no-cache")
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    );
});

// GET /robots.txt: everything may be crawled except the API, and here is
// the sitemap.
seoRouter.get("/robots.txt", (req, res) => {
  res
    .type("text/plain")
    .set("Cache-Control", "no-cache")
    .send(
      `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteOrigin(req)}/sitemap.xml\n`,
    );
});
