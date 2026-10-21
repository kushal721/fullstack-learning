import type {
  ConceptResponse,
  FileTreeFolder,
  Level,
  PathResponse,
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
