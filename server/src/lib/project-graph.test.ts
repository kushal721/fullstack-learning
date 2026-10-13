import type { CodeSymbol, Relationship, RelationshipType } from "@fsl/shared";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { config } from "../config.js";
import { relationships } from "../content/relationships.js";
import { symbols } from "../content/symbols.js";
import {
  calledBy,
  calls,
  connectedFiles,
  definedIn,
  fileDependencies,
  fileDependents,
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
    expect(ids(calls("fn:handleSave"))).toContain("fn:notesApi.createNote");
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

  describe("the Notes App's request chains", () => {
    // Follow the data: an event leads to its handler, a request to the route
    // that receives it; everything else in the direction it points.
    function reachable(from: string): Set<string> {
      const next = (id: string) =>
        relationships.flatMap((r) => {
          if (r.type === "handles" || r.type === "receives") {
            return r.target === id ? [r.source] : [];
          }
          if (r.type === "returns" || r.type === "imports") return [];
          return r.source === id ? [r.target] : [];
        });
      const seen = new Set([from]);
      const queue = [from];
      while (queue.length) {
        for (const id of next(queue.shift()!)) {
          if (!seen.has(id)) {
            seen.add(id);
            queue.push(id);
          }
        }
      }
      return seen;
    }

    it.each([
      ["event:noteForm.submit", "table:notes"],
      ["event:noteCard.submit", "table:notes"],
      ["event:noteCard.deleteClick", "table:notes"],
      ["event:login.submit", "table:users"],
      ["event:register.submit", "table:users"],
      ["event:navbar.logoutClick", "controller:authController.logout"],
    ])("traces %s to %s", (event, end) => {
      expect(reachable(event)).toContain(end);
    });

    it("sends every request with fetch, to one route, answered by one controller", () => {
      const requests = symbols.filter((s) => s.kind === "http-request");
      expect(requests.length).toBeGreaterThanOrEqual(8);
      for (const request of requests) {
        const into = (type: string) =>
          relationships.filter(
            (r) => r.type === type && r.target === request.id,
          );
        expect(
          into("sends").map((r) => r.source),
          request.id,
        ).toEqual(["external:fetch"]);
        expect(into("receives"), request.id).toHaveLength(1);
        expect(into("returns"), request.id).toHaveLength(1);
        const route = into("receives")[0]!.source;
        expect(
          calls(route).map((s) => s.kind),
          route,
        ).toEqual(["controller"]);
      }
    });
  });

  describe("components and hooks", () => {
    const into = (target: string, type: string) =>
      relationships
        .filter((r) => r.target === target && r.type === type)
        .map((r) => r.source)
        .sort();

    it("shows Button and Input reused across the app", () => {
      expect(into("component:Button", "renders")).toEqual([
        "component:Login",
        "component:Navbar",
        "component:NoteCard",
        "component:NoteForm",
        "component:Register",
      ]);
      expect(into("component:Input", "renders")).toEqual([
        "component:Login",
        "component:NoteCard",
        "component:NoteForm",
        "component:Register",
      ]);
      // The same answer through the graph helper (plus the note form's
      // submit event, which the Save button fires), with Button's file first.
      const around = neighborhood("component:Button", 1);
      expect(ids(around.symbols)).toHaveLength(7);
      expect(ids(around.symbols)).toContain("event:noteForm.submit");
      expect(ids(connectedFiles("component:Button"))[0]).toBe(
        "frontend/src/components/Button.jsx",
      );
    });

    it("renders every component from App down", () => {
      const rendered = new Set(
        relationships.filter((r) => r.type === "renders").map((r) => r.target),
      );
      const components = symbols
        .filter((s) => s.kind === "component")
        .map((s) => s.id);
      expect(components.filter((id) => !rendered.has(id))).toEqual([
        "component:App",
      ]);
    });

    it("connects the saved note back to the screen", () => {
      // handleSave → addNote, which useNotes returns and the Dashboard uses.
      expect(ids(calls("fn:handleSave"))).toEqual([
        "fn:notesApi.createNote",
        "fn:useNotes.addNote",
      ]);
      expect(
        relationships.some(
          (r) =>
            r.source === "hook:useNotes" &&
            r.type === "returns" &&
            r.target === "fn:useNotes.addNote",
        ),
      ).toBe(true);
      expect(into("hook:useNotes", "uses")).toEqual(["component:Dashboard"]);
    });
  });

  describe("file imports", () => {
    // Read every import statement from the real source, so the data can't
    // drift from the code.
    function importsInSource(): string[] {
      const root = config.exampleProjectDir;
      const found: string[] = [];
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.name === "node_modules") continue;
          if (entry.isDirectory()) walk(full);
          else if (/\.jsx?$/.test(entry.name)) {
            const id = path.relative(root, full).split(path.sep).join("/");
            const source = readFileSync(full, "utf8");
            const specifiers = [
              ...source.matchAll(
                /^import\s+(?:[^"']*?\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/gm,
              ),
              ...source.matchAll(/await import\(["'](\.{1,2}\/[^"']+)["']\)/g),
            ].map((m) => m[1]!);
            for (const specifier of specifiers) {
              found.push(
                `${id} -> ${path.posix.normalize(path.posix.join(path.posix.dirname(id), specifier))}`,
              );
            }
          }
        }
      };
      walk(root);
      return found.sort();
    }

    it("has one imports relationship per local import in the source", () => {
      const inData = relationships
        .filter((r) => r.type === "imports")
        .map((r) => `${r.source} -> ${r.target}`)
        .sort();
      expect(inData).toEqual(importsInSource());
      expect(inData.length).toBeGreaterThan(30);
    });

    it("lists a file's dependencies and dependents", () => {
      expect(ids(fileDependencies("frontend/src/pages/Login.jsx"))).toEqual([
        "frontend/src/components/Button.jsx",
        "frontend/src/components/Input.jsx",
        "frontend/src/services/authApi.js",
      ]);
      expect(
        ids(fileDependents("frontend/src/services/request.js")).sort(),
      ).toEqual([
        "frontend/src/services/authApi.js",
        "frontend/src/services/notesApi.js",
      ]);
      expect(ids(fileDependents("backend/src/db.js")).sort()).toEqual([
        "backend/src/controllers/authController.js",
        "backend/src/controllers/notesController.js",
        "backend/src/routes/notes.test.js",
      ]);
      expect(fileDependencies("frontend/src/components/Button.jsx")).toEqual(
        [],
      );
      expect(fileDependents("frontend/src/main.jsx")).toEqual([]);
    });
  });
});
