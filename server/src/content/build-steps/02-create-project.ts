import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const createProjectStep: BuildStep = {
  id: "create-project",
  slug: "create-project",
  order: 2,
  title: "Create the project",
  goal: "Create the frontend project with Vite and see it running in the browser.",
  why: "Every app needs a project: a folder with its settings, packages and a way to run it. Vite gives a working React project in seconds.",
  problemSolved:
    "Setting up a modern React project by hand means configuring a build tool, a dev server and JSX compilation yourself.",
  prerequisites: ["understand-the-application"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/index.html",
    "frontend/vite.config.js",
    "frontend/src/main.jsx",
    "frontend/src/App.jsx",
    "frontend/src/index.css",
  ],
  filesModified: [],
  filesRemoved: [],
  conceptIds: ["vite", "npm-packages", "html-document"],
  codeExamples: [],
  relationshipIds: [],
  enables: "Run a React app locally at http://localhost:5173.",
  commonMistakes: [],
  nextStepId: "create-frontend-structure",
  nextWhy:
    "The project works but is one big App component; next we give the frontend a structure.",
};
