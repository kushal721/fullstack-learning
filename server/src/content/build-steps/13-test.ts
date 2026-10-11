import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const testStep: BuildStep = {
  id: "test",
  slug: "test",
  order: 13,
  title: "Test the app",
  goal: "Add unit, integration and component tests.",
  why: "Tests check automatically that everything still works after each change, instead of clicking through the app by hand.",
  problemSolved: "Breaking something without noticing until a user does.",
  prerequisites: ["add-security"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "backend/src/validation/noteValidation.test.js",
    "backend/src/routes/notes.test.js",
    "frontend/src/components/NoteForm.test.jsx",
    "frontend/src/test-setup.js",
  ],
  filesModified: [
    "backend/package.json",
    "backend/package-lock.json",
    "frontend/package.json",
    "frontend/package-lock.json",
    "frontend/vite.config.js",
  ],
  filesRemoved: [],
  conceptIds: ["why-test", "unit-test", "integration-test"],
  codeExamples: [],
  relationshipIds: [],
  enables: "Change code with confidence because the tests tell you what broke.",
  commonMistakes: [],
  nextStepId: "deploy",
  nextWhy:
    "Everything works on your computer; the last step puts it on the internet.",
};
