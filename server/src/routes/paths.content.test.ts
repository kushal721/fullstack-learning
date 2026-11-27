import type { PathResponse, StepResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

// The real guided paths (no fixtures): their shape as the course map plans
// it, and every step answering. Every request comes from one address, more
// than the API's per-address limit allows, so the limit is raised here.
const app = createApp({ rateLimits: { api: 100_000, checks: 30 } });

const PLANNED: [
  topic: string,
  basic: number,
  intermediate: number,
  advanced: number,
][] = [
  ["how-the-web-works", 7, 13, 16],
  ["html", 6, 12, 18],
  ["css", 7, 13, 17],
  ["javascript", 11, 17, 24],
  ["git", 6, 11, 15],
  ["react", 7, 13, 18],
  ["http", 7, 12, 17],
  ["backend", 6, 12, 16],
  ["databases", 6, 11, 16],
  ["authentication", 6, 11, 16],
];

describe.each(PLANNED)(
  "the %s path",
  (topic, basicEnd, intermediateEnd, end) => {
    it(`is numbered 1–${basicEnd}, ${basicEnd + 1}–${intermediateEnd}, ${intermediateEnd + 1}–${end}`, async () => {
      const res = await request(app).get(`/api/paths/${topic}`);
      const body = res.body as PathResponse;

      expect(res.status).toBe(200);
      expect(
        body.levels.map((l) => [l.level, l.firstNumber, l.lastNumber]),
      ).toEqual([
        ["basic", 1, basicEnd],
        ["intermediate", basicEnd + 1, intermediateEnd],
        ["advanced", intermediateEnd + 1, end],
      ]);
      for (const level of body.levels) {
        expect(level.steps.at(-1)!.kind).toBe("check");
      }
    });

    it("serves every step, and every level check has its questions", async () => {
      const path = (await request(app).get(`/api/paths/${topic}`))
        .body as PathResponse;
      for (const step of path.levels.flatMap((l) => l.steps)) {
        const res = await request(app).get(
          `/api/paths/${topic}/steps/${step.id}`,
        );
        expect(res.status, step.id).toBe(200);
        const body = res.body as StepResponse;
        if (step.kind === "check") {
          expect(body.questions!.length, step.id).toBeGreaterThanOrEqual(4);
        } else {
          expect(body.blocks.length, step.id).toBeGreaterThan(0);
        }
      }
    });
  },
);

// The JavaScript modules: [step id, its number in Basic].
const JS_MODULES: [id: string, number: number][] = [
  ["getting-started", 1],
  ["variables", 2],
  ["text-and-numbers", 3],
  ["decisions", 4],
  ["loops", 5],
  ["functions", 6],
  ["arrays", 7],
  ["objects", 8],
  ["the-dom", 9],
  ["events", 10],
  ["json", 12],
  ["async", 13],
  ["errors", 14],
  ["modules-and-syntax", 15],
  ["reading-the-notes-api", 16],
  ["closures", 18],
  ["event-loop", 19],
  ["this-and-classes", 20],
  ["references", 21],
  ["typescript", 22],
  ["debugging", 23],
];

// What every module must have: its number, parts covering all its blocks,
// objectives, and each kind of teaching block.
async function checkModule(topic: string, id: string, number: number) {
  const path = (await request(app).get(`/api/paths/${topic}`))
    .body as PathResponse;
  const summary = path.levels
    .flatMap((level) => level.steps)
    .find((s) => s.id === id)!;
  expect(summary.number).toBe(number);

  const body = (await request(app).get(`/api/paths/${topic}/steps/${id}`))
    .body as StepResponse;
  expect(summary.parts).toBe(body.sections!.length);
  expect(body.objectives!.length).toBeGreaterThanOrEqual(3);
  expect(body.sections!.reduce((n, s) => n + s.blockCount, 0)).toBe(
    body.blocks.length,
  );
  const types = new Set(body.blocks.map((b) => b.type));
  for (const type of ["anatomy", "trace", "yourTurn", "mistake", "check"]) {
    expect(types, type).toContain(type);
  }
}

describe.each(JS_MODULES)("the JavaScript %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("javascript", id, number));
});

// The How the Web Works modules: [step id, its number].
const WEB_MODULES: [id: string, number: number][] = [
  ["clients-and-servers", 1],
  ["urls", 2],
  ["dns", 3],
  ["http", 4],
  ["https", 5],
  ["the-browser", 6],
  ["ports-and-tcp", 8],
  ["cookies-and-caching", 9],
  ["apis-and-json", 10],
  ["hosting-and-cdns", 11],
  ["inside-the-browser", 12],
  ["advanced-networking", 14],
  ["performance-and-production", 15],
];

describe.each(WEB_MODULES)("the How the Web Works %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("how-the-web-works", id, number));
});

