import type { Concept } from "@fsl/shared";

export const whyTest: Concept = {
  id: "why-test",
  slug: "why-test",
  title: "Why test?",
  topicId: "testing",
  summary:
    "Automated tests are small programs that check your app still works, so you can change code without breaking things you cannot see.",
  basics: [
    "A bug is code that does something different from what you meant. Bugs are normal: every developer writes them. What matters is finding them before your users do.",
    "The simplest way to check an app is to use it yourself: open the browser, click through the pages and see if everything works. This is called manual testing.",
    "Manual testing gets slower with every feature. The Notes App needs registering, logging in, creating, editing and deleting notes, plus the error cases — clicking all of that after every change takes many minutes, so people skip it, and that is when old features break without anyone noticing. A broken old feature is called a regression.",
    "An automated test is code that uses your code and checks the result. The computer can run hundreds of them in a few seconds, exactly the same way every time.",
  ],
  what: [
    'A test is an executable check: it runs a piece of your app with a known input and compares what happens with what you expected, for example "a note with an empty title is rejected with `Title is required`". If the result differs, the test fails and tells you which check broke.',
    "Tests come in three main sizes: unit tests check one function on its own, integration tests check several parts working together (a route, its middleware and the database), and end-to-end tests drive the whole app in a real browser the way a user would.",
  ],
  why: [
    "Confidence to change code. When you rename a function, fix a bug or add a feature, the tests tell you in seconds whether anything else broke. Without them, every change is a gamble, so code becomes scary to touch and slowly gets worse.",
    "Tests also act as precise documentation: a test called `rejects a note without a title` states a rule of the app in a form that can never go out of date, because it fails the moment the code stops following it.",
  ],
  howItWorks: [
    "You write tests in separate files next to your code, for example `noteValidation.test.js` next to `noteValidation.js`. A test runner such as Vitest finds these files, runs every test and prints which passed and which failed.",
    "Each test sets something up, runs the code and checks the result with an assertion, a statement like `expect(result).toBe(true)` that fails loudly when it is not true.",
    "The testing pyramid describes a healthy mix: many unit tests at the bottom (they run in milliseconds and point at the exact broken function), fewer integration tests in the middle (slower, but they prove the parts fit together), and a few end-to-end tests at the top (slowest and most fragile, but the only ones that see the app exactly as a user does).",
    "Not everything is worth testing. Test the rules (a note needs a title), the API behaviour (a request without a login gets `401`) and the main user journey (register, log in, create a note). Do not test styling such as colours or margins: it changes often, a test cannot tell whether it looks good, and a quick look in the browser checks it better.",
  ],
  basicExample: {
    language: "js",
    fileName: "noteValidation.test.js",
    code: `import { it, expect } from "vitest";
import { validateNote } from "./noteValidation.js";

it("rejects a note without a title", () => {
  const errors = validateNote({ title: "" });
  expect(errors).toEqual(["Title is required"]);
});`,
    caption:
      "One automated check: it runs validateNote with an empty title and fails if the error message is anything other than the expected one.",
  },
  internals: [
    "A test runner is just a program. It imports each test file, calls every test function inside a `try`, and counts it as passed if nothing was thrown. When an assertion such as `expect(...).toEqual(...)` does not match, it throws an error; the runner catches it and reports the test as failed together with the expected and actual values.",
    "When all tests pass, the runner exits with code `0`; if any test fails, it exits with a non-zero code. Other tools read that exit code: a CI pipeline stops a pull request from being merged when the tests fail.",
    "Unit tests are fast because they only run JavaScript in memory. Integration tests talk to a real database over the network, and end-to-end tests start a whole browser and wait for pages to load, which is why they take seconds instead of milliseconds — and why the pyramid has fewer of them.",
  ],
  howToCreate: [
    {
      text: "In a new folder, create a project that uses ES modules and install Vitest as a development dependency (`-D`), because only developers need it, not the running app.",
      code: {
        language: "bash",
        code: `npm init -y
npm pkg set type=module
npm install -D vitest`,
      },
    },
    {
      text: "Create a small rule to protect: a note can only be saved when its title is not empty.",
      code: {
        language: "js",
        fileName: "canSave.js",
        code: `export function canSave(note) {
  return note.title.trim() !== "";
}`,
      },
    },
    {
      text: "Write down how it should behave as tests, in a file whose name ends in `.test.js` so Vitest finds it.",
      code: {
        language: "js",
        fileName: "canSave.test.js",
        code: `import { it, expect } from "vitest";
import { canSave } from "./canSave.js";

it("allows a note with a title", () => {
  expect(canSave({ title: "Shopping" })).toBe(true);
});

it("refuses a note whose title is only spaces", () => {
  expect(canSave({ title: "   " })).toBe(false);
});`,
      },
    },
    {
      text: "Run the tests. Both should pass in well under a second.",
      code: {
        language: "bash",
        code: `npx vitest run`,
      },
    },
    {
      text: "Now play the part of a future change that goes wrong: remove `.trim()` from `canSave.js` and run `npx vitest run` again. The second test fails and names the exact rule that broke — that is the safety net a manual click-through would only catch if you remembered to try a title made of spaces.",
    },
  ],
  whereUsed: [
    "Every serious project: open-source libraries, company apps and this learning platform all run their tests automatically before code is merged.",
    "Before refactoring (changing how code is written without changing what it does), so you can prove the behaviour stayed the same.",
    "When fixing a bug: first write a test that reproduces it, then fix it, so the same bug can never come back unnoticed.",
  ],
  connectsTo: [
    "Unit tests, which check single functions such as `validateNote`.",
    "Integration tests, which check an Express route together with its middleware and database.",
    "End-to-end tests, which check the main user journey in a real browser.",
    "CI/CD, which runs all the tests automatically on every pull request.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App adds tests in build step 13 at every level of the pyramid: a Vitest unit test for `validateNote`, Supertest integration tests for the notes routes, a React Testing Library test for the `NoteForm` component and one Playwright end-to-end test of the main journey.",
      fileId: "backend/src/validation/noteValidation.test.js",
      match: 'describe("validateNote", () => {',
    },
    {
      explanation:
        "The chosen tests follow the rules above: the validation rules, the API behaviour (`401` without a login, `404` for another user's note) and the register, log in and create a note journey are tested; the CSS is not.",
      fileId: "backend/src/routes/notes.test.js",
      match: 'it("rejects requests without a login cookie", async () => {',
    },
  ],
  commonMistakes: [
    "Thinking tests are only for big teams. Even alone, you forget how old code works; tests remember for you. Start with a few tests for the most important rules.",
    "Trying to test everything, including styling and tiny details. Those tests break with every harmless change and people start ignoring them. Test behaviour that matters to users.",
    "Writing mostly end-to-end tests because they feel the most realistic. The suite becomes slow and flaky; follow the pyramid and check most rules with fast unit tests.",
    "Never seeing a test fail. A test that passes no matter what checks nothing; break the code on purpose once to make sure the test notices.",
  ],
  relatedConcepts: ["unit-test", "integration-test", "e2e-test", "ci-cd"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
