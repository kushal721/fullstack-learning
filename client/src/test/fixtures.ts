import type {
  ConceptResponse,
  FileTreeFolder,
  GlossaryEntryResponse,
  GlossaryIndexResponse,
  Level,
  PathResponse,
  StepResponse,
  StepSummary,
  TopicResponse,
  TopicTreeNode,
} from "@fsl/shared";

/** A small learning tree for tests (not the real content). */
export const topicTreeFixture: TopicTreeNode = {
  id: "root",
  slug: "root",
  order: 0,
  title: "Full-Stack Development",
  summary: "Everything needed to build a web application.",
  hasPath: false,
  children: [
    {
      id: "html",
      slug: "html",
      order: 1,
      title: "HTML",
      summary: "The structure of a web page.",
      hasPath: false,
      children: [],
    },
    {
      id: "react",
      slug: "react",
      order: 2,
      title: "React",
      summary: "Components that update when data changes.",
      hasPath: false,
      children: [
        {
          id: "hooks",
          slug: "hooks",
          order: 1,
          title: "Hooks",
          summary: "Remembering values between renders.",
          hasPath: false,
          children: [],
        },
      ],
    },
  ],
};

/** GET /api/topics/react for the fixture tree above. */
export const reactTopicFixture: TopicResponse = {
  topic: {
    id: "react",
    slug: "react",
    order: 2,
    title: "React",
    summary: "Components that update when data changes.",
    overview: [
      "React lets you describe the page for the current data.",
      "Call `setNotes` and React updates the screen.",
    ],
    children: [
      {
        id: "hooks",
        slug: "hooks",
        order: 1,
        title: "Hooks",
        summary: "Remembering values between renders.",
        overview: [],
        children: [],
        conceptIds: [],
        buildStepIds: [],
      },
    ],
    conceptIds: [],
    buildStepIds: [],
  },
  previous: {
    id: "html",
    slug: "html",
    order: 1,
    title: "HTML",
    summary: "The structure of a web page.",
  },
  concepts: [],
  buildSteps: [],
};

/** GET /api/concepts/react-usestate for tests (short texts, every section). */
export const useStateConceptFixture: ConceptResponse = {
  concept: {
    id: "react-usestate",
    slug: "react-usestate",
    title: "useState",
    topicId: "react",
    summary: "Remember a value between renders.",
    basics: ["A component is a function."],
    what: ["`useState` gives a component memory."],
    why: ["The screen must match the data."],
    howItWorks: ["Calling the setter re-renders."],
    basicExample: {
      language: "jsx",
      code: "const [count, setCount] = useState(0);",
      caption: "A counter.",
    },
    internals: ["React keeps state slots in call order."],
    howToCreate: [
      {
        text: "Create a Vite app.",
        code: { language: "bash", code: "npm create vite@latest" },
      },
      { text: "Open http://localhost:5173." },
    ],
    whereUsed: ["Form inputs."],
    connectsTo: ["Event handlers."],
    projectUsage: [{ explanation: "`useNotes` keeps the notes in state." }],
    commonMistakes: ["Changing state in place."],
    relatedConcepts: [],
    relatedFiles: [],
    relatedBuildSteps: [],
  },
  topic: {
    id: "react",
    slug: "react",
    order: 6,
    title: "React",
    summary: "Components.",
  },
  related: [
    {
      id: "html-button",
      slug: "html-button",
      title: "HTML <button>",
      topicId: "html",
      summary: "Trigger an action.",
    },
  ],
  usedIn: [
    {
      fileId: "frontend/src/hooks/useNotes.js",
      layer: "frontend",
      purpose: "Keeps the list of notes.",
      line: 6,
      explanation: "useNotes keeps the notes in state.",
    },
    {
      fileId: "frontend/src/components/NoteForm.jsx",
      layer: "frontend",
      purpose: "The form for a new note; reports it with `onSaved`.",
    },
  ],
  introducedIn: [
    {
      id: "add-state",
      slug: "add-state",
      order: 6,
      title: "Add state",
      goal: "Keep the notes in state.",
    },
  ],
};

