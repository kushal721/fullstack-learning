import { describe, expect, it } from "vitest";
import {
  getAllConcepts,
  getConcept,
  getConceptBySlug,
  getConceptsByTopic,
  getRelatedConcepts,
} from "./concepts.js";

describe("concepts", () => {
  it("has the three reference concepts", () => {
    expect(getAllConcepts().map((concept) => concept.id)).toEqual([
      "html-button",
      "react-usestate",
      "http-post",
    ]);
  });

  it("finds concepts by id and slug", () => {
    expect(getConcept("react-usestate")?.title).toBe("useState");
    expect(getConceptBySlug("http-post")?.topicId).toBe("http");
    expect(getConcept("nope")).toBeUndefined();
    expect(getConceptBySlug("nope")).toBeUndefined();
  });

  it("lists the concepts of a topic", () => {
    expect(getConceptsByTopic("react").map((concept) => concept.id)).toEqual([
      "react-usestate",
    ]);
    expect(getConceptsByTopic("css")).toEqual([]);
  });

  it("includes links written on either side, without duplicates", () => {
    // html-button lists http-post; react-usestate and http-post list html-button.
    expect(getRelatedConcepts("html-button").map((c) => c.id)).toEqual([
      "http-post",
      "react-usestate",
    ]);
    expect(getRelatedConcepts("http-post").map((c) => c.id)).toEqual([
      "html-button",
    ]);
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
