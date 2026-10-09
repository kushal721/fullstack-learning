import type { Concept } from "@fsl/shared";
import { htmlButton } from "./html/html-button.js";
import { httpPost } from "./http/http-post.js";
import { reactUseState } from "./react/react-usestate.js";

// Every concept, one file each under concepts/<topic-id>/<concept-id>.ts.
// To add a concept: create its file, add it here, and add its id to the
// topic's `conceptIds` in learning-tree.ts. `npm run validate` checks both.
export const concepts: Concept[] = [htmlButton, reactUseState, httpPost];
