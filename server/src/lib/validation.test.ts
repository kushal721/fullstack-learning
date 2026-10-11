import type { BuildStep, Concept, Topic } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import { buildSteps as realSteps } from "../content/build-steps/index.js";
import { concepts as realConcepts } from "../content/concepts/index.js";
import { validateContent } from "./validation.js";

function topic(id: string, order: number, children: Topic[] = []): Topic {
  return {
    id,
    slug: id,
    order,
    title: id.toUpperCase(),
    summary: `About ${id}.`,
    overview: [],
    children,
    conceptIds: [],
    buildStepIds: [],
  };
}

describe("validateContent", () => {
  it("finds no problems in the real content", () => {
    expect(validateContent()).toEqual([]);
  });

  it("reports a duplicated slug", () => {
    const tree = topic("root", 0, [topic("html", 1), topic("css", 2)]);
    tree.children[1]!.slug = "html";

    expect(validateContent({ tree, concepts: [] })).toEqual([
      'Topic slug "html" is used more than once.',
    ]);
  });

  it("reports a duplicated id once, however often it repeats", () => {
    const tree = topic("root", 0, [
      topic("html", 1),
      { ...topic("html", 2), slug: "html-2" },
      { ...topic("html", 3), slug: "html-3" },
    ]);

    expect(validateContent({ tree, concepts: [] })).toEqual([
      'Topic id "html" is used more than once.',
    ]);
  });

  it("reports slugs that are not URL-safe", () => {
    const tree = topic("root", 0, [
      { ...topic("html", 1), slug: "HTML Basics" },
    ]);

    expect(validateContent({ tree, concepts: [] })).toEqual([
      'Topic "html" has slug "HTML Basics"; use lowercase letters, numbers and single hyphens.',
    ]);
  });

  it("reports missing titles or summaries", () => {
    const tree = topic("root", 0, [{ ...topic("html", 1), summary: " " }]);

    expect(validateContent({ tree, concepts: [] })).toEqual([
      'Topic "html" needs a title and a summary.',
    ]);
  });

  it("reports children that are not ordered 1..n", () => {
    const tree = topic("root", 0, [topic("html", 1), topic("css", 3)]);

    expect(validateContent({ tree, concepts: [] })).toEqual([
      'Children of topic "root" must be ordered 1..2 (found 1, 3).',
    ]);
  });

  describe("concepts", () => {
    const base = realConcepts[0]!;
    const concept = (overrides: Partial<Concept>): Concept => ({
      ...base,
      topicId: "html",
      relatedConcepts: [],
      ...overrides,
    });
    const tree = () => {
      const root = topic("root", 0, [topic("html", 1), topic("react", 2)]);
      return root;
    };

    it("reports duplicate concept ids and slugs", () => {
      const errors = validateContent({
        tree: tree(),
        concepts: [
          concept({ id: "a", slug: "same" }),
          concept({ id: "a", slug: "same" }),
        ],
      });
      expect(errors).toEqual([
        'Concept id "a" is used more than once.',
        'Concept slug "same" is used more than once.',
      ]);
    });

    it("reports an unknown related concept", () => {
      const errors = validateContent({
        tree: tree(),
        concepts: [concept({ id: "a", slug: "a", relatedConcepts: ["ghost"] })],
      });
      expect(errors).toEqual([
        'Concept "a" links to unknown related concept "ghost".',
      ]);
    });

    it("reports a concept in an unknown topic", () => {
      const errors = validateContent({
        tree: tree(),
        concepts: [concept({ id: "a", slug: "a", topicId: "cooking" })],
      });
      expect(errors).toEqual([
        'Concept "a" belongs to unknown topic "cooking".',
      ]);
    });

    it("reports empty sections", () => {
      const errors = validateContent({
        tree: tree(),
        concepts: [concept({ id: "a", slug: "a", why: [], howToCreate: [] })],
      });
      expect(errors).toEqual([
        'Concept "a" has an empty "why" section.',
        'Concept "a" has an empty "howToCreate" section.',
      ]);
    });

    it("reports topic conceptIds that are unknown or point at another topic", () => {
      const root = tree();
      root.children[0]!.conceptIds = ["ghost", "a"];
      const errors = validateContent({
        tree: root,
        concepts: [concept({ id: "a", slug: "a", topicId: "react" })],
      });
      expect(errors).toEqual([
        'Topic "html" lists unknown concept "ghost".',
        'Topic "html" lists concept "a", but that concept belongs to "react".',
      ]);
    });
  });

  describe("example project files", () => {
    const file = (id: string, conceptIds: string[] = []) => ({
      id,
      path: id,
      layer: "frontend" as const,
      language: "js" as const,
      purpose: "Does a thing.",
      whyItExists: "Because.",
      conceptIds,
    });
    const tree = () => topic("root", 0, []);

    it("reports files described but missing on disk, and files on disk without a description", () => {
      expect(
        validateContent({
          tree: tree(),
          concepts: [],
          files: [file("frontend/a.js")],
          diskFiles: ["frontend/b.js"],
        }),
      ).toEqual([
        'File "frontend/a.js" is described but does not exist in example-project/.',
        'File "frontend/b.js" exists in example-project/ but has no entry in content/files.ts.',
      ]);
    });

    it("reports unknown concepts and duplicate descriptions", () => {
      expect(
        validateContent({
          tree: tree(),
          concepts: [],
          files: [file("a.js", ["ghost"]), file("a.js")],
          diskFiles: ["a.js"],
        }),
      ).toEqual([
        'File "a.js" is described more than once.',
        'File "a.js" links to unknown concept "ghost".',
      ]);
    });
  });

  describe("build steps", () => {
    const step = (
      id: string,
      order: number,
      overrides: Partial<BuildStep> = {},
    ): BuildStep => ({
      ...realSteps[0]!,
      id,
      slug: id,
      order,
      prerequisites: [],
      filesCreated: [],
      filesModified: [],
      filesRemoved: [],
      conceptIds: [],
      nextStepId: undefined,
      ...overrides,
    });
    const check = (buildSteps: BuildStep[], tree = topic("root", 0)) =>
      validateContent({ tree, concepts: [], buildSteps });

    it("accepts a consistent journey", () => {
      expect(
        check([
          step("a", 1, { nextStepId: "b" }),
          step("b", 2, { prerequisites: ["a"] }),
        ]),
      ).toEqual([]);
    });

    it("reports duplicate ids, slugs and orders", () => {
      expect(check([step("a", 1), step("a", 1)])).toEqual([
        'Build step id "a" is used more than once.',
        'Build step slug "a" is used more than once.',
        "Build steps must be ordered 1..2 with no gaps or repeats (found 1, 1).",
      ]);
    });

    it("reports unknown files and concepts", () => {
      expect(
        check([
          step("a", 1, {
            filesCreated: ["frontend/ghost.js"],
            filesRemoved: ["old.js"],
            conceptIds: ["ghost"],
          }),
        ]),
      ).toEqual([
        'Build step "a" lists unknown file "frontend/ghost.js".',
        'Build step "a" lists unknown file "old.js".',
        'Build step "a" lists unknown concept "ghost".',
      ]);
    });

    it("reports prerequisites and next steps that are unknown or out of order", () => {
      expect(
        check([
          step("a", 1, { prerequisites: ["b"], nextStepId: "ghost" }),
          step("b", 2, { prerequisites: ["ghost"], nextStepId: "a" }),
        ]),
      ).toEqual([
        'Build step "a" requires "b", which does not come before it.',
        'Build step "a" has unknown next step "ghost".',
        'Build step "b" requires unknown step "ghost".',
        'Build step "b" has next step "a", which does not come after it.',
      ]);
    });

    it("reports topics that list unknown build steps", () => {
      const tree = topic("root", 0, [
        { ...topic("react", 1), buildStepIds: ["a", "ghost"] },
      ]);
      expect(check([step("a", 1)], tree)).toEqual([
        'Topic "react" lists unknown build step "ghost".',
      ]);
    });
  });
});
