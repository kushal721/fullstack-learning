import { describe, expect, it } from "vitest";
import {
  buildSearchIndex,
  score,
  search,
  SEARCH_GROUPS,
  type SearchEntry,
  words,
} from "./search.js";

const titlesOf = (query: string, type: string) =>
  search(query)
    .groups.find((g) => g.type === type)
    ?.results.map((r) => r.title) ?? [];

describe("words", () => {
  it("lowercases and keeps camelCase and dotted names whole as well as split", () => {
    expect(words("Call notesApi.createNote with `useState`!")).toEqual([
      "call",
      "notesapi.createnote",
      "notesapi",
      "createnote",
      "with",
      "usestate",
    ]);
    expect(words("  ")).toEqual([]);
  });
});

describe("score", () => {
  const entry = (title: string, text: string): SearchEntry => ({
    type: "concept",
    id: "x",
    title,
    text,
    href: "/",
    titleWords: words(title),
    textWords: words(text),
  });

  it("ranks whole title words over prefixes over text, and needs every word", () => {
    const e = entry("Password hashing", "bcrypt makes a slow salted hash");
    const exact = score(e, "hashing");
    const prefix = score(e, "hash");
    const inText = score(e, "bcrypt");
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(inText);
    expect(inText).toBeGreaterThan(0);
    expect(score(e, "password bcrypt")).toBeGreaterThan(score(e, "bcrypt"));
    expect(score(e, "password docker")).toBe(0);
    expect(score(e, "zzz")).toBe(0);
  });
});

describe("search", () => {
  it("answers the spec §20 example: useState", () => {
    const result = search("useState");
    expect(result.groups.map((g) => g.label)).toEqual([
      "Concepts",
      "Files",
      "Functions",
      "Build steps",
      "Connections",
    ]);
    // The concept first, the files that use it, the step that adds state.
    expect(titlesOf("useState", "concept")[0]).toBe("useState");
    expect(titlesOf("useState", "file")).toContain(
      "frontend/src/components/NoteForm.jsx",
    );
    expect(titlesOf("useState", "build-step")).toEqual(["Step 6: Add state"]);
    expect(titlesOf("useState", "connection")).toContain(
      "NoteForm → uses → useState",
    );
    const concept = result.groups[0]!.results[0]!;
    expect(concept).toMatchObject({
      type: "concept",
      id: "react-usestate",
      href: "/concepts/react-usestate",
    });
    expect(concept.text.length).toBeLessThanOrEqual(160);
    expect(concept.text).not.toContain("`");
  });

  it("finds both createNote functions and tells them apart", () => {
    const functions = search("createNote").groups.find(
      (g) => g.type === "function",
    )!.results;
    expect(functions.map((f) => f.id).sort()).toEqual([
      "controller:notesController.createNote",
      "fn:notesApi.createNote",
    ]);
    expect(functions.map((f) => f.text.split(":")[0]).sort()).toEqual([
      "controller in notesController.js",
      "function in notesApi.js",
    ]);
    expect(functions.find((f) => f.id.startsWith("fn:"))!.href).toMatch(
      /^\/explorer\?symbol=fn%3AnotesApi\.createNote&file=frontend%2Fsrc%2Fservices%2FnotesApi\.js&line=\d+$/,
    );
    expect(titlesOf("createNote", "flow")).toEqual(["Create a note"]);
  });

  it("keeps groups in spec order, at most 10 each, with the real total", () => {
    const result = search("notes");
    const order = SEARCH_GROUPS.map((g) => g.type);
    const types = result.groups.map((g) => g.type);
    expect(types).toEqual(order.filter((t) => types.includes(t)));
    for (const group of result.groups) {
      expect(group.results.length).toBe(Math.min(group.total, 10));
    }
    expect(result.groups.some((g) => g.total > 10)).toBe(true);
  });

  it("returns no groups when nothing matches", () => {
    expect(search("xylophone")).toEqual({ query: "xylophone", groups: [] });
  });

  it("indexes every registry but not lock files", () => {
    const index = buildSearchIndex();
    expect(new Set(index.map((e) => e.type))).toEqual(
      new Set(SEARCH_GROUPS.map((g) => g.type)),
    );
    const lock = index.find((e) => e.id === "frontend/package-lock.json");
    expect(lock?.textWords).not.toContain("integrity");
    expect(
      index
        .filter((e) => e.type === "connection")
        .every((e) => !e.id.includes("->imports->")),
    ).toBe(true);
  });
});
