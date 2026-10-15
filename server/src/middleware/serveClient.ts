import express, { Router } from "express";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pageMeta, SITE_NAME } from "../lib/page-meta.js";
import { siteOrigin } from "../lib/site-origin.js";

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// The block in index.html that each page's own tags replace.
const META_BLOCK = /<!-- page-meta:[\s\S]*?<!-- \/page-meta -->/;

/** index.html with the page's title, description and preview tags. */
export function renderIndexHtml(
  template: string,
  pathname: string,
  search: string,
  origin: string,
): { html: string; status: number } {
  const meta = pageMeta(pathname, search);
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const url = escapeHtml(origin + pathname + search);
  const tags = [
    `<title data-server-meta>${title}</title>`,
    `<meta data-server-meta name="description" content="${description}" />`,
    `<meta data-server-meta property="og:title" content="${title}" />`,
    `<meta data-server-meta property="og:description" content="${description}" />`,
    `<meta data-server-meta property="og:url" content="${url}" />`,
    `<meta data-server-meta property="og:image" content="${escapeHtml(origin)}/og-image.png" />`,
    `<meta data-server-meta property="og:image:alt" content="${escapeHtml(SITE_NAME)}: learn by building one real app" />`,
    meta.status === 404
      ? `<meta data-server-meta name="robots" content="noindex" />`
      : `<link data-server-meta rel="canonical" href="${url}" />`,
  ].join("\n    ");
  return { html: template.replace(META_BLOCK, tags), status: meta.status };
}

// Serves the built React app. Hashed files in /assets never change, so the
// browser may cache them forever; index.html must always be re-checked so a
// new deploy is picked up.
export function serveClient(clientDist: string) {
  const router = Router();
  const template = readFileSync(path.join(clientDist, "index.html"), "utf8");

  router.use(
    "/assets",
    express.static(path.join(clientDist, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );
  router.use(express.static(clientDist, { index: false }));

  // Single-page app fallback: React Router handles paths like /learn in the
  // browser, so every other GET returns index.html, with that page's title
  // and description already in it, and 404 for addresses that match no page.
  router.get("/{*path}", (req, res) => {
    const search = req.originalUrl.includes("?")
      ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
      : "";
    const { html, status } = renderIndexHtml(
      template,
      req.path,
      search,
      siteOrigin(req),
    );
    res.status(status).set("Cache-Control", "no-cache").type("html").send(html);
  });

  return router;
}
