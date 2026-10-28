import type { LevelPlan } from "@fsl/shared";
import {
  code,
  explain,
  inTheNotesApp,
  jsPlayground,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
} from "../blocks.js";
import { arraysModule } from "./arrays.js";
import { decisionsModule } from "./decisions.js";
import { domModule } from "./dom.js";
import { functionsModule } from "./functions.js";
import { gettingStartedModule } from "./getting-started.js";
import { loopsModule } from "./loops.js";
import { objectsModule } from "./objects.js";
import { textAndNumbersModule } from "./text-and-numbers.js";
import { variablesModule } from "./variables.js";

// Basic: steps 1–13. Values, variables, conditions, loops, functions,
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
    lesson(
      "events",
      "Reacting to the user: events",
      3,
      explain(
        "When something happens, like a click, the browser sends an [[js-event|event]]. An [[js-event-listener|event listener]] is a function you ask it to run each time.",
      ),
      code(
        "js",
        "count the clicks",
        [
          'const button = document.querySelector("button");',
          "let clicks = 0;",
          'button.addEventListener("click", () => {',
          "  clicks++;",
          "  button.textContent = `Clicked ${clicks} times`;",
          "});",
        ],
        { 3: "the event type and the function to run", 5: "update the page" },
      ),
      quickCheck(
        'In `addEventListener("click", save)`, when does `save` run?',
        [
          "Straight away",
          "Every time the element is clicked",
          "Once, on the first click",
        ],
        1,
        "The browser calls the listener on every click; you pass the function, not its result.",
      ),
    ),
    lesson(
      "form-events",
      "Forms and the event object",
      3,
      explain(
        "The listener receives an event object with details. For a form's `submit` event, `event.preventDefault()` stops the page reloading so your code can send the data itself.",
      ),
      inTheNotesApp(
        "The Notes App's `handleSave` starts with `event.preventDefault()`, then sends the note to the API.",
        { symbolId: "fn:handleSave" },
      ),
      quickCheck(
        "What does `event.preventDefault()` do on a form's submit?",
        [
          "Stops the browser's normal reload, so your code handles it",
          "Deletes the form",
          "Clears the fields",
        ],
        0,
        "The browser's default for submit is to send the form and reload; preventing it hands control to your code.",
      ),
    ),
    lesson(
      "callbacks",
      "Callbacks: functions you pass on",
      3,
      explain(
        "A [[callback]] is a function you hand to other code to call later: an event listener, the function in `map`, or a timer.",
      ),
      jsPlayground("Code that runs later", [
        'console.log("1. Start");',
        "setTimeout(() => {",
        '  console.log("3. One second later");',
        "}, 1000);",
        'console.log("2. Carry on straight away");',
      ]),
      keyPoints(
        "Pass the function itself: `save`, not `save()`.",
        "The other code decides when to call it.",
        "This is how JavaScript waits without stopping.",
      ),
    ),
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
