import type { DiffResponse, SnapshotResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/project/snapshots/:order", () => {
  it("returns an empty notes-app folder at step 0", async () => {
    const res = await request(app).get("/api/project/snapshots/0");
    const body = res.body as SnapshotResponse;

    expect(res.status).toBe(200);
    expect(body).toEqual({
      order: 0,
      tree: { type: "folder", name: "notes-app", path: "", children: [] },
    });
  });

  it("returns the whole project after the last step", async () => {
    const res = await request(app).get("/api/project/snapshots/14");
    const body = res.body as SnapshotResponse;

    expect(res.status).toBe(200);
    expect(body.tree.children.map((child) => child.name)).toEqual([
      "backend",
      "database",
      "frontend",
    ]);
  });

  it("returns 404 for a step after the last one", async () => {
    const res = await request(app).get("/api/project/snapshots/15");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it.each(["-1", "two", "1.5"])("returns 400 for %s", async (order) => {
    const res = await request(app).get(`/api/project/snapshots/${order}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/project/diff", () => {
  it("returns the files changed between two steps", async () => {
    const res = await request(app).get("/api/project/diff?from=5&to=6");
    const body = res.body as DiffResponse;

    expect(res.status).toBe(200);
    expect(body).toEqual({
      added: [
        "frontend/src/components/Input.jsx",
        "frontend/src/components/NoteForm.jsx",
        "frontend/src/hooks/useNotes.js",
      ],
      removed: [],
      modified: ["frontend/src/index.css", "frontend/src/pages/Dashboard.jsx"],
    });
  });

  it.each([
    ["missing params", ""],
    ["missing to", "?from=1"],
    ["not a number", "?from=a&to=2"],
    ["from after to", "?from=6&to=5"],
    ["to after the last step", "?from=0&to=15"],
  ])("returns 400 for %s", async (_name, query) => {
    const res = await request(app).get(`/api/project/diff${query}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
