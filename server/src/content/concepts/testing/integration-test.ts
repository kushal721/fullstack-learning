import type { Concept } from "@fsl/shared";

export const integrationTest: Concept = {
  id: "integration-test",
  slug: "integration-test",
  title: "Integration tests",
  topicId: "testing",
  summary:
    "An integration test checks that several parts of an app work correctly together, such as an Express route, its middleware and the database.",
  basics: [
    "A backend is made of layers: a route matches the URL (like `POST /api/notes`), middleware runs before it (for example to check that the user is logged in), a controller does the work and the database stores the data.",
    "Each layer can be correct on its own and still fail when combined: the middleware sets `req.user` but the controller reads `req.userId`, or the SQL query uses a column name that does not exist. Unit tests cannot see these mistakes, because they test one piece at a time.",
    "Supertest is a small library that sends real HTTP requests to an Express app from inside a test, without you starting the server by hand.",
  ],
  what: [
    "An integration test sends a request through the real stack — route, middleware, controller and database — and checks the response: its status code, its JSON body and sometimes what ended up in the database.",
    "It tests the app from the outside, the same way the frontend uses it, so it proves that the parts are wired together correctly.",
  ],
  why: [
    "Most real bugs live between the parts: a route registered without its auth middleware, a missing `express.json()`, a query that returns another user's notes. Integration tests catch exactly these.",
    "They also make it cheap to test the unhappy paths. Checking by hand that every route answers `401` without a login and `404` for someone else's note is tedious; in a test each case is a few lines, and security rules like these must never quietly break.",
  ],
  howItWorks: [
    "The Express app is exported from its own module (for example `app.js`) without calling `app.listen`, so tests can import it. A separate `server.js` imports the same app and starts listening for real use.",
    'In the test, `request(app).post("/api/notes").send({ ... })` makes Supertest send a real HTTP request to the app, and the response comes back with `status` and `body` to assert on.',
    "The tests use a separate test database, never the development or production one, because tests create and delete data freely. Before each test, a `beforeEach` hook resets the data so every test starts from the same known state and does not depend on what earlier tests did.",
    "Each important route gets a test for success and for its error cases: `201` with a valid login, `400` for invalid data, `401` without a login and `404` for a note that does not exist or belongs to another user.",
  ],
  basicExample: {
    language: "js",
    fileName: "notes.test.js",
    code: `import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "./app.js";

describe("POST /api/notes", () => {
  it("rejects a request without a login", async () => {
    const res = await request(app)
      .post("/api/notes")
      .send({ title: "Shopping" });

    expect(res.status).toBe(401);
  });
});`,
    caption:
      "Supertest sends a real POST request through the route and its auth middleware; the test passes only if the app refuses it with 401.",
    highlightLines: [7, 8, 9, 11],
  },
  internals: [
    "Supertest calls `app.listen(0)` for you when the app is not already listening. Port `0` asks the operating system for any free port, so tests never clash with a server you have running on port 3000. The request then travels over a real local network connection, exactly like one from a browser.",
    "The test database is usually chosen with an environment variable: tests run with `DATABASE_URL` pointing at a database such as `notes_test`. Resetting it between tests is often a single SQL statement like `TRUNCATE notes, users RESTART IDENTITY CASCADE`, which empties the tables and restarts the id counters.",
    "Integration tests are slower than unit tests — tens of milliseconds each instead of fractions of one — because every test makes a network request and real database queries. That is fine: you need far fewer of them, and they check things no unit test can.",
    "Because test files run in parallel by default in Vitest, two files resetting the same database at the same moment can wipe each other's data. Running database test files one after another (`npx vitest run --no-file-parallelism`, or `fileParallelism: false` in the config) avoids it.",
  ],
  howToCreate: [
    {
      text: "In a new folder, install Express, plus Vitest and Supertest as development dependencies.",
      code: {
        language: "bash",
        code: `npm init -y
npm pkg set type=module
npm install express
npm install -D vitest supertest`,
      },
    },
    {
      text: "Create `app.js`. To keep it short, an array stands in for the database and a fixed token stands in for the login cookie; the shape of the test is the same with a real database.",
      code: {
        language: "js",
        fileName: "app.js",
        code: `import express from "express";

export const notes = []; // stand-in for the notes table

function requireUser(req, res, next) {
  if (req.headers.authorization !== "Bearer test-token") {
    return res.status(401).json({ error: "Not logged in" });
  }
  req.userId = 1;
  next();
}

export const app = express();
app.use(express.json());

app.post("/api/notes", requireUser, (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const note = { id: notes.length + 1, userId: req.userId, title: req.body.title };
  notes.push(note);
  res.status(201).json(note);
});

app.get("/api/notes/:id", requireUser, (req, res) => {
  const note = notes.find(
    (n) => n.id === Number(req.params.id) && n.userId === req.userId,
  );
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});`,
      },
    },
    {
      text: "Create the tests. `beforeEach` empties the data so every test starts clean, and the error cases get as much attention as the success case.",
      code: {
        language: "js",
        fileName: "app.test.js",
        code: `import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import { app, notes } from "./app.js";

const auth = { Authorization: "Bearer test-token" };

beforeEach(() => {
  notes.length = 0; // reset the "database"
});

describe("notes API", () => {
  it("returns 401 without a login", async () => {
    const res = await request(app).post("/api/notes").send({ title: "A" });
    expect(res.status).toBe(401);
  });

  it("creates a note with a login", async () => {
    const res = await request(app).post("/api/notes").set(auth).send({ title: "A" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, userId: 1, title: "A" });
  });

  it("returns 404 for a note that does not exist", async () => {
    const res = await request(app).get("/api/notes/99").set(auth);
    expect(res.status).toBe(404);
  });
});`,
      },
    },
    {
      text: "Run the tests; the summary should show `3 passed`.",
      code: {
        language: "bash",
        code: `npx vitest run`,
      },
    },
    {
      text: "Check that the tests really protect you: remove `requireUser,` from the `app.post` line and run them again. The `401` test fails, because anyone could now create notes. Put it back and everything is green again.",
    },
  ],
  whereUsed: [
    "Every API route of a backend: the success case plus validation errors, missing login and missing or forbidden items.",
    "Code that talks to a database, to check that the SQL queries really store and return the right rows.",
    "Before a release, as proof that the API still keeps the promises the frontend depends on.",
  ],
  connectsTo: [
    "Express routes and middleware, which are exercised together through real requests.",
    "The database, through a separate test database that is reset between tests.",
    "Environment variables such as `DATABASE_URL`, which point the tests at the test database.",
    "Unit tests below them and end-to-end tests above them in the testing pyramid.",
  ],
  projectUsage: [
    {
      explanation:
        "`backend/src/routes/notes.test.js` uses Supertest against the Notes App's Express app: `POST /api/notes` without a login cookie gets `401`, with one it gets `201`, and asking for another user's note gets `404`.",
      fileId: "backend/src/routes/notes.test.js",
      match: 'const res = await request(app).get("/api/notes");',
    },
    {
      explanation:
        "These tests run against a separate test database: `DATABASE_URL` points at a `notes_test` database, so running the tests can never touch your real notes.",
      fileId: "backend/src/routes/notes.test.js",
      match: '"postgres://postgres:dev@localhost:5432/notes_test";',
    },
  ],
  commonMistakes: [
    "Running tests against the development or production database. Tests delete and create data freely; always point `DATABASE_URL` at a separate test database.",
    "Not resetting data between tests, so a test passes or fails depending on which tests ran before it. Reset in `beforeEach` so every test starts from the same state.",
    "Only testing the happy path. The error cases (`400`, `401`, `404`) are where security bugs hide; give each one its own test.",
    "Calling `app.listen` in the same file that exports the app, so importing it in a test starts a real server and the test run never exits. Export the app from `app.js` and listen in a separate `server.js`.",
  ],
  relatedConcepts: [
    "unit-test",
    "e2e-test",
    "express",
    "database",
    "environment-variables",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