// The Git & GitHub modules: [step id, its number]. Every step is one.
const GIT_MODULES: [id: string, number: number][] = [
  ["repositories", 1],
  ["commits", 2],
  ["branches", 3],
  ["github", 4],
  ["pull-requests", 5],
  ["merge-conflicts", 7],
  ["rewriting-history", 8],
  ["what-to-commit", 9],
  ["code-review", 10],
  ["searching-history", 12],
  ["hooks-and-actions", 13],
  ["signed-commits", 14],
];

describe.each(GIT_MODULES)("the Git & GitHub %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("git", id, number));
});

// The React modules: [step id, its number]. Every step is one.
const REACT_MODULES: [id: string, number: number][] = [
  ["why-react", 1],
  ["components-and-jsx", 2],
  ["props", 3],
  ["state", 4],
  ["events", 5],
  ["lists-and-keys", 6],
  ["effects", 8],
  ["forms", 9],
  ["routing", 10],
  ["context", 11],
  ["custom-hooks", 12],
  ["reducers", 14],
  ["memo-and-performance", 15],
  ["code-splitting", 16],
  ["testing-components", 17],
];

describe.each(REACT_MODULES)("the React %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("react", id, number));
});

const HTTP_MODULES: [id: string, number: number][] = [
  ["apis", 1],
  ["methods", 2],
  ["status-codes", 3],
  ["headers", 4],
  ["json-bodies", 5],
  ["rest-urls", 6],
  ["pagination", 8],
  ["validation-errors", 9],
  ["versioning", 10],
  ["auth-headers", 11],
  ["idempotency", 13],
  ["rate-limits", 14],
  ["openapi", 15],
  ["caching-apis", 16],
];

describe.each(HTTP_MODULES)("the HTTP %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("http", id, number));
});

const BACKEND_MODULES: [id: string, number: number][] = [
  ["what-a-backend-does", 1],
  ["nodejs-and-npm", 2],
  ["express-server", 3],
  ["routes", 4],
  ["middleware", 5],
  ["controllers", 7],
  ["validation", 8],
  ["settings-and-secrets", 9],
  ["error-handling", 10],
  ["logging", 11],
  ["layers-and-architecture", 13],
  ["background-jobs", 14],
  ["scaling", 15],
];

describe.each(BACKEND_MODULES)("the Backend %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("backend", id, number));
});

const DATABASES_MODULES: [id: string, number: number][] = [
  ["why-a-database", 1],
  ["tables-rows-keys", 2],
  ["select-and-insert", 3],
  ["update-and-delete", 4],
  ["sql-from-node", 5],
  ["relationships-and-joins", 7],
  ["indexes", 8],
  ["migrations", 9],
  ["orms", 10],
  ["transactions", 12],
  ["normalisation", 13],
  ["query-plans", 14],
  ["backups", 15],
];

describe.each(DATABASES_MODULES)("the Databases %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("databases", id, number));
});

const AUTHENTICATION_MODULES: [id: string, number: number][] = [
  ["who-are-you", 1],
  ["passwords", 2],
  ["hashing", 3],
  ["signing-up", 4],
  ["the-login-flow", 5],
  ["sessions-and-cookies", 7],
  ["tokens-jwt", 8],
  ["protecting-routes", 9],
  ["logging-out", 10],
  ["refresh-tokens", 12],
  ["oauth", 13],
  ["two-factor", 14],
  ["password-reset", 15],
];

describe.each(AUTHENTICATION_MODULES)(
  "the Authentication %s module",
  (id, number) => {
    it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
      checkModule("authentication", id, number));
  },
);

// The HTML modules: [step id, its number].
const HTML_MODULES: [id: string, number: number][] = [
  ["elements-and-attributes", 1],
  ["page-skeleton", 2],
  ["text-lists-links", 3],
  ["images-and-media", 4],
  ["forms", 5],
  ["semantic-structure", 7],
  ["forms-in-depth", 8],
  ["tables", 9],
  ["accessible-html", 10],
  ["the-dom", 11],
  ["search-and-sharing", 13],
  ["script-loading", 14],
  ["web-components", 15],
  ["details-and-dialog", 16],
  ["html-in-react", 17],
];

describe.each(HTML_MODULES)("the HTML %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("html", id, number));
});

// The CSS modules: [step id, its number].
const CSS_MODULES: [id: string, number: number][] = [
  ["getting-started", 1],
  ["colours-and-text", 2],
  ["box-model", 3],
  ["display-and-sizing", 4],
  ["flexbox", 5],
  ["backgrounds", 6],
  ["grid", 8],
  ["media-queries", 9],
  ["positioning", 10],
  ["states-and-transitions", 11],
  ["cascade", 12],
  ["modern-css", 14],
  ["animations-and-transforms", 15],
  ["css-in-practice", 16],
];

describe.each(CSS_MODULES)("the CSS %s module", (id, number) => {
  it(`is step ${number}, in parts that cover all its blocks, with objectives`, () =>
    checkModule("css", id, number));
});
