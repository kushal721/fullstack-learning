import type { LevelPlan } from "@fsl/shared";
import {
  code,
  diagram,
  explain,
  jsPlayground,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
  reference,
} from "../blocks.js";

// Advanced: steps 26–34. How JavaScript works underneath (closures, the
// event loop, `this`, references), classes, TypeScript, and debugging.
export const advanced: LevelPlan = {
  outcome:
    "Understand the behaviour behind surprising bugs, use TypeScript's types, and debug with confidence.",
  steps: [
    lesson(
      "closures",
      "Closures: functions that remember",
      4,
      explain(
        "A function keeps access to the variables around it when it was made, even after that outer code has finished. That's a [[closure]].",
      ),
      jsPlayground("A counter that remembers", [
        "function makeCounter() {",
        "  let count = 0;",
        "  return () => {",
        "    count++;",
        "    return count;",
        "  };",
        "}",
        "const next = makeCounter();",
        "console.log(next(), next(), next());",
        "const other = makeCounter();",
        "console.log(other());",
      ]),
      quickCheck(
        "Why does `other()` print 1?",
        [
          "Each call to `makeCounter` makes a new `count`",
          "Counters reset after three calls",
          "`count` is shared by every counter",
        ],
        0,
        "Each closure remembers its own copy of the variables from the call that made it ([[js-scope|scope]]).",
      ),
    ),
    lesson(
      "event-loop",
      "The event loop",
      4,
      explain(
        "JavaScript runs one thing at a time. Timers, clicks and network replies wait in queues; the [[event-loop|event loop]] runs the next one whenever the current code finishes. Promise callbacks jump ahead of timers.",
      ),
      diagram([
        ["Your code", "runs to the end"],
        ["Promise queue", ".then, await"],
        ["Task queue", "timers, clicks"],
      ]),
      jsPlayground("Guess the order, then run it", [
        'console.log("1");',
        'setTimeout(() => console.log("timer"), 0);',
        'Promise.resolve().then(() => console.log("promise"));',
        'console.log("2");',
      ]),
      quickCheck(
        "A loop runs for five seconds. What happens to clicks meanwhile?",
        [
          "They're handled at once",
          "They wait until the loop finishes: the page feels frozen",
          "They're lost",
        ],
        1,
        "Nothing else runs until the current code finishes, so keep long work short or async.",
      ),
    ),
    lesson(
      "this",
      "What `this` means",
      3,
      explain(
        "Inside a function called as `obj.method()`, [[this-keyword|`this`]] is `obj`. Arrow functions don't have their own `this`; they use the one around them.",
      ),
      jsPlayground("this depends on how it's called", [
        "const note = {",
        '  title: "Milk",',
        "  show() {",
        "    return `Note: ${this.title}`;",
        "  },",
        "};",
        "console.log(note.show());",
        "const loose = note.show;",
        "try { console.log(loose()); }",
        'catch (e) { console.log("Lost this:", e.message); }',
      ]),
      quickCheck(
        "Why did `loose()` fail?",
        [
          "Called on its own, the method has no object, so `this` is undefined",
          "Methods can't be copied",
          "`title` was deleted",
        ],
        0,
        "`this` is decided by the call, not where the function was written.",
      ),
    ),
    lesson(
      "classes",
      "Classes",
      3,
      explain(
        "A [[js-class|class]] is a template for objects that share the same methods. `constructor` sets up each new object; `new` makes one.",
      ),
      jsPlayground("A class and two objects", [
        "class Note {",
        "  constructor(title) {",
        "    this.title = title;",
        "    this.done = false;",
        "  }",
        "  finish() {",
        "    this.done = true;",
        "  }",
        "}",
        'const a = new Note("Milk");',
        'const b = new Note("Bread");',
        "a.finish();",
        "console.log(a.done, b.done);",
      ]),
      keyPoints(
        "`extends` builds one class on another.",
        "React code uses functions, but you still meet classes: `new Error()`, `new Map()`.",
        "A class is still objects and functions underneath.",
      ),
    ),
    lesson(
      "references",
      "Copies and references",
      4,
      explain(
        "Numbers and strings are copied when assigned. Objects and arrays aren't: two variables can point at the same object, so changing it through one changes it for both. See [[reference-vs-value]].",
      ),
      jsPlayground("Same object, two names", [
        "let a = 1;",
        "let b = a;",
        "b = 2;",
        "console.log(a, b);",
        "",
        'const note = { title: "Milk" };',
        "const same = note;",
        'same.title = "Bread";',
        "console.log(note.title);",
        "",
        "const copy = { ...note };",
        'copy.title = "Eggs";',
        "console.log(note.title, copy.title);",
        "console.log(note === same, note === copy);",
      ]),
      quickCheck(
        "Why does React want a new array instead of `notes.push(note)`?",
        [
          "It compares references: the same array looks unchanged",
          "`push` is slow",
          "Arrays can't change",
        ],
        0,
        "A changed copy (`[...notes, note]`) is a new reference, so React sees the change.",
      ),
    ),
    lesson(
      "typescript-why",
      "Why TypeScript",
      3,
      explain(
        "[[typescript-why|TypeScript]] is JavaScript plus types. A checker reads your code before it runs and catches mistakes like a misspelt property or a missing argument.",
      ),
      code(
        "ts",
        "the mistake is caught before running",
        [
          "type Note = { title: string; done: boolean };",
          "",
          "function finish(note: Note) {",
          "  note.dne = true;",
          "}",
        ],
        { 4: "error: Property 'dne' does not exist on type 'Note'" },
      ),
      keyPoints(
        "Types are removed when it's built: browsers run plain JavaScript.",
        "Your editor uses them for autocomplete and warnings.",
        "This course's own code is written in TypeScript.",
      ),
    ),
    lesson(
      "typescript-types",
      "Writing types",
      4,
      reference("TypeScript's common types", [
        ["string, number, boolean", "The basic types.", "let title: string;"],
        ["T[]", "An array of T.", "const tags: string[] = [];"],
        [
          "type",
          "Name the shape of an object.",
          "type Note = { id: number; title: string };",
        ],
        ["?", "An optional property.", "{ content?: string }"],
        ["|", "One of several types.", 'type Status = "draft" | "saved";'],
        [
          "(a: T) => R",
          "A function's parameters and result.",
          "(n: number) => string",
        ],
      ]),
      explain(
        "[[typescript-types|Types]] describe shapes, not values. Most of the time TypeScript works them out itself; you write them for function parameters and shared data.",
      ),
      quickCheck(
        "What does `content?: string` mean?",
        [
          "`content` may be missing; if present, it's a string",
          "`content` must be a question",
          "`content` can be any type",
        ],
        0,
        "The `?` marks an optional property.",
      ),
    ),
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
      ["js-advanced-optional-type", "typescript-types"],
    ]),
  ],
};
