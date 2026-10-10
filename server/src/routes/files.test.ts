import type { FileResponse, FileTreeResponse } from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/files", () => {
  it("returns the example project as nested folders", async () => {
    const res = await request(app).get("/api/files");
    const { tree } = res.body as FileTreeResponse;

    expect(res.status).toBe(200);
    expect(tree.children.map((c) => c.name)).toEqual([
      "backend",
      "database",
      "frontend",
    ]);
    const database = tree.children[1];
    expect(database).toMatchObject({
      type: "folder",
      path: "database",
      children: [
        { type: "file", name: "schema.sql", path: "database/schema.sql" },
        { type: "file", name: "seed.sql", path: "database/seed.sql" },
      ],
    });
    // The tree only has summaries; source code comes from the file endpoint.
    expect(JSON.stringify(tree)).not.toContain("whyItExists");
  });
});

describe("GET /api/files/<path>", () => {
  it("returns the file, its source and its concepts", async () => {
    const res = await request(app).get(
      "/api/files/frontend/src/services/notesApi.js",
    );
    const body = res.body as FileResponse;

    expect(res.status).toBe(200);
    expect(body.file).toMatchObject({
      id: "frontend/src/services/notesApi.js",
      layer: "frontend",
      language: "js",
    });
    expect(body.source).toContain("export function createNote");
    expect(body.concepts.map((c) => c.id)).toContain("js-fetch");
    expect(body.concepts[0]).not.toHaveProperty("basics");
  });

  it("also accepts the path URL-encoded as one segment", async () => {
    const res = await request(app).get("/api/files/backend%2Fsrc%2Fdb.js");
    expect(res.status).toBe(200);
    expect(res.body.file.id).toBe("backend/src/db.js");
  });

  it("returns 404 for a file that is not in the example project", async () => {
    const res = await request(app).get("/api/files/frontend/src/Secret.jsx");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("never serves files outside the list, such as .env", async () => {
    const res = await request(app).get("/api/files/backend/.env");
    expect(res.status).toBe(404);
  });

  it.each([
    "/api/files/..%2F..%2Fpackage.json",
    "/api/files/frontend/..%2F..%2F..%2Fpackage.json",
    "/api/files/frontend%2F.%2Findex.html",
    "/api/files/frontend%5Cindex.html",
  ])("rejects path tricks with 400: %s", async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("serves the same source from memory on repeated requests", async () => {
    const first = await request(app).get("/api/files/database/schema.sql");
    const second = await request(app).get("/api/files/database/schema.sql");
    expect(second.body.source).toBe(first.body.source);
  });
});
