import type { ConceptListResponse, ConceptResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/concepts", () => {
  it("lists concept summaries grouped in learning-tree order", async () => {
    const res = await request(app).get("/api/concepts");
    const body = res.body as ConceptListResponse;

    expect(res.status).toBe(200);
    // html (topic 2) → react (topic 6) → http (topic 7)
    expect(body.concepts.map((c) => c.id)).toEqual([
      "html-button",
      "react-usestate",
      "http-post",
    ]);
    expect(body.concepts[0]).toEqual({
      id: "html-button",
      slug: "html-button",
      title: "HTML <button>",
      topicId: "html",
      summary: expect.any(String),
    });
  });

  it("filters by topic", async () => {
    const res = await request(app).get("/api/concepts?topic=react");

    expect(res.status).toBe(200);
    expect(res.body.concepts.map((c: { id: string }) => c.id)).toEqual([
      "react-usestate",
    ]);
  });

  it("returns an empty list for a topic without concepts", async () => {
    const res = await request(app).get("/api/concepts?topic=css");
    expect(res.status).toBe(200);
    expect(res.body.concepts).toEqual([]);
  });

  it("returns 404 for an unknown topic", async () => {
    const res = await request(app).get("/api/concepts?topic=cooking");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it.each(["?topic=React", "?topic=a&topic=b", "?topic="])(
    "returns 400 for the invalid filter %s",
    async (query) => {
      const res = await request(app).get(`/api/concepts${query}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    },
  );
});

describe("GET /api/concepts/:slug", () => {
  it("returns the full concept with its topic and related concepts", async () => {
    const res = await request(app).get("/api/concepts/html-button");
    const body = res.body as ConceptResponse;

    expect(res.status).toBe(200);
    expect(body.concept.title).toBe("HTML <button>");
    expect(body.concept.howToCreate.length).toBeGreaterThan(0);
    expect(body.topic).toEqual({
      id: "html",
      slug: "html",
      order: 2,
      title: "HTML",
      summary: expect.any(String),
    });
    // Listed by html-button itself, and linked back from react-usestate.
    expect(body.related.map((c) => c.id)).toEqual([
      "http-post",
      "react-usestate",
    ]);
    expect(body.related[0]).not.toHaveProperty("basics");
  });

  it("returns 404 for an unknown concept", async () => {
    const res = await request(app).get("/api/concepts/flux-capacitor");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: 'No concept named "flux-capacitor".',
      },
    });
  });

  it("returns 400 for a malformed slug", async () => {
    const res = await request(app).get("/api/concepts/Use_State");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/topics/:slug concepts", () => {
  it("lists the concepts of the topic", async () => {
    const res = await request(app).get("/api/topics/react");
    expect(res.body.concepts).toEqual([
      {
        id: "react-usestate",
        slug: "react-usestate",
        title: "useState",
        topicId: "react",
        summary: expect.any(String),
      },
    ]);
  });
});
