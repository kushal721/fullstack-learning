import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { componentsAndJsxModule } from "./components-and-jsx.js";
import { eventsModule } from "./events.js";
import { listsAndKeysModule } from "./lists-and-keys.js";
import { propsModule } from "./props.js";
import { stateModule } from "./state.js";
import { whyReactModule } from "./why-react.js";

// Basic: steps 1–7. From a first component to an interactive list:
// components, JSX, props, state, events and keys.
export const basic: LevelPlan = {
  outcome:
    "Build a screen from components that take props, keep state, respond to clicks and typing, and show lists.",
  steps: [
    whyReactModule,
    componentsAndJsxModule,
    propsModule,
    stateModule,
    eventsModule,
    listsAndKeysModule,
    levelCheck("basic-check", "Basic check", [
      ["react-basic-render", "why-react"],
      ["react-basic-zero", "components-and-jsx"],
      ["react-basic-default", "props"],
      ["react-basic-snapshot", "state"],
      ["react-basic-handler", "events"],
      ["react-basic-key", "lists-and-keys"],
    ]),
  ],
};
