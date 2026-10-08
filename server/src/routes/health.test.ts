import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("GET /api/health", () => {
  it("reports that the API is running", async () => {
    const res = await request(createApp()).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      version: expect.any(String),
    });
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe("unknown API routes", () => {
  it("return a JSON 404 error", async () => {
    const res = await request(createApp()).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "No API route for GET /api/does-not-exist",
      },
    });
  });
});
