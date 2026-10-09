import type { Concept } from "@fsl/shared";

export const unitTest: Concept = {
  id: "unit-test",
  slug: "unit-test",
  title: "Unit tests",
  topicId: "testing",
  summary:
    "A unit test checks one small piece of code, usually a single function, on its own and in milliseconds.",
  basics: [
    "A function takes inputs and produces an output. If the same input always gives the same output and the function does not touch the network, a database or the screen, it is called a pure function, and it is the easiest kind of code to check.",
    "A test runner is a program that finds your test files, runs them and reports the results. This concept uses Vitest, a popular test runner for JavaScript that works well with Vite projects and plain Node.js.",
    "An assertion is a statement about a value that must be true, written with `expect`: `expect(result).toBe(5)` means the test should fail unless `result` is `5`.",
  ],
  what: [
    "A unit test calls one unit of code, such as `validateNote`, with an input you choose and asserts that the output is exactly what you expect. Nothing else from the app runs: no server, no database, no browser.",
    "In Vitest, `it` (or its alias `test`) defines one test with a name and a function, `describe` groups related tests under a heading, and `expect(value)` followed by a matcher like `.toBe(...)` or `.toEqual(...)` makes the assertion.",
  ],
  why: [
    "Unit tests are the fastest feedback you can get: hundreds run in about a second, so you can run them after every small change. When one fails, it points straight at the function that is wrong.",
    'Rules such as "a title is required" have many edge cases: empty, only spaces, too long. Trying each case by hand in the browser is slow; in a unit test each case is one line.',
  ],
  howItWorks: [
    'Each test follows arrange, act, assert: arrange the input (`const note = { title: "" }`), act by calling the function (`const errors = validateNote(note)`), then assert on the result (`expect(errors).toEqual(["Title is required"])`).',
    "`npx vitest run` finds every file ending in `.test.js` or `.spec.js` (and the TypeScript versions), runs all the tests once and prints a summary. Plain `npx vitest` does the same and then keeps watching your files, re-running the tests whenever you save.",
    "A good habit is red then green: write the test before or right after the code and watch it fail first (red). Then make the code pass (green). Seeing the failure proves the test actually checks something.",
  ],
  basicExample: {
    language: "js",
    fileName: "noteValidation.test.js",
    code: `import { describe, it, expect } from "vitest";
import { validateNote } from "./noteValidation.js";

describe("validateNote", () => {
  it("requires a title", () => {
    const note = { title: "" };           // arrange
    const errors = validateNote(note);    // act
    expect(errors).toEqual(["Title is required"]); // assert
  });

  it("accepts a note with a title", () => {
    expect(validateNote({ title: "Shopping" })).toEqual([]);
  });
});`,
    caption:
      "Two unit tests for validateNote grouped with describe, each following arrange, act, assert.",
    highlightLines: [5, 6, 7, 8],
  },
  internals: [
    "Vitest uses Vite to load your test files, so modern `import` syntax, TypeScript and JSX work without extra setup. By default it runs different test files in parallel in separate worker processes, which is why tests must not depend on each other.",
    "`expect(a).toBe(b)` uses `Object.is`, the strictest equality: two separate arrays are never the same, so `expect([]).toBe([])` fails. `toEqual` instead compares the contents recursively, which is what you want for arrays and objects.",
    "When a matcher fails, it throws an error that contains the expected and received values. Vitest catches it, marks the test as failed, prints a diff and carries on with the next test, so one failure does not hide the others.",
  ],
  howToCreate: [
    {
      text: "In a new folder, create a project and install Vitest as a development dependency.",
      code: {
        language: "bash",
        code: `npm init -y
npm pkg set type=module
npm install -D vitest`,
      },
    },
    {
      text: "Create the function to test. It returns a list of error messages, which is empty when the note is valid.",
      code: {
        language: "js",
        fileName: "noteValidation.js",
        code: `export function validateNote(note) {
  const errors = [];
  if (!note.title || note.title.trim() === "") {
    errors.push("Title is required");
  }
  return errors;
}`,
      },
    },
    {
      text: "Write tests for the rule that exists, plus one for a new rule you have not written yet: titles may have at most 100 characters.",
      code: {
        language: "js",
        fileName: "noteValidation.test.js",
        code: `import { describe, it, expect } from "vitest";
import { validateNote } from "./noteValidation.js";

describe("validateNote", () => {
  it("requires a title", () => {
    expect(validateNote({ title: "  " })).toEqual(["Title is required"]);
  });

  it("accepts a note with a title", () => {
    expect(validateNote({ title: "Shopping" })).toEqual([]);
  });

  it("rejects a title longer than 100 characters", () => {
    const note = { title: "a".repeat(101) };
    expect(validateNote(note)).toEqual(["Title must be at most 100 characters"]);
  });
});`,
      },
    },
    {
      text: "Run the tests. Two pass and the new one fails (red): Vitest shows that it expected the message but received an empty array. That is correct, because the rule does not exist yet.",
      code: {
        language: "bash",
        code: `npx vitest run`,
      },
    },
    {
      text: "Add the rule to `validateNote` just before `return errors;`, then run `npx vitest run` again. All three tests pass (green), and the summary shows `3 passed`.",
      code: {
        language: "js",
        fileName: "noteValidation.js",
        code: `  if (note.title && note.title.length > 100) {
    errors.push("Title must be at most 100 characters");
  }`,
      },
    },
  ],
  whereUsed: [
    "Validation rules, calculations, formatting helpers and any other logic that turns an input into an output.",
    "Small React components, using React Testing Library on top of Vitest to render a component and check what it shows.",
    "Reproducing a bug: a failing unit test for the exact input that caused it, kept forever once the bug is fixed.",
  ],
  connectsTo: [
    "npm packages: Vitest is installed with `npm install -D`, as a development dependency.",
    "The functions of your app, which are easier to test when logic is kept in small, pure functions.",
    "Integration tests, which check the same rules again from the outside, through a real HTTP request.",
    "CI/CD, which runs the unit tests automatically on every pull request.",
  ],
  projectUsage: [
    {
      explanation:
        "`backend/src/validation/noteValidation.test.js` unit-tests `validateNote`, for example that a note with an empty title produces the error `Title is required`.",
    },
    {
      explanation:
        "On the frontend, a React Testing Library test renders `NoteForm` with Vitest and checks the form's behaviour without starting the backend.",
    },
  ],
  commonMistakes: [
    "Using `toBe` to compare arrays or objects, which fails even when the contents match. Use `toEqual` for them and `toBe` for strings, numbers and booleans.",
    "Testing several things in one test. When it fails you cannot tell which part broke; give each behaviour its own `it` with a clear name.",
    "Never watching the test fail. A test with a wrong import or a missing `expect` can pass forever while checking nothing; see it go red once before trusting it.",
    "Making tests depend on each other, for example one test creating data that the next one reads. Tests can run in any order or in parallel; each test should arrange everything it needs.",
  ],
  relatedConcepts: ["why-test", "integration-test", "npm-packages"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
