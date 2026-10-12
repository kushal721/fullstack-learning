import type { Flow } from "@fsl/shared";
import { createNoteFlow } from "./create-note.js";

// Every flow, one file each in this folder. `npm run validate` checks that
// each step's symbol and relationship exist.
export const flows: Flow[] = [createNoteFlow];
