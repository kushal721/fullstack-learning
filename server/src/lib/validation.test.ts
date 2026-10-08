import type { Topic } from "@fsl/shared";
import { describe, expect, it } from "vitest";
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

    expect(validateContent({ tree })).toEqual([
      'Topic slug "html" is used more than once.',
    ]);
  });

  it("reports a duplicated id once, however often it repeats", () => {
    const tree = topic("root", 0, [
      topic("html", 1),
      { ...topic("html", 2), slug: "html-2" },
      { ...topic("html", 3), slug: "html-3" },
    ]);

    expect(validateContent({ tree })).toEqual([
      'Topic id "html" is used more than once.',
    ]);
  });

  it("reports slugs that are not URL-safe", () => {
    const tree = topic("root", 0, [
      { ...topic("html", 1), slug: "HTML Basics" },
    ]);

    expect(validateContent({ tree })).toEqual([
      'Topic "html" has slug "HTML Basics"; use lowercase letters, numbers and single hyphens.',
    ]);
  });

  it("reports missing titles or summaries", () => {
    const tree = topic("root", 0, [{ ...topic("html", 1), summary: " " }]);

    expect(validateContent({ tree })).toEqual([
      'Topic "html" needs a title and a summary.',
    ]);
  });

  it("reports children that are not ordered 1..n", () => {
    const tree = topic("root", 0, [topic("html", 1), topic("css", 3)]);

    expect(validateContent({ tree })).toEqual([
      'Children of topic "root" must be ordered 1..2 (found 1, 3).',
    ]);
  });
});
