import type { TopicResponse, TopicTreeResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/topics", () => {
  it("returns the learning tree without overview text", async () => {
    const res = await request(app).get("/api/topics");
    const body = res.body as TopicTreeResponse;

    expect(res.status).toBe(200);
    expect(body.tree.title).toBe("Full-Stack Development");
    expect(body.tree.children).toHaveLength(14);
    expect(body.tree.children[0]).toEqual({
      id: "how-the-web-works",
      slug: "how-the-web-works",
      order: 1,
      title: "How the Web Works",
      summary: expect.any(String),
      children: [],
    });
    expect(JSON.stringify(body)).not.toContain('"overview"');
  });
});

describe("GET /api/topics/:slug", () => {
  it("returns the topic with previous and next topics", async () => {
    const res = await request(app).get("/api/topics/html");
    const body = res.body as TopicResponse;

    expect(res.status).toBe(200);
    expect(body.topic).toMatchObject({ id: "html", title: "HTML" });
    expect(body.previous).toMatchObject({ slug: "how-the-web-works" });
    expect(body.next).toMatchObject({ slug: "css" });
    expect(body.concepts).toEqual([]);
    expect(body.buildSteps).toEqual([]);
  });

  it("has no previous topic for the first topic", async () => {
    const res = await request(app).get("/api/topics/how-the-web-works");
    expect(res.status).toBe(200);
    expect(res.body.previous).toBeUndefined();
    expect(res.body.next).toMatchObject({ slug: "html" });
  });

  it("returns 404 for an unknown topic", async () => {
    const res = await request(app).get("/api/topics/cooking");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: 'No topic named "cooking".' },
    });
  });

  it.each(["HTML", "html_css", "%2E%2E"])(
    "returns 400 for the invalid slug %s",
    async (slug) => {
      const res = await request(app).get(`/api/topics/${slug}`);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    },
  );
});
