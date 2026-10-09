import { describe, expect, it } from "vitest";
import {
  getAllConcepts,
  getConcept,
  getConceptBySlug,
  getConceptsByTopic,
  getRelatedConcepts,
} from "./concepts.js";

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
    expect(getConceptsByTopic("databases")).toEqual([]);
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
});
