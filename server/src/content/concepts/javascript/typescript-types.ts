import type { Concept } from "@fsl/shared";

export const typescriptTypes: Concept = {
  id: "typescript-types",
  slug: "typescript-types",
  title: "TypeScript types",
  topicId: "javascript",
  summary:
    "The notation TypeScript uses to describe what kind of value a variable, parameter or object holds.",
  basics: [
    "TypeScript is JavaScript plus types: labels that say what kind of value something is. The TypeScript checker reads those labels before the code runs and warns you when values do not match.",
    'The basic types match JavaScript\'s values: `string` for text, `number` for any number, `boolean` for `true` or `false`, and `null` and `undefined` for "no value".',
    'An annotation is the label you write after a name, separated by a colon: in `let title: string = "Shopping"`, the part `: string` is the annotation.',
  ],
  what: [
    "Types can be written on variables (`let count: number`), on function parameters (`function add(a: number, b: number)`) and on a function's return value (`function add(a: number, b: number): number`).",
    "You can also give a type a name with `type`, for example `type Note = { id: number; title: string }`. Such a type alias describes the shape of an object once, so you can reuse it everywhere a note appears.",
  ],
  why: [
    "Real data is mostly objects. Describing their shape once means the checker can tell you when you misspell `titel`, forget a required field, or pass a user where a note was expected.",
    "Named types make code easier to read and change. If a note gains a new property, you update the `Note` type and the checker lists every place that needs to change.",
  ],
  howItWorks: [
    'A union type allows one of several options, written with `|`. `type Status = "ok" | "error"` only accepts those two exact strings, so a typo like `"eror"` is caught.',
    "A `?` after a property name makes it optional: in `{ title: string; content?: string }` the `content` may be missing, and TypeScript makes you handle the case where it is `undefined`.",
    "Array types are written with `[]` after the item type: `Note[]` means an array of notes, and `string[]` an array of strings. Reading an item from a `Note[]` gives you a `Note`, with autocomplete for its properties.",
    "Types can be exported and imported like any other code, so one file can define `Note` and many files can use it.",
  ],
  basicExample: {
    language: "ts",
    code: `type Note = {
  id: number;
  title: string;
  content?: string;
};

type SaveResult = "ok" | "error";

function countTitles(notes: Note[]): number {
  return notes.filter((note) => note.title !== "").length;
}

const status: SaveResult = "ok";`,
    caption:
      "A `Note` shape with an optional property, a union of two strings, and a function that takes an array of notes and returns a number.",
  },
  internals: [
    "TypeScript compares types by shape, not by name: any object that has a numeric `id` and a string `title` counts as a `Note`, even if it was never declared as one. This is called structural typing.",
    "Types exist only for the checker. When the code is compiled, `type` declarations and annotations are deleted completely, so they add nothing to the size or speed of the running program.",
    'When you check a union, TypeScript narrows it: inside `if (status === "error") { ... }` it knows `status` is exactly `"error"`, and in the `else` branch it knows it is `"ok"`.',
  ],
  howToCreate: [
    {
      text: "In an empty folder, install TypeScript and create a `tsconfig.json` file.",
      code: {
        language: "bash",
        code: `npm init -y
npm install -D typescript
npx tsc --init`,
      },
    },
    {
      text: "Create `notes.ts` with a `Note` type, a function that uses it, and one deliberate mistake (a missing `title`).",
      code: {
        language: "ts",
        fileName: "notes.ts",
        code: `type Note = {
  id: number;
  title: string;
  content?: string;
};

function describe(note: Note): string {
  return note.id + ": " + note.title;
}

const notes: Note[] = [
  { id: 1, title: "Shopping", content: "Milk" },
  { id: 2, content: "No title here" },
];

console.log(notes.map(describe));`,
      },
    },
    {
      text: "Run the type checker. It reports that property `title` is missing in the second note.",
      code: {
        language: "bash",
        code: `npx tsc`,
      },
    },
    {
      text: "Add `title: \"Ideas\"` to the second note and run `npx tsc` again. When it prints nothing, run `node notes.js` and you should see `[ '1: Shopping', '2: Ideas' ]`.",
    },
  ],
  whereUsed: [
    "Describing data that travels through an app, such as notes, users and API responses.",
    "Function signatures, so every caller knows which arguments to pass and what comes back.",
    "Shared packages, where one set of types is used by both the frontend and the backend.",
  ],
  connectsTo: [
    "JavaScript objects and arrays, whose shapes the types describe.",
    "Functions, whose parameters and return values are annotated.",
    "Modules with `import` and `export`, which let types be shared between files and packages.",
    "JSON from an API: you can give the parsed result a type, but remember nothing checks it at runtime.",
  ],
  projectUsage: [
    {
      explanation:
        "This learning platform keeps its shared types in `shared/src/types/`, such as `Topic` and `Concept`. The page you are reading is a `Concept` object, and the server checks every field against that type.",
    },
    {
      explanation:
        "Both `client/` and `server/` import those same types. If someone changes `Concept`, the build fails on both sides until both are fixed, so the frontend and backend can never silently disagree about the shape of the data.",
    },
    {
      explanation:
        "The Notes App stays in plain JavaScript, but its note objects have the same idea of a shape: `{ id, title, content, created_at, updated_at }`. Writing that shape as a `Note` type would be the first step in converting it to TypeScript.",
    },
  ],
  commonMistakes: [
    "Writing types with commas and `=` like an object value, such as `type Note = { title = string }`. Use a colon for each property's type and separate properties with `;` or `,`.",
    'Forgetting that an optional property may be `undefined`, then calling a method on it. Check it first, for example `note.content ?? ""`.',
    'Using `string` when only a few values are allowed. A union like `"ok" | "error"` catches typos that `string` lets through.',
    "Copying the same object type into the frontend and the backend separately. They drift apart over time; export it once from a shared file and import it on both sides.",
  ],
  relatedConcepts: [
    "typescript-why",
    "js-object-array",
    "js-function",
    "js-module-import-export",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
