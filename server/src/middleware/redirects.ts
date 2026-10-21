import type { RequestHandler } from "express";

/**
 * Sections that moved when the main nav became Learn, Course map, Flow,
 * Explorer, Build (#384). Concept pages (/concepts/<slug>) stay.
 */
export function movedTo(pathname: string): string | undefined {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/concepts") return "/course-map";
  if (path === "/practice" || /^\/practice\/[^/]+$/.test(path)) {
    return "/course-map";
  }
  if (path === "/project") return "/explorer";
  return undefined;
}

/**
 * Old addresses answer 301 with the new one, keeping the query string
 * (/project?step=4 → /explorer?step=4), so links and bookmarks keep working
 * and search engines learn the new address.
 */
export function legacyRedirects(): RequestHandler {
  return (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const target = movedTo(req.path);
    if (!target) return next();
    const at = req.originalUrl.indexOf("?");
    const search = at >= 0 ? req.originalUrl.slice(at) : "";
    res.redirect(301, `${target}${search}`);
  };
}
