import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("API caching", () => {
  it("lets content be kept but re-checked, answering 304 when unchanged", async () => {
    const first = await request(app).get("/api/topics");
    expect(first.status).toBe(200);
    expect(first.headers["cache-control"]).toBe("no-cache");
    const etag = String(first.headers.etag);
    expect(etag).toMatch(/^W\/".+"$/);

    const again = await request(app)
      .get("/api/topics")
      .set("If-None-Match", etag);
    expect(again.status).toBe(304);
    expect(again.text).toBe("");
  });

  it("never stores health checks or answers to POSTs", async () => {
    const health = await request(app).get("/api/health");
    expect(health.headers["cache-control"]).toBe("no-store");
    const check = await request(app)
      .post("/api/exercises/predict-blank-title/check")
      .send({ answer: { choiceId: "server-400" } });
    expect(check.headers["cache-control"]).toBe("no-store");
  });
});

describe("compression", () => {
  it("compresses larger answers for clients that accept it", async () => {
    const gzip = await request(app)
      .get("/api/topics")
      .set("Accept-Encoding", "gzip");
    expect(gzip.headers["content-encoding"]).toBe("gzip");
    expect(gzip.headers.vary).toMatch(/Accept-Encoding/);

    const br = await request(app)
      .get("/api/topics")
      .set("Accept-Encoding", "br");
    expect(br.headers["content-encoding"]).toBe("br");
  });

  it("sends small answers and clients without compression as they are", async () => {
    const small = await request(app)
      .get("/api/health")
      .set("Accept-Encoding", "gzip");
    expect(small.headers["content-encoding"]).toBeUndefined();
    const plain = await request(app)
      .get("/api/topics")
      .set("Accept-Encoding", "identity");
    expect(plain.headers["content-encoding"]).toBeUndefined();
    expect(plain.body.tree).toBeDefined();
  });
});
