import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const deployStep: BuildStep = {
  id: "deploy",
  slug: "deploy",
  order: 14,
  title: "Deploy",
  goal: "Build the app for production and run it on a server people can visit.",
  why: "An app is only useful when others can use it. Deployment turns the project on your laptop into a live website.",
  problemSolved: "An app that only runs on your own computer.",
  prerequisites: ["test"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: ["backend/Dockerfile", "backend/.dockerignore"],
  filesModified: [],
  filesRemoved: [],
  conceptIds: [
    "production-build",
    "dockerfile",
    "docker-image-container",
    "environment-config",
    "hosting",
    "deploying-a-full-stack-app",
  ],
  codeExamples: [],
  relationshipIds: [],
  enables: "Visit your Notes App on the internet.",
  commonMistakes: [],
};
