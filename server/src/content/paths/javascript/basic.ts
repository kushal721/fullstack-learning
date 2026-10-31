import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { arraysModule } from "./arrays.js";
import { decisionsModule } from "./decisions.js";
import { domModule } from "./dom.js";
import { eventsModule } from "./events.js";
import { functionsModule } from "./functions.js";
import { gettingStartedModule } from "./getting-started.js";
import { loopsModule } from "./loops.js";
import { objectsModule } from "./objects.js";
import { textAndNumbersModule } from "./text-and-numbers.js";
import { variablesModule } from "./variables.js";

// Basic: steps 1–11. Values, variables, conditions, loops, functions,
// arrays and objects, then the page: finding elements, changing them and
// reacting to events. Most steps have code you can run.
export const basic: LevelPlan = {
  outcome:
    "Write small programs: store values, make decisions, repeat work, write functions and react to clicks.",
  steps: [
    gettingStartedModule,
    variablesModule,
    textAndNumbersModule,
    decisionsModule,
    loopsModule,
    functionsModule,
    arraysModule,
    objectsModule,
    domModule,
    eventsModule,
    levelCheck("basic-check", "Basic check", [
      ["js-basic-const", "variables"],
      ["js-basic-plus", "text-and-numbers"],
      ["js-basic-equals", "decisions"],
      ["js-basic-return", "functions"],
      ["js-basic-filter", "arrays"],
      ["js-basic-listener", "events"],
    ]),
  ],
};
