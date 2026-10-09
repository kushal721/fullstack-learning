import type { Concept } from "@fsl/shared";

export const e2eTest: Concept = {
  id: "e2e-test",
  slug: "e2e-test",
  title: "End-to-end tests",
  topicId: "testing",
  summary:
    "An end-to-end test drives the whole app in a real browser, clicking and typing like a user, to check that a complete journey works.",
  basics: [
    "A full-stack app has many parts that must all work at once: the HTML and React code in the browser, the requests to the backend, the backend's routes and the database. End-to-end means the test goes from one end (what the user sees) to the other (the data stored in the database) and back.",
    "Unit and integration tests check parts of the app from code. Only a real browser shows whether a user can actually do something: whether the button is there, whether the form sends the request and whether the new note appears on the screen.",
    "Playwright is a tool that controls real browsers (Chromium, Firefox and WebKit, the engine behind Safari) from a script. It can open pages, fill in inputs, click buttons and read what is on the screen.",
  ],
  what: [
    "An end-to-end (E2E) test is a script of user actions plus checks: go to the register page, fill in the email and password, click Register, log in, create a note, then expect the note's title to be visible.",
    "It uses the app exactly as a user would, through the running frontend and backend, so if it passes you know the main journey works for real.",
  ],
  why: [
    "Some bugs only appear when everything runs together: a wrong API URL in the frontend, a cookie the browser refuses to send, a button covered by another element. Every unit and integration test can pass while users still cannot create a note.",
    "One E2E test of the main journey replaces the manual click-through you would otherwise do before every release, and it never forgets a step.",
  ],
  howItWorks: [
    "`npx playwright test` starts a browser, opens a fresh, empty profile for each test (no leftover cookies or storage) and runs your script step by step against the app at an address such as `http://localhost:5173`.",
    'You find elements the way a user would: `page.getByLabel("Email")` finds the input whose label says Email, and `page.getByRole("button", { name: "Save" })` finds the button named Save. Actions like `.fill(...)` and `.click()` then type and click.',
    'Checks are written with `expect`, for example `await expect(page.getByText("Shopping")).toBeVisible()`. Playwright keeps re-checking until the text appears or a timeout passes, because the note only shows up after the request to the backend has finished.',
    "E2E tests are slow (seconds each) and occasionally flaky, meaning they sometimes fail without a real bug, for example when the machine is busy and a page loads late. So keep just a few for the most important journeys, and run them before a release and in CI.",
  ],
  basicExample: {
    language: "js",
    fileName: "tests/notes.spec.js",
    code: `import { test, expect } from "@playwright/test";

test("a user can create a note", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.getByLabel("Email").fill("ana@example.com");
  await page.getByLabel("Password").fill("secret123");
  await page.getByRole("button", { name: "Log in" }).click();

  await page.getByLabel("Title").fill("Shopping");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Shopping")).toBeVisible();
});`,
    caption:
      "Playwright logs in through the real form, creates a note and waits until its title is visible on the page.",
    highlightLines: [5, 7, 12],
  },
  internals: [
    "Playwright downloads its own builds of the browsers and controls them through a debugging protocol, the same channel that browser developer tools use. Your test sends commands like click and the browser reports back what happened.",
    "Before every action, Playwright waits automatically until the element exists, is visible, is not covered and is enabled. This auto-waiting removes most flakiness; adding fixed pauses like `page.waitForTimeout(2000)` makes tests slower and still flaky.",
    "Web-first assertions such as `toBeVisible()` retry for up to 5 seconds by default. When a test fails, the HTML report (`npx playwright show-report`) shows which step failed and the error, and can include screenshots and a trace of every step.",
    "`getByLabel` only finds an input that is properly connected to a `label`, and `getByRole` uses the same accessibility information as screen readers. So E2E tests written this way also push you to build accessible forms.",
  ],
  howToCreate: [
    {
      text: "In the folder of your frontend, run the Playwright setup. Choose JavaScript, keep `tests` as the folder, and say yes to installing the browsers. It can also add a GitHub Actions workflow that runs the tests in CI.",
      code: {
        language: "bash",
        code: `npm init playwright@latest`,
      },
    },
    {
      text: "Run the example tests it created (they visit the Playwright website, so you need internet), then open the report.",
      code: {
        language: "bash",
        code: `npx playwright test
npx playwright show-report`,
      },
    },
    {
      text: "Write a test for the Notes App journey. A new email on every run matters: the database keeps the user from the previous run, so registering the same email twice would fail. Change the labels and button names if yours differ.",
      code: {
        language: "js",
        fileName: "tests/notes.spec.js",
        code: `import { test, expect } from "@playwright/test";

test("register, log in and create a note", async ({ page }) => {
  const email = "user" + Date.now() + "@example.com";

  await page.goto("http://localhost:5173/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("secret123");
  await page.getByRole("button", { name: "Register" }).click();

  await page.goto("http://localhost:5173/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("secret123");
  await page.getByRole("button", { name: "Log in" }).click();

  await page.getByLabel("Title").fill("Shopping");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Shopping")).toBeVisible();
});`,
      },
    },
    {
      text: "Start the backend and the frontend in two other terminals, then run only this test in Chromium with the browser window visible, so you can watch it type and click.",
      code: {
        language: "bash",
        code: `npx playwright test tests/notes.spec.js --project=chromium --headed`,
      },
    },
    {
      text: 'The run should end with `1 passed`. To see a failure, change the expected text to `"Groceries"` and run it again: after about 5 seconds the test fails, and `npx playwright show-report` shows the step that broke.',
    },
  ],
  whereUsed: [
    "The few journeys that must never break: signing up, logging in, checking out in a shop, creating the app's main item.",
    "Before a release and in CI, as the final check that the frontend, backend and database work together.",
    "Checking the app in several browsers at once, since Playwright can run the same test in Chromium, Firefox and WebKit.",
  ],
  connectsTo: [
    "The forms, labels and buttons of the frontend, which the test finds and uses like a user.",
    "The backend API and the database, which must be running for the journey to work.",
    "Integration and unit tests below it in the testing pyramid, which cover the details faster.",
    "CI/CD, which runs the E2E tests automatically before code is merged or released.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App has one Playwright test, run with `npx playwright test`, that opens the real app in a browser, registers a new user, logs in, creates a note and checks that it appears in the list.",
    },
    {
      explanation:
        "All the detailed rules (validation messages, `401` and `404` responses) are left to the faster unit and integration tests, so the E2E test only covers the main journey, following the testing pyramid.",
    },
  ],
  commonMistakes: [
    "Writing an E2E test for every small rule. The suite takes many minutes and fails randomly; check rules with unit and integration tests and keep E2E for the main journeys.",
    "Adding fixed waits such as `page.waitForTimeout(3000)`. They slow every run and still fail on a slow machine; rely on Playwright's auto-waiting and `expect(...).toBeVisible()` instead.",
    "Finding elements by CSS classes like `.btn-primary`, which change when the design changes. Use `getByRole`, `getByLabel` and `getByText`, which match what the user sees.",
    "Reusing the same test data on every run, so the second run fails because the user already exists. Create unique data, for example an email that includes `Date.now()`.",
  ],
  relatedConcepts: [
    "why-test",
    "integration-test",
    "ci-cd",
    "deploying-a-full-stack-app",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
