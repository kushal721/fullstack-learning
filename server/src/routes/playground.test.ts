import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import {
  JS_RUNNER_POLICY,
  MAX_PLAYGROUND_CODE,
  PLAYGROUND_POLICY,
} from "./playground.js";

const app = createApp();

describe("GET /playground", () => {
  it("shows the code as a page, with styles allowed and scripts, forms and framing by others blocked", async () => {
    const res = await request(app).get(
      `/playground?code=${encodeURIComponent("<h1>Hi</h1><style>h1{color:red}</style>")}`,
    );
    expect(res.status).toBe(200);
    expect(res.type).toBe("text/html");
    expect(res.text).toContain(
      "<body><h1>Hi</h1><style>h1{color:red}</style></body>",
    );
    const policy = res.headers["content-security-policy"];
    expect(policy).toBe(PLAYGROUND_POLICY);
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain("form-action 'none'");
    expect(policy).toContain("frame-ancestors 'self'");
    expect(policy).toMatch(/(^|; )sandbox($|;)/);
    expect(policy).not.toContain("script-src");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("shows a whole document as it is", async () => {
    const doc = "<!doctype html><html><body><p>Mine</p></body></html>";
    const res = await request(app).get(
      `/playground?code=${encodeURIComponent(doc)}`,
    );
    expect(res.text).toBe(doc);
  });

  it("refuses code that is too long", async () => {
    const res = await request(app).get(
      `/playground?code=${"a".repeat(MAX_PLAYGROUND_CODE + 1)}`,
    );
    expect(res.status).toBe(400);
  });

  it("leaves the main site's strict policy alone", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["content-security-policy"]).toContain(
      "style-src 'self'",
    );
  });
});

describe("GET /playground/js", () => {
  it("runs code in a worker inside a script-only sandbox", async () => {
    const res = await request(app).get(
      `/playground/js?code=${encodeURIComponent("console.log(1 + 1)")}`,
    );
    expect(res.status).toBe(200);
    const policy = res.headers["content-security-policy"];
    expect(policy).toBe(JS_RUNNER_POLICY);
    expect(policy).toContain("sandbox allow-scripts");
    expect(policy).not.toContain("allow-same-origin");
    expect(policy).toContain("default-src 'none'");
    expect(policy).not.toContain("connect-src");
    expect(res.text).toContain("new Worker(");
    expect(res.text).toContain("console.log(1 + 1)");
  });

  it("keeps the learner's code inside the script, whatever it contains", async () => {
    const res = await request(app).get(
      `/playground/js?code=${encodeURIComponent("</script><img src=x onerror=alert(1)>")}`,
    );
    expect(res.text).not.toContain("</script><img");
    expect(res.text).toContain("\\u003c/script>");
  });

  it("refuses code that is too long", async () => {
    const res = await request(app).get(
      `/playground/js?code=${"a".repeat(MAX_PLAYGROUND_CODE + 1)}`,
    );
    expect(res.status).toBe(400);
  });
});