/** GET /api/files for tests: a small example project. */
export const fileTreeFixture: FileTreeFolder = {
  type: "folder",
  name: "",
  path: "",
  children: [
    {
      type: "folder",
      name: "backend",
      path: "backend",
      children: [
        {
          type: "file",
          name: "server.js",
          path: "backend/server.js",
          layer: "backend",
          purpose: "Starts the `app`.",
        },
      ],
    },
    {
      type: "folder",
      name: "frontend",
      path: "frontend",
      children: [
        {
          type: "folder",
          name: "src",
          path: "frontend/src",
          children: [
            {
              type: "file",
              name: "App.jsx",
              path: "frontend/src/App.jsx",
              layer: "frontend",
              purpose: "The top component.",
            },
          ],
        },
        {
          type: "file",
          name: "index.html",
          path: "frontend/index.html",
          layer: "frontend",
          purpose: "The single HTML page.",
        },
      ],
    },
  ],
};

const steps = (level: Level, first: number, titles: string[]): StepSummary[] =>
  titles.map((title, i) => ({
    id: `${level}-${i + 1}`,
    number: first + i,
    level,
    kind: i === titles.length - 1 ? "check" : "lesson",
    title,
    minutes: 3,
  }));

/** GET /api/paths/html: a tiny guided path (3 + 2 + 2 steps) for tests. */
export const htmlPathFixture: PathResponse = {
  topic: {
    id: "html",
    slug: "html",
    order: 1,
    title: "HTML",
    summary: "The structure of a web page.",
  },
  summary: {
    what: "The language pages are written in.",
    does: "Gives a page its structure.",
    how: "Tags wrap content in elements.",
  },
  overviewScene: {
    id: "page",
    title: "From file to page",
    actors: [
      { id: "browser", label: "Browser" },
      { id: "server", label: "Server" },
    ],
    steps: [
      { from: "browser", to: "server", message: "GET /", caption: "Ask." },
      { from: "server", to: "browser", message: "HTML", caption: "Answer." },
      { from: "browser", to: "browser", message: "page", caption: "Draw." },
    ],
  },
  levels: [
    {
      level: "basic",
      outcome: "Write a simple page.",
      firstNumber: 1,
      lastNumber: 3,
      minutes: 9,
      steps: steps("basic", 1, ["Tags", "Links", "Basic check"]),
    },
    {
      level: "intermediate",
      outcome: "Build a form.",
      firstNumber: 4,
      lastNumber: 5,
      minutes: 6,
      steps: steps("intermediate", 4, ["Forms", "Intermediate check"]),
    },
    {
      level: "advanced",
      outcome: "Make it accessible.",
      firstNumber: 6,
      lastNumber: 7,
      minutes: 6,
      steps: steps("advanced", 6, ["ARIA", "Advanced check"]),
    },
  ],
};

const htmlLevels = htmlPathFixture.levels;
const htmlStep = (level: number, index: number) =>
  htmlLevels[level]!.steps[index]!;

/** GET /api/paths/html/steps/basic-1: one block of (almost) every type. */
export const htmlStep1Fixture: StepResponse = {
  topic: htmlPathFixture.topic,
  step: htmlStep(0, 0),
  blocks: [
    {
      type: "explain",
      text: "An [[html-element|element]] is **one tag** with `<p>` in it.",
    },
    { type: "analogy", text: "Like the walls of a house." },
    {
      type: "keyPoints",
      items: [
        "Tags open and close.",
        "Elements nest.",
        "[[html-document]]s hold them.",
      ],
    },
    {
      type: "diagram",
      nodes: [{ label: "Tag", sub: "<p>" }, { label: "Element" }],
    },
    {
      type: "code",
      example: {
        language: "html",
        code: "<p>Hi</p>\n<p>Bye</p>",
        caption: "two paragraphs",
      },
      notes: [{ line: 2, text: "a second element" }],
    },
    {
      type: "check",
      question: "Which one is an element?",
      choices: [
        { id: "tag", text: "`<p>` alone" },
        { id: "element", text: "`<p>Hi</p>`" },
      ],
    },
    {
      type: "inTheNotesApp",
      text: "The Notes App's page starts here.",
      fileId: "frontend/index.html",
    },
    { type: "scene", sceneId: "page" },
  ],
  scenes: { page: htmlPathFixture.overviewScene },
  glossary: [
    {
      id: "html-element",
      topicId: "html",
      term: "HTML element",
      kind: "concept",
      short: "One building block of a page.",
    },
    {
      id: "html-document",
      topicId: "html",
      term: "HTML document",
      kind: "term",
      short: "The whole file.",
    },
  ],
  next: htmlStep(0, 1),
};

