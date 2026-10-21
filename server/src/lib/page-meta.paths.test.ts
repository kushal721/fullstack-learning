import { describe, expect, it, vi } from "vitest";
import { pageMeta, sitemapPaths } from "./page-meta.js";

// Step pages only exist for topics with a guided path; none is real yet.
vi.mock("../content/paths/index.js", async () => ({
  topicPaths: [(await import("./guided-path.fixture.js")).fixturePath],
}));
vi.mock("../content/glossary/index.js", async (importOriginal) => {
  const real =
    await importOriginal<typeof import("../content/glossary/index.js")>();
  const { fixtureTerm } = await import("./guided-path.fixture.js");
  // The fixture path teaches only its own words, so the real topic's
  // terms are left out (its concept entry stays: the fixture links it).
  return {
    glossary: [
      ...real.glossary.filter(
        (g) =>
          g.topicId !== "how-the-web-works" ||
          (g.kind === "concept" && g.conceptPageId),
      ),
      fixtureTerm,
    ],
  };
});

describe("pageMeta for guided steps", () => {
  it("names a step page after the step and its topic", () => {
    expect(pageMeta("/learn/how-the-web-works/basic-1")).toMatchObject({
      title: "Lesson basic-1 · How the Web Works · Full-Stack Learning",
      status: 200,
    });
  });

  it.each([
    "/learn/how-the-web-works/nope",
    "/learn/html/basic-1",
    "/learn/how-the-web-works/basic-1/more",
    "/concepts/html-element/more",
  ])("is a 404 for %s", (path) => {
    expect(pageMeta(path).status).toBe(404);
  });

  it("lists every step in the sitemap", () => {
    const paths = sitemapPaths();
    expect(paths).toContain("/learn/how-the-web-works/basic-1");
    expect(paths).toContain("/learn/how-the-web-works/advanced-check");
  });
});
