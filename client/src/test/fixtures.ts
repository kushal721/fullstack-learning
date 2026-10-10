import type {
  ConceptResponse,
  FileTreeFolder,
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
  children: [
    {
      id: "html",
      slug: "html",
      order: 1,
      title: "HTML",
      summary: "The structure of a web page.",
      children: [],
    },
    {
      id: "react",
      slug: "react",
      order: 2,
      title: "React",
      summary: "Components that update when data changes.",
      children: [
        {
          id: "hooks",
          slug: "hooks",
          order: 1,
          title: "Hooks",
          summary: "Remembering values between renders.",
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
