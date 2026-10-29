import type { PageCheck } from "@fsl/shared";
import { Router } from "express";
import { PAGE_CHECK_SOURCE, parseChecks } from "../lib/page-checks.js";

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
  : typeof v === "number" || typeof v === "bigint" || typeof v === "symbol" ? String(v)
  : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
const send = (kind) => (...args) => postMessage({ kind, text: args.map(show).join(" ") });
self.console = { log: send("log"), info: send("log"), warn: send("warn"), error: send("error") };
self.addEventListener("unhandledrejection", (e) => postMessage({ kind: "error", text: "Uncaught (in promise) " + show(e.reason) }));
const same = (a, b) => Object.is(a, b) || (typeof a === "object" && typeof b === "object" && a !== null && b !== null && JSON.stringify(a) === JSON.stringify(b));
// A test that gives back a promise is awaited; "done" waits for them all.
const __pending = [];
self.__test = (label, run, expected) => {
  const report = (got) => postMessage(same(got, expected)
    ? { kind: "pass", text: "✓ " + label + " gives " + show(got) }
    : { kind: "fail", text: "✗ " + label + " gives " + show(got) + ", expected " + show(expected) });
  const fail = (error) => postMessage({ kind: "fail", text: "✗ " + label + " failed: " + show(error) });
  try {
    const got = run();
    if (got !== null && typeof got === "object" && typeof got.then === "function") {
      postMessage({ kind: "async" });
      __pending.push(Promise.resolve(got).then(report, fail));
    } else report(got);
  } catch (error) {
    fail(error);
  }
};
`;

/** A "your turn" test: an expression to run and the value it should give. */
export type RunnerTest = { call: string; expect: string };

/** Code that runs each test after the learner's code, in the same scope. */
export function testCalls(tests: RunnerTest[]): string {
  return tests
    .map(
      ({ call, expect }) =>
        `__test(${JSON.stringify(call)}, () => (${call}), (${expect}));`,
    )
    .join("\n");
}

/** The worker's whole script: prelude, the code, its tests, then "done". */
export function workerSource(code: string, tests: RunnerTest[] = []): string {
  return `${WORKER_PRELUDE}${code}\n;${testCalls(tests)}\nPromise.all(__pending).then(() => postMessage({ kind: "done" }));`;
}

/**
 * A page that runs `code` (and any tests) in a worker and prints what it
 * logs. With tests, it tells the page that framed it how many passed.
 */
export function jsRunnerPage(code: string, tests: RunnerTest[] = []): string {
  const source = JSON.stringify(workerSource(code, tests))
    // Keep the code inside the <script> element whatever it contains.
    .replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
body{margin:0;font:13px/1.6 ui-monospace,monospace;color:#1f2328;background:#fff}
#out{margin:0;padding:8px 12px;white-space:pre-wrap;word-break:break-word}
.warn{color:#9a6700}.error,.fail{color:#b42318}.pass{color:#1a7f37}.note{color:#59636e;font-style:italic}
@media (prefers-color-scheme:dark){:root{color-scheme:dark}body{color:#e6edf3;background:#0a0a0a}.warn{color:#d29922}.error,.fail{color:#f85149}.pass{color:#3fb950}.note{color:#9198a1}}
</style></head><body><pre id="out"></pre><script>
const out = document.getElementById("out");
const line = (text, kind) => { const span = document.createElement("span"); span.className = kind; span.textContent = text + "\\n"; out.append(span); };
const total = ${tests.length};
let done = false, passed = 0;
const finish = () => { done = true; if (total) parent.postMessage({ source: "fsl-runner", passed, total }, "*"); };
const worker = new Worker(URL.createObjectURL(new Blob([${source}], { type: "text/javascript" })));
worker.onmessage = (e) => { if (e.data.kind === "async") return; if (e.data.kind === "done") { if (!out.childNodes.length) line("(nothing was logged)", "note"); finish(); } else { if (e.data.kind === "pass") passed++; line(e.data.text, e.data.kind); } };
worker.onerror = (e) => { e.preventDefault(); line(e.message, "error"); finish(); };
setTimeout(() => { worker.terminate(); if (!done) { line("Stopped: still running after ${JS_TIME_LIMIT_MS / 1000} seconds. An endless loop?", "error"); finish(); } }, ${JS_TIME_LIMIT_MS});
</script></body></html>`;
}

function parseTests(raw: unknown): RunnerTest[] | undefined {
  if (typeof raw !== "string" || raw.length > MAX_PLAYGROUND_CODE) return;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      Array.isArray(value) &&
      value.every(
        (t: unknown) =>
          typeof t === "object" &&
          t !== null &&
          typeof (t as RunnerTest).call === "string" &&
          typeof (t as RunnerTest).expect === "string",
      )
    ) {
      return (value as RunnerTest[]).map(({ call, expect }) => ({
        call,
        expect,
      }));
    }
  } catch {
    // not JSON
  }
}

