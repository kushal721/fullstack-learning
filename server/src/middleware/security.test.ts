import express from "express";
import { Writable } from "node:stream";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { requestLogger } from "./requestLogger.js";
import { corsPolicy } from "./security.js";

describe("security headers", () => {
  it("sends helmet's headers and a strict, self-only CSP", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["strict-transport-security"]).toMatch(/max-age=\d+/);
    expect(res.headers["referrer-policy"]).toBe("no-referrer");
    const csp = res.headers["content-security-policy"];
    for (const directive of [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
    ]) {
      expect(csp).toContain(directive);
    }
    expect(csp).not.toContain("upgrade-insecure-requests");
    expect(csp).not.toContain("unsafe-inline");
  });
});

describe("CORS", () => {
  it("lets no other website read the API by default", async () => {
    const app = createApp();
    const simple = await request(app)
      .get("/api/health")
      .set("Origin", "https://evil.example");
    expect(simple.status).toBe(200);
    expect(simple.headers["access-control-allow-origin"]).toBeUndefined();

    const preflight = await request(app)
      .options("/api/exercises/x/check")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "POST");
    expect(preflight.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("allows only the configured origins when there are any", async () => {
    const app = express();
    app.use(corsPolicy(["https://friend.example"]));
    app.get("/x", (_req, res) => res.json({}));
    const friend = await request(app)
      .get("/x")
      .set("Origin", "https://friend.example");
    expect(friend.headers["access-control-allow-origin"]).toBe(
      "https://friend.example",
    );
    const other = await request(app)
      .get("/x")
      .set("Origin", "https://evil.example");
    expect(other.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("rate limits", () => {
  it("answers 429 with the API's error shape after too many requests", async () => {
    const app = createApp({ rateLimits: { api: 3, checks: 100 } });
    for (let i = 0; i < 3; i++) {
      expect((await request(app).get("/api/topics")).status).toBe(200);
    }
    const blocked = await request(app).get("/api/topics");
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait a moment and try again.",
      },
    });
    expect(blocked.headers.ratelimit).toBeDefined();
    // Health checks are never limited.
    expect((await request(app).get("/api/health")).status).toBe(200);
  });

  it("limits answer checks more strictly than the rest of the API", async () => {
    const app = createApp({ rateLimits: { api: 100, checks: 2 } });
    const check = () =>
      request(app)
        .post("/api/exercises/predict-blank-title/check")
        .send({ answer: { choiceId: "server-400" } });
    expect((await check()).status).toBe(200);
    expect((await check()).status).toBe(200);
    const blocked = await check();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.message).toBe(
      "Too many answers checked. Please wait a moment and try again.",
    );
    // Reading still works.
    expect((await request(app).get("/api/exercises")).status).toBe(200);
  });
});

describe("request logging", () => {
  it("writes one short JSON line per request, without headers or IPs", async () => {
    const lines: string[] = [];
    const sink = new Writable({
      write(chunk, _encoding, done) {
        lines.push(String(chunk));
        done();
      },
    });
    const app = express();
    app.use(requestLogger("info", sink));
    app.get("/api/x", (_req, res) => res.status(404).json({}));
    app.get("/api/health", (_req, res) => res.json({}));
    await request(app).get("/api/x").set("Cookie", "token=secret");
    await request(app).get("/api/health");

    expect(lines).toHaveLength(1);
    const line = JSON.parse(lines[0]!);
    expect(line).toMatchObject({
      level: 40, // warn, for a 4xx
      req: { method: "GET", url: "/api/x" },
      res: { statusCode: 404 },
    });
    expect(line.responseTime).toEqual(expect.any(Number));
    expect(line.req).toEqual({ id: 1, method: "GET", url: "/api/x" });
    expect(line.res).toEqual({ statusCode: 404 });
    expect(lines[0]).not.toContain("secret");
  });
});

describe("audit: no arbitrary paths, no stack traces", () => {
  it.each([
    "/api/files/../../package.json",
    "/api/files/%2e%2e/%2e%2e/package.json",
    "/api/files/..%2f..%2fserver%2fpackage.json",
    "/api/files/%2Fetc%2Fpasswd",
    "/api/files/backend/.env",
  ])("never reads a file outside the example's file list: %s", async (path) => {
    const res = await request(createApp()).get(path);
    // Rejected as malformed (400) or unknown (404); never read.
    expect([400, 404]).toContain(res.status);
    expect(res.body.error.code).toMatch(/VALIDATION_ERROR|NOT_FOUND/);
    expect(JSON.stringify(res.body)).not.toContain('"source"');
  });

  it("answers unexpected input without leaking internals", async () => {
    const res = await request(createApp())
      .post("/api/exercises/predict-blank-title/check")
      .set("Content-Type", "application/json")
      .send("{broken");
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toMatch(
      /at |\.ts:|node_modules|SyntaxError/,
    );
  });
});
