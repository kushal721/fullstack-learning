import type { Flow } from "@fsl/shared";

// Creating a note, from the Save click to the database and back. The steps
// are added in M07.1.2–M07.1.5 and the HTTP details in M07.1.6.
export const createNoteFlow: Flow = {
  id: "create-note",
  title: "Create a note",
  summary:
    "Follow a new note from the Save button, through the API and the database, and back onto the screen.",
  group: "request",
  direction: "round-trip",
  steps: [],
};
