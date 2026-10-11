import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const understandTheApplicationStep: BuildStep = {
  id: "understand-the-application",
  slug: "understand-the-application",
  order: 1,
  title: "Understand the application",
  goal: "Decide what the Notes App does and how its parts fit together before writing any code.",
  why: "Building without a plan leads to files and code that don't fit together. Knowing the goal first tells you which files you will need and why.",
  problemSolved:
    "Starting to code without knowing what the finished app should do or how the frontend, backend and database relate.",
  prerequisites: [],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [],
  filesModified: [],
  filesRemoved: [],
  conceptIds: ["how-the-web-works"],
  codeExamples: [],
  relationshipIds: [],
  enables:
    "Describe the Notes App's features and its three parts: frontend, backend and database.",
  commonMistakes: [],
  nextStepId: "create-project",
  nextWhy:
    "With a clear picture of the app, the next step creates the empty project the frontend will live in.",
};
