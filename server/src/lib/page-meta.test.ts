import { describe, expect, it } from "vitest";
import { pageMeta, plainDescription, sitemapPaths } from "./page-meta.js";
import { getAllTopics } from "./learning-tree.js";
import { getAllConcepts } from "./concepts.js";
import { getOrderedSteps } from "./build-journey.js";

describe("pageMeta", () => {
  it("names the sections", () => {
    expect(pageMeta("/")).toMatchObject({
      title: "Full-Stack Learning",
      status: 200,
    });
    expect(pageMeta("/learn/").title).toBe("Learn · Full-Stack Learning");
    expect(pageMeta("/course-map").title).toBe(
      "Course map · Full-Stack Learning",
    );
  });

  it("uses the content for topics, concepts, steps and flows", () => {
    expect(pageMeta("/concepts/react-usestate")).toEqual({
      title: "useState · Full-Stack Learning",
      description: expect.stringMatching(/^\S/),
      status: 200,
    });
    expect(pageMeta("/build/add-state").title).toBe(
      "6. Add state · Full-Stack Learning",
    );
    expect(pageMeta("/learn/react").title).toBe("React · Full-Stack Learning");
    expect(pageMeta("/flow", "?flow=login").title).toBe(
      "Log in · Flow · Full-Stack Learning",
    );
    expect(pageMeta("/flow", "?flow=nope").title).toBe(
      "Flow · Full-Stack Learning",
    );
  });

  it.each([
    "/nope",
    "/concepts/nope",
    "/build/nope",
    "/learn/a/b",
    "/practice/x",
  ])("is a 404 for %s", (path) => {
    expect(pageMeta(path)).toMatchObject({
      title: "Page not found · Full-Stack Learning",
      status: 404,
    });
  });

  it("makes descriptions one short line of plain text", () => {
    expect(plainDescription("Uses `useState`\n  to remember.")).toBe(
      "Uses useState to remember.",
    );
    const long = plainDescription("word ".repeat(100));
    expect(long.length).toBeLessThanOrEqual(160);
    expect(long.endsWith("…")).toBe(true);
  });
});

describe("sitemapPaths", () => {
  it("lists every section, topic, concept and build step, and no 404s", () => {
    const paths = sitemapPaths();
    for (const topic of getAllTopics())
      expect(paths).toContain(`/learn/${topic.slug}`);
    for (const concept of getAllConcepts())
      expect(paths).toContain(`/concepts/${concept.slug}`);
    for (const step of getOrderedSteps())
      expect(paths).toContain(`/build/${step.slug}`);
    expect(paths).toContain("/flow?flow=create-note");
    // Moved sections redirect, so they aren't listed (#384).
    for (const moved of ["/concepts", "/project", "/practice"]) {
      expect(paths.some((p) => p === moved || p.startsWith(`${moved}?`))).toBe(
        false,
      );
    }
    expect(paths.some((p) => p.startsWith("/practice/"))).toBe(false);
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      const [pathname, search = ""] = path.split("?");
      expect(pageMeta(pathname!, search ? `?${search}` : "").status, path).toBe(
        200,
      );
    }
  });
});
