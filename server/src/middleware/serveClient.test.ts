import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("serving the built client", () => {
  let clientDist: string;

  beforeAll(() => {
    clientDist = mkdtempSync(path.join(tmpdir(), "client-dist-"));
    mkdirSync(path.join(clientDist, "assets"));
    writeFileSync(path.join(clientDist, "index.html"), "<h1>app</h1>");
    writeFileSync(path.join(clientDist, "assets", "main-abc.js"), "1");
  });
  afterAll(() => rmSync(clientDist, { recursive: true, force: true }));

  it("serves index.html at /", async () => {
    const res = await request(createApp({ clientDist })).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("<h1>app</h1>");
  });

  it("falls back to index.html for client-side routes", async () => {
    const res = await request(createApp({ clientDist })).get("/learn/html");
    expect(res.status).toBe(200);
    expect(res.text).toContain("<h1>app</h1>");
    expect(res.headers["cache-control"]).toBe("no-cache");
  });

  it("caches hashed assets for a long time", async () => {
    const res = await request(createApp({ clientDist })).get(
      "/assets/main-abc.js",
    );
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toContain("immutable");
  });

  it("still returns JSON 404 for unknown API routes", async () => {
    const res = await request(createApp({ clientDist })).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("does not serve the client when no build folder is configured", async () => {
    const res = await request(createApp({ clientDist: undefined })).get("/");
    expect(res.status).toBe(404);
  });
});
