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

  it("answers what happens next, in the order it happens", async () => {
    const route = (await request(app).get(url("route:POST /api/notes")))
      .body as SymbolResponse;
    // The request comes before the route; then middleware, then the controller.
    expect(
      route.usedBy.map((u) => `${u.direction} ${u.type} ${u.symbol.id}`),
    ).toEqual(["out receives http-request:POST /api/notes"]);
    expect(route.next.map((n) => `${n.type} ${n.symbol.id}`)).toEqual([
      "uses middleware:requireAuth",
      "uses middleware:express.json",
      "calls controller:notesController.createNote",
    ]);
    expect(route.uses.map((u) => u.type)).not.toContain("receives");
    // An event is fired by the browser when the Save button is clicked;
    // its handler comes next.
    const event = (await request(app).get(url("event:noteForm.submit")))
      .body as SymbolResponse;
    expect(
      event.usedBy.map((u) => `${u.direction} ${u.type} ${u.symbol.id}`),
    ).toEqual(["in sends component:Button"]);
    expect(event.next.map((n) => n.symbol.id)).toEqual(["fn:handleSave"]);
    // A handler is triggered by its event and goes on to the service call.
    const handler = (await request(app).get(url("fn:handleSave")))
      .body as SymbolResponse;
    expect(handler.usedBy.map((u) => u.symbol.id)).toEqual([
      "event:noteForm.submit",
    ]);
    expect(handler.next.map((n) => n.symbol.id)).toEqual([
      "fn:notesApi.createNote",
      "fn:useNotes.addNote",
    ]);
    // A request is sent by fetch and answered by the controller; the route is next.
    const req = (await request(app).get(url("http-request:POST /api/notes")))
      .body as SymbolResponse;
    expect(req.usedBy.map((u) => u.symbol.id)).toEqual([
      "external:fetch",
      "controller:notesController.createNote",
    ]);
    expect(req.next.map((n) => n.symbol.id)).toEqual(["route:POST /api/notes"]);
    // A dead end: nothing next, but it is used by its caller.
    const validate = (await request(app).get(url("fn:validateNote")))
      .body as SymbolResponse;
    expect(validate.next).toEqual([]);
    expect(validate.usedBy.map((u) => u.symbol.id)).toContain(
      "controller:notesController.createNote",
    );
    const button = (await request(app).get(url("component:Button")))
      .body as SymbolResponse;
    expect(button.usedBy).toHaveLength(5);
    expect(button.usedBy.every((u) => u.type === "renders")).toBe(true);
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
