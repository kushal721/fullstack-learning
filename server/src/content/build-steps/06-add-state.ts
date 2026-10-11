import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const addStateStep: BuildStep = {
  id: "add-state",
  slug: "add-state",
  order: 6,
  title: "Add state",
  goal: "Keep the notes in state, add the NoteForm, and move the logic into a useNotes custom hook.",
  why: "The screen must change when the user adds a note. State is how React remembers data and updates the page; a custom hook keeps that logic reusable.",
  problemSolved: "A page that cannot change after it first appears.",
  prerequisites: ["create-page"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "frontend/src/hooks/useNotes.js",
    "frontend/src/components/NoteForm.jsx",
    "frontend/src/components/Input.jsx",
  ],
  filesModified: ["frontend/src/pages/Dashboard.jsx"],
  filesRemoved: [],
  conceptIds: [
    "react-state",
    "react-usestate",
    "react-controlled-form",
    "react-custom-hook",
    "react-how-hooks-work",
  ],
  codeExamples: [],
  relationshipIds: [],
  enables: "Add notes in the browser and see the list update.",
  commonMistakes: [],
  nextStepId: "add-api-communication",
  nextWhy:
    "Notes vanish on reload because they only live in the browser; next we prepare to send them to a server.",
};
