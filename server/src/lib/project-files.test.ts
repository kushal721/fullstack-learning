import type { FileTreeFolder, ProjectFile } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import {
  buildFileTree,
  getAllFiles,
  getFile,
  listExampleProjectFiles,
  readFileSource,
} from "./project-files.js";

function file(path: string): ProjectFile {
  return {
    id: path,
    path,
    layer: "frontend",
    language: "js",
    purpose: `About ${path}.`,
    whyItExists: "Because.",
    conceptIds: [],
  };
}

describe("buildFileTree", () => {
  const tree = buildFileTree([
    file("frontend/src/App.jsx"),
    file("frontend/index.html"),
    file("frontend/src/components/Button.jsx"),
    file("backend/src/server.js"),
  ]);

  it("nests files in folders, folders first, alphabetical", () => {
    expect(tree.children.map((c) => c.name)).toEqual(["backend", "frontend"]);
    const frontend = tree.children[1] as FileTreeFolder;
    expect(frontend.children.map((c) => `${c.type}:${c.name}`)).toEqual([
      "folder:src",
      "file:index.html",
    ]);
    const src = frontend.children[0] as FileTreeFolder;
    expect(src.children.map((c) => `${c.type}:${c.name}`)).toEqual([
      "folder:components",
      "file:App.jsx",
    ]);
  });

  it("gives folders and files their full path", () => {
    const frontend = tree.children[1] as FileTreeFolder;
    const src = frontend.children[0] as FileTreeFolder;
    expect(src.path).toBe("frontend/src");
    expect(src.children[1]).toEqual({
      type: "file",
      name: "App.jsx",
      path: "frontend/src/App.jsx",
      layer: "frontend",
      purpose: "About frontend/src/App.jsx.",
    });
  });

  it("returns an empty root for no files", () => {
    expect(buildFileTree([])).toEqual({
      type: "folder",
      name: "",
      path: "",
      children: [],
    });
  });
});

describe("example project files", () => {
  it("describes every file on disk, and nothing else", () => {
    expect(
      getAllFiles()
        .map((f) => f.id)
        .sort(),
    ).toEqual(listExampleProjectFiles());
  });

  it("finds files by id and assigns the layer from the first folder", () => {
    expect(getFile("backend/src/db.js")?.layer).toBe("backend");
    expect(getFile("database/schema.sql")?.language).toBe("sql");
    expect(getFile("nope.js")).toBeUndefined();
  });

  it("reads the source of a known file", async () => {
    const source = await readFileSource("frontend/src/services/notesApi.js");
    expect(source).toContain("export function createNote");
  });

  it("never reads files that are not in the list", async () => {
    await expect(readFileSource("../../package.json")).resolves.toBeUndefined();
    await expect(readFileSource("backend/.env")).resolves.toBeUndefined();
  });

  it("only uses formatting the client can render, in full sentences", () => {
    for (const file of getAllFiles()) {
      for (const text of [file.purpose, file.whyItExists]) {
        expect((text.match(/`/g) ?? []).length % 2, file.id).toBe(0);
        expect(text.replace(/`[^`]*`/g, ""), file.id).not.toMatch(
          /\*\*|<[a-z]/i,
        );
        expect(text, file.id).toMatch(/\.$/);
      }
    }
  });
});
