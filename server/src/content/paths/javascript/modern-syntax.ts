import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  jsPlayground,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Modules and modern syntax in depth: splitting code into files with import
// and export (named and default), destructuring objects, arrays and
// parameters (with defaults), spread to copy and merge, rest, a
// step-through, ?. and ?? versus ||, shorthand you'll meet, where it's used,
// mistakes, practice and a recap.
export const modernSyntaxModule = moduleLesson(
  "modules-and-syntax",
  "Modules and modern syntax",
  50,
  [
    "Split code into files with `export` and `import`, named and default.",
    "Unpack objects, arrays and parameters with destructuring, with defaults.",
    "Copy and merge arrays and objects with spread, and collect the rest with `...`.",
    "Read missing values safely with `?.`, and give fallbacks with `??` rather than `||`.",
    "Read a line of real React code full of modern syntax.",
  ],

  part(
    "why",
    "The syntax real code is full of",
    explain(
      "Open any modern project and you'll meet lines like this one from the Notes App. Every piece is something you'll learn in this module: an `export`, braces that **unpack** an object, a **default** value and three dots that collect **the rest**. By the end, you'll read it as easily as `let x = 1`.",
    ),
    code(
      "js",
      "Input.jsx, the first line",
      [
        "export default function Input({",
        "  label,",
        "  id,",
        "  multiline = false,",
        "  ...props",
        "}) {",
      ],
      {
        1: "export default: the file's main thing",
        2: "destructuring: unpack the props object",
        4: "a default, if multiline isn't given",
        5: "rest: every other prop, in one object",
      },
    ),
    keyPoints(
      "Modules: each file shares what it exports.",
      "Destructuring: unpack values into variables.",
      "Spread and rest: `...` copies out, or collects up.",
      "`?.` and `??`: cope with missing values.",
    ),
  ),

  part(
    "modules",
    "Modules: one job per file",
    explain(
      "A big program in one file is hard to find your way around. So code is split into [[js-module-import-export|modules]]: each file does one job, `export`s what others may use, and `import`s what it needs. Anything not exported stays private to its file. In the Notes App, each file builds on the one before:",
    ),
    diagram([
      ["request.js", "exports request(): one fetch for every call"],
      ["notesApi.js", "imports request; exports getNotes, createNote…"],
      ["useNotes.js", "imports getNotes and deleteNote"],
      ["Dashboard.jsx", "imports useNotes and shows the notes"],
    ]),
    code(
      "js",
      "two files",
      [
        "// notesApi.js",
        'import { request } from "./request.js";',
        "",
        "export function getNotes() {",
        '  return request("/api/notes");',
        "}",
        "",
        "// useNotes.js",
        'import { getNotes } from "../services/notesApi.js";',
      ],
      {
        2: "take request from another file",
        4: "share getNotes with other files",
        9: "the path is relative to this file",
      },
    ),
    keyPoints(
      "Only what's exported can be imported.",
      "Paths start with `./` or `../`: relative to this file.",
      'Packages like React are imported by name: `"react"`.',
    ),
  ),

  part(
    "named-and-default",
    "Named and default exports",
    explain(
      "A **named** export is imported by its exact name, in braces: `import { getNotes } from …`. A file can have many. A **default** export is the file's main thing; it's imported **without** braces, under any name you choose. React components are usually default exports, one per file.",
    ),
    reference("export and import", [
      [
        "export function f",
        "A named export.",
        "export function getNotes() { … }",
      ],
      [
        "export const x",
        "Named export of a value.",
        "export const LIMIT = 100;",
      ],
      [
        "export default",
        "The file's one main export.",
        "export default function Input() { … }",
      ],
      [
        "import { a, b }",
        "Named imports: exact names, in braces.",
        'import { getNotes } from "./notesApi.js";',
      ],
      [
        "import X",
        "The default import: any name, no braces.",
        'import Input from "./Input.jsx";',
      ],
      [
        "import { a as b }",
        "Rename a named import.",
        "import { getNotes as loadNotes } …",
      ],
    ]),
    quickCheck(
      "`Input.jsx` has `export default function Input`. Which import works?",
      [
        'import { Input } from "./Input.jsx";',
        'import Input from "./Input.jsx";',
        'import Input() from "./Input.jsx";',
      ],
      1,
      "A default export is imported without braces. Braces would look for a named export called `Input`, and there isn't one.",
    ),
  ),

  part(
    "destructure-objects",
    "Destructuring objects",
    explain(
      "[[destructuring|Destructuring]] unpacks values into variables in one line. `const { title } = note;` is short for `const title = note.title;`. You can unpack several at once, give a **default** for when a property is missing, and collect everything else with `...rest`.",
    ),
    anatomy(
      "Unpacking an object",
      ["const {", "  title, done = false, ...rest", "} = note;"],
      [
        ["{", "braces", "Unpack an object (square brackets unpack an array)."],
        ["title", "a property", "Makes `const title = note.title`."],
        ["done = false", "a default", "Used when `note.done` is `undefined`."],
        [
          "...rest",
          "the rest",
          "A new object with every property not named before it.",
        ],
        ["note", "the source", "The object being unpacked; it isn't changed."],
      ],
    ),
    jsPlayground("Unpack a note", [
      'const note = { id: 7, title: "Milk", tags: ["food"] };',
      "",
      "const { title, tags } = note;",
      "console.log(title, tags);",
      "",
      "// A default, for a property that's missing",
      "const { done = false } = note;",
      "console.log(done);",
      "",
      "// Rename while unpacking: id becomes noteId",
      "const { id: noteId, ...rest } = note;",
      "console.log(noteId, rest);",
    ]),
  ),

  part(
    "destructure-arrays",
    "Arrays and parameters",
    explain(
      "Square brackets unpack an array **by position**: `const [first, second] = list;`. You'll see this with React's `useState`. Destructuring also works right in a function's parameters, which is how React components read their props. Add `= {}` so calling with nothing doesn't throw.",
    ),
    jsPlayground("By position, and in parameters", [
      'const [first, second] = ["Milk", "Bread", "Eggs"];',
      "console.log(first, second);",
      "",
      "// React: const [notes, setNotes] = useState([]);",
      "",
      'function greet({ name, greeting = "Hi" } = {}) {',
      '  return `${greeting}, ${name ?? "friend"}!`;',
      "}",
      'console.log(greet({ name: "Ann" }));',
      'console.log(greet({ name: "Sam", greeting: "Hello" }));',
      "console.log(greet());",
    ]),
    quickCheck(
      'What is `b` after `const [a, b] = ["x", "y", "z"];`?',
      ['`"y"`', '`["y", "z"]`', "`undefined`"],
      0,
      "Array destructuring goes by position: the second variable gets the second item. `...b` would collect the rest.",
    ),
  ),

  part(
    "spread",
    "Spread: copy and merge",
    explain(
      "[[spread|Spread]] `...` copies everything **out** of an array or object into a new one. It's how you make a changed copy without touching the original: `[...notes, newNote]` or `{ ...note, done: true }`. When objects are merged, a later property **wins**. React needs these copies, because it only notices new arrays and objects.",
    ),
    jsPlayground("Copies with a change", [
      'const notes = ["Milk", "Bread"];',
      'const more = [...notes, "Eggs"];',
      'const first = ["Tea", ...notes];',
      "console.log(notes, more, first);",
      "",
      'const note = { title: "Milk", done: false };',
      "const doneNote = { ...note, done: true };",
      "console.log(note.done, doneNote.done);",
      "",
      'const defaults = { colour: "yellow", pinned: false };',
      "const mine = { ...defaults, pinned: true };",
      "console.log(mine);",
      "",
      "console.log(Math.max(...[3, 9, 4]));",
    ]),
    keyPoints(
      "`[...arr, item]`: a new array with an item added.",
      "`{ ...obj, key: value }`: a new object with one change.",
      "Later properties win when objects are merged.",
      "The copy is shallow: nested objects are shared.",
    ),
  ),

  part(
    "rest",
    "Rest: collect the rest",
    explain(
      "The same three dots **collect** when they're on the receiving side. In a function's parameters, `...nums` gathers every remaining argument into an array. In destructuring, `...rest` gathers the leftovers. Rest must come last. Spread spreads out; rest gathers up.",
    ),
    jsPlayground("Gather arguments and leftovers", [
      "function total(...prices) {",
      "  return prices.reduce((sum, p) => sum + p, 0);",
      "}",
      "console.log(total(2, 3), total(1, 2, 3, 4), total());",
      "",
      "function log(label, ...values) {",
      '  console.log(label + ":", values.join(", "));',
      "}",
      'log("Bought", "Milk", "Bread");',
      "",
      'const [head, ...tail] = ["a", "b", "c"];',
      "console.log(head, tail);",
    ]),
    quickCheck(
      "Which line uses `...` as **rest**, not spread?",
      [
        "`const all = [...a, ...b];`",
        "`function f(...args) {}`",
        "`const copy = { ...note };`",
      ],
      1,
      "In parameters (or on the left of `=`), `...` collects. Inside a new array or object, it spreads out.",
    ),
  ),

  part(
    "how-it-runs",
    "Step through it",
    explain(
      "Watch each line make new variables, and notice that `note` and `tags` are never changed: destructuring reads from them, and spread copies out of them.",
    ),
    trace(
      "Destructuring and spread, move by move",
      [
        'const note = { title: "Milk", done: false };',
        "const { title, done } = note;",
        "const updated = { ...note, done: true };",
        'const tags = ["food", "home"];',
        "const [first, ...others] = tags;",
        'const more = [...tags, "urgent"];',
        "console.log(title, done, updated.done);",
        "console.log(first, others[0], more.length);",
      ],
      [
        {
          line: 1,
          note: "An ordinary object.",
          vars: [["note", '{ title: "Milk", done: false }']],
        },
        {
          line: 2,
          note: "Two new variables, read from `note`'s properties of the same names.",
          vars: [
            ["note", '{ title: "Milk", done: false }'],
            ["title", '"Milk"'],
            ["done", "false"],
          ],
        },
        {
          line: 3,
          note: "A **new** object: `note`'s properties copied out, then `done: true` replaces the copied `done`. `note` itself is unchanged.",
          vars: [
            ["note", '{ title: "Milk", done: false }'],
            ["title", '"Milk"'],
            ["done", "false"],
            ["updated", '{ title: "Milk", done: true }'],
          ],
        },
        {
          line: 5,
          note: "Line 4 made `tags`. Now by position: `first` gets the first item, and rest gathers what's left into a new array.",
          vars: [
            ["note", '{ title: "Milk", done: false }'],
            ["title", '"Milk"'],
            ["done", "false"],
            ["updated", '{ title: "Milk", done: true }'],
            ["tags", '["food", "home"]'],
            ["first", '"food"'],
            ["others", '["home"]'],
          ],
        },
        {
          line: 6,
          note: "Spread copies the tags into a new array, with one more at the end.",
          vars: [
            ["note", '{ title: "Milk", done: false }'],
            ["title", '"Milk"'],
            ["done", "false"],
            ["updated", '{ title: "Milk", done: true }'],
            ["tags", '["food", "home"]'],
            ["first", '"food"'],
            ["others", '["home"]'],
            ["more", '["food", "home", "urgent"]'],
          ],
        },
        {
          line: 7,
          note: "`done` is still `false`: it was read before `updated` existed, and `note` never changed.",
          vars: [
            ["note", '{ title: "Milk", done: false }'],
            ["title", '"Milk"'],
            ["done", "false"],
            ["updated", '{ title: "Milk", done: true }'],
            ["tags", '["food", "home"]'],
            ["first", '"food"'],
            ["others", '["home"]'],
            ["more", '["food", "home", "urgent"]'],
          ],
          output: "Milk false true",
        },
        {
          line: 8,
          note: "`tags` still has two items; `more` has three.",
          vars: [
            ["note", '{ title: "Milk", done: false }'],
            ["title", '"Milk"'],
            ["done", "false"],
            ["updated", '{ title: "Milk", done: true }'],
            ["tags", '["food", "home"]'],
            ["first", '"food"'],
            ["others", '["home"]'],
            ["more", '["food", "home", "urgent"]'],
          ],
          output: "food home 3",
        },
      ],
    ),
  ),

  part(
    "missing-values",
    "Missing values: ?. and ??",
    explain(
      'Reading a property of `undefined` throws a TypeError. [[optional-chaining|Optional chaining]] `?.` stops early and gives `undefined` instead. `??` gives a fallback, but **only** for `null` or `undefined`. `||` gives a fallback for **every** falsy value, so it wrongly replaces `0`, `""` and `false`.',
    ),
    jsPlayground("?. and ??, and why not ||", [
      'const user = { name: "Sam", settings: { fontSize: 0 } };',
      "",
      "console.log(user.address?.city);",
      'console.log(user.address?.city ?? "No city yet");',
      "console.log(user.getAge?.());",
      "",
      "// fontSize 0 is a real setting; only ?? keeps it",
      "console.log(user.settings.fontSize || 16);",
      "console.log(user.settings.fontSize ?? 16);",
      "",
      "const empty = null;",
      'console.log(empty?.title ?? "(no note)");',
    ]),
    code(
      "js",
      "|| and ?? side by side",
      [
        "undefined || 16; // 16",
        "undefined ?? 16; // 16",
        "0 || 16; // 16",
        "0 ?? 16; // 0",
        '"" || "none"; // "none"',
        '"" ?? "none"; // ""',
      ],
      {
        3: "0 is falsy, so || replaces it",
        4: "0 isn't null or undefined, so ?? keeps it",
        6: "the same for an empty string",
      },
    ),
  ),

  part(
    "shorthand",
    "Shorthand you'll meet",
    explain(
      "A few more shortcuts appear everywhere. When a property has the same name as a variable, write it once: `{ title, content }`. Methods can drop `function`. Square brackets make a key from a variable. And an arrow function that returns an object needs **parentheses** around it.",
    ),
    jsPlayground("Shorter ways to write objects", [
      'const title = "Milk";',
      'const content = "2 litres";',
      "",
      "const note = { title, content }; // { title: title, content: content }",
      "console.log(note);",
      "",
      "const counter = {",
      "  count: 0,",
      "  add() {",
      "    this.count += 1;",
      "  },",
      "};",
      "counter.add();",
      "console.log(counter.count);",
      "",
      'const field = "colour";',
      'console.log({ [field]: "yellow" });',
      "",
      "const make = (title) => ({ title, done: false });",
      'console.log(make("Bread"));',
    ]),
  ),

  part(
    "where-used",
    "Where you'll see it",
    keyPoints(
      "Every file of a React app imports and exports.",
      "Components destructure their props: `function NoteCard({ note })`.",
      "State updates use spread: `[note, ...current]`.",
      "API code uses `?.` and `??` for replies that may be empty.",
    ),
    inTheNotesApp(
      "`Input` destructures its props with a default (`multiline = false`) and gathers the rest into `props`, then passes them all on with `{...props}`. So `Input` accepts any attribute an `<input>` does. In `useNotes`, `setNotes((current) => [note, ...current])` adds a new note at the top without changing the old array.",
      { symbolId: "component:Input" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Braces on a default import",
      wrong: ['import { Input } from "./Input.jsx";'],
      problem:
        "`Input` is the default export, so there's no named export to find. You get `undefined`, or an error that `Input` isn't exported.",
      right: ['import Input from "./Input.jsx";'],
      why: "Braces for named exports; no braces for the default.",
    }),
    mistake({
      title: "Changing the original instead of a copy",
      wrong: [
        "function markDone(note) {",
        "  note.done = true;",
        "  return note;",
        "}",
      ],
      problem:
        "Whoever owns `note` sees it change too. React may not notice, because it's still the same object.",
      right: [
        "function markDone(note) {",
        "  return { ...note, done: true };",
        "}",
      ],
      why: "Spread into a new object, then change the copy.",
    }),
    mistake({
      title: "|| replacing a real 0",
      wrong: ["const size = settings.fontSize || 16; // 0 → 16"],
      problem: "`0` is falsy, so `||` throws away a value the user chose.",
      right: ["const size = settings.fontSize ?? 16; // 0 stays 0"],
      why: "`??` only replaces `null` and `undefined`.",
    }),
    mistake({
      title: "Returning an object from an arrow without ()",
      wrong: ["const make = (title) => { title, done: false };"],
      problem:
        "The braces are read as the function's body, not an object. It returns `undefined` (or is a SyntaxError).",
      right: ["const make = (title) => ({ title, done: false });"],
      why: "Parentheses tell JavaScript the braces are an object.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Toggle without changing",
      task: "`toggleDone(note)` should return a **new** note with `done` flipped. This one changes the original. Fix it with spread.",
      starter: [
        "function toggleDone(note) {",
        "  note.done = !note.done;",
        "  return note;",
        "}",
      ],
      tests: [
        [
          'toggleDone({ title: "Milk", done: false })',
          '{ title: "Milk", done: true }',
        ],
        [
          'toggleDone({ title: "Tea", done: true })',
          '{ title: "Tea", done: false }',
        ],
        [
          '((n) => (toggleDone(n), n.done))({ title: "Eggs", done: false })',
          "false",
        ],
      ],
      hint: "`return { ...note, done: !note.done };`",
      solution: [
        "function toggleDone(note) {",
        "  return { ...note, done: !note.done };",
        "}",
      ],
    }),
    yourTurn({
      title: "Which city?",
      task: 'Write `cityOf(user)` to return `user.address.city`, or `"Unknown"` if the user, the address or the city is missing. Use `?.` and `??`.',
      starter: ["function cityOf(user) {", "", "}"],
      tests: [
        ['cityOf({ address: { city: "Pokhara" } })', '"Pokhara"'],
        ['cityOf({ name: "Sam" })', '"Unknown"'],
        ["cityOf(null)", '"Unknown"'],
        ['cityOf({ address: { city: "" } })', '""'],
      ],
      hint: '`return user?.address?.city ?? "Unknown";`',
      solution: [
        "function cityOf(user) {",
        '  return user?.address?.city ?? "Unknown";',
        "}",
      ],
    }),
    yourTurn({
      title: "Add them all",
      task: "Write `total(...prices)`: it takes any number of prices and returns their sum (0 for none).",
      starter: ["function total() {", "", "}"],
      tests: [
        ["total(2, 3)", "5"],
        ["total(1, 2, 3, 4)", "10"],
        ["total()", "0"],
      ],
      hint: "Rest gathers the arguments: `function total(...prices)`, then `reduce`.",
      solution: [
        "function total(...prices) {",
        "  return prices.reduce((sum, p) => sum + p, 0);",
        "}",
      ],
    }),
    yourTurn({
      title: "A label from props",
      task: 'Write `label({ title, done })` with destructuring in the parameter. `done` should default to `false`. Return the title, plus `" ✓"` when done.',
      starter: ["function label(note) {", "", "}"],
      tests: [
        ['label({ title: "Milk", done: true })', '"Milk ✓"'],
        ['label({ title: "Bread", done: false })', '"Bread"'],
        ['label({ title: "Eggs" })', '"Eggs"'],
      ],
      hint: '`function label({ title, done = false }) { return done ? title + " ✓" : title; }`',
      solution: [
        "function label({ title, done = false }) {",
        '  return done ? title + " ✓" : title;',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Modern syntax cheat sheet", [
      [
        "named export",
        "Import by name, in braces.",
        "import { getNotes } from …",
      ],
      ["default export", "Import without braces.", "import Input from …"],
      [
        "object destructuring",
        "Unpack by property name.",
        "const { title, done = false } = note;",
      ],
      ["array destructuring", "Unpack by position.", "const [a, b] = list;"],
      [
        "spread",
        "Copy out into a new array or object.",
        "{ ...note, done: true }",
      ],
      ["rest", "Gather the remaining values.", "function f(...args) {}"],
      ["?.", "Stop if null or undefined.", "user?.address?.city"],
      ["??", "Fallback for null or undefined only.", "size ?? 16"],
      ["shorthand", "Same name, write it once.", "{ title, content }"],
    ]),
    quickCheck(
      "Which line makes a copy of `note` with `pinned` set to true, leaving `note` unchanged?",
      [
        "`note.pinned = true;`",
        "`const copy = { ...note, pinned: true };`",
        "`const copy = note; copy.pinned = true;`",
      ],
      1,
      "Spread copies into a new object. The other two change `note` itself: `copy = note` is the same object under another name.",
    ),
  ),
);
