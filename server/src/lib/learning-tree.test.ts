import { describe, expect, it } from "vitest";
import {
  getAdjacentTopics,
  getAllTopics,
  getTopicBySlug,
  getTree,
} from "./learning-tree.js";

describe("learning tree", () => {
  it("has the 14 topics of the spec in order", () => {
    expect(getAllTopics().map((topic) => topic.id)).toEqual([
      "how-the-web-works",
      "html",
      "css",
      "javascript",
      "git",
      "react",
      "http",
      "backend",
      "databases",
      "authentication",
      "security",
      "testing",
      "deployment",
      "how-everything-connects",
    ]);
    expect(getAllTopics().map((topic) => topic.order)).toEqual(
      Array.from({ length: 14 }, (_, i) => i + 1),
    );
  });

  it("starts at the Full-Stack Development root", () => {
    expect(getTree().title).toBe("Full-Stack Development");
    expect(getTree().children).toHaveLength(14);
  });

  it("uses unique ids and URL-safe unique slugs", () => {
    const topics = [getTree(), ...getAllTopics()];
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    expect(new Set(topics.map((t) => t.slug)).size).toBe(topics.length);
    for (const topic of topics) {
      expect(topic.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("gives every topic a one-sentence summary", () => {
    for (const topic of getAllTopics()) {
      expect(topic.summary).toMatch(/^[A-Z].*\.$/);
    }
  });

  it("finds topics by slug", () => {
    expect(getTopicBySlug("react")?.title).toBe("React");
    expect(getTopicBySlug("not-a-topic")).toBeUndefined();
  });

  it("knows the previous and next topic", () => {
    expect(getAdjacentTopics("html")).toMatchObject({
      previous: { id: "how-the-web-works" },
      next: { id: "css" },
    });
    expect(getAdjacentTopics("how-the-web-works").previous).toBeUndefined();
    expect(getAdjacentTopics("how-everything-connects").next).toBeUndefined();
    expect(getAdjacentTopics("unknown")).toEqual({});
  });

  it("gives every topic an overview of 3 to 5 paragraphs", () => {
    for (const topic of getAllTopics()) {
      expect(topic.overview.length, topic.id).toBeGreaterThanOrEqual(3);
      expect(topic.overview.length, topic.id).toBeLessThanOrEqual(5);
    }
  });

  it("only uses formatting the client can render (inline `code`)", () => {
    for (const topic of [getTree(), ...getAllTopics()]) {
      const text = [topic.summary, ...topic.overview, topic.whereToStart].join(
        " ",
      );
      expect((text.match(/`/g) ?? []).length % 2, topic.id).toBe(0);
      // Outside `code` spans there must be no Markdown bold or HTML tags.
      const prose = text.replace(/`[^`]*`/g, "");
      expect(prose, topic.id).not.toMatch(/\*\*|<[a-z]/i);
    }
  });

  it("tells a beginner where to start", () => {
    expect(getTree().whereToStart).toBeTruthy();
    expect(getAllTopics()[0]?.whereToStart).toBeTruthy();
  });
});
