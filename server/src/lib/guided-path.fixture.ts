import type {
  Block,
  GlossaryEntry,
  LevelPlan,
  Step,
  TopicPath,
} from "@fsl/shared";

// A small but valid guided path for "How the Web Works", for API tests
// until the real one exists (#387). Tests swap it in with vi.mock, and a
// test checks that `npm run validate` accepts it.

/** A term only this fixture uses, so search and the glossary have one. */
export const fixtureTerm: GlossaryEntry = {
  id: "ip-address",
  topicId: "how-the-web-works",
  term: "IP address",
  aliases: ["ip"],
  kind: "term",
  short: "A computer's number on the internet, like 76.76.21.21.",
  body: "Computers find each other by number. See [[how-the-web-works]].",
};

const quickCheck = (): Block => ({
  type: "check",
  question: "What does the browser need to reach a server?",
  choices: [
    { id: "name", text: "Only its name" },
    { id: "number", text: "Its [[ip-address|IP address]]" },
  ],
  correctChoiceId: "number",
  explanation: "Names are for people; computers connect by number.",
});

const lesson = (id: string, blocks?: Block[]): Step => ({
  kind: "lesson",
  id,
  title: `Lesson ${id}`,
  minutes: 3,
  blocks: blocks ?? [{ type: "explain", text: `About ${id}.` }, quickCheck()],
});

function level(prefix: string, size: number, first?: Block[]): LevelPlan {
  const lessons = Array.from({ length: size - 1 }, (_, i) =>
    lesson(`${prefix}-${i + 1}`, i === 0 ? first : undefined),
  );
  const questions = [
    "predict-blank-title",
    "predict-click-save",
    "predict-read-cookie",
    "predict-unknown-email",
  ].map((exerciseId, i) => ({ exerciseId, stepId: lessons[i]!.id }));
  return {
    outcome: `You can explain ${prefix}.`,
    steps: [
      ...lessons,
      {
        kind: "check",
        id: `${prefix}-check`,
        title: `${prefix} check`,
        minutes: 5,
        blocks: [],
        questions,
      },
    ],
  };
}

export const fixturePath: TopicPath = {
  topicId: "how-the-web-works",
  summary: {
    what: "Computers sending each other messages.",
    does: "Lets anyone open a page by name.",
    how: "DNS finds the server, HTTP asks it, the browser builds the page.",
  },
  overviewSceneId: "journey",
  scenes: [
    {
      id: "journey",
      title: "Opening a website",
      actors: [
        { id: "browser", label: "Browser" },
        { id: "server", label: "Server" },
      ],
      steps: [
        { from: "browser", to: "server", message: "GET /", caption: "Ask." },
        { from: "server", to: "browser", message: "200", caption: "Answer." },
        { from: "browser", to: "browser", message: "page", caption: "Draw." },
      ],
    },
    {
      id: "unused",
      title: "Not shown by any step",
      actors: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      steps: [
        { from: "a", to: "b", message: "1", caption: "One." },
        { from: "b", to: "a", message: "2", caption: "Two." },
        { from: "a", to: "b", message: "3", caption: "Three." },
      ],
    },
  ],
  levels: {
    basic: level("basic", 12, [
      {
        type: "explain",
        text: "This is [[how-the-web-works|how the web works]]: every computer has an [[ip-address]].",
      },
      { type: "scene", sceneId: "journey" },
      quickCheck(),
    ]),
    intermediate: level("intermediate", 8),
    advanced: level("advanced", 6),
  },
};
