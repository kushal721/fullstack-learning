import type {
  CourseMapResponse,
  GlossaryEntryResponse,
  GlossaryIndexResponse,
  PathResponse,
  SearchResponse,
  StepResponse,
} from "@fsl/shared";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { validateContent } from "../lib/validation.js";

// No topic has a real path yet (#387), so these tests use a small, valid one.
vi.mock("../content/paths/index.js", async () => ({
  topicPaths: [(await import("../lib/guided-path.fixture.js")).fixturePath],
}));
vi.mock("../content/glossary/index.js", async (importOriginal) => {
  const real =
    await importOriginal<typeof import("../content/glossary/index.js")>();
  const { fixtureTerm } = await import("../lib/guided-path.fixture.js");
  return { glossary: [...real.glossary, fixtureTerm] };
});

const app = createApp();

it("uses a fixture that passes npm run validate", () => {
  expect(validateContent()).toEqual([]);
});

describe("GET /api/paths/:topic", () => {
  it("returns the summary, the overview scene and numbered levels", async () => {
    const res = await request(app).get("/api/paths/how-the-web-works");
    const body = res.body as PathResponse;

    expect(res.status).toBe(200);
    expect(body.topic.id).toBe("how-the-web-works");
    expect(body.summary.what).toBe("Computers sending each other messages.");
    expect(body.overviewScene.id).toBe("journey");
    expect(
      body.levels.map((l) => [l.level, l.firstNumber, l.lastNumber]),
    ).toEqual([
      ["basic", 1, 12],
      ["intermediate", 13, 20],
      ["advanced", 21, 26],
    ]);
    // Intermediate continues the count, and every step is summarised.
    expect(body.levels[1]!.steps[0]).toEqual({
      id: "intermediate-1",
      number: 13,
      level: "intermediate",
      kind: "lesson",
      title: "Lesson intermediate-1",
      minutes: 3,
    });
    expect(body.levels[0]!.steps.at(-1)!.kind).toBe("check");
    expect(body.levels[0]!.minutes).toBe(11 * 3 + 5);
  });

  it("returns 404 for a topic without a path and for an unknown topic", async () => {
    const noPath = await request(app).get("/api/paths/html");
    expect(noPath.status).toBe(404);
    expect(noPath.body.error.message).toBe('"HTML" has no guided path yet.');
    expect((await request(app).get("/api/paths/cooking")).status).toBe(404);
  });

  it("rejects a topic that isn't a slug", async () => {
    const res = await request(app).get("/api/paths/Not%20A%20Slug");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/paths/:topic/steps/:step", () => {
  it("returns the blocks without quick-check answers, with scenes, glossary and neighbours", async () => {
    const res = await request(app).get(
      "/api/paths/how-the-web-works/steps/basic-1",
    );
    const body = res.body as StepResponse;

    expect(res.status).toBe(200);
    expect(body.step).toMatchObject({ id: "basic-1", number: 1 });
    expect(body.blocks.map((b) => b.type)).toEqual([
      "explain",
      "scene",
      "check",
    ]);
    expect(JSON.stringify(body)).not.toContain("correctChoiceId");
    expect(JSON.stringify(body)).not.toContain("computers connect by number");
    expect(Object.keys(body.scenes)).toEqual(["journey"]);
    expect(body.glossary.map((g) => g.id)).toEqual([
      "how-the-web-works",
      "ip-address",
    ]);
    expect(body.glossary[1]).toEqual({
      id: "ip-address",
      topicId: "how-the-web-works",
      term: "IP address",
      aliases: ["ip"],
      kind: "term",
      short: "A computer's number on the internet, like 76.76.21.21.",
    });
    expect(body.previous).toBeUndefined();
    expect(body.next?.id).toBe("basic-2");
    expect(body.questions).toBeUndefined();
  });

  it("links across levels: the last Basic step's next is the first Intermediate one", async () => {
    const res = await request(app).get(
      "/api/paths/how-the-web-works/steps/basic-check",
    );
    const body = res.body as StepResponse;

    expect(body.step).toMatchObject({ number: 12, kind: "check" });
    expect(body.next).toMatchObject({ id: "intermediate-1", number: 13 });
  });

  it("sends a level check's questions without answers, with the step each tests", async () => {
    const res = await request(app).get(
      "/api/paths/how-the-web-works/steps/advanced-check",
    );
    const body = res.body as StepResponse;

    expect(body.questions).toHaveLength(4);
    expect(body.questions![0]!.exercise.id).toBe("predict-blank-title");
    expect(body.questions![0]!.step).toMatchObject({
      id: "advanced-1",
      number: 21,
    });
    expect(JSON.stringify(body.questions)).not.toContain("correctChoiceId");
    expect(body.next).toBeUndefined();
  });

  it("returns 404 for an unknown step and 400 for a bad step id", async () => {
    expect(
      (await request(app).get("/api/paths/how-the-web-works/steps/nope"))
        .status,
    ).toBe(404);
    expect(
      (await request(app).get("/api/paths/how-the-web-works/steps/Bad_Id"))
        .status,
    ).toBe(400);
  });
});

describe("POST /api/paths/:topic/steps/:step/check", () => {
  const url = "/api/paths/how-the-web-works/steps/basic-1/check";

  it("checks a quick check and reveals the answer", async () => {
    const wrong = await request(app)
      .post(url)
      .send({ block: 2, choiceId: "name" });
    expect(wrong.status).toBe(200);
    expect(wrong.body).toEqual({
      correct: false,
      explanation: "Names are for people; computers connect by number.",
      expected: { choiceId: "number" },
    });
    expect(wrong.headers["cache-control"]).toBe("no-store");

    const right = await request(app)
      .post(url)
      .send({ block: 2, choiceId: "number" });
    expect(right.body.correct).toBe(true);
  });

  it("rejects a block that isn't a quick check, an unknown choice and a bad body", async () => {
    const notCheck = await request(app)
      .post(url)
      .send({ block: 0, choiceId: "number" });
    expect(notCheck.status).toBe(400);
    expect(notCheck.body.error.message).toBe(
      'Block 0 of step "basic-1" is not a quick check.',
    );
    expect(
      (await request(app).post(url).send({ block: 2, choiceId: "maybe" }))
        .status,
    ).toBe(400);
    expect(
      (await request(app).post(url).send({ block: "2", choiceId: "number" }))
        .status,
    ).toBe(400);
    expect((await request(app).post(url).send({ block: 2 })).status).toBe(400);
  });

  it("returns 404 for an unknown step", async () => {
    const res = await request(app)
      .post("/api/paths/how-the-web-works/steps/nope/check")
      .send({ block: 0, choiceId: "a" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/glossary", () => {
  it("lists every entry's one-line answer, A to Z", async () => {
    const res = await request(app).get("/api/glossary");
    const { entries } = res.body as GlossaryIndexResponse;

    expect(res.status).toBe(200);
    expect(entries.length).toBeGreaterThan(100);
    const terms = entries.map((e) => e.term);
    expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b)));
    // A summary: no body, analogy or concept page.
    expect(
      Object.keys(entries.find((e) => e.id === "react-usestate")!),
    ).toEqual(["id", "topicId", "term", "aliases", "kind", "short"]);
  });
});

describe("GET /api/glossary/:id", () => {
  it("returns the entry, where it is taught and used, related entries and its concept page", async () => {
    const res = await request(app).get("/api/glossary/how-the-web-works");
    const body = res.body as GlossaryEntryResponse;

    expect(res.status).toBe(200);
    expect(body.entry.term).toBe("How the web works");
    expect(body.introducedIn).toMatchObject({
      id: "basic-1",
      number: 1,
      level: "basic",
      topic: { id: "how-the-web-works" },
    });
    expect(body.usedIn.map((s) => s.id)).toEqual(["basic-1"]);
    expect(body.related.map((r) => r.id)).toEqual([
      "http-request-response",
      "https",
      "domain-dns",
    ]);
    expect(body.conceptPage?.slug).toBe("how-the-web-works");
  });

  it("lists every step that uses an entry, in reading order", async () => {
    const res = await request(app).get("/api/glossary/ip-address");
    const body = res.body as GlossaryEntryResponse;

    // The quick check in every lesson step links it.
    expect(body.usedIn[0]).toMatchObject({ id: "basic-1", number: 1 });
    expect(body.usedIn.at(-1)).toMatchObject({ id: "advanced-5", number: 25 });
    expect(body.conceptPage).toBeUndefined();
  });

  it("leaves out introducedIn while the entry's topic has no path", async () => {
    const res = await request(app).get("/api/glossary/react-usestate");
    const body = res.body as GlossaryEntryResponse;

    expect(res.status).toBe(200);
    expect(body.introducedIn).toBeUndefined();
    expect(body.usedIn).toEqual([]);
  });

  it("returns 404 for an unknown entry and 400 for a bad id", async () => {
    expect((await request(app).get("/api/glossary/nope")).status).toBe(404);
    expect((await request(app).get("/api/glossary/Not%20Valid")).status).toBe(
      400,
    );
  });
});

it("marks topics with a path in the learning tree", async () => {
  const res = await request(app).get("/api/topics");
  const [web, html] = res.body.tree.children;
  expect([web.hasPath, html.hasPath]).toEqual([true, false]);
});

describe("GET /api/course-map", () => {
  it("lists every topic in reading order, with levels for topics that have a path", async () => {
    const res = await request(app).get("/api/course-map");
    const { topics } = res.body as CourseMapResponse;

    expect(res.status).toBe(200);
    expect(topics).toHaveLength(14);
    expect(topics.map((t) => t.topic.id).slice(0, 2)).toEqual([
      "how-the-web-works",
      "html",
    ]);
    expect(topics[0]!.status).toBe("ready");
    expect(topics[0]!.levels[1]).toMatchObject({
      level: "intermediate",
      firstNumber: 13,
      lastNumber: 20,
      stepCount: 8,
      minutes: 7 * 3 + 5,
    });
    // Covers lists the lessons, not the level check.
    expect(topics[0]!.levels[2]!.covers).toHaveLength(5);
    expect(topics[1]).toMatchObject({ status: "planned", levels: [] });
  });
});

describe("search", () => {
  it("finds a term by an alias and links to the step that teaches it", async () => {
    const res = await request(app).get("/api/search?q=ip");
    const terms = (res.body as SearchResponse).groups.find(
      (g) => g.type === "term",
    );

    expect(terms?.label).toBe("Terms");
    expect(terms?.results[0]).toMatchObject({
      id: "ip-address",
      title: "IP address",
      href: "/learn/how-the-web-works/basic-1?term=ip-address",
    });
  });

  it("finds a concept by a glossary alias its page never mentions", async () => {
    const res = await request(app).get("/api/search?q=lambda");
    const concepts = (res.body as SearchResponse).groups.find(
      (g) => g.type === "concept",
    );

    expect(concepts?.results.map((r) => r.id)).toEqual(["js-arrow-function"]);
  });
});
