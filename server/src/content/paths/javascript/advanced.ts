import type { LevelPlan } from "@fsl/shared";
import {
  explain,
  jsPlayground,
  lesson,
  levelCheck,
  reference,
} from "../blocks.js";
import { closuresModule } from "./closures.js";
import { eventLoopModule } from "./event-loop.js";
import { referencesModule } from "./references.js";
import { thisAndClassesModule } from "./this-and-classes.js";
import { typescriptModule } from "./typescript.js";

// Advanced: steps 18–24. How JavaScript works underneath (closures, the
// event loop, `this`, references), classes, TypeScript, and debugging.
export const advanced: LevelPlan = {
  outcome:
    "Understand the behaviour behind surprising bugs, use TypeScript's types, and debug with confidence.",
  steps: [
    closuresModule,
    eventLoopModule,
    thisAndClassesModule,
    referencesModule,
    typescriptModule,
    lesson(
      "debugging",
      "Debugging",
      4,
      reference("Tools for finding bugs", [
        [
          "console.log()",
          "Print values at a point.",
          'console.log("note", note);',
        ],
        [
          "console.table()",
          "Show an array of objects as a table.",
          "console.table(notes);",
        ],
        ["debugger", "Pause here when DevTools is open.", "debugger;"],
        [
          "Breakpoints",
          "Click a line number in DevTools Sources to pause there.",
          "—",
        ],
        [
          "error.stack",
          "Where the error happened, call by call.",
          "console.log(error.stack);",
        ],
      ]),
      explain(
        "[[debugging|Debugging]] is narrowing down: read the error message and line, check your assumption with a log or breakpoint, change one thing, try again.",
      ),
      jsPlayground("Read the error, then fix it", [
        'const notes = [{ title: "Milk" }];',
        "const first = notes[1];",
        "console.log(first.title);",
        "// Hint: arrays count from 0.",
      ]),
    ),
    levelCheck("advanced-check", "Advanced check", [
      ["js-advanced-closure", "closures"],
      ["js-advanced-event-loop", "event-loop"],
      ["js-advanced-reference", "references"],
      ["js-advanced-optional-type", "typescript"],
    ]),
  ],
};
