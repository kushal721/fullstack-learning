import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { renderIndexHtml } from "./serveClient.js";

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

  it("answers addresses that match no page with 404, still with the app", async () => {
    const res = await request(createApp({ clientDist })).get("/no-such-page");
    expect(res.status).toBe(404);
    expect(res.text).toContain("<h1>app</h1>");
  });
});

describe("renderIndexHtml", () => {
  const template = `<head>
    <!-- page-meta: default -->
    <title data-server-meta>Full-Stack Learning</title>
    <!-- /page-meta -->
  </head><body></body>`;

  it("puts the page's own title, description and preview tags in", () => {
    const { html, status } = renderIndexHtml(
      template,
      "/concepts/react-usestate",
      "",
      "https://learn.example.com",
    );
    expect(status).toBe(200);
    expect(html).toContain(
      "<title data-server-meta>useState · Full-Stack Learning</title>",
    );
    expect(html).toMatch(
      /<meta data-server-meta name="description" content="[^"]+" \/>/,
    );
    expect(html).toContain(
      'property="og:url" content="https://learn.example.com/concepts/react-usestate"',
    );
    expect(html).toContain(
      'property="og:image" content="https://learn.example.com/og-image.png"',
    );
    expect(html).toContain(
      '<link data-server-meta rel="canonical" href="https://learn.example.com/concepts/react-usestate" />',
    );
    expect(html).not.toContain("page-meta");
    expect(html.match(/<title/g)).toHaveLength(1);
  });

  it("works on the real client index.html, so editing it can't break this", () => {
    const real = readFileSync(
      new URL("../../../client/index.html", import.meta.url),
      "utf8",
    );
    const { html } = renderIndexHtml(
      real,
      "/build/add-state",
      "",
      "https://x.test",
    );
    expect(html).toContain(
      "<title data-server-meta>6. Add state · Full-Stack Learning</title>",
    );
    expect(html.match(/<title/g)).toHaveLength(1);
    expect(html.match(/name="description"/g)).toHaveLength(1);
  });

  it("escapes the address and marks unknown pages noindex", () => {
    const { html, status } = renderIndexHtml(
      template,
      '/"><script>alert(1)</script>',
      "",
      "https://learn.example.com",
    );
    expect(status).toBe(404);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain(
      '<meta data-server-meta name="robots" content="noindex" />',
    );
    expect(html).not.toContain("canonical");
  });
});
