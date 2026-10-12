import type { Concept } from "@fsl/shared";

export const jsVariable: Concept = {
  id: "js-variable",
  slug: "js-variable",
  title: "Variables (let and const)",
  topicId: "javascript",
  summary:
    "A named box that holds a value so your program can remember it and use it again later.",
  basics: [
    "JavaScript is the programming language that runs in every web browser, and with Node.js it also runs on servers. A program is a list of instructions, called statements, that the computer runs one after another from top to bottom.",
    'Programs work with values: pieces of data such as the text `"Buy milk"`, the number `42` or the answer `true`. Text values are called strings because they are a string of characters, and they are always written inside quotes.',
    "To use a value more than once, the program needs a way to remember it. That is what a variable is for: you give a value a name, and later you use the name instead of writing the value again.",
  ],
  what: [
    'A variable is a name that points to a value. You create one with a keyword followed by the name, an equals sign and the value: `const title = "Buy milk";`. Creating a variable is called declaring it, and the `=` here means "store this value", not "is equal to".',
    "JavaScript has two modern keywords for this. `const` creates a variable that can never be pointed at a different value. `let` creates a variable you are allowed to change later with `=`, for example `count = count + 1`.",
  ],
  why: [
    "Names make code readable. `const maxLength = 200` explains itself, while a bare `200` scattered around the code does not — and if the limit changes, you update it in one place instead of hunting for every `200`.",
    "Choosing `const` by default protects you from accidents: if you try to reassign it, JavaScript stops with an error right away instead of silently changing a value some other part of the code relies on. When you see `let`, you know the value is meant to change.",
  ],
  howItWorks: [
    "When the line `let count = 0;` runs, JavaScript reserves a spot in memory, puts `0` in it and remembers that the name `count` refers to that spot. Every later use of `count` reads the current value.",
    'Each value has a type, which tells JavaScript what kind of data it is. The beginner types are: string (text in quotes, `"hello"`), number (`3` or `2.5`), boolean (`true` or `false`), `null` ("deliberately empty", set by you) and `undefined` ("no value yet", what a variable holds if you declare it without one). You can check a type with `typeof`, e.g. `typeof 42` gives `"number"`.',
    "Variables have a scope: the part of the code where the name exists. `let` and `const` are block scoped, which means a variable declared inside curly braces `{ }` — such as the body of an `if` or a loop — only exists inside those braces and disappears after them.",
  ],
  basicExample: {
    language: "js",
    code: `const title = "Buy milk"; // string, never reassigned
let count = 0; // number, will change

count = count + 1; // allowed: let can be reassigned
console.log(title, count); // Buy milk 1

// title = "Buy eggs"; // TypeError: Assignment to constant variable.`,
    caption:
      "`const` for values that stay the same, `let` for values that change; reassigning a `const` is an error.",
    highlightLines: [1, 2, 4],
  },
  internals: [
    "`const` locks the name, not the value inside it. `const notes = []` can never point to a different array, but you can still change the array itself with `notes.push(...)`. The name is constant; the contents of objects and arrays are not.",
    "The older keyword `var` also creates variables, but it ignores block scope: a `var` declared inside an `if` is visible in the whole function. It can also be used before its line, where it silently holds `undefined`. These surprises caused many bugs, so modern code uses only `let` and `const`.",
    "With `let` and `const`, using the name before its declaration line throws a `ReferenceError`. That error is helpful: it points at the mistake instead of quietly giving you `undefined`.",
    "Names may contain letters, digits, `_` and `$`, cannot start with a digit, cannot be keywords such as `let` or `if`, and are case sensitive (`note` and `Note` are different). JavaScript code uses camelCase by convention: `noteTitle`, `isLoggedIn`.",
  ],
  howToCreate: [
    {
      text: "Create a folder with a file called `variables.js` and declare a few variables, one of each beginner type.",
      code: {
        language: "js",
        fileName: "variables.js",
        code: `const appName = "Notes App"; // string
let noteCount = 0; // number
const isLoggedIn = false; // boolean
const selectedNote = null; // empty on purpose
let lastSaved; // undefined: no value yet

console.log(appName, noteCount, isLoggedIn, selectedNote, lastSaved);
console.log(typeof appName, typeof noteCount, typeof isLoggedIn);`,
      },
    },
    {
      text: "Below that, change the `let` variable and try to change a `const` one, then add a block to see scope in action.",
      code: {
        language: "js",
        fileName: "variables.js",
        code: `noteCount = noteCount + 1;
console.log("Notes:", noteCount);

if (noteCount > 0) {
  const message = "You have notes";
  console.log(message);
}
// console.log(message); // ReferenceError: message is not defined

appName = "Other"; // TypeError: Assignment to constant variable.`,
      },
    },
    {
      text: "Run it in a terminal with Node.js installed. You should see the values printed, then a `TypeError` on the last line because `appName` is a `const`.",
      code: {
        language: "bash",
        code: `node variables.js`,
      },
    },
    {
      text: "Delete the last line, remove the `//` in front of `console.log(message)` and run it again. Now you get a `ReferenceError`: `message` only existed inside the `if` block's braces.",
    },
  ],
  whereUsed: [
    "Everywhere in a program: storing what the user typed, the result of a calculation, data that came back from a server, a reference to a page element.",
    "In React components, `const` is used for almost everything, including the pair returned by `useState`, because a component never reassigns those names — it asks React for a new value instead.",
  ],
  connectsTo: [
    "Functions, which receive values through parameters (variables of their own) and hand back values you usually store in a variable.",
    "Objects and arrays, the values that group many pieces of data under one variable name.",
    'React state: `const [title, setTitle] = useState("")` declares two `const` variables at once.',
    "TypeScript, which lets you also write down the type a variable is allowed to hold.",
  ],
  projectUsage: [
    {
      explanation:
        'In `NoteForm.jsx`, `const [title, setTitle] = useState("")` declares the current title and its setter as `const` variables; the title changes only through the setter, never by reassigning the name.',
      fileId: "frontend/src/components/NoteForm.jsx",
      match: 'const [title, setTitle] = useState("");',
    },
    {
      explanation:
        "In the backend, `notesController.createNote(req, res)` keeps values such as the incoming title and content in `const` variables while it saves the note, because they never need to be reassigned.",
      fileId: "backend/src/controllers/notesController.js",
      match: "export async function createNote(req, res) {",
    },
  ],
  commonMistakes: [
    "Reassigning a `const`, e.g. `const count = 0; count++`, which throws a `TypeError`. Use `let` when the value must change.",
    "Using `var` because an old tutorial did. It ignores block scope and leads to confusing bugs; use `const` by default and `let` when you need to reassign.",
    "Mixing up `=` and `===`: `=` stores a value, `===` compares two values. `if (count = 0)` assigns instead of checking; write `if (count === 0)`.",
    "Using a variable outside the block it was declared in, which gives `ReferenceError: ... is not defined`. Declare it in the outer scope (above the `if` or loop) if you need it after the block.",
  ],
  relatedConcepts: [
    "js-function",
    "js-object-array",
    "typescript-types",
    "react-usestate",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
