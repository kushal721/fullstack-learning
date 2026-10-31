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
import { asyncModule } from "./async.js";
import { jsonAndDataModule } from "./json-and-data.js";

// Intermediate: steps 12–20. Data as JSON, waiting with promises and
// async/await, fetching from an API, handling errors, modules, and the
// modern syntax the Notes App's code uses.
export const intermediate: LevelPlan = {
  outcome:
    "Load data from an API, handle what goes wrong, and read modern JavaScript like the Notes App's.",
  steps: [
    jsonAndDataModule,
    asyncModule,
    lesson(
      "errors",
      "Handling errors: try and catch",
      3,
      explain(
        "Code that might fail goes in `try`; if it throws, `catch` gets the error instead of the program stopping. `finally` runs either way. See [[js-error-handling|error handling]].",
      ),
      jsPlayground("Catch the error", [
        "function parse(text) {",
        "  try {",
        "    return JSON.parse(text);",
        "  } catch (error) {",
        '    console.log("Not JSON:", error.message);',
        "    return null;",
        "  } finally {",
        '    console.log("Tried:", text);',
        "  }",
        "}",
        "console.log(parse('{\"a\":1}'));",
        'console.log(parse("oops"));',
      ]),
      inTheNotesApp(
        "`handleSave` wraps the save in try/catch/finally: show the error if it fails, and always turn off the saving state.",
        { symbolId: "fn:handleSave" },
      ),
    ),
    lesson(
      "modules",
      "Modules: import and export",
      3,
      explain(
        "Each file is a [[js-module-import-export|module]]. It `export`s what others may use and `import`s what it needs, so code is split into small files with clear jobs.",
      ),
      code(
        "js",
        "two files",
        [
          "// notesApi.js",
          "export function getNotes() {",
          '  return request("/api/notes");',
          "}",
          "",
          "// NotesPage.jsx",
          'import { getNotes } from "./notesApi.js";',
        ],
        { 2: "shared with other files", 7: "use it here" },
      ),
      inTheNotesApp(
        "`notesApi.js` exports one small function per API call, each built on `request()`.",
        { fileId: "frontend/src/services/notesApi.js" },
      ),
      quickCheck(
        "A function isn't exported. Can another file import it?",
        [
          "Yes",
          "No, it stays private to its file",
          "Only with a default import",
        ],
        1,
        "Only what a module exports is visible from outside.",
      ),
    ),
    lesson(
      "destructuring",
      "Destructuring: unpacking values",
      3,
      explain(
        "[[destructuring|Destructuring]] pulls values out of an object or array into variables in one line. You'll see it everywhere in React code.",
      ),
      jsPlayground("Unpack an object and an array", [
        'const note = { id: 7, title: "Milk", content: "2 litres" };',
        "const { title, content } = note;",
        "console.log(title, content);",
        "",
        'const [first, second] = ["a", "b", "c"];',
        "console.log(first, second);",
        "",
        "function show({ title }) {",
        '  console.log("Title:", title);',
        "}",
        "show(note);",
      ]),
      quickCheck(
        "What does `const { id } = note;` do?",
        [
          "Makes a variable `id` holding `note.id`",
          "Deletes `note.id`",
          "Makes a new object",
        ],
        0,
        "It's a short way of writing `const id = note.id;`.",
      ),
    ),
    lesson(
      "spread",
      "Spread and rest: ...",
      3,
      explain(
        "The three dots of [[spread]] copy everything out of an array or object, often to make a changed copy without touching the original.",
      ),
      jsPlayground("Copy with a change", [
        'const note = { title: "Milk", done: false };',
        "const doneNote = { ...note, done: true };",
        "console.log(note.done, doneNote.done);",
        "",
        'const notes = ["Milk", "Bread"];',
        'const more = [...notes, "Eggs"];',
        "console.log(notes.length, more);",
        "",
        "const sum = (...nums) => nums.reduce((a, b) => a + b, 0);",
        "console.log(sum(1, 2, 3));",
      ]),
      keyPoints(
        "`{ ...obj, key: value }`: a copy with one change.",
        "`[...arr, item]`: a copy with an item added.",
        "`(...args)` in a function: the rest of the arguments, as an array.",
      ),
    ),
    lesson(
      "optional-chaining",
      "Missing values: ?. and ??",
      3,
      explain(
        "Reading a property of `undefined` throws. [[optional-chaining|Optional chaining]] `?.` stops and gives `undefined` instead; `??` supplies a fallback for `null` or `undefined`.",
      ),
      jsPlayground("Safe reading", [
        'const user = { name: "Sam" };',
        "console.log(user.address?.city);",
        'console.log(user.address?.city ?? "No city yet");',
        "",
        "const count = 0;",
        'console.log(count || "none", count ?? "none");',
      ]),
      inTheNotesApp(
        '`request()` uses both: `data?.error ?? "Something went wrong"` copes with a reply that has no body.',
        { fileId: "frontend/src/services/request.js" },
      ),
      quickCheck(
        "`0 ?? 5` gives…",
        ["`5`", "`0`", "An error"],
        1,
        '`??` only replaces `null` and `undefined`; `||` would also replace `0` and `""`.',
      ),
    ),
    lesson(
      "reading-the-notes-api",
      "Reading the Notes App's API code",
      4,
      explain(
        "You can now read every line of the Notes App's request code. Step through it with what you know: [[js-async-await|async/await]], [[js-fetch|fetch]], [[json]] and [[optional-chaining]].",
      ),
      code(
        "js",
        "request.js, shortened",
        [
          'export async function request(path, { method = "GET", body } = {}) {',
          "  const response = await fetch(path, {",
          "    method,",
          '    credentials: "include",',
          "    body: body ? JSON.stringify(body) : undefined,",
          "  });",
          "  if (response.status === 204) return null;",
          "  const data = await response.json().catch(() => null);",
          '  if (!response.ok) throw new Error(data?.error ?? "Something went wrong");',
          "  return data;",
          "}",
        ],
        {
          1: "export, async, destructuring with defaults",
          4: "send the login cookie",
          5: "the body as JSON text",
          8: "no JSON? use null",
          9: "turn a failed status into an error",
        },
      ),
      quickCheck(
        "Why does `request()` throw when `response.ok` is false?",
        [
          "So callers can use try/catch for every failure",
          "Because fetch requires it",
          "To retry the request",
        ],
        0,
        "Network failures already throw; throwing on bad statuses too means one `catch` handles both.",
      ),
    ),
    levelCheck("intermediate-check", "Intermediate check", [
      ["js-intermediate-json", "json"],
      ["js-intermediate-async", "async"],
      ["js-intermediate-fetch-ok", "async"],
      ["js-intermediate-spread", "spread"],
      ["js-intermediate-nullish", "optional-chaining"],
    ]),
  ],
};
