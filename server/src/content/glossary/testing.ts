import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "Testing" topic.
export const testingGlossary: GlossaryEntry[] = [
  {
    id: "why-test",
    topicId: "testing",
    term: "Automated tests",
    aliases: ["tests", "testing", "why test", "test"],
    kind: "concept",
    short:
      "Small programs that check your app still works, so you can change code without breaking things you can't see.",
    body: "A test runs part of the app with a known input and compares the result with what you expect. There are three sizes: [[unit-test|unit tests]] for one function, [[integration-test|integration tests]] for parts working together, and [[e2e-test|end-to-end tests]] for the whole app in a browser.",
    conceptPageId: "why-test",
  },
  {
    id: "unit-test",
    topicId: "testing",
    term: "Unit test",
    aliases: ["unit tests", "vitest", "expect", "assertion"],
    kind: "concept",
    short:
      "A test that checks one small piece of code, usually a single function, on its own and in milliseconds.",
    body: "It calls a function like `validateNote` and asserts the result: `expect(result).toBe(…)`. Nothing else runs, no server, no database, so it is fast and points straight at the broken piece. Vitest's `describe` and `it` organise them.",
    conceptPageId: "unit-test",
  },
  {
    id: "integration-test",
    topicId: "testing",
    term: "Integration test",
    aliases: ["integration tests", "api test", "supertest"],
    kind: "concept",
    short:
      "A test that checks several parts work together, such as a route, its middleware and the database.",
    body: "It sends a real request through the stack and checks the status code, the [[json]] body and sometimes the [[database]]. It proves the parts are wired together correctly, which [[unit-test|unit tests]] can't.",
    conceptPageId: "integration-test",
  },
  {
    id: "e2e-test",
    topicId: "testing",
    term: "End-to-end test",
    aliases: ["e2e", "e2e test", "playwright", "browser test"],
    kind: "concept",
    short:
      "A test that drives the whole app in a real browser, clicking and typing like a user.",
    body: "Register, log in, create a note, then expect its title on screen. It uses the running frontend and backend, so a pass means the journey works for real. Slower than other tests, so keep a few for the main journeys and run them in [[ci-cd|CI]].",
    conceptPageId: "e2e-test",
  },
];
