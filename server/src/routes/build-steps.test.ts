import type { BuildStepListResponse, BuildStepResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/build-steps", () => {
  it("returns the 14 steps in order, without lessons", async () => {
    const res = await request(app).get("/api/build-steps");
    const body = res.body as BuildStepListResponse;

    expect(res.status).toBe(200);
    expect(body.buildSteps).toHaveLength(14);
    expect(body.buildSteps.map((step) => step.order)).toEqual(
      Array.from({ length: 14 }, (_, index) => index + 1),
    );
    expect(body.buildSteps[0]).toEqual({
      id: "understand-the-application",
      slug: "understand-the-application",
      order: 1,
      title: "Understand the application",
      goal: expect.any(String),
    });
  });
});

describe("GET /api/build-steps/:slug", () => {
  it("returns the step with concepts, neighbours and its diff", async () => {
    const res = await request(app).get("/api/build-steps/add-state");
    const body = res.body as BuildStepResponse;

    expect(res.status).toBe(200);
    expect(body.step).toMatchObject({ id: "add-state", order: 6 });
    expect(body.concepts.map((c) => c.id)).toEqual(body.step.conceptIds);
    expect(body.previous).toMatchObject({ slug: "create-page" });
    expect(body.next).toMatchObject({ slug: "add-api-communication" });
    expect(body.diff).toEqual({
      added: [
        "frontend/src/components/Input.jsx",
        "frontend/src/components/NoteForm.jsx",
        "frontend/src/hooks/useNotes.js",
      ],
      removed: [],
      modified: ["frontend/src/pages/Dashboard.jsx"],
    });
  });

  it("has no previous step for the first and no next for the last", async () => {
    const first = await request(app).get(
      "/api/build-steps/understand-the-application",
    );
    expect(first.body.previous).toBeUndefined();
    expect(first.body.diff).toEqual({ added: [], removed: [], modified: [] });

    const last = await request(app).get("/api/build-steps/deploy");
    expect(last.body.next).toBeUndefined();
  });

  it("returns 404 for an unknown step", async () => {
    const res = await request(app).get("/api/build-steps/cooking");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: 'No build step named "cooking".' },
    });
  });

  it("returns 400 for a slug that is not URL-safe", async () => {
    const res = await request(app).get("/api/build-steps/Add_State");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
