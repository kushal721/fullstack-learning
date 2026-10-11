import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const addSecurityStep: BuildStep = {
  id: "add-security",
  slug: "add-security",
  order: 12,
  title: "Add security",
  goal: "Make every notes query belong to the logged-in user, validate input and keep errors safe.",
  why: "Authentication says who you are; security makes sure that is all you can do. Most real attacks target exactly these gaps.",
  problemSolved:
    "Users reading or deleting other users' notes, and errors that leak internal details.",
  prerequisites: ["add-authentication"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [],
  filesModified: [
    "backend/src/controllers/notesController.js",
    "backend/src/validation/noteValidation.js",
    "backend/src/app.js",
  ],
  filesRemoved: [],
  conceptIds: [
    "parameterized-query",
    "sql-update-delete",
    "js-error-handling",
    "environment-config",
  ],
  codeExamples: [],
  relationshipIds: [],
  enables: "Trust that each user only ever sees and changes their own notes.",
  commonMistakes: [],
  nextStepId: "test",
  nextWhy: "The app works and is safe; next we add tests so it stays that way.",
};
