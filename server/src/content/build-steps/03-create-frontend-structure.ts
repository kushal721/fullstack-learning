import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const createFrontendStructureStep: BuildStep = {
  id: "create-frontend-structure",
  slug: "create-frontend-structure",
  order: 3,
  title: "Create the frontend structure",
  goal: "Organise the frontend into components, pages and services, starting with the Navbar.",
  why: "Folders with a clear job make the code easy to find. A layout component like the Navbar shows how a page is built from parts.",
  problemSolved:
    "Everything in one file becomes impossible to read as the app grows.",
  prerequisites: ["create-project"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: ["frontend/src/components/Navbar.jsx"],
  filesModified: ["frontend/src/App.jsx", "frontend/src/index.css"],
  filesRemoved: [],
  conceptIds: ["react-component", "html-semantic-structure"],
  codeExamples: [],
  relationshipIds: [],
  enables:
    "Split the interface into components inside a clear folder structure.",
  commonMistakes: [],
  nextStepId: "create-first-component",
  nextWhy:
    "With a place for components, we build the first real one: the card that shows a note.",
};
