import type { BuildStep } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import { buildSteps } from "../content/build-steps/index.js";
import { projectFiles } from "../content/files.js";
import { diffSnapshots, getSnapshot } from "./project-evolution.js";

describe("project evolution", () => {
  it("starts with an empty notes-app folder at step 0", () => {
    const snapshot = getSnapshot(0);
    expect(snapshot.files).toEqual([]);
    expect(snapshot.tree).toEqual({
      type: "folder",
      name: "notes-app",
      path: "",
      children: [],
    });
  });

  it("has only the files created by step 1 and step 2 after step 2", () => {
    expect(getSnapshot(1).files).toEqual([]);
    const ids = getSnapshot(2).files.map((file) => file.id);
    expect(ids).toContain("frontend/src/App.jsx");
    expect(ids.every((id) => id.startsWith("frontend/"))).toBe(true);
    expect(getSnapshot(2).tree.children.map((child) => child.name)).toEqual([
      "frontend",
    ]);
  });

  it("contains every example file after the last step", () => {
    expect(getSnapshot(buildSteps.length).files).toEqual(projectFiles);
  });

  it("diffs two steps", () => {
    expect(diffSnapshots(5, 6)).toEqual({
      added: [
        "frontend/src/components/Input.jsx",
        "frontend/src/components/NoteForm.jsx",
        "frontend/src/hooks/useNotes.js",
      ],
      removed: [],
      modified: ["frontend/src/pages/Dashboard.jsx"],
    });
  });

  it("does not report a file as modified when it is new in the range", () => {
    const diff = diffSnapshots(5, 7);
    expect(diff.added).toContain("frontend/src/hooks/useNotes.js");
    expect(diff.modified).not.toContain("frontend/src/hooks/useNotes.js");
    expect(diff.modified).toContain("frontend/src/pages/Dashboard.jsx");
  });

  it("handles removed files", () => {
    const step = (order: number, overrides: Partial<BuildStep>) =>
      ({
        ...buildSteps[0]!,
        id: `s${order}`,
        order,
        filesCreated: [],
        filesModified: [],
        filesRemoved: [],
        ...overrides,
      }) as BuildStep;
    const steps = [
      step(1, { filesCreated: ["a.js", "b.js"] }),
      step(2, { filesRemoved: ["a.js"], filesModified: ["b.js"] }),
    ];
    const files = ["a.js", "b.js"].map((id) => ({
      ...projectFiles[0]!,
      id,
      path: id,
    }));

    expect(getSnapshot(2, steps, files).files.map((f) => f.id)).toEqual([
      "b.js",
    ]);
    expect(diffSnapshots(1, 2, steps)).toEqual({
      added: [],
      removed: ["a.js"],
      modified: ["b.js"],
    });
  });
});
