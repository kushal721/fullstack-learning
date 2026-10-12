import type { CodeSymbol, Relationship, RelationshipType } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import {
  calledBy,
  calls,
  connectedFiles,
  definedIn,
  getSymbol,
  neighborhood,
} from "./project-graph.js";

// A small sample graph: a → b → c → d, plus e renders a.
const sym = (id: string, fileId?: string): CodeSymbol => ({
  id,
  kind: "function",
  name: id,
  fileId,
  summary: `${id}.`,
  conceptIds: [],
});
const rel = (
  source: string,
  type: RelationshipType,
  target: string,
): Relationship => ({
  id: `${source}->${type}->${target}`,
  source,
  target,
  type,
  explanation: "x",
});
const sample = {
  symbols: [
    sym("fn:a", "frontend/src/App.jsx"),
    sym("fn:b", "frontend/src/main.jsx"),
    sym("fn:c", "frontend/src/main.jsx"),
    sym("fn:d"),
    sym("fn:e", "frontend/index.html"),
  ],
  relationships: [
    rel("fn:a", "calls", "fn:b"),
    rel("fn:b", "calls", "fn:c"),
    rel("fn:c", "calls", "fn:d"),
    rel("fn:e", "renders", "fn:a"),
  ],
};
const ids = (list: { id: string }[]) => list.map((item) => item.id);

describe("project graph", () => {
  it("finds symbols and who calls whom", () => {
    expect(getSymbol("fn:b", sample)?.name).toBe("fn:b");
    expect(getSymbol("fn:nope", sample)).toBeUndefined();
    expect(ids(calls("fn:b", sample))).toEqual(["fn:c"]);
    expect(ids(calledBy("fn:b", sample))).toEqual(["fn:a"]);
    // `renders` is a relationship, not a call.
    expect(ids(calledBy("fn:a", sample))).toEqual([]);
  });

  it("lists the symbol's own file first, then its neighbours' files, once each", () => {
    expect(ids(connectedFiles("fn:a", sample))).toEqual([
      "frontend/src/App.jsx",
      "frontend/src/main.jsx",
      "frontend/index.html",
    ]);
    // d has no file of its own, but its caller does.
    expect(ids(connectedFiles("fn:d", sample))).toEqual([
      "frontend/src/main.jsx",
    ]);
  });

  it("collects the neighbourhood in both directions up to a depth", () => {
    const one = neighborhood("fn:b", 1, sample);
    expect(ids(one.symbols)).toEqual(["fn:b", "fn:a", "fn:c"]);
    expect(ids(one.relationships)).toEqual([
      "fn:a->calls->fn:b",
      "fn:b->calls->fn:c",
    ]);

    const two = neighborhood("fn:b", 2, sample);
    expect(ids(two.symbols).sort()).toEqual([
      "fn:a",
      "fn:b",
      "fn:c",
      "fn:d",
      "fn:e",
    ]);
    expect(two.relationships).toHaveLength(4);

    expect(neighborhood("fn:b", 0, sample)).toEqual({
      symbols: [sample.symbols[1]],
      relationships: [],
    });
    expect(neighborhood("fn:nope", 2, sample)).toEqual({
      symbols: [],
      relationships: [],
    });
  });

  it("follows the real create-note chain from the form to the table", () => {
    expect(ids(calls("fn:handleSave"))).toEqual(["fn:notesApi.createNote"]);
    expect(ids(calls("controller:notesController.createNote"))).toEqual([
      "fn:validateNote",
      "query:insertNote",
    ]);
    expect(ids(calledBy("controller:notesController.createNote"))).toEqual([
      "route:POST /api/notes",
    ]);
    const far = neighborhood("event:noteForm.submit", 20);
    expect(ids(far.symbols)).toContain("table:notes");
  });

  it("resolves where a symbol is defined from its match text", () => {
    const where = definedIn("fn:handleSave");
    expect(where?.file.id).toBe("frontend/src/components/NoteForm.jsx");
    expect(where?.line).toBeGreaterThan(0);
    // An external symbol lives outside the project.
    expect(definedIn("external:fetch")).toBeUndefined();
  });
});
