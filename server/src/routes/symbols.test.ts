import type {
  FileSymbolsResponse,
  SymbolGraphResponse,
  SymbolResponse,
} from "@fsl/shared";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();
const url = (id: string, rest = "") =>
  `/api/symbols/${encodeURIComponent(id)}${rest}`;

describe("GET /api/symbols/:id", () => {
  it("returns the symbol with where it is defined, its calls and files", async () => {
    const res = await request(app).get(url("fn:handleSave"));
    const body = res.body as SymbolResponse;

    expect(res.status).toBe(200);
    expect(body.symbol).toMatchObject({
      id: "fn:handleSave",
      kind: "function",
    });
    expect(body.symbol.line).toBeGreaterThan(0);
    expect(body.definedIn).toEqual({
      id: "frontend/src/components/NoteForm.jsx",
      path: "frontend/src/components/NoteForm.jsx",
      layer: "frontend",
      purpose: expect.any(String),
      line: body.symbol.line,
    });
    expect(body.calls.map((c) => c.symbol.id)).toEqual([
      "fn:notesApi.createNote",
      "fn:useNotes.addNote",
    ]);
    expect(body.calls[0]).toMatchObject({
      type: "calls",
      explanation: expect.any(String),
      symbol: { kind: "function", line: expect.any(Number) },
    });
    expect(body.files[0]!.id).toBe("frontend/src/components/NoteForm.jsx");
  });

  it("accepts ids with spaces and slashes when URL-encoded", async () => {
    const res = await request(app).get(url("route:POST /api/notes"));
    const body = res.body as SymbolResponse;
    expect(res.status).toBe(200);
    expect(body.calls.map((c) => c.symbol.id)).toEqual([
      "controller:notesController.createNote",
    ]);
  });

  it("has no definedIn for symbols outside the project", async () => {
    const res = await request(app).get(url("external:fetch"));
    const body = res.body as SymbolResponse;
    expect(res.status).toBe(200);
    expect(body).not.toHaveProperty("definedIn");
    expect(body.calledBy.map((c) => c.symbol.id)).toEqual(["fn:request"]);
  });

  it("returns 404 for an unknown symbol", async () => {
    const res = await request(app).get(url("fn:nope"));
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: 'No symbol "fn:nope".' },
    });
  });
});

describe("GET /api/symbols/:id/graph", () => {
  it("returns the neighbourhood at depth 1 by default", async () => {
    const res = await request(app).get(url("fn:notesApi.createNote", "/graph"));
    const body = res.body as SymbolGraphResponse;

    expect(res.status).toBe(200);
    expect(body.nodes.map((n) => n.id)).toEqual([
      "fn:notesApi.createNote",
      "fn:handleSave",
      "fn:request",
    ]);
    expect(body.nodes.every((n) => !n.fileId || n.line! > 0)).toBe(true);
    expect(body.edges.map((e) => e.id)).toEqual([
      "fn:handleSave->calls->fn:notesApi.createNote",
      "fn:notesApi.createNote->calls->fn:request",
    ]);
  });

  it("grows with depth", async () => {
    const one = await request(app).get(url("fn:request", "/graph?depth=1"));
    const three = await request(app).get(url("fn:request", "/graph?depth=3"));
    expect(three.body.nodes.length).toBeGreaterThan(one.body.nodes.length);
  });

  it.each(["0", "4", "two", "1.5"])(
    "returns 400 for depth=%s",
    async (depth) => {
      const res = await request(app).get(
        url("fn:request", `/graph?depth=${depth}`),
      );
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    },
  );

  it("returns 404 for an unknown symbol", async () => {
    const res = await request(app).get(url("fn:nope", "/graph"));
    expect(res.status).toBe(404);
  });
});

describe("GET /api/files/<path>/symbols", () => {
  it("lists the symbols defined in the file by line, what they connect to and imports", async () => {
    const res = await request(app).get(
      "/api/files/frontend/src/components/NoteForm.jsx/symbols",
    );
    const body = res.body as FileSymbolsResponse;

    expect(res.status).toBe(200);
    expect(body.file.id).toBe("frontend/src/components/NoteForm.jsx");
    const lines = body.defined.map((s) => s.line!);
    expect(lines).toEqual([...lines].sort((a, b) => a - b));
    expect(body.defined.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        "component:NoteForm",
        "fn:handleSave",
        "event:noteForm.submit",
      ]),
    );
    expect(body.referenced.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        "fn:notesApi.createNote",
        "component:Button",
        "component:Input",
      ]),
    );
    expect(body.referenced.some((s) => s.fileId === body.file.id)).toBe(false);
    expect(body.imports.map((f) => f.id)).toEqual([
      "frontend/src/services/notesApi.js",
      "frontend/src/components/Button.jsx",
      "frontend/src/components/Input.jsx",
    ]);
    expect(body.importedBy.map((f) => f.id).sort()).toEqual([
      "frontend/src/components/NoteForm.test.jsx",
      "frontend/src/pages/Dashboard.jsx",
    ]);
  });

  it("works for files without symbols", async () => {
    const res = await request(app).get(
      "/api/files/frontend/index.html/symbols",
    );
    expect(res.status).toBe(200);
    expect(res.body.defined).toEqual([]);
  });

  it("returns 404 for an unknown file and 400 for a path that climbs out", async () => {
    expect(
      (await request(app).get("/api/files/frontend/nope.js/symbols")).status,
    ).toBe(404);
    const bad = await request(app).get("/api/files/frontend/%2E%2E/symbols");
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("still serves the file itself without /symbols", async () => {
    const res = await request(app).get(
      "/api/files/frontend/src/components/NoteForm.jsx",
    );
    expect(res.status).toBe(200);
    expect(res.body.source).toContain("handleSave");
  });
});
