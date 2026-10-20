import type { GlossaryEntry, Step, TopicPath } from "@fsl/shared";
import { describe, expect, it } from "vitest";
import {
  glossaryUsage,
  numberSteps,
  plainText,
  stepLinks,
  termLinks,
} from "./guided-learning.js";

const lesson = (id: string, text = `About ${id}.`): Step => ({
  kind: "lesson",
  id,
  title: id,
  minutes: 3,
  blocks: [{ type: "explain", text }],
});

function path(
  topicId: string,
  basic: Step[],
  intermediate: Step[] = [],
  advanced: Step[] = [],
): TopicPath {
  return {
    topicId,
    summary: { what: "W", does: "D", how: "H" },
    overviewSceneId: "s",
    scenes: [],
    levels: {
      basic: { outcome: "B", steps: basic },
      intermediate: { outcome: "I", steps: intermediate },
      advanced: { outcome: "A", steps: advanced },
    },
  };
}

const entry = (id: string, topicId: string): GlossaryEntry => ({
  id,
  topicId,
  term: id.toUpperCase(),
  kind: "term",
  short: "Short.",
  body: "Body.",
});

describe("numberSteps", () => {
  it("numbers straight through the levels, so Intermediate continues the count", () => {
    const numbered = numberSteps(
      path("web", [lesson("a"), lesson("b")], [lesson("c")], [lesson("d")]),
    );

    expect(numbered.map((s) => [s.number, s.level, s.step.id])).toEqual([
      [1, "basic", "a"],
      [2, "basic", "b"],
      [3, "intermediate", "c"],
      [4, "advanced", "d"],
    ]);
  });

  it("shifts the later numbers when a Basic step is added", () => {
    const before = numberSteps(path("web", [lesson("a")], [lesson("c")]));
    const after = numberSteps(
      path("web", [lesson("a"), lesson("b")], [lesson("c")]),
    );

    expect(before.find((s) => s.step.id === "c")!.number).toBe(2);
    expect(after.find((s) => s.step.id === "c")!.number).toBe(3);
  });
});

describe("termLinks and plainText", () => {
  it("finds links with and without a label", () => {
    expect(termLinks("A [[dns]] turns [[ip-address|IP addresses]].")).toEqual([
      { id: "dns" },
      { id: "ip-address", label: "IP addresses" },
    ]);
  });

  it("reads a link as its label, else the term, else the id", () => {
    const terms = (id: string) => (id === "dns" ? "DNS" : undefined);

    expect(plainText("[[dns]], [[ip-address|IP]] and [[url]]", terms)).toBe(
      "DNS, IP and url",
    );
  });
});

describe("stepLinks", () => {
  it("lists each linked id once, in reading order, from every kind of text", () => {
    const step: Step = {
      kind: "lesson",
      id: "s",
      title: "S",
      minutes: 2,
      blocks: [
        { type: "explain", text: "[[server]] and [[client]]" },
        { type: "keyPoints", items: ["[[client]] again", "[[dns]]"] },
        {
          type: "check",
          question: "[[http]]?",
          choices: [
            { id: "a", text: "[[url]]" },
            { id: "b", text: "No" },
          ],
          correctChoiceId: "a",
          explanation: "[[port]]",
        },
        { type: "diagram", nodes: [{ label: "[[ignored]]" }, { label: "B" }] },
      ],
    };

    expect(stepLinks(step)).toEqual([
      "server",
      "client",
      "dns",
      "http",
      "url",
      "port",
    ]);
  });
});

describe("glossaryUsage", () => {
  it("is introduced in its own topic's first linking step and used everywhere it is linked", () => {
    const paths = [
      path(
        "web",
        [lesson("one", "[[dns]]")],
        [lesson("two", "[[dns]] [[tag]]")],
      ),
      path("html", [lesson("tags", "[[tag]] [[dns]]")]),
    ];
    const usage = glossaryUsage(paths, [
      entry("dns", "web"),
      entry("tag", "html"),
      entry("unused", "web"),
    ]);

    expect(usage.get("dns")).toEqual({
      introducedIn: {
        topicId: "web",
        stepId: "one",
        number: 1,
        level: "basic",
      },
      usedIn: [
        { topicId: "web", stepId: "one", number: 1, level: "basic" },
        { topicId: "web", stepId: "two", number: 2, level: "intermediate" },
        { topicId: "html", stepId: "tags", number: 1, level: "basic" },
      ],
    });
    // Linked earlier by another topic, but introduced by its own.
    expect(usage.get("tag")!.introducedIn).toEqual({
      topicId: "html",
      stepId: "tags",
      number: 1,
      level: "basic",
    });
    expect(usage.get("unused")).toEqual({ usedIn: [] });
  });
});
