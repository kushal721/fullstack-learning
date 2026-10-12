import type { Concept } from "@fsl/shared";

export const jsModuleImportExport: Concept = {
  id: "js-module-import-export",
  slug: "js-module-import-export",
  title: "Modules (import and export)",
  topicId: "javascript",
  summary:
    "The way JavaScript splits code into separate files that share functions and values with `export` and `import`.",
  basics: [
    "A real app has thousands of lines of code. Keeping them all in one file would make it hard to find anything, and two people could not easily work on it at the same time.",
    "A variable or function declared in a file is normally private to that file. Other files cannot see it unless the file deliberately shares it.",
    "A package is a bundle of code someone else wrote and published, such as React or Express. npm (Node Package Manager) is the tool and online registry you use to download packages into your project's `node_modules` folder.",
  ],
  what: [
    "A module is simply one JavaScript file. `export` marks what the file shares with others, and `import` brings something another module shared into the current file.",
    'There are two kinds of export. Named exports (`export function getNotes() {}`) can appear many times per file and are imported with braces using the exact name: `import { getNotes } from "./notesApi.js"`. A default export (`export default function NoteForm() {}`) is the one main thing of a file, imported without braces under any name you choose: `import NoteForm from "./NoteForm.jsx"`.',
  ],
  why: [
    "Splitting code into files by job (one component per file, all API calls in one service file) makes each file small enough to understand and lets you reuse a function everywhere by importing it instead of copying it.",
    "Because only exported things are visible, a module can keep helper variables private. Other files cannot change them by accident, and the list of exports tells you exactly what a file offers.",
  ],
  howItWorks: [
    'The text after `from` says where to look. A path starting with `./` or `../` is a file relative to the current one, like `"../services/notesApi.js"`. A bare name like `"express"` or `"react"` means a package installed in `node_modules`.',
    "Before running a file, JavaScript reads its `import` lines, loads each imported file first (and their imports, and so on), and then runs your file with the imported values ready to use.",
    "Each module runs only once, however many files import it. Every importer receives the same exported values.",
    'Node.js also has an older system called CommonJS, which uses `const express = require("express")` and `module.exports`; you will see it in older code, but new code uses ES modules (`import` and `export`).',
  ],
  basicExample: {
    language: "js",
    code: `// math.js
export function add(a, b) {
  return a + b;
}
export const PI = 3.14;
export default function square(x) {
  return x * x;
}

// app.js
import square, { add, PI } from "./math.js";

console.log(add(2, 3)); // 5
console.log(square(4)); // 16
console.log(PI); // 3.14`,
    caption:
      "Named exports are imported in braces with their exact names; the default export is imported without braces.",
  },
  internals: [
    "Imports are resolved before any code runs. That is why `import` lines must be at the top level of a file, not inside an `if` or a function, and why a typo in an imported name is reported as an error before your code starts.",
    "An import is a live, read-only link to the exported value, not a copy. You cannot assign to an imported variable; only the module that owns it can change it.",
    'In the browser, Vite reads all your imports and bundles the files together so the browser downloads them efficiently. In Node.js, files ending in `.mjs`, or any `.js` file in a project whose `package.json` contains `"type": "module"`, are treated as ES modules.',
  ],
  howToCreate: [
    {
      text: "In an empty folder, create `greetings.mjs` with one named export and one default export. The `.mjs` ending tells Node.js to use ES modules.",
      code: {
        language: "js",
        fileName: "greetings.mjs",
        code: `export function sayHello(name) {
  return "Hello, " + name + "!";
}

export default function sayBye(name) {
  return "Bye, " + name + "!";
}`,
      },
    },
    {
      text: "Create `main.mjs` next to it and import both.",
      code: {
        language: "js",
        fileName: "main.mjs",
        code: `import sayBye, { sayHello } from "./greetings.mjs";

console.log(sayHello("Ada"));
console.log(sayBye("Ada"));`,
      },
    },
    {
      text: "Run it from a terminal in that folder.",
      code: {
        language: "bash",
        code: `node main.mjs`,
      },
    },
    {
      text: "Check that it worked: the terminal prints `Hello, Ada!` and `Bye, Ada!`. Now change the import to `{ sayHi }` and run it again; Node.js stops with an error saying the module does not provide an export named `sayHi`, which shows imports are checked before the code runs.",
    },
  ],
  whereUsed: [
    "Every file of a modern frontend or backend: components, pages, hooks, services, routes and controllers all export what they offer and import what they need.",
    'Using packages from npm, such as `import { useState } from "react"` in the frontend and `import express from "express"` in the backend.',
  ],
  connectsTo: [
    "Functions and variables, which are the things you export and import.",
    "npm and `package.json`, which install and list the packages you import by name.",
    "Build tools like Vite, which follow your imports to bundle the frontend.",
    "TypeScript, which uses the same `import` and `export` syntax and also shares types between files.",
  ],
  projectUsage: [
    {
      explanation:
        '`frontend/src/services/notesApi.js` has named exports `getNotes`, `createNote`, `updateNote` and `deleteNote`; `NoteForm.jsx` imports only what it needs with `import { createNote } from "../services/notesApi.js"`.',
      fileId: "frontend/src/components/NoteForm.jsx",
      match: 'import { createNote } from "../services/notesApi.js";',
    },
    {
      explanation:
        'Each component file has one default export, such as `export default function NoteForm`, and pages import it without braces: `import NoteForm from "../components/NoteForm.jsx"`.',
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "export default function NoteForm({ onSaved }) {",
    },
    {
      explanation:
        'On the backend, `backend/src/server.js` starts with `import express from "express"`, a default import of a package from npm, and imports its routes from local files.',
      fileId: "backend/src/app.js",
      match: 'import express from "express";',
    },
  ],
  commonMistakes: [
    'Mixing up named and default imports: `import createNote from "./notesApi.js"` looks for a default export that does not exist. Use braces for named exports: `import { createNote } from "./notesApi.js"`.',
    'Leaving out `./` for your own files: `import { add } from "math.js"` makes JavaScript look for a package called `math.js`. Local files always start with `./` or `../`.',
    'Leaving off the file extension in Node.js. Vite lets you omit it, but Node.js ES modules need the full name, like `"./math.js"`.',
    'Using `import` in a Node.js file that is treated as CommonJS, which fails with `Cannot use import statement outside a module`. Name the file `.mjs` or add `"type": "module"` to `package.json`.',
  ],
  relatedConcepts: ["js-function", "js-variable", "typescript-why"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
