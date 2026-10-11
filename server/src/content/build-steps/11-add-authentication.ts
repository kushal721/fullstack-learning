import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const addAuthenticationStep: BuildStep = {
  id: "add-authentication",
  slug: "add-authentication",
  order: 11,
  title: "Add authentication",
  goal: "Let users register and log in, with hashed passwords and a login cookie.",
  why: "Notes are private, so the app must know who is making each request.",
  problemSolved: "An app where anyone can read and change everyone's notes.",
  prerequisites: ["add-database"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "backend/src/routes/auth.js",
    "backend/src/controllers/authController.js",
    "backend/src/middleware/authMiddleware.js",
    "frontend/src/services/authApi.js",
    "frontend/src/pages/Login.jsx",
    "frontend/src/pages/Register.jsx",
  ],
  filesModified: [
    "backend/src/app.js",
    "backend/src/routes/notes.js",
    "backend/package.json",
    "backend/package-lock.json",
    "frontend/src/App.jsx",
    "frontend/src/components/Navbar.jsx",
  ],
  filesRemoved: [],
  conceptIds: ["express-middleware", "http-headers", "http-post"],
  codeExamples: [],
  relationshipIds: [],
  enables: "Register, log in and log out, and stay logged in across requests.",
  commonMistakes: [],
  nextStepId: "add-security",
  nextWhy:
    "Logging in is not enough on its own; next we make sure users can only touch their own notes.",
};