/** GET /api/paths/html/steps/basic-2: the last lesson before the check. */
export const htmlStep2Fixture: StepResponse = {
  topic: htmlPathFixture.topic,
  step: htmlStep(0, 1),
  blocks: [{ type: "explain", text: "Links go places." }],
  scenes: {},
  glossary: [],
  previous: htmlStep(0, 0),
  next: htmlStep(0, 2),
};

const question = (id: string, prompt: string, stepIndex: number) => ({
  exercise: {
    mode: "predict" as const,
    id,
    title: prompt,
    prompt,
    conceptIds: [],
    hints: [],
    choices: [
      { id: "right", text: `Right answer to ${id}` },
      { id: "wrong", text: `Wrong answer to ${id}` },
    ],
  },
  step: htmlStep(0, stepIndex),
});

/** GET /api/paths/html/steps/basic-3: Basic's level check, the last step. */
export const htmlStep3Fixture: StepResponse = {
  topic: htmlPathFixture.topic,
  step: htmlStep(0, 2),
  blocks: [],
  scenes: {},
  glossary: [],
  questions: [
    question("q-tags", "What wraps content?", 0),
    question("q-links", "What makes a link?", 1),
    question("q-nest", "Can elements nest?", 0),
  ],
  previous: htmlStep(0, 1),
  next: htmlStep(1, 0),
};

/** GET /api/glossary: the panel's index (A to Z). */
export const glossaryIndexFixture: GlossaryIndexResponse = {
  entries: [
    {
      id: "html-document",
      topicId: "html",
      term: "HTML document",
      aliases: ["doctype"],
      kind: "term",
      short: "The whole file.",
    },
    {
      id: "html-element",
      topicId: "html",
      term: "HTML element",
      aliases: ["tag"],
      kind: "concept",
      short: "One building block of a page.",
    },
    {
      id: "json",
      topicId: "javascript",
      term: "JSON",
      kind: "concept",
      short: "A text format for data.",
    },
  ],
};

const htmlLink = (index: number) => ({
  ...htmlPathFixture.levels[0]!.steps[index]!,
  topic: htmlPathFixture.topic,
});

/** GET /api/glossary/html-element */
export const htmlElementEntryFixture: GlossaryEntryResponse = {
  entry: {
    id: "html-element",
    topicId: "html",
    term: "HTML element",
    aliases: ["tag"],
    kind: "concept",
    short: "One building block of a page.",
    body: "Elements live in an [[html-document]] and nest inside each other.",
    analogy: "A brick in a wall.",
    conceptPageId: "html-element",
  },
  introducedIn: htmlLink(0),
  usedIn: [htmlLink(0), htmlLink(1)],
  related: [glossaryIndexFixture.entries[0]!],
  conceptPage: {
    id: "html-element",
    slug: "html-element",
    title: "HTML element",
    topicId: "html",
    summary: "One building block.",
  },
};

/** GET /api/glossary/html-document */
export const htmlDocumentEntryFixture: GlossaryEntryResponse = {
  entry: {
    id: "html-document",
    topicId: "html",
    term: "HTML document",
    kind: "term",
    short: "The whole file.",
    body: "A document holds every [[html-element|element]] of a page.",
  },
  usedIn: [],
  related: [glossaryIndexFixture.entries[1]!],
};