// GET /playground/js?code=…&tests=… — runs a step's JavaScript example (with
// a "your turn" exercise's tests) and shows its console output, in a
// sandboxed iframe on the step.
playgroundRouter.get("/js", (req, res) => {
  const { code = "", tests: rawTests = "[]" } = req.query;
  if (typeof code !== "string" || code.length > MAX_PLAYGROUND_CODE) {
    res
      .status(400)
      .type("text/plain")
      .send(`code must be text of at most ${MAX_PLAYGROUND_CODE} characters.`);
    return;
  }
  const tests = parseTests(rawTests);
  if (!tests) {
    res
      .status(400)
      .type("text/plain")
      .send(
        `tests must be a JSON list of { call, expect } of at most ${MAX_PLAYGROUND_CODE} characters.`,
      );
    return;
  }
  res
    .set("Content-Security-Policy", JS_RUNNER_POLICY)
    .set("X-Frame-Options", "SAMEORIGIN")
    .set("Cache-Control", "no-store")
    .type("html")
    .send(jsRunnerPage(code, tests));
});

/**
 * The page runner's policy: HTML, CSS and the learner's own inline scripts
 * (and inline event handlers) may run, as a unique origin with no network,
 * storage or access to this site. Forms may fire their submit event, but
 * `form-action 'none'` stops them being sent anywhere.
 */
export const PAGE_RUNNER_POLICY = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: https:",
  "media-src data: https:",
  "font-src data:",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'self'",
  "sandbox allow-scripts allow-forms",
].join("; ");

/**
 * Runs before the learner's code: console output and errors go to the
 * page that framed this one. With checks, once the page has loaded they
 * run in order and the results are sent as one message.
 */
function pageHarness(checks: PageCheck[]): string {
  const list = JSON.stringify(checks).replace(/</g, "\\u003c");
  return `<script>(() => {
const post = (m) => parent.postMessage(m, "*");
const show = (v) => typeof v === "string" ? v : v instanceof Error ? v.name + ": " + v.message : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
for (const kind of ["log", "info", "warn", "error"]) {
  const original = console[kind].bind(console);
  console[kind] = (...args) => { post({ source: "fsl-page", kind: kind === "info" ? "log" : kind, text: args.map(show).join(" ") }); original(...args); };
}
addEventListener("error", (e) => post({ source: "fsl-page", kind: "error", text: e.message }));
${PAGE_CHECK_SOURCE}
const checks = ${list};
if (!checks.length) return;
const run = async () => {
  const results = [];
  for (const c of checks) {
    let result;
    try { result = window.__fslCheck(c); } catch (e) { result = { pass: false, detail: show(e) }; }
    results.push({ label: c.label, ...result });
    await new Promise((r) => setTimeout(r, 0));
  }
  post({ source: "fsl-runner", passed: results.filter((r) => r.pass).length, total: results.length, results });
};
addEventListener("load", () => setTimeout(run, 50));
})();</script>`;
}

/** The learner's page with the harness first, so it sees every log. */
export function pageRunnerPage(code: string, checks: PageCheck[] = []): string {
  const harness = pageHarness(checks);
  const page = playgroundPage(code);
  const head = /<head[^>]*>/i.exec(page);
  if (head) {
    const at = head.index + head[0].length;
    return page.slice(0, at) + harness + page.slice(at);
  }
  // A whole document without a <head>: put it straight after <html>.
  return page.replace(/<html[^>]*>/i, (tag) => tag + harness);
}

// GET /playground/page?code=…&checks=… — a page made of HTML, CSS and
// scripts (a DOM example, or a "your turn" exercise with its checks), in a
// sandboxed iframe on the step.
playgroundRouter.get("/page", (req, res) => {
  const { code = "", checks: rawChecks = "[]" } = req.query;
  if (typeof code !== "string" || code.length > MAX_PLAYGROUND_CODE) {
    res
      .status(400)
      .type("text/plain")
      .send(`code must be text of at most ${MAX_PLAYGROUND_CODE} characters.`);
    return;
  }
  let checks: PageCheck[] | undefined;
  if (
    typeof rawChecks === "string" &&
    rawChecks.length <= MAX_PLAYGROUND_CODE
  ) {
    try {
      checks = parseChecks(JSON.parse(rawChecks));
    } catch {
      // not JSON
    }
  }
  if (!checks) {
    res
      .status(400)
      .type("text/plain")
      .send(
        `checks must be a JSON list of page checks of at most ${MAX_PLAYGROUND_CODE} characters.`,
      );
    return;
  }
  res
    .set("Content-Security-Policy", PAGE_RUNNER_POLICY)
    .set("X-Frame-Options", "SAMEORIGIN")
    .set("Cache-Control", "no-store")
    .type("html")
    .send(pageRunnerPage(code, checks));
});
