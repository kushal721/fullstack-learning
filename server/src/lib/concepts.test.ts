import { describe, expect, it } from "vitest";
import {
  getAllConcepts,
  getConcept,
  getConceptBySlug,
  getConceptsByTopic,
  getFileUses,
  getRelatedConcepts,
  getStepsIntroducing,
} from "./concepts.js";
import { findLine } from "./project-files.js";

describe("concepts", () => {
  it("registers concepts with unique ids, including the reference concepts", () => {
    const ids = getAllConcepts().map((concept) => concept.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(
      expect.arrayContaining(["html-button", "react-usestate", "http-post"]),
    );
  });

  it("finds concepts by id and slug", () => {
    expect(getConcept("react-usestate")?.title).toBe("useState");
    expect(getConceptBySlug("http-post")?.topicId).toBe("http");
    expect(getConcept("nope")).toBeUndefined();
    expect(getConceptBySlug("nope")).toBeUndefined();
  });

  it("lists the concepts of a topic", () => {
    expect(
      getConceptsByTopic("how-the-web-works").map((concept) => concept.id),
    ).toEqual(["how-the-web-works"]);
    expect(
      getConceptsByTopic("react").every(
        (concept) => concept.topicId === "react",
      ),
    ).toBe(true);
    expect(getConceptsByTopic("authentication")).toEqual([]);
  });

  it("includes links written on either side, without duplicates", () => {
    // html-button lists http-post; react-usestate lists html-button.
    const forButton = getRelatedConcepts("html-button").map((c) => c.id);
    expect(forButton).toEqual(
      expect.arrayContaining(["http-post", "react-usestate"]),
    );
    expect(new Set(forButton).size).toBe(forButton.length);
    expect(forButton).not.toContain("html-button");
    expect(getRelatedConcepts("react-usestate").map((c) => c.id)).toContain(
      "html-button",
    );
    expect(getRelatedConcepts("nope")).toEqual([]);
  });

  it("only uses formatting the client can render", () => {
    for (const concept of getAllConcepts()) {
      const text = [
        concept.summary,
        ...concept.basics,
        ...concept.what,
        ...concept.why,
        ...concept.howItWorks,
        ...concept.internals,
        ...concept.whereUsed,
        ...concept.connectsTo,
        ...concept.commonMistakes,
        ...concept.howToCreate.map((step) => step.text),
        ...concept.projectUsage.map((usage) => usage.explanation),
      ].join(" ");
      expect((text.match(/`/g) ?? []).length % 2, concept.id).toBe(0);
      const prose = text.replace(/`[^`]*`/g, "");
      expect(prose, concept.id).not.toMatch(/\*\*|<[a-z]/i);
    }
  });

  describe("links to the Notes App", () => {
    const useState = () => getConcept("react-usestate")!;

    it("lists the build steps that introduce a concept, in journey order", () => {
      expect(getStepsIntroducing(useState()).map((s) => s.id)).toEqual([
        "add-state",
      ]);
      // A concept can add a step the step itself doesn't list.
      expect(
        getStepsIntroducing({
          ...useState(),
          relatedBuildSteps: ["deploy"],
        }).map((s) => s.order),
      ).toEqual([6, 14]);
    });

    it("lists each file once, usages with their line first", () => {
      const uses = getFileUses(useState());
      const ids = uses.map((use) => use.fileId);
      expect(new Set(ids).size).toBe(ids.length);
      expect(uses[0]).toMatchObject({
        fileId: "frontend/src/components/NoteForm.jsx",
        line: findLine(
          "frontend/src/components/NoteForm.jsx",
          'const [title, setTitle] = useState("");',
        ),
        explanation: expect.stringContaining("NoteForm.jsx"),
      });
      expect(uses[0]!.line).toBeGreaterThan(0);
    });

    it("adds files whose concept list names the concept, without a line", () => {
      const concept = { ...useState(), projectUsage: [], relatedFiles: [] };
      const uses = getFileUses(concept);
      expect(uses.length).toBeGreaterThan(0);
      expect(uses.every((use) => use.line === undefined)).toBe(true);
    });

    it("finds the line of a text, or nothing", () => {
      expect(findLine("frontend/src/main.jsx", "createRoot(")).toBe(6);
      expect(
        findLine("frontend/src/main.jsx", "not in the file"),
      ).toBeUndefined();
      expect(findLine("no/such/file.js", "x")).toBeUndefined();
    });
  });
});
