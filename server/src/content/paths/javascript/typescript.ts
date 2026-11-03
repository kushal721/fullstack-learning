import {
  anatomy,
  code,
  diagram,
  explain,
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

// TypeScript in depth: why types, how the checker fits in, annotations,
// inference, object types and aliases, optional and union types, narrowing
// (with a step-through, and the same checks at runtime), function and
// generic types, reading compiler errors, where it's used (this course's
// own code), mistakes, practice and a recap. The sandbox runs JavaScript,
// so types are shown in annotated code, and the exercises practise the
// runtime checks that narrowing is built on.
export const typescriptModule = moduleLesson(
  "typescript",
  "TypeScript: JavaScript with types",
  50,
  [
    "Explain what TypeScript checks, when, and why the types disappear when the code runs.",
    "Write annotations for variables and functions, and let inference do the rest.",
    "Describe objects with type aliases, including optional properties and unions.",
    "Narrow a union with checks like `typeof`, and write the same checks for data at runtime.",
    "Read common compiler errors and fix the code they point at.",
  ],

  part(
    "why",
    "Catching mistakes before they run",
    explain(
      "In JavaScript, a misspelt property or a missing argument only shows up when that line runs, maybe in front of a user. [[typescript-why|TypeScript]] is JavaScript plus **types**: notes on what each value should be. A checker reads them while you type and underlines mistakes straight away, before anything runs.",
    ),
    code(
      "ts",
      "the mistake is caught as you type",
      [
        "type Note = { title: string; done: boolean };",
        "",
        "function finish(note: Note) {",
        "  note.dne = true;",
        "}",
      ],
      {
        1: "the shape every Note has",
        3: "note must be a Note",
        4: "error: Property 'dne' does not exist on type 'Note'",
      },
    ),
    keyPoints(
      "Almost any JavaScript is valid TypeScript: you add types gradually.",
      "Mistakes show up in your editor, not in your users' browsers.",
      "Types also power autocomplete: the editor knows what's on each object.",
    ),
  ),

  part(
    "how-it-works",
    "How it fits in",
    explain(
      "Browsers and Node run JavaScript, not TypeScript. So TypeScript is a step **before** running: the checker (`tsc`, or your editor) reads `.ts` files and reports type errors; then the build **removes** the types, leaving plain JavaScript. That means types can't check anything at runtime, a point that matters later.",
    ),
    diagram([
      ["you write .ts", "JavaScript plus types"],
      ["the checker", "reports errors in your editor and in CI"],
      ["the build", "strips the types out"],
      [".js runs", "in the browser or Node: no types left"],
    ]),
  ),

  part(
    "annotations",
    "Annotations",
    explain(
      "An **annotation** is a colon and a type after a name: `let count: number`. The ones you'll write most are on function **parameters**, since TypeScript can't guess what callers will pass. The return type comes after the parentheses; it's optional, but it documents the function and catches a wrong `return`.",
    ),
    anatomy(
      "A function with types",
      ["function add(", "  a: number,", "  b: number,", "): number {"],
      [
        ["add", "name", "An ordinary function; the body is plain JavaScript."],
        ["a: number", "parameter type", "Callers must pass a number here."],
        ["b: number", "parameter type", "And here."],
        [": number", "return type", "The function must give back a number."],
      ],
    ),
    code(
      "ts",
      "what the checker says",
      [
        "add(1, 2); // fine",
        'add(1, "2"); // error',
        "add(1); // error",
        "const total: number = add(1, 2); // fine",
      ],
      {
        2: "Argument of type 'string' is not assignable to parameter of type 'number'",
        3: "Expected 2 arguments, but got 1",
      },
    ),
  ),

  part(
    "inference",
    "Inference: types you don't write",
    explain(
      'TypeScript works out most types itself: that\'s **inference**. `let count = 0` is a `number`; `const notes = ["Milk"]` is a `string[]`; a function returning `a + b` of two numbers returns a `number`. So you rarely annotate variables. Hover over a name in your editor to see what TypeScript decided.',
    ),
    code(
      "ts",
      "nothing annotated, everything typed",
      [
        "let count = 0; // number",
        'const title = "Milk"; // "Milk" (a const never changes)',
        'const tags = ["food", "home"]; // string[]',
        'const note = { id: 1, title: "Milk" }; // { id: number; title: string }',
        "",
        'count = "many"; // error: string isn\'t number',
      ],
      { 6: "the type was fixed by the first value" },
    ),
    quickCheck(
      "Where do you usually need to write types yourself?",
      [
        "On every variable",
        "On function parameters, and on shared shapes like Note",
        "Nowhere: TypeScript always knows",
      ],
      1,
      "Inference handles most variables. It can't guess what a caller will pass, so parameters need types, and named shapes are written once and reused.",
    ),
  ),

  part(
    "object-types",
    "Object types and type aliases",
    explain(
      "Describe an object's shape with its properties' [[typescript-types|types]]: `{ id: number; title: string }`. Writing that everywhere would be tiring, so give it a name with `type`: a **type alias**. Then use the name anywhere a type goes. Arrays of it are `Note[]`.",
    ),
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
      ["unknown", "Anything: check it before use.", "const data: unknown = …"],
    ]),
    code(
      "ts",
      "one shape, used everywhere",
      [
        "type Note = {",
        "  id: number;",
        "  title: string;",
        "  tags: string[];",
        "};",
        "",
        "function titles(notes: Note[]): string[] {",
        "  return notes.map((note) => note.title);",
        "}",
      ],
      {
        1: "a type alias: a name for the shape",
        7: "an array of Notes in, an array of strings out",
        8: "note is known to be a Note here",
      },
    ),
  ),

  part(
    "optional-and-unions",
    "Optional properties and unions",
    explain(
      'Real data has gaps and choices. `content?: string` means the property may be **missing**. A **union** `A | B` means “one of these”: `number | null`, or a fixed set of strings like `"draft" | "saved"`, which makes typos impossible. TypeScript then makes you handle every possibility.',
    ),
    code(
      "ts",
      "gaps and choices",
      [
        'type Status = "draft" | "saved" | "deleted";',
        "",
        "type Note = {",
        "  title: string;",
        "  content?: string;",
        "  status: Status;",
        "  dueDate: string | null;",
        "};",
        "",
        'const n: Note = { title: "Milk", status: "saevd", dueDate: null };',
      ],
      {
        1: "only these three strings are allowed",
        5: "may be missing: its type is string | undefined",
        7: "always present, but may be null",
        10: 'error: "saevd" is not assignable to type Status',
      },
    ),
  ),

  part(
    "narrowing",
    "Narrowing",
    explain(
      "With a union, you can only do what's safe for **every** member: you can't call `.toUpperCase()` on `number | string`. Check which one you have with `typeof`, `===`, `Array.isArray` or `in`, and inside that branch TypeScript **narrows** the type. The checks are ordinary JavaScript, so they also run. Step through:",
    ),
    trace(
      "A union, narrowed",
      [
        "function label(id: number | string) {",
        '  if (typeof id === "number") {',
        '    return "#" + id;',
        "  }",
        "  return id.toUpperCase();",
        "}",
        "console.log(label(7));",
        'console.log(label("ab"));',
      ],
      [
        {
          line: 1,
          note: "`label(7)` is called. At the top, TypeScript only knows `id` is a number **or** a string.",
          vars: [
            ["id", "7"],
            ["type here", "number | string"],
          ],
          stack: ["main program", "label(7)"],
        },
        {
          line: 3,
          note: 'The check is true. Inside the `if`, TypeScript knows `id` is a `number`, so `"#" + id` is fine.',
          vars: [
            ["id", "7"],
            ["type here", "number"],
          ],
          stack: ["main program", "label(7)"],
        },
        {
          line: 7,
          note: "It returns `#7`.",
          stack: ["main program"],
          output: "#7",
        },
        {
          line: 2,
          note: '`label("ab")`: this time the check is false, so the `if` is skipped.',
          vars: [
            ["id", '"ab"'],
            ["type here", "number | string"],
          ],
          stack: ["main program", 'label("ab")'],
        },
        {
          line: 5,
          note: "After the `if` returned for numbers, only strings get here, so TypeScript narrows `id` to `string`, and `.toUpperCase()` is allowed.",
          vars: [
            ["id", '"ab"'],
            ["type here", "string"],
          ],
          stack: ["main program", 'label("ab")'],
        },
        {
          line: 8,
          note: "It returns `AB`.",
          stack: ["main program"],
          output: "AB",
        },
      ],
    ),
  ),

  part(
    "runtime-checks",
    "Types vanish: check data at runtime",
    explain(
      "Types are removed before the code runs, so they can't check what arrives from a server or a user. Writing `const note = data as Note` only **tells** TypeScript to trust you. For outside data, check it with real code: the same `typeof` checks as narrowing. Run this plain JavaScript:",
    ),
    jsPlayground("A runtime check for a Note", [
      "function isNote(value) {",
      "  return (",
      '    typeof value === "object" &&',
      "    value !== null &&",
      '    typeof value.id === "number" &&',
      '    typeof value.title === "string"',
      "  );",
      "}",
      "",
      'console.log(isNote({ id: 1, title: "Milk" }));',
      'console.log(isNote({ id: "1", title: "Milk" }));',
      "console.log(isNote(null));",
      'console.log(isNote(JSON.parse(\'{"title":"No id"}\')));',
    ]),
    keyPoints(
      "Types check your code, not the data it receives.",
      "`as` silences the checker; it doesn't check anything.",
      "Check outside data with real code (or a library like Zod).",
    ),
  ),

  part(
    "functions-and-generics",
    "Function types and generics",
    explain(
      "Functions passed around have types too: `(note: Note) => void` takes a Note and returns nothing useful. Some types take another type in angle brackets, a **generic**: `Promise<Note[]>` is a promise of an array of Notes, and `useState<Note[]>([])` is React state holding Notes. Read `<…>` as “of”.",
    ),
    code(
      "ts",
      "types you'll read in React code",
      [
        "type Props = {",
        "  note: Note;",
        "  onDelete: (id: number) => void;",
        "};",
        "",
        "async function getNotes(): Promise<Note[]> {",
        '  const response = await fetch("/api/notes");',
        "  return response.json();",
        "}",
        "",
        "const [notes, setNotes] = useState<Note[]>([]);",
      ],
      {
        3: "a function that takes an id",
        6: "async functions return a Promise of …",
        11: "state holding an array of Notes",
      },
    ),
  ),

  part(
    "errors",
    "Reading compiler errors",
    explain(
      "TypeScript's messages are long but follow a pattern: what you gave, and what was expected. Read them right to left: “Type **X** is not assignable to type **Y**” means you gave an X where a Y belongs. Here are the ones you'll see most, and what they usually mean:",
    ),
    reference("Common errors", [
      [
        "Property 'x' does not exist on type 'T'",
        "A typo, or a property the type doesn't have.",
        "note.tittle",
      ],
      [
        "Type 'A' is not assignable to type 'B'",
        "Wrong kind of value for that place.",
        'const n: number = "5";',
      ],
      [
        "Argument … not assignable to parameter",
        "A call with the wrong kind of argument: Argument of type 'A' is not assignable to parameter of type 'B'.",
        'add(1, "2")',
      ],
      [
        "Expected 2 arguments, but got 1",
        "A missing (or extra) argument.",
        "add(1)",
      ],
      [
        "'x' is possibly 'undefined'",
        "It may be missing: check or give a default.",
        "note.content.length",
      ],
      [
        "Cannot find name 'x'",
        "Not declared or not imported.",
        "useState without import",
      ],
    ]),
  ),

  part(
    "where-used",
    "Where you'll meet it",
    explain(
      "Most professional JavaScript projects use TypeScript, including this course. Its server, its React pages and the content you're reading share types from one package, `@fsl/shared`. These are real lines from it:",
    ),
    code(
      "ts",
      "this course's shared types (comments removed)",
      [
        'export type Level = "basic" | "intermediate" | "advanced";',
        "",
        "export type SceneActor = { id: string; label: string; sub?: string };",
        "",
        "export type LevelPlan = {",
        "  outcome: string;",
        "  steps: Step[];",
        "};",
      ],
      {
        1: "a union of the three level names",
        3: "an optional sub-label",
        7: "an array of another shared type",
      },
    ),
    keyPoints(
      "The server and the browser share one set of types, so they agree on the data.",
      "Rename a property, and the checker lists every place to update.",
      "The Notes App is plain JavaScript, to keep it simple to read.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "any everywhere",
      wrong: [
        "function save(note: any) {",
        "  note.titel.trim(); // no error",
        "}",
      ],
      problem:
        "`any` switches checking off, so the typo is only found when it crashes.",
      right: ["function save(note: Note) {", "  note.title.trim();", "}"],
      why: "Use real types; use `unknown` (and check it) for truly unknown data.",
    }),
    mistake({
      title: "as to make an error go away",
      wrong: [
        "const note = (await response.json()) as Note;",
        "note.title.trim();",
      ],
      problem:
        "`as` doesn't check: if the server sends something else, it still crashes at runtime.",
      right: [
        "const data: unknown = await response.json();",
        'if (!isNote(data)) throw new Error("Unexpected reply");',
        "data.title.trim(); // narrowed by the check",
      ],
      why: "Check outside data with code; then TypeScript narrows it for you.",
    }),
    mistake({
      title: "Ignoring 'possibly undefined'",
      wrong: ["note.content!.length // ! says “trust me”"],
      problem:
        "`!` silences the warning, but `content` really can be missing, and then it crashes.",
      right: ['(note.content ?? "").length'],
      why: "Handle the missing case: `?.`, `??` or an `if`.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    explain(
      "The sandbox runs JavaScript, so these exercises practise the part of TypeScript that also runs: **narrowing checks**. Each function takes values of more than one type, like a union would describe.",
    ),
    yourTurn({
      title: "Number or string",
      task: 'Write `label(id)`: `id` is a number or a string (`number | string`). For a number, return `"#"` plus the number; for a string, return it in upper case.',
      starter: ["function label(id) {", "  return id.toUpperCase();", "}"],
      tests: [
        ["label(7)", '"#7"'],
        ['label("ab")', '"AB"'],
        ["label(0)", '"#0"'],
      ],
      hint: '`if (typeof id === "number") return "#" + id;`',
      solution: [
        "function label(id) {",
        '  if (typeof id === "number") return "#" + id;',
        "  return id.toUpperCase();",
        "}",
      ],
    }),
    yourTurn({
      title: "A list of Notes?",
      task: "Using `isNote` from the playground, write `isNoteList(value)`: true only when `value` is an array and every item in it is a Note. (An empty array counts.)",
      starter: [
        "function isNote(value) {",
        "  return (",
        '    typeof value === "object" &&',
        "    value !== null &&",
        '    typeof value.id === "number" &&',
        '    typeof value.title === "string"',
        "  );",
        "}",
        "",
        "function isNoteList(value) {",
        "  return value.every(isNote);",
        "}",
      ],
      tests: [
        ['isNoteList([{ id: 1, title: "Milk" }])', "true"],
        ["isNoteList([])", "true"],
        ['isNoteList([{ id: 1, title: "Milk" }, { id: 2 }])', "false"],
        ['isNoteList({ id: 1, title: "Milk" })', "false"],
        ["isNoteList(null)", "false"],
      ],
      hint: "`Array.isArray(value)` first, then `&& value.every(isNote)`.",
      solution: [
        "function isNote(value) {",
        "  return (",
        '    typeof value === "object" &&',
        "    value !== null &&",
        '    typeof value.id === "number" &&',
        '    typeof value.title === "string"',
        "  );",
        "}",
        "",
        "function isNoteList(value) {",
        "  return Array.isArray(value) && value.every(isNote);",
        "}",
      ],
    }),
    yourTurn({
      title: "How many?",
      task: "Write `countOf(value)`: `value` is a string, an array, or `null`/`undefined` (`string | unknown[] | null | undefined`). Return its length, or 0 when it's missing.",
      starter: ["function countOf(value) {", "  return value.length;", "}"],
      tests: [
        ['countOf("Milk")', "4"],
        ['countOf(["a", "b"])', "2"],
        ["countOf(null)", "0"],
        ["countOf(undefined)", "0"],
      ],
      hint: "`return value?.length ?? 0;` handles all four.",
      solution: [
        "function countOf(value) {",
        "  return value?.length ?? 0;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("TypeScript cheat sheet", [
      ["annotation", "A type after a colon.", "function f(a: number): string"],
      ["inference", "Types worked out for you.", "let count = 0; // number"],
      [
        "type alias",
        "Name a shape.",
        "type Note = { id: number; title: string };",
      ],
      ["optional", "May be missing.", "content?: string"],
      ["union", "One of several.", '"draft" | "saved", number | null'],
      ["narrowing", "A check picks the member.", 'if (typeof id === "number")'],
      [
        "generic",
        "A type of another type.",
        "Promise<Note[]>, useState<Note[]>",
      ],
      ["unknown", "Check before use.", "const data: unknown = …"],
      [
        "types vanish",
        "Check outside data at runtime.",
        "if (!isNote(data)) throw …",
      ],
    ]),
    quickCheck(
      "The server sends `{ title: 5 }`, and your code says `const note = data as Note`. What happens?",
      [
        "TypeScript stops the bad data at runtime",
        "Nothing checks it: the code runs with a number where it expects a string",
        "The build fails",
      ],
      1,
      "Types are removed before the code runs, and `as` only tells the checker to trust you. Check outside data with real code.",
    ),
  ),
);
