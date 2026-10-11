import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const createApiRoutesStep: BuildStep = {
  id: "create-api-routes",
  slug: "create-api-routes",
  order: 9,
  title: "Create the API routes",
  goal: "Add the notes routes, the controller and input validation.",
  why: "Routes decide which URL runs which code, controllers decide what that code does, and validation keeps bad input out.",
  problemSolved: "A server that cannot create, read, update or delete notes.",
  prerequisites: ["create-backend"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "backend/src/routes/notes.js",
    "backend/src/controllers/notesController.js",
    "backend/src/validation/noteValidation.js",
  ],
  filesModified: ["backend/src/app.js"],
  filesRemoved: [],
  conceptIds: [
    "express-route",
    "controller",
    "rest-endpoint",
    "request-body",
    "http-status-codes",
  ],
  codeExamples: [],
  relationshipIds: [],
  enables: "Create, read, update and delete notes through the API.",
  commonMistakes: [],
  nextStepId: "add-database",
  nextWhy:
    "The notes are kept in memory and lost when the server restarts; next we add a database.",
};
