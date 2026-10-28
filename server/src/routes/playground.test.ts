import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import {
  JS_RUNNER_POLICY,
  MAX_PLAYGROUND_CODE,
  PAGE_RUNNER_POLICY,
  PLAYGROUND_POLICY,
  testCalls,
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

  it("runs a your-turn exercise's tests after the code and reports the count to the step", async () => {
    const tests = [{ call: "double(2)", expect: "4" }];
    const res = await request(app).get(
      `/playground/js?code=${encodeURIComponent("const double = (n) => n * 2;")}&tests=${encodeURIComponent(JSON.stringify(tests))}`,
    );
    expect(res.status).toBe(200);
    expect(res.text).toContain(
      JSON.stringify(testCalls(tests)).slice(1, -1).replace(/</g, "\\u003c"),
    );
    expect(res.text).toContain("const total = 1;");
    expect(res.text).toContain('parent.postMessage({ source: "fsl-runner"');
  });

  it("refuses tests that aren't a list of calls and expected values", async () => {
    for (const tests of ["nope", '[{"call":1}]', '{"call":"a","expect":"b"}']) {
      const res = await request(app).get(
        `/playground/js?code=1&tests=${encodeURIComponent(tests)}`,
      );
      expect(res.status, tests).toBe(400);
    }
  });
});

describe("GET /playground/page", () => {
  const checks = [{ kind: "exists", label: "A list", selector: "ul" }];
  const get = (code: string, rawChecks?: string) =>
    request(app).get(
      `/playground/page?code=${encodeURIComponent(code)}${
        rawChecks === undefined
          ? ""
          : `&checks=${encodeURIComponent(rawChecks)}`
      }`,
    );

  it("runs the learner's page with its scripts, as a powerless origin that can't send forms", async () => {
    const res = await get("<ul></ul><script>console.log(1)</script>");
    expect(res.status).toBe(200);
    expect(res.type).toBe("text/html");
    const policy = res.headers["content-security-policy"];
    expect(policy).toBe(PAGE_RUNNER_POLICY);
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain("script-src 'unsafe-inline'");
    expect(policy).toContain("form-action 'none'");
    expect(policy).toContain("frame-ancestors 'self'");
    expect(policy).toContain("sandbox allow-scripts allow-forms");
    expect(policy).not.toContain("allow-same-origin");
    expect(policy).not.toContain("connect-src");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.text).toContain("<ul></ul><script>console.log(1)</script>");
  });

  it("puts the harness before the learner's code, in a fragment or a whole document", async () => {
    const fragment = (await get("<p>Hi</p>")).text;
    expect(fragment.indexOf("fsl-page")).toBeGreaterThan(0);
    expect(fragment.indexOf("fsl-page")).toBeLessThan(
      fragment.indexOf("<p>Hi</p>"),
    );

    const doc =
      "<!doctype html><html><head><title>Mine</title></head><body><script>x()</script></body></html>";
    const whole = (await get(doc)).text;
    expect(whole.startsWith("<!doctype html><html><head><script>")).toBe(true);
    expect(whole.indexOf("fsl-page")).toBeLessThan(whole.indexOf("<title>"));
  });

  it("runs an exercise's checks after load, and keeps them inside the script", async () => {
    const tricky = [
      { kind: "text", label: "</script><b>", selector: "p", text: "x" },
    ];
    const res = await get("<p>x</p>", JSON.stringify(tricky));
    expect(res.status).toBe(200);
    expect(res.text).toContain("\\u003c/script>\\u003cb>");
    expect(res.text).not.toContain("</script><b>");
    expect(res.text).toContain('addEventListener("load"');
    expect((await get("<ul></ul>", JSON.stringify(checks))).status).toBe(200);
  });

  it("refuses checks that aren't a list of known page checks, and code that is too long", async () => {
    for (const bad of [
      "nope",
      "{}",
      JSON.stringify([{ kind: "exists", selector: "ul" }]),
      JSON.stringify([{ kind: "eval", label: "x", selector: "ul" }]),
      JSON.stringify([{ kind: "count", label: "x", selector: "ul" }]),
    ]) {
      expect((await get("<ul></ul>", bad)).status, bad).toBe(400);
    }
    expect((await get("x".repeat(MAX_PLAYGROUND_CODE + 1))).status).toBe(400);
  });
});
