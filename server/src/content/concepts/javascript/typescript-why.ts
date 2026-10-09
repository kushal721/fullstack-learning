import type { Concept } from "@fsl/shared";

export const typescriptWhy: Concept = {
  id: "typescript-why",
  slug: "typescript-why",
  title: "Why TypeScript?",
  topicId: "javascript",
  summary:
    "TypeScript is JavaScript with types added, so many mistakes are found while you write code instead of when it runs.",
  basics: [
    'Every value in JavaScript has a type: a string like `"hello"`, a number like `42`, a boolean (`true` or `false`), an object, an array, and so on. The type decides what you can do with the value — you can call `.toUpperCase()` on a string, but not on a number.',
    "JavaScript only checks types while the program runs. If you call `.toUpperCase()` on a number, nothing warns you while typing; the program fails later with a `TypeError`, possibly in front of a user.",
    "A compiler is a program that reads your code and turns it into another form. A type checker is a tool that reads your code without running it and points out places where types do not fit together.",
  ],
  what: [
    "TypeScript is a language built on top of JavaScript. Almost any JavaScript code is also valid TypeScript; TypeScript adds a way to write down types, like `let count: number = 0`.",
    "The TypeScript compiler, `tsc`, checks those types before the code runs and then removes them, producing ordinary JavaScript that browsers and Node.js can run.",
  ],
  why: [
    "Mistakes show up in your editor as red underlines the moment you type them: a misspelled property name, a missing argument, passing a string where a number is expected. Fixing them there is much cheaper than finding them in a bug report.",
    "Types also act as documentation that cannot go out of date. Hovering over a function in the editor tells you exactly what it expects and returns, and autocomplete can suggest the right property names.",
  ],
  howItWorks: [
    "You write files ending in `.ts` (or `.tsx` for React components) and add types where they help, for example on function parameters.",
    "When you save, your editor runs the TypeScript checker in the background and underlines anything that does not fit. Running `npx tsc` does the same check from the terminal.",
    "If the check passes, `tsc` (or a build tool such as Vite) strips out the types and writes plain `.js` files. Those are what actually run.",
  ],
  basicExample: {
    language: "ts",
    code: `function shout(text: string) {
  return text.toUpperCase();
}

shout("hello"); // fine
shout(42); // error: Argument of type 'number' is not assignable to parameter of type 'string'.`,
    caption:
      "TypeScript reports the second call as an error before the program ever runs.",
  },
  internals: [
    "Types disappear at runtime. After compiling, `function shout(text: string)` becomes just `function shout(text)`, so TypeScript cannot check data that only arrives while the program runs, such as JSON from a server.",
    "TypeScript also infers types: in `let count = 0` it works out that `count` is a number without being told, so you only write types where the compiler cannot guess them, mostly on function parameters.",
    'Settings live in a `tsconfig.json` file. Options such as `"strict": true` make the checker stricter, for example forcing you to handle values that might be `null`.',
  ],
  howToCreate: [
    {
      text: "In an empty folder, create a `package.json` and install TypeScript as a development tool (`-D` means it is only needed while developing, not when the code runs).",
      code: {
        language: "bash",
        code: `npm init -y
npm install -D typescript`,
      },
    },
    {
      text: "Create a `tsconfig.json` file with TypeScript's default settings.",
      code: {
        language: "bash",
        code: `npx tsc --init`,
      },
    },
    {
      text: "Create a file called `hello.ts` that contains one deliberate mistake.",
      code: {
        language: "ts",
        fileName: "hello.ts",
        code: `function shout(text: string) {
  return text.toUpperCase();
}

console.log(shout("hello"));
console.log(shout(42));`,
      },
    },
    {
      text: "Run the type checker. It reports an error on the `shout(42)` line, before anything has run.",
      code: {
        language: "bash",
        code: `npx tsc`,
      },
    },
    {
      text: 'Change `shout(42)` to `shout("world")` and run `npx tsc` again. No errors are printed and `tsc` writes the plain JavaScript version to `hello.js`; run it with `node hello.js` and you should see `HELLO` and `WORLD`.',
    },
  ],
  whereUsed: [
    "Large or long-lived codebases, where many people change code they did not write and types catch the side effects.",
    "Both sides of a web app: React frontends (`.tsx` files) and Node.js backends.",
    "Libraries, which ship type information so your editor can autocomplete and check how you use them.",
  ],
  connectsTo: [
    "JavaScript, which is what TypeScript turns into and what actually runs.",
    "TypeScript types such as `string`, object shapes and unions, which are how you describe your data.",
    "Build tools like Vite and the `tsc` compiler, which remove the types before running.",
    "JSON from an API, which TypeScript cannot check at runtime because the types are gone by then.",
  ],
  projectUsage: [
    {
      explanation:
        "This learning platform is written in TypeScript: the `client/`, `server/` and `shared/` folders all contain `.ts` and `.tsx` files, and the build fails if any types do not fit.",
    },
    {
      explanation:
        "The Notes App you build stays in plain JavaScript (`frontend/src/` and `backend/src/` use `.js` and `.jsx`). Learning React, Express and SQL at the same time is already a lot, so types are left out to keep the number of new ideas small.",
    },
    {
      explanation:
        "Once the Notes App works, renaming its files to `.ts` and `.tsx` and adding types step by step is a natural next exercise, and the platform's own code shows what the result looks like.",
    },
  ],
  commonMistakes: [
    "Thinking types protect you at runtime. They are removed before running, so data from a server or a form still needs real checks in your code.",
    "Silencing errors with the `any` type, which turns off checking for that value. Describe the real type instead, or use `unknown` and check it before use.",
    "Ignoring the red underlines because the code still runs. A type error is usually a real bug waiting to happen; read the message and fix the cause.",
    "Trying to add types to every single line. Let TypeScript infer what it can and annotate function parameters and shared data shapes.",
  ],
  relatedConcepts: ["typescript-types", "js-variable", "js-function", "json"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
