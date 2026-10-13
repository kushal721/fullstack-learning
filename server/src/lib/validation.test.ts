import type {
  BuildStep,
  CodeSymbol,
  Concept,
  Relationship,
  Topic,
} from "@fsl/shared";
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

  describe("concept links", () => {
    const base = realConcepts[0]!;
    const file = {
      id: "a.js",
      path: "a.js",
      layer: "frontend" as const,
      language: "js" as const,
      purpose: "Does a thing.",
      whyItExists: "Because.",
      conceptIds: [],
    };
    const check = (overrides: Partial<Concept>) =>
      validateContent({
        tree: topic("root", 0, [topic(base.topicId, 1)]),
        concepts: [{ ...base, relatedConcepts: [], ...overrides }],
        files: [file],
        diskFiles: ["a.js"],
        readSource: () => "const a = 1;\nexport default a;",
      });

    it("accepts usages whose text is on a line of the file", () => {
      expect(
        check({
          projectUsage: [
            { explanation: "x", fileId: "a.js", match: "export default a;" },
          ],
        }),
      ).toEqual([]);
    });

    it("reports unknown files and steps, and text that is not in the file", () => {
      expect(
        check({
          relatedFiles: ["ghost.js"],
          relatedBuildSteps: ["ghost-step"],
          projectUsage: [
            { explanation: "x", fileId: "ghost.js" },
            { explanation: "x", fileId: "a.js", match: "const b" },
            { explanation: "x", match: "const a" },
          ],
        }),
      ).toEqual([
        `Concept "${base.id}" lists unknown related file "ghost.js".`,
        `Concept "${base.id}" lists unknown build step "ghost-step".`,
        `Concept "${base.id}" projectUsage[0] points at unknown file "ghost.js".`,
        `Concept "${base.id}" projectUsage[1]: "const b" is not on any line of a.js.`,
        `Concept "${base.id}" projectUsage[2] has a match but no fileId.`,
      ]);
    });
  });

  describe("symbols and relationships", () => {
    const file = {
      id: "a.js",
      path: "a.js",
      layer: "frontend" as const,
      language: "js" as const,
      purpose: "Does a thing.",
      whyItExists: "Because.",
      conceptIds: [],
    };
    const symbol = (overrides: Partial<CodeSymbol>): CodeSymbol => ({
      id: "fn:a",
      kind: "function",
      name: "a",
      fileId: "a.js",
      match: "const a = 1;",
      summary: "Does a.",
      dataHandled: "a",
      conceptIds: [],
      ...overrides,
    });
    const check = (symbols: CodeSymbol[], relationships: Relationship[] = []) =>
      validateContent({
        tree: topic("root", 0),
        concepts: [],
        files: [file],
        diskFiles: ["a.js"],
        readSource: () => "const a = 1;\nexport default a;",
        symbols,
        relationships,
      });
    const rel = (
      source: string,
      target: string,
      id = `${source}->calls->${target}`,
    ): Relationship => ({
      id,
      source,
      target,
      type: "calls",
      explanation: "Because.",
    });

    it("accepts a consistent graph", () => {
      expect(
        check(
          [
            symbol({}),
            symbol({
              id: "external:fetch",
              kind: "external",
              fileId: undefined,
              match: undefined,
            }),
          ],
          [rel("fn:a", "external:fetch")],
        ),
      ).toEqual([]);
    });

    it("reports bad ids, files, anchors and concepts on symbols", () => {
      expect(
        check([
          symbol({ id: "component:a" }),
          symbol({ id: "fn:b", match: "nowhere" }),
          symbol({ id: "fn:c", match: undefined, line: 9 }),
          symbol({ id: "fn:d", fileId: "ghost.js" }),
          symbol({ id: "fn:e", fileId: undefined }),
          symbol({ id: "fn:f", conceptIds: ["ghost"] }),
        ]),
      ).toEqual([
        'Symbol "component:a" is a function, so its id must start with "fn:".',
        'Symbol "fn:b": "nowhere" is not on any line of a.js.',
        'Symbol "fn:c" points at line 9, but a.js has 2 lines.',
        'Symbol "fn:d" is in unknown file "ghost.js".',
        'Symbol "fn:e" has a match or line but no fileId.',
        'Symbol "fn:f" links to unknown concept "ghost".',
      ]);
    });

    it("reports relationships with unknown ends, wrong ids or no explanation", () => {
      expect(
        check(
          [symbol({}), symbol({ id: "fn:b" })],
          [
            rel("fn:a", "fn:ghost"),
            rel("fn:a", "fn:b", "a-b"),
            { ...rel("fn:b", "fn:a"), explanation: " " },
            rel("fn:a", "fn:a"),
          ],
        ),
      ).toEqual([
        'Relationship "fn:a->calls->fn:ghost" connects unknown symbol "fn:ghost".',
        'Relationship "a-b" must have the id "fn:a->calls->fn:b".',
        'Relationship "fn:b->calls->fn:a" needs an explanation.',
        'Relationship "fn:a->calls->fn:a" connects a symbol to itself.',
      ]);
    });
  });

  describe("flows", () => {
    it("reports unknown symbols and relationships, bad ids and duplicates", () => {
      const sym = {
        id: "fn:a",
        kind: "function" as const,
        name: "a",
        summary: "x",
        dataHandled: "x",
        conceptIds: [],
      };
      const steps = [
        {
          id: "one",
          symbolId: "fn:a",
          layer: "frontend" as const,
          title: "One",
          explanation: "x",
        },
        {
          id: "one",
          symbolId: "fn:ghost",
          layer: "frontend" as const,
          title: "Two",
          explanation: "x",
          relationshipId: "fn:a->calls->fn:ghost",
        },
      ];
      const flow = (id: string) => ({
        id,
        title: "T",
        summary: "S",
        group: "request" as const,
        direction: "request" as const,
        steps,
      });
      expect(
        validateContent({
          tree: topic("root", 0),
          concepts: [],
          symbols: [sym],
          relationships: [],
          flows: [flow("save"), flow("Bad Id")],
        }).filter((e) => e.startsWith("Flow")),
      ).toEqual([
        'Flow "save" has step id "one" more than once.',
        'Flow "save" step "one" is at unknown symbol "fn:ghost".',
        'Flow "save" step "one" follows unknown relationship "fn:a->calls->fn:ghost".',
        'Flow "Bad Id" needs an id of lowercase letters, numbers and single hyphens.',
        'Flow "Bad Id" has step id "one" more than once.',
        'Flow "Bad Id" step "one" is at unknown symbol "fn:ghost".',
        'Flow "Bad Id" step "one" follows unknown relationship "fn:a->calls->fn:ghost".',
      ]);
    });

    it("keeps protections to security flows and checks build step links", () => {
      const sym = {
        id: "fn:a",
        kind: "function" as const,
        name: "a",
        summary: "x",
        dataHandled: "x",
        conceptIds: [],
      };
      const flow = (id: string, group: "request" | "security") => ({
        id,
        title: "T",
        summary: "S",
        group,
        direction: "request" as const,
        steps: [
          {
            id: "s",
            symbolId: "fn:a",
            layer: "frontend" as const,
            title: "T",
            explanation: "x",
            protects: {
              risk: "A risk",
              defence: group === "security" ? " " : "D",
            },
          },
        ],
      });
      expect(
        validateContent({
          tree: topic("root", 0),
          concepts: [],
          symbols: [sym],
          relationships: [],
          flows: [flow("save", "request"), flow("login", "security")],
          buildSteps: [{ ...realSteps[0]!, flowIds: ["login", "ghost"] }],
        }).filter((e) => e.includes("flow") || e.startsWith("Flow")),
      ).toEqual([
        'Flow "save" step "s" explains a protection, but only security flows show them.',
        'Flow "login" step "s" needs both a risk and a defence.',
        `Build step "${realSteps[0]!.id}" links to unknown flow "ghost".`,
      ]);
    });
  });

  describe("HTTP exchanges", () => {
    it("reports missing, extra and mismatched exchanges and a flow's wrong one", () => {
      const request = (name: string) => ({
        id: `http-request:${name}`,
        kind: "http-request" as const,
        name,
        summary: "x",
        dataHandled: "x",
        conceptIds: [],
      });
      const exchange = (method: string, p: string) => ({
        method,
        path: p,
        purpose: "x",
        headers: {},
        status: 200,
        response: "HTTP/1.1 200 OK",
        errorCases: [],
      });
      const get = exchange("GET", "/a");
      expect(
        validateContent({
          tree: topic("root", 0),
          concepts: [],
          symbols: [request("GET /a"), request("GET /b"), request("POST /c")],
          relationships: [],
          flows: [
            {
              id: "f",
              title: "F",
              summary: "S",
              group: "request",
              direction: "request",
              http: get,
              steps: [
                {
                  id: "s",
                  symbolId: "http-request:GET /b",
                  layer: "network",
                  title: "T",
                  explanation: "x",
                },
              ],
            },
          ],
          httpExchanges: {
            "http-request:GET /a": get,
            "http-request:POST /c": exchange("PUT", "/c"),
            "http-request:GET /zzz": exchange("GET", "/zzz"),
          },
        }).filter((e) => e.startsWith("HTTP") || e.includes("HTTP exchange")),
      ).toEqual([
        'HTTP request "http-request:GET /b" has no exchange in http-exchanges.ts.',
        'HTTP exchange "http-request:POST /c" says PUT /c, but the symbol is POST /c.',
        'HTTP exchange "http-request:GET /zzz" is not an http-request symbol.',
        'Flow "f" shows an HTTP exchange that none of its steps sends.',
      ]);
    });
  });

  describe("layer overviews", () => {
    it("reports unknown links, empty link lists and duplicate layers", () => {
      const layer = {
        layer: "user" as const,
        title: "The user",
        why: ["x"],
        conceptIds: ["ghost"],
        buildStepIds: [],
        fileIds: ["nope.js"],
      };
      expect(
        validateContent({
          tree: topic("root", 0),
          concepts: [],
          files: [],
          buildSteps: [],
          layerOverviews: [layer, layer],
        }).filter((e) => e.startsWith("Layer")),
      ).toEqual([
        'Layer "user" is explained more than once.',
        'Layer overview "user" links unknown concept "ghost".',
        'Layer overview "user" links no build step.',
        'Layer overview "user" links unknown file "nope.js".',
        'Layer overview "user" links unknown concept "ghost".',
        'Layer overview "user" links no build step.',
        'Layer overview "user" links unknown file "nope.js".',
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

    it("reports files changed before they are created, or created twice", () => {
      const steps = [
        step("a", 1, { filesModified: ["a.js"] }),
        step("b", 2, { filesCreated: ["a.js"] }),
        step("c", 3, { filesCreated: ["a.js"] }),
      ];
      expect(
        validateContent({
          tree: topic("root", 0),
          concepts: [],
          files: [
            {
              id: "a.js",
              path: "a.js",
              layer: "frontend",
              language: "js",
              purpose: "Does a thing.",
              whyItExists: "Because.",
              conceptIds: [],
            },
          ],
          diskFiles: ["a.js"],
          buildSteps: steps,
        }),
      ).toEqual([
        'Build step "a" changes "a.js" before any step creates it.',
        'Build step "c" creates "a.js", which already exists.',
      ]);
    });

    it("reports connections that are unknown, imports, created twice or by no step", () => {
      const rel = (
        id: string,
        type: Relationship["type"] = "calls",
      ): Relationship => {
        const [source, , target] = id.split("->") as [string, string, string];
        return { id, source, target, type, explanation: "x" };
      };
      expect(
        validateContent({
          tree: topic("root", 0),
          concepts: [],
          buildSteps: [
            step("a", 1, {
              relationshipIds: [
                "fn:a->calls->fn:b",
                "ghost",
                "f.js->imports->g.js",
              ],
            }),
            step("b", 2, { relationshipIds: ["fn:a->calls->fn:b"] }),
          ],
          relationships: [
            rel("fn:a->calls->fn:b"),
            rel("fn:b->calls->fn:c"),
            rel("f.js->imports->g.js", "imports"),
          ],
        }).filter((e) => /build step|created by/i.test(e)),
      ).toEqual([
        'Build step "a" lists unknown relationship "ghost".',
        'Build step "a" lists file import "f.js->imports->g.js"; imports show in the file changes instead.',
        'Relationship "fn:a->calls->fn:b" is created by both "a" and "b".',
        'Relationship "fn:b->calls->fn:c" isn\'t created by any build step.',
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
