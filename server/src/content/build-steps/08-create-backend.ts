import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const createBackendStep: BuildStep = {
  id: "create-backend",
  slug: "create-backend",
  order: 8,
  title: "Create the backend",
  goal: "Create the Express server that will answer the frontend's requests.",
  why: "The browser can't be trusted with the rules and the data. A backend program on a server is where they live.",
  problemSolved:
    "Having no program to receive requests, check them and store data.",
  prerequisites: ["add-api-communication"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "backend/package.json",
    "backend/package-lock.json",
    "backend/src/server.js",
    "backend/src/app.js",
    "backend/.env.example",
  ],
  filesModified: [],
  filesRemoved: [],
  conceptIds: ["nodejs", "express", "npm-packages", "environment-variables"],
  codeExamples: [],
  relationshipIds: [],
  enables: "Run an API server that answers http://localhost:3000/api/health.",
  commonMistakes: [],
  nextStepId: "create-api-routes",
  nextWhy:
    "The server runs but has no notes endpoints; next we add the API routes.",
};
