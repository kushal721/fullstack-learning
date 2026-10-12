import type { FlowListResponse, FlowResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/flows", () => {
  it("lists every flow without its steps", async () => {
    const res = await request(app).get("/api/flows");
    const body = res.body as FlowListResponse;
    expect(res.status).toBe(200);
    expect(body.flows.map((f) => f.id)).toEqual(["create-note", "list-notes"]);
    expect(body.flows[0]).toEqual({
      id: "create-note",
      title: "Create a note",
      summary: expect.any(String),
      group: "request",
      direction: "round-trip",
      stepCount: 25,
    });
    expect(body.flows[0]).not.toHaveProperty("steps");
  });

  it("filters by group", async () => {
    const request_ = await request(app).get("/api/flows?group=request");
    expect(request_.body.flows).toHaveLength(2);
    const security = await request(app).get("/api/flows?group=security");
    expect(security.status).toBe(200);
    expect(security.body.flows).toEqual([]);
  });

  it.each(["cooking", "REQUEST", ""])(
    "returns 400 for group=%s",
    async (group) => {
      const res = await request(app).get(`/api/flows?group=${group}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    },
  );
});

describe("GET /api/flows/:id", () => {
  it("returns the flow with every step's symbol resolved", async () => {
    const res = await request(app).get("/api/flows/create-note");
    const body = res.body as FlowResponse;
    expect(res.status).toBe(200);
    expect(body.flow.steps).toHaveLength(25);
    expect(body.flow.http).toMatchObject({
      method: "POST",
      path: "/api/notes",
      status: 201,
    });
    for (const step of body.flow.steps) {
      expect(body.symbols[step.symbolId], step.symbolId).toBeDefined();
    }
    expect(body.symbols["fn:handleSave"]).toMatchObject({
      fileId: "frontend/src/components/NoteForm.jsx",
      line: expect.any(Number),
    });
    expect(body.symbols["external:fetch"]).not.toHaveProperty("line");
  });

  it("returns 404 for an unknown flow", async () => {
    const res = await request(app).get("/api/flows/delete-everything");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: 'No flow "delete-everything".' },
    });
  });

  it("returns 400 for a malformed id", async () => {
    const res = await request(app).get("/api/flows/Create_Note");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
