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
  reference,
} from "../blocks.js";
import { arraysModule } from "./arrays.js";
import { decisionsModule } from "./decisions.js";
import { functionsModule } from "./functions.js";
import { gettingStartedModule } from "./getting-started.js";
import { loopsModule } from "./loops.js";
import { textAndNumbersModule } from "./text-and-numbers.js";
import { variablesModule } from "./variables.js";

// Basic: steps 1–14. Values, variables, conditions, loops, functions,
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
    lesson(
      "objects",
      "Objects: named values",
      3,
      explain(
        'An object groups named values, called properties: `{ title: "Milk", done: false }`. Read and change them with a dot.',
      ),
      jsPlayground("Make and change an object", [
        "const note = {",
        '  title: "Milk",',
        "  done: false,",
        '  tags: ["shopping"],',
        "};",
        "note.done = true;",
        "console.log(note.title, note.done);",
        "console.log(note);",
      ]),
      quickCheck(
        "How do you read the `title` of `note`?",
        ["`note[title]`", "`note.title`", "`title.note`"],
        1,
        'Dot notation reads a property. `note["title"]` also works, with quotes.',
      ),
    ),
    lesson(
      "finding-elements",
      "Finding elements on the page",
      3,
      explain(
        "In the browser, JavaScript reaches the page through `document`. [[dom-query|Finding elements]] uses the same selectors as CSS.",
      ),
      reference("Finding elements", [
        [
          "querySelector()",
          "The first element matching a CSS selector.",
          'document.querySelector(".note")',
        ],
        [
          "querySelectorAll()",
          "All matches, as a list.",
          'document.querySelectorAll("li")',
        ],
        [
          "getElementById()",
          "The element with that id.",
          'document.getElementById("title")',
        ],
      ]),
      code(
        "js",
        "find a heading and read its text",
        [
          'const heading = document.querySelector("h1");',
          "console.log(heading.textContent);",
        ],
        { 1: "same selector as in CSS" },
      ),
    ),
    lesson(
      "changing-the-page",
      "Changing the page",
      3,
      reference("Changing elements", [
        [
          "textContent",
          "Read or replace the text.",
          'el.textContent = "Saved";',
        ],
        [
          "classList",
          "Add, remove or toggle classes.",
          'el.classList.add("done");',
        ],
        [
          "setAttribute()",
          "Set an attribute.",
          'img.setAttribute("alt", "A cat");',
        ],
        [
          "createElement()",
          "Make a new element.",
          'const li = document.createElement("li");',
        ],
        ["append()", "Put it inside another.", "list.append(li);"],
        ["remove()", "Take it off the page.", "el.remove();"],
      ]),
      code(
        "js",
        "add a note to a list",
        [
          'const list = document.querySelector("#notes");',
          'const item = document.createElement("li");',
          'item.textContent = "Buy milk";',
          "list.append(item);",
        ],
        { 2: "a new <li>, not on the page yet", 4: "now it appears" },
      ),
      quickCheck(
        "Why prefer `textContent` to `innerHTML` for text someone typed?",
        [
          "It's faster to type",
          "It never turns the text into HTML, so it can't run a hidden script",
          "It keeps the formatting",
        ],
        1,
        "[[dom-manipulation|`textContent`]] treats everything as plain text, which stops cross-site scripting.",
      ),
    ),
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
