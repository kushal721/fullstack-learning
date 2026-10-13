import type { FindExercise } from "@fsl/shared";

// Where is it? Pick the file or symbol in the project.
export const findExercises: FindExercise[] = [
  {
    id: "find-note-validation",
    mode: "find",
    title: "Where are notes checked?",
    prompt:
      "Which file defines the function that checks a note's title and content on the server before it is saved?",
    target: "file",
    acceptedIds: ["backend/src/validation/noteValidation.js"],
    conceptIds: ["input-validation"],
    buildStepId: "add-security",
    hints: [
      "It runs on the server, so it is somewhere under `backend/`.",
      "The controller calls it, but it lives in its own folder so it can be tested on its own.",
    ],
    explanation:
      "`validateNote` lives in `backend/src/validation/noteValidation.js`. Keeping it out of the controller means it has its own unit tests (`noteValidation.test.js`), and both `createNote` and `updateNote` can use the same rules.",
  },
];
