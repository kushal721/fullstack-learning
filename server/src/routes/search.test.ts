import type { SearchResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/search", () => {
  it("returns grouped results for a query", async () => {
    const res = await request(app).get("/api/search?q=useState");
    const body = res.body as SearchResponse;
    expect(res.status).toBe(200);
    expect(body.query).toBe("useState");
    expect(body.groups[0]).toMatchObject({
      type: "concept",
      label: "Concepts",
    });
    expect(body.groups[0]!.results[0]).toMatchObject({
      id: "react-usestate",
      href: "/concepts/react-usestate",
    });
  });

  it("trims the query and finds multi-word matches", async () => {
    const res = await request(app).get(
      `/api/search?q=${encodeURIComponent("  password hashing ")}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.query).toBe("password hashing");
    expect(res.body.groups[0].results[0].id).toBe("password-hashing");
  });

  it("answers an empty list of groups when nothing matches", async () => {
    const res = await request(app).get("/api/search?q=xylophone");
    expect(res.status).toBe(200);
    expect(res.body.groups).toEqual([]);
  });

  it.each(["", "q=", "q=a", "q=%20%20a%20", "q=a&q=b"])(
    "returns 400 for a missing or too short query: ?%s",
    async (query) => {
      const res = await request(app).get(`/api/search?${query}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toEqual({
        code: "VALIDATION_ERROR",
        message:
          "q must be at least 2 characters, e.g. /api/search?q=useState.",
      });
    },
  );

  it("returns 400 for a query that is too long", async () => {
    const res = await request(app).get(`/api/search?q=${"a".repeat(101)}`);
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("q must be at most 100 characters.");
  });

  it("returns the API's 404 for an unknown path under /api/search", async () => {
    const res = await request(app).get("/api/search/useState");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
