import type {
  Block,
  GlossaryEntry,
  LevelPlan,
  Step,
  TopicPath,
} from "@fsl/shared";
import { describe, expect, it } from "vitest";
import { type PathRefs, validatePaths } from "./path-validation.js";

// A small, valid fixture (not real content): each test breaks one rule.

const refs: PathRefs = {
  topicIds: ["web", "html", "css"],
  concepts: new Map([["dns-concept", "web"]]),
  exerciseIds: new Set(["q1", "q2", "q3", "q4"]),
  fileIds: new Set(["frontend/src/App.jsx"]),
  symbolIds: new Set(["fn:handleSave"]),
  flowIds: new Set(["create-note"]),
};

const quickCheck = (): Block => ({
  type: "check",
  question: "Which one?",
  choices: [
    { id: "a", text: "This one" },
    { id: "b", text: "That one" },
  ],
  correctChoiceId: "a",
  explanation: "Because.",
});

const lesson = (
  id: string,
  blocks: Block[] = [{ type: "explain", text: `About ${id}.` }, quickCheck()],
): Step => ({ kind: "lesson", id, title: `Title ${id}`, minutes: 3, blocks });

const levelCheck = (id: string, stepIds: string[]): Step => ({
  kind: "check",
  id,
  title: "Check",
  minutes: 5,
  blocks: [],
  questions: ["q1", "q2", "q3", "q4"].map((exerciseId, i) => ({
    exerciseId,
    stepId: stepIds[i % stepIds.length]!,
  })),
});

function level(prefix: string, size: number, first?: Block[]): LevelPlan {
  const lessons = Array.from({ length: size - 1 }, (_, i) =>
    lesson(`${prefix}-${i + 1}`, i === 0 && first ? first : undefined),
  );
  return {
    outcome: `After ${prefix} you can do it.`,
    steps: [
      ...lessons,
      levelCheck(
        `${prefix}-check`,
        lessons.map((s) => s.id),
      ),
    ],
  };
}

function makePath(topicId = "web", firstBlocks?: Block[]): TopicPath {
  return {
    topicId,
    summary: { what: "What.", does: "Does.", how: "How." },
    overviewSceneId: "journey",
    scenes: [
      {
        id: "journey",
        title: "The journey",
        actors: [
          { id: "you", label: "You" },
          { id: "server", label: "Server" },
        ],
        steps: [
          { from: "you", to: "server", message: "GET /", caption: "You ask." },
          { from: "server", to: "you", message: "200", caption: "It answers." },
          { from: "you", to: "you", message: "page", caption: "You read." },
        ],
      },
    ],
    levels: {
      basic: level(
        `${topicId}-b`,
        12,
        firstBlocks ?? [
          { type: "explain", text: "A [[client]] asks a [[server]]." },
          quickCheck(),
        ],
      ),
      intermediate: level(`${topicId}-i`, 8),
      advanced: level(`${topicId}-a`, 6),
    },
  };
}

const glossary = (): GlossaryEntry[] => [
  {
    id: "client",
    topicId: "web",
    term: "Client",
    kind: "term",
    short: "It asks.",
    body: "It sends requests to a [[server]].",
  },
  {
    id: "server",
    topicId: "web",
    term: "Server",
    kind: "term",
    short: "It answers.",
    body: "It answers a [[client]].",
    conceptPageId: "dns-concept",
  },
];

/** Replace the blocks of basic step 2 ("web-b-2"). */
function withStep2(blocks: Block[]): TopicPath {
  const path = makePath();
  path.levels.basic.steps[1] = lesson("web-b-2", blocks);
  return path;
}

const step2 = 'Path "web" step 2 "web-b-2"';

