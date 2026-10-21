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

/**
 * The JavaScript runner's policy: its own inline script may run, and it
 * runs the learner's code in a worker made from a blob, so an endless loop
 * can be stopped. It can't reach the network, storage or this site
 * (`sandbox allow-scripts` without same-origin makes it a unique origin).
 */
export const JS_RUNNER_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "worker-src blob:",
  "style-src 'unsafe-inline'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'self'",
  "sandbox allow-scripts",
].join("; ");

/** How long code may run before it's stopped (an endless loop, say). */
export const JS_TIME_LIMIT_MS = 2000;

// Runs inside the worker before the learner's code: console output and
// errors become messages for the page to show.
const WORKER_PRELUDE = `
const show = (v) => typeof v === "string" ? v
  : v instanceof Error ? v.name + ": " + v.message
  : typeof v === "function" ? "function " + (v.name || "(anonymous)")
  : v === undefined ? "undefined"
  : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
const send = (kind) => (...args) => postMessage({ kind, text: args.map(show).join(" ") });
self.console = { log: send("log"), info: send("log"), warn: send("warn"), error: send("error") };
self.addEventListener("unhandledrejection", (e) => postMessage({ kind: "error", text: "Uncaught (in promise) " + show(e.reason) }));
`;

/** A page that runs `code` in a worker and prints what it logs. */
export function jsRunnerPage(code: string): string {
  const source = JSON.stringify(
    WORKER_PRELUDE + code + "\n;postMessage({ kind: 'done' });",
  )
    // Keep the code inside the <script> element whatever it contains.
    .replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
body{margin:0;font:13px/1.6 ui-monospace,monospace;color:#1f2328;background:#fff}
#out{margin:0;padding:8px 12px;white-space:pre-wrap;word-break:break-word}
.warn{color:#9a6700}.error{color:#b42318}.note{color:#59636e;font-style:italic}
</style></head><body><pre id="out"></pre><script>
const out = document.getElementById("out");
const line = (text, kind) => { const span = document.createElement("span"); span.className = kind; span.textContent = text + "\\n"; out.append(span); };
let done = false;
const worker = new Worker(URL.createObjectURL(new Blob([${source}], { type: "text/javascript" })));
worker.onmessage = (e) => { if (e.data.kind === "done") { done = true; if (!out.childNodes.length) line("(nothing was logged)", "note"); } else line(e.data.text, e.data.kind); };
worker.onerror = (e) => { e.preventDefault(); done = true; line(e.message, "error"); };
setTimeout(() => { worker.terminate(); if (!done) line("Stopped: still running after ${JS_TIME_LIMIT_MS / 1000} seconds. An endless loop?", "error"); }, ${JS_TIME_LIMIT_MS});
</script></body></html>`;
}

// GET /playground/js?code=… — runs a step's JavaScript example and shows
// its console output, in a sandboxed iframe on the step.
playgroundRouter.get("/js", (req, res) => {
  const { code = "" } = req.query;
  if (typeof code !== "string" || code.length > MAX_PLAYGROUND_CODE) {
    res
      .status(400)
      .type("text/plain")
      .send(`code must be text of at most ${MAX_PLAYGROUND_CODE} characters.`);
    return;
  }
  res
    .set("Content-Security-Policy", JS_RUNNER_POLICY)
    .set("X-Frame-Options", "SAMEORIGIN")
    .set("Cache-Control", "no-store")
    .type("html")
    .send(jsRunnerPage(code));
});
