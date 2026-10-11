import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const createPageStep: BuildStep = {
  id: "create-page",
  slug: "create-page",
  order: 5,
  title: "Create a page",
  goal: "Build the Dashboard page that shows a list of NoteCards.",
  why: "A page combines components into a screen. Rendering a list teaches how React shows many items from an array.",
  problemSolved:
    "Showing a changing number of notes without writing each one by hand.",
  prerequisites: ["create-first-component"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: ["frontend/src/pages/Dashboard.jsx"],
  filesModified: ["frontend/src/App.jsx"],
  filesRemoved: [],
  conceptIds: ["react-component-communication", "react-lists-keys"],
  codeExamples: [],
  relationshipIds: [],
  enables: "Show a whole page of notes from an array.",
  commonMistakes: [],
  nextStepId: "add-state",
  nextWhy:
    "The notes are still fixed in the code; next we let the user add notes with state.",
};