describe("validatePaths", () => {
  it("accepts the valid fixture", () => {
    expect(validatePaths([makePath()], glossary(), refs)).toEqual([]);
  });

  describe("paths", () => {
    it("reports an unknown topic, a second path for a topic, and paths out of reading order", () => {
      expect(validatePaths([makePath("nope")], [], refs)).toContain(
        'Path "nope" is for unknown topic "nope".',
      );
      const plain = (id: string) =>
        makePath(id, [{ type: "explain", text: "Hi." }, quickCheck()]);
      expect(validatePaths([plain("html"), plain("html")], [], refs)).toEqual([
        'Topic "html" has more than one path.',
      ]);
      expect(validatePaths([plain("html"), plain("web")], [], refs)).toEqual([
        'Path "web" comes before "html" in the learning tree; list paths in reading order.',
      ]);
    });

    it("reports a summary that is too long and an unknown overview scene", () => {
      const path = makePath();
      path.summary.how = "x".repeat(221);
      path.overviewSceneId = "missing";

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" summary "how" needs 1–220 characters.',
        'Path "web" has unknown overview scene "missing".',
      ]);
    });

    it("reports scenes with unknown actors, long captions and too few steps", () => {
      const path = makePath();
      const scene = path.scenes[0]!;
      scene.steps = [
        { from: "you", to: "ghost", message: "?", caption: "x".repeat(121) },
      ];

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" scene "journey" needs 3–12 steps (has 1).',
        'Path "web" scene "journey" step 1 uses unknown actor "ghost".',
        'Path "web" scene "journey" step 1 needs a caption of at most 120 characters.',
      ]);
    });

    it("reports a step id used twice", () => {
      const path = makePath();
      path.levels.intermediate.steps[0]!.id = "web-b-1";

      expect(validatePaths([path], glossary(), refs)).toContain(
        'Path "web" has step id "web-b-1" more than once.',
      );
    });
  });

  describe("levels", () => {
    it("reports a level with too few or too many steps", () => {
      const path = makePath();
      path.levels.basic.steps.splice(10, 1);
      path.levels.advanced = level("web-a", 13);

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" basic needs 12–20 steps (has 11).',
        'Path "web" advanced needs 6–12 steps (has 13).',
      ]);
    });

    it("reports a level that does not end with exactly one level check", () => {
      const path = makePath();
      path.levels.intermediate.steps.reverse();

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" intermediate must end with exactly one level check.',
      ]);
    });

    it("reports a missing outcome", () => {
      const path = makePath();
      path.levels.advanced.outcome = " ";

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" advanced needs an outcome.',
      ]);
    });

    it("reports three lesson steps in a row without a quick check", () => {
      const path = makePath();
      const explainOnly = (id: string) =>
        lesson(id, [{ type: "explain", text: "Hi." }]);
      path.levels.intermediate.steps.splice(
        1,
        3,
        explainOnly("web-i-2"),
        explainOnly("web-i-3"),
        explainOnly("web-i-4"),
      );

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" intermediate has three steps in a row without a quick check (up to "web-i-4").',
      ]);
    });

    it("reports level-check questions with unknown exercises, steps of another level, or the wrong count", () => {
      const path = makePath();
      const check = path.levels.advanced.steps.at(-1)!;
      if (check.kind !== "check") throw new Error("fixture");
      check.questions = [
        { exerciseId: "q1", stepId: "web-a-1" },
        { exerciseId: "nope", stepId: "web-a-2" },
        { exerciseId: "q3", stepId: "web-b-1" },
      ];

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" step "web-a-check" needs 4–8 questions (has 3).',
        'Path "web" step "web-a-check" asks unknown exercise "nope".',
        'Path "web" step "web-a-check" question "q3" must test a lesson step in advanced, not "web-b-1".',
      ]);
    });
  });

  describe("steps and blocks", () => {
    it("reports a bad id, a missing title and minutes that are not whole", () => {
      const path = makePath();
      // Step 6 is not tested by the level check, so renaming it breaks nothing else.
      Object.assign(path.levels.basic.steps[5]!, {
        id: "Step Six",
        title: " ",
        minutes: 2.5,
      });

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" step 6 "Step Six" needs an id of lowercase letters, numbers and single hyphens.',
        'Path "web" step 6 "Step Six" needs a title.',
        'Path "web" step 6 "Step Six" needs a whole number of minutes.',
      ]);
    });

    it("reports a lesson with no blocks or more than four", () => {
      const five = Array.from({ length: 4 }, quickCheck);
      expect(validatePaths([withStep2([])], glossary(), refs)).toContain(
        `${step2} needs 1–4 blocks (has 0).`,
      );
      expect(
        validatePaths([withStep2([...five, quickCheck()])], glossary(), refs),
      ).toEqual([`${step2} needs 1–4 blocks (has 5).`]);
    });

    it("counts the text a learner reads, so link markup does not count", () => {
      const ok = `[[client|${"x".repeat(5)}]]${"y".repeat(395)}`;
      expect(
        validatePaths(
          [withStep2([{ type: "explain", text: ok }, quickCheck()])],
          glossary(),
          refs,
        ),
      ).toEqual([]);

      const long = "y".repeat(401);
      expect(
        validatePaths(
          [withStep2([{ type: "explain", text: long }, quickCheck()])],
          glossary(),
          refs,
        ),
      ).toEqual([`${step2} explain needs 1–400 characters (has 401).`]);
    });

    it("reports a long analogy and more than one analogy", () => {
      const blocks: Block[] = [
        { type: "analogy", text: "x".repeat(201) },
        { type: "analogy", text: "Like a kitchen." },
        quickCheck(),
      ];

      expect(validatePaths([withStep2(blocks)], glossary(), refs)).toEqual([
        `${step2} has more than one analogy.`,
        `${step2} analogy needs 1–200 characters (has 201).`,
      ]);
    });

    it("reports key points that are too few or too long, and diagrams with too few nodes", () => {
      const blocks: Block[] = [
        { type: "keyPoints", items: ["One.", "x".repeat(91)] },
        { type: "diagram", nodes: [{ label: "Alone" }] },
        quickCheck(),
      ];

      expect(validatePaths([withStep2(blocks)], glossary(), refs)).toEqual([
        `${step2} keyPoints needs 3–5 items.`,
        `${step2} key point 2 needs 1–90 characters (has 91).`,
        `${step2} diagram needs 2–6 nodes.`,
      ]);
    });

    it("reports an unknown scene and code that is too long or annotated outside its lines", () => {
      const code = Array.from({ length: 16 }, (_, i) => `line ${i + 1}`).join(
        "\n",
      );
      const blocks: Block[] = [
        { type: "scene", sceneId: "missing" },
        {
          type: "code",
          example: { language: "http", code },
          notes: [{ line: 17, text: "?" }],
        },
        quickCheck(),
      ];

      expect(validatePaths([withStep2(blocks)], glossary(), refs)).toEqual([
        `${step2} shows unknown scene "missing".`,
        `${step2} code has 16 lines; keep it to 15.`,
        `${step2} code has a note on line 17, which doesn't exist.`,
      ]);
    });

    it("reports quick checks with a wrong answer id, repeated choices or no explanation", () => {
      const blocks: Block[] = [
        { ...quickCheck(), correctChoiceId: "z", explanation: "" } as Block,
        {
          ...quickCheck(),
          choices: [
            { id: "a", text: "A" },
            { id: "a", text: "Again" },
          ],
        } as Block,
      ];

      expect(validatePaths([withStep2(blocks)], glossary(), refs)).toEqual([
        `${step2} quick check's correct choice "z" is not one of its choices.`,
        `${step2} quick check needs a question and an explanation.`,
        `${step2} quick check has choice "a" twice.`,
      ]);
    });

    it("reports Notes App blocks that link nothing or something unknown", () => {
      const blocks: Block[] = [
        { type: "inTheNotesApp", text: "Here." },
        {
          type: "inTheNotesApp",
          text: "There.",
          fileId: "frontend/src/App.jsx",
          symbolId: "fn:nope",
          flowId: "create-note",
        },
        quickCheck(),
      ];

      expect(validatePaths([withStep2(blocks)], glossary(), refs)).toEqual([
        `${step2} inTheNotesApp must link a file, a symbol or a flow.`,
        `${step2} inTheNotesApp links unknown symbol "fn:nope".`,
      ]);
    });

    it("reports a level check with more than one introduction block", () => {
      const path = makePath();
      path.levels.basic.steps.at(-1)!.blocks = [
        { type: "explain", text: "Ready?" },
        { type: "explain", text: "Go." },
      ];

      expect(validatePaths([path], glossary(), refs)).toEqual([
        'Path "web" step 12 "web-b-check" is a level check; it may have one introduction block at most.',
      ]);
    });
  });

  describe("glossary", () => {
    it("reports a link to an unknown entry, in a step or in an entry's body", () => {
      const entries = glossary();
      entries[0]!.body = "It asks a [[waiter]].";
      const blocks: Block[] = [
        { type: "explain", text: "A [[kitchen]]." },
        quickCheck(),
      ];

      expect(validatePaths([withStep2(blocks)], entries, refs)).toEqual([
        'Glossary entry "client" links unknown glossary entry "waiter".',
        `${step2} links unknown glossary entry "kitchen".`,
      ]);
    });

    it("reports duplicate ids, bad ids, unknown topics and concept pages, and sizes", () => {
      const entries = [
        ...glossary(),
        {
          id: "client",
          topicId: "web",
          term: "Again",
          kind: "term",
          short: "S.",
          body: "B.",
        },
        {
          id: "Bad Id",
          topicId: "mars",
          term: " ",
          kind: "concept",
          short: "x".repeat(161),
          body: "",
          analogy: "x".repeat(201),
          conceptPageId: "nope",
        },
      ] satisfies GlossaryEntry[];

      expect(validatePaths([], entries, refs)).toEqual([
        'Glossary entry "client" is defined more than once.',
        'Glossary entry "Bad Id" needs an id of lowercase letters, numbers and single hyphens.',
        'Glossary entry "Bad Id" belongs to unknown topic "mars".',
        'Glossary entry "Bad Id" needs a term.',
        'Glossary entry "Bad Id" "short" needs 1–160 characters (has 161).',
        'Glossary entry "Bad Id" "body" needs 1–600 characters (has 0).',
        'Glossary entry "Bad Id" "analogy" needs 1–200 characters (has 201).',
        'Glossary entry "Bad Id" points at unknown concept page "nope".',
      ]);
    });

    it("requires exactly one entry per concept page, in the concept's topic", () => {
      const twoConcepts = {
        ...refs,
        concepts: new Map([
          ["dns-concept", "web"],
          ["tags-concept", "html"],
        ]),
      };
      expect(validatePaths([makePath()], glossary(), twoConcepts)).toEqual([
        'Concept "tags-concept" has no glossary entry; add one with conceptPageId "tags-concept".',
      ]);

      const entries = glossary();
      entries[0]!.conceptPageId = "dns-concept";
      entries[1]!.topicId = "html";
      expect(validatePaths([], entries, refs)).toEqual([
        'Glossary entry "server" belongs to "html", but its concept page "dns-concept" is in "web".',
        'Concept "dns-concept" has 2 glossary entries; keep one.',
      ]);
    });

    it("doesn't require concept entries while the glossary is empty", () => {
      expect(validatePaths([], [], refs)).toEqual([]);
    });

    it("requires every entry of a topic with a path to be introduced by one of its steps", () => {
      const entries = [
        ...glossary(),
        {
          id: "dns",
          topicId: "web",
          term: "DNS",
          kind: "term",
          short: "S.",
          body: "B.",
        },
        // Its topic has no path yet, so it can't be introduced (concepts before #387).
        {
          id: "tag",
          topicId: "html",
          term: "Tag",
          kind: "term",
          short: "S.",
          body: "B.",
        },
      ] satisfies GlossaryEntry[];

      expect(validatePaths([makePath()], entries, refs)).toEqual([
        'Glossary entry "dns" is not linked by any step of "web".',
      ]);
    });

    it("reports a word linked in a topic before its own topic teaches it", () => {
      const css: GlossaryEntry = {
        id: "selector",
        topicId: "css",
        term: "Selector",
        kind: "term",
        short: "S.",
        body: "B.",
      };
      const web = makePath("web", [
        { type: "explain", text: "[[client]] [[server]] [[selector]]" },
        quickCheck(),
      ]);
      const cssPath = makePath("css", [
        { type: "explain", text: "A [[selector]]." },
        quickCheck(),
      ]);

      expect(validatePaths([web, cssPath], [...glossary(), css], refs)).toEqual(
        [
          'Glossary entry "selector" is linked in "web" step 1, before its topic "css" teaches it.',
        ],
      );
    });

    it("reports a word linked at a lower level than the one that teaches it", () => {
      const web = makePath();
      // "latency" is taught in Intermediate…
      web.levels.intermediate.steps[0] = lesson("web-i-1", [
        { type: "explain", text: "[[latency]]" },
        quickCheck(),
      ]);
      // …but a later topic's Basic step leans on it.
      const html = makePath("html", [
        { type: "explain", text: "Fast pages cut [[latency]]." },
        quickCheck(),
      ]);
      const latency: GlossaryEntry = {
        id: "latency",
        topicId: "web",
        term: "Latency",
        kind: "concept",
        short: "S.",
        body: "B.",
      };

      expect(
        validatePaths([web, html], [...glossary(), latency], refs),
      ).toEqual([
        'Glossary entry "latency" is linked in basic step 1 of "html", but only taught in intermediate (step 13 of "web").',
      ]);
    });
  });
});
