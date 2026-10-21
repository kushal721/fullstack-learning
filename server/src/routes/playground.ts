import { Router } from "express";

export const playgroundRouter = Router();

/** Longest code a playground may show; steps keep examples short. */
export const MAX_PLAYGROUND_CODE = 4000;

/**
 * The preview page's own policy. It shows HTML and CSS a learner typed, so
 * it allows inline styles (the main site doesn't) and nothing else: no
 * scripts, no forms sent anywhere, no links to other documents, and only
 * this site may frame it. `sandbox` makes it a unique, powerless origin
 * even when opened on its own.
 */
export const PLAYGROUND_POLICY = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "img-src data: https:",
  "media-src data: https:",
  "font-src data:",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'self'",
  "sandbox",
].join("; ");

const BASE_STYLE =
  "body{font-family:system-ui,sans-serif;line-height:1.5;margin:12px;color:#171717;background:#fff}";

/** A full page around a fragment; a whole document is shown as it is. */
export function playgroundPage(code: string): string {
  if (/^\s*<!doctype html>/i.test(code)) return code;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${BASE_STYLE}</style></head><body>${code}</body></html>`;
}

// GET /playground?code=… — the preview of a step's editable HTML/CSS
// example, shown in a sandboxed iframe on the step.
playgroundRouter.get("/", (req, res) => {
  const { code = "" } = req.query;
  if (typeof code !== "string" || code.length > MAX_PLAYGROUND_CODE) {
    res
      .status(400)
      .type("text/plain")
      .send(`code must be text of at most ${MAX_PLAYGROUND_CODE} characters.`);
    return;
  }
  res
    .set("Content-Security-Policy", PLAYGROUND_POLICY)
    .set("X-Frame-Options", "SAMEORIGIN")
    .set("Cache-Control", "no-store")
    .type("html")
    .send(playgroundPage(code));
});
