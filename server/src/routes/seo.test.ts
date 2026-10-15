import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /sitemap.xml", () => {
  it("lists absolute URLs for the content pages", async () => {
    const res = await request(app)
      .get("/sitemap.xml")
      .set("Host", "learn.example.com");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/xml/);
    expect(res.text).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(res.text).toContain("<loc>http://learn.example.com/</loc>");
    expect(res.text).toContain(
      "<loc>http://learn.example.com/concepts/react-usestate</loc>",
    );
    expect(res.text).toContain(
      "<loc>http://learn.example.com/build/add-state</loc>",
    );
    // The & in a query string is escaped in XML.
    expect(res.text).not.toMatch(/&(?!amp;)/);
  });
});

describe("GET /robots.txt", () => {
  it("allows crawling, keeps the API out and points at the sitemap", async () => {
    const res = await request(app)
      .get("/robots.txt")
      .set("Host", "learn.example.com");
    expect(res.status).toBe(200);
    expect(res.text).toBe(
      "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: http://learn.example.com/sitemap.xml\n",
    );
  });
});
