import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const createFirstComponentStep: BuildStep = {
  id: "create-first-component",
  slug: "create-first-component",
  order: 4,
  title: "Create the first component",
  goal: "Build NoteCard to show one note, using a reusable Button.",
  why: "Components are the building blocks of a React app. Making Button reusable from the start avoids copying the same markup everywhere.",
  problemSolved: "Repeating the same HTML for every note and every button.",
  prerequisites: ["create-frontend-structure"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "frontend/src/components/Button.jsx",
    "frontend/src/components/NoteCard.jsx",
  ],
  filesModified: ["frontend/src/index.css"],
  filesRemoved: [],
  conceptIds: [
    "react-component",
    "jsx",
    "react-props",
    "react-reusable-component",
  ],
  codeExamples: [],
  relationshipIds: [],
  enables:
    "Show a note on the screen with a component that receives it as props.",
  commonMistakes: [],
  nextStepId: "create-page",
  nextWhy:
    "One card is not a page; next we build the Dashboard that shows a list of notes.",
};
