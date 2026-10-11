import type { BuildStep } from "@fsl/shared";

// Skeleton: goal, why, files and concepts. The full lesson (explanation,
// how to create it, from scratch, code, common mistakes) is written in M05.3.
export const addApiCommunicationStep: BuildStep = {
  id: "add-api-communication",
  slug: "add-api-communication",
  order: 7,
  title: "Add API communication",
  goal: "Send and load notes with fetch through notesApi.js.",
  why: "Data that should last must live on a server. Keeping all requests in one service file means components never deal with URLs.",
  problemSolved: "Components full of fetch calls, URLs and error handling.",
  prerequisites: ["add-state"],
  explanation: [],
  howToCreate: [],
  fromScratch: [],
  filesCreated: [
    "frontend/src/services/request.js",
    "frontend/src/services/notesApi.js",
  ],
  filesModified: [
    "frontend/src/hooks/useNotes.js",
    "frontend/src/components/NoteForm.jsx",
    "frontend/src/components/NoteCard.jsx",
  ],
  filesRemoved: [],
  conceptIds: [
    "js-fetch",
    "js-async-await",
    "json",
    "http-methods",
    "react-useeffect",
  ],
  codeExamples: [],
  relationshipIds: [],
  enables: "Talk to an API from the frontend and show its answers.",
  commonMistakes: [],
  nextStepId: "create-backend",
  nextWhy:
    "The frontend now calls /api/notes, but nothing answers yet; next we create the backend.",
};
