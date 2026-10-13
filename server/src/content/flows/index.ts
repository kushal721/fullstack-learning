import type { Flow } from "@fsl/shared";
import { createNoteFlow } from "./create-note.js";
import { listNotesFlow } from "./list-notes.js";
import { loginFlow } from "./login.js";
import { registerFlow } from "./register.js";

// Every flow, one file each in this folder. `npm run validate` checks that
// each step's symbol and relationship exist.
export const flows: Flow[] = [
  createNoteFlow,
  listNotesFlow,
  registerFlow,
  loginFlow,
];
